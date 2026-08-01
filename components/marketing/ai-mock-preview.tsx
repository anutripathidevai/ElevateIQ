import {
  CheckCircle2,
  Circle,
  CircleDashed,
  Clock,
  Mic,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WindowFrame } from "./window-frame";

interface EvalRow {
  label: string;
  state: "done" | "partial" | "pending";
}

const EVALUATION: EvalRow[] = [
  { label: "Requirements", state: "done" },
  { label: "Architecture", state: "done" },
  { label: "Scalability", state: "partial" },
  { label: "Trade-offs", state: "pending" },
];

function EvalIcon({ state }: { state: EvalRow["state"] }) {
  if (state === "done")
    return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (state === "partial")
    return <CircleDashed className="h-4 w-4 text-amber-500" />;
  return <Circle className="h-4 w-4 text-muted-foreground/50" />;
}

/**
 * Animated AI-interviewer preview. CSS-only animations (typing dots, live
 * pulse) keep it lightweight and they pause under prefers-reduced-motion.
 * Decorative — hidden from assistive tech.
 */
export function AiMockPreview({ className }: { className?: string }) {
  return (
    <div aria-hidden className={className}>
      <WindowFrame label="compileready.com/mock" accentDot="violet">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/15">
              <Mic className="h-4 w-4 text-violet-400" />
              <span className="absolute inset-0 rounded-full animate-cr-pulse-ring" />
            </span>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-violet-400">
                AI Interviewer
              </p>
              <p className="text-sm font-semibold">System Design Interview</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 font-mono text-xs tabular-nums text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            34:21
          </span>
        </div>

        <div className="rounded-xl border border-border bg-background/50 p-3.5">
          <p className="text-sm leading-relaxed text-foreground">
            &ldquo;Design a scalable URL shortener.&rdquo;
          </p>
          <div className="mt-2.5 flex items-center gap-1">
            <span
              className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-cr-dot"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-cr-dot"
              style={{ animationDelay: "180ms" }}
            />
            <span
              className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-cr-dot"
              style={{ animationDelay: "360ms" }}
            />
            <span className="ml-1.5 text-[11px] text-muted-foreground">
              listening…
            </span>
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Live evaluation
          </p>
          <div className="grid grid-cols-2 gap-2">
            {EVALUATION.map((row) => (
              <div
                key={row.label}
                className={cn(
                  "flex items-center gap-2 rounded-lg border border-border px-2.5 py-2 text-xs",
                  row.state === "pending"
                    ? "text-muted-foreground"
                    : "text-foreground",
                )}
              >
                <EvalIcon state={row.state} />
                {row.label}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <span className="inline-flex w-full items-center justify-center rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
            End Interview
          </span>
        </div>
      </WindowFrame>
    </div>
  );
}
