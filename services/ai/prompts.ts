import type { TrackKey } from "@prisma/client";

export interface ReviewPromptContext {
  title: string;
  statementMD: string;
  constraints?: string | null;
  referenceSolution?: string | null;
  language?: string;
  answer: string;
}

/** Problem context injected into a problem-scoped mock/tutor session. */
export interface MockProblemContext {
  title: string;
  statementMD: string;
  constraints?: string | null;
  /** Compact solution outline (approach + patterns) — used in tutor mode. */
  solutionOutline?: string | null;
}

/** Rubric section titles the model should grade for each track. */
const RUBRICS: Record<TrackKey, string[]> = {
  DSA: ["Correctness", "Time & Space Complexity", "Edge Cases", "Code Quality"],
  SYSTEM_DESIGN: [
    "Requirements & Scope",
    "Core Components",
    "Data & Storage",
    "Scalability & Bottlenecks",
    "Trade-offs",
  ],
  LLD: [
    "Class Design & Responsibilities",
    "SOLID & Design Patterns",
    "Extensibility",
    "Edge Cases",
  ],
  BEHAVIORAL: [
    "STAR Structure",
    "Ownership & Impact",
    "Communication & Clarity",
  ],
};

const TRACK_PERSONA: Record<TrackKey, string> = {
  DSA: "a senior engineer reviewing a coding-interview solution",
  SYSTEM_DESIGN: "a staff engineer evaluating a high-level system design",
  LLD: "a senior engineer evaluating an object-oriented / low-level design",
  BEHAVIORAL: "an experienced hiring manager evaluating a behavioral answer",
};

const OUTPUT_CONTRACT = `Respond with ONLY a JSON object (no markdown fences) of this exact shape:
{
  "score": <integer 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "sections": [ { "title": "<rubric item>", "rating": "good" | "ok" | "poor", "detail": "<specific, actionable feedback>" } ],
  "suggestions": [ "<concrete improvement>", "..." ]
}`;

export function buildReviewPrompt(
  track: TrackKey,
  ctx: ReviewPromptContext,
): { system: string; user: string } {
  const rubric = RUBRICS[track];
  const system = [
    `You are ${TRACK_PERSONA[track]}. Be specific, fair, and constructive.`,
    track === "DSA"
      ? "You cannot execute code, so reason carefully about correctness rather than claiming to run it."
      : "",
    `Grade these dimensions, one section each: ${rubric.join(", ")}.`,
    "Score reflects interview readiness (60+ = would pass, 85+ = strong).",
    OUTPUT_CONTRACT,
  ]
    .filter(Boolean)
    .join("\n");

  const parts = [
    `# Problem: ${ctx.title}`,
    `\n## Statement\n${ctx.statementMD}`,
    ctx.constraints ? `\n## Constraints\n${ctx.constraints}` : "",
    ctx.referenceSolution
      ? `\n## Reference / grading notes (for you, the reviewer)\n${ctx.referenceSolution}`
      : "",
    `\n## Candidate's ${track === "DSA" ? "solution" : "response"}${
      ctx.language ? ` (${ctx.language})` : ""
    }\n${ctx.answer}`,
  ];

  return { system, user: parts.filter(Boolean).join("\n") };
}

export function buildMockSystemPrompt(
  track: TrackKey,
  opts?: { mode?: "interview" | "tutor"; problem?: MockProblemContext },
): string {
  const focus: Record<TrackKey, string> = {
    DSA: "data structures & algorithms coding problems",
    SYSTEM_DESIGN: "high-level system design",
    LLD: "low-level / object-oriented design",
    BEHAVIORAL: "behavioral questions using the STAR method",
  };

  const problem = opts?.problem;
  const problemBlock = problem
    ? [
        `\n\nThe session is scoped to this specific problem:`,
        `# ${problem.title}`,
        problem.statementMD,
        problem.constraints ? `\nConstraints: ${problem.constraints}` : "",
        problem.solutionOutline
          ? `\n\nReference solution outline (for your eyes — use it to guide the candidate, don't paste it wholesale):\n${problem.solutionOutline}`
          : "",
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  if (opts?.mode === "tutor") {
    return [
      `You are a friendly, expert tutor helping a candidate deeply understand ${focus[track]}.`,
      problem
        ? "Answer their questions about the problem below: clarify requirements, explain the class model, walk through the design step by step, discuss trade-offs and design patterns, and share small Java code snippets (in Markdown fenced blocks) when helpful."
        : "Explain concepts clearly, use concrete examples, and share small code snippets in Markdown fenced blocks when helpful.",
      "Keep answers focused and not overly long. Ask a clarifying question if the candidate's question is ambiguous.",
      problemBlock,
    ].join(" ");
  }

  return [
    `You are conducting a realistic technical interview focused on ${focus[track]}.`,
    problem
      ? "Interview the candidate ONLY on the specific problem below. Start by asking them to walk through their approach."
      : "Ask ONE question at a time. Start with a suitable opening question.",
    "React briefly to the candidate's answers, probe with adaptive follow-ups, and gradually increase difficulty.",
    "Keep your messages concise (a few sentences). Do not solve the problem for them.",
    "If the candidate asks to end or says 'wrap up', provide a short scorecard: strengths, areas to improve, and an overall readiness rating out of 10.",
    problemBlock,
  ].join(" ");
}
