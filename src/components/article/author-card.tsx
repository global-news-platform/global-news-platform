import Link from "next/link"
import { Twitter, Mail } from "lucide-react"
import { SafeImage } from "@/components/ui/safe-image"
import type { Author } from "@/types"

interface AuthorCardProps {
  author: Author
  categorySlug?: string
}

const BEAT_MAP: Record<string, string[]> = {
  "ali-ahmed": ["siasat", "pakistan", "dunya", "general"],
  "sara-khan": ["siasat", "crime", "adalat", "general"],
  "imran-malik": ["khel", "general"],
  "fatima-hussain": ["karobar", "dunya", "general"],
  "babar-shah": ["technology", "science", "general"],
}

const GENERIC_BIO = "پاکستان نیوز کے صحافی۔ مختلف موضوعات اور شعبوں پر رپورٹنگ کرتے ہیں۔"
const GENERIC_ROLE = "صحافی"

function getEffectiveBio(author: Author, categorySlug?: string): { bio: string; role: string } {
  if (!categorySlug) {
    return { bio: author.bio || GENERIC_BIO, role: author.role || GENERIC_ROLE }
  }

  const allowedBeats = BEAT_MAP[author.slug]
  if (!allowedBeats) {
    return { bio: author.bio || GENERIC_BIO, role: author.role || GENERIC_ROLE }
  }

  if (allowedBeats.includes(categorySlug)) {
    return { bio: author.bio || GENERIC_BIO, role: author.role || GENERIC_ROLE }
  }

  return { bio: GENERIC_BIO, role: GENERIC_ROLE }
}

export function AuthorCard({ author, categorySlug }: AuthorCardProps) {
  const { bio, role } = getEffectiveBio(author, categorySlug)

  return (
    <div className="flex items-start gap-4 rounded-lg border border-border bg-background p-5">
      {author.avatar && (
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full">
          <SafeImage
            src={author.avatar}
            alt={author.name}
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
        {role && (
          <p className="text-[12px] text-muted-foreground">{role}</p>
        )}
        {bio && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {bio}
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
