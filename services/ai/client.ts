import OpenAI, { AzureOpenAI } from "openai";
import { env, isAzureConfigured } from "@/lib/env";

export class AiNotConfiguredError extends Error {
  constructor() {
    super(
      "Azure OpenAI is not configured. Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY.",
    );
    this.name = "AiNotConfiguredError";
  }
}

let cached: OpenAI | null = null;

/**
 * Newer Azure models (GPT-5 family) are served via the versionless "v1" API on
 * the `*.services.ai.azure.com/openai/v1` surface, which the classic
 * `AzureOpenAI` client (with its `api-version` query param) can't reach — it
 * returns "API version not supported". We detect that surface from the endpoint
 * and fall back to the standard OpenAI client with a custom baseURL. Override
 * with AZURE_OPENAI_API_STYLE = "v1" | "classic".
 */
function isV1Endpoint(): boolean {
  const style = process.env.AZURE_OPENAI_API_STYLE?.toLowerCase();
  if (style === "v1") return true;
  if (style === "classic") return false;
  const ep = env.azureEndpoint ?? "";
  return ep.includes("/openai/v1") || ep.includes("services.ai.azure.com");
}

export function getAzureClient(): OpenAI {
  if (!isAzureConfigured) throw new AiNotConfiguredError();
  if (!cached) {
    if (isV1Endpoint()) {
      // Versionless v1 API: standard OpenAI client pointed at .../openai/v1.
      // The deployment name is passed as `model` on each request.
      const base = env.azureEndpoint!.replace(/\/+$/, "");
      const baseURL = base.endsWith("/openai/v1") ? base : `${base}/openai/v1`;
      cached = new OpenAI({ baseURL, apiKey: env.azureApiKey! });
    } else {
      cached = new AzureOpenAI({
        endpoint: env.azureEndpoint!,
        apiKey: env.azureApiKey!,
        apiVersion: env.azureApiVersion,
        deployment: env.azureDeployment,
      });
    }
  }
  return cached;
}

/** Azure deployment name doubles as the model id in requests. */
export const MODEL = env.azureDeployment;

/**
 * GPT-5 / o-series ("reasoning") models reject `max_tokens` and any non-default
 * `temperature`; they require `max_completion_tokens` instead and only accept
 * the default temperature. We detect the family from the deployment name and
 * shape request params accordingly so the same code works on both old and new
 * models. Override detection with AZURE_OPENAI_MODEL_FAMILY = "reasoning" | "chat".
 */
const REASONING_NAME = /(gpt-5|gpt5|o1|o3|o4|luna|sol|terra)/i;

export function isReasoningModel(): boolean {
  const override = process.env.AZURE_OPENAI_MODEL_FAMILY?.toLowerCase();
  if (override === "reasoning") return true;
  if (override === "chat" || override === "legacy") return false;
  return REASONING_NAME.test(env.azureDeployment);
}

export interface CompletionTuning {
  /** Desired output-token budget. */
  maxTokens?: number;
  /** Sampling temperature; ignored for reasoning models. */
  temperature?: number;
}

/**
 * Build model-appropriate token/temperature params. For reasoning models the
 * budget also has to cover hidden reasoning tokens, so we apply a floor to
 * avoid empty responses.
 */
export function tuneParams(t: CompletionTuning): Record<string, number> {
  const reasoning = isReasoningModel();
  const params: Record<string, number> = {};
  if (t.maxTokens != null) {
    if (reasoning) params.max_completion_tokens = Math.max(t.maxTokens, 2048);
    else params.max_tokens = t.maxTokens;
  }
  if (t.temperature != null && !reasoning) params.temperature = t.temperature;
  return params;
}
