import type { Metadata } from "next"

import { Container } from "@/components/common/container"
import { generateMetadata } from "@/lib/seo"
import { siteConfig } from "@/lib/constants"

export const metadata: Metadata = generateMetadata({
  title: "Terms of Service — Terms & Conditions",
  description:
    "The Global Lens 365 terms of service — rules, responsibilities, and user rights for using our website.",
  path: "/terms-of-service",
})

export default function TermsOfServicePage() {
  return (
    <div className="py-8 md:py-12">
      <Container size="sm">
        <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
          Terms of Service
        </h1>
        <div className="mt-2 h-1 w-16 bg-foreground" />
        <div className="mt-8 space-y-8 text-base leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-headline text-xl font-semibold">Introduction</h2>
            <p className="mt-3">
              Welcome to {siteConfig.name} (&quot;we,&quot; &quot;our,&quot; &quot;us&quot;). These
              Terms of Service (&quot;Terms&quot;) govern your use of{" "}
              {siteConfig.url}. By accessing our site, you agree to these Terms.
              If you do not agree with these Terms, please do not use the site.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">News Aggregation Model</h2>
            <p className="mt-3">
              {siteConfig.name} is a news aggregator. We publish summaries and excerpts from
              various Pakistani and international news sources (including Dawn, Express Tribune,
              The News International, BBC, Al Jazeera, and others). We do not republish full
              original articles. Every summary includes a link to the original source and proper
              attribution. All copyrights are held by the respective original publishers.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">Acceptable Use</h2>
            <p className="mt-3">
              You agree to use this site only for lawful purposes and in compliance with these
              Terms. You agree that:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>You will not use the site&apos;s content for any unlawful purpose</li>
              <li>You will not attempt to disrupt the site&apos;s operation</li>
              <li>You will not collect data from the site via automated systems (bots)</li>
              <li>You will not remove or alter our attribution links</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">Intellectual Property Rights</h2>
            <p className="mt-3">
              The news summaries and selections published on {siteConfig.name} are our own
              original work and are protected by copyright law. However, the news articles we
              summarize are copyrighted by their respective original publishers. We present news
              summaries and excerpts under fair use principles.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">Disclaimer of Liability</h2>
            <p className="mt-3">
              This website is provided &quot;as is.&quot; We make no guarantees regarding the
              accuracy, completeness, or timeliness of the information. We will not be liable
              for any loss or damage arising from the use of this site. Always verify
              information from original sources.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">Changes</h2>
            <p className="mt-3">
              We reserve the right to modify these Terms at any time. Continuing to use the
              site after changes are posted constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">Contact</h2>
            <p className="mt-3">
              For questions about these Terms, please contact us at{" "}
              <a
                href={`mailto:contact@${new URL(siteConfig.url).hostname}`}
                className="underline decoration-foreground/20 underline-offset-2 transition-colors hover:decoration-foreground/60"
              >contact@{new URL(siteConfig.url).hostname}</a>.
            </p>
          </section>

          <p className="pt-4 text-sm text-foreground/60">
            Last updated: June 1, 2026
          </p>
        </div>
      </Container>
    </div>
  )
}
