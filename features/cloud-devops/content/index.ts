import type { CDModuleContent } from "../types";
import { codeGitCicdContent } from "./code-git-cicd";
import { dockerKubernetesContent } from "./docker-kubernetes";

/**
 * The module content map: slug → authored module content. A module renders its
 * full page only when its slug appears BOTH here and as `status: "published"`
 * in the registry; otherwise the `[module]` route renders the Coming Soon
 * placeholder. Adding a module = author a `<slug>.ts` content file, import it
 * here, and flip the registry entry to "published".
 */
export const CD_MODULE_CONTENT: Record<string, CDModuleContent> = {
  [codeGitCicdContent.slug]: codeGitCicdContent,
  [dockerKubernetesContent.slug]: dockerKubernetesContent,
};
