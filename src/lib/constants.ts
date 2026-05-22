export const siteConfig = {
  name: "پاکستان نیوز",
  tagline: "عوام کی آواز",
  description:
    "پاکستان نیوز پاکستان کا معتبر ترین خبروں کا پلیٹ فارم ہے۔ ہم پاکستان، دنیا، سیاست، کاروبار، ٹیکنالوجی، کھیل اور دیگر شعبوں کی تازہ ترین خبریں پیش کرتے ہیں۔",
  url: "https://pakistan-news.news",
  locale: "ur_PK",
  localeFull: "ur-PK",
  logo: "/images/logo.svg",
  ogImage: "/images/og-default.jpg",
  publisherType: "NewsMediaOrganization",
  foundingDate: "2026",
  links: {
    twitter: "https://twitter.com/pakistannews",
    facebook: "https://facebook.com/pakistannews",
    linkedin: "https://linkedin.com/company/pakistannews",
    instagram: "https://instagram.com/pakistannews",
    rss: "/feed.xml",
  },
  verification: {
    google: "",
    bing: "",
  },
  googleDiscover: {
    maxImageWidth: 1200,
    minImageWidth: 1200,
    preferNewsArticle: true,
  },
}

export const categories = [
  { slug: "pakistan", name: "پاکستان", description: "پاکستان کی تازہ ترین خبریں اور قومی امور" },
  { slug: "dunya", name: "دنیا", description: "بین الاقوامی خبریں اور عالمی امور" },
  { slug: "siasat", name: "سیاست", description: "سیاسی خبریں اور تجزیہ" },
  { slug: "karobar", name: "کاروبار", description: "کاروبار، مالیات اور معیشت" },
  { slug: "technology", name: "ٹیکنالوجی", description: "ٹیکنالوجی اور ڈیجیٹل کلچر" },
  { slug: "khel", name: "کھیل", description: "کھیلوں کی خبریں اور مقابلے" },
  { slug: "sehat", name: "صحت", description: "صحت اور علاج معالجہ" },
  { slug: "science", name: "سائنس", description: "سائنسی تحقیق اور دریافتیں" },
  { slug: "shobiz", name: "شوبز", description: "فن، تفریح اور شوبز" },
  { slug: "mazhab", name: "مذہب", description: "مذہبی خبریں اور معلومات" },
  { slug: "taleem", name: "تعلیم", description: "تعلیم اور طلبہ کی خبریں" },
  { slug: "mausam", name: "موسم", description: "موسم کی تازہ ترین صورتحال" },
  { slug: "crime", name: "کرائم", description: "جرائم اور قانون نافذ کرنے والے ادارے" },
  { slug: "adalat", name: "عدالت", description: "عدالتی فیصلے اور قانونی خبریں" },
  { slug: "baynalaqwami", name: "بین الاقوامی", description: "بین الاقوامی تعلقات اور عالمی خبریں" },
  { slug: "videos", name: "ویڈیوز", description: "خبروں کی ویڈیوز اور خصوصی رپورٹس" },
  { slug: "raye", name: "رائے", description: "تبصرہ اور تجزیہ" },
  { slug: "general", name: "جنرل", description: "عام دلچسپی کی خبریں" },
] as const

export const navigation = [
  { label: "ہوم", href: "/" },
  { label: "پاکستان", href: "/category/pakistan" },
  { label: "دنیا", href: "/category/dunya" },
  { label: "سیاست", href: "/category/siasat" },
  { label: "کاروبار", href: "/category/karobar" },
  { label: "ٹیکنالوجی", href: "/category/technology" },
  { label: "کھیل", href: "/category/khel" },
  { label: "صحت", href: "/category/sehat" },
  { label: "سائنس", href: "/category/science" },
  { label: "شوبز", href: "/category/shobiz" },
  { label: "رائے", href: "/category/raye" },
] as const

export const BREAKING_NEWS_INTERVAL = 300000
