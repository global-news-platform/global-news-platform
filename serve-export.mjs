import http from "http"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, "out")
const PORT = process.env.PORT || 3000

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".xml": "application/xml",
  ".txt": "text/plain",
}

const server = http.createServer((req, res) => {
  const filePath = path.join(outDir, req.url === "/" ? "index.html" : req.url)
  const ext = path.extname(filePath)
  const contentType = MIME[ext] || "application/octet-stream"

  fs.readFile(filePath, (err, data) => {
    if (err) {
      const notFound = path.join(outDir, "404.html")
      fs.readFile(notFound, (err2, data2) => {
        if (err2) {
          res.writeHead(404, { "Content-Type": "text/plain" })
          res.end("Not Found")
          return
        }
        res.writeHead(404, { "Content-Type": "text/html" })
        res.end(data2)
      })
      return
    }
    res.writeHead(200, { "Content-Type": contentType })
    res.end(data)
  })
})

server.listen(PORT, () => {
  console.log(`Global News static server running at http://localhost:${PORT}`)
  console.log(`Serving from: ${outDir}`)
})
