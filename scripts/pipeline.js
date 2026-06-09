#!/usr/bin/env node

const { fetchAllSources } = require("./lib/rss")
const { writeAllArticles, getArticleCount } = require("./lib/writer")
const { markProcessed, getStats } = require("./lib/tracker")
const { resetBatchHashes } = require("./lib/imageDownloader")
const { generateSitemap } = require("./lib/sitemap")
const { generateFeed } = require("./lib/feed")
const { computeTrending, computeDailyMetrics } = require("./lib/metrics")
const { commitAndPush, getCurrentBranch } = require("./lib/git")
const { postTopArticles } = require("./lib/facebook")
const { rewriteAllArticles, AI_ENABLED } = require("./lib/aiRewriter")
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
    else if (arg === "--facebook") args.facebook = true
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
  console.log("  The Global Lens 365 — News Aggregation Pipeline")
  console.log(`  Branch: ${getCurrentBranch()}`)
  console.log(`  Mode: ${dryRun ? "DRY RUN" : ingestOnly ? "INGEST ONLY" : "FULL"}`)
  console.log(`  Max articles per source: ${maxPerSource}`)
  console.log("  Notice: All articles are summaries with attribution to original sources.")
  console.log("=".repeat(60))

  const startTime = Date.now()

  const articles = await fetchAllSources(maxPerSource)

  if (articles.length === 0) {
    console.log("\nNo articles fetched. Exiting.")
    return
  }

  const rewritten = await rewriteAllArticles(articles, args.concurrency || 5)
  const finalArticles = rewritten

  const articleImgCount = fs.existsSync(path.join(__dirname, "../public/images/articles"))
    ? fs.readdirSync(path.join(__dirname, "../public/images/articles")).filter((f) => f.endsWith(".jpg")).length
    : 0
  console.log(`\nLocal article images on disk: ${articleImgCount}`)

  resetBatchHashes()

  console.log(`\nWriting ${finalArticles.length} articles to ${ARTICLES_DIR}...`)
  const writeResult = await writeAllArticles(finalArticles)

  console.log(
    `\nWrite results: ${writeResult.written} written, ${writeResult.skipped} skipped, ${writeResult.failed} failed`,
  )

  for (const article of finalArticles) {
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

  if (args.facebook && !dryRun) {
    const siteUrl = process.env.SITE_URL || "https://the-global-lens-365.vercel.app"
    const pageId = process.env.FB_PAGE_ID
    const pageAccessToken = process.env.FB_PAGE_ACCESS_TOKEN
    console.log(`\nPosting to Facebook (${pageId ? "configured" : "not configured"})...`)
    const fbResult = await postTopArticles(finalArticles, {
      pageId,
      pageAccessToken,
      siteUrl,
      limit: 6,
      dryRun: args.dryRun,
    })
    console.log(`  Facebook: ${fbResult.posted} posted, ${fbResult.skipped} skipped`)
  }

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
  console.log(`  AI rewriting: ${AI_ENABLED ? "enabled" : "disabled (set AI_REWRITE_ENABLED=true + AI_API_KEY)"}`)
  console.log(`  All-time processed: ${stats.totalProcessed}`)
  console.log(`  Local article images: ${articleImgCount}`)
  console.log(`  Time elapsed: ${Math.round((Date.now() - startTime) / 1000)}s`)
  console.log("=".repeat(60))
}

main().catch((err) => {
  console.error("Pipeline failed:", err)
  process.exit(1)
})
