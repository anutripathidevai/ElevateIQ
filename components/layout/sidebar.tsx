import { NavContent } from "./nav-content";

/** Desktop sidebar — sticky, scrollable, hidden on small screens. */
export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border md:block">
      <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
        <NavContent />
      </div>
    </aside>
  );
}
