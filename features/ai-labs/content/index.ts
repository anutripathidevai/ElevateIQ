import type { LabContent } from "../types";
import { llmPlaygroundContent } from "./llm-playground";
import { structuredOutputContent } from "./structured-output";
import { semanticSearchContent } from "./semantic-search";
import { ragPipelineContent } from "./rag-pipeline";
import { skillBuilderContent } from "./skill-builder";
import { toolCallingContent } from "./tool-calling";
import { aiAgentContent } from "./ai-agent";
import { aiMemoryContent } from "./ai-memory";
import { multiAgentContent } from "./multi-agent";
import { aiEvaluationContent } from "./ai-evaluation";
import { aiGuardrailsContent } from "./ai-guardrails";
import { productionAiContent } from "./production-ai";

/**
 * Registry of authored lab content, keyed by slug. Add an entry here (and flip
 * the registry status to "published") to make a lab live. Labs without an entry
 * render the coming-soon page.
 */
export const LAB_CONTENT: Record<string, LabContent> = {
  "llm-playground": llmPlaygroundContent,
  "structured-output": structuredOutputContent,
  "semantic-search": semanticSearchContent,
  "rag-pipeline": ragPipelineContent,
  "skill-builder": skillBuilderContent,
  "tool-calling": toolCallingContent,
  "ai-agent": aiAgentContent,
  "ai-memory": aiMemoryContent,
  "multi-agent": multiAgentContent,
  "ai-evaluation": aiEvaluationContent,
  "ai-guardrails": aiGuardrailsContent,
  "production-ai": productionAiContent,
};
