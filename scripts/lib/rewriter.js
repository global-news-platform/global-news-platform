const SYNONYMS = {
  "killed": ["died", "fatally wounded", "lost their life", "perished"],
  "forecast": ["prediction", "outlook", "projection", "estimate"],
  "milder": ["calmer", "less intense", "weaker", "more moderate"],
  "normal": ["usual", "typical", "average", "expected levels"],
  "thanks to": ["due to", "because of", "attributed to", "driven by"],
  "hurricane": ["tropical cyclone", "storm", "typhoon", "severe storm"],
  "season": ["period", "cycle", "phase", "annual window"],
  "storm": ["tempest", "cyclone", "weather system", "severe weather"],
  "flood": ["inundation", "deluge", "overflow", "submersion"],
  "fire": ["blaze", "inferno", "configration", "flames"],
  "earthquake": ["temblor", "seismic event", "quake", "seismic activity"],
  "death toll": ["casualty count", "fatality count", "number of dead", "body count"],
  "injured": ["wounded", "hurt", "hospitalized", "casualties"],
  "surge": ["spike", "upsurge", "rapid increase", "sharp rise"],
  "emergency": ["crisis", "urgent situation", "critical incident", "disaster"],
  "disaster": ["catastrophe", "tragedy", "calamity", "cataclysm"],
  "warning": ["advisory", "alert", "cautionary notice", "red flag"],
  "threat": ["danger", "menace", "risk", "peril"],
  "deadly": ["lethal", "fatal", "mortal", "catastrophic"],
  "powerful": ["mighty", "immense", "forceful", "devastating"],
  "massive": ["enormous", "colossal", "vast", "large-scale"],
  "major": ["significant", "substantial", "far-reaching", "wide-ranging"],
  "destroy": ["devastate", "wreck", "ravage", "demolish"],
  "damage": ["destruction", "devastation", "harm", "wreckage"],
  "rescue": ["salvage", "recovery operation", "emergency response", "relief effort"],
  "survivors": ["those rescued", "victims found alive", "the living victims", "rescued individuals"],
  "official": ["authority", "representative", "spokesperson", "administration"],
  "governor": ["state leader", "provincial chief", "state executive", "governorship"],
  "state of emergency": ["emergency declaration", "crisis measures", "emergency rule", "disaster declaration"],
  "chemical": ["toxic", "hazardous", "dangerous substances", "industrial chemicals"],
  "kills": ["claims", "results in the death of", "leads to the death of", "causes the death of"],
  "killing": ["deadly", "fatal", "lethal", "death-causing"],
  "attack": ["strike", "assault", "offensive", "onslaught"],
  "launch": ["unveil", "roll out", "introduce", "debut"],
  "declared": ["announced", "stated", "proclaimed", "asserted"],
  "report": ["study", "findings", "analysis", "briefing"],
  "warn": ["caution", "alert", "advise", "flag"],
  "boost": ["surge", "uptick", "increase", "rise"],
  "drop": ["decline", "fall", "downturn", "slide"],
  "plan": ["proposal", "initiative", "blueprint", "roadmap"],
  "deal": ["agreement", "accord", "pact", "settlement"],
  "crisis": ["emergency", "critical situation", "turmoil", "upheaval"],
  "talks": ["negotiations", "discussions", "dialogue", "deliberations"],
  "ban": ["prohibit", "block", "restrict", "outlaw"],
  "protest": ["demonstration", "rally", "sit-in", "walkout"],
  "election": ["vote", "poll", "ballot", "referendum"],
  "leader": ["chief", "head", "principal", "top official"],
  "official": ["authority", "representative", "spokesperson", "administration"],
  "investigation": ["inquiry", "probe", "review", "examination"],
  "charge": ["accuse", "indict", "file charges against", "prosecute"],
  "court": ["tribunal", "bench", "judiciary", "legal forum"],
  "research": ["investigation", "academic work", "scholarly inquiry", "examination"],
  "scientists": ["researchers", "experts", "academics", "scholars"],
  "study": ["analysis", "research paper", "investigation", "scientific work"],
  "found": ["discovered", "identified", "established", "determined"],
  "significant": ["notable", "substantial", "major", "considerable"],
  "important": ["critical", "crucial", "vital", "pivotal"],
  "says": ["states", "asserts", "notes", "emphasizes"],
  "according to": ["per", "as per", "based on", "citing"],
  "expected": ["anticipated", "projected", "forecast", "predicted"],
  "possible": ["potential", "feasible", "conceivable", "plausible"],
  "first": ["inaugural", "maiden", "initial", "premier"],
  "new": ["fresh", "recent", "emerging", "latest"],
  "major": ["significant", "substantial", "far-reaching", "wide-ranging"],
  "global": ["worldwide", "international", "planet-wide", "across the world"],
  "country": ["nation", "state", "sovereign state", "territory"],
  "government": ["administration", "regime", "authorities", "ruling body"],
  "company": ["firm", "corporation", "enterprise", "organization"],
  "industry": ["sector", "field", "trade", "market"],
  "technology": ["tech", "innovation", "digital advancement", "technological development"],
  "digital": ["online", "virtual", "electronic", "tech-driven"],
  "security": ["safety", "protection", "defense", "safeguard"],
  "military": ["armed forces", "defense forces", "military establishment", "uniformed services"],
  "peace": ["stability", "calm", "truce", "harmony"],
  "war": ["conflict", "hostilities", "armed conflict", "warfare"],
  "economy": ["economic landscape", "financial system", "economy sector", "market conditions"],
  "financial": ["monetary", "economic", "fiscal", "pecuniary"],
  "market": ["bourse", "exchange", "trading floor", "marketplace"],
  "price": ["cost", "rate", "value", "valuation"],
  "health": ["well-being", "medical health", "physical condition", "healthcare"],
  "hospital": ["medical center", "healthcare facility", "clinic", "medical institute"],
  "patient": ["individual", "person under treatment", "case", "recipient of care"],
  "disease": ["illness", "condition", "disorder", "ailment"],
  "treatment": ["therapy", "medical care", "intervention", "regimen"],
  "climate": ["weather patterns", "climatic conditions", "environmental conditions", "atmospheric conditions"],
  "environment": ["ecosystem", "natural world", "ecology", "surroundings"],
  "energy": ["power", "fuel resources", "energy supply", "power generation"],
  "china": ["Beijing", "China's government", "Chinese authorities", "the People's Republic"],
  "russia": ["Moscow", "the Kremlin", "Russian authorities", "Russia's government"],
  "iran": ["Tehran", "Iranian authorities", "the Islamic Republic", "Iran's government"],
  "ukraine": ["Kyiv", "Ukrainian authorities", "Ukraine's government", "the Ukrainian government"],
  "israel": ["Tel Aviv", "Israeli authorities", "Israel's government", "the Israeli government"],
  "pakistan": ["Islamabad", "Pakistani authorities", "Pakistan's government", "the Pakistani government"],
  "india": ["New Delhi", "Indian authorities", "India's government", "the Indian government"],
  "afghanistan": ["Kabul", "Afghan authorities", "Afghanistan's government", "the Afghan government"],
  "president": ["head of state", "chief executive", "presidential office", "the administration"],
  "prime minister": ["premier", "head of government", "chief minister", "the premier"],
  "minister": ["secretary", "cabinet member", "government minister", "department head"],
  "ambassador": ["diplomatic envoy", "envoy", "diplomatic representative", "emissary"],
  "united states": ["the US", "Washington", "America", "the United States of America"],
  "britain": ["the UK", "London", "the United Kingdom", "Britain's government"],
  "europe": ["the European continent", "European nations", "Europe's countries", "the EU"],
  "united nations": ["the UN", "the world body", "the international organization", "the UN body"],
  "nato": ["the Atlantic alliance", "the Western alliance", "the military bloc", "the alliance"],
  "world bank": ["the international lending institution", "the global financial body", "the Washington-based lender"],
  "imf": ["the International Monetary Fund", "the global lender", "the Washington-based fund"],
  "supreme court": ["the highest court", "the apex court", "the top judicial body", "the superior court"],
  "parliament": ["legislature", "the house", "the legislative body", "the national assembly"],
  "senate": ["the upper house", "the upper chamber", "the senatorial body"],
}

const INTRO_TEMPLATES = [
  "In a developing story, {excerpt}",
  "New details emerge: {excerpt}",
  "{title}. {excerpt}",
  "Reports indicate that {excerpt_lower}",
  "According to officials, {excerpt_lower}",
  "{excerpt}",
  "Latest updates: {title}. {excerpt}",
  "{title} — {source} reports that {excerpt_lower}",
]

const BREAKING_TEMPLATES = [
  "BREAKING: {title}. {source} reports that {excerpt_lower}",
  "{title}. This is a developing story from {source}. {excerpt}",
  "Just in: {title}. {excerpt_lower}",
  "BREAKING UPDATE: {title}. According to {source}, {excerpt_lower}",
]

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function lowercaseFirst(str) {
  if (!str) return ""
  return str.charAt(0).toLowerCase() + str.slice(1)
}

function replaceSynonyms(text) {
  if (!text) return text
  let result = text
  const entries = Object.entries(SYNONYMS).sort((a, b) => b[0].length - a[0].length)

  for (const [word, synonyms] of entries) {
    const lowerResult = result.toLowerCase()
    const idx = lowerResult.indexOf(word)
    if (idx >= 0) {
      const replacement = pickRandom(synonyms)
      result = result.substring(0, idx) + replacement + result.substring(idx + word.length)
    }
  }

  return result
}

function rewriteTitle(title) {
  if (!title) return ""

  const colonIdx = title.indexOf(":")
  let prefix = ""
  let mainTitle = title

  if (colonIdx > 0 && colonIdx < 40) {
    prefix = title.substring(0, colonIdx).trim()
    mainTitle = title.substring(colonIdx + 1).trim()
  }

  const prefixPatterns = {
    "how": ["The story behind", "What to know about", "Understanding", "Here's how"],
    "why": ["The reason", "What's behind", "The story of", "Here's why"],
    "what": ["Everything you need to know about", "What to know about", "The latest on", "Here's what"],
  }

  const firstWord = prefix.toLowerCase().split(/\s+/)[0]
  if (prefix && prefixPatterns[firstWord]) {
    const newPrefix = pickRandom(prefixPatterns[firstWord])
    return `${newPrefix} ${mainTitle}`
  }

  const main = mainTitle || title
  const synonymTitle = replaceSynonyms(main)

  if (synonymTitle !== main) return synonymTitle

  const words = main.split(" ")
  if (words.length >= 3) {
    return [words[1], words[0], ...words.slice(2)].join(" ")
  }

  return main
}

function rewriteExcerpt(title, excerpt, sourceName, isBreaking) {
  if (!excerpt && !title) return ""

  const synExcerpt = replaceSynonyms(excerpt || title)
  const synSource = sourceName || "news sources"

  const templates = isBreaking ? BREAKING_TEMPLATES : INTRO_TEMPLATES

  const template = pickRandom(templates)
  let result = template
    .replace(/{title}/g, title)
    .replace(/{excerpt}/g, synExcerpt)
    .replace(/{excerpt_lower}/g, lowercaseFirst(synExcerpt))
    .replace(/{source}/g, synSource)

  return result
}

async function rewriteArticle(article, apiKey) {
  const originalTitle = article.title || ""
  const originalExcerpt = (article.excerpt || article.description || "").substring(0, 500)
  const sourceName = article.sourceName || article.attribution || article.source || ""

  const rewrittenTitle = rewriteTitle(originalTitle)
  const rewrittenExcerpt = rewriteExcerpt(rewrittenTitle, originalExcerpt, sourceName, article.breaking)

  return { title: rewrittenTitle, excerpt: rewrittenExcerpt }
}

async function rewriteBatch(articles, apiKey) {
  const rewritten = []
  for (const article of articles) {
    const result = await rewriteArticle(article)
    rewritten.push({ ...article, ...result })
  }
  return rewritten
}

module.exports = { rewriteArticle, rewriteBatch }
