const fs = require("fs")
const path = require("path")

const AI_API_KEY = process.env.AI_API_KEY || ""
const AI_MODEL = process.env.AI_REWRITE_MODEL || "gpt-4o-mini"
const AI_BASE_URL = process.env.AI_BASE_URL || "https://api.openai.com/v1"
const AI_ENABLED = !!(AI_API_KEY && process.env.AI_REWRITE_ENABLED === "true")

const TRACKER_PATH = path.join(__dirname, "../../src/data/.ai-rewrite-tracker.json")

const REWRITE_PROMPT = `You are a professional news editor for "The Global Lens 365", an English news aggregation platform. Rewrite the following news article to be unique, engaging, and journalistically sound. Follow these rules:

1. **Title**: 8-15 words, compelling headline, preserve key entities and facts
2. **Excerpt**: 2-3 sentence summary, 120-180 characters, clear and neutral
3. Use active voice, present tense where appropriate
4. Do NOT fabricate information or add details not in the original
5. Output ONLY valid JSON with "title" and "excerpt" fields

Original Title: {{TITLE}}
Original Excerpt: {{EXCERPT}}`

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function loadTracker() {
  ensureDir(path.dirname(TRACKER_PATH))
  try {
    return JSON.parse(fs.readFileSync(TRACKER_PATH, "utf-8"))
  } catch {
    return {}
  }
}

function saveTracker(tracker) {
  ensureDir(path.dirname(TRACKER_PATH))
  fs.writeFileSync(TRACKER_PATH, JSON.stringify(tracker, null, 2), "utf-8")
}

function articleKey(article) {
  return article.guid || article.link || article.slug || article.title
}

function isAlreadyRewritten(article) {
  if (!AI_ENABLED) return false
  const tracker = loadTracker()
  const key = articleKey(article)
  return !!tracker[key]
}

function markRewritten(article, result) {
  if (!AI_ENABLED) return
  const tracker = loadTracker()
  const key = articleKey(article)
  tracker[key] = {
    rewrittenAt: new Date().toISOString(),
    originalTitle: article.title,
    rewrittenTitle: result.title,
  }
  saveTracker(tracker)
}

async function callAI(prompt) {
  const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${AI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: "system", content: "You are a precise JSON-only assistant. Always respond with valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 300,
    }),
  })

  if (!response.ok) {
    const err = await response.text().catch(() => "unknown error")
    throw new Error(`AI API error ${response.status}: ${err.slice(0, 200)}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error("Empty AI response")

  const parsed = JSON.parse(content)
  if (!parsed.title || !parsed.excerpt) {
    throw new Error(`AI response missing fields: ${JSON.stringify(parsed).slice(0, 100)}`)
  }

  return {
    title: parsed.title.trim(),
    excerpt: parsed.excerpt.trim(),
  }
}

async function rewriteArticle(article) {
  if (!AI_ENABLED) return article
  if (isAlreadyRewritten(article)) return article

  const prompt = REWRITE_PROMPT
    .replace("{{TITLE}}", article.title)
    .replace("{{EXCERPT}}", article.description || article.excerpt || article.title)

  try {
    const result = await callAI(prompt)
    markRewritten(article, result)
    return {
      ...article,
      title: result.title,
      description: result.excerpt,
      excerpt: result.excerpt,
    }
  } catch (err) {
    console.error(`  AI rewrite failed for "${article.title?.slice(0, 50)}": ${err.message}`)
    return article
  }
}

async function rewriteAllArticles(articles, concurrency = 5) {
  if (!AI_ENABLED) {
    console.log("  AI rewriting disabled — set AI_REWRITE_ENABLED=true and AI_API_KEY")
    return articles
  }

  console.log(`  AI rewriting ${articles.length} articles (model: ${AI_MODEL}, concurrency: ${concurrency})...`)

  const results = []
  for (let i = 0; i < articles.length; i += concurrency) {
    const batch = articles.slice(i, i + concurrency)
    const batchResults = await Promise.all(batch.map(rewriteArticle))
    results.push(...batchResults)

    if (i + concurrency < articles.length) {
      console.log(`    Progress: ${Math.min(i + concurrency, articles.length)}/${articles.length}`)
    }
  }

  const rewritten = results.filter((a, idx) => a.title !== articles[idx]?.title)
  console.log(`  AI rewrite complete: ${rewritten.length}/${articles.length} articles rewritten`)

  return results
}

module.exports = { rewriteArticle, rewriteAllArticles, AI_ENABLED }
