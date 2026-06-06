import type { Metadata } from "next"

import { Container } from "@/components/common/container"
import { generateMetadata } from "@/lib/seo"
import { siteConfig } from "@/lib/constants"

export const metadata: Metadata = generateMetadata({
  title: "ڈی ایم سی اے نوٹس — کاپی رائٹ کے خلاف ورزی کی اطلاع دیں",
  description:
    "پاکستان نیوز ہب کے لیے ڈی ایم سی اے نوٹس — اگر آپ کو یقین ہے کہ آپ کے کاپی رائٹ والے مواد کی خلاف ورزی ہو رہی ہے تو ہم سے رابطہ کریں۔",
  path: "/dmca",
})

export default function DmcaPage() {
  return (
    <div className="py-8 md:py-12">
      <Container size="sm">
        <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
          ڈی ایم سی اے نوٹس
        </h1>
        <div className="mt-2 h-1 w-16 bg-foreground" />
        <div className="mt-8 space-y-8 text-base leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-headline text-xl font-semibold">ڈیجیٹل ملینیم کاپی رائٹ ایکٹ</h2>
            <p className="mt-3">
              {siteConfig.name} ڈیجیٹل ملینیم کاپی رائٹ ایکٹ (DMCA) کی تعمیل کرتا ہے۔ اگر آپ
              کو یقین ہے کہ ہماری ویب سائٹ پر موجود کوئی مواد آپ کے کاپی رائٹ کی خلاف ورزی کرتا
              ہے، تو آپ ذیل میں دی گئی ہدایات کے مطابق DMCA نوٹس دائر کر سکتے ہیں۔ ہم جائز
              نوٹسوں کا فوری جواب دیں گے۔
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">نوٹس کیسے دائر کریں</h2>
            <p className="mt-3">
              DMCA نوٹس دائر کرنے کے لیے، براہ کرم درج ذیل معلومات فراہم کریں (یہ معلومات
              کاپی رائٹ قانون کی ضروریات کے مطابق ہونی چاہئیں):
            </p>
            <ol className="mt-3 list-decimal space-y-3 pr-6">
              <li>
                <strong>کاپی رائٹ شدہ کام کی شناخت:</strong> اس کام (کاموں) کی تفصیل فراہم
                کریں جس کے بارے میں آپ کو یقین ہے کہ خلاف ورزی ہو رہی ہے۔
              </li>
              <li>
                <strong>خلاف ورزی کرنے والے مواد کی شناخت:</strong> {siteConfig.name} پر اس
                مواد کا براہ راست URL فراہم کریں جس کے بارے میں آپ کو یقین ہے کہ خلاف ورزی
                کر رہا ہے۔
              </li>
              <li>
                <strong>آپ کی رابطہ معلومات:</strong> آپ کا نام، پتہ، فون نمبر، اور ای میل
                ایڈریس فراہم کریں۔
              </li>
              <li>
                <strong>نیک نیتی کا بیان:</strong> ایک بیان کہ آپ نیک نیتی سے یقین رکھتے
                ہیں کہ مواد کا استعمال کاپی رائٹ کے مالک، اس کے ایجنٹ، یا قانون کے ذریعے
                مجاز نہیں ہے۔
              </li>
              <li>
                <strong>درستگی کا بیان:</strong> ایک بیان کہ نوٹس میں دی گئی معلومات درست
                ہے اور، غلط بیانی کے انجام سے آگاہ ہوتے ہوئے، کہ آپ کاپی رائٹ کے مالک ہیں
                یا مالک کی طرف سے کام کرنے کے مجاز ہیں۔
              </li>
              <li>
                <strong>دستخط:</strong> آپ کے جسمانی یا الیکٹرانک دستخط۔
              </li>
            </ol>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">مقابلہ نوٹس (Counter-Notice)</h2>
            <p className="mt-3">
              اگر آپ کو یقین ہے کہ آپ کا مواد غلطی سے یا غلط شناخت کی وجہ سے ہٹا دیا گیا تھا،
              تو آپ مقابلہ نوٹس دائر کر سکتے ہیں۔ مقابلہ نوٹس میں درج ذیل شامل ہونا چاہیے:
            </p>
            <ul className="mt-3 list-disc space-y-2 pr-6">
              <li>ہٹائے گئے مواد کی شناخت اور وہ مقام جہاں وہ ہٹائے جانے سے پہلے ظاہر ہوا تھا</li>
              <li>ایک بیان کہ آپ نیک نیتی سے یقین رکھتے ہیں کہ مواد غلطی سے یا غلط شناخت کی وجہ سے ہٹایا گیا تھا</li>
              <li>آپ کا نام، پتہ، اور فون نمبر</li>
              <li>ایک بیان کہ آپ اپنے علاقے کی وفاقی عدالت کے دائرہ اختیار سے اتفاق کرتے ہیں</li>
              <li>آپ کے جسمانی یا الیکٹرانک دستخط</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">ہمارے مجاز DMCA ایجنٹ سے رابطہ کریں</h2>
            <p className="mt-3">
              براہ کرم اپنے DMCA نوٹس یا مقابلہ نوٹس مندرجہ ذیل پتے پر بھیجیں:
            </p>
            <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
              <p className="font-semibold">DMCA ایجنٹ — {siteConfig.name}</p>
              <p className="mt-1">
                ای میل:{" "}
                <a
                  href={`mailto:dmca@${new URL(siteConfig.url).hostname}`}
                  className="underline decoration-foreground/20 underline-offset-2 transition-colors hover:decoration-foreground/60"
                >
                  dmca@{new URL(siteConfig.url).hostname}
                </a>
              </p>
              <p className="mt-1">
                متبادل ای میل:{" "}
                <a
                  href={`mailto:legal@${new URL(siteConfig.url).hostname}`}
                  className="underline decoration-foreground/20 underline-offset-2 transition-colors hover:decoration-foreground/60"
                >
                  legal@{new URL(siteConfig.url).hostname}
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">نوٹس پر کارروائی</h2>
            <p className="mt-3">
              جب ہمیں ایک مکمل اور درست DMCA نوٹس موصول ہوتا ہے تو ہم:
            </p>
            <ul className="mt-3 list-disc space-y-2 pr-6">
              <li>فوری طور پر مبینہ خلاف ورزی کرنے والے مواد تک رسائی کو ہٹا دیں گے یا غیر فعال کر دیں گے</li>
              <li>مواد فراہم کرنے والے کو مطلع کریں گے (اگر قابل اطلاق ہو)</li>
              <li>متاثرہ فریقوں کو مقابلہ نوٹس دائر کرنے کا موقع فراہم کریں گے</li>
              <li>قانون کے ذریعے درکار تمام ریکارڈز کو برقرار رکھیں گے</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">تکرار کرنے والے خلاف ورزی کرنے والوں کی پالیسی</h2>
            <p className="mt-3">
              {siteConfig.name} مناسب حالات میں ان صارفین یا مواد فراہم کرنے والوں کے اکاؤنٹس
              کو ختم کرنے کی پالیسی رکھتا ہے جو بار بار کاپی رائٹ کی خلاف ورزی کرتے پائے جائیں۔
            </p>
          </section>

          <p className="pt-4 text-sm text-foreground/60">
            آخری تازہ کاری: 1 جون 2026
          </p>
        </div>
      </Container>
    </div>
  )
}
