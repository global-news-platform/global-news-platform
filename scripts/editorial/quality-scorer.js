export function scoreArticle(article, rewritten) {
  const body = rewritten || article.body || article.excerpt || ""

  const originality = scoreOriginality(body)
  const readability = scoreReadability(body)
  const seo = scoreSeo(body, article)
  const engagement = scoreEngagement(body)
  const trustworthiness = scoreTrustworthiness(body, article)
  const factual = scoreFactual(body)

  const overall = Math.round(
    originality * 0.20 +
    readability * 0.15 +
    seo * 0.15 +
    engagement * 0.15 +
    trustworthiness * 0.20 +
    factual * 0.15,
  )

  return {
    overall,
    originality,
    readability,
    seo,
    engagement,
    trustworthiness,
    factual,
    details: {
      wordCount: body.split(/\s+/).filter(Boolean).length,
      sentenceCount: body.split(/[.!?]+/).filter(Boolean).length,
      avgSentenceLength: calculateAvgSentenceLength(body),
      fleschIndex: calculateFleschIndex(body),
      hasNumbers: /\d/.test(body),
      hasQuotes: /[""]/.test(body),
      paragraphCount: body.split(/\n\s*\n/).filter(Boolean).length,
    },
  }
}

function scoreOriginality(text) {
  const tokens = text.toLowerCase().split(/\s+/).filter(Boolean)
  const unique = new Set(tokens)
  const ratio = unique.size / tokens.length
  return Math.round(Math.min(100, ratio * 120))
}

function scoreReadability(text) {
  const sentences = text.split(/[.!?]+/).filter(Boolean)
  const totalWords = text.split(/\s+/).filter(Boolean).length
  const totalSentences = sentences.length
  if (totalSentences === 0 || totalWords === 0) return 0

  const avgWords = totalWords / totalSentences
  const longWords = text.split(/\s+/).filter((w) => w.length >= 7).length
  const longWordRatio = longWords / totalWords

  let score = 70
  if (avgWords >= 12 && avgWords <= 22) score += 15
  else if (avgWords >= 8 && avgWords <= 28) score += 5
  else score -= 10

  if (longWordRatio <= 0.25) score += 10
  else if (longWordRatio <= 0.35) score += 5
  else score -= 10

  return Math.max(0, Math.min(100, score))
}

function scoreSeo(text, article) {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean)
  let score = 50

  if (text.length >= 300 && text.length <= 2000) score += 10
  else if (text.length > 2000) score += 5

  const title = (article.title || "").toLowerCase()
  const titleWords = title.split(/\s+/).filter(Boolean)
  const bodyWords = new Set(words)
  const titleInBody = titleWords.filter((w) => w.length > 3 && bodyWords.has(w)).length
  if (titleInBody >= 2) score += 10

  if (article.tags && article.tags.length >= 3) score += 10
  if (article.excerpt && article.excerpt.length > 80) score += 10

  const hasHeadings = text.includes("\n## ") || text.includes("**") && text.includes(":**")
  if (hasHeadings) score += 10

  return Math.min(100, score)
}

function scoreEngagement(text) {
  let score = 50

  const sentences = text.split(/[.!?]+/).filter(Boolean)
  const lengths = sentences.map((s) => s.split(/\s+/).filter(Boolean).length)
  const hasVariety = lengths.some((l) => l <= 8) && lengths.some((l) => l >= 20)
  if (hasVariety) score += 15

  const hasQuestions = text.includes("?")
  if (hasQuestions) score += 5

  const hasDirectAddress = /\byou\b/i.test(text) || /\bwe\b/i.test(text)
  if (hasDirectAddress) score += 5

  if (text.length > 400) score += 10

  const paragraphs = text.split(/\n\s*\n/).filter(Boolean)
  const avgParagraphWords = paragraphs.length > 0
    ? text.split(/\s+/).filter(Boolean).length / paragraphs.length
    : 0
  if (avgParagraphWords >= 30 && avgParagraphWords <= 80) score += 10
  else if (avgParagraphWords <= 120) score += 5

  return Math.min(100, score)
}

function scoreTrustworthiness(text, article) {
  let score = 60

  if (hasAttribution(text)) score += 15

  const hasNumbers = /\d+/.test(text)
  if (hasNumbers) score += 10

  if (article.source) score += 5

  const hasQuotes = /["""]/.test(text) || /said\s+\w+/i.test(text) || /according\s+to/i.test(text)
  if (hasQuotes) score += 10

  return Math.min(100, score)
}

function scoreFactual(text) {
  let score = 50

  const numbers = text.match(/\d+(?:[,.]\d+)?/g)
  if (numbers) score += Math.min(15, numbers.length * 3)

  const dates = text.match(/\b(202\d|January|February|March|April|May|June|July|August|September|October|November|December)\b/gi)
  if (dates) score += 10

  const locations = text.match(/\b(Washington|London|Beijing|Moscow|Paris|Berlin|Tokyo|New\s+York|Geneva|Brussels|Kiev|Baghdad|Tehran|Seoul)\b/gi)
  if (locations) score += 10

  const organizations = text.match(/\b(UN|EU|NATO|WHO|IMF|World\s+Bank|Federal\s+Reserve|Pentagon|White\s+House|Congress|Parliament)\b/gi)
  if (organizations) score += 10

  const percentages = text.match(/\d+%/g)
  if (percentages) score += 5

  return Math.min(100, score)
}

function hasAttribution(text) {
  const patterns = [
    /\baccording to\b/i,
    /\breported\b/i,
    /\bcited\b/i,
    /\bsaid\s+\w+/i,
    /\bstated\b/i,
    /\bconfirmed\b/i,
    /\bannounced\b/i,
    /\brevealed\b/i,
  ]
  return patterns.some((p) => p.test(text))
}

function calculateAvgSentenceLength(text) {
  const sentences = text.split(/[.!?]+/).filter(Boolean)
  if (sentences.length === 0) return 0
  const totalWords = text.split(/\s+/).filter(Boolean).length
  return Math.round(totalWords / sentences.length)
}

function calculateFleschIndex(text) {
  const sentences = text.split(/[.!?]+/).filter(Boolean)
  const totalWords = text.split(/\s+/).filter(Boolean).length
  const totalSentences = sentences.length
  const totalSyllables = countSyllables(text)

  if (totalSentences === 0 || totalWords === 0) return 0

  return Math.round(
    206.835 - 1.015 * (totalWords / totalSentences) - 84.6 * (totalSyllables / totalWords),
  )
}

function countSyllables(text) {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean)
  let count = 0
  for (const word of words) {
    count += countWordSyllables(word)
  }
  return count
}

function countWordSyllables(word) {
  word = word.replace(/[^a-z]/g, "")
  if (word.length <= 3) return 1
  const vowels = word.match(/[aeiouy]+/gi)
  return vowels ? Math.max(1, vowels.length) : 1
}
