/**
 * Source health monitoring.
 * Tracks fetch success/failure per source and computes reliability scores.
 */

const fs = require("fs")
const path = require("path")

const FILE = path.join(__dirname, "..", "data", "source-health.json")
const MAX_RECORDS = 100

function load() {
  try {
    if (fs.existsSync(FILE)) return JSON.parse(fs.readFileSync(FILE, "utf-8"))
  } catch {}
  return {}
}

function save(data) {
  const dir = path.dirname(FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2))
}

function recordResult(sourceLabel, ok, errorMsg) {
  const data = load()
  if (!data[sourceLabel]) {
    data[sourceLabel] = { history: [], createdAt: new Date().toISOString() }
  }

  data[sourceLabel].history.push({
    ok,
    error: errorMsg || null,
    at: new Date().toISOString(),
  })

  // Trim history
  if (data[sourceLabel].history.length > MAX_RECORDS) {
    data[sourceLabel].history = data[sourceLabel].history.slice(-MAX_RECORDS)
  }

  data[sourceLabel].updatedAt = new Date().toISOString()
  save(data)
}

function getScore(sourceLabel) {
  const data = load()
  const entry = data[sourceLabel]
  if (!entry || entry.history.length < 3) return 1.0

  const recent = entry.history.slice(-20)
  const successes = recent.filter((r) => r.ok).length
  return Math.round((successes / recent.length) * 100) / 100
}

function getStatus(sourceLabel) {
  const data = load()
  const entry = data[sourceLabel]
  if (!entry) return { score: 1.0, lastFetch: null, lastError: null }

  const last = entry.history[entry.history.length - 1] || null
  const score = getScore(sourceLabel)

  return {
    score,
    lastFetch: last?.at || null,
    lastError: last?.ok === false ? last.error : null,
    healthy: score >= 0.7,
  }
}

function getUnhealthySources() {
  const data = load()
  const unhealthy = []
  for (const label of Object.keys(data)) {
    if (getScore(label) < 0.7) {
      unhealthy.push(label)
    }
  }
  return unhealthy
}

function getAllStatuses() {
  const data = load()
  const result = {}
  for (const label of Object.keys(data)) {
    result[label] = getStatus(label)
  }
  return result
}

module.exports = {
  recordResult,
  getScore,
  getStatus,
  getUnhealthySources,
  getAllStatuses,
}
