"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

type Theme = "light" | "dark" | "system"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

interface ThemeProviderState {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined,
)

function getResolvedTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : "light"
  }
  return theme
}

function getInitialTheme(storageKey: string, defaultTheme: Theme): Theme {
  if (typeof window !== "undefined") {
    return (localStorage.getItem(storageKey) as Theme) || defaultTheme
  }
  return defaultTheme
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "pakistan-news-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() =>
    getInitialTheme(storageKey, defaultTheme),
  )

  const resolvedTheme = useMemo(() => getResolvedTheme(theme), [theme])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(resolvedTheme)
  }, [resolvedTheme])

  useEffect(() => {
    if (theme !== "system") return

    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => {
      const root = document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(mq.matches ? "dark" : "light")
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [theme])

  const setTheme = useCallback(
    (t: Theme) => {
      localStorage.setItem(storageKey, t)
      setThemeState(t)
    },
    [storageKey],
  )

  return (
    <ThemeProviderContext.Provider
      {...props}
      value={{ theme, resolvedTheme, setTheme }}
    >
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (!context) throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
