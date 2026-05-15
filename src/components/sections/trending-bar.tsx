"use client"

import Link from "next/link"
import { TrendingUp, ArrowRight } from "lucide-react"
import { useRef } from "react"

import { Container } from "@/components/common/container"
import type { ArticleLink } from "@/types"

interface TrendingBarProps {
  articles: ArticleLink[]
}

export function TrendingBar({ articles }: TrendingBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (articles.length === 0) return null

  return (
    <section className="border-b border-border bg-secondary/30">
      <Container>
        <div className="flex items-stretch">
          <div className="flex shrink-0 items-center gap-2.5 border-r border-border pr-5 py-3">
            <TrendingUp className="h-4 w-4 text-news-red" />
            <span className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.15em]">
              Trending
            </span>
          </div>
          <div
            ref={scrollRef}
            className="flex items-center gap-0 overflow-x-auto scrollbar-hide"
          >
            {articles.map((article, index) => (
              <Link
                key={article.slug}
                href={`/article/${article.slug}`}
                className="group flex shrink-0 items-center gap-2.5 border-r border-border px-4 py-3 transition-colors last:border-r-0 hover:bg-secondary/60"
              >
                <span className="font-headline text-lg font-black leading-none tabular-nums text-news-red/30">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="whitespace-nowrap text-xs font-medium transition-colors group-hover:text-news-red">
                  {article.title}
                </span>
              </Link>
            ))}
          </div>
          <Link
            href="/breaking"
            className="group ml-auto flex shrink-0 items-center gap-1 border-l border-border px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground"
          >
            More
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Container>
    </section>
  )
}
