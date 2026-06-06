import type { Metadata } from "next"

import { Container } from "@/components/common/container"
import { generateMetadata } from "@/lib/seo"
import { siteConfig } from "@/lib/constants"

export const metadata: Metadata = generateMetadata({
  title: "خدمات کی شرائط — طے شدہ شرائط و ضوابط",
  description:
    "پاکستان نیوز ہب کے خدمات کی شرائط — ہماری ویب سائٹ کے استعمال کے قواعد، ذمہ داریاں اور صارف کے حقوق۔",
  path: "/terms-of-service",
})

export default function TermsOfServicePage() {
  return (
    <div className="py-8 md:py-12">
      <Container size="sm">
        <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
          خدمات کی شرائط
        </h1>
        <div className="mt-2 h-1 w-16 bg-foreground" />
        <div className="mt-8 space-y-8 text-base leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-headline text-xl font-semibold">تعارف</h2>
            <p className="mt-3">
              {siteConfig.name} ("ہم"، "ہمارا"، "ہماری") میں خوش آمدید۔ یہ خدمات کی شرائط ("شرائط") آپ کے
              {siteConfig.url} ویب سائٹ کے استعمال کو کنٹرول کرتی ہیں۔ ہماری سائٹ تک رسائی حاصل کرکے، آپ
              ان شرائط سے اتفاق کرتے ہیں۔ اگر آپ ان شرائط سے متفق نہیں ہیں تو براہ کرم سائٹ استعمال نہ کریں۔
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">خبروں کی جمع آوری کا ماڈل</h2>
            <p className="mt-3">
              {siteConfig.name} ایک نیوز ایگریگیٹر ہے۔ ہم مختلف پاکستانی اور بین الاقوامی خبروں کے ذرائع
              (بشمول ڈان، ایکسپریس ٹریبیون، دی نیوز، بی بی سی، الجزیرہ، اور دیگر) سے خبروں کے خلاصے اور
              اقتباسات شائع کرتے ہیں۔ ہم اصل مضامین کو مکمل طور پر دوبارہ پیش نہیں کرتے۔ ہر خلاصے کے ساتھ
              اصل ماخذ کا لنک اور انتساب فراہم کیا جاتا ہے۔ تمام کاپی رائٹس متعلقہ اصل ناشروں کے پاس محفوظ ہیں۔
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">قابل قبول استعمال</h2>
            <p className="mt-3">
              آپ اس سائٹ کو صرف قانونی مقاصد کے لیے اور ان شرائط کی تعمیل میں استعمال کرنے پر اتفاق کرتے ہیں۔
              آپ اس بات سے اتفاق کرتے ہیں کہ:
            </p>
            <ul className="mt-3 list-disc space-y-2 pr-6">
              <li>آپ سائٹ کے مواد کو کسی بھی غیر قانونی مقصد کے لیے استعمال نہیں کریں گے</li>
              <li>آپ سائٹ کے کام کو خلل انداز کرنے کی کوشش نہیں کریں گے</li>
              <li>آپ خودکار نظام (bots) کے ذریعے سائٹ سے ڈیٹا اکٹھا نہیں کریں گے</li>
              <li>آپ ہمارے انتساب کے لنکس کو ہٹانے یا تبدیل کرنے کی کوشش نہیں کریں گے</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">دانشورانہ املاک کے حقوق</h2>
            <p className="mt-3">
              {siteConfig.name} پر شائع ہونے والے خبروں کے خلاصے اور انتخاب ہمارے اپنے اصل کام ہیں اور
              کاپی رائٹ قانون کے ذریعے محفوظ ہیں۔ تاہم، وہ خبریں جن کا ہم خلاصہ پیش کرتے ہیں ان کے
              کاپی رائٹس بالترتیب ان کے اصل ناشروں کے پاس محفوظ ہیں۔ ہم منصفانہ استعمال (fair use) کے
              اصولوں کے تحت خبروں کے خلاصے اور اقتباسات پیش کرتے ہیں۔
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">ذمہ داری سے انکار</h2>
            <p className="mt-3">
              یہ ویب سائٹ "جیسا ہے" فراہم کی گئی ہے۔ ہم معلومات کی درستگی، مکمل ہونے، یا بروقت ہونے کی
              کوئی ضمانت نہیں دیتے۔ ہم کسی بھی قسم کے نقصان یا نقصان کے لیے ذمہ دار نہیں ہوں گے جو اس
              سائٹ کے استعمال سے پیدا ہو۔ ہمیشہ اصل ذرائع سے معلومات کی تصدیق کریں۔
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">تبدیلیاں</h2>
            <p className="mt-3">
              ہم کسی بھی وقت ان شرائط میں ترمیم کرنے کا حق محفوظ رکھتے ہیں۔ تبدیلیوں کے بعد سائٹ کا
              استعمال جاری رکھنا نئی شرائط کی قبولیت سمجھا جائے گا۔
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-semibold">رابطہ</h2>
            <p className="mt-3">
              ان شرائط کے بارے میں سوالات کے لیے براہ کرم ہم سے
              {" "}<a
                href={`mailto:legal@${new URL(siteConfig.url).hostname}`}
                className="underline decoration-foreground/20 underline-offset-2 transition-colors hover:decoration-foreground/60"
              >legal@{new URL(siteConfig.url).hostname}</a>
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
