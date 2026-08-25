import type { LabContent } from "../types";

/**
 * Lab 11 — AI Guardrails.
 *
 * Teaches the defensive layers around an AI feature: redact sensitive input,
 * block hostile prompts, enforce topic policy, and validate the output before
 * it reaches the user. The demo uses real browser-side regex and keyword checks.
 */
export const aiGuardrailsContent: LabContent = {
  slug: "ai-guardrails",

  overviewMD: `
## Why AI guardrails matter

Production AI systems do not trust raw user input or raw model output. Users may
paste personal data, attempt prompt injection, or ask for content your product
must not generate. The model can also accidentally echo sensitive data or ignore
format rules. **Guardrails are the safety checks before and after the model.**

This lab builds a compact guardrail pipeline you can inspect: input filtering,
PII redaction, jailbreak detection, banned-topic blocking, a deterministic local
model stand-in, and output validation.

## The core problem

Prompts are untrusted input. A sentence like "ignore previous instructions" is
not just text; it is an attempt to change the policy of the system. Likewise,
email addresses and phone numbers are data you may need to remove before a model
call. Guardrails make those risks explicit and observable.

## Where it is used

- Customer-support copilots that must not expose private customer data
- Enterprise assistants that defend against prompt injection and system-prompt leaks
- Moderated generation flows with restricted topics
- Any AI feature that needs auditable, safe failure behavior
`.trim(),

  whatYouBuild: [
    "A real input guardrail pass that redacts emails, phone numbers, cards, and SSNs",
    "A real prompt-injection detector using case-insensitive blocklisted phrases",
    "A banned-topic keyword filter that blocks policy-violating requests",
    "A deterministic local model step that only runs after input checks pass",
    "An output validation pass that catches leaks, policy words, and bad format",
  ],

  architecture: {
    title: "Guardrail pipeline around a model call",
    flow: [
      "[ User input ]",
      "      |",
      "      v",
      "[ PII redaction ]",
      "      | sanitized prompt",
      "      v",
      "[ Injection + topic checks ] -- hit --> [ Blocked result ]",
      "      | ok",
      "      v",
      "[ Local model stand-in ]",
      "      | candidate response",
      "      v",
      "[ Output guardrails ] -- leak/format fail --> [ Blocked result ]",
      "      | ok",
      "      v",
      "[ Safe response ]",
    ].join("\n"),
    nodes: [
      {
        id: "input-screen",
        label: "Input screen",
        whatMD:
          "The first gate reads the user's prompt before any model work happens and decides whether the request can continue.",
        whyMD:
          "Blocking early saves cost, reduces attack surface, and creates a clear audit trail for unsafe requests.",
        input: "Raw user text",
        output: "A pass/block decision plus reason",
        commonFailure:
          "Sending text to the model first and asking the model to decide whether it was safe.",
        interviewQuestion:
          "Why should safety checks run before the model call rather than only after it?",
      },
      {
        id: "pii-redaction",
        label: "PII redaction",
        whatMD:
          "Regex checks replace emails, phone numbers, credit-card-like numbers, and SSN-like values with redaction tokens.",
        whyMD:
          "Many useful AI tasks do not need raw personal identifiers. Removing them lowers privacy risk while preserving intent.",
        input: "Raw prompt with possible personal data",
        output: "Sanitized prompt with redaction tokens",
        commonFailure:
          "Logging or sending sensitive identifiers to a provider when a placeholder would have been enough.",
        interviewQuestion:
          "What kinds of data should you redact before an AI request, and what are the limits of regex?",
      },
      {
        id: "jailbreak-detector",
        label: "Jailbreak detector",
        whatMD:
          "A case-insensitive phrase list catches common prompt-injection patterns such as requests to ignore instructions or reveal prompts.",
        whyMD:
          "Prompt injection tries to override developer intent. A simple detector is not complete, but it is an important first layer.",
        input: "User prompt after optional redaction",
        output: "Detected phrase or pass",
        commonFailure:
          "Treating the system prompt as secret while letting the user ask the model to disclose or rewrite it.",
        interviewQuestion:
          "How do you detect prompt injection, and why is keyword blocking insufficient by itself?",
      },
      {
        id: "topic-policy",
        label: "Topic policy",
        whatMD:
          "A small banned-keyword list blocks requests for product-disallowed topics before generation.",
        whyMD:
          "Product policy should be enforced by code, not delegated entirely to model judgment.",
        input: "Sanitized prompt",
        output: "Policy pass or blocked topic",
        commonFailure:
          "Only checking for banned content in the final answer, after a model call has already been spent.",
        interviewQuestion:
          "Where would you store and version a policy keyword list in a real product?",
      },
      {
        id: "output-validator",
        label: "Output validator",
        whatMD:
          "The final gate scans the candidate answer for leaked PII, banned words, and a required safe-response prefix.",
        whyMD:
          "Even safe input can produce unsafe output. The response is not trusted until it passes validation.",
        input: "Candidate model response",
        output: "Safe final answer or blocked notice",
        commonFailure:
          "Assuming a well-written prompt guarantees the answer will obey policy and format.",
        interviewQuestion:
          "What should happen when output validation fails after the model has already generated text?",
      },
    ],
  },

  demo: "ai-guardrails",

  executionMD: `
## What the execution trace shows

Each run records the decision path through the guardrail pipeline:

1. **Input guardrails** — regex redaction runs, then injection and banned-topic
   checks decide whether the request should short-circuit.
2. **Blocked** — if an input blocker fires, the demo returns a safe blocked
   result and never runs the model step.
3. **Model** — when input passes, a deterministic local stand-in creates a
   candidate response from the sanitized request.
4. **Output guardrails** — the candidate response is scanned for PII leaks,
   banned words, and the required safe response format.
5. **Final result** — either a safe answer or a blocked notice with the reason.

This mirrors production debugging: the trace tells you whether a request was
stopped by privacy, prompt-injection, topic policy, or output validation.
`.trim(),

  learnMD: `
## Guardrails are defense in depth

No single guardrail is enough. Regex redaction misses unusual formats. Keyword
lists can be bypassed. Model-based classifiers can be wrong. Strong AI systems
layer checks so a miss in one layer can still be caught by another.

### Input filtering

Input filters run before cost is incurred. They should remove data the model does
not need, reject obvious attacks, and record a reason that support and security
teams can understand.

### PII handling

Redaction should happen before model calls and before logs whenever possible.
The replacement token should preserve the shape of the request without exposing
the sensitive value. In real systems, pair regex with data-loss-prevention tools
and domain-specific detectors.

### Prompt injection

Prompt injection is user content attempting to control instructions, tools, or
secrets. Keyword checks catch common strings, but robust systems also isolate
retrieved content, constrain tool permissions, and validate actions.

### Output validation

The final answer is still untrusted. Validate policy, format, and sensitive-data
leaks before rendering it. On failure, prefer a clear blocked response over a
best-effort unsafe answer.
`.trim(),

  challenge: {
    promptMD: `
Extend the guardrail pipeline for a support chatbot that can answer account
questions but must never expose authentication secrets.

Design:

1. One additional input rule beyond the demo's keyword checks.
2. One output rule that detects a response trying to reveal a secret.
3. What you would log for observability without storing sensitive user data.
`.trim(),
    hints: [
      "Think about intent patterns, not only exact phrases: requests to reset, bypass, reveal, export, or impersonate.",
      "Output validation can require a format and also forbid secret-shaped strings such as API keys or bearer tokens.",
      "Logs should capture rule id, decision, counts, and redacted samples rather than raw PII.",
    ],
    expectedApproachMD: `
A strong solution adds both policy coverage and observability:

- Add an input rule for secret-extraction intent, such as requests containing
  reveal/export/show combined with token/key/password/session.
- Add output scanning for secret-shaped patterns like bearer tokens, API-key
  prefixes, or long high-entropy strings, and block the final answer on a hit.
- Log the rule id, pass/block decision, matched category, redaction counts,
  latency, and request id. Do not log raw sensitive values.

The important design choice is safe failure: if a guardrail is uncertain, the
product should explain that it cannot help with that request rather than leaking.
`.trim(),
  },

  interviewQuestions: [
    {
      id: "guardrails-q1",
      question: "Why are guardrails implemented outside the model instead of only in the prompt?",
      difficulty: "Advanced",
      answerMD:
        "Prompts influence behavior but do not enforce it. Code-level guardrails are deterministic, testable, auditable, and can run before spending tokens. They also create a trust boundary: unsafe input can be blocked before the model sees it, and unsafe output can be withheld even if the model ignores instructions.",
      keyPoints: [
        "Prompts are guidance, not enforcement",
        "Code checks are testable and auditable",
        "Input checks avoid cost and exposure",
        "Output checks catch model failures",
      ],
      followUps: [
        "Which guardrails should run before retrieval or tools?",
        "How do you handle false positives without weakening safety?",
      ],
    },
    {
      id: "guardrails-q2",
      question: "How would you handle PII in an AI request pipeline?",
      difficulty: "Intermediate",
      answerMD:
        "Classify and redact sensitive fields before model calls and logs whenever the raw value is not required. Preserve useful intent with placeholders, for example replacing an email with REDACTED_EMAIL. Use multiple detectors: regex for common formats, structured fields from the product database, and DLP or ML detectors for free text. Store raw values only when there is a clear business need, access control, retention policy, and audit trail.",
      keyPoints: [
        "Redact before provider calls and logs",
        "Use placeholders to preserve task intent",
        "Combine regex, structured metadata, and DLP",
        "Apply retention, access control, and auditing",
      ],
      followUps: [
        "When would redaction hurt answer quality?",
        "How do you test PII detectors across locales?",
      ],
    },
    {
      id: "guardrails-q3",
      question: "What is prompt injection, and why are keyword blocklists not enough?",
      difficulty: "Advanced",
      answerMD:
        "Prompt injection is untrusted content trying to override the system's instructions, reveal hidden context, or make tools perform unauthorized actions. Keyword blocklists catch common attacks, but attackers can paraphrase, encode, or split instructions. Robust defense also separates instructions from data, limits tool permissions, quotes retrieved content as untrusted, validates tool arguments, and monitors for new attack patterns.",
      keyPoints: [
        "Injection tries to override instructions or tools",
        "Blocklists catch common but not novel attacks",
        "Separate trusted instructions from untrusted data",
        "Constrain tools and validate actions",
      ],
      followUps: [
        "How does RAG increase prompt-injection risk?",
        "How would you design least-privilege tools for an agent?",
      ],
    },
    {
      id: "guardrails-q4",
      question: "What should an output validator check before rendering an AI answer?",
      difficulty: "Intermediate",
      answerMD:
        "It should check policy violations, sensitive-data leaks, required format, and task-specific invariants. For structured output, validate schema and enum ranges. For chat, scan for secrets or banned topics and ensure refusal text is used when required. If validation fails, block or retry with a bounded repair prompt, and log the failure category for tuning.",
      keyPoints: [
        "Policy, PII, secrets, and format",
        "Schema and invariant checks for structured data",
        "Block or bounded retry on failure",
        "Log failure categories for improvement",
      ],
      followUps: [
        "When is retry appropriate versus immediate block?",
        "How do you prevent validators from leaking the rejected text?",
      ],
    },
    {
      id: "guardrails-q5",
      question: "How do you evaluate whether guardrails are working?",
      difficulty: "Advanced",
      answerMD:
        "Build adversarial test sets with benign, borderline, and malicious prompts. Measure true positives, false positives, false negatives, and latency/cost overhead per rule. Replay production incidents after redaction, run regression tests before policy changes, and monitor live block rates by category. A good guardrail program treats policy changes like code: reviewed, versioned, tested, and observable.",
      keyPoints: [
        "Use adversarial and benign evaluation sets",
        "Track precision, recall, and false positives",
        "Replay incidents and run regressions",
        "Version policy and observe block rates",
      ],
      followUps: [
        "What is an acceptable false-positive rate for support chat?",
        "How would you detect a new jailbreak trend in telemetry?",
      ],
    },
  ],
};
