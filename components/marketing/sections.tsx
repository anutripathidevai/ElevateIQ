import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  LineChart,
  MessagesSquare,
  Sparkles,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ProgressBar, ScoreRing } from "@/components/blocks/primitives";
import { ACCENT_STYLES } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import { DashboardPreview } from "./dashboard-preview";
import { AiMockPreview } from "./ai-mock-preview";
import {
  CAREER_LEVELS,
  COMPANIES,
  JOURNEY_STEPS,
  LEARNING_CARDS,
  PATTERN_TAGS,
  PATTERNS,
  READINESS_METRICS,
  READINESS_OVERALL,
  RECOMMENDED_NEXT,
} from "./marketing-data";

/** Shared section wrapper with consistent vertical rhythm + container width. */
function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("py-20 sm:py-24", className)}>
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

/** A textual CTA link ("Explore Practice →"). */
function CtaLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className={cn(buttonVariants({ size: "lg" }), "group")}>
      {label}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

// --- Build → Test → Deploy ------------------------------------------------

export function JourneySection() {
  return (
    <Section className="border-t border-border">
      <Reveal>
        <SectionHeading
          eyebrow="The journey"
          title="Build. Test. Deploy."
          subtitle="Everything you need to go from learning the fundamentals to confidently walking into your next interview."
        />
      </Reveal>

      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        {JOURNEY_STEPS.map((step, i) => {
          const Icon = step.icon;
          const a = ACCENT_STYLES[step.accent];
          return (
            <Reveal key={step.index} delay={i * 90}>
              <div className="group relative flex h-full flex-col rounded-2xl border border-border bg-card p-7 transition-colors hover:border-primary/30">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl",
                      a.bg,
                    )}
                  >
                    <Icon className={cn("h-5 w-5", a.text)} />
                  </span>
                  <span className="font-mono text-sm text-muted-foreground/60">
                    {step.index}
                  </span>
                </div>
                <p
                  className={cn(
                    "mt-5 text-xs font-semibold uppercase tracking-[0.18em]",
                    a.text,
                  )}
                >
                  {step.kicker}
                </p>
                <h3 className="mt-1 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                <Link
                  href={step.cta.href}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  {step.cta.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal
        delay={120}
        className="mt-10 flex items-center justify-center gap-3 font-mono text-sm font-medium tracking-wide text-muted-foreground"
      >
        <span className="text-blue-400">BUILD</span>
        <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
        <span className="text-violet-400">TEST</span>
        <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
        <span className="text-emerald-400">DEPLOY</span>
      </Reveal>
    </Section>
  );
}

// --- Interview Command Center ---------------------------------------------

const COMMAND_CENTER_POINTS = [
  "Interview readiness score across every competency",
  "DSA, System Design, LLD and coding progress at a glance",
  "Personalized recommendations for what to learn next",
  "Continue learning right where you left off",
  "Jump straight into an AI mock interview",
];

export function CommandCenterSection() {
  return (
    <Section id="command-center" className="border-t border-border">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="Your command center"
            title="Your Interview Command Center"
            subtitle="Know what to learn. Know what to practice. Know when you're ready."
          />
          <ul className="mt-8 space-y-3.5">
            {COMMAND_CENTER_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm leading-relaxed text-muted-foreground">
                  {point}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <CtaLink href="/dashboard" label="Open your dashboard" />
          </div>
        </Reveal>

        <Reveal delay={100}>
          <DashboardPreview />
        </Reveal>
      </div>
    </Section>
  );
}

// --- AI Mock Interview ----------------------------------------------------

export function AiMockSection() {
  return (
    <Section className="relative overflow-hidden border-t border-border">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_60%_at_80%_0%,hsl(262_83%_58%/0.12),transparent_70%)]"
      />
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal delay={100} className="order-2 lg:order-1">
          <AiMockPreview />
        </Reveal>

        <Reveal className="order-1 lg:order-2">
          <SectionHeading
            align="left"
            eyebrow="AI mock interview"
            title={
              <>
                Don&apos;t Just Prepare.
                <br />
                Practice the Interview.
              </>
            }
            subtitle="Simulate realistic technical interviews with AI, get feedback, and understand where you need to improve."
          />
          <div className="mt-8">
            <CtaLink href="/mock" label="Start a Mock Interview" />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

// --- Learning grid --------------------------------------------------------

export function LearningSection() {
  return (
    <Section id="learn" className="border-t border-border">
      <Reveal>
        <SectionHeading
          eyebrow="Learn"
          title="What You Can Prepare"
          subtitle="Structured, interview-focused tracks across the areas technical interviews test — free to explore, no account required."
        />
      </Reveal>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {LEARNING_CARDS.map((card, i) => {
          const Icon = card.icon;
          const a = ACCENT_STYLES[card.accent];
          return (
            <Reveal key={card.title} delay={i * 80}>
              <Link
                href={card.href}
                className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/30"
              >
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl",
                    a.bg,
                  )}
                >
                  <Icon className={cn("h-5 w-5", a.text)} />
                </span>
                <h3 className="mt-4 text-base font-semibold">{card.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {card.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Explore <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

// --- Practice with purpose ------------------------------------------------

export function PracticeSection() {
  return (
    <Section id="practice" className="border-t border-border">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="Practice"
            title="Practice With Purpose."
            subtitle="Learn the patterns behind interview problems instead of randomly solving hundreds of questions."
          />
          <div className="mt-6 flex flex-wrap gap-2">
            {PATTERN_TAGS.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-8">
            <CtaLink href="/practice" label="Explore Practice" />
          </div>
        </Reveal>

        <Reveal delay={100} aria-hidden>
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Pattern mastery
            </p>
            <div className="space-y-4">
              {PATTERNS.map((p) => {
                const Icon = p.icon;
                const a = ACCENT_STYLES[p.accent];
                return (
                  <div key={p.label}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-foreground">
                        <Icon className={cn("h-4 w-4", a.text)} />
                        {p.label}
                      </span>
                      <span className="font-medium tabular-nums text-muted-foreground">
                        {p.value}%
                      </span>
                    </div>
                    <ProgressBar value={p.value} accent={p.accent} />
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

// --- Company preparation --------------------------------------------------

export function CompanySection() {
  return (
    <Section className="border-t border-border">
      <Reveal>
        <SectionHeading
          eyebrow="Company preparation"
          title="Preparing for a Specific Company?"
          subtitle="Focus your preparation around the interviews that matter to you."
        />
      </Reveal>

      <Reveal delay={80} className="mx-auto mt-12 max-w-4xl">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {COMPANIES.map((company) => (
            <Link
              key={company}
              href="/companies"
              className="flex items-center justify-center rounded-xl border border-border bg-card px-4 py-5 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
            >
              {company}
            </Link>
          ))}
        </div>
      </Reveal>

      <Reveal delay={120} className="mt-10 text-center">
        <CtaLink href="/companies" label="Explore Company Preparation" />
      </Reveal>
    </Section>
  );
}

// --- Career levels --------------------------------------------------------

export function CareerLevelsSection() {
  return (
    <Section className="border-t border-border">
      <Reveal>
        <SectionHeading
          eyebrow="For every level"
          title="Wherever You Are. Start Here."
          subtitle="Compile Ready meets you at your level — from your first interview to staff-level system design and leadership rounds."
        />
      </Reveal>

      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        {CAREER_LEVELS.map((level, i) => {
          const Icon = level.icon;
          const a = ACCENT_STYLES[level.accent];
          return (
            <Reveal key={level.kicker} delay={i * 90}>
              <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-7">
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl",
                    a.bg,
                  )}
                >
                  <Icon className={cn("h-5 w-5", a.text)} />
                </span>
                <p
                  className={cn(
                    "mt-5 text-xs font-semibold uppercase tracking-[0.18em]",
                    a.text,
                  )}
                >
                  {level.kicker}
                </p>
                <h3 className="mt-1 text-lg font-semibold">{level.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {level.description}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={120} className="mt-10 text-center">
        <CtaLink href="/learning" label="Find My Learning Path" />
      </Reveal>
    </Section>
  );
}

// --- Readiness ------------------------------------------------------------

export function ReadinessSection() {
  return (
    <Section className="border-t border-border">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="Readiness"
            title="Know When You're Ready."
            subtitle="Compile Ready is a preparation system, not just a content library. Track your readiness across every competency and always know your next move."
          />
        </Reveal>

        <Reveal delay={100} aria-hidden>
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-7">
            <div className="flex items-center gap-5">
              <ScoreRing value={READINESS_OVERALL} accent="blue" size={104} />
              <div>
                <p className="text-sm text-muted-foreground">
                  Interview Readiness
                </p>
                <p className="text-3xl font-bold tabular-nums">
                  {READINESS_OVERALL}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Trending up this week
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t border-border pt-5">
              {READINESS_METRICS.map((m) => (
                <div key={m.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-medium tabular-nums">{m.value}%</span>
                  </div>
                  <ProgressBar value={m.value} accent={m.accent} />
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Recommended next
              </p>
              <div className="flex flex-wrap gap-2">
                {RECOMMENDED_NEXT.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs text-primary"
                  >
                    <Sparkles className="h-3 w-3" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

// --- Founder --------------------------------------------------------------

export function FounderSection() {
  return (
    <Section className="border-t border-border">
      <Reveal className="mx-auto max-w-3xl text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Built by engineers
        </p>
        <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
          Built by Engineers. Designed for Engineers.
        </h2>
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
          Compile Ready exists because interview prep is scattered across
          dozens of tabs, courses and playlists. We&apos;re building one focused
          system that connects learning, practice and realistic interviews — so
          you always know what to do next and when you&apos;re truly ready.
        </p>
      </Reveal>
    </Section>
  );
}

// --- Why CompileReady ------------------------------------------------------

const WHY_POINTS = [
  {
    title: "AI-powered practice",
    description:
      "Get instant, specific feedback on your code, designs and answers — not just pass or fail.",
    icon: Sparkles,
    accent: "blue",
  },
  {
    title: "Structured & interview-focused",
    description:
      "Curricula built around what interviews actually test, from fundamentals to staff-level design.",
    icon: BookOpen,
    accent: "emerald",
  },
  {
    title: "Realistic AI mock interviews",
    description:
      "Face a multi-persona AI panel, then get a scorecard, per-interviewer feedback and a plan.",
    icon: MessagesSquare,
    accent: "violet",
  },
  {
    title: "Know when you're ready",
    description:
      "Track your progress across every competency so you always know your next move.",
    icon: LineChart,
    accent: "orange",
  },
] as const;

export function WhySection() {
  return (
    <Section className="border-t border-border">
      <Reveal>
        <SectionHeading
          eyebrow="Why CompileReady"
          title="Prepare Smarter, Not Just Harder."
          subtitle="One focused system that connects learning, practice and realistic interviews — so preparation stops being scattered across dozens of tabs."
        />
      </Reveal>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {WHY_POINTS.map((point, i) => {
          const Icon = point.icon;
          const a = ACCENT_STYLES[point.accent];
          return (
            <Reveal key={point.title} delay={i * 80}>
              <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl",
                    a.bg,
                  )}
                >
                  <Icon className={cn("h-5 w-5", a.text)} />
                </span>
                <h3 className="mt-4 text-base font-semibold">{point.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {point.description}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
