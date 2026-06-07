const fs = require("fs")
const path = require("path")
const https = require("https")
const http = require("http")
const sharp = require("sharp")

function fetchOgImage(articleUrl) {
  if (!articleUrl || !articleUrl.startsWith("http")) return Promise.resolve(null)
  return new Promise((resolve) => {
    const protocol = articleUrl.startsWith("https") ? https : http
    const req = protocol.get(articleUrl, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GlobalLens/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchOgImage(res.headers.location).then(resolve)
        return
      }
      if (res.statusCode !== 200) { resolve(null); return }
      let html = ""
      res.on("data", (chunk) => {
        html += chunk.toString()
        if (html.length > 100000) { req.destroy(); resolve(extractOgFromHtml(html)) }
      })
      res.on("end", () => resolve(extractOgFromHtml(html)))
    })
    req.on("error", () => resolve(null))
    req.on("timeout", () => { req.destroy(); resolve(null) })
  })
}

function extractOgFromHtml(html) {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i,
  ]
  for (const pattern of patterns) {
    const m = html.match(pattern)
    if (m && m[1]) {
      try { new URL(m[1]); return m[1] } catch { continue }
    }
  }
  return null
}

const TRANSFORMED_DIR = path.join(__dirname, "../../public/images/transformed")

const FB_IMAGE_WIDTH = 1200
const FB_IMAGE_HEIGHT = 630
const CROP_PERCENT = 0.03
const MAX_ROTATION_ANGLE = 2.5
const JPEG_QUALITY = 88

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function downloadImageBuffer(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http
    const req = protocol.get(url, {
      timeout: 15000,
      headers: {
        "User-Agent": "GlobalLens/1.0 (Image Transformer; bot@thegloballens365.com)",
        Accept: "image/webp,image/jpeg,image/png,*/*",
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadImageBuffer(res.headers.location).then(resolve).catch(reject)
        return
      }
      if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}`)); return }
      const contentType = res.headers["content-type"] || ""
      if (!contentType.startsWith("image/")) { reject(new Error(`Not an image: ${contentType}`)); return }
      const chunks = []
      let totalSize = 0
      res.on("data", (chunk) => {
        totalSize += chunk.length
        if (totalSize > 20 * 1024 * 1024) { req.destroy(); reject(new Error("Image too large")); return }
        chunks.push(chunk)
      })
      res.on("end", () => resolve(Buffer.concat(chunks)))
    })
    req.on("error", reject)
    req.on("timeout", () => { req.destroy(); reject(new Error("Timeout")) })
  })
}

function randomAngle() {
  return (Math.random() - 0.5) * 2 * MAX_ROTATION_ANGLE
}

function randomBrightness() {
  return 1.0 + (Math.random() - 0.5) * 0.1
}

function randomContrast() {
  return 1.0 + (Math.random() - 0.5) * 0.08
}

function randomSaturation() {
  return 1.0 + (Math.random() - 0.5) * 0.06
}

async function transformImage(sourceBuffer) {
  const meta = await sharp(sourceBuffer).metadata()
  const w = meta.width || FB_IMAGE_WIDTH
  const h = meta.height || FB_IMAGE_HEIGHT

  const cropPxW = Math.round(w * CROP_PERCENT)
  const cropPxH = Math.round(h * CROP_PERCENT)

  const angle = randomAngle()
  const brightness = randomBrightness()
  const contrast = randomContrast()
  const saturation = randomSaturation()

  let pipeline = sharp(sourceBuffer)

  pipeline = pipeline.rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })

  const cropLeft = cropPxW
  const cropTop = cropPxH
  const cropWidth = w - cropPxW * 2
  const cropHeight = h - cropPxH * 2
  if (cropWidth > 0 && cropHeight > 0) {
    pipeline = pipeline.extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
  }

  pipeline = pipeline
    .resize(FB_IMAGE_WIDTH, FB_IMAGE_HEIGHT, {
      fit: "cover",
      position: "centre",
      withoutEnlargement: false,
    })
    .modulate({ brightness, saturation })
    .linear(contrast, -(contrast - 1) * 128)
    .jpeg({ quality: JPEG_QUALITY, progressive: true })

  return await pipeline.toBuffer()
}

async function getTransformableImageUrl(article, siteUrl) {
  const img = article.image || article.imageUrl || ""
  if (img.startsWith("http://") || img.startsWith("https://")) {
    return img
  }
  if (img.startsWith("/")) {
    return `${siteUrl.replace(/\/$/, "")}${img}`
  }
  if (article.sourceUrl) {
    console.log(`    No local image — fetching og:image from source URL...`)
    const ogUrl = await fetchOgImage(article.sourceUrl)
    if (ogUrl) {
      console.log(`    Found og:image: ${ogUrl.substring(0, 80)}`)
      return ogUrl
    }
  }
  return null
}

async function transformAndSave(article, siteUrl) {
  ensureDir(TRANSFORMED_DIR)

  const imageUrl = await getTransformableImageUrl(article, siteUrl)
  if (!imageUrl) return null

  const slug = (article.slug || "").replace(/[^a-zA-Z0-9_-]/g, "").substring(0, 60) || `img-${Date.now()}`
  const outPath = path.join(TRANSFORMED_DIR, `${slug}.jpg`)

  try {
    const buffer = await downloadImageBuffer(imageUrl)
    const transformed = await transformImage(buffer)
    fs.writeFileSync(outPath, transformed)
    const transformedUrl = `/images/transformed/${slug}.jpg`

    console.log(`    Image transformed: ${imageUrl.substring(0, 80)} → ${transformedUrl} (angle: ${randomAngle().toFixed(1)}°, crop: ${Math.round(CROP_PERCENT * 100)}%)`)
    return `${siteUrl.replace(/\/$/, "")}${transformedUrl}`
  } catch (err) {
    console.log(`    Image transform failed: ${err.message}. Using original.`)
    return imageUrl
  }
}

module.exports = { transformAndSave, transformImage, getTransformableImageUrl }
