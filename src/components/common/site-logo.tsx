"use client"

import { useState } from "react"
import { Globe } from "lucide-react"
import { siteConfig } from "@/lib/constants"

interface SiteLogoProps {
  className?: string
  iconSize?: number
  textSize?: string
  showTagline?: boolean
}

export function SiteLogo({ className = "h-10 w-10 sm:h-12 sm:w-12", iconSize = 5, textSize = "text-lg sm:text-2xl font-bold leading-tight tracking-tight md:text-3xl", showTagline = false }: SiteLogoProps) {
  const [useFallback, setUseFallback] = useState(false)

  if (useFallback) {
    return (
      <>
        <div className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30 ${className}`}>
          <Globe className={`h-${iconSize} w-${iconSize} text-accent`} />
        </div>
        <div className="flex flex-col">
          <span className={textSize}>
            {siteConfig.name}
          </span>
          {showTagline && (
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground/60 md:block">
              {siteConfig.tagline}
            </span>
          )}
        </div>
      </>
    )
  }

  return (
    <>
      <img
        src={siteConfig.logoSvg}
        alt={siteConfig.name}
        className={`rounded-xl object-cover shadow-sm ${className}`}
        onError={() => setUseFallback(true)}
      />
      <div className="flex flex-col">
        <span className={textSize}>
          {siteConfig.name}
        </span>
        {showTagline && (
          <span className="hidden text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground/60 md:block">
            {siteConfig.tagline}
          </span>
        )}
      </div>
    </>
  )
}
