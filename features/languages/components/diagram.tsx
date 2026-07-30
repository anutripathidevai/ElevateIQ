import type { DiagramBlock } from "../types";

/**
 * Renders visual diagrams. Prefers a pre-formatted ASCII block (clean, no
 * dependency); if a topic only supplies Mermaid source it is shown as a
 * readable text block too. Authoring convention favours `ascii` so diagrams
 * render identically everywhere without a client-side Mermaid renderer.
 */
export function Diagrams({ diagrams }: { diagrams: DiagramBlock[] }) {
  return (
    <div className="space-y-5">
      {diagrams.map((d, i) => {
        const text = d.ascii ?? d.mermaid ?? "";
        return (
          <figure key={i} className="space-y-2">
            <figcaption className="text-sm font-semibold text-foreground">
              {d.title}
            </figcaption>
            <div className="overflow-x-auto rounded-xl border border-border bg-muted/40 p-4">
              <pre className="font-mono text-xs leading-relaxed text-foreground/90">
                {text}
              </pre>
            </div>
            {d.caption && (
              <p className="text-xs text-muted-foreground">{d.caption}</p>
            )}
          </figure>
        );
      })}
    </div>
  );
}
