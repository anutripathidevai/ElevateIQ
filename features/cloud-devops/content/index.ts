import type { CDModuleContent } from "../types";
import { codeGitCicdContent } from "./code-git-cicd";
import { jenkinsDeploymentStrategiesContent } from "./jenkins-deployment-strategies";
import { dockerKubernetesContent } from "./docker-kubernetes";
import { azureDeploymentInfrastructureContent } from "./azure-deployment-infrastructure";
import { apisWebjobsKafkaContent } from "./apis-webjobs-kafka";
import { observabilityNewrelicSplunkContent } from "./observability-newrelic-splunk";
import { productionTroubleshootingContent } from "./production-troubleshooting";
import { seniorStaffArchitectureContent } from "./senior-staff-architecture";

/**
 * The module content map: slug → authored module content. A module renders its
 * full page only when its slug appears BOTH here and as `status: "published"`
 * in the registry; otherwise the `[module]` route renders the Coming Soon
 * placeholder. Adding a module = author a `<slug>.ts` content file, import it
 * here, and flip the registry entry to "published".
 */
export const CD_MODULE_CONTENT: Record<string, CDModuleContent> = {
  [codeGitCicdContent.slug]: codeGitCicdContent,
  [jenkinsDeploymentStrategiesContent.slug]: jenkinsDeploymentStrategiesContent,
  [dockerKubernetesContent.slug]: dockerKubernetesContent,
  [azureDeploymentInfrastructureContent.slug]: azureDeploymentInfrastructureContent,
  [apisWebjobsKafkaContent.slug]: apisWebjobsKafkaContent,
  [observabilityNewrelicSplunkContent.slug]: observabilityNewrelicSplunkContent,
  [productionTroubleshootingContent.slug]: productionTroubleshootingContent,
  [seniorStaffArchitectureContent.slug]: seniorStaffArchitectureContent,
};
