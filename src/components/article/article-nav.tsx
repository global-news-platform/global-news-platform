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
    <section className="border-t border-border py-8">
      <div className="mx-auto max-w-3xl">
        <div className="grid grid-cols-2 gap-4">
          {prev ? (
            <Link
              href={`/article/${prev.slug}`}
              className="group flex flex-col gap-1.5 rounded-lg border border-border p-4 transition-colors hover:bg-secondary"
            >
              <span className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <ChevronLeft className="h-3 w-3" />
                Previous
              </span>
              <span className="font-headline text-sm font-bold leading-snug group-hover:underline">
                {prev.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/article/${next.slug}`}
              className="group flex flex-col gap-1.5 rounded-lg border border-border p-4 text-right transition-colors hover:bg-secondary"
            >
              <span className="flex items-center justify-end gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Next
                <ChevronRight className="h-3 w-3" />
              </span>
              <span className="font-headline text-sm font-bold leading-snug group-hover:underline">
                {next.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </section>
  )
}
