const fs = require("fs")
const path = require("path")
const https = require("https")
const { rewriteBatch } = require("./rewriter")

const FB_TRACKER_PATH = path.join(__dirname, "../../src/data/.facebook-tracker.json")
const POST_FORMATS = ["photo"]
const MIN_INTERVAL_MS = 120 * 60 * 1000
const MAX_POSTS_PER_RUN = 1

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

function markPosted(slug) {
  const state = loadTracker()
  if (!state.posted.includes(slug)) {
    state.posted.push(slug)
    state.lastRun = new Date().toISOString()
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
  if (!state.lastRun) return false
  const elapsed = Date.now() - new Date(state.lastRun).getTime()
  return elapsed < MIN_INTERVAL_MS
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
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

function selectTopArticles(articles) {
  const sourcePriority = [
    "reuters", "associated press", "ap news", "bbc", "bbc news",
    "al jazeera", "the guardian", "the new york times", "washington post",
    "dawn", "dawn news", "express tribune", "the news international",
    "pakistan today", "daily times", "the nation", "ary news",
  ]

  const scored = articles
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

function fetchOgImage(articleUrl) {
  if (!articleUrl || !articleUrl.startsWith("http")) return Promise.resolve(null)
  return new Promise((resolve) => {
    const protocol = articleUrl.startsWith("https") ? https : http
    const req = protocol.get(articleUrl, {
      timeout: 10000,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GlobalLens/1.0)", Accept: "text/html,application/xhtml+xml" },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchOgImage(res.headers.location).then(resolve); return
      }
      if (res.statusCode !== 200) { resolve(null); return }
      let html = ""
      res.on("data", (chunk) => { html += chunk.toString(); if (html.length > 100000) { req.destroy(); resolve(extractOgFromHtml(html)) } })
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
  ]
  for (const pattern of patterns) {
    const m = html.match(pattern)
    if (m && m[1]) { try { new URL(m[1]); return m[1] } catch { continue } }
  }
  return null
}

function cleanMessage(title, isBreaking) {
  const prefix = isBreaking ? "BREAKING: " : ""
  return `${prefix}${title}\n\n#GlobalNews #WorldNews`
}

async function postLinkFormat({ pageId, pageAccessToken, article, siteUrl }) {
  const linkUrl = getArticleLink(article, siteUrl)
  const message = cleanMessage(article.title, article.breaking)

  const apiUrl =
    `https://graph.facebook.com/v22.0/${pageId}/feed` +
    `?access_token=${encodeURIComponent(pageAccessToken)}` +
    `&message=${encodeURIComponent(message)}` +
    `&link=${encodeURIComponent(linkUrl)}` +
    `&locale=en_US` +
    `&published=true`

  const result = await graphApiRequest(apiUrl, "POST")
  if (result.error) {
    console.error(`    Link post error: ${result.error.message || JSON.stringify(result.error)}`)
    return false
  }
  console.log(`    Link post: ${result.id} → ${linkUrl}`)
  return true
}

async function postPhotoFormat({ pageId, pageAccessToken, article, siteUrl }) {
  let imageUrl = getArticleImageUrl(article, siteUrl)
  const linkUrl = getArticleLink(article, siteUrl)
  const message = cleanMessage(article.title, article.breaking)

  if (!imageUrl && article.sourceUrl) {
    console.log(`    No local image — fetching og:image from source...`)
    imageUrl = await fetchOgImage(article.sourceUrl)
  }

  if (!imageUrl) {
    console.log(`    No image available, falling back to link format`)
    const linkResult = await postLinkFormat({ pageId, pageAccessToken, article, siteUrl })
    return linkResult === true ? { id: true, fallback: true } : linkResult
  }

  const apiUrl =
    `https://graph.facebook.com/v22.0/${pageId}/photos` +
    `?access_token=${encodeURIComponent(pageAccessToken)}` +
    `&url=${encodeURIComponent(imageUrl)}` +
    `&caption=${encodeURIComponent(message + `\n\n${linkUrl}`)}` +
    `&locale=en_US` +
    `&published=true`

  const result = await graphApiRequest(apiUrl, "POST")
  if (result.error) {
    console.error(`    Photo post error: ${result.error.message || JSON.stringify(result.error)} (falling back to link)`)
    const linkResult = await postLinkFormat({ pageId, pageAccessToken, article, siteUrl })
    return linkResult === true ? { id: true, fallback: true } : linkResult
  }
  console.log(`    Photo post: ${result.id} (image: ${imageUrl})`)
  return true
}

async function postTextFormat({ pageId, pageAccessToken, article, siteUrl }) {
  const linkUrl = getArticleLink(article, siteUrl)
  const message = cleanMessage(article.title, true)

  const apiUrl =
    `https://graph.facebook.com/v22.0/${pageId}/feed` +
    `?access_token=${encodeURIComponent(pageAccessToken)}` +
    `&message=${encodeURIComponent(message)}` +
    `&link=${encodeURIComponent(linkUrl)}` +
    `&locale=en_US` +
    `&published=true`

  const result = await graphApiRequest(apiUrl, "POST")
  if (result.error) {
    console.error(`    Text post error: ${result.error.message || JSON.stringify(result.error)}`)
    return false
  }
  console.log(`    Text post: ${result.id} → ${linkUrl}`)
  return true
}

const FORMAT_POSTERS = [postPhotoFormat]

async function postTopArticles(articles, { pageId, pageAccessToken, siteUrl, dryRun = false }) {
  if (!pageId || !pageAccessToken) {
    console.log("  Facebook: skipped (missing PAGE_ID or PAGE_ACCESS_TOKEN)")
    return { posted: 0, skipped: 0, total: 0 }
  }

  const state = loadTracker()

  if (state.lastRun) {
    const elapsed = Date.now() - new Date(state.lastRun).getTime()
    if (elapsed < MIN_INTERVAL_MS) {
      const remaining = Math.ceil((MIN_INTERVAL_MS - elapsed) / 60000)
      console.log(`  Facebook: throttled — last post was ${Math.floor(elapsed / 60000)}m ago. Next post allowed in ${remaining}m (${MIN_INTERVAL_MS / 60000}min interval).`)
      return { posted: 0, skipped: 0, total: 0 }
    }
  }

  const article = selectTopArticles(articles)

  if (!article) {
    console.log("  Facebook: no new articles to post (all already posted)")
    return { posted: 0, skipped: 0, total: 0 }
  }

  const articleArray = [article]
  {
    console.log(`  Rewriting article with local rewriter...`)
    const rewritten = await rewriteBatch(articleArray)
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

  let articleForPost = article
  if (formatName === "photo") {
    const articleImg = getArticleImageUrl(article, siteUrl)
    if (!articleImg && article.sourceUrl) {
      const og = await fetchOgImage(article.sourceUrl)
      if (og) articleForPost = { ...article, image: og, imageUrl: og }
    }
    if (!getArticleImageUrl(articleForPost, siteUrl)) {
      console.log(`    No image available, falling back to link format`)
      formatName = "link"
    }
  }

  const poster = FORMAT_POSTERS[formatIdx]
  const result = await poster({ pageId, pageAccessToken, article: articleForPost, siteUrl })
  let postedFormat = formatName
  if (result && typeof result === "object" && result.fallback) postedFormat = "link"

  if (result) {
    console.log(`    Posted as ${postedFormat}: ${linkUrl}`)
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