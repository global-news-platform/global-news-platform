import { generate } from "./ai.js"
import { extractFacts } from "./fact-extractor.js"

const TONES = {
  neutral: "Professional, objective newsroom tone. Balanced reporting. Third-person perspective. Clear and direct.",
  analytical: "Deep analytical journalism. Provides context, background analysis, and expert interpretation. Thoughtful and measured.",
  modern: "Contemporary digital media style. Engaging, concise, scannable. Suitable for modern news platforms. Conversational but authoritative.",
  global: "International affairs journalism. Considers global context and geopolitical implications. Sophisticated and worldly.",
  tech: "Technology journalism tone. Explains technical concepts accessibly. Forward-looking and innovation-focused.",
}

const LENGTHS = {
  short: { label: "short", maxWords: 180, minWords: 120 },
  medium: { label: "medium", maxWords: 450, minWords: 300 },
  long: { label: "long", maxWords: 900, minWords: 600 },
}

export async function rewriteArticle(article, { tone = "neutral", length = "medium" } = {}) {
  const toneGuide = TONES[tone] || TONES.neutral
  const lenGuide = LENGTHS[length] || LENGTHS.medium

  const fullBody = [article.title, article.excerpt, article.body]
    .filter(Boolean)
    .join("\n\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 5000)

  const facts = await extractFacts(article)

  const system = `You are a senior editor at a global digital news publication. Your job is to transform syndicated news wire content into original, high-quality journalism.

RULES (strict):
1. NEVER copy sentences verbatim from the source material.
2. Restructure the article completely — different paragraph order, different flow.
3. Write a fresh, engaging introductory paragraph that hooks the reader.
4. Write a new concluding paragraph that provides context or significance.
5. Vary sentence structure throughout. Mix short punchy sentences with longer explanatory ones.
6. Use specific facts, quotes, data points to ground the article.
7. Maintain a ${toneGuide}
8. Output must be ${lenGuide.label} form: ${lenGuide.minWords}-${lenGuide.maxWords} words.
9. Output ONLY the article body. No title, no meta, no labels.`

  const prompt = `Rewrite this news article as original journalism:

Title: ${article.title}
Source: ${article.source || "News wire"}
Published: ${article.publishedAt || ""}

Body:
${fullBody}

Facts extracted:
${JSON.stringify(facts, null, 2)}

Produce a ${lenGuide.label} article (${lenGuide.minWords}-${lenGuide.maxWords} words, ${lenGuide.label} form) in a ${tone} tone. Generate ONLY the article body.`

  let body = ""
  try {
    body = await generate(prompt, { system, temperature: 0.65, maxTokens: lenGuide.maxWords * 8 })
  } catch (err) {
    console.warn(`[rewriter] AI generation failed: ${err.message}`)
    body = generateFallback(article, lenGuide)
  }

  const titleResult = await generateTitle(article, tone)

  return {
    title: titleResult,
    body,
    wordCount: body.split(/\s+/).length,
    tone,
    length: lenGuide.label,
    facts,
  }
}

async function generateTitle(article, tone) {
  const prompt = `Generate an original, SEO-optimized news headline based on this article.

Original title: "${article.title}"

Requirements:
- Completely rewritten, not a paraphrase of the original
- 8-15 words
- Engaging and clickable but not clickbait
- Includes key entity or topic
- ${tone === "tech" ? "Tech-focused angle" : ""}
- Return ONLY the headline, no quotes, no labels.`

  const system = "You are a professional news headline writer. Produce one clean headline."
  try {
    return await generate(prompt, { system, temperature: 0.8, maxTokens: 60 })
  } catch {
    return article.title
  }
}

function generateFallback(article, lenGuide) {
  // Use the local editorial rewriting engine as fallback
  try {
    const { rewriteArticle } = require("../lib/summarizer")
    const result = rewriteArticle(article, { tone: article.tone || "neutral" })
    if (result && result.body && result.body.length > 50) {
      // Truncate to target length
      const words = result.body.split(/\s+/)
      const target = Math.ceil((lenGuide.minWords + lenGuide.maxWords) / 2)
      if (words.length > target) {
        return words.slice(0, target).join(" ") + "."
      }
      return result.body
    }
  } catch {}

  // Ultimate fallback: clean excerpt
  const excerpt = article.excerpt || article.body || ""
  const clean = excerpt.replace(/<[^>]*>/g, "").trim()
  const sentences = clean.split(/[.!?]+/).filter(Boolean).map((s) => s.trim())
  const target = Math.ceil((lenGuide.minWords + lenGuide.maxWords) / 2)
  let result = ""
  let count = 0
  for (const s of sentences) {
    const words = s.split(/\s+/).length
    if (count + words > target && count > 30) break
    result += s + ". "
    count += words
  }
  return result.trim()
}
