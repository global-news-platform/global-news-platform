#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

const ARTICLES_DIR = path.join(__dirname, "../src/data/articles")
const CONFIG_PATH = path.join(__dirname, "config/sources.json")

function parseArgs() {
  const args = { dryRun: false, pageId: null, token: null, siteUrl: null }
  for (const arg of process.argv.slice(2)) {
    if (arg === "--dry-run") args.dryRun = true
    else if (arg.startsWith("--page-id=")) args.pageId = arg.split("=")[1]
    else if (arg.startsWith("--token=")) args.token = arg.split("=")[1]
    else if (arg.startsWith("--site-url=")) args.siteUrl = arg.split("=")[1]
  }
  return args
}

function readAllArticles() {
  if (!fs.existsSync(ARTICLES_DIR)) return []
  const files = fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".mdx"))
  const articles = []

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(ARTICLES_DIR, file), "utf-8")
      const match = content.match(/^---\s*\n([\s\S]*?)\n---/)
      if (!match) continue

      const fm = {}
      for (const line of match[1].split("\n")) {
        const idx = line.indexOf(":")
        if (idx === -1) continue
        const key = line.slice(0, idx).trim()
        let value = line.slice(idx + 1).trim()
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1).replace(/\\"/g, '"')
        else if (value === "true") value = true
        else if (value === "false") value = false
        else if (value.startsWith("[") && value.endsWith("]")) {
          try { value = JSON.parse(value.replace(/'/g, '"')) } catch { value = value.slice(1, -1).split(",").map((s) => s.trim().replace(/['"]/g, "")) }
        }
        fm[key] = value
      }

      articles.push({
        slug: file.replace(/\.mdx$/, ""),
        title: fm.title || "",
        excerpt: fm.excerpt || "",
        description: fm.excerpt || "",
        sourceName: fm.sourceName || fm.attribution || "",
        sourceUrl: fm.sourceUrl || "",
        canonicalUrl: fm.canonicalUrl || fm.sourceUrl || "",
        attribution: fm.attribution || fm.sourceName || "",
        image: fm.image || "",
        publishedAt: fm.publishedAt || "",
        category: fm.category || "",
        tags: Array.isArray(fm.tags) ? fm.tags : [],
        featured: fm.featured || false,
        breaking: fm.breaking || false,
        trending: fm.trending || false,
      })
    } catch (err) {
      console.error(`  Error reading ${file}: ${err.message}`)
    }
  }

  return articles
}

async function main() {
  const args = parseArgs()

  const pageId = args.pageId || process.env.FB_PAGE_ID
  const token = args.token || process.env.FB_PAGE_ACCESS_TOKEN
  const siteUrl = args.siteUrl || process.env.SITE_URL || "https://the-global-lens-365.vercel.app"

  console.log("=".repeat(60))
  console.log("  Social Media Poster — Pakistan News Hub")
  console.log(`  Mode: ${args.dryRun ? "DRY RUN" : "LIVE"}`)
  console.log(`  Site URL: ${siteUrl}`)
  console.log(`  Facebook Page ID: ${pageId ? "✓ configured" : "✗ not set"}`)
  console.log(`  FB Access Token: ${token ? "✓ configured" : "✗ not set"}`)
  console.log("=".repeat(60))

  if (!pageId || !token) {
    console.log("\nFacebook not configured. Set FB_PAGE_ID and FB_PAGE_ACCESS_TOKEN.")
    console.log("Usage: node scripts/post-social.js --page-id=YOUR_PAGE_ID --token=YOUR_TOKEN [--dry-run] [--site-url=https://pakistan-news.news]")
    process.exit(pageId || token ? 1 : 0)
  }

  console.log("\nReading articles...")
  const articles = readAllArticles()
  console.log(`Found ${articles.length} articles`)

  const { postTopArticles } = require("./lib/facebook")

  const result = await postTopArticles(articles, {
    pageId,
    pageAccessToken: token,
    siteUrl,
    dryRun: args.dryRun,
  })

  console.log(`\nDone. ${result.posted} posted, ${result.skipped} skipped of ${result.total} selected.`)
}

main().catch((err) => {
  console.error("Social poster failed:", err)
  process.exit(1)
})
