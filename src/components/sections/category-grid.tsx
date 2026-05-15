import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { Container } from "@/components/common/container"
import { SectionTitle } from "@/components/common/section-title"
import { ArticleCard } from "@/components/article/article-card"
import type { ArticleLink } from "@/types"

interface CategoryGridProps {
  categories: {
    slug: string
    name: string
    articles: ArticleLink[]
  }[]
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="border-t border-border bg-secondary/20 py-8 sm:py-10 md:py-14">
      <Container>
        <div className="grid gap-8 sm:gap-10 lg:gap-12 lg:grid-cols-2">
          {categories.map(
            (category) =>
              category.articles.length > 0 && (
                <div key={category.slug}>
                  <SectionTitle
                    variant="editorial"
                    href={`/category/${category.slug}`}
                  >
                    {category.name}
                  </SectionTitle>

                  <div className="mb-4 sm:mb-5">
                    <ArticleCard
                      article={category.articles[0]}
                      variant="horizontal"
                    />
                  </div>

                  <ul className="space-y-0 divide-y divide-border">
                    {category.articles.slice(1, 4).map((article) => (
                      <li key={article.slug}>
                        <Link
                          href={`/article/${article.slug}`}
                          className="group flex items-start gap-3 py-3 transition-colors hover:bg-secondary/40 -mx-2 px-2 rounded-sm sm:-mx-3 sm:px-3 sm:py-3.5"
                        >
                          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/15 transition-colors group-hover:bg-news-red" />
                          <span className="font-headline text-sm font-semibold leading-snug transition-colors group-hover:text-news-red md:text-base">
                            {article.title}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  {category.articles.length > 4 && (
                    <Link
                      href={`/category/${category.slug}`}
                      className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground sm:mt-4"
                    >
                      View all {category.name} news
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              ),
          )}
        </div>
      </Container>
    </section>
  )
}
