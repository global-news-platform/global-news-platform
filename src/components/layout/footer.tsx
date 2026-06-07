import Link from "next/link"
import { Mail, FileText, Shield, Copyright } from "lucide-react"
import { SocialIcons } from "@/components/layout/social-icons"
import { SiteLogo } from "@/components/common/site-logo"
import { siteConfig, categories, legalLinks } from "@/lib/constants"

const footerCategories = categories.slice(0, 12)

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-8 border-t border-border/40 bg-foreground text-background">
      {/* Fair use notice bar */}
      <div className="border-b border-background/10 bg-background/5">
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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-5 lg:px-6 xl:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <SiteLogo className="h-9 w-9" iconSize={4} textSize="text-lg font-bold text-background" />
            </Link>
            <p className="mt-2 text-sm leading-[1.8] text-background/60">
              {siteConfig.description}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <SocialIcons variant="footer" />
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-background/50">
              Categories
            </h4>
            <ul className="space-y-1.5">
              {footerCategories.slice(0, 6).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-sm text-background/70 transition-colors hover:text-background"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More sections */}
          <div>
            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-background/50">
              More
            </h4>
            <ul className="space-y-1.5">
              {footerCategories.slice(6, 12).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-sm text-background/70 transition-colors hover:text-background"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Quick links */}
          <div>
            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-background/50">
              Legal
            </h4>
            <ul className="space-y-1.5">
              {legalLinks.slice(0, 4).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-background/70 transition-colors hover:text-background"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="mb-3 mt-4 text-[11px] font-bold uppercase tracking-[0.15em] text-background/50">
              Contact
            </h4>
            <ul className="space-y-1.5">
              <li>
                <a
                  href={`mailto:contact@the-global-lens-365.vercel.app`}
                  className="flex items-center gap-2 text-sm text-background/70 transition-colors hover:text-background"
                >
                  <Mail className="h-3.5 w-3.5" />
                  contact@the-global-lens-365.vercel.app
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 sm:flex-row sm:px-5 lg:px-6 xl:px-8">
          <p className="text-[11px] text-background/50">
            &copy; {currentYear} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/attribution-policy" className="text-[11px] text-background/50 hover:text-background/80 transition-colors">
              Attribution
            </Link>
            <span className="text-background/20">|</span>
            <Link href="/terms-of-service" className="text-[11px] text-background/50 hover:text-background/80 transition-colors">
              Terms
            </Link>
            <span className="text-background/20">|</span>
            <Link href="/privacy-policy" className="text-[11px] text-background/50 hover:text-background/80 transition-colors">
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
