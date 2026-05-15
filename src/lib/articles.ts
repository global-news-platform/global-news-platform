import fs from "fs"
import path from "path"
import readingTime from "reading-time"

import type { ArticleMeta, ArticleLink, Author } from "@/types"
import { authors } from "@/data/authors/authors"
import { categories } from "@/lib/constants"
import { slugify } from "@/lib/utils"

const articlesDir = path.join(process.cwd(), "src/data/articles")

export function getArticleSlugs(): string[] {
  if (!fs.existsSync(articlesDir)) return []
  return fs
    .readdirSync(articlesDir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => f.replace(/\.(md|mdx)$/, ""))
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
    const [key, ...rest] = line.split(":")
    if (key && rest.length > 0) {
      const value = rest.join(":").trim()
      if (value.startsWith("[") && value.endsWith("]")) {
        frontmatter[key.trim()] = JSON.parse(value.replace(/'/g, '"'))
      } else {
        frontmatter[key.trim()] = value.replace(/^["']|["']$/g, "")
      }
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

      const categoryName = String(frontmatter.category || "General")
      const categoryInfo = categories.find(
        (c) => c.name.toLowerCase() === categoryName.toLowerCase(),
      )

      return {
        slug,
        title: String(frontmatter.title || ""),
        excerpt: String(frontmatter.excerpt || ""),
        content: body,
        category: categoryName,
        categorySlug: categoryInfo?.slug || categoryName.toLowerCase(),
        author: String(frontmatter.author || "Staff"),
        authorSlug: String(frontmatter.authorSlug || slugify(String(frontmatter.author || "staff"))),
        publishedAt: String(frontmatter.publishedAt || ""),
        updatedAt: frontmatter.updatedAt
          ? String(frontmatter.updatedAt)
          : undefined,
        image: frontmatter.image ? String(frontmatter.image) : undefined,
        imageAlt: frontmatter.imageAlt
          ? String(frontmatter.imageAlt)
          : undefined,
        tags: (frontmatter.tags as string[]) || [],
        readingTime: Math.round(rt.minutes),
        featured: Boolean(frontmatter.featured),
        breaking: Boolean(frontmatter.breaking),
        trending: Boolean(frontmatter.trending),
      }
    }
  }
  return null
}

export function getAllArticles(): ArticleMeta[] {
  const slugs = getArticleSlugs()
  return slugs
    .map((slug) => getArticleBySlug(slug))
    .filter((a): a is ArticleMeta => a !== null)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
}

export function getArticleLinks(): ArticleLink[] {
  return getAllArticles().map((a) => ({
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    categorySlug: a.categorySlug,
    author: a.author,
    authorSlug: a.authorSlug,
    publishedAt: a.publishedAt,
    image: a.image,
    readingTime: a.readingTime,
    featured: a.featured,
    breaking: a.breaking,
    trending: a.trending,
  }))
}

export function getBreakingArticles(): ArticleLink[] {
  return getArticleLinks().filter((a) => a.breaking)
}

export function getTrendingArticles(): ArticleLink[] {
  return getArticleLinks().filter((a) => a.trending)
}

export function getFeaturedArticle(): ArticleLink | null {
  return getArticleLinks().find((a) => a.featured) || null
}

export function getArticlesByCategory(categorySlug: string): ArticleLink[] {
  return getArticleLinks().filter((a) => a.categorySlug === categorySlug)
}

export function getArticlesByAuthor(authorSlug: string): ArticleLink[] {
  return getArticleLinks().filter((a) => a.authorSlug === authorSlug)
}

export function getAuthorBySlug(slug: string): Author | undefined {
  const authorData: Record<string, Author> = {}
  for (const author of authors) {
    authorData[author.slug] = author
  }

  const articleAuthor = getAllArticles().find((a) => a.authorSlug === slug)
  if (articleAuthor) {
    return {
      slug,
      name: articleAuthor.author,
      bio: undefined,
      role: undefined,
    }
  }

  return authors.find((a) => a.slug === slug)
}

export function getRelatedArticles(
  slug: string,
  categorySlug: string,
  limit = 3,
): ArticleLink[] {
  return getArticleLinks()
    .filter((a) => a.slug !== slug && a.categorySlug === categorySlug)
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
