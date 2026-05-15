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
    <section className="border-b border-border bg-secondary/40">
      <Container>
        <div className="flex items-stretch">
          <div className="flex shrink-0 items-center gap-2 border-r border-border pr-3 py-2.5 sm:gap-2.5 sm:pr-5 sm:py-3">
            <TrendingUp className="h-3.5 w-3.5 text-news-red sm:h-4 sm:w-4" />
            <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.18em] sm:text-[11px]">
              Trending
            </span>
          </div>
          <div
            ref={scrollRef}
            className="flex items-center gap-0 overflow-x-auto scrollbar-hide scrollbar-thin"
          >
            {articles.map((article, index) => (
              <Link
                key={article.slug}
                href={`/article/${article.slug}`}
                className="group flex shrink-0 items-center gap-2 border-r border-border px-3 py-2.5 transition-colors last:border-r-0 hover:bg-secondary/60 sm:gap-3 sm:px-4 sm:py-3"
              >
                <span className="font-headline text-base font-black leading-none tabular-nums text-news-red/25 group-hover:text-news-red/40 transition-colors sm:text-lg">
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
            className="group ml-auto flex shrink-0 items-center gap-1 border-l border-border px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground sm:gap-1.5 sm:px-4 sm:py-3 sm:text-[11px]"
          >
            More
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Container>
    </section>
  )
}
