import type { CDModuleContent } from "../types";

/**
 * Module 1 — Code → Git → CI/CD.
 * Senior-level focus: how code becomes a trustworthy, deployable artifact and
 * how a senior engineer designs the path from commit to production.
 */
export const codeGitCicdContent: CDModuleContent = {
  slug: "code-git-cicd",
  introMD: `Every production system starts the same way: code is written, reviewed, built once, and promoted through environments until it reaches users. This module is about **designing that path** so bad code cannot reach production and every release is repeatable.

You already know what Git is. What senior interviews probe is your **judgement**: which branching model fits a 50-engineer team, where you place quality gates, and how you guarantee the artifact tested in staging is byte-for-byte the one deployed to production.`,
  coreFlow: {
    title: "From code to deployment",
    body: `Code
 -> Git (branch + commit)
 -> Pull Request / Review
 -> Build (compile + package)
 -> Test (unit + integration)
 -> Artifact (versioned, immutable)
 -> Deploy (promote through envs)`,
  },
  seniorFocus: [
    "Design a Git workflow that scales to large teams without merge chaos.",
    "Put quality gates where they stop bad code cheaply — earlier is cheaper.",
    "Build the artifact once and promote the same artifact to every environment.",
    "Separate configuration from secrets, and both from the build.",
    "Make releases boring: repeatable, observable, and reversible.",
  ],
  concepts: [
    {
      id: "branching-strategy",
      title: "Branching strategies",
      whatMD: `A branching strategy is the team agreement on how work flows into the main line. The common options are **trunk-based development** (short-lived branches, merge to main many times a day) and **GitFlow** (long-lived develop/release branches).`,
      howMD: `Trunk-based keeps branches alive for hours, relying on feature flags to hide unfinished work. GitFlow adds release and hotfix branches, which suits scheduled releases but creates painful long-lived merges. Most high-throughput teams pick trunk-based plus flags.`,
      diagram: {
        title: "Trunk-based flow",
        body: `main  ---o-------o-------o-------o--->
          \\     /  \\     /
 feature   o---o    o---o   (short-lived, merged fast)`,
      },
      interviewPoints: [
        "Long-lived branches are the root cause of merge hell; short-lived branches avoid it.",
        "Trunk-based + feature flags decouples deploy from release.",
        "GitFlow fits regulated / scheduled releases, not continuous delivery.",
        "Branch protection + required reviews enforce the workflow in practice.",
      ],
      realWorldMD: `A 50-service org moves to trunk-based development: every service merges to main behind a flag, CI runs on every push, and releases are a flag flip rather than a branch merge — cutting integration bugs sharply.`,
      interviewQuestions: [
        "Design a Git branching strategy for 50 engineers shipping daily. What prevents merge conflicts and broken mains?",
      ],
    },
    {
      id: "merge-vs-rebase",
      title: "Merge vs rebase",
      whatMD: `Merge preserves history as it happened and creates a merge commit; rebase rewrites your commits on top of the latest main for a **linear** history. Both integrate changes — they differ in the history they leave behind.`,
      interviewPoints: [
        "Rebase local, unshared work to keep history linear and readable.",
        "Never rebase shared/public branches — it rewrites commits others have.",
        "Squash-merge gives one clean commit per PR; good default for feature branches.",
        "Linear history makes bisecting and reverting far easier.",
      ],
      realWorldMD: `A team standardises on squash-merge for PRs: main stays linear, each commit maps to one reviewed change, and reverting a bad release is a single clean revert.`,
    },
    {
      id: "pull-requests-reviews",
      title: "Pull requests & code review",
      whatMD: `A pull request is the checkpoint where changes are reviewed, checked by CI, and gated before entering main. Review is both a **quality gate** and a knowledge-sharing mechanism.`,
      interviewPoints: [
        "Required reviews + green CI as merge gates stop most defects cheaply.",
        "Small PRs get better reviews than large ones — keep them focused.",
        "Automate the mechanical checks (lint, format, tests) so humans review design.",
        "CODEOWNERS routes reviews to the right people at scale.",
      ],
      interviewQuestions: [
        "How do you keep code review effective as a team grows from 5 to 50 engineers?",
      ],
    },
    {
      id: "build-once-deploy-many",
      title: "Build once, deploy many",
      whatMD: `The build produces a single **immutable, versioned artifact** (a container image or package). That exact artifact is promoted through dev, QA, staging, and production. You never rebuild per environment.`,
      howMD: `Rebuilding per environment risks drift — different dependency versions, different base images, different bugs. Building once guarantees the thing you tested is the thing you ship; only configuration changes between environments.`,
      diagram: {
        title: "Promote one artifact",
        body: `Build once  -> artifact v1.4.2 (immutable)
                 |-> Dev      (config: dev)
                 |-> QA       (config: qa)
                 |-> Staging  (config: staging)
                 |-> Prod     (config: prod)`,
      },
      interviewPoints: [
        "One artifact, many environments — eliminates 'works in staging, breaks in prod'.",
        "Environment differences live in configuration, never in the build.",
        "Artifacts are immutable and versioned so any release is reproducible.",
        "Promotion, not rebuild, is what moves code toward production.",
      ],
      realWorldMD: `A release ships image sha-9f3c to staging; after sign-off the **same** image is promoted to production. No rebuild means no surprise dependency bump between staging and prod.`,
      interviewQuestions: [
        "Why is 'build once, deploy many' important, and how do you enforce it in a pipeline?",
      ],
    },
    {
      id: "config-vs-secrets",
      title: "Configuration vs secrets",
      whatMD: `Configuration is non-sensitive, per-environment settings (feature flags, URLs, log levels). Secrets are sensitive credentials (DB passwords, API keys). Both are injected at deploy time — but secrets need a **vault**, not a config file.`,
      interviewPoints: [
        "Never bake config or secrets into the artifact — inject at runtime.",
        "Secrets belong in a secret manager (Key Vault), not in Git or env files.",
        "Rotate secrets without redeploying by reading them at startup / on refresh.",
        "Use identity (Managed Identity) over long-lived static credentials.",
      ],
      realWorldMD: `An app reads its connection string from Azure Key Vault via Managed Identity at startup. Rotating the DB password is a vault update — no code change, no redeploy, no secret in source control.`,
    },
    {
      id: "pipeline-gates",
      title: "Pipeline gates & environment promotion",
      whatMD: `Gates are automated (or manual) checks between pipeline stages: tests must pass, security scans must be clean, coverage thresholds met, and a human approval before production. Promotion moves the artifact stage by stage only when each gate is green.`,
      interviewPoints: [
        "Fail fast: cheap checks (lint, unit) before expensive ones (integration, e2e).",
        "A blocked gate should stop promotion, not be bypassed under pressure.",
        "Manual approval before prod is a control, not a bottleneck, when the rest is automated.",
        "Gates encode your release policy as code, so it is consistent every time.",
      ],
      interviewQuestions: [
        "Where would you place quality and security gates in a pipeline, and why in that order?",
      ],
    },
  ],
  keyTakeaways: [
    "Short-lived branches + trunk-based development scale; long-lived branches cause merge hell.",
    "Build one immutable, versioned artifact and promote it — never rebuild per environment.",
    "Keep configuration and secrets out of the build; inject at runtime, vault the secrets.",
    "Gates encode your release policy: fail fast, block on red, approve before prod.",
    "The goal is boring releases — repeatable, observable, and reversible.",
  ],
  relatedQuestionIds: [
    "cicd-50-microservices",
    "cicd-build-once",
    "cicd-branching-scale",
  ],
};
