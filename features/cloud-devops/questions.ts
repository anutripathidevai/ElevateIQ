import type { CDQuestion } from "./types";

/**
 * The Cloud, DevOps & Production Engineering interview question bank.
 *
 * The finished bank holds 50 senior-level, scenario-driven questions
 * distributed across the eight areas (see CD_AREA_TARGETS). This is the first
 * batch; more are appended by area. Every question is Senior+ and tests
 * reasoning, not memorisation. House style: no backticks / interpolation in
 * prose (content lives in template literals).
 */
export const CD_QUESTIONS: CDQuestion[] = [
  // ---- Git & CI/CD ---------------------------------------------------------
  {
    id: "cicd-50-microservices",
    area: "Git & CI/CD",
    difficulty: "Staff",
    question:
      "Design a CI/CD pipeline for 50 microservices where each service can be independently built, deployed, and rolled back.",
    tests: [
      "Independent deployability and blast-radius control",
      "Build-once/deploy-many and artifact versioning",
      "Pipeline standardisation across many teams",
      "Rollback strategy at service granularity",
    ],
    strongAnswerMD: `Give each service its own pipeline triggered only by changes to its path, producing one **immutable, versioned artifact** (a container image tagged with the commit SHA). Promote that same artifact through dev → staging → prod with environment-specific config injected at deploy time.

Standardise pipelines with a shared, versioned template so 50 services do not drift; each service overrides only what is unique. Store deployments declaratively (GitOps) so the desired version per environment is auditable and a rollback is reverting to the previous artifact tag. Independent deployability means a bad release affects one service, and rollback is a fast image-tag swap plus readiness-gated rollout.`,
    keyPoints: [
      "One pipeline per service, path-filtered triggers, no monorepo-wide rebuilds.",
      "Immutable image tagged by SHA; promote the same artifact across environments.",
      "Shared, versioned pipeline template prevents drift across 50 services.",
      "GitOps/declarative deploys make the deployed version auditable per env.",
      "Rollback = redeploy the previous known-good tag, gated by readiness probes.",
      "Contract tests guard cross-service compatibility before promotion.",
    ],
    followUps: [
      "How do you prevent a shared library bump from silently breaking 50 services at once?",
      "Where do you run integration tests when services deploy independently?",
    ],
    tags: ["pipeline", "microservices", "rollback", "artifacts", "gitops"],
  },
  {
    id: "cicd-build-once",
    area: "Git & CI/CD",
    difficulty: "Senior",
    question:
      "A bug appears only in production, never in staging, even though 'the same code' was deployed. How do you prevent this class of problem?",
    tests: [
      "Understanding of build-once/deploy-many",
      "Environment parity and config separation",
      "Artifact immutability",
    ],
    strongAnswerMD: `The usual cause is rebuilding per environment, so staging and prod are not actually the same bytes — a different base image, dependency version, or build flag slips in. Fix it by **building the artifact once** and promoting that exact image to every environment, with only configuration differing.

Make artifacts immutable and versioned, pin base images and dependencies, and inject environment differences as config/secrets at runtime. Then 'works in staging' genuinely means 'works in prod', because the artifact is identical and only the config changed.`,
    keyPoints: [
      "Rebuilding per environment introduces drift; build once instead.",
      "Promote one immutable, versioned artifact through all environments.",
      "Pin base images and dependency versions for reproducibility.",
      "Environment differences belong in config/secrets injected at runtime.",
      "Keep staging config as close to prod as possible for real parity.",
    ],
    followUps: [
      "What environment differences are legitimate, and how do you manage them safely?",
    ],
    tags: ["build-once", "parity", "artifacts", "config"],
  },
  {
    id: "cicd-branching-scale",
    area: "Git & CI/CD",
    difficulty: "Senior",
    question:
      "Design a Git branching strategy for 50 engineers shipping daily. What prevents merge conflicts and broken mains?",
    tests: [
      "Branching model trade-offs at scale",
      "Decoupling deploy from release",
      "Enforcement via branch protection and CI",
    ],
    strongAnswerMD: `Use **trunk-based development**: short-lived branches merged to main multiple times a day, with unfinished work hidden behind feature flags so main is always releasable. Long-lived branches are what create merge hell, so you eliminate them.

Protect main with required green CI and required reviews, keep PRs small, and run CI on every push for fast feedback. Feature flags decouple deploy from release, so merging incomplete work is safe. This keeps integration continuous and the main branch shippable at all times.`,
    keyPoints: [
      "Trunk-based development with short-lived branches avoids long-lived merge pain.",
      "Feature flags hide incomplete work and decouple deploy from release.",
      "Branch protection: required reviews + green CI before merge.",
      "Small, frequent PRs integrate cleanly; large ones cause conflicts.",
      "CI on every push surfaces breakage within minutes.",
    ],
    followUps: [
      "How do you keep feature flags from becoming permanent technical debt?",
    ],
    tags: ["branching", "trunk-based", "feature-flags", "scale"],
  },

  // ---- Jenkins & Deployment ------------------------------------------------
  {
    id: "deploy-zero-downtime-canary",
    area: "Jenkins & Deployment",
    difficulty: "Staff",
    question:
      "Design a safe release strategy for a critical API that must never take downtime and must limit the blast radius of a bad deploy.",
    tests: [
      "Blue-green vs canary trade-offs",
      "Automated rollback triggers",
      "Progressive delivery and observability",
    ],
    strongAnswerMD: `Use **canary** for blast-radius control: route a small percentage of traffic (say 1–5%) to the new version, watch error rate and latency against the stable version, then progressively shift traffic if metrics stay healthy. Automate rollback on a metric breach so a bad release self-heals.

Blue-green is the simpler alternative — deploy the new version alongside the old, cut over instantly, and keep the old environment warm for instant rollback. Canary gives finer risk control and less wasted capacity; blue-green gives the fastest, cleanest cutover. Both need readiness gating and strong metrics to be safe.`,
    keyPoints: [
      "Canary shifts traffic gradually and limits blast radius to a small cohort.",
      "Automated rollback on error-rate/latency breach removes human latency.",
      "Blue-green enables instant cutover and instant rollback via a warm old env.",
      "Both require readiness probes so traffic only hits healthy instances.",
      "Feature flags allow release without redeploy for the riskiest changes.",
      "Comparison must be against the live baseline, not absolute thresholds.",
    ],
    followUps: [
      "What metrics trigger an automatic canary rollback, and over what window?",
      "How do database migrations complicate blue-green, and how do you handle them?",
    ],
    tags: ["canary", "blue-green", "zero-downtime", "rollback", "progressive-delivery"],
  },

  // ---- Docker & Kubernetes -------------------------------------------------
  {
    id: "k8s-503-debug",
    area: "Docker & Kubernetes",
    difficulty: "Staff",
    question:
      "Your Kubernetes deployment completed successfully, but users are receiving 503 errors. Walk through your debugging approach.",
    tests: [
      "Service-to-pod readiness model",
      "Systematic top-down debugging",
      "Probe and endpoint reasoning",
    ],
    strongAnswerMD: `A 503 means the request reached the edge but no healthy backend served it — so the **Service has no ready endpoints**. Work the path top-down: Ingress → Service → Endpoints → Pods.

Check the Service's endpoints; if empty, no pods are Ready. Then check pod status and the **readiness probe** — pods may be Running but failing readiness (bad probe path, slow warm-up, missing dependency), so the Service pulls them from rotation. Also verify the Service selector matches the new pods' labels and that the container is actually listening on the target port. The 'deploy succeeded' just means the objects applied; readiness is what gates traffic.`,
    keyPoints: [
      "503 with a successful deploy usually means zero Ready endpoints behind the Service.",
      "Inspect Service endpoints first — empty means no pod passed readiness.",
      "Readiness failures keep pods Running but out of rotation.",
      "Check probe path/port, warm-up time, and downstream dependencies.",
      "Confirm the Service selector matches the new pod labels.",
      "A too-aggressive readiness timeout can fail healthy-but-slow pods.",
    ],
    followUps: [
      "How would a missing ConfigMap key produce this exact symptom?",
      "What maxUnavailable setting could cause a brief 503 window during rollout?",
    ],
    tags: ["kubernetes", "503", "readiness", "service", "debugging"],
  },
  {
    id: "k8s-crashloop",
    area: "Docker & Kubernetes",
    difficulty: "Senior",
    question:
      "Pods are stuck in CrashLoopBackOff after a deploy. How do you find and fix the cause?",
    tests: [
      "Crash-loop diagnosis workflow",
      "Liveness probe misconfiguration",
      "Config/secret and resource failures",
    ],
    strongAnswerMD: `CrashLoopBackOff means the container starts, exits/fails, and Kubernetes restarts it with growing backoff. Read the logs of the current and **previous** container instance first — most causes show there: a missing env var/secret, a failed dependency at startup, or an unhandled exception.

If logs look fine but it still restarts, suspect the **liveness probe** — if it points at a slow or missing endpoint, the kubelet kills a healthy container. Also check for OOM kills (memory limit too low) and missing ConfigMaps/Secrets. Fix the root cause, add a startup probe for slow boots, and set realistic resource limits.`,
    keyPoints: [
      "Read current and previous container logs before anything else.",
      "Common causes: missing secret/config, failed startup dependency, uncaught exception.",
      "A misconfigured liveness probe restarts healthy containers.",
      "OOM kills (exit 137) mean the memory limit is too low.",
      "Use a startup probe so liveness does not kill slow-booting apps.",
      "Backoff grows exponentially, so the pod looks 'stuck' between restarts.",
    ],
    followUps: [
      "How do you distinguish an OOM kill from an application crash?",
    ],
    tags: ["kubernetes", "crashloop", "liveness", "oom", "debugging"],
  },
  {
    id: "k8s-hpa-not-scaling",
    area: "Docker & Kubernetes",
    difficulty: "Staff",
    question:
      "CPU usage and latency are climbing, but the Horizontal Pod Autoscaler is not adding pods. Why, and how do you fix it?",
    tests: [
      "HPA math relative to resource requests",
      "Metrics pipeline availability",
      "Choosing the right scaling signal",
    ],
    strongAnswerMD: `HPA scales on utilisation **relative to the pod's CPU request**, not absolute usage. If requests are set far too high, real usage never crosses the target percentage, so HPA stays put while pods are actually saturated. Right-size requests from observed percentiles and the HPA reacts correctly.

Also verify the metrics pipeline (metrics-server / adapter) is healthy — no metrics means no scaling. Check maxReplicas is not already hit and that the workload is not memory- or IO-bound (CPU is then a poor proxy; scale on RPS or queue depth via custom metrics instead).`,
    keyPoints: [
      "HPA compares usage to the CPU request; oversized requests suppress scaling.",
      "Broken metrics-server/adapter means HPA has no data and will not scale.",
      "Confirm maxReplicas headroom actually exists.",
      "CPU is a bad signal for IO/memory-bound work — use custom metrics.",
      "Right-size requests from real p95 usage, not guesses.",
      "Scale-up stabilisation windows can also delay reaction.",
    ],
    followUps: [
      "When would you scale on queue depth or requests-per-second instead of CPU?",
    ],
    tags: ["kubernetes", "hpa", "autoscaling", "requests", "metrics"],
  },
  {
    id: "docker-image-size",
    area: "Docker & Kubernetes",
    difficulty: "Senior",
    question:
      "Your service image is 1.2 GB and scale-ups are slow because nodes take too long to pull it. How do you reduce image size and speed up starts?",
    tests: [
      "Multi-stage builds and layer caching",
      "Base image selection",
      "Impact of image size on autoscaling latency",
    ],
    strongAnswerMD: `Use a **multi-stage build**: compile in a full SDK image, then copy only the runtime artifact into a slim base (distroless or alpine-style). This removes build tools from the shipped image and typically cuts size by an order of magnitude, so pulls during scale-up are far faster.

Order Dockerfile layers stable-to-volatile so dependency layers stay cached, pin the base image for reproducibility, and use a registry close to the cluster (or pre-pull/cache) to shrink pull time. Smaller images also reduce the attack surface.`,
    keyPoints: [
      "Multi-stage builds keep SDK/build tools out of the runtime image.",
      "Slim/distroless base images cut size and attack surface.",
      "Layer ordering (stable first) maximises build-cache reuse.",
      "Smaller images pull faster, so autoscaling adds capacity sooner.",
      "Co-locate the registry or pre-pull images to reduce cold-start pulls.",
    ],
    followUps: [
      "How does image pull policy interact with cold-start latency during a spike?",
    ],
    tags: ["docker", "multi-stage", "image-size", "autoscaling"],
  },

  // ---- Azure & Infrastructure ----------------------------------------------
  {
    id: "azure-zero-downtime-api",
    area: "Azure & Infrastructure",
    difficulty: "Staff",
    question:
      "Design a zero-downtime deployment strategy for a critical API on Azure.",
    tests: [
      "Azure deployment primitives (slots / AKS rollouts)",
      "Health-gated cutover",
      "Backward-compatible database changes",
    ],
    strongAnswerMD: `On App Service, use **deployment slots**: deploy to a staging slot, warm it up, and swap — the platform only routes traffic after the slot reports healthy, giving an instant, reversible cutover. On AKS, use a rolling update with readiness probes and PodDisruptionBudgets, or a canary via the ingress.

The subtle part is the database: make schema changes **backward compatible** (expand/contract) so old and new versions run simultaneously during the rollout. Combine health-gated cutover, warm instances, and expand-contract migrations for genuine zero downtime, with instant rollback by swapping back.`,
    keyPoints: [
      "App Service slots give warm-up + health-gated swap + instant rollback.",
      "AKS rolling updates need readiness probes and a PodDisruptionBudget.",
      "Expand/contract migrations keep old and new versions compatible mid-rollout.",
      "Never ship a breaking schema change in the same release that reads it.",
      "Keep the previous version warm for immediate rollback.",
      "Health checks must gate the cutover, not just report status.",
    ],
    followUps: [
      "Walk through an expand-contract migration for renaming a column with zero downtime.",
    ],
    tags: ["azure", "slots", "aks", "zero-downtime", "migrations"],
  },
  {
    id: "azure-deploy-permissions",
    area: "Azure & Infrastructure",
    difficulty: "Senior",
    question:
      "An automated Azure deployment fails with an authorization error when creating resources. How do you diagnose and fix it without weakening security?",
    tests: [
      "RBAC and Managed Identity model",
      "Least-privilege troubleshooting",
      "Secret-free automation",
    ],
    strongAnswerMD: `The deploy identity lacks the RBAC role needed at the target scope. Identify the exact action and scope from the error, then grant the **minimum** role (for example a scoped Contributor or a specific built-in role) at the right resource group or subscription scope — not a broad owner grant.

Use a **Managed Identity** or a workload-federated service principal for the pipeline so there are no long-lived secrets. Confirm role assignments have propagated, verify the scope matches where resources are created, and encode the role assignments in IaC so the permission is reproducible and auditable rather than a manual click.`,
    keyPoints: [
      "Authorization errors mean a missing RBAC role at the operation's scope.",
      "Grant least-privilege built-in roles at the narrowest scope that works.",
      "Use Managed Identity / federated credentials — avoid static secrets.",
      "Role assignments take time to propagate; confirm before retrying.",
      "Codify RBAC in IaC so permissions are reproducible and reviewable.",
    ],
    followUps: [
      "How do you automate RBAC so a new environment gets correct permissions by default?",
    ],
    tags: ["azure", "rbac", "managed-identity", "least-privilege", "iac"],
  },

  // ---- Kafka ---------------------------------------------------------------
  {
    id: "kafka-consumer-lag",
    area: "Kafka",
    difficulty: "Staff",
    question:
      "Kafka consumer lag is continuously increasing while producer traffic remains constant. How would you investigate and fix it?",
    tests: [
      "Consumer throughput vs partition parallelism",
      "Rebalancing and slow-consumer diagnosis",
      "Idempotency and ordering constraints",
    ],
    strongAnswerMD: `Constant producer rate with growing lag means **consumers cannot keep up**. Parallelism in Kafka is bounded by partitions, so if you have fewer consumers than partitions (or a slow processing step), lag grows. Check per-partition lag, consumer CPU, and processing time per message.

Fixes: add consumers up to the partition count (or increase partitions to raise the ceiling), speed up per-message work (batch downstream writes, remove synchronous slow calls), and make processing idempotent so you can safely increase concurrency. Watch for frequent **rebalances** — a too-low session timeout or long processing between polls causes the group to keep rebalancing, which stalls consumption.`,
    keyPoints: [
      "Consumer parallelism is capped by partition count.",
      "Growing lag at constant input means consumer throughput is the bottleneck.",
      "Add consumers up to partitions, or add partitions to raise the ceiling.",
      "Slow downstream calls dominate processing time — batch or async them.",
      "Frequent rebalances (short session timeout / slow polls) stall the group.",
      "Idempotent processing lets you scale concurrency safely.",
    ],
    followUps: [
      "Why does adding more consumers than partitions not help?",
      "How do you keep ordering guarantees while increasing throughput?",
    ],
    tags: ["kafka", "consumer-lag", "partitions", "rebalance", "throughput"],
  },

  // ---- Observability -------------------------------------------------------
  {
    id: "obs-latency-triage",
    area: "Observability",
    difficulty: "Senior",
    question:
      "API latency jumped 10x after a deploy. Using metrics, traces, and logs, how do you localise the cause?",
    tests: [
      "Metrics → traces → logs investigation flow",
      "Distinguishing app vs dependency vs infra",
      "Using the three pillars together",
    ],
    strongAnswerMD: `Start at **metrics** to scope it: is latency up everywhere or on one endpoint, one version, one region? Correlate with the deploy time. Then use a **distributed trace** of a slow request to find which span exploded — your code, a downstream service, the database, or an external call.

Once the slow span is identified, drop into **logs** for that service/span to find the concrete cause (a slow query, a retry storm, a cache miss, a connection-pool exhaustion). The discipline is alert → metrics (scope) → trace (locate) → logs (root cause), rather than guessing. Compare against the pre-deploy baseline throughout.`,
    keyPoints: [
      "Metrics scope the blast radius (endpoint, version, region).",
      "Distributed traces localise the slow span across services.",
      "Logs on the identified span reveal the concrete root cause.",
      "Correlate everything with the deploy timeline and a baseline.",
      "Common culprits: slow query, retry storm, cache miss, pool exhaustion.",
    ],
    followUps: [
      "How do you tell an application regression from a slow downstream dependency?",
    ],
    tags: ["observability", "latency", "tracing", "metrics", "logs"],
  },

  // ---- Git & CI/CD (continued) ---------------------------------------------
  {
    id: "cicd-secrets-management",
    area: "Git & CI/CD",
    difficulty: "Senior",
    question:
      "Secrets are currently hardcoded in pipeline scripts and committed env files. How do you manage secrets across CI/CD safely?",
    tests: [
      "Secret storage and injection at runtime",
      "Least-privilege and rotation",
      "Preventing secret leakage in logs and history",
    ],
    strongAnswerMD: `Never store secrets in the repo or job config. Keep them in a **secrets manager** (Key Vault, Vault, cloud secret store) and inject them into the pipeline at runtime as masked environment variables scoped to the specific job and environment.

Use short-lived, least-privilege credentials — ideally a workload identity / OIDC federation so there are no long-lived static secrets at all. Mask secrets in logs, scan history and PRs for accidental commits, and rotate on a schedule and immediately on suspected exposure. If a secret ever lands in Git history, rotate it — deleting the commit is not enough.`,
    keyPoints: [
      "Secrets live in a manager, not in repos, env files, or job config.",
      "Inject at runtime as masked, environment-scoped variables.",
      "Prefer OIDC/workload identity over long-lived static credentials.",
      "Scan commits/PRs for leaks; rotate on schedule and on exposure.",
      "A leaked secret must be rotated — removing the commit is insufficient.",
    ],
    followUps: [
      "Why is deleting a commit not enough to remediate a leaked secret?",
    ],
    tags: ["secrets", "security", "rotation", "oidc", "pipeline"],
  },
  {
    id: "cicd-flaky-tests",
    area: "Git & CI/CD",
    difficulty: "Senior",
    question:
      "Flaky integration tests randomly fail the pipeline and engineers have started re-running until green. How do you fix this without disabling testing?",
    tests: [
      "Understanding the cost of flakiness (trust erosion)",
      "Quarantine + root-cause approach",
      "Test isolation and determinism",
    ],
    strongAnswerMD: `Blindly re-running trains the team to ignore failures, which is how real regressions ship. Treat flakiness as a defect: detect flaky tests automatically (they pass on retry without code change), **quarantine** them out of the blocking path, and track them so they must be fixed, not forgotten.

Root causes are usually shared state, timing/async assumptions, test-order dependence, or real environment issues. Fix by isolating state per test, replacing sleeps with proper waits, and controlling test data. Quarantine keeps the pipeline trustworthy while the underlying cause is fixed — it is a temporary holding area, not a graveyard.`,
    keyPoints: [
      "Auto-retry as a policy erodes trust and hides real regressions.",
      "Detect flaky tests (pass on retry with no code change) automatically.",
      "Quarantine off the blocking path, but track so they get fixed.",
      "Common causes: shared state, timing/async, test-order coupling.",
      "Fix via isolation, deterministic waits, and controlled test data.",
    ],
    followUps: [
      "How do you stop a quarantine list from becoming permanent tech debt?",
    ],
    tags: ["testing", "flaky", "quarantine", "determinism", "ci"],
  },
  {
    id: "cicd-monorepo-vs-multirepo",
    area: "Git & CI/CD",
    difficulty: "Staff",
    question:
      "Your org is deciding between a monorepo and many repos for 50 services. How does this choice affect CI/CD, and what do you recommend?",
    tests: [
      "Trade-offs of monorepo vs many repos",
      "Affected-build / path-based pipelines",
      "Dependency and release coordination",
    ],
    strongAnswerMD: `Both work; the CI/CD cost differs. A **monorepo** simplifies shared code and atomic cross-service changes but needs affected-build tooling so a one-line change does not rebuild 50 services. **Many repos** give natural isolation and independent pipelines but make shared-library upgrades and coordinated releases harder.

Recommend based on team topology: monorepo with strong build tooling (path filters, build graph, caching) when services are tightly coupled and share a lot; many repos when teams own services independently and release on their own cadence. Either way, standardise pipelines with shared templates and keep each service independently deployable.`,
    keyPoints: [
      "Monorepo: easy shared code + atomic changes, needs affected-build tooling.",
      "Many repos: natural isolation, harder shared-lib and coordinated releases.",
      "Path filters / build graphs stop monorepo rebuilding everything.",
      "Standardise pipelines via shared templates regardless of choice.",
      "Independent deployability matters more than repo layout.",
    ],
    followUps: [
      "In a monorepo, how do you prevent a change rebuilding and redeploying everything?",
    ],
    tags: ["monorepo", "multirepo", "build-graph", "scale", "pipeline"],
  },

  // ---- Jenkins & Deployment (continued) ------------------------------------
  {
    id: "jenkins-pipeline-as-code",
    area: "Jenkins & Deployment",
    difficulty: "Senior",
    question:
      "How do you keep Jenkins pipelines maintainable across dozens of services instead of copy-pasted job configs?",
    tests: [
      "Pipeline-as-code and shared libraries",
      "Standardisation vs per-service flexibility",
      "Versioning the pipeline itself",
    ],
    strongAnswerMD: `Define pipelines as code (a Jenkinsfile in each repo) rather than clicking job config in the UI, so the pipeline is versioned, reviewed, and diffable with the app. Extract the common stages into a **shared library** so 50 services reuse one tested template and override only what is unique.

Version the shared library and pin services to a version so a template change rolls out deliberately, not all at once. This gives standardisation (one place to fix a stage) with controlled flexibility (per-service overrides), and makes pipeline changes auditable like any other code.`,
    keyPoints: [
      "Jenkinsfile in the repo = versioned, reviewed, diffable pipelines.",
      "Shared libraries factor out common stages for reuse across services.",
      "Version and pin the shared library so template changes roll out safely.",
      "Services override only what is genuinely unique to them.",
      "UI-clicked job config is unversioned and drifts — avoid it.",
    ],
    followUps: [
      "How do you roll out a breaking change to a shared pipeline library safely?",
    ],
    tags: ["jenkins", "pipeline-as-code", "shared-library", "standardisation"],
  },
  {
    id: "jenkins-scaling-agents",
    area: "Jenkins & Deployment",
    difficulty: "Staff",
    question:
      "Builds are queuing for 20+ minutes because Jenkins agents are saturated. How do you scale and speed up the build farm?",
    tests: [
      "Elastic build capacity",
      "Build caching and parallelism",
      "Controller vs agent responsibilities",
    ],
    strongAnswerMD: `Two levers: add capacity and do less work. For capacity, run **ephemeral agents** that scale elastically (containers/VMs spun up per build and torn down), so queue depth drives capacity instead of a fixed agent pool. Keep the controller for orchestration only — never run builds on it.

For speed, cache dependencies and build outputs, parallelise independent stages, and only build what changed. Right-size agent resources so builds are not starved. The combination — elastic agents plus caching and affected-only builds — removes the queue without paying for idle capacity.`,
    keyPoints: [
      "Elastic ephemeral agents scale with queue depth; avoid fixed pools.",
      "Keep the controller for orchestration; never build on it.",
      "Cache dependencies and build outputs to cut repeat work.",
      "Parallelise independent stages and build only what changed.",
      "Right-size agent CPU/memory so builds are not resource-starved.",
    ],
    followUps: [
      "What work belongs on the Jenkins controller vs the agents?",
    ],
    tags: ["jenkins", "agents", "scaling", "caching", "parallelism"],
  },
  {
    id: "deploy-blue-green-db",
    area: "Jenkins & Deployment",
    difficulty: "Staff",
    question:
      "You want blue-green deploys, but the release includes a database schema change. How do you avoid breaking the old version during cutover?",
    tests: [
      "Expand/contract (backward-compatible) migrations",
      "Decoupling schema change from code cutover",
      "Rollback safety with data",
    ],
    strongAnswerMD: `Blue-green assumes old and new run against the **same database** during cutover, so a breaking schema change breaks blue while green is live. Use **expand/contract**: first expand the schema in a backward-compatible way (add the new column/table, dual-write, backfill) while both versions still work; deploy the new code; then contract (remove the old column) only after the old version is fully gone.

Never ship a destructive schema change in the same release that depends on it. This keeps rollback safe — you can swap back to blue because the schema still supports it — and turns a risky migration into small, reversible steps.`,
    keyPoints: [
      "Blue and green share the DB, so migrations must be backward compatible.",
      "Expand/contract: add new, dual-write/backfill, migrate code, then remove old.",
      "Never ship a destructive change in the release that first needs it.",
      "Backward-compatible schema keeps blue-green rollback actually possible.",
      "Break one risky migration into small reversible steps.",
    ],
    followUps: [
      "Walk through renaming a column with zero downtime under blue-green.",
    ],
    tags: ["blue-green", "migrations", "expand-contract", "rollback", "database"],
  },
  {
    id: "deploy-rollback-strategy",
    area: "Jenkins & Deployment",
    difficulty: "Senior",
    question:
      "Design an automated rollback strategy so a bad release recovers without waiting for a human to notice.",
    tests: [
      "Metric-driven automated rollback",
      "Immutable artifacts and fast revert",
      "Guardrails against false rollbacks",
    ],
    strongAnswerMD: `Gate the rollout on health signals: after deploying, watch error rate, latency, and key business metrics against the pre-deploy **baseline** over a short bake window. If they breach a threshold, automatically redeploy the previous known-good artifact.

This needs immutable, versioned artifacts so rollback is just redeploying an earlier tag, plus readiness gating so traffic only hits healthy instances. Add guardrails — a minimum sample size and comparison against baseline, not absolute numbers — so you do not roll back on noise. The goal is mean-time-to-recovery in minutes without a human in the loop.`,
    keyPoints: [
      "Compare post-deploy metrics to the baseline over a bake window.",
      "Auto-revert to the previous immutable artifact tag on breach.",
      "Readiness gating ensures traffic only reaches healthy pods.",
      "Guardrails (min samples, baseline comparison) avoid false rollbacks.",
      "Immutable versioned artifacts make rollback fast and deterministic.",
    ],
    followUps: [
      "What metrics and window would trigger an automatic rollback?",
    ],
    tags: ["rollback", "canary", "automation", "mttr", "artifacts"],
  },
  {
    id: "deploy-feature-flags",
    area: "Jenkins & Deployment",
    difficulty: "Senior",
    question:
      "How do feature flags change your deployment strategy, and what risks do they introduce?",
    tests: [
      "Decoupling deploy from release",
      "Progressive rollout and kill switches",
      "Flag lifecycle and debt",
    ],
    strongAnswerMD: `Feature flags **decouple deploy from release**: you can ship code to production dark, then turn a feature on for a cohort, ramp it, and flip it off instantly if it misbehaves — a kill switch without a redeploy. That makes trunk-based development and continuous deployment safe even with unfinished work merged.

The risks are combinatorial testing (many flag states), stale flags that become permanent tech debt, and using flags for things that really need a migration. Manage them with a flag lifecycle: owner, expiry, and cleanup once a feature is fully rolled out.`,
    keyPoints: [
      "Flags separate deploy (ship code) from release (enable feature).",
      "Enable progressive rollout, cohort targeting, and instant kill switches.",
      "Make merging unfinished work safe (supports trunk-based dev).",
      "Risks: state explosion, stale flags, misuse for migrations.",
      "Enforce a flag lifecycle — owner, expiry, and cleanup.",
    ],
    followUps: [
      "How do you keep feature flags from becoming permanent technical debt?",
    ],
    tags: ["feature-flags", "progressive-delivery", "kill-switch", "tech-debt"],
  },

  // ---- Docker & Kubernetes (continued) -------------------------------------
  {
    id: "k8s-rollout-stuck",
    area: "Docker & Kubernetes",
    difficulty: "Senior",
    question:
      "A kubectl rollout is stuck and never completes, but the old pods still serve traffic. What is happening and how do you resolve it?",
    tests: [
      "Rolling update mechanics",
      "Readiness gating during rollout",
      "progressDeadlineSeconds and diagnosis",
    ],
    strongAnswerMD: `A rolling update brings up new pods and waits for them to become **Ready** before retiring old ones. If new pods never reach Ready, the rollout parks — which is the system protecting you, because old pods keep serving traffic. So the question is why the new pods are not Ready.

Check the new pods: failing readiness probe, CrashLoopBackOff, missing ConfigMap/Secret, image pull error, or insufficient resources to schedule. Fix the root cause and the rollout resumes; progressDeadlineSeconds will mark it failed after a timeout. Users are unaffected throughout, so you can debug calmly and roll back if needed.`,
    keyPoints: [
      "Rollout waits for new pods to be Ready before removing old ones.",
      "Stuck rollout = new pods not becoming Ready (that is the safety net).",
      "Check probes, CrashLoop, missing config/secret, image pull, scheduling.",
      "Old pods keep serving, so there is no user impact while you debug.",
      "progressDeadlineSeconds eventually marks the rollout failed.",
    ],
    followUps: [
      "How does maxUnavailable interact with a stuck rollout?",
    ],
    tags: ["kubernetes", "rollout", "readiness", "progress-deadline", "debugging"],
  },
  {
    id: "k8s-oom-vs-cpu",
    area: "Docker & Kubernetes",
    difficulty: "Senior",
    question:
      "Explain how CPU and memory limits behave differently in Kubernetes, and how to set requests and limits correctly.",
    tests: [
      "Compressible vs incompressible resources",
      "Throttling vs OOM-kill",
      "Right-sizing from real usage",
    ],
    strongAnswerMD: `CPU is **compressible**: exceeding the CPU limit gets the container throttled (slowed), not killed. Memory is **incompressible**: exceeding the memory limit gets the container **OOM-killed** and restarted. That asymmetry drives how you set them.

Set requests from real usage (p95-ish) so the scheduler places pods well and the HPA math is correct. Set memory limits with headroom above real peak to avoid OOM kills, and be cautious with tight CPU limits that throttle latency-sensitive services. Requests too high waste capacity; too low starves pods. Measure, then tune.`,
    keyPoints: [
      "CPU over limit = throttled; memory over limit = OOM-killed and restarted.",
      "Requests drive scheduling and HPA; set them from observed p95 usage.",
      "Give memory limits headroom above real peak to avoid OOM kills.",
      "Tight CPU limits can throttle latency-sensitive workloads.",
      "Requests too high waste capacity; too low starve pods — measure first.",
    ],
    followUps: [
      "How do you distinguish an OOM kill (exit 137) from an app crash?",
    ],
    tags: ["kubernetes", "resources", "oom", "throttling", "requests-limits"],
  },
  {
    id: "k8s-configmap-secret",
    area: "Docker & Kubernetes",
    difficulty: "Senior",
    question:
      "How should application configuration and secrets be delivered to pods, and what changes when a value updates?",
    tests: [
      "ConfigMap vs Secret usage",
      "Env var vs mounted volume update semantics",
      "Secret handling and least privilege",
    ],
    strongAnswerMD: `Externalise config into **ConfigMaps** and sensitive values into **Secrets**, injected as environment variables or mounted files — never baked into the image, so the same image runs in every environment. Secrets should be restricted by RBAC and, ideally, sourced from an external secret store.

Update semantics matter: values injected as **env vars are fixed at pod start**, so changing the ConfigMap requires a pod restart/rollout to take effect. Values **mounted as files** are updated in place (eventually), but the app must re-read them. Interviewers probe this because 'I changed the ConfigMap and nothing happened' is a classic gotcha.`,
    keyPoints: [
      "ConfigMaps for config, Secrets for sensitive data — never in the image.",
      "Same image + injected config = environment parity.",
      "Env-var config is fixed at pod start; needs a restart to change.",
      "Mounted-file config updates in place, but the app must re-read it.",
      "Restrict Secrets via RBAC; prefer an external secret store.",
    ],
    followUps: [
      "Why might updating a ConfigMap not change a running pod's behaviour?",
    ],
    tags: ["kubernetes", "configmap", "secret", "config", "rollout"],
  },
  {
    id: "k8s-networking-service-types",
    area: "Docker & Kubernetes",
    difficulty: "Senior",
    question:
      "Explain ClusterIP, NodePort, and LoadBalancer Services, and how in-cluster DNS resolves a Service.",
    tests: [
      "Service exposure models",
      "Cluster DNS and service discovery",
      "When to use each type",
    ],
    strongAnswerMD: `**ClusterIP** (default) gives a stable internal virtual IP reachable only inside the cluster — the normal choice for service-to-service traffic. **NodePort** opens a port on every node, mostly a building block. **LoadBalancer** provisions an external cloud load balancer for internet-facing entry, though Ingress usually sits in front for HTTP routing and TLS.

Service discovery is by **DNS**: a Service gets a name like my-svc.my-namespace that resolves to its ClusterIP, and the Service load-balances across the Ready pods behind it. So apps talk to stable names, not pod IPs, which is what makes pods disposable.`,
    keyPoints: [
      "ClusterIP: internal stable IP for service-to-service (the default).",
      "NodePort: a port on every node; mostly a lower-level building block.",
      "LoadBalancer: external cloud LB; Ingress usually fronts HTTP + TLS.",
      "Cluster DNS resolves Service names to ClusterIPs for discovery.",
      "Apps target stable Service names, never pod IPs.",
    ],
    followUps: [
      "Where does Ingress fit relative to a LoadBalancer Service?",
    ],
    tags: ["kubernetes", "service", "dns", "networking", "ingress"],
  },
  {
    id: "docker-security-hardening",
    area: "Docker & Kubernetes",
    difficulty: "Staff",
    question:
      "How do you harden a container image and its runtime for production?",
    tests: [
      "Minimal image and non-root",
      "Vulnerability scanning and provenance",
      "Runtime restrictions",
    ],
    strongAnswerMD: `Shrink the attack surface: start from a **minimal/distrolless base**, use multi-stage builds to keep build tools out, pin versions, and run as a **non-root** user with a read-only root filesystem. Do not bake secrets into layers.

Scan images for vulnerabilities in CI and block on criticals, and track provenance so you know what shipped. At runtime, drop Linux capabilities, disallow privilege escalation, and apply resource limits and network policies so a compromised container is contained. Security is layered — a small image plus a restricted runtime plus scanning, not any single control.`,
    keyPoints: [
      "Minimal/distroless base + multi-stage build shrinks attack surface.",
      "Run as non-root with a read-only root filesystem.",
      "Never bake secrets into image layers.",
      "Scan for CVEs in CI and block on criticals; track provenance.",
      "At runtime: drop capabilities, no privilege escalation, network policies.",
    ],
    followUps: [
      "How does running as non-root actually limit a container breakout?",
    ],
    tags: ["docker", "security", "non-root", "scanning", "hardening"],
  },
  {
    id: "k8s-node-pressure-eviction",
    area: "Docker & Kubernetes",
    difficulty: "Staff",
    question:
      "Pods are being evicted and rescheduled seemingly at random. What causes eviction and how do you prevent it?",
    tests: [
      "Node resource pressure and eviction",
      "QoS classes and requests/limits",
      "PodDisruptionBudgets and priorities",
    ],
    strongAnswerMD: `The kubelet evicts pods when a node is under **resource pressure** (memory, disk). Under memory pressure it kills pods to reclaim resources, and pods with no/low requests (BestEffort/Burstable QoS) are evicted first. So 'random' evictions usually mean overcommitted nodes and pods without proper requests.

Prevent it by setting realistic requests/limits so QoS is Guaranteed for critical pods, not overcommitting nodes, and using priorities so important workloads survive. Use **PodDisruptionBudgets** to cap voluntary disruptions during maintenance. Also watch disk pressure from logs/images. The fix is capacity planning plus correct requests, not chasing individual evictions.`,
    keyPoints: [
      "Kubelet evicts under node memory/disk pressure to reclaim resources.",
      "Low/no-request pods (BestEffort/Burstable) are evicted first.",
      "Set requests/limits so critical pods get Guaranteed QoS.",
      "Avoid overcommitting nodes; use pod priorities for important work.",
      "PodDisruptionBudgets cap voluntary disruption during maintenance.",
    ],
    followUps: [
      "How do QoS classes decide eviction order under memory pressure?",
    ],
    tags: ["kubernetes", "eviction", "qos", "node-pressure", "pdb"],
  },

  // ---- Azure & Infrastructure (continued) ----------------------------------
  {
    id: "azure-slots-swap",
    area: "Azure & Infrastructure",
    difficulty: "Senior",
    question:
      "How do App Service deployment slots enable zero-downtime releases, and what are the gotchas?",
    tests: [
      "Slot warm-up and swap mechanics",
      "Slot-specific vs swapped settings",
      "Rollback via re-swap",
    ],
    strongAnswerMD: `You deploy to a **staging slot**, let it warm up, and then **swap** it with production. The platform routes traffic to the staging instances only after they are warm and healthy, so the cutover has no cold-start hit and is effectively instant. Rollback is just swapping back.

Gotchas: some settings are **slot-specific** (they stick to the slot) while others swap with the app, so misconfiguring which is which causes surprises (e.g. a connection string following the wrong slot). Warm-up must actually exercise the app, and any database change still has to be backward compatible because both versions can briefly serve traffic around the swap.`,
    keyPoints: [
      "Deploy to staging slot, warm up, then swap into production.",
      "Traffic shifts only after instances are warm and healthy.",
      "Rollback = swap back to the previous slot instantly.",
      "Know which settings are slot-specific vs swapped to avoid surprises.",
      "DB changes must stay backward compatible across the swap.",
    ],
    followUps: [
      "Which App Service settings stay with the slot vs move on swap?",
    ],
    tags: ["azure", "app-service", "slots", "zero-downtime", "rollback"],
  },
  {
    id: "azure-keyvault-secrets",
    area: "Azure & Infrastructure",
    difficulty: "Senior",
    question:
      "How do you store and access application secrets in Azure without putting them in config files or code?",
    tests: [
      "Key Vault + Managed Identity",
      "Eliminating bootstrap secrets",
      "Rotation and access control",
    ],
    strongAnswerMD: `Store secrets, keys, and certificates in **Key Vault** and have the app read them at runtime using a **Managed Identity** — the platform gives the app an identity so there is no bootstrap secret to store anywhere. Access is authorised by RBAC/policy scoped to just the secrets that app needs.

This removes secrets from config, code, and pipeline variables entirely. Rotate secrets in the Vault (and reference versions or use auto-rotation) so a rotation does not require a redeploy. The interviewer is checking that you close the 'secret zero' problem — no long-lived credential sitting in app settings.`,
    keyPoints: [
      "Key Vault holds secrets/keys/certs; app reads them at runtime.",
      "Managed Identity removes the bootstrap 'secret zero' problem.",
      "Scope access with RBAC/policy to only the needed secrets.",
      "Rotate in the Vault without redeploying the app.",
      "No secrets in code, config files, or pipeline variables.",
    ],
    followUps: [
      "How does a Managed Identity authenticate to Key Vault with no stored secret?",
    ],
    tags: ["azure", "key-vault", "managed-identity", "secrets", "rotation"],
  },
  {
    id: "azure-app-service-vs-aks",
    area: "Azure & Infrastructure",
    difficulty: "Staff",
    question:
      "When would you choose App Service, Azure Functions, or AKS for a workload?",
    tests: [
      "Managed PaaS vs orchestration trade-offs",
      "Operational cost and control",
      "Fit to workload shape",
    ],
    strongAnswerMD: `Match the platform to the workload and the team's operational appetite. **App Service** is managed PaaS for standard web apps/APIs — fast to run, slots, easy scaling, little ops. **Functions** suit event-driven, spiky, or short-lived work with consumption billing and scale-to-zero. **AKS** gives full Kubernetes control for complex microservices, custom networking, or multi-service orchestration — at the cost of real operational overhead.

Default to the most managed option that fits and only move to AKS when you genuinely need its control and portability. Choosing AKS for a single web app is over-engineering; forcing 40 interdependent services into App Service is under-powered.`,
    keyPoints: [
      "App Service: managed PaaS for standard web apps/APIs, low ops.",
      "Functions: event-driven/spiky/short work, consumption + scale-to-zero.",
      "AKS: full control for complex microservices — high ops overhead.",
      "Prefer the most managed option that fits the workload.",
      "Reach for AKS only when you truly need its control/portability.",
    ],
    followUps: [
      "What signals tell you a workload has outgrown App Service and needs AKS?",
    ],
    tags: ["azure", "app-service", "functions", "aks", "platform-choice"],
  },
  {
    id: "azure-iac-bicep",
    area: "Azure & Infrastructure",
    difficulty: "Staff",
    question:
      "Why manage Azure infrastructure as code with Bicep/ARM, and what makes an IaC deployment safe to re-run?",
    tests: [
      "Declarative, idempotent infrastructure",
      "Reproducibility and review",
      "Drift and environment parity",
    ],
    strongAnswerMD: `IaC makes infrastructure **declarative, versioned, and reviewable** — you describe the desired state in Bicep, and deployments are reproducible across environments instead of hand-clicked and undocumented. That gives parity between dev/staging/prod and an audit trail.

Safe re-runs come from **idempotency**: applying the same template converges to the same state whether it is the first run or the hundredth, so re-deploying does not duplicate or damage resources. Combine with what-if previews, PR review of infra changes, and drift detection so manual portal changes are caught. The point is treating infra changes like code changes.`,
    keyPoints: [
      "Declarative + versioned + reviewed infra beats hand-clicked portals.",
      "Reproducible deployments give real dev/staging/prod parity.",
      "Idempotency: re-applying converges to the same state safely.",
      "Use what-if previews and PR review for infra changes.",
      "Detect drift so manual portal edits are caught and reconciled.",
    ],
    followUps: [
      "What is configuration drift and how does IaC help you detect it?",
    ],
    tags: ["azure", "iac", "bicep", "idempotency", "drift"],
  },
  {
    id: "azure-scaling-autoscale",
    area: "Azure & Infrastructure",
    difficulty: "Senior",
    question:
      "Design autoscaling for an Azure workload with spiky traffic. What signals and guardrails do you use?",
    tests: [
      "Choosing scaling signals",
      "Scale-out vs scale-up",
      "Guardrails against flapping and cost",
    ],
    strongAnswerMD: `Scale **out** (more instances) for stateless web/API load rather than only scaling up. Pick a signal that reflects real load — CPU is fine for CPU-bound work, but queue length or requests-per-instance is better for IO-bound or async workloads. Set min instances for baseline availability and max for cost/blast-radius control.

Add guardrails: cooldown windows so it does not flap, scale-up faster than scale-down to absorb spikes safely, and pre-warming or a higher floor if cold starts hurt. Test against a realistic spike. The mistake is scaling on a signal that does not track the bottleneck (e.g. CPU for a queue-bound consumer).`,
    keyPoints: [
      "Prefer scale-out for stateless workloads; scale-up has limits.",
      "Choose a signal that tracks the bottleneck (CPU vs queue/RPS).",
      "Set min for availability and max for cost/blast-radius.",
      "Cooldowns prevent flapping; scale up faster than down.",
      "Pre-warm or raise the floor when cold starts hurt latency.",
    ],
    followUps: [
      "When is CPU the wrong autoscaling signal, and what do you use instead?",
    ],
    tags: ["azure", "autoscale", "scale-out", "guardrails", "spiky-traffic"],
  },
  {
    id: "azure-networking-vnet",
    area: "Azure & Infrastructure",
    difficulty: "Staff",
    question:
      "How do you keep an App Service or AKS workload's traffic to databases and storage private?",
    tests: [
      "VNet integration and private endpoints",
      "Removing public exposure",
      "Defense in depth",
    ],
    strongAnswerMD: `Put the workload on a **VNet** and reach data services over **private endpoints** so traffic stays on the Azure backbone and never traverses the public internet. Then disable public network access on the database/storage so they are only reachable privately — closing the door, not just opening a private one.

Layer with NSGs/firewall rules, private DNS so names resolve to private IPs, and least-privilege identities (Managed Identity) for auth. Defense in depth: network isolation plus identity plus disabled public access, so a leaked connection string alone is not enough to reach the data.`,
    keyPoints: [
      "VNet integration + private endpoints keep traffic off the public internet.",
      "Disable public network access on data services, not just add a private path.",
      "Private DNS resolves service names to private IPs.",
      "NSGs/firewall rules and least-privilege identities add layers.",
      "Defense in depth: a leaked connection string alone should not suffice.",
    ],
    followUps: [
      "Why disable public access even after adding a private endpoint?",
    ],
    tags: ["azure", "vnet", "private-endpoint", "networking", "security"],
  },
  {
    id: "azure-cost-optimization",
    area: "Azure & Infrastructure",
    difficulty: "Staff",
    question:
      "Cloud spend is climbing faster than traffic. How do you find and control Azure cost without hurting reliability?",
    tests: [
      "Cost visibility and attribution",
      "Right-sizing and elasticity",
      "Commitment and waste elimination",
    ],
    strongAnswerMD: `Start with **visibility**: tag resources by team/service and use Cost Management to attribute spend, so you optimise the biggest line items instead of guessing. Usually the wins are right-sizing over-provisioned compute/DB, scaling to zero or down off-peak, and deleting orphaned resources (unattached disks, idle IPs, old snapshots).

Then use commitments (reserved/savings plans) for steady baseline load and elasticity for the variable part, and pick the right tier/storage class per workload. Protect reliability by keeping headroom and testing scale-down — the goal is removing waste, not starving production. Make cost a visible, owned metric, not an afterthought.`,
    keyPoints: [
      "Tag + attribute spend so you optimise the biggest costs first.",
      "Right-size over-provisioned compute/DB; scale down off-peak.",
      "Delete orphaned resources (disks, IPs, snapshots).",
      "Reserved/savings plans for baseline, elasticity for the variable part.",
      "Keep headroom and test scale-down so reliability is not sacrificed.",
    ],
    followUps: [
      "How do you optimise cost without risking availability during spikes?",
    ],
    tags: ["azure", "cost", "right-sizing", "reservations", "finops"],
  },

  // ---- APIs & WebJobs ------------------------------------------------------
  {
    id: "api-idempotency",
    area: "APIs & WebJobs",
    difficulty: "Staff",
    question:
      "A payment API sometimes charges customers twice when clients retry after a timeout. How do you make write APIs safe to retry?",
    tests: [
      "Idempotency keys",
      "At-least-once delivery reality",
      "Deduplication and storage",
    ],
    strongAnswerMD: `Networks give you at-least-once delivery: a client that times out will retry, so a naive create can execute twice. Make the operation **idempotent** with a client-supplied **idempotency key**. The server records the key with the result; a repeat with the same key returns the stored result instead of doing the work again.

Persist keys durably with the operation (ideally in the same transaction) so a retry during a race still dedupes, and expire them after a sensible window. For money, this is essential — the client cannot know whether the first request succeeded, so the server must make retries safe. Same principle applies to any non-idempotent POST.`,
    keyPoints: [
      "Retries are inevitable (at-least-once), so writes must tolerate duplicates.",
      "Client sends an idempotency key; server dedupes on it.",
      "Store key + result durably, ideally in the same transaction as the work.",
      "Repeat requests return the stored result, not a second execution.",
      "Expire keys after a sensible retention window.",
    ],
    followUps: [
      "Where do you store idempotency keys, and how do you handle a concurrent retry?",
    ],
    tags: ["api", "idempotency", "retries", "dedup", "payments"],
  },
  {
    id: "api-rate-limiting",
    area: "APIs & WebJobs",
    difficulty: "Senior",
    question:
      "How do you protect an API from abuse and overload with rate limiting, and where do you enforce it?",
    tests: [
      "Algorithms (token bucket) and keys",
      "Enforcement point",
      "Client experience (429, headers)",
    ],
    strongAnswerMD: `Rate limit per identity (API key/user/IP) using something like a **token bucket** that allows bursts up to a cap while bounding sustained rate. Enforce at the edge/gateway so bad traffic is shed before it reaches your services, and keep the counter in a shared store (e.g. Redis) so the limit holds across instances.

Return **429** with Retry-After and limit headers so well-behaved clients back off, and consider separate tiers/quotas per plan. Rate limiting protects availability (one noisy client cannot starve others) and is a first line against abuse — pair it with authentication and, for overload, load shedding of the least important traffic.`,
    keyPoints: [
      "Token bucket allows bursts while bounding sustained rate.",
      "Key limits per API key/user/IP, not globally.",
      "Enforce at the gateway/edge; shed bad traffic early.",
      "Shared counter store keeps limits consistent across instances.",
      "Return 429 + Retry-After so good clients back off gracefully.",
    ],
    followUps: [
      "How do you keep a rate limit consistent across many API instances?",
    ],
    tags: ["api", "rate-limiting", "token-bucket", "429", "gateway"],
  },
  {
    id: "api-versioning",
    area: "APIs & WebJobs",
    difficulty: "Senior",
    question:
      "How do you evolve a public API without breaking existing clients?",
    tests: [
      "Backward-compatible change vs breaking change",
      "Versioning strategy",
      "Deprecation lifecycle",
    ],
    strongAnswerMD: `Prefer **additive, backward-compatible** changes: add optional fields and new endpoints, never remove or repurpose existing ones, and tolerate unknown fields. Most evolution needs no new version at all if you design responses to be extensible.

For genuinely breaking changes, introduce a new **version** (URI or header) and run old and new in parallel. Publish a deprecation policy: announce, give a sunset window, monitor usage of the old version, and only remove it once traffic drains. The key insight interviewers want: versioning is a last resort for breaking changes, and backward compatibility is the default discipline.`,
    keyPoints: [
      "Additive changes (optional fields, new endpoints) do not break clients.",
      "Never remove or repurpose existing fields/behaviour.",
      "Breaking changes get a new version (URI/header), run in parallel.",
      "Deprecation lifecycle: announce, sunset window, monitor, remove.",
      "Backward compatibility is the default; versioning is the last resort.",
    ],
    followUps: [
      "How do you know when it is finally safe to retire an old API version?",
    ],
    tags: ["api", "versioning", "backward-compatibility", "deprecation"],
  },
  {
    id: "webjobs-background-processing",
    area: "APIs & WebJobs",
    difficulty: "Senior",
    question:
      "You need reliable background processing for long-running jobs off the request path. How do WebJobs/Functions fit, and how do you make them reliable?",
    tests: [
      "Async work off the request path",
      "Queue-driven, idempotent processing",
      "Retries, poison handling, visibility",
    ],
    strongAnswerMD: `Do not do slow work in the request; enqueue it and return fast. A **WebJob/Function** consumes the queue and processes asynchronously, which decouples the API's latency from the work and lets you scale the workers independently.

Reliability comes from the queue pattern: messages are retried on failure, so make handlers **idempotent**; use visibility timeouts so a crashed worker's message is redelivered; and route repeatedly failing messages to a **dead-letter queue** so one poison message does not block progress. Add monitoring on queue depth and processing lag. The shape — enqueue, idempotent worker, retries, DLQ — is what makes background processing trustworthy.`,
    keyPoints: [
      "Enqueue slow work and return fast; process asynchronously.",
      "Decouples API latency from the work; scale workers independently.",
      "Idempotent handlers tolerate at-least-once redelivery.",
      "Visibility timeouts redeliver messages from crashed workers.",
      "Dead-letter poison messages so they do not block the queue.",
    ],
    followUps: [
      "How do you stop a single poison message from blocking the whole queue?",
    ],
    tags: ["webjobs", "functions", "queue", "idempotency", "dead-letter"],
  },
  {
    id: "api-auth-strategy",
    area: "APIs & WebJobs",
    difficulty: "Staff",
    question:
      "Design authentication and authorization for a set of microservice APIs.",
    tests: [
      "AuthN vs AuthZ",
      "Token-based auth (OAuth2/OIDC/JWT)",
      "Service-to-service and least privilege",
    ],
    strongAnswerMD: `Separate **authentication** (who you are) from **authorization** (what you may do). Use OAuth2/OIDC: a central identity provider issues short-lived **JWT** access tokens; each service validates the token signature and claims locally (no per-call callout) and enforces scopes/roles for authorization.

For service-to-service calls use workload identities/client credentials, not shared secrets, and apply least privilege per scope. Keep tokens short-lived with refresh, validate audience and issuer, and centralise policy where it makes sense (e.g. gateway) while still enforcing at each service (defense in depth). The interviewer wants clear AuthN/AuthZ separation and stateless, verifiable tokens.`,
    keyPoints: [
      "Distinguish authentication (identity) from authorization (permissions).",
      "OAuth2/OIDC issues short-lived JWTs verified locally per service.",
      "Enforce scopes/roles for authorization; validate issuer/audience.",
      "Service-to-service via workload identity, not shared secrets.",
      "Least privilege per scope; defense in depth at gateway and service.",
    ],
    followUps: [
      "Why validate JWTs at each service instead of only at the gateway?",
    ],
    tags: ["api", "auth", "oauth", "jwt", "authorization"],
  },

  // ---- Kafka (continued) ---------------------------------------------------
  {
    id: "kafka-exactly-once",
    area: "Kafka",
    difficulty: "Staff",
    question:
      "A downstream system is receiving duplicate Kafka messages. How do you reason about delivery semantics and achieve effectively-once processing?",
    tests: [
      "At-least-once vs exactly-once",
      "Idempotent consumers",
      "Offset commit ordering",
    ],
    strongAnswerMD: `Default Kafka processing is **at-least-once**: if a consumer processes a message then crashes before committing its offset, it reprocesses on restart — hence duplicates. True exactly-once end-to-end is hard, so the pragmatic answer is **effectively-once**: make the consumer **idempotent** so reprocessing is harmless.

Achieve that by keying writes on a message id / using upserts, or by committing offsets in the same transaction as the side effect. Kafka's transactions/idempotent producer help within Kafka, but the consumer's external side effects still need idempotency. Also be careful to commit the offset only after the work succeeds, not before.`,
    keyPoints: [
      "Kafka is at-least-once by default; crashes before commit cause replays.",
      "Aim for effectively-once via idempotent consumers.",
      "Upsert / key on message id so reprocessing is harmless.",
      "Ideally commit offset in the same transaction as the side effect.",
      "Commit offsets after work succeeds, never before.",
    ],
    followUps: [
      "Why is true end-to-end exactly-once so hard across external systems?",
    ],
    tags: ["kafka", "exactly-once", "idempotency", "offsets", "semantics"],
  },
  {
    id: "kafka-ordering-partitioning",
    area: "Kafka",
    difficulty: "Staff",
    question:
      "You must process events for a given user strictly in order, but also need high throughput. How do partitions and keys help?",
    tests: [
      "Per-key ordering within a partition",
      "Partitioning strategy",
      "Throughput vs ordering trade-off",
    ],
    strongAnswerMD: `Kafka guarantees order **within a partition**, not across partitions. So partition by a key (e.g. user id): all events for one user land in the same partition and are processed in order, while different users spread across partitions for parallelism. You get per-user ordering and cluster-wide throughput at once.

The trade-offs: ordering is only as granular as the key, a hot key can create a hot partition, and repartitioning changes key placement. Choose a key that balances load and matches your ordering requirement. If you need global ordering you are limited to one partition — usually a design smell.`,
    keyPoints: [
      "Order is guaranteed within a partition, not across partitions.",
      "Key by the entity (e.g. user id) for per-entity ordering.",
      "Different keys spread across partitions for parallel throughput.",
      "Hot keys create hot partitions — pick a balanced key.",
      "Global ordering needs a single partition (usually a smell).",
    ],
    followUps: [
      "What happens to ordering when you add partitions to an existing topic?",
    ],
    tags: ["kafka", "partitioning", "ordering", "keys", "throughput"],
  },
  {
    id: "kafka-rebalancing",
    area: "Kafka",
    difficulty: "Senior",
    question:
      "Your consumer group keeps rebalancing and pausing consumption. What causes rebalancing storms and how do you stop them?",
    tests: [
      "Consumer group membership and heartbeats",
      "Processing time vs poll interval",
      "Mitigations",
    ],
    strongAnswerMD: `A rebalance reassigns partitions when group membership changes, and it **pauses consumption** while it happens. Storms usually come from consumers being kicked out of the group: either heartbeats stop (session timeout too low) or a single poll takes too long to process, exceeding max.poll.interval, so the broker assumes the consumer died.

Fix by processing faster or fetching fewer records per poll, tuning session/heartbeat and max.poll.interval to realistic values, and keeping handlers quick (offload slow work). Cooperative/incremental rebalancing reduces the stop-the-world impact. The root cause is almost always slow processing between polls, not the rebalance itself.`,
    keyPoints: [
      "Rebalances pause consumption while partitions are reassigned.",
      "Storms come from consumers dropping out of the group.",
      "Causes: session timeout too low, or poll processing exceeds max.poll.interval.",
      "Fix: faster processing, fewer records/poll, realistic timeouts.",
      "Cooperative rebalancing reduces stop-the-world impact.",
    ],
    followUps: [
      "How does max.poll.interval differ from session.timeout in causing drops?",
    ],
    tags: ["kafka", "rebalance", "consumer-group", "poll", "heartbeat"],
  },
  {
    id: "kafka-backpressure-retry",
    area: "Kafka",
    difficulty: "Staff",
    question:
      "A poison message keeps crashing your consumer and blocking the partition. How do you handle retries and bad messages?",
    tests: [
      "Head-of-line blocking",
      "Retry with backoff and DLQ",
      "Idempotency under retry",
    ],
    strongAnswerMD: `Because a partition is processed in order, a message that always fails causes **head-of-line blocking** — nothing behind it progresses. Do not retry forever in place. Retry a bounded number of times with backoff, and then route the message to a **dead-letter topic** so the partition can move on, with enough context to investigate later.

Make processing idempotent so retries are safe, and consider a separate retry topic with delay for transient failures versus a DLQ for permanent ones. Alert on DLQ volume. The key insight: never let one bad message halt an ordered partition indefinitely, but never silently drop it either.`,
    keyPoints: [
      "Ordered partitions mean a poison message blocks everything behind it.",
      "Bounded retries with backoff, then dead-letter to unblock the partition.",
      "Idempotent processing keeps retries safe.",
      "Separate transient-retry topic from permanent DLQ.",
      "Alert on DLQ volume; never silently drop messages.",
    ],
    followUps: [
      "How do you distinguish a transient failure from a genuine poison message?",
    ],
    tags: ["kafka", "dead-letter", "retry", "head-of-line", "backpressure"],
  },

  // ---- Observability (continued) -------------------------------------------
  {
    id: "obs-three-pillars",
    area: "Observability",
    difficulty: "Senior",
    question:
      "Explain metrics, logs, and traces — when each is the right tool, and their cost trade-offs.",
    tests: [
      "Role of each signal",
      "Cardinality and cost",
      "How they combine",
    ],
    strongAnswerMD: `**Metrics** are cheap aggregates for trends and alerting (rates, latency percentiles, error ratios) — great for 'is something wrong and how bad', but low-cardinality. **Logs** are detailed discrete events for 'what exactly happened' on one request — high detail, higher cost, and expensive if unstructured. **Traces** show a single request's path across services for 'where is the time going'.

Use them together: metrics detect and alert, traces localise the slow/failing hop, logs give the root-cause detail. Watch cost drivers — high-cardinality labels blow up metrics, and verbose logging gets expensive — so sample traces and structure logs. No single pillar is enough alone.`,
    keyPoints: [
      "Metrics: cheap aggregates for trends and alerting; low cardinality.",
      "Logs: detailed per-event detail for root cause; costlier at volume.",
      "Traces: per-request path across services to localise latency.",
      "Together: metrics detect, traces localise, logs explain.",
      "Cost drivers: metric cardinality and verbose logging — sample/structure.",
    ],
    followUps: [
      "What is metric cardinality and why does it drive observability cost?",
    ],
    tags: ["observability", "metrics", "logs", "traces", "cardinality"],
  },
  {
    id: "obs-alerting-slo",
    area: "Observability",
    difficulty: "Staff",
    question:
      "Your team is drowning in noisy alerts and starting to ignore them. How do you design alerting around SLOs and error budgets?",
    tests: [
      "Symptom-based vs cause-based alerts",
      "SLOs and error budgets",
      "Reducing alert fatigue",
    ],
    strongAnswerMD: `Alert on **symptoms users feel** (SLO breaches — latency, error rate, availability), not every internal cause. Define SLOs and an **error budget**; page when you are burning the budget fast enough to threaten the objective, using burn-rate alerts rather than a static threshold on every metric.

That collapses dozens of cause-alerts into a few meaningful, actionable pages. Everything non-urgent becomes a ticket/dashboard, not a page. Every page should be actionable and tied to user impact; if an alert is not actionable, delete or downgrade it. Error budgets also give an objective way to balance reliability work against features.`,
    keyPoints: [
      "Alert on user-facing symptoms/SLO breaches, not every internal cause.",
      "Define SLOs + error budgets; page on burn rate, not static thresholds.",
      "Collapse many cause-alerts into a few actionable pages.",
      "Non-urgent signals become tickets/dashboards, not pages.",
      "Every page must be actionable and tied to user impact.",
    ],
    followUps: [
      "How does an error budget help decide between reliability work and features?",
    ],
    tags: ["observability", "slo", "error-budget", "alerting", "burn-rate"],
  },
  {
    id: "obs-distributed-tracing",
    area: "Observability",
    difficulty: "Staff",
    question:
      "A request crosses six services and you cannot tell where time is spent. How does distributed tracing solve this and what does it require?",
    tests: [
      "Trace/span model and context propagation",
      "Instrumentation requirements",
      "Sampling",
    ],
    strongAnswerMD: `Distributed tracing ties all the work for one request into a **trace** made of **spans**, one per operation/service, with timing. A **trace context** (correlation id) is propagated across every hop — via headers — so the spans stitch together and you can see exactly which service or call consumed the time.

It requires consistent instrumentation and context propagation across all services (a standard like OpenTelemetry helps), plus **sampling** to control cost at high volume (often tail-based so you keep the slow/errored traces). The payoff is turning 'somewhere in six services it is slow' into 'this span in service four', which metrics and logs alone cannot pinpoint.`,
    keyPoints: [
      "A trace groups per-request spans across services with timing.",
      "Trace context (correlation id) propagates via headers across hops.",
      "Needs consistent instrumentation everywhere (e.g. OpenTelemetry).",
      "Sampling controls cost; tail-based keeps slow/errored traces.",
      "Pinpoints the slow hop that metrics/logs alone cannot localise.",
    ],
    followUps: [
      "Why is tail-based sampling often preferred over head-based for tracing?",
    ],
    tags: ["observability", "tracing", "spans", "context-propagation", "sampling"],
  },

  // ---- Production Troubleshooting ------------------------------------------
  {
    id: "prod-memory-leak",
    area: "Production Troubleshooting",
    difficulty: "Staff",
    question:
      "A service's memory grows steadily until it OOMs every few days, then restarts. How do you find and fix it?",
    tests: [
      "Leak diagnosis workflow",
      "Heap analysis",
      "Mitigation vs root cause",
    ],
    strongAnswerMD: `The sawtooth (grow then OOM-restart) is the classic leak signature. First confirm it is a true leak versus a workload that legitimately needs more memory or a too-tight limit. Then capture **heap snapshots** over time and diff them to see which objects grow without being released — usually unbounded caches/collections, un-disposed resources, or accumulating listeners/subscriptions.

Fix the root cause (bound the cache, dispose resources, remove the accumulation). As an immediate mitigation, raise the limit or schedule restarts to buy time, but that is a band-aid, not a fix. Add a memory alert on the trend so you catch it before OOM next time.`,
    keyPoints: [
      "Sawtooth grow-then-OOM is the classic leak signature.",
      "Rule out a too-tight limit / legitimate memory need first.",
      "Diff heap snapshots over time to find objects that never release.",
      "Usual causes: unbounded caches, undisposed resources, listener buildup.",
      "Restarts/raised limits are mitigation; bounding the growth is the fix.",
    ],
    followUps: [
      "How do you tell a real leak from a workload that just needs more memory?",
    ],
    tags: ["troubleshooting", "memory-leak", "heap", "oom", "profiling"],
  },
  {
    id: "prod-cascading-failure",
    area: "Production Troubleshooting",
    difficulty: "Staff",
    question:
      "One slow downstream dependency is dragging your whole service down. How do you stop the cascade and prevent it recurring?",
    tests: [
      "Resource exhaustion from slow dependencies",
      "Timeouts, circuit breakers, bulkheads",
      "Graceful degradation",
    ],
    strongAnswerMD: `A slow dependency ties up your threads/connections while callers wait, so your pool exhausts and you fail too — the failure cascades. Immediate stop-the-bleeding: shed load, and cap concurrency to the sick dependency so it cannot consume all your resources.

Prevent it with **timeouts** (never wait unbounded), **circuit breakers** (stop calling a failing dependency and fail fast), **bulkheads** (isolate resource pools so one dependency cannot starve the rest), and retries with backoff + jitter (never retry storms). Where possible, **degrade gracefully** — serve cached/partial results instead of failing. The theme: contain the blast radius so one dependency's failure is not your failure.`,
    keyPoints: [
      "Slow dependency exhausts your threads/connections → you fail too.",
      "Timeouts stop unbounded waits; never call a dependency without one.",
      "Circuit breakers fail fast instead of piling onto a sick dependency.",
      "Bulkheads isolate pools so one dependency cannot starve the rest.",
      "Degrade gracefully (cached/partial) and use backoff+jitter on retries.",
    ],
    followUps: [
      "How does a circuit breaker decide when to open, and when to try again?",
    ],
    tags: ["troubleshooting", "cascading-failure", "circuit-breaker", "bulkhead", "timeout"],
  },
  {
    id: "prod-db-connection-exhaustion",
    area: "Production Troubleshooting",
    difficulty: "Senior",
    question:
      "Under load, requests start failing with 'no available connections' from the database. What is happening and how do you fix it?",
    tests: [
      "Connection pool sizing",
      "Leaks and long-held connections",
      "Pool math across instances",
    ],
    strongAnswerMD: `The connection pool is exhausted: demand for connections exceeds the pool, so requests queue and then time out. Two common causes — connections are **leaked** (not returned because of missing close/dispose or long transactions holding them) or the pool is simply **undersized** for the concurrency, especially multiplied across many app instances hitting one database.

Diagnose by watching active vs idle connections and query durations. Fix leaks first (ensure connections are always released, shorten transactions, avoid holding a connection across a slow external call). Then size the pool sensibly and remember total connections = pool size × instances must fit the database's limit. Add a timeout so exhaustion fails fast rather than hanging.`,
    keyPoints: [
      "Exhausted pool: connection demand exceeds supply, requests time out.",
      "Leaks (unreleased connections, long transactions) are a top cause.",
      "Undersized pool relative to concurrency is the other.",
      "Total = pool size × instances must fit the DB's connection limit.",
      "Fix leaks, shorten transactions, size the pool, add acquisition timeouts.",
    ],
    followUps: [
      "Why can adding more app instances make connection exhaustion worse?",
    ],
    tags: ["troubleshooting", "connection-pool", "database", "leak", "sizing"],
  },
  {
    id: "prod-thundering-herd",
    area: "Production Troubleshooting",
    difficulty: "Staff",
    question:
      "When a hot cache key expires, a flood of requests hits the database simultaneously and it falls over. How do you prevent this?",
    tests: [
      "Cache stampede / thundering herd",
      "Request coalescing and locks",
      "Staggered expiry and stale-while-revalidate",
    ],
    strongAnswerMD: `On expiry, every concurrent request misses the cache and stampedes the database — a thundering herd. Prevent it by **coalescing**: only one request recomputes the value (a lock / single-flight) while the others wait for or reuse the result, so the database sees one query, not thousands.

Complement with **stale-while-revalidate** (serve the slightly stale value while one worker refreshes in the background) and **jittered/staggered TTLs** so many keys do not expire at the same instant. Optionally pre-warm hot keys. The principle: never let a cache miss translate into unbounded concurrent recomputation against your backing store.`,
    keyPoints: [
      "Simultaneous expiry causes every request to stampede the database.",
      "Coalesce with a lock/single-flight so only one request recomputes.",
      "Stale-while-revalidate serves stale data while refreshing in background.",
      "Jitter/stagger TTLs so keys do not all expire together.",
      "Pre-warm hot keys; never let a miss cause unbounded recomputation.",
    ],
    followUps: [
      "How does single-flight/request coalescing work across many instances?",
    ],
    tags: ["troubleshooting", "cache-stampede", "thundering-herd", "coalescing", "ttl"],
  },
  {
    id: "prod-intermittent-timeout",
    area: "Production Troubleshooting",
    difficulty: "Senior",
    question:
      "Users report occasional timeouts you cannot reproduce. How do you systematically track down an intermittent failure?",
    tests: [
      "Data-driven triage of rare failures",
      "Correlating across signals",
      "Tail latency causes",
    ],
    strongAnswerMD: `Do not try to reproduce blindly — let data narrow it. Characterise the failures from metrics/logs: which endpoint, which instance/region, what time pattern, correlated with deploys, traffic spikes, GC pauses, or a specific dependency. Intermittent usually means **tail latency** — p99 not average — so look at percentiles, not means.

Use distributed traces of the slow requests to find the common slow span, and correlate with resource saturation (CPU, connection pools, GC), noisy neighbours, retries, or a flaky dependency. Add correlation ids and targeted logging if visibility is thin. The discipline is turning 'sometimes slow' into a reproducible pattern via percentiles, traces, and correlation — not guesswork.`,
    keyPoints: [
      "Let data narrow it: endpoint, instance/region, timing, deploy correlation.",
      "Intermittent = tail latency; look at p99, not averages.",
      "Trace the slow requests to find the common slow span.",
      "Correlate with saturation (CPU, pools, GC), retries, flaky dependencies.",
      "Add correlation ids/targeted logging when visibility is insufficient.",
    ],
    followUps: [
      "Why do averages hide intermittent failures that percentiles reveal?",
    ],
    tags: ["troubleshooting", "tail-latency", "p99", "tracing", "intermittent"],
  },
];
