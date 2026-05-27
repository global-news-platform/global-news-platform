"use client"

import { splitMixedLanguage } from "@/lib/urdu-ai"

interface MixedTextProps {
  text: string
  className?: string
  as?: "h1" | "h2" | "h3" | "h4" | "span" | "p"
}

export function MixedText({ text, className, as: Tag = "span" }: MixedTextProps) {
  const segments = splitMixedLanguage(text)

  if (segments.length <= 1) {
    return <Tag className={className} dir="auto">{text}</Tag>
  }

  return (
    <Tag className={className} dir="auto">
      {segments.map((seg, i) => (
        <span key={i} dir={seg.dir}>{seg.text}</span>
      ))}
    </Tag>
  )
}
