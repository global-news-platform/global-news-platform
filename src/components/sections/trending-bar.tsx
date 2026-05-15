import Link from "next/link"
import { Flame, ArrowRight } from "lucide-react"
import { SectionTitle } from "@/components/common/section-title"
import type { ArticleLink } from "@/types"

interface TrendingBarProps {
  articles: ArticleLink[]
}

export function TrendingBar({ articles }: TrendingBarProps) {
  if (articles.length === 0) return null

  return (
    <section className="border-y border-border bg-secondary/30 py-5 md:py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 xl:px-8">
        <SectionTitle
          label="Trending"
          variant="default"
          className="mb-4"
        />
        <div className="flex gap-6 overflow-x-auto scrollbar-hide">
          {articles.map((article, i) => (
            <Link
              key={article.slug}
              href={`/article/${article.slug}`}
              className="group flex shrink-0 items-start gap-4"
            >
              <span className="font-headline text-4xl font-bold leading-none text-foreground/10">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="max-w-[220px]">
                <h3 className="text-sm font-semibold leading-snug transition-colors group-hover:text-muted-foreground">
                  {article.title}
                </h3>
                <span className="mt-1.5 block text-[11px] text-muted-foreground">
                  {article.readingTime} min read
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
