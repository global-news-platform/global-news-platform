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
}

export function SafeImage({
  src,
  alt,
  className,
  wrapperClassName,
  priority = false,
  categorySlug,
}: SafeImageProps) {
  const hasRealImage = !!(
    src && typeof src === "string" &&
    (src.startsWith("/images/articles/") || src.startsWith("http"))
  )
  const [showGradient, setShowGradient] = useState(!hasRealImage)
  const gradientStyle = getFallbackCssGradient(categorySlug)

  if (showGradient) {
    return (
      <div className={cn("relative overflow-hidden w-full h-full", wrapperClassName)}>
        <div className="w-full h-full" style={{ background: gradientStyle }} />
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden w-full h-full", wrapperClassName)}>
      <Image
        src={src!}
        alt={alt}
        className={cn("w-full h-full object-cover object-center transition-opacity duration-300", className)}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 100vw"
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        quality={100}
        onError={() => setShowGradient(true)}
      />
    </div>
  )
}
