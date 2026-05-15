import Link from "next/link"
import { SectionTitle } from "@/components/common/section-title"
import type { ArticleLink } from "@/types"
import { categories } from "@/lib/constants"
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
        <div className="grid gap-6 md:grid-cols-3">
          {articles.slice(0, 3).map((article) => (
            <Link
              key={article.slug}
              href={`/article/${article.slug}`}
              className="group border-l-[3px] border-foreground/20 pl-4 transition-colors hover:border-foreground"
            >
              <h3 className="font-headline text-lg font-bold leading-snug md:text-xl">
                {article.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {article.excerpt}
              </p>
              <div className="mt-3 flex items-center gap-2 text-[12px] text-muted-foreground/60">
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
