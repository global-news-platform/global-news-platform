function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, " ")
    .replace(/[^a-z0-9\s'-]/g, "")
    .split(/\s+/)
    .filter(Boolean)
}

function ngrams(tokens, n = 3) {
  const result = []
  for (let i = 0; i <= tokens.length - n; i++) {
    result.push(tokens.slice(i, i + n).join(" "))
  }
  return result
}

function jaccardSimilarity(setA, setB) {
  if (setA.size === 0 && setB.size === 0) return 0
  const intersection = new Set([...setA].filter((x) => setB.has(x)))
  const union = new Set([...setA, ...setB])
  return intersection.size / union.size
}

function longestCommonSubstring(a, b) {
  const maxLen = Math.min(a.length, b.length)
  for (let len = maxLen; len >= 3; len--) {
    for (let i = 0; i <= a.length - len; i++) {
      const sub = a.slice(i, i + len)
      if (b.includes(sub)) {
        const words = sub.split(" ").length
        if (words >= 4) return { match: sub, wordCount: words, length: len }
      }
    }
  }
  return null
}

function findRepeatedPhrases(text, minLen = 4, maxLen = 12) {
  const tokens = tokenize(text)
  const phrases = new Map()
  for (let n = minLen; n <= maxLen; n++) {
    const ngramList = ngrams(tokens, n)
    const seen = new Set()
    for (const phrase of ngramList) {
      if (seen.has(phrase)) {
        phrases.set(phrase, (phrases.get(phrase) || 1) + 1)
      } else {
        seen.add(phrase)
      }
    }
  }
  return [...phrases.entries()]
    .filter(([, count]) => count > 1)
    .sort(([, a], [, b]) => b - a)
}

export async function checkOriginality(rewritten, source) {
  const rewrittenTokens = tokenize(rewritten)
  const sourceTokens = tokenize(source)
  const rewrittenNgrams = new Set(ngrams(rewrittenTokens, 4))
  const sourceNgrams = new Set(ngrams(sourceTokens, 4))

  const similarity = jaccardSimilarity(rewrittenNgrams, sourceNgrams)
  const overlap = [...rewrittenNgrams].filter((x) => sourceNgrams.has(x))

  const repeatedPhrases = findRepeatedPhrases(rewritten)
  const repetitionPenalty = Math.min(repeatedPhrases.reduce((sum, [, c]) => sum + c, 0) * 0.05, 0.3)

  const lcs = longestCommonSubstring(
    rewritten.toLowerCase().replace(/<[^>]*>/g, " ").replace(/\s+/g, " "),
    source.toLowerCase().replace(/<[^>]*>/g, " ").replace(/\s+/g, " "),
  )

  let verbatimScore = 0
  if (lcs) {
    verbatimScore = Math.min(lcs.wordCount / 50, 1)
  }

  const score = Math.max(0, Math.min(1,
    1 - similarity * 0.6 - verbatimScore * 0.4 - repetitionPenalty,
  ))

  const verdict =
    score >= 0.8
      ? "pass"
      : score >= 0.5
        ? "warning"
        : "fail"

  return {
    score,
    verdict,
    similarityWithSource: similarity,
    verbatimMatch: lcs ? lcs.match : null,
    overlappingNgrams: overlap.length,
    repeatedPhrases: repeatedPhrases.slice(0, 10),
    issues: [
      ...(similarity > 0.3 ? [`High structural similarity with source (${(similarity * 100).toFixed(0)}%)`] : []),
      ...(lcs ? [`Verbatim match found: "${lcs.match.slice(0, 80)}..."`] : []),
      ...(repeatedPhrases.length > 3 ? [`${repeatedPhrases.length} repeated phrases detected`] : []),
    ],
  }
}

export async function checkDuplicates(rewritten, existingArticles) {
  const rewrittenTokens = tokenize(rewritten)
  const rewrittenNgrams = new Set(ngrams(rewrittenTokens, 5))

  const scores = []
  for (const article of existingArticles) {
    const existingTokens = tokenize(article.body || article.excerpt || "")
    const existingNgrams = new Set(ngrams(existingTokens, 5))
    const sim = jaccardSimilarity(rewrittenNgrams, existingNgrams)
    if (sim > 0.3) {
      scores.push({ slug: article.slug, title: article.title, similarity: sim })
    }
  }

  scores.sort((a, b) => b.similarity - a.similarity)
  return {
    hasDuplicates: scores.length > 0,
    duplicates: scores.slice(0, 5),
  }
}
