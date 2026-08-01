#!/usr/bin/env node

const https = require("https")
const sharp = require("sharp")

const FB_GRAPH = "https://graph.facebook.com/v22.0"
const SIMILARITY_THRESHOLD = 8
const MAX_POSTS = 3000

function parseArgs() {
  const args = { dryRun: true, pageId: null, token: null, threshold: SIMILARITY_THRESHOLD }
  for (const arg of process.argv.slice(2)) {
    if (arg === "--dry-run") args.dryRun = true
    else if (arg === "--delete") args.dryRun = false
    else if (arg.startsWith("--threshold=")) args.threshold = parseInt(arg.split("=")[1], 10)
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
      headers: { "User-Agent": "GlobalLens/1.0 (Facebook Page Cleanup; bot@thegloballens365.com)" },
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

async function downloadImage(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 15000)
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "GlobalLens/1.0 (Image Analyzer; bot@thegloballens365.com)" },
      })
      clearTimeout(timer)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 100) throw new Error("Image too small")
      return buf
    } catch (err) {
      if (attempt === retries) throw err
    }
  }
  return null
}

async function dHashFromBuffer(buf) {
  const { data, info } = await sharp(buf)
    .resize(9, 8, { fit: "fill" })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true })
  let hash = 0n
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (data[y * 9 + x] > data[y * 9 + x + 1]) {
        hash |= 1n << BigInt(y * 8 + x)
      }
    }
  }
  return hash
}

function hammingDistance(a, b) {
  let d = a ^ b
  let count = 0
  while (d) {
    count += Number(d & 1n)
    d >>= 1n
  }
  return count
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  const args = parseArgs()
  const pageId = args.pageId || process.env.FB_PAGE_ID
  const token = args.token || process.env.FB_PAGE_ACCESS_TOKEN
  const threshold = Number.isFinite(args.threshold) ? args.threshold : SIMILARITY_THRESHOLD

  if (!pageId || !token) {
    console.error("Missing Facebook credentials. Set FB_PAGE_ID and FB_PAGE_ACCESS_TOKEN.")
    process.exit(1)
  }

  console.log("=".repeat(60))
  console.log("  Facebook Page Cleanup — The Global Lens 365")
  console.log(`  Mode: ${args.dryRun ? "DRY RUN (list only)" : "DELETE"}`)
  console.log(`  Similarity threshold: ${threshold} bits`)
  console.log("=".repeat(60))

  let posts = []
  let url = `${FB_GRAPH}/${pageId}/posts?fields=id,created_time,message,permalink_url,attachments{media_type,url,type,media{image{src}},subattachments{media_type,media{image{src}}}}&limit=100&access_token=${encodeURIComponent(token)}`
  let pages = 0
  while (url) {
    pages++
    const res = await graphApiRequest(url)
    if (res.error) {
      console.error(`  API error fetching posts: ${res.error.message || JSON.stringify(res.error)}`)
      process.exit(1)
    }
    posts = posts.concat(res.data || [])
    if (!res.paging || !res.paging.next || posts.length >= MAX_POSTS || pages > 60) break
    url = res.paging.next
  }
  posts = posts.slice(0, MAX_POSTS)
  console.log(`\nFetched ${posts.length} posts.`)

  const withImages = []
  const noImage = []
  const unreachable = []

  for (let i = 0; i < posts.length; i++) {
    const p = posts[i]
    const urls = collectImageUrls(p)
    if (urls.length === 0) {
      noImage.push(p)
      continue
    }
    const buf = await downloadImage(urls[0])
    if (!buf) {
      unreachable.push(p)
      continue
    }
    let hash = null
    try {
      hash = await dHashFromBuffer(buf)
    } catch {
      unreachable.push(p)
      continue
    }
    withImages.push({ post: p, hash, imageUrl: urls[0] })
    if ((i + 1) % 50 === 0) console.log(`  Analyzed ${i + 1}/${posts.length} posts...`)
    await sleep(100)
  }

  console.log(`\n  With usable image: ${withImages.length}`)
  console.log(`  No image: ${noImage.length}`)
  console.log(`  Image unreachable/broken: ${unreachable.length}`)

  const clusters = []
  for (const item of withImages) {
    let found = -1
    for (let c = 0; c < clusters.length; c++) {
      if (hammingDistance(item.hash, clusters[c].hash) <= threshold) {
        found = c
        break
      }
    }
    if (found >= 0) clusters[found].items.push(item)
    else clusters.push({ hash: item.hash, items: [item] })
  }

  const duplicateClusters = clusters.filter((c) => c.items.length > 1)
  const similarToDelete = []
  for (const cluster of duplicateClusters) {
    cluster.items.sort((a, b) => new Date(b.post.created_time) - new Date(a.post.created_time))
    const keep = cluster.items[0]
    for (const item of cluster.items.slice(1)) {
      similarToDelete.push({ post: item.post, keep: keep.post, imageUrl: item.imageUrl })
    }
  }

  console.log(`\nDuplicate-image clusters: ${duplicateClusters.length}`)

  console.log("\n=== POSTS WITH NO IMAGE ===")
  noImage.forEach((p, i) => {
    const msg = (p.message || "").replace(/\s+/g, " ").substring(0, 80)
    console.log(`  ${String(i + 1).padStart(3)}. ${p.id} | ${p.created_time} | ${msg}`)
  })

  console.log("\n=== POSTS WITH UNREACHABLE/BROKEN IMAGE ===")
  unreachable.forEach((p, i) => {
    const msg = (p.message || "").replace(/\s+/g, " ").substring(0, 80)
    console.log(`  ${String(i + 1).padStart(3)}. ${p.id} | ${p.created_time} | ${msg}`)
  })

  console.log("\n=== POSTS WITH SIMILAR IMAGES (duplicates) ===")
  similarToDelete.forEach((item, i) => {
    const msg = (item.post.message || "").replace(/\s+/g, " ").substring(0, 60)
    const keepMsg = (item.keep.message || "").replace(/\s+/g, " ").substring(0, 60)
    console.log(`  ${String(i + 1).padStart(3)}. DELETE ${item.post.id} | ${item.post.created_time} | ${msg}`)
    console.log(`        keep  ${item.keep.id} | ${item.keep.created_time} | ${keepMsg}`)
  })

  const totalToDelete = noImage.length + unreachable.length + similarToDelete.length
  console.log(`\nTOTAL to delete: ${totalToDelete} (${noImage.length} no-image, ${unreachable.length} broken-image, ${similarToDelete.length} similar-image)`)

  if (args.dryRun) {
    console.log(`\n[DRY RUN] Re-run with --delete to actually delete these ${totalToDelete} posts.`)
    return
  }

  console.log(`\nDeleting ${totalToDelete} posts...`)
  let deleted = 0
  let failed = 0
  const ids = new Set([...noImage, ...unreachable, ...similarToDelete.map((s) => s.post)].map((p) => p.id))
  for (const id of ids) {
    const del = await graphApiRequest(`${FB_GRAPH}/${id}?access_token=${encodeURIComponent(token)}`, "DELETE")
    if (del && !del.error) {
      deleted++
      console.log(`  DELETED ${id}`)
    } else {
      failed++
      console.error(`  FAILED  ${id}: ${(del.error || {}).message || JSON.stringify(del)}`)
    }
    await sleep(500)
  }
  console.log(`\nDone: ${deleted} deleted, ${failed} failed.`)
}

main().catch((err) => {
  console.error("Page cleanup failed:", err.message)
  process.exit(1)
})
