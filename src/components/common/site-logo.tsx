"use client"

import { useState } from "react"
import { Facebook } from "lucide-react"
import { siteConfig } from "@/lib/constants"

interface SiteLogoProps {
  className?: string
  iconSize?: number
  textSize?: string
  showTagline?: boolean
}

export function SiteLogo({ className = "h-12 w-12", iconSize = 6, textSize = "text-2xl font-bold leading-tight tracking-tight md:text-3xl", showTagline = false }: SiteLogoProps) {
  const [useFallback, setUseFallback] = useState(false)

  if (useFallback) {
    return (
      <>
        <div className={`flex items-center justify-center rounded-lg bg-[#1877F2] shadow-md ${className}`}>
          <Facebook className={`h-${iconSize} w-${iconSize} text-white`} />
        </div>
        <div className="flex flex-col">
          <span className={textSize}>
            {siteConfig.name}
          </span>
          {showTagline && (
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground md:block">
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
        className={`rounded-lg object-cover ${className}`}
        onError={() => setUseFallback(true)}
      />
      <div className="flex flex-col">
        <span className={textSize}>
          {siteConfig.name}
        </span>
        {showTagline && (
          <span className="hidden text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground md:block">
            {siteConfig.tagline}
          </span>
        )}
      </div>
    </>
  )
}
