import type { Metadata } from "next"

import { Container } from "@/components/common/container"
import { generateMetadata } from "@/lib/seo"
import { siteConfig } from "@/lib/constants"

export const metadata: Metadata = generateMetadata({
  title: "ہمارے بارے میں — ہمارا مشن اور ادارتی معیارات",
  description:
    "پاکستان نیوز کے بارے میں جانیں — ہمارا مشن، ادارتی معیارات، اور آزاد، قابل اعتماد صحافت سے وابستگی۔",
  path: "/about-us",
})

export default function AboutPage() {
  return (
    <div className="py-8 md:py-12">
      <Container size="sm">
        <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
          {siteConfig.name} کے بارے میں
        </h1>
        <div className="mt-2 h-1 w-16 bg-foreground" />

        <div className="mt-8 space-y-8 text-base leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-headline text-xl font-semibold">ہمارا مشن</h2>
            <p className="mt-3">
              {siteConfig.name} جامع اور آزاد کوریج فراہم کرتا ہے ان واقعات کی جو ہماری دنیا کو تشکیل دیتے ہیں۔
              ہم یقین رکھتے ہیں کہ معیاری صحافت باخبر معاشروں اور جمہوری مکالمے کے لیے ضروری ہے۔
              ہماری نیوز روم تجربہ کار نامہ نگاروں، ڈیٹا صحافیوں اور تجزیہ کاروں کو یکجا کرتی ہے
              جو حقائق پر مبنی اور باریک بینی سے رپورٹنگ کے لیے پرعزم ہیں۔
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">ادارتی معیارات</h2>
            <p className="mt-3">
              {siteConfig.name} کی طرف سے شائع ہونے والا ہر مضمون ایک سخت ادارتی عمل سے گزرتا ہے:
            </p>
            <ul className="mt-4 space-y-3">
              {[
                {
                  title: "درستگی اولین ترجیح",
                  desc: "تمام حقائق اشاعت سے پہلے متعدد ذرائع سے تصدیق شدہ ہوتے ہیں۔ تصحیحات فوری اور شفاف طریقے سے جاری کی جاتی ہیں۔",
                },
                {
                  title: "آزادی",
                  desc: "ہم سیاسی، کارپوریٹ یا نظریاتی اثر و رسوخ سے سخت ادارتی آزادی برقرار رکھتے ہیں۔ ہماری رپورٹنگ عوامی مفید کی خدمت کرتی ہے۔",
                },
                {
                  title: "انصاف اور سیاق و سباق",
                  desc: "کہانیاں اپنے مکمل سیاق و سباق کے ساتھ پیش کی جاتی ہیں، بغیر تحریف یا سنسنی خیزی کے متنوع نقطہ نظر کی نمائندگی کرتی ہیں۔",
                },
                {
                  title: "احتساب",
                  desc: "ہم اپنے آپ کو شفافیت کے اسی معیار پر رکھتے ہیں جس کا مطالبہ ہم ان لوگوں سے کرتے ہیں جن کا ہم احاطہ کرتے ہیں۔ ہماری تصحیح کی پالیسی عوامی طور پر دستاویزی ہے۔",
                },
              ].map((item) => (
                <li key={item.title} className="border-r-[3px] border-border pr-4">
                  <strong className="font-semibold">{item.title}:</strong> {item.desc}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">ہماری کوریج</h2>
            <p className="mt-3">
              بریکنگ نیوز اور عالمی امور سے لے کر ٹیکنالوجی، سائنس، کاروبار، ثقافت،
              اور موسمیاتی تبدیلی تک — ہماری رپورٹنگ ہر اہم شعبے کا احاطہ کرتی ہے۔
              ہم روایتی صحافتی معیار کو جدید ڈیجیٹل کہانی سنانے کے ساتھ جوڑتے ہیں
              تاکہ آپ کو ایسی خبریں فراہم کر سکیں جو مستند اور قابل رسائی ہوں۔
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">رابطہ کریں</h2>
            <p className="mt-3">
              کوئی ٹپ، رائے یا استفسار ہے؟ ہماری ٹیم سے رابطہ کریں{" "}
              <a
                href={`mailto:contact@${new URL(siteConfig.url).hostname}`}
                className="underline decoration-foreground/20 underline-offset-2 transition-colors hover:decoration-foreground/60"
              >
                contact@{new URL(siteConfig.url).hostname}
              </a>
              پر۔
            </p>
          </section>
        </div>
      </Container>
    </div>
  )
}
