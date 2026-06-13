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
    <div className="lg:col-span-2 flex items-center justify-center py-16 md:py-20 lg:py-24">
      <div className="w-full max-w-[800px] mx-auto text-center px-4">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
          {featured.breaking && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white shadow-lg shadow-destructive/40">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              Breaking
            </span>
          )}
          <span className="rounded-lg bg-accent/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-accent">
            {catName}
          </span>
        </div>
        <Link href={`/article/${featured.slug}`} className="group">
          <h1 className="font-headline text-[2.5rem] md:text-[3rem] font-bold leading-[1.15] tracking-tight text-foreground group-hover:text-accent transition-colors duration-200">
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
    <section className="bg-background border-b border-border/10 relative animate-fade-in section-gradient">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent pointer-events-none" />
      <div className="mx-auto w-full">
        <div className="flex flex-col lg:grid lg:grid-cols-3">
          {hasImage ? (
            <div className="lg:col-span-2 w-full">
              <ArticleCard article={featured} variant="hero" />
            </div>
          ) : (
            <TextOnlyHero featured={featured} />
          )}
          <div className="w-full bg-card flex flex-col relative animate-fade-up [animation-delay:150ms] animate-fill-forwards" style={{ opacity: 0 }}>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-accent/30 to-transparent lg:hidden pointer-events-none" />
            <div className="bg-gradient-to-r from-primary via-primary/95 to-primary/90 px-4 py-2.5 flex items-center gap-2.5 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <h3 className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.1em] text-primary-foreground">
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
