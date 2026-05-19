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

const ESCAPED_QUOTE_PATTERNS = [
  [/\\"/g, '"'],
  [/\\'/g, "'"],
  [/&quot;/g, '"'],
  [/&#39;/g, "'"],
  [/&#x27;/g, "'"],
]

function sanitizeText(text) {
  if (!text) return ""
  let result = String(text)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, "")
    .normalize("NFC")
  for (const [pattern, replacement] of ESCAPED_QUOTE_PATTERNS) {
    result = result.replace(pattern, replacement)
  }
  result = result.replace(/\s+/g, " ").trim()
  return result
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

function generateArticleSlug(title, usedSlugs = new Set()) {
  let base = slugify(title).slice(0, 60)
  if (!base) base = "article"
  if (usedSlugs.has(base)) {
    let i = 1
    while (usedSlugs.has(`${base}-${i}`)) i++
    return `${base}-${i}`
  }
  return base
}

function buildFrontmatter(raw, topics) {
  const safeCategory = raw.category || "World"
  const tags = generateTags(topics, safeCategory.toLowerCase())
  const isBreaking = detectBreaking(raw.title + " " + raw.excerpt)

  return {
    title: sanitizeText(raw.title),
    excerpt: sanitizeText(raw.excerpt),
    category: safeCategory.charAt(0).toUpperCase() + safeCategory.slice(1),
    author: sanitizeText(raw.author) || "Staff",
    authorSlug: slugify(raw.author || "staff"),
    publishedAt: raw.publishedAt,
    image: "",
    imageAlt: sanitizeText(raw.imageAlt) || sanitizeText(raw.title),
    tags,
    readingTime: raw.readingTime || 5,
    featured: Boolean(raw.featured) || isBreaking,
    breaking: Boolean(raw.breaking) || isBreaking,
    trending: Boolean(raw.trending) || isBreaking,
  }
}

function formatMdx(fm, body) {
  const lines = Object.entries(fm)
    .map(([k, v]) => {
      if (v === null || v === undefined) return null
      if (v === false && k !== "featured" && k !== "breaking" && k !== "trending") return null
      if (Array.isArray(v)) {
        return `${k}: [${v.map(t => `"${t}"`).join(", ")}]`
      }
      if (typeof v === "boolean") return `${k}: ${v}`
      const strVal = String(v).replace(/\\/g, "\\\\").replace(/"/g, '\\"')
      return `${k}: "${strVal}"`
    })
    .filter(Boolean)

  return `---\n${lines.join("\n")}\n---\n\n${(body || "").trim()}\n`
}

module.exports = { extractTopics, generateTags, buildFrontmatter, formatMdx, slugify, generateArticleSlug, sanitizeText }
