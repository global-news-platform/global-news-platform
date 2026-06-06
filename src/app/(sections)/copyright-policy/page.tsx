import type { Metadata } from "next"

import { Container } from "@/components/common/container"
import { generateMetadata } from "@/lib/seo"
import { siteConfig } from "@/lib/constants"

export const metadata: Metadata = generateMetadata({
  title: "کاپی رائٹ پالیسی — منصفانہ استعمال اور انتساب",
  description:
    "پاکستان نیوز ہب کی کاپی رائٹ پالیسی — منصفانہ استعمال (Fair Use)، ڈی ایم سی اے کی تعمیل، اور خبروں کے ذرائع کے انتساب کے بارے میں معلومات۔",
  path: "/copyright-policy",
})

export default function CopyrightPolicyPage() {
  return (
    <div className="py-8 md:py-12">
      <Container size="sm">
        <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
          کاپی رائٹ پالیسی
        </h1>
        <div className="mt-2 h-1 w-16 bg-foreground" />
        <div className="mt-8 space-y-8 text-base leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-headline text-xl font-semibold">ہمارا نیوز ایگریگیشن ماڈل</h2>
            <p className="mt-3">
              {siteConfig.name} ایک نیوز ایگریگیشن پلیٹ فارم ہے جو مختلف پاکستانی اور بین الاقوامی
              خبروں کے ذرائع سے خبروں کے خلاصے اور مختصر اقتباسات پیش کرتا ہے۔ ہم اصل مضامین کو مکمل
              طور پر دوبارہ شائع نہیں کرتے۔ اس کے بجائے، ہم خبر کا ایک مختصر خلاصہ (عام طور پر 2-3
              جملے) فراہم کرتے ہیں اور قارئین کو مکمل مضمون کے لیے اصل ماخذ کی طرف رجوع کرتے ہیں۔
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">منصفانہ استعمال (Fair Use)</h2>
            <p className="mt-3">
              {siteConfig.name} copyright law کے تحت منصفانہ استعمال (fair use) کے اصولوں پر عمل
              کرتا ہے۔ ہمارا مواد درج ذیل معیارات پر پورا اترتا ہے:
            </p>
            <ul className="mt-3 list-disc space-y-2 pr-6">
              <li>
                <strong>مقصد اور کردار:</strong> ہمارا استعمال تعلیمی، معلوماتی اور خبروں کی فراہمی
                پر مبنی ہے، نہ کہ تجارتی۔ ہم اصل مواد کو تبدیل کرکے خلاصے کی شکل میں پیش کرتے ہیں۔
              </li>
              <li>
                <strong>اصل کام کی نوعیت:</strong> ہم صرف شائع شدہ خبروں کے مضامین کا خلاصہ پیش کرتے
                ہیں، جو خود معلوماتی نوعیت کے ہوتے ہیں۔
              </li>
              <li>
                <strong>استعمال شدہ حصے کا حجم:</strong> ہم اصل مضمون کا صرف ایک چھوٹا سا حصہ (خلاصہ
                یا اقتباس) استعمال کرتے ہیں، مکمل مضمون نہیں۔
              </li>
              <li>
                <strong>مارکیٹ پر اثر:</strong> ہمارے خلاصے اصل مضامین کے متبادل نہیں ہیں بلکہ
                قارئین کو اصل ماخذ کی طرف راغب کرتے ہیں، جس سے اصل ناشروں کو ٹریفک اور آمدنی
                حاصل ہوتی ہے۔
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">انتساب (Attribution)</h2>
            <p className="mt-3">
              ہر خبر کے خلاصے کے ساتھ ہم اصل ماخذ کا نام اور براہ راست لنک فراہم کرتے ہیں۔ ہم
              انتساب کے لیے درج ذیل اصولوں پر عمل کرتے ہیں:
            </p>
            <ul className="mt-3 list-disc space-y-2 pr-6">
              <li>اصل ناشر کا نام واضح طور پر ظاہر کیا جاتا ہے</li>
              <li>اصل مضمون کا براہ راست لنک فراہم کیا جاتا ہے</li>
              <li>اشاعت کی تاریخ درج کی جاتی ہے</li>
              <li>مصنف کا نام (دستیاب ہونے پر) شامل کیا جاتا ہے</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">کاپی رائٹ کی ملکیت</h2>
            <p className="mt-3">
              {siteConfig.name} پر شائع ہونے والے خبروں کے خلاصے اور اصل تحریری مواد ہماری
              دانشورانہ املاک ہیں۔ تاہم، وہ اصل خبریں اور مضامین جن کا ہم خلاصہ پیش کرتے ہیں ان
              کے کاپی رائٹس بالترتیب ان کے اصل ناشروں کے پاس محفوظ ہیں۔ ہم ان کے حقوق کا احترام
              کرتے ہیں اور صرف منصفانہ استعمال کے دائرے میں مواد استعمال کرتے ہیں۔
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">ڈی ایم سی اے کی تعمیل</h2>
            <p className="mt-3">
              ہم ڈیجیٹل ملینیم کاپی رائٹ ایکٹ (DMCA) کی تعمیل کرتے ہیں۔ اگر آپ کو یقین ہے کہ
              ہماری سائٹ پر کوئی مواد آپ کے کاپی رائٹ کی خلاف ورزی کرتا ہے، تو براہ کرم ہمیں
              DMCA نوٹس بھیجیں۔ ہم جائز نوٹسوں کا فوری جواب دیں گے اور خلاف ورزی کرنے والے مواد
              کو ہٹا دیں گے۔ براہ کرم ہماری{" "}
              <a
                href="/dmca"
                className="underline decoration-foreground/20 underline-offset-2 transition-colors hover:decoration-foreground/60"
              >
                ڈی ایم سی اے نوٹس
              </a>{" "}
              صفحہ ملاحظہ کریں۔
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">رابطہ</h2>
            <p className="mt-3">
              کاپی رائٹ سے متعلقہ سوالات یا خدشات کے لیے براہ کرم ہم سے
              {" "}<a
                href={`mailto:copyright@${new URL(siteConfig.url).hostname}`}
                className="underline decoration-foreground/20 underline-offset-2 transition-colors hover:decoration-foreground/60"
              >copyright@{new URL(siteConfig.url).hostname}</a>
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
