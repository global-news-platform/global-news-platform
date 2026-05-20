// Pre-resolves all article images via Unsplash API and writes them
// into each article's frontmatter so the Vercel build needs zero API calls.
//
// Usage: node scripts/resolve-images.mjs

import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { createRequire } from "module"

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

const articlesDir = join(__dirname, "..", "src", "data", "articles")
const UNSPLASH_API = "https://api.unsplash.com/search/photos"
const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY
const SEARCH_CACHE = new Map()

const STOP_WORDS = new Set([
  "and", "the", "of", "in", "to", "a", "is", "for", "on", "with",
  "as", "by", "at", "from", "an", "its", "it", "or", "be", "are",
  "was", "but", "not", "that", "this", "has", "have", "had", "his",
  "her", "all", "will", "can", "new", "after", "over", "into",
])

const CATEGORY_KEYWORDS = {
  world: "world-globe-travel-international",
  politics: "politics-government-debate-parliament",
  business: "business-finance-market-economy",
  technology: "technology-tech-digital-innovation",
  science: "science-research-laboratory-discovery",
  health: "health-medical-hospital-wellness",
  climate: "climate-nature-environment-sustainability",
  sports: "sports-athletics-stadium-competition",
  culture: "culture-art-music-entertainment",
  opinion: "opinion-media-communication-discussion",
  entertainment: "entertainment-movies-show-concert",
  breaking: "breaking-news-alert-emergency",
  featured: "featured-highlight-spotlight-top",
  general: "news-media-journalism-reporting",
}

function hash(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++)
    h = ((h << 5) + h + str.charCodeAt(i)) & 0xffffffff
  return Math.abs(h)
}

function extractKeywords(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && w.length <= 8 && !STOP_WORDS.has(w))
    .slice(0, 2)
}

async function searchUnsplash(query) {
  const cached = SEARCH_CACHE.get(query)
  if (cached) return cached
  if (!ACCESS_KEY) return []

  try {
    const url = `${UNSPLASH_API}?query=${encodeURIComponent(query)}&per_page=30&orientation=landscape`
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const data = await res.json()
    const urls = (data.results || []).map(
      (p) => `${p.urls.raw}&w=1200&q=85&fit=crop&auto=format`,
    )
    SEARCH_CACHE.set(query, urls)
    return urls
  } catch {
    return []
  }
}

async function getArticleImage(slug, categorySlug, title) {
  const cat = categorySlug || "general"
  const catKeyword = CATEGORY_KEYWORDS[cat] || CATEGORY_KEYWORDS.general

  if (title) {
    const words = extractKeywords(title)
    if (words.length > 0) {
      const specificQuery = `${catKeyword} ${words.join(" ")}`
      const results = await searchUnsplash(specificQuery)
      if (results.length > 0) return results[hash(slug) % results.length]
    }
  }

  const results = await searchUnsplash(catKeyword)
  if (results.length > 0) return results[hash(slug) % results.length]

  return `https://picsum.photos/seed/${slug}-${hash(slug) % 1000}/${1200}/${800}`
}

function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
  if (!match) return { frontmatter: {}, body: content }
  const frontmatter = {}
  const lines = match[1].split("\n")
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const ci = trimmed.indexOf(":")
    if (ci === -1) continue
    const key = trimmed.slice(0, ci).trim()
    const value = trimmed.slice(ci + 1).trim()
    if (!key) continue

    if (value.startsWith("[") && value.endsWith("]")) {
      try { frontmatter[key] = JSON.parse(value.replace(/'/g, '"')) } catch { frontmatter[key] = value }
    } else if (value.toLowerCase() === "null") frontmatter[key] = null
    else if (value.toLowerCase() === "true") frontmatter[key] = true
    else if (value.toLowerCase() === "false") frontmatter[key] = false
    else if (value.startsWith('"') && value.endsWith('"')) frontmatter[key] = value.slice(1, -1).replace(/\\"/g, '"')
    else frontmatter[key] = value
  }
  return { frontmatter, body: match[2] }
}

function serializeFrontmatter(frontmatter, body) {
  const lines = ["---"]
  for (const [key, value] of Object.entries(frontmatter)) {
    if (value === null || value === undefined) continue
    if (Array.isArray(value)) {
      lines.push(`${key}: [${value.map(v => `'${v}'`).join(", ")}]`)
    } else if (typeof value === "boolean") {
      lines.push(`${key}: ${value}`)
    } else if (typeof value === "number") {
      lines.push(`${key}: ${value}`)
    } else if (typeof value === "string" && (value.includes(":") || value.includes("#") || value.startsWith("https://"))) {
      lines.push(`${key}: ${value}`)
    } else {
      lines.push(`${key}: ${value}`)
    }
  }
  lines.push("---", "")
  return lines.join("\n") + body.trimStart()
}

async function main() {
  if (!ACCESS_KEY) {
    console.error("UNSPLASH_ACCESS_KEY env var required")
    process.exit(1)
  }

  const files = readdirSync(articlesDir).filter(f => f.endsWith(".md") || f.endsWith(".mdx")).sort()

  console.log(`Resolving images for ${files.length} articles...`)

  for (const file of files) {
    const filePath = join(articlesDir, file)
    const content = readFileSync(filePath, "utf-8")
    const { frontmatter, body } = parseFrontmatter(content)
    const slug = file.replace(/\.(md|mdx)$/, "")

    // Skip if image already in frontmatter
    if (frontmatter.image && frontmatter.image.startsWith("https://images.unsplash.com")) {
      console.log(`  ✓ ${slug} (already resolved)`)
      continue
    }

    const title = frontmatter.title || slug
    const categoryName = (frontmatter.category || "").toLowerCase()
    const categoryInfo = { slug: null }
    for (const [key, _val] of Object.entries(CATEGORY_KEYWORDS)) {
      if (categoryName === key || categoryName === key.toLowerCase()) {
        categoryInfo.slug = key
        break
      }
    }
    const categorySlug = categoryInfo.slug || "general"

    console.log(`  → ${slug}...`)
    const imageUrl = await getArticleImage(slug, categorySlug, title)
    frontmatter.image = imageUrl

    const newContent = serializeFrontmatter(frontmatter, body)
    writeFileSync(filePath, newContent, "utf-8")
    console.log(`  ✓ ${slug} → ${imageUrl.substring(0, 60)}...`)
  }

  console.log(`\nDone. ${files.length} articles processed.`)
}

main().catch(console.error)
