/**
 * Social media posting template engine.
 * Generates platform-optimized content for Twitter, Facebook, LinkedIn, Telegram, Discord.
 */

function truncate(text, maxLength) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + "..."
}

function generateHashtags(tags, max = 4) {
  return tags
    .filter((t) => t.length > 0)
    .slice(0, max)
    .map((t) => {
      const cleaned = t.replace(/[^a-zA-Z0-9]/g, "")
      return `#${cleaned.charAt(0).toUpperCase() + cleaned.slice(1)}`
    })
}

function twitter(article) {
  const hashtags = generateHashtags(article.tags || [], 3).join(" ")
  const text = truncate(article.title, 220)
  return `${text}

${hashtags}

${article.url || ""}`.trim()
}

function threads(article) {
  const hashtags = generateHashtags(article.tags || [], 3).join(" ")
  const text = truncate(article.title, 450)
  return `${text}

${hashtags}

${article.url || ""}`.trim()
}

function facebook(article) {
  const hashtags = generateHashtags(article.tags || [], 5).join(" ")
  const excerpt = truncate(article.excerpt || "", 300)

  return `${article.title}

${excerpt}

${hashtags}

${article.url || ""}`.trim()
}

function linkedin(article) {
  const hashtags = generateHashtags(article.tags || [], 4).join(" ")
  const excerpt = truncate(article.excerpt || "", 400)

  return `${article.title}

${excerpt}

${hashtags}

${article.url || ""}`.trim()
}

function telegram(article) {
  const hashtags = generateHashtags(article.tags || [], 3).join(" ")
  const excerpt = truncate(article.excerpt || "", 200)

  return `📰 ${article.title}

${excerpt}

🔗 ${article.url || ""}

${hashtags}`.trim()
}

function discord(article) {
  return `**${article.title}**
${truncate(article.excerpt || "", 250)}

<${article.url || ""}>`
}

function generateAll(article) {
  return {
    twitter: twitter(article),
    threads: threads(article),
    facebook: facebook(article),
    linkedin: linkedin(article),
    telegram: telegram(article),
    discord: discord(article),
    hashtags: generateHashtags(article.tags || []),
  }
}

module.exports = { generateAll, twitter, facebook, linkedin, telegram, discord, threads, generateHashtags }
