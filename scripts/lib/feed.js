const fs = require("fs")
const path = require("path")

const ARTICLES_DIR = path.join(__dirname, "../../src/data/articles")
const PUBLIC_DIR = path.join(__dirname, "../../public")
const FEED_PATH = path.join(PUBLIC_DIR, "feed.xml")

const SITE_URL = process.env.SITE_URL || "https://the-global-lens-365.vercel.app"
const SITE_NAME = "The Global Lens 365"
const SITE_DESC = "Global news aggregation — breaking stories, analysis, and reports from around the world"

function getArticles(limit = 50) {
  if (!fs.existsSync(ARTICLES_DIR)) return []

  const files = fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .sort()
    .reverse()
    .slice(0, limit)

  return files.map((f) => {
    const content = fs.readFileSync(path.join(ARTICLES_DIR, f), "utf-8")
    const fm = parseFrontmatter(content)

    const bodyMatch = content.match(/^---[\s\S]*?---\s*\n([\s\S]*)$/)
    const body = bodyMatch ? bodyMatch[1].trim() : ""

    return {
      slug: f.replace(/\.mdx$/, ""),
      title: fm.title || "Untitled",
      excerpt: fm.excerpt || "",
      body: body.substring(0, 500),
      category: fm.category || "general",
      author: fm.author || "Staff",
      publishedAt: fm.publishedAt || new Date().toISOString(),
      image: fm.image || "",
      sourceName: fm.sourceName || "",
      sourceUrl: fm.sourceUrl || "",
    }
  })
}

function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/)
  if (!match) return {}

  const data = {}
  const lines = match[1].split("\n")
  for (const line of lines) {
    const idx = line.indexOf(":")
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    value = value.replace(/^["']|["']$/g, "")
    if (value === "true") value = true
    else if (value === "false") value = false
    data[key] = value
  }
  return data
}

function escapeXml(str) {
  if (!str) return ""
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function generateFeed() {
  const articles = getArticles(50)

  const items = articles
    .map(
      (a) => `  <item>
    <title>${escapeXml(a.title)}</title>
    <link>${SITE_URL}/article/${a.slug}</link>
    <guid isPermaLink="true">${SITE_URL}/article/${a.slug}</guid>
    <description>${escapeXml(a.excerpt)}</description>
    <category>${escapeXml(a.category)}</category>
    <author>${escapeXml(a.author)}</author>
    <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
    ${a.image ? `<enclosure url="${SITE_URL}${a.image}" type="image/jpeg" />` : ""}
    ${a.sourceName ? `<source url="${escapeXml(a.sourceUrl || SITE_URL)}">${escapeXml(a.sourceName)}</source>` : ""}
  </item>`,
    )
    .join("\n")

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESC)}</description>
    <language>en-us</language>
    <copyright>${new Date().getFullYear()} The Global Lens 365 — News summaries with attribution. All copyrights belong to respective owners.</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/images/logo.svg</url>
      <title>${escapeXml(SITE_NAME)}</title>
      <link>${SITE_URL}</link>
    </image>
${items}
  </channel>
</rss>`

  fs.mkdirSync(PUBLIC_DIR, { recursive: true })
  fs.writeFileSync(FEED_PATH, feed, "utf-8")
  console.log(`RSS feed generated: ${articles.length} items → ${FEED_PATH}`)

  return feed
}

if (require.main === module) {
  generateFeed()
}

module.exports = { generateFeed }
