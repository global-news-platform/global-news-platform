#!/usr/bin/env node

/**
 * Global News — Automation Pipeline
 * ==================================
 *
 * Full workflow:
 *   1. Ingest RSS → generate MDX articles
 *   2. Regenerate sitemap.xml + feed.xml
 *   3. Run Next.js build & verify
 *   4. Git commit + push
 *   5. Cloudflare Pages deploy (optional)
 *
 * Usage:
 *   node scripts/pipeline.js                  # full pipeline
 *   node scripts/pipeline.js --dry-run        # no writes, no git, no build
 *   node scripts/pipeline.js --ingest-only    # stop after MDX generation
 *   node scripts/pipeline.js --source <url>   # single RSS source only
 *   node scripts/pipeline.js --no-commit      # skip git operations
 *   node scripts/pipeline.js --no-build       # skip typecheck & build
 *   node scripts/pipeline.js --max <n>        # max articles per source
 *
 * Env vars:
 *   GIT_DISABLED=true      skip git commit/push
 *   CLOUDFLARE_API_TOKEN   required for deploy
 *   CLOUDFLARE_ACCOUNT_ID  required for deploy
 *   CF_PROJECT             Cloudflare Pages project name
 */

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

const ROOT = path.join(__dirname, "..")

function log(s) { process.stdout.write(`  ${s}\n`) }
function ok(s)   { process.stdout.write(`  ✓ ${s}\n`) }
function wrn(s)  { process.stdout.write(`  ⚠ ${s}\n`) }
function fail(s) { process.stdout.write(`  ✗ ${s}\n`) }

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: "utf-8", stdio: opts.silent ? "pipe" : "inherit", ...opts })
  } catch (e) {
    if (opts.optional) return null
    throw e
  }
}

// ── Parse args ──────────────────────────────────────────────
const args = process.argv.slice(2)
const FLAGS = {
  dryRun: args.includes("--dry-run"),
  ingestOnly: args.includes("--ingest-only"),
  noCommit: args.includes("--no-commit"),
  noBuild: args.includes("--no-build"),
  max: 10,
  source: null,
}
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--source") FLAGS.source = args[++i]
  if (args[i] === "--max") FLAGS.max = parseInt(args[++i], 10) || 10
}

const DRY = FLAGS.dryRun

// ── STEP 1: RSS Ingestion ───────────────────────────────────
async function stepIngest() {
  console.log("\n── Step 1: RSS Ingestion ──")
  const configPath = path.join(ROOT, "scripts", "config", "sources.json")
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"))

  let sources = config.sources
  if (FLAGS.source) sources = sources.filter(s => s.url === FLAGS.source)
  if (!sources.length) { wrn("No sources to process."); return 0 }

  const { fetchSource } = require("./lib/rss")
  const { extractTopics, buildFrontmatter, formatMdx, generateArticleSlug } = require("./lib/processor")
  const { isProcessed, markProcessed } = require("./lib/tracker")
  const { write, exists } = require("./lib/writer")
  const { download } = require("./lib/download")

  let total = 0

  for (const source of sources) {
    log(`${source.label} (${source.url})`)
    let items
    try {
      items = await fetchSource(source)
    } catch (e) {
      fail(`${e.message}`)
      continue
    }

    if (!items.length) { wrn("no new items"); continue }

    const batch = items.slice(0, FLAGS.max)

    for (const item of batch) {
      if (isProcessed(item.sourceUrl)) { continue }

      const topics = extractTopics(`${item.title} ${item.excerpt} ${(item.body || "").slice(0, 800)}`)
      const fm = buildFrontmatter(item, topics)
      const slug = generateArticleSlug(item.title)

      if (DRY) {
        log(`[DRY] ${slug} — "${item.title.slice(0, 50)}..."`)
        continue
      }

      if (exists(slug)) { continue }

      // Download image
      if (item.imageUrl) {
        const localPath = await download(item.imageUrl, slug)
        if (localPath) fm.image = localPath
      }

      const mdx = formatMdx(fm, item.body || item.excerpt)
      const written = write(slug, mdx)
      if (written) {
        markProcessed(item.sourceUrl, slug)
        total++
        ok(`${slug}`)
      }
    }
  }

  ok(`${total} new articles generated`)
  return total
}

// ── STEP 2: Regenerate sitemap + feed ───────────────────────
function stepStaticFiles() {
  console.log("\n── Step 2: Static Files ──")

  if (DRY) { wrn("dry-run — skipped"); return }

  const { generate: genSitemap } = require("./lib/sitemap")
  const { generate: genFeed } = require("./lib/feed")

  const sm = genSitemap()
  ok(`sitemap.xml — ${sm.count} URLs`)

  const fd = genFeed()
  ok(`feed.xml — ${fd.count} items`)
}

// ── STEP 3: Build & Verify ──────────────────────────────────
function stepBuild() {
  if (FLAGS.noBuild) { console.log("\n── Step 3: Build (skipped) ──"); return }

  console.log("\n── Step 3: Build & Verify ──")
  if (DRY) { wrn("dry-run — skipped"); return }

  log("TypeScript check...")
  run("npx tsc --noEmit", { silent: true })
  ok("typecheck passed")

  log("Next.js build...")
  const out = run("npx next build", { silent: true })
  if (out.includes("Error:")) throw new Error("Build failed — see output above")

  const m = out.match(/(\d+) static pages generated/i) || out.match(/(\d+)\/ \w+ \(\d+\)/)
  ok(`build complete — ${m ? m[1] + " pages" : "see output"}`)
}

// ── STEP 4: Git ─────────────────────────────────────────────
function stepGit() {
  if (FLAGS.noCommit || process.env.GIT_DISABLED === "true") {
    console.log("\n── Step 4: Git (skipped) ──")
    return
  }
  if (DRY) { console.log("\n── Step 4: Git (dry-run) ──"); wrn("skipped"); return }

  console.log("\n── Step 4: Git Commit & Push ──")

  const { hasChanges, commitAll, push } = require("./lib/git")

  if (!hasChanges()) { wrn("no changes to commit"); return }

  const msg = `Auto: ingest articles ${new Date().toISOString().slice(0, 10)}`
  const r = commitAll(msg)
  if (!r.ok) { wrn(`commit failed: ${r.err}`); return }
  ok(r.out || "committed")

  const p = push()
  if (p.ok) ok("pushed to remote")
  else wrn(`push skipped (${p.err})`)
}

// ── STEP 5: Cloudflare Deploy ───────────────────────────────
function stepDeploy() {
  const token = process.env.CLOUDFLARE_API_TOKEN
  const account = process.env.CLOUDFLARE_ACCOUNT_ID
  const project = process.env.CF_PROJECT || "global-news-platform"

  if (!token || !account) {
    console.log("\n── Step 5: Deploy (skipped — set CLOUDFLARE_API_TOKEN & CLOUDFLARE_ACCOUNT_ID) ──")
    return
  }
  if (DRY) { console.log("\n── Step 5: Deploy (dry-run) ──"); wrn("skipped"); return }

  console.log("\n── Step 5: Cloudflare Pages Deploy ──")
  try {
    run(`npx wrangler pages deploy out --project-name="${project}" --branch=main`, {
      env: { ...process.env, CLOUDFLARE_API_TOKEN: token },
    })
    ok("deployment initiated")
  } catch (e) {
    wrn(`deploy failed: ${e.message}`)
  }
}

// ── Main ────────────────────────────────────────────────────
async function main() {
  console.log(`
╔══════════════════════════════════════════╗
║     GLOBAL NEWS — Automation Pipeline   ║
╚══════════════════════════════════════════╝`)
  if (DRY) console.log("  [DRY RUN — no files will be written]")
  console.log(`  Sources: ${FLAGS.source || "all enabled"}`)

  const start = Date.now()

  try {
    const count = await stepIngest()

    if (FLAGS.ingestOnly) {
      console.log(`\n  ◆ ingest-only: ${count} articles`)
      return
    }

    stepStaticFiles()
    stepBuild()
    stepGit()
    stepDeploy()

    const elapsed = ((Date.now() - start) / 1000).toFixed(1)
    console.log(`\n  ✓ Pipeline complete (${elapsed}s)${DRY ? " [dry-run]" : ""}\n`)
  } catch (e) {
    console.error(`\n  ✗ Pipeline failed: ${e.message}\n`)
    process.exit(1)
  }
}

main()
