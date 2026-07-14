import { Building2 } from "lucide-react";
import { PageHeader } from "@/features/shared/components/page-header";
import { EmptyState } from "@/features/shared/components/states";
import { pluralize } from "@/features/shared/utils";
import {
  listCompanies,
  totalQuestionCount,
} from "@/features/company-bank/services/questions";
import { CompanyGrid } from "@/features/company-bank/components/company-grid";

export const metadata = { title: "Company Question Bank" };

export default function CompaniesPage() {
  const companies = listCompanies();
  const total = totalQuestionCount();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Building2 className="h-6 w-6 text-sky-500" />}
        title="Company Question Bank"
        description="Real interview questions across top companies and categories — with expected answers, hints, follow-ups, and related resources. Filter, search, bookmark, and track your progress."
      />

      {companies.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-8 w-8" />}
          title="No companies yet"
          description="Add a content/companies/*.json file to populate the question bank."
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {pluralize(companies.length, "company", "companies")} ·{" "}
            {pluralize(total, "question")}
          </p>
          <CompanyGrid companies={companies} />
        </>
      )}
    </div>
  );
}
