#!/usr/bin/env node
const fs = require("fs")
const path = require("path")
const http = require("http")
const https = require("https")

const LOGO_DIR = path.join(__dirname, "../public/images")
const LOGO_PATH = path.join(LOGO_DIR, "logo.png")
const LOGO_SMALL_PATH = path.join(LOGO_DIR, "logo-sm.png")

function graphApiRequest(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url)
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: "GET",
      headers: { "User-Agent": "GlobalLens/1.0 (Logo Fetcher)" },
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
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("Timeout")) })
    req.end()
  })
}

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http
    const req = protocol.get(url, { timeout: 15000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadImage(res.headers.location).then(resolve).catch(reject)
        return
      }
      if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}`)); return }
      const chunks = []
      res.on("data", (chunk) => chunks.push(chunk))
      res.on("end", () => resolve(Buffer.concat(chunks)))
    })
    req.on("error", reject)
    req.on("timeout", () => { req.destroy(); reject(new Error("Timeout")) })
  })
}

async function main() {
  const pageId = process.env.FB_PAGE_ID
  const token = process.env.FB_PAGE_ACCESS_TOKEN

  if (!pageId || !token) {
    console.log("fetch-logo: FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN not set. Skipping.")
    return
  }

  console.log(`fetch-logo: Fetching page picture for page ${pageId}...`)

  const apiUrl =
    `https://graph.facebook.com/v22.0/${pageId}/picture` +
    `?type=large&redirect=false&access_token=${encodeURIComponent(token)}`

  try {
    const result = await graphApiRequest(apiUrl)
    if (result.error) {
      console.error(`fetch-logo: API error: ${result.error.message}`)
      return
    }

    const imageUrl = result.data?.url
    if (!imageUrl) {
      console.error("fetch-logo: No image URL in response")
      return
    }

    console.log(`fetch-logo: Downloading logo from ${imageUrl.substring(0, 80)}...`)
    const buffer = await downloadImage(imageUrl)

    fs.mkdirSync(LOGO_DIR, { recursive: true })
    fs.writeFileSync(LOGO_PATH, buffer)
    console.log(`fetch-logo: Saved logo (${(buffer.length / 1024).toFixed(1)} KB) to ${LOGO_PATH}`)

    const sharp = require("sharp")
    const small = await sharp(buffer).resize(48, 48, { fit: "cover" }).png().toBuffer()
    fs.writeFileSync(LOGO_SMALL_PATH, small)
    console.log(`fetch-logo: Saved small logo to ${LOGO_SMALL_PATH}`)

    console.log("fetch-logo: Done.")
  } catch (err) {
    console.error(`fetch-logo: Failed: ${err.message}`)
  }
}

main().catch((err) => {
  console.error("fetch-logo fatal:", err)
  process.exit(0)
})
