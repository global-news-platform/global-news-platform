import { ArticleCard } from "@/components/article/article-card"
import { SectionTitle } from "@/components/common/section-title"
import type { ArticleLink } from "@/types"

interface BusinessMarketsProps {
  articles: ArticleLink[]
}

export function BusinessMarkets({ articles }: BusinessMarketsProps) {
  if (articles.length === 0) return null

  return (
    <section className="border-t border-border bg-secondary/20 py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 xl:px-8">
        <SectionTitle label="Business & Markets" href="/category/business" variant="featured" />
        <div className="grid gap-6 sm:grid-cols-2">
          {articles.slice(0, 2).map((article) => (
            <ArticleCard key={article.slug} article={article} variant="featured" />
          ))}
        </div>
      </div>
    </section>
  )
}
