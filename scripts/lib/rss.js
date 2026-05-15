const Parser = require("rss-parser")

const parser = new Parser({
  timeout: 15000,
  maxRedirects: 3,
  headers: {
    "User-Agent": "GlobalNewsBot/1.0 (news aggregator; +https://globalnews.news)",
    Accept: "application/rss+xml, application/xml, text/xml, application/atom+xml",
  },
})

function extractImage(item) {
  try {
    if (item.enclosure?.url && item.enclosure.type?.startsWith("image/"))
      return item.enclosure.url

    const mc = item["media:content"]
    if (mc) {
      const url = Array.isArray(mc) ? mc[0]?.$?.url : mc.$?.url
      if (url) return url
    }

    const mt = item["media:thumbnail"]
    if (mt) {
      const url = Array.isArray(mt) ? mt[0]?.$?.url : mt.$?.url
      if (url) return url
    }

    const html = item["content:encoded"] || item.content || item.description || ""
    const m = html.match(/<img[^>]+src=["']([^"']+)["']/)
    if (m) return m[1]
  } catch {}
  return null
}

function extractContent(item) {
  return item["content:encoded"] || item.content || item.description || ""
}

function stripHtml(html) {
  if (!html) return ""
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(+c))
    .replace(/\s+/g, " ")
    .trim()
}

function htmlToMarkdown(html) {
  if (!html) return ""

  let md = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<aside[\s\S]*?<\/aside>/gi, "")

  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "# $1\n\n")
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "## $1\n\n")
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "### $1\n\n")
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "#### $1\n\n")
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**")
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**")
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*")
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*")
  md = md.replace(/<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
  md = md.replace(/<img[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, "![$2]($1)")
  md = md.replace(/<img[^>]*src=["']([^"']+)["'][^>]*\/?>/gi, "![image]($1)")

  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, c) =>
    c.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n") + "\n"
  )
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, c) => {
    let i = 0
    return c.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, () => `${++i}. $1\n`) + "\n"
  })
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, c) =>
    c.trim().split("\n").map(l => `> ${l.trim()}`).join("\n") + "\n\n"
  )
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n")
  md = md.replace(/<br\s*\/?>/gi, "\n")
  md = md.replace(/<hr\s*\/?>/gi, "\n---\n")
  md = md.replace(/<figure[^>]*>([\s\S]*?)<\/figure>/gi, "$1\n")
  md = md.replace(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/gi, "*$1*\n")
  md = md.replace(/<[^>]+>/g, "")

  md = md.replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(+c))

  md = md.replace(/\n{4,}/g, "\n\n\n")
  md = md.replace(/[ \t]+/g, " ")
  return md.trim()
}

async function fetchSource(source) {
  const feed = await parser.parseURL(source.url)
  const items = (feed.items || []).slice(0, 15)
  return items.map(item => {
    const contentHtml = extractContent(item)
    const pubDate = new Date(item.pubDate || item.isoDate || item.date || Date.now())
    const cutoff = Date.now() - 7 * 86400000
    if (pubDate.getTime() < cutoff) return null

    return {
      sourceUrl: item.link || "",
      title: (item.title || "").trim(),
      excerpt: stripHtml(contentHtml).slice(0, 250).replace(/\s+\S*$/, "") + ".",
      body: htmlToMarkdown(contentHtml),
      author: item.creator || item.author || source.label,
      category: source.category,
      publishedAt: pubDate.toISOString(),
      imageUrl: extractImage(item),
      sourceLabel: source.label,
    }
  }).filter(Boolean)
}

module.exports = { fetchSource, htmlToMarkdown, stripHtml }
