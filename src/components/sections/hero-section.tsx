import { ArticleCard } from "@/components/article/article-card"
import type { ArticleLink } from "@/types"

interface HeroSectionProps {
  featured: ArticleLink
  secondary: ArticleLink[]
}

export function HeroSection({ featured, secondary }: HeroSectionProps) {
  return (
    <section className="py-4 md:py-6 lg:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 xl:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ArticleCard article={featured} variant="hero" />
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-border/50 bg-card/50 p-4 md:p-5">
            <div className="section-label pb-1">Top Stories</div>
            {secondary.slice(0, 4).map((article, i) => (
              <div key={article.slug}>
                <ArticleCard article={article} variant="horizontal" />
                {i < secondary.slice(0, 4).length - 1 && <div className="border-t border-border/40" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
