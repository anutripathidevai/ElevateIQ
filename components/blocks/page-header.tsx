import type { LucideIcon } from "lucide-react";
import { ACCENT_STYLES, type AccentKey } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { AiActions } from "./ai-actions";

/**
 * Hero header shared by every hub page: eyebrow label, title, description, an
 * accent-tinted icon and an optional row of AI-first quick actions.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  accent = "blue",
  aiActions,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  accent?: AccentKey;
  aiActions?: string[];
  children?: React.ReactNode;
}) {
  const a = ACCENT_STYLES[accent];
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-gradient-to-br p-6",
        a.gradient,
      )}
    >
      <div className="flex items-start gap-4">
        {Icon && (
          <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", a.bg)}>
            <Icon className={cn("h-6 w-6", a.text)} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p className={cn("text-xs font-semibold uppercase tracking-wide", a.text)}>
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
          )}
          {aiActions && aiActions.length > 0 && (
            <div className="mt-4">
              <AiActions actions={aiActions} context={title} />
            </div>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
