import fs from "fs"
import path from "path"
import readingTime from "reading-time"

import type { ArticleMeta, ArticleLink, Author } from "@/types"
import { authors } from "@/data/authors/authors"
import { categories } from "@/lib/constants"
import { slugify } from "@/lib/utils"
import { getArticleImage } from "@/lib/getImage"
import {
  sanitizeTitle,
  sanitizeExcerpt,
  sanitizeBody,
  validateArticleContent,
  deduplicateArticles,
  safeString,
  safeNumber,
} from "@/lib/sanitize"

const articlesDir = path.join(process.cwd(), "src/data/articles")

const VALID_CATEGORY_NAMES = new Set(categories.map((c) => c.name.toLowerCase()))

let _allArticlesCache: ArticleMeta[] | null = null
let _slugCache: string[] | null = null
const _resolvedImages = new Map<string, string>()
let _imagesResolved = false
let _resolvePromise: Promise<void> | null = null

export async function preResolveAllImages(): Promise<void> {
  if (_imagesResolved) return
  if (_resolvePromise) {
    await _resolvePromise
    return
  }
  _resolvePromise = resolveAllArticleImages()
  await _resolvePromise
  _imagesResolved = true
}

async function resolveAllArticleImages(): Promise<void> {
  const articles = getAllArticles()
  await Promise.all(
    articles.map(async (article) => {
      try {
        const url = await getArticleImage(article.slug, article.categorySlug, article.title)
        _resolvedImages.set(article.slug, url)
        article.image = url
      } catch {
        // keep undefined, fallback handles it
      }
    }),
  )
  _breakingCache = null
  _trendingCache = null
  _categoryCache = null
}

export function getArticleSlugs(): string[] {
  if (_slugCache) return _slugCache
  if (!fs.existsSync(articlesDir)) return []
  _slugCache = fs
    .readdirSync(articlesDir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => f.replace(/\.(md|mdx)$/, ""))
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

export function getArticleBySlug(slug: string): ArticleMeta | null {
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

      if (!validation.valid) {
        return null
      }

      if (!sanitizedTitle) {
        return null
      }

      const sanitizedExcerpt = sanitizeExcerpt(safeString(frontmatter.excerpt))
      const sanitizedBody = sanitizeBody(body)

      let categoryName = safeString(frontmatter.category, "General")
      if (!VALID_CATEGORY_NAMES.has(categoryName.toLowerCase())) {
        categoryName = "World"
      }
      const categoryInfo = categories.find(
        (c) => c.name.toLowerCase() === categoryName.toLowerCase(),
      )

      const rawAuthor = safeString(frontmatter.author, "Staff")
      const rawAuthorSlug = safeString(frontmatter.authorSlug) || slugify(rawAuthor)

      const resolvedImage = _resolvedImages.get(slug) || (frontmatter.image ? safeString(frontmatter.image) : undefined)

      return {
        slug,
        title: sanitizedTitle,
        excerpt: sanitizedExcerpt,
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

export function getAllArticles(): ArticleMeta[] {
  if (_allArticlesCache) return _allArticlesCache
  const slugs = getArticleSlugs()
  _allArticlesCache = slugs
    .map((slug) => getArticleBySlug(slug))
    .filter((a): a is ArticleMeta => a !== null)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
  return _allArticlesCache
}

export function getArticleLinks(): ArticleLink[] {
  const all = getAllArticles().map((a) => ({
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
  return deduplicateArticles(all)
}

let _breakingCache: ArticleLink[] | null = null
export function getBreakingArticles(): ArticleLink[] {
  if (_breakingCache) return _breakingCache
  _breakingCache = getArticleLinks().filter((a) => a.breaking)
  return _breakingCache
}

let _trendingCache: ArticleLink[] | null = null
export function getTrendingArticles(): ArticleLink[] {
  if (_trendingCache) return _trendingCache
  _trendingCache = getArticleLinks().filter((a) => a.trending)
  return _trendingCache
}

export function getFeaturedArticle(): ArticleLink | null {
  return getArticleLinks().find((a) => a.featured) || getArticleLinks()[0] || null
}

let _categoryCache: Map<string, ArticleLink[]> | null = null
function getCategoryCache(): Map<string, ArticleLink[]> {
  if (_categoryCache) return _categoryCache
  _categoryCache = new Map()
  for (const article of getArticleLinks()) {
    const existing = _categoryCache.get(article.categorySlug) || []
    existing.push(article)
    _categoryCache.set(article.categorySlug, existing)
  }
  return _categoryCache
}

export function getArticlesByCategory(categorySlug: string): ArticleLink[] {
  return getCategoryCache().get(categorySlug) || []
}

export function getArticlesByAuthor(authorSlug: string): ArticleLink[] {
  return getArticleLinks().filter((a) => a.authorSlug === authorSlug)
}

export function getAuthorBySlug(slug: string): Author | undefined {
  const authorData: Record<string, Author> = {}
  for (const author of authors) {
    authorData[author.slug] = author
  }

  const existing = authorData[slug]
  if (existing) return existing

  const articleAuthor = getAllArticles().find((a) => a.authorSlug === slug)
  if (articleAuthor) {
    return {
      slug,
      name: articleAuthor.author,
    }
  }

  return undefined
}

export function getRelatedArticles(
  slug: string,
  categorySlug: string,
  limit = 3,
): ArticleLink[] {
  return getArticlesByCategory(categorySlug)
    .filter((a) => a.slug !== slug)
    .slice(0, limit)
}

export function getMostReadArticles(limit = 4): ArticleLink[] {
  return getArticleLinks().slice(0, limit)
}

export function getAdjacentArticles(
  slug: string,
): { prev: ArticleLink | null; next: ArticleLink | null } {
  const all = getArticleLinks()
  const index = all.findIndex((a) => a.slug === slug)
  if (index === -1) return { prev: null, next: null }
  return {
    prev: index < all.length - 1 ? all[index + 1] : null,
    next: index > 0 ? all[index - 1] : null,
  }
}

export function getArticlesGroupedByCategory(
  categorySlugs: string[],
  articlesPerCategory = 4,
): { slug: string; name: string; articles: ArticleLink[] }[] {
  return categorySlugs
    .map((slug) => {
      const cat = categories.find((c) => c.slug === slug)
      return {
        slug,
        name: cat?.name || slug,
        articles: getArticlesByCategory(slug).slice(0, articlesPerCategory),
      }
    })
    .filter((g) => g.articles.length > 0)
}

export function clearArticleCaches(): void {
  _allArticlesCache = null
  _slugCache = null
  _breakingCache = null
  _trendingCache = null
  _categoryCache = null
  _resolvedImages.clear()
  _imagesResolved = false
  _resolvePromise = null
}
