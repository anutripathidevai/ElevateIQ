/**
 * Provider-agnostic contracts for the AI Labs backend.
 *
 * The UI and API routes depend only on these interfaces, never on a vendor SDK.
 * That lets us swap models, add fallbacks, or serve a demo provider (when Azure
 * is unconfigured) without touching feature code — the exact abstraction Lab 1
 * teaches. The embedding + vector-store interfaces are declared here too so the
 * later RAG / semantic-search labs plug into the same seam.
 */

export type LLMRole = "system" | "user" | "assistant";

export interface LLMMessage {
  role: LLMRole;
  content: string;
}

export interface LLMParams {
  /** Sampling temperature (0-2). Ignored by reasoning models. */
  temperature?: number;
  /** Output-token budget. */
  maxTokens?: number;
}

/** Token accounting returned when a completion finishes. */
export interface LLMUsage {
  inputTokens: number;
  outputTokens: number;
}

/** One chunk emitted while streaming a completion. */
export interface LLMStreamChunk {
  /** Newly generated text since the previous chunk. */
  delta: string;
}

/** Terminal result of a streamed completion. */
export interface LLMResult {
  text: string;
  usage: LLMUsage;
  /** The model/deployment that actually served the request. */
  model: string;
  /** True when served by the offline demo provider (no real model call). */
  demo: boolean;
}

/**
 * A large-language-model provider. Implementations stream tokens and resolve
 * with final usage. `demo` marks providers that don't hit a real model so the
 * UI can label the output honestly.
 */
export interface ILLMProvider {
  readonly id: string;
  readonly model: string;
  readonly demo: boolean;
  /**
   * Stream a completion. Yields text deltas; the async generator's return value
   * is the final result (text + usage).
   */
  stream(
    messages: LLMMessage[],
    params: LLMParams,
  ): AsyncGenerator<LLMStreamChunk, LLMResult, void>;
}

// ---- Forward-looking seams (used by later labs; declared now for stability) --

/** Turns text into a vector embedding (semantic search / RAG). */
export interface IEmbeddingProvider {
  readonly id: string;
  readonly model: string;
  readonly demo: boolean;
  embed(texts: string[]): Promise<number[][]>;
}

export interface VectorRecord<M = Record<string, unknown>> {
  id: string;
  vector: number[];
  metadata: M;
}

export interface VectorMatch<M = Record<string, unknown>> {
  id: string;
  score: number;
  metadata: M;
}

/** A minimal vector store (in-memory cosine now, pgvector later). */
export interface IVectorStore<M = Record<string, unknown>> {
  upsert(records: VectorRecord<M>[]): Promise<void>;
  query(vector: number[], topK: number): Promise<VectorMatch<M>[]>;
  size(): Promise<number>;
}
