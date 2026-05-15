"use client"

import { useState, useEffect } from "react"
import { useReadingProgress } from "@/hooks/use-reading-progress"
import { ReadingProgress } from "@/components/article/reading-progress"

export function ReadingProgressClient() {
  const progress = useReadingProgress()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return <ReadingProgress progress={progress} />
}
