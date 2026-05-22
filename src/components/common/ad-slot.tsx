import { cn } from "@/lib/utils"

interface AdSlotProps {
  variant?: "leaderboard" | "billboard" | "rectangle" | "skyscraper"
  className?: string
  label?: string
}

const sizeMap = {
  leaderboard: "h-[90px]",
  billboard: "h-[250px]",
  rectangle: "h-[250px]",
  skyscraper: "h-[600px]",
}

export function AdSlot({ variant = "rectangle", className, label }: AdSlotProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded bg-muted/30",
        sizeMap[variant],
        className,
      )}
    >
      {label && (
        <span className="text-xs text-muted-foreground/40">{label}</span>
      )}
    </div>
  )
}
