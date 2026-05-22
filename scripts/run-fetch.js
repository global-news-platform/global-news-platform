#!/usr/bin/env node

const { fetchAllSources } = require("./lib/rss")
const { writeAllArticles, getArticleCount } = require("./lib/writer")
const { markProcessed, getStats } = require("./lib/tracker")

function parseArgs() {
  const args = {}
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--max=")) args.max = parseInt(arg.split("=")[1], 10)
    else if (arg.startsWith("--concurrency="))
      args.concurrency = parseInt(arg.split("=")[1], 10)
  }
  return args
}

async function main() {
  const args = parseArgs()
  const maxPerSource = args.max || 10

  console.log("=".repeat(50))
  console.log("  RSS Fetch Runner")
  console.log(`  Max per source: ${maxPerSource}`)
  console.log("=".repeat(50))

  const startTime = Date.now()

  const articles = await fetchAllSources(maxPerSource)

  if (articles.length === 0) {
    console.log("\nNo articles fetched. Exiting.")
    return
  }

  const writeResult = writeAllArticles(articles)

  for (const article of articles) {
    markProcessed(article.guid)
  }

  const stats = getStats()
  const articleCount = getArticleCount()
  const elapsed = Math.round((Date.now() - startTime) / 1000)

  console.log("\n" + "=".repeat(50))
  console.log("  Fetch Summary")
  console.log("=".repeat(50))
  console.log(`  Fetched:   ${articles.length}`)
  console.log(`  Written:   ${writeResult.written}`)
  console.log(`  Skipped:   ${writeResult.skipped}`)
  console.log(`  Failed:    ${writeResult.failed}`)
  console.log(`  In store:  ${articleCount}`)
  console.log(`  Processed: ${stats.totalProcessed}`)
  console.log(`  Time:      ${elapsed}s`)
  console.log("=".repeat(50))
}

main().catch((err) => {
  console.error("Fetch failed:", err)
  process.exit(1)
})
