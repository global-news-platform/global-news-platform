import { getArticleLinks } from "@/lib/articles"
import { siteConfig } from "@/lib/constants"

export const dynamic = "force-static"

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export async function GET() {
  const articles = await getArticleLinks()

  const items = articles
    .map(
      (article) => `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${siteConfig.url}/article/${article.slug}</link>
      <guid isPermaLink="true">${siteConfig.url}/article/${article.slug}</guid>
      <description>${escapeXml(article.excerpt)}</description>
      <author>${escapeXml(article.author)}</author>
      <category>${escapeXml(article.category)}</category>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
      ${article.image ? `<media:content xmlns:media="http://search.yahoo.com/mrss/" url="${siteConfig.url}${article.image}" medium="image" />` : ""}
    </item>`,
    )
    .join("")

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss
  version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
>
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${siteConfig.url}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>${siteConfig.locale.replace("_", "-")}</language>
    <copyright>${new Date().getFullYear()} ${escapeXml(siteConfig.name)} — جملہ حقوق محفوظ ہیں</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <image>
      <url>${siteConfig.url}${siteConfig.ogImage}</url>
      <title>${escapeXml(siteConfig.name)}</title>
      <link>${siteConfig.url}</link>
    </image>
    <atom:link href="${siteConfig.url}/feed.xml" rel="self" type="application/rss+xml"/>
    <atom:link href="${siteConfig.url}" rel="alternate" type="text/html"/>
    ${items}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
