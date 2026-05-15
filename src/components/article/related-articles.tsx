import { ArticleCard } from "@/components/article/article-card"
import { SectionTitle } from "@/components/common/section-title"
import type { ArticleLink } from "@/types"

interface RelatedArticlesProps {
  articles: ArticleLink[]
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null

  return (
    <section className="border-t border-border pt-8">
      <SectionTitle label="Related Stories" variant="editorial" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.slice(0, 3).map((article) => (
          <ArticleCard key={article.slug} article={article} variant="default" />
        ))}
      </div>
    </section>
  )
}
