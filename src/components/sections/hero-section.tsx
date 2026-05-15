import { ArticleCard } from "@/components/article/article-card"
import type { ArticleLink } from "@/types"

interface HeroSectionProps {
  featured: ArticleLink
  secondary: ArticleLink[]
}

export function HeroSection({ featured, secondary }: HeroSectionProps) {
  return (
    <section className="py-6 md:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 xl:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main hero */}
          <div className="lg:col-span-2">
            <ArticleCard article={featured} variant="hero" />
          </div>

          {/* Secondary */}
          <div className="flex flex-col gap-5 border-t border-border pt-5 lg:border-none lg:pt-0">
            {secondary.slice(0, 3).map((article, i) => (
              <div key={article.slug}>
                <ArticleCard article={article} variant="horizontal" />
                {i < 2 && (
                  <div className="mt-5 border-b border-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
