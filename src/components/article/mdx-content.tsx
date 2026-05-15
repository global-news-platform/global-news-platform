import { MDXRemote } from "next-mdx-remote/rsc"
import type { MDXComponents } from "mdx/types"
import Link from "next/link"
import { OptimizedImage } from "@/components/common/optimized-image"

const components: MDXComponents = {
  h2: ({ children, id, ...props }) => (
    <h2
      id={id || String(children).toLowerCase().replace(/\s+/g, "-")}
      className="group mt-10 mb-4 font-headline text-2xl font-bold leading-tight md:text-3xl"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, id, ...props }) => (
    <h3
      id={id || String(children).toLowerCase().replace(/\s+/g, "-")}
      className="group mt-8 mb-3 font-headline text-xl font-bold leading-snug"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="mt-6 mb-2 font-headline text-lg font-bold" {...props}>
      {children}
    </h4>
  ),
  p: ({ children, ...props }) => (
    <p className="mb-5 leading-[1.75] text-foreground/90 text-[17px] md:text-lg" {...props}>
      {children}
    </p>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="relative my-8 border-l-[3px] border-news-red pl-6 italic text-foreground/80"
      {...props}
    >
      <span className="absolute -left-0.5 -top-3 font-headline text-5xl leading-none text-news-red/20" aria-hidden="true">
        &ldquo;
      </span>
      <div className="text-lg md:text-xl">{children}</div>
    </blockquote>
  ),
  a: ({ children, href, ...props }) => {
    const isExternal = href?.startsWith("http")
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-news-blue underline underline-offset-2 decoration-1 transition-colors hover:text-news-blue/80"
          {...props}
        >
          {children}
        </a>
      )
    }
    return (
      <Link
        href={href || "#"}
        className="text-news-blue underline underline-offset-2 decoration-1 transition-colors hover:text-news-blue/80"
        {...props}
      >
        {children}
      </Link>
    )
  },
  ul: ({ children, ...props }) => (
    <ul className="mb-5 ml-6 list-disc space-y-1.5 text-[17px] leading-relaxed md:text-lg" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="mb-5 ml-6 list-decimal space-y-1.5 text-[17px] leading-relaxed md:text-lg" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="text-foreground/90 marker:text-muted-foreground" {...props}>
      {children}
    </li>
  ),
  hr: ({ ...props }) => (
    <hr className="my-10 border-border" {...props} />
  ),
  img: ({ alt, src, ...props }) => (
    <figure className="my-8">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
        <OptimizedImage
          src={src || ""}
          alt={alt || ""}
          fill
          loading="lazy"
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
      </div>
      {alt && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {alt}
        </figcaption>
      )}
    </figure>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-bold text-foreground" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic text-foreground/80" {...props}>
      {children}
    </em>
  ),
  code: ({ children, ...props }) => (
    <code
      className="rounded bg-secondary px-1.5 py-0.5 text-sm font-mono text-foreground"
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ children, ...props }) => (
    <pre
      className="my-6 overflow-x-auto rounded-lg bg-secondary p-4 text-sm"
      {...props}
    >
      {children}
    </pre>
  ),
}

interface MDXContentProps {
  content: string
}

export function MDXContent({ content }: MDXContentProps) {
  return (
    <MDXRemote
      source={content}
      components={components as MDXComponents}
      options={{
        mdxOptions: {
          remarkPlugins: [],
          rehypePlugins: [],
        },
      }}
    />
  )
}
