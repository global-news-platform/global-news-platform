const fs = require("fs")
const path = require("path")
const sharp = require("sharp")

const LOGO_PATH = path.join(__dirname, "../../public/images/logo-sm.png")
const TEXT = "The Global Lens 365"
const OPACITY = 0.75
const PADDING_RATIO = 0.025
const FONT_SIZE_RATIO = 0.045

function createWatermarkSvg(width, height) {
  const fontSize = Math.max(14, Math.round(Math.min(width, height) * FONT_SIZE_RATIO))
  const padding = Math.round(Math.min(width, height) * PADDING_RATIO)
  const textX = width - padding
  const textY = height - padding - fontSize * 0.3

  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wmGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="rgba(255,255,255,${OPACITY})"/>
          <stop offset="100%" stop-color="rgba(200,220,255,${OPACITY})"/>
        </linearGradient>
        <filter id="wmShadow">
          <feDropShadow dx="1" dy="1" stdDeviation="1.5" flood-color="rgba(0,0,0,0.5)"/>
        </filter>
      </defs>
      <text x="${textX}" y="${textY}"
            text-anchor="end"
            font-family="system-ui, -apple-system, sans-serif"
            font-weight="700"
            font-size="${fontSize}px"
            fill="url(#wmGrad)"
            filter="url(#wmShadow)">
        ${TEXT}
      </text>
    </svg>
  `)
}

async function addTextWatermark(buffer) {
  const meta = await sharp(buffer).metadata()
  const w = meta.width || 1200
  const h = meta.height || 630

  const svgOverlay = createWatermarkSvg(w, h)

  return await sharp(buffer)
    .composite([{
      input: svgOverlay,
      top: 0,
      left: 0,
      blend: "over",
    }])
    .toBuffer()
}

async function addLogoOverlay(buffer) {
  if (!fs.existsSync(LOGO_PATH)) return buffer

  const logoBuffer = await sharp(LOGO_PATH).toBuffer()
  const meta = await sharp(buffer).metadata()
  const w = meta.width || 1200
  const h = meta.height || 630

  const logoSize = Math.round(Math.min(w, h) * 0.055)
  const resizedLogo = await sharp(logoBuffer)
    .resize(logoSize, logoSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  const padding = 12
  const left = w - logoSize - padding
  const top = h - logoSize - padding

  return await sharp(buffer)
    .composite([{
      input: resizedLogo,
      top: Math.round(top),
      left: Math.round(left),
      blend: "over",
      opacity: 0.8,
    }])
    .toBuffer()
}

async function applyWatermarks(buffer) {
  let result = buffer
  result = await addTextWatermark(result)
  result = await addLogoOverlay(result)
  return result
}

module.exports = { addTextWatermark, addLogoOverlay, applyWatermarks }
