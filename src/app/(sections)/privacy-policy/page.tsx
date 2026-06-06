import type { Metadata } from "next"
import { Container } from "@/components/common/container"
import { generateMetadata } from "@/lib/seo"
import { siteConfig, legalLinks } from "@/lib/constants"
import Link from "next/link"

export const metadata: Metadata = generateMetadata({
  title: "رازداری کی پالیسی — پرائیویسی پالیسی",
  description: `${siteConfig.nameUrdu} کی رازداری کی پالیسی — ہم آپ کی معلومات کو کیسے جمع، استعمال اور محفوظ کرتے ہیں۔`,
  path: "/privacy-policy",
})

export default function PrivacyPolicyPage() {
  return (
    <div className="py-8 md:py-12">
      <Container size="sm">
        <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
          رازداری کی پالیسی
        </h1>
        <div className="mt-2 h-1 w-16 bg-foreground" />
        <div className="mt-8 space-y-8 text-base leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-headline text-xl font-semibold">تعارف</h2>
            <p className="mt-3">
              {siteConfig.nameUrdu} آپ کی رازداری کا احترام کرتا ہے۔ یہ پالیسی بتاتی ہے کہ ہم آپ کی
              ذاتی معلومات کو کیسے جمع، استعمال اور محفوظ کرتے ہیں جب آپ ہماری ویب سائٹ استعمال کرتے ہیں۔
              ہماری ویب سائٹ خبروں کی جمع آوری اور پیشکش کا پلیٹ فارم ہے جو مختلف ذرائع سے حاصل کردہ خبروں کے خلاصے پیش کرتی ہے۔
            </p>
          </section>
          <section>
            <h2 className="font-headline text-xl font-semibold">ہم کون سی معلومات جمع کرتے ہیں</h2>
            <p className="mt-3">
              ہم درج ذیل معلومات جمع کر سکتے ہیں:
            </p>
            <ul className="mt-3 list-disc space-y-2 pr-6">
              <li>براؤزر کی معلومات اور کوکیز</li>
              <li>آئی پی ایڈریس اور مقام کی معلومات</li>
              <li>صفحہ کے وزٹس اور دیکھنے کا وقت</li>
              <li>تلاش کے سوالات</li>
              <li>تھیم کی ترجیحات (مقامی اسٹوریج میں محفوظ)</li>
            </ul>
          </section>
          <section>
            <h2 className="font-headline text-xl font-semibold">خبروں کے ذرائع اور تیسرے فریق کا مواد</h2>
            <p className="mt-3">
              ہماری ویب سائٹ مختلف خبر رساں اداروں سے حاصل کردہ خبروں کے خلاصے پیش کرتی ہے۔
              یہ مواد صرف اطلاعی مقاصد کے لیے ہے۔ ہم خبروں کے اصل ذرائع کا واضح طور پر تذکرہ کرتے ہیں
              اور مکمل مضامین کے لیے ان کے اصل صفحات کے لنکس فراہم کرتے ہیں۔
            </p>
            <p className="mt-3">
              جب آپ کسی بیرونی لنک پر کلک کرتے ہیں تو آپ تیسرے فریق کی ویب سائٹ پر چلے جاتے ہیں
              جس کی اپنی رازداری کی پالیسی ہو سکتی ہے۔ ہم تیسرے فریق کی سائٹس کے مواد یا طریقوں کے ذمہ دار نہیں ہیں۔
            </p>
          </section>
          <section>
            <h2 className="font-headline text-xl font-semibold">ہم معلومات کیسے استعمال کرتے ہیں</h2>
            <p className="mt-3">
              جمع کردہ معلومات کا استعمال ہم ویب سائٹ کو بہتر بنانے، ذاتی نوعیت کے مواد فراہم کرنے،
              اور صارف کے تجربے کو بڑھانے کے لیے کرتے ہیں۔ ہم آپ کی معلومات کو تیسرے فریق کو فروخت
              یا کرائے پر نہیں دیتے۔
            </p>
          </section>
          <section>
            <h2 className="font-headline text-xl font-semibold">آپ کے حقوق</h2>
            <p className="mt-3">
              آپ کو اپنی ذاتی معلومات تک رسائی، تصحیح یا حذف کرنے کا حق ہے۔
              اگر آپ چاہتے ہیں کہ آپ کا ڈیٹا حذف کیا جائے تو براہ کرم ہم سے رابطہ کریں۔
            </p>
          </section>
          <section>
            <h2 className="font-headline text-xl font-semibold">قانونی معلومات</h2>
            <p className="mt-3">
              ہماری پلیٹ فارم کی پالیسیوں کے بارے میں مزید معلومات کے لیے درج ذیل صفحات ملاحظہ کریں:
            </p>
            <ul className="mt-3 list-disc space-y-2 pr-6">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="underline decoration-foreground/20 underline-offset-2 transition-colors hover:decoration-foreground/60"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="font-headline text-xl font-semibold">رابطہ</h2>
            <p className="mt-3">
              اگر آپ کو اس پالیسی کے بارے میں کوئی سوال ہے تو براہ کرم ہم سے
              {" "}<a href={`mailto:privacy@${new URL(siteConfig.url).hostname}`}
                className="underline decoration-foreground/20 underline-offset-2 transition-colors hover:decoration-foreground/60"
              >privacy@{new URL(siteConfig.url).hostname}</a>{" "}
              پر رابطہ کریں۔
            </p>
          </section>
        </div>
      </Container>
    </div>
  )
}
