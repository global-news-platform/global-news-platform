const SOURCE_ATTRIBUTION_PATTERNS = {
  reuters: [
    "According to Reuters reporting,",
    "Reuters journalists reported that",
    "The Reuters news agency reported",
    "Citing Reuters sources,",
  ],
  "associated press": [
    "The Associated Press reported",
    "According to AP News,",
    "AP reporters on the scene noted",
    "The Associated Press cited",
  ],
  ap: [
    "The Associated Press reported",
    "According to AP News,",
    "AP reporters on the scene noted",
    "The Associated Press cited",
  ],
  bbc: [
    "BBC News reported that",
    "According to BBC reporting,",
    "BBC correspondents noted",
    "The BBC's coverage indicated",
  ],
  "the guardian": [
    "The Guardian reported",
    "According to Guardian reporting,",
    "Guardian journalists noted",
  ],
  "new york times": [
    "The New York Times reported",
    "According to NYT reporting,",
    "New York Times journalists noted",
  ],
  bloomberg: [
    "Bloomberg reported",
    "According to Bloomberg,",
    "Bloomberg News reported that",
  ],
  "al jazeera": [
    "Al Jazeera reported",
    "According to Al Jazeera's coverage,",
    "Al Jazeera journalists on the ground reported",
  ],
  "wall street journal": [
    "The Wall Street Journal reported",
    "According to WSJ reporting,",
    "Wall Street Journal sources indicated",
  ],
  washington: [
    "The Washington Post reported",
    "According to Washington Post reporting,",
    "Post journalists reported",
  ],
  cnn: [
    "CNN reported",
    "According to CNN's reporting,",
    "CNN sources confirmed",
  ],
  npr: [
    "NPR reported",
    "According to NPR's coverage,",
    "NPR journalists reported",
  ],
}

const DEFAULT_PATTERNS = [
  "According to reports,",
  "News agencies reported that",
  "Journalists on the scene reported",
  "Reports indicate that",
  "Sources confirmed that",
]

export function generateAttribution(source, facts) {
  const patterns = findPatterns(source)
  const statements = facts.statements || []

  let attribution = ""
  if (statements.length > 0) {
    const stmt = statements[0]
    if (stmt.speaker && stmt.statement) {
      attribution = `${stmt.speaker} stated that ${stmt.statement}`
    }
  }

  if (!attribution && patterns.length > 0) {
    attribution = randomItem(patterns)
  }

  if (!attribution) {
    attribution = randomItem(DEFAULT_PATTERNS)
  }

  return attribution
}

const CURRENCY_PATTERNS = [
  "According to {source},",
  "In a report by {source},",
  "As reported by {source},",
  "{source} journalists reported that",
  "Citing {source} reporting,",
]

export function insertAttributions(text, source, { frequency = "moderate" } = {}) {
  const sourceName = normalizeSourceName(source)
  const pattern = randomItem(CURRENCY_PATTERNS).replace("{source}", sourceName)
  const sentences = text.split(/(?<=[.!?])\s+/)
  const interval = frequency === "high" ? 2 : frequency === "low" ? 5 : 3
  const attributedSentences = sentences.map((s, i) => {
    if (i > 0 && i % interval === 0 && s.length > 40 && !s.toLowerCase().includes(sourceName.toLowerCase())) {
      const phrases = [
        `${randomItem(findPatterns(source) || DEFAULT_PATTERNS)} ${s.charAt(0).toLowerCase() + s.slice(1)}`,
        s.replace(/^(The|A|An)\s/, (m) => `${m}${sourceName} reported that `.toLowerCase()),
      ]
      return phrases[0]
    }
    return s
  })
  return attributedSentences.join(" ")
}

function findPatterns(source) {
  if (!source || typeof source !== "string") return []
  const key = Object.keys(SOURCE_ATTRIBUTION_PATTERNS).find((k) =>
    source.toLowerCase().includes(k),
  )
  return key ? SOURCE_ATTRIBUTION_PATTERNS[key] : []
}

function normalizeSourceName(source) {
  if (!source || typeof source !== "string") return "news agencies"
  const nameMap = {
    reuters: "Reuters",
    "associated press": "the Associated Press",
    ap: "the Associated Press",
    bbc: "the BBC",
    "the guardian": "The Guardian",
    "new york times": "the New York Times",
    bloomberg: "Bloomberg",
    "al jazeera": "Al Jazeera",
    "wall street journal": "the Wall Street Journal",
    washington: "the Washington Post",
    cnn: "CNN",
    npr: "NPR",
  }
  const key = Object.keys(nameMap).find((k) => source.toLowerCase().includes(k))
  return key ? nameMap[key] : source
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}
