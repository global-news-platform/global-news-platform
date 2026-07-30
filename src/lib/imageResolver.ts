import { getFallbackImageUrl } from "@/lib/images/fallbackImages"

export function resolveArticleImage(
  articleSlug: string,
  categorySlug: string,
): string | undefined {
  return getFallbackImageUrl(categorySlug)
}

export function getFallbackImage(categorySlug?: string): string {
  return getFallbackImageUrl(categorySlug)
}
