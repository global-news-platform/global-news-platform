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
    <section className="border-t border-border/20 py-8 md:py-12 section-gradient">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 xl:px-8">
        <SectionTitle label="Opinion" href="/category/raye" variant="editorial" />
        <div className="grid gap-6 md:grid-cols-3">
          {articles.slice(0, 3).map((article) => (
            <Link
              key={article.slug}
              href={`/article/${article.slug}`}
              className="group flex flex-col rounded-xl border border-border/10 bg-card p-6 transition-all duration-500 ease-out-expo hover:shadow-card-hover hover:-translate-y-1"
            >
              <span className="inline-block w-fit rounded-lg bg-gradient-to-r from-accent to-accent/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-accent-foreground shadow-sm shadow-accent/30">
                Opinion
              </span>
              <h3 className="overflow-wrap-anywhere mt-3 font-headline text-lg font-bold leading-snug line-clamp-2 md:text-xl tracking-tight group-hover:text-accent transition-colors duration-200">
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
