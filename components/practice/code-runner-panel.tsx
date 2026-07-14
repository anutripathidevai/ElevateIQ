"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Play, RotateCcw, Sparkles } from "lucide-react";
import type { JudgeOutcome, JudgeSpec } from "@/lib/judge/types";
import type { Review } from "@/services/ai/schemas";
import { runJudge } from "@/lib/judge/client";
import { markSolved, useSolved } from "@/lib/progress-store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CodeEditor } from "./code-editor";
import { ReviewPanel } from "./review-panel";
import { TestResults } from "./test-results";

interface CodeRunnerPanelProps {
  slug: string;
  judge: JudgeSpec;
  canSubmit: boolean;
  aiConfigured: boolean;
}

export function CodeRunnerPanel({
  slug,
  judge,
  canSubmit,
  aiConfigured,
}: CodeRunnerPanelProps) {
  const [code, setCode] = useState(judge.starter);
  const [running, setRunning] = useState(false);
  const [outcome, setOutcome] = useState<JudgeOutcome | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [review, setReview] = useState<Review | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const solved = useSolved(slug);

  async function handleRun() {
    setRunning(true);
    setOutcome(null);
    try {
      const result = await runJudge(code, judge);
      setOutcome(result);
      if (result.allPassed) markSolved(slug);
    } catch {
      setOutcome({
        results: [],
        passedCount: 0,
        total: judge.tests.length,
        allPassed: false,
        compileError: "Failed to run your code. Please try again.",
      });
    } finally {
      setRunning(false);
    }
  }

  async function handleReview() {
    setReviewing(true);
    setReview(null);
    setReviewError(null);
    try {
      const res = await fetch(`/api/problems/${slug}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: code, language: "javascript" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setReview(data.review as Review);
    } catch {
      setReviewError("Network error. Please try again.");
    } finally {
      setReviewing(false);
    }
  }

  const emptyCode = code.trim().length === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Your solution (JavaScript)</label>
        {solved && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
            <CheckCircle2 className="h-4 w-4" /> Solved
          </span>
        )}
      </div>

      <CodeEditor value={code} onChange={setCode} language="javascript" />

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={handleRun} disabled={running || emptyCode}>
          {running ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running…
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Tests
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handleReview}
          disabled={reviewing || emptyCode || !canSubmit || !aiConfigured}
        >
          {reviewing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Reviewing…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Get AI Review
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCode(judge.starter)}
          title="Reset to starter code"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      {!canSubmit && (
        <p className="text-sm text-muted-foreground">
          Run Tests works without signing in. Sign in for AI review.
        </p>
      )}
      {canSubmit && !aiConfigured && (
        <p className="text-sm text-warning">
          AI review isn&apos;t configured on this deployment (missing Azure
          OpenAI settings).
        </p>
      )}

      {outcome?.allPassed && (
        <div className="flex items-center gap-2 rounded-md border border-success/40 bg-success/10 p-3 text-sm font-medium text-success">
          <CheckCircle2 className="h-4 w-4" />
          All tests passed — marked as solved!
        </div>
      )}

      {outcome && <TestResults outcome={outcome} />}

      {reviewError && (
        <div className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          {reviewError}
        </div>
      )}

      {reviewing && (
        <div className="space-y-3 rounded-lg border border-border p-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      {review && !reviewing && (
        <div className="rounded-lg border border-border p-4">
          <ReviewPanel review={review} />
        </div>
      )}
    </div>
  );
}
