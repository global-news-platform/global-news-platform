import type { Metadata } from "next"

import { Container } from "@/components/common/container"
import { generateMetadata } from "@/lib/seo"
import { siteConfig } from "@/lib/constants"

export const metadata: Metadata = generateMetadata({
  title: "DMCA Notice — Report Copyright Infringement",
  description:
    "DMCA notice for The Global Lens 365 — contact us if you believe your copyrighted material is being infringed.",
  path: "/dmca",
})

export default function DmcaPage() {
  return (
    <div className="py-8 md:py-12">
      <Container size="sm">
        <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
          DMCA Notice
        </h1>
        <div className="mt-2 h-1 w-16 bg-foreground" />
        <div className="mt-8 space-y-8 text-base leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-headline text-xl font-semibold">Digital Millennium Copyright Act</h2>
            <p className="mt-3">
              {siteConfig.name} complies with the Digital Millennium Copyright Act (DMCA). If you
              believe that any content on our website infringes your copyright, you may file a
              DMCA notice in accordance with the instructions below. We will respond promptly to
              valid notices.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">How to File a Notice</h2>
            <p className="mt-3">
              To file a DMCA notice, please provide the following information (which must conform
              to copyright law requirements):
            </p>
            <ol className="mt-3 list-decimal space-y-3 pl-6">
              <li>
                <strong>Identification of the copyrighted work:</strong> A description of the
                work(s) you believe are being infringed.
              </li>
              <li>
                <strong>Identification of the infringing material:</strong> The direct URL on{" "}
                {siteConfig.name} of the material you believe is infringing.
              </li>
              <li>
                <strong>Your contact information:</strong> Your name, address, phone number, and
                email address.
              </li>
              <li>
                <strong>Good faith statement:</strong> A statement that you believe in good faith
                that the use of the material is not authorized by the copyright owner, its agent,
                or the law.
              </li>
              <li>
                <strong>Accuracy statement:</strong> A statement that the information in the
                notice is accurate and, under penalty of perjury, that you are the copyright
                owner or authorized to act on the owner&apos;s behalf.
              </li>
              <li>
                <strong>Signature:</strong> Your physical or electronic signature.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">Counter-Notice</h2>
            <p className="mt-3">
              If you believe your material was removed by mistake or misidentification, you may
              file a counter-notice. The counter-notice must include:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Identification of the removed material and where it appeared before removal</li>
              <li>A statement that you believe in good faith the material was removed by mistake or misidentification</li>
              <li>Your name, address, and phone number</li>
              <li>A statement that you consent to the jurisdiction of the federal court in your district</li>
              <li>Your physical or electronic signature</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">Contact Our Designated DMCA Agent</h2>
            <p className="mt-3">
              Please send your DMCA notice or counter-notice to the following address:
            </p>
            <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
              <p className="font-semibold">DMCA Agent — {siteConfig.name}</p>
              <p className="mt-1">
                Email:{" "}
                <a
                  href={`mailto:dmca@${new URL(siteConfig.url).hostname}`}
                  className="underline decoration-foreground/20 underline-offset-2 transition-colors hover:decoration-foreground/60"
                >
                  dmca@{new URL(siteConfig.url).hostname}
                </a>
              </p>
              <p className="mt-1">
                Alternate email:{" "}
                <a
                  href={`mailto:legal@${new URL(siteConfig.url).hostname}`}
                  className="underline decoration-foreground/20 underline-offset-2 transition-colors hover:decoration-foreground/60"
                >
                  legal@{new URL(siteConfig.url).hostname}
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">Notice Processing</h2>
            <p className="mt-3">
              When we receive a complete and valid DMCA notice, we will:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Promptly remove or disable access to the allegedly infringing material</li>
              <li>Notify the content provider (if applicable)</li>
              <li>Provide affected parties the opportunity to file a counter-notice</li>
              <li>Maintain all records as required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">Repeat Infringer Policy</h2>
            <p className="mt-3">
              {siteConfig.name} maintains a policy of terminating the accounts of users or content
              providers who are found to be repeat copyright infringers, under appropriate
              circumstances.
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
