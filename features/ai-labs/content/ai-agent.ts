import type { LabContent } from "../types";

/**
 * Lab 7 — AI Agent.
 *
 * Teaches the ReAct loop: reason about the goal, choose a tool, observe the
 * result, update the scratchpad, and stop deliberately instead of looping
 * forever.
 */
export const aiAgentContent: LabContent = {
  slug: "ai-agent",

  overviewMD: `
## What is an AI agent?

An **AI agent** is an LLM wrapped in a control loop. Instead of answering in one
shot, it keeps state, decides what to do next, calls tools, reads the result, and
continues until a stopping rule says the task is done.

This lab demonstrates the classic **ReAct** pattern: **Reason → Act → Observe**.
The model-like thoughts are deterministic local text so the demo is stable, but
the tools are real: a tiny knowledge-base search and a safe arithmetic
calculator.

## Why it matters

Agents power workflows that cannot be solved by one prompt: research, data
gathering, multi-step calculations, coding tasks, and operations runbooks. The
hard part is not only "making the model think"; it is controlling the loop so it
uses tools safely, handles missing information, and stops before cost runs away.

## Where it is used

- Support assistants that look up account facts before answering
- Coding agents that inspect files, run tests, and iterate on fixes
- Research agents that gather evidence before writing a summary
- Operations agents that call diagnostic tools and stop on a verified resolution
`.trim(),

  whatYouBuild: [
    "A ReAct transcript with Thought, Action, and Observation blocks",
    "A real kbSearch tool over deterministic in-browser facts",
    "A real safe calculator tool with no eval or dynamic code execution",
    "A max-steps stopping condition that prevents runaway loops",
    "A live execution trace showing every loop step and final stop reason",
  ],

  architecture: {
    title: "The ReAct agent loop",
    flow: [
      "[ User goal ]",
      "      |",
      "      v",
      "[ Scratchpad / state ]",
      "      |",
      "      v",
      "[ Thought ] -> choose next missing fact or calculation",
      "      |",
      "      v",
      "[ Action ] -> kbSearch({ query }) or calc({ expression })",
      "      |",
      "      v",
      "[ Observation ] -> append real tool result to state",
      "      |",
      "      v",
      "[ Stop? ] -- no --> back to Thought",
      "      | yes",
      "      v",
      "[ Final answer ]",
    ].join("\n"),
    nodes: [
      {
        id: "goal-state",
        label: "Goal + scratchpad",
        whatMD:
          "The user's task plus the observations collected so far. In the demo this is the requested population question and the city facts found by tools.",
        whyMD:
          "Agents need memory inside the run. Without a scratchpad, each step forgets what was already searched or calculated.",
        input: "User goal + previous observations",
        output: "Current state for the next reasoning step",
        commonFailure:
          "Letting the model re-search the same fact repeatedly because the loop does not track what it already knows.",
        interviewQuestion:
          "What state should an agent keep between tool calls, and what should be excluded?",
      },
      {
        id: "thought",
        label: "Reason",
        whatMD:
          "A model-like decision about the next useful step: which city fact is still missing, or whether the known facts are ready for calculation.",
        whyMD:
          "Reasoning decomposes the task into tool-sized actions. It keeps the agent from guessing when it should call a tool.",
        input: "Goal + scratchpad",
        output: "Next intended action",
        commonFailure:
          "Producing impressive-sounding reasoning that is not grounded in tool results or the actual goal.",
        interviewQuestion:
          "How do you make an agent decide when to call a tool versus answer directly?",
      },
      {
        id: "action",
        label: "Act with tools",
        whatMD:
          "The loop calls a real tool. This lab includes `kbSearch({ query })` for facts and `calc({ expression })` for safe arithmetic.",
        whyMD:
          "Tools turn the model from a text predictor into a system that can retrieve fresh facts, perform exact math, or affect the outside world.",
        input: "Structured tool name + arguments",
        output: "A tool result or a tool error",
        commonFailure:
          "Passing unvalidated, free-form tool arguments into powerful APIs, causing wrong calls or security issues.",
        interviewQuestion:
          "What makes a tool safe enough for an autonomous loop to call?",
      },
      {
        id: "observation",
        label: "Observe",
        whatMD:
          "The raw tool result is appended to the transcript and becomes evidence for the next step. The demo parses populations only from observations.",
        whyMD:
          "Observation grounds the next thought in reality. The agent should adapt to what the tool returned, not what it hoped would happen.",
        input: "Tool result",
        output: "Updated scratchpad",
        commonFailure:
          "Ignoring tool errors and continuing as if the desired answer was returned.",
        interviewQuestion:
          "How should an agent handle a failed or ambiguous tool observation?",
      },
      {
        id: "stop",
        label: "Stop condition",
        whatMD:
          "The loop stops either when it can produce the final answer or when it reaches the configured max-step budget.",
        whyMD:
          "Stopping rules are production safety rails. They cap latency, cost, and accidental infinite loops.",
        input: "Current state + max steps",
        output: "Final answer or a controlled max-step stop",
        commonFailure:
          "Allowing an agent to keep trying indefinitely because there is no explicit budget or success criterion.",
        interviewQuestion:
          "Which stopping conditions would you enforce before shipping an agent to production?",
      },
    ],
  },

  demo: "ai-agent",

  executionMD: `
## What the execution trace shows

Each run records the real loop in order:

1. **Thought n** — the deterministic model stand-in decides the next missing fact
   or calculation.
2. **Action n** — the agent calls a real local tool: \`kbSearch\` or \`calc\`.
3. **Observation n** — the real tool result is appended to the scratchpad.
4. **Stop: final answer** — enough observations exist to answer, or
   **Stop: max steps** when the budget is exhausted first.

This is the trace you need in production. It tells you whether an agent stopped
because it solved the task, because a tool failed, or because the step budget was
too small for the plan.
`.trim(),

  learnMD: `
## ReAct: Reason, Act, Observe

ReAct is a simple but powerful contract:

- **Reason** about what is missing.
- **Act** by calling one structured tool.
- **Observe** the result and add it to state.
- Repeat until a stopping condition is met.

The key is that the answer is not allowed to jump ahead of evidence. In this
demo, the agent cannot calculate the combined population until it has observed
the three city population facts.

## Tool use is the boundary between text and systems

An LLM can *say* "the sum is 4.5", but a tool can compute it exactly. Production
agents should use tools for retrieval, arithmetic, database writes, tickets,
tests, and anything else where correctness matters.

## Loops need budgets

Every agent loop needs a maximum number of steps, timeouts, and tool-specific
limits. Otherwise a confusing goal or a flaky tool can create runaway latency and
cost. A good agent also has success criteria: "all required facts found", "test
suite passed", or "human approval received".

## Determinism for learning, models in production

The demo's thoughts are scripted so you can inspect the control flow without an
API key. In a real agent, an LLM would choose the next thought/action, but the
same loop, tool schemas, observations, and stopping rules remain.
`.trim(),

  challenge: {
    promptMD: `
Extend the agent to answer: **"Which demo city has the highest population
density?"**

Add land-area facts to the knowledge base, make the loop retrieve population and
area for each city, then use the calculator to compute density before choosing
the winner.
`.trim(),
    hints: [
      "Represent area as another searchable fact so the agent must observe it instead of hard-coding the answer.",
      "Keep calculator input structured: one expression per density, then compare the numeric observations.",
      "Update the stop rule so final answer requires both population and area for every selected city.",
    ],
    expectedApproachMD: `
A strong solution adds new facts and expands the plan, not the final answer. The
agent should search population and area for each city, calculate densities with
the safe calculator, store those observations, and stop only once every required
value exists. The final response should cite the observed density values so the
answer is auditable.
`.trim(),
  },

  interviewQuestions: [
    {
      id: "agent-q1",
      question: "What is the difference between a chatbot and an agent?",
      difficulty: "Beginner",
      answerMD:
        "A chatbot usually produces one response to one prompt. An agent is a control loop around a model: it keeps state, chooses actions, calls tools, observes results, and repeats until a stopping condition is met. The agent may still use chat as the interface, but the important difference is autonomy over multiple tool-backed steps.",
      keyPoints: [
        "Chatbot: single-turn or conversational text generation",
        "Agent: model + state + tools + loop",
        "Observations from tools influence later steps",
        "Stopping rules define when the loop ends",
      ],
      followUps: [
        "When is a simple chatbot safer than an agent?",
        "What state should be persisted after an agent run?",
      ],
    },
    {
      id: "agent-q2",
      question: "Explain the ReAct pattern.",
      difficulty: "Intermediate",
      answerMD:
        "ReAct alternates Reason, Act, and Observe. The model reasons about the next useful step, acts by calling a tool with structured arguments, then observes the result and adds it to the scratchpad. This grounds future reasoning in evidence and makes the run debuggable because every decision and tool result is visible.",
      keyPoints: [
        "Reason chooses the next step",
        "Act calls exactly one tool with arguments",
        "Observe records the tool result",
        "The transcript is both state and observability",
      ],
      followUps: [
        "How would you hide private chain-of-thought while keeping a useful trace?",
        "How does ReAct relate to function calling?",
      ],
    },
    {
      id: "agent-q3",
      question: "How do you keep an agent from looping forever?",
      difficulty: "Intermediate",
      answerMD:
        "Use explicit budgets and success criteria: max steps, max wall-clock time, per-tool timeouts, retry limits, and a definition of done. Also detect repeated actions, unchanged observations, and tool errors that cannot be recovered. When the budget is exhausted, stop with a clear partial result or handoff rather than silently continuing.",
      keyPoints: [
        "Max steps and wall-clock time",
        "Per-tool timeout and retry budget",
        "Success criteria before final answer",
        "Repeat-action detection and safe handoff",
      ],
      followUps: [
        "What should the user see when max steps is reached?",
        "How do you tune max steps without wasting cost?",
      ],
    },
    {
      id: "agent-q4",
      question: "What makes a tool safe for agent use?",
      difficulty: "Advanced",
      answerMD:
        "A safe tool has a narrow schema, validated arguments, clear permissions, timeouts, idempotency where possible, and observable results. Risky tools need approval gates, dry-run modes, allowlists, and least-privilege credentials. The agent should never pass arbitrary model text into powerful actions without validation and policy checks.",
      keyPoints: [
        "Narrow typed schema",
        "Argument validation and permission checks",
        "Timeouts, idempotency, and audit logs",
        "Human approval for irreversible actions",
      ],
      followUps: [
        "How would you secure a `sendEmail` tool?",
        "What tool calls should always require human approval?",
      ],
    },
    {
      id: "agent-q5",
      question: "How would you observe and debug an agent in production?",
      difficulty: "Advanced",
      answerMD:
        "Log a structured trace: goal, selected model, step labels, tool names, sanitized arguments, observations, durations, token usage, stop reason, and final outcome. Correlate that with user feedback and automated evaluations. The trace should be detailed enough to debug tool failures and loops, but redact secrets and avoid exposing private chain-of-thought to end users.",
      keyPoints: [
        "Structured per-step trace",
        "Tool arguments/results with redaction",
        "Durations, tokens, cost, and stop reason",
        "Feedback and evaluations tied to runs",
      ],
      followUps: [
        "What would you redact from an agent trace?",
        "How would you detect a regression in tool-use quality?",
      ],
    },
  ],
};
