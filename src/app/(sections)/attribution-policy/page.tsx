import type { Metadata } from "next"

import { Container } from "@/components/common/container"
import { generateMetadata } from "@/lib/seo"
import { siteConfig } from "@/lib/constants"

export const metadata: Metadata = generateMetadata({
  title: "Attribution Policy — Crediting News Sources",
  description:
    "The Global Lens 365 attribution policy — how we credit and link to original news sources.",
  path: "/attribution-policy",
})

export default function AttributionPolicyPage() {
  return (
    <div className="py-8 md:py-12">
      <Container size="sm">
        <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
          Attribution Policy
        </h1>
        <div className="mt-2 h-1 w-16 bg-foreground" />
        <div className="mt-8 space-y-8 text-base leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-headline text-xl font-semibold">Our Commitment</h2>
            <p className="mt-3">
              At {siteConfig.name}, we respect journalistic ethics and intellectual property
              rights. We believe news aggregation is meaningful only when original sources are
              properly credited. This policy explains how we attribute sources in our content.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">Sources We Use</h2>
            <p className="mt-3">
              We aggregate news from the following types of sources:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <strong>Pakistani news outlets:</strong> Dawn, Express Tribune,
                The News International, Geo News, Samaa TV,
                ARY News, 92 News, and others
              </li>
              <li>
                <strong>International news outlets:</strong> BBC, Al Jazeera,
                CNN, The Guardian, Reuters, AFP,
                and others
              </li>
              <li>
                <strong>Specialized sources:</strong> Government press releases, research reports,
                and other reputable sources
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">Attribution Principles</h2>
            <p className="mt-3">
              We follow these principles for attribution:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <strong>Clear naming:</strong> Each news summary displays the original
                publisher&apos;s name prominently (e.g., &ldquo;Source: Dawn&rdquo;)
              </li>
              <li>
                <strong>Direct link:</strong> Every summary includes a direct link to the
                original article so readers can read the full piece
              </li>
              <li>
                <strong>Date:</strong> The original publication date is recorded
              </li>
              <li>
                <strong>Author:</strong> Where possible, the original author&apos;s name is included
              </li>
              <li>
                <strong>Prominent placement:</strong> Attribution is positioned so readers can
                easily see where the information originated
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">Summaries and Excerpts</h2>
            <p className="mt-3">
              We use only brief summaries (typically 30–50 words) or excerpts from original
              articles. We present the key points of the original article in our own words and
              never republish an article in full. Where any sentence is quoted directly, it is
              placed in quotation marks with proper attribution.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">Fair Use and Attribution</h2>
            <p className="mt-3">
              Our attribution practices align with fair use principles:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>We transform the original work by presenting it as a summary</li>
              <li>Our use is non-commercial and informational</li>
              <li>We use only the portion necessary to summarize the news</li>
              <li>Our site drives additional traffic to original publishers</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">If You Have an Attribution Concern</h2>
            <p className="mt-3">
              If you believe a news item has not been properly attributed or is otherwise
                infringing your rights, please contact us promptly. We are committed to
                verifying the correct information and making any necessary changes immediately.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">Contact</h2>
            <p className="mt-3">
              For attribution-related questions, please contact us at{" "}
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
