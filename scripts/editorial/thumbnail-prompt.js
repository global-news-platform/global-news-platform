const CATEGORY_VISUALS = {
  world: {
    style: "geopolitical visualization",
    elements: ["global landmarks", "world maps", "international diplomacy", "earth from orbit"],
    mood: "cinematic, authoritative",
  },
  politics: {
    style: "editorial illustration",
    elements: ["government buildings", "flags", "diplomatic meetings", "voting scenes"],
    mood: "professional, dramatic lighting",
  },
  business: {
    style: "financial news graphic",
    elements: ["city skylines", "stock exchange", "corporate architecture", "data visualization"],
    mood: "premium, high-contrast, sophisticated",
  },
  technology: {
    style: "technology editorial",
    elements: ["circuit patterns", "data streams", "abstract tech", "server infrastructure"],
    mood: "futuristic, clean, high-tech",
  },
  science: {
    style: "scientific visualization",
    elements: ["microscopic imagery", "space photography", "laboratory scenes", "DNA helixes"],
    mood: "precise, awe-inspiring, detailed",
  },
  health: {
    style: "medical editorial",
    elements: ["medical research", "healthcare symbols", "anatomical visualization"],
    mood: "clean, professional, reassuring",
  },
  climate: {
    style: "environmental photojournalism",
    elements: ["natural landscapes", "climate data visualization", "renewable energy", "wildlife"],
    mood: "dramatic natural lighting, urgent yet beautiful",
  },
  culture: {
    style: "cultural editorial",
    elements: ["art installations", "theater performances", "museum architecture", "cultural symbols"],
    mood: "artistic, sophisticated, warm",
  },
  sports: {
    style: "sports editorial",
    elements: ["stadium photography", "athletic moments", "sports equipment", "action shots"],
    mood: "dynamic, high-energy, dramatic",
  },
  opinion: {
    style: "conceptual editorial",
    elements: ["thought-provoking imagery", "editorial cartoons", "symbolic compositions"],
    mood: "contemplative, artistic, impactful",
  },
}

const DEFAULT_VISUAL = {
  style: "editorial news photography",
  elements: ["journalistic scene", "news gathering", "media environment"],
  mood: "professional, balanced, clean",
}

export function generatePrompt(article) {
  const title = article.title || ""
  const excerpt = (article.excerpt || "").slice(0, 200)
  const category = (article.categorySlug || "").toLowerCase()
  const visual = CATEGORY_VISUALS[category] || DEFAULT_VISUAL

  const keyTerms = extractKeyTerms(title + " " + excerpt, 5)
  const subject = buildSubject(title, keyTerms)

  const prompt = buildComprehensivePrompt(subject, visual, keyTerms)
  return prompt
}

export function generatePrompts(article, count = 3) {
  const prompts = []
  for (let i = 0; i < count; i++) {
    const prompt = generatePrompt(article)
    prompts.push(prompt)
  }
  return [...new Set(prompts)].slice(0, count)
}

function buildSubject(title, keyTerms) {
  const terms = keyTerms.slice(0, 3).join(", ")
  return `A professional editorial illustration about ${title.toLowerCase() || terms}. `
}

function buildComprehensivePrompt(subject, visual, keyTerms) {
  const tags = keyTerms.slice(0, 3).join(", ")
  return [
    subject,
    `Style: Premium ${visual.style} in the tradition of Reuters and Bloomberg editorial photography.`,
    `Elements: ${visual.elements.join(", ")}, with visual metaphors suggesting ${tags || "the subject matter"}.`,
    `Mood: ${visual.mood}.`,
    "Composition: Clean, balanced, professionally framed. High contrast with purposeful lighting.",
    "Color palette: Rich, desaturated tones with selective color emphasis for visual hierarchy.",
    "Technical: 4K resolution, 16:9 aspect ratio, suitable for hero image placement in a news article.",
    "NO text, NO typography, NO watermark, NO logos. Pure photographic composition.",
  ].join("\n")
}

function extractKeyTerms(text, max) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3)

  const freq = {}
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1
  }

  const stopWords = new Set([
    "this", "that", "with", "from", "have", "been", "were", "they", "their", "said",
    "after", "before", "about", "into", "over", "them", "than", "then", "also", "just",
    "more", "some", "these", "those", "what", "when", "where", "which", "while",
    "would", "could", "should", "make", "made", "news", "article", "report",
  ])

  return Object.entries(freq)
    .filter(([w]) => !stopWords.has(w))
    .sort(([, a], [, b]) => b - a)
    .slice(0, max)
    .map(([w]) => w)
}
