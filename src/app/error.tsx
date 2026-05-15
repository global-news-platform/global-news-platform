"use client"

import { Container } from "@/components/common/container"
import { Button } from "@/components/ui/button"

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center py-20">
      <Container className="text-center">
        <h1 className="font-headline text-8xl font-black text-muted-foreground/20">
          500
        </h1>
        <h2 className="mt-4 font-headline text-2xl font-bold">
          Something went wrong
        </h2>
        <p className="mt-2 text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
        <Button onClick={reset} className="mt-6">
          Try Again
        </Button>
      </Container>
    </div>
  )
}
