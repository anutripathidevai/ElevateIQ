import { History, Target, TrendingUp, Trophy } from "lucide-react";
import { INTERVIEW_HISTORY } from "@/lib/dashboard-data";
import { InterviewHistory } from "@/components/blocks/interview-history";
import { PageHeader } from "@/components/blocks/page-header";
import { StatTile } from "@/components/blocks/primitives";

export const metadata = { title: "Interview History" };

export default function HistoryPage() {
  const count = INTERVIEW_HISTORY.length;
  const avg = Math.round(
    INTERVIEW_HISTORY.reduce((sum, r) => sum + r.score, 0) / count,
  );
  const best = Math.max(...INTERVIEW_HISTORY.map((r) => r.score));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Interview Prep"
        title="Interview History"
        description="Every mock and panel interview, scored and analyzed. Track your trajectory over time."
        accent="violet"
        icon={History}
        aiActions={["Summarize my progress", "What patterns hold me back?", "Build a prep plan"]}
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <StatTile icon={Target} label="Interviews taken" value={count} accent="violet" />
        <StatTile icon={TrendingUp} label="Average score" value={`${avg}%`} accent="blue" />
        <StatTile icon={Trophy} label="Best score" value={`${best}%`} accent="emerald" />
      </section>

      <InterviewHistory records={INTERVIEW_HISTORY} />
    </div>
  );
}
