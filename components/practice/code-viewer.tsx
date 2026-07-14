"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import type { SolutionFile } from "@/lib/lld/types";
import { cn } from "@/lib/utils";

/**
 * Read-only, multi-file code display backed by Monaco. Used to show reference
 * Java classes for LLD solutions with a file-tab switcher.
 */
export function CodeViewer({ files }: { files: SolutionFile[] }) {
  const { resolvedTheme } = useTheme();
  const [active, setActive] = useState(0);
  const file = files[active] ?? files[0];
  if (!file) return null;

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="flex flex-wrap gap-1 border-b border-border bg-muted/40 p-1">
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
      </div>
      <Editor
        height="440px"
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
