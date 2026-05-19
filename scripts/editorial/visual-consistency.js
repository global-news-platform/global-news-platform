const BRAND_IDENTITY = {
  name: "Global News Platform",
  style: "Premium international newsroom aesthetic",
  designPrinciples: [
    "Clean, uncluttered compositions",
    "Professional lighting with editorial purpose",
    "High contrast with controlled dynamic range",
    "Desaturated color palette with selective emphasis",
    "Strong geometric framing",
    "Human-centric when reporting on people",
    "Abstract when reporting on concepts",
    "Documentary style for events",
    "Never clichéd or stock-photo-like",
    "Always purposeful — every visual element serves the story",
  ],
  forbiddenElements: [
    "Text overlays or typography",
    "Logos or watermarks",
    "Cheap stock photography aesthetics",
    "Overprocessed HDR effects",
    "Excessive lens flares or filters",
    "Cartoon or illustration styles",
    "Amateur or tourist photography quality",
  ],
}

export function getVisualGuidelines(categorySlug) {
  const guidelines = {
    politics: {
      composition: "Symmetrical or rule-of-thirds. Government buildings, diplomatic settings. Formal portraits for officials.",
      colorGrade: "Desaturated with subtle split-toning. Cool shadows, neutral highlights.",
      lighting: "Rembrandt or dramatic side lighting. High contrast ratio.",
      depth: "Medium to deep depth of field. Environmental context important.",
    },
    world: {
      composition: "Wide establishing shots. Human scale in vast environments. Geographic markers.",
      colorGrade: "Warm tones. Natural color palette. Atmospheric perspective.",
      lighting: "Natural light emphasis. Golden hour preference. Soft diffusion.",
      depth: "Deep focus for landscapes. Selective focus for portraits.",
    },
    business: {
      composition: "Clean geometric lines. Architectural precision. Minimalist. Data visualization integration.",
      colorGrade: "Cool blues and charcoal. Silver and chrome accents. High clarity.",
      lighting: "Even, studio-quality lighting. Clean highlights. No harsh shadows.",
      depth: "Sharp throughout. Architectural precision. Tilt-shift style for buildings.",
    },
    technology: {
      composition: "Low angles for scale. Symmetrical tech environments. Macro circuitry details.",
      colorGrade: "Deep indigo with cyan accents. Neon highlights on dark backgrounds.",
      lighting: "Mixed ambient and neon. Volumetric light beams. High contrast.",
      depth: "Shallow depth for macro tech details. Deep for server farm environments.",
    },
    science: {
      composition: "Clean, organized. Laboratory symmetry. Macro perspectives. Abstract patterns.",
      colorGrade: "Cool whites and blues. Clinical cleanliness. High contrast for detail.",
      lighting: "Even, diffused. Clinical brightness. Softbox quality.",
      depth: "Deep macro for specimens. Clean and sharp throughout.",
    },
    health: {
      composition: "Clean medical environments. Human-centered framing. Soothing spatial balance.",
      colorGrade: "Warm neutrals. Healing greens. Calming blues. Soft palette.",
      lighting: "Soft, warm clinical lighting. Gentle shadows. Patient-centered.",
      depth: "Medium depth. Focus on human element.",
    },
    climate: {
      composition: "Epic landscapes. Before/after contrasts. Aerial perspectives. Human impact.",
      colorGrade: "Natural vibrancy. Rich greens and blues. Dramatic sky colors.",
      lighting: "Natural dramatic light. Golden hour. Storm light. Atmospheric.",
      depth: "Deep focus for landscapes. Selective for wildlife.",
    },
    culture: {
      composition: "Artful framing. Cultural symbolism. Rich detail. Environmental portraiture.",
      colorGrade: "Warm, rich colors. Artistic grading. Museum-quality reproduction.",
      lighting: "Mixed ambient and artistic. Gallery-quality. Warm atmospheric.",
      depth: "Medium to shallow. Artistic depth of field choices.",
    },
    sports: {
      composition: "Dynamic diagonals. Action freezing. Peak moment capture. Emotion focus.",
      colorGrade: "Saturated team colors. High contrast. Vibrant and punchy.",
      lighting: "Stadium/arena lighting. High-speed synchronization. Dramatic.",
      depth: "Shallow for subject isolation. Panning blur for motion.",
    },
    opinion: {
      composition: "Conceptual and symbolic. Metaphorical imagery. Minimalist editorial.",
      colorGrade: "Monochrome or desaturated with selective color. High contrast.",
      lighting: "Dramatic chiaroscuro. Mood-heavy. Symbolic shadow play.",
      depth: "Artistic choices. Shallow depth for symbolic focus.",
    },
  }

  return guidelines[categorySlug] || guidelines.world
}

export function getBrandIdentity() {
  return BRAND_IDENTITY
}

export function validatePromptAgainstBrand(prompt) {
  const issues = []
  const promptLower = prompt.toLowerCase()

  for (const forbidden of BRAND_IDENTITY.forbiddenElements) {
    if (promptLower.includes(forbidden.toLowerCase().slice(0, 10))) {
      issues.push(`Contains forbidden element: "${forbidden}"`)
    }
  }

  return {
    passed: issues.length === 0,
    issues,
  }
}

export function getCategoryColorPalette(categorySlug) {
  const palettes = {
    politics: { primary: "#1a1a2e", secondary: "#e94560", accent: "#16213e", text: "#ffffff" },
    world: { primary: "#2d4059", secondary: "#ea5455", accent: "#f07b3f", text: "#ffffff" },
    business: { primary: "#1b262c", secondary: "#3282b8", accent: "#bbe1fa", text: "#ffffff" },
    technology: { primary: "#0f0f1a", secondary: "#00d2ff", accent: "#7b2ff7", text: "#ffffff" },
    science: { primary: "#0a1929", secondary: "#66bb6a", accent: "#e3f2fd", text: "#ffffff" },
    health: { primary: "#1a3c34", secondary: "#4db6ac", accent: "#e8f5e9", text: "#ffffff" },
    climate: { primary: "#1a3c34", secondary: "#81c784", accent: "#a5d6a7", text: "#ffffff" },
    culture: { primary: "#2d1b3d", secondary: "#ce93d8", accent: "#f3e5f5", text: "#ffffff" },
    sports: { primary: "#1a1a2e", secondary: "#ff6b35", accent: "#f7c59f", text: "#ffffff" },
    opinion: { primary: "#1a1a2e", secondary: "#e0e0e0", accent: "#9e9e9e", text: "#ffffff" },
  }
  return palettes[categorySlug] || palettes.world
}
