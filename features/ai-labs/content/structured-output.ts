import type { LabContent } from "../types";

/**
 * Lab 2 — Structured Output.
 *
 * Teaches how to make an LLM return valid, schema-conforming JSON — the
 * foundation of every AI feature that feeds real code. The demo runs the true
 * production loop (prompt → generate → parse → validate → retry) locally.
 */
export const structuredOutputContent: LabContent = {
  slug: "structured-output",

  overviewMD: `
## Why structured output matters

A chat answer is text a human reads. But most AI *features* need the model's
answer to flow into code: create a calendar event, open a ticket, populate a
form, call an API. For that, free-form prose is useless — you need a **typed
object your program can trust**.

This lab turns unstructured text ("Reach out to Priya Sharma, a senior platform
engineer at Northwind…") into a validated JSON object that matches a schema you
define. You will see the exact loop production systems use to make this reliable.

## The core problem

Models are trained to produce *plausible* text, not *valid* JSON. Left alone they
wrap output in markdown fences, add a chatty preamble, trail a comma, or drop a
required field. So "just ask for JSON" is not enough — you need to **parse,
validate, and retry**.

## Where it is used

- Extraction (contacts, invoices, resumes → fields)
- Function/tool arguments (Lab 6) and agent plans (Lab 7)
- Classification and tagging with a fixed set of labels
- Anywhere an AI result becomes a database row or an API call
`.trim(),

  whatYouBuild: [
    "A schema-aware prompt built from a typed field definition",
    "A generate → parse → validate → retry loop with a retry budget",
    "Real JSON parsing that recovers the object from messy model text",
    "Real schema validation that reports exactly which fields are wrong",
    "A live trace showing each attempt and why it failed or passed",
  ],

  architecture: {
    title: "The structured-output loop",
    flow: [
      "[ Unstructured text ] + [ Schema ]",
      "            |",
      "            v",
      "     [ Build prompt ]  (schema signature + instructions)",
      "            |",
      "            v",
      "     [ Generate ] --------------------------.",
      "            |                                |",
      "            v                                |",
      "     [ Parse JSON ] --fail--> retry ---------|",
      "            | ok                             |",
      "            v                                |",
      "     [ Validate schema ] --fail--> retry ----'",
      "            | ok",
      "            v",
      "     [ Typed object ]  -> your code",
    ].join("\n"),
    nodes: [
      {
        id: "schema",
        label: "Schema",
        whatMD:
          "A typed definition of the fields you require — name, type, and whether each is required. Rendered into the prompt as a signature the model must satisfy.",
        whyMD:
          "The schema is the contract. It is the single source of truth for what 'valid' means, used both to instruct the model and to validate its answer.",
        input: "Field definitions (name, type, required)",
        output: "A prompt signature + a validator",
        commonFailure:
          "Describing the shape in prose instead of a precise schema, so 'valid' is ambiguous and unenforceable.",
        interviewQuestion:
          "How do you define and enforce the shape of an LLM's output?",
      },
      {
        id: "prompt",
        label: "Build prompt",
        whatMD:
          "Combine a system instruction ('return only JSON matching this schema') with the schema signature and the user's text.",
        whyMD:
          "A precise instruction plus an explicit schema dramatically raises the odds of first-try valid JSON and reduces retries (and cost).",
        input: "Schema signature + input text",
        output: "Messages sent to the model",
        commonFailure:
          "Burying the schema in a long prompt so the model half-follows it.",
        interviewQuestion:
          "What goes in the system prompt versus the user prompt for an extraction task?",
      },
      {
        id: "parse",
        label: "Parse JSON",
        whatMD:
          "Recover the JSON object from the raw output — strip code fences and preamble, take the first `{ … }` block, and `JSON.parse` it.",
        whyMD:
          "Even good models add noise around the JSON. Robust parsing turns 'almost JSON' into a real object or a clear parse error to retry on.",
        input: "Raw model text",
        output: "A JavaScript object, or a parse error",
        commonFailure:
          "Calling `JSON.parse` on the whole response and crashing on the first backtick.",
        interviewQuestion:
          "How do you reliably extract JSON from a model that sometimes adds prose?",
      },
      {
        id: "validate",
        label: "Validate schema",
        whatMD:
          "Check the parsed object against the schema: required fields present, correct types. Collect every violation, not just the first.",
        whyMD:
          "Parsing proves it is JSON; validation proves it is the *right* JSON. Only validated data is safe to hand to the rest of the system.",
        input: "Parsed object + schema",
        output: "ok, or a list of field errors",
        commonFailure:
          "Trusting parsed JSON without validating, then crashing downstream on a missing field.",
        interviewQuestion:
          "Why validate after parsing, and what do you check?",
      },
      {
        id: "retry",
        label: "Retry policy",
        whatMD:
          "On a parse or validation failure, retry with a bounded budget — often feeding the error back so the model can repair its own output.",
        whyMD:
          "Reliability comes from the loop, not from one lucky call. A retry budget caps cost and latency while recovering from transient bad outputs.",
        input: "Failure reason + attempt count",
        output: "A repaired attempt, or a surfaced error",
        commonFailure:
          "Retrying forever (runaway cost) or not at all (brittle feature).",
        interviewQuestion:
          "How do you design a retry policy for LLM output that can fail validation?",
      },
    ],
  },

  demo: "structured-output",

  executionMD: `
## What the execution trace shows

Each run records the real loop:

1. **Build prompt** — the schema signature is turned into instructions.
2. **Model call (attempt n)** — a candidate is generated. The first attempt is
   deliberately "messy" (fenced, with a preamble and a trailing comma) unless you
   force JSON mode, so you can watch the recovery.
3. **Parse attempt n** — extracting and \`JSON.parse\`-ing the object; a failure
   here is shown in red and triggers a retry.
4. **Validate attempt n** — checking required fields and types against the schema.
5. Success once an attempt both parses and validates.

Reading this trace is exactly how you debug flaky extraction in production: is the
model failing to produce JSON at all (a parse problem, fix the prompt / turn on
JSON mode), or producing JSON with the wrong fields (a validation problem, tighten
the schema description or add examples)?
`.trim(),

  learnMD: `
## "Just ask for JSON" is not enough

Every serious structured-output implementation is a **loop**, not a single call:

\`\`\`
generate → parse → validate → (retry with the error) → typed object
\`\`\`

### JSON mode and function calling

Modern APIs offer **JSON mode** (the model is constrained to emit syntactically
valid JSON) and **function/tool calling** (you pass a schema and get arguments
back). These raise your first-try success rate enormously — but you still
validate, because "valid JSON" is not the same as "matches *your* schema".

### Validate against a schema

Use a real validator (Zod, JSON Schema, Pydantic). Check:

- **Required fields** are present,
- **Types** match (a number is a number, not \`"42"\`),
- **Enums** are within the allowed set,
- **Shapes** of nested objects and arrays.

Collect *all* errors so a repair retry can fix everything at once.

### Repair retries

When validation fails, the most effective retry feeds the error back:
"Your previous output was missing \`email\`; return the corrected JSON only."
Bound this with a small budget (2–3 tries) so a stubborn input can't run up cost.

### Lower the temperature

Extraction wants determinism. Temperature 0 makes the same input yield the same
object, which is what you want for tests and reproducibility.

### Why this is foundational

Tool calling (Lab 6), agents (Lab 7), and evaluation (Lab 10) all depend on the
model returning machine-readable structure. Master this loop and the rest of AI
Labs becomes 'structured output with extra steps'.
`.trim(),

  challenge: {
    promptMD: `
Extend the extractor to a schema the demo does not ship with: a **job posting**
with \`title\` (required), \`company\` (required), \`remote\` (boolean),
\`seniority\` (one of junior / mid / senior), and \`skills\` (string array).

Think through:

1. What does the prompt need so the model fills \`seniority\` from a fixed set?
2. Which fields are most likely to be missing, and how should the retry recover?
3. How would you make \`skills\` reliably an array and never a comma-joined string?
`.trim(),
    hints: [
      "Enumerated fields (junior/mid/senior) belong in the schema description AND the prompt — list the allowed values explicitly.",
      "For arrays, say 'return an array of strings' and validate `Array.isArray`; on failure, retry asking it to split the string.",
      "Make required fields the ones a downstream system truly cannot proceed without; everything else optional keeps retries rare.",
    ],
    expectedApproachMD: `
A strong answer treats the schema as the contract and the loop as the reliability
mechanism:

- Define the fields with types and a **required** flag; encode \`seniority\` as an
  enum and state the allowed values in both the schema description and the prompt.
- Generate at **temperature 0** in **JSON mode** for a high first-try rate.
- **Parse** defensively (strip fences, take the first object), then **validate**:
  required present, correct types, \`seniority\` ∈ the enum, \`skills\` is a string
  array.
- On failure, **retry with the specific error** fed back, capped at 2–3 attempts,
  then surface a clean error if still invalid.

This is the same generate-parse-validate-retry loop the demo runs — only the
schema changed, which is exactly the point: the machinery is reusable.
`.trim(),
  },

  interviewQuestions: [
    {
      id: "so-q1",
      question: "Why isn't 'ask the model for JSON' enough on its own?",
      difficulty: "Beginner",
      answerMD:
        "Models generate plausible text, not guaranteed-valid data. Even when asked for JSON they may add code fences, a chatty preamble, a trailing comma, or omit a required field. So you must **parse** (recover and `JSON.parse` the object, tolerating surrounding noise), **validate** (required fields + types + enums against your schema), and **retry** on failure. Reliability comes from that loop, not from the single request.",
      keyPoints: [
        "Models optimise for plausible text, not valid structure",
        "Common failures: fences, preamble, trailing commas, missing fields",
        "Parse defensively, then validate against a schema",
        "Bounded retries make it reliable",
      ],
      followUps: [
        "How would you feed a validation error back to the model?",
        "What temperature do you use for extraction and why?",
      ],
    },
    {
      id: "so-q2",
      question: "What is JSON mode / function calling, and how does it help?",
      difficulty: "Intermediate",
      answerMD:
        "JSON mode constrains decoding so the model can only emit syntactically valid JSON, eliminating most parse errors. Function/tool calling goes further: you supply a schema and the API returns arguments already shaped to it. Both dramatically raise first-try success and reduce retries, but neither guarantees the output matches *your* semantics (right enum values, sensible numbers), so you still validate against your own schema before trusting the data.",
      keyPoints: [
        "JSON mode = guaranteed syntactic validity",
        "Function calling = schema-shaped arguments from the API",
        "Both cut parse failures and retries",
        "Still validate against your schema for semantic correctness",
      ],
      followUps: [
        "Where does function calling break down for complex nested schemas?",
        "How do you validate enums and ranges the API can't enforce?",
      ],
    },
    {
      id: "so-q3",
      question: "How do you validate an LLM's structured output in production?",
      difficulty: "Intermediate",
      answerMD:
        "Use a real schema validator (Zod, JSON Schema, Pydantic) as the single source of truth. Check required fields are present, types are correct, enums are within range, and nested shapes match. Collect *all* violations rather than failing on the first so a repair retry can fix everything at once. Only validated data crosses into the rest of the system; invalid data triggers a bounded retry or a safe fallback, never a silent pass-through.",
      keyPoints: [
        "One schema drives both the prompt and validation",
        "Check presence, types, enums, and nested shapes",
        "Aggregate all errors for a single effective repair",
        "Gate downstream code on validation",
      ],
      followUps: [
        "How do you keep the prompt schema and validator in sync?",
        "What do you do when validation keeps failing?",
      ],
    },
    {
      id: "so-q4",
      question: "Design a retry policy for structured output.",
      difficulty: "Advanced",
      answerMD:
        "Wrap generate-parse-validate in a loop with a small budget (2–3 attempts). On each failure, classify it: a parse error suggests turning on JSON mode or strengthening the format instruction; a validation error should be fed back verbatim ('missing `email`; return corrected JSON only') so the model repairs precisely. Add jitter/backoff for transient provider errors, lower temperature for determinism, and after the budget is exhausted return a typed error or a safe default. Log attempts and failure types so you can tune the prompt over time.",
      keyPoints: [
        "Bounded budget caps cost and latency",
        "Classify parse vs validation failures and respond differently",
        "Feed the exact error back for a targeted repair",
        "Deterministic settings + observability for tuning",
      ],
      followUps: [
        "How do you prevent a poison input from always exhausting retries?",
        "How would you A/B two prompts by first-try validity rate?",
      ],
    },
    {
      id: "so-q5",
      question:
        "How would you extract many records from a long document reliably?",
      difficulty: "Advanced",
      answerMD:
        "Chunk the document (Lab 4), extract per chunk against the schema, then merge and de-duplicate. Keep each call small so the model stays accurate and JSON stays short. Validate every partial result, retry the failures individually, and reconcile overlaps (same record found in two chunks) with a stable key. Stream results as they finish for responsiveness, and track per-chunk success rates so you can spot a chunk size or prompt that hurts validity.",
      keyPoints: [
        "Chunk, extract per chunk, then merge + de-dupe",
        "Small calls keep accuracy and JSON size manageable",
        "Validate and retry each partial independently",
        "Reconcile overlaps with a stable key",
      ],
      followUps: [
        "How do you de-duplicate records found in overlapping chunks?",
        "How would you parallelise extraction without hitting rate limits?",
      ],
    },
  ],
};
