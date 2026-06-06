import fs from "fs"
import path from "path"
import { CATEGORY_FALLBACK_MAP } from "@/lib/images/fallbackImages"

const ARTICLES_IMG_DIR = path.join(process.cwd(), "public/images/articles")
const MIN_FILE_SIZE = 5000

function fileExists(fp: string): boolean {
  try { return fs.existsSync(fp) } catch { return false }
}

function isFallbackPath(imgPath: string): boolean {
  return imgPath.startsWith("/images/fallbacks/")
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

function fallbackMatchesCategory(fallbackPath: string, categorySlug?: string): boolean {
  if (!categorySlug || !fallbackPath) return false
  const expectedFallback = CATEGORY_FALLBACK_MAP[categorySlug.toLowerCase()]
  if (!expectedFallback) return false
  const fileName = path.basename(fallbackPath).replace(/\.\w+$/, "")
  return fileName === expectedFallback
}

export function getImage(options: {
  slug?: string
  frontmatterImage?: string | null
  categorySlug?: string
} = {}): string | undefined {
  const { slug, frontmatterImage, categorySlug } = options

  if (slug) {
    const found = findLocalImage(slug)
    if (found) return found
  }

  if (frontmatterImage) {
    if (frontmatterImage.startsWith("/images/articles/")) {
      const localPath = path.join(process.cwd(), "public", frontmatterImage)
      if (fileExists(localPath) && fs.statSync(localPath).size >= MIN_FILE_SIZE) {
        return frontmatterImage
      }
    }

    if (isFallbackPath(frontmatterImage)) {
      if (fallbackMatchesCategory(frontmatterImage, categorySlug)) {
        const localPath = path.join(process.cwd(), "public", frontmatterImage)
        if (fileExists(localPath) && fs.statSync(localPath).size >= MIN_FILE_SIZE) {
          return frontmatterImage
        }
      }
      return undefined
    }

    if (frontmatterImage.startsWith("/images/")) {
      const localPath = path.join(process.cwd(), "public", frontmatterImage)
      if (fileExists(localPath) && fs.statSync(localPath).size >= MIN_FILE_SIZE) {
        return frontmatterImage
      }
    }
  }

  return undefined
}

export async function verifyArticleImage(
  slug: string,
  categorySlug?: string,
  title?: string,
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
