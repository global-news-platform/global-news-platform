const fs = require("fs")
const path = require("path")
const { buildMdxContent } = require("./processor")

const ARTICLES_DIR = path.join(__dirname, "../../src/data/articles")

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function articleExists(slug) {
  if (!fs.existsSync(ARTICLES_DIR)) return false
  const files = fs.readdirSync(ARTICLES_DIR)
  const baseSlug = slug.replace(/--[a-f0-9]+$/i, "")
  return files.some((f) => {
    const name = f.replace(/\.(mdx|md)$/, "")
    const fileBase = name.replace(/--[a-f0-9]+$/i, "")
    return fileBase === baseSlug || name === slug
  })
}

function writeArticle(article) {
  ensureDir(ARTICLES_DIR)

  if (articleExists(article.slug)) {
    console.log(`  \u2717 Skipped (duplicate): ${article.title.substring(0, 60)}`)
    return false
  }

  const mdxContent = buildMdxContent(article)
  const filePath = path.join(ARTICLES_DIR, `${article.slug}.mdx`)

  try {
    fs.writeFileSync(filePath, mdxContent, "utf-8")
    const imgMatch = mdxContent.match(/image: "([^"]+)"/)
    const imgInfo = imgMatch ? imgMatch[1] : "no image"
    console.log(`  \u2713 ${article.title.substring(0, 60)} [${imgInfo}]`)
    return true
  } catch (err) {
    console.error(`  \u2717 Failed to write ${article.slug}: ${err.message}`)
    return false
  }
}

function writeAllArticles(articles) {
  ensureDir(ARTICLES_DIR)

  let written = 0
  let skipped = 0
  let failed = 0

  for (const article of articles) {
    if (articleExists(article.slug)) {
      skipped++
      continue
    }
    const result = writeArticle(article)
    if (result) written++
    else failed++
  }

  return { written, skipped, failed }
}

function getArticleCount() {
  if (!fs.existsSync(ARTICLES_DIR)) return 0
  return fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".mdx")).length
}

module.exports = {
  writeArticle,
  writeAllArticles,
  articleExists,
  getArticleCount,
  ensureDir,
}
