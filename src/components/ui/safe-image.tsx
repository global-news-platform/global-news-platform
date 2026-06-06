"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { getFallbackCssGradient } from "@/lib/images/fallbackImages"

export interface SafeImageProps {
  src?: string
  alt: string
  className?: string
  wrapperClassName?: string
  priority?: boolean
  categorySlug?: string
  slug?: string
  hideOnMissing?: boolean
}

export function SafeImage({
  src,
  alt,
  className,
  wrapperClassName,
  priority = false,
  categorySlug,
  hideOnMissing = false,
}: SafeImageProps) {
  const hasRealImage = !!(
    src && typeof src === "string" &&
    (src.startsWith("/images/articles/") || src.startsWith("http"))
  )
  const hasFallbackImage = !!(
    src && typeof src === "string" &&
    src.startsWith("/images/") && !src.startsWith("/images/articles/")
  )
  const [showGradient, setShowGradient] = useState(!hasRealImage && !hasFallbackImage)
  const [hasError, setHasError] = useState(false)

  if (showGradient || hasError) {
    if (hideOnMissing) {
      return null
    }
    const gradientStyle = getFallbackCssGradient(categorySlug)
    return (
      <div
        className={cn(
          "relative overflow-hidden w-full h-full flex items-center justify-center",
          wrapperClassName,
        )}
        style={{ background: gradientStyle }}
      >
        <div className="relative z-10 flex flex-col items-center gap-1 p-3 text-center">
          <svg className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
          </svg>
          {alt && <span className="text-[10px] text-white/50 line-clamp-2">{alt}</span>}
        </div>
      </div>
    )
  }

  if (!src) {
    if (hideOnMissing) return null
    const gradientStyle = getFallbackCssGradient(categorySlug)
    return (
      <div
        className={cn(
          "relative overflow-hidden w-full h-full flex items-center justify-center",
          wrapperClassName,
        )}
        style={{ background: gradientStyle }}
      >
        <div className="relative z-10 flex flex-col items-center gap-1 p-3 text-center">
          <svg className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
          </svg>
          {alt && <span className="text-[10px] text-white/50 line-clamp-2">{alt}</span>}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden w-full h-full", wrapperClassName)}>
      <Image
        src={src}
        alt={alt}
        className={cn("w-full h-full object-cover object-center transition-opacity duration-300", className)}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 100vw"
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        quality={100}
        onError={() => {
          setShowGradient(true)
          setHasError(true)
        }}
      />
    </div>
  )
}
