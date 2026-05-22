import type { Metadata } from "next"

import { Container } from "@/components/common/container"
import { ArticleCard } from "@/components/article/article-card"
import { AdSlot } from "@/components/common/ad-slot"
import { getBreakingArticles } from "@/lib/articles"
import { generateMetadata } from "@/lib/seo"

export const metadata: Metadata = generateMetadata({
  title: "بریکنگ نیوز — تازہ ترین اپ ڈیٹس و پیش رفت",
  description:
    "پاکستان اور دنیا سے تازہ ترین بریکنگ خبریں اور ترقی پذیر کہانیاں۔ جیسے جیسے ہو رہا ہے ویسے ہی باخبر رہیں۔",
  path: "/breaking",
  openGraph: {
    title: "بریکنگ نیوز — پاکستان نیوز",
  },
})

export const revalidate = 3600

export default async function BreakingPage() {
  const articles = await getBreakingArticles()

  return (
    <div className="py-8 md:py-12">
      <Container>
        <div className="mb-8 border-b-[3px] border-red-600 pb-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600" />
            </span>
            <h1 className="font-headline text-3xl font-bold uppercase tracking-wide md:text-4xl">
              بریکنگ نیوز
            </h1>
          </div>
          <p className="mt-2 text-muted-foreground">
            پاکستان اور دنیا سے تازہ ترین بریکنگ خبریں
          </p>
        </div>

        {articles.length > 0 ? (
          <div className="flex gap-8">
            <div className="min-w-0 flex-1">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <ArticleCard key={article.slug} article={article} variant="default" />
                ))}
              </div>

              <AdSlot variant="billboard" className="mt-10 hidden md:flex" label="باخبر رہیں" />
            </div>

            <aside className="hidden w-[260px] shrink-0 xl:block">
              <div className="sticky top-28 flex flex-col gap-6">
                <AdSlot variant="skyscraper" className="w-full" label="اشتہار" />
                <AdSlot variant="rectangle" className="w-full" label="سپانسر شدہ" />
              </div>
            </aside>
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">
              اس وقت کوئی بریکنگ نیوز نہیں ہے۔
            </p>
          </div>
        )}
      </Container>
    </div>
  )
}
