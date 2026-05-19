import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export const dynamic = "force-static"

const SCRIPTS_DATA = path.join(process.cwd(), "scripts", "data")
const ARTICLES_DIR = path.join(process.cwd(), "src", "data", "articles")

function readJSON(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"))
    }
  } catch {}
  return null
}

export async function GET() {
  const articleCount = fs.existsSync(ARTICLES_DIR)
    ? fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".mdx")).length
    : 0

  const processed = readJSON(path.join(SCRIPTS_DATA, "processed.json"))
  const processedCount = processed ? Object.keys(processed).length : 0

  const schedule = readJSON(path.join(SCRIPTS_DATA, "schedule.json"))
  const queueCount = schedule?.queue?.length || 0
  const publishedCount = schedule?.history?.length || 0

  const trending = readJSON(path.join(SCRIPTS_DATA, "trending.json"))
  const trendingCount = trending?.trending?.length || 0

  const health = readJSON(path.join(SCRIPTS_DATA, "source-health.json"))
  const sourceCount = health ? Object.keys(health).length : 0

  const metrics = readJSON(path.join(SCRIPTS_DATA, "metrics.json"))
  const articleMetricsCount = metrics?.articles
    ? Object.keys(metrics.articles).length
    : 0

  const cacheDir = path.join(SCRIPTS_DATA, "cache")
  const cacheCount = fs.existsSync(cacheDir)
    ? fs.readdirSync(cacheDir).filter((f) => f.endsWith(".json")).length
    : 0

  return NextResponse.json({
    articles: {
      total: articleCount,
      processed: processedCount,
    },
    publishing: {
      queue: queueCount,
      published: publishedCount,
    },
    trending: {
      items: trendingCount,
    },
    sources: {
      tracked: sourceCount,
      cacheEntries: cacheCount,
    },
    analytics: {
      articlesTracked: articleMetricsCount,
    },
  })
}
