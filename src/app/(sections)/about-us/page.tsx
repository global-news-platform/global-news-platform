import type { Metadata } from "next"

import { Container } from "@/components/common/container"
import { generateMetadata } from "@/lib/seo"
import { siteConfig } from "@/lib/constants"

export const metadata: Metadata = generateMetadata({
  title: "About Us — Our Mission, Aggregation Model & Editorial Standards",
  description:
    "Learn about The Global Lens 365 — our news aggregation model, source attribution, fair use principles, and commitment to reliable journalism.",
  path: "/about-us",
})

export default function AboutPage() {
  return (
    <div className="py-8 md:py-12">
      <Container size="sm">
        <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
          About {siteConfig.name}
        </h1>
        <div className="mt-2 h-1 w-16 bg-foreground" />

        <div className="mt-8 space-y-8 text-base leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-headline text-xl font-semibold">Our Mission</h2>
            <p className="mt-3">
              {siteConfig.name} is a comprehensive news aggregation platform that brings the latest
              news from Pakistan and around the world in one place. We compile news summaries and
              excerpts from various Pakistani and international news sources to help readers stay
              informed. Our goal is to provide users access to diverse perspectives on a single
              platform.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">News Aggregation Model</h2>
            <p className="mt-3">
              {siteConfig.name} is a pure news aggregator. We do not republish full news articles.
              Instead:
            </p>
            <ul className="mt-4 space-y-3">
              {[
                {
                  title: "Brief Summaries",
                  desc: "We present short summaries (typically 30–50 words) of original articles in our own words.",
                },
                {
                  title: "Source Attribution",
                  desc: "Every news item includes the original publisher's name and a direct link so readers can read the full article.",
                },
                {
                  title: "Fair Use",
                  desc: "We operate under fair use principles as recognized by copyright law. Our summaries are not substitutes for original articles but guide readers to them.",
                },
              ].map((item) => (
                <li key={item.title} className="border-l-[3px] border-border pl-4">
                  <strong className="font-semibold">{item.title}:</strong> {item.desc}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">Our Sources</h2>
            <p className="mt-3">
              We aggregate news from leading news organizations in Pakistan and around the world,
              including Dawn, Express Tribune, The News International, Geo News, BBC, Al Jazeera,
              CNN, The Guardian, Reuters, and others. All copyrights are held by their respective
              original publishers.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">Editorial Standards</h2>
            <p className="mt-3">
              Every article published by {siteConfig.name} goes through a rigorous editorial process:
            </p>
            <ul className="mt-4 space-y-3">
              {[
                {
                  title: "Accuracy First",
                  desc: "All facts are verified from multiple sources before publication. Corrections are issued promptly and transparently.",
                },
                {
                  title: "Independence",
                  desc: "We maintain strict editorial independence from political, corporate, or ideological influence. Our reporting serves the public interest.",
                },
                {
                  title: "Fairness and Context",
                  desc: "Stories are presented with their full context, representing diverse viewpoints without distortion or sensationalism.",
                },
                {
                  title: "Accountability",
                  desc: "We hold ourselves to the same standard of transparency we demand of those we cover. Our corrections policy is publicly documented.",
                },
              ].map((item) => (
                <li key={item.title} className="border-l-[3px] border-border pl-4">
                  <strong className="font-semibold">{item.title}:</strong> {item.desc}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">Legal Compliance</h2>
            <p className="mt-3">
              We fully comply with the Digital Millennium Copyright Act (DMCA) and applicable
              copyright laws. Learn more about our{" "}
              <a href="/copyright-policy" className="underline decoration-foreground/20 underline-offset-2 transition-colors hover:decoration-foreground/60">
                Copyright Policy
              </a>
              ,{" "}
              <a href="/attribution-policy" className="underline decoration-foreground/20 underline-offset-2 transition-colors hover:decoration-foreground/60">
                Attribution Policy
              </a>
              , and{" "}
              <a href="/terms-of-service" className="underline decoration-foreground/20 underline-offset-2 transition-colors hover:decoration-foreground/60">
                Terms of Service
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">Contact Us</h2>
            <p className="mt-3">
              Have a tip, feedback, or inquiry? Reach out to our team at{" "}
              <a
                href={`mailto:contact@${new URL(siteConfig.url).hostname}`}
                className="underline decoration-foreground/20 underline-offset-2 transition-colors hover:decoration-foreground/60"
              >
                contact@{new URL(siteConfig.url).hostname}
              </a>
              .
            </p>
          </section>
        </div>
      </Container>
    </div>
  )
}
