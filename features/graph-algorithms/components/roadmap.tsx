import { Clock } from "lucide-react";
import { ACCENT_STYLES } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { formatMinutes, moduleAccent } from "./ui";

export interface RoadmapModule {
  order: number;
  title: string;
  pattern: string;
  summary: string;
  authoredCount: number;
  plannedCount: number;
  estimatedMinutes: number;
}

/** A vertical timeline of the ten modules — the recommended learning order. */
export function Roadmap({ modules }: { modules: RoadmapModule[] }) {
  return (
    <ol className="relative space-y-5 before:absolute before:bottom-3 before:left-[15px] before:top-3 before:w-px before:bg-border">
      {modules.map((m) => {
        const accent = moduleAccent(m.order);
        const a = ACCENT_STYLES[accent];
        return (
          <li key={m.order} className="relative flex gap-4">
            <span
              className={cn(
                "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-4 ring-background",
                a.bg,
                a.text,
              )}
            >
              {m.order}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="font-semibold">{m.title}</h3>
                <span className="text-xs text-muted-foreground">
                  {m.pattern}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{m.summary}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                  {m.authoredCount}/{m.plannedCount} problems
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatMinutes(m.estimatedMinutes)}
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
