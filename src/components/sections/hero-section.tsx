import Link from "next/link"
import { ArticleCard } from "@/components/article/article-card"
import { formatDateRelative } from "@/lib/utils"
import { categories } from "@/lib/constants"
import type { ArticleLink } from "@/types"

function hasRealImage(a: ArticleLink): boolean {
  return !!(a.image && typeof a.image === "string" && (a.image.startsWith("/images/articles/") || a.image.startsWith("http")))
}

interface HeroSectionProps {
  featured: ArticleLink
  secondary: ArticleLink[]
}

function TextOnlyHero({ featured }: { featured: ArticleLink }) {
  const catName = categories.find((c) => c.slug === featured.categorySlug)?.name || featured.category
  return (
    <div className="lg:col-span-4 flex items-center justify-center py-16 md:py-20 lg:py-24">
      <div className="w-full max-w-[800px] mx-auto text-center px-4">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
          {featured.breaking && (
            <span className="inline-flex items-center gap-1.5 rounded bg-destructive px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white shadow-lg">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              Breaking
            </span>
          )}
          <span className="rounded bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-primary">
            {catName}
          </span>
        </div>
        <Link href={`/article/${featured.slug}`} className="group">
          <h1 className="font-headline text-[2.5rem] md:text-[3rem] font-bold leading-[1.25] text-foreground group-hover:text-destructive transition-colors duration-200">
            {featured.title}
          </h1>
        </Link>
        {featured.excerpt && (
          <p className="mt-4 text-base md:text-lg leading-relaxed text-muted-foreground max-w-[640px] mx-auto">
            {featured.excerpt}
          </p>
        )}
        <div className="mt-5 flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <span suppressHydrationWarning>{formatDateRelative(featured.publishedAt)}</span>
          <span className="text-muted-foreground/30">|</span>
          <span>{featured.readingTime} min read</span>
          {featured.source && (
            <>
              <span className="text-muted-foreground/30">|</span>
              <span>{featured.source.name}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function HeroSection({ featured, secondary }: HeroSectionProps) {
  const hasImage = hasRealImage(featured)

  return (
    <section className="bg-background border-b border-border/10 shadow-sm">
      <div className="mx-auto w-full">
        <div className="flex flex-col lg:grid lg:grid-cols-4">
          {hasImage ? (
            <div className="lg:col-span-3 w-full">
              <ArticleCard article={featured} variant="hero" />
            </div>
          ) : (
            <TextOnlyHero featured={featured} />
          )}
          <div className="w-full bg-card flex flex-col">
            <div className="bg-destructive px-4 py-2.5 flex items-center gap-2.5 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive-foreground/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive-foreground" />
              </span>
              <h3 className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.1em] text-destructive-foreground">
                Top Stories
              </h3>
            </div>
            <div className="px-3 sm:px-4 divide-y divide-border/10 flex-1">
              {secondary.slice(0, 5).map((article) => (
                <ArticleCard key={article.slug} article={article} variant="horizontal" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
