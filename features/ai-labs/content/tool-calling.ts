import type { LabContent } from "../types";

/**
 * Lab 6 — Tool Calling.
 *
 * Teaches how a model can request real functions through typed tool schemas. The
 * demo uses a deterministic router for tool selection, then executes real
 * client-side tools and composes the observations into a final answer.
 */
export const toolCallingContent: LabContent = {
  slug: "tool-calling",

  overviewMD: `
## What is tool calling?

LLMs are great at language, but they should not pretend to be calculators,
databases, or APIs. **Tool calling** lets a model ask your program to run a real
function with structured arguments, then use the observation in its final answer.

This lab shows the full loop with three local tools: a safe calculator, a word
counter, and a unit converter. The model side is represented by a deterministic
router so the behaviour is inspectable, but the tool execution itself is real
client-side code.

## Why it matters

Tool calling is how AI systems cross the boundary from text generation into
software action. It powers search, calendars, payments, analytics queries,
repository operations, and agents. The model chooses **what** to call; your code
owns **how** it executes, validates, logs, retries, and limits side effects.

## Where it is used

- Assistants that answer with live data instead of stale training memory
- Agents that plan, call tools, observe results, and continue
- Structured API integrations such as calendar creation or ticket updates
- Safe math, search, and retrieval operations inside chat products
`.trim(),

  whatYouBuild: [
    "A tool registry with names, descriptions, and argument schemas",
    "A deterministic model router that emits tool_call JSON",
    "A safe arithmetic calculator with no eval or new Function",
    "A tool loop that executes calls and records observations",
    "A chat-style transcript that composes observations into a final answer",
  ],

  architecture: {
    title: "The tool-calling loop",
    flow: [
      "[ User request ]",
      "        |",
      "        v",
      "[ Tool schemas ] + [ Model / router ]",
      "        |  emits { name, arguments }",
      "        v",
      "[ Tool executor ]",
      "        |  calculator / wordCount / unitConvert",
      "        v",
      "[ Observation ]",
      "        |  repeat if more calls are needed",
      "        v",
      "[ Compose final answer ]",
    ].join("\n"),
    nodes: [
      {
        id: "request",
        label: "User request",
        whatMD:
          "Natural-language text that may require external computation, counting, conversion, or multiple tools.",
        whyMD:
          "The request is intentionally human-friendly. Tool calling lets the system translate it into precise function calls.",
        input: "User message",
        output: "Intent signals for the router/model",
        commonFailure:
          "Answering directly from the model when the task needs exact computation or live data.",
        interviewQuestion:
          "How do you decide whether a model should answer directly or call a tool?",
      },
      {
        id: "schemas",
        label: "Tool schemas",
        whatMD:
          "Each tool declares a name and argument shape, such as calculator({ expression }) or unitConvert({ value, from, to }).",
        whyMD:
          "Schemas give the model a constrained interface and give your code something to validate before execution.",
        input: "Tool definitions",
        output: "Allowed calls and argument contracts",
        commonFailure:
          "Providing vague tool descriptions so the model guesses missing arguments or calls the wrong tool.",
        interviewQuestion:
          "What belongs in a tool schema and description?",
      },
      {
        id: "tool-call",
        label: "Model → tool_call",
        whatMD:
          "The model emits structured JSON with the tool name and arguments. In the demo, a deterministic router produces that JSON.",
        whyMD:
          "Separating selection from execution keeps the model from directly performing side effects or inventing results.",
        input: "Request + schemas",
        output: "{ name, arguments }",
        commonFailure:
          "Letting the model return prose that your code tries to regex into an API call.",
        interviewQuestion:
          "Why is a structured tool_call safer than asking the model to describe an API request in prose?",
      },
      {
        id: "execute",
        label: "Execute tool",
        whatMD:
          "Your application runs the real function: parse arithmetic safely, count words, or convert units.",
        whyMD:
          "The model delegates exact work to deterministic code, which is auditable, testable, and permissioned.",
        input: "Validated tool name + arguments",
        output: "Observation or tool error",
        commonFailure:
          "Using eval for calculator-style tools or allowing unchecked side effects from model-chosen arguments.",
        interviewQuestion:
          "What safety checks should happen before executing a model-selected tool?",
      },
      {
        id: "compose",
        label: "Compose answer",
        whatMD:
          "The model receives the observations and writes a final user-facing response grounded in those results.",
        whyMD:
          "Users want one coherent answer, not raw tool logs. Composition turns exact observations back into helpful language.",
        input: "User request + observations",
        output: "Final answer",
        commonFailure:
          "Ignoring the observation and hallucinating a different number in the final answer.",
        interviewQuestion:
          "How do you force the final answer to stay grounded in tool observations?",
      },
    ],
  },

  demo: "tool-calling",

  executionMD: `
## What the execution trace shows

Every run records the tool loop:

1. **Model → tool_call** — the router emits JSON such as
   \`{ "name": "calculator", "arguments": { "expression": "15% * 240 + 30" } }\`.
2. **Observation** — the selected real tool executes in the browser and returns a
   result or a tool error.
3. **Compose final answer** — the final response is stitched from the observations
   instead of inventing numbers.

If the request needs multiple tools, the trace alternates tool_call and
observation for each one. That shape is the same loop used by agents: decide,
act, observe, and only then answer.
`.trim(),

  learnMD: `
## Tools extend the model

The model should not memorize today's exchange rate, calculate with floating
point in its head, or guess database state. It should call a tool. Tools let your
AI feature combine language understanding with deterministic systems that are
better at facts, math, retrieval, and side effects.

## The schema is the contract

A good tool definition includes a precise name, description, argument schema,
and examples or constraints. The schema lets the model produce structured
arguments and lets your application validate before execution. This is structured
output (Lab 2) used to call code.

## The tool loop

Production systems usually run:

\`\`\`
request → model selects tool → validate args → execute tool → observe → answer
\`\`\`

Some tasks need several calls. A travel assistant might search flights, convert a
price, check calendar availability, then compose a final itinerary. Each
observation becomes new context for the next model step.

## Safety and permissions

Tool calling is powerful because it can do real work. That means you need allow
lists, argument validation, permission checks, rate limits, idempotency keys for
side effects, and clear user confirmation for destructive actions. Never let a
model directly execute arbitrary code.
`.trim(),

  challenge: {
    promptMD: `
Add a fourth tool called **dateDiff** that accepts \`from\` and \`to\` dates and
returns the number of days between them.

Think through:

1. What argument schema and description would make the router/model call it
   correctly?
2. How would you validate ambiguous dates before execution?
3. How should the final answer cite the observation rather than recomputing it?
`.trim(),
    hints: [
      "Prefer an ISO date schema such as YYYY-MM-DD over free-form dates.",
      "Validate both dates before execution and return a tool error if either cannot be parsed safely.",
      "Store the observation text and have the composer reuse that exact value in the final answer.",
    ],
    expectedApproachMD: `
A strong solution defines \`dateDiff({ from: string, to: string })\`, documents
that dates must be ISO strings, validates both with deterministic date parsing,
and returns a clear observation such as "2026-08-01 to 2026-08-25 is 24 days".

The model/router should only emit the tool call when both dates are present, and
the final answer should quote the observation instead of doing fresh arithmetic.
That keeps tool execution authoritative.
`.trim(),
  },

  interviewQuestions: [
    {
      id: "tool-q1",
      question: "What problem does tool calling solve for LLM applications?",
      difficulty: "Beginner",
      answerMD:
        "Tool calling lets a model delegate work it should not do in text: exact math, live data lookup, API calls, and side effects. The model selects a named function and structured arguments, your code executes the trusted implementation, and the final answer is grounded in the observation. This avoids hallucinated facts and gives the application control over safety and permissions.",
      keyPoints: [
        "Model chooses a tool; code executes it",
        "Good for exact, live, or side-effecting work",
        "Observations ground the final answer",
        "Application keeps control over execution",
      ],
      followUps: [
        "Give an example where direct model answering is unsafe.",
        "How does tool calling relate to retrieval-augmented generation?",
      ],
    },
    {
      id: "tool-q2",
      question: "What should be included in a good tool schema?",
      difficulty: "Intermediate",
      answerMD:
        "A good tool schema includes a specific name, a clear description of when to use it, typed arguments with required fields, constraints such as units or allowed enum values, and examples when ambiguity is likely. The schema should be narrow enough that the model can choose correctly and your code can validate arguments before executing the tool.",
      keyPoints: [
        "Specific name and use-case description",
        "Typed required arguments",
        "Constraints and allowed values",
        "Designed for validation before execution",
      ],
      followUps: [
        "How would you document units for a conversion tool?",
        "When would you split one broad tool into several narrow tools?",
      ],
    },
    {
      id: "tool-q3",
      question: "What safety checks are needed before executing a model-selected tool?",
      difficulty: "Intermediate",
      answerMD:
        "Validate the tool name against an allow list, validate argument types and ranges, check user permissions, enforce rate limits, and classify whether the tool is read-only or side-effecting. For destructive or expensive actions, require confirmation and use idempotency keys. The model should never be able to execute arbitrary code or bypass application authorization.",
      keyPoints: [
        "Allow-list tool names",
        "Validate arguments and ranges",
        "Check permissions and rate limits",
        "Confirm destructive or expensive side effects",
      ],
      followUps: [
        "How would you sandbox a code-execution tool?",
        "What telemetry would you log for failed tool calls?",
      ],
    },
    {
      id: "tool-q4",
      question: "How do you design a multi-step tool loop?",
      difficulty: "Advanced",
      answerMD:
        "A multi-step loop alternates model decisions and tool observations until the system has enough information to answer or hits a budget. Each iteration validates arguments, executes one or more tools, appends observations to context, and asks the model to continue. You need stop conditions, max call counts, timeouts, error handling, and safeguards against repeating the same failing call.",
      keyPoints: [
        "Alternate decide → act → observe",
        "Append observations as context",
        "Use budgets, timeouts, and stop conditions",
        "Detect repeated or failing calls",
      ],
      followUps: [
        "How would you parallelize independent tool calls?",
        "How do you prevent an infinite tool loop?",
      ],
    },
    {
      id: "tool-q5",
      question: "How do you keep the final answer grounded in tool observations?",
      difficulty: "Advanced",
      answerMD:
        "Treat observations as authoritative facts and instruct the model to answer only from them when a tool was used. Include the exact observation values in context, validate or post-check the final answer for mismatched numbers, and prefer templated composition for high-stakes outputs. If a tool fails, the final answer should say what failed instead of inventing a replacement result.",
      keyPoints: [
        "Observations are authoritative",
        "Final answer should reuse exact values",
        "Post-check numbers when accuracy matters",
        "Do not invent results after tool failures",
      ],
      followUps: [
        "How would you detect a final answer that contradicts a tool result?",
        "When would you skip model composition and use a deterministic template?",
      ],
    },
  ],
};
