const fs = require("fs")
const path = require("path")
const https = require("https")

const FB_TRACKER_PATH = path.join(__dirname, "../../src/data/.facebook-tracker.json")

const MAX_POSTS_PER_RUN = 4
const MIN_DELAY_MS = 3000
const TITLE_SIMILARITY_THRESHOLD = 0.6

function loadTracker() {
  if (!fs.existsSync(FB_TRACKER_PATH)) return { posted: [], lastRun: null }
  try {
    return JSON.parse(fs.readFileSync(FB_TRACKER_PATH, "utf-8"))
  } catch {
    return { posted: [], lastRun: null }
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
        "User-Agent": "PakistanNewsHub/2.0 (Facebook Auto-Poster; bot@pakistan-news.news)",
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
    "dawn", "dawn news", "express tribune", "the news international",
    "bbc", "al jazeera", "reuters", "associated press",
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

async function postArticleLink({ pageId, pageAccessToken, article, siteUrl }) {
  const articleUrl = `${siteUrl.replace(/\/$/, "")}/article/${article.slug}`

  const sourceName = article.sourceName || article.attribution || article.source || ""
  const excerpt = (article.excerpt || article.description || "").substring(0, 200)

  let message = article.title
  if (sourceName) {
    message += `\n\n— ${sourceName}`
  }
  if (excerpt) {
    message += `\n\n${excerpt}`
  }
  message += `\n\n#Pakistan #News`

  const apiUrl =
    `https://graph.facebook.com/v22.0/${pageId}/feed` +
    `?access_token=${encodeURIComponent(pageAccessToken)}` +
    `&message=${encodeURIComponent(message.substring(0, 63206))}` +
    `&link=${encodeURIComponent(articleUrl)}` +
    `&published=true`

  const result = await graphApiRequest(apiUrl, "POST")

  if (result.error) {
    console.error(`    Facebook API error: ${result.error.message || JSON.stringify(result.error)}`)
    return false
  }

  markPosted(article.slug)
  return true
}

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

  console.log(`  Facebook: posting ${top.length} top articles...`)
  let posted = 0
  let skipped = 0

  for (let i = 0; i < top.length; i++) {
    const a = top[i]
    const sourceName = a.sourceName || a.attribution || a.source || ""
    console.log(`    [${i + 1}/${top.length}] ${a.title.substring(0, 70)} (${sourceName})`)

    if (dryRun) {
      console.log(`      (dry-run — would post: ${siteUrl}/article/${a.slug})`)
      skipped++
      continue
    }

    const success = await postArticleLink({ pageId, pageAccessToken, article: a, siteUrl })
    if (success) {
      console.log(`      Posted: ${siteUrl}/article/${a.slug}`)
      posted++
    } else {
      console.error(`      Failed to post: ${a.title.substring(0, 60)}`)
      skipped++
    }

    if (i < top.length - 1) {
      await sleep(MIN_DELAY_MS)
    }
  }

  console.log(`  Facebook: ${posted} posted, ${skipped} skipped`)
  return { posted, skipped, total: top.length }
}

module.exports = {
  postTopArticles,
  selectTopArticles,
  hasBeenPosted,
  markPosted,
  loadTracker,
}
