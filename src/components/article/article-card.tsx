"use client"

import type { HTMLAttributes } from "react"
import Link from "next/link"
import Image from "next/image"
import { cn, formatDateRelative } from "@/lib/utils"
import { categories } from "@/lib/constants"
import type { ArticleLink } from "@/types"

const FALLBACK_IMAGE = "/images/fallback/default.jpg"

function normalizeImage(image: string | undefined | null): string {
  if (!image || typeof image !== "string" || image.trim() === "") return FALLBACK_IMAGE
  const trimmed = image.trim()
  if (trimmed.startsWith("data:") || trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) return trimmed
  return FALLBACK_IMAGE
}

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

function CardTitle({ children, className }: { children: string; className?: string }) {
  if (!children) return null
  return (
    <h3 className={cn("overflow-wrap-anywhere font-headline font-bold leading-[1.7] line-clamp-2", className)}>
      {children}
    </h3>
  )
}

function CardText({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  if (!children) return null
  return (
    <p className={cn("overflow-wrap-anywhere line-clamp-2 text-sm leading-[1.9] text-muted-foreground", className)} {...props}>
      {children}
    </p>
  )
}

function CategoryBadge({ slug }: { slug: string }) {
  const name = categories.find((c) => c.slug === slug)?.name || slug
  const colors: Record<string, string> = {
    pakistan: "bg-emerald-600 text-white",
    dunya: "bg-blue-600 text-white",
    siasat: "bg-red-600 text-white",
    karobar: "bg-amber-600 text-white",
    technology: "bg-purple-600 text-white",
    khel: "bg-indigo-600 text-white",
    sehat: "bg-emerald-600 text-white",
    science: "bg-cyan-600 text-white",
    shobiz: "bg-fuchsia-600 text-white",
    mazhab: "bg-green-600 text-white",
    taleem: "bg-sky-600 text-white",
    mausam: "bg-teal-600 text-white",
    crime: "bg-rose-600 text-white",
    adalat: "bg-slate-600 text-white",
    baynalaqwami: "bg-blue-600 text-white",
    videos: "bg-violet-600 text-white",
    raye: "bg-rose-600 text-white",
    general: "bg-slate-600 text-white",
  }
  return (
    <span className={cn("inline-block rounded px-2 py-[2px] text-[10px] font-bold uppercase tracking-[0.08em]", colors[slug] || "bg-secondary text-muted-foreground")}>
      {name}
    </span>
  )
}

function CardImage({ src, alt, priority, className }: { src?: string; alt: string; priority?: boolean; className?: string }) {
  const resolvedSrc = normalizeImage(src)
  return (
    <div className="relative w-full h-full overflow-hidden">
      <Image
        src={resolvedSrc}
        alt={alt}
        className={cn("w-full h-full object-cover transition-all duration-500", className)}
        width={800}
        height={533}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={priority}
        loading={priority ? "eager" : "lazy"}
      />
    </div>
  )
}

export function ArticleCard({ article, variant = "default", index }: ArticleCardProps) {
  if (!article || !article.slug) return null

  const categoryName = categories.find((c) => c.slug === article.categorySlug)?.name || article.category

  if (variant === "hero") {
    return (
      <Link href={`/article/${article.slug}`} className="group relative block overflow-hidden bg-card">
        <div className="relative w-full h-[500px] overflow-hidden">
          <CardImage src={article.image} alt={article.title || ""} priority className="group-hover:scale-[1.03]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-12">
          <div className="mb-3 flex items-center gap-3">
            <span className="inline-block rounded bg-white/20 px-2.5 py-[3px] text-[11px] font-bold uppercase tracking-[0.08em] text-white backdrop-blur-sm">
              {categoryName}
            </span>
            <span className="text-[12px] text-white/60">{article.readingTime} منٹ</span>
          </div>
          <CardTitle className="line-clamp-3 text-2xl text-white md:text-4xl lg:text-5xl">
            {article.title}
          </CardTitle>
          {article.excerpt && (
            <CardText className="mt-3 max-w-2xl text-white/70 md:text-lg">
              {article.excerpt}
            </CardText>
          )}
          <div className="mt-4 text-[12px] text-white/50" suppressHydrationWarning>
            {formatDateRelative(article.publishedAt)}
          </div>
        </div>
      </Link>
    )
  }

  if (variant === "featured") {
    return (
      <Link href={`/article/${article.slug}`} className="group block">
        <div className="flex h-full flex-col border border-border bg-card transition-colors hover:bg-secondary/50">
          <div className="relative w-full h-52 overflow-hidden">
            <CardImage src={article.image} alt={article.title || ""} className="group-hover:scale-[1.03]" />
          </div>
          <div className="flex flex-1 flex-col p-4 md:p-5">
            <div className="flex items-center gap-2.5">
              <CategoryBadge slug={article.categorySlug} />
              <span className="text-[12px] text-muted-foreground">{article.readingTime} منٹ</span>
            </div>
            <CardTitle className="mt-2 text-lg md:text-xl">{article.title}</CardTitle>
            {article.excerpt && <CardText className="mt-1.5">{article.excerpt}</CardText>}
            <span className="mt-auto block pt-3 text-[12px] text-muted-foreground/50" suppressHydrationWarning>
              {formatDateRelative(article.publishedAt)}
            </span>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === "large") {
    return (
      <Link href={`/article/${article.slug}`} className="group block">
        <div className="flex h-full flex-col border border-border bg-card transition-colors hover:bg-secondary/50">
          <div className="relative w-full h-56 overflow-hidden">
            <CardImage src={article.image} alt={article.title || ""} className="group-hover:scale-[1.03]" />
          </div>
          <div className="flex flex-1 flex-col p-4 md:p-5">
            <div className="flex items-center gap-2.5">
              <CategoryBadge slug={article.categorySlug} />
              <span className="text-[12px] text-muted-foreground">{article.readingTime} منٹ</span>
            </div>
            <CardTitle className="mt-2 text-xl md:text-2xl">{article.title}</CardTitle>
            {article.excerpt && <CardText className="mt-1.5 text-sm">{article.excerpt}</CardText>}
            <span className="mt-auto block pt-3 text-[12px] text-muted-foreground/50" suppressHydrationWarning>
              {formatDateRelative(article.publishedAt)}
            </span>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === "horizontal") {
    return (
      <Link href={`/article/${article.slug}`} className="group flex gap-4 py-3">
        <div className="relative w-24 shrink-0 overflow-hidden md:w-32">
          <div className="relative w-full h-16 overflow-hidden">
            <CardImage src={article.image} alt={article.title || ""} className="group-hover:scale-[1.03]" />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <CategoryBadge slug={article.categorySlug} />
          <CardTitle className="mt-1.5 text-sm font-semibold">{article.title}</CardTitle>
          <span className="mt-1.5 text-[11px] text-muted-foreground" suppressHydrationWarning>
            {formatDateRelative(article.publishedAt)}
          </span>
        </div>
      </Link>
    )
  }

  if (variant === "numbered") {
    return (
      <Link href={`/article/${article.slug}`} className="group flex items-center gap-4 py-3">
        <span className="font-headline text-[40px] font-bold leading-none tracking-tight text-foreground/10">
          {(index ?? 1).toString().padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <CardTitle className="text-sm font-semibold leading-snug">{article.title}</CardTitle>
          <span className="mt-1.5 block text-[11px] text-muted-foreground" suppressHydrationWarning>
            {formatDateRelative(article.publishedAt)}
          </span>
        </div>
        <div className="relative h-16 w-24 shrink-0 overflow-hidden md:h-20 md:w-28">
          <CardImage src={article.image} alt={article.title || ""} className="group-hover:scale-[1.03]" />
        </div>
      </Link>
    )
  }

  if (variant === "sidebar") {
    return (
      <Link href={`/article/${article.slug}`} className="group flex items-start gap-4 py-2">
        <div className="relative w-20 shrink-0 overflow-hidden">
          <div className="relative w-full h-14 overflow-hidden">
            <CardImage src={article.image} alt={article.title || ""} className="group-hover:scale-[1.03]" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle className="text-sm font-semibold leading-snug">{article.title}</CardTitle>
          <span className="mt-1 block text-[11px] text-muted-foreground" suppressHydrationWarning>
            {formatDateRelative(article.publishedAt)}
          </span>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/article/${article.slug}`} className="group block">
      <div className="flex h-full flex-col border border-border bg-card transition-colors hover:bg-secondary/50">
        <div className="relative w-full h-48 overflow-hidden">
          <CardImage src={article.image} alt={article.title || ""} className="group-hover:scale-[1.03]" />
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-center gap-2.5">
            <CategoryBadge slug={article.categorySlug} />
            <span className="text-[11px] text-muted-foreground">{article.readingTime}منٹ</span>
          </div>
          <CardTitle className="mt-2 text-sm font-bold md:text-base">{article.title}</CardTitle>
          {article.excerpt && <CardText className="mt-1">{article.excerpt}</CardText>}
          <span className="mt-auto block pt-2 text-[11px] text-muted-foreground/50" suppressHydrationWarning>
            {formatDateRelative(article.publishedAt)}
          </span>
        </div>
      </div>
    </Link>
  )
}
