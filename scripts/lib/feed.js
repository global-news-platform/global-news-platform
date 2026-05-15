/**
 * Standalone RSS feed.xml generator.
 * Reads MDX articles and writes to public/feed.xml.
 */

const fs = require("fs")
const path = require("path")

const ROOT = path.join(__dirname, "..", "..")
const SRC_ARTICLES = path.join(ROOT, "src", "data", "articles")
const PUBLIC = path.join(ROOT, "public")

const SITE_URL = process.env.SITE_URL || "https://globalnews.news"
const SITE_NAME = "Global News"
const SITE_DESC = "Global News delivers comprehensive, trusted coverage of world events, business, technology, politics, and culture."

function getArticles() {
  if (!fs.existsSync(SRC_ARTICLES)) return []
  return fs.readdirSync(SRC_ARTICLES)
    .filter(f => f.endsWith(".mdx"))
    .map(f => {
      const content = fs.readFileSync(path.join(SRC_ARTICLES, f), "utf-8")
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
      if (!fmMatch) return null
      const fm = {}
      for (const line of fmMatch[1].split("\n")) {
        const [k, ...v] = line.split(":")
        if (k && v.length) fm[k.trim()] = v.join(":").trim().replace(/^["']|["']$/g, "")
      }
      const body = content.replace(/^---\n[\s\S]*?\n---\n\n?/, "")
      const excerptMatch = content.match(/^excerpt:\s*["']([^"']+)["']$/m)
      const tagsMatch = content.match(/^tags:\s*\[([^\]]+)\]/m)
      return {
        slug: f.replace(/\.mdx$/, ""),
        title: fm.title || "",
        excerpt: excerptMatch ? excerptMatch[1] : body.slice(0, 200),
        author: fm.author || "Staff",
        category: fm.category || "General",
        publishedAt: fm.publishedAt || "",
        image: fm.image || "",
      }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
}

function esc(s) {
  return String(s)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&apos;")
}

function generate() {
  const articles = getArticles()

  const items = articles.map(a => `
    <item>
      <title>${esc(a.title)}</title>
      <link>${SITE_URL}/article/${a.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/article/${a.slug}</guid>
      <description>${esc(a.excerpt)}</description>
      <author>${esc(a.author)}</author>
      <category>${esc(a.category)}</category>
      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
      ${a.image ? `<media:content xmlns:media="http://search.yahoo.com/mrss/" url="${SITE_URL}${esc(a.image)}" medium="image" />` : ""}
    </item>`).join("")

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${esc(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${esc(SITE_DESC)}</description>
    <language>en-US</language>
    <copyright>Copyright ${new Date().getFullYear()} ${esc(SITE_NAME)}. All rights reserved.</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <image>
      <url>${SITE_URL}/images/og-default.jpg</url>
      <title>${esc(SITE_NAME)}</title>
      <link>${SITE_URL}</link>
    </image>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  const outPath = path.join(PUBLIC, "feed.xml")
  if (!fs.existsSync(PUBLIC)) fs.mkdirSync(PUBLIC, { recursive: true })
  fs.writeFileSync(outPath, rss, "utf-8")
  return { count: articles.length, file: outPath }
}

module.exports = { generate }

if (require.main === module) {
  const result = generate()
  console.log(`Generated RSS feed: ${result.count} items → ${result.file}`)
}
