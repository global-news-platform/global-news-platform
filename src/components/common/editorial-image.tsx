"use client"

import { SafeImage } from "@/components/ui/safe-image"
import type { SafeImageProps } from "@/components/ui/safe-image"

type EditorialImageProps = SafeImageProps

export function EditorialImage(props: EditorialImageProps) {
  return <SafeImage {...props} />
}
