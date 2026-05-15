import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { Container } from "@/components/common/container"
import { SectionTitle } from "@/components/common/section-title"
import { ArticleCard } from "@/components/article/article-card"
import { InView } from "@/components/common/in-view"
import { Breadcrumbs } from "@/components/article/breadcrumbs"

import { getArticlesByCategory, getArticleLinks, getAllArticles } from "@/lib/articles"
import { categories } from "@/lib/constants"
import {
  absoluteUrl,
  generateMetadata as buildMetadata,
  generateCollectionSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo"

export async function generateStaticParams() {
  return categories.map((cat) => ({ slug: cat.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = categories.find((c) => c.slug === slug)
  if (!category) return {}

  return buildMetadata({
    title: `${category.name} News — Latest Updates & Analysis`,
    description: category.description,
    path: `/category/${category.slug}`,
    openGraph: {
      title: `${category.name} News — ${category.description}`,
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

  const articles = getArticlesByCategory(slug)
  const allArticles = getArticleLinks().filter(
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
              { label: "Home", href: "/" },
              { label: category.name },
            ]}
          />
          <div className="border-b-2 border-foreground pb-4">
            <h1 className="font-headline text-3xl font-bold md:text-4xl">
              {category.name}
            </h1>
            <p className="mt-2 text-muted-foreground">{category.description}</p>
          </div>
        </Container>
      </div>

      <div className="py-8 md:py-12">
        <Container>
          {articles.length > 0 && (
            <InView>
              <div className="mb-10">
                <ArticleCard article={articles[0]} variant="featured" />
              </div>
            </InView>
          )}

          {articles.length > 1 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {articles.slice(1).map((article, index) => (
                <InView key={article.slug} delay={Math.min(index * 0.05, 0.3)}>
                  <ArticleCard article={article} />
                </InView>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-lg text-muted-foreground">
                No articles in this category yet.
              </p>
            </div>
          )}

          {allArticles.length > 0 && (
            <div className="mt-16">
              <SectionTitle>More News</SectionTitle>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {allArticles.slice(0, 4).map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            </div>
          )}
        </Container>
      </div>
    </>
  )
}
