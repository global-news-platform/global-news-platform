import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export const dynamic = "force-static"

export async function GET() {
  const filePath = path.join(process.cwd(), "scripts", "data", "schedule.json")
  try {
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"))
      return NextResponse.json({
        queue: data.queue || [],
        history: (data.history || []).slice(0, 20),
      })
    }
  } catch {}
  return NextResponse.json({ queue: [], history: [] })
}
