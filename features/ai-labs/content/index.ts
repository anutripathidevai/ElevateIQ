import type { LabContent } from "../types";
import { llmPlaygroundContent } from "./llm-playground";

/**
 * Registry of authored lab content, keyed by slug. Add an entry here (and flip
 * the registry status to "published") to make a lab live. Labs without an entry
 * render the coming-soon page.
 */
export const LAB_CONTENT: Record<string, LabContent> = {
  "llm-playground": llmPlaygroundContent,
};
