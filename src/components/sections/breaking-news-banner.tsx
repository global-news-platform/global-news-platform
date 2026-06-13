"use client"

import Link from "next/link"
import { useState, useRef, useEffect, useCallback } from "react"
import type { ArticleLink } from "@/types"

const SPEED = 60

interface BreakingNewsBannerProps {
  articles: ArticleLink[]
}

export function BreakingNewsBanner({ articles }: BreakingNewsBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const [paused, setPaused] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number | null>(null)
  const posRef = useRef(0)
  const lastTimeRef = useRef(0)
  const pausedRef = useRef(false)

  pausedRef.current = paused

  useEffect(() => {
    const track = trackRef.current
    if (!track || articles.length === 0) return

    lastTimeRef.current = performance.now()

    const step = (now: number) => {
      if (pausedRef.current) {
        lastTimeRef.current = now
        animRef.current = requestAnimationFrame(step)
        return
      }

      const dt = Math.min(now - lastTimeRef.current, 50)
      lastTimeRef.current = now

      posRef.current -= SPEED * (dt / 1000)
      const half = track.scrollWidth / 2
      if (Math.abs(posRef.current) >= half) {
        posRef.current += half
      }
      track.style.transform = `translateX(${posRef.current}px)`
      animRef.current = requestAnimationFrame(step)
    }

    animRef.current = requestAnimationFrame(step)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [articles.length])

  if (dismissed || articles.length === 0) return null

  return (
    <div className="bg-gradient-to-r from-destructive via-destructive/95 to-destructive border-b border-destructive/30 shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.03)_50%,transparent_75%)] pointer-events-none" />
      <div
        className="mx-auto flex max-w-full items-stretch"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="flex shrink-0 items-center gap-1.5 bg-black/20 px-4 md:px-5 pr-3 md:pr-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-live-pulse rounded-full bg-white" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.12em] text-white/90">LIVE</span>
        </div>
        <div className="flex-1 min-w-0 overflow-hidden py-2.5 relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-destructive to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-destructive to-transparent z-10" />
          <div
            ref={trackRef}
            className="inline-flex whitespace-nowrap will-change-transform"
            style={{ transform: "translateX(0)" }}
          >
            {[...articles, ...articles].map((article, i) => (
              <span key={`${article.slug}-${i}`} className="inline-flex items-center shrink-0">
                <Link
                  href={`/article/${article.slug}`}
                  className="text-[12px] md:text-[13px] font-semibold text-white/90 hover:text-white transition-colors shrink-0"
                >
                  {article.title}
                </Link>
                <span className="mx-5 inline-flex items-center gap-1 text-white/25 shrink-0">
                  <span className="h-1 w-1 rounded-full bg-white/40" />
                  <span className="h-1 w-1 rounded-full bg-white/40" />
                  <span className="h-1 w-1 rounded-full bg-white/40" />
                </span>
              </span>
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
