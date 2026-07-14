"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { InputMode } from "@/lib/tracks";
import type { Review } from "@/services/ai/schemas";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { CodeEditor } from "./code-editor";
import { ReviewPanel } from "./review-panel";

const LANGUAGES = [
  { id: "python", label: "Python" },
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
  { id: "go", label: "Go" },
];

interface AnswerPanelProps {
  slug: string;
  inputMode: InputMode;
  inputLabel: string;
  ctaLabel: string;
  canSubmit: boolean;
  aiConfigured: boolean;
}

export function AnswerPanel({
  slug,
  inputMode,
  inputLabel,
  ctaLabel,
  canSubmit,
  aiConfigured,
}: AnswerPanelProps) {
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("python");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState<Review | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setReview(null);
    try {
      const res = await fetch(`/api/problems/${slug}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          language: inputMode === "code" ? language : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setReview(data.review as Review);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const disabled =
    loading || content.trim().length === 0 || !canSubmit || !aiConfigured;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{inputLabel}</label>
        {inputMode === "code" && (
          <Select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            aria-label="Language"
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </Select>
        )}
      </div>

      {inputMode === "code" ? (
        <CodeEditor value={content} onChange={setContent} language={language} />
      ) : (
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your answer here…"
          className="min-h-[280px]"
        />
      )}

      {!canSubmit && (
        <p className="text-sm text-muted-foreground">
          Sign in to get AI feedback and track your progress.
        </p>
      )}
      {canSubmit && !aiConfigured && (
        <p className="text-sm text-warning">
          AI review isn&apos;t configured on this deployment (missing Azure
          OpenAI settings).
        </p>
      )}

      <Button onClick={handleSubmit} disabled={disabled}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Reviewing…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            {ctaLabel}
          </>
        )}
      </Button>

      {error && (
        <div className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-3 rounded-lg border border-border p-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      {review && !loading && (
        <div className="rounded-lg border border-border p-4">
          <ReviewPanel review={review} />
        </div>
      )}
    </div>
  );
}
