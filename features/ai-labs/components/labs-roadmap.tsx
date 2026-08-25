import type { LabMeta } from "../types";
import { LabCard } from "./lab-card";

/**
 * The full lab roadmap as a responsive grid of cards. Pure presentation — the
 * ordering + status come from the registry via the page.
 */
export function LabsRoadmap({ labs }: { labs: LabMeta[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {labs.map((meta) => (
        <LabCard key={meta.slug} meta={meta} />
      ))}
    </div>
  );
}
