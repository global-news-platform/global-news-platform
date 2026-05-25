const path = require("path")
const { resolveArticleImage } = require("./imageResolver")

const FALLBACK_AUTHORS = [
  { name: "علی احمد", slug: "ali-ahmed" },
  { name: "سارہ خان", slug: "sara-khan" },
  { name: "عمران ملک", slug: "imran-malik" },
  { name: "فاطمہ حسین", slug: "fatima-hussain" },
  { name: "بابر شاہ", slug: "babar-shah" },
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
  dunya: "dunya",
  siasat: "siasat",
  karobar: "karobar",
  technology: "technology",
  khel: "khel",
  sehat: "sehat",
  science: "science",
  shobiz: "shobiz",
  mazhab: "mazhab",
  taleem: "taleem",
  mausam: "mausam",
  crime: "crime",
  adalat: "adalat",
  baynalaqwami: "baynalaqwami",
  videos: "videos",
  raye: "raye",
  general: "general",
  world: "dunya",
  politics: "siasat",
  business: "karobar",
  entertainment: "shobiz",
  sports: "khel",
  health: "sehat",
  environment: "science",
  opinion: "raye",
  pakistan: "pakistan",
}

function getCategorySlug(categoryName) {
  if (!categoryName) return "general"
  const key = categoryName.toLowerCase().trim()
  return ENGLISH_TO_SLUG[key] || "general"
}

const TOPIC_PATTERNS = [
  { pattern: /trump|biden|election|congress|senate/i, topic: "politics" },
  { pattern: /iran|israel|gaza|ukraine|russia|china|taiwan/i, topic: "geopolitics" },
  { pattern: /ai|artificial.intelligence|openai|chatgpt|machine.learning/i, topic: "artificial-intelligence" },
  { pattern: /ebola|hantavirus|covid|pandemic|outbreak/i, topic: "health-crisis" },
  { pattern: /climate|environment|emissions|carbon|renewable/i, topic: "climate" },
  { pattern: /stock|market|inflation|economy|rates|trade|tariff/i, topic: "economy" },
  { pattern: /football|soccer|cricket|nba|nfl|tennis|golf|sport/i, topic: "sports" },
  { pattern: /film|movie|music|concert|award|celebrity|star/i, topic: "entertainment" },
  { pattern: /tech|digital|cyber|data|software|app|phone|internet/i, topic: "technology" },
  { pattern: /supreme.court|judge|law|legal|justice/i, topic: "law" },
  { pattern: /military|army|defense|war|strike|attack|missile/i, topic: "defense" },
  { pattern: /space|nasa|moon|mars|satellite|astronomy/i, topic: "space" },
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

function buildFrontmatter(article) {
  const author = pickAuthor()
  const categorySlug = getCategorySlug(article.categorySlug || article.category)
  const topics = extractTopics(article.title, article.description, article.tags)

  const imagePath = resolveArticleImage(
    article.slug,
    categorySlug,
    article.title,
    article.breaking || false,
  )

  return {
    title: article.title,
    excerpt: article.description.substring(0, 160),
    category: categorySlug,
    author: author.name,
    authorSlug: author.slug,
    publishedAt: new Date(article.publishedAt).toISOString(),
    image: imagePath,
    imageAlt: article.title.substring(0, 120),
    tags: [...new Set([...topics, ...article.tags])].slice(0, 6),
    featured: false,
    breaking: false,
    trending: false,
  }
}

function buildMdxContent(article) {
  const fm = buildFrontmatter(article)

  const frontmatter = `---
title: "${escapeYamlString(fm.title)}"
excerpt: "${escapeYamlString(fm.excerpt)}"
category: "${fm.category}"
author: "${fm.author}"
authorSlug: "${fm.authorSlug}"
publishedAt: "${fm.publishedAt}"
image: "${fm.image}"
imageAlt: "${escapeYamlString(fm.imageAlt)}"
tags: [${fm.tags.map((t) => `"${t}"`).join(", ")}]
featured: ${fm.featured}
breaking: ${fm.breaking}
trending: ${fm.trending}
---

`

  const body = `${fm.title}

${article.description}

[Read more](${article.sourceUrl})
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
}
