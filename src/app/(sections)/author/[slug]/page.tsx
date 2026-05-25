import type { Metadata } from "next"
import { SafeImage } from "@/components/ui/safe-image"
import { notFound } from "next/navigation"

import { Container } from "@/components/common/container"
import { ArticleCard } from "@/components/article/article-card"
import { AdSlot } from "@/components/common/ad-slot"
import { Breadcrumbs } from "@/components/article/breadcrumbs"

import { getArticlesByAuthor, getAuthorBySlug, getAllArticles } from "@/lib/articles"
import { authors } from "@/data/authors/authors"
import {
  absoluteUrl,
  generateMetadata as buildMetadata,
  generatePersonSchema,
} from "@/lib/seo"

export const dynamic = "force-static"
export const revalidate = 3600

export async function generateStaticParams() {
  const allArticles = (await getAllArticles()).slice(0, 250)
  const articleAuthorSlugs = allArticles.map((a) => a.authorSlug).filter(Boolean)
  const authorSlugs = authors.map((a) => a.slug)
  return [...new Set([...authorSlugs, ...articleAuthorSlugs])].map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const author = await getAuthorBySlug(slug)
  if (!author) return {}

  return buildMetadata({
    title: `${author.name} — مضامین، خبریں و تجزیہ`,
    description: author.bio || `${author.name} کے مضامین`,
    path: `/author/${slug}`,
  })
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const author = await getAuthorBySlug(slug)
  if (!author) notFound()

  const articles = await getArticlesByAuthor(slug)
  const authorUrl = absoluteUrl(`/author/${slug}`)

  const personSchema = generatePersonSchema(
    author.name,
    authorUrl,
    author.bio,
    author.role,
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      <div className="border-b border-border bg-secondary/30 py-8 md:py-12">
        <Container>
          <Breadcrumbs
            items={[
              { label: author.name },
            ]}
          />
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-muted md:h-24 md:w-24">
              {author.avatar ? (
                <SafeImage
                  src={author.avatar}
                  alt={author.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <span className="font-headline text-2xl font-bold text-muted-foreground">
                    {author.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="font-headline text-3xl font-bold md:text-4xl">
                {author.name}
              </h1>
              {author.role && (
                <p className="mt-1 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {author.role}
                </p>
              )}
              {author.bio && (
                <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
                  {author.bio}
                </p>
              )}
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                {author.twitter && (
                  <a
                    href={`https://twitter.com/${author.twitter.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-foreground"
                  >
                    {author.twitter}
                  </a>
                )}
                <span className="h-1 w-1 rounded-full bg-border" />
                <span>
                  {articles.length} مضمون{articles.length === 1 ? "" : "یں"}
                </span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <div className="py-8 md:py-12">
        <Container>
          <AdSlot variant="leaderboard" className="mb-8 hidden md:flex" label="اشتہار" />

          <div className="flex gap-8">
            <div className="min-w-0 flex-1">
              <h2 className="mb-6 text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground">
                {author.name} کے مضامین
              </h2>
              {articles.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {articles.map((article) => (
                    <ArticleCard
                      key={article.slug}
                      article={article}
                      variant="default"
                    />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <p className="text-muted-foreground">کوئی مضمون نہیں ملا۔</p>
                </div>
              )}
            </div>

            <aside className="hidden w-[260px] shrink-0 xl:block">
              <div className="sticky top-28 flex flex-col gap-6">
                <AdSlot variant="skyscraper" className="w-full" label="آپ کو پسند آ سکتا ہے" />
                <AdSlot variant="rectangle" className="w-full" label="سپانسر شدہ مواد" />
              </div>
            </aside>
          </div>
        </Container>
      </div>
    </>
  )
}
