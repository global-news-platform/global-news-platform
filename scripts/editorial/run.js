// Standalone: process a single article via CLI
// Provide article data as JSON via stdin or --article flag
//
// Usage:
//   node scripts/editorial/run.js --article '{"title":"...","body":"...","source":"Reuters"}'
//   echo '{"title":"...","body":"...","source":"Reuters"}' | node scripts/editorial/run.js

import { processArticle } from "./index.js"

const args = process.argv.slice(2)
const articleIndex = args.indexOf("--article")
const toneIndex = args.indexOf("--tone")
const lengthIndex = args.indexOf("--length")

let articleData = null

if (articleIndex !== -1 && args[articleIndex + 1]) {
  try {
    articleData = JSON.parse(args[articleIndex + 1])
  } catch {
    console.error("Invalid JSON in --article flag")
    process.exit(1)
  }
} else if (!process.stdin.isTTY) {
  const chunks = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  const input = Buffer.concat(chunks).toString().trim()
  if (input) {
    try {
      articleData = JSON.parse(input)
    } catch {
      console.error("Invalid JSON from stdin")
      process.exit(1)
    }
  }
}

if (!articleData) {
  // Use a sample if no input provided
  articleData = {
    title: "Global Climate Summit Reaches Historic Agreement in Geneva",
    excerpt: "World leaders reached a landmark agreement at the UN Climate Summit, pledging to reduce carbon emissions by 50% by 2035 with enforceable penalties.",
    body: `<p>World leaders gathered in Geneva this week for a historic United Nations climate summit that culminated in a groundbreaking agreement. Under the accord, signatory nations commit to a 50% reduction in carbon emissions by 2035, with intermediate targets set for 2028 and 2031.</p><p>The agreement includes a $100 billion annual fund to support developing nations in their transition to renewable energy. Environmental groups hailed the deal as a turning point in global climate action.</p><p>However, critics argue the targets remain insufficient. Some scientists call for a 70% reduction to meet Paris Accord goals. The summit marks the first time major emitters including China, India, and the United States have signed onto a unified timeline with enforceable penalties for non-compliance.</p>`,
    source: "Reuters",
    sourceUrl: "https://example.com/climate-summit",
    publishedAt: new Date().toISOString(),
  }
  console.log("No input provided. Using sample article.\n")
}

const tone = toneIndex !== -1 && args[toneIndex + 1] ? args[toneIndex + 1] : "neutral"
const length = lengthIndex !== -1 && args[lengthIndex + 1] ? args[lengthIndex + 1] : "medium"

console.log(`Processing article: "${articleData.title}"`)
console.log(`Tone: ${tone}, Length: ${length}`)
console.log("---")

try {
  const result = await processArticle(articleData, {
    tone,
    primaryLength: length,
    verbose: true,
    generateShort: true,
    generateLong: true,
  })
  console.log("\n=== RESULT ===\n")
  console.log("Title:", result.title)
  console.log("Word count:", result.wordCount)
  console.log("Quality score:", result.quality.overall)
  console.log("Originality score:", Math.round(result.originality.score * 100))
  console.log("Policy passed:", result.policy.passed)
  console.log("Duration:", result.duration, "ms")
  console.log("\n--- Body ---\n")
  console.log(result.body)
  if (result.shortForm) {
    console.log("\n--- Short Form ---\n")
    console.log(result.shortForm)
  }
  if (result.longForm) {
    console.log("\n--- Long Form ---\n")
    console.log(result.longForm)
  }
} catch (err) {
  console.error("Error processing article:", err)
  process.exit(1)
}
