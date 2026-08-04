import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

/**
 * robots.txt (served at /robots.txt). Public marketing pages and the learning
 * catalog are crawlable; API routes, auth flows, and user-specific/gated areas
 * are disallowed so crawl budget is spent on indexable content and no private
 * or thin (login-redirect) pages leak into the index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          // Auth flows
          "/login",
          "/signup",
          "/onboarding",
          "/forgot-password",
          // User-specific / personal areas
          "/dashboard",
          "/profile",
          "/history",
          "/mock",
          "/panel",
          "/star-stories",
          // Currently sign-in-gated content (not publicly readable yet)
          "/companies",
          "/practice",
          "/career",
          "/resources",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
