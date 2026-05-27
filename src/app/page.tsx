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

  const featuredHero = curatedArticle({
    slug: "iran-war-escalation",
    title: "ایران میں جنگ کے خطرات میں اضافہ",
    excerpt: "امریکی صدر ڈونلڈ ٹرمپ کے حالیہ بیانات کے بعد خطے میں کشیدگی بڑھ گئی ہے اور ایرانی افواج کو ہائی الرٹ کر دیا گیا ہے۔",
    category: "دنیا",
    categorySlug: "dunya",
    image: "/images/articles/deal-with-us-not-imminent-iran-says--h0ynt0.jpg",
    imageAlt: "ایران میں بڑھتی ہوئی کشیدگی",
    featured: true,
    breaking: true,
  })

  const sidebarArticles: ArticleLink[] = [
    curatedArticle({
      slug: "trump-justice-dept-legal-battle",
      title: "امریکی محکمہ انصاف اور صدر ٹرمپ کے درمیان نئی قانونی جنگ کا آغاز",
      excerpt: "واشنگٹن ڈی سی میں وفاقی عدالت میں دائر نئے مقدمے میں صدر ٹرمپ کی انتظامیہ پر الزام عائد کیا گیا ہے کہ انہوں نے محکمہ انصاف کو سیاسی مقاصد کے لیے استعمال کیا۔",
      category: "سیاست",
      categorySlug: "siasat",
      image: "/images/fallbacks/politics.jpg",
    }),
    curatedArticle({
      slug: "georgia-governor-election",
      title: "جارجیا گورنر الیکشن: انتخابی نتائج کو مسترد کرنے والا امیدوار سب سے آگے",
      excerpt: "جارجیا کے گورنر الیکشن میں متنازع امیدوار نے انتخابی نتائج کو چیلنج کرنے کے باوجود ابتدائی پولنگ میں نمایاں برتری حاصل کر لی ہے۔",
      category: "سیاست",
      categorySlug: "siasat",
      image: "/images/fallbacks/politics.jpg",
    }),
    curatedArticle({
      slug: "upcoming-election-political-future",
      title: "آئندہ آنے والے انتخابات میں سیاسی جماعتوں کا مستقبل کیا ہوگا؟",
      excerpt: "ماہرین کے مطابق موجودہ سیاسی صورتحال میں کچھ بڑی جماعتوں کو آئندہ انتخابات میں شدید چیلنجز کا سامنا کرنا پڑ سکتا ہے۔",
      category: "سیاست",
      categorySlug: "siasat",
      image: "/images/fallbacks/politics.jpg",
    }),
    curatedArticle({
      slug: "trump-israel-iran-geopolitics",
      title: "ٹرمپ، اسرائیل اور ایران: مشرقِ وسطیٰ میں بدلتی ہوئی نئی جیو پولیٹیکل صورتحال",
      excerpt: "امریکی صدر کی ایران کے ساتھ مذاکرات اور اسرائیل کے ساتھ تعلقات میں تبدیلیوں نے مشرقِ وسطیٰ میں طاقت کے توازن کو متاثر کیا ہے۔",
      category: "دنیا",
      categorySlug: "dunya",
      image: "/images/fallbacks/world.jpg",
    }),
    curatedArticle({
      slug: "ai-digital-courts",
      title: "مصنوعی ذہانت اور عدالتی نظام: ملک بھر کی عدالتوں میں نئے ڈیجیٹل قوانین کا نفاذ",
      excerpt: "عدلیہ میں مصنوعی ذہانت کے استعمال سے متعلق نئے قوانین ملک بھر کی عدالتوں میں نافذ کر دیے گئے ہیں جس سے قانونی کارروائیوں میں تیزی آئے گی۔",
      category: "ٹیکنالوجی",
      categorySlug: "technology",
      image: "/images/fallbacks/technology.jpg",
    }),
  ]

  const qualitySecondary = filterQualityArticles(allArticles)
  const dynamicSecondary = sortByEditorialPriority(qualitySecondary).filter((a) => !usedSlugs.has(a.slug))
  const allSecondary = [...sidebarArticles, ...dynamicSecondary].slice(0, 5)

  const karobarCurated = curatedArticle({
    slug: "crude-oil-iran-peace",
    title: "عالمی مارکیٹ میں خام تیل کی قیمتیں اور ایران امن معاہدہ کا مستقبل",
    excerpt: "خطے میں بڑھتی ہوئی کشیدگی کے باعث خام تیل کی قیمتوں میں نمایاں اضافہ دیکھنے میں آیا ہے۔ ماہرین کے مطابق ایران امن معاہدہ طے پانے کی صورت میں قیمتوں میں استحکام آ سکتا ہے۔",
    category: "کاروبار",
    categorySlug: "karobar",
    image: "/images/articles/global-oil-price-rises-after-u-s-strikes-in-iran-cloud-peace-deal--mj22x9.jpg",
    imageAlt: "خام تیل کی قیمتوں میں اضافہ",
  })

  const khelCurated = curatedArticle({
    slug: "data-league-team-analysis",
    title: "ڈیٹا لیگ کی تمام ٹیموں کی کارکردگی کا تفصیلی جائزہ",
    excerpt: "علی احمد کی خصوصی رپورٹ: ڈیٹا لیگ میں شامل تمام ٹیموں کی کارکردگی، کمزوریوں اور مضبوط پہلوؤں کا گہرائی سے تجزیہ پیش کیا جا رہا ہے۔",
    category: "کھیل",
    categorySlug: "khel",
    author: "علی احمد",
    authorSlug: "ali-ahmed",
    image: "/images/articles/spurs-admit-football-success-was-not-driving-decisions--3t0inl.jpg",
    imageAlt: "ڈیٹا لیگ ٹیموں کی کارکردگی",
  })

  const techCurated = curatedArticle({
    slug: "ai-job-market-opportunities",
    title: "مصنوعی ذہانت (A.I) کا عروج اور مارکیٹ میں ملازمتوں کے نئے مواقع",
    excerpt: "مصنوعی ذہانت کے تیزی سے پھیلاؤ نے سائبر سیکیورٹی کے شعبے میں نئی ملازمتوں کے دروازے کھول دیے ہیں۔ ماہرین کے مطابق اگلے پانچ سالوں میں اس شعبے میں پچاس فیصد سے زائد اضافہ متوقع ہے۔",
    category: "ٹیکنالوجی",
    categorySlug: "technology",
    image: "/images/fallbacks/technology.jpg",
    imageAlt: "مصنوعی ذہانت اور روزگار",
  })

  const sehatCurated = curatedArticle({
    slug: "us-new-viral-crisis",
    title: "امریکہ میں نئے وائرل بحران کا خدشہ، محکمہ صحت کی جانب سے الرٹ جاری",
    excerpt: "امریکی محکمہ صحت نے ایک نئے ممکنہ وائرل بحران کے پیش نظر ہنگامی الرٹ جاری کر دیا ہے۔ ماہرین صحت نے شہریوں سے احتیاطی تدابیر اپنانے کی اپیل کی ہے۔",
    category: "صحت",
    categorySlug: "sehat",
    image: "/images/articles/one-and-done-heart-disease-prevention-scientists-show-it-may-be-possible--5f3zox.jpg",
    imageAlt: "امریکہ میں وائرل بحران",
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

      <BreakingNewsBanner articles={breaking} />

      <HeroSection featured={featuredHero} secondary={allSecondary} />

      <CategoryGrid
        categories={[
          { slug: "pakistan", name: "پاکستان", articles: filterQualityArticles(pakistanArticles) },
          { slug: "dunya", name: "دنیا", articles: filterQualityArticles(worldArticles) },
          { slug: "siasat", name: "سیاست", articles: filterQualityArticles(siasatArticles) },
          { slug: "karobar", name: "کاروبار", articles: [karobarCurated, ...filterQualityArticles(karobarArticles)] },
        ]}
      />

      <CategoryGrid
        categories={[
          { slug: "khel", name: "کھیل", articles: [khelCurated, ...filterQualityArticles(khelArticles)] },
          { slug: "technology", name: "ٹیکنالوجی", articles: [techCurated, ...filterQualityArticles(techArticles)] },
          { slug: "sehat", name: "صحت", articles: [sehatCurated, ...filterQualityArticles(sehatArticles)] },
          { slug: "shobiz", name: "شوبز", articles: filterQualityArticles(shobizArticles) },
        ]}
      />
    </>
  )
}
