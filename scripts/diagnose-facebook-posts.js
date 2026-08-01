#!/usr/bin/env node

const https = require("https")
const fs = require("fs")
const path = require("path")

const FB_GRAPH = "https://graph.facebook.com/v22.0"
const REPORT_PATH = path.join(process.cwd(), "diagnose-report.txt")
const IMAGES_DIR = path.join(process.cwd(), "post-images")

function log(msg) {
  console.log(msg)
  try {
    fs.appendFileSync(REPORT_PATH, `${msg}\n`, "utf-8")
  } catch {}
}

function parseArgs() {
  const args = { pageId: null, token: null, limit: 15 }
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--page-id=")) args.pageId = arg.split("=")[1]
    else if (arg.startsWith("--token=")) args.token = arg.split("=")[1]
    else if (arg.startsWith("--limit=")) args.limit = parseInt(arg.split("=")[1], 10)
  }
  return args
}

function graphApiRequest(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url)
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: "GET",
      headers: { "User-Agent": "GlobalLens/1.0 (Facebook Diagnose; bot@thegloballens365.com)" },
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

async function downloadImage(url, outPath) {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "GlobalLens/1.0 (Image Diagnose)" },
    })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 100) throw new Error("Image too small")
    fs.writeFileSync(outPath, buf)
    return true
  } catch (err) {
    return false
  }
}

function collectImageUrls(post) {
  const urls = []
  const atts = (post.attachments && post.attachments.data) || []
  for (const att of atts) {
    if (att.media && att.media.image && att.media.image.src) urls.push(att.media.image.src)
    const subs = att.subattachments && att.subattachments.data
    if (subs) {
      for (const sub of subs) {
        if (sub.media && sub.media.image && sub.media.image.src) urls.push(sub.media.image.src)
      }
    }
  }
  return urls
}

async function main() {
  const args = parseArgs()
  const pageId = args.pageId || process.env.FB_PAGE_ID
  const token = args.token || process.env.FB_PAGE_ACCESS_TOKEN

  if (!pageId || !token) {
    log("Missing Facebook credentials. Set FB_PAGE_ID and FB_PAGE_ACCESS_TOKEN.")
    process.exit(1)
  }

  if (fs.existsSync(REPORT_PATH)) fs.unlinkSync(REPORT_PATH)
  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true })

  log("=".repeat(60))
  log("  Facebook Page Post Diagnose — The Global Lens 365")
  log(`  Fetching recent ${args.limit} posts...`)
  log("=".repeat(60))

  const url =
    `${FB_GRAPH}/${pageId}/posts?fields=id,created_time,message,permalink_url,attachments{media_type,url,type,title,media{image{src}},subattachments{media_type,media{image{src}}}}` +
    `&limit=${args.limit}&access_token=${encodeURIComponent(token)}`

  const res = await graphApiRequest(url)
  if (res.error) {
    log(`  API error: ${res.error.message || JSON.stringify(res.error)}`)
    process.exit(1)
  }

  const posts = res.data || []
  log(`  Fetched ${posts.length} posts.\n`)

  for (let i = 0; i < posts.length; i++) {
    const p = posts[i]
    const msg = (p.message || "").replace(/\s+/g, " ").substring(0, 120)
    log(`--- POST ${i + 1} ---`)
    log(`  id: ${p.id}`)
    log(`  created: ${p.created_time}`)
    log(`  message: ${msg}`)
    log(`  permalink: ${p.permalink_url}`)

    const atts = (p.attachments && p.attachments.data) || []
    atts.forEach((att, ai) => {
      log(`  attachment[${ai}]: media_type=${att.media_type} type=${att.type} url=${att.url}`)
      if (att.title) log(`    title: ${att.title}`)
      if (att.media && att.media.image) log(`    image.src: ${att.media.image.src}`)
      const subs = att.subattachments && att.subattachments.data
      if (subs) {
        subs.forEach((sub, si) => {
          log(`    sub[${si}]: media_type=${sub.media_type} url=${sub.url}`)
          if (sub.media && sub.media.image) log(`      image.src: ${sub.media.image.src}`)
        })
      }
    })

    const imageUrls = collectImageUrls(p)
    if (imageUrls.length === 0) {
      log(`  (no image attachments)`)
    } else {
      for (let j = 0; j < imageUrls.length; j++) {
        const fname = `${i + 1}-${j}.jpg`
        const ok = await downloadImage(imageUrls[j], path.join(IMAGES_DIR, fname))
        log(`  saved image: ${fname} (${ok ? "OK" : "FAILED"}) src=${imageUrls[j]}`)
      }
    }
    log("")
  }

  log("Done.")
}

main().catch((err) => {
  log("Diagnose failed:", err.message)
  process.exit(1)
})
