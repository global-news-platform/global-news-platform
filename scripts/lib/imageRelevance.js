const AI_API_KEY = process.env.AI_API_KEY || ""
const AI_MODEL = process.env.AI_REWRITE_MODEL || "gpt-4o-mini"
const AI_BASE_URL = process.env.AI_BASE_URL || "https://api.openai.com/v1"

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
    return buf
  } finally {
    clearTimeout(timer)
  }
}

async function verifyImageRelevance(imageUrl, headline) {
  if (!AI_API_KEY) return null

  let buffer
  try {
    buffer = await downloadImage(imageUrl)
  } catch (err) {
    return null
  }

  const base64 = buffer.toString("base64")
  const mime = "image/jpeg"

  try {
    const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: "system", content: VERIFY_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: `News headline: "${headline}". Is the attached image relevant to this news story?` },
              { type: "image_url", image_url: { url: `data:${mime};base64,${base64}` } },
            ],
          },
        ],
        temperature: 0,
        max_tokens: 200,
      }),
    })

    if (!response.ok) {
      const err = await response.text().catch(() => "unknown error")
      console.log(`    Image relevance check failed (${response.status}): ${err.slice(0, 120)}`)
      return null
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) return null

    const parsed = JSON.parse(content)
    return !!parsed.relevant
  } catch (err) {
    console.log(`    Image relevance check error: ${err.message}`)
    return null
  }
}

module.exports = { verifyImageRelevance }
