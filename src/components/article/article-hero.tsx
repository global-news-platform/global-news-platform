import Link from "next/link"
import { ExternalLink, Clock, Calendar } from "lucide-react"
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
      <nav className="mb-5 flex items-center gap-2.5 overflow-hidden text-[12px] text-muted-foreground">
        <Link href="/" className="shrink-0 transition-colors hover:text-foreground hover:underline decoration-accent/40 underline-offset-2">
          Home
        </Link>
        <span className="shrink-0 text-muted-foreground/30">/</span>
        <Link
          href={`/category/${article.categorySlug}`}
          className="shrink-0 transition-colors hover:text-foreground hover:underline decoration-accent/40 underline-offset-2"
        >
          {categoryName}
        </Link>
        <span className="shrink-0 text-muted-foreground/30">/</span>
        <span className="overflow-hidden overflow-ellipsis whitespace-nowrap text-foreground/50">
          {article.title}
        </span>
      </nav>

      {/* Category badge + metadata */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <Link
          href={`/category/${article.categorySlug}`}
          className="inline-block rounded-lg bg-gradient-to-r from-accent to-accent/90 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-foreground shadow-md shadow-accent/30 hover:shadow-accent/40 transition-all duration-300 hover:-translate-y-0.5"
        >
          {categoryName}
        </Link>
        {article.breaking && (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white shadow-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-live-pulse rounded-full bg-white" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            Breaking
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="overflow-wrap-anywhere font-headline text-3xl font-bold leading-[1.3] md:text-4xl lg:text-5xl tracking-tight">
        <MixedText text={article.title} />
      </h1>

      {/* Excerpt */}
      {article.excerpt && (
        <p className="overflow-wrap-anywhere mt-5 text-lg leading-relaxed text-muted-foreground/90 md:text-xl max-w-3xl">
          <MixedText text={article.excerpt} />
        </p>
      )}

      {/* Meta */}
      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <Link
          href={`/author/${article.authorSlug}`}
          className="group flex items-center gap-2 font-medium text-foreground transition-colors"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-[12px] font-bold text-accent group-hover:bg-accent/20 transition-colors">
            {article.author.charAt(0).toUpperCase()}
          </span>
          <span className="group-hover:text-accent transition-colors">{article.author}</span>
        </Link>
        <span className="text-muted-foreground/30">&middot;</span>
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <time dateTime={article.publishedAt}>
            {formatDate(article.publishedAt)}
          </time>
        </span>
        <span className="text-muted-foreground/30">&middot;</span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {article.readingTime} min read
        </span>
        {article.updatedAt && (
          <>
            <span className="text-muted-foreground/30">&middot;</span>
            <span className="text-muted-foreground/60 flex items-center gap-1.5">
              Updated: {formatDate(article.updatedAt)}
            </span>
          </>
        )}
      </div>

      {/* Source attribution */}
      {article.source && (
        <div className="mt-6 flex items-center gap-2 rounded-xl bg-muted/50 px-5 py-3.5 text-[12px] text-muted-foreground border border-border/30 hover:border-border/50 transition-colors">
          <span className="text-muted-foreground/60">{DISCLAIMER_TEXT}</span>
          <a
            href={article.source.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1 font-medium text-foreground underline decoration-accent/30 underline-offset-2 hover:decoration-accent/60 transition-colors shrink-0"
          >
            {article.source.name}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* Image */}
      {article.image && (
        <div className="relative mt-10 w-full h-[400px] md:h-[500px] lg:h-[580px] overflow-hidden rounded-2xl shadow-elevated">
          <SafeImage
            src={article.image}
            alt={article.imageAlt || article.title}
            categorySlug={article.categorySlug}
            slug={article.slug}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
        </div>
      )}
    </header>
  )
}
