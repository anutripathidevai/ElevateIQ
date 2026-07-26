"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, Minimize2, Minus, Plus, X } from "lucide-react";
import { ACCENT_STYLES } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { SDArchitecture } from "../types";
import { SD_NODE_STYLES } from "./node-styles";

const NODE_W = 132;
const NODE_H = 64;
const MIN_SCALE = 0.4;
const MAX_SCALE = 2.5;

/**
 * Interactive high-level architecture diagram rendered from typed data.
 * Supports mouse/touch pan and wheel/button zoom with no external deps: nodes
 * are absolutely-positioned cards and edges are drawn on an SVG layer that
 * shares the same logical coordinate space, all wrapped in a CSS-transformed
 * canvas inside an overflow-hidden viewport.
 *
 * The diagram can be expanded into a full-screen modal (rendered in a portal so
 * it escapes any clipped/transformed ancestor) for better visibility of dense
 * system designs.
 */
export function ArchitectureDiagram({
  architecture,
  title = "High-Level Architecture",
}: {
  architecture: SDArchitecture;
  title?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-2">
      <DiagramCanvas
        architecture={architecture}
        viewportClassName="h-[420px]"
        onExpand={() => setExpanded(true)}
      />
      {expanded && (
        <DiagramModal title={title} onClose={() => setExpanded(false)}>
          <DiagramCanvas
            architecture={architecture}
            viewportClassName="h-full"
            fullscreen
          />
        </DiagramModal>
      )}
    </div>
  );
}

/**
 * A single self-contained pan/zoom canvas. Each instance owns its own view
 * state, so the inline and full-screen views zoom/pan independently.
 */
function DiagramCanvas({
  architecture,
  viewportClassName,
  fullscreen = false,
  onExpand,
}: {
  architecture: SDArchitecture;
  viewportClassName: string;
  fullscreen?: boolean;
  onExpand?: () => void;
}) {
  const width = architecture.width ?? 940;
  const height = architecture.height ?? 540;

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef<{ x: number; y: number } | null>(null);

  const nodeById = useMemo(() => {
    const m = new Map<string, (typeof architecture.nodes)[number]>();
    architecture.nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [architecture.nodes]);

  const clampScale = (s: number) =>
    Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

  const zoomBy = useCallback((delta: number) => {
    setScale((s) => clampScale(s + delta));
  }, []);

  const reset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return; // only zoom on ctrl/⌘ + wheel
    e.preventDefault();
    setScale((s) => clampScale(s - Math.sign(e.deltaY) * 0.15));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setOffset({
      x: e.clientX - dragging.current.x,
      y: e.clientY - dragging.current.y,
    });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = null;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden border border-border bg-muted/20",
        fullscreen ? "h-full rounded-none border-0" : "rounded-xl",
      )}
    >
      {/* Controls */}
      <div className="absolute right-3 top-3 z-20 flex flex-col gap-1">
        <DiagramButton label="Zoom in" onClick={() => zoomBy(0.2)}>
          <Plus className="h-4 w-4" />
        </DiagramButton>
        <DiagramButton label="Zoom out" onClick={() => zoomBy(-0.2)}>
          <Minus className="h-4 w-4" />
        </DiagramButton>
        <DiagramButton label="Reset view" onClick={reset}>
          <Minimize2 className="h-4 w-4" />
        </DiagramButton>
        {onExpand && (
          <DiagramButton label="Expand to full screen" onClick={onExpand}>
            <Maximize2 className="h-4 w-4" />
          </DiagramButton>
        )}
      </div>
      <span className="pointer-events-none absolute bottom-2 left-3 z-20 text-[11px] text-muted-foreground">
        Drag to pan · Ctrl/⌘ + scroll to zoom
      </span>

      <div
        className={cn(
          "w-full cursor-grab touch-none active:cursor-grabbing",
          viewportClassName,
        )}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        role="img"
        aria-label="System architecture diagram"
      >
        <div
          className="relative origin-top-left"
          style={{
            width,
            height,
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          }}
        >
          {/* Edges */}
          <svg
            width={width}
            height={height}
            className="absolute inset-0 overflow-visible"
          >
            <defs>
              <marker
                id="sd-arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path
                  d="M 0 0 L 10 5 L 0 10 z"
                  className="fill-muted-foreground"
                />
              </marker>
            </defs>
            {architecture.edges.map((edge, i) => {
              const from = nodeById.get(edge.from);
              const to = nodeById.get(edge.to);
              if (!from || !to) return null;
              const midX = (from.x + to.x) / 2;
              const midY = (from.y + to.y) / 2;
              return (
                <g key={`${edge.from}-${edge.to}-${i}`}>
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    className="stroke-muted-foreground/50"
                    strokeWidth={1.5}
                    strokeDasharray={edge.dashed ? "5 4" : undefined}
                    markerEnd="url(#sd-arrow)"
                  />
                  {edge.label && (
                    <text
                      x={midX}
                      y={midY - 4}
                      textAnchor="middle"
                      className="fill-muted-foreground text-[10px]"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {architecture.nodes.map((node) => {
            const style = SD_NODE_STYLES[node.kind];
            const a = ACCENT_STYLES[style.accent];
            const Icon = style.icon;
            return (
              <div
                key={node.id}
                className={cn(
                  "absolute flex flex-col items-center justify-center gap-0.5 rounded-lg border bg-card px-2 text-center shadow-sm",
                  a.border,
                )}
                style={{
                  width: NODE_W,
                  height: NODE_H,
                  left: node.x - NODE_W / 2,
                  top: node.y - NODE_H / 2,
                }}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-md",
                    a.bg,
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", a.text)} />
                </span>
                <span className="text-xs font-semibold leading-tight">
                  {node.label}
                </span>
                {node.sublabel && (
                  <span className="text-[10px] leading-tight text-muted-foreground">
                    {node.sublabel}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Full-screen overlay for the diagram. Rendered in a portal on document.body so
 * it is never clipped by a transformed/overflow-hidden ancestor. Closes on
 * Escape or the close button; locks body scroll while open.
 */
function DiagramModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — full screen`}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close full screen (Esc)"
          className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
          <span className="hidden sm:inline">Close</span>
        </button>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>,
    document.body,
  );
}

function DiagramButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}
