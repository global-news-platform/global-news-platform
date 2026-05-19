/**
 * Retry wrapper with exponential backoff for async operations.
 */

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function withRetry(fn, options = {}) {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    factor = 2,
    jitter = true,
    onRetry = null,
    context = "operation",
  } = options

  let lastError

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err

      if (attempt === maxAttempts) {
        throw err
      }

      let delay = baseDelay * Math.pow(factor, attempt - 1)
      delay = Math.min(delay, maxDelay)
      if (jitter) {
        delay = delay * (0.5 + Math.random() * 0.5)
      }

      if (onRetry) {
        onRetry({ attempt, maxAttempts, delay, error: err, context })
      }

      await sleep(delay)
    }
  }

  throw lastError
}

async function fetchWithRetry(url, options = {}) {
  const {
    retryOptions = {},
    fetchOptions = {},
  } = options

  const defaultFetchOptions = {
    timeout: 15000,
    headers: {
      "User-Agent": "GlobalNewsBot/1.0 (news aggregator; +https://globalnews.news)",
    },
  }

  return withRetry(
    async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), fetchOptions.timeout || 15000)

      try {
        const response = await fetch(url, {
          ...defaultFetchOptions,
          ...fetchOptions,
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return response
      } finally {
        clearTimeout(timeoutId)
      }
    },
    {
      context: `fetch ${url.slice(0, 80)}`,
      ...retryOptions,
    },
  )
}

module.exports = { withRetry, fetchWithRetry, sleep }
