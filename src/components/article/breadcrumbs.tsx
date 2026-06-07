import Link from "next/link"
import { ChevronLeft } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
        <li>
              <Link href="/" className="transition-colors hover:text-foreground">
                Home
              </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronLeft className="h-3 w-3" />
            {item.href ? (
              <Link
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground/60">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
