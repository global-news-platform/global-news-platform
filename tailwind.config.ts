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
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        headline: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
        xs: ["0.75rem", { lineHeight: "1.25rem" }],
        sm: ["0.8125rem", { lineHeight: "1.5rem" }],
        base: ["0.9375rem", { lineHeight: "1.75rem" }],
        lg: ["1.0625rem", { lineHeight: "1.875rem" }],
        xl: ["1.25rem", { lineHeight: "2rem" }],
        "2xl": ["1.5rem", { lineHeight: "2.25rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.75rem" }],
        "4xl": ["2.25rem", { lineHeight: "3.25rem" }],
        "5xl": ["3rem", { lineHeight: "4rem" }],
        "6xl": ["3.75rem", { lineHeight: "4.75rem" }],
        "7xl": ["4.5rem", { lineHeight: "5.5rem" }],
        "8xl": ["5.5rem", { lineHeight: "6.5rem" }],
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
        glow: "0 0 20px hsl(var(--accent)/0.15)",
        "glow-md": "0 0 30px hsl(var(--accent)/0.2)",
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
        "expand-width": {
          from: { width: "0" },
          to: { width: "100%" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
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
        "expand-width": "expand-width 0.6s ease-out forwards",
        "spin-slow": "spin-slow 3s linear infinite",
        "bounce-gentle": "bounce-gentle 2s ease-in-out infinite",
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
