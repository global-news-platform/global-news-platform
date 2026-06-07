export async function generateUrduHeadline(title: string): Promise<string> {
  return title
}

export async function generateUrduExcerpt(title: string, excerpt: string, body?: string): Promise<string> {
  return excerpt || title
}

export function hasSufficientUrdu(text: string): boolean {
  return false
}

export function categorizeEnglishCategory(cat: string): string {
  return cat
}

export function detectCategoryMismatch(title: string, categorySlug: string): string | null {
  return null
}
