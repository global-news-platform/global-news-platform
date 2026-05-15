import { Container } from "@/components/common/container"

export function NewsletterSection() {
  return (
    <section className="border-t border-border py-12 md:py-16">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-headline text-2xl font-bold md:text-3xl">
            The World in Your Inbox
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            A concise daily briefing on the most important stories, curated by our editors.
          </p>
          <form
            className="mt-6 flex max-w-md mx-auto gap-2"
            action="#"
          >
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 rounded border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
            <button
              type="submit"
              className="rounded bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-3 text-[12px] text-muted-foreground/60">
            Free, daily. No spam. Unsubscribe anytime.
          </p>
        </div>
      </Container>
    </section>
  )
}
