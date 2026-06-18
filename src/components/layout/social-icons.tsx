"use client"

import { Twitter, Facebook, Linkedin, Rss } from "lucide-react"
import { siteConfig } from "@/lib/constants"

const socialLinks = [
  {
    href: siteConfig.links.twitter,
    label: "Twitter",
    icon: Twitter,
  },
  {
    href: siteConfig.links.facebook,
    label: "Facebook",
    icon: Facebook,
  },
  {
    href: siteConfig.links.linkedin,
    label: "LinkedIn",
    icon: Linkedin,
  },
  {
    href: siteConfig.links.rss,
    label: "RSS Feed",
    icon: Rss,
  },
]

interface SocialIconsProps {
  variant?: "header" | "footer"
}

export function SocialIcons({ variant = "footer" }: SocialIconsProps) {
  if (variant === "header") {
    return (
      <>
        {socialLinks.map(({ href, label, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded p-1 text-white/60 transition-colors hover:text-white"
            aria-label={label}
          >
            <Icon className="h-3 w-3" />
            <span className="hidden lg:inline text-[10px] font-medium">{label}</span>
          </a>
        ))}
      </>
    )
  }

  return (
    <>
      {socialLinks.slice(0, 4).map(({ href, label, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-background/10 p-2.5 text-background/70 transition-colors hover:bg-background/20 hover:text-background"
          aria-label={label}
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </>
  )
}
