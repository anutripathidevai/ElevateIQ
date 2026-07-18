"use client";

import { Check, Copy } from "lucide-react";
import { useCopyToClipboard } from "@/features/shared/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";

/**
 * Lightweight, read-only code block with a line-number gutter and a copy
 * button. Used for the many short snippets on a topic page (output prediction,
 * exercise solutions, cheat sheet) where mounting a full Monaco editor per
 * block would be wasteful. The interactive Playground uses Monaco; this does
 * not.
 */
export function CodeBlock({
  code,
  label,
  className,
}: {
  code: string;
  label?: string;
  className?: string;
}) {
  const [copied, copy] = useCopyToClipboard();
  const lines = code.replace(/\n$/, "").split("\n");

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-[#1e1e1e]",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border/50 px-3 py-1.5">
        <span className="font-mono text-xs text-muted-foreground">
          {label ?? "javascript"}
        </span>
        <button
          type="button"
          onClick={() => copy(code)}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-success" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copy
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto">
        <pre className="min-w-full py-3 font-mono text-xs leading-relaxed text-slate-100">
          <code>
            {lines.map((line, i) => (
              <div key={i} className="table-row">
                <span className="table-cell select-none pr-4 pl-3 text-right text-slate-500">
                  {i + 1}
                </span>
                <span className="table-cell whitespace-pre pr-4">
                  {line || " "}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
