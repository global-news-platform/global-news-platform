import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const categoryGradients: Record<string, string> = {
  pakistan: "linear-gradient(135deg, #064e3b 0%, #047857 50%, #065f46 100%)",
  dunya: "linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 50%, #1a365d 100%)",
  siasat: "linear-gradient(135deg, #2d1b1b 0%, #5a1a1a 50%, #3d0e0e 100%)",
  karobar: "linear-gradient(135deg, #1a2a1a 0%, #2d5a2d 50%, #1a3d1a 100%)",
  technology: "linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 50%, #16213e 100%)",
  khel: "linear-gradient(135deg, #0c3a6e 0%, #1d4ed8 50%, #1e40af 100%)",
  sehat: "linear-gradient(135deg, #0d3328 0%, #1a5c4a 50%, #0d4f3c 100%)",
  science: "linear-gradient(135deg, #0d2137 0%, #1a3a5c 50%, #0f2840 100%)",
  shobiz: "linear-gradient(135deg, #2d1b3d 0%, #4a1942 50%, #5b2180 100%)",
  mazhab: "linear-gradient(135deg, #1a3d1a 0%, #166534 50%, #14532d 100%)",
  taleem: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #1d4ed8 100%)",
  mausam: "linear-gradient(135deg, #0a3c2e 0%, #0891b2 50%, #0e7490 100%)",
  crime: "linear-gradient(135deg, #1f1f1f 0%, #3d0e0e 50%, #450a0a 100%)",
  adalat: "linear-gradient(135deg, #1a1a2e 0%, #334155 50%, #1e293b 100%)",
  baynalaqwami: "linear-gradient(135deg, #0d2137 0%, #1a3a5c 50%, #0f2840 100%)",
  videos: "linear-gradient(135deg, #2d1b3d 0%, #7c3aed 50%, #5b21b6 100%)",
  raye: "linear-gradient(135deg, #1a1a2e 0%, #2d2d3d 50%, #1a1a2e 100%)",
  general: "linear-gradient(135deg, #064e3b 0%, #334155 50%, #1e293b 100%)",
}

export const categoryAccentColors: Record<string, string> = {
  pakistan: "text-[#047857]",
  dunya: "text-[#2d5a8e]",
  siasat: "text-[#c0392b]",
  karobar: "text-[#2d7d2d]",
  technology: "text-[#5b21b6]",
  khel: "text-[#1d4ed8]",
  sehat: "text-[#166534]",
  science: "text-[#0891b2]",
  shobiz: "text-[#7c3aed]",
  mazhab: "text-[#166534]",
  taleem: "text-[#2563eb]",
  mausam: "text-[#0891b2]",
  crime: "text-[#dc2626]",
  adalat: "text-[#64748b]",
  baynalaqwami: "text-[#1a3a5c]",
  videos: "text-[#7c3aed]",
  raye: "text-[#dc2626]",
  general: "text-[#64748b]",
}

export function getCategoryGradient(categorySlug?: string): string {
  return categoryGradients[categorySlug || ""] || "linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)"
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("ur-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString("ur-PK", {
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

  if (hours < 1) return "ابھی"
  if (hours < 24) return `${hours} گھنٹے پہلے`
  if (days < 7) return `${days} دن پہلے`
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
