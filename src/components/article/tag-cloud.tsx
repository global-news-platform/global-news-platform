import Link from "next/link"

interface TagCloudProps {
  tags: string[]
}

export function TagCloud({ tags }: TagCloudProps) {
  if (tags.length === 0) return null

  return (
    <div className="border-t border-border pt-6">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
        Topics
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/category/${tag.toLowerCase()}`}
            className="inline-block rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            {tag}
          </Link>
        ))}
      </div>
    </div>
  )
}
