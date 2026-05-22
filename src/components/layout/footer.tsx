import Link from "next/link"
import { Globe, Rss, Twitter, Facebook, Linkedin, Mail } from "lucide-react"

const footerCategories = [
  { slug: "pakistan", name: "پاکستان" },
  { slug: "dunya", name: "دنیا" },
  { slug: "siasat", name: "سیاست" },
  { slug: "karobar", name: "کاروبار" },
  { slug: "technology", name: "ٹیکنالوجی" },
  { slug: "khel", name: "کھیل" },
  { slug: "sehat", name: "صحت" },
  { slug: "science", name: "سائنس" },
  { slug: "shobiz", name: "شوبز" },
  { slug: "mazhab", name: "مذہب" },
  { slug: "taleem", name: "تعلیم" },
  { slug: "raye", name: "رائے" },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/40 bg-primary text-primary-foreground">
      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-5 lg:px-6 xl:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                <Globe className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold">پاکستان نیوز</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-primary-foreground/70">
              پاکستان کا معتبر ترین خبروں کا پلیٹ فارم۔ پاکستان، دنیا، سیاست، کاروبار، ٹیکنالوجی، کھیل اور دیگر شعبوں کی تازہ ترین خبریں۔
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a
                href="https://twitter.com/pakistannews"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-white/10 p-2 text-primary-foreground/80 transition-colors hover:bg-white/20 hover:text-primary-foreground"
                aria-label="ٹویٹر"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com/pakistannews"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-white/10 p-2 text-primary-foreground/80 transition-colors hover:bg-white/20 hover:text-primary-foreground"
                aria-label="فیس بک"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com/company/pakistannews"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-white/10 p-2 text-primary-foreground/80 transition-colors hover:bg-white/20 hover:text-primary-foreground"
                aria-label="لنکڈ ان"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="/feed.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-white/10 p-2 text-primary-foreground/80 transition-colors hover:bg-white/20 hover:text-primary-foreground"
                aria-label="آر ایس ایس فیڈ"
              >
                <Rss className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Sections */}
          <div>
            <h4 className="mb-4 text-[12px] font-bold uppercase tracking-[0.15em] text-primary-foreground/60">
              زمرہ جات
            </h4>
            <ul className="space-y-2">
              {footerCategories.slice(0, 6).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-sm text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More sections */}
          <div>
            <h4 className="mb-4 text-[12px] font-bold uppercase tracking-[0.15em] text-primary-foreground/60">
              مزید
            </h4>
            <ul className="space-y-2">
              {footerCategories.slice(6, 12).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-sm text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="mb-4 text-[12px] font-bold uppercase tracking-[0.15em] text-primary-foreground/60">
              فوری لنکس
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/breaking"
                  className="text-sm text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                >
                  بریکنگ نیوز
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="text-sm text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                >
                  خبریں تلاش کریں
                </Link>
              </li>
              <li>
                <Link
                  href="/about-us"
                  className="text-sm text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                >
                  ہمارے بارے میں
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:contact@pakistan-news.news`}
                  className="flex items-center gap-2 text-sm text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                >
                  <Mail className="h-3.5 w-3.5" />
                  contact@pakistan-news.news
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 sm:flex-row sm:px-5 lg:px-6 xl:px-8">
          <p className="text-xs text-primary-foreground/60">
            &copy; {currentYear} پاکستان نیوز. جملہ حقوق محفوظ ہیں۔
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-primary-foreground/60">
              پاکستان کی معتبر خبریں
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
