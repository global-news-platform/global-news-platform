export function removeEnglishFromUrdu(): string {
  return ""
}

export interface MixedSegment {
  text: string
  dir: "ltr" | "rtl"
}

export function splitMixedLanguage(text: string): MixedSegment[] {
  return [{ text, dir: "ltr" }]
}

export function isEnglishText(): boolean {
  return true
}

export function urduCharCount(): number {
  return 0
}
