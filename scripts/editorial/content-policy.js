const UNVERIFIABLE_PATTERNS = [
  /\b(\d+)\s*(million|billion|trillion)\s*(people|users|customers)\b/i,
  /\b(studies|research|experts)\s+(show|suggest|indicate|find|reveal)\b(?!\s+(that|in|by)\s+\w)/i,
  /\baccording\s+to\s+(studies|research|reports)\b(?!\s+(by|from|published|released))/i,
]

const HALLUCINATION_PATTERNS = [
  /\b[a-z]+\s+said\s+(that\s+)?[""][^""]{50,}[""]/gi,
  /"(?:[^"]{10,})"\s*\w+\s+said/gi,
]

const SENSITIVE_NARRATIVES = [
  /\b(rigged|stolen|fraudulent)\s+(election|vote|ballot)\b/i,
  /\b(deep\s+state|globalist|new\s+world\s+order)\b/i,
  /\b(hoax|fake\s+news)\s+(?:about|regarding|on)\s+(?:climate|vaccine|virus|pandemic)\b/i,
  /\b(ethnic\s+cleansing|genocide)\b(?!\s+(investigation|trial|tribunal|indictment|charges))/i,
]

const SAFE_ATTRIBUTION_REQUIRED = [
  /\b\d+\s+(people|civilians|civilian)\s+(killed|died|dead)\b/i,
  /\b(attack|strike|bombing|assault)\s+(killed|left|resulted)\s+\d+/i,
]

export function checkPolicy(article, rewritten) {
  const text = rewritten || article.body || article.excerpt || ""
  const issues = []
  const warnings = []

  checkUnverifiableClaims(text, issues)
  checkHallucinatedQuotes(text, warnings)
  checkSensitiveNarratives(text, warnings)
  checkAttributionForSensitiveContent(text, issues)
  checkSourceOverlap(text, article, warnings)

  const passed = issues.length === 0

  return {
    passed,
    issues,
    warnings,
    score: calculatePolicyScore(issues, warnings),
    timestamp: new Date().toISOString(),
  }
}

function checkUnverifiableClaims(text, issues) {
  for (const pattern of UNVERIFIABLE_PATTERNS) {
    const matches = text.match(pattern)
    if (matches) {
      issues.push({
        type: "unverifiable_claim",
        severity: "high",
        message: `Unverifiable statistical claim: "${matches[0].slice(0, 80)}"`,
        match: matches[0],
      })
    }
  }
}

function checkHallucinatedQuotes(text, warnings) {
  for (const pattern of HALLUCINATION_PATTERNS) {
    const matches = text.match(pattern)
    if (matches) {
      warnings.push({
        type: "hallucinated_quote",
        severity: "medium",
        message: `Quote may be fabricated: "${matches[0].slice(0, 80)}..."`,
        match: matches[0],
      })
    }
  }
}

function checkSensitiveNarratives(text, warnings) {
  for (const pattern of SENSITIVE_NARRATIVES) {
    const matches = text.match(pattern)
    if (matches) {
      warnings.push({
        type: "sensitive_narrative",
        severity: "medium",
        message: `Sensitive narrative detected: "${matches[0].slice(0, 80)}"`,
        match: matches[0],
      })
    }
  }
}

function checkAttributionForSensitiveContent(text, issues) {
  for (const pattern of SAFE_ATTRIBUTION_REQUIRED) {
    const matches = text.match(pattern)
    if (matches) {
      const match = matches[0]
      const context = getContext(text, match)
      if (!hasProperAttribution(context)) {
        issues.push({
          type: "missing_attribution",
          severity: "high",
          message: `Casualty figures require source attribution: "${match.slice(0, 80)}"`,
          match,
        })
      }
    }
  }
}

function checkSourceOverlap(text, article, warnings) {
  if (!article.source) return
  const source = article.source.toLowerCase()
  const textLower = text.toLowerCase()

  const sourceInText = source.length > 3 && textLower.includes(source)
  if (!sourceInText && article.body && article.body.length > 200) {
    warnings.push({
      type: "missing_attribution",
      severity: "low",
      message: `Article uses data from ${article.source} but does not name the source in the rewritten body`,
    })
  }
}

function getContext(text, match, contextChars = 100) {
  const idx = text.indexOf(match)
  if (idx === -1) return text
  const start = Math.max(0, idx - contextChars)
  const end = Math.min(text.length, idx + match.length + contextChars)
  return text.slice(start, end)
}

function hasProperAttribution(context) {
  const attributionPatterns = [
    /\baccording\s+to\b/i,
    /\b(reported|confirmed|stated|said)\s+(by|that)\b/i,
    /\bsources?\s+(say|said|reported|confirmed|indicated)\b/i,
    /\bofficials?\s+(say|said|reported|confirmed|stated)\b/i,
    /\b(ministry|government|military|police|hospital)\s+(said|reported|confirmed|stated)\b/i,
    /\b(UN|WHO|Red\s+Cross|Amnesty|Human\s+Rights\s+Watch)\b/i,
    /\bciting\b/i,
  ]
  return attributionPatterns.some((p) => p.test(context))
}

function calculatePolicyScore(issues, warnings) {
  let score = 100
  for (const i of issues) {
    score -= i.severity === "high" ? 25 : i.severity === "medium" ? 15 : 5
  }
  for (const w of warnings) {
    score -= w.severity === "high" ? 15 : w.severity === "medium" ? 8 : 3
  }
  return Math.max(0, score)
}
