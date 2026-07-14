import Link from "next/link";
import { ArrowRight, GraduationCap, Sparkles } from "lucide-react";
import { TRACK_LIST } from "@/lib/tracks";
import { CAREER_MODULES } from "@/lib/features";
import { countProblemsByTrack } from "@/services/problems";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  let counts: Record<string, number> = {};
  try {
    counts = await countProblemsByTrack();
  } catch {
    counts = {};
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b border-border px-4 md:px-8">
        <div className="flex items-center gap-2 font-semibold">
          <GraduationCap className="h-5 w-5 text-primary" />
          ElevateIQ
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 py-20 text-center sm:py-28">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            The AI career platform for software engineers
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Elevate every step of your
            <br className="hidden sm:block" /> engineering career
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
            Practice DSA, System Design, LLD, and Behavioral rounds, rehearse
            with an AI interview panel, generate STAR stories, and mine real
            company questions — all with instant, structured AI feedback.
            {total > 0 ? ` ${total} curated problems ready to go.` : ""}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/practice/dsa"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Start practicing <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/panel"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            >
              Try a panel interview
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-16">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold tracking-tight">Career toolkit</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A growing suite of AI-powered modules. More are on the way.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CAREER_MODULES.map((m) => {
              const Icon = m.icon;
              const isLive = m.status === "live";
              const card = (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-6 w-6", m.accent)} />
                    <h3 className="text-base font-semibold">{m.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {m.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {isLive ? "Available now" : "Coming soon"}
                    </span>
                    {isLive && (
                      <span className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        Open <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                </>
              );
              return isLive ? (
                <Link
                  key={m.id}
                  href={m.href}
                  className="group rounded-xl border border-border p-6 transition-colors hover:border-primary/40 hover:bg-accent/40"
                >
                  {card}
                </Link>
              ) : (
                <div
                  key={m.id}
                  className="rounded-xl border border-dashed border-border p-6 opacity-70"
                  aria-disabled
                >
                  {card}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-24">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold tracking-tight">
              Practice tracks
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sharpen the fundamentals with structured, AI-graded practice.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {TRACK_LIST.map((t) => {
              const Icon = t.icon;
              const count = counts[t.key] ?? 0;
              return (
                <Link
                  key={t.key}
                  href={`/practice/${t.slug}`}
                  className="group rounded-xl border border-border p-6 transition-colors hover:border-primary/40 hover:bg-accent/40"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-6 w-6", t.accent)} />
                    <h3 className="text-lg font-semibold">{t.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {count > 0 ? `${count} problems` : "Coming soon"}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Practice <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        ElevateIQ · Built with Next.js &amp; Azure OpenAI.
      </footer>
    </div>
  );
}
