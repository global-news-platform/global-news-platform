const fs = require("fs")
const path = require("path")
const https = require("https")
const { rewriteBatch } = require("./rewriter")
const { transformAndSave } = require("./imageTransformer")

const FB_TRACKER_PATH = path.join(__dirname, "../../src/data/.facebook-tracker.json")

const MAX_POSTS_PER_RUN = 4
const MIN_DELAY_MS = 3000

const POST_FORMATS = ["link", "photo", "text"]

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
  const state = loadTracker()
  return state.posted.includes(slug)
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

function selectTopArticles(articles, limit = MAX_POSTS_PER_RUN) {
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
      }

      return { ...a, score }
    })
    .sort((a, b) => b.score - a.score)

  const selected = []
  const seenSlugs = new Set()
  for (const article of scored) {
    if (selected.length >= limit) break
    const baseSlug = (article.slug || "").replace(/--[a-z0-9]+$/i, "")
    if (!hasBeenPosted(article.slug) && !seenSlugs.has(baseSlug)) {
      selected.push(article)
      seenSlugs.add(baseSlug)
    }
  }

  return selected
}

function getArticleLink(article, siteUrl) {
  return article.sourceUrl || article.canonicalUrl || `${siteUrl.replace(/\/$/, "")}/article/${article.slug}`
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

function buildMessage(title, sourceName, excerpt, isBreaking) {
  let msg = title
  if (sourceName) {
    msg += `\n\n— ${sourceName}`
  }
  if (excerpt) {
    msg += `\n\n${excerpt.substring(0, 200)}`
  }
  msg += `\n\n#GlobalNews #WorldNews`
  if (isBreaking) {
    msg = `BREAKING\n\n${msg}`
  }
  return msg.substring(0, 63206)
}

async function postLinkFormat({ pageId, pageAccessToken, article, siteUrl }) {
  const linkUrl = getArticleLink(article, siteUrl)
  const sourceName = article.sourceName || article.attribution || article.source || ""
  const excerpt = (article.excerpt || article.description || "").substring(0, 200)
  const message = buildMessage(article.title, sourceName, excerpt, article.breaking)

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
  const imageUrl = getArticleImageUrl(article, siteUrl)
  const linkUrl = getArticleLink(article, siteUrl)
  const sourceName = article.sourceName || article.attribution || article.source || ""
  const excerpt = (article.excerpt || article.description || "").substring(0, 200)
  const message = buildMessage(article.title, sourceName, excerpt, article.breaking) + `\n\n${linkUrl}`

  if (!imageUrl) {
    console.log(`    No image available, falling back to link format`)
    return await postLinkFormat({ pageId, pageAccessToken, article, siteUrl })
  }

  const apiUrl =
    `https://graph.facebook.com/v22.0/${pageId}/photos` +
    `?access_token=${encodeURIComponent(pageAccessToken)}` +
    `&url=${encodeURIComponent(imageUrl)}` +
    `&caption=${encodeURIComponent(message)}` +
    `&locale=en_US` +
    `&published=true`

  const result = await graphApiRequest(apiUrl, "POST")
  if (result.error) {
    console.error(`    Photo post error: ${result.error.message || JSON.stringify(result.error)} (falling back to link)`)
    return await postLinkFormat({ pageId, pageAccessToken, article, siteUrl })
  }
  console.log(`    Photo post: ${result.id} (image: ${imageUrl})`)
  return true
}

async function postTextFormat({ pageId, pageAccessToken, article, siteUrl }) {
  const sourceName = article.sourceName || article.attribution || article.source || ""
  const excerpt = (article.excerpt || article.description || "").substring(0, 200)
  const linkUrl = getArticleLink(article, siteUrl)
  const message = buildMessage(article.title, sourceName, excerpt, article.breaking) +
    `\n\nFull story: ${linkUrl}`

  const apiUrl =
    `https://graph.facebook.com/v22.0/${pageId}/feed` +
    `?access_token=${encodeURIComponent(pageAccessToken)}` +
    `&message=${encodeURIComponent(message)}` +
    `&locale=en_US` +
    `&published=true`

  const result = await graphApiRequest(apiUrl, "POST")
  if (result.error) {
    console.error(`    Text post error: ${result.error.message || JSON.stringify(result.error)}`)
    return false
  }
  console.log(`    Text post: ${result.id}`)
  return true
}

const FORMAT_POSTERS = [postLinkFormat, postPhotoFormat, postTextFormat]

async function postTopArticles(articles, { pageId, pageAccessToken, siteUrl, limit = MAX_POSTS_PER_RUN, dryRun = false }) {
  if (!pageId || !pageAccessToken) {
    console.log("  Facebook: skipped (missing PAGE_ID or PAGE_ACCESS_TOKEN)")
    return { posted: 0, skipped: 0, total: 0 }
  }

  const top = selectTopArticles(articles, limit)

  if (top.length === 0) {
    console.log("  Facebook: no new articles to post (all already posted or no articles)")
    return { posted: 0, skipped: 0, total: 0 }
  }

  {
    console.log(`  Rewriting ${top.length} articles with local rewriter...`)
    const rewritten = await rewriteBatch(top)
    for (let i = 0; i < rewritten.length; i++) {
      if (rewritten[i].title && rewritten[i].title !== top[i].title) {
        console.log(`    [${i + 1}] "${(top[i].title || "").substring(0, 50)}" → "${(rewritten[i].title || "").substring(0, 50)}"`)
      }
      top[i].title = rewritten[i].title
      top[i].excerpt = rewritten[i].excerpt
      top[i].description = rewritten[i].excerpt
    }
    console.log(`  Rewrite done`)
  }

  const startFormatIdx = getNextFormatIndex()
  const formatNames = ["link", "photo", "text"]

  console.log(`  Facebook: posting ${top.length} articles (starting format: ${formatNames[startFormatIdx]})...`)
  let posted = 0
  let skipped = 0

  for (let i = 0; i < top.length; i++) {
    const a = top[i]
    const formatIdx = (startFormatIdx + i) % FORMAT_POSTERS.length
    const formatName = formatNames[formatIdx]
    const sourceName = a.sourceName || a.attribution || a.source || ""

    const linkUrl = getArticleLink(a, siteUrl)
    console.log(`    [${i + 1}/${top.length}] [${formatName}] ${(a.title || "").substring(0, 65)} (${sourceName})`)

    if (dryRun) {
      const imgUrl = getArticleImageUrl(a, siteUrl)
      const transformedUrl = formatName === "photo" && imgUrl ? ` (would transform)` : ""
      console.log(`      (dry-run — would post as ${formatName}, link: ${linkUrl}${imgUrl ? `, image: ${imgUrl}${transformedUrl}` : ""})`)
      skipped++
      continue
    }

    let articleForPost = a

    if (formatName === "photo") {
      const transformed = await transformAndSave(a, siteUrl)
      if (transformed) {
        articleForPost = { ...a, image: transformed, imageUrl: transformed }
      }
    }

    const poster = FORMAT_POSTERS[formatIdx]
    const success = await poster({ pageId, pageAccessToken, article: articleForPost, siteUrl })

    if (success) {
      console.log(`      Posted as ${formatName}: ${linkUrl}`)
      markPosted(a.slug)
      posted++
    } else {
      console.error(`      Failed to post: ${(a.title || "").substring(0, 60)}`)
      skipped++
    }

    if (i < top.length - 1) {
      await sleep(MIN_DELAY_MS)
    }
  }

  console.log(`  Facebook: ${posted} posted, ${skipped} skipped (${formatNames[startFormatIdx]} → ...)`)
  return { posted, skipped, total: top.length }
}

module.exports = {
  postTopArticles,
  selectTopArticles,
  hasBeenPosted,
  markPosted,
  loadTracker,
}
