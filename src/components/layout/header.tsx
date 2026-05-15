"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef, useCallback } from "react"
import {
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  ExternalLink,
  Rss,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/common/theme-provider"
import { navigation, categories } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const featuredCategories = ["world", "politics", "business", "technology", "science", "culture", "opinion"]

export function Header() {
  const pathname = usePathname()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [scrolledPast, setScrolledPast] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      setIsScrolled(y > 10)
      setScrolledPast(y > 80)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [searchOpen])

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (searchQuery.trim()) {
        window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
      }
    },
    [searchQuery],
  )

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b border-border/60 bg-header/95 backdrop-blur-md transition-all duration-300",
          isScrolled && "shadow-header",
        )}
      >
        {/* Top bar */}
        <div className="hidden border-b border-border/40 md:block">
          <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 sm:px-5 lg:px-6 xl:px-8">
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-medium text-muted-foreground">
                {today}
              </span>
              <span className="text-[11px] text-muted-foreground/40">|</span>
              <Link
                href="/breaking"
                className="flex items-center gap-1.5 text-[11px] font-semibold text-red-600 transition-colors hover:text-red-700"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
                </span>
                Breaking
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Toggle theme"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="h-3.5 w-3.5" />
                ) : (
                  <Moon className="h-3.5 w-3.5" />
                )}
              </button>
              <a
                href="/feed.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="RSS Feed"
              >
                <Rss className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Logo row */}
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-5 lg:px-6 xl:px-8">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="rounded p-1.5 text-foreground transition-colors hover:bg-secondary md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link
            href="/"
            className="group flex items-center gap-2.5"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded bg-foreground">
              <Globe className="h-4 w-4 text-background" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight tracking-tight md:text-base">
                Global News
              </span>
              <span className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground md:block">
                The World at a Glance
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navigation.slice(0, 7).map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded px-3 py-1.5 text-[13px] font-medium transition-all",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
            <div className="ml-1 border-l border-border pl-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 z-50 w-[300px] max-w-[85vw] overflow-y-auto bg-background shadow-elevated">
            <div className="flex items-center justify-between border-b border-border p-4">
              <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <div className="flex h-7 w-7 items-center justify-center rounded bg-foreground">
                  <Globe className="h-3.5 w-3.5 text-background" />
                </div>
                <span className="text-sm font-bold">Global News</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded p-1 text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Sections
                </p>
                <nav className="space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center rounded px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                        )}
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="top-[15%] max-w-xl -translate-y-0 sm:top-[20%]">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSearch} className="mt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded border border-border bg-background py-3 pl-10 pr-4 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-[11px] text-muted-foreground">Quick links:</span>
              {featuredCategories.slice(0, 4).map((slug) => {
                const cat = categories.find((c) => c.slug === slug)
                return (
                  <Link
                    key={slug}
                    href={`/category/${slug}`}
                    onClick={() => setSearchOpen(false)}
                    className="rounded bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {cat?.name || slug}
                  </Link>
                )
              })}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
