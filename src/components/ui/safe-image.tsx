"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export interface SafeImageProps {
  src?: string
  alt: string
  className?: string
  wrapperClassName?: string
  priority?: boolean
  categorySlug?: string
  slug?: string
}

const CATEGORY_FALLBACK_MAP: Record<string, string> = {
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

function getFallbackForCategory(slug?: string): string {
  return CATEGORY_FALLBACK_MAP[slug || ""] || "/images/fallbacks/world.jpg"
}

export function SafeImage({
  src,
  alt,
  className,
  wrapperClassName,
  priority = false,
  categorySlug,
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(undefined)
  const [loadError, setLoadError] = useState(false)
  const cat = categorySlug || "general"

  const fallbackUrl = getFallbackForCategory(cat)
  const resolvedSrc = currentSrc || src || fallbackUrl

  useEffect(() => {
    setCurrentSrc(undefined)
    setLoadError(false)
  }, [src])

  const handleError = useCallback(() => {
    if (!loadError) {
      setLoadError(true)
      setCurrentSrc(fallbackUrl)
    }
  }, [loadError, fallbackUrl])

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-muted/20",
        "w-full h-full",
        wrapperClassName,
      )}
    >
      <Image
        src={resolvedSrc}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          "aspect-[3/2]",
          className,
        )}
        width={1200}
        height={800}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        onError={handleError}
      />
    </div>
  )
}
