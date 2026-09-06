# Compile Ready — Technical Design Document

> **Scope & method.** This document describes the **currently implemented** Compile Ready
> (ElevateIQ) system, reconstructed by inspecting the actual repository. Every file path,
> function name, model, table, and configuration value below is taken from the codebase as it
> exists today. Where something is *not* implemented, it is called out explicitly as
> **FUTURE / NOT IMPLEMENTED**. No application code was modified to produce this document.
>
> Primary source areas inspected: `services/ai/*`, `features/adaptive-interview/*`,
> `features/panel-interview/*`, `services/mocks.ts`, `app/(app)/mock/*`,
> `app/actions/adaptive-mock.ts`, `app/api/mock/[id]/message/route.ts`, `prisma/schema.prisma`,
> `lib/env.ts`, `lib/current-user.ts`, `lib/validation.ts`, `services/ai-labs/usage.ts`.

---

## 1. Executive Summary

**What Compile Ready does.** Compile Ready is the interview-preparation surface of ElevateIQ, an
AI-powered career platform for software engineers. Its flagship capability is an **Adaptive Mock
Interview**: an AI interviewer asks one question at a time across a chosen track (DSA, System
Design, Low-Level Design, or Behavioral), silently evaluates each answer against a role- and
seniority-calibrated competency rubric, adapts the next question to the candidate's weak spots, and
ends with a detailed scorecard plus a learning plan. Alongside it are a **Classic single-track
interview** (free-form streamed Q&A), an AI answer-review path, and a Mock **Panel** interview.

**Target users.** Software engineers (junior → staff+) preparing for technical interviews who want
realistic, adaptive practice with actionable, evidence-based feedback rather than static question
lists.

**Core problem solved.** Static question banks don't tell a candidate *where they actually stand* or
*what to do next*. Compile Ready closes that loop: it scores each answer against an explicit rubric,
detects competency gaps, and turns those gaps into a targeted question path and concrete learning
recommendations — a personalized, measurable practice loop.

**Why AI is used.** Open-ended interview answers cannot be graded by pattern matching alone.
An LLM is used for two bounded jobs: (1) **evaluation** — grading a free-text answer against a
rubric and extracting evidence/strengths/gaps as structured JSON; and (2) **question generation** —
producing the single next question targeting a specific competency, difficulty, and "kind"
(probe / follow-up / advance). Crucially, **the AI is wrapped by deterministic logic**: a pure
planner selects *what* to ask next and a pure aggregator computes the final scorecard, so the
product remains correct, testable, and fully functional even with **no AI configured** (a
deterministic heuristic evaluator + a laddered question bank take over).

---

## 2. Current System Architecture

### 2.1 Technology stack (from `package.json`)

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router, RSC + Server Actions) | `^14.2.15` |
| UI runtime | React | `^18.3.1` |
| Language | TypeScript | strict |
| Styling | Tailwind CSS + shadcn/ui | `^3.4.13` |
| ORM | Prisma Client | `^5.20.0` |
| Database | PostgreSQL | (optional at runtime) |
| Auth | NextAuth / Auth.js | `5.0.0-beta.22` |
| LLM SDK | `openai` (AzureOpenAI + OpenAI) | `^4.68.4` |
| Validation | Zod | `^3.23.8` |
| Telemetry | `applicationinsights` (optional, lazy) | `^2.9.5` |
| Tests | Vitest | run via `npm test` |

### 2.2 Frontend

- **Next.js App Router**, mostly **React Server Components**. Interview pages are
  `export const dynamic = "force-dynamic"` (`app/(app)/mock/[id]/page.tsx`,
  `app/(app)/mock/page.tsx`).
- Client interactivity is isolated to a few `"use client"` components:
  `features/adaptive-interview/components/adaptive-interview.tsx` (turn loop, progress, staged
  loading), `components/mock/chat.tsx` (classic streamed chat).
- The scorecard (`adaptive-scorecard.tsx`) and the progress trend (`adaptive-progress.tsx`) are
  **server components** — rendered on the server from persisted state.
- Design system: Tailwind + shadcn/ui primitives (`components/ui/*`).

### 2.3 Backend

There is **no separate backend service** — it is a **modular monolith** inside Next.js:

- **Server Actions** (`"use server"`) for mutations: `app/actions/adaptive-mock.ts`
  (`startAdaptive`, `submitAdaptiveAnswerAction`, `finalizeAdaptiveAction`), `app/actions/mock.ts`.
- **Route Handlers** for streaming: `app/api/mock/[id]/message/route.ts` (classic streamed reply).
- **Feature modules** own domain logic: `features/adaptive-interview/*` (framework, planner,
  evaluator, interviewer, scorecard, service).
- **Service layer** owns cross-cutting concerns: `services/ai/*` (AI gateway, reliability,
  telemetry, prompts) and `services/mocks.ts` (persistence).

### 2.4 Database

- **Prisma + PostgreSQL** (`prisma/schema.prisma`, `datasource db` → `env("DATABASE_URL")`).
- The system is **DB-optional**. `lib/env.ts` exposes `isDbConfigured = Boolean(env.databaseUrl)`.
  When unset, `services/mocks.ts` transparently swaps Postgres for an **in-memory `Map` on
  `globalThis`** ("guest mode"), and `lib/current-user.ts` returns a `LOCAL_GUEST_ID`. This makes
  the entire adaptive flow runnable locally and in demo deployments with zero infrastructure.
- Adaptive-interview state is stored in the **`MockInterview.summary` JSON column** — no schema
  migration was required to add adaptive interviews.

### 2.5 Azure services

- **Azure OpenAI** — the LLM provider (`services/ai/client.ts`). Supports both the classic
  `api-version` surface and the newer versionless **`/openai/v1`** surface
  (`*.services.ai.azure.com`), auto-detected.
- **Azure App Service (Linux, Node)** — deployment target. Source-zip deploy; Azure **Oryx**
  rebuilds on upload (`npm ci && prisma generate && next build`).
- **Azure Application Insights** — optional observability sink
  (`APPLICATIONINSIGHTS_CONNECTION_STRING`), consumed by `services/ai/telemetry.ts`.
- **PostgreSQL** — Azure Database for PostgreSQL (or Neon) via `DATABASE_URL`.

### 2.6 AI services (internal composition)

All LLM traffic funnels through **one seam**:

```
call site → services/ai/completion.ts (runChatCompletion / runChatCompletionStream)
          → services/ai/reliability.ts (timeout, retry, fallback, token budget)
          → services/ai/client.ts     (getAzureClient → openai SDK)
          → services/ai/telemetry.ts  (recordAiCall → console + App Insights)
```

Prompt text lives in prompt-builder modules (`services/ai/prompts.ts`,
`features/adaptive-interview/ai/prompts.ts`); prompt **versions** are centralized in
`services/ai/prompt-versions.ts`.

### 2.7 External dependencies

- Azure OpenAI (LLM inference) — **only hard external AI dependency, and it is optional.**
- Optional OAuth providers: GitHub / Google / LinkedIn (Auth.js).
- Optional transactional email (Resend or SMTP) for password reset.
- Optional Application Insights package (dynamically imported; app works without it installed).

### 2.8 Deployment architecture

- **Source-zip → Azure App Service.** The repo is zipped **without** `node_modules`, `.next`, or
  `.env` (see `compileready-deploy-*.zip` artifacts; ~4 MB). Oryx runs the `build` script
  (`prisma generate && next build`). Startup runs the Next.js server.
- **Config is environment-driven.** No secrets are bundled; all configuration is via App Service
  Application Settings (see §7 and the `.env.example`).
- **Graceful degradation is a first-class deploy mode**: the app boots and serves the adaptive
  interview even with no `DATABASE_URL` and no Azure OpenAI keys.

### 2.9 ASCII architecture diagram (current)

```
                         ┌───────────────────────────────────────────────┐
                         │                  Browser (SPA/RSC)             │
                         │  /mock  /mock/[id]  (adaptive-interview.tsx)   │
                         └───────────────┬───────────────────────────────┘
                                         │ HTTPS
                    ┌────────────────────▼─────────────────────────────────┐
                    │            Azure App Service (Next.js 14)             │
                    │                                                       │
                    │  RSC pages ── Server Actions ── Route Handlers        │
                    │  app/(app)/mock/*   app/actions/adaptive-mock.ts      │
                    │                     app/api/mock/[id]/message         │
                    │        │                    │                         │
                    │        ▼                    ▼                         │
                    │  features/adaptive-interview/service.ts               │
                    │   ┌─────────────┬───────────────┬─────────────────┐   │
                    │   │ competencies│ planner (pure)│ scorecard (pure)│   │
                    │   │  framework  │ selectNext    │ buildScorecard  │   │
                    │   └─────┬───────┴──────┬────────┴─────────────────┘   │
                    │         │ ai/evaluator │ ai/interviewer               │
                    │         ▼              ▼                              │
                    │  services/ai/completion.ts  ── services/mocks.ts      │
                    │   reliability │ telemetry        (Prisma | memStore)  │
                    └───────┬───────────────┬───────────────────┬──────────┘
                            │               │                   │
                   ┌────────▼──────┐ ┌──────▼────────┐   ┌──────▼─────────┐
                   │ Azure OpenAI  │ │ App Insights  │   │  PostgreSQL     │
                   │ (chat compl.) │ │ (AiCall evt)  │   │  (or in-memory) │
                   └───────────────┘ └───────────────┘   └────────────────┘
                    optional/opt-in    optional            optional
```

---

## 3. End-to-End Mock Interview Flow

This traces one complete **adaptive** interview. Each step lists Component/file, Function/API,
Input, Processing, Output, DB interaction, and AI interaction.

### Step 0 — Landing / configuration

- **File:** `app/(app)/mock/page.tsx` (RSC).
- **Function:** renders the featured "Adaptive interview" card with a `<form action={startAdaptive}>`
  containing `track` and `seniority` selects.
- **Input:** none (GET). **Processing:** `getUserId()`; `listRecentMocks(userId, 6)` for the recent
  list. **Output:** HTML form. **DB:** read recent mocks (or memStore). **AI:** none.
- Note: the adaptive card is **ungated** ("Running on the built-in evaluator" if Azure absent); the
  classic 4-track section is **Azure-gated** (`disabled={!isAzureConfigured}`).

### Step 1 — User starts interview

- **File:** `app/actions/adaptive-mock.ts` → `startAdaptive(formData)` (`"use server"`).
- **Input:** `FormData { track, seniority, slug? }`.
- **Processing:** `getUserId()` (redirect to `/mock` if null); `trackKeySchema.parse` +
  `senioritySchema.parse` (`lib/validation.ts`); optional `buildProblemContext(slug)`; calls
  `startAdaptiveInterview(...)`; `redirect('/mock/{id}')`.
- **AI:** indirectly (see Step 2). **DB:** creates a MockInterview row (Step 2).

### Step 2 — Question selection (opening) + AI interviewer

- **File:** `features/adaptive-interview/service.ts` → `startAdaptiveInterview(args)`.
- **Processing:**
  1. `getFramework(track, seniority)` (`competencies.ts`) → resolved rubric (competencies,
     normalized weights, `plannedQuestions`, `baselineDifficulty`).
  2. `selectNext(framework, [])` (`planner.ts`) → `AdaptivePlan` (first target competency = highest
     weight unknown, `kind:"probe"`, difficulty = baseline).
  3. `generateAdaptiveQuestion({...})` (`ai/interviewer.ts`) → the question text.
  4. `describeSelection(kind, focusName, {first:true})` (`copy.ts`) → candidate-safe reason
     (**never a score**).
  5. Builds `AdaptiveSummary` (`version:1`, `status:"active"`, `questions:[Q1]`, `evaluations:[]`,
     `promptVersions`) and the intro transcript bubble via `buildIntro`.
- **AI interaction:** `generateAdaptiveQuestion` → `runChatCompletion` (`operation:"adaptive.question"`,
  temp `0.8`, `maxTokens 300`, `response_format json_object`, prompt version
  `adaptive-interviewer@2026-02`). Falls back to `heuristicQuestion` (laddered question bank) if
  Azure is unconfigured or output is unusable.
- **Output:** `{ id }`. **DB:** `createMock(...)` → Postgres row **or** memStore entry, with
  `mode:"adaptive"`, `transcript`, `summary`.

### Step 3 — Candidate answer submission

- **File:** `adaptive-interview.tsx` (client) → calls `submitAdaptiveAnswerAction(id, message)`.
- **File:** `app/actions/adaptive-mock.ts` → `submitAdaptiveAnswerAction(id, message)`.
- **Input:** `id`, free-text `message`.
- **Processing:** auth + ownership check (`mock.userId !== userId` → throw); non-empty check;
  `message.trim().slice(0, 4000)`; optional problem context; calls `submitAdaptiveAnswer(mock,
  message, {problemTitle})`; `revalidatePath('/mock/{id}')`.
- **DB:** `getMock(id)` read. **AI:** indirect (Steps 4–6).

### Step 4 — AI evaluation (hidden from candidate)

- **File:** `features/adaptive-interview/ai/evaluator.ts` → `evaluateAnswer(args)` (called from
  `service.ts` `submitAdaptiveAnswer`).
- **Input:** `{ track, seniority, questionIndex, targetCompetencyId, difficulty, question, answer }`.
- **Processing:**
  1. Resolve target competency + up to 2 adjacent competencies.
  2. `buildEvaluatorPrompt(...)` (`ai/prompts.ts`) → `{system, user}` embedding the rubric and the
     strict JSON `EVAL_OUTPUT_CONTRACT`.
  3. `runChatCompletion` (`operation:"adaptive.evaluate"`, temp `0.2`, `maxTokens 900`,
     `response_format json_object`, prompt version `adaptive-evaluator@2026-02`).
  4. `extractJson` (strip ``` fences) → `JSON.parse` → `answerEvaluationSchema.safeParse` (Zod).
  5. Filter assessments to valid competency ids; guarantee the target competency is present
     (heuristic fill-in if the model omitted it); clamp `score` 0–100 and `confidence` 0–1.
- **Output:** a validated `AnswerEvaluation` (`assessments[]`, `aiGenerated:true`,
  `promptVersion`). **On any failure** (unconfigured, parse error, transient error) →
  `heuristicEvaluateAnswer` (deterministic, `aiGenerated:false`, `promptVersion:"heuristic@2026-02"`).
- **DB:** none yet (evaluation is appended in memory, persisted in Step 6). **AI:** yes (or heuristic).
- **Important:** the per-answer score is **never returned to the client** here.

### Step 5 — Competency detection + adaptive next-question selection

- **File:** `features/adaptive-interview/planner.ts` → `selectNext(framework, evaluations)` (pure).
- **Processing:**
  1. `aggregateState` → per-competency **confidence-weighted** score, aggregate confidence,
     `timesAssessed`, matched concepts, gaps.
  2. `detectGaps` → **unknown** competencies (never assessed) sorted by weight, then **weak**
     competencies (`score < WEAK_THRESHOLD=65`) sorted by `weight × deficit`.
  3. Repetition guard: skip a competency targeted `>= MAX_CONSECUTIVE_SAME (2)` times in a row.
  4. `nextDifficulty` → adjust ±1 from baseline based on the last target-competency score
     (`>= STRONG_THRESHOLD 75` → harder; `<= LOW_THRESHOLD 45` → easier).
  5. `kind` = `follow_up` (same competency as last target and confidence ≥ 0.4), else `probe`;
     if **no gaps remain**, `advance` on the highest-weight competency at raised difficulty.
  6. When `answered >= plannedQuestions` → `{ done:true }`.
- **Output:** `AdaptivePlan { done, targetCompetencyId, difficulty, kind, rationale }`. The
  `rationale` may mention scores but is **only for logs** — it is never shown to the candidate.

### Step 6 — Next question generation + persistence

- **File:** `service.ts` `submitAdaptiveAnswer` (continued).
- **Processing:** if `plan.done`, append a closing assistant message ("Click **Finish & view
  scorecard**…"); else `generateAdaptiveQuestion({...})` → append the new `AskedQuestion` and format
  the transcript bubble via `formatQuestionMessage` ("**Question X of Y** · _focus_ … _↳ reason_").
  Build `SubmitResult` with progress + next question + candidate-safe `reason` — **no scores**.
- **Output:** `SubmitResult { question, assistantMessage, done, answered, planned, questionNumber,
  focus, reason }`. **DB:** `saveMockState(id, transcript, nextSummary)` persists transcript +
  evaluations together (Postgres or memStore). **AI:** `generateAdaptiveQuestion` (or heuristic).
- Steps 3–6 repeat until the planner returns `done`.

### Step 7 — Interview completion + final scorecard

- **File:** `app/actions/adaptive-mock.ts` → `finalizeAdaptiveAction(id)` →
  `service.ts` `finalizeAdaptiveInterview(mock)`.
- **Processing:** idempotent (returns existing scorecard if already completed);
  `buildScorecard(framework, evaluations, questions)` (`scorecard.ts`, pure):
  - per-competency scores + up to 3 evidence quotes + gaps;
  - **overall** = weight-normalized average over **assessed** competencies;
  - aggregate **confidence** = mean of assessed confidences;
  - **strengths** = competencies `>= STRONG_THRESHOLD (75)`; **weaknesses** = `detectGaps` output;
  - `recommendedTopics` = weakest competencies mapped to `COMPETENCY_TOPICS` + `TRACK_LEARNING_HREF`;
  - `answeredCount`, `plannedCount`, and the `path[]` (why each question was chosen, via
    `describeSelection`).
- **Output:** `AdaptiveScorecard`. **DB:** `saveMockSummary(id, {status:"completed", scorecard})`.
  **AI:** none (pure aggregation of already-produced evaluations).

### Step 8 — Rendering the scorecard + learning recommendations + progress

- **File:** `app/(app)/mock/[id]/page.tsx` (RSC). When `mock.mode==="adaptive"` and
  `summary.status==="completed"`, it renders `AdaptiveScorecardView` (readiness hero, "Why this
  score?" evidence, adaptive path, confidence explanation, Practice / Learn / Retake actions) and
  `AdaptiveProgress` (score-over-time trend from `listAdaptiveScores(userId, track)`).
- **Learning loop:** competency gaps → `recommendedTopics` with per-track hrefs
  (`/learning/dsa`, `/learning/system-design`, `/learning/lld`; behavioral → `/resources`).
- **DB:** `getMock(id)` + `listAdaptiveScores(userId, trackKey)`. **AI:** none.

```
start ─▶ getFramework ─▶ selectNext(probe) ─▶ generateQuestion ─▶ createMock
  │                                                                   │
  ▼  (per answer)                                                     ▼
submitAnswer ─▶ evaluateAnswer(hidden) ─▶ selectNext(gap) ─▶ generateQuestion ─▶ saveMockState
  │                                                                   │
  └────────────── repeat until planner.done ◀────────────────────────┘
                                   │
                                   ▼
                     finalize ─▶ buildScorecard ─▶ saveMockSummary ─▶ render scorecard + learning
```

---

## 4. AI Architecture — Detailed

### 4.A AI client / gateway

**File:** `services/ai/client.ts`.

- **How the model is called.** `getAzureClient()` returns a cached `openai` SDK client. Two surfaces
  are supported and auto-detected by `isV1Endpoint()`:
  - **Versionless v1** (`*.services.ai.azure.com` or endpoint containing `/openai/v1`) → a standard
    `new OpenAI({ baseURL, apiKey })` with `baseURL = <endpoint>/openai/v1`. The **deployment name
    is passed as `model`** on each request.
  - **Classic** → `new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment })`.
  - Override via `AZURE_OPENAI_API_STYLE = "v1" | "classic"`.
- **Authentication.** API-key based: `AZURE_OPENAI_API_KEY` + `AZURE_OPENAI_ENDPOINT`. Read through
  `lib/env.ts`; `isAzureConfigured = Boolean(endpoint && apiKey)`. When unconfigured,
  `getAzureClient()` throws **`AiNotConfiguredError`** (a **non-transient** error, so callers'
  graceful-fallback paths run immediately).
- **Model configuration.** `MODEL = env.azureDeployment` (default `gpt-4o-mini`).
  `isReasoningModel()` detects the GPT‑5 / o‑series family via regex
  `(gpt-5|gpt5|o1|o3|o4|luna|sol|terra)` (override `AZURE_OPENAI_MODEL_FAMILY`).
- **Request construction / model shaping.** `tuneParams()` adapts params by family: reasoning models
  use `max_completion_tokens` (floored at 2048 to cover hidden reasoning tokens) and **drop
  `temperature`**; classic models use `max_tokens` + `temperature`. This lets identical call-site
  code target both old and new deployments.
- **Streaming.** Yes — `runChatCompletionStream` (see §4.C is evaluation; §3 classic reply). It sets
  `stream: true` and `stream_options: { include_usage: true }` to capture token usage at stream close.

### 4.B Prompt architecture

- **Where prompts live.**
  - Adaptive interview: `features/adaptive-interview/ai/prompts.ts`
    (`buildEvaluatorPrompt`, `buildInterviewerPrompt`).
  - Classic mock / review / panel: `services/ai/prompts.ts`.
- **Structure.** Prompts are built as `{ system, user }` string pairs. The **system** message carries
  role, seniority calibration, the rubric (competency ids + descriptions + expected concepts), the
  question "kind" and difficulty instructions, and a **strict output contract**. The **user** message
  carries the task-specific payload (question + candidate answer for evaluation; target competency +
  already-asked questions for generation).
- **System vs user instructions.** Grading rules, the JSON schema shape, and "do not reveal scores /
  do not answer the question yourself" live in **system**; the concrete answer/question data lives in
  **user**. Both prompts require **`response_format: { type: "json_object" }`** and pure-JSON output
  (with a fence-stripping guard, `extractJson`).
- **Prompt versioning.** Centralized in `services/ai/prompt-versions.ts` (`PROMPT_VERSIONS`), e.g.
  `adaptiveEvaluator: "adaptive-evaluator@2026-02"`, `adaptiveInterviewer:
  "adaptive-interviewer@2026-02"`, plus `mockOpening/mockReply/reviewAnswer/panel*` and `aiLabsLlm`.
  The deterministic evaluator carries its own `"heuristic@2026-02"`.
- **How versions are tracked.** The version string is (1) stamped onto every persisted
  `AnswerEvaluation.promptVersion` and onto `AdaptiveSummary.promptVersions`, and (2) emitted with
  **every telemetry event** (`recordAiCall({ promptVersion })`). This lets a quality regression be
  correlated to a specific prompt revision.

### 4.C AI evaluation pipeline

**File:** `features/adaptive-interview/ai/evaluator.ts` (+ `ai/schemas.ts`, `ai/prompts.ts`).

```
candidate answer
  → context construction: target competency + up to 2 adjacent competencies (evaluator.ts)
  → rubric: competency ids, descriptions, expectedConcepts (competencies.ts)
  → prompt: buildEvaluatorPrompt → {system: rubric + EVAL_OUTPUT_CONTRACT, user: Q + answer}
  → model: runChatCompletion(op="adaptive.evaluate", temp 0.2, maxTokens 900, json_object)
  → structured output: raw JSON string
  → extractJson (strip ``` fences) → JSON.parse
  → schema validation: answerEvaluationSchema.safeParse (Zod)  ── fail ▶ heuristic fallback
  → sanitation: keep valid competency ids; ensure target present; clamp score 0-100, conf 0-1
  → evidence extraction: assessment.evidence[] (verbatim-ish quotes from the answer)
  → competency scoring: assessment.score (0-100 interview-readiness) per competency
  → confidence: assessment.confidence (0-1, lower for short/vague answers)
  → persistence: appended to AdaptiveSummary.evaluations → saveMockState (mocks.ts)
```

- **Structured/validated output.** The Zod `competencyAssessmentSchema` requires `competencyId`,
  `score` (0–100), `confidence` (0–1), and defaults `matchedConcepts/evidence/strengths/gaps` to
  `[]`. `answerEvaluationSchema` requires `assessments.min(1)`.
- **Deterministic fallback (`heuristicEvaluateAnswer`).** No I/O, fully reproducible. Score =
  `100 × (0.7 × conceptCoverage + 0.3 × depth)`, where coverage = fraction of the competency's
  `expectedConcepts` literally referenced and depth ramps from 0 (≤8 words) to 1 (~90 words).
  Confidence rises with substance + matches. This powers unconfigured/guest environments and makes
  the golden-dataset tests hermetic.
- **Evidence discipline.** The prompt instructs the model to base evidence strictly on what the
  candidate said ("do not invent quotes"). Evidence surfaces only in the **final scorecard**, never
  mid-interview.

### 4.D Adaptive interviewer

**Files:** `planner.ts` (pure decision logic), `ai/interviewer.ts` (generation), `service.ts`
(orchestration), `types.ts` (state).

- **Interview state.** The entire adaptive state is a single `AdaptiveSummary` object persisted in
  `MockInterview.summary`: `config {track, seniority}`, `status`, `plannedQuestions`,
  `questions: AskedQuestion[]`, `evaluations: AnswerEvaluation[]`, `scorecard`, `promptVersions`.
  The visible chat `transcript` is stored separately (same as classic interviews).
- **Competency tracking.** `aggregateState(framework, evaluations)` reduces all assessments into
  per-competency `CompetencyState` — a **confidence-weighted** running score, aggregate confidence,
  `timesAssessed`, matched concepts, and gaps.
- **Gap detection.** `detectGaps` returns **unknown** competencies first (never assessed, ordered by
  rubric weight) then **weak** competencies (`score < 65`), ordered by `weight × (65 − score)` so the
  most important, most-deficient gaps come first.
- **Next-question selection.** `selectNext` picks the first "pickable" gap (respecting the repetition
  guard); if none, it `advance`s the highest-weight competency. It returns `done:true` once
  `answered >= plannedQuestions` (junior 4, mid 5, senior/staff 6).
- **Follow-up generation.** `kind:"follow_up"` is chosen when the chosen competency equals the last
  target **and** its confidence ≥ 0.4; the interviewer prompt then receives the candidate's last
  answer and is told to "drill into the previous answer to close a specific gap."
- **Difficulty adaptation.** `nextDifficulty` starts at the seniority baseline
  (`easy/medium/medium/hard`) and moves **+1** if the last target score ≥ 75, **−1** if ≤ 45, clamped
  to `[easy, medium, hard]`.
- **Repetition prevention.** Two guards: (1) `consecutiveTargeting < MAX_CONSECUTIVE_SAME (2)` in the
  planner; (2) in `generateAdaptiveQuestion`, already-asked questions are passed to the prompt ("do
  NOT repeat"), and any normalized-duplicate model output is rejected in favor of a fresh bank
  question.

### 4.E AI reliability

**File:** `services/ai/reliability.ts`. Config is read from `process.env` **at call time** (per-env
overridable, test-friendly). All error classes/labels are **PII-free**.

| Concern | Implementation | Default / env |
|---|---|---|
| **Timeout** | `withTimeout` uses an `AbortController`; on expiry it **aborts the socket** and rejects `AiTimeoutError` | `AI_REQUEST_TIMEOUT_MS = 30000` |
| **Retry** | Bounded per-model retries on transient errors (`runResilient`) | `AI_MAX_RETRIES = 2` |
| **Exponential backoff** | `backoffDelay` = **full-jitter**: `random(0, base × 2^attempt)` | `AI_RETRY_BASE_MS = 500` |
| **429/5xx handling** | `isTransientError` → retry on 408/409/425/429, any 5xx, network codes (`ECONNRESET`…), `APIConnectionError` | — |
| **Fallback model** | After the primary's attempts are exhausted, `runResilient` retries the whole cycle on the fallback deployment | `AZURE_OPENAI_FALLBACK_DEPLOYMENT` (unset = none) |
| **Token limits** | `assertInputWithinBudget` (pre-dispatch, ~4 chars/token estimate) throws `AiInputTooLargeError`; `clampOutputTokens` caps the output budget | `AI_MAX_INPUT_TOKENS = 12000`, `AI_MAX_OUTPUT_TOKENS = 2000` |
| **Cost controls** | Per-user daily request caps (`DAILY_AI_LIMIT = 50`; AI Labs `AI_LABS_DAILY_LIMIT = 100`) via in-memory buckets (`services/ai-labs/usage.ts`) | — |
| **Graceful degradation** | Non-transient errors surface immediately; each AI call site has a deterministic fallback (heuristic evaluator, question bank, seed opening, or HTTP 503) | — |

- **Non-transient = fail fast.** Auth errors, `AiNotConfiguredError`, and `AiInputTooLargeError` are
  never retried and never trigger fallback.
- **Streaming caveat.** Reliability covers stream **establishment** only; an in-flight stream is
  never restarted (documented in `runResilient`).
- **`ResilientStats`** (`retryCount`, `fallbackUsed`, `modelUsed`) is mutated in place so telemetry
  is accurate even when the call ultimately throws.

### 4.F AI observability

**File:** `services/ai/telemetry.ts`. Single sink: **`recordAiCall(t)`**, called on every success and
failure from `completion.ts`.

- **Two destinations, both best-effort / non-throwing:**
  1. **Always-on structured log** — `console.info('[ai.telemetry] ' + JSON.stringify(t))`. Azure App
     Service captures stdout, so this is queryable in **Log Analytics** even without App Insights.
  2. **Application Insights (optional)** — enabled by `APPLICATIONINSIGHTS_CONNECTION_STRING`. The
     `applicationinsights` SDK is **dynamically imported** and lazily initialized (so the app never
     hard-depends on it). It emits a custom **`AiCall`** event + `AiCallLatencyMs` /
     `AiEstimatedCostUsd` metrics. `setAutoCollectConsole(false)` prevents feedback loops.
- **Correlation IDs.** `newCorrelationId()` (`crypto.randomUUID` with a hex fallback); a caller may
  pass its own `meta.correlationId`.
- **Fields emitted** (`AiCallTelemetry`): `operation`, `model` (the deployment that actually
  served), `promptVersion`, `correlationId`, `latencyMs`, `success`, `retryCount`, `fallbackUsed`,
  `streamed`, `inputTokens?`, `outputTokens?`, `estimatedCostUsd?`, `errorType?` (PII-free label such
  as `timeout`, `http_429`, `input_too_large`).
- **Cost.** `estimateCost(usage, model)` (`services/ai-labs/usage.ts`) applies per‑1K‑token pricing.
- **Where it's visible in Azure.** App Insights → **Logs (Kusto)**:
  `customEvents | where name == "AiCall"` (properties/measurements), or
  **Metrics** → `AiCallLatencyMs` / `AiEstimatedCostUsd`. Without App Insights: **Log Analytics** on
  the App Service, filtering for the `[ai.telemetry]` prefix.
- **PII policy (enforced by construction).** Prompt text, candidate answers, and secrets are **never**
  passed into `recordAiCall` — only counts, durations, ids, and status labels. Prompt-builder modules
  embed answers into the request but **never log them**.

---

## 5. Data Model

### 5.1 Relational schema (`prisma/schema.prisma`, PostgreSQL)

Enums: `TrackKey { DSA, SYSTEM_DESIGN, LLD, BEHAVIORAL }`, `Difficulty { EASY, MEDIUM, HARD }`,
`ProgressStatus { TODO, ATTEMPTED, SOLVED }`.

| Model | Key fields | Purpose / relations |
|---|---|---|
| `User` | `id`, `email @unique`, `passwordHash?` | Owns interviews, submissions, progress, stories. |
| `Problem` | `slug @unique`, `track`, `difficulty`, `statementMD`, `judgeSpec Json?`, `solution Json?` | Content catalog (also backed by `content/*.json`). |
| `Submission` | `userId`, `problemId`, `aiFeedback Json`, `score?` | Stored AI code reviews. |
| `Progress` | `@@id([userId, problemId])`, `status`, `lastScore` | Per-problem progress + spaced-repetition `nextReview`. |
| **`MockInterview`** | `id`, `userId`, `trackKey`, `problemSlug?`, `mode` (default `"interview"`), **`transcript Json`**, **`summary Json?`**, `createdAt` | **The adaptive interview's home.** `@@index([userId])`. |
| `QuestionBookmark` / `QuestionProgress` | `userId`, `questionId` | Company Question Bank (content-keyed). |
| `StarStory` | STAR fields + `skills[]`, `leadershipPrinciples[]` | AI STAR Story Generator. |
| `PanelInterview` | `role`, `focus`, `status`, `transcript Json`, `result Json?` | Mock Panel interview. |

### 5.2 Adaptive interview entities (TypeScript, persisted as JSON in `MockInterview.summary`)

Defined in `features/adaptive-interview/types.ts`. **No dedicated tables** — the adaptive engine
stores its entire state in the pre-existing `summary` JSON column (with `isAdaptiveSummary` type
guard and `ADAPTIVE_SUMMARY_VERSION = 1` for forward-compat).

| Logical entity | Type | Fields (abridged) |
|---|---|---|
| **Interview** | `AdaptiveSummary` | `version`, `kind:"adaptive"`, `config{track,seniority}`, `status`, `plannedQuestions`, `questions[]`, `evaluations[]`, `scorecard`, `promptVersions{evaluator,interviewer}` |
| **Question** | `AskedQuestion` | `index`, `competencyId`, `difficulty`, `kind`, `text` |
| **Answer** | (chat) | stored as a `user` turn in `transcript`; not a separate record |
| **Evaluation** | `AnswerEvaluation` | `questionIndex`, `targetCompetencyId`, `difficulty`, `assessments[]`, `aiGenerated`, `promptVersion` |
| **Assessment (per competency)** | `CompetencyAssessment` | `competencyId`, `score` (0–100), `confidence` (0–1), `matchedConcepts[]`, `evidence[]`, `strengths[]`, `gaps[]` |
| **Competency (rubric)** | `Competency` | `id`, `name`, `description`, `expectedConcepts[]`, `questionBank{easy,medium,hard}` |
| **Framework (resolved rubric)** | `CompetencyFramework` | `track`, `seniority`, `plannedQuestions`, `baselineDifficulty`, `competencies[]`, `weights{}` (normalized to 1) |
| **Interview state (derived)** | `CompetencyState` | `score?`, `confidence`, `timesAssessed`, `matchedConcepts[]`, `gaps[]` |
| **Scores / Scorecard** | `AdaptiveScorecard` | `overallScore`, `confidence`, `competencyScores[]`, `strengths[]`, `weaknesses[]`, `recommendedTopics[]`, `aiGenerated`, `answeredCount?`, `plannedCount?`, `path?` |
| **Path step** | `ScorecardPathStep` | `questionNumber`, `competencyId`, `competencyName`, `kind`, `difficulty`, `reason` |
| **Learning rec** | `LearningRecommendation` | `competencyId`, `topic`, `reason`, `href?` |
| **Prompt versions** | registry | `services/ai/prompt-versions.ts` + stamped on each evaluation |
| **AI telemetry** | `AiCallTelemetry` | **not persisted in the DB** — emitted to console + App Insights (§4.F) |

**Relationships.** `User 1—* MockInterview`; a `MockInterview` (adaptive) `1—1 AdaptiveSummary`
(JSON) `1—* AskedQuestion` and `1—* AnswerEvaluation` `1—* CompetencyAssessment`; competencies are
static reference data keyed by `(track, competencyId)`.

---

## 6. Golden Dataset / AI Quality

**Files:** `features/adaptive-interview/golden/dataset.ts`,
`features/adaptive-interview/__tests__/golden.test.ts`.

- **Structure.** `GoldenCase { id, track, seniority, competencyId, difficulty, question, answer,
  quality: "strong" | "weak", expectedConcepts[], expectedScore: [min, max] }`.
- **Test cases.** `GOLDEN_CASES` currently holds **40 cases** across all four tracks and all four
  seniorities, with both `strong` and `weak` populations represented.
- **Expected concepts.** Each case lists lowercase phrases drawn from the target competency's
  `expectedConcepts`. For `strong` cases every listed concept **must appear verbatim** in the answer;
  the test asserts the evaluator **recalls every one**.
- **Expected score ranges.** `expectedScore` is an inclusive band; the regression asserts strong
  answers clear a floor (`STRONG_FLOOR = 50`) and weak answers stay under a ceiling
  (`WEAK_CEILING = 45`), and that **min(strong) > max(weak)** (population separation).
- **Regression tests (`golden.test.ts`).** Four suites: dataset integrity (30–50 cases, unique ids,
  both qualities), referential validity (valid competencies + well-formed bands), concept membership,
  and the evaluator regression (recall + score separation).
- **How evaluator changes are validated.** Tests run against the **deterministic heuristic
  evaluator** (`heuristicEvaluateAnswer`), so they are hermetic (no network) and deterministic —
  changing the heuristic's scoring or the competency `expectedConcepts` will fail the golden suite,
  catching silent quality regressions. (The LLM evaluator shares the same rubric and output schema,
  so schema/rubric drift is caught here too.)

---

## 7. Security

- **Authentication.** Auth.js / NextAuth v5 (`lib/auth.ts`); `lib/current-user.ts` `getUserId()`
  resolves the session user id, `LOCAL_GUEST_ID` in DB-less guest mode, or `null` for anonymous
  visitors in production (so auth gates behave normally).
- **Authorization.** Every mutation/reads on an interview enforces **ownership**:
  `mock.userId !== userId` → `notFound()` / thrown error (see `[id]/page.tsx`,
  `adaptive-mock.ts`, `message/route.ts`).
- **Input validation.** Zod at every boundary (`lib/validation.ts`): `mockMessageSchema`
  (`message` trimmed, 1–4000), `reviewRequestSchema` (≤ 20000), `adaptiveAnswerSchema`,
  `senioritySchema`, `trackKeySchema`, `aiLabsLlmSchema`. The adaptive action also hard-caps
  `message.slice(0, 4000)`.
- **Secrets.** All secrets via environment/App Settings (`AUTH_SECRET`, `AZURE_OPENAI_API_KEY`,
  `DATABASE_URL`, OAuth client secrets). None are bundled in the deploy zip; `.env` is excluded.
- **API protection.** Streaming route returns 401 (unauthenticated), 404 (not owner), 400 (invalid /
  wrong mode), 503 (`AiNotConfiguredError`), 500 (other). Server Actions are POST-only and
  auth-checked.
- **Rate limiting / cost caps.** Per-user daily request buckets (`DAILY_AI_LIMIT`,
  `AI_LABS_DAILY_LIMIT`) + per-request input/output token budgets (§4.E). **Note:** buckets are
  in-memory/per-instance (best-effort), not a distributed limiter — see §8.
- **Prompt-injection considerations.** The blast radius is bounded by design: model output is
  constrained to **JSON validated by Zod**, unknown competency ids are dropped, scores are clamped,
  and a duplicate/garbage question is replaced by a deterministic bank question. A candidate cannot
  make the interviewer reveal scores (system prompt forbids it and scores never travel to the client
  regardless of model output). Worst case, a malformed/hostile answer degrades to the heuristic path.
- **PII / data handling.** Candidate answers live only in the interview `transcript` (owned, access-
  controlled). **Telemetry never receives answer/prompt text** (§4.F). In guest mode nothing is
  persisted at all (in-memory only).
- **What must never be logged.** Prompt text, candidate answers, `AZURE_OPENAI_API_KEY`,
  `AUTH_SECRET`, `DATABASE_URL`, OAuth secrets, session tokens. `recordAiCall`'s type signature makes
  logging answer text structurally impossible.

---

## 8. Performance & Scalability

- **Current bottleneck: LLM latency.** Each adaptive turn is **two sequential LLM calls** on the
  request path (evaluate the prior answer, then generate the next question), each up to
  `AI_REQUEST_TIMEOUT_MS (30s)`. This dominates end-to-end turn latency.
- **Token usage.** Bounded per call: evaluator ≤ ~900 output tokens, interviewer ≤ 300, input capped
  at 12k. Prompts are compact (rubric + one answer), keeping cost/latency predictable (§10).
- **Database load.** Minimal and bounded: one `getMock` read + one `saveMockState` write per turn;
  one `saveMockSummary` at finalize; `listAdaptiveScores` on the scorecard page. All indexed by
  `userId`. The JSON `summary` column keeps writes to a single row.
- **Concurrent interviews.** Each turn is independent and stateless on the server (state lives in the
  DB row), so interviews scale horizontally with App Service instances. The constraint is **Azure
  OpenAI throughput (TPM/RPM quota)**, not app CPU.
- **Horizontal scaling.** The Next.js app is stateless per request → add App Service instances
  freely. **Caveat:** two pieces of state are **per-instance in memory** and do **not** share across
  instances — the guest-mode `memStore` and the daily usage/cost buckets. At >1 instance these must
  move to Postgres/Redis (see below).
- **At 10× traffic.** Likely fine with more App Service instances **provided Azure OpenAI quota is
  raised**; move the usage/rate-limit buckets to a shared store (Redis/Postgres) so caps are global.
- **At 100× traffic.** The synchronous two-call turn becomes the limiter under quota pressure. This is
  where **async processing** is warranted: evaluate answers on a **queue** (Azure Service Bus /
  Storage Queue) with a worker pool, decouple question generation from evaluation, add a **provisioned-
  throughput** Azure OpenAI deployment or multi-region fan-out, and cache/prewarm question generation.
- **When async/queues become required.** When (a) p95 turn latency from two serial LLM calls hurts
  UX, (b) Azure OpenAI 429s appear under load despite retry/fallback, or (c) cost control needs
  centralized accounting. None are needed at demo/low scale today.

---

## 9. Failure Scenarios

Format: **Failure → Detection → Recovery → User experience.**

| # | Failure | Detection | Recovery | User experience |
|---|---|---|---|---|
| 1 | **LLM timeout** | `withTimeout` aborts + throws `AiTimeoutError` (transient) | Retry w/ backoff, then fallback model; if still failing, **heuristic** evaluator / **bank** question | Interview continues; feedback is heuristic that turn — no error shown |
| 2 | **HTTP 429** | `isTransientError` (429) | Exponential backoff retries, then fallback deployment, then heuristic | Slightly slower turn; no failure surfaced |
| 3 | **HTTP 5xx** | `isTransientError` (5xx) | Same retry → fallback → heuristic chain | Same as above |
| 4 | **Invalid JSON from model** | `JSON.parse` throws in evaluator/interviewer `try/catch` | Caught → `heuristicEvaluateAnswer` / `heuristicQuestion` | Deterministic result that turn; seamless |
| 5 | **Schema validation failure** | `safeParse` returns `!success` | Fall back to heuristic (evaluator) / bank (interviewer) | Seamless |
| 6 | **Primary model unavailable** | Transient errors exhaust primary attempts | `runResilient` advances to `AZURE_OPENAI_FALLBACK_DEPLOYMENT`; `fallbackUsed` logged | Transparent; telemetry records the fallback |
| 7 | **Azure not configured** | `AiNotConfiguredError` (non-transient) | Immediate heuristic path (adaptive) or **503** (classic route) | Adaptive works fully on heuristic; classic shows "requires Azure" |
| 8 | **Database failure** | Prisma throws in `getMock`/`save*` | Propagates to the action/route error boundary | Action errors; **guest mode** (no DB) is unaffected (in-memory) |
| 9 | **Client disconnect (classic stream)** | Stream reader ends | `tee` persist branch still drains + `saveTranscript`; errors logged | Partial transcript saved; user can reload |
| 10 | **Input too large** | `assertInputWithinBudget` → `AiInputTooLargeError` (non-transient) | Fail fast (no retry/fallback); evaluator degrades to heuristic | No wasted retries; interview continues |
| 11 | **Duplicate submission / re-finalize** | `finalizeAdaptiveInterview` checks `status==="completed"` | **Idempotent** — returns existing scorecard | Re-clicking "Finish" is safe; no double scoring |
| 12 | **Model repeats a question** | Normalized dup check in `generateAdaptiveQuestion` | Replace with a fresh laddered bank question | Candidate never sees a repeated question |

---

## 10. Cost Model

- **Main cost drivers.** Azure OpenAI tokens on the **two LLM calls per turn** (evaluate + generate).
  Evaluation is the larger (≤ ~900 output tokens); generation is small (≤ 300).
- **Token consumption per turn (order of magnitude).** Input: rubric + one answer (a few hundred to
  ~1–2k tokens). Output: evaluate ≤ 900 + generate ≤ 300. Call it ~1–3k input + ~1.2k output/turn.
- **Cost per interview.** `plannedQuestions` = 4–6 turns. Using `services/ai-labs/usage.ts` pricing:
  - **`gpt-4o-mini`** (`$0.00015` in / `$0.0006` out per 1K): well **under ~US$0.02** for a full
    6-question interview.
  - **`gpt-4o` / GPT‑5 class** (`$0.005` in / `$0.015` out per 1K): roughly **~US$0.10–0.20** per
    interview.
  - **Heuristic mode:** **US$0.00** (no LLM calls).
- **Model selection.** `AZURE_OPENAI_DEPLOYMENT` (default `gpt-4o-mini`) sets the primary; an optional
  `AZURE_OPENAI_FALLBACK_DEPLOYMENT` handles overflow/outage. `priceFor()` classifies models
  (mini/flash vs 4o vs gpt‑5 vs default) for the cost estimate.
- **How token/cost limits work.** Hard input/output token budgets (`AI_MAX_INPUT_TOKENS`,
  `AI_MAX_OUTPUT_TOKENS`) clamp every request; per-user daily request caps (`DAILY_AI_LIMIT`,
  `AI_LABS_DAILY_LIMIT`) bound volume; `estimatedCostUsd` is emitted per call for monitoring.
- **Optimization strategies (available levers).** Prefer `gpt-4o-mini` for evaluation; keep the
  heuristic as the zero-cost default; shrink prompts (rubric already compact); consider batching
  evaluation into finalize for low-value turns; cache generated questions per (competency,
  difficulty); adopt provisioned throughput only at scale.

---

## 11. Architectural Trade-offs

Format: **Decision → Alternatives → Why chosen → Trade-off → When we'd change it.**

1. **Modular monolith vs microservices.** *Alt:* separate evaluation/interview services. *Why:*
   single Next.js deploy, shared types, one release; features isolated by folder
   (`features/*`, `services/*`). *Trade-off:* all scales together; no independent deploy. *Change
   when:* a component needs independent scaling/SLA (e.g. a heavy async evaluation worker at 100×).

2. **Structured content vs RAG.** *Alt:* embed corpus + vector retrieval to ground questions. *Why:*
   a curated, versioned competency framework + laddered question bank is deterministic, testable, and
   works offline; the rubric *is* the ground truth. *Trade-off:* less open-ended variety; authored
   content. *Change when:* we need company-specific or corpus-grounded questions with citations.
   **RAG is explicitly NOT implemented.**

3. **Deterministic workflow vs multi-agent.** *Alt:* multiple cooperating LLM agents. *Why:* a **pure
   planner** (`selectNext`) + **pure aggregator** (`buildScorecard`) around **single-purpose LLM
   calls** is predictable, cheap, unit-testable, and never loops unboundedly. *Trade-off:* less
   emergent behavior. *Change when:* interviews need genuinely multi-persona, tool-using reasoning.
   **Multi-agent is explicitly NOT implemented.**

4. **Sync vs async processing.** *Alt:* queue-based evaluation. *Why:* synchronous two-call turns are
   simplest and fine at current scale; state is a single DB row. *Trade-off:* turn latency = sum of
   two LLM calls; throughput tied to Azure quota. *Change when:* p95 latency or 429s under load
   (§8, 100×).

5. **LLM + deterministic logic (not LLM-only).** *Alt:* let the model both grade and choose the next
   question. *Why:* determinism where it matters (selection, aggregation, difficulty) + LLM only for
   fuzzy grading/wording; guarantees a working product with **no AI**. *Trade-off:* the framework must
   be authored/maintained. *Change when:* never fully — this is the core design principle.

6. **Single primary + optional fallback model.** *Alt:* always multi-model ensemble. *Why:* one cheap
   default (`gpt-4o-mini`) with a configurable fallback covers outages without ensemble cost/latency.
   *Trade-off:* no cross-model quality voting. *Change when:* quality demands ensembling or per-track
   model routing.

7. **SQL/relational (Prisma/Postgres) + JSON column.** *Alt:* a document DB or dedicated tables per
   entity. *Why:* relational for users/problems/progress; the adaptive state rides in a **JSON
   `summary` column** — zero migration, flexible schema evolution (`ADAPTIVE_SUMMARY_VERSION`).
   *Trade-off:* adaptive state isn't independently queryable/indexable. *Change when:* we need
   analytics/aggregation across evaluations (then normalize into tables).

8. **Azure Application Insights (optional) + always-on stdout telemetry.** *Alt:* a third-party APM or
   mandatory App Insights. *Why:* App Insights is native to the Azure deploy but **optional** (dynamic
   import); a structured `[ai.telemetry]` stdout line guarantees observability even without it.
   *Trade-off:* two code paths; estimated (not billed) cost. *Change when:* we need distributed
   tracing across services or precise billing reconciliation.

---

## 12. Current vs Future Architecture

### 12.1 Current production architecture

```
Browser ──▶ Azure App Service (Next.js monolith)
                 │  RSC + Server Actions + one streaming route
                 ├── features/adaptive-interview (framework/planner/scorecard = pure;
                 │      evaluator/interviewer = LLM with heuristic fallback)
                 ├── services/ai (completion → reliability → client → telemetry)
                 ├── services/mocks (Prisma | in-memory memStore)
                 ├──▶ Azure OpenAI      (optional; heuristic fallback if absent)
                 ├──▶ App Insights      (optional; stdout telemetry always on)
                 └──▶ PostgreSQL        (optional; guest mode if absent)
   Scale unit: App Service instances (stateless requests); state in the DB row.
   Limits: sync 2-call turns; per-instance memStore + usage buckets.
```

### 12.2 Evolution path for 10× / 100× scale

```
Browser / CDN
      │
      ▼
Azure App Service (N instances, autoscale)  ── shared Redis (rate limits, usage buckets, question cache)
      │  enqueue evaluation
      ▼
Azure Service Bus / Storage Queue ──▶ Evaluation Worker pool (KEDA-scaled)
      │                                   │  (evaluate answers async; write back to DB)
      ▼                                   ▼
PostgreSQL (normalize evaluations ──▶ read replicas)      Azure OpenAI
  + optional analytics tables                              ├─ provisioned throughput (PTU)
                                                           └─ multi-region / fallback routing
App Insights (distributed tracing, sampling, cost dashboards)

10×:  more App Service instances + raised Azure OpenAI quota + shared Redis for caps/cache.
100×: async evaluation via queue + workers, provisioned/multi-region OpenAI, normalized
      evaluation tables + read replicas, distributed tracing & sampling.
```

*(These are proposed; only §12.1 is implemented today.)*

---

## 13. Questions an Interviewer Will Ask (Principal-level)

For each: **what's being tested → strong answer (grounded in the implementation) → component/file →
trade-off.**

1. **How do you grade an open-ended answer reliably?** *(evaluation design)* — Rubric-anchored LLM
   call returning **Zod-validated JSON** (score/confidence/evidence/gaps), with unknown competency
   ids dropped and scores clamped; a deterministic heuristic backs it up. *`ai/evaluator.ts`,
   `ai/schemas.ts`.* *Trade-off:* authored rubric vs open-endedness.

2. **What happens when the LLM returns malformed output?** *(robustness)* — `extractJson` +
   `safeParse`; on failure we fall back to the heuristic, so a turn never breaks. *`ai/evaluator.ts`.*
   *Trade-off:* heuristic is less nuanced that turn.

3. **How do you keep scores hidden during the interview but rich at the end?** *(product + data flow)*
   — `SubmitResult` carries **no score fields**; per-answer scores live only in persisted
   `evaluations` and surface in `buildScorecard`. *`service.ts`, `scorecard.ts`, `copy.ts`.*
   *Trade-off:* candidates get less immediate signal (intentional).

4. **How does the "adaptive" part actually work?** *(adaptive systems)* — Pure `selectNext`:
   aggregate → detect gaps (unknown by weight, then weak by weight×deficit) → pick a non-repeated gap
   → set difficulty ±1 and kind (probe/follow_up/advance). *`planner.ts`.* *Trade-off:* deterministic
   rules vs learned policy.

5. **Why not a multi-agent system?** *(architecture judgment)* — Determinism, cost, testability;
   single-purpose LLM calls wrapped by pure logic never loop unboundedly. *`planner.ts`,
   `scorecard.ts`.* *Trade-off:* less emergent behavior.

6. **How do you prevent repeated questions?** *(state tracking)* — `consecutiveTargeting < 2` guard +
   passing asked questions to the prompt + rejecting normalized duplicates. *`planner.ts`,
   `ai/interviewer.ts`.* *Trade-off:* may fall back to a bank question.

7. **How do you handle Azure OpenAI 429s?** *(reliability)* — `isTransientError` → bounded retries
   with **full-jitter** backoff → fallback deployment → heuristic. *`reliability.ts`.* *Trade-off:*
   added latency under load.

8. **Why full-jitter backoff?** *(distributed systems)* — Avoids retry stampedes/thundering herd vs
   fixed/equal-jitter. *`backoffDelay` in `reliability.ts`.* *Trade-off:* non-deterministic delay
   (fine; retries are idempotent reads).

9. **How is a request timeout enforced end-to-end?** *(correctness)* — `AbortController` in
   `withTimeout` **aborts the socket** and rejects `AiTimeoutError`, normalizing aborted requests to
   timeouts. *`reliability.ts`.* *Trade-off:* in-flight streams aren't restarted.

10. **How do you bound cost/tokens?** *(cost control)* — Pre-dispatch input budget check
    (`assertInputWithinBudget`), output clamp (`clampOutputTokens`), per-user daily caps. *`reliability.ts`,
    `services/ai-labs/usage.ts`.* *Trade-off:* long answers get truncated budgets.

11. **What model do you use and how do you support new ones?** *(LLM ops)* — `AZURE_OPENAI_DEPLOYMENT`
    (default `gpt-4o-mini`); `isReasoningModel` + `tuneParams` shape params for GPT‑5/o-series
    (`max_completion_tokens`, no temperature) vs classic. *`client.ts`.* *Trade-off:* regex-based
    family detection (overridable).

12. **Classic vs v1 Azure endpoints — why two clients?** *(integration depth)* — GPT‑5 family lives on
    versionless `/openai/v1`; `isV1Endpoint` picks the standard OpenAI client w/ `baseURL`, else
    `AzureOpenAI` with `api-version`. *`client.ts`.* *Trade-off:* two code paths.

13. **What exactly do you log, and how do you avoid leaking PII?** *(observability + privacy)* —
    `recordAiCall` only accepts counts/labels/ids; answer/prompt text is structurally excluded; labels
    like `http_429` are PII-free. *`telemetry.ts`, `reliability.ts (errorLabel)`.* *Trade-off:* can't
    debug content from telemetry (by design).

14. **Where do you view AI telemetry in Azure?** *(operability)* — App Insights `customEvents |
    where name=="AiCall"` + `AiCallLatencyMs`/`AiEstimatedCostUsd` metrics; or Log Analytics on the
    `[ai.telemetry]` stdout line. *`telemetry.ts`.* *Trade-off:* estimated (not billed) cost.

15. **How do you correlate a failed evaluation to a prompt version?** *(quality ops)* — Every
    telemetry event and every stored `AnswerEvaluation` carries `promptVersion` from a central
    registry. *`prompt-versions.ts`.* *Trade-off:* manual version bumps.

16. **How do you know an evaluator change didn't regress quality?** *(testing)* — 40-case golden
    dataset asserts concept recall + strong/weak separation against the deterministic evaluator.
    *`golden/dataset.ts`, `golden.test.ts`.* *Trade-off:* covers the heuristic + rubric/schema, not
    live-LLM nuance.

17. **What runs with no AI configured?** *(graceful degradation)* — Everything: heuristic evaluator +
    laddered question bank + pure scorecard; `AiNotConfiguredError` routes to fallback immediately.
    *`evaluator.ts`, `interviewer.ts`, `client.ts`.* *Trade-off:* feedback is concept/depth based.

18. **Where is interview state stored and why JSON?** *(data modeling)* — In `MockInterview.summary`
    JSON (`AdaptiveSummary`, versioned), zero migration, flexible evolution. *`types.ts`,
    `schema.prisma`.* *Trade-off:* not independently queryable.

19. **How does the confidence-weighted score work?** *(scoring math)* — `aggregateState` averages
    per-answer scores weighted by confidence; overall is weight-normalized over assessed
    competencies. *`planner.ts`, `scorecard.ts`.* *Trade-off:* low-confidence answers move the score
    less (intended).

20. **How is difficulty adapted?** *(adaptive logic)* — From the seniority baseline, ±1 by the last
    target score vs thresholds 75/45, clamped. *`nextDifficulty` in `planner.ts`.* *Trade-off:*
    coarse 3-rung ladder.

21. **Idempotency of finalize / double submit?** *(correctness)* — `finalizeAdaptiveInterview`
    returns the existing scorecard if already completed. *`service.ts`.* *Trade-off:* none material.

22. **How do you prevent prompt injection from changing scores?** *(security)* — Scores never travel
    to the client from model output; output is JSON-validated, ids filtered, scores clamped; worst
    case degrades to heuristic. *`evaluator.ts`, `service.ts`.* *Trade-off:* strictness may reject
    creative-but-valid output.

23. **How do you authorize access to an interview?** *(authz)* — `getUserId` + `mock.userId !==
    userId` ownership checks on every path. *`current-user.ts`, `[id]/page.tsx`, `adaptive-mock.ts`.*
    *Trade-off:* none.

24. **What's your rate-limiting story and its limitation?** *(scaling honesty)* — In-memory per-user
    daily buckets; **per-instance**, so it must move to Redis/DB at >1 instance. *`ai-labs/usage.ts`.*
    *Trade-off:* not globally accurate today.

25. **Where's the bottleneck at scale?** *(scalability)* — Two serial LLM calls/turn + Azure quota;
    app itself is stateless. *`service.ts`.* *Trade-off:* latency vs simplicity.

26. **When would you introduce a queue?** *(architecture evolution)* — When p95 latency hurts or 429s
    persist under load → async evaluation workers. *§8/§12.* *Trade-off:* added infra + eventual
    consistency of the scorecard.

27. **Why stream classic replies but not adaptive turns?** *(UX + engineering)* — Classic is
    conversational (token streaming via `runChatCompletionStream` + `tee` persist); adaptive needs the
    full evaluation JSON before choosing the next question, so it's request/response with staged
    loading UI. *`api/mock/[id]/message/route.ts`, `mock.ts`, `adaptive-interview.tsx`.* *Trade-off:*
    adaptive turn shows a spinner, not a stream.

28. **How do you map gaps to learning?** *(product loop)* — Weakest competencies →
    `COMPETENCY_TOPICS` + `TRACK_LEARNING_HREF` recommendations + Practice/Learn/Retake actions.
    *`scorecard.ts`, `[id]/page.tsx`.* *Trade-off:* behavioral has no dedicated hub (→ `/resources`).

29. **How do you show progress over time?** *(analytics)* — `listAdaptiveScores(userId, track)`
    reduces completed interviews to overall score, oldest-first, for a trend. *`services/mocks.ts`,
    `adaptive-progress.tsx`.* *Trade-off:* headline score only (not per-competency trend yet).

30. **How would you add a new track or competency?** *(extensibility)* — Add a `TrackKey` enum value +
    a `content/*.json`, and edit the plain-data `TRACK_COMPETENCIES` / `SENIORITY_WEIGHTS` tables — no
    engine changes. *`competencies.ts`, `schema.prisma`.* *Trade-off:* authored content upkeep.

31. **Why deterministic scorecard aggregation instead of asking the LLM?** *(reliability)* — The
    "AI" already happened per answer; aggregation is pure math → always works, fully unit-testable.
    *`scorecard.ts`.* *Trade-off:* aggregation can't add qualitative narrative.

32. **How do you keep the transcript and evaluation state consistent?** *(data integrity)* —
    `saveMockState` writes transcript + summary **together** in one update so they never drift.
    *`services/mocks.ts`.* *Trade-off:* whole-row JSON write per turn.

---

## 14. 5-Minute Architecture Walkthrough (script)

> "Compile Ready is the interview-prep module of ElevateIQ — a **Next.js 14 modular monolith** on
> **Azure App Service**, TypeScript end to end. Its flagship is an **Adaptive Mock Interview**.
>
> The key design idea is **LLM wrapped by deterministic logic**. Three pure, unit-tested pieces do
> the reasoning: a **competency framework** (`competencies.ts`) that resolves a rubric and weights per
> track and seniority; a **planner** (`planner.ts`) that decides what to ask next; and a **scorecard
> aggregator** (`scorecard.ts`). The LLM is used for only two fuzzy jobs — **grading an answer** and
> **wording the next question** — each a single call returning **Zod-validated JSON**
> (`ai/evaluator.ts`, `ai/interviewer.ts`).
>
> Every answer is evaluated **server-side and hidden**; the planner detects competency gaps, adapts
> difficulty, and picks the next question; at the end a pure aggregator builds the scorecard with
> evidence, confidence, and a learning plan. Scores are never shown mid-interview.
>
> All LLM traffic goes through **one gateway** (`services/ai/completion.ts`) that adds **timeout,
> retry with full-jitter backoff, a fallback model, and token budgets** (`reliability.ts`), plus
> **observability** — every call emits a PII-free `AiCall` event with model, prompt version, latency,
> tokens, cost, retries, and fallback usage to **Application Insights** and stdout (`telemetry.ts`).
>
> The whole thing **degrades gracefully**: with no Azure OpenAI, a deterministic heuristic evaluator
> and a laddered question bank take over; with no database, an in-memory store runs a full guest-mode
> session. State persists as **versioned JSON** in one `MockInterview.summary` column — no migration.
> It's testable, cheap (~2 cents an interview on `gpt-4o-mini`), and safe by construction."

---

## 15. 15-Minute AI Deep Dive (script)

**(0–2 min) Framing.** "Two bounded AI jobs — evaluate and generate — around deterministic control.
Everything is versioned and validated, and there's always a no-AI fallback."

**(2–5 min) One answer → evaluation.** "When the candidate submits, `submitAdaptiveAnswer`
(`service.ts`) calls `evaluateAnswer`. We build a rubric prompt from the target competency plus two
adjacent ones (`ai/prompts.ts`), and call the gateway with `operation:"adaptive.evaluate"`, temp 0.2,
900 max output tokens, and `response_format json_object`. The model returns per-competency **score
(0–100), confidence (0–1), matched concepts, evidence quotes, strengths, and gaps**. We strip fences,
`JSON.parse`, and **`answerEvaluationSchema.safeParse`** it. Anything invalid → we drop it; if the
model omits the target competency, we backfill it from the heuristic; scores clamp. On *any* failure
we fall back to `heuristicEvaluateAnswer`, which scores by concept coverage (70%) and answer depth
(30%). The evaluation is appended to `evaluations` and **persisted with the transcript in one write**."

**(5–9 min) Evaluation → next question.** "The planner (`selectNext`, pure) aggregates all
assessments into confidence-weighted per-competency state, then **detects gaps**: unknown
competencies first by weight, then weak ones (<65) by weight×deficit. It respects a **no-more-than-2-
in-a-row** repetition guard, sets **difficulty ±1** from the seniority baseline based on the last
target score (75/45 thresholds), and chooses a **kind**: *probe* a new area, *follow_up* to drill the
same competency (when confidence ≥ 0.4), or *advance* to stretch when there are no gaps left. Then
`generateAdaptiveQuestion` turns that plan into one question — temp 0.8, 300 tokens, JSON — and we
**reject any duplicate**, falling back to the laddered bank. The candidate sees *why* the next
question was chosen via `describeSelection` — coaching language that **never leaks a score**."

**(9–12 min) Reliability & observability.** "Both AI calls run through
`runChatCompletion` → `runResilient`: per-attempt 30s timeout via `AbortController`, up to 2 retries
with full-jitter backoff on 429/5xx/network/timeout, then an optional fallback deployment, with input
and output token budgets enforced. Every call — success or failure — emits `recordAiCall`: model,
`promptVersion`, correlationId, latency, tokens, `estimatedCostUsd`, `retryCount`, `fallbackUsed`,
and a PII-free `errorType` — to Application Insights and to a `[ai.telemetry]` stdout line. **No
answer text is ever logged.**"

**(12–15 min) Scorecard & quality.** "Finalize is pure aggregation (`buildScorecard`): overall =
weight-normalized average over assessed competencies, aggregate confidence, strengths (≥75),
weaknesses (the gap list), up to 3 evidence quotes each, the **adaptive path** (why each question),
and learning recommendations mapping gaps to `/learning/*`. It's **idempotent**. Quality is guarded
by a **40-case golden dataset** asserting concept recall and strong/weak score separation, plus unit
tests for the planner, scorecard, competencies, copy, and the full service flow. Because the framework
and aggregation are pure, quality is regression-tested without ever calling a live model."

---

## 16. Principal-Level Story

- **Problem.** Engineers preparing for interviews get static question lists but no measurement of
  where they stand or what to fix. They need realistic, adaptive practice with **evidence-based,
  actionable** feedback.

- **Constraints.** Must run on a modest Azure footprint; must work **without** a database and
  **without** AI configured (demo/guest mode); must be backward-compatible (no schema churn); must
  never leak candidate content into logs; must be testable in CI without network.

- **Architecture.** A Next.js 14 modular monolith on Azure App Service. **Deterministic control
  around bounded LLM calls**: a competency framework + a pure planner + a pure scorecard, with the
  LLM used only to grade answers and word questions — both behind a single reliability/observability
  gateway. State persists as versioned JSON in one existing column.

- **Key decisions.** LLM + deterministic logic (not agents/RAG); structured competency content as
  ground truth; single AI gateway with retry/fallback/budgets; optional-everything (DB, AI, App
  Insights) with graceful fallbacks; JSON-in-a-column persistence for zero-migration evolution.

- **AI challenges.** Grading free text reliably → rubric-anchored, **Zod-validated** structured
  output with sanitation and clamping. Adaptivity without chaos → a pure planner with gap detection,
  difficulty laddering, and repetition guards. Never leaking scores mid-interview → score fields
  physically absent from the client contract.

- **Reliability.** Per-attempt timeouts (socket abort), bounded full-jitter retries on transient
  errors, configurable fallback model, input/output token budgets, per-user daily caps, and a
  deterministic heuristic that keeps the product fully functional with no AI at all.

- **Quality.** A 40-case golden dataset + planner/scorecard/service unit tests, all hermetic (run
  against the deterministic evaluator), plus prompt-version stamping on every evaluation and telemetry
  event so regressions are traceable to a revision.

- **Scale.** Stateless requests scale with App Service instances; the honest limits are the two serial
  LLM calls per turn, Azure OpenAI quota, and per-instance in-memory usage buckets. The documented
  evolution: shared Redis for caps/cache, queue-based async evaluation, provisioned/multi-region
  OpenAI, and normalized evaluation tables.

- **Outcome.** A production-quality adaptive interviewer that boots anywhere (with or without DB/AI),
  costs ~2 cents/interview on `gpt-4o-mini`, is safe by construction, and closes the loop from *answer
  → evaluation → adaptive question → scorecard → learning*.

- **Future evolution.** Async evaluation workers, corpus-grounded (RAG) company-specific questions,
  per-competency trend analytics, normalized evaluation storage, and multi-model routing — all
  additive on top of the current seams.

---

## WHAT I MUST MEMORIZE — Top 20 facts

1. **Stack:** Next.js 14 (App Router, RSC + Server Actions) monolith, TypeScript, Prisma/PostgreSQL,
   Auth.js v5, `openai` SDK, Azure OpenAI, Azure App Service. Tests in Vitest.
2. **Core principle:** LLM does only **two** fuzzy jobs (evaluate answer, generate question); **pure
   deterministic logic** owns selection (`planner.ts`) and scoring aggregation (`scorecard.ts`).
3. **Adaptive state** lives entirely in the **`MockInterview.summary` JSON column** as a versioned
   `AdaptiveSummary` (`ADAPTIVE_SUMMARY_VERSION = 1`) — **no migration**; visible chat in `transcript`.
4. **One AI gateway:** `services/ai/completion.ts` → `reliability.ts` → `client.ts` → `telemetry.ts`.
   Every call passes `meta { operation, promptVersion }`.
5. **Reliability defaults:** timeout **30s** (`AbortController`, socket abort), **2 retries**,
   **full-jitter** backoff base **500ms**, input budget **12k**, output **2k** tokens.
6. **Transient = retry:** 408/409/425/429, all 5xx, network codes, `APIConnectionError`. Non-transient
   (auth, `AiNotConfiguredError`, `AiInputTooLargeError`) **fail fast**.
7. **Fallback model:** `AZURE_OPENAI_FALLBACK_DEPLOYMENT`; `runResilient` retries the whole cycle on
   it after the primary is exhausted; `fallbackUsed` is logged.
8. **Model:** default **`gpt-4o-mini`** (`AZURE_OPENAI_DEPLOYMENT`); `isReasoningModel` + `tuneParams`
   handle GPT‑5/o-series (`max_completion_tokens` floored 2048, no temperature) vs classic.
9. **Two Azure surfaces:** classic `api-version` (`AzureOpenAI`) vs versionless **`/openai/v1`**
   (standard `OpenAI` client, deployment passed as `model`), auto-detected by `isV1Endpoint`.
10. **Evaluator call:** `operation:"adaptive.evaluate"`, **temp 0.2**, **900** max tokens,
    `json_object`, prompt `adaptive-evaluator@2026-02`; output **Zod-validated**, then heuristic
    fallback on any failure.
11. **Interviewer call:** `operation:"adaptive.question"`, **temp 0.8**, **300** max tokens,
    `json_object`, prompt `adaptive-interviewer@2026-02`; duplicates rejected → laddered bank.
12. **Thresholds:** `WEAK < 65`, `STRONG ≥ 75`, `LOW ≤ 45`; **repetition guard**
    `MAX_CONSECUTIVE_SAME = 2`; **difficulty ±1** from baseline.
13. **Planned questions:** junior **4**, mid **5**, senior **6**, staff **6**; baseline difficulty
    easy/medium/medium/hard. Weights normalized to sum 1 in `getFramework`.
14. **Question kinds:** `probe` (new area), `follow_up` (same competency, confidence ≥ 0.4),
    `advance` (no gaps → stretch highest-weight, raised difficulty).
15. **Scores are hidden live:** `SubmitResult` has **no score fields**; only the final `buildScorecard`
    exposes scores/evidence/confidence. `describeSelection` copy never mentions a score.
16. **Scorecard math:** overall = **weight-normalized average over assessed competencies**; confidence
    = mean of assessed confidences; strengths ≥ 75; weaknesses = `detectGaps`. **Idempotent** finalize.
17. **Graceful degradation:** no Azure → **heuristic evaluator** (`0.7×coverage + 0.3×depth`) +
    **question bank**; no DB → **in-memory `memStore` on globalThis** + `LOCAL_GUEST_ID`.
18. **Telemetry (`AiCall`)** fields: operation, model, `promptVersion`, correlationId, latencyMs,
    success, retryCount, fallbackUsed, streamed, in/out tokens, `estimatedCostUsd`, `errorType` —
    **PII-free**, to App Insights + `[ai.telemetry]` stdout. **Answers/prompts are never logged.**
19. **Golden dataset:** **40 cases** (`golden/dataset.ts`); tests assert concept recall and
    strong (≥50) vs weak (≤45) **population separation**, run against the deterministic evaluator.
20. **Cost:** ~**US$0.02**/interview on `gpt-4o-mini` (≈**$0.10–0.20** on 4o/GPT‑5), **$0** on the
    heuristic; bounded by token budgets + per-user daily caps (`DAILY_AI_LIMIT = 50`).

---

### Appendix — Not implemented (explicitly out of scope today)

- **RAG / vector search / embeddings / citations** — none. Ground truth is the authored competency
  framework + question bank.
- **Multi-agent orchestration** — none. Single-purpose LLM calls around pure control logic.
- **Async/queue evaluation, distributed rate limiting, provisioned/multi-region OpenAI** — proposed in
  §8/§12, not built.
- **Normalized evaluation/telemetry tables** — evaluations are JSON in `summary`; telemetry is
  emitted, not stored in the DB.
- **Per-competency trend analytics** — progress currently trends the **overall** score only.
