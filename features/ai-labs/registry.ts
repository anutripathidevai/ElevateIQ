import type { AccentKey } from "@/lib/navigation";
import type { LabMeta } from "./types";

/**
 * AI Labs catalog — the single source of truth for the module landing page and
 * navigation. Twelve labs form a progressive roadmap from a single LLM call all
 * the way to production-grade AI systems. Only labs with authored content and a
 * wired demo are marked `published`; the rest render a polished coming-soon page
 * and can be flipped on by authoring a `LabContent` file (mirrors how every
 * other Compile Ready learning module ships content).
 */

/** Course-level facts shown in the hero and used for JSON-LD / SEO. */
export const AI_LABS_INFO = {
  slug: "ai-labs",
  title: "AI Labs",
  subtitle: "Build real AI systems, one interactive lab at a time",
  description:
    "A hands-on lab series that teaches how modern AI applications actually work. " +
    "Run live demos, inspect the execution trace behind every AI call, and go from a " +
    "single LLM request to RAG, tool-calling agents, multi-agent systems, evaluation, " +
    "guardrails, and production AI.",
  labCount: 12,
  hours: 14,
  accent: "violet" as AccentKey,
  concepts: [
    "LLMs",
    "Prompting",
    "Structured Output",
    "Embeddings",
    "RAG",
    "Tool Calling",
    "Agents",
    "Memory",
    "Evaluation",
    "Guardrails",
    "Production AI",
  ],
} as const;

/**
 * The 12 labs in roadmap order. `order` is 1-based and unique; `accent` reuses
 * the shared palette. Lab 1 is published (full content + live demo); the rest
 * are coming-soon and get flipped on as content lands.
 */
export const AI_LABS_CATALOG: LabMeta[] = [
  {
    slug: "llm-playground",
    order: 1,
    title: "LLM Playground",
    summary:
      "Send prompts to a real LLM and see how system prompts, temperature, and token limits shape the output.",
    concepts: ["Prompts", "System vs User", "Temperature", "Tokens", "Streaming"],
    estimatedMinutes: 25,
    difficulty: "Beginner",
    tier: "free",
    icon: "MessageSquareText",
    accent: "violet",
    status: "published",
  },
  {
    slug: "structured-output",
    order: 2,
    title: "Structured Output",
    summary:
      "Force an LLM to return valid JSON that matches a schema — the foundation of every AI feature that feeds real code.",
    concepts: ["JSON mode", "Schemas", "Validation", "Retries"],
    estimatedMinutes: 30,
    difficulty: "Beginner",
    tier: "free",
    icon: "Braces",
    accent: "blue",
    status: "published",
  },
  {
    slug: "semantic-search",
    order: 3,
    title: "Semantic Search",
    summary:
      "Turn text into embeddings and rank results by meaning instead of keywords using cosine similarity.",
    concepts: ["Embeddings", "Vectors", "Cosine Similarity", "kNN"],
    estimatedMinutes: 30,
    difficulty: "Intermediate",
    tier: "free",
    icon: "Search",
    accent: "cyan",
    status: "published",
  },
  {
    slug: "rag-pipeline",
    order: 4,
    title: "RAG Pipeline",
    summary:
      "Ground an LLM in your own documents: chunk, embed, retrieve, and answer with citations.",
    concepts: ["Chunking", "Retrieval", "Context Injection", "Citations"],
    estimatedMinutes: 40,
    difficulty: "Intermediate",
    tier: "premium",
    icon: "Layers",
    accent: "emerald",
    status: "published",
  },
  {
    slug: "skill-builder",
    order: 5,
    title: "Skill Builder",
    summary:
      "Compose reusable AI skills — prompt + schema + validation — into a library you can call like functions.",
    concepts: ["Prompt Templates", "Composition", "Reusability"],
    estimatedMinutes: 30,
    difficulty: "Intermediate",
    tier: "premium",
    icon: "Wrench",
    accent: "orange",
    status: "published",
  },
  {
    slug: "tool-calling",
    order: 6,
    title: "Tool Calling",
    summary:
      "Let the model decide when to call your functions, then feed results back for a grounded final answer.",
    concepts: ["Function Calling", "Tool Schemas", "Arguments", "Tool Loop"],
    estimatedMinutes: 35,
    difficulty: "Intermediate",
    tier: "premium",
    icon: "Plug",
    accent: "rose",
    status: "published",
  },
  {
    slug: "ai-agent",
    order: 7,
    title: "AI Agent",
    summary:
      "Build a reason-act-observe loop that plans, uses tools, and works toward a goal autonomously.",
    concepts: ["ReAct", "Planning", "Tool Use", "Loops", "Stopping"],
    estimatedMinutes: 45,
    difficulty: "Advanced",
    tier: "premium",
    icon: "Bot",
    accent: "violet",
    status: "published",
  },
  {
    slug: "ai-memory",
    order: 8,
    title: "AI Memory",
    summary:
      "Give an agent short-term and long-term memory so it remembers context across turns and sessions.",
    concepts: ["Short-term Memory", "Long-term Memory", "Summarization", "Recall"],
    estimatedMinutes: 35,
    difficulty: "Advanced",
    tier: "premium",
    icon: "Brain",
    accent: "blue",
    status: "published",
  },
  {
    slug: "multi-agent",
    order: 9,
    title: "Multi-Agent Systems",
    summary:
      "Coordinate specialised agents — planner, worker, critic — that collaborate to solve a task.",
    concepts: ["Orchestration", "Roles", "Handoffs", "Critic Loops"],
    estimatedMinutes: 45,
    difficulty: "Advanced",
    tier: "premium",
    icon: "Network",
    accent: "cyan",
    status: "published",
  },
  {
    slug: "ai-evaluation",
    order: 10,
    title: "AI Evaluation",
    summary:
      "Measure AI quality with test sets, LLM-as-judge scoring, and regression checks you can trust.",
    concepts: ["Eval Sets", "LLM-as-Judge", "Metrics", "Regression"],
    estimatedMinutes: 40,
    difficulty: "Advanced",
    tier: "premium",
    icon: "ClipboardCheck",
    accent: "emerald",
    status: "published",
  },
  {
    slug: "ai-guardrails",
    order: 11,
    title: "AI Guardrails",
    summary:
      "Add input/output validation, PII redaction, and jailbreak defenses to keep AI features safe.",
    concepts: ["Input Filtering", "Output Validation", "PII", "Jailbreaks"],
    estimatedMinutes: 35,
    difficulty: "Advanced",
    tier: "premium",
    icon: "ShieldCheck",
    accent: "orange",
    status: "published",
  },
  {
    slug: "production-ai",
    order: 12,
    title: "Production AI",
    summary:
      "Ship AI reliably: caching, rate limits, fallbacks, cost controls, streaming, and observability.",
    concepts: ["Caching", "Rate Limits", "Fallbacks", "Cost", "Observability"],
    estimatedMinutes: 45,
    difficulty: "Advanced",
    tier: "premium",
    icon: "Rocket",
    accent: "rose",
    status: "published",
  },
];
