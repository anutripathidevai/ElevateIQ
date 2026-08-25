"use client";

import { useState } from "react";
import { Brain, Loader2, MessageCircle, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { LabDemoProps } from "../components/demo-types";
import { ClientTrace, estimateTokens, liveTrace, sleep } from "./_shared/lab-engine";
import { DemoColumns, DemoError, EmptyHint, OutputPanel, RangeControl, SimNotice } from "./_shared/demo-kit";

type Turn = { role: "user" | "assistant"; text: string };

const PRESETS = ["My name is Sam", "I work at Contoso", "What's my name?"];

function cleanFact(value: string): string {
  return value.split(/\s+(?:and|but|because)\s+/i)[0].replace(/\s+/g, " ").trim().replace(/[.!?,;:]+$/, "");
}

function extractFacts(message: string): string[] {
  const rules: { label: string; re: RegExp }[] = [
    { label: "Name", re: /\bmy name is\s+([^.!?,;]+)/i },
    { label: "Works at", re: /\bi work at\s+([^.!?,;]+)/i },
    { label: "Works at", re: /\bi['’]?m at\s+([^.!?,;]+)/i },
    { label: "Prefers", re: /\bi\s+(?:prefer|like)\s+([^.!?,;]+)/i },
    { label: "Role", re: /\bi['’]?m an?\s+([^.!?,;]+)/i },
  ];
  return rules.flatMap(({ label, re }) => {
    const value = cleanFact(message.match(re)?.[1] ?? "");
    return value ? [`${label}: ${value}`] : [];
  });
}

function mergeFacts(current: string[], next: string[]): string[] {
  const seen = new Set<string>();
  return [...current, ...next].filter((fact) => {
    const key = fact.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function factValue(facts: string[], label: string): string | null {
  const prefix = `${label}:`;
  return [...facts].reverse().find((fact) => fact.startsWith(prefix))?.slice(prefix.length).trim() ?? null;
}

function summarizeOlder(turns: Turn[], windowSize: number): string | null {
  if (turns.length <= windowSize) return null;
  const mentions = turns.slice(0, -windowSize).filter((turn) => turn.role === "user").map((turn) => turn.text.replace(/\s+/g, " ").trim()).filter(Boolean).slice(-4);
  return mentions.length ? `Earlier the user mentioned: ${mentions.join("; ")}.` : `Earlier the assistant responded ${turns.length - windowSize} time(s).`;
}

function assembleContext(summary: string | null, recent: Turn[], facts: string[]): string[] {
  return [
    ...(summary ? [`Summary: ${summary}`] : []),
    ...recent.map((turn) => `${turn.role === "user" ? "User" : "Assistant"}: ${turn.text}`),
    `Long-term memory:\n${facts.length ? facts.map((fact) => `- ${fact}`).join("\n") : "- (none yet)"}`,
  ];
}

function replyFor(message: string, facts: string[], newFacts: string[], windowSize: number): string {
  const lower = message.toLowerCase();
  const name = factValue(facts, "Name");
  const work = factValue(facts, "Works at");
  const role = factValue(facts, "Role");
  const prefs = facts.filter((fact) => fact.startsWith("Prefers:")).map((fact) => fact.slice("Prefers:".length).trim());
  if (/what(?:'s| is) my name|who am i/.test(lower)) return name ? `You told me your name is ${name}. I recalled that from long-term memory, not just the recent window.` : "I do not have your name in long-term memory yet.";
  if (/where do i work|what company|work at/.test(lower) && lower.includes("?")) return work ? `You work at ${work}, based on the saved long-term fact.` : "I do not have a workplace saved yet.";
  if (/what do i prefer|what do i like|preference/.test(lower)) return prefs.length ? `I have these preferences saved: ${prefs.join(", ")}.` : "I do not have any preferences saved yet.";
  if (/what(?:'s| is) my role|what do i do/.test(lower)) return role ? `I have your role saved as ${role}.` : "I do not have your role saved yet.";
  if (newFacts.length > 0) return `Got it — I stored ${newFacts.join("; ")}. Future replies can recall it even after the ${windowSize}-turn short-term window moves on.`;
  return `I will answer using the last ${windowSize} turns plus ${facts.length} saved long-term fact${facts.length === 1 ? "" : "s"}.`;
}

export function AiMemory({ onTrace }: LabDemoProps) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [windowSize, setWindowSize] = useState(4);
  const [longTermFacts, setLongTermFacts] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [context, setContext] = useState<string[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function clearAll() {
    setTurns([]); setLongTermFacts([]); setMessage(""); setContext([]); setSummary(null); setError(null); onTrace(null);
  }

  async function send(raw = message) {
    const text = raw.trim();
    if (running) return;
    if (!text) { setError("Type a message before sending."); onTrace(null); return; }
    setRunning(true); setError(null); onTrace(null);
    const trace = new ClientTrace();
    try {
      const appended: Turn[] = [...turns, { role: "user", text }];
      setTurns(appended);
      trace.step("Append turn", `${appended.length} total turn(s)`); onTrace(liveTrace(trace));
      await sleep(140);

      const found = extractFacts(text);
      const facts = mergeFacts(longTermFacts, found);
      setLongTermFacts(facts);
      trace.step("Extract long-term facts", found.length ? found.join("; ") : "No durable fact found"); onTrace(liveTrace(trace));
      await sleep(160);

      const nextSummary = summarizeOlder(appended, windowSize);
      setSummary(nextSummary);
      trace.step("Trim / summarize window", nextSummary ? `Kept ${Math.min(windowSize, appended.length)} recent turn(s)` : "Nothing to summarize yet"); onTrace(liveTrace(trace));
      await sleep(140);

      const assembled = assembleContext(nextSummary, appended.slice(-windowSize), facts);
      setContext(assembled);
      trace.step("Assemble context", `${estimateTokens(assembled.join("\n\n"))} estimated input token(s)`); onTrace(liveTrace(trace));
      await sleep(160);

      const reply = replyFor(text, facts, found, windowSize);
      setTurns([...appended, { role: "assistant", text: reply }]); setMessage(""); setRunning(false);
      trace.step("Reply", "Local deterministic recall response");
      onTrace(liveTrace(trace, { inputTokens: estimateTokens(assembled.join("\n\n")), outputTokens: estimateTokens(reply) }));
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg); setRunning(false); trace.step("Reply", msg, "error");
      onTrace(liveTrace(trace, { inputTokens: 0, outputTokens: 0 }));
    }
  }

  return (
    <div className="space-y-4">
      <SimNotice>Memory extraction, summarization, and recall are deterministic local logic. The assistant text is a stand-in for a model so you can inspect exactly what caused each reply.</SimNotice>
      <DemoColumns>
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <Label htmlFor="memory-message">Message</Label>
            <div className="mt-1.5 flex gap-2">
              <Input id="memory-message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell the assistant something to remember…" onKeyDown={(e) => { if (e.key === "Enter") void send(); }} />
              <Button onClick={() => void send()} disabled={running || !message.trim()}>{running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Send</Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {PRESETS.map((preset) => <Button key={preset} type="button" variant="outline" size="sm" onClick={() => void send(preset)} disabled={running}>{preset}</Button>)}
              <Button type="button" variant="ghost" size="sm" onClick={clearAll} disabled={running}><Trash2 className="h-4 w-4" /> Clear</Button>
            </div>
            <div className="mt-4"><RangeControl id="memory-window" label="Short-term window" value={windowSize} min={2} max={8} step={1} onChange={setWindowSize} hint="Most-recent turns kept verbatim before older turns are summarized." format={(value) => `${value} turns`} /></div>
            {error ? <div className="mt-3"><DemoError>{error}</DemoError></div> : null}
          </div>

          <OutputPanel title="Long-term memory" chip={`${longTermFacts.length} fact(s)`}>
            {longTermFacts.length ? (
              <ul className="space-y-2 text-sm">{longTermFacts.map((fact) => <li key={fact} className="rounded-lg border border-violet-500/30 bg-violet-500/5 px-3 py-2"><Brain className="mr-2 inline h-4 w-4 text-violet-500" />{fact}</li>)}</ul>
            ) : <EmptyHint>No durable facts yet. Try "My name is Sam" or "I work at Contoso".</EmptyHint>}
          </OutputPanel>
        </div>

        <OutputPanel title="Conversation" chip={<MessageCircle className="h-3.5 w-3.5" />}>
          {turns.length ? (
            <div className="space-y-3">{turns.map((turn, index) => (
              <div key={index} className={cn("rounded-lg border p-3 text-sm", turn.role === "assistant" ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-muted/30")}>
                <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{turn.role}</div><p className="whitespace-pre-wrap">{turn.text}</p>
              </div>
            ))}</div>
          ) : <EmptyHint running={running}>{running ? "Appending the first turn…" : "Send a message to start the memory chat."}</EmptyHint>}
        </OutputPanel>
      </DemoColumns>

      <OutputPanel title="Context window" chip={`${estimateTokens(context.join("\n\n"))} est. tokens`}>
        {context.length ? (
          <div className="space-y-3">{summary && <p className="text-xs text-muted-foreground">Older turns were condensed before the reply.</p>}{context.map((part, index) => <pre key={index} className="whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed">{part}</pre>)}</div>
        ) : <EmptyHint running={running}>{running ? "Assembling the prompt context…" : "After you send, this panel shows the exact context the model would see."}</EmptyHint>}
      </OutputPanel>
    </div>
  );
}
