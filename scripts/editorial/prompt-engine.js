import { generate } from "./ai.js"
import { analyzeArticle } from "./visual-understanding.js"

const CATEGORY_STYLES = {
  politics: {
    style: "Geopolitical editorial photography. Cinematic realism with dramatic lighting.",
    composition: "Strong geometric framing. Symmetrical government architecture. Portrait or medium shot for人物. Wide establishing shots for diplomatic scenes.",
    lighting: "High-contrast Rembrandt lighting. Deep shadows with sharp highlights. Moody atmosphere.",
    color: "Desaturated with selective saturation on key elements. Deep navy, crimson, and neutral grays.",
    reference: "Style reminiscent of Reuters White House photography and BBC Parliament coverage.",
    quality: "Premium DSLR, 85mm prime lens, f/1.8, shallow depth of field, professional color grading.",
  },
  world: {
    style: "International affairs photojournalism. Expansive cinematic coverage.",
    composition: "Wide angle establishing shots. Aerial perspectives. Human-scale journalism. Geographic context visible.",
    lighting: "Natural golden hour lighting. Soft atmospheric diffusion. Dramatic natural shadows.",
    color: "Rich earth tones with atmospheric perspective. Warm ambers and deep blues.",
    reference: "Visual style of Associated Press international coverage and BBC Global Affairs.",
    quality: "Professional photojournalism equipment. 24-70mm versatile zoom. Natural light mastery.",
  },
  business: {
    style: "Bloomberg-style financial editorial. Clean, premium corporate aesthetics.",
    composition: "Clean minimal compositions. Strong vertical lines in architecture. Abstract financial visuals. Data-driven imagery.",
    lighting: "Even, professional studio lighting. Clean highlights. Reflective surfaces with controlled specular.",
    color: "Cool blues, silver, deep charcoal. Accent colors for data visualization. Premium desaturated palette.",
    reference: "Bloomberg Markets magazine aesthetic. The Economist visual style. Financial Times photography.",
    quality: "Medium format digital. Architectural precision. Tilt-shift for straight lines. Ultra-sharp optics.",
  },
  technology: {
    style: "Futuristic technology editorial. Neon noir aesthetics. Innovation photography.",
    composition: "Low angle shots emphasizing scale. Symmetrical tech environments. Macro circuitry details. Human-technology interaction.",
    lighting: "Mixed ambient and neon lighting. Blue and cyan color casts. Volumetric light beams. High contrast.",
    color: "Deep indigo, cyan, electric blue. Warm amber accents. Dark backgrounds with glowing elements.",
    reference: "Wired magazine photography. Bloomberg Technology visual style. Netflix documentary tech aesthetics.",
    quality: "Cinematic grade. Anamorphic lens flares. Precision macro capability. HDR imaging.",
  },
  science: {
    style: "High-detail scientific editorial. Precision research photography.",
    composition: "Macro and micro perspectives. Laboratory symmetry. Abstract scientific patterns. Clean research environments.",
    lighting: "Clinical bright lighting. Softbox diffusion. Controlled reflections on scientific equipment.",
    color: "Cool whites and blues. Clean backgrounds. Selective color on specimens or data.",
    reference: "Nature journal photography. National Geographic science visuals. CERN visual communications.",
    quality: "Scientific-grade macro photography. Extreme detail resolution. Color-calibrated accuracy.",
  },
  health: {
    style: "Professional medical editorial. Clinical yet human-centered.",
    composition: "Clean medical environments. Human-centered healthcare. Precision medical equipment. Soothing spatial arrangements.",
    lighting: "Soft, even clinical lighting. Warm patient-centered scenes. Clean overhead illumination.",
    color: "Clean whites, healing greens, calming blues. Warm skin tones. Sterile but welcoming.",
    reference: "WHO visual communications. Mayo Clinic photography. Lancet journal aesthetics.",
    quality: "Clinical photography standards. Detail-rich macro for medical precision. Warm portraiture capability.",
  },
  climate: {
    style: "Environmental documentary. National Geographic-grade nature cinematography.",
    composition: "Epic landscape perspectives. Before-after comparisons. Human impact on environments. Aerial climate documentation.",
    lighting: "Natural dramatic lighting. Golden hour intensity. Storm light. Atmospheric weather phenomena.",
    color: "Vibrant natural greens and blues. Dramatic storm grays. Warm sunset ambers. Ice blues.",
    reference: "National Geographic climate coverage. BBC Planet Earth cinematography. Reuters environmental photography.",
    quality: "IMAX-grade landscape cinematography. Aerial drone capability. Extreme dynamic range. Weather-sealed equipment.",
  },
  culture: {
    style: "Artistic editorial. Museum-quality cultural documentation.",
    composition: "Artful framing. Cultural symbolism. Performance photography. Architectural detail. Rich contextual environments.",
    lighting: "Mixed ambient and artistic lighting. Gallery-quality illumination. Warm atmospheric light.",
    color: "Rich warm golds, deep purples, vibrant cultural colors. Artistic color grading.",
    reference: "Apple News editorial photography. British Journal of Photography. Museum exhibition catalogs.",
    quality: "Medium format art photography. Gallery-grade color reproduction. Artistic lens choices.",
  },
  sports: {
    style: "Dynamic sports editorial. Peak-action photography with cinematic intensity.",
    composition: "Freeze-frame action. Dynamic diagonal compositions. Athlete close-ups with emotion. Wide stadium atmospherics.",
    lighting: "Stadium floodlighting. High-speed flash sync. Dramatic arena lighting. Golden hour outdoor sports.",
    color: "High saturation on team colors. High contrast. Vibrant stadium visuals. Dynamic color grading.",
    reference: "Sports Illustrated photography. Getty Images sports coverage. ESPN cinematic features.",
    quality: "High-speed professional DSLR. 400mm+ telephoto. 1/8000s shutter capability. Burst mode mastery.",
  },
  opinion: {
    style: "Conceptual editorial illustration. Thought-provoking visual commentary.",
    composition: "Symbolic compositions. Metaphorical imagery. Abstract concepts. Minimalist editorial design.",
    lighting: "Dramatic chiaroscuro. Mood-heavy lighting. Conceptual shadows. Selective illumination.",
    color: "Monochrome with selective color accents. High contrast black and white. Muted sophisticated palettes.",
    reference: "New York Times opinion visuals. The New Yorker illustrated journalism. Pulitzer-winning editorial design.",
    quality: "Fine art editorial quality. Conceptual precision. Symbolic clarity. Gallery-standard output.",
  },
}

const DEFAULT_STYLE = {
  style: "Premium editorial photography. Professional newsroom aesthetic.",
  composition: "Clean, balanced composition. Clear focal point. Professional framing.",
  lighting: "Professional three-point lighting. Clean, even illumination with natural feel.",
  color: "Professional balanced color. Neutral tones with subtle warmth.",
  reference: "Associated Press news photography standards.",
  quality: "Professional DSLR quality. Sharp focus. Clean color grading.",
}

export async function generateVisualPrompt(article, { provider = "auto" } = {}) {
  const analysis = await analyzeArticle(article)
  const categorySlug = (article.categorySlug || "").toLowerCase()
  const style = CATEGORY_STYLES[categorySlug] || DEFAULT_STYLE

  const title = article.title || ""
  const excerpt = (article.excerpt || "").slice(0, 300)

  const prompt = await buildPremiumPrompt(title, excerpt, analysis, style)
  const negativePrompt = buildNegativePrompt(categorySlug)
  const metadata = {
    category: categorySlug,
    mood: analysis.categoryMood,
    subjects: analysis.subjects,
    analysis,
  }

  return { prompt, negativePrompt, metadata }
}

async function buildPremiumPrompt(title, excerpt, analysis, style) {
  const parts = [
    `Editorial photograph: ${title}`,
    `---`,
    `Subject: ${analysis.subjects.slice(0, 4).join(", ")}${analysis.locations.length ? ` in ${analysis.locations.slice(0, 2).join(", ")}` : ""}`,
    `---`,
    `Visual approach: ${style.style}`,
    `---`,
    `Composition: ${style.composition}`,
    `---`,
    `Lighting: ${analysis.lighting}. ${style.lighting}`,
    `---`,
    `Atmosphere: ${analysis.atmosphere}. ${analysis.conflicts.length ? `Tension elements: ${analysis.conflicts.slice(0, 3).join(", ")}` : ""}`,
    `---`,
    `Color palette: ${style.color}`,
    `---`,
    `Quality: ${style.quality}`,
    `---`,
    `Style reference: ${style.reference}`,
    `---`,
    `Additional context: ${excerpt.slice(0, 200)}`,
    `---`,
    `NO text, NO typography, NO watermark, NO logos, NO people unless essential to the story. Pure photographic composition. 16:9 aspect ratio. Ultra-realistic, professional newsroom quality.`,
  ]

  const prompt = parts.join("\n")

  if (process.env.EDITORIAL_DISABLED !== "true") {
    return enhanceWithAI(prompt, title, excerpt, style)
  }

  return prompt
}

async function enhanceWithAI(basePrompt, title, excerpt, style) {
  const system = `You are a premium editorial image prompt engineer for Reuters, Bloomberg, and BBC Visual Journalism.

Enhance the following image prompt to produce an award-winning editorial photograph.

Rules:
- Add cinematic specificity (lens, focal length, aperture, camera angle)
- Add emotional tone and narrative context
- Ensure photorealistic, not illustration style
- Keep under 400 words
- Remove any instruction that would produce text or typography
- Return ONLY the enhanced prompt, no labels or explanations`

  const prompt = `Enhance this editorial image prompt for a news article titled "${title}".

Base prompt:
${basePrompt}

Category style: ${style.style}

Produce an enhanced, production-ready prompt for AI image generation.`

  try {
    return await generate(prompt, { system, temperature: 0.7, maxTokens: 800 })
  } catch {
    return basePrompt
  }
}

function buildNegativePrompt(categorySlug) {
  const base = [
    "text", "typography", "watermark", "logo", "signature",
    "blurry", "pixelated", "low quality", "amateur",
    "cartoon", "anime", "3d render", "digital art",
    "overexposed", "underexposed", "soft focus",
    "distorted", "fisheye", "extreme wide angle",
    "oversaturated", "vignette",
  ]

  const categoryNegatives = {
    politics: ["cartoon flags", "partisan imagery", "propaganda style"],
    technology: ["retro", "vintage", "steampunk", "low tech"],
    business: ["casual", "messy", "disorganized", "pop art"],
    science: ["fantasy", "pseudoscience", "unrealistic", "pixel art"],
    health: ["gore", "graphic medical", "horror", "cartoon anatomy"],
    climate: ["pollution glamorization", "unrealistic nature"],
    sports: ["static", "lifeless", "posed", "studio backdrop"],
  }

  const negatives = [...base, ...(categoryNegatives[categorySlug] || [])]
  return negatives.join(", ")
}

export function getCategoryStyle(categorySlug) {
  return CATEGORY_STYLES[categorySlug] || DEFAULT_STYLE
}

export const CATEGORY_VISUAL_STYLES = Object.keys(CATEGORY_STYLES)
