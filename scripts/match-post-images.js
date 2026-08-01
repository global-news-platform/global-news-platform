#!/usr/bin/env node

const https = require("https")
const fs = require("fs")
const path = require("path")
const sharp = require("sharp")

const FB_GRAPH = "https://graph.facebook.com/v22.0"const SITE = "https://thegloballens365.vercel.app"
const REPORT_PATH = path.join(process.cwd(), "match-report.txt")

function log(msg) {
  console.log(msg)
  try {
    fs.appendFileSync(REPORT_PATH, `${msg}\n`, "utf-8")
  } catch {}
}

function parseArgs() {
  const args = { pageId: null, token: null, limit: 0, deleteBad: false }
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--page-id=")) args.pageId = arg.split("=")[1]
    else if (arg.startsWith("--token=")) args.token = arg.split("=")[1]
    else if (arg.startsWith("--limit=")) args.limit = parseInt(arg.split("=")[1], 10)
    else if (arg === "--delete") args.deleteBad = true
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
      headers: { "User-Agent": "GlobalLens/1.0 (Facebook Match; bot@thegloballens365.com)" },
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

async function download(url, timeoutMs = 15000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "GlobalLens/1.0 (Image Match)" },
      redirect: "follow",
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 100) throw new Error("Image too small")
    return buf
  } catch (err) {
    throw err
  } finally {
    clearTimeout(timer)
  }
}

async function dHash(buf) {
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

function hamming(a, b) {
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

function extractSlug(message) {
  const m = message.match(/\/article\/([a-z0-9-]+)/i)
  return m ? m[1] : null
}

async function fetchOgImage(slug) {
  try {
    const html = (await download(`${SITE}/article/${slug}`, 20000)).toString("utf-8")
    const patterns = [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    ]
    for (const p of patterns) {
      const m = html.match(p)
      if (m && m[1]) {
        if (m[1].startsWith("http")) return m[1]
        if (m[1].startsWith("/")) return SITE + m[1]
      }
    }
    const img = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*class=["'][^"']*(article|hero|featured)/i)
    if (img && img[1]) return img[1].startsWith("http") ? img[1] : SITE + img[1]
  } catch (err) {
    return null
  }
  return null
}

async function main() {
  const args = parseArgs()
  const pageId = args.pageId || process.env.FB_PAGE_ID
  const token = args.token || process.env.FB_PAGE_ACCESS_TOKEN

  if (!pageId || !token) {
    log("Missing Facebook credentials.")
    process.exit(1)
  }

  if (fs.existsSync(REPORT_PATH)) fs.unlinkSync(REPORT_PATH)

  log("=".repeat(60))
  log("  Facebook Post ↔ Article Image Match Check")
  log("=".repeat(60))

  const url =
    `${FB_GRAPH}/${pageId}/posts?fields=id,created_time,message,attachments{media_type,url,type,media{image{src}},subattachments{media_type,media{image{src}}}}` +
    `&limit=${args.limit}&access_token=${encodeURIComponent(token)}`

  const res = await graphApiRequest(url)
  if (res.error) {
    log(`  API error: ${res.error.message || JSON.stringify(res.error)}`)
    process.exit(1)
  }

  const posts = res.data || []
  log(`  Fetched ${posts.length} posts.\n`)

  let checked = 0
  let mismatched = 0
  const badPosts = []
  for (let i = 0; i < posts.length; i++) {
    const p = posts[i]
    const msg = (p.message || "").replace(/\s+/g, " ")
    const slug = extractSlug(msg)
    const title = (msg || "").substring(0, 90)
    const imageUrls = collectImageUrls(p)

    log(`--- POST ${i + 1} (${p.created_time}) ---`)
    log(`  title: ${title}`)
    if (!slug) {
      log(`  (no article slug found in message)`)
      continue
    }
    log(`  slug: ${slug}`)

    if (imageUrls.length === 0) {
      log(`  (no image in post)`)
      continue
    }

    checked++
    const ogUrl = await fetchOgImage(slug)
    if (!ogUrl) {
      log(`  article page: FAILED to fetch / no og:image (${SITE}/article/${slug})`)
      badPosts.push({ post: p, reason: "no-article-og" })
      continue
    }

    let fbHash = null
    let ogHash = null
    let fbOk = false
    let ogOk = false
    try {
      fbHash = await dHash(await download(imageUrls[0]))
      fbOk = true
    } catch (err) {
      log(`  posted image download failed: ${err.message}`)
    }
    try {
      ogHash = await dHash(await download(ogUrl))
      ogOk = true
    } catch (err) {
      log(`  article image download failed (${ogUrl}): ${err.message}`)
    }

    if (fbOk && ogOk) {
      const dist = hamming(fbHash, ogHash)
      const verdict = dist <= 8 ? "MATCH" : "MISMATCH"
      if (dist > 8) {
        mismatched++
        badPosts.push({ post: p, reason: `image-mismatch` })
      }
      log(`  hamming distance: ${dist}/64 → ${verdict}`)
      log(`  posted image: ${imageUrls[0].substring(0, 100)}...`)
      log(`  article image: ${ogUrl}`)
    } else {
      log(`  (could not compare both images)`)
    }
    log("")
  }

  log(`Summary: ${checked} posts checked, ${mismatched} mismatched.`)

  if (args.deleteBad && badPosts.length > 0) {
    log(`\nDeleting ${badPosts.length} posts with bad/mismatched images...`)
    let deleted = 0
    let failed = 0
    for (const { post, reason } of badPosts) {
      const del = await graphApiRequest(`${FB_GRAPH}/${post.id}?access_token=${encodeURIComponent(token)}`, "DELETE")
      if (del && !del.error) {
        deleted++
        log(`  DELETED ${post.id} (${reason})`)
      } else {
        failed++
        log(`  FAILED  ${post.id} (${reason}): ${(del.error || {}).message || JSON.stringify(del)}`)
      }
      await new Promise((r) => setTimeout(r, 500))
    }
    log(`\nDone: ${deleted} deleted, ${failed} failed.`)
  }
}

main().catch((err) => {
  log("Match check failed:", err.message)
  process.exit(1)
})
