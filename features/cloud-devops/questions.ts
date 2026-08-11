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
];
