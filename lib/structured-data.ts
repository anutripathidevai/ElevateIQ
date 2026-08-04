import { siteConfig } from "./seo";

/**
 * Structured-data (JSON-LD) builders. Centralizing them keeps every schema
 * consistent with {@link siteConfig} and ensures we only emit types a page
 * genuinely qualifies for. Render the returned objects with the `<JsonLd />`
 * component.
 */

type Json = Record<string, unknown>;

/** The Organization behind the site — reused as `provider`/`publisher`. */
export function organizationJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon.svg`,
    description: siteConfig.tagline,
  };
}

/** WebSite entity for the homepage. No SearchAction — the site has no URL-based search endpoint. */
export function websiteJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "en",
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
  };
}

/** Course schema for a learning hub/track. */
export function courseJsonLd(input: {
  name: string;
  description: string;
  path: string;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: input.name,
    description: input.description,
    url: `${siteConfig.url}${input.path}`,
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

/** BreadcrumbList from an ordered list of { name, path } crumbs. */
export function breadcrumbJsonLd(
  crumbs: { name: string; path: string }[],
): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${siteConfig.url}${c.path}`,
    })),
  };
}

/** FAQPage from visible Q&A pairs. */
export function faqJsonLd(faqs: { question: string; answer: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
