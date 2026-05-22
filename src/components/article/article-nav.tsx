import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { ArticleLink } from "@/types"

interface ArticleNavProps {
  prev: ArticleLink | null
  next: ArticleLink | null
}

export function ArticleNav({ prev, next }: ArticleNavProps) {
  if (!prev && !next) return null

  return (
    <nav className="border-t border-border pt-8">
      <div className="grid gap-4 sm:grid-cols-2">
        {next ? (
          <Link
            href={`/article/${next.slug}`}
            className="group flex items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-secondary"
          >
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                پچھلا
              </span>
              <p className="mt-1 text-sm font-medium leading-snug">
                {next.title}
              </p>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {prev ? (
          <Link
            href={`/article/${prev.slug}`}
            className="group flex items-start gap-3 rounded-lg border border-border p-4 text-right transition-colors hover:bg-secondary sm:text-right"
          >
            <div className="flex-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                اگلا
              </span>
              <p className="mt-1 text-sm font-medium leading-snug">
                {prev.title}
              </p>
            </div>
            <ChevronLeft className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </nav>
  )
}
