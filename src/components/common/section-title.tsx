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
      <div className="flex items-end justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-1 h-5 rounded-full",
              isEditorial ? "bg-gold" : "bg-primary",
            )}
          />
          <h2
            className={cn(
              "text-lg font-bold md:text-xl tracking-tight",
              isEditorial ? "text-foreground" : "text-foreground",
            )}
          >
            {label}
          </h2>
        </div>
        {href && (
          <Link
            href={href}
            className="group inline-flex items-center gap-1.5 text-xs font-semibold text-primary/80 transition-colors hover:text-primary"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  )
}
