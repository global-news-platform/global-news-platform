import Link from "next/link"
import { cn } from "@/lib/utils"

interface SectionTitleProps {
  children: React.ReactNode
  variant?: "default" | "featured" | "breaking" | "category" | "editorial"
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
    <div className={cn("relative mb-6 md:mb-8", className)}>
      {variant === "breaking" ? (
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-news-red opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-news-red" />
          </span>
          <h2 className="font-headline text-sm font-bold uppercase leading-none tracking-[0.15em] text-news-red md:text-base">
            {children}
          </h2>
        </div>
      ) : variant === "featured" ? (
        <Tag
          href={href || "#"}
          className="group block"
        >
          <div className="flex items-center justify-between border-t-[3px] border-foreground pt-4">
            <h2 className="font-headline text-2xl font-bold leading-tight tracking-tight md:text-3xl">
              {children}
            </h2>
            {href && (
              <span className="hidden text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground md:inline">
                View all &rarr;
              </span>
            )}
          </div>
        </Tag>
      ) : variant === "editorial" ? (
        <Tag
          href={href || "#"}
          className="group block"
        >
          <div className="flex items-center gap-4 border-t border-border pt-4">
            <span className="h-[3px] w-8 shrink-0 rounded-sm bg-news-red" />
            <h2 className="font-headline text-lg font-bold leading-tight tracking-tight md:text-xl">
              {children}
            </h2>
            {href && (
              <span className="ml-auto hidden text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground md:inline">
                View all &rarr;
              </span>
            )}
          </div>
        </Tag>
      ) : variant === "category" ? (
        <Tag
          href={href || "#"}
          className="group flex items-center gap-3 border-t-2 border-foreground pt-3"
        >
          <span className="h-4 w-0.5 shrink-0 bg-news-red" />
          <h2 className="font-headline text-sm font-bold uppercase tracking-[0.18em] md:text-base">
            {children}
          </h2>
          {href && (
            <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-0 transition-all group-hover:opacity-100">
              View All
            </span>
          )}
        </Tag>
      ) : (
        <div className="border-t-2 border-foreground pt-3">
          <h2 className="font-headline text-sm font-bold uppercase tracking-[0.15em] md:text-base">
            {children}
          </h2>
        </div>
      )}
    </div>
  )
}
