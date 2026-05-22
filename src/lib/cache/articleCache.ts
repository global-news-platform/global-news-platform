import fs from "fs"
import path from "path"

const CACHE_DIR = path.join(process.cwd(), ".cache")
const CACHE_FILE = path.join(CACHE_DIR, "article-data.json")
const CACHE_TTL = 60 * 60 * 1000

interface CacheEntry<T> {
  data: T
  cachedAt: number
  ttl: number
}

const memoryCache = new Map<string, CacheEntry<unknown>>()

function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }
}

export function getFromCache<T>(key: string): T | null {
  const entry = memoryCache.get(key)
  if (entry) {
    if (Date.now() - entry.cachedAt < entry.ttl) {
      return entry.data as T
    }
    memoryCache.delete(key)
  }
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const all: Record<string, CacheEntry<unknown>> = JSON.parse(
        fs.readFileSync(CACHE_FILE, "utf-8"),
      )
      const fileEntry = all[key]
      if (fileEntry && Date.now() - fileEntry.cachedAt < fileEntry.ttl) {
        memoryCache.set(key, fileEntry)
        return fileEntry.data as T
      }
    }
  } catch {
  }
  return null
}

export function setInCache<T>(key: string, data: T, ttl = CACHE_TTL): void {
  const entry: CacheEntry<unknown> = { data, cachedAt: Date.now(), ttl }
  memoryCache.set(key, entry)
  try {
    ensureCacheDir()
    let all: Record<string, CacheEntry<unknown>> = {}
    if (fs.existsSync(CACHE_FILE)) {
      try {
        all = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"))
      } catch {
        all = {}
      }
    }
    all[key] = entry
    fs.writeFileSync(CACHE_FILE, JSON.stringify(all, null, 2), "utf-8")
  } catch {
  }
}

export function clearAllCaches(): void {
  memoryCache.clear()
  try {
    if (fs.existsSync(CACHE_FILE)) {
      fs.unlinkSync(CACHE_FILE)
    }
  } catch {
  }
}

export function getCacheSize(): number {
  return memoryCache.size
}
