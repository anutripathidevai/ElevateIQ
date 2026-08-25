"use client";

import { useState } from "react";
import { Bot, Calculator, Loader2, Play, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LabDemoProps } from "../components/demo-types";
import { ClientTrace, estimateTokens, liveTrace, sleep, tokenize } from "./_shared/lab-engine";
import { DemoColumns, DemoError, EmptyHint, OutputPanel, RangeControl, SimNotice } from "./_shared/demo-kit";

type BlockKind = "thought" | "action" | "observation" | "final" | "stop";
type City = { name: string; population: number };
type ToolResult = { ok: boolean; output: string; value?: number };
type TranscriptBlock = { id: string; kind: BlockKind; title: string; body: string };

const DEFAULT_GOAL = "What is the combined population of the three demo cities, in millions?";
const CITIES: City[] = [
  { name: "Aurora Falls", population: 1.2 },
  { name: "Bayhaven", population: 2.4 },
  { name: "Cedar Ridge", population: 0.9 },
];
const FACTS: Record<string, string> = {
  "aurora falls": "Aurora Falls is a fictional demo city with population 1.2 million and a river observatory.",
  bayhaven: "Bayhaven is a fictional demo city with population 2.4 million and a coastal robotics port.",
  "cedar ridge": "Cedar Ridge is a fictional demo city with population 0.9 million and a forest AI campus.",
  "demo cities": "The three demo cities are Aurora Falls, Bayhaven, and Cedar Ridge.",
  "ai labs": "AI Labs teaches prompts, tools, agents, evaluation, guardrails, and production AI patterns.",
};

function fmt(value: number): string {
  return value.toFixed(2).replace(/\.?0+$/, "");
}

function kbSearch({ query }: { query: string }): ToolResult {
  const queryTokens = tokenize(query);
  const best = Object.entries(FACTS)
    .map(([key, text]) => {
      const haystack = new Set(tokenize(`${key} ${text}`));
      return { key, text, score: queryTokens.filter((token) => haystack.has(token)).length };
    })
    .sort((a, b) => b.score - a.score || a.key.localeCompare(b.key))[0];
  return best?.score ? { ok: true, output: best.text } : { ok: false, output: `No fact matched "${query}".` };
}

function safeEval(expression: string): number {
  const tokens = expression.match(/\d+(?:\.\d+)?|[()+\-*/]|\S/g) ?? [];
  let pos = 0;
  const peek = () => tokens[pos];
  const take = () => tokens[pos++];

  function fold(next: () => number, ops: string): number {
    let value = next();
    for (let op = peek(); op && ops.includes(op); op = peek()) {
      take();
      const rhs = next();
      if (op === "/" && rhs === 0) throw new Error("Division by zero.");
      value = op === "+" ? value + rhs : op === "-" ? value - rhs : op === "*" ? value * rhs : value / rhs;
    }
    return value;
  }

  function expr(): number { return fold(term, "+-"); }
  function term(): number { return fold(factor, "*/"); }

  function factor(): number {
    const token = take();
    if (!token) throw new Error("Expression ended early.");
    if (token === "+" || token === "-") return (token === "-" ? -1 : 1) * factor();
    if (/^\d/.test(token)) return Number(token);
    if (token !== "(") throw new Error(`Unexpected token "${token}".`);
    const value = expr();
    if (take() !== ")") throw new Error("Missing closing parenthesis.");
    return value;
  }

  const result = expr();
  if (pos !== tokens.length) throw new Error(`Unexpected token "${tokens[pos]}".`);
  if (!Number.isFinite(result)) throw new Error("Result is not finite.");
  return result;
}

function calc({ expression }: { expression: string }): ToolResult {
  try {
    const value = safeEval(expression);
    return { ok: true, output: `${expression} = ${fmt(value)}`, value };
  } catch (error) { return { ok: false, output: (error as Error).message }; }
}

function pickCities(goal: string): City[] {
  const lower = goal.toLowerCase();
  const picked = CITIES.filter((city) => lower.includes(city.name.toLowerCase()) || lower.includes(city.name.toLowerCase().split(" ")[0]));
  return picked.length ? picked : CITIES;
}

function variant(kind: BlockKind): "default" | "outline" | "success" | "warning" | "danger" {
  return kind === "action" ? "warning" : kind === "observation" ? "outline" : kind === "final" ? "success" : kind === "stop" ? "danger" : "default";
}

function actionLabel(tool: "kbSearch" | "calc", input: string): string {
  return tool === "kbSearch" ? `kbSearch({ query: "${input}" })` : `calc({ expression: "${input}" })`;
}

export function AiAgent({ onTrace }: LabDemoProps) {
  const [goal, setGoal] = useState(DEFAULT_GOAL), [maxSteps, setMaxSteps] = useState(6), [running, setRunning] = useState(false);
  const [blocks, setBlocks] = useState<TranscriptBlock[]>([]), [finalAnswer, setFinalAnswer] = useState<string | null>(null), [error, setError] = useState<string | null>(null);

  function clear() { setBlocks([]); setFinalAnswer(null); setError(null); onTrace(null); }

  async function run() {
    if (running) return;
    const trimmedGoal = goal.trim();
    clear();
    if (!trimmedGoal) {
      setError("Enter a goal before running the agent.");
      return;
    }

    setRunning(true);
    const trace = new ClientTrace();
    const local: TranscriptBlock[] = [];
    const observations: City[] = [];
    const selectedCities = pickCities(trimmedGoal);
    const wantsAverage = /average|mean/i.test(trimmedGoal);
    const wantsLargest = /largest|biggest/i.test(trimmedGoal);
    let calculation: number | null = null;
    let runError: string | null = null;

    const add = (kind: BlockKind, title: string, body: string) => {
      local.push({ id: `${kind}-${local.length}`, kind, title, body });
      setBlocks([...local]);
    };
    const reveal = async (kind: BlockKind, title: string, body: string, ms: number, status: "ok" | "error" = "ok") => {
      add(kind, title, body);
      trace.step(title, body, status);
      onTrace(liveTrace(trace));
      await sleep(ms);
    };

    for (let step = 1; step <= maxSteps; step += 1) {
      if (observations.length < selectedCities.length) {
        const city = selectedCities[observations.length];
        const thought = `I need the population for ${city.name} before answering the goal.`;
        await reveal("thought", `Thought ${step}`, thought, 140);

        const query = `${city.name} population`;
        await reveal("action", `Action ${step}`, actionLabel("kbSearch", query), 160);

        const result = kbSearch({ query });
        const ok = result.ok && result.output.includes(fmt(city.population));
        if (ok) observations.push(city);
        const observation = ok ? `${result.output} Parsed population: ${fmt(city.population)} million.` : result.output;
        await reveal("observation", `Observation ${step}`, observation, 160, ok ? "ok" : "error");
        if (!ok) {
          runError = `The knowledge-base tool could not find a usable population for ${city.name}.`;
          break;
        }
      } else if (!wantsLargest && calculation === null) {
        const sum = observations.map((city) => fmt(city.population)).join(" + ");
        const expression = wantsAverage ? `(${sum}) / ${observations.length}` : sum;
        const thought = wantsAverage
          ? "I have all populations; now I should calculate the average with the calculator tool."
          : "I have all populations; now I should calculate the combined total with the calculator tool.";
        await reveal("thought", `Thought ${step}`, thought, 140);

        await reveal("action", `Action ${step}`, actionLabel("calc", expression), 160);

        const result = calc({ expression });
        if (result.ok && typeof result.value === "number") calculation = result.value;
        await reveal("observation", `Observation ${step}`, result.output, 160, result.ok ? "ok" : "error");
        if (!result.ok) {
          runError = "The calculator rejected the arithmetic expression.";
          break;
        }
      }
      if (observations.length === selectedCities.length && (wantsLargest || calculation !== null)) break;
    }

    let answer: string | null = null;
    if (!runError && observations.length === selectedCities.length) {
      if (wantsLargest) {
        const largest = [...observations].sort((a, b) => b.population - a.population)[0];
        answer = `${largest.name} is the largest demo city at ${fmt(largest.population)} million people.`;
      } else if (calculation !== null) {
        answer = `The ${wantsAverage ? "average" : "combined"} population of ${observations.map((city) => city.name).join(", ")} is ${fmt(calculation)} million.`;
      }
    }

    if (answer) {
      add("final", "Final Answer", answer);
      trace.step("Stop: final answer", "The agent has enough observations to answer.");
      setFinalAnswer(answer);
    } else {
      const stop = runError ?? `Stopped after ${maxSteps} ReAct iterations before reaching a final answer. Increase max steps to let the loop finish.`;
      setError(stop);
      add("stop", runError ? "Stop: tool error" : "Stop: max steps", stop);
      trace.step(runError ? "Stop: tool error" : "Stop: max steps", stop, "error");
    }

    setRunning(false);
    onTrace(liveTrace(trace, { inputTokens: estimateTokens(trimmedGoal), outputTokens: estimateTokens(local.map((block) => `${block.title}: ${block.body}`).join("\n")) }));
  }

  return (
    <div className="space-y-4">
      <SimNotice>The reasoning text is a deterministic stand-in for a model. The tools, ReAct loop, and max-step stopping control are real client-side logic.</SimNotice>
      <DemoColumns>
        <div className="space-y-4">
          <div>
            <Label htmlFor="agent-goal">Goal</Label>
            <Input id="agent-goal" value={goal} onChange={(event) => setGoal(event.target.value)} className="mt-1.5" placeholder="Ask the agent to use tools…" />
          </div>
          <RangeControl id="agent-max-steps" label="Max ReAct iterations" min={2} max={8} step={1} value={maxSteps} onChange={setMaxSteps} hint="A low value demonstrates controlled stopping before the final answer." />
          <div className="flex flex-wrap gap-2">
            <Button onClick={run} disabled={running || !goal.trim()}>
              {running ? <><Loader2 className="h-4 w-4 animate-spin" /> Running loop…</> : <><Play className="h-4 w-4" /> Run ReAct agent</>}
            </Button>
            <Button type="button" variant="outline" onClick={clear} disabled={running}>Clear</Button>
          </div>
        </div>

        <OutputPanel title="ReAct transcript" chip={running ? "looping" : finalAnswer ? "stopped" : "ready"}>
          {error && <DemoError>{error}</DemoError>}
          {blocks.length === 0 ? (
            <EmptyHint running={running}>{running ? "The agent is starting…" : "Run the agent to reveal Thought → Action → Observation steps."}</EmptyHint>
          ) : (
            <div className="space-y-3">
              {blocks.map((block) => (
                <div key={block.id} className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="mb-1.5 flex items-center gap-2">
                    <Badge variant={variant(block.kind)}>{block.kind}</Badge>
                    <span className="text-sm font-medium">{block.title}</span>
                    {block.kind === "action" && (block.body.startsWith("kbSearch") ? <Search className="h-3.5 w-3.5" /> : <Calculator className="h-3.5 w-3.5" />)}
                  </div>
                  <p className="text-sm text-muted-foreground">{block.body}</p>
                </div>
              ))}
            </div>
          )}
          {finalAnswer && (
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400"><Bot className="h-4 w-4" /> Final Answer</div>
              <p className="text-sm">{finalAnswer}</p>
            </div>
          )}
        </OutputPanel>
      </DemoColumns>
    </div>
  );
}
