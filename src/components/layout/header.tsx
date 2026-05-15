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
  const { theme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top bar */}
      <div className="hidden border-b border-border bg-secondary md:block">
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
              <Link href="/breaking" className="font-semibold uppercase tracking-wider text-news-red hover:underline">
                Breaking
              </Link>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="transition-colors hover:text-foreground"
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
        <div className="flex h-14 items-center justify-between md:h-16">
          {/* Mobile menu trigger */}
          <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="top-0 translate-y-0 p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:rounded-none">
              <DialogTitle className="sr-only">Navigation Menu</DialogTitle>
              <div className="flex items-center justify-between border-b p-4">
                <span className="font-headline text-lg font-bold">
                  Global News
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex flex-col p-4">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="border-b border-border py-3 font-headline text-base font-medium transition-colors hover:text-news-red"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </DialogContent>
          </Dialog>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-headline text-xl font-bold tracking-tight md:text-2xl">
              Global News
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center md:flex">
            {navigation.slice(0, 6).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1 text-sm font-medium transition-colors hover:text-news-red"
              >
                {item.label}
              </Link>
            ))}
            <div className="group relative ml-2">
              <button className="px-3 py-1 text-sm font-medium transition-colors hover:text-news-red">
                More +
              </button>
              <div className="absolute right-0 top-full z-50 mt-1 hidden w-40 rounded-md border bg-background p-2 shadow-lg group-hover:block">
                {navigation.slice(6).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded px-3 py-2 text-sm transition-colors hover:bg-secondary"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden md:inline-flex" aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
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
