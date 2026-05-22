import fs from "fs"
import path from "path"
import { getFallbackImageUrl } from "@/lib/images/fallbackImages"

function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath)
  } catch {
    return false
  }
}

function findLocalImage(slug: string): string | null {
  const dir = path.join(process.cwd(), "public/images/articles")
  if (!fs.existsSync(dir)) return null

  const files = fs.readdirSync(dir)
  for (const file of files) {
    const name = path.parse(file).name
    if (name === slug) {
      return `/images/articles/${file}`
    }
  }
  return null
}

export function getImage(options: {
  slug?: string
  categorySlug?: string
  frontmatterImage?: string | null
} = {}): string {
  const { slug, categorySlug, frontmatterImage } = options

  if (frontmatterImage) {
    if (frontmatterImage.startsWith("/images/categories/")) {
      return frontmatterImage
    }

    if (frontmatterImage.startsWith("/")) {
      const localPath = path.join(process.cwd(), "public", frontmatterImage)
      if (fileExists(localPath)) {
        return frontmatterImage
      }

      if (slug) {
        const found = findLocalImage(slug)
        if (found) return found
      }
    }

    if (frontmatterImage.startsWith("http")) {
      return frontmatterImage
    }
  }

  if (slug) {
    const found = findLocalImage(slug)
    if (found) return found
  }

  const cat = categorySlug?.toLowerCase() || "general"
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
): Promise<string> {
  const dir = path.join(process.cwd(), "public/images/articles")
  if (!fs.existsSync(dir)) {
    return getFallbackImageUrl(categorySlug)
  }

  const files = fs.readdirSync(dir)
  for (const file of files) {
    const name = path.parse(file).name
    if (name === slug) {
      const filePath = path.join(dir, file)
      if (fs.statSync(filePath).size > 0) {
        return `/images/articles/${file}`
      }
    }
  }

  return getFallbackImageUrl(categorySlug)
}
