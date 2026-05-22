import fs from "fs"
import path from "path"

export function getArticleSlugs(): string[] {
  const articlesDir = path.join(process.cwd(), "src/data/articles")
  if (!fs.existsSync(articlesDir)) return []
  return fs
    .readdirSync(articlesDir)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((f) => f.replace(/\.(md|mdx)$/, ""))
}

export function getArticleBySlug(slug: string) {
  const articlesDir = path.join(process.cwd(), "src/data/articles")
  const extensions = [".md", ".mdx"]

  for (const ext of extensions) {
    const filePath = path.join(articlesDir, `${slug}${ext}`)
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8")
      return { slug, content }
    }
  }
  return null
}

export function getAllArticles() {
  const slugs = getArticleSlugs()
  return slugs
    .map((slug) => getArticleBySlug(slug))
    .filter(Boolean) as { slug: string; content: string }[]
}
