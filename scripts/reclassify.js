#!/usr/bin/env node
/**
 * Re-classify all existing MDX articles with the fixed category classifier.
 * Reads each MDX file, re-runs detectCategory on title+excerpt,
 * updates frontmatter category + tags, and rewrites the file.
 *
 * Usage:
 *   node scripts/reclassify.js                  # reclassify all
 *   node scripts/reclassify.js --dry-run        # preview only
 *   node scripts/reclassify.js --slug <slug>    # single article
 */

const path = require("path")
const fs = require("fs")

const ROOT = path.join(__dirname, "..")
const ARTICLES_DIR = path.join(ROOT, "src", "data", "articles")
const { detectCategory } = require("./lib/category-matcher")
const { extractTopics, generateTags, slugify } = require("./lib/processor")

const VALID_CATEGORIES = new Set([
  "world", "politics", "business", "technology", "science",
  "health", "sports", "climate", "culture", "opinion",
])

const args = process.argv.slice(2)
const DRY_RUN = args.includes("--dry-run")
const FILTER_SLUG = args.includes("--slug") ? args[args.indexOf("--slug") + 1] : null

function log(s) { process.stdout.write(`  ${s}\n`) }
function ok(s)   { process.stdout.write(`  ✓ ${s}\n`) }
function wrn(s)  { process.stdout.write(`  ⚠ ${s}\n`) }

function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
  if (!match) return null
  const fm = {}
  const lines = match[1].split("\n")
  for (const line of lines) {
    const idx = line.indexOf(":")
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    // Remove surrounding quotes if present
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1)
    fm[key] = value
  }
  return { frontmatter: fm, body: match[2] }
}

function buildFrontmatterYaml(fm) {
  const lines = Object.entries(fm).map(([k, v]) => {
    if (Array.isArray(v)) {
      return `${k}: [${v.map(t => `"${t}"`).join(", ")}]`
    }
    if (typeof v === "boolean") return `${k}: ${v}`
    if (typeof v === "string" && /^[-\w]+$/.test(v)) return `${k}: ${v}`
    return `${k}: "${String(v || "").replace(/"/g, '\\"')}"`
  })
  return lines.join("\n")
}

async function main() {
  console.log(`\n╔══════════════════════════════════════════╗
║     GLOBAL NEWS — Re-classification      ║
╚══════════════════════════════════════════╝
  Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}
`)

  if (!fs.existsSync(ARTICLES_DIR)) {
    console.error("Articles directory not found:", ARTICLES_DIR)
    process.exit(1)
  }

  let files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith(".mdx"))
  if (FILTER_SLUG) files = files.filter(f => f.startsWith(FILTER_SLUG))

  log(`Articles to process: ${files.length}`)
  let changed = 0
  let skipped = 0
  let errors = 0

  for (const fname of files) {
    const filePath = path.join(ARTICLES_DIR, fname)
    const content = fs.readFileSync(filePath, "utf-8")
    const parsed = parseFrontmatter(content)
    if (!parsed) { wrn(`Cannot parse: ${fname}`); errors++; continue }

    const { frontmatter: fm, body } = parsed
    const oldSlug = fname.replace(/\.mdx$/, "")
    const title = fm.title || ""
    const excerpt = fm.excerpt || ""
    const oldCategory = fm.category || ""

    // Use full body content for classification when available
    const bodyText = body.slice(0, 1500) || ""
    const clsResult = detectCategory(title, excerpt, bodyText, {})
    let newCategory = clsResult?.category || "World"
    // Ensure valid category
    if (!VALID_CATEGORIES.has(newCategory.toLowerCase())) {
      newCategory = "world"
    }
    // Capitalize first letter for display
    const displayCategory = newCategory.charAt(0).toUpperCase() + newCategory.slice(1)

    if (oldCategory.toLowerCase() === displayCategory.toLowerCase()) {
      skipped++
      continue
    }

    const oldC = oldCategory || "(empty)"
    log(`"${title.slice(0, 50)}..." ${oldC} → ${displayCategory} (${clsResult.confidence}%)`)

    if (DRY_RUN) continue

    // Update frontmatter
    const topics = extractTopics(`${title} ${excerpt}`)
    const tags = generateTags(topics, newCategory)
    fm.category = displayCategory
    fm.tags = tags.map(t => t.toLowerCase().replace(/\s+/g, "-"))

    const newFmYaml = buildFrontmatterYaml(fm)
    const newContent = `---\n${newFmYaml}\n---\n\n${body.trim()}\n`
    fs.writeFileSync(filePath, newContent, "utf-8")
    changed++
  }

  console.log(`\n  ── Summary ──`)
  ok(`${changed} updated`)
  if (skipped > 0) wrn(`${skipped} already correct`)
  if (errors > 0) wrn(`${errors} errors`)
  if (DRY_RUN) wrn("dry-run — no files written")
}

main().catch((err) => {
  console.error(`\n  ✗ Fatal: ${err.message}\n`)
  process.exit(1)
})
