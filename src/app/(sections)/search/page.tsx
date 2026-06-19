import { getArticleLinks } from "@/lib/articles"
import { SearchPageClient } from "./search-client"

export default async function SearchPage() {
  const articles = await getArticleLinks()
  return <SearchPageClient articles={articles} />
}
