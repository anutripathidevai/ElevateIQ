import type { LucideIcon } from "lucide-react";
import { ACCENT_STYLES, type AccentKey } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/** Gamification badge. Unearned badges render muted/locked. */
export function AchievementBadge({
  label,
  description,
  icon: Icon,
  accent = "blue",
  earned,
}: {
  label: string;
  description: string;
  icon: LucideIcon;
  accent?: AccentKey;
  earned: boolean;
}) {
  const a = ACCENT_STYLES[accent];
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border p-4 text-center",
        earned ? cn("border-border bg-card", a.border) : "border-dashed border-border bg-muted/30 opacity-60",
      )}
    >
      <span
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full",
          earned ? a.bg : "bg-muted",
        )}
      >
        <Icon className={cn("h-6 w-6", earned ? a.text : "text-muted-foreground")} />
      </span>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {!earned && (
        <span className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
          Locked
        </span>
      )}
    </div>
  );
}
