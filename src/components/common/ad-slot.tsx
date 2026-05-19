import { cn } from "@/lib/utils"

interface AdSlotProps {
  variant?: "leaderboard" | "billboard" | "skyscraper" | "rectangle" | "native"
  className?: string
  label?: string
}

const dimensions: Record<string, { width: string; height: string }> = {
  leaderboard: { width: "w-full", height: "h-[90px] md:h-[100px]" },
  billboard: { width: "w-full", height: "h-[200px] md:h-[260px]" },
  skyscraper: { width: "w-[200px] md:w-[260px]", height: "h-[500px] md:h-[600px]" },
  rectangle: { width: "w-full", height: "h-[200px] md:h-[260px]" },
  native: { width: "w-full", height: "h-[100px]" },
}

const adPlaceholders: Record<string, { bg: string; icon: string; text: string }> = {
  leaderboard: {
    bg: "from-primary/5 via-primary/[0.02] to-transparent",
    icon: "M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 10c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z",
    text: "Premier Partner Spotlight",
  },
  billboard: {
    bg: "from-secondary/50 via-secondary/20 to-transparent",
    icon: "M21 6h-2v3h-2V6h-2V4h2V1h2v3h2v2zm-10-2v2H7v3H5V6H2V4h3V1h2v3h3zm5 9h-2v-2h2v2zm-4 0h-2v-2h2v2zm-4 0H6v-2h2v2z",
    text: "Discover More",
  },
  skyscraper: {
    bg: "from-card via-card/50 to-transparent",
    icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z",
    text: "Featured Spotlight",
  },
  rectangle: {
    bg: "from-muted/60 via-muted/20 to-transparent",
    icon: "M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z",
    text: "Advertisement",
  },
  native: {
    bg: "from-border/30 via-border/10 to-transparent",
    icon: "M21 6h-2v3h-2V6h-2V4h2V1h2v3h2v2zm-10-2v2H7v3H5V6H2V4h3V1h2v3h3zm5 9h-2v-2h2v2zm-4 0h-2v-2h2v2zm-4 0H6v-2h2v2z",
    text: "Sponsored Content",
  },
}

export function AdSlot({ variant = "leaderboard", className, label }: AdSlotProps) {
  const dim = dimensions[variant]
  const ph = adPlaceholders[variant]

  return (
    <div
      className={cn(
        "relative mx-auto overflow-hidden rounded-xl border border-border/40 bg-background",
        "transition-all duration-300 hover:border-border/60",
        dim.width,
        dim.height,
        className,
      )}
    >
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-gradient-to-br",
          ph.bg,
        )}
      >
        <div className="flex flex-col items-center gap-2 px-6 text-center">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 text-muted-foreground/40"
            fill="currentColor"
          >
            <path d={ph.icon} />
          </svg>
          <span className="text-xs font-medium tracking-wide text-muted-foreground/50">
            {label || ph.text}
          </span>
          <div className="flex items-center gap-2">
            <span className="h-px w-8 bg-border/40" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/30">
              Ad
            </span>
            <span className="h-px w-8 bg-border/40" />
          </div>
        </div>
      </div>
    </div>
  )
}
