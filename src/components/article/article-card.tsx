"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { cn, formatDateRelative } from "@/lib/utils"
import { categories, DISCLAIMER_TEXT } from "@/lib/constants"
import { MixedText } from "@/components/ui/mixed-text"
import { getFallbackCssGradient } from "@/lib/images/fallbackImages"
import type { ArticleLink } from "@/types"

interface ArticleCardProps {
  article: ArticleLink
  variant?: "hero" | "featured" | "horizontal" | "text-list" | "compact" | "default"
}

function PublisherLogo({ src, name }: { src?: string; name: string }) {
  if (!src) return null
  return (
    <img
      src={src}
      alt=""
      className="inline-block w-4 h-4 object-contain mr-1 rounded-sm"
      onError={(e) => { e.currentTarget.style.display = "none" }}
    />
  )
}

function GradientPlaceholder({ gradientStyle, animate = false }: { gradientStyle: string; animate?: boolean }) {
  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center" style={{ background: gradientStyle }}>
      <svg className={cn("w-5 h-5 text-white/40", animate && "animate-pulse")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
      </svg>
    </div>
  )
}

function ArticleImage({
  src,
  alt,
  categorySlug,
  priority = false,
}: {
  src?: string | null
  alt: string
  categorySlug: string
  priority?: boolean
}) {
  const hasRealImage = !!(
    src && typeof src === "string" &&
    (src.startsWith("/images/articles/") || src.startsWith("http"))
  )
  const [showGradient, setShowGradient] = useState(!hasRealImage)
  const [imageLoaded, setImageLoaded] = useState(false)
  const gradientStyle = getFallbackCssGradient(categorySlug)
  const handleLoad = useCallback(() => { setImageLoaded(true); setShowGradient(false) }, [])
  const handleError = useCallback(() => { setShowGradient(true) }, [])

  if (!src || showGradient) {
    return <GradientPlaceholder gradientStyle={gradientStyle} />
  }

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ transform: "scale(1.12)", transformOrigin: "center" }}>
      {!imageLoaded && <GradientPlaceholder gradientStyle={gradientStyle} animate />}
      <img
        src={src}
        alt={alt}
        suppressHydrationWarning
        loading={priority ? "eager" : "lazy"}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out",
          imageLoaded ? "opacity-100" : "opacity-0",
          "group-hover:scale-105"
        )}
        style={{ objectPosition: "52% 48%" }}
      />
    </div>
  )
}

export function ArticleCard({ article, variant = "compact" }: ArticleCardProps) {
  if (!article || !article.slug) return null
  const catName = categories.find((c) => c.slug === article.categorySlug)?.name || article.category

  if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
    const imgVal = article.image
    if (!imgVal || (typeof imgVal === "string" && imgVal.startsWith("/images/fallbacks/"))) {
      console.group(`[ArticleCard] ${article.slug}`)
      console.warn("Image is fallback or missing:", { image: imgVal, categorySlug: article.categorySlug })
      console.log("Article keys:", Object.keys(article))
      console.log("Article image key value:", article.image)
      console.groupEnd()
    }
  }

  const href = `/article/${article.slug}`
  const categoryHref = `/category/${article.categorySlug}`

  if (variant === "hero") {
    return (
      <article className="group relative">
        <Link href={href} className="block relative w-full h-[280px] sm:h-[340px] md:h-[420px] lg:h-[480px] overflow-hidden rounded-sm bg-muted/50">
          <ArticleImage
            src={article.image}
            alt={article.title}
            categorySlug={article.categorySlug}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 lg:p-8">
            <Link
              href={categoryHref}
              className="inline-block rounded bg-accent/90 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground shadow-sm transition-colors hover:bg-accent mb-2"
            >
              {catName}
            </Link>
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold leading-tight text-white drop-shadow-sm line-clamp-2 lg:line-clamp-3">
              {article.title}
            </h2>
          </div>
        </Link>
      </article>
    )
  }

  if (variant === "featured") {
    return (
      <article className="group relative">
        <Link href={href} className="block relative w-full h-[200px] sm:h-[220px] md:h-[200px] overflow-hidden rounded-sm bg-muted/50">
          <ArticleImage
            src={article.image}
            alt={article.title}
            categorySlug={article.categorySlug}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
            <Link
              href={categoryHref}
              className="inline-block rounded bg-accent/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow-sm transition-colors hover:bg-accent mb-1.5"
            >
              {catName}
            </Link>
            <h3 className="text-sm sm:text-base font-bold leading-snug text-white line-clamp-2">
              {article.title}
            </h3>
          </div>
        </Link>
      </article>
    )
  }

  if (variant === "horizontal") {
    return (
      <article className="group flex gap-3 sm:gap-4 rounded-sm bg-card/50 backdrop-blur-[2px] p-2 sm:p-3 transition-all duration-200 hover:bg-card/80 hover:shadow-sm">
        <Link href={href} className="shrink-0 relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 overflow-hidden rounded-sm bg-muted/50">
          <ArticleImage
            src={article.image}
            alt={article.title}
            categorySlug={article.categorySlug}
          />
        </Link>
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <Link
            href={categoryHref}
            className="inline-block w-fit rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent transition-colors hover:bg-accent/25 mb-1"
          >
            {catName}
          </Link>
          <h3 className="text-sm font-semibold leading-snug text-card-foreground line-clamp-2 group-hover:text-accent transition-colors duration-200">
            <Link href={href}>{article.title}</Link>
          </h3>
        </div>
      </article>
    )
  }

  if (variant === "text-list") {
    return (
      <article className="group flex flex-col gap-1 rounded-sm p-2 transition-all duration-200 hover:bg-card/50">
        <Link
          href={categoryHref}
          className="inline-block w-fit rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent"
        >
          {catName}
        </Link>
        <h3 className="text-sm leading-snug text-card-foreground line-clamp-2 group-hover:text-accent transition-colors duration-200">
          <Link href={href}>{article.title}</Link>
        </h3>
      </article>
    )
  }

  if (variant === "compact") {
    return (
      <article className="group flex flex-col rounded-sm bg-card/50 backdrop-blur-[2px] transition-all duration-200 hover:bg-card/80 hover:shadow-sm overflow-hidden">
        <Link href={href} className="relative w-full aspect-[16/10] overflow-hidden bg-muted/50">
          <ArticleImage
            src={article.image}
            alt={article.title}
            categorySlug={article.categorySlug}
          />
        </Link>
        <div className="flex flex-col gap-1.5 p-2.5 sm:p-3">
          <div className="flex items-center gap-2">
            <Link
              href={categoryHref}
              className="inline-block rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent transition-colors hover:bg-accent/25"
            >
              {catName}
            </Link>
            <span className="text-[11px] text-muted-foreground/60">{formatDateRelative(article.publishedAt)}</span>
          </div>
          <h3 className="text-sm font-semibold leading-snug text-card-foreground line-clamp-2 group-hover:text-accent transition-colors duration-200">
            <Link href={href}>{article.title}</Link>
          </h3>
        </div>
      </article>
    )
  }

  return (
    <article className="group flex flex-col rounded-sm bg-card/50 backdrop-blur-[2px] transition-all duration-200 hover:bg-card/80 hover:shadow-sm overflow-hidden">
      <Link href={href} className="relative w-full aspect-[16/10] overflow-hidden bg-muted/50">
        <ArticleImage
          src={article.image}
          alt={article.title}
          categorySlug={article.categorySlug}
        />
      </Link>
      <div className="flex flex-col gap-1.5 p-2.5 sm:p-3">
        <div className="flex items-center gap-2">
          <Link
            href={categoryHref}
            className="inline-block rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent transition-colors hover:bg-accent/25"
          >
            {catName}
          </Link>
          <span className="text-[11px] text-muted-foreground/60">{formatDateRelative(article.publishedAt)}</span>
        </div>
        <h3 className="text-sm font-semibold leading-snug text-card-foreground line-clamp-2 group-hover:text-accent transition-colors duration-200">
          <Link href={href}>{article.title}</Link>
        </h3>
      </div>
    </article>
  )
}
