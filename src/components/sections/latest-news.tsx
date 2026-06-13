import { ArticleCard } from "@/components/article/article-card"
import { SectionTitle } from "@/components/common/section-title"
import { InView } from "@/components/common/in-view"
import type { ArticleLink } from "@/types"

interface LatestNewsProps {
  articles: ArticleLink[]
}

export function LatestNews({ articles }: LatestNewsProps) {
  if (articles.length === 0) return null

  return (
    <section className="py-6 md:py-8">
      <div className="mx-auto max-w-full px-3 md:px-4 lg:px-5">
        <SectionTitle label="Latest News" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {articles.slice(0, 8).map((article, i) => (
            <InView key={article.slug} delay={i * 0.05}>
              <ArticleCard article={article} variant="compact" />
            </InView>
          ))}
        </div>
      </div>
    </section>
  )
}
