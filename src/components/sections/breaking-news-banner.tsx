"use client"

import { X } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

import { Container } from "@/components/common/container"
import type { ArticleLink } from "@/types"

interface BreakingNewsBannerProps {
  articles: ArticleLink[]
}

export function BreakingNewsBanner({ articles }: BreakingNewsBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (articles.length === 0) return null
  if (!mounted) {
    return (
      <div className="relative overflow-hidden border-b border-news-red/30 bg-news-red/[0.04] dark:bg-news-red/[0.08]">
        <Container>
          <div className="flex items-center gap-3 py-2.5 md:py-3">
            <div className="flex shrink-0 items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-news-red opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-news-red" />
              </span>
              <span className="text-[11px] font-bold uppercase leading-none tracking-[0.18em] text-news-red md:text-xs">
                Breaking News
              </span>
            </div>
          </div>
        </Container>
      </div>
    )
  }

  if (dismissed) return null

  return (
    <div className="relative overflow-hidden border-b border-news-red/30 bg-news-red/[0.04] dark:bg-news-red/[0.08]">
      <Container>
        <div className="flex items-center gap-3 py-2.5 md:py-3">
          <div className="flex shrink-0 items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-news-red opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-news-red" />
            </span>
            <span className="text-[11px] font-bold uppercase leading-none tracking-[0.18em] text-news-red md:text-xs">
              Breaking News
            </span>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="flex animate-marquee gap-12 whitespace-nowrap">
              {[...articles, ...articles].map((article, index) => (
                <Link
                  key={`${article.slug}-${index}`}
                  href={`/article/${article.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-foreground/85 transition-colors hover:text-news-red"
                >
                  <span className="hidden h-1 w-1 rounded-full bg-news-red/50 md:inline-block" />
                  {article.title}
                </Link>
              ))}
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 rounded-full p-1.5 text-muted-foreground/40 transition-colors hover:bg-news-red/10 hover:text-news-red"
            aria-label="Dismiss breaking news"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </Container>

      <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-news-red/40 to-transparent" />
    </div>
  )
}
