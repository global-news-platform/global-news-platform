const RssParser = require("rss-parser")
const fs = require("fs")
const path = require("path")

const parser = new RssParser({
  timeout: 15000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (compatible; GlobalNewsBot/1.0; +https://pakistan-news.news)",
  },
})

const SOURCES_PATH = path.join(__dirname, "../config/sources.json")
const ARTICLES_DIR = path.join(__dirname, "../../src/data/articles")

function loadSources() {
  const raw = fs.readFileSync(SOURCES_PATH, "utf-8")
  return JSON.parse(raw).sources
}

function htmlToText(html) {
  if (!html) return ""
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/\s+/g, " ")
    .trim()
}

function extractImage(item) {
  if (item.enclosure && item.enclosure.url) return item.enclosure.url

  if (item["media:content"] && item["media:content"].$) {
    return item["media:content"].$.url
  }

  if (item["media:thumbnail"] && item["media:thumbnail"].$) {
    return item["media:thumbnail"].$.url
  }

  const content = item["content:encoded"] || item.content || ""
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (imgMatch) return imgMatch[1]

  return null
}

function extractDescription(item) {
  return htmlToText(item.contentSnippet || item.content || item.description || "")
}

function generateSlug(title) {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80)

  const hash = Math.random().toString(36).substring(2, 8)
  return `${slug}--${hash}`
}

function generateTags(title, description, category) {
  const words = (title + " " + description).toLowerCase()
  const tagKeywords = [
    "trump", "biden", "congress", "senate", "supreme court",
    "iran", "ukraine", "russia", "china", "taiwan",
    "ebola", "hantavirus", "covid", "health", "vaccine",
    "ai", "artificial intelligence", "openai", "musk", "elon",
    "nba", "nfl", "premier league", "champions league", "cricket",
    "climate", "environment", "energy", "oil", "gas",
    "election", "midterm", "primary", "vote",
  ]

  const tags = []
  for (const keyword of tagKeywords) {
    if (words.includes(keyword)) {
      tags.push(keyword)
    }
  }

  if (tags.length === 0) tags.push(category.toLowerCase())

  return [...new Set(tags)]
}

async function fetchSource(source, maxPerSource = 5) {
  const { url, category, label } = source
  console.log(`  [${label}] Fetching ${url}...`)

  let feed
  try {
    feed = await parser.parseURL(url)
  } catch (err) {
    console.error(`  [${label}] ERROR: ${err.message}`)
    return []
  }

  const items = (feed.items || []).slice(0, maxPerSource)
  console.log(`  [${label}] Got ${items.length} items`)

  return items.map((item) => {
    const title = (item.title || "Untitled").trim()
    const description = extractDescription(item)
    const imageUrl = extractImage(item)
    const slug = generateSlug(title)

    return {
      source: label,
      sourceUrl: item.link || "",
      slug,
      title,
      description: description.substring(0, 300),
      content: description,
      category,
      imageUrl,
      publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
      tags: generateTags(title, description, category),
      guid: item.guid || item.link || slug,
    }
  })
}

async function fetchAllSources(maxPerSource = 5) {
  const sources = loadSources()
  console.log(`Loaded ${sources.length} sources from config`)

  const allArticles = []
  for (const source of sources) {
    const articles = await fetchSource(source, maxPerSource)
    allArticles.push(...articles)
  }

  console.log(`\nTotal articles fetched: ${allArticles.length}`)
  return allArticles
}

module.exports = {
  loadSources,
  fetchSource,
  fetchAllSources,
  htmlToText,
  extractImage,
  extractDescription,
  generateSlug,
  generateTags,
}
