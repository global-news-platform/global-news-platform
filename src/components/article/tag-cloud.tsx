import Link from "next/link"

interface TagCloudProps {
  tags: string[]
}

export function TagCloud({ tags }: TagCloudProps) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/category/${tag.toLowerCase()}`}
          className="rounded bg-secondary px-2.5 py-1 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
        >
          {tag}
        </Link>
      ))}
    </div>
  )
}
