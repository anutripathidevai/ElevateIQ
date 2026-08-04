# SEO & Compliance Audit — Compile Ready (compileready.com)

_Last updated: 2026-08-01_

This report documents the SEO, discoverability, and legal/compliance work done on
the live site, plus the manual actions that still require a human (they need real
business information or access to third‑party dashboards).

---

## 1. Executive summary

Compile Ready is an AI‑powered interview‑prep platform (Next.js 14 App Router).
The single biggest discoverability problem was that **the entire learning catalog
(300+ pages) was hidden behind a client‑side auth guard** — Googlebot only ever
received a loading spinner, so none of the learning content could be indexed.

This pass fixes that and adds the standard SEO + legal infrastructure a public
site needs: robots, sitemap, structured data, per‑page metadata, social share
images, a favicon/manifest, security headers, and three legal pages
(Privacy Policy, Terms of Service, Disclaimer).

No visual design or existing app behavior was changed. Logged‑in users see exactly
what they saw before; logged‑out visitors can now read learning content and are
shown a dismissible, non‑blocking "sign up to save progress" prompt.

---

## 2. Current issues found (and their status)

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | Learning content (`/learning/*`) gated behind client‑side `AuthGuard` → served as a spinner to crawlers | 🔴 Critical | ✅ Fixed — learning routes now render real server HTML |
| 2 | No `robots.txt` | 🔴 Critical | ✅ Added (`app/robots.ts`) |
| 3 | No `sitemap.xml` | 🔴 Critical | ✅ Added (`app/sitemap.ts`, dynamic) |
| 4 | No favicon / app icon / manifest | 🟠 High | ✅ Added (`app/icon.svg`, `app/apple-icon.tsx`, `app/manifest.ts`) |
| 5 | No Open Graph / Twitter share image | 🟠 High | ✅ Added (`app/opengraph-image.tsx`, `app/twitter-image.tsx`) |
| 6 | Thin structured data (only FAQ on home) | 🟠 High | ✅ Added WebSite + Organization (home) and Course + Breadcrumb (learning hubs) |
| 7 | No legal pages (Privacy / Terms / Disclaimer) | 🔴 Critical (compliance) | ✅ Added — see §4 |
| 8 | Footer "Privacy/Terms" pointed to `/contact#anchor` | 🟠 High | ✅ Repointed to real legal pages |
| 9 | No AI‑content / trademark disclaimer | 🟠 High (compliance) | ✅ Added to footer + disclaimer page |
| 10 | Missing `Permissions-Policy` header + `viewport`/`themeColor` | 🟡 Medium | ✅ Added |
| 11 | Some hub pages missing canonical URLs | 🟡 Medium | ✅ Added `alternates.canonical` |

---

## 3. Changes implemented

### Discoverability
- **Ungated learning content.** `components/auth/guards.tsx` now treats
  `/learning/*` as public: it renders the real page content (crawlable server HTML)
  for everyone and only redirects still‑gated routes (dashboard, profile, history,
  mock, panel, star‑stories, companies, practice, career, resources) to `/login`.
- **Soft sign‑up prompt.** `components/auth/signup-prompt.tsx` — a dismissible
  bottom banner shown only to logged‑out visitors on public content. It is rendered
  client‑side after mount, so it never appears in server HTML and has **zero SEO or
  hydration impact**.
- **`app/robots.ts`** — allows `/`, disallows API/auth/user/still‑gated routes,
  and points to the sitemap.
- **`app/sitemap.ts`** — dynamic sitemap that mirrors each route's
  `generateStaticParams`: marketing + legal pages, the 6 learning hubs, and every
  published learning URL (DSA topics/problems, System Design, LLD, Generative AI,
  language tracks/topics/interview hubs). Keep it in sync when learning registries
  change.

### Metadata & structured data
- **`lib/seo.ts`** — single source of truth (`siteConfig`) for name, URL, title,
  tagline, description, OG image, Twitter handle, locale.
- **`lib/structured-data.ts` + `components/seo/json-ld.tsx`** — reusable JSON‑LD
  builders (Organization, WebSite, Course, BreadcrumbList, FAQPage) and a server
  component to render them.
  - Home: WebSite + Organization + FAQPage.
  - Each learning hub: Course + BreadcrumbList.
  - _No `SearchAction` was added_ — the site has no URL‑based search endpoint, and
    emitting one would be misleading structured data.
- Refined root + home metadata around the tagline **"AI‑powered interview
  preparation for software engineers."** Added `alternates.canonical` to hubs.

### Identity assets
- `app/icon.svg` — the `</>` brand mark (favicon).
- `app/apple-icon.tsx` — 180×180 Apple touch icon (`next/og`).
- `app/opengraph-image.tsx` + `app/twitter-image.tsx` — branded 1200×630 share card.
- `app/manifest.ts` — installable web manifest (name, theme/background `#0a0e1a`).
- `viewport` + `themeColor` export in `app/layout.tsx`.

### Security headers
- `next.config.mjs` already sent `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, and HSTS. Added `Permissions-Policy`
  (`camera=(), microphone=(), geolocation=(), browsing-topics=()`) and
  `X-DNS-Prefetch-Control`.

### Legal / compliance (see §4)
- `app/(marketing)/privacy-policy/page.tsx`
- `app/(marketing)/terms/page.tsx`
- `app/(marketing)/disclaimer/page.tsx`
- Shared shell: `components/marketing/legal-page.tsx`.
- Footer: repointed Privacy/Terms to the real pages, added Disclaimer link, and
  added a trademark + AI‑content disclaimer line.

---

## 4. Legal & copyright concerns

These pages are **live but contain placeholders** that must be filled with real
business information before they are legally reliable. Search the codebase for
these tokens:

- `[COMPANY LEGAL NAME]` — the registered legal entity operating Compile Ready.
- `[BUSINESS ADDRESS]` — the operating address for notices.
- `[GOVERNING JURISDICTION]` — the governing law / venue for the Terms.

Substantive concerns already addressed in the copy:

- **Third‑party trademarks.** The platform references company names (Amazon, Google,
  Meta, etc.) for interview‑prep context. The footer and Disclaimer state these
  names/trademarks belong to their owners and are used for identification/education
  only, and that Compile Ready is not affiliated with or endorsed by them.
- **AI‑generated content.** Much of the learning/interview content is AI‑assisted.
  The Disclaimer and footer note it may contain inaccuracies and should be verified
  independently — important for liability.
- **Contact.** Legal pages use `hello@compileready.com`. Confirm this inbox exists
  and is monitored, or replace it.

> ⚠️ This copy is a solid, good‑faith starting point but is **not a substitute for
> legal review.** Have a lawyer review the Privacy Policy and Terms before relying
> on them, especially if you collect payments or operate in the EU/UK (GDPR),
> California (CCPA/CPRA), or take users under 16.

---

## 5. Remaining manual actions (require a human)

1. **Fill legal placeholders** — replace the three `[…]` tokens above and confirm
   the contact email.
2. **Google Search Console** — verify the domain and submit the sitemap (see §6).
3. **Analytics** — none is currently installed (see §8). Add one if you want traffic
   data.
4. **(Optional, high SEO value) Ungate more content.** `/companies` and `/practice`
   are still auth‑gated and therefore excluded from the sitemap and disallowed in
   robots. A public company question bank (e.g. "Amazon interview questions") is one
   of the highest‑intent SEO opportunities on the site. Ungating them would follow
   the same pattern already applied to `/learning/*`.
5. **Bing Webmaster Tools** — optional, mirrors the GSC steps.

---

## 6. Google Search Console (GSC) readiness

The site is technically ready to be submitted. Steps:

1. Go to <https://search.google.com/search-console> and add a property.
   - Prefer the **Domain** property (`compileready.com`) — this needs a DNS TXT
     record at your registrar and covers apex + `www` + all subdomains.
   - Or use a **URL‑prefix** property (`https://compileready.com`) — this can be
     verified with an HTML meta tag. If you choose this route, add the verification
     token via Next metadata:
     ```ts
     // app/layout.tsx → metadata
     verification: { google: "PASTE_TOKEN_HERE" },
     ```
2. After verification, submit the sitemap: **Sitemaps → add
   `https://compileready.com/sitemap.xml`**.
3. Use **URL Inspection** on a few learning pages (e.g.
   `/learning/dsa`, `/learning/system-design/url-shortener`) and confirm Google now
   sees rendered content, then **Request indexing**.
4. Watch **Pages** (indexing) and **Enhancements** (structured‑data validity) over
   the following days.

Also validate structured data with the
[Rich Results Test](https://search.google.com/test/rich-results) on the home page
and a learning hub.

---

## 7. Important URLs

- Home: `https://compileready.com/`
- Sitemap: `https://compileready.com/sitemap.xml`
- Robots: `https://compileready.com/robots.txt`
- Manifest: `https://compileready.com/manifest.webmanifest`
- OG image: `https://compileready.com/opengraph-image`
- Privacy Policy: `https://compileready.com/privacy-policy`
- Terms of Service: `https://compileready.com/terms`
- Disclaimer: `https://compileready.com/disclaimer`

---

## 8. Analytics

**No analytics or tag manager is currently installed** (no GA4, no Plausible, no
GTM — verified in the codebase). This was intentionally left out rather than added
silently. To add privacy‑friendly analytics later, either:

- **Plausible / Fathom** — a single `<script>` in `app/layout.tsx`, or
- **GA4** — via `@next/third-parties/google` (`<GoogleAnalytics gaId="G-XXXX" />`).

If you add analytics that sets cookies or processes EU personal data, update the
Privacy Policy and consider a consent banner.

---

## 9. Recommended next steps (prioritized)

1. Submit to GSC + fill legal placeholders (blocking for "done").
2. Ungate `/companies` and `/practice` for a large, high‑intent SEO surface.
3. Add analytics.
4. Add per‑page OG images for top learning hubs (optional; the site‑wide card is a
   good default).
5. Consider a lightweight blog/changelog for fresh, keyword‑rich content.
6. Revisit a Content‑Security‑Policy header (deferred here — it needs careful
   testing against Next's inline scripts and the Monaco/AI features to avoid
   breakage).

---

## 10. Notes for maintainers

- **Brand spelling.** The live brand is the two‑word **"Compile Ready"** (used in the
  logo, footer, and metadata). This audit intentionally keeps that spelling rather
  than switching to a one‑word variant, to avoid changing the established visual
  brand.
- **Keep the sitemap in sync.** `app/sitemap.ts` mirrors the learning registries. If
  you add/publish topics or change route params, update it (or refactor it to import
  the same `generateStaticParams` sources).
