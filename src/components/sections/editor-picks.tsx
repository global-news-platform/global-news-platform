import { ArticleCard } from "@/components/article/article-card"
import { SectionTitle } from "@/components/common/section-title"
import type { ArticleLink } from "@/types"

interface EditorPicksProps {
  articles: ArticleLink[]
}

export function EditorPicks({ articles }: EditorPicksProps) {
  if (articles.length === 0) return null

  return (
    <section className="border-t border-border bg-secondary/20 py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 xl:px-8">
        <SectionTitle label="Editor&apos;s Picks" variant="editorial" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.slice(0, 3).map((article) => (
            <ArticleCard key={article.slug} article={article} variant="default" />
          ))}
        </div>
      </div>
    </section>
  )
}
