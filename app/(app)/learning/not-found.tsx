/**
 * Learning-scoped 404. Catches `notFound()` from lesson/topic detail pages when
 * a slug doesn't resolve, and offers the available tracks so the user can keep
 * going instead of hitting a dead end. Rendered inside the app shell.
 */
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  BrainCircuit,
  Code2,
  Layers,
  Network,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TRACKS = [
  { label: "DSA", href: "/learning/dsa", icon: Layers },
  { label: "System Design", href: "/learning/system-design", icon: Network },
  { label: "Low-Level Design", href: "/learning/lld", icon: Boxes },
  {
    label: "Generative AI",
    href: "/learning/generative-ai",
    icon: BrainCircuit,
  },
  { label: "Programming Languages", href: "/learning/languages", icon: Code2 },
];

export default function LearningNotFound() {
  return (
    <div className="mx-auto max-w-2xl py-10 text-center">
      <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-primary">
        404
      </p>
      <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
        This lesson could not be found
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        The content you&apos;re looking for may have moved. Pick a track to keep
        learning:
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {TRACKS.map((track) => {
          const Icon = track.icon;
          return (
            <Link
              key={track.href}
              href={track.href}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/30 hover:bg-accent/40"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span className="font-medium">{track.label}</span>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          );
        })}
      </div>
      <div className="mt-8">
        <Link
          href="/learning"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Browse all learning
        </Link>
      </div>
    </div>
  );
}
