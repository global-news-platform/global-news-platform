const fs = require("fs")
const path = require("path")
const http = require("http")
const https = require("https")
const crypto = require("crypto")
const sharp = require("sharp")
const { searchImage } = require("./imageSearch")

const ARTICLES_DIR = path.join(__dirname, "../../public/images/articles")
const FALLBACKS_DIR = path.join(__dirname, "../../public/images/fallbacks")

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

const NORMALIZE_CATEGORY = {
  karobar: "business", siasat: "politics", khel: "sports",
  sehat: "health", shobiz: "entertainment", taleem: "education",
  mausam: "weather", adalat: "justice", dunya: "world",
  baynalaqwami: "world", raye: "opinion", mazhab: "religion",
  business: "business", politics: "politics", sports: "sports",
  health: "health", entertainment: "entertainment", world: "world",
  technology: "technology", science: "science", pakistan: "pakistan",
}

const MIN_WIDTH = 600
const MIN_HEIGHT = 300
const MIN_FILE_SIZE = 10240
const MIN_ASPECT = 0.75
const MAX_ASPECT = 3.5

let batchHashes = new Set()

function resetBatchHashes() {
  batchHashes = new Set()
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").substring(0, 80)
}

function getFallbackForCategory(categorySlug) {
  const key = categorySlug || "world"
  const fallbackFile = FALLBACK_IMAGES[key]
  if (fallbackFile) {
    const p = path.join(FALLBACKS_DIR, fallbackFile)
    if (fs.existsSync(p)) return `/images/fallbacks/${fallbackFile}`
  }
  for (const [cat, file] of Object.entries(FALLBACK_IMAGES)) {
    const p = path.join(FALLBACKS_DIR, file)
    if (fs.existsSync(p)) return `/images/fallbacks/${file}`
  }
  return "/images/fallbacks/default.jpg"
}

const STRICT_KEYWORD_MAP = {
  sports: ["cricket", "football", "soccer", "nba", "nfl", "tennis", "golf", "olympic", "olympics", "premier league", "champions league", "grand slam", "world cup"],
  politics: ["parliament", "congress", "senate", "election", "president", "governor race", "midterm", "primary", "vote", "campaign"],
  technology: ["ai", "artificial intelligence", "google", "openai", "chatgpt", "robot", "software", "startup", "smartphone", "cyberattack"],
  health: ["hospital", "doctor", "disease", "vaccine", "cancer", "medical", "patient", "surgery", "pandemic", "epidemic", "outbreak"],
  business: ["stock market", "economy", "inflation", "trade war", "tariff", "interest rate", "central bank", "recession", "gdp"],
  science: ["climate change", "environment", "space", "nasa", "planet", "research", "discovery", "experiment"],
  entertainment: ["film", "movie", "music", "concert", "celebrity", "award show", "box office"],
  world: ["iran war", "russia ukraine", "gaza", "middle east", "diplomatic", "sanctions", "ceasefire"],
  pakistan: ["pakistan", "lahore", "karachi", "islamabad", "imran khan", "nawaz sharif"],
}

function getKeywordFallback(title) {
  if (!title) return null
  const lower = title.toLowerCase()

  for (const [cat, keywords] of Object.entries(STRICT_KEYWORD_MAP)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return { category: cat, image: getFallbackForCategory(cat) }
      }
    }
  }

  const broadMap = {
    stock: "business", market: "business", bank: "business",
    oil: "business", price: "business", company: "business",
    trade: "business", tariff: "business", inflation: "business",
    ai: "technology", google: "technology", data: "technology",
    app: "technology", digital: "technology", robot: "technology",
    health: "health", virus: "health", drug: "health",
    climate: "science", space: "science", nasa: "science",
    iran: "world", russia: "world", ukraine: "world", china: "world",
    israel: "world", gaza: "world",
    film: "entertainment", music: "entertainment", star: "entertainment",
  }

  const detectedCategories = new Map()
  for (const [keyword, cat] of Object.entries(broadMap)) {
    if (lower.includes(keyword)) {
      detectedCategories.set(cat, (detectedCategories.get(cat) || 0) + 1)
    }
  }

  if (detectedCategories.size === 0) return null

  const sorted = [...detectedCategories.entries()].sort((a, b) => b[1] - a[1])
  const bestCat = sorted[0][0]
  return { category: bestCat, image: getFallbackForCategory(bestCat) }
}

function downloadImageBuffer(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http
    const req = protocol.get(url, {
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GlobalNewsBot/1.0)",
        Accept: "image/webp,image/jpeg,image/png,*/*",
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadImageBuffer(res.headers.location).then(resolve).catch(reject)
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
      const maxSize = 50 * 1024 * 1024
      let totalSize = 0
      res.on("data", (chunk) => {
        totalSize += chunk.length
        if (totalSize > maxSize) {
          req.destroy()
          reject(new Error("Image too large"))
          return
        }
        chunks.push(chunk)
      })
      res.on("end", () => resolve(Buffer.concat(chunks)))
    })
    req.on("error", reject)
    req.on("timeout", () => { req.destroy(); reject(new Error("Timeout")) })
  })
}

function computeHash(buffer) {
  return crypto.createHash("md5").update(buffer).digest("hex")
}

function isDuplicateInBatch(hash) {
  if (batchHashes.has(hash)) return true
  batchHashes.add(hash)
  return false
}

async function validateImage(buffer) {
  if (buffer.length < MIN_FILE_SIZE) {
    return { valid: false, reason: `File too small: ${buffer.length} bytes` }
  }
  try {
    const metadata = await sharp(buffer).metadata()
    const { width, height, format } = metadata
    if (!width || !height) return { valid: false, reason: "Cannot read dimensions" }
    if (width < MIN_WIDTH) return { valid: false, reason: `Width ${width} < ${MIN_WIDTH}` }
    if (height < MIN_HEIGHT) return { valid: false, reason: `Height ${height} < ${MIN_HEIGHT}` }
    const aspect = width / height
    if (aspect < MIN_ASPECT) return { valid: false, reason: `Aspect ${aspect.toFixed(2)} < ${MIN_ASPECT} (too tall)` }
    if (aspect > MAX_ASPECT) return { valid: false, reason: `Aspect ${aspect.toFixed(2)} > ${MAX_ASPECT} (too wide)` }
    if (format === "svg") return { valid: false, reason: "SVG not allowed" }
    return { valid: true, width, height, format }
  } catch (err) {
    return { valid: false, reason: `sharp error: ${err.message}` }
  }
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

function urlQualityScore(url) {
  let score = 0
  const u = url.toLowerCase()
  if (u.includes("og")) score += 3
  if (u.includes("featured")) score += 2
  if (u.includes("large") || u.includes("hero")) score += 1
  if (u.includes("thumb") || u.includes("thumbnail")) score -= 1
  if (u.includes("icon")) score -= 2
  if (u.includes("logo")) score -= 3
  if (u.includes("avatar")) score -= 2
  if (u.includes("banner")) score -= 1
  if (u.includes("amp") || u.includes("crop=")) score += 1
  try {
    const parsed = new URL(url)
    const host = parsed.hostname
    if (host.includes("bbc") || host.includes("nytimes") || host.includes("cnn") || host.includes("reuters")) {
      score += 2
    }
    if (parsed.pathname.match(/\d{3,}/)) score += 1
  } catch {}
  return score
}

function getBestImageUrl(article) {
  if (article.ogImage && isValidUrl(article.ogImage)) return article.ogImage
  if (article.imageUrls && article.imageUrls.length > 0) {
    const valid = article.imageUrls.filter(isValidUrl)
    if (valid.length > 0) {
      const sorted = valid.sort((a, b) => urlQualityScore(b) - urlQualityScore(a))
      return sorted[0]
    }
  }
  if (article.imageUrl && isValidUrl(article.imageUrl)) return article.imageUrl
  return null
}

function fetchOgImage(articleUrl) {
  if (!articleUrl || !isValidUrl(articleUrl)) return Promise.resolve(null)
  return new Promise((resolve) => {
    const protocol = articleUrl.startsWith("https") ? https : http
    const req = protocol.get(articleUrl, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GlobalNewsBot/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchOgImage(res.headers.location).then(resolve)
        return
      }
      if (res.statusCode !== 200) { resolve(null); return }
      let html = ""
      res.on("data", (chunk) => {
        html += chunk.toString()
        if (html.length > 100000) { req.destroy(); resolve(extractOgFromHtml(html)) }
      })
      res.on("end", () => resolve(extractOgFromHtml(html)))
    })
    req.on("error", () => resolve(null))
    req.on("timeout", () => { req.destroy(); resolve(null) })
  })
}

function extractOgFromHtml(html) {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']image_src["']/i,
  ]
  for (const pattern of patterns) {
    const m = html.match(pattern)
    if (m && m[1]) {
      try { new URL(m[1]); return m[1] } catch { continue }
    }
  }
  const jsonLd = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i)
  if (jsonLd) {
    try {
      const data = JSON.parse(jsonLd[1])
      const img = data.image || (data.thumbnailUrl) || (data.publisher?.logo?.url)
      if (img && isValidUrl(img)) return img
      if (Array.isArray(img) && img.length > 0 && isValidUrl(img[0])) return img[0]
    } catch {}
  }
  const imgTags = html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)
  let bestImg = null
  let bestSize = 0
  for (const match of imgTags) {
    try {
      new URL(match[1])
      const w = parseInt(match[0].match(/width=["'](\d+)["']/i)?.[1] || "0")
      const h = parseInt(match[0].match(/height=["'](\d+)["']/i)?.[1] || "0")
      const size = w * h
      if (size > bestSize && w >= 400) {
        bestSize = size
        bestImg = match[1]
      }
    } catch {}
  }
  return bestImg
}

async function downloadArticleImage(article) {
  ensureDir(ARTICLES_DIR)
  const slug = article.slug || slugify(article.title || "untitled")
  const imageUrl = getBestImageUrl(article)

  if (imageUrl) {
    console.log(`  → Trying RSS image for "${(article.title || "").substring(0, 50)}"`)
    const result = await tryDownload(slug, imageUrl, article)
    if (result) return result
  }

  if (article.sourceUrl) {
    console.log(`  → Fetching og:image from article page for "${(article.title || "").substring(0, 50)}"`)
    const ogUrl = await fetchOgImage(article.sourceUrl)
    if (ogUrl) {
      const result = await tryDownload(slug, ogUrl, article)
      if (result) return result
    }
  }

  const wikiResult = await searchImage(article.title)
  if (wikiResult && wikiResult.url) {
    console.log(`  → Trying Wikipedia image for "${(article.title || "").substring(0, 50)}": ${wikiResult.url}`)
    const result = await tryDownload(slug, wikiResult.url, article)
    if (result) return result
  }

  const articleCategory = article.categorySlug || article.category || "general"
  const normalCat = NORMALIZE_CATEGORY[articleCategory] || articleCategory

  const kw = getKeywordFallback(article.title)
  if (kw) {
    if (kw.category !== normalCat) {
      const fallback = getFallbackForCategory(articleCategory)
      console.log(`  ⚠ Keyword fallback "${kw.category}" doesn't match article category "${normalCat}", using category fallback: ${fallback}`)
      return { path: fallback, source: "category-fallback", downloaded: false, width: 0, height: 0 }
    }
    console.log(`  ⚠ Using keyword fallback for "${(article.title || "").substring(0, 50)}": ${kw.image}`)
    return { path: kw.image, source: "keyword-fallback", downloaded: false, width: 0, height: 0 }
  }

  const fallback = getFallbackForCategory(articleCategory)
  console.log(`  ⚠ Using category fallback for "${(article.title || "").substring(0, 50)}": ${fallback}`)
  return { path: fallback, source: "category-fallback", downloaded: false, width: 0, height: 0 }
}

async function tryDownload(slug, imageUrl, article) {
  try {
    const buffer = await downloadImageBuffer(imageUrl)
    const hash = computeHash(buffer)

    if (isDuplicateInBatch(hash)) {
      console.log(`  ~ Skipped duplicate image (same hash as another article in this batch) for "${(article.title || "").substring(0, 50)}"`)
      return null
    }

    const validation = await validateImage(buffer)
    if (!validation.valid) {
      console.log(`  ✗ Image validation failed: ${validation.reason} for "${(article.title || "").substring(0, 50)}"`)
      return null
    }

    const finalSlug = slug.replace(/[^a-zA-Z0-9_-]/g, "")
    const filename = `${finalSlug}.jpg`
    const filePath = path.join(ARTICLES_DIR, filename)

    let processed = buffer
    if (validation.format !== "jpeg" && validation.format !== "jpg") {
      try {
        processed = await sharp(buffer).jpeg({ quality: 92, progressive: true }).toBuffer()
      } catch {}
    }

    const finalMeta = await sharp(processed).metadata()

    fs.writeFileSync(filePath, processed)
    console.log(`  ✓ Downloaded & validated image ${validation.width}x${validation.height} for "${(article.title || "").substring(0, 50)}"`)
    return {
      path: `/images/articles/${filename}`,
      source: "downloaded",
      downloaded: true,
      width: finalMeta.width || validation.width,
      height: finalMeta.height || validation.height,
    }
  } catch (err) {
    console.log(`  ✗ Download failed: ${err.message} for "${(article.title || "").substring(0, 50)}"`)
    return null
  }
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
  if (article.image && verifyLocalImage(article.image)) return article.image
  const articlesImagePath = path.join(ARTICLES_DIR, `${article.slug || slugify(article.title)}.jpg`)
  if (fs.existsSync(articlesImagePath)) return `/images/articles/${article.slug || slugify(article.title)}.jpg`
  const kw = getKeywordFallback(article.title)
  if (kw) return kw.image
  return getFallbackForCategory(article.categorySlug || article.category)
}

module.exports = {
  downloadArticleImage,
  tryDownload,
  getBestImageUrl,
  getFallbackForCategory,
  getKeywordFallback,
  verifyLocalImage,
  ensureArticleImage,
  fetchOgImage,
  resetBatchHashes,
}
