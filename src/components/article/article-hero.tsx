import Link from "next/link"
import { Calendar, Clock } from "lucide-react"

import { Breadcrumbs } from "@/components/article/breadcrumbs"
import { OptimizedImage } from "@/components/common/optimized-image"
import { formatDate } from "@/lib/utils"
import type { ArticleMeta } from "@/types"

interface ArticleHeroProps {
  article: ArticleMeta
}

export function ArticleHero({ article }: ArticleHeroProps) {
  return (
    <section className="border-b border-border bg-gradient-to-b from-secondary/40 to-background">
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12 lg:py-16">
        <Breadcrumbs
          items={[
            { label: article.category, href: `/category/${article.categorySlug}` },
            { label: article.title },
          ]}
        />

        <Link
          href={`/category/${article.categorySlug}`}
          className="mb-4 inline-block"
        >
          <span className="inline-block rounded-sm bg-news-red px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90">
            {article.category}
          </span>
        </Link>

        <h1 className="font-headline text-3xl font-black leading-tight md:text-4xl lg:text-5xl">
          {article.title}
        </h1>

        <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
          {article.excerpt}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <Link
            href={`/author/${article.authorSlug}`}
            className="group flex items-center gap-2 font-medium text-foreground"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-bold text-muted-foreground group-hover:text-foreground">
              {article.author.charAt(0)}
            </span>
            <span className="group-hover:underline">{article.author}</span>
          </Link>
          <span className="hidden h-1 w-1 rounded-full bg-border md:block" />
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(article.publishedAt)}
          </span>
          {article.updatedAt && (
            <>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span className="text-xs">Updated {formatDate(article.updatedAt)}</span>
            </>
          )}
          <span className="h-1 w-1 rounded-full bg-border" />
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {article.readingTime} min read
          </span>
        </div>
      </div>

      {article.image && (
        <div className="mx-auto max-w-5xl px-4 pb-8 md:px-6 md:pb-12">
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-muted">
            <OptimizedImage
              src={article.image}
              alt={article.imageAlt || article.title}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1200px"
              className="object-cover"
            />
          </div>
          {article.imageAlt && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {article.imageAlt}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
