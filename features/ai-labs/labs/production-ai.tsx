"use client";

import { useState } from "react";
import { Database, Loader2, Play, ServerCrash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { LabDemoProps } from "../components/demo-types";
import { ClientTrace, estimateTokens, liveTrace, sleep } from "./_shared/lab-engine";
import { DemoError, EmptyHint, OutputPanel, RangeControl, SimNotice } from "./_shared/demo-kit";

type ResultKind = "HIT" | "PRIMARY" | "FALLBACK" | "RATE-LIMITED";
interface CacheEntry { answer: string }
interface LogEntry {
  id: number;
  prompt: string;
  result: ResultKind;
  latencyMs: number;
  costUsd: number;
  provider: string;
}

const WINDOW_MS = 30_000;
const PROMPTS = [
  "Summarize the refund policy for a delayed enterprise renewal.",
  "Draft a concise onboarding checklist for a new workspace admin.",
  "Explain why vector search improves a support knowledge base.",
  "Write a safe response when a user asks for account recovery help.",
];

function makeAnswer(prompt: string, provider: "primary" | "fallback") {
  const prefix = provider === "primary" ? "Primary" : "Fallback";
  if (/refund|renewal/i.test(prompt)) return `${prefix} answer: Confirm the renewal date, quote the refund window, and offer escalation for contract exceptions.`;
  if (/onboarding|admin/i.test(prompt)) return `${prefix} answer: Invite users, configure roles, connect data sources, test SSO, and review audit settings.`;
  if (/vector|knowledge/i.test(prompt)) return `${prefix} answer: Vector search ranks semantically related articles, so users find answers even when wording differs.`;
  return `${prefix} answer: Verify identity through approved channels, avoid secrets in chat, and route high-risk recovery to support.`;
}

function resultVariant(kind: ResultKind): "danger" | "success" | "warning" | "outline" {
  return kind === "RATE-LIMITED" ? "danger" : kind === "HIT" ? "success" : kind === "FALLBACK" ? "warning" : "outline";
}

export function ProductionAi({ onTrace }: LabDemoProps) {
  const [prompt, setPrompt] = useState(PROMPTS[0]);
  const [limit, setLimit] = useState(5);
  const [outage, setOutage] = useState(false);
  const [cache, setCache] = useState<Record<string, CacheEntry>>({});
  const [recentSends, setRecentSends] = useState<number[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [cumulativeCost, setCumulativeCost] = useState(0);
  const [lastAnswer, setLastAnswer] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = log.length;
  const hits = log.filter((entry) => entry.result === "HIT").length;
  const limited = log.filter((entry) => entry.result === "RATE-LIMITED").length;
  const hitRate = total ? Math.round((hits / total) * 100) : 0;
  const lastProvider = log[0]?.provider ?? "none";

  function appendLog(entry: Omit<LogEntry, "id">) {
    setLog((current) => [{ ...entry, id: Date.now() }, ...current].slice(0, 8));
  }

  function clear() {
    setCache({});
    setRecentSends([]);
    setLog([]);
    setCumulativeCost(0);
    setLastAnswer(null);
    setError(null);
    onTrace(null);
  }

  async function sendRequest() {
    if (running) return;
    if (!prompt) {
      setError("Choose a prompt before sending a request.");
      onTrace(null);
      return;
    }

    setRunning(true);
    setError(null);
    onTrace(null);

    const trace = new ClientTrace();
    const selected = prompt;
    const cached = cache[selected];
    trace.step("Check cache", cached ? "Cache HIT: return without provider cost" : "Cache miss");
    onTrace(liveTrace(trace));
    await sleep(120);

    if (cached) {
      const used = recentSends.filter((t) => Date.now() - t < WINDOW_MS).length;
      appendLog({ prompt: selected, result: "HIT", latencyMs: 9, costUsd: 0, provider: "cache" });
      setLastAnswer(cached.answer);
      setRunning(false);
      onTrace(liveTrace(trace, { inputTokens: estimateTokens(selected), outputTokens: estimateTokens(cached.answer), latencyMs: 9, costUsd: 0, used, limit, remaining: Math.max(0, limit - used) }));
      return;
    }

    const now = Date.now();
    const recent = recentSends.filter((t) => now - t < WINDOW_MS);
    const overLimit = recent.length >= limit;
    trace.step("Rate-limit check", overLimit ? `${recent.length}/${limit} sends in the rolling window` : `${recent.length + 1}/${limit} allowed`, overLimit ? "error" : "ok");
    onTrace(liveTrace(trace));
    await sleep(140);

    if (overLimit) {
      const answer = "RATE-LIMITED: 429 simulated. Wait for the rolling window to clear.";
      appendLog({ prompt: selected, result: "RATE-LIMITED", latencyMs: 4, costUsd: 0, provider: "none" });
      setLastAnswer(answer);
      setRunning(false);
      onTrace(liveTrace(trace, { inputTokens: estimateTokens(selected), outputTokens: 0, latencyMs: 4, costUsd: 0, used: recent.length, limit, remaining: 0 }));
      return;
    }

    setRecentSends([...recent, now]);
    trace.step("Call primary provider", outage ? "Primary outage forced" : "Primary served the request", outage ? "error" : "ok");
    onTrace(liveTrace(trace));
    await sleep(160);

    let result: ResultKind = "PRIMARY";
    let provider = "primary";
    let answer = makeAnswer(selected, "primary");
    let latencyMs = 230 + selected.length * 2;
    let costUsd = 0.01;
    if (outage) {
      trace.step("Fallback to secondary", "Secondary provider served a cheaper response");
      onTrace(liveTrace(trace));
      await sleep(150);
      result = "FALLBACK";
      provider = "secondary";
      answer = makeAnswer(selected, "fallback");
      latencyMs = 360 + selected.length * 2;
      costUsd = 0.004;
    }

    trace.step("Store in cache", `Cached ${provider} answer for this prompt`);
    onTrace(liveTrace(trace));
    await sleep(120);

    setCache((current) => ({ ...current, [selected]: { answer } }));
    setCumulativeCost((current) => Number((current + costUsd).toFixed(3)));
    appendLog({ prompt: selected, result, latencyMs, costUsd, provider });
    setLastAnswer(answer);
    setRunning(false);
    onTrace(liveTrace(trace, { inputTokens: estimateTokens(selected), outputTokens: estimateTokens(answer), latencyMs, costUsd, used: recent.length + 1, limit, remaining: Math.max(0, limit - recent.length - 1) }));
  }

  const stats = [
    ["Total requests", total.toString()],
    ["Cache-hit rate", `${hitRate}%`],
    ["Rate-limited", limited.toString()],
    ["Cumulative cost", `$${cumulativeCost.toFixed(3)}`],
    ["Last provider", lastProvider],
  ];

  return (
    <div className="space-y-4">
      <SimNotice>
        This simulator uses real client-side cache, rate-limit, fallback, cost, and log state. Provider answers are deterministic local stand-ins.
      </SimNotice>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div>
            <Label htmlFor="prod-prompt">Prompt</Label>
            <Select id="prod-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="mt-1.5 w-full">
              {PROMPTS.map((sample) => <option key={sample} value={sample}>{sample}</option>)}
            </Select>
          </div>
          <RangeControl id="prod-limit" label="Max requests / 30s window" value={limit} min={1} max={10} step={1} onChange={setLimit} hint="Cache misses count against this rolling limit; cache hits return before the limiter." />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={outage} onChange={(e) => setOutage(e.target.checked)} className="h-4 w-4 accent-violet-500" />
            Force primary outage
          </label>
          {error && <DemoError>{error}</DemoError>}
          <div className="flex flex-wrap gap-2">
            <Button onClick={sendRequest} disabled={running}>
              {running ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <><Play className="h-4 w-4" /> Send request</>}
            </Button>
            <Button variant="outline" onClick={clear} disabled={running}>Clear</Button>
          </div>
          <OutputPanel title="Latest answer" chip={<ServerCrash className="h-3.5 w-3.5" />} className="min-h-0">
            {lastAnswer ? <p className="rounded-lg border border-border bg-muted/40 p-3 text-sm">{lastAnswer}</p> : <EmptyHint running={running}>{running ? "Routing the request…" : "Send a request to see cache, limit, primary, or fallback behavior."}</EmptyHint>}
          </OutputPanel>
        </div>

        <OutputPanel title="Production dashboard" chip={<Database className="h-3.5 w-3.5" />}>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
            {stats.map(([label, value]) => (
              <div key={label} className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="mt-1 text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr><th className="px-3 py-2 font-medium">Prompt</th><th className="px-3 py-2 font-medium">Result</th><th className="px-3 py-2 font-medium">Latency</th><th className="px-3 py-2 font-medium">Cost</th></tr>
              </thead>
              <tbody>
                {log.length === 0 ? (
                  <tr><td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">No requests yet.</td></tr>
                ) : (
                  log.map((entry) => (
                    <tr key={entry.id} className="border-t border-border">
                      <td className="px-3 py-2">{entry.prompt.length > 52 ? `${entry.prompt.slice(0, 49)}…` : entry.prompt}</td>
                      <td className="px-3 py-2"><Badge variant={resultVariant(entry.result)}>{entry.result}</Badge></td>
                      <td className="px-3 py-2 font-mono">{entry.latencyMs}ms</td>
                      <td className="px-3 py-2 font-mono">${entry.costUsd.toFixed(3)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {recentSends.length > 0 && <p className="mt-3 text-[11px] text-muted-foreground">Rolling limiter tracks {recentSends.length} cache-miss send(s) in memory.</p>}
        </OutputPanel>
      </div>
    </div>
  );
}
