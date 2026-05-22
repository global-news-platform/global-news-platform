import { getFallbackImageUrl } from "@/lib/images/fallbackImages"

const DEFAULT_CATEGORY = "general"

export function getCuratedImageUrl(categorySlug?: string): string {
  const cat = categorySlug?.toLowerCase() || DEFAULT_CATEGORY
  return getFallbackImageUrl(cat)
}

export function getCuratedImageUrlWithRotation(categorySlug?: string): string {
  return getCuratedImageUrl(categorySlug)
}
