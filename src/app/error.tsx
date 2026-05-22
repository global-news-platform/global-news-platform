"use client"

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-headline text-6xl font-bold">500</h1>
        <h2 className="mt-4 text-xl font-semibold">کچھ غلط ہو گیا</h2>
        <p className="mt-2 text-muted-foreground">
          ایک غیر متوقع غلطی پیش آگئی۔ براہ کرم دوبارہ کوشش کریں۔
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          دوبارہ کوشش کریں
        </button>
      </div>
    </div>
  )
}
