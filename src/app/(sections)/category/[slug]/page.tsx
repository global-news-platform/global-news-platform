import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { Container } from "@/components/common/container"
import { ArticleCard } from "@/components/article/article-card"
import { AdSlot } from "@/components/common/ad-slot"
import { Breadcrumbs } from "@/components/article/breadcrumbs"

import { getArticlesByCategory, getArticleLinks } from "@/lib/articles"
import { categories } from "@/lib/constants"
import {
  absoluteUrl,
  generateMetadata as buildMetadata,
  generateCollectionSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo"



export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = categories.find((c) => c.slug === slug)
  if (!category) return {}

  return buildMetadata({
    title: `${category.name} — Latest News & Analysis`,
    description: category.description,
    path: `/category/${category.slug}`,
    openGraph: {
      title: `${category.name} — ${category.description}`,
    },
  })
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = categories.find((c) => c.slug === slug)
  if (!category) notFound()

  const articles = await getArticlesByCategory(slug)
  const otherArticles = (await getArticleLinks()).filter(
    (a) => a.categorySlug !== slug,
  )

  const pageUrl = absoluteUrl(`/category/${slug}`)

  const collectionSchema = generateCollectionSchema(
    `${category.name} News`,
    category.description,
    pageUrl,
    articles.length,
  )

  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: "Home", url: absoluteUrl("/") },
      { name: category.name, url: pageUrl },
    ],
    pageUrl,
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([collectionSchema, breadcrumbSchema]),
        }}
      />

      <div className="border-b border-border bg-secondary/30 py-6 md:py-8">
        <Container>
          <Breadcrumbs
            items={[
              { label: category.name },
            ]}
          />
          <div className="border-b-[3px] border-foreground pb-4">
            <h1 className="font-headline text-3xl font-bold md:text-4xl">
              {category.name}
            </h1>
            <p className="mt-2 text-muted-foreground">{category.description}</p>
          </div>
        </Container>
      </div>

      <div className="py-8 md:py-12">
        <Container>
          <AdSlot variant="leaderboard" className="mb-8 hidden md:flex" />

          <div className="flex gap-8">
            <div className="min-w-0 flex-1">
              {articles.length > 0 ? (
                <div className="space-y-10">
                  {/* Featured */}
                  <div className="grid gap-8 md:grid-cols-2">
                    <div className="md:col-span-2 lg:col-span-1">
                      <ArticleCard article={articles[0]} variant="featured" />
                    </div>
                    {articles.slice(1, 3).map((article) => (
                      <div key={article.slug}>
                        <ArticleCard article={article} variant="horizontal" />
                      </div>
                    ))}
                  </div>

                  {/* Grid */}
                  {articles.length > 3 && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {articles.slice(3).map((article) => (
                        <ArticleCard
                          key={article.slug}
                          article={article}
                          variant="default"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-20 text-center">
                  <p className="text-lg text-muted-foreground">
                    No articles in this category yet.
                  </p>
                </div>
              )}

              {otherArticles.length > 0 && (
                <div className="mt-16 border-t border-border pt-10">
                  <h2 className="mb-6 text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    More News
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {otherArticles.slice(0, 4).map((article) => (
                      <ArticleCard key={article.slug} article={article} variant="default" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="hidden w-[260px] shrink-0 xl:block">
              <div className="sticky top-28 flex flex-col gap-6">
                <AdSlot variant="skyscraper" className="w-full" label="Advertisement" />
                <AdSlot variant="rectangle" className="w-full" label="Sponsored" />
              </div>
            </aside>
          </div>
        </Container>
      </div>
    </>
  )
}
