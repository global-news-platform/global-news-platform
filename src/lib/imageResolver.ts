import { getFallbackImageUrl, CATEGORY_FALLBACK_MAP } from "@/lib/images/fallbackImages"

const MAX_POOL_ATTEMPTS = 50
const poolCounters: Record<string, number> = {}

function getPoolIndex(categorySlug: string): number {
  if (!poolCounters[categorySlug]) poolCounters[categorySlug] = 0
  poolCounters[categorySlug]++
  return poolCounters[categorySlug]
}

export function resolveArticleImage(
  articleSlug: string,
  categorySlug: string,
  _title: string,
  _isBreaking: boolean,
): string | undefined {
  return getFallbackImageUrl(categorySlug)
}

export function getFallbackImage(categorySlug?: string): string {
  return getFallbackImageUrl(categorySlug)
}

export function resetTracker(): void {
  for (const key of Object.keys(poolCounters)) {
    delete poolCounters[key]
  }
}
