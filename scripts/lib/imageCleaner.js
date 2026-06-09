const sharp = require("sharp")

const GRID_COLS = 6
const GRID_ROWS = 6
const STDDEV_THRESHOLD = 18
const BLUR_RADIUS = 5
const MEDIAN_RADIUS = 3
const CORNER_FRACTION = 0.15
const PAD_FRACTION = 0.04

async function detectRegions(buffer) {
  const meta = await sharp(buffer).metadata()
  const w = meta.width || 1200
  const h = meta.height || 630

  const cellW = Math.floor(w / GRID_COLS)
  const cellH = Math.floor(h / GRID_ROWS)

  const detected = []

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const left = col * cellW
      const top = row * cellH
      const width = col === GRID_COLS - 1 ? w - left : cellW
      const height = row === GRID_ROWS - 1 ? h - top : cellH

      if (width < 20 || height < 20) continue

      try {
        const region = await sharp(buffer)
          .extract({ left, top, width, height })
          .stats()

        const channels = region.channels.filter((c) => c.mean > 5)
        if (channels.length === 0) continue

        const avgStdev = channels.reduce((s, c) => s + c.stdev, 0) / channels.length

        const isEdge = col === 0 || col === GRID_COLS - 1 || row === 0 || row === GRID_ROWS - 1

        if (avgStdev > STDDEV_THRESHOLD && isEdge) {
          detected.push({
            left, top, width, height,
            stdev: avgStdev,
            severity: Math.min(1, (avgStdev - STDDEV_THRESHOLD) / 60),
          })
        }
      } catch {
        continue
      }
    }
  }

  return detected
}

async function detectCorners(buffer) {
  const meta = await sharp(buffer).metadata()
  const w = meta.width || 1200
  const h = meta.height || 630
  const sampleSize = Math.round(Math.min(w, h) * CORNER_FRACTION)

  const corners = [
    { name: "top-left", left: 0, top: 0 },
    { name: "top-right", left: w - sampleSize, top: 0 },
    { name: "bottom-left", left: 0, top: h - sampleSize },
    { name: "bottom-right", left: w - sampleSize, top: h - sampleSize },
  ]

  const detected = []

  for (const corner of corners) {
    try {
      if (corner.left < 0 || corner.top < 0) continue
      const region = await sharp(buffer)
        .extract({ left: corner.left, top: corner.top, width: sampleSize, height: sampleSize })
        .stats()

      const channels = region.channels.filter((c) => c.mean > 5)
      const avgStdev = channels.reduce((s, c) => s + c.stdev, 0) / (channels.length || 1)

      if (avgStdev > STDDEV_THRESHOLD) {
        detected.push({
          left: corner.left,
          top: corner.top,
          width: sampleSize,
          height: sampleSize,
          stdev: avgStdev,
          severity: Math.min(1, (avgStdev - STDDEV_THRESHOLD) / 60),
        })
      }
    } catch {
      continue
    }
  }

  return detected
}

async function inpaintRegions(buffer, regions) {
  if (regions.length === 0) return buffer

  const meta = await sharp(buffer).metadata()
  const w = meta.width || 1200
  const h = meta.height || 630

  const blurred = await sharp(buffer)
    .median(MEDIAN_RADIUS)
    .blur(BLUR_RADIUS)
    .toBuffer()

  const composites = []

  const merged = mergeOverlapping(regions)

  for (const region of merged) {
    const pad = Math.round(Math.min(w, h) * PAD_FRACTION)
    const left = Math.max(0, region.left - pad)
    const top = Math.max(0, region.top - pad)
    const width = Math.min(w - left, region.width + pad * 2)
    const height = Math.min(h - top, region.height + pad * 2)

    composites.push({
      input: await sharp(blurred)
        .extract({ left, top, width, height })
        .toBuffer(),
      top,
      left,
      blend: "over",
      opacity: Math.min(1, 0.6 + region.severity * 0.35),
    })
  }

  if (composites.length > 0) {
    return await sharp(buffer).composite(composites).toBuffer()
  }

  return buffer
}

function mergeOverlapping(regions) {
  if (regions.length <= 1) return regions

  const sorted = [...regions].sort((a, b) => a.left - b.left || a.top - b.top)
  const merged = [sorted[0]]

  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1]
    const curr = sorted[i]
    const overlapX = Math.max(0, Math.min(last.left + last.width, curr.left + curr.width) - Math.max(last.left, curr.left))
    const overlapY = Math.max(0, Math.min(last.top + last.height, curr.top + curr.height) - Math.max(last.top, curr.top))

    if (overlapX > 0 && overlapY > 0) {
      last.left = Math.min(last.left, curr.left)
      last.top = Math.min(last.top, curr.top)
      last.width = Math.max(last.left + last.width, curr.left + curr.width) - last.left
      last.height = Math.max(last.top + last.height, curr.top + curr.height) - last.top
      last.stdev = Math.max(last.stdev, curr.stdev)
      last.severity = Math.max(last.severity, curr.severity)
    } else {
      merged.push(curr)
    }
  }

  return merged
}

async function softenOverlay(buffer) {
  const meta = await sharp(buffer).metadata()
  const w = meta.width || 1200
  const h = meta.height || 630

  const lightBlur = await sharp(buffer)
    .median(1)
    .blur(1.5)
    .toBuffer()

  const centerLeft = Math.round(w * 0.15)
  const centerTop = Math.round(h * 0.15)
  const centerWidth = Math.round(w * 0.7)
  const centerHeight = Math.round(h * 0.7)

  return await sharp(buffer)
    .composite([{
      input: await sharp(lightBlur)
        .extract({ left: centerLeft, top: centerTop, width: centerWidth, height: centerHeight })
        .toBuffer(),
      top: centerTop,
      left: centerLeft,
      blend: "over",
      opacity: 0.15,
    }])
    .toBuffer()
}

async function cleanImage(buffer) {
  console.log("  Cleaning image (removing source watermarks)...")

  const corners = await detectCorners(buffer)
  const grid = await detectRegions(buffer)
  const allRegions = [...corners, ...grid]

  if (allRegions.length > 0) {
    const unique = allRegions.filter(
      (r, i) => i === allRegions.findIndex(
        (o) => Math.abs(o.left - r.left) < 20 && Math.abs(o.top - r.top) < 20
      )
    )
    console.log(`    Detected ${unique.length} watermark region(s)`)
    let cleaned = await inpaintRegions(buffer, unique)
    cleaned = await softenOverlay(cleaned)
    return cleaned
  }

  console.log("    No watermark regions detected, applying preventive softening")
  return await softenOverlay(buffer)
}

module.exports = { cleanImage, detectRegions, detectCorners, inpaintRegions }
