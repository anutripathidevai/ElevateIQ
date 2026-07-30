"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/components/practice/markdown";
import { cn } from "@/lib/utils";
import { getPersona } from "../personas";
import { nextPersona } from "../utils";
import { finishInterviewAction } from "../actions";
import type { PanelTurn } from "../types";

export function PanelChat({
  id,
  initialTranscript,
  aiEnabled,
}: {
  id: string;
  initialTranscript: PanelTurn[];
  aiEnabled: boolean;
}) {
  const router = useRouter();
  const [turns, setTurns] = useState<PanelTurn[]>(initialTranscript);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns]);

  const currentPersona = getPersona(nextPersona(turns));

  async function send() {
    const text = input.trim();
    if (!text || streaming || finishing) return;

    const withCandidate: PanelTurn[] = [
      ...turns,
      { speaker: "candidate", content: text },
    ];
    const answeringPersona = nextPersona(withCandidate);

    setInput("");
    setError(null);
    setTurns([
      ...withCandidate,
      { speaker: answeringPersona, content: "" },
    ]);
    setStreaming(true);

    try {
      const res = await fetch(`/api/panel/${id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        replaceLast(err.error ?? "Something went wrong. Please try again.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        replaceLast(acc);
      }
    } catch {
      replaceLast("Network error. Please try again.");
    } finally {
      setStreaming(false);
    }
  }

  function replaceLast(content: string) {
    setTurns((prev) => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      copy[copy.length - 1] = { speaker: last.speaker, content };
      return copy;
    });
  }

  async function finish() {
    if (streaming || finishing) return;
    setFinishing(true);
    setError(null);
    const res = await finishInterviewAction(id);
    if (res.ok) {
      router.refresh();
      return;
    }
    setFinishing(false);
    setError(res.error ?? "Could not score the interview.");
  }

  const answeredCount = turns.filter((t) => t.speaker === "candidate").length;

  return (
    <div className="flex h-[calc(100vh-13rem)] flex-col rounded-lg border border-border">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <p className="text-sm text-muted-foreground">
          <span aria-hidden>{currentPersona.glyph}</span>{" "}
          <span className="font-medium text-foreground">
            {currentPersona.name}
          </span>{" "}
          · {currentPersona.title} is asking
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={finish}
          disabled={finishing || streaming || answeredCount === 0}
        >
          {finishing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {finishing ? "Scoring…" : "Finish & score"}
        </Button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {turns.map((turn, i) => {
          const isCandidate = turn.speaker === "candidate";
          const persona =
            turn.speaker === "candidate" ? null : getPersona(turn.speaker);
          return (
            <div
              key={i}
              className={cn(
                "flex",
                isCandidate ? "justify-end" : "justify-start",
              )}
            >
              <div className="max-w-[85%]">
                {persona && (
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    <span aria-hidden>{persona.glyph}</span> {persona.name} ·{" "}
                    {persona.title}
                  </p>
                )}
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm",
                    isCandidate
                      ? "whitespace-pre-wrap bg-primary text-primary-foreground"
                      : "bg-muted",
                  )}
                >
                  {isCandidate ? (
                    turn.content || <span className="opacity-60">…</span>
                  ) : turn.content ? (
                    <Markdown className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      {turn.content}
                    </Markdown>
                  ) : (
                    <span className="opacity-60">…</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {error && (
        <p role="alert" className="px-4 pb-1 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Type your answer… (Enter to send, Shift+Enter for newline)"
            className="min-h-[52px] resize-none"
            disabled={finishing}
          />
          <Button
            onClick={send}
            disabled={streaming || finishing || input.trim().length === 0}
            size="icon"
            className="h-auto"
            aria-label="Send answer"
          >
            {streaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        {!aiEnabled && (
          <p className="mt-2 text-xs text-muted-foreground">
            Demo mode: interviewers ask from a fixed question bank.
          </p>
        )}
      </div>
    </div>
  );
}
