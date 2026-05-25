import Link from "next/link"
import { cn } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-8 w-1.5 rounded-sm",
              isEditorial ? "bg-gold" : "bg-primary",
            )}
          />
          <h2
            className={cn(
              "text-xl font-bold md:text-2xl",
              isEditorial ? "text-foreground" : "text-foreground",
            )}
          >
            {label}
          </h2>
        </div>
        {href && (
          <Link
            href={href}
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            سب دیکھیں
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        )}
      </div>
      <div
        className={cn(
          "mt-2 h-[2px] w-full rounded-full",
          isEditorial ? "bg-gradient-to-l from-gold/40 to-transparent" : "bg-gradient-to-l from-primary/30 to-transparent",
        )}
      />
    </div>
  )
}
