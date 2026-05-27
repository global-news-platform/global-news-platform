"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatDateRelative } from "@/lib/utils"
import { categories } from "@/lib/constants"
import { getFallbackCssGradient } from "@/lib/images/fallbackImages"
import type { ArticleLink } from "@/types"

interface ArticleCardProps {
  article: ArticleLink
  variant?: "hero" | "featured" | "horizontal" | "text-list" | "compact" | "default"
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
  const gradientStyle = getFallbackCssGradient(categorySlug)

  if (showGradient) {
    return <div className="absolute inset-0 w-full h-full" style={{ background: gradientStyle }} />
  }

  return (
    <Image
      src={src!}
      alt={alt}
      fill
      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
      sizes={
        priority
          ? "100vw"
          : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      }
      loading={priority ? "eager" : "lazy"}
      priority={priority}
      quality={100}
      onError={() => setShowGradient(true)}
    />
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

  if (variant === "hero") {
    return (
      <Link href={`/article/${article.slug}`} className="group relative block w-full overflow-hidden bg-black">
        <div className="relative w-full h-[320px] sm:h-[400px] md:h-[520px] lg:h-[600px]">
          <ArticleImage
            src={article.image}
            alt={article.title || ""}
            categorySlug={article.categorySlug}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 md:p-8 lg:p-12 z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
            {article.breaking && (
              <span className="inline-flex items-center gap-1.5 rounded bg-destructive px-2.5 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.08em] text-white shadow-lg shadow-destructive/40">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                بریکنگ
              </span>
            )}
            <span className="rounded bg-white/20 px-2.5 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.08em] text-white backdrop-blur-sm border border-white/20">
              {catName}
            </span>
          </div>
          <h2 className="font-headline text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.3] line-clamp-3" dir="auto" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.5)" }}>
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="mt-2 sm:mt-3 max-w-2xl text-[13px] sm:text-[14px] md:text-[15px] leading-[1.6] sm:leading-[1.7] text-white/85 line-clamp-2 hidden sm:block" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
              {article.excerpt}
            </p>
          )}
          <div className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] text-white/60">
            <span suppressHydrationWarning className="flex items-center gap-1">
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDateRelative(article.publishedAt)}
            </span>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {article.readingTime} منٹ
            </span>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === "featured") {
    return (
      <Link href={`/article/${article.slug}`} className="group block w-full">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted rounded-lg shadow-sm border border-border/10">
          <ArticleImage
            src={article.image}
            alt={article.title || ""}
            categorySlug={article.categorySlug}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 mb-1.5 sm:mb-2">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.06em] text-destructive">{catName}</span>
          <span className="text-[10px] sm:text-[11px] text-muted-foreground">•</span>
          <span className="text-[10px] sm:text-[11px] text-muted-foreground" suppressHydrationWarning>{formatDateRelative(article.publishedAt)}</span>
        </div>
        <h3 className="font-headline text-sm sm:text-base lg:text-lg font-bold leading-[1.7] line-clamp-2 group-hover:text-destructive transition-colors duration-200" dir="auto">{article.title}</h3>
        {article.excerpt && (
          <p className="mt-1 sm:mt-1.5 text-[12px] leading-[1.6] text-muted-foreground line-clamp-2">{article.excerpt}</p>
        )}
      </Link>
    )
  }

  if (variant === "horizontal") {
    return (
      <Link href={`/article/${article.slug}`} className="group flex gap-2.5 sm:gap-3 py-3 sm:py-3.5 border-b border-border/10 last:border-0 transition-colors hover:bg-muted/50 -mx-3 px-3 rounded-sm">
        <div className="w-[80px] sm:w-[88px] md:w-[100px] shrink-0">
          <div className="relative aspect-square w-full overflow-hidden bg-muted rounded-md shadow-sm border border-border/10">
            <ArticleImage
              src={article.image}
              alt={article.title || ""}
              categorySlug={article.categorySlug}
            />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-1.5 pe-1 overflow-visible" style={{ minWidth: 0 }}>
          <h4 className="font-headline text-[12px] sm:text-[13px] md:text-[14px] font-bold leading-[1.8] text-foreground group-hover:text-destructive transition-colors duration-200" dir="auto" style={{ overflowWrap: "break-word", wordBreak: "break-word", whiteSpace: "normal" }}>
            {article.title}
          </h4>
          <span className="text-[10px] text-muted-foreground" suppressHydrationWarning>
            {formatDateRelative(article.publishedAt)}
          </span>
        </div>
      </Link>
    )
  }

  if (variant === "text-list") {
    return (
      <div className="border-b border-border/10 py-2 sm:py-2.5 last:border-0">
        <Link href={`/article/${article.slug}`} className="headline-link group">
          <span className="headline-dot" />
          <div className="min-w-0 flex-1 flex flex-col gap-0.5">
            <h4 className="font-headline text-[12px] sm:text-[13px] font-bold leading-[1.7] text-foreground line-clamp-2 group-hover:text-destructive transition-colors" dir="auto">
              {article.title}
            </h4>
            <span className="block text-[10px] text-muted-foreground" suppressHydrationWarning>
              {formatDateRelative(article.publishedAt)}
            </span>
          </div>
        </Link>
      </div>
    )
  }

  const isDefault = variant === "default"

  if (isDefault) {
    return (
      <Link href={`/article/${article.slug}`} className="group block card-article w-full">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          <ArticleImage
            src={article.image}
            alt={article.title || ""}
            categorySlug={article.categorySlug}
          />
        </div>
        <div className="p-2.5 sm:p-3">
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mb-1.5">
            <span className="text-[9px] font-bold uppercase tracking-[0.06em] text-destructive">{catName}</span>
            <span className="text-[9px] text-muted-foreground">•</span>
            <span className="text-[9px] text-muted-foreground" suppressHydrationWarning>{formatDateRelative(article.publishedAt)}</span>
          </div>
          <h3 className="font-headline text-[12px] sm:text-[13px] font-bold leading-[1.7] line-clamp-2 group-hover:text-destructive transition-colors duration-200" dir="auto">{article.title}</h3>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/article/${article.slug}`} className="group block w-full">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted rounded-lg shadow-sm border border-border/10 mb-2 sm:mb-2.5">
        <ArticleImage
          src={article.image}
          alt={article.title || ""}
          categorySlug={article.categorySlug}
        />
      </div>
      <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mb-1.5">
        <span className="text-[9px] font-bold uppercase tracking-[0.06em] text-destructive">{catName}</span>
        <span className="text-[9px] text-muted-foreground">•</span>
        <span className="text-[9px] text-muted-foreground" suppressHydrationWarning>{formatDateRelative(article.publishedAt)}</span>
      </div>
      <h3 className="font-headline text-[12px] sm:text-[13px] font-bold leading-[1.7] line-clamp-2 group-hover:text-destructive transition-colors duration-200" dir="auto">{article.title}</h3>
    </Link>
  )
}
