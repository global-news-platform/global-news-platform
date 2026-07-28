const fs = require("fs")
const path = require("path")
const sharp = require("sharp")
const { applyWatermarks } = require("./watermark")

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
  const topic = (title + " " + (description || "")).slice(0, 250)
  return `professional photojournalism news photograph: ${topic}. High quality, sharp focus, natural lighting, accurate colors, realistic textures. Clean image with no text, logos, watermarks, banners, or superimposed elements.`
}

async function resizeOriginal(originalBuffer) {
  return await sharp(originalBuffer)
    .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: "cover", position: "centre" })
    .jpeg({ quality: 95, progressive: true })
    .toBuffer()
}

async function regenerateViaAI(originalBuffer, title, description) {
  const prompt = buildPrompt(title, description)
  const encodedPrompt = encodeURIComponent(prompt)
  const url = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 99999)}&model=flux`

  try {
    console.log(`    Pollinations.ai generation...`)
    const response = await fetch(url, {
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      throw new Error(`Pollinations responded ${response.status}`)
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    if (buffer.length < 1000) {
      throw new Error(`Generated image too small (${buffer.length} bytes)`)
    }

    const processed = await sharp(buffer)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: "cover", position: "centre" })
      .jpeg({ quality: 95, progressive: true })
      .toBuffer()

    console.log("    Pollinations.ai generation complete")
    return processed
  } catch (err) {
    console.log(`    AI generation failed (${err.message}) — cropping original as fallback`)
    const meta = await sharp(originalBuffer).metadata()
    const iw = meta.width || TARGET_WIDTH
    const ih = meta.height || TARGET_HEIGHT
    const cropH = Math.round(ih * 0.80)
    return await sharp(originalBuffer)
      .extract({ left: 0, top: 0, width: iw, height: cropH })
      .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: "cover", position: "centre" })
      .jpeg({ quality: 95, progressive: true })
      .toBuffer()
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

module.exports = { processArticleImage, processAllArticleImages, regenerateViaAI }
