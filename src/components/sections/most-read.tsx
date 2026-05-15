import { ArticleCard } from "@/components/article/article-card"
import { SectionTitle } from "@/components/common/section-title"
import type { ArticleLink } from "@/types"

interface MostReadProps {
  articles: ArticleLink[]
}

export function MostRead({ articles }: MostReadProps) {
  if (articles.length === 0) return null

  return (
    <section className="border-y border-border bg-secondary/20 py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 xl:px-8">
        <SectionTitle label="Most Read" variant="editorial" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {articles.slice(0, 4).map((article, i) => (
            <ArticleCard
              key={article.slug}
              article={article}
              variant="numbered"
              index={i + 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
