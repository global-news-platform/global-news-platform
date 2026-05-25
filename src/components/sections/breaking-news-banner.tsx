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
    <div className="breaking-ticker border-b border-destructive/20">
      <div className="mx-auto flex max-w-full items-stretch">
        <div className="flex shrink-0 items-center gap-1.5 bg-destructive/30 px-3 md:px-4">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.12em]">LIVE</span>
        </div>
        <div className="flex-1 overflow-hidden py-2">
          <div className="flex animate-marquee-rtl gap-10 whitespace-nowrap" dir="rtl">
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
          aria-label="بند کریں"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
