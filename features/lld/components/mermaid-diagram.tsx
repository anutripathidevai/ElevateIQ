"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  Loader2,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * Lazily-rendered Mermaid diagram (UML class / sequence / state diagrams).
 *
 * Mermaid is a heavy client-only dependency, so it is dynamically imported on
 * first render and never bundled into the server output. The component is
 * theme-aware (re-renders on light/dark switch), fully SSR-safe (guards
 * `window`), and degrades gracefully with loading / empty / error states.
 *
 * A "Maximize" affordance opens the diagram in a full-screen modal with zoom
 * controls so dense class diagrams are easy to read — mirroring the HLD
 * architecture-diagram experience.
 */
export function MermaidDiagram({
  chart,
  captionMD,
  className,
  title = "Diagram",
}: {
  chart: string;
  captionMD?: string;
  className?: string;
  title?: string;
}) {
  const { resolvedTheme } = useTheme();
  const reactId = useId().replace(/[:]/g, "");
  const [svg, setSvg] = useState<string>("");
  const [state, setState] = useState<"loading" | "ready" | "error" | "empty">(
    "loading",
  );
  const [fullscreen, setFullscreen] = useState(false);
  const renderSeq = useRef(0);

  const source = chart?.trim() ?? "";

  useEffect(() => {
    if (!source) {
      setState("empty");
      return;
    }
    let cancelled = false;
    const seq = ++renderSeq.current;
    setState("loading");

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: resolvedTheme === "light" ? "default" : "dark",
          fontFamily: "inherit",
          suppressErrorRendering: true,
        });
        const { svg: out } = await mermaid.render(
          `lld-mermaid-${reactId}-${seq}`,
          source,
        );
        if (!cancelled && seq === renderSeq.current) {
          setSvg(out);
          setState("ready");
        }
      } catch {
        if (!cancelled && seq === renderSeq.current) {
          setState("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [source, resolvedTheme, reactId]);

  // Close the modal on Escape.
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  if (state === "empty") return null;

  return (
    <figure
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card",
        className,
      )}
    >
      {state === "ready" && (
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          aria-label="Maximize diagram"
          title="Maximize"
          className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-md border border-border bg-background/80 px-2 py-1 text-xs text-muted-foreground opacity-0 backdrop-blur transition-opacity hover:text-foreground focus:opacity-100 group-hover:opacity-100"
        >
          <Maximize2 className="h-3.5 w-3.5" /> Expand
        </button>
      )}

      <div className="min-h-[8rem] overflow-x-auto p-4">
        {state === "loading" && (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Rendering diagram…
          </div>
        )}
        {state === "error" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-warning">
              <AlertTriangle className="h-4 w-4" /> Couldn&apos;t render this
              diagram — showing the source instead.
            </div>
            <pre className="overflow-x-auto rounded-md border border-border bg-background p-3 font-mono text-xs text-muted-foreground">
              {source}
            </pre>
          </div>
        )}
        {state === "ready" && (
          <div
            className="mermaid-svg flex justify-center [&_svg]:h-auto [&_svg]:max-w-full"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </div>

      {captionMD && (
        <figcaption className="border-t border-border px-4 py-2 text-center text-xs text-muted-foreground">
          {captionMD}
        </figcaption>
      )}

      {fullscreen && (
        <FullscreenDiagram
          svg={svg}
          title={title}
          onClose={() => setFullscreen(false)}
        />
      )}
    </figure>
  );
}

/** Full-screen modal with zoom + pan for a rendered Mermaid SVG. */
function FullscreenDiagram({
  svg,
  title,
  onClose,
}: {
  svg: string;
  title: string;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => setMounted(true), []);

  const clamp = useCallback(
    (z: number) => Math.min(4, Math.max(0.4, Number(z.toFixed(2)))),
    [],
  );

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — full screen`}
      className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur"
      onClick={onClose}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="truncate text-sm font-semibold">{title}</p>
        <div
          className="flex items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setZoom((z) => clamp(z - 0.2))}
            aria-label="Zoom out"
            className="rounded-md border border-border bg-card p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-xs tabular-nums text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => clamp(z + 0.2))}
            aria-label="Zoom in"
            className="rounded-md border border-border bg-card p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            aria-label="Reset zoom"
            className="rounded-md border border-border bg-card p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close full screen"
            className="ml-1 inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/50"
          >
            <X className="h-4 w-4" /> Close
          </button>
        </div>
      </div>
      <div
        className="flex-1 overflow-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mx-auto w-fit origin-top transition-transform [&_svg]:h-auto"
          style={{ transform: `scale(${zoom})` }}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </div>,
    document.body,
  );
}
