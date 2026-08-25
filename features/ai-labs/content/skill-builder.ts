import type { LabContent } from "../types";

/**
 * Lab 5 — Skill Builder.
 *
 * Teaches reusable AI skills: named prompt templates with typed inputs and an
 * optional output schema. The demo resolves template variables, runs a
 * deterministic local skill implementation, and validates structured output.
 */
export const skillBuilderContent: LabContent = {
  slug: "skill-builder",

  overviewMD: `
## What is an AI skill?

A **skill** is a reusable AI capability packaged like a function: it has a name,
a prompt template, typed inputs, and sometimes an output schema. Instead of
copy-pasting one-off prompts around your product, you call a skill with data:
\`runSkill("summarize", { text })\`.

This lab shows how that abstraction changes prompt engineering from a craft into
software engineering. You will select a skill, fill its inputs, watch the
template resolve into a concrete prompt, run a deterministic local stand-in, and
validate structured output when the skill promises a schema.

## Why it matters

Real AI products rarely ship a single prompt. They ship dozens of repeatable
operations: summarize this case, extract action items, rewrite this response,
draft a ticket. Skills make those operations testable, composable, versionable,
and safe to reuse across screens, jobs, and agents.

## Where it is used

- Internal copilots with shared "summarize", "triage", and "rewrite" actions
- Workflow builders where non-engineers chain AI steps together
- Agent tools that expose high-level abilities instead of raw prompts
- Prompt libraries that need ownership, review, and regression tests
`.trim(),

  whatYouBuild: [
    "A catalog of three reusable skills: summarize, action-items, and rewrite-tone",
    "Typed skill inputs rendered dynamically from each skill definition",
    "Template resolution that substitutes {{variables}} into a prompt",
    "A deterministic skill runner that behaves like a local model stand-in",
    "Optional schema validation for skills that return machine-readable output",
  ],

  architecture: {
    title: "A skill call as a reusable AI function",
    flow: [
      "[ Skill catalog ]",
      "        |  pick summarize / action-items / rewrite-tone",
      "        v",
      "[ Typed inputs ]",
      "        |  collect values",
      "        v",
      "[ Resolve template ]",
      "        |  substitute {{variables}}",
      "        v",
      "[ Generate ]",
      "        |  deterministic skill.run(vars)",
      "        v",
      "[ Validate output? ]",
      "        |  schema skills only",
      "        v",
      "[ Reusable result ]",
    ].join("\n"),
    nodes: [
      {
        id: "catalog",
        label: "Skill catalog",
        whatMD:
          "A registry of named skills, each with an id, description, prompt template, inputs, runner, and optional schema.",
        whyMD:
          "A catalog turns prompts into discoverable product capabilities instead of hidden strings scattered through the codebase.",
        input: "Skill definitions",
        output: "A selected reusable capability",
        commonFailure:
          "Treating every feature as a custom prompt, which makes changes risky and behaviour inconsistent.",
        interviewQuestion:
          "Why package prompts as named skills instead of calling the model directly everywhere?",
      },
      {
        id: "inputs",
        label: "Typed inputs",
        whatMD:
          "Each skill declares the variables it needs, such as a block of text, meeting notes, or a target tone.",
        whyMD:
          "Typed inputs make the UI, tests, and prompt renderer agree on the same contract before any model work begins.",
        input: "Input metadata + user values",
        output: "A vars object like { text, tone }",
        commonFailure:
          "Letting arbitrary form fields drift away from the placeholders the prompt actually expects.",
        interviewQuestion:
          "How do typed inputs improve prompt reliability and developer experience?",
      },
      {
        id: "template",
        label: "Resolve template",
        whatMD:
          "Replace placeholders such as {{text}} or {{tone}} with concrete input values to create the final prompt.",
        whyMD:
          "Template resolution is where a reusable skill becomes a specific model request for this user and this context.",
        input: "Prompt template + vars",
        output: "Resolved prompt text",
        commonFailure:
          "Leaving an unresolved placeholder in the prompt, causing the model to guess what data was intended.",
        interviewQuestion:
          "What checks would you run before sending a templated prompt to a model?",
      },
      {
        id: "runner",
        label: "Generate",
        whatMD:
          "The selected skill runs with the same vars. In production this would call an LLM; in the demo it is deterministic local logic.",
        whyMD:
          "Keeping the runner behind the skill interface lets the caller compose skills without caring which model or provider powers them.",
        input: "vars",
        output: "Skill output text",
        commonFailure:
          "Binding UI code directly to provider-specific prompt calls so skills cannot be tested or reused.",
        interviewQuestion:
          "Where should provider selection live when multiple skills use different models?",
      },
      {
        id: "validation",
        label: "Validate output",
        whatMD:
          "Skills that promise structure validate their generated result against a schema before downstream code uses it.",
        whyMD:
          "A schema turns 'the model probably returned action items' into a contract your program can enforce.",
        input: "Generated output + optional schema",
        output: "Validated data or errors",
        commonFailure:
          "Trusting a skill's output shape because the prompt asked nicely, then crashing when an item is missing.",
        interviewQuestion:
          "When should a reusable skill expose an output schema, and how should callers use it?",
      },
    ],
  },

  demo: "skill-builder",

  executionMD: `
## What the execution trace shows

The demo records the same lifecycle you would instrument in a real skill
platform:

1. **Resolve template** — the selected skill's \`{{variables}}\` are substituted
   with typed input values, producing the exact prompt you can inspect.
2. **Generate** — the skill runner produces deterministic local output. In
   production this boundary is where an LLM call would happen.
3. **Validate output** — only schema-backed skills run this step. The action-items
   skill converts bullets into \`{ items: string[] }\` and validates the shape.

The final metrics estimate input tokens from the resolved prompt and output
tokens from the generated result, which is how teams compare the cost of
different skill designs before they compose them into larger workflows.
`.trim(),

  learnMD: `
## Prompt templates are APIs

A prompt template is more than text. Once other parts of your product depend on
it, the template has an interface: required inputs, allowed values, expected
output, examples, and version history. Treating it like an API makes it easier to
review, test, and change safely.

## Typed inputs prevent prompt drift

The template uses placeholders such as \`{{notes}}\`; the skill definition declares
the matching input. That lets the UI render the right control, lets tests supply
fixtures, and lets the runner fail fast if a value is missing. Without that
contract, prompt bugs show up as strange model behaviour instead of clear
validation errors.

## Output schemas make skills composable

Some skills produce prose for humans. Others produce data for code. The moment a
skill feeds another feature — a task list, an API call, an agent plan — give it a
schema and validate the result. Then a downstream step can consume
\`items: string[]\` without reparsing prose.

## Composition is the payoff

Once skills have stable names and contracts, larger features can chain them:
summarize a support thread, extract action items, rewrite the customer reply in a
calm tone, then hand the result to a tool-calling agent. Each piece stays small,
testable, and reusable.
`.trim(),

  challenge: {
    promptMD: `
Design a new reusable skill called **risk-brief** for project updates.

It should accept \`updateText\` and return a short risk summary plus an array of
open risks. Think through:

1. Which parts belong in the prompt template versus the typed input metadata?
2. What output schema would make the result safe for a dashboard?
3. How would you compose it after the existing summarize skill?
`.trim(),
    hints: [
      "Use the template for standing instructions and the input metadata for user-supplied values.",
      "A dashboard probably needs a string summary and a string array of risks, both validated before rendering.",
      "Composition means the first skill can reduce noisy text before the second extracts risks.",
    ],
    expectedApproachMD: `
A strong solution defines \`risk-brief\` as a skill with one multiline input,
\`updateText\`, a template that asks for concrete project risks only, and a schema
such as \`{ summary: string; risks: string[] }\`. The runner should validate that
the risks are an array before the dashboard consumes them.

For composition, call \`summarize\` first on a long project update, then feed the
summary into \`risk-brief\`. That keeps each prompt small and makes each skill
testable on its own.
`.trim(),
  },

  interviewQuestions: [
    {
      id: "skill-q1",
      question: "What is a reusable AI skill, and how is it different from a prompt?",
      difficulty: "Beginner",
      answerMD:
        "A prompt is the raw instruction text sent to a model. A reusable skill wraps that prompt with a stable name, typed inputs, execution logic, and optionally an output schema. The wrapper turns the prompt into a callable product capability that can be tested, versioned, composed, and invoked consistently from many places.",
      keyPoints: [
        "Skill = name + template + typed inputs + runner",
        "Optional schema defines machine-readable output",
        "Callers use a stable interface, not copied prompt text",
        "Skills can be tested and versioned like code",
      ],
      followUps: [
        "What metadata would you store for skill ownership and versioning?",
        "How would you deprecate a skill without breaking callers?",
      ],
    },
    {
      id: "skill-q2",
      question: "Why are typed inputs important for prompt templates?",
      difficulty: "Intermediate",
      answerMD:
        "Typed inputs define the contract between the caller and the prompt. They tell the UI what to collect, the renderer what variables must be substituted, and tests what fixtures to provide. This prevents placeholder drift, catches missing values before a model call, and makes prompt behaviour easier to reason about because every variable has a name and purpose.",
      keyPoints: [
        "Inputs align UI, renderer, and tests",
        "Missing values fail fast before spending tokens",
        "Templates stay reusable across contexts",
        "Variable names become part of the skill API",
      ],
      followUps: [
        "How would you validate an enum input such as tone or audience?",
        "What happens when a template references an input that is not declared?",
      ],
    },
    {
      id: "skill-q3",
      question: "When should a skill expose an output schema?",
      difficulty: "Intermediate",
      answerMD:
        "Expose a schema whenever the output is consumed by code rather than only read by a human. A summary can be plain text, but extracted action items, labels, tool arguments, or dashboard data should be validated against a schema. The schema gives downstream systems a contract and lets the skill fail safely instead of leaking malformed model text into application logic.",
      keyPoints: [
        "Human prose may not need a schema",
        "Machine-consumed output should be validated",
        "Schemas protect downstream tools and UI",
        "Validation errors should surface or retry explicitly",
      ],
      followUps: [
        "How would you handle partial success when one field fails validation?",
        "How do schemas relate to tool-calling arguments?",
      ],
    },
    {
      id: "skill-q4",
      question: "How do you compose multiple AI skills without creating brittle workflows?",
      difficulty: "Advanced",
      answerMD:
        "Compose skills through stable, typed contracts rather than prose assumptions. Each step should declare its inputs and outputs, validate machine-readable data, and keep prompts narrowly focused. Pass structured results between steps where possible, set clear retry and fallback behaviour per skill, and log each boundary so you can identify which skill caused a workflow failure.",
      keyPoints: [
        "Compose by contracts, not informal text conventions",
        "Validate between steps",
        "Keep each skill focused and testable",
        "Add tracing and fallback at every boundary",
      ],
      followUps: [
        "How would you prevent error amplification across a skill chain?",
        "What should a workflow do when an upstream skill returns low confidence?",
      ],
    },
    {
      id: "skill-q5",
      question: "How would you test and version a production skill library?",
      difficulty: "Advanced",
      answerMD:
        "Treat each skill like production code. Store versioned templates and schemas, keep golden input/output fixtures, run regression tests on parse and validation success, and measure behaviour with offline evals before rollout. Use semantic versioning for contract changes, canary new prompts on a small traffic slice, and keep traces so regressions can be tied back to a specific skill version.",
      keyPoints: [
        "Version templates, inputs, and schemas together",
        "Golden fixtures catch regressions",
        "Offline evals and canaries reduce rollout risk",
        "Traces connect failures to skill versions",
      ],
      followUps: [
        "Which metrics would you track per skill?",
        "How would you support tenant-specific skill overrides safely?",
      ],
    },
  ],
};
