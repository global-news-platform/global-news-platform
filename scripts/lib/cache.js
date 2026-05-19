/**
 * Response cache for RSS fetching.
 * Reduces repeated network requests within TTL window.
 */

const fs = require("fs")
const path = require("path")

const CACHE_DIR = path.join(__dirname, "..", "data", "cache")
const DEFAULT_TTL = 15 * 60 * 1000 // 15 minutes

function ensureDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }
}

function cacheKey(url) {
  return Buffer.from(url).toString("base64").slice(0, 64).replace(/[/+=]/g, "_")
}

function get(url, ttl = DEFAULT_TTL) {
  ensureDir()
  const key = cacheKey(url)
  const filePath = path.join(CACHE_DIR, `${key}.json`)

  try {
    if (!fs.existsSync(filePath)) return null
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"))
    if (Date.now() - data.timestamp > ttl) {
      fs.unlinkSync(filePath)
      return null
    }
    return data.payload
  } catch {
    return null
  }
}

function set(url, payload) {
  ensureDir()
  const key = cacheKey(url)
  const filePath = path.join(CACHE_DIR, `${key}.json`)

  try {
    fs.writeFileSync(
      filePath,
      JSON.stringify({ timestamp: Date.now(), payload }),
      "utf-8",
    )
  } catch {
    // Silently fail on cache write errors
  }
}

function clear() {
  ensureDir()
  const files = fs.readdirSync(CACHE_DIR)
  for (const f of files) {
    fs.unlinkSync(path.join(CACHE_DIR, f))
  }
}

function stats() {
  ensureDir()
  const files = fs.readdirSync(CACHE_DIR)
  let size = 0
  for (const f of files) {
    try {
      size += fs.statSync(path.join(CACHE_DIR, f)).size
    } catch {}
  }
  return { count: files.length, sizeBytes: size }
}

module.exports = { get, set, clear, stats }
