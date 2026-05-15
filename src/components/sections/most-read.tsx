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
    <section className="border-t border-border py-8 md:py-10 content-visibility-auto" style={{ containIntrinsicSize: "400px" }}>
      <Container>
        <SectionTitle variant="featured">Most Read</SectionTitle>
        <div className="grid gap-0 divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0 lg:grid-cols-4">
          {articles.map((article, index) => (
            <Link
              key={article.slug}
              href={`/article/${article.slug}`}
              className="group flex items-start gap-4 px-0 py-5 transition-colors hover:bg-secondary/50 md:px-5 md:first:pl-0 md:last:pr-0"
            >
              <span className="font-headline text-4xl font-black leading-none tabular-nums text-muted-foreground/15">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-news-red">
                  {article.category}
                </span>
                <h3 className="font-headline text-sm font-bold leading-snug group-hover:underline md:text-base">
                  {article.title}
                </h3>
                <span className="mt-1.5 block text-xs text-muted-foreground">
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
