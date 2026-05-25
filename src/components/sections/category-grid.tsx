import Link from "next/link"
import { ArticleCard } from "@/components/article/article-card"
import type { ArticleLink } from "@/types"

interface CatSection {
  slug: string
  name: string
  articles: ArticleLink[]
}

interface CategoryGridProps {
  categories: CatSection[]
}

export function CategoryGrid({ categories: sections }: CategoryGridProps) {
  if (sections.length === 0) return null

  return (
    <div className="w-full">
      {sections.map((section) => {
        if (section.articles.length === 0) return null
        const listArticles = section.articles.slice(1, 7)

        return (
          <section key={section.slug} className="w-full py-4 sm:py-5 md:py-6">
            <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-5">
              <div className="cat-bar mb-3 sm:mb-4">
                <Link href={`/category/${section.slug}`} className="cat-bar-title">
                  {section.name}
                </Link>
                <Link href={`/category/${section.slug}`} className="cat-bar-link">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  مزید
                </Link>
              </div>

              <div className="flex flex-col md:grid md:grid-cols-4 gap-3 sm:gap-4">
                <div className="w-full md:col-span-2">
                  <ArticleCard article={section.articles[0]} variant="featured" />
                </div>
                <div className="w-full md:col-span-2 bg-card border border-border/10 rounded-lg p-3 sm:p-4 shadow-sm">
                  <div className="divide-y divide-border/10">
                    {listArticles.map((article) => (
                      <ArticleCard key={article.slug} article={article} variant="text-list" />
                    ))}
                  </div>
                </div>
              </div>

              {section.articles.length > 7 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-3 sm:mt-4">
                  {section.articles.slice(7, 11).map((article) => (
                    <ArticleCard key={article.slug} article={article} variant="compact" />
                  ))}
                </div>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
