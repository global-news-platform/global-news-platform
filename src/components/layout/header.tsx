"use client"

import Link from "next/link"
import { Moon, Sun, Menu, Search, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "@/components/common/theme-provider"

import { Container } from "@/components/common/container"
import { Button } from "@/components/ui/button"
import { navigation } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function Header() {
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/80"
          : "border-b border-transparent bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      )}
    >
      {/* Top bar */}
      <div className="hidden border-b border-border bg-secondary/80 md:block">
        <Container>
          <div className="flex h-8 items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex items-center gap-4">
              <span suppressHydrationWarning>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/breaking"
                className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-news-red transition-colors hover:text-news-red/80"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-news-red opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-news-red" />
                </span>
                Breaking
              </Link>
              <span className="h-3 w-px bg-border" />
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full p-1 transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Toggle theme"
              >
                {mounted ? (
                  theme === "dark" ? (
                    <Sun className="h-3 w-3" />
                  ) : (
                    <Moon className="h-3 w-3" />
                  )
                ) : null}
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* Main header */}
      <Container>
        <div className="flex h-12 items-center justify-between sm:h-14 md:h-16">
          {/* Mobile menu trigger */}
          <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden -ml-2"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="top-0 translate-y-0 p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:rounded-none">
              <DialogTitle className="sr-only">Navigation Menu</DialogTitle>
              <div className="flex items-center justify-between border-b border-border p-4">
                <span className="font-headline text-lg font-bold tracking-tight">
                  <span className="text-news-red">G</span>lobal{" "}
                  <span className="text-news-red">N</span>ews
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex flex-col overflow-y-auto max-h-[calc(100vh-5rem)] p-4">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="border-b border-border py-3.5 font-headline text-base font-medium transition-colors hover:text-news-red active:text-news-red"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="mt-4 flex items-center gap-3 pt-4 border-t border-border">
                  <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Toggle theme"
                  >
                    {mounted ? (
                      theme === "dark" ? (
                        <>
                          <Sun className="h-4 w-4" />
                          Light mode
                        </>
                      ) : (
                        <>
                          <Moon className="h-4 w-4" />
                          Dark mode
                        </>
                      )
                    ) : null}
                  </button>
                </div>
              </nav>
            </DialogContent>
          </Dialog>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-headline text-lg font-bold tracking-tight sm:text-xl md:text-2xl lg:text-3xl">
              <span className="text-news-red">G</span>lobal{" "}
              <span className="text-news-red">N</span>ews
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center md:flex">
            {navigation.slice(0, 6).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-2.5 lg:px-3 py-1 text-sm font-medium transition-colors hover:text-news-red after:absolute after:bottom-0 after:left-2.5 after:right-2.5 after:h-0.5 after:origin-center after:scale-x-0 after:bg-news-red after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                {item.label}
              </Link>
            ))}
            <div className="group relative ml-1">
              <button className="flex items-center gap-1 px-2.5 lg:px-3 py-1 text-sm font-medium transition-colors hover:text-news-red">
                More
                <svg className="h-3 w-3 fill-current transition-transform group-hover:rotate-180" viewBox="0 0 12 12">
                  <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="invisible absolute right-0 top-full z-50 mt-1 w-44 origin-top-right scale-95 rounded-md border border-border bg-background p-1.5 shadow-elevated transition-all duration-200 group-hover:visible group-hover:scale-100">
                {navigation.slice(6).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-sm px-3 py-2 text-sm transition-colors hover:bg-secondary hover:text-news-red"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex text-muted-foreground hover:text-foreground"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground hover:text-foreground -mr-2"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {mounted ? (
                theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )
              ) : null}
            </Button>
          </div>
        </div>
      </Container>
    </header>
  )
}
