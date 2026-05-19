import { generate } from "./ai.js"

export async function generateSeoMetadata(article, rewrittenBody) {
  const source = `${article.title || ""}\n\n${rewrittenBody || article.excerpt || ""}`
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 3000)

  const system = `You are an SEO specialist for a global news publication. Generate metadata from the article content.

Return ONLY valid JSON with these fields:
- title: SEO-optimized title (50-65 chars, with primary keyword near the front)
- metaDescription: Compelling meta description (150-160 chars, include primary keyword and call-to-action)
- keywords: Array of 5-8 keyword phrases relevant to the article
- tags: Array of 3-6 category tags
- primaryEntity: The main person, organization, or topic the article is about
- entities: Array of semantic entities mentioned (people, places, orgs)
- summary: One-sentence structured summary (max 30 words)
- faq: Array of {question, answer} objects (0-3 items, only if article answers specific questions)
- readingTime: Estimated reading time in minutes`

  const prompt = `Generate SEO metadata for this news article:

${source}`

  let metadata
  try {
    const raw = await generate(prompt, { system, temperature: 0.3, maxTokens: 1500, format: "json" })
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim()
    metadata = JSON.parse(cleaned)
  } catch (err) {
    console.warn(`[seo-enhancer] AI generation failed: ${err.message}`)
    metadata = generateFallbackSeo(article)
  }

  return {
    title: metadata.title || article.title,
    metaDescription: metadata.metaDescription || (article.excerpt || "").slice(0, 160),
    keywords: metadata.keywords || [],
    tags: metadata.tags || [],
    primaryEntity: metadata.primaryEntity || "",
    entities: metadata.entities || [],
    summary: metadata.summary || "",
    faq: metadata.faq || [],
    readingTime: metadata.readingTime || estimateReadingTime(rewrittenBody || article.excerpt || ""),
  }
}

function estimateReadingTime(text) {
  const wordsPerMinute = 200
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

function generateFallbackSeo(article) {
  const title = article.title || ""
  const desc = (article.excerpt || "").slice(0, 160)
  return {
    title,
    metaDescription: desc,
    keywords: generateFallbackKeywords(title, article.category),
    tags: article.tags || [],
    primaryEntity: "",
    entities: [],
    summary: desc.slice(0, 150),
    faq: [],
    readingTime: 3,
  }
}

function generateFallbackKeywords(title, category) {
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !["this", "that", "with", "from", "have", "been", "were"].includes(w))
    .slice(0, 5)
  const result = [...new Set(words)]
  if (category) result.push(category.toLowerCase())
  return result
}
