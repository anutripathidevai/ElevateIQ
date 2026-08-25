"use client";
import { useState } from "react";
import { Braces, Loader2, Play, Workflow } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { LabDemoProps } from "../components/demo-types";
import {
  ClientTrace,
  estimateTokens,
  liveTrace,
  schemaToSignature,
  sleep,
  validateAgainstSchema,
  type SchemaField,
} from "./_shared/lab-engine";
import { DemoColumns, DemoError, EmptyHint, OutputPanel, SimNotice } from "./_shared/demo-kit";
type SkillInput = { name: string; label: string; placeholder: string; multiline?: boolean; defaultValue: string };
type Skill = {
  id: string;
  name: string;
  description: string;
  template: string;
  inputs: SkillInput[];
  run: (vars: Record<string, string>) => string;
  schema?: SchemaField[];
};
type Result = { prompt: string; output: string; validation?: { ok: boolean; errors: string[]; items: string[] } };
function words(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}
function firstSentence(text: string): string {
  return text.trim().match(/^[^.!?]+[.!?]?/)?.[0] ?? "No meaningful text was provided.";
}
function extractActions(notes: string): string[] {
  const verbs = /\b(todo|need to|needs to|follow up|send|schedule|review|fix|update|assign|prepare|confirm|create|write)\b/i;
  const lines = notes.split(/\n|[.;]/).map((line) => line.replace(/^[-*]\s*/, "").trim()).filter(Boolean);
  const picked = lines.filter((line) => verbs.test(line));
  return (picked.length ? picked : lines.slice(0, 2))
    .map((line) => line.charAt(0).toUpperCase() + line.slice(1))
    .slice(0, 5);
}
function resolveTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => vars[key]?.trim() ?? "");
}
const SKILLS: Skill[] = [
  {
    id: "summarize",
    name: "Summarize",
    description: "Compress a long note into a one-sentence brief with token-friendly context.",
    template: "Summarize this text in 1-2 sentences.\n\nText:\n{{text}}",
    inputs: [{
      name: "text",
      label: "Text to summarize",
      placeholder: "Paste text to summarize…",
      multiline: true,
      defaultValue: "The checkout team shipped a faster payment review queue today. It reduced manual triage time, but support still needs a clearer summary for failed card disputes.",
    }],
    run: (vars) => `${firstSentence(vars.text)} (${words(vars.text).length} words in the source.)`,
  },
  {
    id: "action-items",
    name: "Action items",
    description: "Extract concrete follow-ups and validate them as a string array.",
    template: "Extract action items from these meeting notes. Return concise bullets only.\n\nNotes:\n{{notes}}",
    inputs: [{
      name: "notes",
      label: "Meeting notes",
      placeholder: "Paste notes with todos or follow-ups…",
      multiline: true,
      defaultValue: "Maya will review the billing migration plan.\nTodo: send QA the latest test data.\nWe need to schedule a launch readiness check.\nRahul shared background on the incident.",
    }],
    schema: [{ name: "items", type: "string[]", required: true }],
    run: (vars) => extractActions(vars.notes).map((item) => `- ${item}`).join("\n"),
  },
  {
    id: "rewrite-tone",
    name: "Rewrite tone",
    description: "Reframe a message for a target tone while preserving the facts.",
    template: "Rewrite the text in a {{tone}} tone.\n\nText:\n{{text}}",
    inputs: [
      { name: "text", label: "Text to rewrite", placeholder: "Paste text to reframe…", multiline: true, defaultValue: "The deployment failed again because the release checklist was incomplete." },
      { name: "tone", label: "Target tone", placeholder: "friendly, executive, direct…", defaultValue: "calm and constructive" },
    ],
    run: (vars) => `In a ${vars.tone.trim() || "clear"} tone: ${vars.text.trim()} Next, align on the missing checklist items and retry with owners confirmed.`,
  },
];
function initialVars(skill: Skill): Record<string, string> {
  return Object.fromEntries(skill.inputs.map((input) => [input.name, input.defaultValue]));
}
function bulletsToItems(output: string): string[] {
  return output.split("\n").map((line) => line.replace(/^[-*]\s*/, "").trim()).filter(Boolean);
}
export function SkillBuilder({ onTrace }: LabDemoProps) {
  const [skillId, setSkillId] = useState(SKILLS[0].id);
  const [vars, setVars] = useState<Record<string, string>>(initialVars(SKILLS[0]));
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const skill = SKILLS.find((s) => s.id === skillId) ?? SKILLS[0];
  function clearRun() {
    setResult(null);
    setError(null);
    onTrace(null);
  }
  function selectSkill(id: string) {
    const next = SKILLS.find((s) => s.id === id) ?? SKILLS[0];
    setSkillId(next.id);
    setVars(initialVars(next));
    clearRun();
  }
  async function run() {
    if (running) return;
    clearRun();
    const missing = skill.inputs.find((input) => !vars[input.name]?.trim());
    if (missing) {
      setError(`Fill in "${missing.label}" before running this skill.`);
      return;
    }
    setRunning(true);
    const trace = new ClientTrace();
    const push = (label: string, detail?: string, status: "ok" | "error" = "ok") => {
      trace.step(label, detail, status);
      onTrace(liveTrace(trace));
    };
    try {
      const prompt = resolveTemplate(skill.template, vars);
      push("Resolve template", `${skill.name} prompt with ${skill.inputs.length} input(s)`);
      await sleep(140);
      const output = skill.run(vars);
      push("Generate", "local deterministic skill.run(vars)");
      await sleep(160);
      let validation: Result["validation"];
      if (skill.schema) {
        const items = bulletsToItems(output);
        const checked = validateAgainstSchema({ items }, skill.schema);
        validation = { ...checked, items };
        push("Validate output", checked.ok ? "items is a valid string[]" : checked.errors.join(" "), checked.ok ? "ok" : "error");
        await sleep(140);
      }
      setResult({ prompt, output, validation });
      setRunning(false);
      onTrace(liveTrace(trace, { inputTokens: estimateTokens(prompt), outputTokens: estimateTokens(output) }));
    } catch (e) {
      const message = (e as Error).message;
      setError(message);
      setRunning(false);
      push("Skill error", message, "error");
      onTrace(liveTrace(trace, { inputTokens: 0, outputTokens: 0 }));
    }
  }
  return (
    <div className="space-y-4">
      <SimNotice />
      <DemoColumns>
        <div className="space-y-4">
          <div>
            <Label htmlFor="skill-picker">Reusable skill</Label>
            <Select id="skill-picker" value={skillId} onChange={(e) => selectSkill(e.target.value)} className="mt-1.5 w-full">
              {SKILLS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <p className="mt-2 text-xs text-muted-foreground">{skill.description}</p>
          </div>
          {skill.inputs.map((input) => (
            <div key={input.name}>
              <Label htmlFor={`skill-${input.name}`}>{input.label}</Label>
              {input.multiline ? (
                <Textarea id={`skill-${input.name}`} value={vars[input.name] ?? ""} onChange={(e) => { setVars((v) => ({ ...v, [input.name]: e.target.value })); clearRun(); }} placeholder={input.placeholder} className="mt-1.5 min-h-[110px]" />
              ) : (
                <Input id={`skill-${input.name}`} value={vars[input.name] ?? ""} onChange={(e) => { setVars((v) => ({ ...v, [input.name]: e.target.value })); clearRun(); }} placeholder={input.placeholder} className="mt-1.5" />
              )}
            </div>
          ))}
          {skill.schema && (
            <div>
              <Label>Output schema</Label>
              <pre className="mt-1.5 overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 text-xs">{schemaToSignature(skill.schema)}</pre>
            </div>
          )}
          <Button onClick={run} disabled={running}>
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? "Running…" : "Run skill"}
          </Button>
        </div>
        <OutputPanel title="Skill output" chip={<Workflow className="h-3.5 w-3.5" />}>
          {error ? <DemoError>{error}</DemoError> : result ? (
            <div className="space-y-4">
              <div>
                <Badge variant="outline">resolved prompt</Badge>
                <pre className="mt-1.5 overflow-x-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed">{result.prompt}</pre>
              </div>
              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <Badge variant={result.validation?.ok === false ? "danger" : "success"}>{result.validation ? "validated output" : "output"}</Badge>
                  {result.validation && <Braces className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs leading-relaxed">{result.output}</pre>
              </div>
              <p className="text-xs text-muted-foreground">
                Reusability pattern: invoke skills like <code>{'runSkill("summarize", { text })'}</code>, then compose them into larger features.
              </p>
            </div>
          ) : (
            <EmptyHint running={running}>
              {running ? "Resolving the template and running the skill…" : "Choose a skill, edit its typed inputs, and run it."}
            </EmptyHint>
          )}
        </OutputPanel>
      </DemoColumns>
    </div>
  );
}
