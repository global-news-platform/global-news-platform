import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export const dynamic = "force-static"

export async function GET() {
  const filePath = path.join(
    process.cwd(),
    "scripts",
    "data",
    "source-health.json",
  )
  try {
    if (fs.existsSync(filePath)) {
      const data: Record<string, { history?: Array<{ ok: boolean; at?: string; error?: string }> }> = JSON.parse(fs.readFileSync(filePath, "utf-8"))

      const statuses = Object.entries(data).map(
        ([label, info]) => {
          const history = info.history || []
          const recent = history.slice(-20)
          const successes = recent.filter((r) => r.ok).length
          const score =
            recent.length > 0
              ? Math.round((successes / recent.length) * 100)
              : 100
          const lastEntry = history[history.length - 1]

          return {
            label,
            score,
            healthy: score >= 70,
            lastFetch: lastEntry?.at || null,
            lastError: lastEntry?.ok === false ? lastEntry.error : null,
            totalFetches: history.length,
          }
        },
      )

      return NextResponse.json({
        sources: statuses.sort((a, b) => a.score - b.score),
        summary: {
          total: statuses.length,
          healthy: statuses.filter((s) => s.healthy).length,
          unhealthy: statuses.filter((s) => !s.healthy).length,
        },
      })
    }
  } catch {}
  return NextResponse.json({ sources: [], summary: { total: 0, healthy: 0, unhealthy: 0 } })
}
