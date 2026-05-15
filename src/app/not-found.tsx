import type { Metadata } from "next"
import Link from "next/link"

import { Container } from "@/components/common/container"
import { Button } from "@/components/ui/button"
import { generateMetadata } from "@/lib/seo"

export const metadata: Metadata = generateMetadata({
  title: "Page Not Found (404)",
  description: "The page you are looking for does not exist or has been moved.",
  path: "/404",
  robots: { index: false, follow: false },
})

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center py-20">
      <Container className="text-center">
        <h1 className="font-headline text-8xl font-black text-muted-foreground/20">
          404
        </h1>
        <h2 className="mt-4 font-headline text-2xl font-bold">
          Page Not Found
        </h2>
        <p className="mt-2 text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
        <nav aria-label="Error page navigation">
          <Link href="/" className="mt-6 inline-block">
            <Button>Return to Homepage</Button>
          </Link>
        </nav>
      </Container>
    </div>
  )
}
