import type { CDModuleContent } from "../types";

/**
 * Module 4 — Azure Deployment & Infrastructure.
 * Senior-level focus: choosing the right Azure compute, releasing without
 * downtime, and handling identity, secrets, and infrastructure as code.
 */
export const azureDeploymentInfrastructureContent: CDModuleContent = {
  slug: "azure-deployment-infrastructure",
  introMD: `Azure gives you many ways to run a service and many ways to get it wrong. Senior interviews test whether you can **choose the right compute**, **release without downtime**, and handle **identity, secrets, and infrastructure** the way a platform team would.

This module covers the resource hierarchy and RBAC, App Service vs Functions vs AKS, deployment slots for zero-downtime releases, Key Vault with managed identity, and infrastructure as code with Bicep.`,
  coreFlow: {
    title: "From subscription to a running app",
    body: `Subscription
 -> Resource Group (lifecycle + RBAC boundary)
 -> Compute (App Service / Functions / AKS)
 -> Managed Identity -> Key Vault (secrets, no passwords in config)
 -> Deploy to staging slot -> warm up -> swap -> production`,
  },
  seniorFocus: [
    "Choose App Service vs Functions vs AKS by workload shape, not fashion.",
    "Release with zero downtime using slots and warm-up before swap.",
    "Use managed identity + Key Vault so no secret ever lives in app config.",
    "Model RBAC on the resource-group boundary with least privilege.",
    "Define infrastructure as code (Bicep) so environments are reproducible.",
  ],
  concepts: [
    {
      id: "hierarchy-rbac",
      title: "Resource hierarchy, RBAC & managed identity",
      whatMD: `Azure is organised **subscription -> resource group -> resource**. The resource group is the lifecycle and access boundary. **RBAC** grants roles at a scope; **managed identity** gives a resource an Azure AD identity so it authenticates to other services without a stored secret.`,
      howMD: `Assign the narrowest role at the smallest scope (least privilege). A service uses its managed identity to read from Key Vault or a database — there is no connection password to leak because Azure AD issues short-lived tokens.`,
      interviewPoints: [
        "Resource group is the RBAC and lifecycle boundary — group by lifecycle.",
        "Grant least privilege: narrow role at the smallest useful scope.",
        "Managed identity removes stored secrets — Azure AD issues short-lived tokens.",
        "Prefer role assignments over per-service credentials you must rotate.",
      ],
      realWorldMD: `An app reads its database with a managed identity; there is no password anywhere in config, so a leaked app setting cannot expose the database.`,
      interviewQuestions: [
        "How do you give a service access to a database without storing a password?",
      ],
    },
    {
      id: "compute-options",
      title: "App Service vs Functions vs AKS",
      whatMD: `Three main ways to run code. **App Service** is a managed platform for long-running web apps. **Functions** are event-driven and scale to zero. **AKS** (managed Kubernetes) gives full control for complex, multi-service platforms.`,
      diagram: {
        title: "Pick by workload shape",
        body: `App Service : steady web app/API, least ops, slots built in
Functions   : spiky/event-driven, scale to zero, pay per exec
AKS         : many services, custom networking, most control + ops`,
      },
      interviewPoints: [
        "App Service: managed, simple, deployment slots — best default for a web API.",
        "Functions: event-driven, scale to zero, watch cold starts.",
        "AKS: maximum control for a platform, but you own the operational cost.",
        "Choose by workload shape and team capacity, not by hype.",
      ],
      realWorldMD: `A steady REST API runs on App Service for simplicity; a bursty image-processing job runs on Functions so it scales to zero between spikes.`,
      interviewQuestions: [
        "When would you choose App Service over AKS, and when the reverse?",
      ],
    },
    {
      id: "slots-zero-downtime",
      title: "Deployment slots & zero-downtime releases",
      whatMD: `A **deployment slot** is a live copy of the app with its own hostname. You deploy to a **staging** slot, warm it up, then **swap** it with production so the switch is instant and reversible.`,
      howMD: `The swap only proceeds after warm-up requests hit the staging slot, so the first real user never pays cold-start. If the new release misbehaves, swap back — the previous version is still running in the other slot.`,
      interviewPoints: [
        "Swap is near-instant and reversible — swap back to roll back.",
        "Warm up the staging slot before swap so users avoid cold start.",
        "Slot-sticky settings keep environment-specific config on the right slot.",
        "Any DB change must be backward compatible during the swap window.",
      ],
      realWorldMD: `A release deploys to staging, warms up, and swaps at 2am; error rate is watched, and a bad build is reverted with a second swap in seconds.`,
      interviewQuestions: [
        "Design a zero-downtime deploy for an App Service API.",
      ],
    },
    {
      id: "keyvault-secrets",
      title: "Key Vault & secret management",
      whatMD: `**Key Vault** centralises secrets, keys, and certificates. Combined with managed identity, apps read secrets at runtime without ever storing them in config or source.`,
      howMD: `The app authenticates to Key Vault with its managed identity and fetches secrets on startup or on demand. Secrets rotate in one place; access is audited; nothing sensitive lives in app settings or the repo.`,
      interviewPoints: [
        "Central store for secrets, keys, and certs with full audit logging.",
        "App reads secrets via managed identity — no secret in config or source.",
        "Rotate in one place; consumers pick up the new value automatically.",
        "Reference Key Vault from app settings rather than pasting raw secrets.",
      ],
      realWorldMD: `A leaked database password is rotated in Key Vault once; every service picks up the new value on next fetch with no redeploy.`,
    },
    {
      id: "iac-bicep",
      title: "Infrastructure as code with Bicep",
      whatMD: `**Bicep** describes Azure infrastructure declaratively. Applying it creates or updates resources to match the file, so environments are reproducible and reviewable instead of hand-clicked.`,
      howMD: `The same template deploys dev, staging, and prod with different parameters, eliminating drift. Changes go through pull request, so infra is versioned and auditable like application code.`,
      interviewPoints: [
        "Declarative and idempotent — apply repeatedly to reach the desired state.",
        "One parameterised template builds every environment identically.",
        "Infra changes are reviewed in PRs — versioned and auditable.",
        "Eliminates config drift from manual portal edits.",
      ],
      realWorldMD: `A new region is stood up by running the same Bicep template with region parameters — no portal clicking, and it matches prod exactly.`,
      interviewQuestions: [
        "Why prefer infrastructure as code over configuring the portal by hand?",
      ],
    },
  ],
  keyTakeaways: [
    "Group resources by lifecycle and grant least-privilege RBAC at the right scope.",
    "Choose App Service, Functions, or AKS by workload shape and team capacity.",
    "Use deployment slots with warm-up for instant, reversible zero-downtime releases.",
    "Combine managed identity and Key Vault so no secret lives in config or source.",
    "Describe infrastructure as code with Bicep for reproducible, reviewable environments.",
  ],
  relatedQuestionIds: [
    "azure-zero-downtime-api",
    "azure-slots-swap",
    "azure-keyvault-secrets",
    "azure-deploy-permissions",
    "azure-app-service-vs-aks",
    "azure-iac-bicep",
  ],
};
