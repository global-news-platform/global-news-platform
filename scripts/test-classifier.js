#!/usr/bin/env node
/**
 * Classifier Validation Suite
 * Tests the multi-layer category classifier against known scenarios
 * including the complaint cases (sports→technology, politics→technology).
 */

const { detectCategory } = require("./lib/category-matcher")

let passed = 0
let failed = 0

function test(name, title, excerpt, body, opts, expectedCategory, minConfidence = 0) {
  const result = detectCategory(title, excerpt, body, opts)
  const ok = result.category === expectedCategory
  const confOk = result.confidence >= minConfidence
  const status = ok && confOk ? "✓" : "✗"

  if (!ok || !confOk) {
    failed++
    console.log(`\n  ${status} ${name}`)
    console.log(`    Expected: ${expectedCategory} (conf≥${minConfidence})`)
    console.log(`    Got:      ${result.category} (conf=${result.confidence})`)
    console.log(`    Method:   ${result.method}`)
    console.log(`    Scores:   ${JSON.stringify(result.topCategories)}`)
    if (result.debug.entities.length) console.log(`    Entities: ${result.debug.entities.map(e => e.entity).join(", ")}`)
    if (result.debug.sourceMatch) console.log(`    Source:   ${result.debug.sourceMatch.matched}`)
  } else {
    passed++
    if (process.argv.includes("--verbose")) {
      console.log(`\n  ${status} ${name} → ${result.category} (conf=${result.confidence})`)
    }
  }
}

function heading(s) {
  console.log(`\n╔═══ ${s} ═══╗`)
}

// ─── SPORTS SCENARIOS ──────────────────────────────────────────
heading("SPORTS")

test(
  "Premier League match report",
  "Liverpool Crushes Manchester City 4-1 in Premier League Thriller at Anfield",
  "Mohamed Salah scored twice as Liverpool dominated Manchester City in a Premier League clash that saw the Reds extend their lead at the top.",
  "The match at Anfield was a masterclass from Jurgen Klopp's side, with Salah opening the scoring in the 12th minute. City struggled to contain Liverpool's attacking trio. The win puts Liverpool six points clear in the Premier League standings.",
  {},
  "sports",
  70
)

test(
  "NFL Super Bowl headline",
  "Patrick Mahomes Leads Chiefs to Super Bowl Victory with Last-Minute Touchdown Drive",
  "The Kansas City Chiefs defeated the San Francisco 49ers 38-35 in a thrilling Super Bowl that went down to the wire.",
  "Mahomes threw for 350 yards and three touchdowns, cementing his legacy as one of the greatest quarterbacks in NFL history. Travis Kelce was his primary target with 12 catches.",
  {},
  "sports",
  70
)

test(
  "Tennis grand slam",
  "Djokovic Wins Record 25th Grand Slam at Wimbledon After Epic Five-Set Final",
  "Novak Djokovic defeated Carlos Alcaraz in a five-set thriller to claim his 25th grand slam title at Wimbledon.",
  "The match lasted four hours and 42 minutes, with Djokovic saving two match points in the final set. It was the longest Wimbledon final in history.",
  {},
  "sports",
  70
)

test(
  "Football transfer news",
  "Manchester United Complete £85m Signing of Star Striker in Summer Transfer Window",
  "Manchester United have finalized the signing of the prolific forward on a five-year contract after weeks of negotiations.",
  "The transfer window deal makes the striker the most expensive signing in Manchester United history. The player passed his medical on Friday and will wear the number 9 shirt.",
  {},
  "sports",
  60
)

// ─── CRITICAL: Sports → Technology miscategorization ──────────
test(
  "CRITICAL: Sports article should NOT be technology",
  "NFL Quarterback Breaks Passing Record in Week 12 Victory Over Rival Team",
  "The veteran quarterback threw for 450 yards and 5 touchdowns, breaking the single-game passing record held for over a decade.",
  "The NFL record books will need updating after this performance. The quarterback's precision passing and leadership were on full display as his team improved to 9-2 on the season.",
  {},
  "sports",
  60
)

test(
  "CRITICAL: Cricket should not be business",
  "India Wins Cricket World Cup After Thrilling Final Against Australia",
  "Virat Kohli led India to victory in the Cricket World Cup final with a masterful innings of 120 runs.",
  "India chased down 287 with three overs to spare in front of 90,000 fans at the stadium. The win was India's first World Cup title in over a decade.",
  {},
  "sports",
  60
)

// ─── TECHNOLOGY SCENARIOS ──────────────────────────────────────
heading("TECHNOLOGY")

test(
  "AI startup funding",
  "OpenAI-Backed Startup Raises $500M Series B to Revolutionize Protein Folding",
  "The AI startup has developed a deep learning model that can predict protein structures with atomic accuracy.",
  "The series B round was led by prominent venture capital firms including Sequoia Capital. The company plans to use the funding to expand its research team and bring its technology to pharmaceutical partners.",
  {},
  "technology",
  60
)

test(
  "Cybersecurity breach",
  "Major Data Breach Exposes Millions of User Records: What You Need to Know",
  "A cybersecurity incident at a major tech company has compromised the personal data of over 50 million users worldwide.",
  "The data breach included email addresses, encrypted passwords, and payment information. The company has deployed a software update and is working with cybersecurity experts to investigate the zero-day vulnerability.",
  {},
  "technology",
  50
)

test(
  "Smartphone launch",
  "Apple Releases Latest iPhone with Revolutionary AI-Powered Camera System",
  "The new iPhone features a 48-megapixel camera powered by machine learning algorithms that enhance photo quality in low-light conditions.",
  "The device runs iOS 18 and includes the new A18 chip designed for on-device AI processing. Pre-orders begin next Friday with prices starting at $999.",
  {},
  "technology",
  50
)

// ─── POLITICS SCENARIOS ──────────────────────────────────────
heading("POLITICS")

test(
  "Presidential election",
  "President Signs Executive Order on Immigration Reform Ahead of Midterm Elections",
  "The executive order represents the administration's boldest move on immigration policy as the midterm elections approach.",
  "Congressional leaders from both parties responded sharply, with Democrats praising the measure and Republicans threatening legislative action to overturn it.",
  {},
  "politics",
  50
)

test(
  "CRITICAL: Politics should NOT be technology",
  "Senate Committee Holds Hearing on Social Media Regulation and Platform Accountability",
  "The Senate judiciary committee heard testimony from technology executives about content moderation practices and user privacy.",
  "Lawmakers from both parties questioned CEOs about algorithmic amplification, data collection practices, and the impact of social media on democratic processes.",
  { sourceLabel: "Politico" },
  "politics",
  40
)

// ─── SCIENCE SCENARIOS ──────────────────────────────────────
heading("SCIENCE")

test(
  "NASA space mission",
  "NASA's James Webb Telescope Discovers New Exoplanet in Habitable Zone",
  "The James Webb Space Telescope has identified a new exoplanet 40 light-years away that could potentially support life.",
  "Scientists at NASA confirmed the planet is in the habitable zone of its star and has water vapor in its atmosphere. Further observations are planned.",
  {},
  "science",
  60
)

test(
  "CRITICAL: Science should not be technology",
  "CERN Physicists Achieve First Direct Measurement of Quantum Entanglement at Record Energy",
  "Scientists at CERN's Large Hadron Collider have measured quantum entanglement at energies never before achieved.",
  "The breakthrough in particle physics confirms theoretical predictions and opens new possibilities for quantum research. The team published their findings in a peer-reviewed journal.",
  {},
  "science",
  50
)

// ─── BUSINESS SCENARIOS ──────────────────────────────────────
heading("BUSINESS")

test(
  "Stock market report",
  "Federal Reserve Holds Interest Rates Steady as Inflation Shows Signs of Cooling",
  "The Fed's decision to maintain rates at current levels was widely expected by Wall Street economists and investors.",
  "The S&P 500 and Nasdaq both rose on the news, with bond yields falling as traders priced in potential rate cuts later this year.",
  {},
  "business",
  50
)

test(
  "Merger announcement",
  "Global Tech Giant Announces $60 Billion Acquisition of Cloud Computing Rival",
  "The all-stock deal values the cloud company at a significant premium and is expected to close by Q3 2026 pending regulatory approval.",
  "The merger would create the second-largest cloud computing platform by market share. The CEO said the acquisition will accelerate their AI and enterprise offerings.",
  {},
  "business",
  40
)

test(
  "CRITICAL: Bloomberg source → business",
  "European Markets Rally on Trade Deal Hopes Amid Global Economic Recovery",
  "European stock markets surged on optimism over a new trade agreement between the EU and major trading partners.",
  "The DAX, FTSE 100, and CAC 40 all rose more than 2% on the news. Analysts said the trade deal could boost GDP growth across the region.",
  { sourceLabel: "Bloomberg" },
  "business",
  50
)

// ─── GENERAL NEWS FALLBACK ────────────────────────────────────
heading("GENERAL NEWS FALLBACK")

test(
  "Low confidence general news should fallback to general",
  "Local Community Center Opens New Library Branch in Downtown Area",
  "The new library features a children's reading room, computer lab, and community meeting spaces for local residents.",
  "The grand opening ceremony was attended by local officials and community leaders. The library will be open six days a week and offers free Wi-Fi to all visitors.",
  {},
  "general",
  0
)

test(
  "Human interest story with no strong category signal",
  "Woman Rescues Trapped Kitten from Storm Drain in Heartwarming Rescue Operation",
  "Firefighters helped free the kitten after the woman heard meowing coming from the drain outside her home.",
  "The kitten was unharmed and has been adopted by the woman who rescued it. The fire department said the rescue took about 20 minutes.",
  {},
  "general",
  0
)

// ─── HEALTH SCENARIOS ──────────────────────────────────────
heading("HEALTH")

test(
  "Health article",
  "FDA Approves New Breakthrough Treatment for Alzheimer's Disease",
  "The FDA has approved a new drug that shows promise in slowing cognitive decline in early-stage Alzheimer's patients.",
  "Clinical trials demonstrated a 35% reduction in cognitive decline over 18 months. The pharmaceutical company said the drug will be available to patients next month.",
  {},
  "health",
  50
)

// ─── RESULTS ──────────────────────────────────────────────────
const total = passed + failed
console.log(`\n\n╔══════════════════════════════════════════╗`)
console.log(`║          TEST RESULTS                     ║`)
console.log(`╠══════════════════════════════════════════╣`)
console.log(`║  Passed:  ${passed}/${total} (${Math.round(passed/total*100)}%)`)
console.log(`║  Failed:  ${failed}/${total}`)
console.log(`╚══════════════════════════════════════════╝`)

if (failed > 0) {
  process.exit(1)
}
