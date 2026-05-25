const fs = require("fs")
const path = require("path")

let sharp
try {
  sharp = require("sharp")
} catch {
  sharp = null
  console.error("sharp not available — install it to generate images")
  process.exit(1)
}

const BASE_DIR = path.join(__dirname, "../public/images/categories")
const IMG_W = 800
const IMG_H = 533

const CATEGORIES = {
  pakistan: { label: "PAKISTAN", colors: ["#065f46", "#059669", "#10b981", "#047857", "#34d399"] },
  world: { label: "WORLD", colors: ["#1e3a5f", "#2563eb", "#3b82f6", "#1d4ed8", "#60a5fa"] },
  politics: { label: "POLITICS", colors: ["#7f1d1d", "#dc2626", "#ef4444", "#b91c1c", "#f87171"] },
  business: { label: "BUSINESS", colors: ["#78350f", "#d97706", "#f59e0b", "#b45309", "#fbbf24"] },
  technology: { label: "TECHNOLOGY", colors: ["#4c1d95", "#7c3aed", "#8b5cf6", "#6d28d9", "#a78bfa"] },
  sports: { label: "SPORTS", colors: ["#312e81", "#4f46e5", "#6366f1", "#4338ca", "#818cf8"] },
  entertainment: { label: "ENTERTAINMENT", colors: ["#701a75", "#c026d3", "#d946ef", "#a21caf", "#e879f9"] },
  science: { label: "SCIENCE", colors: ["#164e63", "#0891b2", "#06b6d4", "#0e7490", "#22d3ee"] },
  health: { label: "HEALTH", colors: ["#14532d", "#16a34a", "#22c55e", "#15803d", "#4ade80"] },
  opinion: { label: "OPINION", colors: ["#881337", "#e11d48", "#f43f5e", "#be123c", "#fb7185"] },
  breaking: { label: "BREAKING", colors: ["#450a0a", "#b91c1c", "#ef4444", "#991b1b", "#fca5a5"] },
}

function makeTemplate(name, svgFn) {
  return { name, svg: svgFn }
}

const TEMPLATES = [
  makeTemplate("top-banner", (c, accent, v) => `<svg xmlns="http://www.w3.org/2000/svg" width="${IMG_W}" height="${IMG_H}">
  <defs><linearGradient id="bg${v}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${c}22"/><stop offset="100%" stop-color="${c}44"/></linearGradient><pattern id="p${v}" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="12" cy="12" r="1.5" fill="${accent}" opacity="0.08"/></pattern></defs>
  <rect width="${IMG_W}" height="${IMG_H}" fill="url(#bg${v})"/><rect width="${IMG_W}" height="${IMG_H}" fill="url(#p${v})"/>
  <rect x="0" y="0" width="${IMG_W}" height="6" fill="${accent}" opacity="0.7"/>
  <circle cx="${70 + v * 30}" cy="${70 + v * 20}" r="${80 + v * 20}" fill="${accent}" opacity="0.04"/>
  <rect x="${v * 20}" y="${IMG_H - 100 + v * 10}" width="${IMG_W}" height="2" fill="${accent}" opacity="0.08"/>
  <text x="30" y="${IMG_H - 40}" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="${accent}" opacity="0.6" letter-spacing="3">NEWS</text>
</svg>`),
  makeTemplate("diagonal", (c, accent, v) => `<svg xmlns="http://www.w3.org/2000/svg" width="${IMG_W}" height="${IMG_H}">
  <defs><linearGradient id="bg${v}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${c}"/><stop offset="${50 + v * 10}%" stop-color="${c}dd"/><stop offset="100%" stop-color="${accent}33"/></linearGradient><pattern id="p${v}" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="${accent}" stroke-width="0.5" opacity="0.06"/></pattern></defs>
  <rect width="${IMG_W}" height="${IMG_H}" fill="url(#bg${v})"/><rect width="${IMG_W}" height="${IMG_H}" fill="url(#p${v})"/>
  <polygon points="${IMG_W},${v * 20} ${IMG_W},${IMG_H} ${IMG_W - v * 50},${IMG_H}" fill="${accent}" opacity="0.08"/>
  <polygon points="0,${IMG_H - v * 30} ${v * 60},${IMG_H} ${IMG_W},${IMG_H}" fill="${accent}" opacity="0.05"/>
  <circle cx="${IMG_W - 100}" cy="${100 + v * 50}" r="${60 + v * 15}" fill="${accent}" opacity="0.03"/>
</svg>`),
  makeTemplate("framed", (c, accent, v) => `<svg xmlns="http://www.w3.org/2000/svg" width="${IMG_W}" height="${IMG_H}">
  <defs><linearGradient id="bg${v}" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="${c}"/><stop offset="100%" stop-color="${accent}44"/></linearGradient><pattern id="p${v}" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse"><line x1="15" y1="0" x2="15" y2="30" stroke="${accent}" stroke-width="0.5" opacity="0.04"/><line x1="0" y1="15" x2="30" y2="15" stroke="${accent}" stroke-width="0.5" opacity="0.04"/></pattern></defs>
  <rect width="${IMG_W}" height="${IMG_H}" fill="url(#bg${v})"/><rect width="${IMG_W}" height="${IMG_H}" fill="url(#p${v})"/>
  <rect x="${10 + v}" y="${10 + v}" width="${IMG_W - 20 - v * 2}" height="${IMG_H - 20 - v * 2}" fill="none" stroke="${accent}" stroke-width="2" opacity="0.15" rx="2"/>
  <rect x="${20 + v}" y="${20 + v}" width="${IMG_W - 40 - v * 2}" height="${IMG_H - 40 - v * 2}" fill="none" stroke="${accent}" stroke-width="1" opacity="0.08" rx="1"/>
  <circle cx="${IMG_W / 2}" cy="${IMG_H / 2}" r="${50 + v * 10}" fill="${accent}" opacity="0.03"/>
</svg>`),
  makeTemplate("bottom-wave", (c, accent, v) => `<svg xmlns="http://www.w3.org/2000/svg" width="${IMG_W}" height="${IMG_H}">
  <defs><linearGradient id="bg${v}" x1="50%" y1="0%" x2="50%" y2="100%"><stop offset="0%" stop-color="${c}11"/><stop offset="100%" stop-color="${c}66"/></linearGradient><pattern id="p${v}" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="8" fill="none" stroke="${accent}" stroke-width="0.5" opacity="0.05"/></pattern></defs>
  <rect width="${IMG_W}" height="${IMG_H}" fill="url(#bg${v})"/><rect width="${IMG_W}" height="${IMG_H}" fill="url(#p${v})"/>
  <path d="M0 ${IMG_H - 40 + v * 5} Q${IMG_W * 0.25} ${IMG_H - 20 + v * 5} ${IMG_W * 0.5} ${IMG_H - 40 + v * 5} T${IMG_W} ${IMG_H - 30 + v * 5} L${IMG_W} ${IMG_H} L0 ${IMG_H} Z" fill="${accent}" opacity="0.06"/>
  <path d="M0 ${IMG_H - 20 + v * 3} Q${IMG_W * 0.3} ${IMG_H - 5 + v * 3} ${IMG_W * 0.6} ${IMG_H - 15 + v * 3} T${IMG_W} ${IMG_H - 10 + v * 3} L${IMG_W} ${IMG_H} L0 ${IMG_H} Z" fill="${accent}" opacity="0.04"/>
  <rect x="0" y="0" width="4" height="${IMG_H}" fill="${accent}" opacity="0.1"/>
  <circle cx="${IMG_W - 50 - v * 40}" cy="${80 + v * 30}" r="${40 + v * 10}" fill="${accent}" opacity="0.03"/>
</svg>`),
  makeTemplate("asymmetric", (c, accent, v) => `<svg xmlns="http://www.w3.org/2000/svg" width="${IMG_W}" height="${IMG_H}">
  <defs><radialGradient id="bg${v}" cx="${30 + v * 10}%" cy="${30 + v * 10}%" r="${70 + v * 5}%"><stop offset="0%" stop-color="${accent}33"/><stop offset="100%" stop-color="${c}"/></radialGradient><pattern id="p${v}" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="20" y2="20" stroke="${accent}" stroke-width="0.5" opacity="0.04"/></pattern></defs>
  <rect width="${IMG_W}" height="${IMG_H}" fill="url(#bg${v})"/><rect width="${IMG_W}" height="${IMG_H}" fill="url(#p${v})"/>
  <rect x="0" y="0" width="${80 + v * 20}" height="${IMG_H}" fill="${accent}" opacity="0.08"/>
  <rect x="${80 + v * 20}" y="0" width="3" height="${IMG_H}" fill="${accent}" opacity="0.15"/>
  <circle cx="${IMG_W - 60 - v * 30}" cy="${IMG_H / 2}" r="${90 + v * 20}" fill="${accent}" opacity="0.03"/>
  <circle cx="${40 + v * 15}" cy="${IMG_H / 2}" r="${20 + v * 5}" fill="${accent}" opacity="0.06"/>
</svg>`),
  makeTemplate("spotlight", (c, accent, v) => `<svg xmlns="http://www.w3.org/2000/svg" width="${IMG_W}" height="${IMG_H}">
  <defs><linearGradient id="bg${v}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${c}55"/><stop offset="100%" stop-color="${c}"/></linearGradient><radialGradient id="spot${v}" cx="${30 + v * 15}%" cy="${30 + v * 10}%" r="50%"><stop offset="0%" stop-color="${accent}22"/><stop offset="100%" stop-color="${accent}00"/></radialGradient></defs>
  <rect width="${IMG_W}" height="${IMG_H}" fill="url(#bg${v})"/>
  <rect width="${IMG_W}" height="${IMG_H}" fill="url(#spot${v})"/>
  <circle cx="${IMG_W * 0.8}" cy="${IMG_H * 0.2}" r="${100 + v * 20}" fill="${accent}" opacity="0.04"/>
  <circle cx="${IMG_W * 0.15}" cy="${IMG_H * 0.8}" r="${80 + v * 15}" fill="${accent}" opacity="0.03"/>
  <rect x="${IMG_W - 80 - v * 10}" y="${v * 30}" width="3" height="${IMG_H - v * 60}" fill="${accent}" opacity="0.12"/>
</svg>`),
  makeTemplate("horizon", (c, accent, v) => `<svg xmlns="http://www.w3.org/2000/svg" width="${IMG_W}" height="${IMG_H}">
  <defs><linearGradient id="bg${v}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${accent}11"/><stop offset="50%" stop-color="${c}88"/><stop offset="100%" stop-color="${c}"/></linearGradient></defs>
  <rect width="${IMG_W}" height="${IMG_H}" fill="url(#bg${v})"/>
  <line x1="0" y1="${IMG_H * 0.4 + v * 5}" x2="${IMG_W}" y2="${IMG_H * 0.4 + v * 5}" stroke="${accent}" stroke-width="1" opacity="0.15"/>
  <line x1="0" y1="${IMG_H * 0.6 + v * 3}" x2="${IMG_W}" y2="${IMG_H * 0.6 + v * 3}" stroke="${accent}" stroke-width="0.5" opacity="0.08"/>
  <rect x="${30 + v * 10}" y="${30 + v * 5}" width="${IMG_W - 60 - v * 20}" height="2" fill="${accent}" opacity="0.2"/>
  <circle cx="${IMG_W / 2}" cy="${IMG_H * 0.5}" r="${200 + v * 30}" fill="${accent}" opacity="0.02"/>
</svg>`),
  makeTemplate("pulse", (c, accent, v) => `<svg xmlns="http://www.w3.org/2000/svg" width="${IMG_W}" height="${IMG_H}">
  <defs><radialGradient id="bg${v}" cx="50%" cy="50%" r="70%"><stop offset="0%" stop-color="${accent}22"/><stop offset="100%" stop-color="${c}"/></radialGradient></defs>
  <rect width="${IMG_W}" height="${IMG_H}" fill="url(#bg${v})"/>
  <circle cx="${IMG_W / 2}" cy="${IMG_H / 2}" r="${v * 30 + 40}" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.06"/>
  <circle cx="${IMG_W / 2}" cy="${IMG_H / 2}" r="${v * 30 + 80}" fill="none" stroke="${accent}" stroke-width="1" opacity="0.04"/>
  <circle cx="${IMG_W / 2}" cy="${IMG_H / 2}" r="${v * 30 + 130}" fill="none" stroke="${accent}" stroke-width="0.5" opacity="0.03"/>
  <rect x="${v * 20}" y="0" width="3" height="${IMG_H}" fill="${accent}" opacity="0.08"/>
</svg>`),
  makeTemplate("stripe", (c, accent, v) => `<svg xmlns="http://www.w3.org/2000/svg" width="${IMG_W}" height="${IMG_H}">
  <defs><linearGradient id="bg${v}" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${c}"/><stop offset="100%" stop-color="${accent}33"/></linearGradient></defs>
  <rect width="${IMG_W}" height="${IMG_H}" fill="url(#bg${v})"/>
  <rect x="0" y="${v * 40}" width="${IMG_W}" height="${v * 10 + 20}" fill="${accent}" opacity="0.03"/>
  <rect x="0" y="${v * 40 + 100}" width="${IMG_W}" height="1" fill="${accent}" opacity="0.1"/>
  <rect x="${IMG_W - v * 30 - 20}" y="0" width="3" height="${IMG_H}" fill="${accent}" opacity="0.07"/>
  <circle cx="${v * 30 + 50}" cy="${IMG_H - 80}" r="${v * 5 + 25}" fill="${accent}" opacity="0.03"/>
</svg>`),
  makeTemplate("corner", (c, accent, v) => `<svg xmlns="http://www.w3.org/2000/svg" width="${IMG_W}" height="${IMG_H}">
  <defs><linearGradient id="bg${v}" x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stop-color="${c}44"/><stop offset="100%" stop-color="${c}"/></linearGradient></defs>
  <rect width="${IMG_W}" height="${IMG_H}" fill="url(#bg${v})"/>
  <rect x="0" y="0" width="${v * 20 + 60}" height="${v * 15 + 40}" fill="${accent}" opacity="0.06"/>
  <rect x="0" y="0" width="4" height="${v * 15 + 40}" fill="${accent}" opacity="0.15"/>
  <rect x="0" y="0" width="${v * 20 + 60}" height="4" fill="${accent}" opacity="0.15"/>
  <circle cx="${IMG_W - 50}" cy="${IMG_H - 50}" r="${v * 10 + 40}" fill="${accent}" opacity="0.03"/>
  <line x1="0" y1="${IMG_H - 30}" x2="${IMG_W}" y2="${IMG_H - 30}" stroke="${accent}" stroke-width="0.5" opacity="0.06"/>
</svg>`),
]

async function generatePool() {
  const totalCats = Object.keys(CATEGORIES).length
  const imagesPerCat = 50
  let totalGenerated = 0

  for (const [slug, config] of Object.entries(CATEGORIES)) {
    const catDir = path.join(BASE_DIR, slug)
    if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true })

    const existing = fs.readdirSync(catDir).filter((f) => f.endsWith(".jpg"))
    if (existing.length >= imagesPerCat) {
      console.log(`  ${slug}: ${existing.length} images (already complete)`)
      totalGenerated += existing.length
      continue
    }

    let idx = 0
    for (const template of TEMPLATES) {
      for (let vi = 0; vi < 5; vi++) {
        const accent = config.colors[vi % config.colors.length]
        const bgColor = config.colors[(vi + 2) % config.colors.length]
        const svgContent = template.svg(bgColor, accent, idx)
        const outPath = path.join(catDir, `${template.name}-${vi + 1}.jpg`)

        if (fs.existsSync(outPath)) {
          idx++
          continue
        }

        try {
          await sharp(Buffer.from(svgContent))
            .resize(IMG_W, IMG_H)
            .jpeg({ quality: 80, mozjpeg: true })
            .toFile(outPath)
          idx++
        } catch (err) {
          console.error(`  Error generating ${slug}/${template.name}-${vi + 1}: ${err.message}`)
        }
      }
    }

    const generated = fs.readdirSync(catDir).filter((f) => f.endsWith(".jpg")).length
    totalGenerated += generated
    console.log(`  ${slug}: ${generated} images`)
  }

  console.log(`\nTotal: ${totalGenerated} images across ${totalCats} categories`)
}

generatePool().catch(console.error)
