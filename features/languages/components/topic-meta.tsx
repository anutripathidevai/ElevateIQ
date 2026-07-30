import { BookOpen, Clock, Dumbbell } from "lucide-react";
import type { Topic } from "../types";
import { formatMinutes, topicDifficultyClass } from "./ui";
import { cn } from "@/lib/utils";

/** Difficulty badge for a topic. */
export function TopicDifficultyBadge({ topic }: { topic: Topic }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        topicDifficultyClass(topic.difficulty),
      )}
    >
      {topic.difficulty}
    </span>
  );
}

/**
 * The metadata strip under a topic title: difficulty, reading time, practice
 * time, and tags. Mirrors the LLD/Graph problem header.
 */
export function TopicMeta({ topic }: { topic: Topic }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <TopicDifficultyBadge topic={topic} />
        <span className="inline-flex items-center gap-1.5">
          <BookOpen className="h-4 w-4" />
          {formatMinutes(topic.estimatedReadingMin)} read
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Dumbbell className="h-4 w-4" />
          {formatMinutes(topic.estimatedPracticeMin)} practice
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {formatMinutes(
            topic.estimatedReadingMin + topic.estimatedPracticeMin,
          )}{" "}
          total
        </span>
      </div>
      {topic.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topic.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
