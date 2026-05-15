import Link from "next/link"
import { Twitter, Mail } from "lucide-react"
import { OptimizedImage } from "@/components/common/optimized-image"
import type { Author } from "@/types"

interface AuthorCardProps {
  author: Author
}

export function AuthorCard({ author }: AuthorCardProps) {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-border bg-background p-5">
      {author.avatar && (
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full">
          <OptimizedImage
            src={author.avatar}
            alt={author.name}
            width={56}
            height={56}
            className="aspect-square w-full object-cover"
          />
        </div>
      )}
      <div className="flex-1">
        <Link
          href={`/author/${author.slug}`}
          className="text-sm font-semibold transition-colors hover:text-muted-foreground"
        >
          {author.name}
        </Link>
        {author.role && (
          <p className="text-[12px] text-muted-foreground">{author.role}</p>
        )}
        {author.bio && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {author.bio}
          </p>
        )}
        <div className="mt-2 flex items-center gap-3">
          {author.twitter && (
            <a
              href={`https://twitter.com/${author.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Twitter className="h-3.5 w-3.5" />
            </a>
          )}
          {author.email && (
            <a
              href={`mailto:${author.email}`}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Mail className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
