const fs = require("fs")
const path = require("path")

const TRACKER_PATH = path.join(__dirname, "../../src/data/.tracker.json")

function load() {
  if (!fs.existsSync(TRACKER_PATH)) return { seen: [], processed: 0 }
  try {
    return JSON.parse(fs.readFileSync(TRACKER_PATH, "utf-8"))
  } catch {
    return { seen: [], processed: 0 }
  }
}

function save(state) {
  fs.mkdirSync(path.dirname(TRACKER_PATH), { recursive: true })
  fs.writeFileSync(TRACKER_PATH, JSON.stringify(state, null, 2), "utf-8")
}

function isDuplicate(guid) {
  const state = load()
  return state.seen.includes(guid)
}

function markProcessed(guid) {
  const state = load()
  if (!state.seen.includes(guid)) {
    state.seen.push(guid)
    state.processed = (state.processed || 0) + 1
    if (state.seen.length > 10000) {
      state.seen = state.seen.slice(-5000)
    }
    save(state)
  }
}

function getStats() {
  const state = load()
  return {
    totalSeen: state.seen.length,
    totalProcessed: state.processed || 0,
  }
}

function reset() {
  save({ seen: [], processed: 0 })
}

module.exports = {
  isDuplicate,
  markProcessed,
  getStats,
  reset,
  load,
}
