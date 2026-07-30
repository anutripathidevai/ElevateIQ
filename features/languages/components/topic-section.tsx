import type { LucideIcon } from "lucide-react";
import type { AccentKey } from "@/lib/navigation";
import { ACCENT_STYLES } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/**
 * A collapsible, anchored topic section. Uses a native <details open> element so
 * expand/collapse works without client JavaScript, matching the LLD/Graph
 * pattern. The chevron rotates via Tailwind's `group-open` variant.
 */
export function TopicSection({
  id,
  title,
  icon: Icon,
  accent = "orange",
  children,
}: {
  id: string;
  title: string;
  icon: LucideIcon;
  accent?: AccentKey;
  children: React.ReactNode;
}) {
  const a = ACCENT_STYLES[accent];
  return (
    <details
      id={id}
      open
      className="group scroll-mt-24 rounded-xl border border-border bg-card"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            a.bg,
          )}
        >
          <Icon className={cn("h-5 w-5", a.text)} />
        </span>
        <h2 className="flex-1 text-lg font-semibold tracking-tight">{title}</h2>
        <svg
          className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="border-t border-border p-4 sm:p-5">{children}</div>
    </details>
  );
}
