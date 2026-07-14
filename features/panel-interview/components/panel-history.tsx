"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/features/shared/components/states";
import {
  VERDICT_LABELS,
  type PanelInterviewSummary,
  type Verdict,
} from "../types";
import { deleteInterviewAction } from "../actions";

function verdictVariant(
  v: Verdict,
): "success" | "warning" | "danger" | "outline" {
  switch (v) {
    case "strong_hire":
    case "hire":
      return "success";
    case "lean_hire":
      return "warning";
    case "no_hire":
      return "danger";
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PanelHistory({
  interviews,
}: {
  interviews: PanelInterviewSummary[];
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function remove(id: string) {
    setDeletingId(id);
    const res = await deleteInterviewAction(id);
    if (res.ok) {
      router.refresh();
    }
    setDeletingId(null);
  }

  if (interviews.length === 0) {
    return (
      <EmptyState
        title="No interviews yet"
        description="Start a panel interview above — your sessions and scorecards will appear here."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {interviews.map((iv) => (
        <li
          key={iv.id}
          className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4"
        >
          <Link href={`/panel/${iv.id}`} className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-medium">{iv.role}</span>
              {iv.status === "completed" && iv.decision ? (
                <Badge variant={verdictVariant(iv.decision)}>
                  {VERDICT_LABELS[iv.decision]}
                </Badge>
              ) : (
                <Badge variant="outline">In progress</Badge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {iv.focus ? `${iv.focus} · ` : ""}
              {iv.turnCount} turns · {formatDate(iv.updatedAt)}
            </p>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete interview for ${iv.role}`}
            disabled={deletingId === iv.id}
            onClick={() => remove(iv.id)}
          >
            {deletingId === iv.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </li>
      ))}
    </ul>
  );
}
