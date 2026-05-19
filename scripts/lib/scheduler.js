/**
 * Intelligent publishing scheduler.
 * Manages article publishing cadence, prioritizes breaking news,
 * spaces content evenly across categories.
 */

const fs = require("fs")
const path = require("path")

const SCHEDULE_FILE = path.join(__dirname, "..", "data", "schedule.json")
const METRICS_FILE = path.join(__dirname, "..", "data", "metrics.json")

const DEFAULT_INTERVAL_MINUTES = 30
const BREAKING_PRIORITY = 1
const STANDARD_PRIORITY = 2
const MIN_GAP_MINUTES = 5

function loadSchedule() {
  try {
    if (fs.existsSync(SCHEDULE_FILE)) {
      return JSON.parse(fs.readFileSync(SCHEDULE_FILE, "utf-8"))
    }
  } catch {}
  return { queue: [], history: [] }
}

function saveSchedule(data) {
  const dir = path.dirname(SCHEDULE_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(data, null, 2))
}

function enqueue(articles) {
  const schedule = loadSchedule()

  for (const article of articles) {
    const exists = schedule.queue.find((a) => a.slug === article.slug)
    if (!exists) {
      schedule.queue.push({
        ...article,
        priority: article.breaking ? BREAKING_PRIORITY : STANDARD_PRIORITY,
        queuedAt: new Date().toISOString(),
      })
    }
  }

  // Sort: breaking first, then by publishedAt descending
  schedule.queue.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority
    return new Date(b.publishedAt) - new Date(a.publishedAt)
  })

  saveSchedule(schedule)
  return schedule.queue.length
}

function getNext() {
  const schedule = loadSchedule()
  if (schedule.queue.length === 0) return null

  // Check if enough time has passed since last publish
  if (schedule.history.length > 0) {
    const lastPublish = new Date(schedule.history[0].publishedAt)
    const minutesSince = (Date.now() - lastPublish.getTime()) / 60000
    if (minutesSince < MIN_GAP_MINUTES) return null
  }

  return schedule.queue[0]
}

function publish(slug) {
  const schedule = loadSchedule()
  const index = schedule.queue.findIndex((a) => a.slug === slug)
  if (index === -1) return false

  const article = schedule.queue[index]
  schedule.queue.splice(index, 1)

  schedule.history.unshift({
    slug: article.slug,
    title: article.title,
    category: article.category,
    publishedAt: new Date().toISOString(),
    originalDate: article.publishedAt,
  })

  // Keep last 100 history entries
  if (schedule.history.length > 100) {
    schedule.history = schedule.history.slice(0, 100)
  }

  saveSchedule(schedule)
  return true
}

function getQueue() {
  return loadSchedule().queue
}

function getHistory(limit = 20) {
  return loadSchedule().history.slice(0, limit)
}

function queueStats() {
  const schedule = loadSchedule()
  const byCategory = {}
  for (const item of schedule.queue) {
    const cat = item.category || "uncategorized"
    byCategory[cat] = (byCategory[cat] || 0) + 1
  }

  return {
    total: schedule.queue.length,
    byCategory,
    lastPublished: schedule.history[0] || null,
    totalPublished: schedule.history.length,
  }
}

module.exports = {
  enqueue,
  getNext,
  publish,
  getQueue,
  getHistory,
  queueStats,
}
