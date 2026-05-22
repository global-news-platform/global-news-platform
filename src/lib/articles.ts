import fs from "fs"
import path from "path"
import readingTime from "reading-time"

import type { ArticleMeta, ArticleLink, Author } from "@/types"
import { authors } from "@/data/authors/authors"
import { categories } from "@/lib/constants"
import { slugify } from "@/lib/utils"
import { getImage } from "@/lib/getImage"
import {
  sanitizeTitle,
  sanitizeBody,
  validateArticleContent,
  deduplicateArticles,
  safeString,
  safeNumber,
} from "@/lib/sanitize"
import {
  generateUrduHeadline,
  generateUrduExcerpt,
  categorizeEnglishCategory,
} from "@/lib/urdu-headlines"
import { removeEnglishFromUrdu } from "@/lib/urdu-ai"

const MAX_DAILY_ARTICLES = 100

const articlesDir = path.join(process.cwd(), "src/data/articles")

let _allArticlesCache: ArticleMeta[] | null = null
let _slugCache: string[] | null = null

const _urduTitleCache = new Map<string, string>()
const _urduExcerptCache = new Map<string, string>()

export function getArticleSlugs(): string[] {
  if (_slugCache) return _slugCache
  if (!fs.existsSync(articlesDir)) return []
  const allSlugs = fs
    .readdirSync(articlesDir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => f.replace(/\.(md|mdx)$/, ""))
    .sort((a, b) => {
      const baseA = a.replace(/--[a-f0-9]+$/i, "")
      const baseB = b.replace(/--[a-f0-9]+$/i, "")
      if (baseA !== baseB) return baseA.localeCompare(baseB)
      return a.length - b.length
    })
  const seen = new Set<string>()
  _slugCache = allSlugs.filter((slug) => {
    const base = slug.replace(/--[a-f0-9]+$/i, "")
    if (seen.has(base)) return false
    seen.add(base)
    return true
  })
  return _slugCache
}

function parseFrontmatter(content: string): {
  frontmatter: Record<string, unknown>
  body: string
} {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
  if (!match) return { frontmatter: {}, body: content }

  const frontmatter: Record<string, unknown> = {}
  const lines = match[1].split("\n")

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const colonIndex = trimmed.indexOf(":")
    if (colonIndex === -1) continue
    const key = trimmed.slice(0, colonIndex).trim()
    const value: string = trimmed.slice(colonIndex + 1).trim()

    if (!key) continue

    if (value.startsWith("[") && value.endsWith("]")) {
      try {
        frontmatter[key] = JSON.parse(value.replace(/'/g, '"'))
      } catch {
        frontmatter[key] = value
      }
    } else if (value.toLowerCase() === "null") {
      frontmatter[key] = null
    } else if (value.toLowerCase() === "true") {
      frontmatter[key] = true
    } else if (value.toLowerCase() === "false") {
      frontmatter[key] = false
    } else if (value.startsWith('"') && value.endsWith('"')) {
      frontmatter[key] = value.slice(1, -1).replace(/\\"/g, '"')
    } else {
      frontmatter[key] = value
    }
  }

  return { frontmatter, body: match[2] }
}

export async function getArticleBySlug(slug: string): Promise<ArticleMeta | null> {
  for (const ext of [".mdx", ".md"]) {
    const filePath = path.join(articlesDir, `${slug}${ext}`)
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8")
      const { frontmatter, body } = parseFrontmatter(content)
      const rt = readingTime(body)

      const rawTitle = safeString(frontmatter.title, "")
      const sanitizedTitle = sanitizeTitle(rawTitle)

      const validation = validateArticleContent({
        title: sanitizedTitle || rawTitle,
        excerpt: safeString(frontmatter.excerpt),
        body,
      })

      if (!validation.valid) return null
      if (!sanitizedTitle) return null

      let urduTitle: string
      let urduExcerpt: string

      const cacheKey = slug
      if (_urduTitleCache.has(cacheKey)) {
        urduTitle = _urduTitleCache.get(cacheKey)!
        urduExcerpt = _urduExcerptCache.get(cacheKey)!
      } else {
        urduTitle = await generateUrduHeadline(sanitizedTitle)
        urduExcerpt = await generateUrduExcerpt(urduTitle, safeString(frontmatter.excerpt))
        _urduTitleCache.set(cacheKey, urduTitle)
        _urduExcerptCache.set(cacheKey, urduExcerpt)
      }

      const sanitizedBody = removeEnglishFromUrdu(sanitizeBody(body))

      const rawCategory = safeString(frontmatter.category, "General")
      const urduCategory = categorizeEnglishCategory(rawCategory)
      const categoryInfo = categories.find(
        (c) => c.name === urduCategory,
      )
      const categoryName = categoryInfo?.name || urduCategory

      const rawAuthor = safeString(frontmatter.author, "Staff")
      const rawAuthorSlug = safeString(frontmatter.authorSlug) || slugify(rawAuthor)

      const resolvedImage = getImage({
        slug,
        categorySlug: categoryInfo?.slug,
        frontmatterImage: frontmatter.image as string | undefined | null,
      })

      return {
        slug,
        title: urduTitle,
        excerpt: urduExcerpt,
        content: sanitizedBody,
        category: categoryName,
        categorySlug: categoryInfo?.slug || categoryName.toLowerCase(),
        author: rawAuthor,
        authorSlug: rawAuthorSlug,
        publishedAt: safeString(frontmatter.publishedAt, ""),
        updatedAt: frontmatter.updatedAt
          ? safeString(frontmatter.updatedAt)
          : undefined,
        image: resolvedImage,
        imageAlt: frontmatter.imageAlt
          ? safeString(frontmatter.imageAlt)
          : undefined,
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        readingTime: safeNumber(rt.minutes, 1),
        featured: Boolean(frontmatter.featured),
        breaking: Boolean(frontmatter.breaking),
        trending: Boolean(frontmatter.trending),
      }
    }
  }
  return null
}

export async function getAllArticles(): Promise<ArticleMeta[]> {
  if (_allArticlesCache) return _allArticlesCache
  const slugs = getArticleSlugs()
  const articles = await Promise.all(
    slugs.map((slug) => getArticleBySlug(slug)),
  )
  _allArticlesCache = articles
    .filter((a): a is ArticleMeta => a !== null)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, MAX_DAILY_ARTICLES)
  return _allArticlesCache
}

export async function getArticleLinks(): Promise<ArticleLink[]> {
  const all = (await getAllArticles()).map((a) => ({
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    categorySlug: a.categorySlug,
    author: a.author,
    authorSlug: a.authorSlug,
    publishedAt: a.publishedAt,
    image: a.image,
    imageAlt: a.imageAlt,
    readingTime: a.readingTime,
    featured: a.featured,
    breaking: a.breaking,
    trending: a.trending,
  }))
  return deduplicateArticles(all).slice(0, MAX_DAILY_ARTICLES)
}

let _breakingCache: ArticleLink[] | null = null
export async function getBreakingArticles(): Promise<ArticleLink[]> {
  if (_breakingCache) return _breakingCache
  _breakingCache = (await getArticleLinks()).filter((a) => a.breaking)
  return _breakingCache
}

let _trendingCache: ArticleLink[] | null = null
export async function getTrendingArticles(): Promise<ArticleLink[]> {
  if (_trendingCache) return _trendingCache
  _trendingCache = (await getArticleLinks()).filter((a) => a.trending)
  return _trendingCache
}

export async function getFeaturedArticle(): Promise<ArticleLink | null> {
  const links = await getArticleLinks()
  return links.find((a) => a.featured) || links[0] || null
}

let _categoryCache: Map<string, ArticleLink[]> | null = null
async function getCategoryCache(): Promise<Map<string, ArticleLink[]>> {
  if (_categoryCache) return _categoryCache
  _categoryCache = new Map()
  for (const article of await getArticleLinks()) {
    const existing = _categoryCache.get(article.categorySlug) || []
    existing.push(article)
    _categoryCache.set(article.categorySlug, existing)
  }
  return _categoryCache
}

export async function getArticlesByCategory(categorySlug: string): Promise<ArticleLink[]> {
  return (await getCategoryCache()).get(categorySlug) || []
}

export async function getArticlesByAuthor(authorSlug: string): Promise<ArticleLink[]> {
  return (await getArticleLinks()).filter((a) => a.authorSlug === authorSlug)
}

export async function getAuthorBySlug(slug: string): Promise<Author | undefined> {
  const authorData: Record<string, Author> = {}
  for (const author of authors) {
    authorData[author.slug] = author
  }

  const existing = authorData[slug]
  if (existing) return existing

  const allArticles = await getAllArticles()
  const articleAuthor = allArticles.find((a) => a.authorSlug === slug)
  if (articleAuthor) {
    return { slug, name: articleAuthor.author }
  }

  return undefined
}

export async function getRelatedArticles(
  slug: string,
  categorySlug: string,
  limit = 3,
): Promise<ArticleLink[]> {
  return (await getArticlesByCategory(categorySlug))
    .filter((a) => a.slug !== slug)
    .slice(0, limit)
}

export async function getMostReadArticles(limit = 4): Promise<ArticleLink[]> {
  return (await getArticleLinks()).slice(0, limit)
}

export async function getAdjacentArticles(
  slug: string,
): Promise<{ prev: ArticleLink | null; next: ArticleLink | null }> {
  const all = await getArticleLinks()
  const index = all.findIndex((a) => a.slug === slug)
  if (index === -1) return { prev: null, next: null }
  return {
    prev: index > 0 ? all[index - 1] : null,
    next: index < all.length - 1 ? all[index + 1] : null,
  }
}

export async function getArticlesGroupedByCategory(
  categorySlugs: string[],
  articlesPerCategory = 4,
): Promise<{ slug: string; name: string; articles: ArticleLink[] }[]> {
  return (await Promise.all(
    categorySlugs.map(async (slug) => {
      const cat = categories.find((c) => c.slug === slug)
      return {
        slug,
        name: cat?.name || slug,
        articles: (await getArticlesByCategory(slug)).slice(0, articlesPerCategory),
      }
    }),
  )).filter((g) => g.articles.length > 0)
}

export async function searchArticles(query: string): Promise<ArticleLink[]> {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return (await getArticleLinks()).filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.author.toLowerCase().includes(q),
  )
}

export function clearArticleCaches(): void {
  _allArticlesCache = null
  _slugCache = null
  _breakingCache = null
  _trendingCache = null
  _categoryCache = null
  _urduTitleCache.clear()
  _urduExcerptCache.clear()
}
