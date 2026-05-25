import { ArticleCard } from "@/components/article/article-card"
import type { ArticleLink } from "@/types"

interface HeroSectionProps {
  featured: ArticleLink
  secondary: ArticleLink[]
}

export function HeroSection({ featured, secondary }: HeroSectionProps) {
  return (
    <section className="border-b border-border/20">
      <div className="mx-auto max-w-full px-0 md:px-3 lg:px-4">
        <div className="grid md:grid-cols-4">
          <div className="md:col-span-3">
            <ArticleCard article={featured} variant="hero" />
          </div>
          <div className="border-r border-border/20 bg-card">
            <div className="bg-destructive px-3 py-2">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-destructive-foreground">
                اہم خبریں
              </h3>
            </div>
            <div className="px-3 divide-y divide-border/20">
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
