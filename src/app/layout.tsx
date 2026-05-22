import type { Metadata, Viewport } from "next"
import { Noto_Nastaliq_Urdu, Noto_Sans_Arabic } from "next/font/google"
import { ThemeProvider } from "@/components/common/theme-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { BackToTop } from "@/components/common/back-to-top"
import { siteConfig } from "@/lib/constants"
import "./globals.css"

const notoNastaliq = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-noto-nastaliq",
  preload: true,
  weight: ["400", "600", "700"],
  fallback: ["system-ui", "sans-serif"],
})

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-noto-arabic",
  preload: true,
  weight: ["400", "500", "600", "700"],
  fallback: ["sans-serif"],
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  generator: "Pakistan News Platform",
  applicationName: siteConfig.name,
  referrer: "origin-when-cross-origin",
  keywords: [
    "پاکستان", "خبریں", "اردو خبریں", "پاکستان نیوز",
    "breaking news", "pakistan news", "urdu news",
    "world news", "pakistan headlines",
  ],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: { telephone: false, address: false },
  alternates: { canonical: siteConfig.url },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
    images: [
      {
        url: `${siteConfig.url}${siteConfig.ogImage}`,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [`${siteConfig.url}${siteConfig.ogImage}`],
    site: "@pakistannews",
    creator: "@pakistannews",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: siteConfig.verification.google,
  },
  appleWebApp: {
    capable: true,
    title: siteConfig.name,
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/manifest.json",
  category: "news",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const fontVariables = `${notoNastaliq.variable} ${notoArabic.variable}`

  return (
    <html lang="ur" dir="rtl" suppressHydrationWarning className={fontVariables}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('pakistan-news-theme') || 'system';
                  var root = document.documentElement;
                  root.classList.remove('light', 'dark');
                  if (theme === 'system') {
                    root.classList.add(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  } else {
                    root.classList.add(theme);
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${siteConfig.name} — آر ایس ایس فیڈ`}
          href="/feed.xml"
        />
      </head>
      <body className="bg-background font-urdu antialiased">
        <ThemeProvider defaultTheme="system" storageKey="pakistan-news-theme">
          <div className="relative flex min-h-dvh flex-col">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-foreground focus:px-4 focus:py-2 focus:text-background focus:outline-none"
            >
              مواد پر جائیں
            </a>
            <Header />
            <main id="main-content">
              {children}
            </main>
            <Footer />
            <BackToTop />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
