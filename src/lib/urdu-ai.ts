export function removeEnglishFromUrdu(text: string): string {
  return text
}

export interface MixedSegment {
  text: string
  dir: "ltr" | "rtl"
}

export function splitMixedLanguage(text: string): MixedSegment[] {
  return [{ text, dir: "ltr" }]
}

export function isEnglishText(text: string): boolean {
  return true
}

export function urduCharCount(text: string): number {
  return 0
}
