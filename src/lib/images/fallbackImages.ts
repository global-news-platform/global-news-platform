export const CATEGORY_SLUGS = [
  "pakistan",
  "dunya",
  "siasat",
  "karobar",
  "technology",
  "khel",
  "sehat",
  "science",
  "shobiz",
  "mazhab",
  "taleem",
  "mausam",
  "crime",
  "adalat",
  "baynalaqwami",
  "videos",
  "raye",
  "general",
] as const

export type CategorySlug = (typeof CATEGORY_SLUGS)[number]

const FALLBACK_MAP: Record<string, string> = {
  pakistan: "/images/fallbacks/pakistan.jpg",
  dunya: "/images/fallbacks/world.jpg",
  siasat: "/images/fallbacks/politics.jpg",
  karobar: "/images/fallbacks/business.jpg",
  technology: "/images/fallbacks/technology.jpg",
  khel: "/images/fallbacks/sports.jpg",
  sehat: "/images/fallbacks/health.jpg",
  science: "/images/fallbacks/science.jpg",
  shobiz: "/images/fallbacks/entertainment.jpg",
  mazhab: "/images/fallbacks/pakistan.jpg",
  taleem: "/images/fallbacks/technology.jpg",
  mausam: "/images/fallbacks/world.jpg",
  crime: "/images/fallbacks/world.jpg",
  adalat: "/images/fallbacks/politics.jpg",
  baynalaqwami: "/images/fallbacks/world.jpg",
  videos: "/images/fallbacks/technology.jpg",
  raye: "/images/fallbacks/politics.jpg",
  general: "/images/fallbacks/world.jpg",
}

export function getFallbackImageUrl(slug?: string): string {
  const cat = slug?.toLowerCase() || "general"
  return FALLBACK_MAP[cat] || "/images/fallbacks/world.jpg"
}

export function getPlaceholderImageUrl(slug?: string): string {
  const cat = slug?.toLowerCase() || "general"
  return FALLBACK_MAP[cat] || "/images/fallbacks/world.jpg"
}

export function getFallbackImageDataUrl(slug?: string): string {
  return ""
}
