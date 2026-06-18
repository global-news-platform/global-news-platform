import Link from "next/link"
import { cn } from "@/lib/utils"
import { ArrowRight, Flame } from "lucide-react"

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
  if (variant === "breaking") {
    return (
      <div className={cn("mb-6 flex items-center gap-3", className)}>
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600" />
        </span>
        <h2 className="text-lg font-bold uppercase tracking-[0.05em] md:text-xl">
          {label}
        </h2>
      </div>
    )
  }

  const isEditorial = variant === "editorial"

  return (
    <div className={cn("mb-6", className)}>
      <div className="flex items-end justify-between border-b border-border/60 pb-2.5 relative">
        <div className="absolute bottom-0 left-0 w-16 h-[3px] bg-gradient-to-r from-accent via-accent/60 to-transparent rounded-full" />
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-1 h-6 rounded-full",
              isEditorial ? "bg-accent" : "bg-accent",
            )}
          />
          <h2
            className={cn(
              "text-xl font-bold md:text-2xl tracking-tight",
              "text-foreground",
            )}
          >
            {label}
          </h2>
        </div>
        {href && (
          <Link
            href={href}
            className="group inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition-all duration-300 hover:bg-accent/20 hover:shadow-sm"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5 transition-all duration-300 group-hover:translate-x-1" />
          </Link>
        )}
      </div>
    </div>
  )
}
