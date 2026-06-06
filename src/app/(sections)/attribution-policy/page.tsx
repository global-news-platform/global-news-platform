import type { Metadata } from "next"

import { Container } from "@/components/common/container"
import { generateMetadata } from "@/lib/seo"
import { siteConfig } from "@/lib/constants"

export const metadata: Metadata = generateMetadata({
  title: "انتساب کی پالیسی — خبروں کے ذرائع کا سہرا",
  description:
    "پاکستان نیوز ہب کی انتساب کی پالیسی — ہم خبروں کے اصل ذرائع کو کیسے کریڈٹ دیتے ہیں اور ان سے منسلک ہوتے ہیں۔",
  path: "/attribution-policy",
})

export default function AttributionPolicyPage() {
  return (
    <div className="py-8 md:py-12">
      <Container size="sm">
        <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
          انتساب کی پالیسی
        </h1>
        <div className="mt-2 h-1 w-16 bg-foreground" />
        <div className="mt-8 space-y-8 text-base leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-headline text-xl font-semibold">ہمارا عزم</h2>
            <p className="mt-3">
              {siteConfig.name} میں، ہم صحافتی اخلاقیات اور دانشورانہ املاک کے حقوق کا احترام
              کرتے ہیں۔ ہم سمجھتے ہیں کہ خبروں کی جمع آوری صرف اس وقت معنی رکھتی ہے جب اصل
              ذرائع کو مناسب طور پر کریڈٹ دیا جائے۔ یہ پالیسی بتاتی ہے کہ ہم اپنے مواد میں
              ذرائع کو کیسے منسوب کرتے ہیں۔
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">ہم کن ذرائع سے خبریں لیتے ہیں</h2>
            <p className="mt-3">
              ہم مندرجہ ذیل قسم کے ذرائع سے خبریں جمع کرتے ہیں:
            </p>
            <ul className="mt-3 list-disc space-y-2 pr-6">
              <li>
                <strong>پاکستانی خبروں کے ادارے:</strong> ڈان (Dawn)، ایکسپریس ٹریبیون (Express Tribune)،
                دی نیوز (The News International)، جیو نیوز (Geo News)، سماء ٹی وی (Samaa TV)،
                اے آر وائی نیوز (ARY News)، 92 نیوز (92 News)، اور دیگر
              </li>
              <li>
                <strong>بین الاقوامی خبروں کے ادارے:</strong> بی بی سی (BBC)، الجزیرہ (Al Jazeera)،
                سی این این (CNN)، دی گارڈین (The Guardian)، روئٹرز (Reuters)، اے ایف پی (AFP)،
                اور دیگر
              </li>
              <li>
                <strong>خصوصی شعبوں کے ذرائع:</strong> سرکاری پریس ریلیز، تحقیقی رپورٹس،
                اور دیگر قابل اعتماد ذرائع
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">انتساب کے اصول</h2>
            <p className="mt-3">
              ہم انتساب کے لیے درج ذیل اصولوں پر عمل کرتے ہیں:
            </p>
            <ul className="mt-3 list-disc space-y-2 pr-6">
              <li>
                <strong>واضح نام:</strong> ہر خبر کے خلاصے پر اصل ناشر کا نام واضح طور پر
                ظاہر کیا جاتا ہے (مثلاً "ماخذ: ڈان")
              </li>
              <li>
                <strong>براہ راست لنک:</strong> ہر خلاصے کے ساتھ اصل مضمون کا براہ راست لنک
                فراہم کیا جاتا ہے تاکہ قارئین مکمل مضمون پڑھ سکیں
              </li>
              <li>
                <strong>تاریخ:</strong> اصل اشاعت کی تاریخ درج کی جاتی ہے
              </li>
              <li>
                <strong>مصنف:</strong> جہاں ممکن ہو، اصل مصنف کا نام بھی شامل کیا جاتا ہے
              </li>
              <li>
                <strong>مناسب فاصلہ:</strong> انتساب اس طرح رکھا جاتا ہے کہ قارئین آسانی سے
                دیکھ سکیں کہ معلومات کہاں سے آئی ہیں
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">خلاصے اور اقتباسات</h2>
            <p className="mt-3">
              ہم اصل مضامین کے صرف مختصر خلاصے (عام طور پر 30-50 الفاظ) یا اقتباسات استعمال
              کرتے ہیں۔ ہم اصل مضمون کے مرکزی نکات کو اپنے الفاظ میں پیش کرتے ہیں اور کبھی
              بھی کسی مضمون کو مکمل طور پر دوبارہ شائع نہیں کرتے۔ جہاں کوئی جملہ براہ راست
              نقل کیا جاتا ہے، اسے کوٹیشن مارکس میں رکھا جاتا ہے اور مناسب انتساب دیا جاتا ہے۔
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">منصفانہ استعمال اور انتساب</h2>
            <p className="mt-3">
              ہمارا انتساب کا طریقہ کار منصفانہ استعمال (fair use) کے اصولوں کے مطابق ہے:
            </p>
            <ul className="mt-3 list-disc space-y-2 pr-6">
              <li>ہم اصل کام کو تبدیل کرکے اسے خلاصے کی شکل میں پیش کرتے ہیں</li>
              <li>ہمارا استعمال غیر تجارتی اور معلوماتی ہے</li>
              <li>ہم صرف وہی حصہ استعمال کرتے ہیں جو خبر کا خلاصہ پیش کرنے کے لیے ضروری ہے</li>
              <li>ہماری سائٹ اصل ناشروں کو اضافی ٹریفک بھیجتی ہے</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">اگر آپ کو انتساب کا مسئلہ درپیش ہے</h2>
            <p className="mt-3">
              اگر آپ کو یقین ہے کہ کسی خبر میں مناسب انتساب نہیں کیا گیا ہے یا کسی بھی طرح
              سے آپ کے حقوق کی خلاف ورزی ہو رہی ہے، تو براہ کرم ہم سے فوری رابطہ کریں۔ ہم
              درست معلومات کی تصدیق کرنے اور فوری طور پر کوئی بھی ضروری تبدیلیاں کرنے کے لیے
              پرعزم ہیں۔
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">رابطہ</h2>
            <p className="mt-3">
              انتساب سے متعلقہ سوالات کے لیے براہ کرم ہم سے
              {" "}<a
                href={`mailto:attribution@${new URL(siteConfig.url).hostname}`}
                className="underline decoration-foreground/20 underline-offset-2 transition-colors hover:decoration-foreground/60"
              >attribution@{new URL(siteConfig.url).hostname}</a>
              {" "}پر رابطہ کریں۔
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
