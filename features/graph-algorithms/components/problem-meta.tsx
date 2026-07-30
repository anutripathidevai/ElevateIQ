import { BookOpen, ExternalLink, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { GraphProblem } from "../types";
import { GraphDifficultyBadge } from "./graph-difficulty-badge";

/**
 * The meta bar under a problem title: difficulty, position in the track,
 * reading/solving estimates, a LeetCode link, and the tag + company rows.
 */
export function ProblemMeta({
  problem,
  total,
}: {
  problem: GraphProblem;
  total: number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <GraphDifficultyBadge difficulty={problem.difficulty} />
        <span>
          Problem <span className="font-medium text-foreground">{problem.order}</span> of {total}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <BookOpen className="h-4 w-4" /> {problem.estimatedReadingMin} min read
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Timer className="h-4 w-4" /> ~{problem.estimatedSolvingMin} min to solve
        </span>
        {problem.leetcodeUrl && (
          <a
            href={problem.leetcodeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" /> LeetCode
          </a>
        )}
      </div>

      {problem.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {problem.tags.map((t) => (
            <Badge key={t} variant="outline">
              {t}
            </Badge>
          ))}
        </div>
      )}

      {problem.companies.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Asked at
          </span>
          {problem.companies.map((c) => (
            <Badge key={c} variant="default">
              {c}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
