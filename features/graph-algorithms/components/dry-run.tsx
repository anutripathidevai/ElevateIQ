import { Markdown } from "@/components/practice/markdown";
import type { DryRun } from "../types";

/**
 * A tabular dry run: a sample input, then a scrollable table where each row is
 * one iteration and columns are the tracked state (Queue, Visited, Dist, …).
 * Generic enough to visualise any algorithm's execution without bespoke UI.
 */
export function DryRunTable({ dryRun }: { dryRun: DryRun }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Sample input
        </h4>
        <Markdown>{dryRun.inputMD}</Markdown>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-muted/50">
              {dryRun.columns.map((c) => (
                <th
                  key={c}
                  className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dryRun.rows.map((row, i) => (
              <tr key={i} className="odd:bg-background even:bg-muted/20">
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className="whitespace-pre-wrap border-b border-border px-3 py-2 align-top font-mono text-xs"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dryRun.narrativeMD && <Markdown>{dryRun.narrativeMD}</Markdown>}
    </div>
  );
}
