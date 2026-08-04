import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * Shared shell for legal/policy pages (privacy, terms, disclaimer). Provides a
 * consistent, readable single-column layout with a breadcrumb, page title, a
 * "last updated" line, and lightweight prose styling applied to the children so
 * each page only has to supply semantic content (h2/p/ul/a).
 */
export function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-14 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li className="text-foreground" aria-current="page">
              {title}
            </li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: {updated}
        </p>
        {intro && (
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            {intro}
          </p>
        )}

        <div
          className={[
            "mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground",
            "[&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground",
            "[&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground",
            "[&_p]:leading-relaxed",
            "[&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6",
            "[&_a]:font-medium [&_a]:text-primary hover:[&_a]:underline",
            "[&_strong]:font-semibold [&_strong]:text-foreground",
          ].join(" ")}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * A clearly-marked placeholder for real business/legal information the site
 * owner must supply (company legal name, address, governing jurisdiction). Made
 * visually obvious so it is never shipped to production unnoticed.
 */
export function LegalPlaceholder({ children }: { children: React.ReactNode }) {
  return (
    <mark className="rounded bg-warning/20 px-1.5 py-0.5 font-medium text-foreground">
      {children}
    </mark>
  );
}
