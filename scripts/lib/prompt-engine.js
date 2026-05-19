/**
 * Editorial Prompt Engine
 * ========================
 * Category-aware cinematic prompt templates for premium AI news imagery.
 *
 * Each category has:
 *   - scene_types:  URL-encode safe list of scene descriptions
 *   - lighting:     Lighting setup
 *   - mood:         Emotional tone
 *   - composition:  Framing rules
 *   - style:        Editorial style directives
 *   - color_palette: Colour scheme guidance
 *   - negative:     Category-specific negative prompts
 */

const NEGATIVE_PROMPTS = [
  "blurry",
  "distorted",
  "low quality",
  "pixelated",
  "watermark",
  "text overlay",
  "logo",
  "brand name",
  "cartoon",
  "illustration",
  "painting",
  "anime",
  "deformed faces",
  "duplicate people",
  "extra limbs",
  "mutated hands",
  "bad anatomy",
  "poorly drawn face",
  "amateur photography",
  "instagram filter",
  "oversaturated",
  "noise",
  "grainy",
  "out of focus",
  "fisheye lens",
  "unnatural colors",
  "cheap stock photo",
  "generic stock image",
  "placeholder",
  "comic style",
  "3d render",
  "CGI looking",
  "artificial",
  "fake looking",
].join(", ")

const STYLE_DIRECTIVES = [
  "Editorial news photography",
  "Reuters/AP documentary photojournalism style",
  "Cinematic realism",
  "Sharp focus on main subject",
  "Natural skin tones",
  "Accurate color reproduction",
  "Professional color grading",
  "8K ultra high definition detail",
  "Authentic journalistic composition",
  "Ethical documentary photography",
  "No text overlay, no watermark, no logo, no brand names",
  "No digital manipulation, realistic proportions",
  "Clean background, professional framing",
  "Single main subject, clear focal point",
].join(". ")

const COMPOSITION_RULES = [
  "Centered subject with strong focal point",
  "Rule of thirds composition",
  "Clean framing with negative space",
  "Professional photojournalistic cropping",
  "16:9 cinematic aspect ratio",
  "Balanced foreground and background",
  "Clear subject separation",
  "Leading lines to draw eye to main subject",
].join(". ")

const CATEGORY_TEMPLATES = {
  sports: {
    scene_types: [
      "live action sports photography",
      "professional athlete in competition",
      "peak action moment in sports",
      "sports arena packed with spectators",
      "stadium under dramatic lighting",
    ],
    lighting: "Stadium floodlighting, dynamic sports lighting, dramatic sideline beams, high-speed action freeze frame, bright golden hour glow on field, broadcast-quality arena illumination",
    mood: "Exhilarating, intense, triumphant, high-energy, dramatic tension, competitive spirit",
    composition: "Dynamic action framing, fast motion capture, athlete-centered composition, wide-angle stadium context, tight focus on decisive moment, rule of thirds with motion lines",
    style: "ESPN/NBC broadcast sports photography, Sports Illustrated cover aesthetic, athletic portraiture with peak action, professional sports cinematography",
    color_palette: "Stadium colors, team jersey vibrancy, green field tones, dramatic shadows, golden hour warmth, cool arena blues",
    negative: "blurry motion, frozen motion artifacts, unnatural poses, distorted anatomy, cartoon athletic poses",
  },

  politics: {
    scene_types: [
      "world leader at press conference",
      "diplomatic meeting between heads of state",
      "government building exterior establishing shot",
      "political rally with flags and crowd",
      "parliament chamber debate scene",
      "summit conference room with world leaders",
      "geopolitical atmosphere establishing shot",
    ],
    lighting: "Press conference ambient lighting, natural window light in government buildings, moody capitol lighting, soft key light on speaker, dramatic political rally backlighting",
    mood: "Authoritative, serious, diplomatic tension, historical weight, formal gravitas, statesmanlike dignity",
    composition: "Centered subject at podium, symmetrical government architecture framing, leader portrait with flag backdrop, wide establishing shots of diplomatic venues, clean professional headroom",
    style: "Reuters/AP White House photography, Washington Post political coverage, BBC Parliament cinematography, statesman portraiture, editorial political documentary",
    color_palette: "Navy suits, American flag red/white/blue, marble and wood tones, government building greys, diplomatic neutral tones, warm portrait lighting",
    negative: "casual attire, informal settings, comic poses, unprofessional lighting, blurred flags, distracting backgrounds",
  },

  technology: {
    scene_types: [
      "futuristic AI research laboratory",
      "robotics engineering workspace",
      "data center with server racks and blue lights",
      "startup office with modern design",
      "cyberpunk cityscape with neon lighting",
      "technology innovation expo",
      "scientist working with holographic displays",
      "quantum computer lab",
    ],
    lighting: "Cool blue ambient lighting, neon accent illumination, holographic glow effects, monitor backlighting, clean white lab lighting, cyberpunk neon atmosphere, dark with bright tech accents",
    mood: "Innovative, futuristic, cutting-edge, sophisticated, sleek, visionary, professional-tech atmosphere",
    composition: "Symmetric tech architecture, leading lines along server rows, subject with holographic interface, clean geometric framing, wide angle lab establishing shots, tight focus on technology details",
    style: "WIRED magazine photography, Bloomberg Technology visuals, MIT Technology Review editorial, Silicon Valley documentary aesthetic, National Geographic Future series",
    color_palette: "Deep blues, neon purples, cyberpunk pinks, clean whites, cool greys, holographic cyan, LED accent colors, dark backgrounds with bright tech elements",
    negative: "dated technology, messy cables, cluttered desks, unrealistic sci-fi, cartoon tech, blurry screens, reflective glare on monitors",
  },

  business: {
    scene_types: [
      "financial district skyscrapers at golden hour",
      "stock exchange trading floor bustle",
      "corporate boardroom meeting",
      "Wall Street bull market scene",
      "modern corporate headquarters architecture",
      "economy-focused cityscape photography",
      "banking hall with classical architecture",
    ],
    lighting: "Golden hour city lighting, corporate office ambient light, trading floor fluorescent glow, dramatic skyscraper shadows, polished marble reflections, warm boardroom lighting",
    mood: "Professional, powerful, sophisticated, economic gravitas, corporate authority, market energy, calculated calm",
    composition: "Symmetrical architecture framing, rule of thirds cityscape, subject in professional setting, leading lines along trading floor, clean corporate portraiture, establishing shots of business districts",
    style: "Financial Times editorial photography, Bloomberg Markets visuals, Wall Street Journal photojournalism, Forbes corporate portraiture, Economist documentary style",
    color_palette: "Navy and charcoal suits, glass and steel architecture, trading screen greens and reds, marble tones, amber and blue city lighting, cream and leather boardroom tones",
    negative: "empty offices, casual dress, outdated technology, cluttered desks, informal settings, stock photo cliches, bored expressions",
  },

  climate: {
    scene_types: [
      "extreme weather event photography",
      "wildfire sweeping through forest",
      "flooded urban landscape after storm",
      "hurricane aerial photography",
      "melting glacier documentary shot",
      "drought-stricken landscape",
      "renewable energy farm at sunrise",
      "climate science research facility",
      "environmental protest with signs",
    ],
    lighting: "Dramatic storm lighting, wildfire orange glow, overcast flood lighting, golden hour environmental shots, harsh drought sunlight, aurora-like polar lighting, lightning strike illumination",
    mood: "Urgent, dramatic, concerned, awe-inspiring, powerful nature, environmental gravity, hope through renewable solutions, somber documentary realism",
    composition: "Wide landscape establishing shots, dramatic sky composition, rule of thirds with environmental subject, foreground devastation with background hope, aerial photography framing, before/after comparative composition",
    style: "National Geographic climate photography, BBC Earth documentary style, Associated Press environmental coverage, NYT Climate desk visuals, IPCC report imagery",
    color_palette: "Wildfire oranges and reds, flood browns and greys, sky blues and storm greys, renewable greens and clean blues, glacier whites and ice cyans, drought yellows",
    negative: "cartoon weather, unrealistic disaster scenes, sensationalized imagery, comic book style, overexposed highlights, underexposed details",
  },

  science: {
    scene_types: [
      "state-of-the-art research laboratory",
      "scientist using advanced microscope",
      "medical research facility with clean rooms",
      "space telescope observatory",
      "particle accelerator tunnel",
      "DNA sequencing laboratory",
      "NASA mission control room",
      "biotechnology innovation lab",
    ],
    lighting: "Clean white lab lighting, cool scientific illumination, monitor glow from equipment, sterile bright rooms, blue ambient research lighting, dramatic spotlight on experiments",
    mood: "Discovery-focused, precise, groundbreaking, intellectual, awe-inspiring, methodical, innovative",
    composition: "Symmetric lab bench framing, subject at microscope, leading lines along research equipment, clean geometric compositions, wide shot of entire laboratory, tight macro shots of experiments",
    style: "Nature journal editorial photography, Science magazine visuals, NASA documentary imagery, BBC Science coverage, National Geographic exploration style, CERN documentary photography",
    color_palette: "Clean whites, scientific blues, lab coat whites, equipment greys, DNA helix colors, space blacks with star whites, microscope fluorescence colors",
    negative: "messy labs, unrealistic experiments, cartoon science, cluttered benches, outdated equipment, blurry microscopic imagery, fake looking",
  },

  health: {
    scene_types: [
      "modern hospital exterior",
      "medical professionals in clean operating room",
      "healthcare worker helping patient",
      "vaccine research laboratory",
      "modern clinic waiting area",
      "medical innovation technology",
      "public health campaign imagery",
      "pharmaceutical research facility",
    ],
    lighting: "Clean clinical lighting, soft diffused exam room light, operating theater bright illumination, natural light in hospital atriums, warm healing ambient light",
    mood: "Compassionate, professional, hopeful, trustworthy, healing, dedicated, careful precision",
    composition: "Patient-centered framing, medical professional portraiture, clean clinical compositions, symmetric hospital architecture, warm doctor-patient interaction shots",
    style: "WHO documentary photography, Lancet medical journal visuals, CNN Health coverage, Mayo Clinic editorial style, medical documentary photography",
    color_palette: "Medical blues, clean whites, healing greens, soft warm skin tones, clinical greys, nature-inspired healing colors",
    negative: "gory imagery, distressed patients, unsterile environments, outdated medical equipment, cartoon medical imagery, blurry clinical shots, excessive blood",
  },

  culture: {
    scene_types: [
      "art gallery opening night",
      "concert hall performance",
      "museum exhibition hall",
      "street art festival",
      "theatre stage production",
      "cultural landmark during festival",
      "fashion week runway",
      "music festival crowd",
    ],
    lighting: "Gallery spotlighting, concert stage lighting, museum ambient light, festival golden hour, theatrical spotlight, neon event lighting, warm cultural celebration light",
    mood: "Vibrant, celebratory, artistic, sophisticated, cultural richness, diverse, expressive, inspiring",
    composition: "Performance-centered framing, gallery wall symmetry, crowd energy wide shots, artist portraiture, cultural detail closeups, architectural cultural landmark shots",
    style: "New York Times Arts section photography, Guardian Culture visuals, BBC Arts coverage, Vanity Fair event photography, art world editorial",
    color_palette: "Gallery whites, stage lighting colors, festival vibrancy, museum warmth, cultural traditional colors, artistic expression palettes",
    negative: "empty venues, generic entertainment, commercial stock imagery, low energy scenes, unattributed artwork, blurry performances",
  },

  world: {
    scene_types: [
      "international diplomacy building exterior",
      "United Nations headquarters scene",
      "global summit with multiple flags",
      "embassy row establishing shot",
      "international border crossing",
      "humanitarian aid distribution",
      "multi-cultural street market",
      "international airport arrival hall",
    ],
    lighting: "Global diplomacy ambient lighting, golden hour at international landmarks, natural documentary lighting, mixed cultural lighting, soft diplomatic neutral light",
    mood: "Global perspective, diplomatic gravitas, international cooperation, worldly sophistication, cultural respect, humanitarian concern",
    composition: "Symmetrical international building shots, multi-subject diplomatic framing, global landmark establishing shots, cultural context framing, clean wide-angle geography",
    style: "Reuters international desk photography, AP global coverage, BBC World Service visuals, UN documentary photography, Foreign Affairs editorial",
    color_palette: "International blue, diplomatic navy, flag colors, global landmark tones, diverse cultural colors, humanitarian neutral tones, world map blues",
    negative: "single-country focus, stereotypical imagery, cultural insensitivity, tourist photography style, blurred landmarks, overcast uniformly grey",
  },

  opinion: {
    scene_types: [
      "editorial commentary visual metaphor",
      "symbolic imagery for opinion piece",
      "conceptual editorial photography",
      "abstract political commentary visual",
      "thought-provoking symbolic composition",
    ],
    lighting: "Dramatic editorial lighting, high contrast commentary shadows, metaphorical chiaroscuro, symbolic spotlight, moody atmospheric light",
    mood: "Thought-provoking, analytical, critical, reflective, editorial gravitas, persuasive, contemplative",
    composition: "Strong symbolic centering, metaphorical framing, editorial graphic composition, clean symbolic negative space, commentary-focused subject placement",
    style: "NYT Opinion section photography, Guardian Long Read visuals, The Atlantic editorial imagery, New Yorker commentary art, editorial illustration photography",
    color_palette: "High contrast black and white, editorial dark tones, symbolic accent colors, muted commentary palette, dramatic shadows and highlights",
    negative: "literal interpretations, cartoon metaphors, cliche symbolism, overly complex imagery, unclear messaging, generic opinion art",
  },
}

const DEFAULT_TEMPLATE = CATEGORY_TEMPLATES.world

/**
 * Build a category-specific cinematic prompt
 */
function generateCinematicPrompt(title, category, summary, analysis = {}) {
  const safeTitle = title.replace(/[^\w\s,.-]/g, "").slice(0, 120)
  const safeSummary = (summary || "").replace(/[^\w\s,.-]/g, "").slice(0, 250)

  const cat = category?.toLowerCase() || "world"
  const template = CATEGORY_TEMPLATES[cat] || DEFAULT_TEMPLATE

  const sceneType = template.scene_types[Math.floor(Math.random() * template.scene_types.length)]
  const locations = analysis.locations?.length ? `Location: ${analysis.locations.slice(0, 3).join(", ")}.` : ""
  const events = analysis.events?.length ? `Event context: ${analysis.events.slice(0, 2).join(", ")}.` : ""
  const moodDesc = analysis.mood
    ? `Mood: ${analysis.mood}${analysis.moodSecondary ? ` with ${analysis.moodSecondary}` : ""}.`
    : ""

  const parts = [
    `Editorial news photography: ${safeTitle}.`,
    `Scene: ${sceneType}.`,
    locations,
    events,
    moodDesc,
    `Context: ${safeSummary}`,
    `Lighting: ${template.lighting}.`,
    `Mood and atmosphere: ${template.mood}.`,
    `Composition: ${template.composition}. ${COMPOSITION_RULES}`,
    `Style: ${template.style}. ${STYLE_DIRECTIVES}`,
    `Color palette: ${template.color_palette}.`,
    `Negative prompt: ${NEGATIVE_PROMPTS}, ${template.negative}`,
  ]

  return parts.filter(Boolean).join(" ")
}

/**
 * Assess the quality of a downloaded image buffer
 * Returns { pass: boolean, score: number, reasons: string[] }
 */
function assessImageQuality(buffer) {
  const reasons = []
  let score = 100

  if (!buffer || buffer.length < 5000) {
    return { pass: false, score: 0, reasons: ["too small or empty"] }
  }

  // Check JPEG magic bytes
  if (buffer.length > 2) {
    const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF
    if (!isJPEG) {
      score -= 40
      reasons.push("not valid JPEG format")
    }
  }

  // Check file size thresholds
  if (buffer.length < 10000) {
    score -= 40
    reasons.push("too small (<10KB)")
  } else if (buffer.length < 30000) {
    score -= 15
    reasons.push("small file (<30KB)")
  }

  if (buffer.length > 500000) {
    score -= 5
    reasons.push("large file, may need compression")
  }

  // Check if image appears to be mostly dark/black by sampling bytes
  let darkPixelCount = 0
  let whitePixelCount = 0
  const samples = Math.min(Math.floor(buffer.length / 100), 1000)
  for (let i = 0; i < samples; i++) {
    const offset = Math.floor((buffer.length / samples) * i)
    if (offset + 2 < buffer.length) {
      const avg = (buffer[offset] + buffer[offset + 1] + buffer[offset + 2]) / 3
      if (avg < 30) darkPixelCount++
      if (avg > 225) whitePixelCount++
    }
  }
  const darkRatio = darkPixelCount / samples
  const whiteRatio = whitePixelCount / samples

  if (darkRatio > 0.7) {
    score -= 30
    reasons.push("too dark (low visibility)")
  }

  if (whiteRatio > 0.7) {
    score -= 20
    reasons.push("too bright (overexposed)")
  }

  // Check for uniform/abstract (low variance)
  let totalVariance = 0
  const varianceSamples = Math.min(Math.floor(buffer.length / 200), 500)
  for (let i = 1; i < varianceSamples; i++) {
    const offset = Math.floor((buffer.length / varianceSamples) * i)
    if (offset > 0 && offset < buffer.length - 1) {
      totalVariance += Math.abs(buffer[offset] - buffer[offset - 1])
    }
  }
  const avgVariance = totalVariance / varianceSamples

  if (avgVariance < 5) {
    score -= 30
    reasons.push("mostly uniform/abstract")
  }

  const pass = score >= 40

  return { pass, score, reasons }
}

/**
 * Generate an adjusted prompt for retry (adds more specificity)
 */
function adjustPromptForRetry(prompt, retryCount, title) {
  const boosters = [
    `High detail, sharp focus, clear subject.`,
    `Very detailed, highly specific, precise composition. Ultra realistic.`,
    `Maximum detail, photorealistic, crystal clear, perfect composition. Editorial masterpiece.`,
    `Award-winning editorial photography, exceptional composition, perfect lighting, crystal clarity.`,
  ]

  const booster = boosters[Math.min(retryCount - 1, boosters.length - 1)]
  return `${prompt}. ${booster}`
}

module.exports = {
  CATEGORY_TEMPLATES,
  NEGATIVE_PROMPTS,
  STYLE_DIRECTIVES,
  COMPOSITION_RULES,
  generateCinematicPrompt,
  assessImageQuality,
  adjustPromptForRetry,
}
