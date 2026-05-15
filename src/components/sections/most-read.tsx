import Link from "next/link"

import { Container } from "@/components/common/container"
import { SectionTitle } from "@/components/common/section-title"
import type { ArticleLink } from "@/types"
import { formatDateRelative } from "@/lib/utils"

interface MostReadProps {
  articles: ArticleLink[]
}

export function MostRead({ articles }: MostReadProps) {
  if (articles.length === 0) return null

  return (
    <section className="py-8 sm:py-10 md:py-14">
      <Container>
        <SectionTitle variant="featured">Most Read</SectionTitle>
        <div className="grid gap-0 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {articles.map((article, index) => (
            <Link
              key={article.slug}
              href={`/article/${article.slug}`}
              className="group relative flex items-start gap-3 px-0 py-4 transition-all hover:bg-secondary/30 sm:gap-4 sm:py-5 sm:px-5 md:px-6 sm:first:pl-0 sm:last:pr-0 sm:hover:-translate-y-0.5"
            >
              <span className="font-headline text-3xl font-black leading-none tabular-nums text-foreground/[0.06] sm:text-4xl md:text-5xl lg:text-6xl transition-colors group-hover:text-news-red/[0.1]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 pt-0.5 sm:pt-1">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-news-red sm:mb-1.5">
                  {article.category}
                </span>
                <h3 className="font-headline text-sm font-bold leading-snug sm:text-base/relaxed transition-colors group-hover:text-news-red">
                  {article.title}
                </h3>
                <span className="mt-1.5 block text-[11px] text-muted-foreground sm:mt-2 sm:text-xs">
                  {formatDateRelative(article.publishedAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}
