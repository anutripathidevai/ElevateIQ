import { cn } from "@/lib/utils";
import type { AccentKey } from "@/lib/navigation";
import { ACCENT_STYLES } from "@/lib/navigation";
import type { RecursionTreeNode } from "../types";

/**
 * A static, explanation-only recursion-tree visualisation. Renders the call tree
 * as an indented, connector-lined hierarchy so learners can *see* the overlapping
 * subproblems that motivate memoization. Never executes anything — it's purely a
 * teaching diagram built from authored data.
 */
function TreeNode({
  node,
  accent,
  depth,
}: {
  node: RecursionTreeNode;
  accent: AccentKey;
  depth: number;
}) {
  const a = ACCENT_STYLES[accent];
  const cached = /cach|memo|reuse/i.test(node.note ?? "");
  return (
    <li className="relative">
      <div className="flex items-center gap-2 py-1">
        <span
          className={cn(
            "inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-xs font-medium",
            cached
              ? "border-dashed border-muted-foreground/40 bg-muted/40 text-muted-foreground"
              : cn(a.border, a.bg, a.text),
          )}
        >
          {node.label}
        </span>
        {node.note && (
          <span className="text-xs text-muted-foreground">{node.note}</span>
        )}
      </div>
      {node.children && node.children.length > 0 && (
        <ul className="ml-4 border-l border-border pl-4">
          {node.children.map((child, i) => (
            <TreeNode
              key={`${child.label}-${i}`}
              node={child}
              accent={accent}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function RecursionTree({
  root,
  accent = "orange",
  className,
}: {
  root: RecursionTreeNode;
  accent?: AccentKey;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg border border-border bg-muted/20 p-4",
        className,
      )}
    >
      <ul>
        <TreeNode node={root} accent={accent} depth={0} />
      </ul>
    </div>
  );
}
