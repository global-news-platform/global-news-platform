export const CATEGORY_GRADIENTS: Record<string, string> = {
  pakistan: "from-[#1a3a2a] to-[#0d1f16]",
  dunya: "from-[#0f1f3a] to-[#071128]",
  siasat: "from-[#2d0f0f] to-[#1a0707]",
  karobar: "from-[#1a1a0f] to-[#0f0f07]",
  technology: "from-[#0f0f2d] to-[#07071a]",
  khel: "from-[#0f1f3a] to-[#071128]",
  sehat: "from-[#0f2d1a] to-[#071a0f]",
  science: "from-[#0f1f2d] to-[#07111a]",
  shobiz: "from-[#2d0f2d] to-[#1a071a]",
  mazhab: "from-[#0f2d0f] to-[#071a07]",
  taleem: "from-[#0f1f3a] to-[#071128]",
  mausam: "from-[#0f2d2d] to-[#071a1a]",
  crime: "from-[#1f0f0f] to-[#110707]",
  adalat: "from-[#1a1a2d] to-[#0f0f1a]",
  baynalaqwami: "from-[#0f1f3a] to-[#071128]",
  videos: "from-[#1a0f2d] to-[#0f071a]",
  raye: "from-[#1a1a2d] to-[#0f0f1a]",
  general: "from-[#1a1a2d] to-[#0f0f1a]",
  world: "from-[#0f1f3a] to-[#071128]",
  politics: "from-[#2d0f0f] to-[#1a0707]",
  business: "from-[#1a1a0f] to-[#0f0f07]",
  sports: "from-[#0f1f3a] to-[#071128]",
  health: "from-[#0f2d1a] to-[#071a0f]",
  entertainment: "from-[#2d0f2d] to-[#1a071a]",
  opinion: "from-[#1a1a2d] to-[#0f0f1a]",
  breaking: "from-[#2d0f0f] to-[#1a0707]",
}

export function getCategoryGradient(slug?: string): string {
  return CATEGORY_GRADIENTS[slug?.toLowerCase() || ""] || CATEGORY_GRADIENTS.general
}

export const CATEGORY_FALLBACK_MAP: Record<string, string> = {
  pakistan: "pakistan",
  dunya: "world",
  siasat: "politics",
  karobar: "business",
  technology: "technology",
  khel: "sports",
  sehat: "health",
  shobiz: "entertainment",
  science: "science",
  mazhab: "default",
  taleem: "default",
  mausam: "default",
  crime: "default",
  adalat: "default",
  baynalaqwami: "world",
  raye: "politics",
  videos: "entertainment",
  general: "default",
  world: "world",
  politics: "politics",
  business: "business",
  sports: "sports",
  health: "health",
  entertainment: "entertainment",
  breaking: "default",
}

export function getFallbackImageUrl(slug?: string): string {
  const name = CATEGORY_FALLBACK_MAP[slug?.toLowerCase() || ""] || "default"
  return `/images/fallbacks/${name}.jpg`
}


