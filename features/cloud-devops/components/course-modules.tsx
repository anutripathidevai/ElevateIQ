import { ModuleCard } from "./module-card";
import type { CDModuleMeta } from "../types";

/**
 * Responsive grid of module cards for the Cloud & DevOps landing page. Server
 * component — the individual cards are the interactive (client) parts.
 */
export function CourseModules({ modules }: { modules: CDModuleMeta[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((m) => (
        <ModuleCard key={m.slug} meta={m} />
      ))}
    </div>
  );
}
