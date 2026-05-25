"use client"

import Link from "next/link"
import Image from "next/image"
import { cn, formatDateRelative } from "@/lib/utils"
import { categories } from "@/lib/constants"
import type { ArticleLink } from "@/types"

const FALLBACK_IMAGE = "/images/fallback/default.jpg"

function normalizeImage(image: string | undefined | null): string {
  if (!image || typeof image !== "string" || image.trim() === "") return FALLBACK_IMAGE
  const t = image.trim()
  if (t.startsWith("data:") || t.startsWith("http://") || t.startsWith("https://") || t.startsWith("/")) return t
  return FALLBACK_IMAGE
}

interface ArticleCardProps {
  article: ArticleLink
  variant?: "hero" | "compact" | "horizontal" | "text-list" | "featured" | "default"
  index?: number
}

export function ArticleCard({ article, variant = "compact", index }: ArticleCardProps) {
  if (!article || !article.slug) return null
  const catName = categories.find((c) => c.slug === article.categorySlug)?.name || article.category

  if (variant === "hero") {
    return (
      <Link href={`/article/${article.slug}`} className="group relative block h-full overflow-hidden">
        <div className="relative h-full min-h-[380px] md:min-h-[480px] lg:min-h-[540px] overflow-hidden">
          <Image
            src={normalizeImage(article.image)}
            alt={article.title || ""}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            width={1200}
            height={675}
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 hero-gradient" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1 rounded bg-destructive px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-white">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              بریکنگ
            </span>
            <span className="rounded bg-white/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-white backdrop-blur-sm">
              {catName}
            </span>
          </div>
          <h2 className="font-headline text-lg md:text-2xl lg:text-3xl font-bold text-white leading-[1.3] line-clamp-3">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="mt-2 max-w-xl text-[13px] leading-[1.6] text-white/70 line-clamp-2">
              {article.excerpt}
            </p>
          )}
          <div className="mt-3 flex items-center gap-2 text-[11px] text-white/50">
            <span suppressHydrationWarning>{formatDateRelative(article.publishedAt)}</span>
            <span className="text-white/30">•</span>
            <span>{article.readingTime} منٹ</span>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === "featured") {
    return (
      <Link href={`/article/${article.slug}`} className="group block">
        <div className="relative h-40 md:h-48 overflow-hidden mb-2.5">
          <Image
            src={normalizeImage(article.image)}
            alt={article.title || ""}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            width={600}
            height={400}
            sizes="50vw"
          />
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-destructive">{catName}</span>
          <span className="text-[10px] text-muted-foreground">•</span>
          <span className="text-[10px] text-muted-foreground" suppressHydrationWarning>{formatDateRelative(article.publishedAt)}</span>
        </div>
        <h3 className="font-headline text-sm md:text-base font-bold leading-[1.5] line-clamp-2">{article.title}</h3>
      </Link>
    )
  }

  if (variant === "horizontal") {
    return (
      <Link href={`/article/${article.slug}`} className="group flex gap-3 py-2.5 border-b border-border/20 last:border-0">
        <div className="relative w-20 h-14 shrink-0 overflow-hidden md:w-24 md:h-16">
          <Image
            src={normalizeImage(article.image)}
            alt={article.title || ""}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            width={160}
            height={110}
            sizes="20vw"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <h4 className="font-headline text-[13px] font-bold leading-[1.5] line-clamp-2">{article.title}</h4>
          <span className="mt-0.5 text-[10px] text-muted-foreground" suppressHydrationWarning>
            {formatDateRelative(article.publishedAt)}
          </span>
        </div>
      </Link>
    )
  }

  if (variant === "text-list") {
    return (
      <div className="headline-item">
        <Link href={`/article/${article.slug}`} className="headline-link group">
          <span className="headline-dot" />
          <div className="min-w-0 flex-1">
            <h4 className="font-headline text-[13px] font-bold leading-[1.5] text-foreground line-clamp-2 group-hover:text-destructive transition-colors">
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

  return (
    <Link href={`/article/${article.slug}`} className="group block">
      <div className="relative h-28 md:h-32 overflow-hidden mb-2">
        <Image
          src={normalizeImage(article.image)}
          alt={article.title || ""}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          width={400}
          height={267}
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[9px] font-bold uppercase tracking-[0.06em] text-destructive">{catName}</span>
        <span className="text-[9px] text-muted-foreground">•</span>
        <span className="text-[9px] text-muted-foreground" suppressHydrationWarning>{formatDateRelative(article.publishedAt)}</span>
      </div>
      <h3 className="font-headline text-[13px] font-bold leading-[1.5] line-clamp-2">{article.title}</h3>
    </Link>
  )
}
