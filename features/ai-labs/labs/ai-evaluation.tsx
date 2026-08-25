"use client";

import { useState } from "react";
import { BarChart3, CheckCircle2, ClipboardCheck, Loader2, Play, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { LabDemoProps } from "../components/demo-types";
import { ClientTrace, estimateTokens, liveTrace, sleep, tokenize } from "./_shared/lab-engine";
import { DemoColumns, DemoError, EmptyHint, OutputPanel, RangeControl, ScoreBar, SimNotice } from "./_shared/demo-kit";

type PromptVersion = "v1" | "v2";
type EvalCase = { id: string; input: string; idealPoints: string[]; outputV1: string; outputV2: string };
type CaseResult = { id: string; input: string; score: number; pass: boolean; rationale: string };

const EVAL_SET: EvalCase[] = [
  { id: "reset-password", input: "How do I reset my password after I lose access?", idealPoints: ["open account settings", "choose reset password", "confirm by email"], outputV1: "Go to settings and reset your password.", outputV2: "Open account settings, choose reset password, then confirm by email before signing in again." },
  { id: "pricing", input: "What do the Starter and Pro plans cost annually?", idealPoints: ["starter plan costs 19 dollars", "pro plan costs 49 dollars", "annual billing saves 20 percent"], outputV1: "The starter plan costs 19 dollars. Annual billing is available.", outputV2: "The starter plan costs 19 dollars, the pro plan costs 49 dollars, and annual billing saves 20 percent." },
  { id: "retention", input: "What data can admins export or delete?", idealPoints: ["logs kept 30 days", "exports available as CSV", "admins can delete workspace data"], outputV1: "Audit logs kept 30 days, exports available as CSV, and admins can delete workspace data.", outputV2: "Logs are kept 30 days and exports are available as CSV." },
  { id: "escalation", input: "What should support include when escalating a checkout outage?", idealPoints: ["include customer id", "attach error screenshot", "page on call after 15 minutes"], outputV1: "Escalate with customer details and screenshots if it looks urgent.", outputV2: "Include customer id, attach error screenshot, and page on call after 15 minutes if checkout is still failing." },
  { id: "security", input: "What security controls are available for enterprise customers?", idealPoints: ["SOC 2 Type II", "encryption at rest", "SSO available on enterprise"], outputV1: "We have SOC 2 Type II and strong security controls.", outputV2: "SOC 2 Type II, encryption at rest, and SSO available on enterprise are included for enterprise customers." },
];

const STOP = new Set(["a", "an", "and", "as", "at", "by", "for", "in", "is", "of", "on", "or", "the", "to"]);

function outputFor(test: EvalCase, version: PromptVersion): string {
  return version === "v1" ? test.outputV1 : test.outputV2;
}

function matchesPoint(outputTokens: Set<string>, point: string): boolean {
  const keys = tokenize(point).filter((token) => !STOP.has(token));
  return keys.length > 0 && keys.every((token) => outputTokens.has(token));
}

function judgeCase(test: EvalCase, version: PromptVersion, threshold: number): CaseResult {
  const output = outputFor(test, version);
  const tokens = new Set(tokenize(output));
  const matched = test.idealPoints.filter((point) => matchesPoint(tokens, point));
  const missing = test.idealPoints.find((point) => !matchesPoint(tokens, point));
  const score = Math.max(1, Math.min(5, Math.round((5 * matched.length) / test.idealPoints.length) - (tokenize(output).length < 8 ? 1 : 0)));
  const rationale = missing ? `matched ${matched.length}/${test.idealPoints.length} key points; missing "${missing}"` : `matched ${matched.length}/${test.idealPoints.length} key points; covered all ideal points`;
  return { id: test.id, input: test.input, score, pass: score >= threshold, rationale };
}

function evaluate(version: PromptVersion, threshold: number): CaseResult[] {
  return EVAL_SET.map((test) => judgeCase(test, version, threshold));
}

function compareVersions(version: PromptVersion) {
  const other: PromptVersion = version === "v1" ? "v2" : "v1";
  return EVAL_SET.reduce((acc, test) => {
    const selected = judgeCase(test, version, 1).score;
    const baseline = judgeCase(test, other, 1).score;
    if (selected > baseline) acc.improved += 1;
    else if (selected < baseline) acc.regressed += 1;
    else acc.same += 1;
    return acc;
  }, { improved: 0, regressed: 0, same: 0 });
}

function aggregate(results: CaseResult[]) {
  const passCount = results.filter((result) => result.pass).length;
  const avg = results.length ? results.reduce((sum, result) => sum + result.score, 0) / results.length : 0;
  return { passRate: results.length ? Math.round((100 * passCount) / results.length) : 0, avg };
}

function truncate(text: string, max = 74): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export function AiEvaluation({ onTrace }: LabDemoProps) {
  const [promptVersion, setPromptVersion] = useState<PromptVersion>("v1");
  const [threshold, setThreshold] = useState(3);
  const [running, setRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [partialResults, setPartialResults] = useState<CaseResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const results = running ? partialResults : hasRun ? evaluate(promptVersion, threshold) : [];
  const metrics = aggregate(results);
  const regression = compareVersions(promptVersion);
  const inputEstimate = estimateTokens(EVAL_SET.map((test) => `${test.input}\n${test.idealPoints.join("; ")}\n${outputFor(test, promptVersion)}`).join("\n\n"));

  async function run() {
    if (running) return;
    onTrace(null); setError(null); setHasRun(false); setPartialResults([]);
    if (EVAL_SET.length === 0) { setError("No eval cases are configured."); return; }
    setRunning(true);
    const trace = new ClientTrace();
    const judged: CaseResult[] = [];

    trace.step("Load eval set", `${EVAL_SET.length} cases with ideal points`); onTrace(liveTrace(trace));
    await sleep(140);
    trace.step(`Run system (${promptVersion})`, `Selected ${promptVersion.toUpperCase()} outputs for judging`); onTrace(liveTrace(trace));
    await sleep(160);

    for (let i = 0; i < EVAL_SET.length; i += 1) {
      const result = judgeCase(EVAL_SET[i], promptVersion, threshold);
      judged.push(result); setPartialResults([...judged]);
      trace.step(`Judge case ${i + 1}`, result.rationale); onTrace(liveTrace(trace));
      await sleep(140);
    }

    const finalMetrics = aggregate(judged);
    const finalRegression = compareVersions(promptVersion);
    trace.step("Aggregate", `${finalMetrics.passRate}% pass rate; ${finalRegression.improved} improved, ${finalRegression.regressed} regressed, ${finalRegression.same} same`);
    setPartialResults(judged); setHasRun(true); setRunning(false);
    onTrace(liveTrace(trace, { inputTokens: inputEstimate, outputTokens: estimateTokens(judged.map((result) => `${result.score} ${result.rationale}`).join("\n")) }));
  }

  return (
    <div className="space-y-4">
      <SimNotice>The judge is a deterministic rubric standing in for an LLM-as-judge: it scores keyword coverage, applies a short-answer penalty, and reports a rationale.</SimNotice>
      <DemoColumns>
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="eval-version">Prompt version</Label>
                <Select id="eval-version" value={promptVersion} onChange={(e) => setPromptVersion(e.target.value as PromptVersion)} className="mt-1.5 w-full">
                  <option value="v1">v1 baseline</option><option value="v2">v2 candidate</option>
                </Select>
              </div>
              <RangeControl id="eval-threshold" label="Pass threshold" value={threshold} min={1} max={5} step={1} onChange={setThreshold} hint="Minimum score required for PASS." format={(value) => `${value}/5`} />
            </div>
            <Button onClick={run} disabled={running} className="mt-4">{running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}{running ? "Running eval…" : `Run ${promptVersion.toUpperCase()} eval`}</Button>
            {error ? <div className="mt-3"><DemoError>{error}</DemoError></div> : null}
          </div>

          <OutputPanel title="Eval set" chip={`${EVAL_SET.length} cases`}>
            <div className="space-y-3">{EVAL_SET.map((test) => (
              <div key={test.id} className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                <div className="mb-1 flex items-center gap-2 font-medium"><ClipboardCheck className="h-4 w-4 text-violet-500" /> {test.id}</div>
                <p className="text-muted-foreground">{test.input}</p><p className="mt-2 text-xs">Ideal: {test.idealPoints.join("; ")}</p>
              </div>
            ))}</div>
          </OutputPanel>
        </div>

        <OutputPanel title="Results table" chip={`${promptVersion.toUpperCase()} vs ${promptVersion === "v1" ? "V2" : "V1"}`}>
          {results.length ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">Pass rate</div><div className="mt-1 text-2xl font-semibold">{metrics.passRate}%</div></div>
                <div className="rounded-lg border border-border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">Average score</div><div className="mt-1 text-2xl font-semibold">{metrics.avg.toFixed(1)}/5</div></div>
                <div className="rounded-lg border border-border bg-muted/30 p-3"><div className="flex items-center gap-1 text-xs text-muted-foreground"><BarChart3 className="h-3.5 w-3.5" /> Regression</div><div className="mt-1 text-sm">+{regression.improved} / -{regression.regressed} / ={regression.same}</div></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-xs">
                  <thead className="border-b border-border text-muted-foreground"><tr><th className="py-2 pr-3 font-medium">Case input</th><th className="py-2 pr-3 font-medium">Score</th><th className="py-2 pr-3 font-medium">Result</th><th className="py-2 font-medium">Rationale</th></tr></thead>
                  <tbody>{results.map((result) => (
                    <tr key={result.id} className="border-b border-border/60 align-top">
                      <td className="py-2 pr-3">{truncate(result.input)}</td>
                      <td className="py-2 pr-3"><div className="flex min-w-20 items-center gap-2"><span className="font-mono">{result.score}/5</span><ScoreBar score={result.score / 5} className="w-14" /></div></td>
                      <td className="py-2 pr-3"><Badge variant="outline" className={cn(result.pass ? "border-emerald-500/40 text-emerald-600" : "border-danger/40 text-danger")}>{result.pass ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}{result.pass ? "PASS" : "FAIL"}</Badge></td>
                      <td className="py-2">{result.rationale}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          ) : <EmptyHint running={running}>{running ? "Judging cases and streaming partial results…" : "Run the eval to score every case and detect regressions."}</EmptyHint>}
        </OutputPanel>
      </DemoColumns>
    </div>
  );
}
