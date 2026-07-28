import Link from "next/link"
import { SectionTitle } from "@/components/common/section-title"
import type { ArticleLink } from "@/types"
import { formatDateRelative } from "@/lib/utils"
import { Quote } from "lucide-react"

interface OpinionSectionProps {
  articles: ArticleLink[]
}

export function OpinionSection({ articles }: OpinionSectionProps) {
  if (articles.length === 0) return null

  return (
    <section className="border-t border-border/20 py-10 md:py-14 section-gradient relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/[0.02] rounded-full blur-3xl pointer-events-none" />
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 xl:px-8 relative z-10">
        <SectionTitle label="Opinion" href="/category/raye" variant="editorial" />
        <div className="grid gap-6 md:grid-cols-3">
          {articles.slice(0, 3).map((article) => (
            <Link
              key={article.slug}
              href={`/article/${article.slug}`}
              className="group relative flex flex-col rounded-2xl border border-border/10 bg-card p-6 sm:p-7 transition-all duration-500 ease-out-expo hover:shadow-card-hover hover:-translate-y-1.5 hover:border-accent/20 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/[0.03] to-transparent rounded-bl-full pointer-events-none" />
              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent/90 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-accent-foreground shadow-sm">
                  <Quote className="h-3 w-3" />
                  Opinion
                </span>
                <h3 className="overflow-wrap-anywhere mt-4 font-headline text-lg font-bold leading-snug line-clamp-2 md:text-xl tracking-tight group-hover:text-accent transition-colors duration-200">
                  {article.title}
                </h3>
                <p className="overflow-wrap-anywhere mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground/80">
                  {article.excerpt}
                </p>
                <div className="mt-auto flex items-center gap-2 pt-5 text-[12px] text-muted-foreground/50 border-t border-border/10">
                  <span className="font-medium text-foreground/70">By {article.author}</span>
                  <span className="text-muted-foreground/20">&middot;</span>
                  <span>{formatDateRelative(article.publishedAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
