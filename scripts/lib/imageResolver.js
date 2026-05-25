const fs = require("fs")
const path = require("path")

const CATEGORY_POOLS_DIR = path.join(__dirname, "../../public/images/categories")

const KEYWORD_CATEGORY_MAP = {
  trump: "politics",
  biden: "politics",
  election: "politics",
  congress: "politics",
  senate: "politics",
  government: "politics",
  vote: "politics",
  president: "politics",
  political: "politics",
  supreme: "politics",
  cricket: "sports",
  football: "sports",
  soccer: "sports",
  nba: "sports",
  nfl: "sports",
  tennis: "sports",
  golf: "sports",
  premier: "sports",
  champion: "sports",
  olympic: "sports",
  ai: "technology",
  "artificial intelligence": "technology",
  google: "technology",
  apple: "technology",
  openai: "technology",
  chatbot: "technology",
  robot: "technology",
  cyber: "technology",
  software: "technology",
  app: "technology",
  digital: "technology",
  tech: "technology",
  startup: "technology",
  data: "technology",
  pakistan: "pakistan",
  lahore: "pakistan",
  karachi: "pakistan",
  islamabad: "pakistan",
  peshawar: "pakistan",
  quetta: "pakistan",
  stock: "business",
  market: "business",
  economy: "business",
  inflation: "business",
  trade: "business",
  tariff: "business",
  bank: "business",
  oil: "business",
  price: "business",
  business: "business",
  company: "business",
  climate: "science",
  environment: "science",
  space: "science",
  nasa: "science",
  planet: "science",
  research: "science",
  doctor: "health",
  health: "health",
  hospital: "health",
  disease: "health",
  vaccine: "health",
  drug: "health",
  cancer: "health",
  medical: "health",
  film: "entertainment",
  movie: "entertainment",
  music: "entertainment",
  celebrity: "entertainment",
  star: "entertainment",
  show: "entertainment",
  actor: "entertainment",
  actress: "entertainment",
  iran: "world",
  russia: "world",
  ukraine: "world",
  china: "world",
  taiwan: "world",
  israel: "world",
  gaza: "world",
  africa: "world",
  europe: "world",
  america: "world",
  opinion: "opinion",
  analysis: "opinion",
  editorial: "opinion",
}

const ENGLISH_TO_POOL = {
  pakistan: "pakistan",
  dunya: "world",
  siasat: "politics",
  karobar: "business",
  technology: "technology",
  khel: "sports",
  sehat: "health",
  science: "science",
  shobiz: "entertainment",
  mazhab: "pakistan",
  taleem: "technology",
  mausam: "world",
  crime: "world",
  adalat: "politics",
  baynalaqwami: "world",
  videos: "technology",
  raye: "opinion",
  general: "world",
  world: "world",
  politics: "politics",
  business: "business",
  sports: "sports",
  health: "health",
  entertainment: "entertainment",
  opinion: "opinion",
}

const IMAGE_CACHE = {}
const USED_IMAGES = {}

function slugHash(slug) {
  let hash = 5381
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) + hash + slug.charCodeAt(i)) & 0x7fffffff
  }
  return hash
}

function getPoolForCategory(categorySlug) {
  return ENGLISH_TO_POOL[categorySlug] || "world"
}

function getKeywordCategory(title) {
  const lower = title.toLowerCase()
  for (const [keyword, cat] of Object.entries(KEYWORD_CATEGORY_MAP)) {
    if (lower.includes(keyword)) return cat
  }
  return null
}

function listImagesInPool(poolSlug) {
  if (IMAGE_CACHE[poolSlug]) return IMAGE_CACHE[poolSlug]

  const poolDir = path.join(CATEGORY_POOLS_DIR, poolSlug)
  if (!fs.existsSync(poolDir)) {
    IMAGE_CACHE[poolSlug] = []
    return []
  }

  const images = fs
    .readdirSync(poolDir)
    .filter((f) => f.endsWith(".jpg") && f !== "default.jpg")
    .sort()

  IMAGE_CACHE[poolSlug] = images
  return images
}

function getUnusedImage(poolSlug, hashIdx) {
  const images = listImagesInPool(poolSlug)
  if (images.length === 0) return null

  if (!USED_IMAGES[poolSlug]) USED_IMAGES[poolSlug] = new Set()

  for (let attempt = 0; attempt < images.length; attempt++) {
    const idx = (hashIdx + attempt) % images.length
    if (!USED_IMAGES[poolSlug].has(idx)) {
      USED_IMAGES[poolSlug].add(idx)
      return images[idx]
    }
  }

  USED_IMAGES[poolSlug].clear()
  const fallbackIdx = hashIdx % images.length
  USED_IMAGES[poolSlug].add(fallbackIdx)
  return images[fallbackIdx]
}

function resetTracker() {
  for (const key of Object.keys(USED_IMAGES)) {
    delete USED_IMAGES[key]
  }
}

function resolveArticleImage(articleSlug, categorySlug, title, isBreaking) {
  if (isBreaking) {
    const img = getUnusedImage("breaking", slugHash(articleSlug))
    if (img) return `/images/categories/breaking/${img}`
  }

  const keywordCat = getKeywordCategory(title)
  const poolSlug = keywordCat ? getPoolForCategory(keywordCat) : getPoolForCategory(categorySlug)

  const img = getUnusedImage(poolSlug, slugHash(articleSlug))
  if (img) return `/images/categories/${poolSlug}/${img}`

  const fallback = getUnusedImage("breaking", 0)
  if (fallback) return `/images/categories/breaking/${fallback}`
  return "/images/fallbacks/world.jpg"
}

function resolveCategoryImage(categorySlug) {
  const poolSlug = getPoolForCategory(categorySlug)
  const images = listImagesInPool(poolSlug)
  if (images.length > 0) return `/images/categories/${poolSlug}/${images[0]}`
  return "/images/fallbacks/world.jpg"
}

function getFallbackImage() {
  const images = listImagesInPool("breaking")
  if (images.length > 0) return `/images/categories/breaking/${images[0]}`
  return "/images/fallbacks/world.jpg"
}

module.exports = {
  resolveArticleImage,
  resolveCategoryImage,
  getFallbackImage,
  resetTracker,
}
