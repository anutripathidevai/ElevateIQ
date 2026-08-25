import type { LiveTrace, RunMetrics, TraceStepView } from "../../components/demo-types";

/**
 * Shared, framework-free engine for the AI Labs interactive demos.
 *
 * Every lab after the LLM Playground teaches a *system* concept — embeddings,
 * retrieval, tool loops, agents, evaluation, guardrails, production concerns.
 * Those systems are demonstrated with real, inspectable client-side logic (real
 * cosine similarity, real chunking, real schema validation, real regex
 * guardrails, a real ReAct loop) so the labs always work in the guest-mode
 * deployment with no database and no model key. Where a genuine model call is
 * not essential to the lesson, a deterministic stand-in produces the "model"
 * text and is clearly labelled as a local simulation in the UI.
 *
 * Nothing here imports React, so it can be unit-tested and reused by every demo.
 */

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Rough token estimate: ~4 characters per token (matches the server heuristic). */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}

/** Split text into lowercase word tokens (letters/digits). */
export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter(Boolean);
}

// ---- Embeddings (toy, deterministic) --------------------------------------

const EMBED_DIMS = 96;

function hashToken(token: string): number {
  let h = 2166136261;
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Character trigrams of a word, so "run" and "running" share features. */
function trigrams(token: string): string[] {
  const padded = `#${token}#`;
  if (padded.length <= 3) return [padded];
  const grams: string[] = [];
  for (let i = 0; i + 3 <= padded.length; i++) grams.push(padded.slice(i, i + 3));
  return grams;
}

/**
 * A lightweight, fully local embedding: hash word + character-trigram features
 * into a fixed vector and L2-normalise. It is NOT a neural embedding, but it
 * captures lexical overlap and morphology well enough to make cosine ranking
 * behave intuitively — perfect for teaching how vector search works offline.
 */
export function toyEmbed(text: string, dims = EMBED_DIMS): number[] {
  const vec = new Array(dims).fill(0);
  const tokens = tokenize(text);
  for (const tok of tokens) {
    vec[hashToken(tok) % dims] += 1;
    for (const g of trigrams(tok)) vec[hashToken(g) % dims] += 0.5;
  }
  let norm = 0;
  for (const v of vec) norm += v * v;
  norm = Math.sqrt(norm) || 1;
  return vec.map((v) => v / norm);
}

/** Cosine similarity of two equal-length vectors (assumes normalised or not). */
export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

export interface Ranked<T> {
  item: T;
  score: number;
}

/** Rank items by cosine similarity of their embedding to a query embedding. */
export function rankBySimilarity<T>(
  query: number[],
  items: { item: T; vector: number[] }[],
  topK = items.length,
): Ranked<T>[] {
  return items
    .map(({ item, vector }) => ({ item, score: cosine(query, vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// ---- Chunking --------------------------------------------------------------

export interface Chunk {
  id: number;
  text: string;
  words: number;
}

/**
 * Split text into overlapping word windows — the standard RAG pre-processing
 * step. `size` and `overlap` are measured in words so the result is easy to see.
 */
export function chunkText(text: string, size = 40, overlap = 8): Chunk[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const step = Math.max(1, size - overlap);
  const chunks: Chunk[] = [];
  let id = 0;
  for (let start = 0; start < words.length; start += step) {
    const slice = words.slice(start, start + size);
    if (slice.length === 0) break;
    chunks.push({ id: id++, text: slice.join(" "), words: slice.length });
    if (start + size >= words.length) break;
  }
  return chunks;
}

// ---- Tiny JSON-schema validator -------------------------------------------

export type SchemaType = "string" | "number" | "boolean" | "string[]";

export interface SchemaField {
  name: string;
  type: SchemaType;
  required?: boolean;
  description?: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

/** Validate a plain object against a flat field schema. */
export function validateAgainstSchema(
  value: unknown,
  fields: SchemaField[],
): ValidationResult {
  const errors: string[] = [];
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { ok: false, errors: ["Output is not a JSON object."] };
  }
  const obj = value as Record<string, unknown>;
  for (const field of fields) {
    const present =
      field.name in obj && obj[field.name] !== undefined && obj[field.name] !== null;
    if (!present) {
      if (field.required) errors.push(`Missing required field "${field.name}".`);
      continue;
    }
    const v = obj[field.name];
    const typeOk =
      field.type === "string"
        ? typeof v === "string"
        : field.type === "number"
          ? typeof v === "number" && Number.isFinite(v)
          : field.type === "boolean"
            ? typeof v === "boolean"
            : Array.isArray(v) && v.every((x) => typeof x === "string");
    if (!typeOk) errors.push(`Field "${field.name}" should be ${field.type}.`);
  }
  return { ok: errors.length === 0, errors };
}

/** Render a flat schema as a compact TypeScript-ish signature for display. */
export function schemaToSignature(fields: SchemaField[]): string {
  const lines = fields.map((f) => `  ${f.name}${f.required ? "" : "?"}: ${f.type};`);
  return `{\n${lines.join("\n")}\n}`;
}

// ---- Client-side execution trace ------------------------------------------

function nowMs(): number {
  return typeof performance !== "undefined" && typeof performance.now === "function"
    ? performance.now()
    : Date.now();
}

/**
 * Client mirror of the server ExecutionTrace: records each stage of a demo run
 * with real timings so the "Execution Trace" tab shows what happened.
 */
export class ClientTrace {
  private readonly start = nowMs();
  private lastMark = this.start;
  readonly steps: TraceStepView[] = [];

  step(label: string, detail?: string, status: "ok" | "error" = "ok"): TraceStepView {
    const t = nowMs();
    const step: TraceStepView = {
      label,
      atMs: Math.round(t - this.start),
      durationMs: Math.round(t - this.lastMark),
      status,
      detail,
    };
    this.lastMark = t;
    this.steps.push(step);
    return step;
  }

  totalMs(): number {
    return Math.round(nowMs() - this.start);
  }
}

/**
 * Build a `LiveTrace` for the shell's Execution Trace tab. Simulated demos pass
 * `demo: true` so the cost readout renders as "Demo" rather than a dollar value.
 */
export function liveTrace(trace: ClientTrace, metrics?: Partial<RunMetrics>): LiveTrace {
  return {
    steps: [...trace.steps],
    totalMs: trace.totalMs(),
    metrics: metrics
      ? {
          model: "local-simulation",
          demo: true,
          inputTokens: 0,
          outputTokens: 0,
          latencyMs: trace.totalMs(),
          costUsd: 0,
          used: 0,
          limit: 0,
          remaining: 0,
          ...metrics,
        }
      : undefined,
  };
}
