import { moduleAccent } from "./ui";
import { ModuleCard, type ModuleView } from "./module-card";

/**
 * The learning roadmap: the full ordered list of modules (published and
 * upcoming), each rendered as an expandable, progress-aware card.
 */
export function Roadmap({
  language,
  modules,
}: {
  language: string;
  modules: ModuleView[];
}) {
  return (
    <div className="space-y-3">
      {modules.map((m) => (
        <ModuleCard
          key={m.id}
          language={language}
          module={m}
          accent={moduleAccent(m.order)}
        />
      ))}
    </div>
  );
}
