import { generate } from "./ai.js"

export async function humanize(text) {
  const sentences = splitSentences(text)
  const stats = analyzeSentenceStats(sentences, text)

  if (needsHumanization(stats)) {
    return humanizeWithAI(text, stats)
  }

  return applyLocalHumanization(text, stats)
}

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function analyzeSentenceStats(sentences, text) {
  const lengths = sentences.map((s) => s.split(/\s+/).length)
  const total = sentences.length
  const avg = total > 0 ? lengths.reduce((a, b) => a + b, 0) / total : 0
  const variance = total > 0 ? lengths.reduce((sum, l) => sum + (l - avg) ** 2, 0) / total : 0
  const stdDev = Math.sqrt(variance)

  return {
    total,
    avgLength: avg,
    stdDev,
    minLength: total > 0 ? Math.min(...lengths) : 0,
    maxLength: total > 0 ? Math.max(...lengths) : 0,
    hasShortSentences: lengths.some((l) => l <= 6),
    hasLongSentences: lengths.some((l) => l >= 30),
    allSimilarLength: stdDev < 5,
    aiPatterns: text ? detectAIPatterns(text) : 0,
  }
}

function detectAIPatterns(text) {
  const patterns = [
    /\bin conclusion\b/i, /\bit is important to note\b/i,
    /\bit is worth noting\b/i, /\bin today's digital world\b/i,
    /\bthe landscape of\b/i, /\ba double-edged sword\b/i,
    /\bin the realm of\b/i, /\bwhen it comes to\b/i,
    /\bthe world of\b/i, /\ba testament to\b/i,
    /\bas previously mentioned\b/i, /\bas discussed earlier\b/i,
    /\bin the ever-evolving\b/i, /\bonly time will tell\b/i,
    /\bit remains to be seen\b/i, /\ba myriad of\b/i,
    /\bdelve into\b/i, /\bnavigate the\b/i,
  ]
  return patterns.filter((p) => p.test(text)).length
}

function needsHumanization(stats) {
  return (
    stats.allSimilarLength ||
    stats.aiPatterns >= 2 ||
    (stats.avgLength >= 20 && !stats.hasShortSentences) ||
    (stats.avgLength <= 10 && !stats.hasLongSentences)
  )
}

async function humanizeWithAI(text, stats) {
  const issues = []
  if (stats.allSimilarLength) issues.push("sentences are very similar in length")
  if (stats.aiPatterns >= 2) issues.push("contains AI-typical phrases")
  if (!stats.hasShortSentences) issues.push("all sentences are medium-long, no short punchy ones")
  if (!stats.hasLongSentences) issues.push("all sentences are short, no complex ones")

  const system = `You are a senior editor. Polish this article to sound more natural and human-written.

Rules:
- Vary sentence length. Mix short (3-8 word) sentences with longer (20-35 word) ones
- Replace robotic or cliche phrases with natural alternatives
- Add transitional words and phrases where flow is choppy
- Keep all factual information intact
- Do not change the journalistic tone
- Output only the polished text, no labels`

  const prompt = `Polish this article for natural readability. Issues detected: ${issues.join(", ")}.

Article:
${text}`

  try {
    return await generate(prompt, { system, temperature: 0.6, maxTokens: text.split(/\s+/).length * 7 })
  } catch {
    return applyLocalHumanization(text, stats)
  }
}

function applyLocalHumanization(text, stats) {
  // Use the local editorial engine for humanization
  try {
    const { removeAIPatterns } = require("../lib/summarizer")
    return removeAIPatterns(text)
  } catch {}

  let sentences = splitSentences(text)
  const result = []

  for (let i = 0; i < sentences.length; i++) {
    let s = sentences[i]
    const wordCount = s.split(/\s+/).length

    if (i > 0 && i < sentences.length - 1 && wordCount > 25 && !sentences[i - 1].split(/\s+/).length <= 8) {
      const breakPoint = findBreakPoint(s)
      if (breakPoint > 0) {
        const first = s.slice(0, breakPoint).trim()
        const second = s.slice(breakPoint).trim()
        result.push(first + ".")
        result.push(capitalize(second))
        continue
      }
    }

    s = replaceAIPhrases(s)
    result.push(s)
  }

  let combined = result.join(" ")
  combined = combineShortSentences(combined)
  return combined
}

function findBreakPoint(sentence) {
  const breakers = [", but ", ", however ", ", although ", ", while ", ", which ", ", where "]
  for (const b of breakers) {
    const idx = sentence.indexOf(b)
    if (idx > 15 && idx < sentence.length - 15) return idx
  }
  const mid = Math.floor(sentence.length / 2)
  const period = sentence.indexOf(".", mid)
  if (period > 0 && period < sentence.length - 5) return period
  return -1
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function replaceAIPhrases(text) {
  const replacements = [
    [/\bin conclusion\b/gi, "Ultimately"],
    [/\bit is important to note that\b/gi, ""],
    [/\bit is worth noting that\b/gi, ""],
    [/\bin today's digital world\b/gi, "Today"],
    [/\bthe landscape of\b/gi, ""],
    [/\ba double-edged sword\b/gi, "a mixed blessing"],
    [/\bin the realm of\b/gi, "in"],
    [/\bwhen it comes to\b/gi, "regarding"],
    [/\bthe world of\b/gi, ""],
    [/\ba testament to\b/gi, "a sign of"],
    [/\bas previously mentioned\b/gi, "As noted"],
    [/\bas discussed earlier\b/gi, "As highlighted"],
    [/\bin the ever-evolving\b/gi, "in the changing"],
    [/\bonly time will tell\b/gi, "The outcome remains unclear"],
    [/\bit remains to be seen\b/gi, "It is not yet clear"],
    [/\ba myriad of\b/gi, "many"],
    [/\bdelve into\b/gi, "examine"],
    [/\bnavigate the\b/gi, "address the"],
  ]
  let result = text
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement)
  }
  result = result.replace(/\s{2,}/g, " ")
  return result.trim()
}

function combineShortSentences(text) {
  const sentences = splitSentences(text)
  const result = []
  for (let i = 0; i < sentences.length; i++) {
    const current = sentences[i]
    const next = sentences[i + 1]
    if (next && current.split(/\s+/).length <= 6 && next.split(/\s+/).length <= 8) {
      result.push(current + ", " + next.charAt(0).toLowerCase() + next.slice(1))
      i++
    } else {
      result.push(current)
    }
  }
  return result.join(" ")
}
