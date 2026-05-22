const fs = require("fs")
const path = require("path")

const ARTICLES_DIR = path.join(__dirname, "../../src/data/articles")
const PUBLIC_DIR = path.join(__dirname, "../../public")
const SITEMAP_PATH = path.join(PUBLIC_DIR, "sitemap.xml")

const SITE_URL = process.env.SITE_URL || "https://pakistan-news.news"

const staticPages = [
  { url: "/", priority: 1.0, changefreq: "hourly" },
  { url: "/breaking", priority: 0.9, changefreq: "hourly" },
  { url: "/search", priority: 0.6, changefreq: "weekly" },
  { url: "/about-us", priority: 0.5, changefreq: "monthly" },
  { url: "/privacy-policy", priority: 0.3, changefreq: "monthly" },
]

const categories = [
  "pakistan", "dunya", "siasat", "karobar", "technology",
  "khel", "sehat", "science", "shobiz", "mazhab",
  "taleem", "mausam", "crime", "adalat", "baynalaqwami",
  "videos", "raye", "general",
]

function getArticleSlugs() {
  if (!fs.existsSync(ARTICLES_DIR)) return []
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => f.replace(/\.(md|mdx)$/, ""))
}

function generateSitemap() {
  const slugs = getArticleSlugs()

  const urls = []

  for (const page of staticPages) {
    urls.push(`  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <priority>${page.priority}</priority>
    <changefreq>${page.changefreq}</changefreq>
  </url>`)
  }

  for (const cat of categories) {
    urls.push(`  <url>
    <loc>${SITE_URL}/category/${cat}</loc>
    <priority>0.8</priority>
    <changefreq>hourly</changefreq>
  </url>`)
  }

  for (const slug of slugs) {
    urls.push(`  <url>
    <loc>${SITE_URL}/article/${slug}</loc>
    <priority>0.7</priority>
    <changefreq>daily</changefreq>
  </url>`)
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join("\n")}
</urlset>`

  fs.mkdirSync(PUBLIC_DIR, { recursive: true })
  fs.writeFileSync(SITEMAP_PATH, sitemap, "utf-8")
  console.log(`Sitemap generated: ${urls.length} URLs → ${SITEMAP_PATH}`)

  return sitemap
}

if (require.main === module) {
  generateSitemap()
}

module.exports = { generateSitemap }
