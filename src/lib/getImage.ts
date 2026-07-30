import fs from "fs"
import path from "path"
import { getFallbackImageUrl } from "@/lib/images/fallbackImages"

const ARTICLES_IMG_DIR = path.join(process.cwd(), "public/images/articles")

export interface GetImageOptions {
  slug: string
  frontmatterImage?: string | null
  categorySlug: string
}

export function getImage(options: GetImageOptions): string | undefined {
  const { frontmatterImage, categorySlug } = options

  if (frontmatterImage) {
    const img = frontmatterImage.trim()
    if (img.startsWith("/") || img.startsWith("http")) return img
    if (img.startsWith("images/") || img.startsWith("public/")) return `/${img.replace(/^public\//, "")}`
  }

  const localImage = findLocalImage(options.slug)
  if (localImage) return localImage

  return getFallbackImageUrl(categorySlug)
}

function findLocalImage(slug: string): string | undefined {
  if (!fs.existsSync(ARTICLES_IMG_DIR)) return undefined

  for (const ext of [".jpg", ".jpeg", ".png", ".webp", ".avif"]) {
    const imgPath = path.join(ARTICLES_IMG_DIR, `${slug}${ext}`)
    if (fs.existsSync(imgPath)) return `/images/articles/${slug}${ext}`
  }

  return undefined
}


