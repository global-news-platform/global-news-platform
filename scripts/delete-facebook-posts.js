#!/usr/bin/env node

const https = require("https")

const FB_GRAPH = "https://graph.facebook.com/v22.0"

function parseArgs() {
  const args = { days: 3, dryRun: true, pageId: null, token: null }
  for (const arg of process.argv.slice(2)) {
    if (arg === "--dry-run") args.dryRun = true
    else if (arg.startsWith("--days=")) args.days = parseInt(arg.split("=")[1], 10)
    else if (arg.startsWith("--page-id=")) args.pageId = arg.split("=")[1]
    else if (arg.startsWith("--token=")) args.token = arg.split("=")[1]
  }
  return args
}

function graphApiRequest(url, method = "GET") {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url)
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method,
      headers: { "User-Agent": "GlobalLens/1.0 (Facebook Post Cleaner; bot@thegloballens365.com)" },
    }
    const req = https.request(options, (res) => {
      let data = ""
      res.on("data", (chunk) => (data += chunk))
      res.on("end", () => {
        try {
          resolve(JSON.parse(data))
        } catch {
          resolve({ error: { message: data } })
        }
      })
    })
    req.on("error", reject)
    req.setTimeout(30000, () => {
      req.destroy()
      reject(new Error("Request timed out"))
    })
    req.end()
  })
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  const args = parseArgs()

  const pageId = args.pageId || process.env.FB_PAGE_ID
  const token = args.token || process.env.FB_PAGE_ACCESS_TOKEN

  if (!pageId || !token) {
    console.error("Missing Facebook credentials. Set FB_PAGE_ID and FB_PAGE_ACCESS_TOKEN (or pass --page-id / --token).")
    process.exit(1)
  }

  const days = Number.isFinite(args.days) && args.days > 0 ? args.days : 3
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000

  console.log("=".repeat(60))
  console.log("  Facebook Post Cleaner — The Global Lens 365")
  console.log(`  Mode: ${args.dryRun ? "DRY RUN (list only)" : "DELETE"}`)
  console.log(`  Deleting posts newer than: ${new Date(cutoff).toISOString()} (last ${days} days)`)
  console.log("=".repeat(60))

  let posts = []
  let url = `${FB_GRAPH}/${pageId}/posts?fields=id,created_time,message,permalink_url&limit=100&access_token=${encodeURIComponent(token)}`
  let pages = 0
  while (url) {
    pages++
    const res = await graphApiRequest(url)
    if (res.error) {
      console.error(`  API error fetching posts: ${res.error.message || JSON.stringify(res.error)}`)
      process.exit(1)
    }
    const batch = res.data || []
    posts = posts.concat(batch)
    const oldestInBatch = batch.length ? Math.min(...batch.map((p) => new Date(p.created_time).getTime())) : 0
    if (!res.paging || !res.paging.next || (batch.length && oldestInBatch < cutoff)) break
    url = res.paging.next
    if (pages > 50) break
  }

  const toDelete = posts.filter((p) => new Date(p.created_time).getTime() >= cutoff)

  console.log(`\nFetched ${posts.length} recent posts; ${toDelete.length} created in the last ${days} days:`)
  toDelete.forEach((p, i) => {
    const msg = (p.message || p.permalink_url || "").replace(/\s+/g, " ").substring(0, 90)
    console.log(`  ${String(i + 1).padStart(2)}. ${p.created_time} | ${p.id} | ${msg}`)
  })

  if (toDelete.length === 0) {
    console.log("\nNothing to delete.")
    return
  }

  if (args.dryRun) {
    console.log(`\n[DRY RUN] Would delete ${toDelete.length} posts. Re-run without --dry-run to actually delete them.`)
    return
  }

  console.log(`\nDeleting ${toDelete.length} posts...`)
  let deleted = 0
  let failed = 0
  for (const p of toDelete) {
    const del = await graphApiRequest(`${FB_GRAPH}/${p.id}?access_token=${encodeURIComponent(token)}`, "DELETE")
    if (del && !del.error) {
      deleted++
      console.log(`  DELETED ${p.id}`)
    } else {
      failed++
      console.error(`  FAILED  ${p.id}: ${(del.error || {}).message || JSON.stringify(del)}`)
    }
    await sleep(500)
  }

  console.log(`\nDone: ${deleted} deleted, ${failed} failed.`)
}

main().catch((err) => {
  console.error("Post cleaner failed:", err.message)
  process.exit(1)
})
