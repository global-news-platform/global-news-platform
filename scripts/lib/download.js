const fs = require("fs")
const path = require("path")
const https = require("https")
const http = require("http")

const IMAGES_DIR = path.join(__dirname, "../../public/images/articles")

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function downloadImage(url, destination) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http

    protocol
      .get(url, { timeout: 10000 }, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`))
          return
        }

        const contentType = response.headers["content-type"]
        if (contentType && !contentType.startsWith("image/")) {
          reject(new Error(`Not an image: ${contentType}`))
          return
        }

        const fileStream = fs.createWriteStream(destination)
        response.pipe(fileStream)

        fileStream.on("finish", () => {
          fileStream.close()
          resolve()
        })

        fileStream.on("error", (err) => {
          fs.unlink(destination, () => {})
          reject(err)
        })
      })
      .on("error", reject)
      .on("timeout", function () {
        this.destroy()
        reject(new Error("Timeout"))
      })
  })
}

async function downloadArticleImage(slug, imageUrl) {
  if (!imageUrl) return null

  ensureDir(IMAGES_DIR)

  const ext = path.extname(new URL(imageUrl).pathname) || ".jpg"
  const filename = `${slug}${ext}`
  const destination = path.join(IMAGES_DIR, filename)

  if (fs.existsSync(destination)) {
    return `/images/articles/${filename}`
  }

  try {
    await downloadImage(imageUrl, destination)
    console.log(`  ✓ Image: ${filename}`)
    return `/images/articles/${filename}`
  } catch (err) {
    console.log(`  ✗ Image failed: ${err.message}`)
    return null
  }
}

async function downloadAllImages(articles) {
  let downloaded = 0
  let failed = 0

  for (const article of articles) {
    if (article.imageUrl) {
      const result = await downloadArticleImage(article.slug, article.imageUrl)
      if (result) downloaded++
      else failed++
    }
  }

  return { downloaded, failed }
}

module.exports = {
  downloadArticleImage,
  downloadAllImages,
}
