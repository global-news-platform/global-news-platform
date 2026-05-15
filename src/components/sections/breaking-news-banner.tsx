"use client"

import Link from "next/link"
import { useState } from "react"
import { X } from "lucide-react"
import type { ArticleLink } from "@/types"

interface BreakingNewsBannerProps {
  articles: ArticleLink[]
}

export function BreakingNewsBanner({ articles }: BreakingNewsBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || articles.length === 0) return null

  return (
    <div className="relative bg-foreground text-background">
      <div className="mx-auto flex max-w-7xl items-center px-4 py-2.5 sm:px-5 lg:px-6 xl:px-8">
        <div className="mr-4 flex shrink-0 items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.15em]">
            Breaking
          </span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex animate-marquee gap-12 whitespace-nowrap">
            {[...articles, ...articles].map((article, i) => (
              <Link
                key={`${article.slug}-${i}`}
                href={`/article/${article.slug}`}
                className="text-[13px] font-medium text-background/90 transition-opacity hover:opacity-70"
              >
                {article.title}
              </Link>
            ))}
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="ml-4 shrink-0 rounded p-0.5 text-background/60 transition-colors hover:text-background"
          aria-label="Dismiss breaking news"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
