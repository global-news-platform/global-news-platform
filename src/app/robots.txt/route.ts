import { siteConfig } from "@/lib/constants"

export const dynamic = "force-static"

export async function GET() {
  const content = `# robots.txt for ${siteConfig.name}
# https://developers.google.com/search/docs/crawling-indexing/robots/create-robots

# Allow all crawlers to access news content
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

# Respectful crawl delay for all bots
Crawl-delay: 2

# Specific crawl rate limits
User-agent: Googlebot
Crawl-delay: 1

User-agent: Googlebot-Image
Crawl-delay: 2

User-agent: Bingbot
Crawl-delay: 2

User-agent: Baiduspider
Crawl-delay: 5

User-agent: YandexBot
Crawl-delay: 5

User-agent: DuckDuckBot
Crawl-delay: 3

# Block known spam bots
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: BLEXBot
Disallow: /

User-agent: Exabot
Disallow: /

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
