import type { Metadata } from "next"

import { Container } from "@/components/common/container"
import { generateMetadata } from "@/lib/seo"
import { siteConfig } from "@/lib/constants"

export const metadata: Metadata = generateMetadata({
  title: "Copyright Policy — Fair Use and Attribution",
  description:
    "The Global Lens 365 copyright policy — information about fair use, DMCA compliance, and news source attribution.",
  path: "/copyright-policy",
})

export default function CopyrightPolicyPage() {
  return (
    <div className="py-8 md:py-12">
      <Container size="sm">
        <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
          Copyright Policy
        </h1>
        <div className="mt-2 h-1 w-16 bg-foreground" />
        <div className="mt-8 space-y-8 text-base leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-headline text-xl font-semibold">Our News Aggregation Model</h2>
            <p className="mt-3">
              {siteConfig.name} is a news aggregation platform that presents news summaries and
              short excerpts from various Pakistani and international news sources. We do not
              republish full original articles. Instead, we provide a brief summary (typically 2–3
              sentences) and direct readers to the original source for the full article.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">Fair Use</h2>
            <p className="mt-3">
              {siteConfig.name} operates under fair use principles as recognized by copyright law.
              Our content meets the following criteria:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <strong>Purpose and character:</strong> Our use is educational, informational,
                and news-oriented, not commercial. We transform the original material by presenting
                it as a summary.
              </li>
              <li>
                <strong>Nature of the original work:</strong> We summarize only published news
                articles, which are themselves factual and informational in nature.
              </li>
              <li>
                <strong>Amount used:</strong> We use only a small portion of the original article
                (a summary or excerpt), not the full article.
              </li>
              <li>
                <strong>Market impact:</strong> Our summaries are not substitutes for original
                articles; they direct readers to the original source, driving traffic and revenue
                to the original publishers.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">Attribution</h2>
            <p className="mt-3">
              We provide the original source name and a direct link with every news summary. We
              follow these attribution principles:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>The original publisher&apos;s name is displayed prominently</li>
              <li>A direct link to the original article is provided</li>
              <li>The publication date is recorded</li>
              <li>The author&apos;s name is included when available</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">Copyright Ownership</h2>
            <p className="mt-3">
              The news summaries and original written content published on {siteConfig.name} are
              our intellectual property. However, the copyrights of the original news articles
              that we summarize are held by their respective original publishers. We respect
              their rights and use content only within the bounds of fair use.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">DMCA Compliance</h2>
            <p className="mt-3">
              We comply with the Digital Millennium Copyright Act (DMCA). If you believe that
              any content on our site infringes your copyright, please send us a DMCA notice.
              We will respond promptly to valid notices and remove infringing material. Please
              visit our{" "}
              <a
                href="/dmca"
                className="underline decoration-foreground/20 underline-offset-2 transition-colors hover:decoration-foreground/60"
              >
                DMCA Notice
              </a>{" "}
              page.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">Contact</h2>
            <p className="mt-3">
              For copyright-related questions or concerns, please contact us at{" "}
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
