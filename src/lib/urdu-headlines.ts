export async function generateUrduHeadline(title: string): Promise<string> {
  return title
}

export async function generateUrduExcerpt(title: string, excerpt: string): Promise<string> {
  return excerpt || title
}

export function hasSufficientUrdu(): boolean {
  return false
}

export function categorizeEnglishCategory(cat: string): string {
  return cat
}

export function detectCategoryMismatch(): string | null {
  return null
}
