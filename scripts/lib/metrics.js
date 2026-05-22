const fs = require("fs")
const path = require("path")

const ARTICLES_DIR = path.join(__dirname, "../../src/data/articles")
const METRICS_PATH = path.join(__dirname, "../../src/data/metrics.json")

function getAllArticles() {
  if (!fs.existsSync(ARTICLES_DIR)) return []
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const filePath = path.join(ARTICLES_DIR, f)
      const content = fs.readFileSync(filePath, "utf-8")
      const frontmatter = parseFrontmatter(content)
      return {
        slug: f.replace(/\.mdx$/, ""),
        ...frontmatter,
        fileSize: fs.statSync(filePath).size,
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

    if (value.startsWith("[") && value.endsWith("]")) {
      try {
        value = JSON.parse(value.replace(/'/g, '"'))
      } catch {
        value = value.slice(1, -1).split(",").map((s) => s.trim().replace(/['"]/g, ""))
      }
    } else if (value === "true") value = true
    else if (value === "false") value = false
    else value = value.replace(/^["']|["']$/g, "")

    data[key] = value
  }
  return data
}

function computeDailyMetrics() {
  const articles = getAllArticles()
  const today = new Date().toISOString().split("T")[0]

  const categoryCount = {}
  for (const article of articles) {
    const cat = article.category || "uncategorized"
    categoryCount[cat] = (categoryCount[cat] || 0) + 1
  }

  const metrics = {
    date: today,
    totalArticles: articles.length,
    totalSizeKb: Math.round(
      articles.reduce((sum, a) => sum + (a.fileSize || 0), 0) / 1024,
    ),
    categories: categoryCount,
    topCategories: Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count })),
  }

  fs.writeFileSync(METRICS_PATH, JSON.stringify(metrics, null, 2), "utf-8")
  console.log(`Metrics written: ${metrics.totalArticles} articles across ${Object.keys(categoryCount).length} categories`)

  return metrics
}

function computeTrending(limit = 20) {
  const articles = getAllArticles()

  const scored = articles.map((a) => {
    let score = 0
    if (a.breaking) score += 10
    if (a.featured) score += 5
    if (a.trending) score += 3
    if (a.publishedAt) {
      const age = (Date.now() - new Date(a.publishedAt).getTime()) / 3600000
      score += Math.max(0, 48 - age) / 48 * 10
    }
    return { ...a, score }
  })

  scored.sort((a, b) => b.score - a.score)

  const trending = scored.slice(0, limit).map((a) => ({
    slug: a.slug,
    title: a.title,
    category: a.category,
    score: Math.round(a.score * 10) / 10,
  }))

  const trendingPath = path.join(__dirname, "../../src/data/trending.json")
  fs.writeFileSync(trendingPath, JSON.stringify(trending, null, 2), "utf-8")
  console.log(`Trending computed: top ${trending.length} articles`)

  return trending
}

module.exports = {
  computeDailyMetrics,
  computeTrending,
  getAllArticles,
}
