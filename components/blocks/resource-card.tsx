import type { ResourceGroup } from "@/lib/dashboard-data";
import { ACCENT_STYLES } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { AiActions } from "./ai-actions";

/** Resource collection card with a sample item list and AI study actions. */
export function ResourceCard({
  group,
  aiActions,
}: {
  group: ResourceGroup;
  aiActions: string[];
}) {
  const a = ACCENT_STYLES[group.accent];
  const Icon = group.icon;
  return (
    <article
      id={group.anchor}
      className="flex h-full scroll-mt-20 flex-col rounded-xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="mb-3 flex items-center gap-3">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", a.bg)}>
          <Icon className={cn("h-5 w-5", a.text)} />
        </span>
        <div>
          <h3 className="font-semibold leading-tight">{group.title}</h3>
          <p className="text-xs text-muted-foreground">{group.description}</p>
        </div>
      </div>

      <ul className="mb-4 space-y-1.5">
        {group.items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm">
            <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", a.solid)} />
            <span className="truncate text-muted-foreground">{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto border-t border-border pt-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">AI study tools</p>
        <AiActions actions={aiActions} context={group.title} size="xs" />
      </div>
    </article>
  );
}
