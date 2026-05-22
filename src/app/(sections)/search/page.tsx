import { getArticleLinks } from "@/lib/articles"
import { SearchPageClient } from "./search-client"

export const dynamic = "force-static"
export const revalidate = 3600

export default async function SearchPage() {
  const articles = await getArticleLinks()
  return <SearchPageClient articles={articles} />
}
