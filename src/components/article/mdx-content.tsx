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
        return `<blockquote class="border-l-[3px] border-foreground/20 pl-6 my-8 italic text-[17px] md:text-[19px] text-foreground/80 font-serif">${escapeHtml(lines)}</blockquote>`
      }
      if (block.startsWith("### ")) {
        return `<h3 class="font-serif text-xl md:text-2xl font-semibold mt-8 mb-3 text-foreground">${escapeHtml(block.replace("### ", ""))}</h3>`
      }
      if (block.startsWith("## ")) {
        return `<h2 class="font-serif text-2xl md:text-3xl font-bold mt-12 mb-4 text-foreground">${escapeHtml(block.replace("## ", ""))}</h2>`
      }
      if (block.split("\n").every((l) => l.startsWith("- "))) {
        const items = block.split("\n").map((l) => `<li class="text-[16.5px] md:text-[18px] text-foreground/85 leading-[1.8]">${escapeHtml(l.replace(/^- /, ""))}</li>`).join("")
        return `<ul class="mb-5 pl-6 space-y-2">${items}</ul>`
      }
      if (block.split("\n").every((l) => /^\d+\.\s/.test(l))) {
        const items = block.split("\n").map((l) => `<li class="text-[16.5px] md:text-[18px] text-foreground/85 leading-[1.8]">${escapeHtml(l.replace(/^\d+\.\s/, ""))}</li>`).join("")
        return `<ol class="mb-5 pl-6 space-y-2">${items}</ol>`
      }
      if (block === "---") {
        return `<hr class="my-12 border-border" />`
      }
      const processed = block
        .split("\n")
        .map((line) => {
          if (line.startsWith("### ")) return `<h3 class="font-serif text-xl md:text-2xl font-semibold mt-8 mb-3 text-foreground">${escapeHtml(line.replace("### ", ""))}</h3>`
          if (line.startsWith("## ")) return `<h2 class="font-serif text-2xl md:text-3xl font-bold mt-12 mb-4 text-foreground">${escapeHtml(line.replace("## ", ""))}</h2>`
          if (line.startsWith("> ")) return `<blockquote class="border-l-[3px] border-foreground/20 pl-6 my-8 italic text-[17px] md:text-[19px] text-foreground/80 font-serif">${escapeHtml(line.replace(/^>\s?/, ""))}</blockquote>`
          if (line.startsWith("#### ")) return `<h4 class="font-serif text-lg font-semibold mt-6 mb-2 text-foreground">${escapeHtml(line.replace("#### ", ""))}</h4>`
          const inlineImg = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
          if (inlineImg) return `<figure class="my-8"><img src="${escapeHtml(inlineImg[2])}" alt="${escapeHtml(inlineImg[1])}" class="w-full rounded-xl shadow-md" loading="lazy" decoding="async" style="object-fit:cover;aspect-ratio:16/9" /></figure>`
          return escapeHtml(line)
        })
        .join("<br/>")

      return `<p class="mb-5 leading-[1.8] text-[16.5px] md:text-[18px] text-foreground/85">${processed}</p>`
    })
    .join("\n")

  return (
    <div
      className={cn("prose-article", className)}
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  )
}
