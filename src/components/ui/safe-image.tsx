"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const FALLBACK_IMAGE = "/images/fallback/default.jpg"

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
    if (categorySlug) {
      setFallbackSrc(`/images/fallbacks/${categorySlug}.jpg`)
    } else {
      setFallbackSrc(FALLBACK_IMAGE)
    }
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
