import { getArticleLinks } from "@/lib/articles"
import { categories, siteConfig } from "@/lib/constants"

export const dynamic = "force-static"

function xmlUrl({
  loc,
  lastmod,
  changefreq,
  priority,
  images,
}: {
  loc: string
  lastmod: string
  changefreq: string
  priority: string
  images?: string[]
}) {
  const imageTags = images
    ? images
        .map((img) => `\n    <image:image><image:loc>${img}</image:loc></image:image>`)
        .join("")
    : ""

  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${imageTags}
  </url>`
}

export async function GET() {
  const articles = await getArticleLinks()

  const homepageUrl = {
    loc: siteConfig.url,
    lastmod: articles.length > 0 ? new Date(articles[0].publishedAt).toISOString() : new Date().toISOString(),
    changefreq: "hourly",
    priority: "1.0",
  }

  const breakingUrl = {
    loc: `${siteConfig.url}/breaking`,
    lastmod: new Date().toISOString(),
    changefreq: "hourly",
    priority: "0.9",
  }

  const categoryUrls = categories.map((cat) => ({
    loc: `${siteConfig.url}/category/${cat.slug}`,
    lastmod: new Date().toISOString(),
    changefreq: "daily" as const,
    priority: "0.7",
  }))

  const articleUrls = articles.map((article) => ({
    loc: `${siteConfig.url}/article/${article.slug}`,
    lastmod: new Date(article.publishedAt).toISOString(),
    changefreq: "weekly" as const,
    priority: "0.8",
    images: article.image ? [`${siteConfig.url}${article.image}`] : undefined,
  }))

  const allUrls = [homepageUrl, breakingUrl, ...categoryUrls, ...articleUrls]

  const xmlns = [
    'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"',
    'xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"',
  ].join(" ")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset ${xmlns}>
${allUrls.map((u) => xmlUrl(u)).join("\n")}
</urlset>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
