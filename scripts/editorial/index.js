import { extractFacts } from "./fact-extractor.js"
import { rewriteArticle } from "./rewriter.js"
import { checkOriginality, checkDuplicates } from "./originality.js"
import { generateAttribution, insertAttributions } from "./attribution.js"
import { generateSeoMetadata } from "./seo-enhancer.js"
import { humanize } from "./humanizer.js"
import { generatePrompt } from "./thumbnail-prompt.js"
import { scoreArticle } from "./quality-scorer.js"
import { checkPolicy } from "./content-policy.js"

const TONES = ["neutral", "analytical", "modern", "global", "tech"]

export async function processArticle(article, options = {}) {
  try {
    return await processArticleInternal(article, options)
  } catch (err) {
    console.error(`[editorial] processArticle error:`, err)
    throw err
  }
}

async function processArticleInternal(article, options = {}) {
  const {
    tone = "neutral",
    primaryLength = "medium",
    generateShort = true,
    generateLong = true,
    checkDuplicatesAgainst = [],
    verbose = false,
  } = options

  const startTime = Date.now()
  const log = verbose ? (msg) => console.log(`[editorial] ${msg}`) : () => {}

  log(`Processing: "${(article.title || "").slice(0, 60)}..."`)

  // 1. Fact extraction
  log("Extracting facts...")
  const facts = await extractFacts(article)

  // 2. Primary rewrite
  log(`Rewriting article (${tone}, ${primaryLength})...`)
  const rewritten = await rewriteArticle(article, { tone, length: primaryLength })

  // 3. Generate additional length variants
  let shortForm = null
  let longForm = null
  if (generateShort && primaryLength !== "short") {
    log("Generating short-form variant...")
    const shortResult = await rewriteArticle(article, { tone, length: "short" })
    shortForm = shortResult.body
  }
  if (generateLong && primaryLength !== "long") {
    log("Generating long-form variant...")
    const longResult = await rewriteArticle(article, { tone, length: "long" })
    longForm = longResult.body
  }

  // 4. Originality check
  log("Running originality check...")
  const originality = await checkOriginality(
    rewritten.body,
    article.body || article.excerpt || article.title,
  )
  const duplicateCheck = await checkDuplicates(
    rewritten.body,
    checkDuplicatesAgainst,
  )

  // 5. Attribution
  log("Generating attribution...")
  const attribution = generateAttribution(article.source, rewritten.facts)
  const attributedBody = insertAttributions(rewritten.body, article.source)

  // 6. SEO metadata
  log("Generating SEO metadata...")
  const seo = await generateSeoMetadata(article, attributedBody)

  // 7. Humanization
  log("Humanizing output...")
  const humanizedBody = await humanize(attributedBody)
  let humanizedShort = null
  let humanizedLong = null
  if (shortForm) humanizedShort = await humanize(shortForm)
  if (longForm) humanizedLong = await humanize(longForm)

  // 8. Thumbnail prompt
  log("Generating thumbnail prompt...")
  const thumbnailPrompt = generatePrompt(article)

  // 9. Quality scoring
  log("Scoring quality...")
  const quality = scoreArticle(article, humanizedBody)

  // 10. Content policy check
  log("Running content policy check...")
  const policy = checkPolicy(article, humanizedBody)

  const duration = Date.now() - startTime
  log(`Complete in ${duration}ms`)

  return {
    // Original reference
    originalTitle: article.title,
    originalSource: article.source,
    originalUrl: article.sourceUrl,

    // Fact extraction
    facts,

    // Rewritten content
    title: rewritten.title,
    body: humanizedBody,
    shortForm: humanizedShort,
    longForm: humanizedLong,
    wordCount: humanizedBody.split(/\s+/).filter(Boolean).length,
    tone,
    length: primaryLength,

    // Attribution
    attribution,
    sourceName: normalizeSourceName(article.source),

    // SEO
    seoMetadata: seo,

    // Originality
    originality,
    duplicateCheck,

    // Thumbnail
    thumbnailPrompt,

    // Quality
    quality,

    // Policy
    policy,

    // Processing metadata
    duration,
    processedAt: new Date().toISOString(),
    processingVersion: "1.0.0",
  }
}

export async function processBatch(articles, options = {}) {
  const {
    concurrency = 3,
    ...rest
  } = options

  const results = []
  const errors = []

  for (let i = 0; i < articles.length; i += concurrency) {
    const batch = articles.slice(i, i + concurrency)
    const batchResults = await Promise.allSettled(
      batch.map((article) => processArticle(article, rest)),
    )
    for (let j = 0; j < batchResults.length; j++) {
      const result = batchResults[j]
      if (result.status === "fulfilled") {
        results.push(result.value)
      } else {
        errors.push({ article: batch[j]?.title || "(unknown)", error: result.reason?.message || String(result.reason) })
        console.error(`[editorial] Failed to process article "${batch[j]?.title}": ${result.reason?.message}`)
      }
    }
  }

  return { results, errors, totalProcessed: results.length, totalErrors: errors.length }
}

export function getAllTones() {
  return TONES
}

export { extractFacts } from "./fact-extractor.js"
export { rewriteArticle } from "./rewriter.js"
export { checkOriginality, checkDuplicates } from "./originality.js"
export { generateAttribution, insertAttributions } from "./attribution.js"
export { generateSeoMetadata } from "./seo-enhancer.js"
export { humanize } from "./humanizer.js"
export { generatePrompt } from "./thumbnail-prompt.js"
export { scoreArticle } from "./quality-scorer.js"
export { checkPolicy } from "./content-policy.js"

function normalizeSourceName(source) {
  if (!source) return "news agencies"
  const nameMap = {
    reuters: "Reuters",
    "associated press": "the Associated Press",
    ap: "the Associated Press",
    bbc: "the BBC",
    "the guardian": "The Guardian",
    "new york times": "the New York Times",
    bloomberg: "Bloomberg",
    "al jazeera": "Al Jazeera",
    "wall street journal": "the Wall Street Journal",
    washington: "the Washington Post",
    cnn: "CNN",
    npr: "NPR",
  }
  const key = Object.keys(nameMap).find((k) => source.toLowerCase().includes(k))
  return key ? nameMap[key] : source
}
