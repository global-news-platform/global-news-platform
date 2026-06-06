const RssParser = require("rss-parser")
const fs = require("fs")
const path = require("path")

const parser = new RssParser({
  timeout: 15000,
  headers: {
    "User-Agent":
      "PakistanNewsHub/2.0 (news aggregator; +https://pakistan-news.news; bot@pakistan-news.news)",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
    "Accept-Language": "en,ur",
  },
  customFields: {
    item: [
      ["media:content", "media:content"],
      ["media:thumbnail", "media:thumbnail"],
    ],
  },
})

const SOURCES_PATH = path.join(__dirname, "../config/sources.json")
const MAX_DESCRIPTION_LENGTH = 250
const MIN_DESCRIPTION_LENGTH = 20

const FETCH_INTERVAL_MS = 1200

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

function extractDescription(item) {
  const content = item.contentSnippet || item.content || item.description || ""
  const cleaned = htmlToText(content)
  if (cleaned.length > MAX_DESCRIPTION_LENGTH) {
    const truncated = cleaned.slice(0, MAX_DESCRIPTION_LENGTH)
    const lastPeriod = truncated.lastIndexOf(".")
    const lastSpace = truncated.lastIndexOf(" ")
    if (lastPeriod > MAX_DESCRIPTION_LENGTH * 0.5) {
      return truncated.slice(0, lastPeriod + 1)
    } else if (lastSpace > 0) {
      return truncated.slice(0, lastSpace) + "..."
    }
    return truncated + "..."
  }
  return cleaned.length >= MIN_DESCRIPTION_LENGTH ? cleaned : ""
}

function extractImage(item) {
  if (item.enclosure && item.enclosure.url) return item.enclosure.url

  if (item["media:content"]) {
    if (item["media:content"].$ && item["media:content"].$.url)
      return item["media:content"].$.url
    if (Array.isArray(item["media:content"])) {
      for (const mc of item["media:content"]) {
        if (mc.$ && mc.$.url) return mc.$.url
      }
    }
  }

  if (item["media:thumbnail"] && item["media:thumbnail"].$)
    return item["media:thumbnail"].$.url

  const content = item["content:encoded"] || item.content || ""
  const ogPatterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ]
  for (const pattern of ogPatterns) {
    const match = content.match(pattern)
    if (match && match[1]) {
      try { new URL(match[1]); return match[1] } catch { continue }
    }
  }

  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (imgMatch && imgMatch[1]) {
    try { new URL(imgMatch[1]); return imgMatch[1] } catch {}
  }

  return null
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
    "pakistan", "imran khan", "nawaz sharif", "lahore", "karachi", "islamabad",
    "iran", "ukraine", "russia", "china", "india", "afghanistan",
    "cricket", "football", "hockey", "psl", "world cup",
    "economy", "inflation", "stock market", "rupee", "imf",
    "ai", "artificial intelligence", "technology", "digital",
    "climate", "environment", "energy", "oil", "gas",
    "election", "vote", "campaign", "parliament", "senate",
    "health", "vaccine", "hospital", "disease",
    "education", "school", "university", "student",
    "crime", "police", "court", "justice", "supreme court",
    "terrorism", "security", "defence", "army",
    "trade", "tariff", "business", "market",
  ]

  const tags = []
  for (const keyword of tagKeywords) {
    if (words.includes(keyword)) {
      tags.push(keyword)
    }
  }

  const categoryMap = {
    pakistan: "pakistan", dunya: "world", siasat: "politics",
    karobar: "business", technology: "technology", khel: "sports",
    sehat: "health", science: "science", shobiz: "entertainment",
    raye: "opinion",
  }
  const catTag = categoryMap[category]
  if (catTag && !tags.includes(catTag)) tags.push(catTag)

  return [...new Set(tags)].slice(0, 6)
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchSource(source, maxPerSource = 5) {
  const { url, category, label, attribution, attributionUrl } = source
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
      attribution: attribution || label,
      attributionUrl: attributionUrl || "",
      canonicalUrl: item.link || "",
      slug,
      title,
      description: description || title.substring(0, 120),
      content: description || title.substring(0, 120),
      category,
      categorySlug: category,
      imageUrl,
      publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
      tags: generateTags(title, description, category),
      guid: item.guid || item.link || slug,
      isSummary: true,
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
    await sleep(FETCH_INTERVAL_MS)
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
