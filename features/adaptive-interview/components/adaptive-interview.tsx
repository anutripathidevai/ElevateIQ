"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Send,
  ClipboardCheck,
  Gauge,
  Sparkles,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/components/practice/markdown";
import { cn } from "@/lib/utils";
import {
  finalizeAdaptiveAction,
  submitAdaptiveAnswerAction,
} from "@/app/actions/adaptive-mock";

interface Message {
  role: "user" | "assistant";
  content: string;
}

/** Phases of the async turn, used to show meaningful, staged loading copy. */
type Phase = "idle" | "evaluating" | "selecting" | "finalizing";

export interface AdaptiveInterviewProps {
  id: string;
  trackTitle: string;
  seniorityLabel: string;
  answerHint: string;
  planned: number;
  initialMessages: Message[];
  initialAnswered: number;
  initialDone: boolean;
}

/** Small segmented progress bar: one segment per planned question. */
function ProgressSegments({
  answered,
  current,
  planned,
}: {
  answered: number;
  current: number;
  planned: number;
}) {
  return (
    <div className="flex items-center gap-1" aria-hidden>
      {Array.from({ length: planned }).map((_, i) => {
        const state =
          i < answered ? "done" : i + 1 === current ? "active" : "todo";
        return (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              state === "done" && "bg-primary",
              state === "active" && "bg-primary/50",
              state === "todo" && "bg-muted",
            )}
          />
        );
      })}
    </div>
  );
}

export function AdaptiveInterview({
  id,
  trackTitle,
  seniorityLabel,
  answerHint,
  planned,
  initialMessages,
  initialAnswered,
  initialDone,
}: AdaptiveInterviewProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [answered, setAnswered] = useState(initialAnswered);
  const [done, setDone] = useState(initialDone);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const pending = phase === "evaluating" || phase === "selecting";
  const finalizing = phase === "finalizing";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || pending || done || finalizing) return;

    setError(null);
    setInput("");
    setMessages((m) => [
      ...m,
      { role: "user", content: text },
      { role: "assistant", content: "" },
    ]);
    setPhase("evaluating");
    // Perceived progression: after a beat, move from "evaluating" to "selecting"
    // if the request is still in flight (instant for the heuristic path).
    const toSelecting = setTimeout(() => {
      setPhase((p) => (p === "evaluating" ? "selecting" : p));
    }, 850);

    try {
      const result = await submitAdaptiveAnswerAction(id, text);
      setAnswered(result.answered);
      setDone(result.done);
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: "assistant",
          content:
            result.assistantMessage ||
            (result.done
              ? "That's the end of the questions. Click **Finish & view scorecard** for your detailed evaluation."
              : (result.question ?? "")),
        };
        return copy;
      });
    } catch {
      setMessages((m) => m.slice(0, -1));
      setError("Something went wrong evaluating your answer. Please try again.");
      setInput(text);
    } finally {
      clearTimeout(toSelecting);
      setPhase("idle");
    }
  }

  async function finish() {
    if (finalizing || pending) return;
    setPhase("finalizing");
    setError(null);
    try {
      await finalizeAdaptiveAction(id);
      // The server page re-renders into the completed branch (scorecard + trend).
      router.refresh();
    } catch {
      setError("Could not generate the scorecard. Please try again.");
      setPhase("idle");
    }
  }

  const current = Math.min(answered + 1, planned);

  return (
    <div className="space-y-4">
      {/* Context header: role · level · mode + progress. Fills dead space with
          information the candidate actually wants mid-interview. */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Adaptive
          </span>
          <span className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {trackTitle}
          </span>
          <span className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {seniorityLabel}
          </span>
          <span className="ml-auto text-xs font-medium text-muted-foreground">
            {done ? (
              <>All questions answered</>
            ) : (
              <>
                Question{" "}
                <span className="tabular-nums text-foreground">{current}</span>{" "}
                of {planned}
              </>
            )}
          </span>
        </div>
        <div className="mt-3">
          <ProgressSegments
            answered={answered}
            current={current}
            planned={planned}
          />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> {answerHint}
          </span>
          <Button
            variant={done ? "default" : "outline"}
            size="sm"
            onClick={finish}
            disabled={finalizing || pending || answered === 0}
          >
            {finalizing ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <ClipboardCheck className="mr-1.5 h-4 w-4" />
            )}
            Finish &amp; view scorecard
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-20rem)] min-h-[24rem] flex-col rounded-xl border border-border">
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "flex",
                m.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-4 py-2.5 text-sm",
                  m.role === "user"
                    ? "whitespace-pre-wrap bg-primary text-primary-foreground"
                    : "bg-muted",
                )}
              >
                {m.role === "assistant" ? (
                  m.content ? (
                    <Markdown className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      {m.content}
                    </Markdown>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      {phase === "selecting" ? (
                        <>
                          <Gauge className="h-3.5 w-3.5 animate-pulse" />
                          Selecting your next question…
                        </>
                      ) : (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Evaluating your answer…
                        </>
                      )}
                    </span>
                  )
                ) : (
                  m.content || <span className="opacity-60">…</span>
                )}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="border-t border-border p-3">
          {error && (
            <p className="mb-2 text-sm text-danger" role="alert">
              {error}
            </p>
          )}
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
              placeholder={
                done
                  ? "Interview complete — view your scorecard."
                  : "Type your answer… (Enter to send, Shift+Enter for newline)"
              }
              className="min-h-[52px] resize-none"
              disabled={pending || done || finalizing}
            />
            <Button
              onClick={send}
              disabled={
                pending || done || finalizing || input.trim().length === 0
              }
              size="icon"
              className="h-auto"
              aria-label="Send"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
