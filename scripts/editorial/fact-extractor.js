import { generate } from "./ai.js"

export async function extractFacts(article) {
  const system = `You are a professional news fact extractor. Extract structured facts from the article below.

Extract ALL of the following if present:
- **entities**: People, organizations, companies, brands mentioned (as an array of {name, type})
- **dates**: Key dates mentioned (as an array of {date, description})
- **locations**: Geographic locations mentioned (as an array of names)
- **statistics**: Numbers, percentages, figures, financial data (as an array of {value, context})
- **events**: Key events described (as an array of {event, description})
- **statements**: Direct or attributed statements from officials/experts (as an array of {speaker, statement, context})
- **timeline**: Chronological sequence of events (as an array of {date, event})

Return ONLY valid JSON. No markdown, no explanation.
If a field has no data, use an empty array.`

  const prompt = `Title: ${article.title || "(no title)"}
Source: ${article.source || "(unknown)"}
Published: ${article.publishedAt || "(unknown)"}

Body:
${stripHtml(article.body || article.excerpt || "")}`

  let raw
  try {
    raw = await generate(prompt, { system, temperature: 0.1, maxTokens: 2048, format: "json" })
    raw = sanitizeJson(raw)
    const parsed = JSON.parse(raw)
    return {
      entities: parsed.entities || [],
      dates: parsed.dates || [],
      locations: parsed.locations || [],
      statistics: parsed.statistics || [],
      events: parsed.events || [],
      statements: parsed.statements || [],
      timeline: parsed.timeline || [],
      raw,
    }
  } catch (err) {
    console.warn(`[fact-extractor] Extraction failed: ${err.message}`)
    return { entities: [], dates: [], locations: [], statistics: [], events: [], statements: [], timeline: [], raw }
  }
}

function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, (m) => String.fromCharCode(m.slice(2, -1)))
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 6000)
}

function sanitizeJson(raw) {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim()
}
