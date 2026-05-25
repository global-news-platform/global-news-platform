import { ArticleCard } from "@/components/article/article-card"
import type { ArticleLink } from "@/types"

interface HeroSectionProps {
  featured: ArticleLink
  secondary: ArticleLink[]
}

export function HeroSection({ featured, secondary }: HeroSectionProps) {
  return (
    <section className="bg-background border-b border-border/10 shadow-sm">
      <div className="mx-auto w-full">
        <div className="flex flex-col lg:grid lg:grid-cols-4">
          <div className="lg:col-span-3 w-full">
            <ArticleCard article={featured} variant="hero" />
          </div>
          <div className="w-full bg-card">
            <div className="bg-destructive px-4 py-3 flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive-foreground/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive-foreground" />
              </span>
              <h3 className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.1em] text-destructive-foreground">
                اہم خبریں
              </h3>
            </div>
            <div className="px-3 divide-y divide-border/10">
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
