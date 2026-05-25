import type { Config } from "tailwindcss"
import type { PluginAPI } from "tailwindcss/types/config"

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.25rem",
        lg: "1.5rem",
        xl: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-noto-nastaliq)", "Noto Nastaliq Urdu", "Noto Sans Arabic", "system-ui", "sans-serif"],
        serif: ["var(--font-noto-nastaliq)", "Noto Nastaliq Urdu", "Noto Sans Arabic", "serif"],
        headline: ["var(--font-noto-nastaliq)", "Noto Nastaliq Urdu", "serif"],
        urdu: ["var(--font-noto-nastaliq)", "Noto Nastaliq Urdu", "serif"],
        urduBody: ["var(--font-noto-nastaliq)", "Noto Nastaliq Urdu", "serif"],
        arabic: ["var(--font-noto-arabic)", "Noto Sans Arabic", "sans-serif"],
        kufi: ["var(--font-noto-arabic)", "Noto Sans Arabic", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.8125rem", { lineHeight: "1.25rem" }],
        base: ["0.9375rem", { lineHeight: "1.5rem" }],
        lg: ["1.0625rem", { lineHeight: "1.625rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "1.9rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.3rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.75rem" }],
        "5xl": ["3rem", { lineHeight: "3.4rem" }],
        "6xl": ["3.75rem", { lineHeight: "4.1rem" }],
        "7xl": ["4.5rem", { lineHeight: "4.8rem" }],
        "8xl": ["5.5rem", { lineHeight: "5.8rem" }],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        header: {
          DEFAULT: "hsl(var(--header-bg))",
        },
        nav: {
          DEFAULT: "hsl(var(--nav-bg))",
          foreground: "hsl(var(--nav-fg))",
        },
        ticker: {
          DEFAULT: "hsl(var(--ticker-bg))",
          foreground: "hsl(var(--ticker-fg))",
        },
        "section-header": {
          DEFAULT: "hsl(var(--section-header-bg))",
          foreground: "hsl(var(--section-header-fg))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
        },
        "live-red": {
          DEFAULT: "hsl(var(--live-red))",
        },
        section: {
          DEFAULT: "hsl(var(--section-bg))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "var(--card-shadow)",
        "card-hover": "var(--card-shadow-hover)",
        elevated: "var(--elevated-shadow)",
        header: "0 1px 3px rgba(0,0,0,0.04)",
        nav: "0 1px 2px rgba(0,0,0,0.03)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        marquee: {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(-100%)" },
        },
        "marquee-rtl": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "live-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.15)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "fade-up": "fade-up 0.5s ease-out",
        "slide-up": "slide-up 0.6s ease-out",
        "scale-in": "scale-in 0.4s ease-out",
        marquee: "marquee 30s linear infinite",
        "marquee-rtl": "marquee-rtl 40s linear infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "live-pulse": "live-pulse 1.5s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "slide-down": "slide-down 0.2s ease-out",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  safelist: [
    "aspect-video",
    "aspect-[16/9]",
    "aspect-[4/3]",
  ],
  plugins: [
    require("@tailwindcss/typography"),
    require("tailwindcss-animate"),
  ],
}

export default config
