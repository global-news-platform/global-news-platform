import { ArticleCard } from "@/components/article/article-card"
import { SectionTitle } from "@/components/common/section-title"
import type { ArticleLink } from "@/types"

interface TechnologySpotlightProps {
  articles: ArticleLink[]
}

export function TechnologySpotlight({ articles }: TechnologySpotlightProps) {
  if (articles.length === 0) return null

  return (
    <section className="border-t border-border py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 xl:px-8">
        <SectionTitle label="Technology" href="/category/technology" variant="featured" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {articles.slice(0, 4).map((article) => (
            <ArticleCard key={article.slug} article={article} variant="default" />
          ))}
        </div>
      </div>
    </section>
  )
}
