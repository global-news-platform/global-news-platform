import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Container } from "@/components/common/container"
import { SectionTitle } from "@/components/common/section-title"
import { ArticleCard } from "@/components/article/article-card"
import { InView } from "@/components/common/in-view"
import type { ArticleLink } from "@/types"

interface LatestNewsProps {
  articles: ArticleLink[]
}

export function LatestNews({ articles }: LatestNewsProps) {
  if (articles.length === 0) return null

  return (
    <section className="border-t border-border py-8 sm:py-10 md:py-14 content-visibility-auto" style={{ containIntrinsicSize: "800px" }}>
      <Container>
        <SectionTitle variant="editorial">Latest News</SectionTitle>
        <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {articles.map((article, index) => (
            <InView key={article.slug} delay={Math.min(index * 0.05, 0.3)}>
              <ArticleCard article={article} variant="default" />
            </InView>
          ))}
        </div>
        {articles.length >= 8 && (
          <div className="mt-8 text-center sm:mt-10">
            <Link
              href="/breaking"
              className="group inline-flex items-center justify-center gap-2 rounded-sm border border-border px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] transition-all hover:bg-secondary hover:text-foreground hover:shadow-card sm:px-7 sm:py-3"
            >
              View All News
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        )}
      </Container>
    </section>
  )
}
