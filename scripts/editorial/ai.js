const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini"
const OLLAMA_URL = (process.env.OLLAMA_URL || "http://localhost:11434").replace(/\/+$/, "")
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3"
const AI_PROVIDER = process.env.AI_PROVIDER || "groq"
const AI_FALLBACK_DISABLED = process.env.AI_FALLBACK_DISABLED === "true"

const GROQ_BASE = "https://api.groq.com/openai/v1"
const OPENAI_BASE = "https://api.openai.com/v1"

let ollamaAvailable = null

async function checkOllama() {
  if (ollamaAvailable !== null) return ollamaAvailable
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3000)
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: controller.signal })
    clearTimeout(timer)
    ollamaAvailable = res.ok
    if (ollamaAvailable) console.log("[ai] Ollama detected at", OLLAMA_URL)
  } catch {
    ollamaAvailable = false
  }
  return ollamaAvailable
}

export async function generate(
  prompt,
  { system, temperature = 0.7, maxTokens = 2048, format } = {},
) {
  const providers = await buildProviderChain()

  for (const provider of providers) {
    try {
      const messages = []
      if (system) messages.push({ role: "system", content: system })
      messages.push({ role: "user", content: prompt })

      const body = {
        model: provider.model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }
      if (format === "json") body.response_format = { type: "json_object" }

      const headers = { "Content-Type": "application/json" }
      if (provider.apiKey) headers.Authorization = `Bearer ${provider.apiKey}`

      const res = await fetch(`${provider.base}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.text().catch(() => "")
        console.warn(`[ai] ${provider.name} error ${res.status}: ${err.slice(0, 300)}`)
        continue
      }

      const data = await res.json()
      const content = data.choices?.[0]?.message?.content
      if (content) return sanitize(content)

      console.warn(`[ai] ${provider.name} returned empty content`)
    } catch (err) {
      console.warn(`[ai] ${provider.name} failed: ${err.message}`)
    }
  }

  throw new Error("All AI providers failed")
}

async function buildProviderChain() {
  const chain = []
  const added = new Set()

  const tryAdd = async (name) => {
    if (added.has(name)) return
    added.add(name)
    const p = await createProvider(name)
    if (p) chain.push(p)
  }

  await tryAdd(AI_PROVIDER)

  if (!AI_FALLBACK_DISABLED) {
    if (AI_PROVIDER !== "groq") await tryAdd("groq")
    if (AI_PROVIDER !== "ollama") await tryAdd("ollama")
  }

  return chain
}

async function createProvider(name) {
  switch (name) {
    case "groq":
      if (!GROQ_API_KEY) {
        console.warn("[ai] GROQ_API_KEY not set, groq unavailable")
        return null
      }
      return { name: "groq", base: GROQ_BASE, model: GROQ_MODEL, apiKey: GROQ_API_KEY }
    case "ollama":
      if (!(await checkOllama())) {
        console.warn("[ai] Ollama not available at", OLLAMA_URL)
        return null
      }
      return { name: "ollama", base: `${OLLAMA_URL}/v1`, model: OLLAMA_MODEL, apiKey: null }
    case "openai":
      if (!OPENAI_API_KEY) {
        console.warn("[ai] OPENAI_API_KEY not set, openai unavailable")
        return null
      }
      return { name: "openai", base: OPENAI_BASE, model: OPENAI_MODEL, apiKey: OPENAI_API_KEY }
    default:
      console.warn(`[ai] Unknown provider: ${name}`)
      return null
  }
}

function sanitize(text) {
  return text
    .replace(/\0/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
    .trim()
}
