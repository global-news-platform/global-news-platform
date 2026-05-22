const fs = require("fs")
const path = require("path")
const https = require("https")
const http = require("http")
const { URL } = require("url")

let sharp
try {
  sharp = require("sharp")
} catch {
  sharp = null
}

const IMAGES_DIR = path.join(__dirname, "../../public/images/articles")
const FALLBACKS_DIR = path.join(__dirname, "../../public/images/fallbacks")
const TIMEOUT = 10000
const MAX_RETRIES = 1
const MAX_FILE_SIZE = 5 * 1024 * 1024
const VALID_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"])

const CATEGORY_MAP = {
  pakistan: "pakistan",
  dunya: "world",
  siasat: "politics",
  karobar: "business",
  technology: "technology",
  khel: "sports",
  sehat: "health",
  science: "science",
  shobiz: "entertainment",
  mazhab: "pakistan",
  taleem: "technology",
  mausam: "world",
  crime: "world",
  adalat: "politics",
  baynalaqwami: "world",
  videos: "technology",
  raye: "politics",
  general: "world",
}

function getFallbackSlug(categorySlug) {
  return CATEGORY_MAP[categorySlug] || "world"
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function getExtension(urlString) {
  try {
    const url = new URL(urlString)
    const ext = path.extname(url.pathname).split("?")[0].toLowerCase()
    if (VALID_EXTENSIONS.has(ext)) return ext
  } catch {}
  return ".jpg"
}

function fetchUrl(urlString) {
  return new Promise((resolve, reject) => {
    let url
    try {
      url = new URL(urlString)
    } catch {
      reject(new Error("Invalid URL"))
      return
    }

    const protocol = url.protocol === "https:" ? https : http
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: url.pathname + url.search,
      method: "GET",
      timeout: TIMEOUT,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/webp,image/avif,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      rejectUnauthorized: false,
    }

    const req = protocol.request(options, (response) => {
      if (
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        const redirectUrl = new URL(response.headers.location, urlString)
        req.destroy()
        fetchUrl(redirectUrl.href).then(resolve).catch(reject)
        return
      }

      if (response.statusCode !== 200) {
        req.destroy()
        reject(new Error(`HTTP ${response.statusCode}`))
        return
      }

      const contentType = response.headers["content-type"]
      if (contentType && !contentType.startsWith("image/")) {
        req.destroy()
        reject(new Error(`Not an image: ${contentType}`))
        return
      }

      const chunks = []
      let totalSize = 0

      response.on("data", (chunk) => {
        totalSize += chunk.length
        if (totalSize > MAX_FILE_SIZE) {
          req.destroy()
          response.destroy()
          reject(new Error("File too large"))
          return
        }
        chunks.push(chunk)
      })

      response.on("end", () => {
        const buffer = Buffer.concat(chunks)
        if (buffer.length === 0) {
          reject(new Error("Empty response"))
          return
        }
        resolve(buffer)
      })

      response.on("error", (err) => {
        req.destroy()
        reject(err)
      })
    })

    req.on("error", reject)
    req.on("timeout", () => {
      req.destroy()
      reject(new Error("Timeout"))
    })

    req.end()
  })
}

async function optimizeImage(buffer, outputPath) {
  if (sharp) {
    try {
      await sharp(buffer)
        .resize(1200, 800, {
          fit: "cover",
          position: "center",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85, mozjpeg: true })
        .toFile(outputPath)
      return true
    } catch (err) {
      fs.writeFileSync(outputPath, buffer)
      return true
    }
  } else {
    fs.writeFileSync(outputPath, buffer)
    return true
  }
}

async function tryDownloadUrl(imageUrl, destination) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, 1000 * attempt))
    }
    try {
      const buffer = await fetchUrl(imageUrl)
      await optimizeImage(buffer, destination)
      const stats = fs.statSync(destination)
      if (stats.size === 0) {
        fs.unlinkSync(destination)
        throw new Error("Zero-byte file")
      }
      return true
    } catch (err) {
      if (fs.existsSync(destination)) {
        try { fs.unlinkSync(destination) } catch {}
      }
      if (attempt === MAX_RETRIES) throw err
    }
  }
  return false
}

function getFallbackPath(categorySlug) {
  const fallbackSlug = getFallbackSlug(categorySlug)
  const fallbackFile = path.join(FALLBACKS_DIR, `${fallbackSlug}.jpg`)
  if (fs.existsSync(fallbackFile)) {
    return `/images/fallbacks/${fallbackSlug}.jpg`
  }
  const generalFallback = path.join(FALLBACKS_DIR, "world.jpg")
  if (fs.existsSync(generalFallback)) {
    return "/images/fallbacks/world.jpg"
  }
  return null
}

async function downloadArticleImage(slug, imageUrls, categorySlug) {
  ensureDir(IMAGES_DIR)

  const filename = `${slug}.jpg`
  const destination = path.join(IMAGES_DIR, filename)

  if (fs.existsSync(destination)) {
    const stats = fs.statSync(destination)
    if (stats.size > 0) {
      return { path: `/images/articles/${filename}`, source: "cached" }
    }
  }

  if (!imageUrls || imageUrls.length === 0) {
    return { path: getFallbackPath(categorySlug), source: "fallback" }
  }

  for (const imageUrl of imageUrls) {
    if (!imageUrl) continue
    try {
      await tryDownloadUrl(imageUrl, destination)
      const stats = fs.statSync(destination)
      console.log(`  \u2713 Downloaded image: ${filename} (${(stats.size / 1024).toFixed(1)}KB)`)
      return { path: `/images/articles/${filename}`, source: "downloaded" }
    } catch (err) {
      console.log(`  ~ Failed URL for ${slug}: ${err.message}`)
    }
  }

  const fallbackPath = getFallbackPath(categorySlug)
  if (fallbackPath) {
    console.log(`  \u2713 Using fallback image for: ${slug} (${getFallbackSlug(categorySlug)})`)
  }
  return { path: fallbackPath, source: "fallback" }
}

async function downloadAllImages(articles) {
  let downloaded = 0
  let fallback = 0
  let skipped = 0

  const results = {}

  for (const article of articles) {
    const slug = article.slug
    const categorySlug = article.categorySlug || article.category || "general"
    const imageUrls = article.imageUrls || (article.imageUrl ? [article.imageUrl] : [])

    const result = await downloadArticleImage(slug, imageUrls, categorySlug)
    results[slug] = result.path

    if (result.source === "downloaded") downloaded++
    else if (result.source === "fallback") fallback++
    else skipped++
  }

  return { downloaded, fallback, skipped, results }
}

function validateArticleImages(articles, imageResults) {
  const missing = []

  for (const article of articles) {
    const imagePath = imageResults[article.slug]
    if (!imagePath) {
      missing.push(article.slug)
      continue
    }

    if (imagePath.startsWith("/images/fallbacks/")) {
      continue
    }

    if (imagePath.startsWith("/images/articles/")) {
      const localPath = path.join(__dirname, "../../public", imagePath)
      if (!fs.existsSync(localPath)) {
        missing.push(article.slug)
      }
    }
  }

  return missing
}

module.exports = {
  downloadArticleImage,
  downloadAllImages,
  validateArticleImages,
  getFallbackPath,
}
