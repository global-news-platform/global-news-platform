const fs = require("fs")
const path = require("path")

const ARTICLES_DIR = path.join(__dirname, "..", "..", "src", "data", "articles")

function write(slug, content) {
  if (!fs.existsSync(ARTICLES_DIR)) fs.mkdirSync(ARTICLES_DIR, { recursive: true })

  const filePath = path.join(ARTICLES_DIR, `${slug}.mdx`)
  if (fs.existsSync(filePath)) return false

  fs.writeFileSync(filePath, content, "utf-8")
  return true
}

function exists(slug) {
  return fs.existsSync(path.join(ARTICLES_DIR, `${slug}.mdx`))
}

function count() {
  if (!fs.existsSync(ARTICLES_DIR)) return 0
  return fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith(".mdx")).length
}

module.exports = { write, exists, count }
