import type { CareerTool } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";
import { AiActions } from "./ai-actions";

/** Career tool tile (resume, ATS, tailoring…) with primary CTA + AI actions. */
export function CareerToolCard({ tool }: { tool: CareerTool }) {
  const Icon = tool.icon;
  return (
    <article
      id={tool.anchor}
      className="flex h-full scroll-mt-20 flex-col rounded-xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="mb-3 flex items-center gap-3">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10")}>
          <Icon className="h-5 w-5 text-orange-500" />
        </span>
        <h3 className="font-semibold leading-tight">{tool.title}</h3>
      </div>

      <p className="mb-4 flex-1 text-sm text-muted-foreground">{tool.description}</p>

      <div className="mt-auto space-y-3">
        <button
          type="button"
          className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-orange-500 px-4 text-sm font-medium text-white transition-colors hover:bg-orange-500/90"
        >
          {tool.cta}
        </button>
        <AiActions actions={tool.aiActions} context={tool.title} size="xs" />
      </div>
    </article>
  );
}
