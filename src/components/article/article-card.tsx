"use client"

import Link from "next/link"
import Image from "next/image"
import { cn, formatDateRelative } from "@/lib/utils"
import { categories } from "@/lib/constants"
import { getCategoryGradient } from "@/lib/images/fallbackImages"
import type { ArticleLink } from "@/types"

interface ArticleCardProps {
  article: ArticleLink
  variant?: "hero" | "featured" | "horizontal" | "text-list" | "compact" | "default"
}

function EditorialFallback({ categorySlug, categoryName }: { categorySlug: string; categoryName: string }) {
  return (
    <div
      className={cn(
        "w-full h-full flex items-center justify-center bg-gradient-to-br",
        getCategoryGradient(categorySlug),
      )}
    >
      <div className="text-center px-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-3 backdrop-blur-sm">
          <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
          </svg>
        </div>
        <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.15em]">{categoryName}</p>
      </div>
    </div>
  )
}

function ArticleImage({
  src,
  alt,
  categorySlug,
  categoryName,
  priority = false,
}: {
  src?: string | null
  alt: string
  categorySlug: string
  categoryName: string
  priority?: boolean
}) {
  if (src && typeof src === "string" && (src.startsWith("/") || src.startsWith("http"))) {
    return (
      <Image
        src={src}
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
        quality={92}
      />
    )
  }

  return <EditorialFallback categorySlug={categorySlug} categoryName={categoryName} />
}

export function ArticleCard({ article, variant = "compact" }: ArticleCardProps) {
  if (!article || !article.slug) return null
  const catName = categories.find((c) => c.slug === article.categorySlug)?.name || article.category
  const hasImage = article.image && typeof article.image === "string" && (article.image.startsWith("/") || article.image.startsWith("http"))

  if (variant === "hero") {
    return (
      <Link href={`/article/${article.slug}`} className="group relative block w-full overflow-hidden bg-black">
        <div className="relative w-full h-[320px] sm:h-[400px] md:h-[520px] lg:h-[600px]">
          {hasImage ? (
            <Image
              src={article.image!}
              alt={article.title || ""}
              fill
              className="object-cover object-center transition-all duration-700 ease-out group-hover:scale-105"
              sizes="100vw"
              priority
              quality={100}
            />
          ) : (
            <EditorialFallback categorySlug={article.categorySlug} categoryName={catName} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 md:p-8 lg:p-12">
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
          <h2 className="font-headline text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.15] line-clamp-3 drop-shadow-lg">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="mt-2 sm:mt-3 max-w-2xl text-[13px] sm:text-[14px] md:text-[15px] leading-[1.6] sm:leading-[1.7] text-white/75 line-clamp-2 drop-shadow hidden sm:block">
              {article.excerpt}
            </p>
          )}
          <div className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] text-white/50">
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
            categoryName={catName}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 mb-1 sm:mb-1.5">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.06em] text-destructive">{catName}</span>
          <span className="text-[10px] sm:text-[11px] text-muted-foreground">•</span>
          <span className="text-[10px] sm:text-[11px] text-muted-foreground" suppressHydrationWarning>{formatDateRelative(article.publishedAt)}</span>
        </div>
        <h3 className="font-headline text-sm sm:text-base lg:text-lg font-bold leading-[1.45] line-clamp-2 group-hover:text-destructive transition-colors duration-200">{article.title}</h3>
        {article.excerpt && (
          <p className="mt-1 sm:mt-1.5 text-[12px] leading-[1.6] text-muted-foreground line-clamp-2">{article.excerpt}</p>
        )}
      </Link>
    )
  }

  if (variant === "horizontal") {
    return (
      <Link href={`/article/${article.slug}`} className="group flex gap-2.5 sm:gap-3 py-2.5 sm:py-3 border-b border-border/10 last:border-0 transition-colors hover:bg-muted/50 -mx-3 px-3 rounded-sm">
        <div className="w-[80px] sm:w-[88px] md:w-[100px] shrink-0">
          <div className="relative aspect-square w-full overflow-hidden bg-muted rounded-md shadow-sm border border-border/10">
            <ArticleImage
              src={article.image}
              alt={article.title || ""}
              categorySlug={article.categorySlug}
              categoryName={catName}
            />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <h4 className="font-headline text-[12px] sm:text-[13px] md:text-[14px] font-bold leading-[1.5] line-clamp-2 group-hover:text-destructive transition-colors duration-200">{article.title}</h4>
          <span className="mt-0.5 sm:mt-1 text-[10px] text-muted-foreground" suppressHydrationWarning>
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
          <div className="min-w-0 flex-1">
            <h4 className="font-headline text-[12px] sm:text-[13px] font-bold leading-[1.6] text-foreground line-clamp-2 group-hover:text-destructive transition-colors">
              {article.title}
            </h4>
            <span className="mt-0.5 block text-[10px] text-muted-foreground" suppressHydrationWarning>
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
            categoryName={catName}
          />
        </div>
        <div className="p-2.5 sm:p-3">
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mb-1">
            <span className="text-[9px] font-bold uppercase tracking-[0.06em] text-destructive">{catName}</span>
            <span className="text-[9px] text-muted-foreground">•</span>
            <span className="text-[9px] text-muted-foreground" suppressHydrationWarning>{formatDateRelative(article.publishedAt)}</span>
          </div>
          <h3 className="font-headline text-[12px] sm:text-[13px] font-bold leading-[1.5] line-clamp-2 group-hover:text-destructive transition-colors duration-200">{article.title}</h3>
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
          categoryName={catName}
        />
      </div>
      <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mb-1">
        <span className="text-[9px] font-bold uppercase tracking-[0.06em] text-destructive">{catName}</span>
        <span className="text-[9px] text-muted-foreground">•</span>
        <span className="text-[9px] text-muted-foreground" suppressHydrationWarning>{formatDateRelative(article.publishedAt)}</span>
      </div>
      <h3 className="font-headline text-[12px] sm:text-[13px] font-bold leading-[1.5] line-clamp-2 group-hover:text-destructive transition-colors duration-200">{article.title}</h3>
    </Link>
  )
}
