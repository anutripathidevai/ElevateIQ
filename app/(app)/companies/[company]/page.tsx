import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getUserId } from "@/lib/current-user";
import { PageHeader } from "@/features/shared/components/page-header";
import {
  getCompany,
  questionsForCompany,
} from "@/features/company-bank/services/questions";
import { listBookmarkIds } from "@/features/company-bank/services/bookmarks";
import { getProgressMap } from "@/features/company-bank/services/progress";
import { collectCategories, collectTags } from "@/features/company-bank/utils";
import { QuestionExplorer } from "@/features/company-bank/components/question-explorer";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { company: string } }) {
  const company = getCompany(params.company);
  return { title: company ? `${company.name} — Question Bank` : "Question Bank" };
}

export default async function CompanyPage({
  params,
}: {
  params: { company: string };
}) {
  const company = getCompany(params.company);
  if (!company) notFound();

  const questions = questionsForCompany(company.slug);
  const userId = await getUserId();
  const canPersist = Boolean(userId);

  const [bookmarkedIds, progressMap] = userId
    ? await Promise.all([listBookmarkIds(userId), getProgressMap(userId)])
    : [new Set<string>(), new Map()];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/companies"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All companies
        </Link>
      </div>

      <PageHeader
        icon={
          <span
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-base font-bold text-primary"
          >
            {company.glyph}
          </span>
        }
        title={company.name}
        description={company.blurb}
      />

      <QuestionExplorer
        questions={questions}
        tags={collectTags(questions)}
        categories={collectCategories(questions)}
        initialBookmarkedIds={Array.from(bookmarkedIds)}
        initialProgress={Object.fromEntries(progressMap)}
        canPersist={canPersist}
      />
    </div>
  );
}
