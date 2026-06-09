import type { Metadata } from "next"
import Link from "next/link"
import { Search, Home, ExternalLink, Copyright } from "lucide-react"

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
import { siteConfig, DISCLAIMER_TEXT } from "@/lib/constants"

export const dynamic = "force-static"
export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = getArticleSlugs().slice(0, 250)
  return slugs.length > 0 ? slugs.map((slug) => ({ slug })) : [{ slug: "_placeholder" }]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return { title: "Article not found" }

  const canonicalUrl = article.source?.canonicalUrl

  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/article/${article.slug}`,
    alternates: canonicalUrl ? {
      canonical: absoluteUrl(`/article/${article.slug}`),
    } : undefined,
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
  if (!article) {
    return (
      <Container size="sm" className="py-16 md:py-24">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Search className="h-7 w-7 text-muted-foreground" />
          </div>
          <h1 className="font-headline text-3xl font-bold">Article not found</h1>
          <p className="mt-3 text-muted-foreground">
            The article you are looking for does not exist.
            It may have been removed or moved.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              <Home className="h-4 w-4" />
              Go to Home
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Search className="h-4 w-4" />
              Search News
            </Link>
          </div>
        </div>
      </Container>
    )
  }

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
      { name: "Home", url: siteConfig.url },
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

            {/* Source attribution & fair use notice */}
            <div className="mt-8 rounded-lg border border-border/40 bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <Copyright className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="space-y-2 text-[12px] leading-[1.8] text-muted-foreground">
                  <p>{DISCLAIMER_TEXT}</p>
                  {article.source && (
                    <p>
                      Source:{" "}
                      <a
                        href={article.source.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex items-center gap-1 font-medium text-foreground underline decoration-foreground/30 underline-offset-2 hover:decoration-foreground/60 transition-colors"
                      >
                        {article.source.name}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                  )}

                  <p className="text-[11px] text-muted-foreground/60">
                    All copyrights are reserved by respective owners.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 space-y-6">
              <TagCloud tags={article.tags} />
            </div>

            <div className="mt-10">
              <AdSlot variant="rectangle" className="hidden sm:flex" label="Read more" />
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
                <AdSlot variant="skyscraper" className="w-full" label="You may also like" />
                <AdSlot variant="rectangle" className="w-full" label="Sponsored" />
              </div>
            </aside>
          )}
        </div>

        <div className="mx-auto mt-12 max-w-[88rem]">
          <AdSlot variant="billboard" className="hidden md:flex" label="Recommended Reading" />
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
