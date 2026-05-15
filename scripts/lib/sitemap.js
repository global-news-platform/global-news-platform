/**
 * Standalone sitemap.xml generator.
 * Reads MDX articles from src/data/articles/ and writes to public/sitemap.xml.
 * This can run without a full Next.js build for fast iteration.
 */

const fs = require("fs")
const path = require("path")

const ROOT = path.join(__dirname, "..", "..")
const SRC_ARTICLES = path.join(ROOT, "src", "data", "articles")
const PUBLIC = path.join(ROOT, "public")

const SITE_URL = process.env.SITE_URL || "https://globalnews.news"

const CATEGORIES = [
  "world","politics","business","technology","science","health",
  "climate","culture","sports","opinion",
]

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
        if (k && v.length) {
          fm[k.trim()] = v.join(":").trim().replace(/^["']|["']$/g, "")
        }
      }
      const imageMatch = content.match(/^image:\s*["']?([^"'\n]+)["']?$/m)
      return {
        slug: f.replace(/\.mdx$/, ""),
        publishedAt: fm.publishedAt || "",
        image: imageMatch ? imageMatch[1] : null,
      }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
}

function escXml(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")
}

function generate() {
  const articles = getArticles()
  const now = new Date().toISOString()

  const urls = [
    { loc: SITE_URL, lastmod: articles[0]?.publishedAt || now, freq: "hourly", pri: "1.0" },
    { loc: `${SITE_URL}/breaking`, lastmod: now, freq: "hourly", pri: "0.9" },
    ...CATEGORIES.map(c => ({
      loc: `${SITE_URL}/category/${c}`,
      lastmod: now,
      freq: "daily",
      pri: "0.7",
    })),
    ...articles.map(a => ({
      loc: `${SITE_URL}/article/${a.slug}`,
      lastmod: a.publishedAt || now,
      freq: "weekly",
      pri: "0.8",
      images: a.image ? [`${SITE_URL}${a.image}`] : [],
    })),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls.map(u => {
  const imgs = (u.images || []).map(i => `\n    <image:image><image:loc>${escXml(i)}</image:loc></image:image>`).join("")
  return `  <url>
    <loc>${escXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.pri}</priority>${imgs}
  </url>`
}).join("\n")}
</urlset>`

  const outPath = path.join(PUBLIC, "sitemap.xml")
  if (!fs.existsSync(PUBLIC)) fs.mkdirSync(PUBLIC, { recursive: true })
  fs.writeFileSync(outPath, xml, "utf-8")
  return { count: urls.length, file: outPath }
}

module.exports = { generate }

if (require.main === module) {
  const result = generate()
  console.log(`Generated sitemap: ${result.count} URLs → ${result.file}`)
}
