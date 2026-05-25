import { ArticleCard } from "@/components/article/article-card"
import type { ArticleLink } from "@/types"

interface LatestNewsProps {
  articles: ArticleLink[]
}

export function LatestNews({ articles }: LatestNewsProps) {
  if (articles.length === 0) return null

  return (
    <section className="py-5 md:py-6">
      <div className="mx-auto max-w-full px-3 md:px-4 lg:px-5">
        <div className="cat-bar mb-4">
          <span className="cat-bar-title">تازہ ترین خبریں</span>
          <svg className="h-3 w-3 text-destructive-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {articles.slice(0, 8).map((article) => (
            <ArticleCard key={article.slug} article={article} variant="compact" />
          ))}
        </div>
      </div>
    </section>
  )
}
