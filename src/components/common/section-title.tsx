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
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
        </span>
        <h2 className="text-lg font-bold uppercase tracking-[0.05em] md:text-xl">
          {label}
        </h2>
      </div>
    )
  }

  return (
    <div className={cn("mb-5", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "h-7 w-1 rounded-full",
              variant === "editorial" ? "bg-foreground" : "bg-primary",
            )}
          />
          <h2
            className={cn(
              "text-lg font-bold md:text-xl",
              variant === "default" && "text-muted-foreground",
            )}
          >
            {label}
          </h2>
        </div>
        {href && (
          <Link
            href={href}
            className="group inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            سب دیکھیں
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  )
}
