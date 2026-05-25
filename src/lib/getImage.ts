import fs from "fs"
import path from "path"
import { getFallbackImageUrl } from "@/lib/images/fallbackImages"

const FALLBACK_DIR = path.join(process.cwd(), "public/fallback")
const ARTICLES_IMG_DIR = path.join(process.cwd(), "public/images/articles")
const CATEGORIES_IMG_DIR = path.join(process.cwd(), "public/images/categories")

function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath)
  } catch {
    return false
  }
}

function findLocalImage(slug: string): string | null {
  if (!fs.existsSync(ARTICLES_IMG_DIR)) return null

  const files = fs.readdirSync(ARTICLES_IMG_DIR)
  for (const file of files) {
    const name = path.parse(file).name
    if (name === slug) {
      const filePath = path.join(ARTICLES_IMG_DIR, file)
      if (fs.statSync(filePath).size > 0) {
        return `/images/articles/${file}`
      }
    }
  }

  for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
    const candidate = path.join(ARTICLES_IMG_DIR, `${slug}${ext}`)
    if (fileExists(candidate)) {
      return `/images/articles/${slug}${ext}`
    }
  }

  return null
}

function getCategoryPoolImage(poolSlug: string): string | null {
  const poolDir = path.join(CATEGORIES_IMG_DIR, poolSlug)
  if (!fs.existsSync(poolDir)) return null
  const files = fs.readdirSync(poolDir)
    .filter((f) => f.endsWith(".jpg") && f !== "default.jpg")
    .sort()
  if (files.length > 0) {
    const idx = Math.floor(Math.random() * files.length)
    return `/images/categories/${poolSlug}/${files[idx]}`
  }
  const defaultFile = path.join(poolDir, "default.jpg")
  if (fileExists(defaultFile)) {
    return `/images/categories/${poolSlug}/default.jpg`
  }
  return null
}

function getFallbackFile(categorySlug?: string): string {
  const cat = categorySlug?.toLowerCase() || "general"
  const fallbackPath = path.join(FALLBACK_DIR, `${cat}.jpg`)
  if (fileExists(fallbackPath)) {
    return `/fallback/${cat}.jpg`
  }
  const worldPath = path.join(FALLBACK_DIR, "world.jpg")
  if (fileExists(worldPath)) {
    return "/fallback/world.jpg"
  }
  return getFallbackImageUrl(cat)
}

const KEYWORD_POOL_MAP: Record<string, string> = {
  cricket: "sports", football: "sports", soccer: "sports",
  nba: "sports", nfl: "sports", tennis: "sports", golf: "sports",
  premier: "sports", champion: "sports", olympic: "sports",
  parliament: "politics", congress: "politics", senate: "politics",
  election: "politics", president: "politics", vote: "politics",
  ai: "technology", "artificial": "technology",
  google: "technology", openai: "technology", chatbot: "technology",
  robot: "technology", cyber: "technology", software: "technology",
  hospital: "health", doctor: "health", health: "health",
  disease: "health", vaccine: "health", medical: "health",
  stock: "business", market: "business", economy: "business",
  bank: "business", oil: "business",
  climate: "science", environment: "science", space: "science", nasa: "science",
  film: "entertainment", movie: "entertainment", music: "entertainment",
  celebrity: "entertainment",
  iran: "world", russia: "world", ukraine: "world", china: "world",
  israel: "world", gaza: "world",
  pakistan: "pakistan", lahore: "pakistan", karachi: "pakistan",
}

function getKeywordPool(title: string): string | null {
  if (!title) return null
  const lower = title.toLowerCase()
  for (const [keyword, pool] of Object.entries(KEYWORD_POOL_MAP)) {
    if (lower.includes(keyword)) return pool
  }
  return null
}

export function getImage(options: {
  slug?: string
  categorySlug?: string
  frontmatterImage?: string | null
  title?: string
} = {}): string {
  const { slug, categorySlug, frontmatterImage, title } = options

  if (slug) {
    const found = findLocalImage(slug)
    if (found) return found
  }

  if (frontmatterImage) {
    if (frontmatterImage.startsWith("/images/articles/")) {
      const localPath = path.join(process.cwd(), "public", frontmatterImage)
      if (fileExists(localPath)) {
        return frontmatterImage
      }
    }

    if (frontmatterImage.startsWith("/images/categories/") || frontmatterImage.startsWith("/fallback/")) {
      const localPath = path.join(process.cwd(), "public", frontmatterImage)
      if (fileExists(localPath)) {
        return frontmatterImage
      }
    }

    if (frontmatterImage.startsWith("/")) {
      const localPath = path.join(process.cwd(), "public", frontmatterImage)
      if (fileExists(localPath)) {
        return frontmatterImage
      }
    }
  }

  const cat = categorySlug?.toLowerCase() || "general"

  const keywordPool = title ? getKeywordPool(title) : null
  if (keywordPool) {
    const poolImg = getCategoryPoolImage(keywordPool)
    if (poolImg) return poolImg
  }

  const fallback = getFallbackFile(cat)
  const fallbackLocalPath = path.join(process.cwd(), "public", fallback)
  if (fileExists(fallbackLocalPath)) {
    return fallback
  }

  return getFallbackImageUrl(cat)
}

export function isValidExternalUrl(url: string): boolean {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function getImageAttribution(): { credit?: string; source?: string } {
  return {}
}

export async function verifyArticleImage(
  slug: string,
  categorySlug?: string,
  title?: string,
): Promise<string> {
  if (!fs.existsSync(ARTICLES_IMG_DIR)) {
    const fallback = getFallbackFile(categorySlug)
    const fallbackLocalPath = path.join(process.cwd(), "public", fallback)
    if (fileExists(fallbackLocalPath)) return fallback
    return getFallbackImageUrl(categorySlug)
  }

  const files = fs.readdirSync(ARTICLES_IMG_DIR)
  for (const file of files) {
    const name = path.parse(file).name
    if (name === slug) {
      const filePath = path.join(ARTICLES_IMG_DIR, file)
      if (fs.statSync(filePath).size > 0) {
        return `/images/articles/${file}`
      }
    }
  }

  const keywordPool = title ? getKeywordPool(title) : null
  if (keywordPool) {
    const poolImg = getCategoryPoolImage(keywordPool)
    if (poolImg) return poolImg
  }

  const fallback = getFallbackFile(categorySlug)
  const fallbackLocalPath = path.join(process.cwd(), "public", fallback)
  if (fileExists(fallbackLocalPath)) return fallback

  return getFallbackImageUrl(categorySlug)
}
