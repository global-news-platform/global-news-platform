import type { Metadata } from "next"

import { HeroSection } from "@/components/sections/hero-section"
import { InView } from "@/components/common/in-view"
import { BreakingNewsBanner } from "@/components/sections/breaking-news-banner"
import { TrendingBar } from "@/components/sections/trending-bar"
import { MostRead } from "@/components/sections/most-read"
import { LatestNews } from "@/components/sections/latest-news"
import { CategoryGrid } from "@/components/sections/category-grid"
import { OpinionSection } from "@/components/sections/opinion-section"
import { EditorPicks } from "@/components/sections/editor-picks"
import { NewsletterSection } from "@/components/sections/newsletter-section"
import { GlobalAffairs } from "@/components/sections/global-affairs"
import { TechnologySpotlight } from "@/components/sections/technology-spotlight"
import { BusinessMarkets } from "@/components/sections/business-markets"

import {
  getArticleLinks,
  getBreakingArticles,
  getFeaturedArticle,
  getMostReadArticles,
  getTrendingArticles,
  getArticlesGroupedByCategory,
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

export default function HomePage() {
  const articles = getArticleLinks()
  const breaking = getBreakingArticles()
  const featured = getFeaturedArticle()
  const trending = getTrendingArticles()
  const mostRead = getMostReadArticles(4)

  const secondaryArticles = articles.filter(
    (a) => a.slug !== featured?.slug,
  )

  const categorySections = getArticlesGroupedByCategory(
    ["world", "business", "technology", "climate"],
    4,
  )

  const latestArticles = secondaryArticles
    .filter((a) => !a.breaking)
    .slice(0, 8)

  const opinionArticles = articles.filter(
    (a) => a.categorySlug === "opinion",
  )
  const editorPicks = articles.slice(0, 3)
  const worldArticles = articles.filter(
    (a) => a.categorySlug === "world",
  )
  const techArticles = articles.filter(
    (a) => a.categorySlug === "technology",
  )
  const businessArticles = articles.filter(
    (a) => a.categorySlug === "business",
  )

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

      {featured && (
        <InView>
          <HeroSection
            featured={featured}
            secondary={secondaryArticles.slice(0, 3)}
          />
        </InView>
      )}

      {trending.length > 0 && (
        <InView delay={0.1}>
          <TrendingBar articles={trending} />
        </InView>
      )}

      {worldArticles.length > 0 && (
        <InView delay={0.12}>
          <GlobalAffairs articles={worldArticles} />
        </InView>
      )}

      {mostRead.length > 0 && (
        <InView delay={0.15}>
          <MostRead articles={mostRead} />
        </InView>
      )}

      {techArticles.length > 0 && (
        <InView delay={0.18}>
          <TechnologySpotlight articles={techArticles} />
        </InView>
      )}

      {categorySections.length > 0 && (
        <InView delay={0.2}>
          <CategoryGrid categories={categorySections} />
        </InView>
      )}

      {businessArticles.length > 0 && (
        <InView delay={0.22}>
          <BusinessMarkets articles={businessArticles} />
        </InView>
      )}

      {latestArticles.length > 0 && (
        <InView delay={0.25}>
          <LatestNews articles={latestArticles} />
        </InView>
      )}

      {editorPicks.length > 0 && (
        <InView delay={0.28}>
          <EditorPicks articles={editorPicks} />
        </InView>
      )}

      {opinionArticles.length > 0 && (
        <InView delay={0.3}>
          <OpinionSection articles={opinionArticles} />
        </InView>
      )}

      <InView delay={0.35}>
        <NewsletterSection />
      </InView>
    </>
  )
}
