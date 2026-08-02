const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || ""
const GEMINI_MODEL = process.env.GEMINI_VISION_MODEL || "gemini-3.1-flash-lite"
const GEMINI_BASE_URL = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta"

const cache = new Map()

const VERIFY_PROMPT = `You are an image-news relevance verifier for a news page.
Given a news headline and an image, decide whether the image is a RELEVANT illustration of that news story.

Rules:
- Reply YES only if the image clearly depicts the subject of the headline (person, place, event, object, scene).
- Reply NO if the image is generic, unrelated, a logo, a placeholder, an abstract pattern, a map without context, or shows something not mentioned in the headline.
- Do not be lenient. A wrong image is worse than no image.

Output ONLY valid JSON: {"relevant": true or false, "reason": "one short sentence"}`

async function downloadImage(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "GlobalLens/1.0 (Image Relevance Verifier)" },
      redirect: "follow",
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 1000) throw new Error("Image too small")
    return { buf, mime: (res.headers.get("content-type") || "image/jpeg").split(";")[0] }
  } finally {
    clearTimeout(timer)
  }
}

async function verifyImageRelevance(imageUrl, headline) {
  if (!GEMINI_API_KEY) return null

  const cacheKey = `${imageUrl}|${(headline || "").substring(0, 120)}`
  if (cache.has(cacheKey)) return cache.get(cacheKey)

  let buffer
  let mime
  try {
    const dl = await downloadImage(imageUrl)
    buffer = dl.buf
    mime = dl.mime
  } catch (err) {
    return null
  }

  const base64 = buffer.toString("base64")

  try {
    const response = await fetchWithRetry(`${GEMINI_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `News headline: "${headline}".\n\n${VERIFY_PROMPT}` },
              { inline_data: { mime_type: mime, data: base64 } },
            ],
          },
        ],
        generationConfig: { temperature: 0, maxOutputTokens: 100 },
      }),
    })

    if (!response.ok) {
      const err = await response.text().catch(() => "unknown error")
      console.log(`    Image relevance check failed (${response.status}): ${err.slice(0, 120)}`)
      return null
    }

    const data = await response.json()
    const parts = data.candidates?.[0]?.content?.parts || []
    const content = parts.map((p) => p.text || "").join("").trim()
    if (!content) return null

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    const parsed = JSON.parse(jsonMatch[0])
    const result = !!parsed.relevant
    cache.set(cacheKey, result)
    return result
  } catch (err) {
    console.log(`    Image relevance check error: ${err.message}`)
    return null
  }
}

async function fetchWithRetry(url, options, attempts = 4) {
  for (let i = 0; i < attempts; i++) {
    const response = await fetch(url, options)
    if (response.status !== 429 && response.status !== 503) return response
    if (i < attempts - 1) {
      const wait = 2000 * Math.pow(2, i)
      console.log(`    Relevance provider rate limited (${response.status}) — retrying in ${wait}ms...`)
      await new Promise((r) => setTimeout(r, wait))
    } else {
      return response
    }
  }
  throw new Error("unreachable")
}

module.exports = { verifyImageRelevance }
