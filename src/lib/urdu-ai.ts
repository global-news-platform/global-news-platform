export const ALLOWED_ENGLISH_WORDS = new Set(["AI", "WhatsApp", "Facebook", "Google", "iPhone", "YouTube", "BBC", "CNN", "PDF", "CEO"])

export function removeEnglishFromUrdu(text: string): string {
  let result = text

  result = result.replace(/[""''"']/g, "'")
  result = result.replace(/[""]/g, '"')

  result = result.replace(/,/g, "،")
  result = result.replace(/،،+/g, "،")
  result = result.replace(/\.{2,}/g, "۔")
  result = result.replace(/;{2,}/g, "؛")
  result = result.replace(/!{2,}/g, "!")
  result = result.replace(/\+{2,}/g, "")

  result = result.replace(/[\u200B-\u200F\uFEFF]/g, "")

  const words = result.split(/\s+/)
  const filtered = words
    .filter((w) => {
      if (!/[a-zA-Z]/.test(w)) return true
      const clean = w.replace(/[^a-zA-Z]/g, "")
      if (!clean) return true
      return ALLOWED_ENGLISH_WORDS.has(clean) || ALLOWED_ENGLISH_WORDS.has(clean.toLowerCase())
    })
    .join(" ")
    .trim()

  return filtered
}

export interface MixedSegment {
  text: string
  dir: "ltr" | "rtl"
}

export function splitMixedLanguage(text: string): MixedSegment[] {
  if (!text) return [{ text, dir: "rtl" }]
  if (!/[a-zA-Z]/.test(text) || !/[\u0600-\u06FF]/.test(text)) {
    return [{ text, dir: "rtl" }]
  }

  const rawParts: { text: string; isLatin: boolean }[] = []
  let current = ""
  let currentIsLatin = false
  let hasContent = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const isLatin = /[a-zA-Z]/.test(ch)
    const isUrdu = /[\u0600-\u06FF]/.test(ch)
    const isNeutral = !isLatin && !isUrdu

    if (isLatin || isUrdu) {
      if (hasContent && (currentIsLatin !== isLatin)) {
        rawParts.push({ text: current.trim(), isLatin: currentIsLatin })
        current = ""
      }
      currentIsLatin = isLatin
      hasContent = true
    }

    current += ch
  }

  if (current) {
    rawParts.push({ text: current.trim(), isLatin: currentIsLatin })
  }

  const merged: MixedSegment[] = []
  for (const part of rawParts) {
    if (!part.text) continue
    const last = merged[merged.length - 1]
    if (last && ((part.isLatin && last.dir === "ltr") || (!part.isLatin && last.dir === "rtl"))) {
      last.text += " " + part.text
    } else {
      merged.push({ text: part.text, dir: part.isLatin ? "ltr" : "rtl" })
    }
  }

  return merged.length > 0 ? merged : [{ text, dir: "rtl" }]
}

export const CATEGORY_URDU: Record<string, string> = {
  Pakistan: "پاکستان",
  World: "دنیا",
  Politics: "سیاست",
  Business: "کاروبار",
  Technology: "ٹیکنالوجی",
  Sports: "کھیل",
  Health: "صحت",
  Science: "سائنس",
  Entertainment: "شوبز",
  Culture: "ثقافت",
  Religion: "مذہب",
  Education: "تعلیم",
  Climate: "موسم",
  Weather: "موسم",
  Crime: "کرائم",
  Justice: "عدالت",
  International: "بین الاقوامی",
  Opinion: "رائے",
  General: "جنرل",
  Travel: "سفر",
  Food: "کھانا",
  Fashion: "فیشن",
  Art: "آرٹ",
  Music: "موسیقی",
  Film: "فلم",
  Economy: "معیشت",
  Defence: "دفاع",
  National: "قومی",
  Regional: "علاقائی",
  Local: "مقامی",
}

export const CATEGORY_ENGLISH: Record<string, string> = {
  پاکستان: "Pakistan",
  دنیا: "World",
  سیاست: "Politics",
  "کاروبار": "Business",
  ٹیکنالوجی: "Technology",
  کھیل: "Sports",
  صحت: "Health",
  سائنس: "Science",
  شوبز: "Entertainment",
  ثقافت: "Culture",
  مذہب: "Religion",
  تعلیم: "Education",
  موسم: "Climate",
  کرائم: "Crime",
  عدالت: "Justice",
  "بین الاقوامی": "International",
  رائے: "Opinion",
  جنرل: "General",
}

export const LOCATION_URDU: Record<string, string> = {
  "Pakistan": "پاکستان",
  "India": "بھارت",
  "China": "چین",
  "United States": "امریکہ",
  "America": "امریکہ",
  "US": "امریکہ",
  "USA": "امریکہ",
  "UK": "برطانیہ",
  "Britain": "برطانیہ",
  "United Kingdom": "برطانیہ",
  "England": "انگلینڈ",
  "London": "لندن",
  "Washington": "واشنگٹن",
  "New York": "نیویارک",
  "Beijing": "بیجنگ",
  "Moscow": "ماسکو",
  "Russia": "روس",
  "Ukraine": "یوکرین",
  "Kyiv": "کیف",
  "Iran": "ایران",
  "Tehran": "تہران",
  "Saudi Arabia": "سعودی عرب",
  "Riyadh": "ریاض",
  "Dubai": "دبئی",
  "UAE": "متحدہ عرب امارات",
  "Turkey": "ترکی",
  "Ankara": "انقرہ",
  "Istanbul": "استنبول",
  "Afghanistan": "افغانستان",
  "Kabul": "کابل",
  "Israel": "اسرائیل",
  "Palestine": "فلسطین",
  "Gaza": "غزہ",
  "Jerusalem": "یروشلم",
  "Europe": "یورپ",
  "Asia": "ایشیا",
  "Africa": "افریقہ",
  "Middle East": "مشرق وسطی",
  "South Asia": "جنوبی ایشیا",
  "Islamabad": "اسلام آباد",
  "Karachi": "کراچی",
  "Lahore": "لاہور",
  "Peshawar": "پشاور",
  "Quetta": "کوئٹہ",
  "Kashmir": "کشمیر",
  "Tokyo": "ٹوکیو",
  "Paris": "پیرس",
  "Berlin": "برلن",
  "Rome": "روم",
  "Madrid": "میڈرڈ",
  "Ottawa": "اوٹاوا",
  "Canberra": "کینبرا",
  "Sydney": "سڈنی",
  "Melbourne": "میلبورن",
  "Damascus": "دمشق",
  "Baghdad": "بغداد",
  "Cairo": "قاہرہ",
}

export const PERSON_URDU: Record<string, string> = {
  "Biden": "بائیڈن",
  "Joe Biden": "جو بائیڈن",
  "Trump": "ٹرمپ",
  "Donald Trump": "ڈونلڈ ٹرمپ",
  "Obama": "اوباما",
  "Barack Obama": "باراک اوباما",
  "Harris": "ہیرس",
  "Kamala Harris": "کملا ہیرس",
  "Putin": "پیوٹن",
  "Vladimir Putin": "ولادیمیر پیوٹن",
  "Xi Jinping": "شی جن پنگ",
  "Modi": "مودی",
  "Narendra Modi": "نریندر مودی",
  "Imran Khan": "عمران خان",
  "Shehbaz Sharif": "شہباز شریف",
  "Nawaz Sharif": "نواز شریف",
  "Bilawal Bhutto": "بلاول بھٹو",
  "Zardari": "زرداری",
  "Asif Ali Zardari": "آصف علی زرداری",
  "Zelensky": "زیلنسکی",
  "Volodymyr Zelensky": "وولوڈیمیر زیلنسکی",
  "Netanyahu": "نتن یاہو",
  "Benjamin Netanyahu": "بنیامین نیتن یاہو",
  "King Charles": "کنگ چارلس",
  "Pope Francis": "پوپ فرانسس",
  "Elon Musk": "ایلون مسک",
  "Mark Zuckerberg": "مارک زکربرگ",
  "Jeff Bezos": "جیف بیزوس",
  "Tim Cook": "ٹم کک",
  "Sam Altman": "سیم آلٹمین",
  "Macron": "میکرون",
  "Scholz": "شولٹز",
  "Sunak": "سنک",
  "Starmer": "سٹارمر",
  "Hamas": "حماس",
  "Hezbollah": "حزب اللہ",
  "MBS": "ایم بی ایس",
  "Mohammed bin Salman": "محمد بن سلمان",
}

export const TAG_URDU: Record<string, string> = {
  "ai": "مصنوعی ذہانت",
  "artificial-intelligence": "مصنوعی ذہانت",
  "technology": "ٹیکنالوجی",
  "tech": "ٹیکنالوجی",
  "innovation": "جدت",
  "digital": "ڈیجیٹل",
  "cybersecurity": "سائبر سیکیورٹی",
  "healthcare": "صحت",
  "medicine": "طب",
  "politics": "سیاست",
  "election": "انتخابات",
  "government": "حکومت",
  "economy": "معیشت",
  "business": "کاروبار",
  "sports": "کھیل",
  "cricket": "کرکٹ",
  "football": "فٹ بال",
  "climate": "موسم",
  "climate-change": "موسمیاتی تبدیلی",
  "environment": "ماحول",
  "science": "سائنس",
  "space": "خلاء",
  "education": "تعلیم",
  "crime": "جرم",
  "world": "دنیا",
  "international": "بین الاقوامی",
  "pakistan": "پاکستان",
  "india": "بھارت",
  "china": "چین",
  "usa": "امریکہ",
  "uk": "برطانیہ",
}

export const URDU_TOPIC_WORDS: Record<string, string> = {
  "election": "انتخابات",
  "war": "جنگ",
  "attack": "حملہ",
  "peace": "امن",
  "deal": "معاہدہ",
  "crisis": "بحران",
  "protest": "احتجاج",
  "strike": "ہڑتال",
  "vote": "ووٹ",
  "law": "قانون",
  "court": "عدالت",
  "trial": "مقدمہ",
  "prison": "جیل",
  "police": "پولیس",
  "army": "فوج",
  "military": "فوجی",
  "nuclear": "جوہری",
  "missile": "میزائل",
  "drone": "ڈرون",
  "oil": "تیل",
  "gas": "گیس",
  "trade": "تجارت",
  "tariff": "ٹیرف",
  "sanctions": "پابندیاں",
  "budget": "بجٹ",
  "debt": "قرض",
  "tax": "ٹیکس",
  "market": "مارکیٹ",
  "stock": "اسٹاک",
  "bank": "بینک",
  "inflation": "مہنگائی",
  "economy": "معیشت",
  "health": "صحت",
  "hospital": "ہسپتال",
  "vaccine": "ویکسین",
  "climate": "موسم",
  "flood": "سیلاب",
  "storm": "طوفان",
  "earthquake": "زلزلہ",
  "environment": "ماحول",
  "education": "تعلیم",
  "school": "اسکول",
  "science": "سائنس",
  "space": "خلاء",
  "technology": "ٹیکنالوجی",
  "internet": "انٹرنیٹ",
  "ai": "مصنوعی ذہانت",
  "sports": "کھیل",
  "football": "فٹ بال",
  "cricket": "کرکٹ",
  "olympics": "اولمپکس",
  "president": "صدر",
  "government": "حکومت",
  "parliament": "پارلیمنٹ",
  "justice": "انصاف",
  "democracy": "جمہوریت",
  "border": "سرحد",
  "killed": "ہلاک",
  "injured": "زخمی",
  "arrested": "گرفتار",
  "investigation": "تفتیش",
  "report": "رپورٹ",
  "analysis": "تجزیہ",
}

export function translateCategory(category: string): string {
  if (CATEGORY_URDU[category]) return CATEGORY_URDU[category]
  if (CATEGORY_URDU[category.toLowerCase()]) return CATEGORY_URDU[category.toLowerCase()]
  const capitalized = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
  if (CATEGORY_URDU[capitalized]) return CATEGORY_URDU[capitalized]
  return category
}

export function translateTags(tags: string[]): string[] {
  return tags.map((tag) => {
    const lower = tag.toLowerCase().trim()
    return TAG_URDU[lower] || tag
  })
}

export function isEnglishText(text: string): boolean {
  if (!text || text.length === 0) return false
  const urduChars = (text.match(/[\u0600-\u06FF]/g) || []).length
  const latinChars = (text.match(/[a-zA-Z]/g) || []).length
  return latinChars > urduChars && urduChars < text.replace(/\s/g, "").length * 0.2
}

export function urduCharCount(text: string): number {
  return (text.match(/[\u0600-\u06FF]/g) || []).length
}
