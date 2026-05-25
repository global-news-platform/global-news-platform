import type { NextConfig } from "next"
import createMDX from "@next/mdx"

const nextConfig: NextConfig = {
  output: process.env.VERCEL === "1" ? "export" : undefined,
  images: {
    unoptimized: false,
    formats: ["image/webp", "image/avif"],
    deviceSizes: [480, 640, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: false,
    minimumCacheTTL: 86400,
  },
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  eslint: { ignoreDuringBuilds: true },
  devIndicators: false,
  compress: true,
  generateEtags: true,
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [["remark-gfm", { singleTilde: false }]],
    rehypePlugins: [
      ["rehype-slug", {}],
      ["rehype-autolink-headings", { behavior: "wrap" }],
    ],
  },
})

export default withMDX(nextConfig)
