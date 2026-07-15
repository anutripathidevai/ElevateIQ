import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Circle,
  Sparkles,
  Trophy,
} from "lucide-react";
import {
  USER_PROFILE,
  SCORE_STATS,
  TODAY_PLAN,
  CONTINUE_LEARNING,
  UPCOMING_INTERVIEW,
  WEAK_AREAS,
  RECENT_ACTIVITY,
  RECOMMENDED,
  ACHIEVEMENTS,
} from "@/lib/dashboard-data";
import { ACCENT_STYLES } from "@/lib/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScoreCard } from "@/components/blocks/score-card";
import { AchievementBadge } from "@/components/blocks/achievement-badge";
import { ActivityList } from "@/components/blocks/activity-list";
import { AiActions } from "@/components/blocks/ai-actions";
import {
  DashboardCard,
  CardLink,
  ProgressBar,
  SectionHeader,
} from "@/components/blocks/primitives";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, {USER_PROFILE.name.split(" ")[0]} 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Targeting <span className="font-medium text-foreground">{USER_PROFILE.targetRole}</span>{" "}
              at <span className="font-medium text-foreground">{USER_PROFILE.targetCompany}</span> · You&apos;re on a{" "}
              <span className="font-medium text-foreground">12-day streak</span>. Keep it going.
            </p>
          </div>
          <Link href="/panel" className={cn(buttonVariants(), "gap-2")}>
            <Sparkles className="h-4 w-4" /> Start AI Mock Interview
          </Link>
        </div>
        <div className="mt-4">
          <AiActions
            actions={["Plan my day", "What should I study next?", "Analyze my weak areas"]}
            context="Your AI Career Coach"
          />
        </div>
      </section>

      {/* Score row */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SCORE_STATS.map((s) => (
          <ScoreCard key={s.id} {...s} />
        ))}
      </section>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: plan + learning */}
        <div className="space-y-6 lg:col-span-2">
          <DashboardCard
            title="Today's Plan"
            action={<CardLink href="/practice#planner" label="Study planner" />}
          >
            <ul className="space-y-1">
              {TODAY_PLAN.map((task) => {
                const a = ACCENT_STYLES[task.accent];
                const Icon = task.icon;
                return (
                  <li key={task.id}>
                    <Link
                      href={task.href}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
                    >
                      {task.done ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                      )}
                      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", a.bg)}>
                        <Icon className={cn("h-4 w-4", a.text)} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={cn("truncate text-sm font-medium", task.done && "text-muted-foreground line-through")}>
                          {task.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{task.meta}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </DashboardCard>

          <DashboardCard
            title="Continue Learning"
            action={<CardLink href="/learning" />}
          >
            <div className="space-y-4">
              {CONTINUE_LEARNING.map((item) => {
                const a = ACCENT_STYLES[item.accent];
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-muted/50"
                  >
                    <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", a.bg)}>
                      <Icon className={cn("h-5 w-5", a.text)} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium">{item.title}</p>
                        <span className="shrink-0 text-xs font-semibold">{item.progress}%</span>
                      </div>
                      <p className="mb-1.5 truncate text-xs text-muted-foreground">{item.subtitle}</p>
                      <ProgressBar value={item.progress} accent={item.accent} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </DashboardCard>

          <DashboardCard title="Recent Activity" action={<CardLink href="/history" />}>
            <ActivityList items={RECENT_ACTIVITY} />
          </DashboardCard>
        </div>

        {/* Right: interview + weak areas */}
        <div className="space-y-6">
          <DashboardCard title="Upcoming Interview" icon={CalendarClock} accent="violet">
            <div className="space-y-4">
              <div className="rounded-lg bg-violet-500/10 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-violet-500">
                  In {UPCOMING_INTERVIEW.countdownDays} days
                </p>
                <p className="mt-1 font-semibold">{UPCOMING_INTERVIEW.round}</p>
                <p className="text-sm text-muted-foreground">
                  {UPCOMING_INTERVIEW.role} · {UPCOMING_INTERVIEW.company}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{UPCOMING_INTERVIEW.date}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {UPCOMING_INTERVIEW.focus.map((f) => (
                  <span key={f} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                    {f}
                  </span>
                ))}
              </div>
              <Link href={UPCOMING_INTERVIEW.href} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full")}>
                Prepare now
              </Link>
            </div>
          </DashboardCard>

          <DashboardCard title="Weak Areas" action={<CardLink href="/practice#progress" label="Practice" />}>
            <div className="space-y-4">
              {WEAK_AREAS.map((w) => (
                <Link key={w.id} href={w.href} className="block space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{w.label}</span>
                    <span className="text-muted-foreground">{w.score}%</span>
                  </div>
                  <ProgressBar value={w.score} accent={w.accent} />
                </Link>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* Recommended */}
      <section className="space-y-4">
        <SectionHeader
          title="Recommended for you"
          description="AI-picked next steps based on your goals and gaps"
          icon={Sparkles}
          accent="violet"
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {RECOMMENDED.map((r) => {
            const a = ACCENT_STYLES[r.accent];
            const Icon = r.icon;
            return (
              <Link
                key={r.id}
                href={r.href}
                className="group flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", a.bg)}>
                    <Icon className={cn("h-4 w-4", a.text)} />
                  </span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[0.65rem] font-medium", a.bg, a.text)}>
                    {r.kind}
                  </span>
                </div>
                <p className="text-sm font-semibold leading-snug">{r.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{r.meta}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Achievements */}
      <section className="space-y-4">
        <SectionHeader
          title="Achievements"
          description="Badges you've earned on your journey"
          icon={Trophy}
          accent="cyan"
          action={<CardLink href="/profile#achievements" />}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {ACHIEVEMENTS.map((a) => (
            <AchievementBadge key={a.id} {...a} />
          ))}
        </div>
      </section>
    </div>
  );
}
