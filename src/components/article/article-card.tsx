import Link from "next/link"
import { Calendar, Clock } from "lucide-react"

import type { ArticleLink } from "@/types"
import { formatDateRelative } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { OptimizedImage } from "@/components/common/optimized-image"

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
        className={cn("group relative block overflow-hidden rounded-sm", className)}
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-muted lg:aspect-[21/9]">
          {article.image && (
            <OptimizedImage
              src={article.image}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 via-40% to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-l from-black/10 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 lg:p-10">
          <span className="mb-3 inline-block rounded-sm bg-news-red px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-white">
            {article.category}
          </span>
          <h3 className="font-headline text-xl font-bold leading-tight text-white md:text-3xl lg:text-4xl max-w-3xl text-balance">
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-relaxed text-gray-300 md:text-base md:leading-relaxed">
            {article.excerpt}
          </p>
          <div className="mt-3 flex items-center gap-3 text-xs text-gray-400 md:mt-4">
            <span className="font-medium text-gray-200">{article.author}</span>
            <span className="h-1 w-1 rounded-full bg-gray-600" />
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDateRelative(article.publishedAt)}
            </span>
            <span className="h-1 w-1 rounded-full bg-gray-600" />
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readingTime} min read
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
        className={cn("group grid gap-5 md:grid-cols-5", className)}
      >
        <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-muted md:col-span-2">
          {article.image ? (
            <OptimizedImage
              src={article.image}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50" />
          )}
        </div>
        <div className="md:col-span-3 md:self-center">
          <span className="mb-2 inline-block text-[10px] font-semibold uppercase tracking-[0.15em] text-news-red">
            {article.category}
          </span>
          <h3 className="font-headline text-lg font-bold leading-snug group-hover:underline md:text-xl/tight">
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{article.author}</span>
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
        className={cn("group flex gap-4", className)}
      >
        <div className="relative aspect-[4/3] w-[120px] shrink-0 overflow-hidden rounded-sm bg-muted md:w-[140px]">
          {article.image ? (
            <OptimizedImage
              src={article.image}
              alt={article.title}
              fill
              sizes="140px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : null}
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <span className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-news-red">
            {article.category}
          </span>
          <h3 className="font-headline text-sm font-bold leading-snug group-hover:underline md:text-base/relaxed">
            {article.title}
          </h3>
          <span className="mt-1.5 text-xs text-muted-foreground">
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
        <div className="relative aspect-square w-16 shrink-0 overflow-hidden rounded-sm bg-muted sm:w-20">
          {article.image ? (
            <OptimizedImage
              src={article.image}
              alt={article.title}
              fill
              sizes="80px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : null}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-headline text-sm font-bold leading-snug group-hover:underline">
            {article.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
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
        className={cn("group flex items-start gap-4", className)}
      >
        <span className="font-headline text-3xl font-black leading-none tabular-nums text-foreground/10 md:text-4xl">
          {String(number ?? 0).padStart(2, "0")}
        </span>
        <div className="flex-1 min-w-0">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.15em] text-news-red">
            {article.category}
          </span>
          <h3 className="font-headline text-sm font-bold leading-snug group-hover:underline">
            {article.title}
          </h3>
          <span className="mt-1 block text-xs text-muted-foreground">
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
        className={cn("group border-b border-border py-3.5 last:border-0", className)}
      >
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-news-red">
          {article.category}
        </span>
        <h3 className="font-headline text-sm font-bold leading-snug group-hover:underline">
          {article.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>
        <span className="mt-1.5 block text-[11px] text-muted-foreground">
          {formatDateRelative(article.publishedAt)}
        </span>
      </Link>
    )
  }

  return (
    <Link
      href={`/article/${article.slug}`}
      className={cn("group flex flex-col", className)}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-muted">
        {article.image ? (
          <OptimizedImage
            src={article.image}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50" />
        )}
      </div>
      <div className="mt-3 flex-1">
        <span className="mb-1.5 inline-block text-[10px] font-semibold uppercase tracking-[0.15em] text-news-red">
          {article.category}
        </span>
        <h3 className="font-headline text-base font-bold leading-snug group-hover:underline md:text-lg/relaxed">
          {article.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground md:leading-relaxed">
          {article.excerpt}
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{article.author}</span>
          <span className="h-1 w-1 rounded-full bg-border" />
          <span>{formatDateRelative(article.publishedAt)}</span>
        </div>
      </div>
    </Link>
  )
}
