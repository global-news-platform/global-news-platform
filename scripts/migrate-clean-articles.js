#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

const ARTICLES_DIR = path.join(__dirname, "../src/data/articles")
const BACKUP_DIR = path.join(__dirname, "../src/data/articles-backup")

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function hasUrduChars(text) {
  return /[\u0600-\u06FF]/.test(text)
}

function cleanArticleFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8")
  const originalContent = content

  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
  if (!match) {
    console.log(`  ~ No valid frontmatter found: ${path.basename(filePath)}`)
    return false
  }

  const frontmatter = match[1]
  let body = match[2]

  const metadataLikeLines = [
    /^title:\s*"/, /^excerpt:\s*"/, /^category:\s*"/, /^author:\s*"/,
    /^authorSlug:\s*"/, /^publishedAt:\s*"/, /^image:\s*"/, /^imageAlt:\s*"/,
    /^sourceUrl:\s*"/, /^tags:\s*\[/, /^featured:\s*/, /^breaking:\s*/,
    /^trending:\s*/, /^updatedAt:\s*/,
  ]

  const lines = body.split("\n")
  const cleanedLines = []
  let inFrontmatterBlock = false
  let removedCount = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed === "---") {
      inFrontmatterBlock = !inFrontmatterBlock
      removedCount++
      continue
    }

    if (inFrontmatterBlock) {
      removedCount++
      continue
    }

    if (!inFrontmatterBlock) {
      const isMetadata = metadataLikeLines.some((p) => p.test(trimmed))
      if (isMetadata) {
        removedCount++
        continue
      }
    }

    const firstLineIdx = cleanedLines.length
    const firstLine = i === 0 || (i > 0 && lines[i - 1].trim() === "" && firstLineIdx === 0)
    if (firstLine && trimmed.length > 0) {
      const cleanedTitle = frontmatter.match(/^title:\s*"([^"]+)"/m)
      if (cleanedTitle) {
        const titleText = cleanedTitle[1].replace(/["""'']/g, "").trim()
        const bodyText = trimmed.replace(/["""'']/g, "").trim()
        if (bodyText === titleText || bodyText.startsWith(titleText)) {
          removedCount++
          continue
        }
      }
    }

    cleanedLines.push(line)
  }

  body = cleanedLines.join("\n").replace(/\n{3,}/g, "\n\n").trim()

  const newContent = `---\n${frontmatter}\n---\n\n${body}\n`

  if (newContent !== originalContent) {
    fs.writeFileSync(filePath, newContent, "utf-8")
    console.log(`  ✓ Cleaned: ${path.basename(filePath)} (removed ${removedCount} lines)`)
    return true
  }

  return false
}

function main() {
  console.log("=".repeat(60))
  console.log("  Article Migration: Clean Duplicate Frontmatter & Metadata")
  console.log("=".repeat(60))

  if (!fs.existsSync(ARTICLES_DIR)) {
    console.error("Articles directory not found:", ARTICLES_DIR)
    process.exit(1)
  }

  const files = fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".mdx"))
  console.log(`\nFound ${files.length} article files.`)

  ensureDir(BACKUP_DIR)
  let cleaned = 0
  let skipped = 0

  for (const file of files) {
    const filePath = path.join(ARTICLES_DIR, file)
    const backupPath = path.join(BACKUP_DIR, file)

    fs.copyFileSync(filePath, backupPath)
    const result = cleanArticleFile(filePath)
    if (result) cleaned++
    else skipped++
  }

  console.log(`\nResults:`)
  console.log(`  Cleaned: ${cleaned}`)
  console.log(`  Skipped (already clean): ${skipped}`)
  console.log(`  Backups saved to: ${BACKUP_DIR}`)
  console.log("=".repeat(60))
}

main()
