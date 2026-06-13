export const siteConfig = {
  name: "The Global Lens 365",
  tagline: "Global News Through a Clear Lens",
  description:
    "The Global Lens 365 — Your window to world news. Curated global headlines, analysis, and reports from trusted international sources. Politics, business, technology, science, health, and more.",
  url: "https://thegloballens365.vercel.app",
  locale: "en_US",
  localeFull: "en-US",
  logo: "/images/logo.png",
  logoSvg: "/images/logo.png",
  ogImage: "/images/og-default.jpg",
  publisherType: "NewsMediaOrganization",
  foundingDate: "2026",
  copyright: `2026 The Global Lens 365. All rights reserved. This site aggregates news from various sources for informational purposes. All trademarks and copyrights belong to their respective owners.`,
  fairUseNotice: "This website aggregates news summaries and excerpts from various sources for educational and informational purposes under fair use principles. Full articles are linked to their original publishers.",
  links: {
    twitter: "https://twitter.com/thegloballens365",
    facebook: "https://facebook.com/thegloballens365",
    linkedin: "https://linkedin.com/company/thegloballens365",
    instagram: "https://instagram.com/thegloballens365",
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
  { slug: "pakistan", name: "Pakistan", description: "Latest news and national affairs from Pakistan" },
  { slug: "dunya", name: "World", description: "International news and global affairs" },
  { slug: "siasat", name: "Politics", description: "Political news and analysis" },
  { slug: "karobar", name: "Business", description: "Business, finance and economy" },
  { slug: "technology", name: "Technology", description: "Technology and digital culture" },
  { slug: "khel", name: "Sports", description: "Sports news and competitions" },
  { slug: "sehat", name: "Health", description: "Health and medical news" },
  { slug: "science", name: "Science", description: "Scientific research and discoveries" },
  { slug: "shobiz", name: "Entertainment", description: "Art, entertainment and showbiz" },
  { slug: "mazhab", name: "Religion", description: "Religious news and information" },
  { slug: "taleem", name: "Education", description: "Education and student news" },
  { slug: "mausam", name: "Weather", description: "Latest weather updates" },
  { slug: "crime", name: "Crime", description: "Crime and law enforcement" },
  { slug: "adalat", name: "Justice", description: "Court decisions and legal news" },
  { slug: "baynalaqwami", name: "International", description: "International relations and global news" },
  { slug: "raye", name: "Opinion", description: "Commentary and analysis" },
  { slug: "general", name: "General", description: "General interest news" },
] as const

export const navigation = [
  { label: "Home", href: "/" },
  { label: "Pakistan", href: "/category/pakistan" },
  { label: "World", href: "/category/dunya" },
  { label: "Politics", href: "/category/siasat" },
  { label: "Business", href: "/category/karobar" },
  { label: "Technology", href: "/category/technology" },
  { label: "Sports", href: "/category/khel" },
  { label: "Health", href: "/category/sehat" },
  { label: "Science", href: "/category/science" },
  { label: "Entertainment", href: "/category/shobiz" },
  { label: "Opinion", href: "/category/raye" },
] as const

export const legalLinks = [
  { label: "About Us", href: "/about-us" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Copyright Policy", href: "/copyright-policy" },
  { label: "DMCA Notice", href: "/dmca" },
  { label: "Attribution Policy", href: "/attribution-policy" },
] as const

export const BREAKING_NEWS_INTERVAL = 300000

export const DISCLAIMER_TEXT = "This news is based on information obtained from various sources. For full details, please refer to the original source."
