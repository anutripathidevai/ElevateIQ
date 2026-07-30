import { BookOpen, ExternalLink, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GraphDifficultyBadge } from "@/features/graph-algorithms/components";
import type { DsaProblemLesson } from "../types";

/**
 * The meta bar under a problem-lesson title: difficulty, position in the course,
 * reading/solving estimates, a LeetCode link, and the tag + company rows. Mirrors
 * the Graph problem meta so the two courses feel identical.
 */
export function LessonMeta({
  lesson,
  position,
  total,
}: {
  lesson: DsaProblemLesson;
  /** 1-based position among the course's problems. */
  position: number;
  total: number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <GraphDifficultyBadge difficulty={lesson.difficulty} />
        <span>
          Problem{" "}
          <span className="font-medium text-foreground">{position}</span> of{" "}
          {total}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <BookOpen className="h-4 w-4" /> {lesson.estimatedReadingMin} min read
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Timer className="h-4 w-4" /> ~{lesson.estimatedSolvingMin} min to solve
        </span>
        {lesson.leetcodeUrl && (
          <a
            href={lesson.leetcodeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" /> LeetCode
          </a>
        )}
      </div>

      {lesson.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {lesson.tags.map((t) => (
            <Badge key={t} variant="outline">
              {t}
            </Badge>
          ))}
        </div>
      )}

      {lesson.companies.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Asked at
          </span>
          {lesson.companies.map((c) => (
            <Badge key={c} variant="default">
              {c}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
