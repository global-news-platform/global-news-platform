import { cn } from "@/lib/utils"

export function Container({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("container mx-auto px-4 sm:px-5 lg:px-6 xl:px-8", className)} {...props}>
      {children}
    </div>
  )
}
