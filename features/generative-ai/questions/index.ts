import type { GenAILessonContent } from "../types";
import { designChatgptContent } from "./design-chatgpt";
import { designRagPipelineContent } from "./design-rag-pipeline";
import { designVectorDatabaseContent } from "./design-vector-database";
// Level 1 · AI Foundations
import { transformerArchitectureContent } from "./transformer-architecture";
import { attentionMechanismContent } from "./attention-mechanism";
import { tokenizationAndEmbeddingsContent } from "./tokenization-and-embeddings";
import { howLlmInferenceWorksContent } from "./how-llm-inference-works";
import { samplingAndDecodingContent } from "./sampling-and-decoding";
import { contextWindowsAndKvCacheContent } from "./context-windows-and-kv-cache";
import { hallucinationsAndLimitationsContent } from "./hallucinations-and-limitations";
import { promptEngineeringFoundationsContent } from "./prompt-engineering-foundations";
import { choosingTheRightModelContent } from "./choosing-the-right-model";

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
  // Level 1 · AI Foundations
  [transformerArchitectureContent.slug]: transformerArchitectureContent,
  [attentionMechanismContent.slug]: attentionMechanismContent,
  [tokenizationAndEmbeddingsContent.slug]: tokenizationAndEmbeddingsContent,
  [howLlmInferenceWorksContent.slug]: howLlmInferenceWorksContent,
  [samplingAndDecodingContent.slug]: samplingAndDecodingContent,
  [contextWindowsAndKvCacheContent.slug]: contextWindowsAndKvCacheContent,
  [hallucinationsAndLimitationsContent.slug]: hallucinationsAndLimitationsContent,
  [promptEngineeringFoundationsContent.slug]: promptEngineeringFoundationsContent,
  [choosingTheRightModelContent.slug]: choosingTheRightModelContent,
};
