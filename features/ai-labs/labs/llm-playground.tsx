"use client";

import { useRef, useState } from "react";
import { Eraser, Loader2, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { LabDemoProps, LiveTrace, TraceStepView } from "../components/demo-types";

/**
 * Lab 1 interactive demo — a real LLM prompt console.
 *
 * Sends the system/user prompt + sampling params to /api/ai-labs/llm and renders
 * the streamed NDJSON events: tokens appended live, and an execution trace +
 * final metrics reported up to the lab shell via `onTrace`. Works with a real
 * Azure model or the labelled demo provider.
 */
export function LlmPlayground({ defaultModel, onTrace }: LabDemoProps) {
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful, concise senior software engineer. Answer clearly and avoid filler.",
  );
  const [userPrompt, setUserPrompt] = useState(
    "Explain the CAP theorem to a mid-level engineer in 3 sentences.",
  );
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(512);

  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function run() {
    if (running) return;
    setRunning(true);
    setOutput("");
    setError(null);
    setDemoMode(false);
    onTrace(null);

    const steps: TraceStepView[] = [];
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai-labs/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt, userPrompt, temperature, maxTokens }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `Request failed (${res.status}).`);
        setRunning(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";

      const flush = (metrics?: LiveTrace["metrics"]) =>
        onTrace({ steps: [...steps], totalMs: metrics?.latencyMs ?? 0, metrics });

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const evt = JSON.parse(line) as StreamEvent;
          if (evt.type === "trace") {
            steps.push(evt.step);
            flush();
          } else if (evt.type === "token") {
            acc += evt.text;
            setOutput(acc);
          } else if (evt.type === "done") {
            setDemoMode(evt.demo);
            flush({
              model: evt.model,
              demo: evt.demo,
              inputTokens: evt.inputTokens,
              outputTokens: evt.outputTokens,
              latencyMs: evt.latencyMs,
              costUsd: evt.costUsd,
              used: evt.usage.used,
              limit: evt.usage.limit,
              remaining: evt.usage.remaining,
            });
          } else if (evt.type === "error") {
            setError(evt.message);
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError("Something went wrong while streaming the response.");
      }
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  }

  function clear() {
    abortRef.current?.abort();
    setOutput("");
    setError(null);
    setDemoMode(false);
    onTrace(null);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Controls */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="ail-system">System prompt</Label>
          <Textarea
            id="ail-system"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="mt-1.5 min-h-[90px]"
            placeholder="Set the model's role, tone, and rules…"
          />
        </div>

        <div>
          <Label htmlFor="ail-user">User prompt</Label>
          <Textarea
            id="ail-user"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            className="mt-1.5 min-h-[120px]"
            placeholder="Ask the model something…"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ail-temp">Temperature</Label>
              <span className="font-mono text-xs text-muted-foreground">
                {temperature.toFixed(1)}
              </span>
            </div>
            <input
              id="ail-temp"
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="mt-3 w-full accent-violet-500"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              0 = deterministic · 2 = very random
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ail-max">Max tokens</Label>
              <span className="font-mono text-xs text-muted-foreground">{maxTokens}</span>
            </div>
            <input
              id="ail-max"
              type="range"
              min={64}
              max={2048}
              step={64}
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
              className="mt-3 w-full accent-violet-500"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">Caps answer length</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={run} disabled={running || !userPrompt.trim()}>
            {running ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Running…
              </>
            ) : (
              <>
                <Play className="h-4 w-4" /> Run prompt
              </>
            )}
          </Button>
          <Button variant="outline" onClick={clear} disabled={running && !output}>
            <Eraser className="h-4 w-4" /> Clear
          </Button>
        </div>
      </div>

      {/* Output */}
      <div className="flex flex-col rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <span className="inline-flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-violet-500" /> Model output
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            {demoMode ? "demo provider" : defaultModel}
          </span>
        </div>

        <div className="min-h-[280px] flex-1 p-4">
          {demoMode && (
            <p className="mb-3 rounded-md border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-xs text-orange-500">
              Demo mode — Azure OpenAI is not configured, so this response is generated
              locally, not by a real model.
            </p>
          )}
          {error ? (
            <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : output ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {output}
              {running && <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-violet-500 align-middle" />}
            </p>
          ) : (
            <p className={cn("text-sm text-muted-foreground", running && "animate-pulse")}>
              {running ? "Waiting for the first token…" : "Run a prompt to see the streamed response here."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Stream event protocol (mirrors app/api/ai-labs/llm/route.ts) ----

type StreamEvent =
  | { type: "trace"; step: TraceStepView }
  | { type: "token"; text: string }
  | {
      type: "done";
      model: string;
      demo: boolean;
      inputTokens: number;
      outputTokens: number;
      latencyMs: number;
      costUsd: number;
      usage: { used: number; limit: number; remaining: number };
    }
  | { type: "error"; message: string };
