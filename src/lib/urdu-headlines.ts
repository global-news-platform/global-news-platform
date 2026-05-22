import { PERSON_URDU, LOCATION_URDU, URDU_HEADLINE_TEMPLATES, URDU_TOPIC_WORDS, removeEnglishFromUrdu } from "./urdu-ai"

function extractEntity(title: string): string {
  const lower = title.toLowerCase()
  for (const [eng, ur] of Object.entries(PERSON_URDU)) {
    if (lower.includes(eng.toLowerCase())) return ur
  }
  return ""
}

function extractLocation(title: string): string {
  const lower = title.toLowerCase()
  for (const [eng, ur] of Object.entries(LOCATION_URDU)) {
    if (lower.includes(eng.toLowerCase())) return ur
  }
  return ""
}

function extractTopic(title: string): string {
  const lower = title.toLowerCase()
  for (const [eng, ur] of Object.entries(URDU_TOPIC_WORDS)) {
    if (lower.includes(eng)) return ur
  }
  return ""
}

function generateTemplateHeadline(title: string): string {
  const entity = extractEntity(title)
  const location = extractLocation(title)
  const topic = extractTopic(title)

  let template = URDU_HEADLINE_TEMPLATES[Math.floor(Math.random() * URDU_HEADLINE_TEMPLATES.length)]
  template = template.replace("{entity}", entity || "حکام")
  template = template.replace("{location}", location || "ملک")
  template = template.replace("{topic}", topic || "اہم خبر")

  return template
    .replace(/\s+/g, " ")
    .replace(/[،;]+$/, "")
    .trim()
}

export async function generateUrduHeadline(title: string): Promise<string> {
  if (!title || title.length < 5) return removeEnglishFromUrdu(title)

  const template = generateTemplateHeadline(title)
  const cleaned = removeEnglishFromUrdu(template)
  if (cleaned.length > 5) return cleaned

  return removeEnglishFromUrdu(title)
}

export async function generateUrduExcerpt(title: string, excerpt: string): Promise<string> {
  if (!excerpt || excerpt.length < 5) return "تفصیلات کے مطابق یہ خبر منظر عام پر آئی ہے۔"

  if (/[\u0600-\u06FF]/.test(excerpt) && excerpt.length > 20) {
    const clean = excerpt.replace(/[.!?;:]+\s*$/, "").trim()
    return `${removeEnglishFromUrdu(clean)}۔`
  }

  const entity = extractEntity(title)
  const location = extractLocation(title)
  const topic = extractTopic(title)

  const intros = [
    "تفصیلات کے مطابق",
    "اطلاعات کے مطابق",
    "بتایا گیا ہے کہ",
    "ذرائع کا کہنا ہے کہ",
  ]
  const intro = intros[Math.floor(Math.random() * intros.length)]

  if (entity && topic) {
    return `${intro} ${entity} نے ${topic} کے حوالے سے اہم بیان دیا ہے۔`
  }
  if (location && topic) {
    return `${intro} ${location} میں ${topic} کے حوالے سے صورتحال تشویشناک ہے۔`
  }
  if (entity && location) {
    return `${intro} ${entity} کی ${location} کے دورے کے حوالے سے اہم خبر سامنے آئی ہے۔`
  }

  const clean = removeEnglishFromUrdu(excerpt.replace(/[.!?;:]+\s*$/, "").trim())
  return `${intro} ${clean.slice(0, 120)}۔`
}

export function categorizeEnglishCategory(cat: string): string {
  const map: Record<string, string> = {
    "health": "صحت",
    "technology": "ٹیکنالوجی",
    "tech": "ٹیکنالوجی",
    "politics": "سیاست",
    "world": "دنیا",
    "business": "کاروبار",
    "sports": "کھیل",
    "science": "سائنس",
    "climate": "موسم",
    "weather": "موسم",
    "culture": "ثقافت",
    "entertainment": "شوبز",
    "education": "تعلیم",
    "crime": "کرائم",
    "justice": "عدالت",
    "religion": "مذہب",
    "international": "بین الاقوامی",
    "opinion": "رائے",
    "travel": "سفر",
    "food": "کھانا",
    "fashion": "فیشن",
    "art": "آرٹ",
    "music": "موسیقی",
    "film": "فلم",
    "economy": "معیشت",
    "defence": "دفاع",
    "national": "قومی",
    "regional": "علاقائی",
    "local": "مقامی",
    "breaking": "بریکنگ",
    "general": "جنرل",
    "pakistan": "پاکستان",
    "dunya": "دنیا",
    "siasat": "سیاست",
    "karobar": "کاروبار",
    "khel": "کھیل",
    "sehat": "صحت",
    "shobiz": "شوبز",
    "mazhab": "مذہب",
    "taleem": "تعلیم",
    "mausam": "موسم",
    "adalat": "عدالت",
    "baynalaqwami": "بین الاقوامی",
    "raye": "رائے",
  }
  return map[cat.toLowerCase().replace(/[""]/g, "").trim()] || "جنرل"
}
