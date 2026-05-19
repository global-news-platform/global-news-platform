import Link from "next/link"
import { SectionTitle } from "@/components/common/section-title"
import type { ArticleLink } from "@/types"
import { formatDateRelative } from "@/lib/utils"

interface OpinionSectionProps {
  articles: ArticleLink[]
}

export function OpinionSection({ articles }: OpinionSectionProps) {
  if (articles.length === 0) return null

  return (
    <section className="border-t border-border py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 xl:px-8">
        <SectionTitle label="Opinion" href="/category/opinion" variant="editorial" />
        <div className="grid gap-5 md:grid-cols-3">
          {articles.slice(0, 3).map((article) => (
            <Link
              key={article.slug}
              href={`/article/${article.slug}`}
              className="group flex flex-col rounded-xl border border-border/50 bg-card p-5 shadow-sm transition-all hover:shadow-md"
            >
              <span className="inline-block w-fit rounded-full bg-rose-50 px-2.5 py-[3px] text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                Opinion
              </span>
              <h3 className="overflow-wrap-anywhere mt-3 font-headline text-lg font-bold leading-snug line-clamp-2 group-hover:text-muted-foreground md:text-xl">
                {article.title}
              </h3>
              <p className="overflow-wrap-anywhere mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {article.excerpt}
              </p>
              <div className="mt-auto flex items-center gap-2 pt-4 text-[12px] text-muted-foreground/60">
                <span>By {article.author}</span>
                <span>&middot;</span>
                <span>{formatDateRelative(article.publishedAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
