const crypto = require("crypto")

const STOPWORDS = new Set([
  "the","and","for","are","but","not","you","all","can","had","her","was",
  "one","our","out","has","have","been","its","more","some","them","than",
  "very","just","about","over","such","into","other","their","there",
  "these","those","would","could","should","also","because","after",
  "before","between","through","during","without","within","along",
  "around","behind","beneath","beside","beyond","inside","outside",
  "upon","across","against","amid","among","despite","except","until",
  "toward","underneath","throughout","through","via","while","since",
  "although","though","unless","whether","however","therefore","hence",
  "thus","otherwise","nevertheless","nonetheless","meanwhile","further",
  "furthermore","moreover","according","enough","indeed","instead",
  "likewise","quite","rather","regardless","still","surely","well","yet",
  "get","got","make","made","said","says","going","take","took","see",
  "know","think","want","give","find","tell","become","leave","feel",
  "put","bring","begin","keep","hold","write","stand","hear","let",
  "mean","set","meet","run","pay","sit","speak","lie","lead","read",
  "grow","lose","fall","send","build","understand","draw","break",
  "spend","cut","rise","drive","buy","wear","choose","seek","throw",
  "catch","reveal","report","according","year","years","time","people",
  "first","last","week","weeks","month","months","day","days","much",
  "many","well","way","new","old","even","still","back","long","part",
  "world","every","general","state","states","united","including",
  "while","across","within","without","after","before","between",
  "through","during","because","about","under","though","against",
])

const CATEGORY_TAGS = {
  world: ["international", "global-affairs", "diplomacy", "geopolitics"],
  politics: ["policy", "government", "election", "congress", "legislation"],
  business: ["economy", "markets", "finance", "trade", "investment"],
  technology: ["tech", "innovation", "digital", "artificial-intelligence", "cybersecurity"],
  science: ["research", "discovery", "scientific", "space", "biotechnology"],
  health: ["healthcare", "medicine", "wellness", "disease", "treatment"],
  climate: ["environment", "climate-change", "sustainability", "energy", "emissions"],
  culture: ["arts", "entertainment", "film", "music", "society"],
  sports: ["athletics", "championship", "league", "tournament"],
  opinion: ["commentary", "analysis", "perspective", "editorial"],
}

const TOPIC_MAP = {
  "artificial-intelligence":"artificial-intelligence",ai:"artificial-intelligence",
  climate:"climate-change","climate-change":"climate-change",
  economy:"economy",economic:"economy",market:"markets",markets:"markets",
  stock:"markets",election:"election","united-states":"us-politics",
  china:"china",russia:"russia",ukraine:"ukraine",europe:"europe",
  "middle-east":"middle-east",israel:"israel",africa:"africa",
  carbon:"emissions",emissions:"emissions",renewable:"renewable-energy",
  "fossil-fuels":"fossil-fuels","nuclear-energy":"nuclear-energy",
  "supreme-court":"supreme-court",congress:"congress",senate:"congress",
  "white-house":"white-house","federal-reserve":"federal-reserve",
  inflation:"inflation",recession:"recession",tariffs:"trade",trade:"trade",
  technology:"technology",cybersecurity:"cybersecurity","social-media":"social-media",
  "space-exploration":"space",nasa:"space",space:"space",
  "artificial-intelligence":"artificial-intelligence","machine-learning":"machine-learning",
  "gene-therapy":"gene-therapy",vaccine:"vaccine",vaccines:"vaccine",
  cancer:"cancer","mental-health":"mental-health",covid:"covid-19","covid-19":"covid-19",
  pandemic:"covid-19",biotechnology:"biotechnology",
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function tokenize(text) {
  return text.toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w))
}

function extractTopics(text, max = 6) {
  if (!text) return []
  const words = tokenize(text)
  const freq = {}
  for (const w of words) freq[w] = (freq[w] || 0) + 1

  const bigrams = []
  for (let i = 0; i < words.length - 1; i++) bigrams.push(`${words[i]}-${words[i + 1]}`)
  const bfreq = {}
  for (const b of bigrams) bfreq[b] = (bfreq[b] || 0) + 1

  const topBigrams = Object.entries(bfreq).sort((a, b) => b[1] - a[1]).slice(0, 4).map(e => e[0])
  const topWords = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, max).map(e => e[0])

  return [...new Set([...topBigrams, ...topWords])].slice(0, max)
}

function generateTags(topics, category) {
  const seen = new Set()
  const tags = []

  for (const t of topics) {
    const mapped = TOPIC_MAP[t]
    if (mapped && !seen.has(mapped)) { tags.push(mapped); seen.add(mapped) }
  }
  for (const t of (CATEGORY_TAGS[category] || [])) {
    if (!seen.has(t)) { tags.push(t); seen.add(t) }
  }
  return tags.slice(0, 8)
}

function detectBreaking(text) {
  const triggers = ["breaking","urgent","emergency","crisis","explosion","attack",
    "earthquake","tsunami","warning","disaster","massive","deadly","fatal"]
  const lower = text.toLowerCase()
  return triggers.some(t => lower.includes(t))
}

function generateArticleSlug(title) {
  const base = slugify(title).slice(0, 60)
  const suffix = crypto.randomBytes(3).toString("hex")
  return `${base}-${suffix}`
}

function buildFrontmatter(raw, topics) {
  const tags = generateTags(topics, raw.category)
  const isBreaking = detectBreaking(raw.title + " " + raw.excerpt)

  return {
    title: raw.title,
    excerpt: raw.excerpt,
    category: raw.category.charAt(0).toUpperCase() + raw.category.slice(1),
    author: raw.author,
    authorSlug: slugify(raw.author),
    publishedAt: raw.publishedAt,
    image: raw.imageUrl ? `/images/articles/${slugify(raw.title).slice(0, 40)}.jpg` : "",
    imageAlt: raw.title,
    tags,
    featured: isBreaking,
    breaking: isBreaking,
    trending: isBreaking,
  }
}

function formatMdx(fm, body) {
  const lines = Object.entries(fm)
    .map(([k, v]) => {
      if (!v && v !== false) return null
      if (Array.isArray(v)) return `${k}: [${v.map(t => `"${t}"`).join(", ")}]`
      if (typeof v === "boolean") return `${k}: ${v}`
      if (typeof v === "string" && /^[-\w]+$/.test(v)) return `${k}: ${v}`
      return `${k}: "${v.replace(/"/g, '\\"')}"`
    })
    .filter(Boolean)

  return `---\n${lines.join("\n")}\n---\n\n${body.trim()}\n`
}

module.exports = { extractTopics, generateTags, buildFrontmatter, formatMdx, slugify, generateArticleSlug }
