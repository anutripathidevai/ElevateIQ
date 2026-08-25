"use client";
import { useState } from "react";
import { Calculator, Loader2, Play, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { LabDemoProps } from "../components/demo-types";
import { ClientTrace, estimateTokens, liveTrace, sleep } from "./_shared/lab-engine";
import { DemoColumns, DemoError, EmptyHint, OutputPanel, SimNotice } from "./_shared/demo-kit";
type ToolName = "calculator" | "wordCount" | "unitConvert";
type ToolCall = { name: ToolName; arguments: Record<string, string | number> };
type TranscriptItem = { role: "user" | "tool_call" | "observation" | "assistant"; text: string; json?: ToolCall };
const TOOL_DEFS = [
  { name: "calculator", schema: "calculator({ expression: string })" },
  { name: "wordCount", schema: "wordCount({ text: string })" },
  { name: "unitConvert", schema: "unitConvert({ value: number, from: string, to: string })" },
];
function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}
function tokenizeExpression(src: string): string[] {
  const tokens: string[] = [];
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (/\s/.test(ch)) continue;
    if (/[0-9.]/.test(ch)) {
      let value = ch;
      while (i + 1 < src.length && /[0-9.]/.test(src[i + 1])) value += src[++i];
      if (!/^\d*\.?\d+$/.test(value)) throw new Error(`Invalid number "${value}".`);
      tokens.push(value);
      continue;
    }
    if ("+-*/()%".includes(ch)) tokens.push(ch);
    else throw new Error(`Unsupported character "${ch}" in expression.`);
  }
  return tokens;
}
function evaluateExpression(src: string): number {
  const tokens = tokenizeExpression(src);
  let i = 0;
  const peek = (n = 0) => tokens[i + n];
  const take = () => tokens[i++];
  const startsValue = (x?: string) => !!x && (x === "(" || x === "+" || x === "-" || /^\d/.test(x));
  function primary(): number {
    const token = take();
    if (!token) throw new Error("Unexpected end of expression.");
    if (token === "(") {
      const value = addSub();
      if (take() !== ")") throw new Error("Missing closing parenthesis.");
      return value;
    }
    const value = Number(token);
    if (!Number.isFinite(value)) throw new Error(`Expected a number, got "${token}".`);
    return value;
  }
  function unary(): number {
    if (peek() === "+") { take(); return unary(); }
    if (peek() === "-") { take(); return -unary(); }
    return primary();
  }
  function factor(): number {
    let value = unary();
    while (peek() === "%" && !startsValue(peek(1))) { take(); value /= 100; }
    return value;
  }
  function mulDiv(): number {
    let value = factor();
    while (peek() === "*" || peek() === "/" || peek() === "%") {
      const op = take();
      const right = factor();
      value = op === "*" ? value * right : op === "/" ? value / right : value % right;
    }
    return value;
  }
  function addSub(): number {
    let value = mulDiv();
    while (peek() === "+" || peek() === "-") {
      const op = take();
      const right = mulDiv();
      value = op === "+" ? value + right : value - right;
    }
    return value;
  }
  const value = addSub();
  if (i < tokens.length) throw new Error(`Unexpected token "${tokens[i]}".`);
  if (!Number.isFinite(value)) throw new Error("Expression did not produce a finite number.");
  return value;
}
function normalUnit(unit: string): string {
  const u = unit.toLowerCase();
  if (u.startsWith("km") || u.startsWith("kilometer")) return "km";
  if (u === "mi" || u.startsWith("mile")) return "mi";
  if (u.startsWith("kg") || u.startsWith("kilogram")) return "kg";
  if (u === "lb" || u === "lbs" || u.startsWith("pound")) return "lb";
  if (u === "°c" || u.startsWith("celsius")) return "celsius";
  if (u === "°f" || u.startsWith("fahrenheit")) return "fahrenheit";
  return u;
}
function execute(call: ToolCall): string {
  if (call.name === "calculator") {
    const expression = String(call.arguments.expression);
    return `${expression} = ${fmt(evaluateExpression(expression))}`;
  }
  if (call.name === "wordCount") {
    const text = String(call.arguments.text);
    const count = (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).length;
    return `"${text}" has ${count} word${count === 1 ? "" : "s"}`;
  }
  const value = Number(call.arguments.value);
  const from = normalUnit(String(call.arguments.from));
  const to = normalUnit(String(call.arguments.to));
  const converted = ({
    "km:mi": value * 0.621371,
    "mi:km": value / 0.621371,
    "kg:lb": value * 2.20462,
    "lb:kg": value / 2.20462,
    "celsius:fahrenheit": value * 9 / 5 + 32,
    "fahrenheit:celsius": (value - 32) * 5 / 9,
  } as Record<string, number>)[`${from}:${to}`];
  if (converted === undefined) throw new Error(`Unsupported conversion ${from} to ${to}.`);
  return `${fmt(value)} ${from} = ${fmt(converted)} ${to}`;
}
function route(request: string): ToolCall[] {
  const calls: ToolCall[] = [];
  const percent = request.match(/(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)(?:\s*(?:plus|\+)\s*(\d+(?:\.\d+)?))?/i);
  if (percent) calls.push({ name: "calculator", arguments: { expression: `${percent[1]}% * ${percent[2]}${percent[3] ? ` + ${percent[3]}` : ""}` } });
  const quoted = request.match(/(?:words?|word count)[^'"]*['"]([^'"]+)['"]/i) ?? request.match(/['"]([^'"]+)['"][^'"]*(?:words?|word count)/i);
  if (quoted) calls.push({ name: "wordCount", arguments: { text: quoted[1] } });
  const units = "(km|kilometers?|mi|miles?|kg|kilograms?|lb|lbs|pounds?|celsius|fahrenheit|°c|°f)";
  const conversion = request.match(new RegExp(`(-?\\d+(?:\\.\\d+)?)\\s*${units}\\s+(?:to|in)\\s*${units}`, "i"));
  if (conversion) calls.push({ name: "unitConvert", arguments: { value: Number(conversion[1]), from: conversion[2], to: conversion[3] } });
  const arithmetic = request.match(/(?:calculate|compute|what is)\s+([0-9+\-*\/%().\s]+)/i);
  if (!percent && arithmetic?.[1]?.match(/[+\-*\/%]/)) calls.push({ name: "calculator", arguments: { expression: arithmetic[1].trim() } });
  return calls;
}
export function ToolCalling({ onTrace }: LabDemoProps) {
  const [request, setRequest] = useState("What is 15% of 240 plus 30, and how many words are in 'the quick brown fox jumps'?");
  const [running, setRunning] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  function clearRun() {
    setTranscript([]);
    setError(null);
    onTrace(null);
  }
  async function run() {
    if (running) return;
    clearRun();
    const calls = route(request);
    if (calls.length === 0) return setError("No supported tool call was found. Try asking for math, a word count, or a unit conversion.");
    setRunning(true);
    const trace = new ClientTrace();
    const messages: TranscriptItem[] = [{ role: "user", text: request }];
    const observations: string[] = [];
    const push = (label: string, detail?: string, status: "ok" | "error" = "ok") => { trace.step(label, detail, status); onTrace(liveTrace(trace)); };
    setTranscript([...messages]);
    try {
      for (const call of calls) {
        messages.push({ role: "tool_call", text: call.name, json: call });
        setTranscript([...messages]);
        push("Model → tool_call", JSON.stringify(call));
        await sleep(150);
        const result = execute(call);
        observations.push(result);
        messages.push({ role: "observation", text: result });
        setTranscript([...messages]);
        push("Observation", result);
        await sleep(150);
      }
      const final = `Using the tool observations: ${observations.join("; ")}.`;
      messages.push({ role: "assistant", text: final });
      setTranscript([...messages]);
      push("Compose final answer", `${observations.length} observation(s) stitched together`);
      setRunning(false);
      onTrace(liveTrace(trace, { inputTokens: estimateTokens(request + JSON.stringify(calls)), outputTokens: estimateTokens(final + observations.join(" ")) }));
    } catch (e) {
      const message = (e as Error).message;
      setError(message); push("Observation", message, "error");
      setRunning(false);
      onTrace(liveTrace(trace, { inputTokens: estimateTokens(request), outputTokens: 0 }));
    }
  }
  return (
    <div className="space-y-4">
      <SimNotice>Tool execution is real client-side code. Tool selection and arguments are produced by a deterministic router standing in for a model's function-calling.</SimNotice>
      <DemoColumns>
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium"><Wrench className="h-4 w-4 text-violet-500" /> Tools</div>
            <div className="space-y-3">
              {TOOL_DEFS.map((tool) => <div key={tool.name} className="rounded-lg border border-border bg-muted/30 p-3">
                <span className="inline-flex rounded-full border border-border px-2.5 py-0.5 text-xs font-medium">{tool.name}</span>
                <pre className="mt-2 overflow-x-auto text-xs">{tool.schema}</pre>
              </div>)}
            </div>
          </div>
          <div>
            <Label htmlFor="tool-request">User request</Label>
            <Textarea id="tool-request" value={request} onChange={(e) => { setRequest(e.target.value); clearRun(); }} className="mt-1.5 min-h-[120px]" placeholder="Ask for math, word counts, or unit conversion…" />
          </div>
          <Button onClick={run} disabled={running || !request.trim()}>
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? "Running tool loop…" : "Run tool loop"}
          </Button>
        </div>
        <OutputPanel title="Tool transcript" chip={<Calculator className="h-3.5 w-3.5" />}>
          {error ? <DemoError>{error}</DemoError> : null}
          {transcript.length ? <div className="space-y-3">{transcript.map((item, index) => (
            <div key={index} className={`rounded-lg border p-3 text-sm ${item.role === "assistant" ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-muted/30"}`}>
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.role.replace("_", " ")}</div>
              {item.json ? <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-background p-2 text-xs">{JSON.stringify(item.json, null, 2)}</pre> : <p className="whitespace-pre-wrap">{item.text}</p>}
            </div>
          ))}</div> : (
            <EmptyHint running={running}>{running ? "Selecting tools and collecting observations…" : "Run the request to see tool calls, observations, and the final answer."}</EmptyHint>
          )}
        </OutputPanel>
      </DemoColumns>
    </div>
  );
}
