const fs = require("fs")
const path = require("path")
const crypto = require("crypto")

const PROCESSED_FILE = path.join(__dirname, "..", "data", "processed.json")
const SIMILARITY_THRESHOLD = 0.7

function loadProcessed() {
  try {
    if (fs.existsSync(PROCESSED_FILE)) {
      return JSON.parse(fs.readFileSync(PROCESSED_FILE, "utf-8"))
    }
  } catch {}
  return {}
}

function saveProcessed(data) {
  const dir = path.dirname(PROCESSED_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(PROCESSED_FILE, JSON.stringify(data, null, 2))
}

function urlHash(url) {
  return crypto.createHash("sha1").update(url).digest("hex").slice(0, 12)
}

function tokenize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2)
}

function cosineSimilarity(a, b) {
  const tokensA = tokenize(a)
  const tokensB = tokenize(b)

  if (tokensA.length === 0 || tokensB.length === 0) return 0

  const freqA = {}
  const freqB = {}

  for (const t of tokensA) freqA[t] = (freqA[t] || 0) + 1
  for (const t of tokensB) freqB[t] = (freqB[t] || 0) + 1

  const allTokens = new Set([...Object.keys(freqA), ...Object.keys(freqB)])

  let dotProduct = 0
  let magA = 0
  let magB = 0

  for (const t of allTokens) {
    const a = freqA[t] || 0
    const b = freqB[t] || 0
    dotProduct += a * b
    magA += a * a
    magB += b * b
  }

  if (magA === 0 || magB === 0) return 0
  return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB))
}

function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/["""'']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function isDuplicate(url, title) {
  const processed = loadProcessed()

  const normalizedTitle = normalizeTitle(title)

  if (!normalizedTitle || normalizedTitle.length < 5) return true

  if (processed[urlHash(url)]) return true

  const entries = Object.values(processed)
  const recent = entries.slice(-100)

  for (const entry of recent) {
    if (entry.title) {
      const normalizedEntry = normalizeTitle(entry.title)
      if (cosineSimilarity(normalizedTitle, normalizedEntry) > SIMILARITY_THRESHOLD) {
        return true
      }
    }
  }

  return false
}

function markProcessed(url, slug, title) {
  const processed = loadProcessed()
  processed[urlHash(url)] = { slug, title, at: new Date().toISOString() }
  saveProcessed(processed)
}

function count() {
  return Object.keys(loadProcessed()).length
}

module.exports = { isDuplicate, markProcessed, count, cosineSimilarity }
