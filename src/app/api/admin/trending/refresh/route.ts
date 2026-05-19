import { NextResponse } from "next/server"

export const dynamic = "force-static"

export async function POST() {
  try {
    const { computeTrending, computeDailyMetrics } = await import(
      "../../../../../../scripts/lib/metrics"
    )
    const trending = computeTrending(20)
    computeDailyMetrics()
    return NextResponse.json({ ok: true, trending })
  } catch (err: unknown) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
