#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const { tryDownload, resetBatchHashes } = require("./lib/imageDownloader")
const { searchImage } = require("./lib/imageSearch")

const ARTICLES_DIR = path.join(__dirname, "../src/data/articles")
const ARTICLES_IMG_DIR = path.join(__dirname, "../public/images/articles")

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return null
  const fm = {}
  for (const line of match[1].split("\n")) {
    const eqIdx = line.indexOf(":")
    if (eqIdx === -1) continue
    const key = line.substring(0, eqIdx).trim()
    let value = line.substring(eqIdx + 1).trim()
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
    if (value.startsWith("[")) {
      try { value = JSON.parse(value.replace(/'/g, '"')) } catch {}
    }
    fm[key] = value
  }
  return fm
}

function writeArticleMdx(filePath, fm, body) {
  let tagsStr = ""
  if (Array.isArray(fm.tags)) {
    tagsStr = fm.tags.map(t => `"${t}"`).join(", ")
  } else {
    tagsStr = fm.tags || ""
  }

  const lines = [
    "---",
    `title: "${escapeYaml(fm.title || "")}"`,
    `excerpt: "${escapeYaml(fm.excerpt || "")}"`,
    `category: "${fm.category || "general"}"`,
    `author: "${escapeYaml(fm.author || "")}"`,
    `authorSlug: "${fm.authorSlug || ""}"`,
    `publishedAt: "${fm.publishedAt || ""}"`,
    `image: "${fm.image}"`,
    `imageAlt: "${escapeYaml(fm.imageAlt || fm.title || "")}"`,
    `sourceUrl: "${escapeYaml(fm.sourceUrl || "")}"`,
    `tags: [${tagsStr}]`,
    `featured: ${fm.featured || false}`,
    `breaking: ${fm.breaking || false}`,
    `trending: ${fm.trending || false}`,
    "---",
    "",
    body
  ]
  fs.writeFileSync(filePath, lines.join("\n"), "utf-8")
}

function escapeYaml(str) {
  if (!str) return ""
  return String(str).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ").replace(/\r/g, " ").trim()
}

function hasLocalImage(slug) {
  for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
    const p = path.join(ARTICLES_IMG_DIR, slug + ext)
    if (fs.existsSync(p) && fs.statSync(p).size > 0) return true
  }
  return false
}

function findLocalImagePath(slug) {
  for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
    const p = path.join(ARTICLES_IMG_DIR, slug + ext)
    if (fs.existsSync(p) && fs.statSync(p).size > 0) {
      return "/images/articles/" + slug + ext
    }
  }
  return null
}

async function processArticle(filePath, slug) {
  const content = fs.readFileSync(filePath, "utf-8")
  const fm = parseFrontmatter(content)
  if (!fm) return { status: "error", reason: "parse-failed" }

  const bodyMatch = content.match(/^---\n[\s\S]*?\n---\n\n([\s\S]*)$/)
  const body = bodyMatch ? bodyMatch[1] : content

  if (hasLocalImage(slug)) {
    const localPath = findLocalImagePath(slug)
    if (localPath && fm.image !== localPath) {
      fm.image = localPath
      writeArticleMdx(filePath, fm, body)
      return { status: "fixed", reason: "path-corrected", image: localPath }
    }
    return { status: "skip", reason: "has-local-image" }
  }

  if (fm.image && fm.image.startsWith("/images/articles/")) {
    const imgPath = path.join(__dirname, "../public", fm.image)
    if (fs.existsSync(imgPath) && fs.statSync(imgPath).size > 0) {
      return { status: "skip", reason: "valid-image-path" }
    }
  }

  if (fm.image && fm.image.startsWith("/images/fallbacks/")) {
    const imgPath = path.join(__dirname, "../public", fm.image)
    if (fs.existsSync(imgPath) && fs.statSync(imgPath).size > 0) {
    } else {
      return { status: "skip", reason: "fallback-missing" }
    }
  }

  const title = fm.title || ""
  const categorySlug = fm.category || "world"

  const wikiResult = await searchImage(title)
  if (wikiResult && wikiResult.url) {
    const article = {
      slug,
      title,
      sourceUrl: fm.sourceUrl || "",
      ogImage: wikiResult.url,
      imageUrl: wikiResult.url,
      imageUrls: [wikiResult.url],
      categorySlug,
      category: fm.category,
    }
    const result = await tryDownload(slug, wikiResult.url, article)
    if (result && result.path && result.path.startsWith("/images/articles/")) {
      fm.image = result.path
      writeArticleMdx(filePath, fm, body)
      return { status: "fixed", reason: "wikipedia", image: result.path }
    }
  }

  if (hasLocalImage(slug)) {
    const localPath = findLocalImagePath(slug)
    if (localPath) {
      fm.image = localPath
      writeArticleMdx(filePath, fm, body)
      return { status: "fixed", reason: "downloaded-later", image: localPath }
    }
  }

  return { status: "unchanged", reason: "no-source" }
}

async function main() {
  console.log("=".repeat(60))
  console.log("  Wikipedia Image Fix — Replacing fallbacks with real images")
  console.log("=".repeat(60))

  if (!fs.existsSync(ARTICLES_DIR)) {
    console.log("No articles directory found.")
    return
  }

  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith(".mdx"))
  console.log(`Found ${files.length} articles\n`)

  const stats = { total: files.length, fixed: 0, skipped: 0, unchanged: 0, errors: 0 }
  const skipReasons = {}
  const fixReasons = {}

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const slug = file.replace(/\.mdx$/, "")
    const filePath = path.join(ARTICLES_DIR, file)

    const result = await processArticle(filePath, slug)

    if (result.status === "fixed") {
      stats.fixed++
      fixReasons[result.reason] = (fixReasons[result.reason] || 0) + 1
      console.log(`  ✓ ${file.substring(0, 50)} [${result.reason}] -> ${result.image}`)
    } else if (result.status === "skip") {
      stats.skipped++
      skipReasons[result.reason] = (skipReasons[result.reason] || 0) + 1
    } else if (result.status === "unchanged") {
      stats.unchanged++
    } else {
      stats.errors++
    }

    if (i > 0 && i % 20 === 0) {
      console.log(`  ... ${i}/${files.length} processed (${stats.fixed} fixed so far)`)
    }
  }

  console.log("\n" + "=".repeat(60))
  console.log("  Summary")
  console.log("=".repeat(60))
  console.log(`  Total articles:   ${stats.total}`)
  console.log(`  Fixed:            ${stats.fixed}`)
  for (const [reason, count] of Object.entries(fixReasons)) {
    console.log(`    - ${reason}: ${count}`)
  }
  console.log(`  Skipped:          ${stats.skipped}`)
  for (const [reason, count] of Object.entries(skipReasons)) {
    console.log(`    - ${reason}: ${count}`)
  }
  console.log(`  Unchanged:        ${stats.unchanged}`)
  console.log(`  Errors:           ${stats.errors}`)
  console.log("=".repeat(60))
}

main().catch(err => {
  console.error("Failed:", err)
  process.exit(1)
})
