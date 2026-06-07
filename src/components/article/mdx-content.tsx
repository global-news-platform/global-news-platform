import { cn } from "@/lib/utils"

interface MDXContentProps {
  content: string
  className?: string
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function renderInlineMarkdown(text: string): string {
  let result = escapeHtml(text)

  result = result.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (_, alt, src) => `<img src="${src}" alt="${alt}" class="my-4 rounded-xl shadow-md" loading="lazy" decoding="async" style="object-fit:cover;aspect-ratio:16/9;max-width:100%" />`
  )

  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, text, href) => `<a href="${href}" class="underline decoration-foreground/20 underline-offset-2 decoration-[1px] transition-colors hover:decoration-foreground/60">${text}</a>`
  )

  result = result.replace(/\*\*(\S.*?\S)\*\*/g, "<strong>$1</strong>")
  result = result.replace(/\*(\S.*?\S)\*/g, "<em>$1</em>")

  return result
}

export function MDXContent({ content, className }: MDXContentProps) {
  const rendered = content
    .split("\n\n")
    .map((block) => {
      const imgMatch = block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
      if (imgMatch) {
        return `<figure class="my-8"><img src="${escapeHtml(imgMatch[2])}" alt="${escapeHtml(imgMatch[1])}" class="w-full rounded-xl shadow-md" loading="lazy" decoding="async" style="object-fit:cover;aspect-ratio:16/9" /><figcaption class="mt-2 text-center text-[13px] text-muted-foreground">${escapeHtml(imgMatch[1])}</figcaption></figure>`
      }
      const linkMatch = block.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (linkMatch) {
        return `<a href="${escapeHtml(linkMatch[2])}" class="underline decoration-foreground/20 underline-offset-2 decoration-[1px] transition-colors hover:decoration-foreground/60">${escapeHtml(linkMatch[1])}</a>`
      }
      if (block.startsWith("> ")) {
        const lines = block.split("\n").map((l) => l.replace(/^>\s?/, "")).join("\n")
        return `<blockquote class="border-l-[3px] border-accent/50 pl-4 pr-0 my-8 italic text-[17px] md:text-[19px] text-foreground/80 font-sans leading-[2]">${renderInlineMarkdown(lines)}</blockquote>`
      }
      if (block.startsWith("### ")) {
        return `<h3 class="font-sans text-xl md:text-2xl font-bold mt-8 mb-3 text-foreground leading-[1.8]">${renderInlineMarkdown(block.replace("### ", ""))}</h3>`
      }
      if (block.startsWith("## ")) {
        return `<h2 class="font-sans text-2xl md:text-3xl font-bold mt-12 mb-4 text-foreground leading-[1.8]">${renderInlineMarkdown(block.replace("## ", ""))}</h2>`
      }
      if (block.split("\n").every((l) => l.startsWith("- "))) {
        const items = block.split("\n").map((l) => `<li class="md:text-[16px] text-foreground/85 leading-[2] font-sans">${renderInlineMarkdown(l.replace(/^- /, ""))}</li>`).join("")
        return `<ul class="mb-5 pl-5 pr-0 space-y-1.5">${items}</ul>`
      }
      if (block.split("\n").every((l) => /^\d+\.\s/.test(l))) {
        const items = block.split("\n").map((l) => `<li class="md:text-[16px] text-foreground/85 leading-[2] font-sans">${renderInlineMarkdown(l.replace(/^\d+\.\s/, ""))}</li>`).join("")
        return `<ol class="mb-5 pl-5 pr-0 space-y-1.5">${items}</ol>`
      }
      if (block === "---") {
        return `<hr class="my-12 border-border" />`
      }
      const processed = block
        .split("\n")
        .map((line) => {
          if (line.startsWith("### ")) return `<h3 class="font-sans text-xl md:text-2xl font-bold mt-8 mb-3 text-foreground leading-[1.8]">${renderInlineMarkdown(line.replace("### ", ""))}</h3>`
          if (line.startsWith("## ")) return `<h2 class="font-sans text-2xl md:text-3xl font-bold mt-12 mb-4 text-foreground leading-[1.8]">${renderInlineMarkdown(line.replace("## ", ""))}</h2>`
          if (line.startsWith("> ")) return `<blockquote class="border-l-[3px] border-accent/50 pl-4 pr-0 my-8 italic text-[17px] md:text-[19px] text-foreground/80 font-sans leading-[2]">${renderInlineMarkdown(line.replace(/^>\s?/, ""))}</blockquote>`
          if (line.startsWith("#### ")) return `<h4 class="font-sans text-lg font-bold mt-6 mb-2 text-foreground leading-[1.8]">${renderInlineMarkdown(line.replace("#### ", ""))}</h4>`
          const inlineImg = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
          if (inlineImg) return `<figure class="my-8"><img src="${escapeHtml(inlineImg[2])}" alt="${escapeHtml(inlineImg[1])}" class="w-full rounded-xl shadow-md" loading="lazy" decoding="async" style="object-fit:cover;aspect-ratio:16/9" /></figure>`
          return renderInlineMarkdown(line)
        })
        .join("<br/>")

      return `<p class="mb-5 leading-[2] text-[16.5px] md:text-[18px] text-foreground/85 font-sans">${processed}</p>`
    })
    .join("\n")

  return (
    <div
      className={cn("prose-article", className)}
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  )
}
