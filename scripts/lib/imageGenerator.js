const fs = require("fs")
const path = require("path")
const sharp = require("sharp")
const { applyWatermarks } = require("./watermark")

const AI_IMAGE_API_KEY = process.env.AI_IMAGE_API_KEY || ""
const AI_IMAGE_MODEL = process.env.AI_IMAGE_MODEL || "black-forest-labs/flux-schnell"
const AI_IMAGE_BASE_URL = process.env.AI_IMAGE_BASE_URL || "https://api.replicate.com/v1"
const AI_IMAGE_ENABLED = !!(AI_IMAGE_API_KEY && process.env.AI_IMAGE_ENABLED === "true")

const ARTICLES_IMG_DIR = path.join(__dirname, "../../public/images/articles")
const TRANSFORMED_DIR = path.join(__dirname, "../../public/images/transformed")

const IMAGE_WIDTH = 1200
const IMAGE_HEIGHT = 630

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

async function downloadImage(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "GlobalLens/1.0 (Image Generator)" },
    signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.length < 1000) throw new Error("Image too small")
  return buffer
}

async function regenerateViaAI(originalBuffer, title) {
  if (!AI_IMAGE_ENABLED) return originalBuffer

  const ext = AI_IMAGE_MODEL.includes("flux") ? ".png" : ".jpg"
  const tempPath = path.join(TRANSFORMED_DIR, `_ai_ref${ext}`)
  ensureDir(TRANSFORMED_DIR)
  await sharp(originalBuffer).resize(1024, 1024, { fit: "inside" }).toFile(tempPath)

  try {
    const data = await readBinary(tempPath)

    const response = await fetch(`${AI_IMAGE_BASE_URL}/predictions`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${AI_IMAGE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: AI_IMAGE_MODEL,
        input: {
          prompt: `News photograph: ${title.slice(0, 100)}. Professional photojournalism, high quality, no text, no watermark, clean image`,
          image: data.toString("base64"),
          num_outputs: 1,
          num_inference_steps: 25,
          guidance_scale: 7.5,
          output_format: "jpg",
        },
      }),
    })

    if (!response.ok) {
      const err = await response.text().catch(() => "")
      throw new Error(`AI Image API error: ${response.status} ${err.slice(0, 100)}`)
    }

    const prediction = await response.json()
    const predictionId = prediction.id

    let result
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 2000))
      const statusResp = await fetch(`${AI_IMAGE_BASE_URL}/predictions/${predictionId}`, {
        headers: { "Authorization": `Token ${AI_IMAGE_API_KEY}` },
      })
      const status = await statusResp.json()
      if (status.status === "succeeded") {
        result = status.output
        break
      }
      if (status.status === "failed") {
        throw new Error(`AI image generation failed: ${status.error || "unknown"}`)
      }
    }

    if (!result) throw new Error("AI image generation timed out")

    const imageUrl = Array.isArray(result) ? result[0] : result
    const regenerated = await downloadImage(imageUrl)
    console.log(`    AI regenerated image (model: ${AI_IMAGE_MODEL})`)
    return regenerated
  } catch (err) {
    console.log(`    AI image regeneration skipped: ${err.message}`)
    return originalBuffer
  }
}

function readBinary(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

async function processArticleImage(article) {
  const slug = article.slug || `article-${Date.now()}`
  const imageUrl = article.image || article.imageUrl || ""
  const title = article.title || "News"

  if (!imageUrl) {
    console.log(`  No image URL for ${slug}`)
    return null
  }

  ensureDir(ARTICLES_IMG_DIR)

  try {
    const original = await downloadImage(imageUrl)

    const regenerated = await regenerateViaAI(original, title)

    let pipeline = sharp(regenerated)
    const meta = await pipeline.metadata()
    const w = meta.width || IMAGE_WIDTH
    const h = meta.height || IMAGE_HEIGHT

    const cropLeft = Math.round(w * 0.08)
    const cropTop = Math.round(h * 0.06)
    const cropRight = Math.round(w * 0.08)
    const cropBottom = Math.round(h * 0.06)
    const cropW = w - cropLeft - cropRight
    const cropH = h - cropTop - cropBottom
    if (cropW > 200 && cropH > 200) {
      pipeline = sharp(regenerated).extract({
        left: cropLeft,
        top: cropTop,
        width: cropW,
        height: cropH,
      })
    }

    const resized = await pipeline
      .resize(IMAGE_WIDTH, IMAGE_HEIGHT, { fit: "cover", position: "centre" })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer()

    const watermarked = await applyWatermarks(resized)

    const outPath = path.join(ARTICLES_IMG_DIR, `${slug}.jpg`)
    fs.writeFileSync(outPath, watermarked)
    console.log(`  Image processed: ${slug}.jpg (AI regen: ${AI_IMAGE_ENABLED}, watermark: The Global Lens 365)`)

    return `/images/articles/${slug}.jpg`
  } catch (err) {
    console.log(`  Image processing failed for ${slug}: ${err.message}`)
    return null
  }
}

async function processAllArticleImages(articles, concurrency = 3) {
  console.log(`\nProcessing images for ${articles.length} articles...`)

  const results = []
  for (let i = 0; i < articles.length; i += concurrency) {
    const batch = articles.slice(i, i + concurrency)
    const batchResults = await Promise.all(
      batch.map((a) => processArticleImage(a).catch(() => null))
    )
    results.push(...batchResults)

    if (i + concurrency < articles.length) {
      console.log(`  Image progress: ${Math.min(i + concurrency, articles.length)}/${articles.length}`)
    }
  }

  const processed = results.filter(Boolean).length
  console.log(`Images processed: ${processed}/${articles.length}`)

  return results
}

module.exports = { processArticleImage, processAllArticleImages, AI_IMAGE_ENABLED }
