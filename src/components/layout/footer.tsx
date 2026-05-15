import Link from "next/link"

import { Container } from "@/components/common/container"
import { navigation, siteConfig } from "@/lib/constants"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t border-border bg-secondary">
      {/* Footer top */}
      <Container className="py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="font-headline text-xl font-bold tracking-tight"
            >
              Global News
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>

          {/* Sections */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest">
              Sections
            </h3>
            <ul className="space-y-2">
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

          {/* Categories */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest">
              More
            </h3>
            <ul className="space-y-2">
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
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest">
              Follow Us
            </h3>
            <ul className="space-y-2">
              {[
                { name: "Twitter", href: siteConfig.links.twitter },
                { name: "Facebook", href: siteConfig.links.facebook },
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
          <div className="flex flex-col items-center justify-between gap-2 py-4 text-xs text-muted-foreground sm:flex-row">
            <p>
              &copy; {currentYear} Global News. All rights reserved.
            </p>
            <p>
              Independent journalism for an informed world.
            </p>
          </div>
        </Container>
      </div>
    </footer>
  )
}
