import Link from "next/link"
import { Twitter, Mail, ArrowUpRight } from "lucide-react"

import type { Author } from "@/types"

interface AuthorCardProps {
  author: Author
}

export function AuthorCard({ author }: AuthorCardProps) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-5 md:p-6">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted">
          {author.avatar ? (
            <img
              src={author.avatar}
              alt={author.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <span className="font-headline text-lg font-bold text-muted-foreground">
                {author.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <Link
            href={`/author/${author.slug}`}
            className="font-headline text-base font-bold hover:underline md:text-lg"
          >
            {author.name}
          </Link>
          {author.role && (
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {author.role}
            </p>
          )}
          {author.bio && (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {author.bio}
            </p>
          )}
          <div className="mt-3 flex items-center gap-3">
            {author.twitter && (
              <a
                href={`https://twitter.com/${author.twitter.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Twitter className="h-3.5 w-3.5" />
                {author.twitter}
              </a>
            )}
            {author.email && (
              <a
                href={`mailto:${author.email}`}
                className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Mail className="h-3.5 w-3.5" />
                Email
              </a>
            )}
            <Link
              href={`/author/${author.slug}`}
              className="ml-auto flex items-center gap-1 text-xs font-medium text-news-red transition-colors hover:text-news-red/80"
            >
              View all articles
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
