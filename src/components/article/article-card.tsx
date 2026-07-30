"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { cn, formatDateRelative } from "@/lib/utils"
import { categories } from "@/lib/constants"
import { MixedText } from "@/components/ui/mixed-text"
import { getFallbackCssGradient } from "@/lib/images/fallbackImages"
import type { ArticleLink } from "@/types"

interface ArticleCardProps {
  article: ArticleLink
  variant?: "hero" | "featured" | "horizontal" | "text-list" | "compact" | "default"
}

function GradientPlaceholder({ gradientStyle, animate = false }: { gradientStyle: string; animate?: boolean }) {
  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center" style={{ background: gradientStyle }}>
      <svg className={cn("w-6 h-6 text-white/40", animate && "animate-pulse-soft")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {!imageLoaded && <GradientPlaceholder gradientStyle={gradientStyle} animate />}
      <img
        src={src}
        alt={alt}
        suppressHydrationWarning
        loading={priority ? "eager" : "lazy"}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out-expo",
          imageLoaded ? "opacity-100" : "opacity-0",
          "group-hover:scale-105 group-hover:duration-1000"
        )}
        style={{ objectPosition: "52% 48%" }}
      />
    </div>
  )
}

function CategoryBadge({ href, children, variant = "default" }: { href: string; children: React.ReactNode; variant?: "default" | "overlay" | "subtle" }) {
  if (variant === "overlay") {
    return (
      <Link
        href={href}
        className="inline-block rounded-md bg-accent/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-accent-foreground shadow-lg shadow-accent/30 transition-all duration-300 hover:bg-accent hover:shadow-accent/40"
      >
        {children}
      </Link>
    )
  }
  if (variant === "subtle") {
    return (
      <Link
        href={href}
        className="inline-block rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-accent transition-all duration-300 hover:bg-accent/20"
      >
        {children}
      </Link>
    )
  }
  return (
    <Link
      href={href}
      className="inline-block rounded-md bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-accent transition-all duration-300 hover:bg-accent/25"
    >
      {children}
    </Link>
  )
}

export function ArticleCard({ article, variant = "compact" }: ArticleCardProps) {
  if (!article || !article.slug) return null
  const catName = categories.find((c) => c.slug === article.categorySlug)?.name || article.category

  const href = `/article/${article.slug}`
  const categoryHref = `/category/${article.categorySlug}`

  if (variant === "hero") {
    return (
      <article className="group relative">
        <Link href={href} className="block relative w-full h-[300px] sm:h-[360px] md:h-[440px] lg:h-[520px] overflow-hidden bg-muted/50">
          <ArticleImage
            src={article.image}
            alt={article.title}
            categorySlug={article.categorySlug}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 via-30% to-transparent transition-opacity duration-500 group-hover:opacity-90" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-7 lg:p-9">
            <div className="flex items-center gap-2 mb-2.5">
              <CategoryBadge href={categoryHref} variant="overlay">{catName}</CategoryBadge>
              {article.breaking && (
                <span className="inline-flex items-center gap-1 rounded-md bg-destructive px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-live-pulse rounded-full bg-white" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                  Breaking
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-white drop-shadow-lg line-clamp-2 lg:line-clamp-3 transition-all duration-300 group-hover:translate-y-[-2px]">
              <MixedText text={article.title} />
            </h2>
            {article.excerpt && (
              <p className="hidden sm:block mt-2 text-sm text-white/70 line-clamp-2 max-w-2xl">
                {article.excerpt}
              </p>
            )}
          </div>
        </Link>
      </article>
    )
  }

  if (variant === "featured") {
    return (
      <article className="group relative">
        <Link href={href} className="block relative w-full h-[220px] sm:h-[240px] md:h-[220px] overflow-hidden bg-muted/50">
          <ArticleImage
            src={article.image}
            alt={article.title}
            categorySlug={article.categorySlug}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 via-30% to-transparent transition-opacity duration-500 group-hover:opacity-85" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
            <CategoryBadge href={categoryHref} variant="overlay">{catName}</CategoryBadge>
            <h3 className="mt-2 text-sm sm:text-base font-bold leading-snug text-white line-clamp-2 drop-shadow-md transition-all duration-300 group-hover:translate-y-[-1px]">
              {article.title}
            </h3>
          </div>
        </Link>
      </article>
    )
  }

  if (variant === "horizontal") {
    return (
      <article className="group flex gap-3 sm:gap-4 rounded-lg bg-card/40 backdrop-blur-[2px] p-2.5 sm:p-3.5 transition-all duration-300 ease-out-expo hover:bg-card/80 hover:shadow-soft hover:-translate-y-0.5">
        <Link href={href} className="shrink-0 relative w-[88px] h-[88px] sm:w-[104px] sm:h-[104px] md:w-[120px] md:h-[120px] overflow-hidden rounded-lg bg-muted/50 shadow-sm">
          <ArticleImage
            src={article.image}
            alt={article.title}
            categorySlug={article.categorySlug}
          />
        </Link>
        <div className="flex flex-col justify-center min-w-0 flex-1 gap-1">
          <CategoryBadge href={categoryHref} variant="subtle">{catName}</CategoryBadge>
          <h3 className="text-sm font-semibold leading-snug text-card-foreground line-clamp-2 group-hover:text-accent transition-colors duration-200">
            <Link href={href}>{article.title}</Link>
          </h3>
          <span className="text-[11px] text-muted-foreground/50">{formatDateRelative(article.publishedAt)}</span>
        </div>
      </article>
    )
  }

  if (variant === "text-list") {
    return (
      <article className="group flex flex-col gap-1 rounded-lg p-2.5 transition-all duration-200 hover:bg-card/60 hover:-translate-y-0.5">
        <div className="flex items-center gap-2">
          <CategoryBadge href={categoryHref} variant="subtle">{catName}</CategoryBadge>
          {article.breaking && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.08em] text-destructive">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-live-pulse rounded-full bg-destructive" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-destructive" />
              </span>
              Breaking
            </span>
          )}
        </div>
        <h3 className="text-sm leading-snug text-card-foreground line-clamp-2 group-hover:text-accent transition-colors duration-200">
          <Link href={href}>{article.title}</Link>
        </h3>
        <span className="text-[11px] text-muted-foreground/40">{formatDateRelative(article.publishedAt)}</span>
      </article>
    )
  }

  if (variant === "compact") {
    return (
      <article className="group flex flex-col rounded-xl bg-card/50 backdrop-blur-[2px] transition-all duration-300 ease-out-expo hover:bg-card/80 hover:shadow-card-hover hover:-translate-y-1 overflow-hidden border border-border/5 hover:border-border/15">
        <Link href={href} className="relative w-full aspect-[16/10] overflow-hidden bg-muted/50">
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
          <ArticleImage
            src={article.image}
            alt={article.title}
            categorySlug={article.categorySlug}
          />
        </Link>
        <div className="flex flex-col gap-2 p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <CategoryBadge href={categoryHref} variant="default">{catName}</CategoryBadge>
            <span className="text-[11px] text-muted-foreground/50">{formatDateRelative(article.publishedAt)}</span>
          </div>
          <h3 className="text-sm font-semibold leading-snug text-card-foreground line-clamp-2 group-hover:text-accent transition-colors duration-200">
            <Link href={href}>{article.title}</Link>
          </h3>
          {article.excerpt && (
            <p className="text-[12px] leading-relaxed text-muted-foreground/70 line-clamp-2">
              {article.excerpt}
            </p>
          )}
        </div>
      </article>
    )
  }

  return (
    <article className="group flex flex-col rounded-xl bg-card/50 backdrop-blur-[2px] transition-all duration-300 ease-out-expo hover:bg-card/80 hover:shadow-card-hover hover:-translate-y-1 overflow-hidden border border-border/5 hover:border-border/15">
      <Link href={href} className="relative w-full aspect-[16/10] overflow-hidden bg-muted/50">
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
        <ArticleImage
          src={article.image}
          alt={article.title}
          categorySlug={article.categorySlug}
        />
      </Link>
      <div className="flex flex-col gap-2 p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <CategoryBadge href={categoryHref} variant="default">{catName}</CategoryBadge>
          <span className="text-[11px] text-muted-foreground/50">{formatDateRelative(article.publishedAt)}</span>
        </div>
        <h3 className="text-sm font-semibold leading-snug text-card-foreground line-clamp-2 group-hover:text-accent transition-colors duration-200">
          <Link href={href}>{article.title}</Link>
        </h3>
        {article.excerpt && (
          <p className="text-[12px] leading-relaxed text-muted-foreground/70 line-clamp-2">
            {article.excerpt}
          </p>
        )}
      </div>
    </article>
  )
}
