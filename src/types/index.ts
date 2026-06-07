export interface ArticleSource {
  name: string
  url: string
  canonicalUrl?: string
  logo?: string
}

export interface Category {
  slug: string
  name: string
  nameEn: string
  description: string
  descriptionEn?: string
  color?: string
}

export interface Author {
  slug: string
  name: string
  avatar?: string
  bio?: string
  role?: string
  twitter?: string
  email?: string
}

export interface ArticleMeta {
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  categorySlug: string
  author: string
  authorSlug: string
  publishedAt: string
  updatedAt?: string
  image?: string
  imageAlt?: string
  tags: string[]
  readingTime: number
  featured: boolean
  breaking: boolean
  trending: boolean
  source?: ArticleSource
  attribution?: string
  isSummary: boolean
}

export interface ArticleFrontmatter {
  title: string
  excerpt: string
  category: string
  author: string
  publishedAt: string
  updatedAt?: string
  image?: string
  imageAlt?: string
  tags: string[]
  featured?: boolean
  breaking?: boolean
  trending?: boolean
  sourceName?: string
  sourceUrl?: string
  canonicalUrl?: string
  attribution?: string
  isSummary?: boolean
}

export interface ArticleLink {
  slug: string
  title: string
  excerpt: string
  category: string
  categorySlug: string
  author: string
  authorSlug: string
  publishedAt: string
  image?: string
  imageAlt?: string
  readingTime: number
  featured: boolean
  breaking: boolean
  trending: boolean
  source?: ArticleSource
  isSummary: boolean
}
