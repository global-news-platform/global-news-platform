const fs = require("fs")
const path = require("path")

const FALLBACK_DIR = path.join(__dirname, "..", "public", "fallback")

const CATEGORIES = [
  "sports",
  "politics",
  "business",
  "technology",
  "climate",
  "science",
  "world",
]

const CATEGORY_STYLES = {
  sports: {
    accent: "#ef4444",
    bg1: "#1a1a2e",
    bg2: "#3d0e1e",
    label: "SPORTS",
    icon: "⚽",
  },
  politics: {
    accent: "#e74c3c",
    bg1: "#2d1b1b",
    bg2: "#5a1a1a",
    label: "POLITICS",
    icon: "🏛",
  },
  business: {
    accent: "#f0b429",
    bg1: "#1a2a1a",
    bg2: "#2d5a2d",
    label: "BUSINESS",
    icon: "📈",
  },
  technology: {
    accent: "#8b5cf6",
    bg1: "#1a1a2e",
    bg2: "#2d1b4e",
    label: "TECHNOLOGY",
    icon: "💻",
  },
  climate: {
    accent: "#22c55e",
    bg1: "#0a3c2e",
    bg2: "#166534",
    label: "CLIMATE",
    icon: "🌍",
  },
  science: {
    accent: "#06b6d4",
    bg1: "#0d2137",
    bg2: "#1a3a5c",
    label: "SCIENCE",
    icon: "🔬",
  },
  world: {
    accent: "#4a90d9",
    bg1: "#1e3a5f",
    bg2: "#2d5a8e",
    label: "WORLD",
    icon: "🌐",
  },
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "100, 100, 100"
}

function generateFallbackSVG(category) {
  const style = CATEGORY_STYLES[category]
  if (!style) return null

  const accentRGB = hexToRgb(style.accent)
  const lines = []
  for (let i = 0; i < 12; i++) {
    const x1 = Math.random() * 1920
    const y1 = Math.random() * 1080
    const x2 = Math.random() * 1920
    const y2 = Math.random() * 1080
    lines.push(
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${style.accent}" stroke-opacity="${(Math.random() * 0.08 + 0.02).toFixed(2)}" stroke-width="${Math.random() * 2 + 0.5}"/>`,
    )
  }

  const circles = []
  for (let i = 0; i < 6; i++) {
    const cx = Math.random() * 1920
    const cy = Math.random() * 1080
    const r = Math.random() * 200 + 50
    circles.push(
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${style.accent}" fill-opacity="${(Math.random() * 0.03 + 0.01).toFixed(2)}"/>`,
    )
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${style.bg1}"/>
      <stop offset="50%" stop-color="${style.bg2}"/>
      <stop offset="100%" stop-color="${style.bg1}"/>
    </linearGradient>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${style.accent}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${style.accent}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="bar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${style.accent}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${style.accent}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${style.accent}" stop-opacity="0"/>
    </linearGradient>
    <filter id="titleShadow">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>
  <rect width="1920" height="1080" fill="url(#bg)"/>
  <rect width="1920" height="1080" fill="url(#glow)"/>
  ${circles.join("\n  ")}
  ${lines.join("\n  ")}

  <!-- Top decorative bar -->
  <rect x="0" y="0" width="1920" height="3" fill="${style.accent}" opacity="0.4"/>
  <rect x="0" y="1077" width="1920" height="3" fill="${style.accent}" opacity="0.4"/>

  <!-- Side accent bar -->
  <rect x="80" y="200" width="4" height="680" fill="url(#bar)"/>

  <!-- Category icon -->
  <text x="960" y="420" font-family="Arial, sans-serif" font-size="64" fill="rgba(${accentRGB}, 0.15)" text-anchor="middle">${style.label}</text>

  <!-- Category title -->
  <text x="140" y="500" font-family="Georgia, 'Times New Roman', serif" font-size="72" font-weight="bold" fill="#ffffff" filter="url(#titleShadow)">${style.label}</text>

  <!-- Decorative line under title -->
  <rect x="140" y="530" width="120" height="4" fill="${style.accent}" opacity="0.6"/>
  <rect x="270" y="530" width="60" height="4" fill="${style.accent}" opacity="0.3"/>

  <!-- Subtitle -->
  <text x="140" y="580" font-family="Georgia, serif" font-size="22" fill="rgba(255, 255, 255, 0.5)" letter-spacing="3">GLOBAL NEWS</text>

  <!-- Bottom branding -->
  <text x="960" y="980" font-family="Arial, sans-serif" font-size="10" fill="rgba(255, 255, 255, 0.15)" text-anchor="middle" letter-spacing="6">GLOBAL NEWS PLATFORM</text>
</svg>`
}

async function generateFallbacks() {
  if (!fs.existsSync(FALLBACK_DIR)) {
    fs.mkdirSync(FALLBACK_DIR, { recursive: true })
    console.log(`Created directory: ${FALLBACK_DIR}`)
  }

  let sharp = null
  try {
    sharp = require("sharp")
  } catch {
    console.log("Sharp not available, saving SVGs only")
  }

  for (const category of CATEGORIES) {
    const svgContent = generateFallbackSVG(category)
    const svgPath = path.join(FALLBACK_DIR, `${category}.svg`)
    fs.writeFileSync(svgPath, svgContent, "utf-8")
    console.log(`Generated SVG: ${category}.svg`)

    if (sharp) {
      try {
        const webpPath = path.join(FALLBACK_DIR, `${category}.webp`)
        await sharp(Buffer.from(svgContent))
          .resize(1920, 1080, { fit: "cover", position: "center" })
          .webp({ quality: 85, effort: 6 })
          .toFile(webpPath)

        const jpgPath = path.join(FALLBACK_DIR, `${category}.jpg`)
        await sharp(Buffer.from(svgContent))
          .resize(1920, 1080, { fit: "cover", position: "center" })
          .jpeg({ quality: 85, mozjpeg: true })
          .toFile(jpgPath)

        const stats = fs.statSync(webpPath)
        console.log(`Generated WebP: ${category}.webp (${(stats.size / 1024).toFixed(1)} KB)`)
      } catch (err) {
        console.error(`Sharp conversion failed for ${category}: ${err.message}`)
      }
    }
  }

  console.log("\nAll fallback images generated successfully!")
}

generateFallbacks().catch(console.error)
