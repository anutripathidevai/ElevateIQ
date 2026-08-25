"use client";

import { useState } from "react";
import { Braces, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { LabDemoProps, TraceStepView } from "../components/demo-types";
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

/**
 * Lab 2 — Structured Output.
 *
 * Demonstrates the production pattern for turning a free-text prompt into a
 * typed object: build a schema-aware prompt, generate, parse the JSON, validate
 * it against the schema, and retry on failure. Generation is a deterministic
 * local stand-in (real models are optional), but the parse → validate → repair
 * loop is genuine, so the lesson holds without any API key.
 */

interface Schema {
  id: string;
  label: string;
  fields: SchemaField[];
  sample: string;
  extract: (input: string) => Record<string, unknown>;
}

function firstMatch(input: string, re: RegExp, fallback: string): string {
  const m = input.match(re);
  return (m?.[1] ?? m?.[0] ?? fallback).trim();
}

const SCHEMAS: Schema[] = [
  {
    id: "contact",
    label: "Contact",
    fields: [
      { name: "name", type: "string", required: true },
      { name: "email", type: "string", required: true },
      { name: "role", type: "string" },
      { name: "company", type: "string" },
    ],
    sample:
      "Reach out to Priya Sharma, a senior platform engineer at Northwind, on priya.sharma@northwind.io about the migration.",
    extract: (input) => ({
      name: firstMatch(input, /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/, "Unknown Person"),
      email: firstMatch(input, /[\w.+-]+@[\w-]+\.[\w.-]+/, "unknown@example.com"),
      role: firstMatch(input, /\b(?:a|an)\s+([a-z ]+?engineer|[a-z ]+?manager|[a-z ]+?designer)\b/i, "engineer"),
      company: firstMatch(input, /\bat\s+([A-Z][A-Za-z0-9]+)\b/, "Unknown Co"),
    }),
  },
  {
    id: "event",
    label: "Calendar event",
    fields: [
      { name: "title", type: "string", required: true },
      { name: "date", type: "string", required: true },
      { name: "durationMinutes", type: "number" },
      { name: "online", type: "boolean" },
    ],
    sample:
      "Schedule the Q3 architecture review for March 14, a 60 minute meeting held over Zoom with the platform team.",
    extract: (input) => ({
      title: firstMatch(input, /\b(?:the\s+)?([A-Z0-9][\w ]+?(?:review|sync|meeting|standup|interview))\b/i, "Meeting"),
      date: firstMatch(
        input,
        /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2}\b/i,
        "TBD",
      ),
      durationMinutes: Number(firstMatch(input, /\b(\d{2,3})\s*(?:min|minute)/i, "30")),
      online: /zoom|meet|teams|online|virtual/i.test(input),
    }),
  },
  {
    id: "ticket",
    label: "Bug ticket",
    fields: [
      { name: "title", type: "string", required: true },
      { name: "severity", type: "string", required: true },
      { name: "component", type: "string" },
      { name: "blocksRelease", type: "boolean" },
    ],
    sample:
      "Critical: checkout fails with a 500 on the payments service for all users, blocking Friday's release.",
    extract: (input) => ({
      title: firstMatch(input, /^[^.!?]*(?:fails?|error|crash|broken|500)[^.!?]*/i, "Unexpected error").slice(0, 80),
      severity: /critical|sev1|p0/i.test(input)
        ? "critical"
        : /high|major|sev2/i.test(input)
          ? "high"
          : /low|minor/i.test(input)
            ? "low"
            : "medium",
      component: firstMatch(input, /\b([a-z]+)\s+service\b/i, "unknown"),
      blocksRelease: /block|release|ship/i.test(input),
    }),
  },
];

/** Wrap an object as the "messy" first model attempt: fences, preamble, trailing comma. */
function messyGeneration(obj: Record<string, unknown>): string {
  const body = JSON.stringify(obj, null, 2).replace(/\n}$/, ",\n}");
  return "Sure! Here is the structured data you requested:\n\n```json\n" + body + "\n```  // hope this helps";
}

function cleanGeneration(obj: Record<string, unknown>): string {
  return JSON.stringify(obj, null, 2);
}

/** Extract the first {...} block and JSON.parse it. */
function tryParse(raw: string): { ok: true; value: unknown } | { ok: false; error: string } {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < 0 || end <= start) {
    return { ok: false, error: "No JSON object found in the model output." };
  }
  try {
    return { ok: true, value: JSON.parse(raw.slice(start, end + 1)) };
  } catch (e) {
    return { ok: false, error: `JSON.parse failed: ${(e as Error).message}` };
  }
}

export function StructuredOutput({ onTrace }: LabDemoProps) {
  const [schemaId, setSchemaId] = useState(SCHEMAS[0].id);
  const [input, setInput] = useState(SCHEMAS[0].sample);
  const [jsonMode, setJsonMode] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [attempts, setAttempts] = useState<TraceStepView[]>([]);
  const [error, setError] = useState<string | null>(null);

  const schema = SCHEMAS.find((s) => s.id === schemaId) ?? SCHEMAS[0];

  function selectSchema(id: string) {
    const next = SCHEMAS.find((s) => s.id === id) ?? SCHEMAS[0];
    setSchemaId(id);
    setInput(next.sample);
    setResult(null);
    setAttempts([]);
    setError(null);
    onTrace(null);
  }

  async function run() {
    if (running) return;
    setRunning(true);
    setResult(null);
    setError(null);
    setAttempts([]);
    onTrace(null);

    const trace = new ClientTrace();
    const local: TraceStepView[] = [];
    const push = (s: TraceStepView) => {
      local.push(s);
      setAttempts([...local]);
      onTrace(liveTrace(trace));
    };

    push(trace.step("Build prompt", `system + schema signature (${schema.fields.length} fields)`));
    await sleep(120);

    const target = schema.extract(input);
    let parsed: Record<string, unknown> | null = null;
    let attempt = 0;
    const maxAttempts = 3;

    while (attempt < maxAttempts && !parsed) {
      attempt += 1;
      // First attempt is intentionally "messy" unless JSON mode is forced on.
      const messy = attempt === 1 && !jsonMode;
      const raw = messy ? messyGeneration(target) : cleanGeneration(target);
      push(trace.step(`Model call (attempt ${attempt})`, messy ? "free-form text with a code fence" : "JSON mode"));
      await sleep(160);

      const p = tryParse(raw);
      if (!p.ok) {
        push(trace.step(`Parse attempt ${attempt}`, p.error, "error"));
        await sleep(120);
        continue;
      }
      const validation = validateAgainstSchema(p.value, schema.fields);
      if (!validation.ok) {
        push(trace.step(`Validate attempt ${attempt}`, validation.errors.join(" "), "error"));
        await sleep(120);
        continue;
      }
      push(trace.step(`Validate attempt ${attempt}`, "All required fields present and typed"));
      parsed = p.value as Record<string, unknown>;
    }

    if (!parsed) {
      setError("The model could not produce valid JSON within the retry budget.");
      setRunning(false);
      onTrace(liveTrace(trace, { inputTokens: estimateTokens(input), outputTokens: 0 }));
      return;
    }

    setResult(parsed);
    setRunning(false);
    onTrace(
      liveTrace(trace, {
        inputTokens: estimateTokens(input),
        outputTokens: estimateTokens(JSON.stringify(parsed)),
      }),
    );
  }

  return (
    <div className="space-y-4">
      <SimNotice />
      <DemoColumns>
        <div className="space-y-4">
          <div>
            <Label htmlFor="so-schema">Target schema</Label>
            <Select
              id="so-schema"
              value={schemaId}
              onChange={(e) => selectSchema(e.target.value)}
              className="mt-1.5 w-full"
            >
              {SCHEMAS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Schema (what the model must return)</Label>
            <pre className="mt-1.5 overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 text-xs">
              {schemaToSignature(schema.fields)}
            </pre>
          </div>

          <div>
            <Label htmlFor="so-input">Unstructured input</Label>
            <Textarea
              id="so-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="mt-1.5 min-h-[120px]"
              placeholder="Paste a sentence to extract fields from…"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={jsonMode}
              onChange={(e) => setJsonMode(e.target.checked)}
              className="h-4 w-4 accent-violet-500"
            />
            Force JSON mode (skip the messy first attempt)
          </label>

          <Button onClick={run} disabled={running || !input.trim()}>
            {running ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Extracting…
              </>
            ) : (
              <>
                <Play className="h-4 w-4" /> Extract to JSON
              </>
            )}
          </Button>
        </div>

        <OutputPanel title="Validated object" chip={<Braces className="h-3.5 w-3.5" />}>
          {error ? (
            <DemoError>{error}</DemoError>
          ) : result ? (
            <pre className="overflow-x-auto rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs leading-relaxed">
              {JSON.stringify(result, null, 2)}
            </pre>
          ) : (
            <EmptyHint running={running}>
              {running ? "Generating and validating…" : "Run the extractor to see a typed, schema-valid object."}
            </EmptyHint>
          )}

          {attempts.length > 0 && (
            <ol className="mt-4 space-y-1.5 text-xs">
              {attempts.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className={cn(
                      "mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full",
                      s.status === "error" ? "bg-danger" : "bg-emerald-500",
                    )}
                  />
                  <span className={cn(s.status === "error" && "text-danger")}>
                    <span className="font-medium">{s.label}</span>
                    {s.detail ? ` — ${s.detail}` : ""}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </OutputPanel>
      </DemoColumns>
    </div>
  );
}
