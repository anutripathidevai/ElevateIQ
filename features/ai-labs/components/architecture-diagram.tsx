"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Markdown } from "@/components/practice/markdown";
import { ACCENT_STYLES, type AccentKey } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { LabArchitectureNode } from "../types";

/**
 * Interactive architecture view: a plain-text flow diagram plus clickable nodes.
 * Selecting a node reveals what it does, why it exists, its I/O, a common
 * failure, and a tied interview question — so the diagram doubles as a study aid.
 */
export function ArchitectureDiagram({
  title,
  flow,
  nodes,
  accent,
}: {
  title?: string;
  flow: string;
  nodes: LabArchitectureNode[];
  accent: AccentKey;
}) {
  const [selectedId, setSelectedId] = useState<string>(nodes[0]?.id ?? "");
  const a = ACCENT_STYLES[accent];
  const selected = nodes.find((n) => n.id === selectedId) ?? nodes[0];

  return (
    <div className="space-y-5">
      <figure className="overflow-hidden rounded-xl border border-border bg-muted/30">
        {title && (
          <figcaption className="border-b border-border px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </figcaption>
        )}
        <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-foreground sm:text-sm">
          {flow}
        </pre>
      </figure>

      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        {/* Node list */}
        <div className="flex flex-col gap-1.5" role="tablist" aria-label="Architecture components">
          {nodes.map((node) => {
            const active = node.id === selected?.id;
            return (
              <button
                key={node.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedId(node.id)}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  active
                    ? cn(a.border, a.bg, "font-medium")
                    : "border-border hover:bg-muted/50",
                )}
              >
                <span className="truncate">{node.label}</span>
                <ChevronRight
                  className={cn("h-4 w-4 shrink-0", active ? a.text : "text-muted-foreground")}
                />
              </button>
            );
          })}
        </div>

        {/* Node detail */}
        {selected && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h4 className="text-base font-semibold">{selected.label}</h4>
            <dl className="mt-3 space-y-3 text-sm">
              <DetailRow label="What it does">
                <Markdown className="text-muted-foreground">{selected.whatMD}</Markdown>
              </DetailRow>
              <DetailRow label="Why it exists">
                <Markdown className="text-muted-foreground">{selected.whyMD}</Markdown>
              </DetailRow>
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailRow label="Input">
                  <p className="text-muted-foreground">{selected.input}</p>
                </DetailRow>
                <DetailRow label="Output">
                  <p className="text-muted-foreground">{selected.output}</p>
                </DetailRow>
              </div>
              <DetailRow label="Common failure">
                <p className="text-muted-foreground">{selected.commonFailure}</p>
              </DetailRow>
            </dl>
            <div className={cn("mt-4 rounded-lg border p-3 text-sm", a.border, a.bg)}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Interview question
              </p>
              <p className="mt-1 font-medium">{selected.interviewQuestion}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}
