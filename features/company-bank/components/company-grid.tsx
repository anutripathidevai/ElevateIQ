import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pluralize } from "@/features/shared/utils";
import { CATEGORY_LABELS, type CompanySummary } from "../types";

/** Presentational grid of company cards for the Question Bank landing page. */
export function CompanyGrid({ companies }: { companies: CompanySummary[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {companies.map((company) => (
        <Link
          key={company.slug}
          href={`/companies/${company.slug}`}
          className="group flex flex-col rounded-xl border border-border p-5 transition-colors hover:border-primary/40 hover:bg-accent/40"
        >
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary"
            >
              {company.glyph}
            </span>
            <div>
              <h3 className="font-semibold">{company.name}</h3>
              <p className="text-xs text-muted-foreground">
                {pluralize(company.questionCount, "question")}
              </p>
            </div>
          </div>
          <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
            {company.blurb}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {company.categories.map((c) => (
              <span
                key={c}
                className="rounded-full border border-border px-2 py-0.5 text-[0.7rem] text-muted-foreground"
              >
                {CATEGORY_LABELS[c]}
              </span>
            ))}
          </div>
          <span className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            Browse questions <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      ))}
    </div>
  );
}
