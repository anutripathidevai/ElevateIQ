"use client";

import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";

export function CodeEditor({
  value,
  onChange,
  language,
}: {
  value: string;
  onChange: (value: string) => void;
  language: string;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <Editor
        height="360px"
        language={language}
        theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        loading={
          <div className="p-4 text-sm text-muted-foreground">Loading editor…</div>
        }
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          scrollBeyondLastLine: false,
          tabSize: 2,
          automaticLayout: true,
          padding: { top: 12 },
        }}
      />
    </div>
  );
}
