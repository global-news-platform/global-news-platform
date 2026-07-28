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
        const count = section.articles.length

        return (
          <section key={section.slug} className={cn("w-full py-6 sm:py-8 md:py-10", idx % 2 === 1 && "section-alt")}>
            <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-5">
              <SectionTitle label={section.name} href={`/category/${section.slug}`} />

              {count === 1 ? (
                <div className="w-full max-w-3xl animate-fade-up [animation-delay:100ms] animate-fill-forwards">
                  <ArticleCard article={section.articles[0]} variant="featured" />
                </div>
              ) : count >= 2 && count <= 3 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 animate-fade-up [animation-delay:100ms] animate-fill-forwards">
                  {section.articles.slice(0, 4).map((article) => (
                    <ArticleCard key={article.slug} article={article} variant="default" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-8 items-stretch">
                    <div className="w-full animate-fade-up [animation-delay:100ms] animate-fill-forwards">
                      <ArticleCard article={section.articles[0]} variant="featured" />
                    </div>
                    <div className="w-full bg-card/80 backdrop-blur-sm border border-border/10 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col justify-between animate-fade-up [animation-delay:200ms] animate-fill-forwards hover:shadow-soft transition-all duration-300">
                      <div className="flex flex-col gap-1">
                        {listArticles.map((article) => (
                          <ArticleCard key={article.slug} article={article} variant="text-list" />
                        ))}
                      </div>
                    </div>
                  </div>

                  {count > 7 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 mt-4 sm:mt-6">
                      {section.articles.slice(7, 11).map((article, i) => (
                        <div key={article.slug} className="animate-fade-up animate-fill-forwards" style={{ animationDelay: `${300 + i * 100}ms`, opacity: 0 }}>
                          <ArticleCard article={article} variant="default" />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
