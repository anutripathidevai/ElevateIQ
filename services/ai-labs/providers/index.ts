import { isAzureConfigured } from "@/lib/env";
import { AzureLLMProvider } from "./azure-llm";
import { DemoLLMProvider } from "./demo-llm";
import type { ILLMProvider } from "./types";

/**
 * Provider factory. Returns the real Azure provider when configured, otherwise a
 * demo provider so labs still run in the guest-mode deployment. Callers depend
 * only on `ILLMProvider`, so swapping or failing over providers never touches
 * the routes or UI.
 */
export function getLLMProvider(): ILLMProvider {
  return isAzureConfigured ? new AzureLLMProvider() : new DemoLLMProvider();
}

export * from "./types";
export { AzureLLMProvider } from "./azure-llm";
export { DemoLLMProvider } from "./demo-llm";
