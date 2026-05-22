const fs = require("fs")
const path = require("path")

let sharp
try {
  sharp = require("sharp")
} catch {
  sharp = null
}

const FALLBACKS_DIR = path.join(__dirname, "../public/images/fallbacks")
const CATEGORIES_DIR = path.join(__dirname, "../public/images/categories")

const FALLBACKS = {
  politics: { bg: { r: 30, g: 20, b: 40 }, accent: { r: 239, g: 68, b: 68 }, label: "POLITICS" },
  business: { bg: { r: 20, g: 35, b: 25 }, accent: { r: 245, g: 158, b: 11 }, label: "BUSINESS" },
  world: { bg: { r: 15, g: 29, b: 53 }, accent: { r: 59, g: 130, b: 246 }, label: "WORLD" },
  pakistan: { bg: { r: 6, g: 78, b: 59 }, accent: { r: 16, g: 185, b: 129 }, label: "PAKISTAN" },
  sports: { bg: { r: 15, g: 19, b: 46 }, accent: { r: 99, g: 102, b: 241 }, label: "SPORTS" },
  technology: { bg: { r: 26, g: 10, b: 46 }, accent: { r: 139, g: 92, b: 246 }, label: "TECHNOLOGY" },
  science: { bg: { r: 13, g: 33, b: 55 }, accent: { r: 6, g: 182, b: 212 }, label: "SCIENCE" },
  health: { bg: { r: 10, g: 46, b: 26 }, accent: { r: 34, g: 197, b: 94 }, label: "HEALTH" },
  entertainment: { bg: { r: 45, g: 10, b: 46 }, accent: { r: 217, g: 70, b: 239 }, label: "ENTERTAINMENT" },
}

function generateSVG(slug, config) {
  const { bg, accent, label } = config
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgb(${bg.r},${bg.g},${bg.b})"/>
      <stop offset="50%" stop-color="rgb(${bg.r-10},${bg.g-5},${bg.b+10})"/>
      <stop offset="100%" stop-color="rgb(${bg.r},${bg.g},${bg.b})"/>
    </linearGradient>
    <linearGradient id="glow" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgb(${accent.r},${accent.g},${accent.b})" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="rgb(${accent.r},${accent.g},${accent.b})" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)"/>
  <rect width="1200" height="800" fill="url(#glow)"/>
  <rect x="0" y="0" width="1200" height="3" fill="rgb(${accent.r},${accent.g},${accent.b})" opacity="0.4"/>
  <circle cx="200" cy="150" r="250" fill="rgb(${accent.r},${accent.g},${accent.b})" opacity="0.03"/>
  <circle cx="1000" cy="600" r="300" fill="rgb(${accent.r},${accent.g},${accent.b})" opacity="0.04"/>
  <circle cx="600" cy="400" r="400" fill="rgb(${accent.r},${accent.g},${accent.b})" opacity="0.02"/>
  <g transform="translate(60, 370)">
    <rect x="0" y="-4" width="60" height="4" fill="rgb(${accent.r},${accent.g},${accent.b})" opacity="0.5"/>
    <text x="0" y="60" font-family="Arial, sans-serif" font-size="52" font-weight="bold" fill="white">
      ${label}
    </text>
    <text x="0" y="100" font-family="Arial, sans-serif" font-size="14" fill="white" opacity="0.3">
      Global News Pakistan
    </text>
  </g>
  <rect x="60" y="720" width="1080" height="1" fill="rgb(${accent.r},${accent.g},${accent.b})" opacity="0.1"/>
</svg>`
}

async function main() {
  if (!fs.existsSync(FALLBACKS_DIR)) {
    fs.mkdirSync(FALLBACKS_DIR, { recursive: true })
  }

  for (const [slug, config] of Object.entries(FALLBACKS)) {
    const svg = generateSVG(slug, config)
    const svgPath = path.join(FALLBACKS_DIR, `${slug}.svg`)
    fs.writeFileSync(svgPath, svg, "utf-8")

    if (sharp) {
      try {
        const jpgPath = path.join(FALLBACKS_DIR, `${slug}.jpg`)
        await sharp(Buffer.from(svg))
          .resize(1200, 800)
          .jpeg({ quality: 85 })
          .toFile(jpgPath)
        console.log(`  \u2713 ${slug}.jpg (${slug}.svg)`)
      } catch (err) {
        console.log(`  \u2713 ${slug}.svg (sharp failed: ${err.message})`)
      }
    } else {
      console.log(`  \u2713 ${slug}.svg (no sharp)`)
    }
  }

  console.log(`\nGenerated ${Object.keys(FALLBACKS).length} fallback images`)
}

main()
