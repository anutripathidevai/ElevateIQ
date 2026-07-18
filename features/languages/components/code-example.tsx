import type { CodeExample } from "../types";
import { Markdown } from "@/components/practice/markdown";
import { CodeViewer } from "@/components/practice/code-viewer";

/** Pick a sensible Monaco height from the line count. */
function heightFor(code: string): string {
  const lines = code.replace(/\n$/, "").split("\n").length;
  return `${Math.min(520, Math.max(120, lines * 20 + 48))}px`;
}

const EXT: Record<string, string> = {
  javascript: "js",
  typescript: "ts",
  json: "json",
  html: "html",
  css: "css",
};

/** Renders the "Code Examples" section: titled, syntax-highlighted, copyable
 * snippets backed by the shared read-only Monaco viewer. */
export function CodeExamples({ examples }: { examples: CodeExample[] }) {
  return (
    <div className="space-y-6">
      {examples.map((ex, i) => {
        const ext = EXT[ex.language] ?? "txt";
        return (
          <div key={i} className="space-y-2">
            {ex.title && (
              <h3 className="text-sm font-semibold text-foreground">
                {ex.title}
              </h3>
            )}
            {ex.descriptionMD && <Markdown>{ex.descriptionMD}</Markdown>}
            <CodeViewer
              height={heightFor(ex.code)}
              files={[
                {
                  filename: `${ex.title ? slugify(ex.title) : `example-${i + 1}`}.${ext}`,
                  language: ex.language,
                  content: ex.code,
                },
              ]}
            />
          </div>
        );
      })}
    </div>
  );
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "example"
  );
}
