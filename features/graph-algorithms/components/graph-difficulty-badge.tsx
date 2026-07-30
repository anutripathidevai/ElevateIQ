import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GraphDifficulty } from "../types";

const VARIANT: Record<GraphDifficulty, "success" | "warning" | "danger"> = {
  Easy: "success",
  Medium: "warning",
  Hard: "danger",
};

/** Difficulty pill for the Graph track (Easy/Medium/Hard display strings). */
export function GraphDifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: GraphDifficulty;
  className?: string;
}) {
  return (
    <Badge variant={VARIANT[difficulty]} className={className}>
      {difficulty}
    </Badge>
  );
}
