import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export const dynamic = "force-static"

export async function GET() {
  const filePath = path.join(
    process.cwd(),
    "scripts",
    "data",
    "trending.json",
  )
  try {
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"))
      return NextResponse.json(data)
    }
  } catch {}
  return NextResponse.json({ trending: [], updatedAt: null })
}
