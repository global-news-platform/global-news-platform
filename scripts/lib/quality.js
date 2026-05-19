/**
 * Editorial Quality Scoring Engine
 * ===================================
 * Multi-dimensional article quality assessment.
 *
 * Dimensions:
 *   - Readability         (15%) — sentence length, vocabulary complexity
 *   - Source Trust         (20%) — provenance authority
 *   - Factual Content      (15%) — numbers, dates, entities, attribution
 *   - Human-likeness       (15%) — sentence variety, AI pattern absence
 *   - Authority / Depth    (15%) — contextual grounding, attribution quality
 *   - Engagement           (10%) — hooks, variety, paragraph length
 *   - Originality          (10%) — lexical diversity, template avoidance
 *
 * Scoring: 0-100 for each dimension, weighted composite.
 */

const AI_CLICHES = [
  "in conclusion", "in summary", "it is important to note", "it is worth noting",
  "as previously mentioned", "as discussed earlier", "in today's world",
  "when it comes to", "in the realm of", "a double-edged sword",
  "it remains to be seen", "only time will tell", "the landscape",
  "a wide range of", "the fact of the matter", "in the ever-evolving",
  "in this article we", "as we have seen", "it is crucial to",
  "it is essential to", "the future of", "the world of", "a myriad of",
  "navigate the", "delve into", "let's explore", "let's dive",
  "a tapestry of", "in the digital age", "in today's fast-paced",
]

const AI_TRANSITIONS = [
  "however,", "moreover,", "furthermore,", "nevertheless,",
  "nonetheless,", "additionally,", "consequently,", "thus,",
]

function scoreReadability(text) {
  if (!text || text.length < 50) return 0
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  if (sentences.length === 0) return 0

  const totalWords = text.split(/\s+/).length
  const wordsPerSentence = totalWords / sentences.length
  const avgWordLength = text.split(/\s+/).reduce((sum, w) => sum + w.length, 0) / totalWords

  let score = 0
  if (wordsPerSentence >= 14 && wordsPerSentence <= 25) score += 35
  else if (wordsPerSentence >= 10 && wordsPerSentence <= 30) score += 25
  else if (wordsPerSentence >= 8 && wordsPerSentence <= 35) score += 15
  else score += 5

  if (avgWordLength >= 4.2 && avgWordLength <= 5.8) score += 25
  else if (avgWordLength >= 3.8 && avgWordLength <= 6.2) score += 15
  else score += 5

  if (totalWords >= 150) score += 20
  else if (totalWords >= 80) score += 12
  else if (totalWords >= 40) score += 6

  if (text.includes('"') || text.includes("'")) score += 10
  if (/\d+/.test(text)) score += 10

  return Math.min(score, 100)
}

function scoreSentenceVariety(text) {
  if (!text) return 0
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  if (sentences.length < 3) return 50

  const lengths = sentences.map((s) => s.split(/\s+/).length)
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length
  const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / lengths.length
  const stdDev = Math.sqrt(variance)

  // Ideal: moderate variety (std dev between 3 and 10)
  if (stdDev >= 4 && stdDev <= 12) return 90
  if (stdDev >= 2.5 && stdDev <= 15) return 70
  if (stdDev >= 1.5 && stdDev <= 20) return 50
  return 30
}

function scoreAIpatternAbsence(text) {
  if (!text) return 100
  const lower = text.toLowerCase()
  let penalty = 0

  for (const cliche of AI_CLICHES) {
    const regex = new RegExp(cliche.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
    const matches = lower.match(regex)
    if (matches) penalty += matches.length * 8
  }

  for (const transition of AI_TRANSITIONS) {
    const regex = new RegExp("\\b" + transition.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
    const matches = lower.match(regex)
    if (matches && matches.length > 2) penalty += (matches.length - 2) * 5
  }

  // Check for repetitive sentence starts
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const starts = sentences.map((s) => s.trim().split(/\s+/).slice(0, 2).join(" ").toLowerCase())
  const startFreq = {}
  for (const s of starts) startFreq[s] = (startFreq[s] || 0) + 1
  for (const count of Object.values(startFreq)) {
    if (count > 2) penalty += (count - 2) * 3
  }

  return Math.max(0, 100 - penalty)
}

function scoreFactualContent(text) {
  if (!text) return 0
  let score = 0

  const numbers = text.match(/\b\d+\b/g)
  if (numbers && numbers.length > 2) score += 15
  else if (numbers && numbers.length > 0) score += 8

  if (text.includes('"') || text.includes("'")) score += 12

  if (text.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/i)) score += 12

  const entities = text.match(/[A-Z][a-z]+ [A-Z][a-z]+/g)
  if (entities && entities.length > 2) score += 12
  else if (entities && entities.length > 0) score += 6

  if (text.match(/\b(according to|reported by|said|stated|announced|confirmed|according|per)\b/i)) score += 12

  if (text.match(/\b\d+(\.\d+)?%|\$\d+(\.\d+)?[bBmMkK]?\b/)) score += 12

  if (text.match(/\b(because|since|due to|as a result|prompted by|driven by)\b/i)) score += 5

  const words = text.split(/\s+/).length
  if (words > 200) score += 10
  if (words > 500) score += 10

  return Math.min(score, 100)
}

function scoreAuthority(text, category) {
  if (!text) return 0
  let score = 30 // base

  const lower = text.toLowerCase()

  if (text.match(/\b(according to|said|reported|confirmed|announced|stated|declared|noted|explained|indicated|highlighted|emphasized)\b/i)) score += 15

  if (text.match(/\b(analyst|expert|official|researcher|professor|director|chief|president|minister|spokesperson|representative)\b/i)) score += 10

  if (text.match(/\b(study|report|analysis|survey|data|research|finding|evidence)\b/i)) score += 10

  if (text.match(/\b\d{4}\b/)) score += 5

  // Contextual depth signals
  const depthSignals = [
    "implications", "significance", "context", "background",
    "broader", "underlying", "trend", "pattern",
    "development comes as", "this marks", "the timing",
    "strategic", "impact", "consequence", "trajectory",
  ]
  for (const signal of depthSignals) {
    if (lower.includes(signal)) score += 2
  }

  return Math.min(score, 100)
}

function scoreEngagement(text) {
  if (!text) return 0
  let score = 40 // base

  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  if (sentences.length < 3) return 40

  // Paragraph variety
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 30)
  if (paragraphs.length >= 3 && paragraphs.length <= 7) score += 15
  else if (paragraphs.length >= 2) score += 8

  // Opening hook
  const firstSentence = sentences[0] || ""
  const hookIndicators = ["marking", "signals", "pivotal", "significant", "groundbreaking",
    "critical", "urgent", "unprecedented", "major", "key"]
  for (const h of hookIndicators) {
    if (firstSentence.toLowerCase().includes(h)) score += 3
  }

  // Closing strength
  const lastSentence = sentences[sentences.length - 1] || ""
  const closeIndicators = ["implications", "outlook", "future", "remains", "ahead",
    "watch", "monitor", "track", "develop"]
  for (const c of closeIndicators) {
    if (lastSentence.toLowerCase().includes(c)) score += 2
  }

  // Paragraph length sanity (2-5 sentences ideal)
  const paraSentenceCounts = paragraphs.map((p) => p.split(/[.!?]+/).filter(Boolean).length)
  const avgParas = paraSentenceCounts.reduce((a, b) => a + b, 0) / paraSentenceCounts.length
  if (avgParas >= 2 && avgParas <= 5) score += 10

  return Math.min(score, 100)
}

function scoreOriginality(text) {
  if (!text) return 0
  let score = 60 // base

  const lower = text.toLowerCase()

  // Lexical diversity
  const words = lower.split(/\s+/).filter((w) => w.length > 3)
  const unique = new Set(words)
  const diversity = unique.size / Math.max(words.length, 1)
  if (diversity >= 0.5) score += 15
  else if (diversity >= 0.35) score += 8
  else score -= 10

  // Template pattern penalty
  const templatePatterns = [
    "this article", "in this piece", "as we explore", "let us examine",
    "the purpose of this", "we will look at", "this section covers",
  ]
  for (const pat of templatePatterns) {
    if (lower.includes(pat)) score -= 10
  }

  // Repetitive sentence structure
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  if (sentences.length >= 3) {
    const firstWords = sentences.map((s) => s.trim().split(/\s+/).slice(0, 3).join(" ").toLowerCase())
    const repeatCount = firstWords.filter((fw, i) => firstWords.indexOf(fw) !== i).length
    if (repeatCount > sentences.length * 0.3) score -= 10
  }

  return Math.max(0, Math.min(score, 100))
}

function scoreSourceTrust(sourceLabel) {
  const trustScores = {
    "BBC News": 95, "BBC World": 95, "BBC Politics": 90,
    "BBC Technology": 90, "BBC Business": 90, "BBC Science": 90,
    "BBC Health": 90, "BBC Sport": 90, "BBC Culture": 85,
    "NYT World": 95, "NYT Politics": 95, "NYT Business": 90,
    "NYT Technology": 90, "NYT Science": 90, "NYT Health": 90,
    "NYT Sports": 85, "NYT Climate": 90,
    "Reuters": 95, "Reuters World": 95, "Reuters Business": 95,
    "Al Jazeera": 85,
    "Guardian World": 90, "Guardian Politics": 90, "Guardian Business": 85,
    "Guardian Technology": 85, "Guardian Science": 85, "Guardian Sport": 80,
    "Guardian Culture": 80, "Guardian Climate": 85,
    "ABC News": 80, "NPR": 85,
    "TechCrunch": 75, "Ars Technica": 85, "Wired": 80, "The Verge": 75,
    "CNBC": 80, "Bloomberg Markets": 85, "Bloomberg Tech": 80,
    "Washington Post World": 90, "Washington Post Politics": 90,
    "Washington Post Business": 85, "Washington Post Tech": 80,
    "Economist Business": 90, "Economist World": 90,
    "DW News": 85, "Politico": 80, "ESPN": 70,
    "New Scientist": 85, "ScienceDaily": 80, "Nature": 95,
    "Hacker News": 60, "Google News": 70,
    "Reddit WorldNews": 40, "Reddit Technology": 40, "Reddit Science": 45,
  }
  return trustScores[sourceLabel] || 50
}

function hasClickbaitIndicators(title) {
  if (!title) return 0
  const lower = title.toLowerCase()
  const indicators = [
    "you won't believe", "this is why", "the reason", "here's what",
    "what happens next", "will shock you", "mind blowing", "unbelievable",
    "shocking", "incredible", "you need to see", "this changes everything",
    "the truth about", "they don't want you", "secret", "doctors hate",
    "single trick", "one weird", "what happened next",
  ]

  let score = 0
  for (const indicator of indicators) {
    if (lower.includes(indicator)) score += 10
  }

  const capsCount = (title.match(/[A-Z]{2,}/g) || []).length
  if (capsCount > 3) score += 15

  const exclaimCount = (title.match(/!/g) || []).length
  if (exclaimCount > 1) score += 10

  return Math.min(score, 100)
}

function computeOverallQuality(article) {
  if (!article) return 0

  const text = article.body || article.excerpt || ""
  const readability = scoreReadability(text)
  const trust = scoreSourceTrust(article.sourceLabel)
  const factual = scoreFactualContent(text)
  const humanLikeness = (scoreSentenceVariety(text) + scoreAIpatternAbsence(text)) / 2
  const authority = scoreAuthority(text, article.category)
  const engagement = scoreEngagement(text)
  const originality = scoreOriginality(text)
  const clickbait = hasClickbaitIndicators(article.title)

  const quality =
    readability * 0.15 +
    trust * 0.20 +
    factual * 0.15 +
    humanLikeness * 0.15 +
    authority * 0.15 +
    engagement * 0.10 +
    originality * 0.10 -
    clickbait * 0.20

  return {
    overall: Math.max(0, Math.min(100, Math.round(quality))),
    readability,
    trust,
    factual,
    humanLikeness: Math.round(humanLikeness),
    authority: Math.round(authority),
    engagement: Math.round(engagement),
    originality: Math.round(originality),
    clickbaitPenalty: clickbait,
    source: article.sourceLabel,
  }
}

module.exports = {
  scoreReadability,
  scoreSentenceVariety,
  scoreAIpatternAbsence,
  scoreFactualContent,
  scoreAuthority,
  scoreEngagement,
  scoreOriginality,
  scoreSourceTrust,
  hasClickbaitIndicators,
  computeOverallQuality,
}
