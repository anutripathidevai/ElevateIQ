import type { CDModuleContent } from "../types";

/**
 * Module 2 — Jenkins & Deployment Strategies.
 * Senior-level focus: designing maintainable pipelines and choosing the right
 * release strategy so deploys are safe, reversible, and boring.
 */
export const jenkinsDeploymentStrategiesContent: CDModuleContent = {
  slug: "jenkins-deployment-strategies",
  introMD: `A pipeline turns a commit into a running production release. Jenkins is just one engine for that — what interviews test is whether you can design a pipeline that is **maintainable at scale** and choose a **release strategy** that limits blast radius.

This module covers pipeline-as-code, the stages and gates that make a pipeline trustworthy, and the four deployment strategies (rolling, blue-green, canary, feature flags) with the trade-offs that decide which to use.`,
  coreFlow: {
    title: "A release pipeline",
    body: `Commit
 -> Build   (compile, one immutable artifact)
 -> Test    (unit, integration, quality gates)
 -> Scan    (security, licence)
 -> Deploy  (staging -> production, gated)
 -> Verify  (health checks, auto-rollback on breach)`,
  },
  seniorFocus: [
    "Express pipelines as code and factor shared logic into versioned libraries.",
    "Design stages and quality gates that fail fast and block bad releases.",
    "Choose rolling / blue-green / canary / feature flags by risk and blast radius.",
    "Automate rollback on health signals instead of relying on humans.",
    "Keep releases boring: immutable artifacts, health gating, reversible steps.",
  ],
  concepts: [
    {
      id: "pipeline-as-code",
      title: "Pipeline as code & shared libraries",
      whatMD: `A pipeline defined **as code** (a Jenkinsfile in the repo) is versioned, reviewed, and diffable with the app — unlike job config clicked in a UI, which drifts and cannot be reviewed.`,
      howMD: `Common stages are factored into a **shared library** so many services reuse one tested template and override only what is unique. The library is versioned and pinned, so a template change rolls out deliberately rather than to everyone at once.`,
      diagram: {
        title: "Standardise with a shared library",
        body: `service A Jenkinsfile
service B Jenkinsfile  --->  shared library (build, test, deploy stages)
service C Jenkinsfile`,
      },
      interviewPoints: [
        "Jenkinsfile in the repo = versioned, reviewed, diffable pipelines.",
        "Shared libraries stop 50 services copy-pasting the same stages.",
        "Version and pin the library so template changes roll out safely.",
        "UI-clicked job config is unversioned and drifts — avoid it.",
      ],
      realWorldMD: `A one-line fix to the deploy stage is made once in the shared library; services pick it up when they bump the pinned version — no editing 50 Jenkinsfiles.`,
      interviewQuestions: [
        "How do you keep pipelines maintainable across dozens of services?",
      ],
    },
    {
      id: "stages-and-gates",
      title: "Stages & quality gates",
      whatMD: `A pipeline is a sequence of **stages** (build, test, scan, deploy) where each **gate** must pass before the next runs. Gates fail fast and stop a bad change before it reaches production.`,
      howMD: `Build once and produce a single immutable artifact promoted through environments. Tests, coverage thresholds, and security scans act as gates; deploy stages are gated on the previous environment being healthy. The earlier a gate catches a problem, the cheaper it is.`,
      interviewPoints: [
        "Build once, promote the same artifact — never rebuild per environment.",
        "Gates (tests, coverage, scans) fail fast and block bad releases.",
        "Order stages cheap-and-fast first for quick feedback.",
        "Promotion to prod is gated on staging being healthy.",
      ],
      realWorldMD: `A security scan gate blocks a release with a critical CVE at the build stage, long before it could reach production — the fix is a one-line dependency bump.`,
    },
    {
      id: "deployment-strategies",
      title: "Rolling, blue-green, canary & feature flags",
      whatMD: `Four ways to release. **Rolling** replaces instances gradually. **Blue-green** stands up a full new environment and cuts over instantly. **Canary** shifts a small % of traffic and ramps on healthy metrics. **Feature flags** decouple deploy from release entirely.`,
      diagram: {
        title: "Blast radius vs cutover speed",
        body: `rolling      : gradual replace, simple, slow-ish rollback
blue-green   : instant cutover, instant rollback, 2x capacity
canary       : smallest blast radius, needs strong metrics
feature flag : release without deploy, instant kill switch`,
      },
      interviewPoints: [
        "Canary gives the smallest blast radius but needs good metrics.",
        "Blue-green gives instant cutover and rollback at ~2x capacity.",
        "Rolling is the simplest default with maxSurge/maxUnavailable control.",
        "Feature flags release to a cohort without a redeploy — instant kill switch.",
        "Any DB change must stay backward compatible across the transition.",
      ],
      realWorldMD: `A risky checkout change ships behind a feature flag, enabled for 1% of users; error rate is watched, then ramped to 100% — or killed instantly with no redeploy.`,
      interviewQuestions: [
        "Design a safe release for a critical API that must never take downtime.",
        "You want blue-green but the release changes the database schema — how?",
      ],
    },
    {
      id: "rollback",
      title: "Automated rollback",
      whatMD: `Rollback returns to the previous known-good version quickly when a release misbehaves. Done well it is **automatic** — triggered by health signals, not by a human noticing.`,
      howMD: `After deploy, watch error rate and latency against the pre-deploy baseline over a bake window; on breach, redeploy the previous immutable artifact. Immutable, versioned artifacts make rollback a fast tag swap; readiness gating keeps traffic on healthy instances.`,
      interviewPoints: [
        "Immutable versioned artifacts make rollback a fast, deterministic revert.",
        "Trigger rollback on metric breach vs the baseline, not on noise.",
        "A bake window plus min sample size avoids false rollbacks.",
        "Goal is mean-time-to-recovery in minutes without a human in the loop.",
      ],
      realWorldMD: `A canary's error rate crosses the threshold at 5% traffic; the pipeline auto-reverts to the previous image tag within two minutes — most users never saw the bad build.`,
      interviewQuestions: [
        "Design an automated rollback strategy that does not wait for a human.",
      ],
    },
  ],
  keyTakeaways: [
    "Define pipelines as code and factor shared stages into versioned libraries.",
    "Build once, gate hard, and promote one immutable artifact through environments.",
    "Pick the release strategy by blast radius: canary < blue-green < rolling.",
    "Feature flags decouple deploy from release and give an instant kill switch.",
    "Automate rollback on health signals so recovery is measured in minutes.",
  ],
  relatedQuestionIds: [
    "jenkins-pipeline-as-code",
    "deploy-zero-downtime-canary",
    "deploy-blue-green-db",
    "deploy-rollback-strategy",
    "deploy-feature-flags",
  ],
};
