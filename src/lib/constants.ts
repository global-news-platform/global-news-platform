export const siteConfig = {
  name: "Pakistan News Hub",
  nameUrdu: "پاکستان نیوز ہب",
  tagline: "پاکستان اور دنیا کی تازہ ترین خبریں",
  taglineEn: "Pakistan's Trusted News Source",
  description:
    "Pakistan News Hub — پاکستان اور دنیا بھر سے تازہ ترین خبریں، تجزیہ اور رپورٹس۔ سیاست، کاروبار، کھیل، ٹیکنالوجی، صحت اور دیگر شعبوں کی مستند کوریج۔",
  descriptionEn:
    "Pakistan News Hub — Latest news, analysis and reports from Pakistan and around the world. Authoritative coverage of politics, business, sports, technology, health and more.",
  url: "https://pakistan-news.news",
  locale: "ur_PK",
  localeFull: "ur-PK",
  logo: "/images/logo.svg",
  ogImage: "/images/og-default.jpg",
  publisherType: "NewsMediaOrganization",
  foundingDate: "2026",
  copyright: `2001-2026 Pakistan News Hub. All rights reserved. This site aggregates news from various sources for informational purposes. All trademarks and copyrights belong to their respective owners.`,
  fairUseNotice: "This website aggregates news summaries and excerpts from various sources for educational and informational purposes under fair use principles. Full articles are linked to their original publishers.",
  links: {
    twitter: "https://twitter.com/pakistannewshub",
    facebook: "https://facebook.com/pakistannewshub",
    linkedin: "https://linkedin.com/company/pakistannewshub",
    instagram: "https://instagram.com/pakistannewshub",
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
  { slug: "pakistan", name: "پاکستان", nameEn: "Pakistan", description: "پاکستان کی تازہ ترین خبریں اور قومی امور", descriptionEn: "Latest news and national affairs from Pakistan" },
  { slug: "dunya", name: "دنیا", nameEn: "World", description: "بین الاقوامی خبریں اور عالمی امور", descriptionEn: "International news and global affairs" },
  { slug: "siasat", name: "سیاست", nameEn: "Politics", description: "سیاسی خبریں اور تجزیہ", descriptionEn: "Political news and analysis" },
  { slug: "karobar", name: "کاروبار", nameEn: "Business", description: "کاروبار، مالیات اور معیشت", descriptionEn: "Business, finance and economy" },
  { slug: "technology", name: "ٹیکنالوجی", nameEn: "Technology", description: "ٹیکنالوجی اور ڈیجیٹل کلچر", descriptionEn: "Technology and digital culture" },
  { slug: "khel", name: "کھیل", nameEn: "Sports", description: "کھیلوں کی خبریں اور مقابلے", descriptionEn: "Sports news and competitions" },
  { slug: "sehat", name: "صحت", nameEn: "Health", description: "صحت اور علاج معالجہ", descriptionEn: "Health and medical news" },
  { slug: "science", name: "سائنس", nameEn: "Science", description: "سائنسی تحقیق اور دریافتیں", descriptionEn: "Scientific research and discoveries" },
  { slug: "shobiz", name: "شوبز", nameEn: "Entertainment", description: "فن، تفریح اور شوبز", descriptionEn: "Art, entertainment and showbiz" },
  { slug: "mazhab", name: "مذہب", nameEn: "Religion", description: "مذہبی خبریں اور معلومات", descriptionEn: "Religious news and information" },
  { slug: "taleem", name: "تعلیم", nameEn: "Education", description: "تعلیم اور طلبہ کی خبریں", descriptionEn: "Education and student news" },
  { slug: "mausam", name: "موسم", nameEn: "Weather", description: "موسم کی تازہ ترین صورتحال", descriptionEn: "Latest weather updates" },
  { slug: "crime", name: "کرائم", nameEn: "Crime", description: "جرائم اور قانون نافذ کرنے والے ادارے", descriptionEn: "Crime and law enforcement" },
  { slug: "adalat", name: "عدالت", nameEn: "Justice", description: "عدالتی فیصلے اور قانونی خبریں", descriptionEn: "Court decisions and legal news" },
  { slug: "baynalaqwami", name: "بین الاقوامی", nameEn: "International", description: "بین الاقوامی تعلقات اور عالمی خبریں", descriptionEn: "International relations and global news" },
  { slug: "raye", name: "رائے", nameEn: "Opinion", description: "تبصرہ اور تجزیہ", descriptionEn: "Commentary and analysis" },
  { slug: "general", name: "جنرل", nameEn: "General", description: "عام دلچسپی کی خبریں", descriptionEn: "General interest news" },
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

export const legalLinks = [
  { label: "ہمارے بارے میں", href: "/about-us", labelEn: "About Us" },
  { label: "رازداری کی پالیسی", href: "/privacy-policy", labelEn: "Privacy Policy" },
  { label: "خدمات کی شرائط", href: "/terms-of-service", labelEn: "Terms of Service" },
  { label: "کاپی رائٹ پالیسی", href: "/copyright-policy", labelEn: "Copyright Policy" },
  { label: "ڈی ایم سی اے نوٹس", href: "/dmca", labelEn: "DMCA Notice" },
  { label: "انتساب کی پالیسی", href: "/attribution-policy", labelEn: "Attribution Policy" },
] as const

export const BREAKING_NEWS_INTERVAL = 300000

export const DISCLAIMER_TEXT = "یہ خبر مختلف ذرائع سے حاصل کردہ معلومات پر مبنی ہے۔ مکمل تفصیلات کے لیے براہ کرم اصل ماخذ ملاحظہ کریں۔"
export const DISCLAIMER_TEXT_EN = "This news is based on information obtained from various sources. For full details, please refer to the original source."
