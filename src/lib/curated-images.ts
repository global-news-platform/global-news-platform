import { getFallbackImageUrl } from "@/lib/images/fallbackImages"

const rotationCounters: Record<string, number> = {}

export function getCuratedImageUrl(categorySlug?: string): string {
  return getFallbackImageUrl(categorySlug)
}

export function getCuratedImageUrlWithRotation(categorySlug?: string): string {
  if (!rotationCounters[categorySlug || "default"]) {
    rotationCounters[categorySlug || "default"] = 0
  }
  rotationCounters[categorySlug || "default"]++
  return getFallbackImageUrl(categorySlug)
}
