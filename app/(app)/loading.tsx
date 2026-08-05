/**
 * Route-level loading fallback for the authenticated app shell. Rendered inside
 * the app layout (top bar + sidebar stay visible) while a page segment streams
 * in, so data-heavy pages show a skeleton instead of a blank content area.
 */
export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-3">
        <div className="h-8 w-2/3 max-w-md animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-1/2 max-w-sm animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-2xl border border-border bg-card"
          />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
