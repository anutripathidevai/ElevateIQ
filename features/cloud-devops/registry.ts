import type {
  CDArea,
  CDDifficulty,
  CDModuleMeta,
} from "./types";

/**
 * The Cloud, DevOps & Production Engineering registry — the single source of
 * truth for the landing page and navigation. Adding a module here makes it
 * appear on the landing page automatically; authoring its content file (and
 * flipping `status` to "published") makes its page render. No UI/route changes.
 *
 * Kept free of React/icon imports so it can be pulled into the lightweight
 * global-search index without bloating the client bundle.
 */

// ---- Difficulty + area vocabularies ----------------------------------------

/** Ordered seniority bands used for filtering and badges. */
export const CD_DIFFICULTIES: CDDifficulty[] = ["Senior", "Staff", "Architect"];

/** The eight interview areas, in the canonical distribution order. */
export const CD_AREAS: CDArea[] = [
  "Git & CI/CD",
  "Jenkins & Deployment",
  "Docker & Kubernetes",
  "Azure & Infrastructure",
  "APIs & WebJobs",
  "Kafka",
  "Observability",
  "Production Troubleshooting",
];

// ---- Module catalog --------------------------------------------------------

/**
 * The eight modules in reading order. Modules are published incrementally:
 * a "coming-soon" module still appears on the landing page (so the full course
 * shape is visible) but renders a polished placeholder until its content file
 * is authored and its status flipped to "published".
 */
export const CD_MODULES: CDModuleMeta[] = [
  {
    slug: "code-git-cicd",
    order: 1,
    title: "Code → Git → CI/CD",
    summary:
      "How code becomes a deployable artifact — branching strategy, reviews, build-once/deploy-many, environment promotion, and pipeline gates.",
    topics: ["Git", "Branching", "CI/CD", "Artifacts", "Environments"],
    estimatedMinutes: 45,
    accent: "rose",
    status: "published",
  },
  {
    slug: "jenkins-deployment-strategies",
    order: 2,
    title: "Jenkins & Deployment Strategies",
    summary:
      "Designing reliable pipelines and safe releases — Jenkinsfile, gates, rollback, and rolling / blue-green / canary / feature-flag deployments.",
    topics: ["Jenkins", "Pipelines", "Blue-Green", "Canary", "Rollback"],
    estimatedMinutes: 45,
    accent: "rose",
    status: "coming-soon",
  },
  {
    slug: "docker-kubernetes",
    order: 3,
    title: "Docker & Kubernetes",
    summary:
      "Containers and orchestration for production — images and layers, Deployments, Services, Ingress, probes, HPA, rollouts, and failure modes.",
    topics: ["Docker", "Kubernetes", "Probes", "HPA", "Rollouts"],
    estimatedMinutes: 60,
    accent: "rose",
    status: "published",
  },
  {
    slug: "azure-deployment-infrastructure",
    order: 4,
    title: "Azure Deployment & Infrastructure",
    summary:
      "Production Azure — subscriptions, RBAC, Managed Identity, Key Vault, App Service / Functions / AKS, and Infrastructure as Code with Bicep.",
    topics: ["Azure", "RBAC", "Key Vault", "AKS", "IaC / Bicep"],
    estimatedMinutes: 50,
    accent: "rose",
    status: "coming-soon",
  },
  {
    slug: "apis-webjobs-kafka",
    order: 5,
    title: "APIs, WebJobs & Kafka",
    summary:
      "Service communication at scale — API design (auth, rate limiting, idempotency, versioning), background WebJobs, and Kafka streaming.",
    topics: ["APIs", "Idempotency", "WebJobs", "Kafka", "Consumer Lag"],
    estimatedMinutes: 55,
    accent: "rose",
    status: "coming-soon",
  },
  {
    slug: "observability-newrelic-splunk",
    order: 6,
    title: "Observability: New Relic & Splunk",
    summary:
      "Finding production problems fast — metrics, logs, and traces, and the alert → trace → logs → root cause investigation mindset.",
    topics: ["Metrics", "Logs", "Traces", "New Relic", "Splunk"],
    estimatedMinutes: 40,
    accent: "rose",
    status: "coming-soon",
  },
  {
    slug: "production-troubleshooting",
    order: 7,
    title: "Production Troubleshooting",
    summary:
      "A repeatable incident framework — Detect → Scope → Measure → Trace → Root Cause → Mitigate → Fix → Prevent — across eight real scenarios.",
    topics: ["Incidents", "Debugging", "Latency", "503s", "Root Cause"],
    estimatedMinutes: 45,
    accent: "rose",
    status: "coming-soon",
  },
  {
    slug: "senior-staff-architecture",
    order: 8,
    title: "Senior / Staff Architecture",
    summary:
      "Tying it together — reliability, scalability, zero-downtime deployment, security, observability, and cost as production architecture principles.",
    topics: ["Reliability", "Scalability", "Zero-Downtime", "Security", "Cost"],
    estimatedMinutes: 45,
    accent: "rose",
    status: "coming-soon",
  },
];

/** Course-level facts surfaced on the landing page and cards. */
export const CD_COURSE = {
  slug: "cloud-devops",
  title: "Cloud, DevOps & Production Engineering",
  subtitle: "Senior → Staff → Architect Interview Preparation",
  description:
    "Learn how modern applications move from code to production — and how senior engineers design, deploy, monitor, scale, and troubleshoot them.",
  moduleCount: 8,
  hours: "6–8 Hours",
  questionCount: 50,
  accent: "rose" as const,
  /** The headline technologies, shown as a chip row. */
  technologies: [
    "Git",
    "CI/CD",
    "Jenkins",
    "Docker",
    "Kubernetes",
    "Azure",
    "APIs",
    "WebJobs",
    "Kafka",
    "New Relic",
    "Splunk",
  ],
};

/** Target distribution of the 50-question bank across areas (spec §6). */
export const CD_AREA_TARGETS: Record<CDArea, number> = {
  "Git & CI/CD": 6,
  "Jenkins & Deployment": 6,
  "Docker & Kubernetes": 10,
  "Azure & Infrastructure": 9,
  "APIs & WebJobs": 5,
  Kafka: 5,
  Observability: 4,
  "Production Troubleshooting": 5,
};
