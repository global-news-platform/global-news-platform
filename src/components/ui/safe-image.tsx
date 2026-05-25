"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const FALLBACK_IMAGE = "/images/fallbacks/default.jpg"

const CATEGORY_FALLBACK_MAP: Record<string, string> = {
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
}

function getCategoryFallbackFile(categorySlug?: string): string {
  const name = CATEGORY_FALLBACK_MAP[categorySlug || ""] || "default"
  return `/images/fallbacks/${name}.jpg`
}

function normalizeImage(image: string | undefined | null): string {
  if (!image || typeof image !== "string" || image.trim() === "") return FALLBACK_IMAGE
  const trimmed = image.trim()
  if (trimmed.startsWith("data:") || trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) return trimmed
  return FALLBACK_IMAGE
}

export interface SafeImageProps {
  src?: string
  alt: string
  className?: string
  wrapperClassName?: string
  priority?: boolean
  categorySlug?: string
  slug?: string
}

export function SafeImage({
  src,
  alt,
  className,
  wrapperClassName,
  priority = false,
  categorySlug,
}: SafeImageProps) {
  const currentSrc = normalizeImage(src)
  const [fallbackSrc, setFallbackSrc] = useState<string | null>(null)

  const handleError = useCallback(() => {
    setFallbackSrc(getCategoryFallbackFile(categorySlug))
  }, [categorySlug])

  return (
    <div className={cn("relative overflow-hidden w-full h-full", wrapperClassName)}>
      <Image
        src={fallbackSrc || currentSrc}
        alt={alt}
        className={cn("w-full h-full object-cover object-center transition-opacity duration-300", className)}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 100vw"
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        quality={100}
        onError={handleError}
      />
    </div>
  )
}
