const RssParser = require("rss-parser")
const fs = require("fs")
const path = require("path")

const parser = new RssParser({
  timeout: 15000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (compatible; GlobalNewsBot/1.0; +https://pakistan-news.news)",
  },
  customFields: {
    item: [
      ["media:content", "media:content"],
      ["media:thumbnail", "media:thumbnail"],
      ["media:group", "media:group"],
    ],
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

function extractOgImage(item) {
  const content = item["content:encoded"] || item.content || ""

  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match && match[1]) {
      try {
        new URL(match[1])
        return match[1]
      } catch {
        continue
      }
    }
  }

  return null
}

function extractImages(item) {
  const urls = []

  if (item.enclosure && item.enclosure.url) {
    urls.push(item.enclosure.url)
  }

  if (item["media:content"]) {
    if (item["media:content"].$ && item["media:content"].$.url) {
      urls.push({ url: item["media:content"].$.url, type: "media:content" })
    }
    if (Array.isArray(item["media:content"])) {
      for (const mc of item["media:content"]) {
        if (mc.$ && mc.$.url) {
          urls.push({ url: mc.$.url, type: "media:content" })
        }
      }
    }
  }

  if (item["media:thumbnail"] && item["media:thumbnail"].$) {
    urls.push({ url: item["media:thumbnail"].$.url, type: "media:thumbnail" })
  }

  if (item["media:group"] && item["media:group"]["media:content"]) {
    const mc = item["media:group"]["media:content"]
    if (Array.isArray(mc)) {
      for (const m of mc) {
        if (m.$ && m.$.url) urls.push({ url: m.$.url, type: "media:group" })
      }
    } else if (mc.$ && mc.$.url) {
      urls.push({ url: mc.$.url, type: "media:group" })
    }
  }

  const ogImage = extractOgImage(item)
  if (ogImage) {
    urls.push({ url: ogImage, type: "og:image" })
  }

  const content = item["content:encoded"] || item.content || ""
  const imgMatches = content.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)
  for (const match of imgMatches) {
    if (match[1]) {
      try {
        new URL(match[1])
        urls.push({ url: match[1], type: "content-img" })
      } catch {
        continue
      }
    }
  }

  const uniqueUrls = [...new Set(urls.map((u) => u.url))]
  const valid = uniqueUrls.filter((u) => {
    try {
      const parsed = new URL(u)
      return parsed.protocol === "http:" || parsed.protocol === "https:"
    } catch {
      return false
    }
  })

  return valid
}

function extractImage(item) {
  const images = extractImages(item)
  if (images.length === 0) return null

  const ogImage = extractOgImage(item)
  if (ogImage) return ogImage

  for (const url of images) {
    const u = url.toLowerCase()
    if (u.includes("featured") || u.includes("large") || u.includes("hero")) {
      return url
    }
  }

  return images[0]
}

function extractImageUrls(item) {
  return extractImages(item)
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
    const ogImage = extractOgImage(item)
    const imageUrl = extractImage(item)
    const imageUrls = extractImageUrls(item)
    const slug = generateSlug(title)

    return {
      source: label,
      sourceUrl: item.link || "",
      slug,
      title,
      description: description.substring(0, 300),
      content: description,
      category,
      categorySlug: category,
      ogImage,
      imageUrl: ogImage || imageUrl,
      imageUrls,
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
  extractImages,
  extractImageUrls,
  extractOgImage,
  extractDescription,
  generateSlug,
  generateTags,
}
