const path = require("path")
const { downloadArticleImage, getFallbackForCategory, getKeywordFallback, resetBatchHashes } = require("./imageDownloader")

const FALLBACK_AUTHORS = [
  { name: "Ali Ahmed", slug: "ali-ahmed" },
  { name: "Sara Khan", slug: "sara-khan" },
  { name: "Imran Malik", slug: "imran-malik" },
  { name: "Fatima Hussain", slug: "fatima-hussain" },
  { name: "Babar Shah", slug: "babar-shah" },
]

const SEEN_AUTHORS = new Set()

function pickAuthor() {
  const available = FALLBACK_AUTHORS.filter((a) => !SEEN_AUTHORS.has(a.slug))
  if (available.length === 0) SEEN_AUTHORS.clear()
  const pool = available.length > 0 ? available : FALLBACK_AUTHORS
  const author = pool[Math.floor(Math.random() * pool.length)]
  SEEN_AUTHORS.add(author.slug)
  return author
}

const ENGLISH_TO_SLUG = {
  dunya: "dunya", siasat: "siasat", karobar: "karobar",
  technology: "technology", khel: "khel", sehat: "sehat",
  science: "science", shobiz: "shobiz", mazhab: "mazhab",
  taleem: "taleem", mausam: "mausam", crime: "crime",
  adalat: "adalat", baynalaqwami: "baynalaqwami",
  videos: "videos", raye: "raye", general: "general",
  world: "dunya", politics: "siasat", business: "karobar",
  entertainment: "shobiz", sports: "khel", health: "sehat",
  environment: "science", opinion: "raye", pakistan: "pakistan",
  education: "taleem", religion: "mazhab",
}

function getCategorySlug(categoryName) {
  if (!categoryName) return "general"
  const key = categoryName.toLowerCase().trim()
  return ENGLISH_TO_SLUG[key] || "general"
}

const TOPIC_PATTERNS = [
  { pattern: /imran.khan|nawaz.sharif|asif.zardari|shehbaz|pti|pmln|ppp/i, topic: "pakistan-politics" },
  { pattern: /election|vote|campaign|parliament|senate|assembly/i, topic: "politics" },
  { pattern: /iran|israel|gaza|ukraine|russia|china|taiwan|afghanistan/i, topic: "geopolitics" },
  { pattern: /ai|artificial.intelligence|openai|chatgpt|machine.learning|digital/i, topic: "artificial-intelligence" },
  { pattern: /climate|environment|emissions|carbon|renewable|weather/i, topic: "climate" },
  { pattern: /stock|market|inflation|economy|rupee|imf|trade|tariff|interest.rate/i, topic: "economy" },
  { pattern: /cricket|psl|football|hockey|nba|tennis|olympic|sport|tournament/i, topic: "sports" },
  { pattern: /film|movie|music|concert|award|celebrity|drama|artist/i, topic: "entertainment" },
  { pattern: /tech|digital|cyber|data|software|app|phone|internet|startup/i, topic: "technology" },
  { pattern: /supreme.court|judge|law|legal|justice|high.court/i, topic: "law" },
  { pattern: /military|army|defense|war|strike|missile|security|border/i, topic: "defense" },
  { pattern: /hospital|doctor|disease|vaccine|health|medical|patient|surgery/i, topic: "health" },
  { pattern: /school|university|education|student|college|exam/i, topic: "education" },
  { pattern: /space|nasa|moon|mars|satellite|astronomy|research/i, topic: "science" },
]

function extractTopics(title, description, tags) {
  const text = (title + " " + description).toLowerCase()
  const topics = new Set()
  for (const { pattern, topic } of TOPIC_PATTERNS) {
    if (pattern.test(text)) topics.add(topic)
  }
  if (tags && tags.length > 0) {
    for (const tag of tags) topics.add(tag.toLowerCase().replace(/\s+/g, "-"))
  }
  return [...topics].slice(0, 5)
}

async function resolveImageForArticle(article, categorySlug) {
  const result = await downloadArticleImage(article)
  return result.path
}

function buildAttributionLine(article) {
  const sourceName = article.attribution || article.source || "News Source"
  const sourceUrl = article.canonicalUrl || article.sourceUrl

  if (sourceUrl) {
    return `This news is based on information obtained from ${sourceName}. For full details, [visit the original source](${sourceUrl}).`
  }
  return `This news is based on information obtained from ${sourceName}.`
}

const FAIR_USE_NOTICE = `\n\n---

*This news is a summary based on information obtained from various news agencies. For full details and the original report, please refer to the source mentioned above. We present news for informational purposes only and all copyrights belong to their respective owners.*`

async function buildFrontmatter(article) {
  const author = pickAuthor()
  const categorySlug = getCategorySlug(article.categorySlug || article.category)
  const topics = extractTopics(article.title, article.description, article.tags)

  const imagePath = await resolveImageForArticle(article, categorySlug)

  return {
    title: article.title,
    excerpt: (function truncate(text, max=160) {
      if (!text) return ""
      if (text.length <= max) return text
      const truncated = text.slice(0, max)
      const lastPeriod = truncated.lastIndexOf(".")
      const lastSpace = truncated.lastIndexOf(" ")
      if (lastPeriod > max * 0.5) return truncated.slice(0, lastPeriod + 1)
      if (lastSpace > 0) return truncated.slice(0, lastSpace) + "..."
      return truncated.slice(0, max - 3) + "..."
    })(article.description),
    category: categorySlug,
    author: author.name,
    authorSlug: author.slug,
    publishedAt: new Date(article.publishedAt).toISOString(),
    image: imagePath,
    imageAlt: article.title.substring(0, 120),
    tags: [...new Set([...topics, ...article.tags])].slice(0, 6),
    sourceName: article.attribution || article.source || "",
    sourceUrl: article.sourceUrl || "",
    canonicalUrl: article.canonicalUrl || article.sourceUrl || "",
    attribution: article.attribution || article.source || "",
    isSummary: true,
    featured: false,
    breaking: false,
    trending: false,
  }
}

async function buildMdxContent(article) {
  const fm = await buildFrontmatter(article)
  const attributionLine = buildAttributionLine(article)

  const frontmatter = `---
title: "${escapeYamlString(fm.title)}"
excerpt: "${escapeYamlString(fm.excerpt)}"
category: "${fm.category}"
author: "${fm.author}"
authorSlug: "${fm.authorSlug}"
publishedAt: "${fm.publishedAt}"
image: "${fm.image}"
imageAlt: "${escapeYamlString(fm.imageAlt)}"
sourceName: "${escapeYamlString(fm.sourceName)}"
sourceUrl: "${escapeYamlString(fm.sourceUrl)}"
canonicalUrl: "${escapeYamlString(fm.canonicalUrl)}"
attribution: "${escapeYamlString(fm.attribution)}"
isSummary: true
tags: [${fm.tags.map((t) => `"${t}"`).join(", ")}]
featured: ${fm.featured}
breaking: ${fm.breaking}
trending: ${fm.trending}
---

`

  const body = `${article.description}

${attributionLine}
${FAIR_USE_NOTICE}
`

  return frontmatter + body
}

function escapeYamlString(str) {
  if (!str) return ""
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, " ")
    .replace(/\r/g, " ")
    .trim()
}

module.exports = {
  buildFrontmatter,
  buildMdxContent,
  getCategorySlug,
  extractTopics,
}
