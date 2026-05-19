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

function decodePath(rawUrl) {
  const qIdx = rawUrl.indexOf("?")
  const pathname = qIdx === -1 ? rawUrl : rawUrl.slice(0, qIdx)
  try {
    return decodeURIComponent(pathname)
  } catch {
    return pathname
  }
}

const handler = (req, res) => {
  const decoded = decodePath(req.url)
  let filePath = path.join(outDir, decoded === "/" ? "index.html" : decoded)
  let ext = path.extname(filePath)
  let contentType = MIME[ext] || "application/octet-stream"

  tryRead(filePath, ext, contentType)

  function tryRead(fp, ext, contentType) {
    fs.readFile(fp, (err, data) => {
      if (err) {
        if (fp === filePath && !ext) {
          const withHtml = fp + ".html"
          tryRead(withHtml, ".html", MIME[".html"])
          return
        }
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
  }
}

const startServer = (port) => {
  const srv = http.createServer(handler)
  srv.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${port} in use, trying ${port + 1}...`)
      startServer(port + 1)
    } else {
      throw err
    }
  })
  srv.listen(port, () => {
    console.log(`Global News static server running at http://localhost:${port}`)
    console.log(`Serving from: ${outDir}`)
  })
}

startServer(PORT)
