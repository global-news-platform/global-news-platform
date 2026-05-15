import Link from "next/link"
import { Globe, Rss, Twitter, Facebook, Linkedin, Mail } from "lucide-react"
import { siteConfig, navigation, categories } from "@/lib/constants"
import { Container } from "@/components/common/container"

export function Footer() {
  const currentYear = new Date().getFullYear()
  const footerCategories = categories.filter((c) =>
    ["world", "politics", "business", "technology", "science", "culture", "sports", "opinion"].includes(c.slug),
  )

  return (
    <footer className="border-t border-border bg-secondary/30">
      <Container className="py-12 md:py-16">
        {/* Newsletter */}
        <div className="mb-12 rounded-lg border border-border bg-background p-6 md:mb-16 md:p-8">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="font-headline text-xl font-bold md:text-2xl">
              Stay Informed
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Get the day&apos;s most important news delivered to your inbox every morning.
            </p>
            <form
              className="mt-5 flex max-w-md mx-auto gap-2"
              action="#"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
              <button
                type="submit"
                className="rounded bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-foreground">
                <Globe className="h-4 w-4 text-background" />
              </div>
              <span className="text-sm font-bold">{siteConfig.name}</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href={siteConfig.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href={siteConfig.links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={siteConfig.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href={siteConfig.links.rss}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="RSS Feed"
              >
                <Rss className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Sections */}
          <div>
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Sections
            </h4>
            <ul className="space-y-2">
              {footerCategories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/breaking"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Breaking News
                </Link>
              </li>
              {["world", "technology", "business"].map((slug) => {
                const cat = categories.find((c) => c.slug === slug)
                return (
                  <li key={slug}>
                    <Link
                      href={`/category/${slug}`}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {cat?.name || slug}
                    </Link>
                  </li>
                )
              })}
              <li>
                <Link
                  href="/about-us"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Contact
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href={`mailto:contact@${siteConfig.url.replace("https://", "")}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="h-3.5 w-3.5" />
                  contact@{siteConfig.url.replace("https://", "")}
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.links.rss}
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Rss className="h-3.5 w-3.5" />
                  RSS Feed
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Container>

      {/* Bottom */}
      <div className="border-t border-border">
        <Container className="flex flex-col items-center justify-between gap-2 py-5 md:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">
              Trusted news from around the world
            </span>
          </div>
        </Container>
      </div>
    </footer>
  )
}
