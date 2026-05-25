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
} from "@/lib/articles"
import { hasSufficientUrdu } from "@/lib/urdu-headlines"

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

function hasValidImage(a: ArticleLink): boolean {
  return !!(a.image && typeof a.image === "string" && (a.image.startsWith("/") || a.image.startsWith("http")))
}

function filterQualityArticles(articles: ArticleLink[]): ArticleLink[] {
  return articles.filter((a) => {
    if (!a.title || a.title.length < 8) return false
    if (!hasSufficientUrdu(a.title)) return false
    return true
  })
}

const CATEGORY_PRIORITY: Record<string, number> = {
  pakistan: 0,
  siasat: 1,
  karobar: 2,
  dunya: 3,
  khel: 4,
  technology: 5,
  sehat: 6,
  shobiz: 7,
}

function sortByEditorialPriority(articles: ArticleLink[]): ArticleLink[] {
  return [...articles].sort((a, b) => {
    const aCat = CATEGORY_PRIORITY[a.categorySlug] ?? 99
    const bCat = CATEGORY_PRIORITY[b.categorySlug] ?? 99
    if (aCat !== bCat) return aCat - bCat
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })
}

export default async function HomePage() {
  const [
    allArticles,
    breaking,
    featured,
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

  const qualitySecondary = filterQualityArticles(allArticles)
  const secondaryArticles = sortByEditorialPriority(qualitySecondary).filter((a) => !usedSlugs.has(a.slug))

  const validFeatured = featured && hasValidImage(featured)
    ? featured
    : allArticles.find((a) => hasValidImage(a)) || null

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

      {validFeatured ? (
        <HeroSection featured={validFeatured} secondary={secondaryArticles} />
      ) : (
        <div className="w-full py-8 px-4 text-center text-muted-foreground text-sm">
          کوئی نمایاں خبر دستیاب نہیں
        </div>
      )}

      <CategoryGrid
        categories={[
          { slug: "pakistan", name: "پاکستان", articles: filterQualityArticles(pakistanArticles) },
          { slug: "dunya", name: "دنیا", articles: filterQualityArticles(worldArticles) },
          { slug: "siasat", name: "سیاست", articles: filterQualityArticles(siasatArticles) },
          { slug: "karobar", name: "کاروبار", articles: filterQualityArticles(karobarArticles) },
        ]}
      />

      <CategoryGrid
        categories={[
          { slug: "khel", name: "کھیل", articles: filterQualityArticles(khelArticles) },
          { slug: "technology", name: "ٹیکنالوجی", articles: filterQualityArticles(techArticles) },
          { slug: "sehat", name: "صحت", articles: filterQualityArticles(sehatArticles) },
          { slug: "shobiz", name: "شوبز", articles: filterQualityArticles(shobizArticles) },
        ]}
      />
    </>
  )
}
