async function download(url, filename) {
  if (!url) return null
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: { "User-Agent": "GlobalNewsBot/1.0" },
    })
    if (!res.ok) return null
    return url
  } catch {
    return null
  }
}

module.exports = { download }
