import { cn } from "@/lib/utils"
import { ArticleCard } from "@/components/article/article-card"
import { SectionTitle } from "@/components/common/section-title"
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
      {sections.map((section, idx) => {
        if (section.articles.length === 0) return null
        const listArticles = section.articles.slice(1, 7)

        return (
          <section key={section.slug} className={cn("w-full py-5 sm:py-6 md:py-8", idx % 2 === 1 && "section-alt")}>
            <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-5">
              <SectionTitle label={section.name} href={`/category/${section.slug}`} />

              <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-8 items-stretch">
                <div className="w-full">
                  <ArticleCard article={section.articles[0]} variant="featured" />
                </div>
                <div className="w-full bg-card border border-border/10 rounded-lg p-3 sm:p-4 shadow-sm flex flex-col justify-between">
                  <div className="flex flex-col">
                    {listArticles.map((article) => (
                      <ArticleCard key={article.slug} article={article} variant="text-list" />
                    ))}
                  </div>
                </div>
              </div>

              {section.articles.length > 7 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-3 sm:mt-4">
                  {section.articles.slice(7, 11).map((article) => (
                    <ArticleCard key={article.slug} article={article} variant="default" />
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
