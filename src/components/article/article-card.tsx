import Link from "next/link"
import { Calendar, Clock } from "lucide-react"

import type { ArticleLink } from "@/types"
import { formatDateRelative } from "@/lib/utils"
import { cn } from "@/lib/utils"

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
  number?: number
  className?: string
}

export function ArticleCard({
  article,
  variant = "default",
  number,
  className,
}: ArticleCardProps) {
  if (variant === "hero") {
    return (
      <Link
        href={`/article/${article.slug}`}
        className={cn("group relative block overflow-hidden bg-black rounded-sm", className)}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted sm:aspect-[16/9] lg:aspect-[21/9]">
          {article.image && (
            <img
              src={article.image}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-1000 ease-out-expo group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 via-40% to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-8 lg:p-10 xl:p-12">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-sm bg-news-red px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white shadow-sm sm:px-3 sm:py-1 sm:text-[11px]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            <span className="hidden sm:inline">{article.category}</span>
            <span className="sm:hidden">Live</span>
          </div>
          <h3 className="font-headline text-xl font-bold leading-tight text-white sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl max-w-4xl text-balance">
            {article.title}
          </h3>
          <p className="mt-1 line-clamp-2 max-w-3xl text-xs leading-relaxed text-gray-300 sm:mt-2 sm:text-sm md:text-base md:leading-relaxed lg:text-lg">
            {article.excerpt}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-400 sm:mt-3 sm:gap-x-4 sm:text-xs md:mt-4">
            <span className="font-semibold text-gray-200">{article.author}</span>
            <span className="hidden h-1 w-1 rounded-full bg-gray-600 sm:inline-block" />
            <span className="flex items-center gap-1 sm:gap-1.5">
              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              {formatDateRelative(article.publishedAt)}
            </span>
            <span className="h-1 w-1 rounded-full bg-gray-600" />
            <span className="flex items-center gap-1 sm:gap-1.5">
              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              {article.readingTime}m
            </span>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === "featured") {
    return (
      <Link
        href={`/article/${article.slug}`}
        className={cn("group grid gap-4 sm:gap-5 md:grid-cols-5", className)}
      >
        <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-muted md:col-span-2">
          {article.image ? (
            <img
              src={article.image}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50" />
          )}
        </div>
        <div className="md:col-span-3 md:self-center">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="h-3 w-0.5 shrink-0 rounded-full bg-news-red" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-news-red">
              {article.category}
            </span>
          </div>
          <h3 className="font-headline text-base font-bold leading-snug tracking-tight sm:text-lg md:text-2xl/tight">
            {article.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground sm:mt-2">
            {article.excerpt}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground sm:mt-3">
            <span className="font-semibold text-foreground">{article.author}</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>{formatDateRelative(article.publishedAt)}</span>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === "horizontal") {
    return (
      <Link
        href={`/article/${article.slug}`}
        className={cn("group flex gap-3 sm:gap-4", className)}
      >
        <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-sm bg-muted sm:w-[120px] md:w-[140px]">
          {article.image ? (
            <img
              src={article.image}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : null}
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <span className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-news-red sm:mb-1">
            {article.category}
          </span>
          <h3 className="font-headline text-sm font-bold leading-snug sm:text-base/relaxed">
            {article.title}
          </h3>
          <span className="mt-1 text-[11px] text-muted-foreground sm:mt-1.5 sm:text-xs">
            {formatDateRelative(article.publishedAt)}
          </span>
        </div>
      </Link>
    )
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/article/${article.slug}`}
        className={cn("group flex gap-3 py-3", className)}
      >
        <div className="relative aspect-square w-16 shrink-0 overflow-hidden rounded-sm bg-muted sm:w-[72px]">
          {article.image ? (
            <img
              src={article.image}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/70" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-headline text-sm font-bold leading-snug group-hover:text-news-red transition-colors">
            {article.title}
          </h3>
          <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">
            {formatDateRelative(article.publishedAt)}
          </p>
        </div>
      </Link>
    )
  }

  if (variant === "numbered") {
    return (
      <Link
        href={`/article/${article.slug}`}
        className={cn("group flex items-start gap-3 sm:gap-4", className)}
      >
        <span className="font-headline text-2xl font-black leading-none tabular-nums text-foreground/[0.07] sm:text-3xl md:text-4xl lg:text-5xl transition-colors group-hover:text-news-red/[0.12]">
          {String(number ?? 0).padStart(2, "0")}
        </span>
        <div className="flex-1 min-w-0">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-news-red sm:mb-1.5">
            {article.category}
          </span>
          <h3 className="font-headline text-sm font-bold leading-snug group-hover:text-news-red transition-colors">
            {article.title}
          </h3>
          <span className="mt-1 block text-[11px] text-muted-foreground sm:mt-1.5 sm:text-xs">
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
        className={cn("group border-b border-border py-3 last:border-0 block sm:py-3.5", className)}
      >
        <div className="mb-1 flex items-center gap-2">
          <span className="h-2.5 w-0.5 shrink-0 rounded-full bg-news-red/70" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-news-red">
            {article.category}
          </span>
        </div>
        <h3 className="font-headline text-sm font-bold leading-snug sm:text-base/relaxed transition-colors group-hover:text-news-red">
          {article.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>
        <span className="mt-1 block text-[11px] text-muted-foreground">
          {formatDateRelative(article.publishedAt)}
        </span>
      </Link>
    )
  }

  return (
    <Link
      href={`/article/${article.slug}`}
      className={cn("group flex flex-col rounded-sm transition-all duration-300 hover:shadow-card-hover", className)}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-muted">
        {article.image ? (
          <img
            src={article.image}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50" />
        )}
      </div>
      <div className="mt-2.5 flex-1 sm:mt-3">
        <div className="mb-1 flex items-center gap-2 sm:mb-1.5">
          <span className="h-2.5 w-0.5 shrink-0 rounded-full bg-news-red/70" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-news-red">
            {article.category}
          </span>
        </div>
        <h3 className="font-headline text-sm font-bold leading-snug tracking-tight sm:text-base md:text-lg/relaxed transition-colors group-hover:text-news-red">
          {article.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground sm:mt-1.5">
          {article.excerpt}
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground sm:mt-3">
          <span className="font-semibold text-foreground">{article.author}</span>
          <span className="h-1 w-1 rounded-full bg-border" />
          <span>{formatDateRelative(article.publishedAt)}</span>
        </div>
      </div>
    </Link>
  )
}
