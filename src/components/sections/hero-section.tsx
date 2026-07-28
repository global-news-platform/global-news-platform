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
    <div className="lg:col-span-2 flex items-center justify-center py-20 md:py-24 lg:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.03] via-transparent to-primary/[0.03] pointer-events-none" />
      <div className="w-full max-w-[800px] mx-auto text-center px-4 relative z-10">
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
          {featured.breaking && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white shadow-lg shadow-destructive/30">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-live-pulse rounded-full bg-white/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              Breaking
            </span>
          )}
          <span className="rounded-lg bg-accent/15 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-accent shadow-sm">
            {catName}
          </span>
        </div>
        <Link href={`/article/${featured.slug}`} className="group inline-block">
          <h1 className="font-headline text-[2.5rem] md:text-[3.25rem] lg:text-[3.75rem] font-bold leading-[1.1] tracking-tight text-foreground transition-all duration-500 ease-out-expo group-hover:text-accent">
            {featured.title}
          </h1>
        </Link>
        {featured.excerpt && (
          <p className="mt-5 text-base md:text-lg leading-relaxed text-muted-foreground max-w-[640px] mx-auto">
            {featured.excerpt}
          </p>
        )}
        <div className="mt-6 flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground/80">{featured.author}</span>
          <span className="text-muted-foreground/30">&middot;</span>
          <span suppressHydrationWarning>{formatDateRelative(featured.publishedAt)}</span>
          <span className="text-muted-foreground/30">&middot;</span>
          <span>{featured.readingTime} min read</span>
          {featured.source && (
            <>
              <span className="text-muted-foreground/30">&middot;</span>
              <span className="text-accent/80">{featured.source.name}</span>
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
    <section className="bg-background border-b border-border/10 relative animate-fade-in section-gradient overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-accent/[0.02] to-transparent pointer-events-none" />
      <div className="mx-auto w-full">
        <div className="flex flex-col lg:grid lg:grid-cols-3">
          {hasImage ? (
            <div className="lg:col-span-2 w-full">
              <ArticleCard article={featured} variant="hero" />
            </div>
          ) : (
            <TextOnlyHero featured={featured} />
          )}
          <div className="w-full bg-card/80 backdrop-blur-sm flex flex-col relative animate-fade-up [animation-delay:150ms] animate-fill-forwards border-l border-border/5" style={{ opacity: 0 }}>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-accent/40 to-transparent lg:hidden pointer-events-none" />
            <div className="bg-gradient-to-r from-primary via-primary/95 to-primary/90 px-4 py-3 flex items-center gap-2.5 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-live-pulse rounded-full bg-accent/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <h3 className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.1em] text-primary-foreground">
                Top Stories
              </h3>
              <span className="text-primary-foreground/30 text-[10px] font-medium ms-auto">
                Latest
              </span>
            </div>
            <div className="divide-y divide-border/10 flex-1 overflow-y-auto p-2">
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
