/**
 * Central SEO / site-identity configuration. Single source of truth for the
 * canonical URL, brand strings, and social defaults used by metadata, the
 * sitemap, robots, structured data, and the manifest. Keeping this here avoids
 * drift between the many places that need the site's public identity.
 *
 * The base URL can be overridden at build/runtime via NEXT_PUBLIC_SITE_URL so
 * preview deployments generate correct absolute URLs; it falls back to the
 * production domain.
 */
export const siteConfig = {
  name: "Compile Ready",
  /** Canonical production origin (no trailing slash). */
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://compileready.com").replace(
    /\/$/,
    "",
  ),
  title: "Compile Ready — AI-Powered Interview Preparation",
  tagline:
    "The best way to prepare for your next software engineering interview.",
  description:
    "The best way to prepare for your next software engineering interview. Exclusive content, company questions, guides, and AI mock interviews across DSA, System Design, LLD, and Generative AI.",
  /** Next serves the generated OG image at this path (app/opengraph-image.tsx). */
  ogImage: "/opengraph-image",
  twitter: "@compileready",
  locale: "en_US",
} as const;

/** Absolute URL helper for a site-relative path. */
export function absoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalized === "/" ? "" : normalized}` || siteConfig.url;
}
