"use client"

import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface InViewProps {
  children: React.ReactNode
  className?: string
  delay?: number
  once?: boolean
}

export function InView({
  children,
  className,
  delay = 0,
  once = true,
}: InViewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay * 1000)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay, once])

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out-expo",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-6 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  )
}
