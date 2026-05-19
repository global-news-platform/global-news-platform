/**
 * Premium Editorial Article Rewriting Engine
 * ============================================
 * Local (no-AI) editorial-quality article rewriting.
 * Transforms raw RSS content into:
 *   - Reuters-style inverted pyramid
 *   - Bloomberg analytical depth
 *   - BBC explanatory narrative
 *   - Financial Times professional rigor
 *
 * No external APIs required — runs entirely locally.
 */

const path = require("path")

// ============================================================
// TONE ENGINE
// ============================================================

const EDITORIAL_TONES = {
  neutral: {
    name: "Reuters-style",
    label: "neutral",
    style: "inverted-pyramid",
    ledeStyle: "direct",
    sentenceLength: "short-to-medium",
    attribution: "lead",
    vocabulary: "standard",
    transitions: "journalistic",
    firstSentenceType: "fact-first",
  },
  analytical: {
    name: "Bloomberg-style",
    label: "analytical",
    style: "analytical-lede",
    ledeStyle: "context-first",
    sentenceLength: "medium-to-long",
    attribution: "embedded",
    vocabulary: "precise-financial",
    transitions: "analytical-flow",
    firstSentenceType: "significance-first",
  },
  explanatory: {
    name: "BBC-style",
    label: "explanatory",
    style: "context-before-lead",
    ledeStyle: "backgrounder",
    sentenceLength: "varied",
    attribution: "balanced",
    vocabulary: "standard-with-explanation",
    transitions: "narrative-flow",
    firstSentenceType: "context-first",
  },
  professional: {
    name: "Financial Times-style",
    label: "professional",
    style: "formal-lede",
    ledeStyle: "thesis-first",
    sentenceLength: "formal",
    attribution: "precise",
    vocabulary: "formal-business",
    transitions: "structured-flow",
    firstSentenceType: "thesis-first",
  },
  modern: {
    name: "Digital Journalism",
    label: "modern",
    style: "engaging-hook",
    ledeStyle: "hook-first",
    sentenceLength: "short-to-medium",
    attribution: "integrated",
    vocabulary: "contemporary",
    transitions: "natural-flow",
    firstSentenceType: "hook-first",
  },
}

// ============================================================
// OPENING PATTERNS
// ============================================================

const LEDE_PATTERNS = [
  // Significance-first (Bloomberg/Reuters)
  (headline, excerpt) => `${headline}, a development that ${signalSignificance(headline)}.`,
  (headline, excerpt) => `In a move that ${implicationVerb(headline)} ${headline.toLowerCase()}, ${contextualFraming(headline)}.`,
  (headline, excerpt) => `${headline} — marking the latest sign that ${broaderTrend(headline)}.`,
  // Context-first (BBC)
  (headline, excerpt) => `${contextualFraming(headline)}, ${headline.toLowerCase()} has ${developmentVerb()}.`,
  (headline, excerpt) => `The ${headline.toLowerCase()} underscores a growing ${trendNoun()} in ${relevantSector(headline)}.`,
  (headline, excerpt) => `${headline}, according to ${sourceAttribution()}, reflecting ${broaderImplication(headline)}.`,
  // Hook-first (Modern)
  (headline, excerpt) => `${headline}. The ${nounPhrase(headline)} comes as ${broaderTrend(headline)}.`,
  (headline, excerpt) => `For ${stakeholderGroup(headline)}, ${headline.toLowerCase()} represents a pivotal shift in ${relevantDomain(headline)}.`,
  (headline, excerpt) => `${hookPhrase(headline)} ${headline.toLowerCase()}, reshaping ${relevantDomain(headline)}.`,
]

function signalSignificance(headline) {
  const h = headline.toLowerCase()
  if (h.includes("crisis") || h.includes("war") || h.includes("attack")) return "could reshape global stability"
  if (h.includes("market") || h.includes("econom") || h.includes("trade")) return "signals a shift in global economic dynamics"
  if (h.includes("tech") || h.includes("ai") || h.includes("digital")) return "marks a turning point in technological innovation"
  if (h.includes("climate") || h.includes("environment")) return "underscores the accelerating impact of climate change"
  if (h.includes("health") || h.includes("disease") || h.includes("medical")) return "has significant implications for public health"
  if (h.includes("polit") || h.includes("elect") || h.includes("govern")) return "could alter the political landscape"
  if (h.includes("scien") || h.includes("research") || h.includes("study")) return "advances our understanding of a critical field"
  return "carries significant implications for the sector"
}

function implicationVerb(headline) {
  const h = headline.toLowerCase()
  if (h.includes("crisis") || h.includes("war")) return "threatens to"
  if (h.includes("market") || h.includes("econom")) return "is expected to"
  if (h.includes("tech") || h.includes("ai")) return "promises to"
  if (h.includes("climate")) return "is poised to"
  if (h.includes("health") || h.includes("disease")) return "could"
  return "stands to"
}

function contextualFraming(headline) {
  const h = headline.toLowerCase()
  if (h.includes("trump") || h.includes("biden") || h.includes("putin")) return "amid ongoing geopolitical tensions"
  if (h.includes("market") || h.includes("econom") || h.includes("infla")) return "as global markets navigate uncertainty"
  if (h.includes("tech") || h.includes("ai") || h.includes("digital")) return "as the technology sector undergoes rapid transformation"
  if (h.includes("climate") || h.includes("emission")) return "with the window for climate action narrowing"
  if (h.includes("health") || h.includes("pandemic") || h.includes("virus")) return "against a backdrop of evolving public health challenges"
  if (h.includes("polit") || h.includes("elect") || h.includes("congress")) return "with political fault lines deepening"
  return "in a rapidly evolving landscape"
}

function broaderTrend(headline) {
  const h = headline.toLowerCase()
  if (h.includes("econom") || h.includes("market") || h.includes("infla")) return "the global economic recovery remains uneven"
  if (h.includes("tech") || h.includes("ai")) return "artificial intelligence is reshaping traditional industries"
  if (h.includes("climate") || h.includes("environment") || h.includes("energy")) return "the transition to a low-carbon economy is accelerating"
  if (h.includes("polit") || h.includes("elect") || h.includes("govern")) return "political polarization continues to intensify"
  if (h.includes("health") || h.includes("medical")) return "healthcare systems worldwide are adapting to new challenges"
  if (h.includes("trade") || h.includes("tariff")) return "global trade relationships are being fundamentally redrawn"
  if (h.includes("war") || h.includes("conflict") || h.includes("military")) return "geopolitical tensions are approaching a critical juncture"
  return "long-standing industry dynamics are shifting"
}

function developmentVerb() {
  const verbs = ["emerged as a pivotal issue", "become a focal point of debate", "drawn increased scrutiny", "gained renewed urgency", "sparked intense discussion"]
  return verbs[Math.floor(Math.random() * verbs.length)]
}

function trendNoun() {
  const nouns = ["trend", "pattern", "dynamic", "shift", "movement"]
  return nouns[Math.floor(Math.random() * nouns.length)]
}

function relevantSector(headline) {
  const h = headline.toLowerCase()
  if (h.includes("tech") || h.includes("ai") || h.includes("digital")) return "technology"
  if (h.includes("econom") || h.includes("market") || h.includes("bank")) return "financial services"
  if (h.includes("health") || h.includes("medic")) return "healthcare"
  if (h.includes("energy") || h.includes("climate") || h.includes("oil")) return "energy sector"
  if (h.includes("polit") || h.includes("govern")) return "governance"
  if (h.includes("trade") || h.includes("tariff")) return "international trade"
  if (h.includes("science") || h.includes("research")) return "scientific community"
  return "the sector"
}

function sourceAttribution() {
  const sources = ["officials familiar with the matter", "people briefed on the discussions", "a person with direct knowledge of the situation", "industry analysts tracking the development", "multiple sources with insight into the process"]
  return sources[Math.floor(Math.random() * sources.length)]
}

function broaderImplication(headline) {
  const h = headline.toLowerCase()
  if (h.includes("econom") || h.includes("market")) return "broader economic concerns"
  if (h.includes("tech")) return "the accelerating pace of digital transformation"
  if (h.includes("climate")) return "growing environmental pressures"
  if (h.includes("polit")) return "deepening political divisions"
  if (h.includes("health")) return "evolving public health priorities"
  return "wider industry trends"
}

function nounPhrase(headline) {
  const h = headline.toLowerCase()
  if (h.includes(" crisis")) return "development"
  if (h.includes(" report") || h.includes(" study")) return "finding"
  if (h.includes(" announce") || h.includes(" launch")) return "announcement"
  if (h.includes(" agreement") || h.includes(" deal")) return "agreement"
  if (h.includes(" attack") || h.includes(" strike")) return "incident"
  return "news"
}

function stakeholderGroup(headline) {
  const h = headline.toLowerCase()
  if (h.includes("tech") || h.includes("ai")) return "technology firms and investors"
  if (h.includes("econom") || h.includes("market") || h.includes("trade")) return "business leaders and policymakers"
  if (h.includes("climate") || h.includes("environment")) return "environmental advocates and industry"
  if (h.includes("health") || h.includes("medical")) return "healthcare professionals and patients"
  if (h.includes("polit") || h.includes("elect")) return "political stakeholders and voters"
  if (h.includes("science") || h.includes("research")) return "researchers and academics"
  return "industry observers"
}

function relevantDomain(headline) {
  const h = headline.toLowerCase()
  if (h.includes("tech") || h.includes("ai")) return "the technology landscape"
  if (h.includes("econom") || h.includes("market") || h.includes("trade")) return "the global economy"
  if (h.includes("climate") || h.includes("environment")) return "environmental policy"
  if (h.includes("health") || h.includes("medical")) return "healthcare delivery"
  if (h.includes("polit") || h.includes("elect")) return "the political landscape"
  return "the industry"
}

function hookPhrase(headline) {
  const h = headline.toLowerCase()
  if (h.includes("crisis") || h.includes("war") || h.includes("attack")) return "A dramatic escalation in"
  if (h.includes("market") || h.includes("econom") || h.includes("trade")) return "A significant shift in"
  if (h.includes("tech") || h.includes("ai")) return "A groundbreaking development in"
  if (h.includes("science") || h.includes("research")) return "A remarkable advance in"
  if (h.includes("climate") || h.includes("environment")) return "An urgent new chapter in"
  if (h.includes("health") || h.includes("medical")) return "A critical development in"
  return "A significant development in"
}

// ============================================================
// TRANSITION PATTERNS
// ============================================================

const TRANSITIONS = {
  journalistic: [
    "The development comes as", "According to officials,", "In a related context,",
    "The situation underscores", "Industry observers note that", "This marks the latest",
    "The announcement follows", "Analysts point out that", "Speaking on background,",
    "The broader context includes", "What makes this significant is", "The timing is notable because",
  ],
  analytical: [
    "What sets this apart is", "The strategic implications are significant:", "Digging deeper,",
    "This fits into a broader pattern of", "From a market perspective,", "The underlying dynamic involves",
    "A closer examination reveals", "The calculus appears to be", "This represents a departure from",
    "The trajectory suggests", "For context,", "Importantly,",
  ],
  "narrative-flow": [
    "The background to this involves", "To understand this, it helps to know that",
    "This matters because", "Looking more broadly,", "The roots of this go back to",
    "What changed is that", "The situation has been evolving", "It is worth noting that",
    "The impact is already being felt", "Questions remain about", "The full picture includes",
  ],
  "structured-flow": [
    "Furthermore,", "In addition,", "The data underscores this:",
    "A key factor is", "This is compounded by", "The implications extend to",
    "Within this context,", "Notably,", "The evidence points to",
    "On a broader level,", "This aligns with", "Countervailing factors include",
  ],
  "natural-flow": [
    "That said,", "Meanwhile,", "The bigger picture:",
    "Here is how it unfolds:", "The thing is,", "What this means in practice:",
    "To put this in perspective,", "Consider this:", "The counterpoint:",
    "Along the same lines,", "On the flip side,", "Here is the context:",
  ],
}

// ============================================================
// AI PATTERN REDUCTION
// ============================================================

const AI_TRANSITIONS = [
  /\bhowever,?(?=\s)/gi,
  /\bmoreover,?(?=\s)/gi,
  /\bfurthermore,?(?=\s)/gi,
  /\bnevertheless,?(?=\s)/gi,
  /\bnonetheless,?(?=\s)/gi,
  /\badditionally,?(?=\s)/gi,
  /\bconsequently,?(?=\s)/gi,
  /\bthus[,.]?(?=\s)/gi,
]

const TRANSITION_REPLACEMENTS = {
  "however,": ["That said,", "Yet", "Still,", "But", "Even so,", "Despite this,"],
  "moreover,": ["Beyond that,", "What is more,", "On top of this,", "Additionally,", "Beyond this,"],
  "furthermore,": ["In addition,", "Beyond this,", "Also,", "What is more,", "Adding to this,"],
  "nevertheless,": ["Even so,", "That said,", "Still,", "Nonetheless,", "This notwithstanding,"],
  "nonetheless,": ["Still,", "That said,", "Even so,", "Despite this,", "Yet"],
  "additionally,": ["In addition,", "Also,", "Beyond this,", "Along the same lines,", "What is more,"],
  "consequently,": ["As a result,", "Because of this,", "This means that", "The upshot:", "This led to"],
  "thus": ["so", "as a result", "this means", "therefore", "accordingly"],
}

// AI cliché sentences that should be removed entirely
const AI_FILLER_SENTENCES = [
  /^in conclusion,?\s/i,
  /^in summary,?\s/i,
  /^it is important to note( that)?,?\s/i,
  /^it is worth noting( that)?,?\s/i,
  /^as previously mentioned,?\s/i,
  /^as discussed earlier,?\s/i,
  /^it remains to be seen\s/i,
  /^only time will tell\s/i,
  /^the fact of the matter is/i,
  /^as we have seen,?\s/i,
  /^in this article,?\s+we\s/i,
  /^let'?s\s+(explore|dive|take|look)\s/i,
  /^when it comes to\s/i,
]

// Mid-sentence AI replacements — replacement must be non-empty and flow naturally
const AI_PHRASE_REPLACEMENTS = [
  [/\bin conclusion\b,?\s*/gi, ''],
  [/\bin summary\b,?\s*/gi, ''],
  [/\bit is important to note\b( that)?,?\s*/gi, ''],
  [/\bit is worth noting\b( that)?,?\s*/gi, ''],
  [/\bas previously mentioned\b,?\s*/gi, ''],
  [/\bas discussed earlier\b,?\s*/gi, ''],
  [/\bas we have seen\b,?\s*/gi, ''],
  [/\bin today'?s\s+(digital\s+)?world\b,?\s*/gi, 'Today, '],
  [/\bwhen it comes to\b/gi, 'regarding'],
  [/\bin the realm of\b/gi, 'in'],
  [/\ba double-edged sword\b/gi, 'a source of both promise and concern'],
  [/\bit remains to be seen\b/gi, 'uncertainty remains about'],
  [/\bonly time will tell\b/gi, 'the outcome is uncertain'],
  [/\bthe landscape\b(?:\s+of)?/gi, (m) => / of$/i.test(m) ? 'the environment of' : 'the environment'],
  [/\ba wide range of\b/gi, 'a broad set of'],
  [/\bthe fact of the matter\b/gi, 'the reality'],
  [/\bin the ever-evolving\b/gi, 'in the rapidly changing'],
  [/\bin this article,?\s+we\b/gi, 'this analysis'],
  [/\bit is crucial to\b/gi, 'it is critical to'],
  [/\bit is essential to\b/gi, 'it is critical to'],
  [/\bthe future of\b/gi, 'the trajectory of'],
  [/\bthe world of\b/gi, ''],
  [/\ba myriad of\b/gi, 'many'],
  [/\bnavigate the\b/gi, 'address the'],
  [/\bdelve into\b/gi, 'examine'],
  [/\blet'?s\s+(explore|dive|take|look)\b/gi, ''],
]

// ============================================================
// CONTEXTUAL DEPTH TEMPLATES
// ============================================================

function generateContextSentence(headline, category) {
  const h = headline.toLowerCase()
  const cat = (category || "").toLowerCase()

  if (cat === "politics" || cat === "world") {
    return `The development comes amid heightened geopolitical sensitivity, with analysts closely monitoring its potential ripple effects across diplomatic channels.`
  }
  if (cat === "business" || cat === "economy") {
    return `Market participants are assessing the broader economic implications, with the development potentially influencing investor sentiment and sector dynamics.`
  }
  if (cat === "technology") {
    return `The announcement adds to an accelerating pace of innovation in the sector, where competitive pressures continue to drive rapid technological advancement.`
  }
  if (cat === "science") {
    return `The finding contributes to a growing body of research that is gradually reshaping scientific understanding in this field.`
  }
  if (cat === "health") {
    return `Public health experts are evaluating the implications, balancing potential benefits against established protocols and clinical evidence.`
  }
  if (cat === "climate") {
    return `The development adds urgency to the broader conversation about environmental stewardship and the transition to sustainable practices.`
  }
  if (cat === "sports") {
    return `The outcome has significant implications for the competitive landscape, potentially reshaping strategies and expectations for the season ahead.`
  }
  if (cat === "culture") {
    return `The news has resonated across cultural circles, sparking discussion about its broader significance and lasting impact.`
  }
  return `The implications extend beyond the immediate news, touching on broader trends that observers say merit close attention.`
}

function generateClosingContext(headline, category) {
  const h = headline.toLowerCase()
  const cat = (category || "").toLowerCase()

  if (cat === "politics" || cat === "world") {
    return `As events continue to unfold, the broader implications for international relations and domestic policy remain subjects of active debate among analysts and policymakers alike.`
  }
  if (cat === "business" || cat === "economy") {
    return `Market participants will be watching closely for further developments, with the potential for cascading effects across related sectors and asset classes in the weeks ahead.`
  }
  if (cat === "technology") {
    return `Industry observers say the development could accelerate existing trends, potentially reshaping competitive dynamics and consumer expectations in the technology sector.`
  }
  if (cat === "science") {
    return `Researchers emphasize that while the findings are significant, further study will be needed to fully understand the implications and potential applications.`
  }
  if (cat === "health") {
    return `Health officials continue to monitor the situation closely, with further guidance expected as more data becomes available and clinical assessments are completed.`
  }
  if (cat === "climate") {
    return `Environmental advocates and industry leaders alike acknowledge that the path forward requires continued collaboration and sustained commitment to measurable outcomes.`
  }
  return `Observers say the full impact of these developments will become clearer in the coming weeks, as stakeholders assess the implications and adjust their strategies accordingly.`
}

// ============================================================
// SENTENCE REWRITING
// ============================================================

function varySentenceLength(sentences) {
  if (sentences.length < 3) return sentences
  const result = []
  for (let i = 0; i < sentences.length; i++) {
    const words = sentences[i].split(/\s+/)
    // Occasionally split long sentences
    if (words.length > 25 && Math.random() < 0.3) {
      const mid = Math.floor(words.length / 2)
      result.push(words.slice(0, mid).join(" "))
      result.push(words.slice(mid).join(" "))
    } else {
      result.push(sentences[i])
    }
  }
  // Occasionally combine short consecutive sentences
  const final = []
  for (let i = 0; i < result.length; i++) {
    const wordCount = result[i].split(/\s+/).length
    if (i < result.length - 1 && wordCount < 10 && result[i + 1].split(/\s+/).length < 12 && Math.random() < 0.4) {
      final.push(result[i] + " " + result[i + 1].toLowerCase())
      i++ // skip next
    } else {
      final.push(result[i])
    }
  }
  return final
}

function removeAIPatterns(text) {
  if (!text) return ""

  // Protect decimal numbers from being split at the period
  const protected = text.replace(/(\d)\.(\d)/g, "$1<DECIMAL>$2")

  // Split into sentences for sentence-level detection
  const sentences = protected.match(/(?:[^.!?]+[.!?]+|$)/g) || [protected]

  const cleaned = sentences.map(sentence => {
    let s = sentence.trim()
    if (!s) return ""

    // Check for AI filler sentences — remove entirely
    const lower = s.toLowerCase()
    for (const pattern of AI_FILLER_SENTENCES) {
      if (pattern.test(lower)) return ""
    }

    // Apply mid-sentence phrase replacements
    for (const [pattern, replacement] of AI_PHRASE_REPLACEMENTS) {
      s = s.replace(pattern, replacement)
    }

    // Replace repetitive AI transitions (Furthermore, Moreover, etc.)
    for (const pattern of AI_TRANSITIONS) {
      s = s.replace(pattern, (match) => {
        const m = match.toLowerCase().trim()
        for (const [key, replacements] of Object.entries(TRANSITION_REPLACEMENTS)) {
          if (m.startsWith(key)) {
            const r = replacements[Math.floor(Math.random() * replacements.length)]
            const isStart = match[0] === match[0].toUpperCase()
            return isStart ? r.charAt(0).toUpperCase() + r.slice(1) : r
          }
        }
        return match
      })
    }

    // Cleanup artifacts
    s = s.replace(/\s*,\s*/g, ", ")
    s = s.replace(/\s*\.\s*/g, ". ")
    s = s.replace(/\s{3,}/g, " ")
    s = s.replace(/\s+([.!?:;])/g, "$1")
    s = s.replace(/^[,\s]+/, "")
    s = s.replace(/[,\s]+$/, "")
    s = s.replace(/\.+,/g, ".")
    s = s.replace(/,\./g, ".")
    s = s.replace(/\s{2,}/g, " ")

    s = s.trim()
    if (s) {
      s = s[0].toUpperCase() + s.slice(1)
    }
    return s.replace(/<DECIMAL>/g, ".")
  })

  const result = cleaned.filter(Boolean).join(" ")

  return result
}

function insertTransition(array, tone = "neutral") {
  if (array.length < 3) return array
  const style = EDITORIAL_TONES[tone] || EDITORIAL_TONES.neutral
  const pool = TRANSITIONS[style.transitions] || TRANSITIONS.journalistic

  // Insert transitions before paragraphs 2 and 3 (occasionally)
  const indices = []
  if (array.length > 2) indices.push(1)
  if (array.length > 3 && Math.random() < 0.6) indices.push(2)

  for (const idx of indices.sort((a, b) => b - a)) {
    const transition = pool[Math.floor(Math.random() * pool.length)]
    const sentence = array[idx]
    // Don't add transition if sentence already starts with one
    const startsWithTransition = pool.some(t => sentence.toLowerCase().startsWith(t.toLowerCase().slice(0, 8)))
    if (!startsWithTransition) {
      array[idx] = transition + " " + sentence.charAt(0).toLowerCase() + sentence.slice(1)
    }
  }
  return array
}

// ============================================================
// PARAGRAPH STRUCTURING
// ============================================================

function structureParagraphs(sentences) {
  if (sentences.length === 0) return []
  if (sentences.length <= 3) return [sentences.join(" ")]

  const paragraphs = []
  const intro = sentences.slice(0, 2).join(" ")
  paragraphs.push(intro)

  // Group remaining into paragraphs of 2-4 sentences
  let i = 2
  while (i < sentences.length) {
    const paraSize = 2 + Math.floor(Math.random() * 3) // 2-4 sentences
    const para = sentences.slice(i, i + paraSize).join(" ")
    if (para.trim()) paragraphs.push(para)
    i += paraSize
  }

  return paragraphs
}

// ============================================================
// MAIN EDITORIAL WRITING FUNCTIONS
// ============================================================

function generateIntroduction(headline, excerpt) {
  const pattern = LEDE_PATTERNS[Math.floor(Math.random() * LEDE_PATTERNS.length)]
  try {
    return pattern(headline, excerpt || "")
  } catch {
    return `${headline}. This development carries significant implications for the sector and comes at a pivotal moment.`
  }
}

function rewriteArticle(article, { tone = "neutral" } = {}) {
  const headline = article.title || ""
  const text = article.body || article.excerpt || ""
  const category = article.category || ""

  const clean = text
    .replace(/<[^>]*>/g, "")
    .replace(/\[.*?\]\(.*?\)/g, "")
    .replace(/\s+/g, " ")
    .trim()

  let sentences = splitSentences(clean)
  if (sentences.length < 2) return { body: text }

  // Step 1: Generate editorial introduction
  const intro = generateIntroduction(headline, article.excerpt || sentences[0])

  // Step 2: Select key sentences from body (skip first if redundant with intro)
  const bodySentences = sentences.slice(0)
  
  // Remove excerpt duplicates from body
  if (article.excerpt) {
    const excerptLower = article.excerpt.toLowerCase().slice(0, 60)
    for (let i = bodySentences.length - 1; i >= 0; i--) {
      if (bodySentences[i].toLowerCase().startsWith(excerptLower)) {
        bodySentences.splice(i, 1)
      }
    }
  }
  
  const selected = selectKeySentences(bodySentences, headline)

  // Step 3: Vary sentence length
  const varied = varySentenceLength(selected)

  // Step 4: Insert natural transitions
  const withTransitions = insertTransition(varied, tone)

  // Step 5: Add context paragraph
  const contextPara = generateContextSentence(headline, category)

  // Step 6: Generate closing
  const closing = generateClosingContext(headline, category)

  // Step 7: Structure into paragraphs
  const allSentences = [intro, ...withTransitions]
  const paragraphs = structureParagraphs(allSentences.filter(Boolean))

  // Insert context paragraph after first paragraph
  if (paragraphs.length > 1) {
    paragraphs.splice(1, 0, contextPara)
  } else {
    paragraphs.push(contextPara)
  }

  // Add closing
  paragraphs.push(closing)

  // Step 8: Remove AI patterns from final text
  let finalBody = paragraphs.map(p => removeAIPatterns(p)).join("\n\n")

  // Step 9: Remove duplicate paragraphs
  const paraSet = new Set()
  const uniqueParas = []
  for (const p of finalBody.split("\n\n")) {
    const key = p.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 80)
    if (!paraSet.has(key) && p.trim()) {
      paraSet.add(key)
      uniqueParas.push(p)
    }
  }
  finalBody = uniqueParas.join("\n\n")

  // Step 10: Remove trailing "Related Stories" sections
  finalBody = finalBody.replace(/\n+#+#?\s*Related Stories?\s*[\s\S]*$/i, "").trim()

  return {
    body: finalBody,
    wordCount: finalBody.split(/\s+/).length,
    paragraphs: uniqueParas.length,
  }
}

function selectKeySentences(sentences, headline) {
  if (sentences.length <= 6) return sentences

  const keywords = extractKeywords(headline + " " + sentences.slice(0, 3).join(" "), 6)

  // Score each sentence for relevance + diversity
  const scored = sentences.map((s, i) => {
    const lower = s.toLowerCase()
    let score = 0
    for (const kw of keywords) {
      if (lower.includes(kw)) score += 2
    }
    if (/\d+/.test(s)) score += 1
    if (/["'""]/.test(s)) score += 1
    // Position bonus for early sentences
    if (i < 3) score += 1.5
    return { sentence: s, score, index: i, words: s.split(/\s+/).length }
  })

  // Select 4-8 sentences with best score diversity
  scored.sort((a, b) => b.score - a.score)
  const selected = []
  const usedKeywords = new Set()

  for (const item of scored) {
    if (selected.length >= 8) break
    const lower = item.sentence.toLowerCase()
    const hasNewInfo = !keywords.some(k => lower.includes(k) && usedKeywords.has(k))
    if (hasNewInfo || selected.length < 4) {
      selected.push(item)
      for (const kw of keywords) {
        if (lower.includes(kw)) usedKeywords.add(kw)
      }
    }
  }

  // Sort by original position
  selected.sort((a, b) => a.index - b.index)
  return selected.map(s => s.sentence)
}

// ============================================================
// EXPORTED UTILITIES (backward compatible)
// ============================================================

function splitSentences(text) {
  if (!text) return []
  // Protect decimal numbers from being split at the period
  const protected = text
    .replace(/\n+/g, " ")
    .replace(/\.\.\./g, ".")
    .replace(/(\d)\.(\d)/g, "$1<DECIMAL>$2")
  // Also protect abbreviations like "Dr." "Mr." "Ms." "St." "vs." "Co." "Inc." "Ltd." "No."
  const cleaned = protected

  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20)
    .map((s) => s.replace(/<DECIMAL>/g, "."))

  return sentences
}

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "by", "with", "from", "as", "is", "was", "are", "were", "been",
  "being", "have", "has", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "shall", "can", "need", "dare",
  "ought", "used", "this", "that", "these", "those", "it", "its", "they",
  "them", "their", "he", "she", "his", "her", "him", "we", "you", "i",
  "me", "my", "our", "your", "not", "no", "nor", "so", "if", "then",
  "than", "too", "very", "just", "about", "also", "more", "some", "any",
])

function extractKeywords(text, max = 8) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w))

  const freq = {}
  for (const w of words) freq[w] = (freq[w] || 0) + 1

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([w]) => w)
}

function summarize(text, maxSentences = 3) {
  // Legacy wrapper — now an alias for concise editorial extraction
  if (!text || text.trim().length < 50) return text
  const sentences = splitSentences(text)
  if (sentences.length <= maxSentences) return sentences.join(" ").slice(0, 300)

  const keywords = extractKeywords(text)
  const scored = sentences.map((s, i) => ({
    sentence: s,
    score: keywordScore(s, keywords) + (i === 0 ? 3 : 0) + (i < 3 ? 1 : 0),
  }))

  scored.sort((a, b) => b.score - a.score)
  const top = scored.slice(0, maxSentences)
  top.sort((a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence))

  return top.map((s) => s.sentence).join(" ").slice(0, 300)
}

function keywordScore(sentence, keywords) {
  const lower = sentence.toLowerCase()
  let score = 0
  for (const kw of keywords) {
    if (lower.includes(kw)) score += 2
  }
  const words = lower.split(/\s+/).length
  if (words < 5) score -= 1
  if (words > 40) score -= 1
  if (/\d+/.test(lower)) score += 0.5
  if (/["'""]/.test(lower)) score += 0.5
  return score
}

function generateSEOTitle(title, keywords) {
  let seoTitle = title
    .replace(/(^|\s)(A|An|The)(\s)/gi, "$1$3")
    .trim()

  if (keywords.length > 0) {
    const hasKeyword = keywords.some((kw) => seoTitle.toLowerCase().includes(kw))
    if (!hasKeyword) {
      seoTitle = `${seoTitle}: ${keywords.slice(0, 2).join(" & ")}`
    }
  }

  if (seoTitle.length > 110) seoTitle = seoTitle.slice(0, 107) + "..."
  return seoTitle
}

function generateMetaDescription(text, maxLength = 160) {
  const clean = text.replace(/\s+/g, " ").trim()
  if (clean.length <= maxLength) return clean

  const truncated = clean.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(" ")
  const lastPeriod = truncated.lastIndexOf(".")

  const breakPoint = lastPeriod > maxLength * 0.6 ? lastPeriod + 1 : lastSpace
  return truncated.slice(0, breakPoint > 0 ? breakPoint : maxLength - 3) + "..."
}

function generateSocialHeadline(title) {
  let headline = title
  if (headline.length > 100) {
    headline = headline.slice(0, 97) + "..."
  }
  return headline
}

function estimateReadingTime(text) {
  const words = text.split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

function detectLanguage(text) {
  const lower = text.toLowerCase()
  const englishIndicators = ["the", "and", "for", "are", "but", "not", "you", "all", "can"]
  let score = 0
  for (const word of englishIndicators) {
    if (lower.includes(word)) score++
  }
  return score > 5 ? "en" : "unknown"
}

module.exports = {
  rewriteArticle,
  generateIntroduction,
  removeAIPatterns,
  splitSentences,
  extractKeywords,
  summarize,
  generateSEOTitle,
  generateMetaDescription,
  generateSocialHeadline,
  estimateReadingTime,
  detectLanguage,
  EDITORIAL_TONES,
}
