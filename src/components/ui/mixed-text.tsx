"use client"

interface MixedTextProps {
  text: string
  className?: string
  as?: "h1" | "h2" | "h3" | "h4" | "span" | "p"
}

export function MixedText({ text, className, as: Tag = "span" }: MixedTextProps) {
  return <Tag className={className} dir="auto">{text}</Tag>
}
