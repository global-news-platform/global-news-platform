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

interface FallbackConfig {
  accent: string
  bg1: string
  bg2: string
  label: string
}

const FALLBACK_STYLES: Record<string, FallbackConfig> = {
  pakistan: { accent: "#10b981", bg1: "#064e3b", bg2: "#0d2b1e", label: "PAKISTAN" },
  dunya: { accent: "#3b82f6", bg1: "#0f1d35", bg2: "#1e3a5f", label: "WORLD" },
  siasat: { accent: "#ef4444", bg1: "#2d1b1b", bg2: "#4a1515", label: "POLITICS" },
  karobar: { accent: "#f59e0b", bg1: "#1a2a1a", bg2: "#2d4a1a", label: "BUSINESS" },
  technology: { accent: "#8b5cf6", bg1: "#1a0a2e", bg2: "#2d1b4a", label: "TECHNOLOGY" },
  khel: { accent: "#6366f1", bg1: "#0f132e", bg2: "#1e1b4a", label: "SPORTS" },
  sehat: { accent: "#22c55e", bg1: "#0a2e1a", bg2: "#166534", label: "HEALTH" },
  science: { accent: "#06b6d4", bg1: "#0d2137", bg2: "#1a3a5c", label: "SCIENCE" },
  shobiz: { accent: "#d946ef", bg1: "#2d0a2e", bg2: "#4a1a4a", label: "ENTERTAINMENT" },
  mazhab: { accent: "#22c55e", bg1: "#0a2e1a", bg2: "#14532d", label: "RELIGION" },
  taleem: { accent: "#0ea5e9", bg1: "#0c1f2e", bg2: "#1a3a5c", label: "EDUCATION" },
  mausam: { accent: "#14b8a6", bg1: "#0a2e2a", bg2: "#14534a", label: "WEATHER" },
  crime: { accent: "#f43f5e", bg1: "#2d0a14", bg2: "#5a1a28", label: "CRIME" },
  adalat: { accent: "#64748b", bg1: "#1a1a1a", bg2: "#2d2d2d", label: "JUSTICE" },
  baynalaqwami: { accent: "#3b82f6", bg1: "#0f1d35", bg2: "#1e3a5f", label: "INTERNATIONAL" },
  videos: { accent: "#8b5cf6", bg1: "#1a0a2e", bg2: "#2d0a5a", label: "VIDEOS" },
  raye: { accent: "#f43f5e", bg1: "#2d0a14", bg2: "#4a1520", label: "OPINION" },
  general: { accent: "#64748b", bg1: "#1a1a1a", bg2: "#2d2d2d", label: "NEWS" },
}

const CACHE = new Map<string, string>()

function generatePlaceholderSVG(slug: string): string {
  const style = FALLBACK_STYLES[slug] || FALLBACK_STYLES.general
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <rect width="24" height="24" fill="${style.bg1}"/>
</svg>`
}

export function getFallbackImageUrl(slug?: string): string {
  const cat = slug?.toLowerCase() || "general"
  if (!CATEGORY_SLUGS.includes(cat as CategorySlug)) return "/images/categories/general.svg"

  return `/images/categories/${cat}.svg`
}

export function getPlaceholderImageUrl(slug?: string): string {
  const cat = slug?.toLowerCase() || "general"
  if (!CATEGORY_SLUGS.includes(cat as CategorySlug)) return "/images/categories/general.svg"
  return `/images/categories/${cat}.svg`
}

export function getFallbackImageDataUrl(slug?: string): string {
  const key = slug || "general"
  const cached = CACHE.get(key)
  if (cached) return cached
  const cat = key.toLowerCase()
  if (!CATEGORY_SLUGS.includes(cat as CategorySlug)) {
    const dataUrl = generatePlaceholderSVG("general")
    CACHE.set(key, toDataUrl(dataUrl))
    return CACHE.get(key)!
  }
  const dataUrl = generatePlaceholderSVG(cat)
  CACHE.set(key, toDataUrl(dataUrl))
  return CACHE.get(key)!
}

function toDataUrl(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export { generatePlaceholderSVG, FALLBACK_STYLES }
