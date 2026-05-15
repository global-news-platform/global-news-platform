import Link from "next/link"

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
    <section className="border-t border-border py-10 md:py-14 content-visibility-auto" style={{ containIntrinsicSize: "800px" }}>
      <Container>
        <SectionTitle variant="editorial">Latest News</SectionTitle>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {articles.map((article, index) => (
            <InView key={article.slug} delay={Math.min(index * 0.05, 0.3)}>
              <ArticleCard article={article} variant="default" />
            </InView>
          ))}
        </div>
        {articles.length >= 8 && (
          <div className="mt-10 text-center">
            <Link
              href="/breaking"
              className="inline-flex items-center justify-center rounded-none border border-border px-7 py-3 text-xs font-semibold uppercase tracking-[0.15em] transition-colors hover:bg-secondary hover:text-foreground"
            >
              View All News
            </Link>
          </div>
        )}
      </Container>
    </section>
  )
}
