import Link from "next/link";
import { ArrowRight, GraduationCap, Sparkles } from "lucide-react";
import { TRACK_LIST } from "@/lib/tracks";
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
          InterviewPrep
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
            AI-powered interview practice
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            One place to prepare for
            <br className="hidden sm:block" /> software interviews
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
            Practice DSA, System Design, LLD, and Behavioral rounds with
            instant, structured AI feedback.
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
              href="/mock"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            >
              Try a mock interview
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-24">
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
        Built with Next.js &amp; Azure OpenAI.
      </footer>
    </div>
  );
}
