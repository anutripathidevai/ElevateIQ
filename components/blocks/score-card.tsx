import type { LucideIcon } from "lucide-react";
import { ACCENT_STYLES, type AccentKey } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { ScoreRing } from "./primitives";

/**
 * Headline metric card. Percentages render as a circular ring; day counts
 * render as a large number. Used for the dashboard's top KPI row.
 */
export function ScoreCard({
  label,
  value,
  unit,
  accent = "blue",
  icon: Icon,
  hint,
}: {
  label: string;
  value: number;
  unit: "percent" | "days";
  accent?: AccentKey;
  icon: LucideIcon;
  hint?: string;
}) {
  const a = ACCENT_STYLES[accent];
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      {unit === "percent" ? (
        <ScoreRing value={value} accent={accent} />
      ) : (
        <div
          className={cn(
            "flex h-[72px] w-[72px] flex-col items-center justify-center rounded-full",
            a.bg,
          )}
        >
          <span className={cn("text-2xl font-bold", a.text)}>{value}</span>
          <span className="text-[0.65rem] text-muted-foreground">days</span>
        </div>
      )}
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <Icon className={cn("h-4 w-4", a.text)} />
          <p className="text-sm font-medium">{label}</p>
        </div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}
