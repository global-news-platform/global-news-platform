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
    <section className="border-b border-border py-6 md:py-8">
      <Container>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main featured story — 2/3 width */}
          <div className="lg:col-span-2">
            <ArticleCard article={featured} variant="hero" />
          </div>

          {/* Secondary stories sidebar — 1/3 width */}
          <aside className="flex flex-col divide-y divide-border">
            <div className="pb-1">
              <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                More Top Stories
              </h2>
            </div>
            {secondary.slice(0, 3).map((article, index) => (
              <ArticleCard
                key={article.slug}
                article={article}
                variant={index === 2 ? "sidebar" : "compact"}
                className={index === 2 ? "pt-3" : ""}
              />
            ))}
            <div className="pt-2">
              <Link
                href="/breaking"
                className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-news-red transition-colors hover:text-news-red/80"
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
