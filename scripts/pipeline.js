#!/usr/bin/env node

const { fetchAllSources } = require("./lib/rss")
const { writeAllArticles, getArticleCount } = require("./lib/writer")
const { markProcessed, getStats } = require("./lib/tracker")
const { resetTracker } = require("./lib/imageResolver")
const { generateSitemap } = require("./lib/sitemap")
const { generateFeed } = require("./lib/feed")
const { computeTrending, computeDailyMetrics } = require("./lib/metrics")
const { commitAndPush, getCurrentBranch } = require("./lib/git")
const path = require("path")
const fs = require("fs")

const ARTICLES_DIR = path.join(__dirname, "../src/data/articles")

function parseArgs() {
  const args = {}
  for (const arg of process.argv.slice(2)) {
    if (arg === "--ingest-only") args.ingestOnly = true
    else if (arg === "--dry-run") args.dryRun = true
    else if (arg === "--no-commit") args.noCommit = true
    else if (arg === "--no-build") args.noBuild = true
    else if (arg.startsWith("--max=")) args.max = parseInt(arg.split("=")[1], 10)
    else if (arg.startsWith("--concurrency="))
      args.concurrency = parseInt(arg.split("=")[1], 10)
  }
  return args
}

async function main() {
  const args = parseArgs()
  const maxPerSource = args.max || 5
  const ingestOnly = args.ingestOnly
  const dryRun = args.dryRun

  console.log("=".repeat(60))
  console.log("  Global News Platform — Automation Pipeline")
  console.log(`  Branch: ${getCurrentBranch()}`)
  console.log(`  Mode: ${dryRun ? "DRY RUN" : ingestOnly ? "INGEST ONLY" : "FULL"}`)
  console.log(`  Max articles per source: ${maxPerSource}`)
  console.log("=".repeat(60))

  const startTime = Date.now()

  const articles = await fetchAllSources(maxPerSource)

  if (articles.length === 0) {
    console.log("\nNo articles fetched. Exiting.")
    return
  }

  const imagePoolSizes = {}
  const poolDirs = fs.readdirSync(path.join(__dirname, "../public/images/categories"))
  for (const dir of poolDirs) {
    const dirPath = path.join(__dirname, "../public/images/categories", dir)
    if (fs.statSync(dirPath).isDirectory()) {
      const count = fs.readdirSync(dirPath).filter((f) => f.endsWith(".jpg")).length
      imagePoolSizes[dir] = count
    }
  }

  console.log(`\nImage pools ready:`)
  for (const [pool, count] of Object.entries(imagePoolSizes)) {
    console.log(`  ${pool}: ${count} images`)
  }

  resetTracker()

  console.log(`\nWriting ${articles.length} articles to ${ARTICLES_DIR}...`)
  console.log(`  Images resolved locally via hash — no downloads, no APIs, no timeouts`)
  const writeResult = writeAllArticles(articles)

  console.log(
    `\nWrite results: ${writeResult.written} written, ${writeResult.skipped} skipped, ${writeResult.failed} failed`,
  )

  for (const article of articles) {
    markProcessed(article.guid)
  }

  if (writeResult.written === 0) {
    console.log("No new articles. Skipping remaining steps.\n")
    return
  }

  if (ingestOnly) {
    const elapsed = Math.round((Date.now() - startTime) / 1000)
    console.log(`\nIngest complete in ${elapsed}s.`)
    return
  }

  console.log(`\nGenerating sitemap...`)
  generateSitemap()

  console.log(`\nGenerating RSS feed...`)
  generateFeed()

  console.log(`\nComputing metrics...`)
  computeDailyMetrics()
  computeTrending(20)

  if (!dryRun && !args.noCommit) {
    console.log(`\nCommitting and pushing changes...`)
    const dateStr = new Date().toISOString().split("T")[0]
    commitAndPush(`Auto: pipeline ingest ${dateStr} (${writeResult.written} new articles)`)
  }

  const stats = getStats()
  const articleCount = getArticleCount()
  const elapsed = Math.round((Date.now() - startTime) / 1000)

  console.log("\n" + "=".repeat(60))
  console.log("  Pipeline Summary")
  console.log("=".repeat(60))
  console.log(`  Total articles in store: ${articleCount}`)
  console.log(`  This run: ${writeResult.written} new, ${writeResult.skipped} duplicates`)
  console.log(`  All-time processed: ${stats.totalProcessed}`)
  console.log(`  Image pool: ${Object.values(imagePoolSizes).reduce((a, b) => a + b, 0)} local images`)
  console.log(`  Image API calls: 0`)
  console.log(`  Image timeouts: 0`)
  console.log(`  Time elapsed: ${Math.round((Date.now() - startTime) / 1000)}s`)
  console.log("=".repeat(60))
}

main().catch((err) => {
  console.error("Pipeline failed:", err)
  process.exit(1)
})
