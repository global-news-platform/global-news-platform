"use client"

import type { HTMLAttributes } from "react"
import Link from "next/link"
import { cn, formatDateRelative } from "@/lib/utils"
import { EditorialImage } from "@/components/common/editorial-image"
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

function CardTitle({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  if (!children) return null
  return (
    <h3
      className={cn(
        "overflow-wrap-anywhere font-headline font-bold leading-[1.2] line-clamp-2",
        className,
      )}
    >
      {children}
    </h3>
  )
}

function CardText({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  if (!children) return null
  return (
    <p
      className={cn(
        "overflow-wrap-anywhere line-clamp-2 text-sm leading-relaxed text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  )
}

function CategoryBadge({ slug }: { slug: string }) {
  const name = categories.find((c) => c.slug === slug)?.name || slug
  const colors: Record<string, string> = {
    world: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    politics: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
    business: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    technology: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    science: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
    health: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    climate: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
    culture: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300",
    sports: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
    opinion: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    general: "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  }
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-[3px] text-[10px] font-semibold uppercase tracking-[0.12em]",
        colors[slug] || "bg-secondary text-muted-foreground",
      )}
    >
      {name}
    </span>
  )
}

export function ArticleCard({ article, variant = "default", index }: ArticleCardProps) {
  if (!article || !article.slug) return null

  const categoryName =
    categories.find((c) => c.slug === article.categorySlug)?.name ||
    article.category

  if (variant === "hero") {
    return (
      <Link
        href={`/article/${article.slug}`}
        className="group relative block overflow-hidden rounded-xl bg-card shadow-sm transition-all duration-500 hover:shadow-lg"
      >
        <div className="relative w-full h-[420px] overflow-hidden">
          <EditorialImage
            src={article.image}
            alt={article.title || ""}
            categorySlug={article.categorySlug}
            slug={article.slug}
            className="transition-all duration-700 ease-out group-hover:scale-[1.03]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 lg:p-10">
          <div className="mb-3 flex items-center gap-3">
            <span className="inline-block rounded-full bg-white/20 px-2.5 py-[3px] text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
              {categoryName}
            </span>
            <span className="text-[12px] text-white/60">
              {article.readingTime} min read
            </span>
          </div>
          <CardTitle className="line-clamp-3 text-xl text-white md:text-3xl lg:text-4xl">
            {article.title}
          </CardTitle>
          {article.excerpt && (
            <CardText className="mt-2 max-w-2xl text-white/60 md:text-base">
              {article.excerpt}
            </CardText>
          )}
          <div className="mt-4 text-[12px] text-white/40" suppressHydrationWarning>
            {formatDateRelative(article.publishedAt)}
          </div>
        </div>
      </Link>
    )
  }

  if (variant === "featured") {
    return (
      <Link
        href={`/article/${article.slug}`}
        className="group block h-full"
      >
        <div className="flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border/40 transition-all duration-500 hover:shadow-md">
          <div className="relative w-full h-56 overflow-hidden">
            <EditorialImage
              src={article.image}
              alt={article.title || ""}
              categorySlug={article.categorySlug}
              slug={article.slug}
              className="transition-all duration-700 ease-out group-hover:scale-[1.03]"
            />
          </div>
          <div className="flex flex-1 flex-col p-4 md:p-5">
            <div className="flex items-center gap-2.5">
              <CategoryBadge slug={article.categorySlug} />
              <span className="text-[12px] text-muted-foreground">
                {article.readingTime} min read
              </span>
            </div>
            <CardTitle className="mt-2 text-lg md:text-xl">
              {article.title}
            </CardTitle>
            {article.excerpt && (
              <CardText className="mt-1.5">
                {article.excerpt}
              </CardText>
            )}
            <span
              className="mt-auto block pt-3 text-[12px] text-muted-foreground/50"
              suppressHydrationWarning
            >
              {formatDateRelative(article.publishedAt)}
            </span>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === "large") {
    return (
      <Link
        href={`/article/${article.slug}`}
        className="group block h-full"
      >
        <div className="flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border/40 transition-all duration-500 hover:shadow-md">
          <div className="relative w-full h-56 overflow-hidden">
            <EditorialImage
              src={article.image}
              alt={article.title || ""}
              categorySlug={article.categorySlug}
              slug={article.slug}
              className="transition-all duration-700 ease-out group-hover:scale-[1.03]"
            />
          </div>
          <div className="flex flex-1 flex-col p-4 md:p-5">
            <div className="flex items-center gap-2.5">
              <CategoryBadge slug={article.categorySlug} />
              <span className="text-[12px] text-muted-foreground">
                {article.readingTime} min read
              </span>
            </div>
            <CardTitle className="mt-2 text-xl md:text-2xl">
              {article.title}
            </CardTitle>
            {article.excerpt && (
              <CardText className="mt-1.5 text-sm">
                {article.excerpt}
              </CardText>
            )}
            <span
              className="mt-auto block pt-3 text-[12px] text-muted-foreground/50"
              suppressHydrationWarning
            >
              {formatDateRelative(article.publishedAt)}
            </span>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === "horizontal") {
    return (
      <Link
        href={`/article/${article.slug}`}
        className="group flex gap-4 py-3"
      >
        <div className="relative w-24 shrink-0 overflow-hidden rounded-lg shadow-sm md:w-36">
          <div className="relative w-full h-16 overflow-hidden">
            <EditorialImage
              src={article.image}
              alt={article.title || ""}
              categorySlug={article.categorySlug}
              slug={article.slug}
              className="transition-all duration-500 group-hover:scale-[1.03]"
            />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <CategoryBadge slug={article.categorySlug} />
          <CardTitle className="mt-1.5 text-sm font-semibold">
            {article.title}
          </CardTitle>
          <span
            className="mt-1.5 text-[11px] text-muted-foreground"
            suppressHydrationWarning
          >
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
        className="group flex items-start gap-4 py-3"
      >
        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg shadow-sm md:h-16 md:w-24">
          <EditorialImage
            src={article.image}
            alt={article.title || ""}
            categorySlug={article.categorySlug}
            slug={article.slug}
            className="transition-all duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <span className="font-headline text-[40px] font-bold leading-none tracking-tight text-foreground/10">
          {(index ?? 1).toString().padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <CardTitle className="text-sm font-semibold leading-snug group-hover:text-muted-foreground">
            {article.title}
          </CardTitle>
          <span
            className="mt-1.5 block text-[11px] text-muted-foreground"
            suppressHydrationWarning
          >
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
        className="group flex items-start gap-3 py-2"
      >
        <div className="relative w-20 shrink-0 overflow-hidden rounded-lg shadow-sm">
          <div className="relative w-full h-14 overflow-hidden">
            <EditorialImage
              src={article.image}
              alt={article.title || ""}
              categorySlug={article.categorySlug}
              slug={article.slug}
              className="transition-all duration-500 group-hover:scale-[1.03]"
            />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle className="text-sm font-semibold leading-snug">
            {article.title}
          </CardTitle>
          <span
            className="mt-1 block text-[11px] text-muted-foreground"
            suppressHydrationWarning
          >
            {formatDateRelative(article.publishedAt)}
          </span>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/article/${article.slug}`}
      className="group block h-full"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border/40 transition-all duration-500 hover:shadow-md">
        <div className="relative w-full h-48 overflow-hidden">
          <EditorialImage
            src={article.image}
            alt={article.title || ""}
            categorySlug={article.categorySlug}
            slug={article.slug}
            className="transition-all duration-700 ease-out group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-center gap-2.5">
            <CategoryBadge slug={article.categorySlug} />
            <span className="text-[11px] text-muted-foreground">
              {article.readingTime}m
            </span>
          </div>
          <CardTitle className="mt-2 text-sm font-bold md:text-base">
            {article.title}
          </CardTitle>
          {article.excerpt && (
            <CardText className="mt-1 text-sm">
              {article.excerpt}
            </CardText>
          )}
          <span
            className="mt-auto block pt-2 text-[11px] text-muted-foreground/50"
            suppressHydrationWarning
          >
            {formatDateRelative(article.publishedAt)}
          </span>
        </div>
      </div>
    </Link>
  )
}
