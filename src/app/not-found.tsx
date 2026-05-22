import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-headline text-6xl font-bold">404</h1>
        <h2 className="mt-4 text-xl font-semibold">صفحہ نہیں ملا</h2>
        <p className="mt-2 text-muted-foreground">
          آپ جس صفحے کی تلاش کر رہے ہیں وہ موجود نہیں ہے یا منتقل کر دیا گیا ہے۔
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          صفحہ اول پر جائیں
        </Link>
      </div>
    </div>
  )
}
