#!/usr/bin/env node

/**
 * Global News — Full Automation Pipeline
 * ========================================
 * Complete end-to-end publishing workflow:
 *   1. Ingest RSS → process → generate MDX → queue
 *   2. Regenerate sitemap.xml + feed.xml
 *   3. Build & verify
 *   4. Git commit + push
 *   5. Optional deploy
 *
 * Usage:
 *   node scripts/full-pipeline.js                    # full run
 *   node scripts/full-pipeline.js --dry-run          # preview only
 *   node scripts/full-pipeline.js --no-build         # skip build
 *   node scripts/full-pipeline.js --no-git           # skip git
 *   node scripts/full-pipeline.js --source <url>     # single source
 *   node scripts/full-pipeline.js --max <n>          # max per source
 *   node scripts/full-pipeline.js --concurrency <n>  # parallel fetches
 */

const path = require("path")
const { execSync } = require("child_process")

const ROOT = path.join(__dirname, "..")

const args = process.argv.slice(2)
const FLAGS = {
  dryRun: args.includes("--dry-run"),
  noBuild: args.includes("--no-build"),
  noGit: args.includes("--no-git"),
  source: null,
  max: 10,
  concurrency: 1,
}
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--source") FLAGS.source = args[++i]
  if (args[i] === "--max") FLAGS.max = parseInt(args[++i], 10) || 10
  if (args[i] === "--concurrency") FLAGS.concurrency = parseInt(args[++i], 10) || 1
}

const DRY = FLAGS.dryRun

function log(s) { process.stdout.write(`  ${s}\n`) }
function ok(s) { process.stdout.write(`  ✓ ${s}\n`) }
function wrn(s) { process.stdout.write(`  ⚠ ${s}\n`) }
function fail(s) { process.stdout.write(`  ✗ ${s}\n`) }

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, {
      cwd: ROOT,
      encoding: "utf-8",
      stdio: opts.silent ? "pipe" : "inherit",
      ...opts,
    })
  } catch (e) {
    if (opts.optional) return null
    throw e
  }
}

async function main() {
  console.log(`
╔══════════════════════════════════════════════════╗
║     GLOBAL NEWS — Full Automation Pipeline      ║
╚══════════════════════════════════════════════════╝`)
  if (DRY) console.log("  [DRY RUN — no files will be written]")
  console.log(`  Started: ${new Date().toISOString()}
`)

  const start = Date.now()

  // Step 1: Fetch & Ingest
  console.log("── Step 1: RSS Ingestion ──")
  if (DRY) {
    wrn("dry-run — skipped")
  } else {
    const fetchArgs = ["node", "scripts/run-fetch.js", `--max=${FLAGS.max}`, `--concurrency=${FLAGS.concurrency}`]
    if (FLAGS.source) fetchArgs.push(`--source="${FLAGS.source}"`)
    run(fetchArgs.join(" "))
    ok("Ingestion complete")
  }

  // Step 1b: Image validation skipped — using external Unsplash images

  // Step 2: Generate static files
  console.log("\n── Step 2: Static Files ──")
  if (DRY) {
    wrn("dry-run — skipped")
  } else {
    const { generate: genSitemap } = require("./lib/sitemap")
    const { generate: genFeed } = require("./lib/feed")

    const sm = genSitemap()
    ok(`sitemap.xml — ${sm.count} URLs`)

    const fd = genFeed()
    ok(`feed.xml — ${fd.count} items`)
  }

  // Step 3: Build
  if (!FLAGS.noBuild) {
    console.log("\n── Step 3: Build & Verify ──")
    if (DRY) {
      wrn("dry-run — skipped")
    } else {
      log("TypeScript check...")
      run("npx tsc --noEmit", { silent: true })
      ok("typecheck passed")

      log("Next.js build...")
      const out = run("npx next build", { silent: true })
      if (out.includes("Error:")) throw new Error("Build failed")
      const m = out.match(/(?:(\d+) static pages|λ|○)/)
      ok("build complete")
    }
  }

  // Step 4: Git
  if (!FLAGS.noGit && !process.env.GIT_DISABLED) {
    console.log("\n── Step 4: Git ──")
    if (DRY) {
      wrn("dry-run — skipped")
    } else {
      const { hasChanges, commitAll, push } = require("./lib/git")
      if (!hasChanges()) {
        wrn("no changes to commit")
      } else {
        const msg = `Auto: ingest ${new Date().toISOString().slice(0, 10)}`
        const r = commitAll(msg)
        if (r.ok) ok("committed")
        else wrn(`commit failed: ${r.err}`)

        const p = push()
        if (p.ok) ok("pushed to remote")
        else wrn("push skipped")
      }
    }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1)
  console.log(`\n  ✓ Pipeline complete (${elapsed}s)${DRY ? " [dry-run]" : ""}\n`)
}

main().catch((err) => {
  console.error(`\n  ✗ Pipeline failed: ${err.message}\n`)
  process.exit(1)
})
