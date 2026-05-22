"use client"

import { useState, useCallback, useRef } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { getFallbackImageUrl, getFallbackImageDataUrl } from "@/lib/images/fallbackImages"

export interface SafeImageProps {
  src?: string
  alt: string
  className?: string
  wrapperClassName?: string
  priority?: boolean
  categorySlug?: string
  slug?: string
  showAttribution?: boolean
}

function isSvgPath(path: string): boolean {
  return path.endsWith(".svg")
}

export function SafeImage({
  src,
  alt,
  className,
  wrapperClassName,
  priority = false,
  categorySlug,
}: SafeImageProps) {
  const [errored, setErrored] = useState(false)
  const [loadingFailed, setLoadingFailed] = useState(false)
  const attemptCount = useRef(0)
  const cat = categorySlug || "general"

  const fallbackUrl = getFallbackImageUrl(cat)

  const imageSrc = loadingFailed || errored || !src ? fallbackUrl : src

  const blurDataUrl = getFallbackImageDataUrl(cat)
  const isSvg = isSvgPath(imageSrc)

  const handleError = useCallback(() => {
    attemptCount.current += 1
    if (attemptCount.current >= 2) {
      setErrored(true)
      setLoadingFailed(true)
    } else {
      setErrored(true)
    }
  }, [])

  const handleLoad = useCallback(() => {
    if (errored) {
      setErrored(false)
    }
  }, [errored])

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-muted/20",
        "w-full h-full",
        wrapperClassName,
      )}
    >
      <Image
        key={imageSrc}
        src={imageSrc}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          className,
        )}
        width={1200}
        height={800}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        placeholder={isSvg ? "empty" : "blur"}
        blurDataURL={isSvg ? undefined : blurDataUrl}
        onError={handleError}
        onLoad={handleLoad}
        quality={isSvg ? undefined : 85}
      />
    </div>
  )
}
