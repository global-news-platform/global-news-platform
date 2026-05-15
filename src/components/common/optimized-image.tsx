import Image from "next/image"
import { cn } from "@/lib/utils"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  wrapperClassName?: string
  priority?: boolean
  sizes?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  wrapperClassName,
  priority = false,
  sizes,
}: OptimizedImageProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        fill ? "h-full w-full" : "",
        wrapperClassName,
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        className={cn(
          "object-cover transition-all duration-500 group-hover:scale-[1.02]",
          className,
        )}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        sizes={
          sizes ||
          "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        }
      />
    </div>
  )
}
