import { Reveal } from "./reveal";
import { AuthCtas } from "./cta-buttons";
import { DashboardPreview } from "./dashboard-preview";

const CODE_STEPS = ["learn()", "practice()", "test()", "interview()", "deploy()"];

/**
 * Hero — the single most important section. The brand + tagline dominate; a
 * live product preview sits directly below. Contains the page's only <h1>.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="cr-grid absolute inset-0 -z-10" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(60%_50%_at_50%_0%,hsl(var(--primary)/0.16),transparent_75%)]"
      />

      <div className="mx-auto max-w-screen-2xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-cr-pulse-ring" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              Compile Ready
            </span>
          </Reveal>

          <Reveal delay={60}>
            <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-6xl">
              Build. Test.{" "}
              <span className="bg-gradient-to-r from-primary to-sky-400 bg-clip-text text-transparent">
                Deploy Your Career.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="mt-5 text-lg font-medium text-foreground/90 sm:text-xl">
              Learn. Practice. Get interview-ready.
            </p>
          </Reveal>

          <Reveal delay={160}>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
              A modern platform for software engineers to build the skills,
              practice the problems, and prepare for technical interviews.
            </p>
          </Reveal>

          <Reveal delay={220}>
            <AuthCtas className="mt-8 justify-center" />
          </Reveal>

          <Reveal delay={280}>
            <div
              aria-hidden
              className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground/70"
            >
              {CODE_STEPS.map((step) => (
                <span key={step} className="inline-flex items-center gap-1.5">
                  <span className="text-primary/70">&gt;</span>
                  {step}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={120} className="mx-auto mt-14 max-w-3xl">
          <DashboardPreview />
        </Reveal>
      </div>
    </section>
  );
}
