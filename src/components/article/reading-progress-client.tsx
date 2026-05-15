"use client"

import dynamic from "next/dynamic"

const ReadingProgress = dynamic(
  () => import("@/components/article/reading-progress").then((m) => m.ReadingProgress),
  { ssr: false },
)

export function ReadingProgressClient() {
  return <ReadingProgress />
}
