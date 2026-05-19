/**
 * Enhanced RSS ingestion engine.
 * Features: caching, retry, health monitoring, concurrent fetching,
 * content normalization, source validation.
 */

const Parser = require("rss-parser")
const { get: cacheGet, set: cacheSet } = require("./cache")
const { fetchWithRetry } = require("./retry")
const { recordResult } = require("./health")

const parser = new Parser({
  timeout: 20000,
  maxRedirects: 3,
  headers: {
    "User-Agent":
      "GlobalNewsBot/2.0 (news aggregator; +https://globalnews.news)",
    Accept:
      "application/rss+xml, application/xml, text/xml, application/atom+xml",
  },
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
      ["content:encoded", "contentEncoded"],
    ],
  },
})

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

  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "# $1\n\n")
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "## $1\n\n")
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "### $1\n\n")
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "#### $1\n\n")
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**")
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**")
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*")
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*")
  md = md.replace(
    /<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    "[$2]($1)",
  )
  md = md.replace(
    /<img[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi,
    "![$2]($1)",
  )
  md = md.replace(/<img[^>]*src=["']([^"']+)["'][^>]*\/?>/gi, "![image]($1)")

  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, c) =>
    c.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n") + "\n",
  )
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, c) => {
    let i = 0
    return c.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, () => `${++i}. $1\n`) + "\n"
  })
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, c) =>
    c
      .trim()
      .split("\n")
      .map((l) => `> ${l.trim()}`)
      .join("\n") + "\n\n",
  )
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n")
  md = md.replace(/<br\s*\/?>/gi, "\n")
  md = md.replace(/<hr\s*\/?>/gi, "\n---\n")
  md = md.replace(/<figure[^>]*>([\s\S]*?)<\/figure>/gi, "$1\n")
  md = md.replace(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/gi, "*$1*\n")
  md = md.replace(/<[^>]+>/g, "")

  md = md
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(+c))

  md = md.replace(/\n{4,}/g, "\n\n\n")
  md = md.replace(/[ \t]+/g, " ")
  return md.trim()
}

function extractImage(item) {
  try {
    if (item.enclosure?.url && item.enclosure.type?.startsWith("image/"))
      return item.enclosure.url

    const mc = item.mediaContent || item["media:content"]
    if (mc) {
      const attrs = Array.isArray(mc) ? mc[0]?.$ : mc.$
      if (attrs?.url) return attrs.url
    }

    const mt = item.mediaThumbnail || item["media:thumbnail"]
    if (mt) {
      const attrs = Array.isArray(mt) ? mt[0]?.$ : mt.$
      if (attrs?.url) return attrs.url
    }

    const html =
      item.contentEncoded || item["content:encoded"] || item.content || item.description || ""
    const m = html.match(/<img[^>]+src=["']([^"']+)["']/)
    if (m) return m[1]
  } catch {}
  return null
}

async function fetchSource(source) {
  let feed

  // Try cache first
  const cached = cacheGet(source.url)
  if (cached) {
    feed = cached
  } else {
    try {
      feed = await parser.parseURL(source.url)
      cacheSet(source.url, feed)
      recordResult(source.label, true)
    } catch (err) {
      recordResult(source.label, false, err.message)
      throw new Error(`${source.label}: ${err.message}`)
    }
  }

  const items = (feed.items || []).slice(0, 15)
  const cutoff = Date.now() - 7 * 86400000

  return items
    .map((item) => {
      const pubDate = new Date(
        item.pubDate || item.isoDate || item.date || Date.now(),
      )
      if (pubDate.getTime() < cutoff) return null

      const contentHtml =
        item["content:encoded"] || item.content || item.description || ""

      return {
        sourceUrl: item.link || "",
        title: (item.title || "").trim(),
        excerpt:
          stripHtml(contentHtml)
            .slice(0, 250)
            .replace(/\s+\S*$/, "") + ".",
        body: htmlToMarkdown(contentHtml),
        author: item.creator || item.author || source.label,
        category: source.category,
        publishedAt: pubDate.toISOString(),
        imageUrl: extractImage(item),
        sourceLabel: source.label,
        sourcePriority: source.priority || 3,
      }
    })
    .filter(Boolean)
}

async function fetchAllSources(sources, concurrency = 1) {
  const results = { success: [], failed: [] }

  const queue = [...sources]
  const inProgress = new Set()

  async function processNext() {
    while (queue.length > 0) {
      const source = queue.shift()
      const key = source.url + source.label

      if (inProgress.has(key)) continue
      inProgress.add(key)

      try {
        const items = await fetchSource(source)
        results.success.push({ source, items })
      } catch (err) {
        results.failed.push({ source, error: err.message })
      }

      inProgress.delete(key)
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, sources.length) }, () =>
    processNext(),
  )
  await Promise.all(workers)

  return results
}

module.exports = { fetchSource, fetchAllSources, stripHtml, htmlToMarkdown }
