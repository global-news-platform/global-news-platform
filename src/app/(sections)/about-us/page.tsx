import type { Metadata } from "next"

import { Container } from "@/components/common/container"
import { generateMetadata } from "@/lib/seo"
import { siteConfig } from "@/lib/constants"

export const metadata: Metadata = generateMetadata({
  title: "About Us — Our Mission & Editorial Standards",
  description:
    "Learn about Global News — our mission, editorial standards, and commitment to independent, trustworthy journalism that informs and empowers readers worldwide.",
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
              {siteConfig.name} delivers comprehensive, independent coverage of the events
              that shape our world. We believe that quality journalism is essential to
              informed societies and democratic discourse. Our newsroom brings together
              experienced correspondents, data journalists, and analysts who are committed
              to factual, nuanced reporting.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">Editorial Standards</h2>
            <p className="mt-3">
              Every article published by {siteConfig.name} follows a strict editorial process:
            </p>
            <ul className="mt-4 space-y-3">
              {[
                {
                  title: "Accuracy First",
                  desc: "All facts are verified against multiple sources before publication. Corrections are issued promptly and transparently.",
                },
                {
                  title: "Independence",
                  desc: "We maintain strict editorial independence from political, corporate, or ideological influence. Our reporting serves the public interest.",
                },
                {
                  title: "Fairness & Context",
                  desc: "Stories are presented with their full context, representing diverse perspectives without distortion or sensationalism.",
                },
                {
                  title: "Accountability",
                  desc: "We hold ourselves to the same standards of transparency we demand from those we cover. Our corrections policy is publicly documented.",
                },
              ].map((item) => (
                <li key={item.title} className="border-l-[3px] border-border pl-4">
                  <strong className="font-semibold">{item.title}:</strong> {item.desc}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">Our Coverage</h2>
            <p className="mt-3">
              From breaking news and global affairs to technology, science, business, culture,
              and climate — our reporting spans every major beat. We combine traditional
              journalistic rigor with modern digital storytelling to bring you news that is
              both authoritative and accessible.
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
