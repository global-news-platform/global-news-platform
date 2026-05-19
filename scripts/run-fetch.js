#!/usr/bin/env node

/**
 * RSS Fetch & Ingest Script
 * ==========================
 * Fetches all configured RSS sources, processes articles,
 * generates MDX files, and updates the publishing queue.
 *
 * Usage:
 *   node scripts/run-fetch.js                    # fetch all sources
 *   node scripts/run-fetch.js --source <url>     # single source
 *   node scripts/run-fetch.js --max <n>          # max per source
 *   node scripts/run-fetch.js --dry-run          # preview only
 *   node scripts/run-fetch.js --concurrency <n>  # parallel fetches
 */

const path = require("path")
const fs = require("fs")

const ROOT = path.join(__dirname, "..")
const ARTICLES_DIR = path.join(ROOT, "src", "data", "articles")

const args = process.argv.slice(2)
const FLAGS = {
  source: null,
  max: 10,
  dryRun: args.includes("--dry-run"),
  concurrency: 1,
}
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--source") FLAGS.source = args[++i]
  if (args[i] === "--max") FLAGS.max = parseInt(args[++i], 10) || 10
  if (args[i] === "--concurrency") FLAGS.concurrency = parseInt(args[++i], 10) || 1
}

function log(s) { process.stdout.write(`  ${s}\n`) }
function ok(s) { process.stdout.write(`  ✓ ${s}\n`) }
function wrn(s) { process.stdout.write(`  ⚠ ${s}\n`) }
function fail(s) { process.stdout.write(`  ✗ ${s}\n`) }

function buildImageQuery(title, category, slug) {
  const cat = (category || "general").toLowerCase()
  const keywords = cat === "general"
    ? title.replace(/[^a-zA-Z0-9 ]/g, " ").split(/\s+/).filter(w => w.length > 3).slice(0, 5).join(" ")
    : cat
  const encoded = encodeURIComponent(keywords)
  return `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=85&fit=crop&auto=format`
}

async function main() {
  console.log(`\n╔══════════════════════════════════════════╗
║     GLOBAL NEWS — RSS Ingestion Engine   ║
╚══════════════════════════════════════════╝
  Mode: ${FLAGS.dryRun ? "DRY RUN" : "LIVE"}
  Concurrency: ${FLAGS.concurrency}
`)

  const configPath = path.join(ROOT, "scripts", "config", "sources.json")
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"))

  let sources = config.sources
  if (FLAGS.source) {
    sources = sources.filter((s) => s.url === FLAGS.source)
    if (sources.length === 0) {
      fail(`Source not found: ${FLAGS.source}`)
      process.exit(1)
    }
  }

  log(`Sources to process: ${sources.length}`)

  // Import modules
  const { fetchAllSources } = require("./lib/rss-enhanced")
  const { extractTopics, buildFrontmatter, formatMdx, generateArticleSlug } = require("./lib/processor")
  const { rewriteArticle, generateSEOTitle, generateMetaDescription, estimateReadingTime } = require("./lib/summarizer")
  const { computeOverallQuality } = require("./lib/quality")
  const { detectCategory } = require("./lib/category-matcher")
  const { isDuplicate, markProcessed } = require("./lib/dedup")
  const { write, exists } = require("./lib/writer")
  const { enqueue } = require("./lib/scheduler")
  const { generateRelatedSection } = require("./lib/internallinks")

  const results = await fetchAllSources(sources, FLAGS.concurrency)

  log(`\nSuccessful: ${results.success.length}, Failed: ${results.failed.length}`)

  if (results.failed.length > 0) {
    for (const f of results.failed) {
      fail(`${f.source.label}: ${f.error}`)
    }
  }

  let totalNew = 0
  let totalSkipped = 0
  let totalLowQuality = 0

  const ONE_DAY = 24 * 60 * 60 * 1000


  for (const { source, items } of results.success) {
    let batch = items.slice(0, FLAGS.max)

    // Filter only fresh news (last 24 hours)
    batch = batch.filter(item => {
      if (!item.pubDate) return false
      const published = new Date(item.pubDate).getTime()
      if (isNaN(published)) return false
      return Date.now() - published < ONE_DAY
    })

    // Remove duplicates by title
    const seen = new Set()
    batch = batch.filter(item => {
      const title = (item.title || "").trim()
      if (!title) return false
      if (seen.has(title)) return false
      seen.add(title)
      return true
    })

    // Sanitize titles and descriptions
    for (const item of batch) {
      item.title = (item.title || "")
        .replace(/\u201C|\u201D/g, '"')
        .replace(/[\r\n\t]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
      if (item.excerpt) {
        item.excerpt = (item.excerpt || "")
          .replace(/\u201C|\u201D/g, '"')
          .replace(/[\r\n\t]/g, " ")
          .replace(/\s+/g, " ")
          .trim()
      }
    }

    log(`\n${source.label} (${batch.length} items after filter)`)

    for (const item of batch) {
      // Dedup check
      if (isDuplicate(item.sourceUrl, item.title)) {
        totalSkipped++
        continue
      }

      // Multi-layer category detection with source awareness
      const sourceCat = source.category || null
      const sourceLabel = source.label || null
      const sourceUrl = source.url || null
      const clsResult = detectCategory(item.title, item.excerpt, item.body || "", { sourceCategory: sourceCat, sourceLabel, sourceUrl })

      // SAFETY: always coerce to a valid category string
      const detectedCategory = clsResult?.category || "World"
      item.category = detectedCategory

      const usedFallback = !clsResult?.category || clsResult?.method === "fallback" || clsResult?.method === "general-fallback"

      // Debug logging for every article
      console.log(`  [CLASSIFY] title="${item.title.slice(0, 80)}" category="${detectedCategory}" confidence=${clsResult?.confidence ?? 0} source="${sourceLabel || "unknown"}" fallback=${usedFallback}`)

      if (clsResult.confidence < 50) {
        let msg = `low category confidence (${clsResult.confidence}%) for "${item.title.slice(0, 50)}..." → "${detectedCategory}" via ${clsResult.method}`
        if (clsResult.debug.entities.length) {
          msg += ` | entities: ${clsResult.debug.entities.map(e => e.entity).join(",")}`
        }
        if (clsResult.debug.sourceMatch) {
          msg += ` | source: ${clsResult.debug.sourceMatch.matched}`
        }
        msg += ` | top: ${clsResult.topCategories.map(c => `${c.category}=${c.score}`).join(", ")}`
        wrn(msg)
      }

      // Quality scoring
      const quality = computeOverallQuality(item)
      if (quality.overall < 20) {
        totalLowQuality++
        continue
      }

      // Build set of existing slugs for dedup
      if (!global.__usedSlugs) {
        global.__usedSlugs = new Set()
        if (fs.existsSync(ARTICLES_DIR)) {
          for (const f of fs.readdirSync(ARTICLES_DIR)) {
            if (f.endsWith(".mdx")) global.__usedSlugs.add(f.replace(/\.mdx$/, ""))
          }
        }
      }

      // Generate deterministic slug (no random hash)
      const slug = generateArticleSlug(item.title, global.__usedSlugs)

      if (FLAGS.dryRun) {
        log(`[DRY] ${slug} — "${item.title.slice(0, 60)}..." (quality: ${quality.overall})`)
        continue
      }

      if (exists(slug)) {
        totalSkipped++
        continue
      }

      // Editorial rewriting — transforms raw RSS into premium journalism
      const rawBody = item.body || item.excerpt || ""
      const editorial = rewriteArticle(
        { title: item.title, body: rawBody, excerpt: item.excerpt, category: detectedCategory },
        { tone: "neutral" },
      )
      const editorialBody = editorial.body
      const seoTitle = generateSEOTitle(item.title, [])
      const metaDesc = generateMetaDescription(editorialBody || item.excerpt)
      const readingTime = estimateReadingTime(editorialBody || rawBody)

      // Generate topics/tags from enriched content
      const topics = extractTopics(`${item.title} ${item.excerpt} ${rawBody.slice(0, 800)}`)

      // Build frontmatter with analysis data
      const analysis = { body: editorialBody, ...item }

      // Build image URL from headline + category
      const imageUrl = buildImageQuery(item.title, detectedCategory, slug)

      // Build frontmatter
      const fm = buildFrontmatter(
        { ...item, body: editorialBody, image: imageUrl, imageAlt: item.title, imagePrompt: "", imageAnalysis: "" },
        topics,
      )

      // Override with editorial content
      const excerptLines = editorialBody.split("\n\n").filter(Boolean)
      fm.excerpt = (excerptLines[0] || editorialBody || item.excerpt).slice(0, 250)
      fm.title = seoTitle
      fm.readingTime = readingTime

      fm.image = imageUrl

      // Recompute quality on the editorial version
      const finalQuality = computeOverallQuality({ ...item, body: editorialBody })

      // Build MDX with related articles section
      let fullBody = editorialBody
      const relatedSection = generateRelatedSection(slug, detectedCategory, item.title)
      if (relatedSection) {
        fullBody = editorialBody + "\n\n" + relatedSection
      }

      const mdx = formatMdx(fm, fullBody)
      const written = write(slug, mdx)

      if (written) {
        markProcessed(item.sourceUrl, slug, item.title)

        // Add to publishing queue
        enqueue([
          {
            slug,
            title: seoTitle,
            excerpt: fm.excerpt,
            category: detectedCategory,
            author: item.author,
            authorSlug: item.author.toLowerCase().replace(/[^a-z0-9]/g, "-"),
            publishedAt: item.publishedAt,
            image: imageResult?.path || "",
            readingTime,
            featured: fm.breaking,
            breaking: fm.breaking,
            trending: fm.breaking,
          },
        ])

        totalNew++
        ok(`${slug} — editorial quality: ${finalQuality.overall}/100 (${finalQuality.authority} authority, ${finalQuality.humanLikeness} human-like)`)
      }
    }
  }

  console.log(`\n  ── Summary ──`)
  ok(`${totalNew} new articles`)
  if (totalSkipped > 0) wrn(`${totalSkipped} skipped (duplicates)`)
  if (totalLowQuality > 0) wrn(`${totalLowQuality} skipped (low quality)`)

  // Compute trending
  try {
    const { computeTrending, computeDailyMetrics } = require("./lib/metrics")
    computeTrending()
    computeDailyMetrics()
  } catch (e) {
    wrn(`Trending computation skipped: ${e.message}`)
  }
}

main().catch((err) => {
  console.error(`\n  ✗ Fatal: ${err.message}\n`)
  process.exit(1)
})
