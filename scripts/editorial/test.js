// Quick-load test: verifies all modules compile and export correctly
import { processArticle, getAllTones } from "./index.js"
import { scoreArticle } from "./quality-scorer.js"
import { checkOriginality } from "./originality.js"
import { generatePrompt } from "./thumbnail-prompt.js"
import { checkPolicy } from "./content-policy.js"

const errors = []

function assert(condition, msg) {
  if (!condition) {
    errors.push(msg)
    console.error(`  FAIL: ${msg}`)
  } else {
    console.log(`  PASS: ${msg}`)
  }
}

console.log("\n=== Editorial System — Module Load Test ===\n")

console.log("1. Module exports...")
assert(typeof processArticle === "function", "processArticle is a function")
assert(typeof getAllTones === "function", "getAllTones is a function")
assert(typeof scoreArticle === "function", "scoreArticle is a function")
assert(typeof checkOriginality === "function", "checkOriginality is a function")
assert(typeof generatePrompt === "function", "generatePrompt is a function")
assert(typeof checkPolicy === "function", "checkPolicy is a function")

console.log("\n2. Tone options...")
const tones = getAllTones()
assert(Array.isArray(tones), "getAllTones returns array")
assert(tones.length === 5, "5 tones defined")
assert(tones.includes("neutral"), "neutral tone available")
assert(tones.includes("tech"), "tech tone available")
assert(tones.includes("analytical"), "analytical tone available")

console.log("\n3. Quality scorer (offline, no AI)...")
const sampleArticle = {
  title: "Global Climate Summit Reaches Historic Agreement",
  excerpt: "World leaders have reached a landmark agreement at the UN Climate Summit in Geneva, pledging to reduce carbon emissions by 50% by 2035.",
  categorySlug: "climate",
  source: "Reuters",
  tags: ["climate", "environment", "policy"],
}
const sampleBody = "World leaders gathered in Geneva this week for a historic climate summit that culminated in a binding agreement to slash carbon emissions. Under the accord, signatory nations commit to a 50 percent reduction by 2035, with intermediate targets set for 2028 and 2031. The agreement, hailed by environmental groups as a turning point, includes a $100 billion annual fund to support developing nations in their transition to renewable energy. Critics, however, argue the targets remain insufficient to avert the worst effects of global warming, with some scientists calling for a 70 percent reduction to meet Paris Accord goals. The summit marks the first time major emitters including China, India, and the United States have signed onto a unified timeline with enforceable penalties for non-compliance."
const quality = scoreArticle(sampleArticle, sampleBody)
assert(typeof quality.overall === "number", "quality.overall is a number")
assert(quality.overall >= 0 && quality.overall <= 100, "quality score in range 0-100")
assert(typeof quality.readability === "number", "readability score present")
assert(typeof quality.originality === "number", "originality score present")
assert(typeof quality.seo === "number", "seo score present")

console.log("\n4. Originality checker (offline, no AI)...")
const originality = await checkOriginality(sampleBody, sampleArticle.excerpt)
assert(typeof originality.score === "number", "originality.score is number")
assert(["pass", "warning", "fail"].includes(originality.verdict), "originality.verdict is valid")

console.log("\n5. Thumbnail prompt generator (offline, no AI)...")
const prompt = generatePrompt(sampleArticle)
assert(typeof prompt === "string", "thumbnail prompt is string")
assert(prompt.length > 50, "thumbnail prompt is substantial")

console.log("\n6. Content policy checker (offline, no AI)...")
const policy = checkPolicy(sampleArticle, sampleBody)
assert(typeof policy.passed === "boolean", "policy.passed is boolean")
assert(typeof policy.score === "number", "policy.score is number")

console.log("\n=== Results ===")
if (errors.length === 0) {
  console.log("All tests passed!")
} else {
  console.error(`${errors.length} test(s) failed:`)
  errors.forEach((e) => console.error(`  - ${e}`))
  process.exit(1)
}
