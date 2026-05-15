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
    <section className="py-10 md:py-14">
      <Container>
        <SectionTitle variant="featured">Most Read</SectionTitle>
        <div className="grid gap-0 divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0 lg:grid-cols-4">
          {articles.map((article, index) => (
            <Link
              key={article.slug}
              href={`/article/${article.slug}`}
              className="group relative flex items-start gap-4 px-0 py-5 transition-all hover:bg-secondary/40 md:px-6 md:first:pl-0 md:last:pr-0 md:hover:-translate-y-0.5"
            >
              <span className="font-headline text-4xl font-black leading-none tabular-nums text-foreground/[0.08] md:text-5xl">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 pt-1">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-news-red">
                  {article.category}
                </span>
                <h3 className="font-headline text-sm font-bold leading-snug group-hover:underline md:text-base/relaxed">
                  {article.title}
                </h3>
                <span className="mt-2 block text-xs text-muted-foreground">
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
