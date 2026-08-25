import Link from "next/link";
import { ArrowLeft, Clock, Construction } from "lucide-react";
import { ACCENT_STYLES } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { LabMeta } from "../types";
import { resolveLabIcon } from "./lab-icons";

/**
 * Polished placeholder for labs that are in the catalog but not yet authored.
 * Keeps the roadmap navigable and sets expectations without a broken page.
 */
export function ComingSoon({ meta }: { meta: LabMeta }) {
  const a = ACCENT_STYLES[meta.accent];
  const Icon = resolveLabIcon(meta.icon);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/ai-labs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All labs
      </Link>

      <div
        className={cn(
          "mt-5 overflow-hidden rounded-2xl border bg-gradient-to-br p-8 text-center",
          a.border,
          a.gradient,
        )}
      >
        <span className={cn("mx-auto flex h-14 w-14 items-center justify-center rounded-2xl", a.bg)}>
          <Icon className={cn("h-7 w-7", a.text)} />
        </span>
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Lab {meta.order} · {meta.difficulty}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{meta.title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          {meta.summary}
        </p>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium">
          <Construction className="h-3.5 w-3.5" /> In development
          <span aria-hidden>·</span>
          <Clock className="h-3.5 w-3.5" /> ~{meta.estimatedMinutes} min
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-1.5">
          {meta.concepts.map((c) => (
            <span
              key={c}
              className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        This lab is being built. In the meantime, start with{" "}
        <Link href="/ai-labs/llm-playground" className={cn("font-medium hover:underline", a.text)}>
          the LLM Playground
        </Link>
        .
      </p>
    </div>
  );
}
