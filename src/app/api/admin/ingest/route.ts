import { NextResponse } from "next/server"

export const dynamic = "force-static"

export async function POST() {
  try {
    const { execSync } = await import("child_process")
    const result = execSync("node scripts/run-fetch.js", {
      encoding: "utf-8",
      timeout: 120000,
      cwd: process.cwd(),
    })
    return NextResponse.json({ ok: true, output: result })
  } catch (err: unknown) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
