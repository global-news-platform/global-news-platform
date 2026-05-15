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
    <section className="py-8 md:py-10 content-visibility-auto" style={{ containIntrinsicSize: "600px" }}>
      <Container>
        <div className="grid gap-10 lg:grid-cols-2">
          {categories.map(
            (category) =>
              category.articles.length > 0 && (
                <div key={category.slug}>
                  <SectionTitle
                    variant="category"
                    href={`/category/${category.slug}`}
                  >
                    {category.name}
                  </SectionTitle>

                  {/* Featured article in this category */}
                  <ArticleCard
                    article={category.articles[0]}
                    variant="horizontal"
                    className="mb-4"
                  />

                  {/* Bullet list of remaining articles */}
                  <ul className="space-y-0 divide-y divide-border">
                    {category.articles.slice(1, 4).map((article) => (
                      <li key={article.slug}>
                        <Link
                          href={`/article/${article.slug}`}
                          className="group flex items-start gap-3 py-3"
                        >
                          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/30 transition-colors group-hover:bg-news-red" />
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
                      className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
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
