import Link from "next/link"
import { ArticleCard } from "@/components/article/article-card"
import { SectionTitle } from "@/components/common/section-title"
import type { ArticleLink } from "@/types"

interface CategorySection {
  slug: string
  name: string
  articles: ArticleLink[]
}

interface CategoryGridProps {
  categories: CategorySection[]
}

export function CategoryGrid({ categories: sections }: CategoryGridProps) {
  if (sections.length === 0) return null

  return (
    <>
      {sections.map((section) => {
        return (
          <section
            key={section.slug}
            className="border-t border-border py-8 md:py-12"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 xl:px-8">
              <SectionTitle
                label={section.name}
                href={`/category/${section.slug}`}
                variant="featured"
              />
              <div className="grid gap-5 md:grid-cols-2">
                {section.articles[0] && (
                  <ArticleCard
                    article={section.articles[0]}
                    variant="large"
                  />
                )}
                {section.articles.length > 1 && (
                  <div className="flex flex-col rounded-xl border border-border/50 bg-card/50 p-4 md:p-5">
                    {section.articles.slice(1, 4).map((article) => (
                      <div key={article.slug}>
                        <ArticleCard article={article} variant="horizontal" />
                      </div>
                    ))}
                    {section.articles.length > 4 && (
                      <Link
                        href={`/category/${section.slug}`}
                        className="mt-auto pt-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        More {section.name} news &rarr;
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}
