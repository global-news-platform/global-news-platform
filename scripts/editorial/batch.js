// Batch article processing from a JSON file
//
// Usage:
//   node scripts/editorial/batch.js --input articles.json --output results.json --tone neutral --length medium
//
// Input JSON format: array of article objects with title, body, excerpt, source, sourceUrl, publishedAt

import { readFileSync, writeFileSync } from "fs"
import { processBatch } from "./index.js"

const args = process.argv.slice(2)

function getArg(name) {
  const idx = args.indexOf(`--${name}`)
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null
}

const inputFile = getArg("input") || getArg("i")
const outputFile = getArg("output") || getArg("o") || "editorial-results.json"
const tone = getArg("tone") || "neutral"
const length = getArg("length") || "medium"
const concurrency = parseInt(getArg("concurrency") || getArg("c") || "3", 10)

let articles = []

if (inputFile) {
  try {
    const raw = readFileSync(inputFile, "utf-8")
    articles = JSON.parse(raw)
    if (!Array.isArray(articles)) articles = [articles]
  } catch (err) {
    console.error(`Failed to read input file: ${err.message}`)
    process.exit(1)
  }
} else {
  // Use sample batch
  articles = [
    {
      title: "Global Climate Summit Reaches Historic Agreement in Geneva",
      excerpt: "World leaders reached a landmark agreement at the UN Climate Summit.",
      body: "World leaders gathered in Geneva this week for a historic climate summit that culminated in a binding agreement to slash carbon emissions by 50% by 2035.",
      source: "Reuters",
      sourceUrl: "https://example.com/1",
      publishedAt: new Date().toISOString(),
    },
    {
      title: "Tech Giants Announce Joint AI Safety Framework",
      excerpt: "Major technology companies have agreed on a shared framework for AI safety standards.",
      body: "Leading technology companies including Google, Microsoft, and OpenAI have jointly announced a comprehensive AI safety framework, establishing common standards for model testing, deployment, and monitoring.",
      source: "TechCrunch",
      sourceUrl: "https://example.com/2",
      publishedAt: new Date().toISOString(),
    },
  ]
  console.log(`No --input provided. Processing ${articles.length} sample articles.\n`)
}

console.log(`Processing ${articles.length} articles...`)
console.log(`Tone: ${tone}, Length: ${length}, Concurrency: ${concurrency}`)

const startTime = Date.now()
const { results, errors, totalProcessed, totalErrors } = await processBatch(articles, {
  tone,
  primaryLength: length,
  concurrency,
  verbose: false,
  generateShort: true,
  generateLong: true,
})
const duration = Date.now() - startTime

console.log(`\nCompleted in ${duration}ms`)
console.log(`Processed: ${totalProcessed}, Errors: ${totalErrors}`)

if (errors.length > 0) {
  console.error("\nErrors:")
  errors.forEach((e) => console.error(`  - ${e.article}: ${e.error}`))
}

const output = {
  metadata: {
    processedAt: new Date().toISOString(),
    duration,
    totalArticles: articles.length,
    totalProcessed,
    totalErrors,
    tone,
    length,
  },
  articles: results.map((r) => ({
    originalTitle: r.originalTitle,
    title: r.title,
    body: r.body,
    shortForm: r.shortForm,
    longForm: r.longForm,
    wordCount: r.wordCount,
    tone: r.tone,
    quality: r.quality,
    originality: {
      score: r.originality.score,
      verdict: r.originality.verdict,
    },
    policy: {
      passed: r.policy.passed,
      score: r.policy.score,
      warnings: r.policy.warnings,
    },
    seoMetadata: r.seoMetadata,
    thumbnailPrompt: r.thumbnailPrompt,
    attribution: r.attribution,
    sourceName: r.sourceName,
    duration: r.duration,
  })),
  errors,
}

writeFileSync(outputFile, JSON.stringify(output, null, 2))
console.log(`\nResults written to: ${outputFile}`)
