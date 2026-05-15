import type { Metadata } from "next"
import { notFound } from "next/navigation"
import dynamic from "next/dynamic"

import { ArticleHero } from "@/components/article/article-hero"
import { TagCloud } from "@/components/article/tag-cloud"
import { AuthorCard } from "@/components/article/author-card"
import { ArticleNav } from "@/components/article/article-nav"
import { RelatedArticles } from "@/components/article/related-articles"
import { InView } from "@/components/common/in-view"

const MDXContent = dynamic(() =>
  import("@/components/article/mdx-content").then((m) => m.MDXContent),
  { ssr: true },
)

const ShareButtons = dynamic(() =>
  import("@/components/article/share-buttons").then((m) => m.ShareButtons),
)

const ReadingProgressClient = dynamic(() =>
  import("@/components/article/reading-progress-client").then((m) => m.ReadingProgressClient),
)

import {
  getArticleBySlug,
  getArticleSlugs,
  getRelatedArticles,
  getAdjacentArticles,
  getAuthorBySlug,
} from "@/lib/articles"
import {
  absoluteUrl,
  generateMetadata as buildMetadata,
  generateNewsArticleSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo"
import { siteConfig } from "@/lib/constants"

export async function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return {}

  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/article/${article.slug}`,
    openGraph: {
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt || article.publishedAt,
      authors: [article.author],
      tags: article.tags,
      images: article.image
        ? [{ url: absoluteUrl(article.image), width: 1200, height: 630 }]
        : undefined,
    },
  })
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const related = getRelatedArticles(slug, article.categorySlug, 3)
  const { prev, next } = getAdjacentArticles(slug)
  const authorProfile = getAuthorBySlug(article.authorSlug)

  const articleUrl = absoluteUrl(`/article/${article.slug}`)
  const publisherLogo = absoluteUrl(siteConfig.logo)

  const newsArticleSchema = generateNewsArticleSchema(
    article,
    articleUrl,
    publisherLogo,
  )

  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: "Home", url: siteConfig.url },
      { name: article.category, url: absoluteUrl(`/category/${article.categorySlug}`) },
      { name: article.title, url: articleUrl },
    ],
    articleUrl,
  )

  return (
    <>
      <ReadingProgressClient />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([newsArticleSchema, breadcrumbSchema]),
        }}
      />

      <ArticleHero article={article} />

      <div className="mx-auto flex max-w-6xl justify-center gap-8 px-4 py-8 md:px-6 md:py-10 lg:py-12">
        <ShareButtons
          url={articleUrl}
          title={article.title}
          variant="sidebar"
        />

        <article className="min-w-0 flex-1 max-w-3xl">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <MDXContent content={article.content} />
          </div>

          <InView>
            <TagCloud tags={article.tags} />
          </InView>

          {authorProfile && (
            <InView delay={0.1}>
              <div className="mt-8">
                <AuthorCard author={authorProfile} />
              </div>
            </InView>
          )}

          <InView delay={0.15}>
            <div className="mt-6 border-t border-border pt-6 lg:hidden">
              <ShareButtons
                url={articleUrl}
                title={article.title}
                excerpt={article.excerpt}
              />
            </div>
          </InView>
        </article>
      </div>

      {(prev || next) && (
        <InView delay={0.1}>
          <ArticleNav prev={prev} next={next} />
        </InView>
      )}

      {related.length > 0 && (
        <InView delay={0.15}>
          <RelatedArticles articles={related} />
        </InView>
      )}
    </>
  )
}
