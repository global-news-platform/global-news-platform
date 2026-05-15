"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { formatDateRelative } from "@/lib/utils"
import { OptimizedImage } from "@/components/common/optimized-image"
import { categories } from "@/lib/constants"
import type { ArticleLink } from "@/types"

interface ArticleCardProps {
  article: ArticleLink
  variant?:
    | "default"
    | "compact"
    | "hero"
    | "featured"
    | "horizontal"
    | "numbered"
    | "sidebar"
    | "large"
  index?: number
}

const categoryColors: Record<string, string> = {
  world: "bg-blue-500",
  politics: "bg-red-500",
  business: "bg-amber-500",
  technology: "bg-purple-500",
  science: "bg-cyan-500",
  health: "bg-emerald-500",
  climate: "bg-emerald-500",
  culture: "bg-amber-500",
  sports: "bg-blue-500",
  opinion: "bg-red-500",
}

export function ArticleCard({ article, variant = "default", index }: ArticleCardProps) {
  const catColor = categoryColors[article.categorySlug] || "bg-foreground"
  const categoryName = categories.find((c) => c.slug === article.categorySlug)?.name || article.category

  if (variant === "hero") {
    return (
      <Link
        href={`/article/${article.slug}`}
        className="group relative block overflow-hidden rounded-lg bg-card"
      >
        <div className="aspect-[16/10] overflow-hidden">
          <OptimizedImage
            src={article.image || "/images/placeholder.svg"}
            alt={article.title}
            fill
            className="transition-transform duration-700 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 60vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
        <div className="absolute bottom-0 p-5 md:p-8">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="rounded bg-white/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
              {categoryName}
            </span>
            <span className="text-[12px] text-white/70">
              {article.readingTime} min read
            </span>
          </div>
          <h2 className="font-headline text-xl font-bold leading-tight text-white md:text-3xl md:leading-tight lg:text-4xl lg:leading-tight">
            {article.title}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/70 md:text-base">
            {article.excerpt}
          </p>
          <div className="mt-3 flex items-center gap-2 text-[12px] text-white/50">
            <span>{formatDateRelative(article.publishedAt)}</span>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === "featured") {
    return (
      <Link
        href={`/article/${article.slug}`}
        className="group block"
      >
        <div className="mb-3 overflow-hidden rounded-lg">
          <OptimizedImage
            src={article.image || "/images/placeholder.svg"}
            alt={article.title}
            fill={false}
            width={800}
            height={450}
            className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {categoryName}
            </span>
            <span className="text-[11px] text-muted-foreground/40">&middot;</span>
            <span className="text-[11px] text-muted-foreground">
              {article.readingTime} min read
            </span>
          </div>
          <h3 className="font-headline text-lg font-bold leading-snug md:text-xl md:leading-snug">
            {article.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>
          <span className="block text-[12px] text-muted-foreground/60">
            {formatDateRelative(article.publishedAt)}
          </span>
        </div>
      </Link>
    )
  }

  if (variant === "large") {
    return (
      <Link
        href={`/article/${article.slug}`}
        className="group block"
      >
        <div className="mb-4 overflow-hidden rounded-lg">
          <OptimizedImage
            src={article.image || "/images/placeholder.svg"}
            alt={article.title}
            fill={false}
            width={1200}
            height={675}
            className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {categoryName}
            </span>
            <span className="text-[11px] text-muted-foreground/40">&middot;</span>
            <span className="text-[11px] text-muted-foreground">
              {article.readingTime} min read
            </span>
          </div>
          <h3 className="font-headline text-xl font-bold leading-snug md:text-2xl md:leading-snug">
            {article.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>
          <span className="block text-[12px] text-muted-foreground/60">
            {formatDateRelative(article.publishedAt)}
          </span>
        </div>
      </Link>
    )
  }

  if (variant === "horizontal") {
    return (
      <Link
        href={`/article/${article.slug}`}
        className="group flex gap-4"
      >
        <div className="w-28 shrink-0 overflow-hidden rounded md:w-32">
          <OptimizedImage
            src={article.image || "/images/placeholder.svg"}
            alt={article.title}
            fill={false}
            width={160}
            height={120}
            className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="128px"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {categoryName}
          </span>
          <h3 className="mt-1 text-sm font-semibold leading-snug">
            {article.title}
          </h3>
          <span className="mt-1.5 text-[11px] text-muted-foreground">
            {formatDateRelative(article.publishedAt)}
          </span>
        </div>
      </Link>
    )
  }

  if (variant === "numbered") {
    return (
      <Link
        href={`/article/${article.slug}`}
        className="group flex items-start gap-4"
      >
        <span className="font-headline text-3xl font-bold leading-none text-muted-foreground/20">
          {String(index ?? 1).padStart(2, "0")}
        </span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold leading-snug transition-colors group-hover:text-muted-foreground">
            {article.title}
          </h3>
          <span className="mt-1 block text-[11px] text-muted-foreground">
            {formatDateRelative(article.publishedAt)}
          </span>
        </div>
      </Link>
    )
  }

  if (variant === "sidebar") {
    return (
      <Link
        href={`/article/${article.slug}`}
        className="group flex items-start gap-3"
      >
        <div className="w-16 shrink-0 overflow-hidden rounded">
          <OptimizedImage
            src={article.image || "/images/placeholder.svg"}
            alt={article.title}
            fill={false}
            width={80}
            height={80}
            className="aspect-square w-full object-cover"
            sizes="64px"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold leading-snug">
            {article.title}
          </h3>
          <span className="mt-1 block text-[11px] text-muted-foreground">
            {formatDateRelative(article.publishedAt)}
          </span>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/article/${article.slug}`}
      className="group block"
    >
      <div className="mb-3 overflow-hidden rounded-lg">
        <OptimizedImage
          src={article.image || "/images/placeholder.svg"}
          alt={article.title}
          fill={false}
          width={600}
          height={338}
          className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {categoryName}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {article.readingTime}m
          </span>
        </div>
        <h3 className="text-sm font-bold leading-snug md:text-base md:leading-snug">
          {article.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>
      </div>
    </Link>
  )
}
