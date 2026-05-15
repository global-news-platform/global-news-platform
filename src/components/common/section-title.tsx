import Link from "next/link"
import { cn } from "@/lib/utils"

interface SectionTitleProps {
  children: React.ReactNode
  variant?: "default" | "featured" | "breaking" | "category"
  className?: string
  href?: string
}

export function SectionTitle({
  children,
  variant = "default",
  className,
  href,
}: SectionTitleProps) {
  const Tag = href ? Link : "div"

  return (
    <div className={cn("relative mb-5 md:mb-6", className)}>
      {variant === "breaking" ? (
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-news-red opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-news-red" />
          </span>
          <h2 className="font-headline text-sm font-bold uppercase leading-none tracking-[0.12em] text-news-red md:text-base">
            {children}
          </h2>
        </div>
      ) : variant === "featured" ? (
        <Tag
          href={href || "#"}
          className="group border-t-[3px] border-foreground pt-4"
        >
          <h2 className="font-headline text-2xl font-bold leading-tight md:text-3xl">
            {children}
          </h2>
        </Tag>
      ) : variant === "category" ? (
        <Tag
          href={href || "#"}
          className="group flex items-center gap-3 border-t-2 border-foreground pt-3"
        >
          <span className="h-4 w-0.5 bg-news-red" />
          <h2 className="font-headline text-sm font-bold uppercase tracking-[0.15em] md:text-base">
            {children}
          </h2>
          {href && (
            <span className="ml-auto text-[11px] font-medium uppercase tracking-wider text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
              View All
            </span>
          )}
        </Tag>
      ) : (
        <div className="border-t-2 border-foreground pt-3">
          <h2 className="font-headline text-sm font-bold uppercase tracking-[0.12em] md:text-base">
            {children}
          </h2>
        </div>
      )}
    </div>
  )
}
