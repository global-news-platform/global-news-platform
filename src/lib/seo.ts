import type { Metadata } from "next"
import type { ArticleMeta } from "@/types"
import { siteConfig } from "@/lib/constants"

export function absoluteUrl(path: string): string {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`
}

export function generateSeoSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: { "@id": `${siteConfig.url}/#organization` },
    inLanguage: "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "@id": `${siteConfig.url}/#organization`,
    url: siteConfig.url,
    name: siteConfig.name,
    alternateName: siteConfig.name,
    description: siteConfig.description,
    logo: {
      "@type": "ImageObject",
      "@id": `${siteConfig.url}/#logo`,
      url: absoluteUrl(siteConfig.logo),
      caption: siteConfig.name,
    },
    image: absoluteUrl(siteConfig.ogImage),
    sameAs: [
      siteConfig.links.twitter,
      siteConfig.links.facebook,
      siteConfig.links.linkedin,
      siteConfig.links.instagram,
    ].filter(Boolean),
    foundingDate: "2026",
    ethicsPolicy: absoluteUrl("/attribution-policy"),
    diversityPolicy: absoluteUrl("/attribution-policy"),
    publishingPrinciples: absoluteUrl("/about-us"),
    actionableFeedbackPolicy: absoluteUrl("/about-us"),
    correctionsPolicy: absoluteUrl("/about-us"),
  }
}

export function generateNewsArticleSchema(
  article: ArticleMeta,
  url: string,
  publisherLogo: string,
) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${url}#article`,
    isAccessibleForFree: true,
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      "@type": "Person",
      name: article.author,
      url: absoluteUrl(`/author/${article.authorSlug}`),
    },
    publisher: {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: publisherLogo },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: article.tags.join(", "),
    articleSection: article.category,
    inLanguage: "en-US",
  }

  if (article.image) {
    schema.image = absoluteUrl(article.image)
  }

  if (article.source) {
    schema["citation"] = {
      "@type": "CreativeWork",
      name: article.source.name,
      url: article.source.url,
    }
    schema["isBasedOn"] = {
      "@type": "CreativeWork",
      url: article.source.canonicalUrl || article.source.url,
    }
  }

  return schema
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[],
  id: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${id}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generatePersonSchema(name: string, url: string, bio?: string, role?: string) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url,
  }
  if (bio) schema.description = bio
  if (role) schema.jobTitle = role
  return schema
}

export function generateCollectionSchema(
  name: string,
  description: string,
  url: string,
  numberOfItems: number,
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name,
    description,
    numberOfItems,
    inLanguage: "en-US",
  }
}

export function generateMetadata(
  overrides: Partial<Metadata> & {
    title: string
    description: string
    path: string
  },
): Metadata {
  const url = absoluteUrl(overrides.path)
  const ogImages = overrides.openGraph?.images || [
    { url: absoluteUrl(siteConfig.ogImage), width: 1200, height: 630 },
  ]
  const twImages = Array.isArray(ogImages)
    ? ogImages.map((i: unknown) => {
        if (typeof i === "string") return i
        return (i as { url: string }).url
      })
    : [String(ogImages)]

  const extras = Object.fromEntries(
    Object.entries(overrides).filter(
      ([key]) => !["title", "description", "path"].includes(key),
    ),
  ) as Partial<Metadata>

  return {
    title: overrides.title,
    description: overrides.description,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
      ...(overrides.alternates || {}),
    },
    openGraph: {
      title: overrides.title,
      description: overrides.description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
      images: ogImages,
      ...(overrides.openGraph || {}),
    },
    twitter: {
      card: "summary_large_image",
      title: overrides.title,
      description: overrides.description,
      images: twImages,
      ...(overrides.twitter || {}),
    },
    robots: overrides.robots ?? {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
    ...extras,
  }
}
