import type { Metadata } from "next"

import { Container } from "@/components/common/container"
import { generateMetadata } from "@/lib/seo"
import { siteConfig } from "@/lib/constants"

export const metadata: Metadata = generateMetadata({
  title: "ہمارے بارے میں — ہمارا مشن، ایگریگیشن ماڈل اور ادارتی معیارات",
  description:
    "پاکستان نیوز ہب کے بارے میں جانیں — ہمارا نیوز ایگریگیشن ماڈل، ذرائع کا انتساب، منصفانہ استعمال کے اصول، اور قابل اعتماد صحافت سے وابستگی۔",
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
              {siteConfig.name} ایک جامع نیوز ایگریگیشن پلیٹ فارم ہے جو پاکستان اور دنیا بھر سے
              تازہ ترین خبریں ایک جگہ پیش کرتا ہے۔ ہم مختلف پاکستانی اور بین الاقوامی خبروں کے
              ذرائع سے خبروں کے خلاصے اور اقتباسات مرتب کرکے قارئین کو باخبر رکھنے میں مدد
              دیتے ہیں۔ ہمارا مقصد صارفین کو ایک ہی پلیٹ فارم پر متنوع نقطہ نظر تک رسائی فراہم
              کرنا ہے۔
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">نیوز ایگریگیشن ماڈل</h2>
            <p className="mt-3">
              {siteConfig.name} ایک خالص نیوز ایگریگیٹر ہے۔ ہم خبروں کے مضامین کو مکمل طور پر
              دوبارہ شائع نہیں کرتے۔ اس کے بجائے:
            </p>
            <ul className="mt-4 space-y-3">
              {[
                {
                  title: "مختصر خلاصے",
                  desc: "ہم اصل مضامین کے مختصر خلاصے (عام طور پر 30-50 الفاظ) اپنے الفاظ میں پیش کرتے ہیں۔",
                },
                {
                  title: "ماخذ کا انتساب",
                  desc: "ہر خبر کے ساتھ اصل ناشر کا نام اور براہ راست لنک فراہم کیا جاتا ہے تاکہ قارئین مکمل مضمون پڑھ سکیں۔",
                },
                {
                  title: "منصفانہ استعمال",
                  desc: "ہم copyright law کے تحت منصفانہ استعمال (fair use) کے اصولوں پر عمل کرتے ہیں۔ ہمارے خلاصے اصل مضامین کے متبادل نہیں بلکہ ان کی طرف رہنمائی کرتے ہیں۔",
                },
              ].map((item) => (
                <li key={item.title} className="border-r-[3px] border-border pr-4">
                  <strong className="font-semibold">{item.title}:</strong> {item.desc}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">ہمارے ذرائع</h2>
            <p className="mt-3">
              ہم پاکستان اور دنیا بھر کے معروف خبروں کے اداروں سے خبریں جمع کرتے ہیں، جن میں
              ڈان (Dawn)، ایکسپریس ٹریبیون (Express Tribune)، دی نیوز (The News International)،
              جیو نیوز (Geo News)، بی بی سی اردو (BBC Urdu)، الجزیرہ اردو (Al Jazeera Urdu)،
              اور دیگر شامل ہیں۔ تمام کاپی رائٹس بالترتیب ان کے اصل ناشروں کے پاس محفوظ ہیں۔
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
            <h2 className="font-headline text-xl font-semibold">قانونی تعمیل</h2>
            <p className="mt-3">
              ہم ڈیجیٹل ملینیم کاپی رائٹ ایکٹ (DMCA) اور قابل اطلاق کاپی رائٹ قوانین کی مکمل
              تعمیل کرتے ہیں۔ ہماری{" "}
              <a href="/copyright-policy" className="underline decoration-foreground/20 underline-offset-2 transition-colors hover:decoration-foreground/60">
                کاپی رائٹ پالیسی
              </a>
              ،{" "}
              <a href="/attribution-policy" className="underline decoration-foreground/20 underline-offset-2 transition-colors hover:decoration-foreground/60">
                انتساب کی پالیسی
              </a>
              ، اور{" "}
              <a href="/terms-of-service" className="underline decoration-foreground/20 underline-offset-2 transition-colors hover:decoration-foreground/60">
                خدمات کی شرائط
              </a>
              {" "}کے بارے میں مزید جانیں۔
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
              {" "}پر۔
            </p>
          </section>
        </div>
      </Container>
    </div>
  )
}
