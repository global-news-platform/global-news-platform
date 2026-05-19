import { getImage, isValidExternalUrl, getImageAttribution } from "./getImage"

const IMAGE_CACHE = new Map<string, string>()

interface ResolvedImage {
  src: string
  credit?: string
  source?: string
}

export function resolveImageUrl(
  url: string | undefined | null,
  categorySlug?: string,
  slug?: string,
): ResolvedImage {
  const cacheKey = (url || "") + (categorySlug || "") + (slug || "")

  const cached = IMAGE_CACHE.get(cacheKey)
  if (cached) {
    return { src: cached, ...getImageAttribution(cached) }
  }

  if (url && isValidExternalUrl(url)) {
    IMAGE_CACHE.set(cacheKey, url)
    return { src: url, ...getImageAttribution(url) }
  }

  const externalUrl = getImage({ slug, categorySlug })
  IMAGE_CACHE.set(cacheKey, externalUrl)
  return { src: externalUrl, ...getImageAttribution(externalUrl) }
}

export function clearImageCache(): void {
  IMAGE_CACHE.clear()
}
