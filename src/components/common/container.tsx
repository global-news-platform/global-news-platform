import { cn } from "@/lib/utils"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: "div" | "section" | "article"
  size?: "default" | "sm" | "lg" | "full"
}

export function Container({
  className,
  as: Component = "div",
  size = "default",
  children,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full px-4 sm:px-5 lg:px-6 xl:px-8",
        {
          "max-w-7xl": size === "default",
          "max-w-5xl": size === "sm",
          "max-w-[90rem]": size === "lg",
          "max-w-none": size === "full",
        },
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
