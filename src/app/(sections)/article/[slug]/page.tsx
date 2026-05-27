import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ArticleHero } from "@/components/article/article-hero"
import { AdSlot } from "@/components/common/ad-slot"
import { TagCloud } from "@/components/article/tag-cloud"
import { AuthorCard } from "@/components/article/author-card"
import { ArticleNav } from "@/components/article/article-nav"
import { RelatedArticles } from "@/components/article/related-articles"
import { MDXContent } from "@/components/article/mdx-content"
import { ShareButtons } from "@/components/article/share-buttons"
import { ReadingProgressClient } from "@/components/article/reading-progress-client"
import { Container } from "@/components/common/container"
import { cn } from "@/lib/utils"

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

export const dynamic = "force-static"
export const revalidate = 3600

export async function generateStaticParams() {
  return getArticleSlugs().slice(0, 250).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
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

const SIDEBAR_ADS_ENABLED = false

function hasSidebarContent(): boolean {
  return SIDEBAR_ADS_ENABLED
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  const [related, { prev, next }, authorProfile] = await Promise.all([
    getRelatedArticles(slug, article.categorySlug, 3),
    getAdjacentArticles(slug),
    getAuthorBySlug(article.authorSlug),
  ])

  const articleUrl = absoluteUrl(`/article/${article.slug}`)
  const publisherLogo = absoluteUrl(siteConfig.logo)

  const newsArticleSchema = generateNewsArticleSchema(
    article,
    articleUrl,
    publisherLogo,
  )

  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: "ہوم", url: siteConfig.url },
      { name: article.category, url: absoluteUrl(`/category/${article.categorySlug}`) },
      { name: article.title, url: articleUrl },
    ],
    articleUrl,
  )

  const showRightSidebar = hasSidebarContent()

  return (
    <>
      <ReadingProgressClient />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([newsArticleSchema, breadcrumbSchema]),
        }}
      />

      <Container size="sm" className="py-8 md:py-12">
        <div className="mx-auto flex max-w-[88rem] justify-center gap-6 xl:gap-10">
          {/* Sticky share sidebar */}
          <aside className="sticky top-24 hidden h-fit lg:block">
            <ShareButtons
              url={articleUrl}
              title={article.title}
              variant="sidebar"
            />
          </aside>

          {/* Main content */}
          <article className={cn(
            "min-w-0 flex-1",
            showRightSidebar ? "max-w-reading-wide" : "max-w-full",
          )}>
            <ArticleHero article={article} />

            <div className="mt-10">
              <MDXContent content={article.content} className="max-w-reading" />
            </div>

            <div className="mt-10 space-y-6">
              <TagCloud tags={article.tags} />
            </div>

            <div className="mt-10">
              <AdSlot variant="rectangle" className="hidden sm:flex" label="مزید پڑھیں" />
            </div>

            {authorProfile && (
              <div className="mt-10">
                <AuthorCard author={authorProfile} categorySlug={article.categorySlug} />
              </div>
            )}

            <div className="mt-8 lg:hidden">
              <ShareButtons
                url={articleUrl}
                title={article.title}
                variant="inline"
              />
            </div>

            {(prev || next) && (
              <div className="mt-10">
                <ArticleNav prev={prev} next={next} />
              </div>
            )}
          </article>

          {/* Right sidebar ad - collapsed when no real ad content */}
          {showRightSidebar && (
            <aside className="sticky top-24 hidden h-fit xl:block xl:w-[260px]">
              <div className="flex flex-col gap-6">
                <AdSlot variant="skyscraper" className="w-full" label="آپ کو پسند آ سکتا ہے" />
                <AdSlot variant="rectangle" className="w-full" label="سپانسر شدہ" />
              </div>
            </aside>
          )}
        </div>

        <div className="mx-auto mt-12 max-w-[88rem]">
          <AdSlot variant="billboard" className="hidden md:flex" label="تجویز کردہ پڑھنا" />
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <RelatedArticles articles={related} />
          </div>
        )}
      </Container>
    </>
  )
}
