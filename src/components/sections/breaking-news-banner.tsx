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
      <div className="relative overflow-hidden border-b border-news-red/20 bg-news-red/[0.03] dark:bg-news-red/[0.06]">
        <Container>
          <div className="flex items-center gap-2 py-2 sm:gap-3 sm:py-2.5 md:py-3">
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-news-red opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-news-red sm:h-2 sm:w-2" />
              </span>
              <span className="text-[10px] font-bold uppercase leading-none tracking-[0.2em] text-news-red sm:text-[11px]">
                Breaking
              </span>
            </div>
          </div>
        </Container>
      </div>
    )
  }

  if (dismissed) return null

  return (
    <div className="relative overflow-hidden border-b border-news-red/20 bg-gradient-to-r from-news-red/[0.03] via-news-red/[0.01] to-transparent dark:from-news-red/[0.06] dark:to-transparent">
      <Container>
        <div className="flex items-center gap-2 py-2 sm:gap-3 sm:py-2.5 md:py-3">
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-news-red opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-news-red sm:h-2 sm:w-2" />
            </span>
            <span className="text-[10px] font-bold uppercase leading-none tracking-[0.2em] text-news-red sm:text-[11px]">
              Breaking
            </span>
          </div>

          <div className="hidden h-4 w-px bg-news-red/20 sm:block" />

          <div className="flex-1 overflow-hidden">
            <div className="flex animate-marquee gap-8 whitespace-nowrap sm:gap-10">
              {[...articles, ...articles].map((article, index) => (
                <Link
                  key={`${article.slug}-${index}`}
                  href={`/article/${article.slug}`}
                  className="inline-flex items-center gap-1.5 sm:gap-2 text-xs font-medium text-foreground/80 transition-colors hover:text-news-red sm:text-sm"
                >
                  <span className="h-1 w-1 rounded-full bg-news-red/40 shrink-0" />
                  <span className="truncate max-w-[60vw] sm:max-w-none">{article.title}</span>
                </Link>
              ))}
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 rounded-full p-1.5 text-muted-foreground/30 transition-all hover:bg-news-red/10 hover:text-news-red min-w-[28px] min-h-[28px] flex items-center justify-center"
            aria-label="Dismiss breaking news"
          >
            <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </div>
      </Container>

      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-news-red/30 to-transparent" />
    </div>
  )
}
