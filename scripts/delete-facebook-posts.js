const https = require("https")

const PAGE_ID = process.env.FB_PAGE_ID
const ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN

if (!PAGE_ID || !ACCESS_TOKEN) {
  console.error("Missing FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN")
  process.exit(1)
}

function apiRequest(url, method = "GET") {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url)
    const req = https.request(
      { hostname: parsed.hostname, path: parsed.pathname + parsed.search, method,
        headers: { "User-Agent": "GlobalLens/1.0 (Facebook Cleanup)" } },
      (res) => {
        let data = ""
        res.on("data", (c) => (data += c))
        res.on("end", () => {
          try { resolve(JSON.parse(data)) } catch { resolve({ error: { message: data } }) }
        })
      }
    )
    req.on("error", reject)
    req.setTimeout(30000, () => { req.destroy(); reject(new Error("Timeout")) })
    req.end()
  })
}

async function main() {
  console.log("Fetching all posts from Facebook page...")
  let url = `https://graph.facebook.com/v22.0/${PAGE_ID}/feed?access_token=${encodeURIComponent(ACCESS_TOKEN)}&limit=100&fields=id,message`
  let totalDeleted = 0

  while (url) {
    const result = await apiRequest(url)
    if (result.error) {
      console.error("API error:", result.error.message || JSON.stringify(result.error))
      break
    }
    const posts = result.data || []
    if (posts.length === 0) {
      console.log("No more posts found.")
      break
    }
    for (const post of posts) {
      const msg = (post.message || "").substring(0, 50).replace(/\n/g, " ")
      console.log(`Deleting post ${post.id}: "${msg}"`)
      const delResult = await apiRequest(
        `https://graph.facebook.com/v22.0/${post.id}?access_token=${encodeURIComponent(ACCESS_TOKEN)}`,
        "DELETE"
      )
      if (delResult.success !== undefined) {
        console.log(`  Deleted.`)
        totalDeleted++
      } else {
        console.error(`  Delete failed: ${delResult.error?.message || JSON.stringify(delResult)}`)
      }
      await new Promise((r) => setTimeout(r, 500))
    }
    url = result.paging?.next || null
  }

  console.log(`\nTotal posts deleted: ${totalDeleted}`)

  console.log("\nResetting Facebook tracker...")
  const trackerPath = require("path").join(__dirname, "../src/data/.facebook-tracker.json")
  require("fs").writeFileSync(trackerPath, JSON.stringify({ posted: [], lastRun: null, formatIndex: 0 }, null, 2))
  console.log("Tracker reset. Ready for fresh posts.")
}

main().catch((err) => {
  console.error("Fatal:", err)
  process.exit(1)
})
