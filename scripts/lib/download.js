const fs = require("fs")
const path = require("path")

const DIR = path.join(__dirname, "..", "..", "public", "images", "articles")

async function download(url, filename) {
  if (!url) return null
  try {
    if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true })

    const ext = (url.match(/\.(jpe?g|png|gif|webp|avif)(\?|$)/i) || [])[1]?.toLowerCase().replace("jpeg","jpg") || "jpg"
    const name = `${filename}.${ext}`
    const filePath = path.join(DIR, name)

    if (fs.existsSync(filePath)) return `/images/articles/${name}`

    const res = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: { "User-Agent": "GlobalNewsBot/1.0" },
    })
    if (!res.ok) return null

    const buf = Buffer.from(await res.arrayBuffer())
    fs.writeFileSync(filePath, buf)
    return `/images/articles/${name}`
  } catch {
    return null
  }
}

module.exports = { download }
