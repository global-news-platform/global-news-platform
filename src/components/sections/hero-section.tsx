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
          <div className="flex flex-col border border-border bg-card p-4 md:p-5">
            <h3 className="mb-3 text-[13px] font-bold uppercase tracking-[0.12em] text-primary">
              اہم خبریں
            </h3>
            <div className="divide-y divide-border/60">
              {secondary.slice(0, 4).map((article) => (
                <div key={article.slug}>
                  <ArticleCard article={article} variant="horizontal" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
