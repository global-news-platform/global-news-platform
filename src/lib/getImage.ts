import fs from "fs"
import path from "path"
import { getFallbackImageUrl } from "@/lib/images/fallbackImages"

const ARTICLES_IMG_DIR = path.join(process.cwd(), "public/images/articles")
const FALLBACKS_DIR = path.join(process.cwd(), "public/images/fallbacks")
const MIN_FILE_SIZE = 5000

function fileExists(fp: string): boolean {
  try { return fs.existsSync(fp) } catch { return false }
}

function findLocalImage(slug: string): string | null {
  if (!fileExists(ARTICLES_IMG_DIR)) return null
  const files = fs.readdirSync(ARTICLES_IMG_DIR)
  for (const file of files) {
    if (path.parse(file).name === slug) {
      const fp = path.join(ARTICLES_IMG_DIR, file)
      if (fs.statSync(fp).size >= MIN_FILE_SIZE) return `/images/articles/${file}`
    }
  }
  for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
    const candidate = path.join(ARTICLES_IMG_DIR, `${slug}${ext}`)
    if (fileExists(candidate) && fs.statSync(candidate).size >= MIN_FILE_SIZE) {
      return `/images/articles/${slug}${ext}`
    }
  }
  return null
}

function resolveFallbackImage(categorySlug?: string): string | undefined {
  if (!fileExists(FALLBACKS_DIR)) return undefined
  const url = getFallbackImageUrl(categorySlug)
  const localPath = path.join(process.cwd(), "public", url)
  if (fileExists(localPath) && fs.statSync(localPath).size > 0) {
    return url
  }
  const defaultPath = path.join(FALLBACKS_DIR, "default.jpg")
  if (fileExists(defaultPath) && fs.statSync(defaultPath).size > 0) {
    return "/images/fallbacks/default.jpg"
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
  }

  return resolveFallbackImage(categorySlug)
}

export async function verifyArticleImage(
  slug: string,
  _categorySlug?: string,
  _title?: string,
): Promise<string | undefined> {
  if (!fileExists(ARTICLES_IMG_DIR)) return undefined
  const files = fs.readdirSync(ARTICLES_IMG_DIR)
  for (const file of files) {
    if (path.parse(file).name === slug) {
      if (fs.statSync(path.join(ARTICLES_IMG_DIR, file)).size >= MIN_FILE_SIZE) {
        return `/images/articles/${file}`
      }
    }
  }
  return undefined
}
