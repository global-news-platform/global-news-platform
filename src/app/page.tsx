import type { Metadata } from "next"

import { HeroSection } from "@/components/sections/hero-section"
import { BreakingNewsBanner } from "@/components/sections/breaking-news-banner"
import { LatestNews } from "@/components/sections/latest-news"
import { CategoryGrid } from "@/components/sections/category-grid"
import { OpinionSection } from "@/components/sections/opinion-section"

import {
  getArticleLinks,
  getBreakingArticles,
  getFeaturedArticle,
  getArticlesByCategory,
} from "@/lib/articles"

import {
  generateWebsiteSchema,
  generateOrganizationSchema,
} from "@/lib/seo"

export const dynamic = "force-static"
export const revalidate = 3600

export const metadata: Metadata = {
  title: "پاکستان نیوز — پاکستان کی معتبر آواز",
  description:
    "پاکستان نیوز پاکستان کا معتبر ترین خبروں کا پلیٹ فارم ہے۔ پاکستان، دنیا، سیاست، کاروبار، ٹیکنالوجی، کھیل اور دیگر شعبوں کی تازہ ترین خبریں۔",
  openGraph: {
    title: "پاکستان نیوز — پاکستان کی معتبر آواز",
    description:
      "پاکستان نیوز پاکستان کا معتبر ترین خبروں کا پلیٹ فارم ہے۔ پاکستان، دنیا، سیاست، کاروبار، ٹیکنالوجی، کھیل اور دیگر شعبوں کی تازہ ترین خبریں۔",
  },
}

function excludeSlugs<T extends { slug: string }>(articles: T[], exclude: Set<string>): T[] {
  return articles.filter((a) => !exclude.has(a.slug))
}

export default async function HomePage() {
  const [
    allArticles,
    breaking,
    featured,
    pakistanArticles,
    siasatArticles,
    worldArticles,
    rayeArticles,
  ] = await Promise.all([
    getArticleLinks(),
    getBreakingArticles(),
    getFeaturedArticle(),
    getArticlesByCategory("pakistan"),
    getArticlesByCategory("siasat"),
    getArticlesByCategory("dunya"),
    getArticlesByCategory("raye"),
  ])

  const pakistanArticlesSlice = pakistanArticles.slice(0, 4)
  const siasatArticlesSlice = siasatArticles.slice(0, 4)
  const worldArticlesSlice = worldArticles.slice(0, 4)
  const rayeArticlesSlice = rayeArticles.slice(0, 4)

  const usedSlugs = new Set<string>()
  if (featured) usedSlugs.add(featured.slug)
  for (const a of breaking) usedSlugs.add(a.slug)

  const secondaryArticles = excludeSlugs(allArticles, usedSlugs)

  const latestArticles = excludeSlugs(
    allArticles.filter((a) => !a.breaking),
    usedSlugs,
  ).slice(0, 8)
  for (const a of latestArticles) usedSlugs.add(a.slug)

  const categorySections = [
    { slug: "pakistan", name: "پاکستان", articles: pakistanArticlesSlice },
    { slug: "dunya", name: "دنیا", articles: worldArticlesSlice },
    { slug: "siasat", name: "سیاست", articles: siasatArticlesSlice },
  ]

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
        <HeroSection
          featured={featured}
          secondary={secondaryArticles.slice(0, 4)}
        />
      )}

      {latestArticles.length > 0 && (
        <LatestNews articles={latestArticles} />
      )}

      <CategoryGrid categories={categorySections} />

      {rayeArticlesSlice.length > 0 && (
        <OpinionSection articles={rayeArticlesSlice} />
      )}
    </>
  )
}
