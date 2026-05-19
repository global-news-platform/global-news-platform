import Link from "next/link"
import { SafeImage } from "@/components/ui/safe-image"
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
        <SectionTitle label="Trending" variant="default" className="mb-4" />
        <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-2 snap-x">
          {articles.slice(0, 10).map((article, i) => (
            <Link
              key={article.slug}
              href={`/article/${article.slug}`}
              className="group flex shrink-0 snap-start items-start gap-4 rounded-xl border border-border/40 bg-card p-4 shadow-sm transition-all hover:shadow-md"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                <SafeImage
                  src={article.image}
                  alt={article.title || ""}
                  categorySlug={article.categorySlug}
                  slug={article.slug}
                  className="transition-all duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-headline text-4xl font-bold leading-none text-foreground/10">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-sm font-semibold leading-snug transition-colors group-hover:text-muted-foreground line-clamp-2">
                  {article.title}
                </h3>
                <span className="text-[11px] text-muted-foreground">
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
