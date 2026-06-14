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
          "sticky top-0 z-40 w-full border-b transition-all duration-500 ease-out-expo",
          isScrolled
            ? "border-border/40 bg-background/80 backdrop-blur-lg shadow-header"
            : "border-border/80 bg-background",
        )}
      >
        {/* Top bar with date and social */}
        <div className="hidden border-b border-border/30 bg-gradient-to-r from-primary via-primary/95 to-primary/90 md:block">
          <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 sm:px-5 lg:px-6 xl:px-8">
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-medium text-primary-foreground/75">
                {today}
              </span>
              <span className="text-primary-foreground/20">|</span>
              <Link
                href="/breaking"
                className="flex items-center gap-1.5 text-[11px] font-bold text-accent transition-colors hover:text-accent/80"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                Breaking
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <SocialIcons variant="header" />
              <span className="h-3 w-px bg-primary-foreground/20" />
              <div className="flex items-center gap-4 ml-6">
                <button
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  className="rounded p-1 text-primary-foreground/70 transition-colors hover:text-primary-foreground"
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
        <div className="mx-auto flex h-14 sm:h-20 max-w-7xl items-center justify-between px-3 sm:px-5 lg:px-6 xl:px-8">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg p-2.5 text-foreground transition-colors active:bg-accent/15 hover:bg-accent/10 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link
            href="/"
            className="group flex items-center gap-2 sm:gap-3.5"
          >
            <SiteLogo showTagline />
          </Link>

          <div className="flex items-center gap-1 sm:gap-2 md:hidden">
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-lg p-2.5 text-foreground transition-colors active:bg-accent/15 hover:bg-accent/10"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="rounded-lg p-2.5 text-foreground transition-colors active:bg-accent/15 hover:bg-accent/10"
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
        <div className="hidden border-t border-primary/10 md:block">
          <div className="bg-gradient-to-r from-primary via-primary/98 to-primary/95">
            <div className="mx-auto flex h-11 max-w-7xl items-center px-4 sm:px-5 lg:px-6 xl:px-8">
              <nav className="flex items-center gap-0.5 flex-1">
                {navigation.slice(0, 8).map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative rounded-md px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200",
                        isActive
                          ? "bg-white/15 text-white"
                          : "text-white/80 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      {item.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent rounded-full" />
                      )}
                    </Link>
                  )
                })}
              </nav>
              <div className="ms-3 flex items-center gap-1.5">
                <Link
                  href="/category/raye"
                  className={cn(
                    "relative rounded-md px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200",
                    pathname === "/category/raye"
                      ? "bg-white/15 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white",
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
                        className="rounded-l-md p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
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
                        className="w-40 lg:w-52 bg-white/15 text-white placeholder:text-white/40 rounded-r-md px-3 py-1.5 text-[12px] outline-none border border-white/10 focus:border-accent/50 transition-colors"
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
                      className="rounded-md p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
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
        <div className="fixed inset-0 z-50 md:hidden animate-fade-in">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 z-50 w-[300px] max-w-[85vw] overflow-y-auto bg-background shadow-elevated animate-slide-down">
            <div className="flex items-center justify-between border-b border-border/10 bg-gradient-to-r from-primary/5 to-accent/5 p-4">
              <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <SiteLogo className="h-8 w-8" iconSize={4} textSize="text-base font-bold" />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
                  Categories
                </p>
                <nav className="space-y-0.5">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-accent/10 text-accent border-l-2 border-accent"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground border-l-2 border-transparent",
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
            <DialogTitle className="text-foreground/80">Search News</DialogTitle>
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
                className="w-full rounded-lg border border-border bg-secondary/50 py-3 pr-10 pl-4 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/30 transition-all"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-[11px] font-medium text-muted-foreground">Quick links:</span>
              {featuredCategories.slice(0, 4).map((slug) => {
                const cat = categories.find((c) => c.slug === slug)
                return (
                  <Link
                    key={slug}
                    href={`/category/${slug}`}
                    onClick={() => setSearchOpen(false)}
                    className="rounded-lg bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent transition-colors hover:bg-accent/20"
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
