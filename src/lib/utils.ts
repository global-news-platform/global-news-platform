import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const categoryGradients: Record<string, string> = {
  world: "linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 50%, #1a365d 100%)",
  politics: "linear-gradient(135deg, #2d1b1b 0%, #5a1a1a 50%, #3d0e0e 100%)",
  business: "linear-gradient(135deg, #1a2a1a 0%, #2d5a2d 50%, #1a3d1a 100%)",
  technology: "linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 50%, #16213e 100%)",
  science: "linear-gradient(135deg, #0d2137 0%, #1a3a5c 50%, #0f2840 100%)",
  health: "linear-gradient(135deg, #0d3328 0%, #1a5c4a 50%, #0d4f3c 100%)",
  climate: "linear-gradient(135deg, #0a3c2e 0%, #166534 50%, #15803d 100%)",
  culture: "linear-gradient(135deg, #2d1b3d 0%, #4a1942 50%, #5b2180 100%)",
  sports: "linear-gradient(135deg, #1a1a2e 0%, #3d0e1e 50%, #6b132b 100%)",
  opinion: "linear-gradient(135deg, #1a1a2e 0%, #2d2d3d 50%, #1a1a2e 100%)",
  general: "linear-gradient(135deg, #334155 0%, #475569 50%, #334155 100%)",
}

export const categoryAccentColors: Record<string, string> = {
  world: "text-[#2d5a8e]",
  politics: "text-[#c0392b]",
  business: "text-[#2d7d2d]",
  technology: "text-[#5b21b6]",
  science: "text-[#0891b2]",
  health: "text-[#166534]",
  climate: "text-[#15803d]",
  culture: "text-[#7c3aed]",
  sports: "text-[#2563eb]",
  opinion: "text-[#dc2626]",
  general: "text-[#64748b]",
}

export function getCategoryGradient(categorySlug?: string): string {
  return categoryGradients[categorySlug || ""] || "linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)"
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatDateRelative(date: string): string {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (hours < 1) return "Just now"
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDateShort(date)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export function getArticleThumbnail(
  article: { image?: string },
): string | undefined {
  return article.image
}


