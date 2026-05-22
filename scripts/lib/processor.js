const fs = require("fs")
const path = require("path")

const AUTHORS_PATH = path.join(__dirname, "../../src/data/authors/authors.ts")

const FALLBACK_AUTHORS = [
  { name: "علی احمد", slug: "ali-ahmed" },
  { name: "سارہ خان", slug: "sara-khan" },
  { name: "عمران ملک", slug: "imran-malik" },
  { name: "فاطمہ حسین", slug: "fatima-hussain" },
  { name: "بابر شاہ", slug: "babar-shah" },
]

function pickRandomAuthor() {
  return FALLBACK_AUTHORS[Math.floor(Math.random() * FALLBACK_AUTHORS.length)]
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

function extractTopics(title, description, tags) {
  const text = (title + " " + description).toLowerCase()
  const topics = new Set()

  const topicPatterns = [
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

  for (const { pattern, topic } of topicPatterns) {
    if (pattern.test(text)) topics.add(topic)
  }

  if (tags && tags.length > 0) {
    for (const tag of tags) topics.add(tag.toLowerCase().replace(/\s+/g, "-"))
  }

  return [...topics].slice(0, 5)
}

function buildFrontmatter(article, imagePath) {
  const author = pickRandomAuthor()
  const categorySlug = getCategorySlug(article.categorySlug || article.category)
  const topics = extractTopics(article.title, article.description, article.tags)

  const effectiveImage = imagePath || `/images/fallbacks/${getFallbackSlug(categorySlug)}.jpg`

  return {
    title: article.title,
    excerpt: article.description.substring(0, 160),
    category: categorySlug,
    author: author.name,
    authorSlug: author.slug,
    publishedAt: new Date(article.publishedAt).toISOString(),
    image: effectiveImage,
    imageAlt: article.title.substring(0, 120),
    tags: [...new Set([...topics, ...article.tags])].slice(0, 6),
    featured: false,
    breaking: false,
    trending: false,
  }
}

const FALLBACK_MAP = {
  pakistan: "pakistan",
  dunya: "world",
  siasat: "politics",
  karobar: "business",
  technology: "technology",
  khel: "sports",
  sehat: "health",
  science: "science",
  shobiz: "entertainment",
  mazhab: "pakistan",
  taleem: "technology",
  mausam: "world",
  crime: "world",
  adalat: "politics",
  baynalaqwami: "world",
  videos: "technology",
  raye: "politics",
  general: "world",
}

function getFallbackSlug(categorySlug) {
  return FALLBACK_MAP[categorySlug] || "world"
}

function buildMdxContent(article, imagePath) {
  const fm = buildFrontmatter(article, imagePath)

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

  const body = `## ${fm.title}

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
  pickRandomAuthor,
  getCategorySlug,
  extractTopics,
  buildFrontmatter,
  buildMdxContent,
  FALLBACK_AUTHORS,
}
