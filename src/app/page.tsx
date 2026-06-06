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
import { siteConfig } from "@/lib/constants"

export const dynamic = "force-static"
export const revalidate = 3600

export const metadata: Metadata = {
  title: `${siteConfig.nameUrdu} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  openGraph: {
    title: `${siteConfig.nameUrdu} — ${siteConfig.tagline}`,
    description: siteConfig.description,
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

function curatedArticle(overrides: Partial<ArticleLink> & { slug?: string; title: string; excerpt: string; categorySlug: string; category: string }): ArticleLink {
  const now = new Date().toISOString()
  return {
    slug: overrides.slug || "curated-" + Math.random().toString(36).substring(2, 8),
    title: overrides.title,
    excerpt: overrides.excerpt,
    category: overrides.category,
    categorySlug: overrides.categorySlug,
    author: overrides.author || "علی احمد",
    authorSlug: overrides.authorSlug || "ali-ahmed",
    publishedAt: overrides.publishedAt || now,
    image: overrides.image || "/images/fallbacks/default.jpg",
    imageAlt: overrides.imageAlt || overrides.title,
    readingTime: overrides.readingTime ?? 3,
    featured: overrides.featured ?? false,
    breaking: overrides.breaking ?? false,
    trending: overrides.trending ?? false,
    isSummary: true,
  }
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

  const featuredHero = allArticles[0] || curatedArticle({
    slug: "pakistan-news-welcome",
    title: "پاکستان نیوز ہب میں خوش آمدید — پاکستان اور دنیا کی تازہ ترین خبریں",
    excerpt: "پاکستان نیوز ہب آپ کے لیے پاکستان اور دنیا بھر سے تازہ ترین خبریں، تجزیہ اور رپورٹس پیش کرتا ہے۔ سیاست، کاروبار، کھیل، ٹیکنالوجی، صحت اور دیگر شعبوں کی مستند کوریج۔",
    category: "پاکستان",
    categorySlug: "pakistan",
    image: "/images/fallbacks/pakistan.jpg",
    imageAlt: "پاکستان نیوز ہب",
    featured: true,
  })

  const allSecondary = sortByEditorialPriority(
    filterQualityArticles(allArticles).filter((a) => !usedSlugs.has(a.slug))
  ).slice(0, 5)

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

      <HeroSection featured={featuredHero} secondary={allSecondary} />

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
