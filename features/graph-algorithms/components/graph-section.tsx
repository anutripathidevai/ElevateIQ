import { ChevronDown, type LucideIcon } from "lucide-react";
import { ACCENT_STYLES, type AccentKey } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/**
 * A collapsible, anchored learning section. Uses the native <details> element
 * (the same pattern as the LLD hints) so it works without client JS: the whole
 * section is expandable/collapsible and its `id` is a scroll target for the TOC.
 */
export function GraphSection({
  id,
  title,
  icon: Icon,
  accent = "blue",
  defaultOpen = true,
  children,
}: {
  id: string;
  title: string;
  icon?: LucideIcon;
  accent?: AccentKey;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const a = ACCENT_STYLES[accent];
  return (
    <details
      id={id}
      open={defaultOpen}
      className="group scroll-mt-24 rounded-xl border border-border bg-card shadow-sm"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-5 py-4 hover:bg-muted/40">
        {Icon && (
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              a.bg,
            )}
          >
            <Icon className={cn("h-5 w-5", a.text)} />
          </span>
        )}
        <h2 className="flex-1 text-lg font-semibold tracking-tight">{title}</h2>
        <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-border px-5 py-5">{children}</div>
    </details>
  );
}
