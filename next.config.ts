import type { NextConfig } from "next"
import createMDX from "@next/mdx"

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
      { protocol: "https", hostname: "pixabay.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  webpack: (config, { isServer }) => {
    if (process.env.NODE_ENV === "development") {
      config.watchOptions = {
        ignored: [
          "**/node_modules/**",
          "**/.next/**",
          "**/out/**",
          "**/logs/**",
          "**/content/**",
          "**/*.tsbuildinfo",
        ],
        aggregateTimeout: 600,
        poll: false,
      }
    }
    return config
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  devIndicators: false,
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
