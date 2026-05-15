import type { Metadata } from "next"

import { Container } from "@/components/common/container"
import { ArticleCard } from "@/components/article/article-card"
import { InView } from "@/components/common/in-view"
import { getBreakingArticles } from "@/lib/articles"
import { generateMetadata } from "@/lib/seo"

export const metadata: Metadata = generateMetadata({
  title: "Breaking News — Real-Time Updates & Developments",
  description:
    "Real-time breaking news and developing stories from around the world. Stay informed with the latest updates as they happen.",
  path: "/breaking",
  openGraph: {
    title: "Breaking News — Global News",
  },
})

export default function BreakingPage() {
  const articles = getBreakingArticles()

  return (
    <div className="py-8 md:py-12">
      <Container>
        <div className="mb-8 border-b-2 border-news-red pb-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-news-red opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-news-red" />
            </span>
            <h1 className="font-headline text-3xl font-bold uppercase tracking-wide text-news-red md:text-4xl">
              Breaking News
            </h1>
          </div>
          <p className="mt-2 text-muted-foreground">
            Real-time updates on developing stories from around the world
          </p>
        </div>

        {articles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, index) => (
              <InView key={article.slug} delay={Math.min(index * 0.05, 0.2)}>
                <ArticleCard article={article} />
              </InView>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">
              No breaking news at this time.
            </p>
          </div>
        )}
      </Container>
    </div>
  )
}
