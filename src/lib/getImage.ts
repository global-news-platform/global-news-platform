import fs from "fs"
import path from "path"

const ARTICLES_IMG_DIR = path.join(process.cwd(), "public/images/articles")
const FALLBACKS_DIR = path.join(process.cwd(), "public/images/fallbacks")

const MIN_FILE_SIZE = 5000

const CATEGORY_FALLBACK_MAP: Record<string, string> = {
  pakistan: "pakistan",
  dunya: "world",
  siasat: "politics",
  karobar: "business",
  technology: "technology",
  khel: "sports",
  sehat: "health",
  shobiz: "entertainment",
  science: "science",
  mazhab: "default",
  taleem: "default",
  mausam: "default",
  crime: "default",
  adalat: "default",
  baynalaqwami: "world",
  raye: "politics",
  videos: "entertainment",
  general: "default",
}

const FALLBACK_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".svg"]

function fileExists(filePath: string): boolean {
  try { return fs.existsSync(filePath) } catch { return false }
}

function findLocalImage(slug: string): string | null {
  if (!fs.existsSync(ARTICLES_IMG_DIR)) return null
  const files = fs.readdirSync(ARTICLES_IMG_DIR)
  for (const file of files) {
    if (path.parse(file).name === slug) {
      const filePath = path.join(ARTICLES_IMG_DIR, file)
      const stats = fs.statSync(filePath)
      if (stats.size >= MIN_FILE_SIZE) {
        return `/images/articles/${file}`
      }
    }
  }
  for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
    const candidate = path.join(ARTICLES_IMG_DIR, `${slug}${ext}`)
    if (fileExists(candidate)) {
      const stats = fs.statSync(candidate)
      if (stats.size >= MIN_FILE_SIZE) return `/images/articles/${slug}${ext}`
    }
  }
  return null
}

function getFallbackFileName(categorySlug?: string): string {
  if (!categorySlug) return "default"
  return CATEGORY_FALLBACK_MAP[categorySlug] || "default"
}

function resolveFallbackImage(categorySlug?: string): string | undefined {
  if (!FALLBACKS_DIR || !fs.existsSync(FALLBACKS_DIR)) return undefined
  const fallbackName = getFallbackFileName(categorySlug)

  for (const ext of FALLBACK_EXTENSIONS) {
    const candidate = path.join(FALLBACKS_DIR, `${fallbackName}${ext}`)
    if (fileExists(candidate) && fs.statSync(candidate).size > 0) {
      return `/images/fallbacks/${fallbackName}${ext}`
    }
  }

  for (const ext of FALLBACK_EXTENSIONS) {
    const candidate = path.join(FALLBACKS_DIR, `default${ext}`)
    if (fileExists(candidate) && fs.statSync(candidate).size > 0) {
      return `/images/fallbacks/default${ext}`
    }
  }

  return undefined
}

export function getImage(options: {
  slug?: string
  categorySlug?: string
  frontmatterImage?: string | null
  title?: string
} = {}): string | undefined {
  const { slug, categorySlug, frontmatterImage } = options

  if (slug) {
    const found = findLocalImage(slug)
    if (found) return found
  }

  if (frontmatterImage) {
    if (frontmatterImage.startsWith("/images/")) {
      const localPath = path.join(process.cwd(), "public", frontmatterImage)
      if (fileExists(localPath) && fs.statSync(localPath).size >= MIN_FILE_SIZE) {
        return frontmatterImage
      }
    }

    if (frontmatterImage.startsWith("/fallback/") || frontmatterImage.startsWith("/images/fallbacks/")) {
      const fallbackName = path.basename(frontmatterImage, path.extname(frontmatterImage))

      for (const [slug, fb] of Object.entries(CATEGORY_FALLBACK_MAP)) {
        if (fb === fallbackName) {
          const resolved = resolveFallbackImage(slug)
          if (resolved) return resolved
        }
      }

      const resolved = resolveFallbackImage(fallbackName)
      if (resolved) return resolved
    }
  }

  const resolved = resolveFallbackImage(categorySlug)
  if (resolved) return resolved

  return undefined
}

export async function verifyArticleImage(
  slug: string,
  _categorySlug?: string,
  _title?: string,
): Promise<string | undefined> {
  if (!fs.existsSync(ARTICLES_IMG_DIR)) return undefined
  const files = fs.readdirSync(ARTICLES_IMG_DIR)
  for (const file of files) {
    if (path.parse(file).name === slug) {
      const filePath = path.join(ARTICLES_IMG_DIR, file)
      if (fs.statSync(filePath).size >= MIN_FILE_SIZE) return `/images/articles/${file}`
    }
  }
  return undefined
}
