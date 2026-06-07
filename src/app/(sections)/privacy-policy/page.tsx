import type { Metadata } from "next"
import { Container } from "@/components/common/container"
import { generateMetadata } from "@/lib/seo"
import { siteConfig, legalLinks } from "@/lib/constants"
import Link from "next/link"

export const metadata: Metadata = generateMetadata({
  title: "Privacy Policy — How We Handle Your Data",
  description: `${siteConfig.name} privacy policy — how we collect, use, and protect your information.`,
  path: "/privacy-policy",
})

export default function PrivacyPolicyPage() {
  return (
    <div className="py-8 md:py-12">
      <Container size="sm">
        <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
          Privacy Policy
        </h1>
        <div className="mt-2 h-1 w-16 bg-foreground" />
        <div className="mt-8 space-y-8 text-base leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-headline text-xl font-semibold">Introduction</h2>
            <p className="mt-3">
              {siteConfig.name} respects your privacy. This policy explains how we collect, use,
              and protect your personal information when you use our website. Our website is a news
              aggregation platform that presents news summaries from various sources.
            </p>
          </section>
          <section>
            <h2 className="font-headline text-xl font-semibold">What Information We Collect</h2>
            <p className="mt-3">
              We may collect the following minimal information:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Browser information and cookies</li>
              <li>IP address and general location data</li>
              <li>Page visits and viewing time</li>
              <li>Search queries</li>
              <li>Theme preferences (stored locally)</li>
            </ul>
          </section>
          <section>
            <h2 className="font-headline text-xl font-semibold">News Sources and Third-Party Content</h2>
            <p className="mt-3">
              Our website presents news summaries sourced from various news organizations.
              This content is for informational purposes only. We clearly credit the original
              news sources and provide links to their full articles.
            </p>
            <p className="mt-3">
              When you click an external link, you leave our site and enter a third-party website
              that may have its own privacy policy. We are not responsible for the content or
              practices of third-party sites.
            </p>
          </section>
          <section>
            <h2 className="font-headline text-xl font-semibold">How We Use Information</h2>
            <p className="mt-3">
              Collected information is used to improve the website, personalize content, and
              enhance the user experience. We do not sell or rent your information to third parties.
            </p>
          </section>
          <section>
            <h2 className="font-headline text-xl font-semibold">Your Rights</h2>
            <p className="mt-3">
              You have the right to access, correct, or delete your personal information.
              If you would like your data removed, please contact us.
            </p>
          </section>
          <section>
            <h2 className="font-headline text-xl font-semibold">Legal Information</h2>
            <p className="mt-3">
              For more information about our platform policies, please visit the following pages:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="underline decoration-foreground/20 underline-offset-2 transition-colors hover:decoration-foreground/60"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="font-headline text-xl font-semibold">Contact</h2>
            <p className="mt-3">
              If you have any questions about this policy, please contact us at{" "}
              <a href={`mailto:contact@${new URL(siteConfig.url).hostname}`}
                className="underline decoration-foreground/20 underline-offset-2 transition-colors hover:decoration-foreground/60"
              >contact@{new URL(siteConfig.url).hostname}</a>.
            </p>
          </section>
        </div>
      </Container>
    </div>
  )
}
