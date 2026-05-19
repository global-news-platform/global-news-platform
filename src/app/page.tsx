import type { Metadata } from "next"

import { HeroSection } from "@/components/sections/hero-section"
import { InView } from "@/components/common/in-view"
import { AdSlot } from "@/components/common/ad-slot"
import { BreakingNewsBanner } from "@/components/sections/breaking-news-banner"
import { TrendingBar } from "@/components/sections/trending-bar"
import { MostRead } from "@/components/sections/most-read"
import { LatestNews } from "@/components/sections/latest-news"
import { NewsGrid } from "@/components/sections/news-grid"
import { EditorPicks } from "@/components/sections/editor-picks"
import { NewsletterSection } from "@/components/sections/newsletter-section"

import {
  getArticleLinks,
  getBreakingArticles,
  getFeaturedArticle,
  getMostReadArticles,
  getTrendingArticles,
  preResolveAllImages,
} from "@/lib/articles"

import {
  generateWebsiteSchema,
  generateOrganizationSchema,
} from "@/lib/seo"

export const metadata: Metadata = {
  title: "Global News — The World at a Glance",
  description:
    "Global News delivers comprehensive, trusted coverage of world events, business, technology, politics, and culture. Stay informed with our international newsroom.",
  openGraph: {
    title: "Global News — The World at a Glance",
    description:
      "Global News delivers comprehensive, trusted coverage of world events, business, technology, politics, and culture.",
  },
}

function excludeSlugs<T extends { slug: string }>(articles: T[], exclude: Set<string>): T[] {
  return articles.filter((a) => !exclude.has(a.slug))
}

export default async function HomePage() {
  await preResolveAllImages()
  const allArticles = getArticleLinks()
  const breaking = getBreakingArticles()
  const featured = getFeaturedArticle()
  const trending = getTrendingArticles()
  const mostRead = getMostReadArticles(4)

  const usedSlugs = new Set<string>()
  if (featured) usedSlugs.add(featured.slug)
  for (const a of breaking) usedSlugs.add(a.slug)
  for (const a of trending) usedSlugs.add(a.slug)
  for (const a of mostRead) usedSlugs.add(a.slug)

  const secondaryArticles = excludeSlugs(allArticles, usedSlugs)

  const latestArticles = excludeSlugs(
    allArticles.filter((a) => !a.breaking),
    usedSlugs,
  ).slice(0, 8)
  for (const a of latestArticles) usedSlugs.add(a.slug)

  const editorPicks = excludeSlugs(allArticles, usedSlugs).slice(0, 3)
  for (const a of editorPicks) usedSlugs.add(a.slug)

  const websiteSchema = generateWebsiteSchema()
  const organizationSchema = generateOrganizationSchema()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([websiteSchema, organizationSchema]),
        }}
      />

      <BreakingNewsBanner articles={breaking} />

      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 xl:px-8">
        <AdSlot variant="leaderboard" className="my-4 md:my-6 hidden md:flex" />
      </div>

      {featured && (
        <InView>
          <div className="relative">
            <HeroSection
              featured={featured}
              secondary={secondaryArticles.slice(0, 4)}
            />
            <div className="absolute right-0 top-0 hidden h-full xl:block">
              <div className="sticky top-28 flex h-[calc(100vh-8rem)] w-[260px] items-center justify-center pr-4">
                <AdSlot variant="skyscraper" className="w-full" />
              </div>
            </div>
          </div>
        </InView>
      )}

      {trending.length > 0 && (
        <InView delay={0.1}>
          <TrendingBar articles={trending} />
        </InView>
      )}

      {mostRead.length > 0 && (
        <InView delay={0.15}>
          <MostRead articles={mostRead} />
        </InView>
      )}

      {latestArticles.length > 0 && (
        <InView delay={0.2}>
          <LatestNews articles={latestArticles} />
        </InView>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 xl:px-8">
        <AdSlot variant="billboard" className="my-8 md:my-12 hidden md:flex" />
      </div>

      {allArticles.length > 0 && (
        <InView delay={0.25}>
          <NewsGrid articles={excludeSlugs(allArticles, usedSlugs).slice(0, 6)} />
        </InView>
      )}

      {editorPicks.length > 0 && (
        <InView delay={0.28}>
          <EditorPicks articles={editorPicks} />
        </InView>
      )}

      <InView delay={0.35}>
        <NewsletterSection />
      </InView>
    </>
  )
}
