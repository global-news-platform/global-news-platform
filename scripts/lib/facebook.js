const fs = require("fs")
const path = require("path")
const http = require("http")
const https = require("https")
const { rewriteBatch } = require("./rewriter")
const { verifyImageRelevance } = require("./imageRelevance")

const AI_API_KEY = process.env.AI_API_KEY || ""

const FB_TRACKER_PATH = path.join(__dirname, "../../src/data/.facebook-tracker.json")
const POST_FORMATS = ["photo"]
const MAX_POSTS_PER_RUN = 1

// RULE (ACCURACY_FIRST):
// Facebook posts must show accurate news with an accurate, article-specific image.
// An article is postable ONLY if it has its own image at /images/articles/{slug}.jpg
// (AI-generated from the article content). Generic fallback images (default.jpg,
// category, keyword, picsum, og-default) are NEVER acceptable — a wrong image is
// worse than no post. Articles without an accurate image are skipped, not posted.
const ACCURACY_FIRST = true

// RULE (RANDOM_INTERVALS):
// Posts happen at random durations (5, 15, 30, 21, 14 minutes, ...) instead of a
// fixed schedule. After each post a random delay in [MIN, MAX] is stored in the
// tracker as nextPostAt; the next post is only allowed once that delay has elapsed.
const MIN_INTERVAL_MS = 5 * 60 * 1000
const MAX_INTERVAL_MS = 30 * 60 * 1000

function loadTracker() {
  if (!fs.existsSync(FB_TRACKER_PATH)) return { posted: [], lastRun: null, formatIndex: 0 }
  try {
    return JSON.parse(fs.readFileSync(FB_TRACKER_PATH, "utf-8"))
  } catch {
    return { posted: [], lastRun: null, formatIndex: 0 }
  }
}

function saveTracker(state) {
  fs.mkdirSync(path.dirname(FB_TRACKER_PATH), { recursive: true })
  fs.writeFileSync(FB_TRACKER_PATH, JSON.stringify(state, null, 2), "utf-8")
}

function hasBeenPosted(slug) {
  return loadTracker().posted.includes(slug)
}

function randomPostDelayMs() {
  const minMinutes = Math.round(MIN_INTERVAL_MS / 60000)
  const maxMinutes = Math.round(MAX_INTERVAL_MS / 60000)
  const minutes = minMinutes + Math.floor(Math.random() * (maxMinutes - minMinutes + 1))
  return minutes * 60 * 1000
}

function markPosted(slug) {
  const state = loadTracker()
  if (!state.posted.includes(slug)) {
    state.posted.push(slug)
    state.lastRun = new Date().toISOString()
    state.nextPostAt = Date.now() + randomPostDelayMs()
    if (state.posted.length > 500) {
      state.posted = state.posted.slice(-250)
    }
    saveTracker(state)
  }
}

function getNextFormatIndex() {
  const state = loadTracker()
  const idx = state.formatIndex || 0
  state.formatIndex = (idx + 1) % POST_FORMATS.length
  saveTracker(state)
  return idx
}

function isWithinThrottleWindow() {
  const state = loadTracker()
  if (!state.nextPostAt) return false
  return Date.now() < state.nextPostAt
}

function graphApiRequest(url, method = "GET") {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url)
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method,
      headers: {
        "User-Agent": "GlobalLens/1.0 (Facebook Auto-Poster; bot@thegloballens365.com)",
      },
    }
    const req = https.request(options, (res) => {
      let data = ""
      res.on("data", (chunk) => (data += chunk))
      res.on("end", () => {
        try {
          resolve(JSON.parse(data))
        } catch {
          resolve({ error: { message: data } })
        }
      })
    })
    req.on("error", reject)
    req.setTimeout(30000, () => {
      req.destroy()
      reject(new Error("Request timed out"))
    })
    req.end()
  })
}

function isAccurateImageUrl(img) {
  if (!img) return false
  return img.includes("/images/articles/")
}

function hasAccurateImage(article) {
  const img = article.image || article.imageUrl || ""
  if (!isAccurateImageUrl(img)) return false
  const localPath = path.join(__dirname, "../../public", img)
  try {
    return fs.existsSync(localPath) && fs.statSync(localPath).size > 0
  } catch {
    return false
  }
}

const IMAGE_RETRY_MS = 60 * 60 * 1000

function getFailedImages() {
  const state = loadTracker()
  const now = Date.now()
  const retry = {}
  for (const [slug, ts] of Object.entries(state.failedImages || {})) {
    if (now - ts < IMAGE_RETRY_MS) retry[slug] = ts
  }
  return retry
}

function rememberImageFailure(slug) {
  const state = loadTracker()
  state.failedImages = state.failedImages || {}
  state.failedImages[slug] = Date.now()
  saveTracker(state)
}

function clearImageFailure(slug) {
  const state = loadTracker()
  if (state.failedImages && state.failedImages[slug]) {
    delete state.failedImages[slug]
    saveTracker(state)
  }
}

async function verifyImageUrl(url) {
  if (!url) return false
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10000)
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { Range: "bytes=0-2048", "User-Agent": "GlobalLens/1.0 (Image Verifier)" },
    })
    clearTimeout(timer)
    if (!res.ok) return false
    const contentType = (res.headers.get("content-type") || "").toLowerCase()
    if (contentType && !contentType.startsWith("image/")) return false
    return true
  } catch {
    return false
  }
}

function selectTopArticles(articles) {
  const sourcePriority = [
    "reuters", "associated press", "ap news", "bbc", "bbc news",
    "al jazeera", "the guardian", "the new york times", "washington post",
    "dawn", "dawn news", "express tribune", "the news international",
    "pakistan today", "daily times", "the nation", "ary news",
  ]

  const failedImages = getFailedImages()

  const scored = articles
    .filter((a) => (ACCURACY_FIRST ? hasAccurateImage(a) : true))
    .filter((a) => !failedImages[a.slug])
    .map((a) => {
      let score = 0
      if (a.breaking) score += 100
      if (a.featured) score += 50
      if (a.trending) score += 25

      const sourceLabel = (a.sourceName || a.attribution || a.source || "").toLowerCase()
      const sourceIdx = sourcePriority.findIndex((s) => sourceLabel.includes(s))
      if (sourceIdx >= 0) score += Math.max(0, 10 - sourceIdx)

      if (a.publishedAt) {
        const ageHours = (Date.now() - new Date(a.publishedAt).getTime()) / 3600000
        if (ageHours < 48) score += Math.max(0, 48 - ageHours)
        if (ageHours >= 168) score -= 500
      }

      if (a.sourceUrl) score += 200

      return { ...a, score }
    })
    .sort((a, b) => b.score - a.score)

  for (const article of scored) {
    const baseSlug = (article.slug || "").replace(/--[a-z0-9]+$/i, "")
    if (!hasBeenPosted(article.slug)) {
      return article
    }
  }

  return null
}

function getArticleLink(article, siteUrl) {
  return `${siteUrl.replace(/\/$/, "")}/article/${article.slug}`
}

function getArticleImageUrl(article, siteUrl) {
  const img = article.image || article.imageUrl || ""
  if (img.startsWith("http://") || img.startsWith("https://")) {
    return img
  }
  if (img.startsWith("/")) {
    return `${siteUrl.replace(/\/$/, "")}${img}`
  }
  return null
}

function cleanMessage(title, isBreaking) {
  const prefix = isBreaking ? "BREAKING: " : ""
  return `${prefix}${title}\n\n#GlobalNews #WorldNews`
}

async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http
    protocol.get(url, { timeout: 15000, headers: { "User-Agent": "Mozilla/5.0 (compatible; GlobalLens/1.0)" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadImage(res.headers.location).then(resolve); return
      }
      if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}`)); return }
      const chunks = []
      res.on("data", (c) => chunks.push(c))
      res.on("end", () => resolve(Buffer.concat(chunks)))
    }).on("error", reject).on("timeout", function () { this.destroy(); reject(new Error("Timeout")) })
  })
}

async function postPhotoBinary({ imageBuffer, pageId, pageAccessToken, caption }) {
  const boundary = "----FormBoundary" + Math.random().toString(36).slice(2)
  const header = `--${boundary}\r\nContent-Disposition: form-data; name="source"; filename="image.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`
  const footer = `\r\n--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${caption}\r\n--${boundary}\r\nContent-Disposition: form-data; name="access_token"\r\n\r\n${pageAccessToken}\r\n--${boundary}--\r\n`
  const body = Buffer.concat([Buffer.from(header), imageBuffer, Buffer.from(footer)])

  return new Promise((resolve, reject) => {
    const parsed = new URL(`https://graph.facebook.com/v22.0/${pageId}/photos`)
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": body.length,
        "User-Agent": "GlobalLens/1.0 (Facebook Auto-Poster; bot@thegloballens365.com)",
      },
    }
    const req = https.request(options, (res) => {
      let data = ""
      res.on("data", (c) => (data += c))
      res.on("end", () => { try { resolve(JSON.parse(data)) } catch { resolve({ error: { message: data } }) } })
    })
    req.on("error", reject)
    req.setTimeout(30000, () => { req.destroy(); reject(new Error("Request timed out")) })
    req.write(body)
    req.end()
  })
}

async function postPhotoFormat({ pageId, pageAccessToken, article, siteUrl }) {
  const imageUrl = getArticleImageUrl(article, siteUrl)
  const linkUrl = getArticleLink(article, siteUrl)
  const message = cleanMessage(article.title, article.breaking)

  if (!isAccurateImageUrl(imageUrl)) {
    console.log(`    ACCURACY_FIRST: no accurate article-specific image — skipping post (no irrelevant/fallback images allowed)`)
    return false
  }

  // Try URL upload first (simpler)
  const urlApiUrl =
    `https://graph.facebook.com/v22.0/${pageId}/photos` +
    `?access_token=${encodeURIComponent(pageAccessToken)}` +
    `&url=${encodeURIComponent(imageUrl)}` +
    `&caption=${encodeURIComponent(message + `\n\n${linkUrl}`)}` +
    `&locale=en_US` +
    `&published=true`

  let result = await graphApiRequest(urlApiUrl, "POST")
  if (result && result.id) {
    console.log(`    Photo post: ${result.id} (image: ${imageUrl})`)
    return true
  }

  console.log(`    URL upload failed (${(result.error || {}).message || 'unknown'}), trying binary upload...`)

  // Fallback: download image locally and upload as binary
  try {
    const imageBuffer = await downloadImage(imageUrl)
    const caption = message + `\n\n${linkUrl}`
    result = await postPhotoBinary({ imageBuffer, pageId, pageAccessToken, caption })
    if (result && result.id) {
      console.log(`    Photo post (binary): ${result.id}`)
      return true
    }
    console.error(`    Binary upload also failed: ${(result.error || {}).message || JSON.stringify(result)}`)
  } catch (err) {
    console.error(`    Binary upload error: ${err.message}`)
  }

  console.log(`    Photo upload failed — skipping post (ACCURACY_FIRST: no link-post fallback with missing image)`)
  return false
}

const FORMAT_POSTERS = [postPhotoFormat]

async function postTopArticles(articles, { pageId, pageAccessToken, siteUrl, limit = 1, dryRun = false }) {
  if (!pageId || !pageAccessToken) {
    console.log("  Facebook: skipped (missing PAGE_ID or PAGE_ACCESS_TOKEN)")
    return { posted: 0, skipped: 0, total: 0 }
  }

  const state = loadTracker()

  if (state.nextPostAt && Date.now() < state.nextPostAt) {
    const remaining = Math.ceil((state.nextPostAt - Date.now()) / 60000)
    console.log(`  Facebook: next post scheduled in ${remaining}m (random 5–30 min interval).`)
    return { posted: 0, skipped: 0, total: 0 }
  }

  let article = null
  let attempts = 0
  while (attempts < 10) {
    attempts++
    article = selectTopArticles(articles)
    if (!article) break

    const articleImg = getArticleImageUrl(article, siteUrl)
    if (!articleImg || !isAccurateImageUrl(articleImg)) {
      console.log(`    ACCURACY_FIRST: article has no accurate article-specific image — skipping`)
      return { posted: 0, skipped: 1, total: 1 }
    }

    console.log(`  Verifying image on live site (${articleImg})...`)
    const verified = await verifyImageUrl(articleImg)
    if (verified) {
      console.log(`    Image verified: ${articleImg}`)
    } else {
      console.log(`    Image NOT reachable on live site — skipping for retry later: ${(article.slug || "").substring(0, 60)}`)
      rememberImageFailure(article.slug)
      article = null
      continue
    }

    // ACCURACY_FIRST: verify the image content actually matches the article
    // before posting. A reachable image can still be an irrelevant AI
    // generation or a stale/fallback image — only post when a vision model
    // confirms the image depicts the news story.
    const relevanceHeadline = `${article.title || ""}${article.excerpt ? " — " + article.excerpt.substring(0, 160) : ""}`
    console.log(`  Checking image relevance vs headline...`)
    const relevant = await verifyImageRelevance(articleImg, relevanceHeadline)
    if (relevant === false) {
      console.log(`    Image NOT relevant to the article — skipping: ${(article.title || "").substring(0, 60)}`)
      rememberImageFailure(article.slug)
      article = null
      continue
    }
    if (relevant === null) {
      console.log(`    Relevance check unavailable (no Gemini key / provider error) — skipping to avoid posting an unverified image: ${(article.title || "").substring(0, 60)}`)
      article = null
      continue
    }
    console.log(`    Image relevance confirmed.`)
    break
  }

  if (!article) {
    console.log("  Facebook: no postable article found (all posted, or none with a reachable accurate image)")
    return { posted: 0, skipped: 0, total: 0 }
  }

  {
    console.log(`  Rewriting article with local rewriter...`)
    const rewritten = await rewriteBatch([article])
    if (rewritten[0].title && rewritten[0].title !== article.title) {
      console.log(`    "${(article.title || "").substring(0, 50)}" → "${(rewritten[0].title || "").substring(0, 50)}"`)
    }
    article.title = rewritten[0].title
    console.log(`  Rewrite done`)
  }

  const formatIdx = getNextFormatIndex()
  const formatName = POST_FORMATS[formatIdx]
  const sourceName = article.sourceName || article.attribution || article.source || ""
  const linkUrl = getArticleLink(article, siteUrl)

  console.log(`  [${formatName}] ${(article.title || "").substring(0, 65)} (${sourceName})`)

  if (dryRun) {
    console.log(`    (dry-run — would post as ${formatName}, link: ${linkUrl})`)
    return { posted: 0, skipped: 0, total: 1 }
  }

  const poster = FORMAT_POSTERS[formatIdx]
  const result = await poster({ pageId, pageAccessToken, article, siteUrl })

  if (result) {
    console.log(`    Posted as ${formatName}: ${linkUrl}`)
    clearImageFailure(article.slug)
    markPosted(article.slug)
    return { posted: 1, skipped: 0, total: 1 }
  } else {
    console.error(`    Failed to post: ${(article.title || "").substring(0, 60)}`)
    return { posted: 0, skipped: 1, total: 1 }
  }
}

module.exports = {
  postTopArticles,
  selectTopArticles,
  hasBeenPosted,
  markPosted,
  loadTracker,
  isWithinThrottleWindow,
}