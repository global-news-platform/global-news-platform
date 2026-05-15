import type { Metadata } from "next"
import dynamic from "next/dynamic"

import { HeroSection } from "@/components/sections/hero-section"
import { InView } from "@/components/common/in-view"

const BreakingNewsBanner = dynamic(() =>
  import("@/components/sections/breaking-news-banner").then((m) => m.BreakingNewsBanner),
  { ssr: true },
)

const TrendingBar = dynamic(() =>
  import("@/components/sections/trending-bar").then((m) => m.TrendingBar),
  { ssr: true },
)

const CategoryGrid = dynamic(() =>
  import("@/components/sections/category-grid").then((m) => m.CategoryGrid),
  { ssr: true },
)

const MostRead = dynamic(() =>
  import("@/components/sections/most-read").then((m) => m.MostRead),
  { ssr: true },
)

const LatestNews = dynamic(() =>
  import("@/components/sections/latest-news").then((m) => m.LatestNews),
  { ssr: true },
)

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

      {mostRead.length > 0 && (
        <InView delay={0.15}>
          <MostRead articles={mostRead} />
        </InView>
      )}

      {categorySections.length > 0 && (
        <InView delay={0.2}>
          <CategoryGrid categories={categorySections} />
        </InView>
      )}

      {latestArticles.length > 0 && (
        <InView delay={0.25}>
          <LatestNews articles={latestArticles} />
        </InView>
      )}
    </>
  )
}
