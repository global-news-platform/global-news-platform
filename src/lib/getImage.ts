import fs from "fs"
import path from "path"

const ARTICLES_IMG_DIR = path.join(process.cwd(), "public/images/articles")
const FALLBACKS_DIR = path.join(process.cwd(), "public/images/fallbacks")

const MIN_FILE_SIZE = 5000

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

function resolveFallbackImage(categorySlug?: string): string | undefined {
  if (!categorySlug || !fs.existsSync(FALLBACKS_DIR)) return undefined
  const extOrder = [".jpg", ".jpeg", ".png", ".webp"]
  for (const ext of extOrder) {
    const candidate = path.join(FALLBACKS_DIR, `${categorySlug}${ext}`)
    if (fileExists(candidate) && fs.statSync(candidate).size > 0) {
      return `/images/fallbacks/${categorySlug}${ext}`
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

  // 1. Try to find a locally downloaded image matching the slug
  if (slug) {
    const found = findLocalImage(slug)
    if (found) return found
  }

  // 2. Check if frontmatter points to a real image
  if (frontmatterImage) {
    if (frontmatterImage.startsWith("/images/")) {
      const localPath = path.join(process.cwd(), "public", frontmatterImage)
      if (fileExists(localPath) && fs.statSync(localPath).size >= MIN_FILE_SIZE) {
        return frontmatterImage
      }
    }

    // 3. Handle /fallback/[category].jpg → map to real fallback images
    if (frontmatterImage.startsWith("/fallback/")) {
      const fallbackName = path.basename(frontmatterImage, path.extname(frontmatterImage))
      const resolved = resolveFallbackImage(fallbackName || categorySlug)
      if (resolved) return resolved
    }
  }

  // 4. Last resort: try category-based fallback
  if (categorySlug) {
    const resolved = resolveFallbackImage(categorySlug)
    if (resolved) return resolved
  }

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
