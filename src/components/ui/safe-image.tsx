"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { getFallbackImageUrl } from "@/lib/images/fallbackImages"

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
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(undefined)
  const [loadError, setLoadError] = useState(false)
  const fallbackUrl = getFallbackImageUrl(categorySlug)
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
        width={800}
        height={533}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        onError={handleError}
      />
    </div>
  )
}
