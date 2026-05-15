"use client"

import { useReadingProgress } from "@/hooks/use-reading-progress"

export function ReadingProgress() {
  const progress = useReadingProgress()

  return (
    <div className="fixed left-0 top-0 z-50 h-[3px] w-full bg-transparent">
      <div
        className="h-full bg-foreground/80 transition-[width] duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
