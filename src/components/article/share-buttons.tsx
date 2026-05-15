"use client"

import { Twitter, Facebook, Linkedin, Link, Mail, Check } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"

interface ShareButtonsProps {
  url: string
  title: string
  excerpt?: string
  variant?: "inline" | "sidebar"
}

export function ShareButtons({
  url,
  title,
  excerpt,
  variant = "inline",
}: ShareButtonsProps) {
  const { copy, copied } = useCopyToClipboard()
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const encodedExcerpt = encodeURIComponent(excerpt || title)

  const links = [
    {
      name: "X / Twitter",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: Twitter,
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: Facebook,
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: Linkedin,
    },
    {
      name: "Email",
      href: `mailto:?subject=${encodedTitle}&body=${encodedExcerpt}%0A%0A${encodedUrl}`,
      icon: Mail,
    },
  ]

  if (variant === "sidebar") {
    return (
      <aside className="sticky top-24 flex-col items-center gap-3 hidden lg:flex">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          Share
        </span>
        <div className="flex flex-col gap-2">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary hover:text-foreground"
              aria-label={`Share on ${link.name}`}
            >
              <link.icon className="h-4 w-4" />
            </a>
          ))}
          <button
            onClick={() => copy(url)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Copy link"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Link className="h-4 w-4" />
            )}
          </button>
        </div>
        <div className="h-16 w-px bg-border" />
      </aside>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Share
      </span>
      <div className="flex items-center gap-1.5">
        {links.slice(0, 4).map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary"
            aria-label={`Share on ${link.name}`}
          >
            <link.icon className="h-3.5 w-3.5" />
          </a>
        ))}
        <button
          onClick={() => copy(url)}
          className="relative flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary"
          aria-label="Copy link"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Link className="h-3.5 w-3.5" />
          )}
          {copied && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-1 text-[10px] text-background">
              Copied!
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
