import Link from "next/link";
import {
  Award,
  Bookmark,
  FolderOpen,
  Settings,
  Target,
  TrendingUp,
  Trophy,
  User,
} from "lucide-react";
import {
  USER_PROFILE,
  CAREER_READINESS,
  ACHIEVEMENTS,
  CERTIFICATES,
  CONTINUE_LEARNING,
  SAVED_QUESTIONS,
  RESUME_LIBRARY,
} from "@/lib/dashboard-data";
import { ACCENT_STYLES } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { AchievementBadge } from "@/components/blocks/achievement-badge";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  DashboardCard,
  ProgressBar,
  ScoreRing,
  SectionHeader,
} from "@/components/blocks/primitives";

export const metadata = { title: "Profile" };

export default function ProfilePage() {
  const overall = CAREER_READINESS[0];

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-2xl border border-border bg-gradient-to-br from-slate-400/10 to-card p-6">
        <div className="flex flex-wrap items-center gap-5">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-2xl font-bold text-primary">
            {USER_PROFILE.initials}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{USER_PROFILE.name}</h1>
            <p className="text-sm text-muted-foreground">
              {USER_PROFILE.targetRole} · Target: {USER_PROFILE.targetCompany}
            </p>
            <p className="text-sm text-muted-foreground">{USER_PROFILE.location}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {USER_PROFILE.skills.map((s) => (
                <span key={s} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Career readiness */}
      <section className="space-y-4">
        <SectionHeader
          title="Career Readiness"
          description="Your overall progress toward interview-ready"
          icon={Target}
          accent="blue"
        />
        <div className="grid gap-5 lg:grid-cols-3">
          <DashboardCard className="lg:col-span-1">
            <div className="flex flex-col items-center gap-3 py-2">
              <ScoreRing value={overall.value} accent={overall.accent} size={120} />
              <p className="text-sm font-medium">{overall.label}</p>
              <p className="text-center text-xs text-muted-foreground">
                You&apos;re on track — focus on System Design to reach 85%+.
              </p>
            </div>
          </DashboardCard>
          <DashboardCard className="lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2">
              {CAREER_READINESS.slice(1).map((m) => (
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
        </div>
      </section>

      {/* Achievements */}
      <section className="space-y-4">
        <SectionHeader
          id="achievements"
          title="Achievements"
          icon={Trophy}
          accent="cyan"
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {ACHIEVEMENTS.map((a) => (
            <AchievementBadge key={a.id} {...a} />
          ))}
        </div>
      </section>

      {/* Certificates */}
      <section className="space-y-4">
        <SectionHeader
          id="certificates"
          title="Certificates"
          icon={Award}
          accent="emerald"
        />
        <DashboardCard>
          <ul className="divide-y divide-border">
            {CERTIFICATES.map((cert) => {
              const earned = cert.status === "earned";
              return (
                <li key={cert.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", earned ? "bg-emerald-500/10" : "bg-muted")}>
                    <Award className={cn("h-5 w-5", earned ? "text-emerald-500" : "text-muted-foreground")} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{cert.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{cert.issuer} · {cert.date}</p>
                  </div>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", earned ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground")}>
                    {earned ? "Earned" : "In progress"}
                  </span>
                </li>
              );
            })}
          </ul>
        </DashboardCard>
      </section>

      {/* Saved questions */}
      <section className="space-y-4">
        <SectionHeader
          id="saved-questions"
          title="Saved Questions"
          icon={Bookmark}
          accent="violet"
          action={
            <Link href="/companies" className="text-xs font-medium text-primary hover:underline">
              Question bank →
            </Link>
          }
        />
        <DashboardCard>
          <ul className="space-y-2">
            {SAVED_QUESTIONS.map((s) => (
              <li key={s.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/50">
                <Bookmark className="h-4 w-4 shrink-0 text-violet-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{s.context}</p>
                </div>
              </li>
            ))}
          </ul>
        </DashboardCard>
      </section>

      {/* Resume library */}
      <section className="space-y-4">
        <SectionHeader
          id="resume-library"
          title="Resume Library"
          icon={FolderOpen}
          accent="orange"
          action={
            <Link href="/career#resume-builder" className="text-xs font-medium text-primary hover:underline">
              Open builder →
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {RESUME_LIBRARY.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <FolderOpen className="mb-2 h-5 w-5 text-orange-500" />
              <p className="text-sm font-medium">{r.name}</p>
              <p className="text-xs text-muted-foreground">Updated {r.updatedAt}</p>
              <p className="mt-2 text-xs font-medium text-orange-500">ATS {r.atsScore}%</p>
            </div>
          ))}
        </div>
      </section>

      {/* Learning progress */}
      <section className="space-y-4">
        <SectionHeader
          id="learning"
          title="Learning Progress"
          icon={TrendingUp}
          accent="emerald"
          action={
            <Link href="/learning" className="text-xs font-medium text-primary hover:underline">
              Continue →
            </Link>
          }
        />
        <DashboardCard>
          <div className="space-y-4">
            {CONTINUE_LEARNING.map((item) => {
              const a = ACCENT_STYLES[item.accent];
              const Icon = item.icon;
              return (
                <div key={item.id} className="flex items-center gap-4">
                  <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", a.bg)}>
                    <Icon className={cn("h-5 w-5", a.text)} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate font-medium">{item.title}</span>
                      <span className="shrink-0 text-xs font-semibold">{item.progress}%</span>
                    </div>
                    <div className="mt-1.5">
                      <ProgressBar value={item.progress} accent={item.accent} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DashboardCard>
      </section>

      {/* Settings */}
      <section className="space-y-4">
        <SectionHeader id="settings" title="Settings" icon={Settings} accent="slate" />
        <DashboardCard>
          <ul className="divide-y divide-border">
            {[
              { label: "Appearance", value: "Use the theme toggle in the top bar" },
              { label: "Email notifications", value: "Interview reminders & weekly summary" },
              { label: "Target role", value: `${USER_PROFILE.targetRole} @ ${USER_PROFILE.targetCompany}` },
              { label: "Account", value: "Manage sign-in providers" },
            ].map((row) => (
              <li key={row.label} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{row.label}</span>
                </div>
                <span className="text-right text-xs text-muted-foreground">{row.value}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-end border-t border-border pt-4">
            <LogoutButton />
          </div>
        </DashboardCard>
      </section>
    </div>
  );
}
