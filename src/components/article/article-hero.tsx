import Link from "next/link"
import { OptimizedImage } from "@/components/common/optimized-image"
import { formatDate } from "@/lib/utils"
import { categories } from "@/lib/constants"
import type { ArticleMeta } from "@/types"

interface ArticleHeroProps {
  article: ArticleMeta
}

export function ArticleHero({ article }: ArticleHeroProps) {
  const categoryName = categories.find((c) => c.slug === article.categorySlug)?.name || article.category

  return (
    <header className="relative">
      {/* Breadcrumbs */}
      <nav className="mb-4 flex items-center gap-2 text-[12px] text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/category/${article.categorySlug}`}
          className="transition-colors hover:text-foreground"
        >
          {categoryName}
        </Link>
        <span>/</span>
        <span className="text-foreground/60">{article.title}</span>
      </nav>

      {/* Category badge */}
      <div className="mb-4">
        <Link
          href={`/category/${article.categorySlug}`}
          className="inline-block rounded bg-foreground/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-foreground/10"
        >
          {categoryName}
        </Link>
      </div>

      {/* Title */}
      <h1 className="font-headline text-3xl font-bold leading-tight md:text-4xl md:leading-tight lg:text-5xl lg:leading-tight">
        {article.title}
      </h1>

      {/* Excerpt */}
      <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
        {article.excerpt}
      </p>

      {/* Meta */}
      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <Link
          href={`/author/${article.authorSlug}`}
          className="font-medium text-foreground transition-colors hover:text-muted-foreground"
        >
          {article.author}
        </Link>
        <span className="text-muted-foreground/40">&middot;</span>
        <time dateTime={article.publishedAt}>
          {formatDate(article.publishedAt)}
        </time>
        <span className="text-muted-foreground/40">&middot;</span>
        <span>{article.readingTime} min read</span>
        {article.updatedAt && (
          <>
            <span className="text-muted-foreground/40">&middot;</span>
            <span className="text-muted-foreground/60">
              Updated {formatDate(article.updatedAt)}
            </span>
          </>
        )}
      </div>

      {/* Image */}
      {article.image && (
        <div className="mt-8 overflow-hidden rounded-lg">
          <OptimizedImage
            src={article.image}
            alt={article.imageAlt || article.title}
            width={1200}
            height={675}
            className="aspect-[16/9] w-full object-cover"
            priority
            sizes="100vw"
          />
        </div>
      )}
    </header>
  )
}
