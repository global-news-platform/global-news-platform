const fs = require("fs")
const path = require("path")
const { buildMdxContent } = require("./processor")

const ARTICLES_DIR = path.join(__dirname, "../../src/data/articles")

const MAX_ARTICLES = 2000
const EXCERPT_SIMILARITY_THRESHOLD = 0.6

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function getBaseSlug(slug) {
  return slug.replace(/--[a-z0-9]+$/i, "")
}

function articleExists(slug) {
  if (!fs.existsSync(ARTICLES_DIR)) return false
  const files = fs.readdirSync(ARTICLES_DIR)
  const baseSlug = getBaseSlug(slug)
  return files.some((f) => {
    const name = f.replace(/\.(mdx|md)$/, "")
    const fileBase = getBaseSlug(name)
    return fileBase === baseSlug || name === slug
  })
}

function cosineSimilarity(a, b) {
  const wordsA = a.split(/\s+/).filter(Boolean)
  const wordsB = b.split(/\s+/).filter(Boolean)
  if (wordsA.length === 0 || wordsB.length === 0) return 0
  const freqA = {}
  const freqB = {}
  for (const w of wordsA) freqA[w] = (freqA[w] || 0) + 1
  for (const w of wordsB) freqB[w] = (freqB[w] || 0) + 1
  const allWords = new Set([...Object.keys(freqA), ...Object.keys(freqB)])
  let dot = 0, magA = 0, magB = 0
  for (const w of allWords) {
    const a = freqA[w] || 0
    const b = freqB[w] || 0
    dot += a * b
    magA += a * a
    magB += b * b
  }
  if (magA === 0 || magB === 0) return 0
  return dot / (Math.sqrt(magA) * Math.sqrt(magB))
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function isDuplicateByTitle(title) {
  if (!fs.existsSync(ARTICLES_DIR)) return false
  const files = fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".mdx"))
  const normalized = normalizeText(title)

  for (const file of files) {
    const content = fs.readFileSync(path.join(ARTICLES_DIR, file), "utf-8")
    const titleMatch = content.match(/^title:\s*"(.+)"\s*$/m)
    if (titleMatch) {
      const existingTitle = normalizeText(titleMatch[1])
      if (cosineSimilarity(normalized, existingTitle) > EXCERPT_SIMILARITY_THRESHOLD) {
        return true
      }
    }
  }
  return false
}

function trimExcessArticles() {
  if (!fs.existsSync(ARTICLES_DIR)) return
  const files = fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => ({
      name: f,
      mtime: fs.statSync(path.join(ARTICLES_DIR, f)).mtime,
    }))
    .sort((a, b) => b.mtime - a.mtime)

  if (files.length > MAX_ARTICLES) {
    const toRemove = files.slice(MAX_ARTICLES)
    for (const file of toRemove) {
      fs.unlinkSync(path.join(ARTICLES_DIR, file.name))
      const imgPath = path.join(
        __dirname,
        "../../public/images/articles",
        file.name.replace(/\.mdx$/, ".jpg")
      )
      if (fs.existsSync(imgPath)) {
        try { fs.unlinkSync(imgPath) } catch {}
      }
    }
    console.log(`  Trimmed ${toRemove.length} old articles (max ${MAX_ARTICLES})`)
  }
}

async function writeArticle(article) {
  ensureDir(ARTICLES_DIR)

  if (articleExists(article.slug)) {
    console.log(`  \u2717 Skipped (slug duplicate): ${article.title.substring(0, 60)}`)
    return false
  }

  if (isDuplicateByTitle(article.title)) {
    console.log(`  \u2717 Skipped (title similarity): ${article.title.substring(0, 60)}`)
    return false
  }

  const mdxContent = await buildMdxContent(article)
  const filePath = path.join(ARTICLES_DIR, `${article.slug}.mdx`)

  try {
    fs.writeFileSync(filePath, mdxContent, "utf-8")
    console.log(`  \u2713 ${article.title.substring(0, 60)}`)
    return true
  } catch (err) {
    console.error(`  \u2717 Failed to write ${article.slug}: ${err.message}`)
    return false
  }
}

async function writeAllArticles(articles) {
  ensureDir(ARTICLES_DIR)
  trimExcessArticles()

  let written = 0
  let skipped = 0
  let failed = 0

  for (const article of articles) {
    if (articleExists(article.slug)) {
      skipped++
      continue
    }
    if (isDuplicateByTitle(article.title)) {
      skipped++
      continue
    }
    const result = await writeArticle(article)
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
