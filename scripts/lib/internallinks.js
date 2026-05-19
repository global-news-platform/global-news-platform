/**
 * Automatic internal linking engine.
 * Scans article content and inserts relevant links to other articles
 * based on keyword overlap and category matching.
 */

const path = require("path")
const fs = require("fs")

const ARTICLES_DIR = path.join(__dirname, "..", "..", "src", "data", "articles")

function getAllArticleSlugs() {
  if (!fs.existsSync(ARTICLES_DIR)) return []
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""))
}

function findRelatedArticles(currentSlug, category, title, limit = 3) {
  const slugs = getAllArticleSlugs().filter((s) => s !== currentSlug)
  if (slugs.length === 0) return []

  const currentWords = new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3),
  )

  const scored = slugs
    .map((slug) => {
      const filePath = path.join(ARTICLES_DIR, `${slug}.mdx`)
      try {
        const content = fs.readFileSync(filePath, "utf-8")
        const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
        if (!fmMatch) return null

        const fm = {}
        for (const line of fmMatch[1].split("\n")) {
          const [k, ...v] = line.split(":")
          if (k && v.length) {
            fm[k.trim()] = v.join(":").trim().replace(/^["']|["']$/g, "")
          }
        }

        let score = 0
        if (fm.category && fm.category.toLowerCase() === category.toLowerCase()) {
          score += 10
        }

        const articleTitle = (fm.title || "").toLowerCase()
        for (const word of currentWords) {
          if (articleTitle.includes(word)) score += 2
        }

        return { slug, title: fm.title, score }
      } catch {
        return null
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return scored
}

function generateRelatedSection(currentSlug, category, title) {
  const related = findRelatedArticles(currentSlug, category, title)
  if (related.length === 0) return ""

  return `
## Related Stories

${related.map((r) => `- [${r.title}](/article/${r.slug})`).join("\n")}
`
}

module.exports = { findRelatedArticles, generateRelatedSection }
