import { Reveal } from "./reveal";
import { AuthCtas } from "./cta-buttons";

/**
 * Hero — the single most important section. States plainly what CompileReady is,
 * who it is for, and the single primary action. Contains the page's only <h1>.
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
              AI-powered interview prep for{" "}
              <span className="bg-gradient-to-r from-primary to-sky-400 bg-clip-text text-transparent">
                software engineers.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Practice DSA, Low-Level Design, System Design, and Generative AI —
              then get interview-ready with realistic AI mock interviews.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <AuthCtas className="mt-8 justify-center" />
          </Reveal>

          <Reveal delay={260}>
            <p className="mt-4 text-sm text-muted-foreground/80">
              Free to explore — no account needed to start learning.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
