const fs = require("fs")
const path = require("path")
const http = require("http")
const https = require("https")
const crypto = require("crypto")

const ARTICLES_DIR = path.join(__dirname, "../../public/images/articles")
const FALLBACK_DIR = path.join(__dirname, "../../public/fallback")
const CATEGORY_POOL_DIR = path.join(__dirname, "../../public/images/categories")

const FALLBACK_IMAGES = {
  pakistan: "pakistan.jpg",
  world: "world.jpg",
  politics: "politics.jpg",
  business: "business.jpg",
  sports: "sports.jpg",
  technology: "technology.jpg",
  science: "science.jpg",
  health: "health.jpg",
  entertainment: "entertainment.jpg",
}

const KEYWORD_FALLBACK_MAP = {
  cricket: "sports", football: "sports", soccer: "sports",
  nba: "sports", nfl: "sports", tennis: "sports", golf: "sports",
  premier: "sports", champion: "sports", olympic: "sports",
  "premier league": "sports", "champions league": "sports",
  parliament: "politics", congress: "politics", senate: "politics",
  election: "politics", president: "politics", vote: "politics",
  government: "politics", political: "politics", supreme: "politics",
  ai: "technology", "artificial intelligence": "technology",
  google: "technology", openai: "technology", chatbot: "technology",
  robot: "technology", cyber: "technology", software: "technology",
  tech: "technology", startup: "technology", digital: "technology",
  data: "technology", app: "technology", computer: "technology",
  hospital: "health", doctor: "health", health: "health",
  disease: "health", vaccine: "health", drug: "health",
  cancer: "health", medical: "health", patient: "health",
  stock: "business", market: "business", economy: "business",
  inflation: "business", trade: "business", tariff: "business",
  bank: "business", oil: "business", price: "business",
  business: "business", company: "business",
  climate: "science", environment: "science", space: "science",
  nasa: "science", planet: "science", research: "science",
  film: "entertainment", movie: "entertainment", music: "entertainment",
  celebrity: "entertainment", star: "entertainment",
  actor: "entertainment", actress: "entertainment",
  iran: "world", russia: "world", ukraine: "world", china: "world",
  israel: "world", gaza: "world", africa: "world", europe: "world",
  america: "world",
  pakistan: "pakistan", lahore: "pakistan", karachi: "pakistan",
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80)
}

function getFallbackForCategory(categorySlug) {
  const pool = categorySlug || "world"
  const fallbackKey = FALLBACK_IMAGES[pool] ? pool : "world"
  const fallbackFile = FALLBACK_IMAGES[fallbackKey]
  const fallbackPath = path.join(FALLBACK_DIR, fallbackFile)
  if (fs.existsSync(fallbackPath)) {
    return `/fallback/${fallbackFile}`
  }
  const catFallbackPath = path.join(CATEGORY_POOL_DIR, pool, "default.jpg")
  if (fs.existsSync(catFallbackPath)) {
    return `/images/categories/${pool}/default.jpg`
  }
  return "/images/categories/world/default.jpg"
}

function getKeywordFallback(title) {
  if (!title) return null
  const lower = title.toLowerCase()
  for (const [keyword, cat] of Object.entries(KEYWORD_FALLBACK_MAP)) {
    if (lower.includes(keyword)) {
      return { category: cat, image: getFallbackForCategory(cat) }
    }
  }
  return null
}

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http
    const req = protocol.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GlobalNewsBot/1.0)",
        Accept: "image/webp,image/jpeg,image/png,*/*",
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadImage(res.headers.location).then(resolve).catch(reject)
        return
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`))
        return
      }
      const contentType = res.headers["content-type"] || ""
      if (!contentType.startsWith("image/")) {
        reject(new Error(`Not an image: ${contentType}`))
        return
      }
      const chunks = []
      res.on("data", (chunk) => chunks.push(chunk))
      res.on("end", () => {
        const buffer = Buffer.concat(chunks)
        if (buffer.length < 100) {
          reject(new Error("Image too small"))
          return
        }
        resolve(buffer)
      })
    })
    req.on("error", reject)
    req.on("timeout", () => {
      req.destroy()
      reject(new Error("Timeout"))
    })
  })
}

function computeHash(buffer) {
  return crypto.createHash("md5").update(buffer).digest("hex")
}

function isDuplicate(hash, slug) {
  if (!fs.existsSync(ARTICLES_DIR)) return false
  const files = fs.readdirSync(ARTICLES_DIR)
  for (const file of files) {
    if (path.parse(file).name === slug) continue
    const filePath = path.join(ARTICLES_DIR, file)
    try {
      const existingBuffer = fs.readFileSync(filePath)
      const existingHash = computeHash(existingBuffer)
      if (existingHash === hash) return true
    } catch {
      continue
    }
  }
  return false
}

function getBestImageUrl(article) {
  if (article.ogImage && isValidUrl(article.ogImage)) return article.ogImage

  if (article.imageUrls && article.imageUrls.length > 0) {
    const validUrls = article.imageUrls.filter(isValidUrl)
    if (validUrls.length > 0) {
      const sorted = validUrls.sort((a, b) => {
        const aScore = urlQualityScore(a)
        const bScore = urlQualityScore(b)
        return bScore - aScore
      })
      return sorted[0]
    }
  }

  if (article.imageUrl && isValidUrl(article.imageUrl)) {
    return article.imageUrl
  }

  return null
}

function urlQualityScore(url) {
  let score = 0
  const u = url.toLowerCase()
  if (u.includes("og")) score += 3
  if (u.includes("featured")) score += 2
  if (u.includes("large")) score += 1
  if (u.includes("thumb")) score -= 1
  if (u.includes("icon")) score -= 2
  if (u.includes("logo")) score -= 3
  if (u.includes("avatar")) score -= 2
  if (u.includes("banner")) score -= 1
  const parsed = new URL(url)
  const host = parsed.hostname
  if (host.includes("bbc") || host.includes("nytimes") || host.includes("cnn")) {
    score += 2
  }
  return score
}

function isValidUrl(url) {
  if (!url || typeof url !== "string") return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

async function downloadArticleImage(article) {
  ensureDir(ARTICLES_DIR)

  const slug = article.slug || slugify(article.title || "untitled")
  const imageUrl = getBestImageUrl(article)

  if (!imageUrl) {
    const kw = getKeywordFallback(article.title)
    if (kw) {
      return { path: kw.image, source: "keyword-fallback", downloaded: false }
    }
    const fallback = getFallbackForCategory(article.categorySlug || article.category)
    return { path: fallback, source: "category-fallback", downloaded: false }
  }

  try {
    const buffer = await downloadImage(imageUrl)
    const hash = computeHash(buffer)

    if (isDuplicate(hash, slug)) {
      console.log(`  ~ Duplicate image for "${article.title.substring(0, 50)}", using fallback`)
      const kw = getKeywordFallback(article.title)
      if (kw) {
        return { path: kw.image, source: "keyword-fallback", downloaded: false }
      }
      const fallback = getFallbackForCategory(article.categorySlug || article.category)
      return { path: fallback, source: "category-fallback", downloaded: false }
    }

    const ext = path.extname(new URL(imageUrl).pathname) || ".jpg"
    const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext) ? ext : ".jpg"
    const filename = `${slug}${safeExt}`
    const filePath = path.join(ARTICLES_DIR, filename)

    fs.writeFileSync(filePath, buffer)
    console.log(`  ✓ Downloaded image for "${article.title.substring(0, 50)}"`)
    return { path: `/images/articles/${filename}`, source: "downloaded", downloaded: true }
  } catch (err) {
    console.log(`  ✗ Failed to download image for "${article.title.substring(0, 50)}": ${err.message}`)
    const kw = getKeywordFallback(article.title)
    if (kw) {
      return { path: kw.image, source: "keyword-fallback", downloaded: false }
    }
    const fallback = getFallbackForCategory(article.categorySlug || article.category)
    return { path: fallback, source: "category-fallback", downloaded: false }
  }
}

async function fetchOgImage(articleUrl) {
  if (!articleUrl || !isValidUrl(articleUrl)) return null
  try {
    const html = await fetchUrl(articleUrl)
    if (!html) return null
    const patterns = [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    ]
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match && match[1] && isValidUrl(match[1])) {
        return match[1]
      }
    }
    return null
  } catch {
    return null
  }
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http
    const req = protocol.get(url, {
      timeout: 8000,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GlobalNewsBot/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchUrl(res.headers.location).then(resolve).catch(reject)
        return
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`))
        return
      }
      let data = ""
      res.on("data", (chunk) => {
        data += chunk.toString()
        if (data.length > 50000) {
          req.destroy()
          resolve(data)
        }
      })
      res.on("end", () => resolve(data))
    })
    req.on("error", reject)
    req.on("timeout", () => {
      req.destroy()
      reject(new Error("Timeout"))
    })
  })
}

function verifyLocalImage(imagePath) {
  if (!imagePath) return false
  if (imagePath.startsWith("/")) {
    const localPath = path.join(__dirname, "../../public", imagePath)
    return fs.existsSync(localPath) && fs.statSync(localPath).size > 0
  }
  return false
}

function ensureArticleImage(article) {
  const imagePath = article.image
  if (imagePath && verifyLocalImage(imagePath)) {
    return imagePath
  }
  const articlesImagePath = path.join(
    ARTICLES_DIR,
    `${article.slug || slugify(article.title)}.jpg`,
  )
  if (fs.existsSync(articlesImagePath)) {
    return `/images/articles/${article.slug || slugify(article.title)}.jpg`
  }
  const kw = getKeywordFallback(article.title)
  if (kw) {
    return kw.image
  }
  return getFallbackForCategory(article.categorySlug || article.category)
}

module.exports = {
  downloadArticleImage,
  getBestImageUrl,
  getFallbackForCategory,
  getKeywordFallback,
  verifyLocalImage,
  ensureArticleImage,
  fetchOgImage,
}
