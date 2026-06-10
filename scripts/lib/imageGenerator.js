const fs = require("fs")
const path = require("path")
const sharp = require("sharp")
const { applyWatermarks } = require("./watermark")

const AI_IMAGE_API_KEY = process.env.AI_IMAGE_API_KEY || ""
const AI_IMAGE_MODEL = process.env.AI_IMAGE_MODEL || "flux"
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

const MODELS_LAB_URL = "https://modelslab.com/api/v6/realtime/text2img"
const POLL_DELAY_MS = 2000
const MAX_POLLS = 60

function buildPrompt(title, description) {
  const topic = (title + " " + (description || "")).slice(0, 250)
  return `professional photojournalism news photograph: ${topic}. High quality, sharp focus, natural lighting, accurate colors, realistic textures. Clean image with no text, logos, watermarks, banners, or superimposed elements.`
}

async function pollFetchResult(fetchUrl) {
  console.log("    Polling for async AI generation result...")
  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise((r) => setTimeout(r, POLL_DELAY_MS))
    const resp = await fetch(fetchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: AI_IMAGE_API_KEY }),
    })
    const data = await resp.json()
    if (data.status === "success") {
      return data.output
    }
    if (data.status === "error") {
      throw new Error(`AI generation failed: ${data.message || "unknown"}`)
    }
    if (i % 15 === 0) console.log(`    Still waiting... (${Math.round(i * 2)}s)`)
  }
  throw new Error("AI image generation timed out")
}

async function resizeOriginal(originalBuffer) {
  return await sharp(originalBuffer)
    .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: "cover", position: "centre" })
    .jpeg({ quality: 95, progressive: true })
    .toBuffer()
}

async function regenerateViaAI(originalBuffer, title, description) {
  if (!AI_IMAGE_ENABLED) {
    console.log("    AI regeneration disabled — resize only")
    return await resizeOriginal(originalBuffer)
  }

  const outputPath = path.join(TRANSFORMED_DIR, `_ai_output_${Date.now()}.jpg`)

  try {
    const prompt = buildPrompt(title, description)
    console.log(`    ModelsLab AI regeneration (model: ${AI_IMAGE_MODEL})...`)

    const response = await fetch(MODELS_LAB_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        key: AI_IMAGE_API_KEY,
        model_id: AI_IMAGE_MODEL,
        prompt,
        width: "1024",
        height: "1024",
        samples: "1",
        num_inference_steps: "20",
        safety_checker: false,
        seed: null,
        base64: false,
        webhook: null,
        track_id: null,
      }),
    })

    if (!response.ok) {
      const err = await response.text().catch(() => "")
      throw new Error(`AI API responded ${response.status}: ${err.slice(0, 150)}`)
    }

    const data = await response.json()

    if (data.status === "error") {
      const msg = data.message || "unknown"
      if (msg.toLowerCase().includes("credit") || msg.toLowerCase().includes("fund") || msg.toLowerCase().includes("subscribe")) {
        console.log(`    AI credits exhausted (${msg}) — using original image`)
        return await resizeOriginal(originalBuffer)
      }
      throw new Error(`AI API error: ${msg}`)
    }

    let outputUrls
    if (data.status === "success") {
      outputUrls = data.output
    } else if (data.status === "processing") {
      console.log("    AI processing asynchronously...")
      const fetchUrl = data.fetch_result
      if (!fetchUrl) throw new Error("No fetch_result URL")
      outputUrls = await pollFetchResult(fetchUrl)
    } else {
      throw new Error(`Unexpected status: ${data.status}`)
    }

    if (!outputUrls || !outputUrls.length) {
      throw new Error("AI returned no image URLs")
    }

    const imageUrl = outputUrls[0]
    console.log(`    Downloading AI image...`)
    const regenerated = await downloadImage(imageUrl)

    await sharp(regenerated)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: "cover", position: "centre" })
      .jpeg({ quality: 95, progressive: true })
      .toFile(outputPath)

    console.log("    AI regeneration complete — source watermark removed")
    return fs.readFileSync(outputPath)
  } catch (err) {
    console.log(`    AI regeneration failed: ${err.message} — using original image`)
    return await resizeOriginal(originalBuffer)
  } finally {
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
    console.log(`  Image ready: ${slug}.jpg`)

    return `/images/articles/${slug}.jpg`
  } catch (err) {
    console.log(`  Image FAILED for ${slug}: ${err.message}`)
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
