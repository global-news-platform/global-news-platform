const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || ""
const GEMINI_MODEL = process.env.GEMINI_VISION_MODEL || "gemini-3.6-flash"
const GEMINI_BASE_URL = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta"

const VERIFY_PROMPT = `You are an image-news relevance verifier for a news page.
Given a news headline and an image, decide whether the image is a RELEVANT illustration of that news story.

Rules:
- Reply YES only if the image clearly depicts the subject of the headline (person, place, event, object, scene).
- Reply NO if the image is generic, unrelated, a logo, a placeholder, an abstract pattern, a map without context, or shows something not mentioned in the headline.
- Do not be lenient. A wrong image is worse than no image.

Output ONLY valid JSON: {"relevant": true or false, "reason": "one short sentence"}`

async function downloadImage(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "GlobalLens/1.0 (Image Relevance Verifier)" },
      redirect: "follow",
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 1000) throw new Error("Image too small")
    return { buf, mime: (res.headers.get("content-type") || "image/jpeg").split(";")[0] }
  } finally {
    clearTimeout(timer)
  }
}

async function verifyImageRelevance(imageUrl, headline) {
  if (!GEMINI_API_KEY) return null

  let buffer
  let mime
  try {
    const dl = await downloadImage(imageUrl)
    buffer = dl.buf
    mime = dl.mime
  } catch (err) {
    return null
  }

  const base64 = buffer.toString("base64")

  try {
    const response = await fetch(`${GEMINI_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `News headline: "${headline}".\n\n${VERIFY_PROMPT}` },
              { inline_data: { mime_type: mime, data: base64 } },
            ],
          },
        ],
        generationConfig: { temperature: 0, maxOutputTokens: 200 },
      }),
    })

    if (!response.ok) {
      const err = await response.text().catch(() => "unknown error")
      console.log(`    Image relevance check failed (${response.status}): ${err.slice(0, 120)}`)
      return null
    }

    const data = await response.json()
    const parts = data.candidates?.[0]?.content?.parts || []
    const content = parts.map((p) => p.text || "").join("").trim()
    if (!content) return null

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    const parsed = JSON.parse(jsonMatch[0])
    return !!parsed.relevant
  } catch (err) {
    console.log(`    Image relevance check error: ${err.message}`)
    return null
  }
}

module.exports = { verifyImageRelevance }
