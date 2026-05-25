const https = require("https")
const http = require("http")

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http
    const req = protocol.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent": "GlobalNewsBot/1.0 (PakistanNewsBot; image search)",
        Accept: "application/json",
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchJson(res.headers.location).then(resolve).catch(reject)
        return
      }
      if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}`)); return }
      let data = ""
      res.on("data", (chunk) => data += chunk.toString())
      res.on("end", () => {
        try { resolve(JSON.parse(data)) } catch (e) { reject(new Error("Invalid JSON")) }
      })
    })
    req.on("error", reject)
    req.on("timeout", () => { req.destroy(); reject(new Error("Timeout")) })
  })
}

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "its", "has", "was", "are", "were", "been",
  "new", "after", "into", "over", "than", "about", "their", "that", "this",
  "what", "when", "where", "there", "which", "who", "whom", "how", "why",
  "only", "other", "such", "also", "just", "more", "some", "these", "those",
  "very", "your", "make", "like", "know", "take", "look", "come", "give",
  "use", "find", "tell", "ask", "seem", "feel", "try", "leave", "call",
  "could", "would", "should", "will", "can", "may", "might", "must",
  "still", "even", "much", "most", "many", "too", "way", "back", "well",
  "down", "up", "out", "off", "over", "own", "old", "year", "first",
  "last", "next", "top", "big", "high", "long", "part", "day", "set",
  "side", "end", "head", "hand", "fact", "got", "get", "go", "do", "done",
  "going", "getting", "does", "did", "doing", "said", "says", "made",
  "making", "seen", "seeing", "told", "tells", "shows", "shown",
  "since", "until", "during", "before", "after", "above", "below",
  "getty", "images", "via", "photo", "photograph", "file", "image",
])

function extractKeywords(title) {
  if (!title) return []
  const words = title.replace(/[^a-zA-Z0-9\s-]/g, "").split(/\s+/).filter(w => w.length > 2)
  const significant = words.filter(w => !STOP_WORDS.has(w.toLowerCase()))
  const properNouns = words.filter(w => w[0] === w[0].toUpperCase() && w[0].toLowerCase() !== w[0])
  const unique = [...new Set([...properNouns, ...significant])]
  return unique.slice(0, 8)
}

async function getWikipediaImage(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  try {
    const data = await fetchJson(url)
    if (data.thumbnail && data.thumbnail.source) {
      let src = data.thumbnail.source
      src = src.replace(/\/\d+px-/, "/1200px-")
      return { url: src, source: "wikipedia", width: 1200, height: data.thumbnail.height || 800, pageTitle: data.title }
    }
    return null
  } catch {
    return null
  }
}

async function searchWikipediaEntity(entity) {
  if (!entity || entity.length < 2) return null
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(entity)}&srlimit=1&format=json&origin=*`
  try {
    const data = await fetchJson(searchUrl)
    if (!data.query || !data.query.search || data.query.search.length === 0) return null
    const pageTitle = data.query.search[0].title
    const imgUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&pithumbsize=1200&format=json&origin=*`
    const imgData = await fetchJson(imgUrl)
    if (!imgData.query || !imgData.query.pages) return null
    for (const page of Object.values(imgData.query.pages)) {
      if (page.thumbnail && page.thumbnail.source) {
        let src = page.thumbnail.source
        src = src.replace(/\/\d+px-/, "/1200px-")
        return { url: src, source: "wikipedia", width: 1200, height: page.thumbnail.height || 800, pageTitle: page.title }
      }
    }
    return null
  } catch {
    return null
  }
}

async function searchImage(title) {
  const keywords = extractKeywords(title)
  if (!keywords || keywords.length === 0) return null

  for (const keyword of keywords) {
    if (keyword.length < 3) continue

    const wikiResult = await getWikipediaImage(keyword)
    if (wikiResult) {
      console.log(`    Wikipedia image found for entity "${keyword}": ${wikiResult.pageTitle}`)
      return wikiResult
    }
  }

  for (const keyword of keywords) {
    if (keyword.length < 3) continue

    const wikiResult = await searchWikipediaEntity(keyword)
    if (wikiResult) {
      console.log(`    Wikipedia image found via search for "${keyword}": ${wikiResult.pageTitle}`)
      return wikiResult
    }
  }

  return null
}

module.exports = { searchImage, searchWikipediaEntity, getWikipediaImage, extractKeywords }
