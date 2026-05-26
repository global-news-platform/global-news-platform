const fs = require("fs")
const path = require("path")

let sharp
try {
  sharp = require("sharp")
} catch {
  sharp = null
}

const FALLBACKS_DIR = path.join(__dirname, "../public/images/fallbacks")
const FALLBACK_DIR2 = path.join(__dirname, "../public/fallback")
const CATEGORIES_DIR = path.join(__dirname, "../public/images/categories")

const FALLBACKS = {
  politics: { bg: { r: 30, g: 20, b: 40 }, accent: { r: 239, g: 68, b: 68 }, label: "POLITICS", accent2: { r: 180, g: 40, b: 40 } },
  business: { bg: { r: 20, g: 35, b: 25 }, accent: { r: 245, g: 158, b: 11 }, label: "BUSINESS", accent2: { r: 180, g: 120, b: 10 } },
  world: { bg: { r: 15, g: 29, b: 53 }, accent: { r: 59, g: 130, b: 246 }, label: "WORLD", accent2: { r: 30, g: 80, b: 180 } },
  pakistan: { bg: { r: 6, g: 78, b: 59 }, accent: { r: 16, g: 185, b: 129 }, label: "PAKISTAN", accent2: { r: 10, g: 130, b: 90 } },
  sports: { bg: { r: 15, g: 19, b: 46 }, accent: { r: 99, g: 102, b: 241 }, label: "SPORTS", accent2: { r: 60, g: 65, b: 180 } },
  technology: { bg: { r: 26, g: 10, b: 46 }, accent: { r: 139, g: 92, b: 246 }, label: "TECHNOLOGY", accent2: { r: 100, g: 50, b: 180 } },
  science: { bg: { r: 13, g: 33, b: 55 }, accent: { r: 6, g: 182, b: 212 }, label: "SCIENCE", accent2: { r: 5, g: 120, b: 150 } },
  health: { bg: { r: 10, g: 46, b: 26 }, accent: { r: 34, g: 197, b: 94 }, label: "HEALTH", accent2: { r: 20, g: 130, b: 60 } },
  entertainment: { bg: { r: 45, g: 10, b: 46 }, accent: { r: 217, g: 70, b: 239 }, label: "ENTERTAINMENT", accent2: { r: 150, g: 30, b: 160 } },
  default: { bg: { r: 30, g: 30, b: 40 }, accent: { r: 100, g: 100, b: 120 }, label: "GLOBAL NEWS", accent2: { r: 60, g: 60, b: 80 } },
}

function generateSVG(slug, config) {
  const { bg, accent, label, accent2 } = config
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgb(${bg.r},${bg.g},${bg.b})"/>
      <stop offset="50%" stop-color="rgb(${Math.min(255,bg.r+15)},${Math.min(255,bg.g+10)},${Math.min(255,bg.b+20)})"/>
      <stop offset="100%" stop-color="rgb(${bg.r},${bg.g},${bg.b})"/>
    </linearGradient>
    <radialGradient id="spot1" cx="20%" cy="30%" r="60%">
      <stop offset="0%" stop-color="rgb(${accent.r},${accent.g},${accent.b})" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="rgb(${accent.r},${accent.g},${accent.b})" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="spot2" cx="80%" cy="70%" r="50%">
      <stop offset="0%" stop-color="rgb(${accent2.r},${accent2.g},${accent2.b})" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="rgb(${accent2.r},${accent2.g},${accent2.b})" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="vignette" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgb(0,0,0)" stop-opacity="0"/>
      <stop offset="60%" stop-color="rgb(0,0,0)" stop-opacity="0"/>
      <stop offset="100%" stop-color="rgb(0,0,0)" stop-opacity="0.35"/>
    </linearGradient>
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <rect width="60" height="60" fill="none" stroke="rgb(255,255,255)" stroke-opacity="0.02"/>
    </pattern>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)"/>
  <rect width="1200" height="800" fill="url(#grid)"/>
  <rect width="1200" height="800" fill="url(#spot1)"/>
  <rect width="1200" height="800" fill="url(#spot2)"/>
  <rect x="0" y="0" width="1200" height="4" fill="rgb(${accent.r},${accent.g},${accent.b})" opacity="0.5"/>
  <rect x="0" y="0" width="1200" height="800" fill="url(#vignette)"/>
  <line x1="0" y1="540" x2="1200" y2="540" stroke="rgb(255,255,255)" stroke-opacity="0.04" stroke-width="1"/>
  <rect x="60" y="590" width="40" height="4" fill="rgb(${accent.r},${accent.g},${accent.b})" opacity="0.6"/>
  <text x="60" y="660" font-family="Arial, sans-serif" font-size="44" font-weight="bold" fill="white" opacity="0.9">${label}</text>
  <text x="60" y="700" font-family="Arial, sans-serif" font-size="14" fill="white" opacity="0.25">Global News Pakistan</text>
  <rect x="60" y="740" width="1080" height="1" fill="rgb(${accent.r},${accent.g},${accent.b})" opacity="0.15"/>
</svg>`
}

async function main() {
  if (!fs.existsSync(FALLBACKS_DIR)) {
    fs.mkdirSync(FALLBACKS_DIR, { recursive: true })
  }
  if (!fs.existsSync(FALLBACK_DIR2)) {
    fs.mkdirSync(FALLBACK_DIR2, { recursive: true })
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
        const jpgPath2 = path.join(FALLBACK_DIR2, `${slug}.jpg`)
        await sharp(Buffer.from(svg))
          .resize(1200, 800)
          .jpeg({ quality: 85 })
          .toFile(jpgPath2)
        console.log(`  \u2713 ${slug}.jpg (fallback dirs)`)
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
