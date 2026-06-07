"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef, useCallback } from "react"
import { Search, Menu, X, Sun, Moon } from "lucide-react"
import { SocialIcons } from "@/components/layout/social-icons"
import { SiteLogo } from "@/components/common/site-logo"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/common/theme-provider"
import { navigation, categories, siteConfig } from "@/lib/constants"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const featuredCategories = ["pakistan", "dunya", "siasat", "technology", "science", "khel", "raye"]

export function Header() {
  const pathname = usePathname()
  const { setTheme, resolvedTheme } = useTheme()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [inlineSearchOpen, setInlineSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      setIsScrolled(y > 10)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const prevPathname = useRef(pathname)
  useEffect(() => {
    if (prevPathname.current !== pathname && mobileMenuOpen) {
      setMobileMenuOpen(false)
    }
    prevPathname.current = pathname
  }, [pathname, mobileMenuOpen])

  useEffect(() => {
    if ((searchOpen || inlineSearchOpen) && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [searchOpen, inlineSearchOpen])

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
          "sticky top-0 z-40 w-full border-b border-border/80 bg-background transition-all duration-300",
          isScrolled && "shadow-md",
        )}
      >
        {/* Top bar with date and social */}
        <div className="hidden border-b border-border/30 bg-foreground md:block">
          <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 sm:px-5 lg:px-6 xl:px-8">
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-medium text-background/70">
                {today}
              </span>
              <span className="text-background/20">|</span>
              <Link
                href="/breaking"
                className="flex items-center gap-1.5 text-[11px] font-bold text-red-400 transition-colors hover:text-red-300"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                Breaking
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <SocialIcons variant="header" />
              <span className="h-3 w-px bg-background/20" />
              <div className="flex items-center gap-4 ml-6">
                <button
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  className="rounded p-1 text-background/60 transition-colors hover:text-background/90"
                  aria-label="Toggle theme"
                >
                  {resolvedTheme === "dark" ? (
                    <Sun className="h-3 w-3" />
                  ) : (
                    <Moon className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Logo row - prominent branding */}
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-5 lg:px-6 xl:px-8">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="rounded p-2 text-foreground transition-colors hover:bg-secondary md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link
            href="/"
            className="group flex items-center gap-3.5"
          >
            <SiteLogo showTagline />
          </Link>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded p-2 text-foreground transition-colors hover:bg-secondary"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="rounded p-2 text-foreground transition-colors hover:bg-secondary"
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

        {/* Navigation bar */}
        <div className="hidden border-t border-primary/20 md:block">
          <div className="bg-primary">
            <div className="mx-auto flex h-11 max-w-7xl items-center px-4 sm:px-5 lg:px-6 xl:px-8">
              <nav className="flex items-center gap-0.5 flex-1">
                {navigation.slice(0, 8).map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "rounded-sm px-3.5 py-1.5 text-[13px] font-medium transition-all",
                        isActive
                          ? "bg-white/20 text-white"
                          : "text-white/85 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
              <div className="ms-3 flex items-center gap-1.5">
                <Link
                  href="/category/raye"
                  className={cn(
                    "rounded-sm px-3.5 py-1.5 text-[13px] font-medium transition-all",
                    pathname === "/category/raye"
                      ? "bg-white/20 text-white"
                      : "text-white/85 hover:bg-white/10 hover:text-white",
                  )}
                >
                  Opinion
                </Link>
                <span className="h-4 w-px bg-white/20" />
                <div className="flex items-center gap-0">
                  {inlineSearchOpen ? (
                    <form onSubmit={handleSearch} className="flex items-center">
                      <button
                        type="submit"
                        className="rounded-l-sm p-1.5 text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                        aria-label="Search"
                      >
                        <Search className="h-4 w-4" />
                      </button>
                      <input
                        ref={searchInputRef}
                        type="search"
                        placeholder="Search news..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onBlur={() => { if (!searchQuery) setTimeout(() => setInlineSearchOpen(false), 200) }}
                        className="w-40 lg:w-52 bg-white/15 text-white placeholder:text-white/40 rounded-r-sm px-3 py-1.5 text-[12px] outline-none border border-white/10 focus:border-white/30 transition-colors"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => { setInlineSearchOpen(false); setSearchQuery("") }}
                        className="p-1.5 text-white/60 hover:text-white/90 transition-colors ms-0.5"
                        aria-label="Close"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => setInlineSearchOpen(true)}
                      className="rounded-sm p-1.5 text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                      aria-label="Search"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 z-50 w-[300px] max-w-[85vw] overflow-y-auto bg-background shadow-elevated">
            <div className="flex items-center justify-between border-b border-border p-4">
              <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <SiteLogo className="h-8 w-8" iconSize={4} textSize="text-base font-bold" />
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
                  Categories
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
                          "flex items-center rounded px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
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
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded border border-border bg-background py-3 pr-10 pl-4 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
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
