import type { Metadata } from "next"
import type { ArticleLink } from "@/types"

import { BreakingNewsBanner } from "@/components/sections/breaking-news-banner"
import { HeroSection } from "@/components/sections/hero-section"
import { CategoryGrid } from "@/components/sections/category-grid"
import { InView } from "@/components/common/in-view"

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
import { siteConfig } from "@/lib/constants"

export const dynamic = "force-static"
export const revalidate = 3600

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: `${siteConfig.name} — ${siteConfig.description}`,
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
}

function hasValidImage(a: ArticleLink): boolean {
  return !!(a.image && typeof a.image === "string" && (a.image.startsWith("/") || a.image.startsWith("http")))
}

function filterQualityArticles(articles: ArticleLink[]): ArticleLink[] {
  return articles.filter((a) => {
    if (!a.title || a.title.length < 8) return false
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
    author: overrides.author || "Ali Ahmed",
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
    scienceArticles,
    taleemArticles,
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
    getArticlesByCategory("science"),
    getArticlesByCategory("taleem"),
  ])

  const usedSlugs = new Set<string>()
  if (featured) usedSlugs.add(featured.slug)
  for (const a of breaking) usedSlugs.add(a.slug)

  const allSecondary = sortByEditorialPriority(
    filterQualityArticles(allArticles).filter((a) => !usedSlugs.has(a.slug))
  ).slice(0, 5)

  for (const a of allSecondary) usedSlugs.add(a.slug)

  function dedupe(articles: ArticleLink[]): ArticleLink[] {
    return filterQualityArticles(articles).filter((a) => !usedSlugs.has(a.slug))
  }

  const featuredHero = allArticles[0] || curatedArticle({
    slug: "welcome-to-global-lens-365",
    title: "Welcome to The Global Lens 365 — Your Window to World News",
    excerpt: "Curated global headlines, analysis, and reports from trusted international sources. Stay informed with breaking news from Pakistan and around the world.",
    category: "Pakistan",
    categorySlug: "pakistan",
    image: "",
    imageAlt: "The Global Lens 365",
    featured: true,
  })

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

      <BreakingNewsBanner articles={filterQualityArticles(allArticles).slice(0, 40)} />

      <HeroSection featured={featuredHero} secondary={allSecondary} />

      <InView>
        <CategoryGrid
          categories={[
            { slug: "pakistan", name: "Pakistan", articles: dedupe(pakistanArticles) },
            { slug: "dunya", name: "World", articles: dedupe(worldArticles) },
            { slug: "siasat", name: "Politics", articles: dedupe(siasatArticles) },
            { slug: "karobar", name: "Business", articles: dedupe(karobarArticles) },
          ]}
        />
      </InView>

      <div className="relative mx-auto max-w-7xl px-3 sm:px-4 lg:px-5">
        <div className="section-divider" />
        <div className="absolute left-1/2 -translate-x-1/2 -top-[3px] w-20 h-[3px] bg-gradient-to-r from-transparent via-accent/60 to-transparent rounded-full animate-pulse-soft" />
      </div>

      <InView delay={0.1}>
        <CategoryGrid
          categories={[
            { slug: "khel", name: "Sports", articles: dedupe(khelArticles) },
            { slug: "technology", name: "Technology", articles: dedupe(techArticles) },
            { slug: "sehat", name: "Health", articles: dedupe(sehatArticles) },
            { slug: "shobiz", name: "Showbiz", articles: dedupe(shobizArticles) },
          ]}
        />
      </InView>

      {(dedupe(scienceArticles).length > 0 || dedupe(taleemArticles).length > 0) && (
        <>
          <div className="relative mx-auto max-w-7xl px-3 sm:px-4 lg:px-5">
            <div className="section-divider" />
            <div className="absolute left-1/2 -translate-x-1/2 -top-[3px] w-20 h-[3px] bg-gradient-to-r from-transparent via-accent/60 to-transparent rounded-full animate-pulse-soft" />
          </div>

          <InView delay={0.2}>
            <CategoryGrid
              categories={[
                ...(dedupe(scienceArticles).length > 0 ? [{ slug: "science", name: "Science", articles: dedupe(scienceArticles) }] : []),
                ...(dedupe(taleemArticles).length > 0 ? [{ slug: "taleem", name: "Education", articles: dedupe(taleemArticles) }] : []),
              ]}
            />
          </InView>
        </>
      )}
    </>
  )
}
