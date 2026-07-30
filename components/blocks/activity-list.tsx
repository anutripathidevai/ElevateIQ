import type { LucideIcon } from "lucide-react";
import { ACCENT_STYLES, type AccentKey } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export interface ActivityListItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  accent: AccentKey;
  icon: LucideIcon;
}

/** Vertical feed of recent events with an accent icon chip per row. */
export function ActivityList({ items }: { items: ActivityListItem[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const a = ACCENT_STYLES[item.accent];
        const Icon = item.icon;
        return (
          <li
            key={item.id}
            className="flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
          >
            <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", a.bg)}>
              <Icon className={cn("h-4 w-4", a.text)} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.title}</p>
              <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
          </li>
        );
      })}
    </ul>
  );
}
