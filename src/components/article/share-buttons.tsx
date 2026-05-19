"use client"

import { Twitter, Linkedin, Link2, Mail, Facebook } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { siteConfig } from "@/lib/constants"

interface ShareButtonsProps {
  url: string
  title: string
  variant?: "inline" | "sidebar"
}

export function ShareButtons({
  url,
  title,
  variant = "inline",
}: ShareButtonsProps) {
  const { copied, copy } = useCopyToClipboard()
  const fullUrl = `${siteConfig.url}${url}`
  const encodedUrl = encodeURIComponent(fullUrl)
  const encodedTitle = encodeURIComponent(title)

  const shareLinks = [
    {
      name: "Twitter",
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
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      icon: Mail,
    },
  ]

  if (variant === "sidebar") {
    return (
      <div className="flex flex-col items-center gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Share
        </span>
        <div className="flex flex-col gap-2">
          {shareLinks.map((link) => {
            const Icon = link.icon
            return (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label={`Share on ${link.name}`}
              >
                <Icon className="h-4 w-4" />
              </a>
            )
          })}
          <button
            onClick={() => copy(fullUrl)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Copy link"
          >
            {copied ? (
              <span className="text-[10px] font-medium">OK</span>
            ) : (
              <Link2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[12px] text-muted-foreground">Share:</span>
      {shareLinks.map((link) => {
        const Icon = link.icon
        return (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={`Share on ${link.name}`}
          >
            <Icon className="h-4 w-4" />
          </a>
        )
      })}
      <button
        onClick={() => copy(fullUrl)}
        className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Copy link"
      >
        {copied ? (
          <span className="text-[10px] font-medium">Copied!</span>
        ) : (
          <Link2 className="h-4 w-4" />
        )}
      </button>
    </div>
  )
}
