import Link from "next/link"
import { SafeImage } from "@/components/ui/safe-image"
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
      <nav className="mb-4 flex items-center gap-2 overflow-hidden text-[12px] text-muted-foreground">
        <Link href="/" className="shrink-0 transition-colors hover:text-foreground">
          ہوم
        </Link>
        <span className="shrink-0">/</span>
        <Link
          href={`/category/${article.categorySlug}`}
          className="shrink-0 transition-colors hover:text-foreground"
        >
          {categoryName}
        </Link>
        <span className="shrink-0">/</span>
        <span className="overflow-hidden overflow-ellipsis whitespace-nowrap text-foreground/60">
          {article.title}
        </span>
      </nav>

      {/* Category badge */}
      <div className="mb-4">
        <Link
          href={`/category/${article.categorySlug}`}
          className="inline-block rounded bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground"
        >
          {categoryName}
        </Link>
      </div>

      {/* Title */}
      <h1 className="overflow-wrap-anywhere font-headline text-3xl font-bold leading-tight md:text-4xl md:leading-tight lg:text-5xl lg:leading-tight">
        {article.title}
      </h1>

      {/* Excerpt */}
      <p className="overflow-wrap-anywhere mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
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
        <span>{article.readingTime} منٹ</span>
        {article.updatedAt && (
          <>
            <span className="text-muted-foreground/40">&middot;</span>
            <span className="text-muted-foreground/60">
              اپ ڈیٹ: {formatDate(article.updatedAt)}
            </span>
          </>
        )}
      </div>

      {/* Image */}
      <div className="relative mt-8 w-full h-[420px] overflow-hidden rounded">
        <SafeImage
          src={article.image}
          alt={article.imageAlt || article.title}
          categorySlug={article.categorySlug}
          slug={article.slug}
          priority
        />
      </div>
    </header>
  )
}
