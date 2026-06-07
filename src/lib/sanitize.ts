const TITLE_MIN_LENGTH = 8
const EXCERPT_MAX_LENGTH = 180
const EXCESSIVE_PUNCTUATION_THRESHOLD = 0.15

const BROKEN_PREFIXES = [/^[a-z]{1,3}\b(?:\s+[a-z]{1,3}\b)*\s+\d+[:.]?\s*/i, /^[-\s]+\w/, /^[^a-zA-Z0-9]{2,}/]

const MALFORMED_CHAR_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/

const ESCAPED_QUOTE_PATTERNS = [
  [/\\"/g, '"'],
  [/\\'/g, "'"],
  [/\\`/g, "`"],
  [/&quot;/g, '"'],
  [/&#39;/g, "'"],
  [/&#x27;/g, "'"],
  [/&#x2F;/g, "/"],
  [/&#92;/g, "\\\\"],
  [/&amp;/g, "&"],
]

const MARKDOWN_PATTERNS = [
  /!\[.*?\]\(.*?\)/g,
  /\[([^\]]*)\]\([^)]*\)/g,
  /(^|\s)#{1,6}\s/g,
  /(^|\s)(\*{1,3}|_{1,3})(\S.*?\S)\2/g,
  /(^|\s)`{1,3}[^`]*`{1,3}/g,
  /(^|\s)>{1,2}\s/g,
  /(^|\s)[-*+]\s/g,
  /(^|\s)\d+\.\s/g,
  /~~.*?~~/g,
  /^\|.*\|$/gm,
]

const URL_PATTERN = /https?:\/\/[^\s]{3,}/g

const DUPLICATE_SENTENCE_PATTERN = /([.!?])\s*(\S[^.!?]*?)\s*\1\s*\2\s*\1/gi

const AI_HALLUCINATED_FORMATTING = [
  /```[\s\S]*?```/g,
  /<\|[^\|]*\|>/g,
  /\[\[.*?\]\]/g,
  /{{.*?}}/g,
  /\(\(.*?\)\)/g,
  /:.*?:[\w]+/g,
  /@\w+\s*\{[^}]*\}/g,
  /__[^_]+__/g,
  /~~[^~]+~~/g,
  /\^\^[^\^]+\^\^/g,
]



const FRONTMATTER_LINE = /^[\w-]+\s*:\s*.+/m
const FRONTMATTER_BLOCK = /^---\s*\n[\s\S]*?\n---\s*\n/gm

function removeEscapedQuotes(text: string): string {
  let result = text
  for (const [pattern, replacement] of ESCAPED_QUOTE_PATTERNS) {
    result = result.replace(pattern, replacement as string)
  }
  return result
}

function removeMalformedChars(text: string): string {
  return text.replace(MALFORMED_CHAR_PATTERN, "").normalize("NFC")
}

function removeRawMarkdown(text: string): string {
  let result = text
  for (const pattern of MARKDOWN_PATTERNS) {
    result = result.replace(pattern, " ")
  }
  return result
}

function removeURLs(text: string): string {
  return text.replace(URL_PATTERN, "").trim()
}

function trimBrokenPrefix(text: string): string {
  let result = text.trim()
  for (const pattern of BROKEN_PREFIXES) {
    result = result.replace(pattern, "").trim()
  }
  if (result.length > 0 && result.length < 4) result = ""
  return result
}

function stripIncompleteSentence(text: string): string {
  return text.replace(/[^.!?]*$/, "").trim()
}

function stripMalformedAIOutput(text: string): string {
  let result = text
  for (const pattern of AI_HALLUCINATED_FORMATTING) {
    result = result.replace(pattern, " ")
  }
  return result
}

function removeDuplicatedSentences(text: string): string {
  let result = text
  let prev = ""
  while (result !== prev) {
    prev = result
    result = result.replace(DUPLICATE_SENTENCE_PATTERN, "$1 $2")
  }
  const seen = new Set<string>()
  const sentences = result.match(/[^.!?\n]+[.!?\n]*/g) || [result]
  const unique = sentences.filter((s) => {
    const key = s.trim().toLowerCase().slice(0, 40)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  return unique.join(" ").trim()
}

function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\t+/g, " ")
    .replace(/[ \t]+$/gm, "")
    .replace(/^[ \t]+/gm, "")
    .replace(/ +/g, " ")
    .trim()
}

function hasExcessivePunctuation(text: string): boolean {
  if (text.length < 10) return false
  const punctCount = (text.match(/[.!?,;:]{2,}|[!?]{2,}/g) || []).length
  return punctCount / text.length > EXCESSIVE_PUNCTUATION_THRESHOLD
}

function hasRepeatedPhrases(text: string): boolean {
  const lower = text.toLowerCase()
  const lengths = [8, 14]
  for (const len of lengths) {
    if (len > Math.floor(lower.length / 2)) continue
    const seen = new Set<string>()
    for (let i = 0; i <= lower.length - len; i++) {
      const phrase = lower.slice(i, i + len)
      if (seen.has(phrase)) return true
      seen.add(phrase)
    }
  }
  return false
}

function hasCorruptedUnicode(text: string): boolean {
  const replacementCount = (text.match(/\uFFFD/g) || []).length
  if (replacementCount > 3) return true
  const nonLatinRatio =
    text.replace(/[\w\s.,!?;:'"\-]/g, "").length / Math.max(text.length, 1)
  return nonLatinRatio > 0.3
}

function hasMalformedMarkdown(text: string): boolean {
  const fences = (text.match(/```/g) || []).length
  if (fences % 2 !== 0) return true
  const brackets = (text.match(/\[/g) || []).length
  const closingBrackets = (text.match(/\]/g) || []).length
  if (brackets !== closingBrackets) return true
  const parens = (text.match(/\(/g) || []).length
  const closingParens = (text.match(/\)/g) || []).length
  return parens !== closingParens
}



function stripFrontmatterBlocks(text: string): string {
  let result = text

  result = result.replace(FRONTMATTER_BLOCK, "")

  result = result.replace(/^---\s*$/gm, "")

  const lines = result.split("\n")
  const filtered = lines.filter((line) => {
    const trimmed = line.trim()
    if (!trimmed) return true
    if (FRONTMATTER_LINE.test(trimmed) && /^[a-zA-Z][\w-]+\s*:/.test(trimmed)) {
      return false
    }
    return true
  })

  result = filtered.join("\n")
  result = result.replace(/\n{3,}/g, "\n\n").trim()
  return result
}

function removeDuplicateBodyTitle(body: string, title: string): string {
  if (!title || !body) return body
  const cleanedTitle = title.replace(/["""''""«»]/g, "").trim()
  const lines = body.split("\n")
  const filtered = lines.filter((line) => {
    const trimmed = line.trim()
    if (!trimmed) return true
    const stripped = trimmed.replace(/["""''""«»]/g, "").trim()
    if (stripped === cleanedTitle) return false
    if (stripped.length > 20 && cleanedTitle.length > 20) {
      const shortA = stripped.slice(0, 30).toLowerCase()
      const shortB = cleanedTitle.slice(0, 30).toLowerCase()
      if (shortA === shortB) return false
    }
    return true
  })
  return filtered.join("\n")
}

export function sanitizeTitle(title: string): string {
  if (!title) return ""
  let result = title
  result = removeEscapedQuotes(result)
  result = removeMalformedChars(result)
  result = trimBrokenPrefix(result)
  result = result.replace(/[""]/g, '"').replace(/['']/g, "'")
  result = result.replace(/\s+/g, " ").trim()
  result = result.replace(/[^\S\r\n]+/g, " ")
  if (result.length < TITLE_MIN_LENGTH) return ""
  result = result.charAt(0).toUpperCase() + result.slice(1)
  return result
}

export function sanitizeExcerpt(excerpt: string): string {
  if (!excerpt) return ""
  let result = excerpt
  result = removeEscapedQuotes(result)
  result = removeMalformedChars(result)
  result = removeRawMarkdown(result)
  result = removeURLs(result)
  result = stripMalformedAIOutput(result)
  result = removeDuplicatedSentences(result)
  result = normalizeWhitespace(result)
  if (result.length > EXCERPT_MAX_LENGTH) {
    const truncated = result.slice(0, EXCERPT_MAX_LENGTH)
    const lastPeriod = truncated.lastIndexOf(".")
    const lastSpace = truncated.lastIndexOf(" ")
    if (lastPeriod > EXCERPT_MAX_LENGTH * 0.6) {
      result = result.slice(0, lastPeriod + 1)
    } else if (lastSpace > 0) {
      result = result.slice(0, lastSpace) + "..."
    } else {
      result = truncated.slice(0, EXCERPT_MAX_LENGTH - 3) + "..."
    }
  }
  result = stripIncompleteSentence(result)
  return result.trim()
}

export function sanitizeBody(body: string, title?: string): string {
  if (!body) return ""
  let result = body
  result = removeEscapedQuotes(result)
  result = removeMalformedChars(result)
  result = stripMalformedAIOutput(result)
  result = removeDuplicatedSentences(result)
  result = stripFrontmatterBlocks(result)
  if (title) {
    result = removeDuplicateBodyTitle(result, title)
  }
  result = normalizeWhitespace(result)
  return result.trim()
}

export function validateArticleContent(article: {
  title: string
  excerpt?: string
  body?: string
}): { valid: boolean; reason?: string } {
  const title = article.title?.trim() || ""
  if (!title || title.length < TITLE_MIN_LENGTH) {
    return { valid: false, reason: "title too short" }
  }
  if (hasExcessivePunctuation(title)) {
    return { valid: false, reason: "excessive punctuation in title" }
  }
  if (hasRepeatedPhrases(title)) {
    return { valid: false, reason: "repeated phrases in title" }
  }
  if (hasCorruptedUnicode(title)) {
    return { valid: false, reason: "corrupted unicode in title" }
  }
  const excerpt = article.excerpt || ""
  if (excerpt && hasCorruptedUnicode(excerpt)) {
    return { valid: false, reason: "corrupted unicode in excerpt" }
  }
  const body = article.body || ""
  if (body && body.length > 200 && hasMalformedMarkdown(body)) {
    return { valid: false, reason: "malformed markdown in body" }
  }
  return { valid: true }
}

export function cleanAIOutput(text: string): string {
  if (!text) return ""
  let result = text
  result = removeEscapedQuotes(result)
  result = removeMalformedChars(result)
  result = stripMalformedAIOutput(result)
  result = removeDuplicatedSentences(result)
  result = result.replace(/"\s+"/g, '"')
  result = result.replace(/'\s+'/g, "'")
  result = result.replace(/\b(AI|artificial intelligence|LLM)\s+(model|system|tool|platform)s?\b/gi, (match) => match)
  result = result.replace(/^(as an AI|as a language model|I'm an AI|I am an AI)[^.]*\./gim, "")
  result = normalizeWhitespace(result)
  return result.trim()
}

export function deduplicateArticles<T extends { title: string; slug?: string }>(
  articles: T[],
): T[] {
  const exactMatch = new Set<string>()
  const seenSlugs = new Set<string>()
  const normalizedList: { article: T; normalized: string }[] = []
  for (const article of articles) {
    if (!article.title) continue
    if (seenSlugs.has(article.slug || "")) continue
    const normalized = article.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim()
    if (normalized.length < 5) continue
    if (exactMatch.has(normalized)) continue
    exactMatch.add(normalized)
    if (article.slug) seenSlugs.add(article.slug)
    normalizedList.push({ article, normalized })
  }
  const result: T[] = []
  for (let i = 0; i < normalizedList.length; i++) {
    let isDuplicate = false
    for (let j = 0; j < i; j++) {
      if (cosineSimilarityWords(normalizedList[i].normalized, normalizedList[j].normalized) > 0.75) {
        isDuplicate = true
        break
      }
    }
    if (!isDuplicate) result.push(normalizedList[i].article)
  }
  return result
}

function cosineSimilarityWords(a: string, b: string): number {
  const wordsA = a.split(/\s+/).filter(Boolean)
  const wordsB = b.split(/\s+/).filter(Boolean)
  if (wordsA.length === 0 || wordsB.length === 0) return 0
  const freqA: Record<string, number> = {}
  const freqB: Record<string, number> = {}
  for (const w of wordsA) freqA[w] = (freqA[w] || 0) + 1
  for (const w of wordsB) freqB[w] = (freqB[w] || 0) + 1
  const allWords = new Set([...Object.keys(freqA), ...Object.keys(freqB)])
  let dot = 0
  let magA = 0
  let magB = 0
  for (const w of allWords) {
    const a = freqA[w] || 0
    const b = freqB[w] || 0
    dot += a * b
    magA += a * a
    magB += b * b
  }
  if (magA === 0 || magB === 0) return 0
  return dot / (Math.sqrt(magA) * Math.sqrt(magB))
}

export function safeString(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback
  const str = String(value)
  return str || fallback
}

export function safeNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined) return fallback
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}
