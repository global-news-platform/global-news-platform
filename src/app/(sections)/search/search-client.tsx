"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { Search, ChevronLeft } from "lucide-react"

import { Container } from "@/components/common/container"
import { ArticleCard } from "@/components/article/article-card"
import { AdSlot } from "@/components/common/ad-slot"
import type { ArticleLink } from "@/types"

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

function useQuery() {
  const [query] = useState(() => {
    if (typeof window === "undefined") return ""
    const params = new URLSearchParams(window.location.search)
    return params.get("q")?.trim() || ""
  })
  return query
}

interface SearchPageClientProps {
  articles: ArticleLink[]
}

export function SearchPageClient({ articles }: SearchPageClientProps) {
  const query = useQuery()
  const [input, setInput] = useState(query)
  const debouncedInput = useDebounce(input, 200)
  const searching = input !== debouncedInput

  const results = useMemo(() => {
    if (!query) return []
    const q = query.toLowerCase()
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q),
    )
  }, [query, articles])

  const liveResults = useMemo(() => {
    const q = debouncedInput.toLowerCase().trim()
    if (!q) return []
    if (q === query.toLowerCase().trim()) return results
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q),
    )
  }, [debouncedInput, query, results, articles])

  const displayResults = query ? results : liveResults
  const showLive = !query && debouncedInput.length > 0

  return (
    <>
      <div className="border-b border-border bg-secondary/30 py-6 md:py-8">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <li>
                <Link href="/" className="transition-colors hover:text-foreground">
                  Home
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronLeft className="h-3 w-3" />
                <span className="text-foreground/60">
                  {query ? `Search: ${query}` : "Search"}
                </span>
              </li>
            </ol>
          </nav>
          <div className="border-b-[3px] border-foreground pb-4">
            <h1 className="font-headline text-3xl font-bold md:text-4xl">
              {query ? `Results for "${query}"` : showLive ? `Live: "${debouncedInput}"` : "Search"}
            </h1>
            <p className="mt-2 text-muted-foreground">
{searching ? "Searching..." : displayResults.length > 0
    ? `${displayResults.length} Article${displayResults.length === 1 ? "" : "s"} found`
    : (query || showLive)
      ? "No articles found. Try a different search term."
      : "Enter a term to search articles."}
            </p>
          </div>
        </Container>
      </div>

      <div className="py-8 md:py-12">
        <Container>
          <div className="mb-8 flex gap-2">
            <input
              type="search"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input.trim()) {
                  window.location.href = `/search?q=${encodeURIComponent(input.trim())}`
                }
              }}
              placeholder="Search news..."
              className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Link
              href={`/search?q=${encodeURIComponent(input.trim())}`}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Search className="ml-2 h-4 w-4" />
              Search
            </Link>
          </div>
          <AdSlot variant="leaderboard" className="mb-8 hidden md:flex" />

          <div className="flex gap-8">
            <div className="min-w-0 flex-1">
              {searching ? (
                <div className="py-20 text-center">
                  <p className="text-lg text-muted-foreground">Searching...</p>
                </div>
              ) : displayResults.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {displayResults.map((article) => (
                    <ArticleCard
                      key={article.slug}
                      article={article}
                      variant="default"
                    />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center">
                  <p className="text-lg text-muted-foreground">
                    {(query || showLive)
                      ? `No articles found for "${query || debouncedInput}". Try a different term.`
                      : "Enter a term above to search articles."}
                  </p>
                </div>
              )}
            </div>

            <aside className="hidden w-[260px] shrink-0 xl:block">
              <div className="sticky top-28 flex flex-col gap-6">
                <AdSlot variant="skyscraper" className="w-full" label="Advertisement" />
                <AdSlot variant="rectangle" className="w-full" label="Sponsored" />
              </div>
            </aside>
          </div>
        </Container>
      </div>
    </>
  )
}
