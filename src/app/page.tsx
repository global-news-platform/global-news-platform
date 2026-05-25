import type { Metadata } from "next"

import type { ArticleLink } from "@/types"
import { ArticleCard } from "@/components/article/article-card"
import { BreakingNewsBanner } from "@/components/sections/breaking-news-banner"
import { SectionTitle } from "@/components/common/section-title"

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

function CategorySection({ slug, name, articles }: { slug: string; name: string; articles: ArticleLink[] }) {
  if (articles.length === 0) return null
  const sidebarArticles = articles.slice(1, 4)
  return (
    <section className="border-t border-border py-8 md:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 xl:px-8">
        <SectionTitle label={name} href={`/category/${slug}`} variant="featured" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div className="md:col-span-2 lg:col-span-2">
            <ArticleCard article={articles[0]} variant="featured" />
          </div>
          {sidebarArticles.length > 0 && (
            <div className="lg:col-span-2">
              <div className="grid gap-0 divide-y divide-border/60 border border-border bg-card">
                {sidebarArticles.map((article) => (
                  <div key={article.slug} className="px-4 py-3">
                    <ArticleCard article={article} variant="sidebar" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
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

      {/* BREAKING NEWS TICKER */}
      <BreakingNewsBanner articles={breaking} />

      {/* LARGE HERO SECTION */}
      {featured && (
        <section className="py-4 md:py-6 lg:py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 xl:px-8">
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ArticleCard article={featured} variant="hero" />
              </div>
              <div className="flex flex-col border border-border bg-card p-5 md:p-6">
                <h3 className="mb-4 text-[13px] font-bold uppercase tracking-[0.12em] text-primary">
                  تازہ ترین
                </h3>
                <div className="divide-y divide-border/60">
                  {secondaryArticles.slice(0, 5).map((article) => (
                    <div key={article.slug}>
                      <ArticleCard article={article} variant="sidebar" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TRENDING STRIP */}
      {trending.length > 0 && (
        <section className="border-t border-border bg-muted/30 py-5">
          <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 xl:px-8">
            <div className="mb-3 flex items-center gap-3">
              <span className="rounded bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white">
                مقبول ترین
              </span>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
              {trending.slice(0, 6).map((article, i) => (
                <ArticleCard key={article.slug} article={article} variant="numbered" index={i + 1} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CATEGORY BLOCKS — PAKISTAN FIRST */}
      <CategorySection slug="pakistan" name="پاکستان" articles={pakistanArticles.slice(0, 4)} />
      <CategorySection slug="siasat" name="سیاست" articles={siasatArticles.slice(0, 4)} />
      <CategorySection slug="karobar" name="کاروبار" articles={karobarArticles.slice(0, 4)} />
      <CategorySection slug="dunya" name="دنیا" articles={worldArticles.slice(0, 4)} />
      <CategorySection slug="khel" name="کھیل" articles={khelArticles.slice(0, 4)} />
      <CategorySection slug="technology" name="ٹیکنالوجی" articles={techArticles.slice(0, 4)} />
      <CategorySection slug="sehat" name="صحت" articles={sehatArticles.slice(0, 4)} />
      <CategorySection slug="shobiz" name="شوبز" articles={shobizArticles.slice(0, 4)} />
    </>
  )
}
