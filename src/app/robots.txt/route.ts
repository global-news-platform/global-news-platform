import { siteConfig } from "@/lib/constants"

export const dynamic = "force-static"

export async function GET() {
  const content = `# robots.txt for ${siteConfig.name}
# https://developers.google.com/search/docs/crawling-indexing/robots/create-robots

User-agent: *
Allow: /
Allow: /article/
Allow: /category/
Allow: /author/
Allow: /feed.xml
Allow: /sitemap.xml

Disallow: /api/
Disallow: /_next/
Disallow: /_static/

# Crawl rate limiting
User-agent: Googlebot
Crawl-delay: 1

User-agent: Bingbot
Crawl-delay: 2

# Sitemaps
Sitemap: ${siteConfig.url}/sitemap.xml

# Host directive
Host: ${siteConfig.url.replace("https://", "")}
`

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  })
}
