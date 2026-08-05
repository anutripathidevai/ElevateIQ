import { Briefcase, ClipboardCheck, Info, Table2 } from "lucide-react";
import {
  CAREER_TOOLS,
  ATS_METRICS,
  ATS_MISSING_KEYWORDS,
  JOB_ROWS,
} from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";
import { CareerToolCard } from "@/components/blocks/career-tool-card";
import {
  DashboardCard,
  ProgressBar,
  SectionHeader,
} from "@/components/blocks/primitives";
import { PageHeader } from "@/components/blocks/page-header";

export const metadata = { title: "Career Tools" };

const STATUS_STYLES: Record<string, string> = {
  Interviewing: "bg-violet-500/10 text-violet-500",
  Applied: "bg-blue-500/10 text-blue-500",
  Offer: "bg-emerald-500/10 text-emerald-500",
  Rejected: "bg-rose-500/10 text-rose-500",
  Saved: "bg-slate-400/10 text-slate-400",
};

export default function CareerPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Career Tools"
        title="Land your next role, faster"
        description="AI-powered resume building, ATS optimization, tailoring, and job tracking — all in one place."
        accent="orange"
        icon={Briefcase}
        aiActions={["Improve my resume", "Find matching jobs", "Write a cover letter"]}
      />

      <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <p>
          <span className="font-medium text-foreground">Preview.</span> The
          Career Tools below show sample data to illustrate the experience —
          live resume building, ATS scoring, and job tracking are coming soon.
        </p>
      </div>

      <section className="space-y-4">
        <SectionHeader
          id="tools"
          title="Toolkit"
          description="Everything you need to apply with confidence"
          icon={Briefcase}
          accent="orange"
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {CAREER_TOOLS.map((tool) => (
            <CareerToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          id="ats-report"
          title="ATS Score Report"
          description="How your current resume scores against applicant tracking systems"
          icon={ClipboardCheck}
          accent="violet"
        />
        <div className="grid gap-5 lg:grid-cols-2">
          <DashboardCard title="Score breakdown">
            <div className="space-y-4">
              {ATS_METRICS.map((m) => (
                <div key={m.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{m.label}</span>
                    <span className="text-muted-foreground">{m.value}%</span>
                  </div>
                  <ProgressBar value={m.value} accent={m.accent} />
                </div>
              ))}
            </div>
          </DashboardCard>
          <DashboardCard title="Missing keywords">
            <p className="mb-3 text-sm text-muted-foreground">
              Add these to better match your target role at Microsoft:
            </p>
            <div className="flex flex-wrap gap-2">
              {ATS_MISSING_KEYWORDS.map((k) => (
                <span
                  key={k}
                  className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-500"
                >
                  {k}
                </span>
              ))}
            </div>
            <button
              type="button"
              className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-md bg-orange-500 px-4 text-sm font-medium text-white transition-colors hover:bg-orange-500/90"
            >
              <ClipboardCheck className="h-4 w-4" /> Auto-fix with AI
            </button>
          </DashboardCard>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          id="job-tracker"
          title="Job Tracker"
          description="Track applications, resume versions, and interview dates"
          icon={Table2}
          accent="blue"
        />
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Resume</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">Interview</th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">Notes</th>
                </tr>
              </thead>
              <tbody>
                {JOB_ROWS.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="px-4 py-3 font-medium">{row.company}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.role}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-medium",
                          STATUS_STYLES[row.status] ?? "bg-muted text-muted-foreground",
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{row.resumeVersion}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{row.interviewDate}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
