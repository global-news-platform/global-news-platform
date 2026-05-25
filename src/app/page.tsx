import type { Metadata } from "next"
import type { ArticleLink } from "@/types"

import { BreakingNewsBanner } from "@/components/sections/breaking-news-banner"
import { HeroSection } from "@/components/sections/hero-section"
import { CategoryGrid } from "@/components/sections/category-grid"

import {
  getArticleLinks,
  getBreakingArticles,
  getFeaturedArticle,
  getArticlesByCategory,
  getTrendingArticles,
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

const PRIORITY_CATEGORIES = new Set(["pakistan", "siasat", "karobar", "khel", "technology", "sehat", "shobiz"])

function sortByPriority(articles: ArticleLink[]): ArticleLink[] {
  return [...articles].sort((a, b) => {
    const aPrio = PRIORITY_CATEGORIES.has(a.categorySlug) ? 0 : 1
    const bPrio = PRIORITY_CATEGORIES.has(b.categorySlug) ? 0 : 1
    if (aPrio !== bPrio) return aPrio - bPrio
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })
}

export default async function HomePage() {
  const [
    allArticles,
    breaking,
    featured,
    trending,
    pakistanArticles,
    siasatArticles,
    worldArticles,
    karobarArticles,
    techArticles,
    khelArticles,
    sehatArticles,
    shobizArticles,
  ] = await Promise.all([
    getArticleLinks(),
    getBreakingArticles(),
    getFeaturedArticle(),
    getTrendingArticles(),
    getArticlesByCategory("pakistan"),
    getArticlesByCategory("siasat"),
    getArticlesByCategory("dunya"),
    getArticlesByCategory("karobar"),
    getArticlesByCategory("technology"),
    getArticlesByCategory("khel"),
    getArticlesByCategory("sehat"),
    getArticlesByCategory("shobiz"),
  ])

  const usedSlugs = new Set<string>()
  if (featured) usedSlugs.add(featured.slug)
  for (const a of breaking) usedSlugs.add(a.slug)

  const secondaryArticles = excludeSlugs(sortByPriority(allArticles), usedSlugs)

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

      {/* BREAKING TICKER */}
      <BreakingNewsBanner articles={breaking} />

      {/* HERO — massive lead story + top stories sidebar */}
      {featured && (
        <HeroSection featured={featured} secondary={secondaryArticles} />
      )}

      {/* DIVIDER */}
      <div className="mx-auto max-w-full px-3 md:px-4 lg:px-5">
        <hr className="border-border/20 my-0" />
      </div>

      {/* CATEGORY SECTIONS — URDU DENSE STYLE */}
      <CategoryGrid
        categories={[
          { slug: "pakistan", name: "پاکستان", articles: pakistanArticles },
          { slug: "dunya", name: "دنیا", articles: worldArticles },
          { slug: "siasat", name: "سیاست", articles: siasatArticles },
          { slug: "karobar", name: "کاروبار", articles: karobarArticles },
        ]}
      />

      <div className="mx-auto max-w-full px-3 md:px-4 lg:px-5">
        <hr className="border-border/20 my-0" />
      </div>

      <CategoryGrid
        categories={[
          { slug: "khel", name: "کھیل", articles: khelArticles },
          { slug: "technology", name: "ٹیکنالوجی", articles: techArticles },
          { slug: "sehat", name: "صحت", articles: sehatArticles },
          { slug: "shobiz", name: "شوبز", articles: shobizArticles },
        ]}
      />
    </>
  )
}
