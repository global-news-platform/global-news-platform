const CATEGORY_POOL_MAP: Record<string, string> = {
  pakistan: "/images/categories/pakistan/default.jpg",
  dunya: "/images/categories/world/default.jpg",
  siasat: "/images/categories/politics/default.jpg",
  karobar: "/images/categories/business/default.jpg",
  technology: "/images/categories/technology/default.jpg",
  khel: "/images/categories/sports/default.jpg",
  sehat: "/images/categories/health/default.jpg",
  shobiz: "/images/categories/entertainment/default.jpg",
  mazhab: "/images/categories/pakistan/default.jpg",
  taleem: "/images/categories/technology/default.jpg",
  mausam: "/images/categories/world/default.jpg",
  crime: "/images/categories/world/default.jpg",
  adalat: "/images/categories/politics/default.jpg",
  baynalaqwami: "/images/categories/world/default.jpg",
  videos: "/images/categories/technology/default.jpg",
  raye: "/images/categories/opinion/default.jpg",
  general: "/images/categories/world/default.jpg",
  world: "/images/categories/world/default.jpg",
  politics: "/images/categories/politics/default.jpg",
  business: "/images/categories/business/default.jpg",
  sports: "/images/categories/sports/default.jpg",
  health: "/images/categories/health/default.jpg",
  entertainment: "/images/categories/entertainment/default.jpg",
  science: "/images/categories/science/default.jpg",
  opinion: "/images/categories/opinion/default.jpg",
  breaking: "/images/categories/breaking/default.jpg",
}

export function getFallbackImageUrl(slug?: string): string {
  const cat = slug?.toLowerCase() || "general"
  return CATEGORY_POOL_MAP[cat] || "/images/categories/breaking/default.jpg"
}

export function getPlaceholderImageUrl(slug?: string): string {
  const cat = slug?.toLowerCase() || "general"
  return CATEGORY_POOL_MAP[cat] || "/images/categories/breaking/default.jpg"
}

export function getFallbackImageDataUrl(): string {
  return ""
}
