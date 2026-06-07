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
      <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-6 w-1 rounded-full",
              isEditorial ? "bg-gold" : "bg-primary",
            )}
          />
          <h2
            className={cn(
              "text-xl font-bold md:text-2xl tracking-tight",
              isEditorial ? "text-foreground" : "text-foreground",
            )}
          >
            {label}
          </h2>
        </div>
        {href && (
          <Link
            href={href}
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            <span>View All</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        )}
      </div>
    </div>
  )
}
