interface GetImageOptions {
  slug?: string
  categorySlug?: string
  title?: string
}

function hashString(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff
  }
  return Math.abs(hash)
}

const categoryKeywords: Record<string, string> = {
  world: "world-globe-travel-international",
  politics: "politics-government-debate-parliament",
  business: "business-finance-market-economy",
  technology: "technology-tech-digital-innovation",
  science: "science-research-laboratory-discovery",
  health: "health-medical-hospital-wellness",
  climate: "climate-nature-environment-sustainability",
  sports: "sports-athletics-stadium-competition",
  culture: "culture-art-music-entertainment",
  opinion: "opinion-media-communication-discussion",
  entertainment: "entertainment-movies-show-concert",
  breaking: "breaking-news-alert-emergency",
  featured: "featured-highlight-spotlight-top",
  general: "news-media-journalism-reporting",
}

const DEFAULT_CATEGORY = "general"

const STOP_WORDS = new Set([
  "and", "the", "of", "in", "to", "a", "is", "for", "on", "with",
  "as", "by", "at", "from", "an", "its", "it", "or", "be", "are",
  "was", "but", "not", "that", "this", "has", "have", "had", "his",
  "her", "all", "will", "can", "new", "after", "over", "into",
])

function extractKeywords(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && w.length <= 8 && !STOP_WORDS.has(w))
    .slice(0, 2)
}

const UNSPLASH_API = "https://api.unsplash.com/search/photos"
const SEARCH_CACHE = new Map<string, string[]>()

interface UnsplashPhoto {
  id: string
  urls: { raw: string; full: string; regular: string; small: string }
}

async function searchUnsplash(query: string): Promise<string[]> {
  const cached = SEARCH_CACHE.get(query)
  if (cached) return cached

  const key = typeof process !== "undefined" ? process.env.UNSPLASH_ACCESS_KEY : undefined
  if (!key) return []

  try {
    const url = `${UNSPLASH_API}?query=${encodeURIComponent(query)}&per_page=30&orientation=landscape`
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${key}` },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return []

    const data = await res.json()
    const photoUrls: string[] = (data.results || []).map(
      (p: UnsplashPhoto) => `${p.urls.raw}&w=1200&q=85&fit=crop&auto=format`,
    )
    SEARCH_CACHE.set(query, photoUrls)
    return photoUrls
  } catch {
    return []
  }
}

export async function getArticleImage(slug: string, categorySlug?: string, title?: string): Promise<string> {
  const cat = categorySlug || DEFAULT_CATEGORY
  const catKeyword = categoryKeywords[cat] || categoryKeywords[DEFAULT_CATEGORY]

  if (title) {
    const words = extractKeywords(title)
    if (words.length > 0) {
      const specificQuery = `${catKeyword} ${words.join(" ")}`
      const results = await searchUnsplash(specificQuery)
      if (results.length > 0) {
        const idx = hashString(slug) % results.length
        return results[idx]
      }
    }
  }

  const results = await searchUnsplash(catKeyword)
  if (results.length > 0) {
    const idx = hashString(slug) % results.length
    return results[idx]
  }

  const variant = hashString(slug) % 1000
  return `https://picsum.photos/seed/${slug}-${variant}/${1200}/${800}`
}

export function getImage(options: GetImageOptions = {}): string {
  const { slug, categorySlug } = options
  const cat = categorySlug?.toLowerCase() || DEFAULT_CATEGORY
  const keyword = categoryKeywords[cat] || categoryKeywords[DEFAULT_CATEGORY]

  if (slug) {
    const variant = hashString(slug) % 1000
    return `https://picsum.photos/seed/${slug}-${variant}/${1200}/${800}`
  }

  const randomId = Math.floor(Math.random() * 1000000)
  return `https://picsum.photos/seed/${keyword}-${randomId}/${1200}/${800}`
}

export function getImageAttribution(_sourceUrl: string): { credit?: string; source?: string } {
  return {}
}

export function isValidExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false
    const allowedHosts = [
      "images.unsplash.com",
      "plus.unsplash.com",
      "images.pexels.com",
      "cdn.pixabay.com",
      "pixabay.com",
      "picsum.photos",
    ]
    return allowedHosts.some((host) => parsed.hostname === host || parsed.hostname.endsWith("." + host))
  } catch {
    return false
  }
}
