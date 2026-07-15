"use client";

import { useState } from "react";
import { CalendarClock, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SAMPLE_PLAN = [
  { week: "Week 1", focus: "Graphs & Trees", detail: "2 problems/day + 1 mock", accent: "text-violet-500" },
  { week: "Week 2", focus: "System Design", detail: "Rate limiter, URL shortener, feed", accent: "text-blue-500" },
  { week: "Week 3", focus: "Behavioral + STAR", detail: "6 stories, 2 panel mocks", accent: "text-orange-500" },
  { week: "Week 4", focus: "Full Mocks & Review", detail: "3 panel interviews, fix gaps", accent: "text-emerald-500" },
];

/** Interactive study-plan generator (UI-only simulated AI output). */
export function StudyPlanner() {
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);

  function generate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setGenerated(false);
    window.setTimeout(() => {
      setLoading(false);
      setGenerated(true);
    }, 800);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-rose-500" />
        <h3 className="text-sm font-semibold">AI Study Planner</h3>
      </div>

      <form onSubmit={generate} className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="sp-company">Target company</Label>
          <Input id="sp-company" defaultValue="Microsoft" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sp-role">Target role</Label>
          <Input id="sp-role" defaultValue="Senior Software Engineer" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sp-date">Interview date</Label>
          <Input id="sp-date" type="date" defaultValue="2026-08-15" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sp-hours">Daily study hours</Label>
          <Input id="sp-hours" type="number" min={1} max={12} defaultValue={3} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="sp-weak">Weak areas</Label>
          <Input id="sp-weak" defaultValue="System Design, Behavioral, Graphs" />
        </div>
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-rose-500 px-4 text-sm font-medium text-white transition-colors hover:bg-rose-500/90 sm:col-span-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Generating plan…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Generate Study Plan
            </>
          )}
        </button>
      </form>

      {generated && (
        <div className="mt-5 space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-500">
            <CheckCircle2 className="h-4 w-4" /> Your 4-week plan is ready
          </p>
          <ol className="space-y-2">
            {SAMPLE_PLAN.map((p) => (
              <li key={p.week} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <span className={`text-xs font-semibold ${p.accent}`}>{p.week}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{p.focus}</p>
                  <p className="text-xs text-muted-foreground">{p.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
