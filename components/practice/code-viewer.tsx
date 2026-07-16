"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Check, Copy } from "lucide-react";
import type { SolutionFile } from "@/lib/lld/types";
import { useCopyToClipboard } from "@/features/shared/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";

/**
 * Read-only, multi-file code display backed by Monaco. Used to show reference
 * Java classes for LLD/Graph solutions with a file-tab switcher, line numbers,
 * syntax highlighting, and a one-click copy button for the active file.
 */
export function CodeViewer({
  files,
  height = "440px",
}: {
  files: SolutionFile[];
  height?: string;
}) {
  const { resolvedTheme } = useTheme();
  const [active, setActive] = useState(0);
  const [copied, copy] = useCopyToClipboard();
  const file = files[active] ?? files[0];
  if (!file) return null;

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 p-1">
        {files.map((f, i) => (
          <button
            key={f.filename}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              "rounded px-2.5 py-1 font-mono text-xs transition-colors",
              i === active
                ? "bg-background font-medium shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.filename}
          </button>
        ))}
        <button
          type="button"
          onClick={() => copy(file.content)}
          className="ml-auto inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
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
      <Editor
        height={height}
        language={file.language}
        theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
        path={file.filename}
        value={file.content}
        loading={
          <div className="p-4 text-sm text-muted-foreground">Loading…</div>
        }
        options={{
          readOnly: true,
          domReadOnly: true,
          minimap: { enabled: false },
          fontSize: 13,
          scrollBeyondLastLine: false,
          tabSize: 4,
          automaticLayout: true,
          padding: { top: 12 },
        }}
      />
    </div>
  );
}
