import type { Difficulty } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

const MAP: Record<
  Difficulty,
  { label: string; variant: "success" | "warning" | "danger" }
> = {
  EASY: { label: "Easy", variant: "success" },
  MEDIUM: { label: "Medium", variant: "warning" },
  HARD: { label: "Hard", variant: "danger" },
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const d = MAP[difficulty];
  return <Badge variant={d.variant}>{d.label}</Badge>;
}
