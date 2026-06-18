import { cn } from "@/lib/utils"

interface AdSlotProps {
  variant?: "leaderboard" | "billboard" | "rectangle" | "skyscraper"
  className?: string
  label?: string
}

const sizeMap = {
  leaderboard: "h-[90px]",
  billboard: "min-h-[90px] md:h-[250px]",
  rectangle: "min-h-[90px] md:h-[250px]",
  skyscraper: "h-[600px]",
}

const AD_EMAIL = "ads@thegloballens365.com"

export function AdSlot({ variant = "rectangle", className, label }: AdSlotProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-lg border-2 border-dashed border-border/40 bg-muted/40",
        sizeMap[variant],
        className,
      )}
    >
      <div className="flex flex-col items-center gap-1.5 px-4 py-6 text-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40">
          {label || "— Advertisement —"}
        </span>
        <span className="text-[12px] font-medium text-muted-foreground/50">
          Your Ad Could Be Here
        </span>
        <a
          href={`mailto:${AD_EMAIL}`}
          className="text-[11px] font-medium text-accent/70 transition-colors hover:text-accent underline underline-offset-2"
        >
          {AD_EMAIL}
        </a>
      </div>
    </div>
  )
}
