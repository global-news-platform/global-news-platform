/**
 * Trending analytics and engagement tracking engine.
 * Tracks article views, calculates momentum scores,
 * detects trending topics, and computes "Most Read" rankings.
 */

const fs = require("fs")
const path = require("path")

const METRICS_FILE = path.join(__dirname, "..", "data", "metrics.json")
const TRENDING_FILE = path.join(__dirname, "..", "data", "trending.json")

function loadMetrics() {
  try {
    if (fs.existsSync(METRICS_FILE)) {
      return JSON.parse(fs.readFileSync(METRICS_FILE, "utf-8"))
    }
  } catch {}
  return { articles: {}, keywords: {}, daily: [] }
}

function saveMetrics(data) {
  const dir = path.dirname(METRICS_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(METRICS_FILE, JSON.stringify(data, null, 2))
}

function loadTrending() {
  try {
    if (fs.existsSync(TRENDING_FILE)) {
      return JSON.parse(fs.readFileSync(TRENDING_FILE, "utf-8"))
    }
  } catch {}
  return { trending: [], updatedAt: null }
}

function saveTrending(data) {
  const dir = path.dirname(TRENDING_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(TRENDING_FILE, JSON.stringify(data, null, 2))
}

function recordView(slug, title, category) {
  const metrics = loadMetrics()
  const now = Date.now()

  if (!metrics.articles[slug]) {
    metrics.articles[slug] = {
      title,
      category,
      views: 0,
      firstSeen: new Date().toISOString(),
      hourly: {},
    }
  }

  const article = metrics.articles[slug]
  article.views++
  article.lastSeen = new Date().toISOString()

  const hourKey = new Date().toISOString().slice(0, 13)
  article.hourly[hourKey] = (article.hourly[hourKey] || 0) + 1

  saveMetrics(metrics)
}

function getMomentum(slug) {
  const metrics = loadMetrics()
  const article = metrics.articles[slug]
  if (!article) return 0

  const now = Date.now()
  const hourMs = 3600000
  let recentViews = 0
  let olderViews = 0

  for (const [hour, count] of Object.entries(article.hourly)) {
    const hourTime = new Date(hour + ":00:00").getTime()
    if (now - hourTime < hourMs * 2) {
      recentViews += count
    } else {
      olderViews += count
    }
  }

  if (olderViews === 0) return recentViews > 0 ? 10 : 0
  return Math.round((recentViews / olderViews) * 100) / 100
}

function computeTrending(limit = 10) {
  const metrics = loadMetrics()
  const now = Date.now()
  const dayMs = 86400000

  const scored = Object.entries(metrics.articles)
    .filter(([, a]) => {
      const age = now - new Date(a.lastSeen || a.firstSeen).getTime()
      return age < dayMs * 3 // Only articles from last 3 days
    })
    .map(([slug, data]) => {
      const momentum = getMomentum(slug)
      const age = now - new Date(data.firstSeen).getTime()
      const ageHours = age / 3600000
      const velocity = ageHours > 0 ? data.views / ageHours : data.views

      return {
        slug,
        title: data.title,
        category: data.category,
        views: data.views,
        momentum,
        velocity: Math.round(velocity * 100) / 100,
        score: Math.round((data.views * 0.4 + momentum * 30 + velocity * 5) * 100) / 100,
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  const trending = { trending: scored, updatedAt: new Date().toISOString() }
  saveTrending(trending)
  return scored
}

function getTrending() {
  try {
    const data = loadTrending()
    // Recompute if older than 30 minutes
    if (
      data.updatedAt &&
      Date.now() - new Date(data.updatedAt).getTime() < 30 * 60 * 1000
    ) {
      return data.trending
    }
  } catch {}
  return computeTrending()
}

function getMostRead(limit = 5) {
  const metrics = loadMetrics()
  return Object.entries(metrics.articles)
    .sort(([, a], [, b]) => b.views - a.views)
    .slice(0, limit)
    .map(([slug, data]) => ({
      slug,
      title: data.title,
      category: data.category,
      views: data.views,
    }))
}

function trackKeyword(keyword) {
  const metrics = loadMetrics()
  const day = new Date().toISOString().slice(0, 10)
  if (!metrics.keywords[keyword]) {
    metrics.keywords[keyword] = {}
  }
  metrics.keywords[keyword][day] = (metrics.keywords[keyword][day] || 0) + 1
  saveMetrics(metrics)
}

function getHotKeywords(limit = 10) {
  const metrics = loadMetrics()
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  const scored = Object.entries(metrics.keywords)
    .map(([keyword, days]) => {
      const todayCount = days[today] || 0
      const yesterdayCount = days[yesterday] || 0
      const momentum = yesterdayCount > 0 ? todayCount / yesterdayCount : todayCount
      return { keyword, todayCount, momentum, score: todayCount * momentum }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return scored
}

function computeDailyMetrics() {
  const metrics = loadMetrics()
  const today = new Date().toISOString().slice(0, 10)

  const totalViews = Object.values(metrics.articles).reduce(
    (sum, a) => sum + a.views,
    0,
  )
  const totalArticles = Object.keys(metrics.articles).length

  metrics.daily.push({
    date: today,
    totalViews,
    totalArticles,
    timestamp: new Date().toISOString(),
  })

  // Keep last 90 days
  if (metrics.daily.length > 90) {
    metrics.daily = metrics.daily.slice(-90)
  }

  saveMetrics(metrics)
  return { totalViews, totalArticles }
}

module.exports = {
  recordView,
  getMomentum,
  computeTrending,
  getTrending,
  getMostRead,
  trackKeyword,
  getHotKeywords,
  computeDailyMetrics,
}
