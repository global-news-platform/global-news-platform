import Link from "next/link"

import { Container } from "@/components/common/container"
import { navigation, siteConfig } from "@/lib/constants"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-12 border-t border-border bg-secondary/80 sm:mt-16">
      <Container className="py-10 sm:py-12 md:py-16">
        <div className="grid gap-8 sm:gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="font-headline text-lg font-bold tracking-tight sm:text-xl"
            >
              <span className="text-news-red">G</span>lobal{" "}
              <span className="text-news-red">N</span>ews
            </Link>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:mt-3">
              {siteConfig.description}
            </p>
          </div>

          {/* Sections */}
          <div>
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground sm:mb-4">
              Sections
            </h3>
            <ul className="space-y-2 sm:space-y-2.5">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More */}
          <div>
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground sm:mb-4">
              More
            </h3>
            <ul className="space-y-2 sm:space-y-2.5">
              {["About Us", "Contact", "Careers", "Privacy Policy", "Terms of Service"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Follow */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground sm:mb-4">
              Follow Us
            </h3>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 sm:flex-col sm:gap-y-2.5">
              {[
                { name: "Twitter / X", href: siteConfig.links.twitter },
                { name: "Facebook", href: siteConfig.links.facebook },
                { name: "LinkedIn", href: siteConfig.links.linkedin },
                { name: "Instagram", href: siteConfig.links.instagram },
                { name: "RSS Feed", href: siteConfig.links.rss },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      {/* Footer bottom */}
      <div className="border-t border-border">
        <Container>
          <div className="flex flex-col items-center justify-between gap-2 py-4 text-xs text-muted-foreground sm:flex-row sm:gap-3 sm:py-5">
            <p>
              &copy; {currentYear} Global News. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/privacy-policy" className="transition-colors hover:text-foreground">
                Privacy
              </Link>
              <span className="h-3 w-px bg-border" />
              <Link href="/terms-of-service" className="transition-colors hover:text-foreground">
                Terms
              </Link>
              <span className="h-3 w-px bg-border" />
              <Link href="/accessibility" className="transition-colors hover:text-foreground">
                Accessibility
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  )
}
