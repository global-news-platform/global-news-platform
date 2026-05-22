import { getFallbackImageUrl } from "@/lib/images/fallbackImages"

export function getImage(options: {
  slug?: string
  categorySlug?: string
  frontmatterImage?: string | null
} = {}): string {
  const { categorySlug, frontmatterImage } = options

  if (frontmatterImage && (frontmatterImage.startsWith("/") || frontmatterImage.startsWith("http"))) {
    return frontmatterImage
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
