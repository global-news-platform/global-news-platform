import fs from "fs"
import path from "path"

const CATEGORY_POOLS_DIR = path.join(process.cwd(), "public/images/categories")

const KEYWORD_CATEGORY_MAP: Record<string, string> = {
  trump: "politics", biden: "politics", election: "politics",
  congress: "politics", senate: "politics", government: "politics",
  vote: "politics", president: "politics", supreme: "politics",
  cricket: "sports", football: "sports", soccer: "sports",
  nba: "sports", nfl: "sports", tennis: "sports", golf: "sports",
  premier: "sports", champion: "sports", olympic: "sports",
  ai: "technology", "artificial intelligence": "technology",
  google: "technology", apple: "technology", openai: "technology",
  chatbot: "technology", robot: "technology", cyber: "technology",
  software: "technology", app: "technology", digital: "technology",
  tech: "technology", startup: "technology", data: "technology",
  pakistan: "pakistan", lahore: "pakistan", karachi: "pakistan",
  stock: "business", market: "business", economy: "business",
  trade: "business", tariff: "business", bank: "business", oil: "business",
  business: "business", company: "business",
  climate: "science", environment: "science", space: "science", nasa: "science",
  doctor: "health", health: "health", hospital: "health",
  disease: "health", vaccine: "health", drug: "health",
  film: "entertainment", movie: "entertainment", music: "entertainment",
  celebrity: "entertainment", star: "entertainment",
  iran: "world", russia: "world", ukraine: "world", china: "world",
  israel: "world", gaza: "world", africa: "world", europe: "world",
  opinion: "opinion", analysis: "opinion", editorial: "opinion",
}

const ENGLISH_TO_POOL: Record<string, string> = {
  pakistan: "pakistan", dunya: "world", siasat: "politics",
  karobar: "business", technology: "technology", khel: "sports",
  sehat: "health", science: "science", shobiz: "entertainment",
  mazhab: "pakistan", taleem: "technology", mausam: "world",
  crime: "world", adalat: "politics", baynalaqwami: "world",
  videos: "technology", raye: "opinion", general: "world",
  world: "world", politics: "politics", business: "business",
  sports: "sports", health: "health", entertainment: "entertainment",
  opinion: "opinion",
}

const IMAGE_CACHE: Record<string, string[]> = {}
const USED_IMAGES: Record<string, Set<number>> = {}

function getPoolForCategory(categorySlug: string): string {
  return ENGLISH_TO_POOL[categorySlug] || "world"
}

function slugHash(slug: string): number {
  let hash = 5381
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) + hash + slug.charCodeAt(i)) & 0x7fffffff
  }
  return hash
}

function listImagesInPool(poolSlug: string): string[] {
  if (IMAGE_CACHE[poolSlug]) return IMAGE_CACHE[poolSlug]
  const poolDir = path.join(CATEGORY_POOLS_DIR, poolSlug)
  if (!fs.existsSync(poolDir)) {
    IMAGE_CACHE[poolSlug] = []
    return []
  }
  const images = fs.readdirSync(poolDir)
    .filter((f) => f.endsWith(".jpg") && f !== "default.jpg")
    .sort()
  IMAGE_CACHE[poolSlug] = images
  return images
}

function getUnusedImage(poolSlug: string, hashIdx: number): string | null {
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

export function resolveArticleImage(
  articleSlug: string,
  categorySlug: string,
  title: string,
  isBreaking: boolean,
): string {
  if (isBreaking) {
    const img = getUnusedImage("breaking", slugHash(articleSlug))
    if (img) return `/images/categories/breaking/${img}`
  }
  const lower = title.toLowerCase()
  let poolSlug = getPoolForCategory(categorySlug)
  for (const [keyword, cat] of Object.entries(KEYWORD_CATEGORY_MAP)) {
    if (lower.includes(keyword)) {
      poolSlug = getPoolForCategory(cat)
      break
    }
  }
  const img = getUnusedImage(poolSlug, slugHash(articleSlug))
  if (img) return `/images/categories/${poolSlug}/${img}`
  return "/images/categories/breaking/default.jpg"
}

export function getFallbackImage(): string {
  const images = listImagesInPool("breaking")
  if (images.length > 0) return `/images/categories/breaking/${images[0]}`
  return "/images/fallbacks/world.jpg"
}

export function resetTracker(): void {
  for (const key of Object.keys(USED_IMAGES)) {
    delete USED_IMAGES[key]
  }
}
