export const siteConfig = {
  name: "Global News",
  tagline: "The World at a Glance",
  description:
    "Global News delivers comprehensive, trusted coverage of world events, business, technology, politics, and culture. Stay informed with our international newsroom.",
  url: "https://globalnews.news",
  locale: "en_US",
  localeFull: "en-US",
  logo: "/images/logo.svg",
  ogImage: "/images/og-default.jpg",
  publisherType: "NewsMediaOrganization",
  foundingDate: "2026",
  links: {
    twitter: "https://twitter.com/globalnews",
    facebook: "https://facebook.com/globalnews",
    linkedin: "https://linkedin.com/company/globalnews",
    instagram: "https://instagram.com/globalnews",
    rss: "/feed.xml",
  },
  verification: {
    google: "", // Insert Google Search Console ID
    bing: "",   // Insert Bing Webmaster Tools ID
  },
  googleDiscover: {
    maxImageWidth: 1200,
    minImageWidth: 1200,
    preferNewsArticle: true,
  },
}

export const categories = [
  { slug: "world", name: "World", description: "International news and global affairs" },
  { slug: "politics", name: "Politics", description: "Political news and analysis" },
  { slug: "business", name: "Business", description: "Markets, finance, and economy" },
  { slug: "technology", name: "Technology", description: "Tech innovation and digital culture" },
  { slug: "science", name: "Science", description: "Scientific discoveries and research" },
  { slug: "health", name: "Health", description: "Healthcare and wellness" },
  { slug: "climate", name: "Climate", description: "Climate change and environment" },
  { slug: "culture", name: "Culture", description: "Arts, entertainment, and society" },
  { slug: "sports", name: "Sports", description: "Athletics and sporting events" },
  { slug: "opinion", name: "Opinion", description: "Commentary and analysis" },
  { slug: "general", name: "General", description: "General news and coverage" },
] as const

export const navigation = [
  { label: "Home", href: "/" },
  { label: "World", href: "/category/world" },
  { label: "Politics", href: "/category/politics" },
  { label: "Business", href: "/category/business" },
  { label: "Technology", href: "/category/technology" },
  { label: "Science", href: "/category/science" },
  { label: "Health", href: "/category/health" },
  { label: "Climate", href: "/category/climate" },
  { label: "Culture", href: "/category/culture" },
  { label: "Sports", href: "/category/sports" },
  { label: "Opinion", href: "/category/opinion" },
] as const

export const BREAKING_NEWS_INTERVAL = 300000
