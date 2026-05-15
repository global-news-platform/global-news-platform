import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { Container } from "@/components/common/container"
import { ArticleCard } from "@/components/article/article-card"
import type { ArticleLink } from "@/types"

interface HeroSectionProps {
  featured: ArticleLink
  secondary: ArticleLink[]
}

export function HeroSection({ featured, secondary }: HeroSectionProps) {
  return (
    <section className="border-b border-border py-6 md:py-10">
      <Container>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ArticleCard article={featured} variant="hero" />
          </div>

          <aside className="flex flex-col">
            <div className="border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-0.5 bg-news-red" />
                <h2 className="section-label">
                  More Top Stories
                </h2>
              </div>
            </div>
            <div className="flex-1 divide-y divide-border">
              {secondary.slice(0, 3).map((article, index) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  variant={index === 2 ? "sidebar" : "compact"}
                  className={index === 2 ? "pt-3.5" : ""}
                />
              ))}
            </div>
            <div className="border-t border-border pt-3">
              <Link
                href="/breaking"
                className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-news-red transition-colors hover:text-news-red/80"
              >
                View all top stories
                <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  )
}
