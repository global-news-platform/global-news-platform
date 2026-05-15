const fs = require("fs")
const path = require("path")
const crypto = require("crypto")

const FILE = path.join(__dirname, "..", "data", "processed.json")

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

function hash(url) {
  return crypto.createHash("sha1").update(url).digest("hex").slice(0, 12)
}

function isProcessed(url) {
  const store = load()
  return !!store[hash(url)]
}

function markProcessed(url, slug) {
  const store = load()
  store[hash(url)] = { slug, at: new Date().toISOString() }
  save(store)
}

function count() {
  return Object.keys(load()).length
}

module.exports = { isProcessed, markProcessed, count }
