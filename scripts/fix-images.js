#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const {
  downloadArticleImage,
  getFallbackForCategory,
  getKeywordFallback,
  verifyLocalImage,
  fetchOgImage,
} = require("./lib/imageDownloader")

const ARTICLES_DIR = path.join(__dirname, "../src/data/articles")
const ARTICLES_IMG_DIR = path.join(__dirname, "../public/images/articles")

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return null
  const fm = {}
  const lines = match[1].split("\n")
  for (const line of lines) {
    const eqIdx = line.indexOf(":")
    if (eqIdx === -1) continue
    const key = line.substring(0, eqIdx).trim()
    let value = line.substring(eqIdx + 1).trim()
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1)
    }
    if (value.startsWith("[")) {
      try {
        value = JSON.parse(value.replace(/'/g, '"'))
      } catch (e) {
        value = value
      }
    }
    fm[key] = value
  }
  return fm
}

function writeArticleMdx(filePath, fm, originalContent) {
  var tagsStr = ""
  if (Array.isArray(fm.tags)) {
    var quoted = []
    for (var i = 0; i < fm.tags.length; i++) {
      quoted.push('"' + fm.tags[i] + '"')
    }
    tagsStr = quoted.join(", ")
  } else {
    tagsStr = fm.tags || ""
  }

  var lines = []
  lines.push("---")
  lines.push('title: "' + escapeYaml(fm.title || "") + '"')
  lines.push('excerpt: "' + escapeYaml(fm.excerpt || "") + '"')
  lines.push('category: "' + (fm.category || "general") + '"')
  lines.push('author: "' + escapeYaml(fm.author || "") + '"')
  lines.push('authorSlug: "' + (fm.authorSlug || "") + '"')
  lines.push('publishedAt: "' + (fm.publishedAt || "") + '"')
  lines.push('image: "' + fm.image + '"')
  lines.push('imageAlt: "' + escapeYaml(fm.imageAlt || fm.title || "") + '"')
  lines.push("tags: [" + tagsStr + "]")
  lines.push("featured: " + (fm.featured || false))
  lines.push("breaking: " + (fm.breaking || false))
  lines.push("trending: " + (fm.trending || false))
  lines.push("---")
  lines.push("")

  var frontmatter = lines.join("\n")

  const bodyMatch = originalContent.match(/^---\n[\s\S]*?\n---\n\n([\s\S]*)$/)
  const body = bodyMatch ? bodyMatch[1] : originalContent
  fs.writeFileSync(filePath, frontmatter + body, "utf-8")
}

function escapeYaml(str) {
  if (!str) return ""
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, " ")
    .replace(/\r/g, " ")
    .trim()
}

function hasLocalArticleImage(slug) {
  var exts = [".jpg", ".jpeg", ".png", ".webp"]
  for (var i = 0; i < exts.length; i++) {
    var p = path.join(ARTICLES_IMG_DIR, slug + exts[i])
    if (fs.existsSync(p) && fs.statSync(p).size > 0) return true
  }
  return false
}

function findLocalArticleImagePath(slug) {
  var exts = [".jpg", ".jpeg", ".png", ".webp"]
  for (var i = 0; i < exts.length; i++) {
    var p = path.join(ARTICLES_IMG_DIR, slug + exts[i])
    if (fs.existsSync(p) && fs.statSync(p).size > 0) {
      return "/images/articles/" + slug + exts[i]
    }
  }
  return null
}

async function fixArticleImage(slug, fm, filePath) {
  const categorySlug = fm.category || "world"
  const title = fm.title || ""
  const currentImage = fm.image || ""

  var localImage = findLocalArticleImagePath(slug)
  if (localImage) {
    if (currentImage === localImage) {
      return { fixed: false, reason: "already-ok" }
    }
    fm.image = localImage
    writeArticleMdx(filePath, fm, fs.readFileSync(filePath, "utf-8"))
    return { fixed: true, reason: "path-fixed", image: localImage }
  }

  if (currentImage && currentImage.startsWith("/images/articles/")) {
    var imgPath = path.join(__dirname, "../public", currentImage)
    if (fs.existsSync(imgPath)) {
      return { fixed: false, reason: "already-ok" }
    }
  }

  var triedDownload = false

  if (!hasLocalArticleImage(slug)) {
    var sourceUrl = fm.sourceUrl || ""
    var ogImg = null

    if (sourceUrl) {
      triedDownload = true
      try {
        ogImg = await fetchOgImage(sourceUrl)
        if (ogImg) {
          var article = {
            slug: slug, title: title, sourceUrl: sourceUrl, ogImage: ogImg,
            imageUrl: ogImg, imageUrls: [ogImg],
            categorySlug: categorySlug, category: fm.category,
          }
          var result = await downloadArticleImage(article)
          if (result && result.path && !result.path.startsWith("/fallback/") && !result.path.startsWith("/images/categories/")) {
            fm.image = result.path
            writeArticleMdx(filePath, fm, fs.readFileSync(filePath, "utf-8"))
            return { fixed: true, reason: "og-image", image: result.path }
          }
        }
      } catch (e) {}
    }
  }

  if (triedDownload && hasLocalArticleImage(slug)) {
    localImage = findLocalArticleImagePath(slug)
    if (localImage) {
      fm.image = localImage
      writeArticleMdx(filePath, fm, fs.readFileSync(filePath, "utf-8"))
      return { fixed: true, reason: "downloaded", image: localImage }
    }
  }

  var kw = getKeywordFallback(title)
  if (kw) {
    var kwPath = path.join(__dirname, "../public", kw.image)
    if (fs.existsSync(kwPath)) {
      if (currentImage === kw.image) {
        return { fixed: false, reason: "keyword-ok" }
      }
      fm.image = kw.image
      writeArticleMdx(filePath, fm, fs.readFileSync(filePath, "utf-8"))
      return { fixed: true, reason: "keyword-fallback", image: kw.image }
    }
  }

  var fallback = getFallbackForCategory(categorySlug)
  var fbPath = path.join(__dirname, "../public", fallback)
  if (fs.existsSync(fbPath)) {
    if (currentImage === fallback) {
      return { fixed: false, reason: "fallback-ok" }
    }
    fm.image = fallback
    writeArticleMdx(filePath, fm, fs.readFileSync(filePath, "utf-8"))
    return { fixed: true, reason: "category-fallback", image: fallback }
  }

  var worldFallback = "/images/categories/world/default.jpg"
  fm.image = worldFallback
  writeArticleMdx(filePath, fm, fs.readFileSync(filePath, "utf-8"))
  return { fixed: true, reason: "default-fallback", image: worldFallback }
}

async function main() {
  console.log("=".repeat(60))
  console.log("  Image Fix Utility — Repairing article images")
  console.log("=".repeat(60))

  ensureDir(ARTICLES_IMG_DIR)

  if (!fs.existsSync(ARTICLES_DIR)) {
    console.log("No articles directory found.")
    return
  }

  var files = fs.readdirSync(ARTICLES_DIR).filter(function(f) { return f.endsWith(".mdx") })
  console.log("Found " + files.length + " articles to check\n")

  var stats = {
    total: files.length,
    fixed: 0,
    alreadyOk: 0,
    errors: 0,
    ogImage: 0,
    keywordFallback: 0,
    categoryFallback: 0,
    pathFixed: 0,
  }

  for (var i = 0; i < files.length; i++) {
    var file = files[i]
    var filePath = path.join(ARTICLES_DIR, file)
    var slug = file.replace(/\.mdx$/, "")
    var content = fs.readFileSync(filePath, "utf-8")
    var fm = parseFrontmatter(content)

    if (!fm) {
      console.log("  ! Could not parse: " + file)
      stats.errors++
      continue
    }

    var result = await fixArticleImage(slug, fm, filePath)

    if (result.reason === "already-ok" || result.reason === "fallback-ok" || result.reason === "keyword-ok" || result.reason === "valid-local") {
      stats.alreadyOk++
    }

    if (result.fixed) {
      stats.fixed++
      if (result.reason === "og-image" || result.reason === "downloaded") stats.ogImage++
      else if (result.reason === "keyword-fallback") stats.keywordFallback++
      else if (result.reason === "category-fallback" || result.reason === "default-fallback") stats.categoryFallback++
      else if (result.reason === "path-fixed") stats.pathFixed++

      var icon = "\u2713"
      console.log("  " + icon + " " + file.substring(0, 45) + " [" + result.reason + "]" + (result.image ? " -> " + result.image : ""))
    }
  }

  console.log("")
  console.log("=".repeat(60))
  console.log("  Summary")
  console.log("=".repeat(60))
  console.log("  Total articles:   " + stats.total)
  console.log("  Already OK:       " + stats.alreadyOk)
  console.log("  Fixed:            " + stats.fixed)
  console.log("    - Real images:  " + stats.ogImage)
  console.log("    - Keyword fb:   " + stats.keywordFallback)
  console.log("    - Category fb:  " + stats.categoryFallback)
  console.log("    - Path fixed:   " + stats.pathFixed)
  console.log("  Errors:           " + stats.errors)
  console.log("=".repeat(60))
}

main().catch(function(err) {
  console.error("Fix-images failed:", err)
  process.exit(1)
})
