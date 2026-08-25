import type { LabContent } from "../types";

/**
 * Lab 9 — Multi-Agent.
 *
 * Teaches orchestration: separate roles, explicit handoffs, and a critic loop
 * that improves an artifact before it reaches the user.
 */
export const multiAgentContent: LabContent = {
  slug: "multi-agent",

  overviewMD: `
## What is a multi-agent system?

A **multi-agent system** splits work across specialized roles. Instead of one
model trying to plan, draft, critique, and revise at once, an orchestrator hands
the task through agents with distinct responsibilities.

This lab uses three roles:

- **Planner** breaks the task into concrete subtasks.
- **Worker** produces the draft artifact.
- **Critic** reviews the draft and sends targeted fixes back to the worker.

The role outputs are deterministic local stand-ins, but the orchestration pattern
is real: explicit roles, handoffs, and an optional critic loop.

## Why it matters

Specialization makes complex AI workflows easier to inspect and improve. If the
final answer is weak, the trace shows whether the plan was vague, the worker
missed the task, or the critic failed to catch an issue.

## Where it is used

- Writing pipelines: brief → draft → review → revise
- Coding workflows: planner → implementer → test fixer → reviewer
- Research workflows: researcher → synthesizer → fact checker
- Enterprise automations where approvals and handoffs must be auditable
`.trim(),

  whatYouBuild: [
    "A Planner → Worker → Critic orchestration flow",
    "A deterministic plan generated from the user's task",
    "A draft artifact created by a specialized worker role",
    "An optional critic loop that produces concrete revision requests",
    "A live trace showing each handoff and how the final artifact changes",
  ],

  architecture: {
    title: "Planner, Worker, Critic handoff",
    flow: [
      "[ User task ]",
      "      |",
      "      v",
      "[ Orchestrator ] -> starts run, owns state, applies loop policy",
      "      |",
      "      v",
      "[ Planner ] -> subtasks and success criteria",
      "      |",
      "      v",
      "[ Worker ] -> draft artifact",
      "      |",
      "      v",
      "[ Critic enabled? ] -- no --> [ Final artifact = draft ]",
      "      | yes",
      "      v",
      "[ Critic ] -> concrete issues",
      "      |",
      "      v",
      "[ Worker revise ] -> improved final artifact",
    ].join("\n"),
    nodes: [
      {
        id: "task-intake",
        label: "Task intake",
        whatMD:
          "The user provides the artifact request. In the demo, the default task asks for a two-sentence AI Labs launch announcement.",
        whyMD:
          "Clear task intake gives every role the same target and keeps handoffs aligned.",
        input: "User task text",
        output: "Normalized task for the orchestrator",
        commonFailure:
          "Letting each role reinterpret the task independently, causing drift across handoffs.",
        interviewQuestion:
          "What task metadata would you preserve for every agent in a workflow?",
      },
      {
        id: "orchestrator",
        label: "Orchestrator",
        whatMD:
          "The controller decides which role runs next, stores each output, and applies the critic-loop setting.",
        whyMD:
          "Multi-agent systems need coordination. Without an orchestrator, roles become a group chat with unclear ownership.",
        input: "Task + role outputs + loop policy",
        output: "Next role invocation or final artifact",
        commonFailure:
          "Allowing agents to talk freely without a deterministic handoff protocol or stop rule.",
        interviewQuestion:
          "What does the orchestrator own versus the individual agents?",
      },
      {
        id: "planner",
        label: "Planner",
        whatMD:
          "Creates a short set of subtasks and success criteria derived from the user's requested artifact.",
        whyMD:
          "Planning makes the worker's job smaller and gives the critic a checklist for review.",
        input: "Normalized task",
        output: "2–4 subtasks",
        commonFailure:
          "Over-planning with vague steps that do not constrain the draft.",
        interviewQuestion:
          "When should you add a planning role instead of prompting the worker directly?",
      },
      {
        id: "worker",
        label: "Worker",
        whatMD:
          "Writes the draft, then optionally revises it after receiving critic feedback.",
        whyMD:
          "Separating production from review reduces prompt overload and makes iteration explicit.",
        input: "Task + plan, then critic issues",
        output: "Draft artifact or revised final artifact",
        commonFailure:
          "Ignoring critic feedback and producing a revision that is only superficially different.",
        interviewQuestion:
          "How do you make a worker incorporate feedback rather than merely acknowledge it?",
      },
      {
        id: "critic",
        label: "Critic loop",
        whatMD:
          "Reviews the draft for concrete issues such as missing specificity, weak call to action, or mismatched format.",
        whyMD:
          "A critic loop improves quality before the answer reaches the user and makes review criteria observable.",
        input: "Task + plan + draft",
        output: "Specific issues for revision",
        commonFailure:
          "A critic that gives generic advice like 'make it better' instead of actionable fixes.",
        interviewQuestion:
          "How do you design a critic that improves quality without creating endless loops?",
      },
    ],
  },

  demo: "multi-agent",

  executionMD: `
## What the execution trace shows

The trace mirrors the orchestration handoff:

1. **Planner** — converts the task into a few subtasks.
2. **Worker: draft** — creates the first artifact from the plan.
3. **Critic: review** — when enabled, identifies concrete issues in the draft.
4. **Worker: revise** — incorporates the critic feedback into the final artifact.

If the critic loop is disabled, the trace stops after the draft and the final
artifact is intentionally less specific. That contrast is the lesson: critic
loops add latency, but they can catch quality issues before the user does.
`.trim(),

  learnMD: `
## Multi-agent does not mean "many chatbots"

The useful pattern is **orchestration**, not noise. Each role should have a clear
contract: inputs, outputs, success criteria, and when it is allowed to run.

## Roles create inspectable boundaries

When Planner, Worker, and Critic are separate, you can evaluate them separately:

- Did the Planner create the right checklist?
- Did the Worker satisfy the task and plan?
- Did the Critic find specific, actionable problems?
- Did the revision actually address the critique?

## Critic loops need limits

Review improves quality, but every loop adds latency and cost. Production systems
usually cap critic loops, require the critic to cite concrete issues, and stop
when the revision passes the checklist or the budget is exhausted.

## Deterministic demo, transferable pattern

This demo uses deterministic role text so it runs offline. In production each
role may be an LLM call, a tool-backed agent, a human approval step, or a
traditional service. The orchestration contract is the part that scales.
`.trim(),

  challenge: {
    promptMD: `
Add a second critic pass that checks only **brand voice** after the worker's
first revision.

Design the loop so it cannot run forever, and make the final trace show whether
the second critic requested a change or approved the artifact.
`.trim(),
    hints: [
      "Give the second critic a narrow checklist; do not let it re-review everything.",
      "Cap the workflow at one brand-voice revision so quality does not become an infinite loop.",
      "Record the approval or requested change as a trace step so the handoff is debuggable.",
    ],
    expectedApproachMD: `
A strong solution adds a second, specialized critic with a bounded policy. The
orchestrator should run Planner, Worker, Critic, Worker revise, Brand Critic, and
at most one Brand revision. The final artifact should explain which feedback was
incorporated, and the trace should make the stop reason obvious.
`.trim(),
  },

  interviewQuestions: [
    {
      id: "multi-q1",
      question: "When is a multi-agent workflow better than one strong prompt?",
      difficulty: "Beginner",
      answerMD:
        "Use multi-agent orchestration when the task has distinct phases that benefit from separate instructions, evaluation, or accountability: planning, drafting, reviewing, revising, testing, or approval. A single prompt is simpler and often better for small tasks. Multi-agent adds value when boundaries make the system easier to inspect, improve, or govern.",
      keyPoints: [
        "Use roles for distinct phases",
        "Single prompt is better for simple tasks",
        "Boundaries improve debugging and evaluation",
        "Handoffs add latency and cost",
      ],
      followUps: [
        "What is a task where multi-agent would be overkill?",
        "How do you measure whether the extra critic call is worth it?",
      ],
    },
    {
      id: "multi-q2",
      question: "What does an orchestrator do in a multi-agent system?",
      difficulty: "Intermediate",
      answerMD:
        "The orchestrator owns the workflow state and policy. It decides which role runs next, passes the right context, records outputs, enforces budgets, handles errors, and determines when to stop. Agents own their local transformation, but the orchestrator owns coordination and accountability.",
      keyPoints: [
        "Owns workflow state and next-role selection",
        "Passes scoped context to each role",
        "Enforces loop limits and stop rules",
        "Records trace and handles failures",
      ],
      followUps: [
        "What context should not be passed to every role?",
        "How would you retry a failed worker step?",
      ],
    },
    {
      id: "multi-q3",
      question: "How do you design an effective critic agent?",
      difficulty: "Intermediate",
      answerMD:
        "Give the critic a narrow checklist and require concrete, actionable findings tied to the task. The critic should identify issues the worker can fix, not rewrite the whole answer or give vague taste preferences. In production, cap critic loops and measure whether revisions improve objective quality signals.",
      keyPoints: [
        "Narrow checklist",
        "Concrete issues, not vague advice",
        "Worker receives actionable fixes",
        "Loop is capped and evaluated",
      ],
      followUps: [
        "How would you stop a critic from nitpicking forever?",
        "Should the critic see the worker's hidden reasoning?",
      ],
    },
    {
      id: "multi-q4",
      question: "What are common failure modes in multi-agent systems?",
      difficulty: "Advanced",
      answerMD:
        "Common failures include role drift, duplicated work, unbounded loops, context bloat, agents optimizing for their local instruction instead of the user goal, and weak handoff contracts. Observability is essential: log role inputs, outputs, durations, stop reasons, and which feedback was incorporated.",
      keyPoints: [
        "Role drift and duplicated work",
        "Unbounded loops and context bloat",
        "Local optimization over user goal",
        "Weak handoff contracts",
      ],
      followUps: [
        "How would you detect role drift automatically?",
        "What should be included in a handoff contract?",
      ],
    },
    {
      id: "multi-q5",
      question: "How would you evaluate a Planner → Worker → Critic workflow?",
      difficulty: "Advanced",
      answerMD:
        "Evaluate each role and the end-to-end artifact. Planner metrics include task coverage and specificity. Worker metrics include task satisfaction and format accuracy. Critic metrics include issue precision and whether revisions improve outcomes. End-to-end metrics include user acceptance, latency, cost, and regression tests on a fixed task set.",
      keyPoints: [
        "Role-level and end-to-end evaluation",
        "Planner coverage and specificity",
        "Worker task satisfaction and format accuracy",
        "Critic precision and revision impact",
      ],
      followUps: [
        "How would you build a golden dataset for this workflow?",
        "What metric would make you remove the critic loop?",
      ],
    },
  ],
};
