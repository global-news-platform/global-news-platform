"use client"

import Link from "next/link"
import { useState } from "react"
import type { ArticleLink } from "@/types"

interface BreakingNewsBannerProps {
  articles: ArticleLink[]
}

export function BreakingNewsBanner({ articles }: BreakingNewsBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed || articles.length === 0) return null

  return (
    <div className="bg-destructive border-b border-destructive/20 shadow-sm">
      <div className="mx-auto flex max-w-full items-stretch">
        <div className="flex shrink-0 items-center gap-1.5 bg-black/20 px-4 md:px-5 pr-3 md:pr-[0.75rem]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.12em] text-white/90">LIVE</span>
        </div>
        <div className="flex-1 overflow-hidden py-2.5">
          <div className="flex animate-marquee gap-12 whitespace-nowrap">
            {[...articles, ...articles].map((article, i) => (
              <Link
                key={`${article.slug}-${i}`}
                href={`/article/${article.slug}`}
                className="text-[12px] md:text-[13px] font-medium text-white/90 hover:text-white transition-colors"
              >
                {article.title}
              </Link>
            ))}
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 px-3 text-white/40 hover:text-white transition-colors text-[18px] leading-none"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
