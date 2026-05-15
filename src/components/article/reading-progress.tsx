"use client"

import { Container } from "@/components/common/container"

interface ReadingProgressProps {
  progress: number
}

export function ReadingProgress({ progress }: ReadingProgressProps) {
  return (
    <div className="fixed left-0 top-0 z-50 h-0.5 w-full bg-muted">
      <div
        className="h-full bg-news-red transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
