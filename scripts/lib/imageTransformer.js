const fs = require("fs")
const path = require("path")
const https = require("https")
const http = require("http")
const sharp = require("sharp")
const { regenerateViaAI } = require("./imageGenerator")

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
const LOGO_SMALL_PATH = path.join(__dirname, "../../public/images/logo-sm.png")

const FB_IMAGE_WIDTH = 1200
const FB_IMAGE_HEIGHT = 630
const CROP_PERCENT = 0.12
const MAX_ROTATION_ANGLE = 5
const ZOOM_FACTOR_MIN = 1.10
const ZOOM_FACTOR_MAX = 1.22
const JPEG_QUALITY = 88
const LOGO_OPACITY = 0.8
const LOGO_PADDING = 12

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

async function addLogoWatermark(buffer) {
  if (!fs.existsSync(LOGO_SMALL_PATH)) return buffer

  const meta = await sharp(buffer).metadata()
  const w = meta.width || FB_IMAGE_WIDTH
  const h = meta.height || FB_IMAGE_HEIGHT

  const logoBuffer = await sharp(LOGO_SMALL_PATH).toBuffer()
  const logoMeta = await sharp(logoBuffer).metadata()
  const logoW = logoMeta.width || 48
  const logoH = logoMeta.height || 48

  const logoSize = Math.round(Math.min(w, h) * 0.055)
  const resizedLogo = await sharp(logoBuffer)
    .resize(logoSize, logoSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  const padding = LOGO_PADDING
  const left = w - logoSize - padding
  const top = h - logoSize - padding

  const result = await sharp(buffer)
    .composite([{
      input: resizedLogo,
      top: Math.round(top),
      left: Math.round(left),
      blend: "over",
      opacity: LOGO_OPACITY,
    }])
    .toBuffer()

  return result
}

async function transformImage(sourceBuffer) {
  let pipeline = sharp(sourceBuffer)
  const meta = await pipeline.metadata()
  const w = meta.width || FB_IMAGE_WIDTH
  const h = meta.height || FB_IMAGE_HEIGHT

  const cropPxW = Math.round(w * CROP_PERCENT)
  const cropPxH = Math.round(h * CROP_PERCENT)
  const cropPxW2 = Math.round(w * (CROP_PERCENT + (Math.random() - 0.5) * 0.07))
  const cropPxH2 = Math.round(h * (CROP_PERCENT + (Math.random() - 0.5) * 0.07))

  const angle = randomAngle()
  const brightness = randomBrightness()
  const contrast = randomContrast()
  const saturation = randomSaturation()
  const zoom = ZOOM_FACTOR_MIN + Math.random() * (ZOOM_FACTOR_MAX - ZOOM_FACTOR_MIN)

  pipeline = pipeline.rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })

  const origW = meta.width || FB_IMAGE_WIDTH
  const origH = meta.height || FB_IMAGE_HEIGHT
  const cropLeft = Math.max(0, Math.min(cropPxW, Math.round(origW * 0.35)))
  const cropTop = Math.max(0, Math.min(cropPxH, Math.round(origH * 0.25)))
  const cropLeft2 = Math.max(0, Math.min(cropPxW2, Math.round(origW * 0.30)))
  const cropTop2 = Math.max(0, Math.min(cropPxH2, Math.round(origH * 0.35)))
  const cropWidth = origW - cropLeft - cropLeft2
  const cropHeight = origH - cropTop - cropTop2
  if (cropWidth > 100 && cropHeight > 100) {
    pipeline = pipeline.extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
  }

  let croppedBuffer
  try { croppedBuffer = await pipeline.toBuffer() } catch { return null }

  let cleanPipeline = sharp(croppedBuffer)
  const resizeW = Math.round(FB_IMAGE_WIDTH * zoom)
  const resizeH = Math.round(FB_IMAGE_HEIGHT * zoom)

  cleanPipeline = cleanPipeline
    .resize(resizeW, resizeH, {
      fit: "cover",
      position: "centre",
      withoutEnlargement: false,
    })
    .modulate({ brightness, saturation })
    .linear(contrast, -(contrast - 1) * 128)
    .jpeg({ quality: JPEG_QUALITY, progressive: true })

  let finalBuffer
  try {
    finalBuffer = await cleanPipeline.toBuffer()
  } catch { return null }

  try {
    finalBuffer = await addLogoWatermark(finalBuffer)
  } catch (err) {
    console.log(`    Logo watermark skipped: ${err.message}`)
  }

  return finalBuffer
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
    const cleaned = await regenerateViaAI(buffer, article.title || "", article.description || "")
    const transformed = await transformImage(cleaned)
    if (!transformed) return null
    fs.writeFileSync(outPath, transformed)
    const transformedUrl = `/images/transformed/${slug}.jpg`

    console.log(`    Image transformed: ${imageUrl.substring(0, 80)} → ${transformedUrl} (AI regeneration: enabled, crop: 12%, zoom: 1.10-1.22x, brand logo: added)`)
    return `${siteUrl.replace(/\/$/, "")}${transformedUrl}`
  } catch (err) {
    console.log(`    Image transform failed: ${err.message}. Using original.`)
    return imageUrl
  }
}

module.exports = { transformAndSave, transformImage, getTransformableImageUrl }
