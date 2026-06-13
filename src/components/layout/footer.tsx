import Link from "next/link"
import { Mail, Copyright, ArrowUpRight } from "lucide-react"
import { SocialIcons } from "@/components/layout/social-icons"
import { SiteLogo } from "@/components/common/site-logo"
import { siteConfig, categories, legalLinks } from "@/lib/constants"

const footerCategories = categories.slice(0, 12)

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-12 border-t border-border/40 bg-gradient-to-b from-foreground to-foreground/95 text-background">
      {/* Fair use notice bar */}
      <div className="border-b border-background/10 bg-gradient-to-r from-accent/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-5 lg:px-6 xl:px-8">
          <div className="flex items-start gap-2 text-[11px] text-background/60 leading-[1.8]">
            <Copyright className="mt-0.5 h-3 w-3 shrink-0" />
            <p>
              {siteConfig.fairUseNotice}
            </p>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-5 lg:px-6 xl:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <SiteLogo className="h-9 w-9" iconSize={4} textSize="text-lg font-bold text-background" />
            </Link>
            <p className="mt-3 text-sm leading-[1.8] text-background/60 max-w-xs">
              {siteConfig.description}
            </p>
            <div className="mt-5 flex items-center gap-2">
              <SocialIcons variant="footer" />
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-accent/70">
              Categories
            </h4>
            <ul className="space-y-2">
              {footerCategories.slice(0, 6).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="group inline-flex items-center gap-1 text-sm text-background/70 transition-all duration-200 hover:text-background"
                  >
                    <span>{cat.name}</span>
                    <ArrowUpRight className="h-2.5 w-2.5 opacity-0 -translate-y-1 group-hover:opacity-70 group-hover:translate-y-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More sections */}
          <div>
            <h4 className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-accent/70">
              More
            </h4>
            <ul className="space-y-2">
              {footerCategories.slice(6, 12).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="group inline-flex items-center gap-1 text-sm text-background/70 transition-all duration-200 hover:text-background"
                  >
                    <span>{cat.name}</span>
                    <ArrowUpRight className="h-2.5 w-2.5 opacity-0 -translate-y-1 group-hover:opacity-70 group-hover:translate-y-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Quick links */}
          <div>
            <h4 className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-accent/70">
              Legal
            </h4>
            <ul className="space-y-2">
              {legalLinks.slice(0, 4).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-sm text-background/70 transition-all duration-200 hover:text-background"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="h-2.5 w-2.5 opacity-0 -translate-y-1 group-hover:opacity-70 group-hover:translate-y-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="mb-4 mt-6 text-[11px] font-bold uppercase tracking-[0.15em] text-accent/70">
              Contact
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href={`mailto:contact@thegloballens365.vercel.app`}
                  className="group inline-flex items-center gap-1.5 text-sm text-background/70 transition-all duration-200 hover:text-background"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span>Email us</span>
                  <ArrowUpRight className="h-2.5 w-2.5 opacity-0 -translate-y-1 group-hover:opacity-70 group-hover:translate-y-0 transition-all duration-200" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10 bg-background/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-5 lg:px-6 xl:px-8">
          <p className="text-[11px] text-background/50">
            &copy; {currentYear} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/attribution-policy" className="text-[11px] text-background/50 transition-colors hover:text-background/80">
              Attribution
            </Link>
            <span className="text-background/20">|</span>
            <Link href="/terms-of-service" className="text-[11px] text-background/50 transition-colors hover:text-background/80">
              Terms
            </Link>
            <span className="text-background/20">|</span>
            <Link href="/privacy-policy" className="text-[11px] text-background/50 transition-colors hover:text-background/80">
              Privacy
            </Link>
            <span className="text-background/20">|</span>
            <span className="text-[11px] text-background/50">
              {siteConfig.tagline}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
