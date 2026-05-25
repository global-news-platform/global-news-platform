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
    <>
      {sections.map((section) => {
        if (section.articles.length === 0) return null
        const listArticles = section.articles.slice(1, 7)

        return (
          <section key={section.slug} className="border-b border-border/20 py-4 md:py-5">
            <div className="mx-auto max-w-full px-3 md:px-4 lg:px-5">
              <div className="cat-bar mb-3">
                <Link href={`/category/${section.slug}`} className="cat-bar-title">
                  {section.name}
                </Link>
                <Link href={`/category/${section.slug}`} className="cat-bar-link">
                  مزید
                  <svg className="h-3 w-3 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="md:col-span-2">
                  <ArticleCard article={section.articles[0]} variant="featured" />
                </div>
                <div className="md:col-span-2 border border-border/20 bg-card p-3">
                  <div className="divide-y divide-border/20">
                    {listArticles.map((article) => (
                      <ArticleCard key={article.slug} article={article} variant="text-list" />
                    ))}
                  </div>
                </div>
              </div>

              {section.articles.length > 7 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  {section.articles.slice(7, 11).map((article) => (
                    <ArticleCard key={article.slug} article={article} variant="compact" />
                  ))}
                </div>
              )}
            </div>
          </section>
        )
      })}
    </>
  )
}
