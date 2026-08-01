import { ArrowRight, GraduationCap, Play } from "lucide-react";
import { ScoreRing, ProgressBar } from "@/components/blocks/primitives";
import { ACCENT_STYLES } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { WindowFrame } from "./window-frame";
import {
  READINESS_METRICS,
  READINESS_OVERALL,
  RECOMMENDED_NEXT,
} from "./marketing-data";

/**
 * Representative Compile Ready dashboard preview. Purely illustrative product
 * chrome (not a specific user's data), so the whole frame is hidden from
 * assistive tech — the surrounding section copy carries the meaning.
 */
export function DashboardPreview({ className }: { className?: string }) {
  return (
    <div aria-hidden className={className}>
      <WindowFrame label="compileready.com/dashboard">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Good morning 👋</p>
            <p className="text-sm font-semibold">Interview Readiness</p>
          </div>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
            On track
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
          <div className="flex items-center justify-center rounded-xl border border-border bg-background/50 p-4">
            <ScoreRing value={READINESS_OVERALL} accent="blue" size={92} />
          </div>

          <div className="space-y-2.5">
            {READINESS_METRICS.slice(0, 4).map((m) => (
              <div key={m.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{m.label}</span>
                  <span className="font-medium tabular-nums">{m.value}%</span>
                </div>
                <ProgressBar value={m.value} accent={m.accent} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-background/50 p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Recommended next
          </p>
          <ul className="space-y-1.5">
            {RECOMMENDED_NEXT.map((item, i) => {
              const accent = (["blue", "violet", "rose"] as const)[i] ?? "blue";
              const a = ACCENT_STYLES[accent];
              return (
                <li
                  key={item}
                  className="flex items-center gap-2 text-xs text-foreground"
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", a.solid)} />
                  {item}
                  <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-4 flex gap-2">
          <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">
            <Play className="h-3.5 w-3.5" /> Continue Learning
          </span>
          <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground">
            <GraduationCap className="h-3.5 w-3.5" /> Start Mock Interview
          </span>
        </div>
      </WindowFrame>
    </div>
  );
}
