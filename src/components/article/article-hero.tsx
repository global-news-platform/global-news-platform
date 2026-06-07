import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { SafeImage } from "@/components/ui/safe-image"
import { MixedText } from "@/components/ui/mixed-text"
import { formatDate } from "@/lib/utils"
import { categories, DISCLAIMER_TEXT } from "@/lib/constants"
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
          Home
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
      <h1 dir="rtl" className="overflow-wrap-anywhere font-headline text-3xl font-bold leading-[1.7] md:text-4xl lg:text-5xl">
        <MixedText text={article.title} />
      </h1>

      {/* Excerpt */}
      <p className="overflow-wrap-anywhere mt-4 text-base leading-[2] text-muted-foreground md:text-lg">
        <MixedText text={article.excerpt || ""} />
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
        <span>{article.readingTime} min</span>
        {article.updatedAt && (
          <>
            <span className="text-muted-foreground/40">&middot;</span>
            <span className="text-muted-foreground/60">
              Updated: {formatDate(article.updatedAt)}
            </span>
          </>
        )}
      </div>

      {/* Source attribution */}
      {article.source && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-3 text-[12px] text-muted-foreground border border-border/30">
          <span>{DISCLAIMER_TEXT}</span>
          <a
            href={article.source.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1 font-medium text-foreground underline decoration-foreground/30 underline-offset-2 hover:decoration-foreground/60 transition-colors"
          >
            {article.source.name}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* Image */}
      {article.image && (
        <div className="relative mt-8 w-full h-[420px] md:h-[500px] lg:h-[560px] overflow-hidden rounded-xl shadow-lg">
          <SafeImage
            src={article.image}
            alt={article.imageAlt || article.title}
            categorySlug={article.categorySlug}
            slug={article.slug}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
        </div>
      )}
    </header>
  )
}
