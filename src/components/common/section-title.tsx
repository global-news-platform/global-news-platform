import Link from "next/link"
import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

interface SectionTitleProps {
  label: string
  href?: string
  variant?: "default" | "featured" | "breaking" | "editorial"
  className?: string
}

export function SectionTitle({
  label,
  href,
  variant = "default",
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        "relative mb-6 flex items-center justify-between border-b border-border pb-3",
        {
          "border-b-[3px] border-foreground": variant === "breaking",
        },
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {variant === "breaking" && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
          </span>
        )}
        {variant === "editorial" && (
          <div className="h-5 w-0.5 bg-foreground" />
        )}
        <h2
          className={cn("font-semibold tracking-tight", {
            "font-headline text-xl md:text-2xl": variant === "featured" || variant === "editorial",
            "text-lg md:text-xl font-bold uppercase tracking-[0.05em]":
              variant === "breaking",
            "text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground":
              variant === "default",
          })}
        >
          {label}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          View All
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}
