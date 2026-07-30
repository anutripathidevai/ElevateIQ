import {
  CalendarDays,
  CalendarRange,
  Flame,
  TrendingUp,
} from "lucide-react";
import {
  TODAYS_CHALLENGE,
  WEEKLY_CHALLENGE,
  STREAK_WEEK,
  PROGRESS_TRACKS,
} from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";
import { PracticeCard } from "@/components/blocks/practice-card";
import { StudyPlanner } from "@/components/blocks/study-planner";
import {
  DashboardCard,
  ProgressBar,
  SectionHeader,
} from "@/components/blocks/primitives";
import { PageHeader } from "@/components/blocks/page-header";

export const metadata = { title: "Practice" };

export default function PracticePage() {
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Practice"
        title="Build a daily practice habit"
        description="Daily and weekly challenges, an AI study planner, and streaks to keep you consistent all the way to interview day."
        accent="rose"
        icon={Flame}
        aiActions={["Generate today's challenge", "Plan my week", "Review my weak areas"]}
      />

      <section className="space-y-4">
        <SectionHeader
          id="daily"
          title="Today's Challenge"
          description="A balanced mix across DSA, design, and behavioral"
          icon={CalendarDays}
          accent="rose"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {TODAYS_CHALLENGE.map((item) => (
            <PracticeCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <SectionHeader
            id="weekly"
            title="Weekly Challenge"
            icon={CalendarRange}
            accent="violet"
          />
          <div className="rounded-xl border border-border bg-gradient-to-br from-violet-500/15 to-violet-500/0 p-5 shadow-sm">
            <h3 className="text-lg font-semibold">{WEEKLY_CHALLENGE.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{WEEKLY_CHALLENGE.description}</p>
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{WEEKLY_CHALLENGE.daysLeft} days left</span>
                <span className="font-semibold">{WEEKLY_CHALLENGE.progress}%</span>
              </div>
              <ProgressBar value={WEEKLY_CHALLENGE.progress} accent="violet" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              🏆 Reward: {WEEKLY_CHALLENGE.reward}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <SectionHeader
            id="streak"
            title="Practice Streak"
            icon={Flame}
            accent="rose"
          />
          <DashboardCard>
            <div className="flex items-center justify-between">
              {STREAK_WEEK.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold",
                      d.active
                        ? "bg-rose-500 text-white"
                        : "border border-dashed border-border text-muted-foreground",
                    )}
                  >
                    {d.active ? <Flame className="h-4 w-4" /> : d.day}
                  </span>
                  <span className="text-xs text-muted-foreground">{d.day}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              🔥 <span className="font-semibold text-foreground">12-day streak</span> · Personal best: 21
            </p>
          </DashboardCard>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          id="planner"
          title="Study Planner"
          description="Generate a personalized plan toward your interview date"
        />
        <StudyPlanner />
      </section>

      <section className="space-y-4">
        <SectionHeader
          id="progress"
          title="Progress Tracking"
          description="Your coverage across every practice track"
          icon={TrendingUp}
          accent="emerald"
        />
        <DashboardCard>
          <div className="grid gap-5 sm:grid-cols-2">
            {PROGRESS_TRACKS.map((t) => {
              const pct = Math.round((t.solved / t.total) * 100);
              return (
                <div key={t.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{t.label}</span>
                    <span className="text-muted-foreground">
                      {t.solved}/{t.total} · {pct}%
                    </span>
                  </div>
                  <ProgressBar value={pct} accent={t.accent} />
                </div>
              );
            })}
          </div>
        </DashboardCard>
      </section>
    </div>
  );
}
