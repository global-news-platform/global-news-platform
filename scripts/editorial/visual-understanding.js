import { generate } from "./ai.js"

const CATEGORY_MOODS = {
  politics: { primary: "dramatic", secondary: "authoritative", palette: "deep blues, reds, neutral grays" },
  world: { primary: "cinematic", secondary: "expansive", palette: "rich earth tones, atmospheric" },
  business: { primary: "professional", secondary: "dynamic", palette: "cool blues, silver, clean whites" },
  technology: { primary: "futuristic", secondary: "innovative", palette: "deep indigo, cyan, neon accents" },
  science: { primary: "precise", secondary: "awe-inspired", palette: "cool whites, blues, high contrast" },
  health: { primary: "clinical", secondary: "reassuring", palette: "soft whites, healing greens, blues" },
  climate: { primary: "documentary", secondary: "urgent", palette: "natural greens, deep blues, warm ambers" },
  culture: { primary: "artistic", secondary: "rich", palette: "warm golds, deep purples, vibrant accents" },
  sports: { primary: "dynamic", secondary: "energetic", palette: "high contrast, saturated colors" },
  opinion: { primary: "editorial", secondary: "thoughtful", palette: "monochrome with selective color" },
}

const DEFAULT_MOOD = { primary: "editorial", secondary: "balanced", palette: "professional neutral tones" }

export async function analyzeArticle(article) {
  const title = article.title || ""
  const excerpt = (article.excerpt || "").slice(0, 500)
  const body = (article.body || "").slice(0, 2000)

  const result = analyzeLocal(article)

  if (process.env.EDITORIAL_DISABLED !== "true") {
    try {
      const aiResult = await analyzeWithAI(title, excerpt, body)
      if (aiResult) Object.assign(result, aiResult)
    } catch {
      // fallback to local analysis
    }
  }

  const categorySlug = (article.categorySlug || "").toLowerCase()
  const mood = CATEGORY_MOODS[categorySlug] || DEFAULT_MOOD
  result.categoryMood = mood
  result.visualTheme = deriveVisualTheme(result, mood)

  return result
}

function analyzeLocal(article) {
  const title = article.title || ""
  const excerpt = article.excerpt || ""
  const text = `${title} ${excerpt}`.toLowerCase()

  const allEntities = extractEntities(text)
  const locations = extractLocations(text)
  const keySubjects = extractKeySubjects(text)

  const sentiments = detectSentiment(text)
  const conflicts = detectConflicts(text)

  return {
    subjects: keySubjects,
    entities: allEntities,
    locations,
    sentiments,
    conflicts,
    composition: suggestComposition(keySubjects, sentiments),
    lighting: suggestLighting(sentiments, conflicts),
    atmosphere: suggestAtmosphere(sentiments),
  }
}

async function analyzeWithAI(title, excerpt, body) {
  const system = `You are a visual journalism director. Analyze this article and return visual direction as JSON.

Return ONLY valid JSON:
{
  "subjects": ["array", "of", "visual", "subjects"],
  "entities": ["people", "organizations", "key entities"],
  "locations": ["places"],
  "sentiments": { "primary": "dominant emotion", "secondary": "secondary emotion" },
  "conflicts": ["tensions", "oppositions", "stakes"],
  "composition": "description of ideal visual composition",
  "lighting": "description of lighting approach",
  "atmosphere": "description of visual atmosphere"
}`

  const prompt = `Analyze this article for visual direction:

Title: ${title}
Excerpt: ${excerpt}
Body: ${body.slice(0, 1500)}`

  try {
    const raw = await generate(prompt, { system, temperature: 0.3, maxTokens: 1000, format: "json" })
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim()
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

function extractEntities(text) {
  const patterns = [
    /(president|minister|secretary|governor|senator|congressman|chancellor|prime minister)\s+(\w+\s+\w+)/gi,
    /(ceo|founder|director|chairman|executive)\s+(\w+\s+\w+)/gi,
    /(Apple|Google|Microsoft|Amazon|Meta|Tesla|OpenAI|NATO|UN|EU|WHO|IMF|World Bank|Federal Reserve|Pentagon|White House|Congress|Supreme Court)/g,
  ]
  const entities = []
  for (const pattern of patterns) {
    const matches = text.match(pattern)
    if (matches) entities.push(...matches.map((m) => m.trim()))
  }
  return [...new Set(entities)].slice(0, 10)
}

function extractLocations(text) {
  const locationPatterns = [
    /(Washington|London|Beijing|Moscow|Paris|Berlin|Tokyo|New Delhi|Brasilia|Canberra|Geneva|Brussels|Kiev|Baghdad|Tehran|Seoul|Pyongyang|Havana|Cairo|Nairobi|Cape Town|Sydney|Tokyo|Oslo|Stockholm|Helsinki|Reykjavik|Zurich|Dubai|Singapore|Hong Kong|Shanghai)/g,
    /(United States|China|Russia|India|Brazil|Germany|France|UK|Japan|Ukraine|Iran|Iraq|Afghanistan|Syria|Israel|Palestine|Saudi Arabia|UAE|South Korea|North Korea|Australia|Canada|Mexico|South Africa|Nigeria|Kenya|Egypt|Turkey|Pakistan|Bangladesh|Indonesia)/g,
  ]
  const locations = []
  for (const pattern of locationPatterns) {
    const matches = text.match(pattern)
    if (matches) locations.push(...matches.map((m) => m.trim()))
  }
  return [...new Set(locations)].slice(0, 5)
}

function extractKeySubjects(text) {
  const words = text
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 4)

  const freq = {}
  for (const w of words) freq[w] = (freq[w] || 0) + 1

  const stopWords = new Set([
    "this", "that", "with", "from", "have", "been", "were", "they", "their", "said",
    "after", "before", "about", "into", "over", "them", "than", "then", "also", "just",
    "more", "some", "these", "those", "what", "when", "where", "which", "while",
    "would", "could", "should", "make", "made", "news", "article", "report", "first",
    "last", "year", "month", "week", "day", "time", "new", "like", "including",
  ])

  return Object.entries(freq)
    .filter(([w]) => !stopWords.has(w))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([w]) => w)
}

function detectSentiment(text) {
  const positiveWords = ["breakthrough", "historic", "landmark", "progress", "success", "growth", "innovation", "recovery", "achievement", "victory", "hope", "opportunity", "advance"]
  const negativeWords = ["crisis", "conflict", "war", "disaster", "threat", "decline", "crash", "collapse", "crisis", "emergency", "deadly", "violence", "attack", "sanctions", "tension"]

  const posCount = positiveWords.filter((w) => text.includes(w)).length
  const negCount = negativeWords.filter((w) => text.includes(w)).length

  if (posCount > negCount * 2) return { primary: "optimistic", secondary: "forward-looking" }
  if (negCount > posCount * 2) return { primary: "serious", secondary: "urgent" }
  if (posCount > negCount) return { primary: "hopeful", secondary: "cautious" }
  if (negCount > posCount) return { primary: "tense", secondary: "concerned" }
  return { primary: "neutral", secondary: "balanced" }
}

function detectConflicts(text) {
  const patterns = [
    /\b(versus|vs\.?|against|battle|clash|dispute|tension|rivalry|conflict)\b/gi,
    /\b(sanctions|ban|protest|strike|lawsuit|investigation|allegation)\b/gi,
  ]
  const conflicts = []
  for (const pattern of patterns) {
    const matches = text.match(pattern)
    if (matches) conflicts.push(...matches.map((m) => m.toLowerCase()))
  }
  return [...new Set(conflicts)]
}

function suggestComposition(subjects, sentiments) {
  const mood = sentiments.primary
  if (mood === "optimistic" || mood === "hopeful") return "Wide angle, looking upward or outward. Leading lines toward a bright focal point."
  if (mood === "serious" || mood === "tense") return "Close to mid shot. Strong diagonal lines. Tighter framing for intimacy."
  return "Balanced composition. Rule of thirds with clear foreground subject."
}

function suggestLighting(sentiments, conflicts) {
  if (sentiments.primary === "serious" || conflicts.length > 0) return "High contrast, dramatic side lighting. Deep shadows with selective highlights."
  if (sentiments.primary === "optimistic") return "Soft, warm directional light. Gentle highlights with minimal shadow."
  if (sentiments.primary === "neutral") return "Professional three-point lighting. Clean, even illumination."
  return "Naturalistic lighting. Soft diffusion with ambient fill."
}

function suggestAtmosphere(sentiments) {
  if (sentiments.primary === "tense") return "Heavy atmosphere with low-lying haze. Moody and charged."
  if (sentiments.primary === "optimistic") return "Clear atmosphere with warm ambient glow. Open and inviting."
  if (sentiments.primary === "serious") return "Cool, crisp atmosphere. Sharp contrasts and defined shadows."
  return "Clean, clear atmosphere. Professional and unobtrusive."
}

function deriveVisualTheme(analysis, mood) {
  const parts = [mood.primary, analysis.atmosphere, mood.palette]
  return parts.join(" | ")
}
