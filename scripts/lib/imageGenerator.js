const fs = require("fs")
const path = require("path")
const sharp = require("sharp")
const { applyWatermarks } = require("./watermark")
const { cleanImage } = require("./imageCleaner")

const AI_IMAGE_API_KEY = process.env.AI_IMAGE_API_KEY || ""
const AI_IMAGE_MODEL = process.env.AI_IMAGE_MODEL || "black-forest-labs/flux-schnell"
const AI_IMAGE_BASE_URL = process.env.AI_IMAGE_BASE_URL || "https://api.replicate.com/v1"
const AI_IMAGE_ENABLED = !!(AI_IMAGE_API_KEY && process.env.AI_IMAGE_ENABLED === "true")

const TRANSFORMED_DIR = path.join(__dirname, "../../public/images/transformed")
const TARGET_WIDTH = 1200
const TARGET_HEIGHT = 630

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

function buildPrompt(title, description) {
  const topic = (title + " " + (description || "")).slice(0, 200)
  return `Regenerate this news photograph exactly as a professional photojournalism image. Topic: ${topic}. High quality, 4K resolution, sharp details, accurate colors, natural lighting, realistic textures. CRITICAL: Remove all text, logos, watermarks, channel overlays, badges, banners, labels, subtitles, and captions from the image. Output must be a clean news photograph with no superimposed elements.`
}

async function regenerateViaAI(originalBuffer, title, description) {
  if (!AI_IMAGE_ENABLED) {
    console.log("    AI image regeneration disabled, using inpainting fallback")
    const cleaned = await cleanImage(originalBuffer)
    return cleaned
  }

  ensureDir(TRANSFORMED_DIR)
  const tempPath = path.join(TRANSFORMED_DIR, `_ai_input_${Date.now()}.png`)
  const outputPath = path.join(TRANSFORMED_DIR, `_ai_output_${Date.now()}.jpg`)

  try {
    await sharp(originalBuffer)
      .resize(1024, 1024, { fit: "inside", withoutEnlargement: false })
      .png()
      .toFile(tempPath)

    const imageData = fs.readFileSync(tempPath)
    const prompt = buildPrompt(title, description)

    console.log(`    Sending to AI for watermark-free regeneration (model: ${AI_IMAGE_MODEL})...`)

    const response = await fetch(`${AI_IMAGE_BASE_URL}/predictions`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${AI_IMAGE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: AI_IMAGE_MODEL,
        input: {
          prompt,
          image: `data:image/png;base64,${imageData.toString("base64")}`,
          num_outputs: 1,
          num_inference_steps: 30,
          guidance_scale: 7.5,
          output_format: "jpg",
          output_quality: 95,
          width: 1024,
          height: 1024,
        },
      }),
    })

    if (!response.ok) {
      const err = await response.text().catch(() => "")
      throw new Error(`AI API responded ${response.status}: ${err.slice(0, 150)}`)
    }

    const prediction = await response.json()
    const predictionId = prediction.id

    console.log("    Waiting for AI generation to complete...")
    let result
    for (let i = 0; i < 90; i++) {
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
        throw new Error(`AI generation failed: ${status.error || "unknown"}`)
      }
      if (i % 15 === 0) console.log(`    Still waiting... (${Math.round(i * 2)}s)`)
    }

    if (!result) throw new Error("AI image generation timed out after 3 minutes")

    const imageUrl = Array.isArray(result) ? result[0] : result
    const regenerated = await downloadImage(imageUrl)

    await sharp(regenerated)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: "cover", position: "centre" })
      .jpeg({ quality: 95, progressive: true })
      .toFile(outputPath)

    console.log("    AI regeneration complete — source watermark removed")
    return fs.readFileSync(outputPath)
  } catch (err) {
    console.log(`    AI regeneration failed: ${err.message}`)
    console.log("    Falling back to inpainting-based watermark removal")
    try {
      const cleaned = await cleanImage(originalBuffer)
      return cleaned
    } catch (fallbackErr) {
      throw new Error(`All image processing failed: ${err.message}; fallback also failed: ${fallbackErr.message}`)
    }
  } finally {
    try { if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath) } catch {}
    try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath) } catch {}
  }
}

async function processArticleImage(article) {
  const slug = article.slug || `article-${Date.now()}`
  const imageUrl = article.image || article.imageUrl || ""
  const title = article.title || "News"
  const description = article.description || article.excerpt || ""

  if (!imageUrl) {
    console.log(`  No image URL for ${slug}`)
    return null
  }

  ensureDir(path.join(__dirname, "../../public/images/articles"))

  try {
    const original = await downloadImage(imageUrl)

    const processed = await regenerateViaAI(original, title, description)

    const withWatermark = await applyWatermarks(processed)

    let pipeline = sharp(withWatermark)
    const meta = await pipeline.metadata()
    const w = meta.width || TARGET_WIDTH
    const h = meta.height || TARGET_HEIGHT

    const cropLeft = Math.round(w * 0.08)
    const cropTop = Math.round(h * 0.06)
    const cropRight = Math.round(w * 0.08)
    const cropBottom = Math.round(h * 0.06)
    const cropW = w - cropLeft - cropRight
    const cropH = h - cropTop - cropBottom
    if (cropW > 200 && cropH > 200) {
      pipeline = sharp(withWatermark).extract({
        left: cropLeft,
        top: cropTop,
        width: cropW,
        height: cropH,
      })
    }

    const resized = await pipeline
      .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: "cover", position: "centre" })
      .jpeg({ quality: 95, progressive: true })
      .toBuffer()

    const outPath = path.join(__dirname, "../../public/images/articles", `${slug}.jpg`)
    fs.writeFileSync(outPath, resized)
    console.log(`  Image ready: ${slug}.jpg (AI regen: ${AI_IMAGE_ENABLED}, watermark: The Global Lens 365)`)

    return `/images/articles/${slug}.jpg`
  } catch (err) {
    console.log(`  Image processing FAILED for ${slug}: ${err.message}`)
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
  console.log(`Images processed successfully: ${processed}/${articles.length}`)

  return results
}

module.exports = { processArticleImage, processAllArticleImages, regenerateViaAI, AI_IMAGE_ENABLED }
