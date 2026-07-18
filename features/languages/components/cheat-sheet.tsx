import { Markdown } from "@/components/practice/markdown";

/** One-page quick-revision cheat sheet, rendered from Markdown. */
export function CheatSheet({ md }: { md: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
      <Markdown>{md}</Markdown>
    </div>
  );
}
