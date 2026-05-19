"use client"

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { resolveImageUrl } from "@/lib/image-resolver"

export interface SafeImageProps {
  src?: string
  alt: string
  className?: string
  wrapperClassName?: string
  priority?: boolean
  categorySlug?: string
  slug?: string
  credit?: string
  source?: string
  showAttribution?: boolean
}

export function SafeImage({
  src,
  alt,
  className,
  wrapperClassName,
  priority = false,
  categorySlug,
  slug,
  credit: explicitCredit,
  source: explicitSource,
  showAttribution = false,
}: SafeImageProps) {
  const [loaded, setLoaded] = useState(priority)
  const [errored, setErrored] = useState(false)
  const [showSkeleton, setShowSkeleton] = useState(!priority)
  const imgRef = useRef<HTMLImageElement>(null)

  const resolved = useMemo(() => resolveImageUrl(src, categorySlug, slug), [src, categorySlug, slug])

  const [displaySrc, setDisplaySrc] = useState(resolved.src)

  useEffect(() => {
    if (imgRef.current?.complete) {
      setLoaded(true)
      setShowSkeleton(false)
    }
  }, [])

  const handleLoad = useCallback(() => {
    setLoaded(true)
    setShowSkeleton(false)
    setErrored(false)
  }, [])

  const handleError = useCallback(() => {
    if (!errored) {
      setErrored(true)
      const fallbackUrl = resolveImageUrl(null, categorySlug, slug)
      setDisplaySrc(fallbackUrl.src)
    }
  }, [errored, categorySlug, slug])

  const attribution = explicitCredit || resolved.credit || null
  const sourceText = explicitSource || resolved.source || null
  const showCredit = showAttribution && (attribution || sourceText)

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-muted/20",
        "w-full h-full",
        wrapperClassName,
      )}
    >
      {showSkeleton && !loaded && (
        <div
          className="absolute inset-0 animate-pulse bg-muted/30 rounded-lg"
          aria-hidden="true"
        />
      )}

      <img
        ref={imgRef}
        src={displaySrc}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          errored && "opacity-60",
          className,
        )}
        loading={priority ? "eager" : "lazy"}
        onLoad={handleLoad}
        onError={handleError}
      />

      {showCredit && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-1 pt-4">
          <span className="text-[10px] font-medium text-white/80">
            {attribution && `Photo: ${attribution}`}
            {attribution && sourceText && " "}
            {sourceText && `via ${sourceText}`}
          </span>
        </div>
      )}
    </div>
  )
}
