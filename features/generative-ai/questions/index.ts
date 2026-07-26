import type { GenAILessonContent } from "../types";
import { designChatgptContent } from "./design-chatgpt";
import { designRagPipelineContent } from "./design-rag-pipeline";
import { designVectorDatabaseContent } from "./design-vector-database";

/**
 * The content map: slug → authored lesson content. A lesson renders its full
 * page only when its slug appears BOTH here and as `status: "published"` in the
 * registry catalog; otherwise the `[lesson]` route renders the Coming Soon
 * placeholder. Adding a lesson = author a `<slug>.ts` content file, import it
 * here, and flip the catalog entry to "published".
 */
export const GENAI_CONTENT: Record<string, GenAILessonContent> = {
  [designChatgptContent.slug]: designChatgptContent,
  [designRagPipelineContent.slug]: designRagPipelineContent,
  [designVectorDatabaseContent.slug]: designVectorDatabaseContent,
};
