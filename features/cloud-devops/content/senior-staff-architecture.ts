import type { CDModuleContent } from "../types";

/**
 * Module 8 — Senior / Staff Architecture.
 * Ties the track together: how a senior/staff engineer reasons about DevOps and
 * production systems end to end — trade-offs, reliability, and blast radius.
 */
export const seniorStaffArchitectureContent: CDModuleContent = {
  slug: "senior-staff-architecture",
  introMD: `The final module steps back from individual tools to how a **senior or staff engineer** reasons about the whole delivery and production system. At this level, interviews are about **judgement**: trade-offs, reliability targets, blast radius, and cost — not whether you can recite a command.

This module covers thinking in trade-offs, designing for reliability, containing blast radius across a fleet of services, and the platform mindset that lets many teams ship safely.`,
  coreFlow: {
    title: "How a staff engineer frames a decision",
    body: `requirement -> constraints (SLOs, cost, team, time)
   -> options with trade-offs (not one "right" answer)
      -> choose for blast radius + reversibility
         -> make it observable + automate the safe path
            -> document the decision and its trade-offs`,
  },
  seniorFocus: [
    "Frame decisions as trade-offs against explicit constraints, not absolutes.",
    "Design to reliability targets (SLOs) and an error budget, not to 100%.",
    "Contain blast radius across a fleet — one bad change must not sink everything.",
    "Prefer reversible, observable, automated changes over clever fragile ones.",
    "Build platforms and paved paths so many teams ship safely by default.",
  ],
  concepts: [
    {
      id: "thinking-in-tradeoffs",
      title: "Thinking in trade-offs",
      whatMD: `Staff-level answers rarely say "always do X". They name the **constraints** (SLOs, cost, team size, deadline) and weigh options against them. The interviewer is testing judgement, not recall.`,
      howMD: `For any decision — release strategy, sync vs async, build vs buy — lay out two or three options, state what each optimises and sacrifices, then choose for the current constraints and say what would change your mind. Naming the trade-off is the signal.`,
      interviewPoints: [
        "State constraints first: SLOs, cost, team capacity, timeline.",
        "Offer options with trade-offs, not a single dogmatic answer.",
        "Say what would change your decision — that shows real seniority.",
        "Optimise for the current context, not a textbook ideal.",
      ],
      realWorldMD: `Asked to pick a release strategy, a strong candidate compares canary vs blue-green by blast radius, metric maturity, and cost — then recommends one for this team's context.`,
      interviewQuestions: [
        "Design a safe deployment strategy for 50 microservices.",
      ],
    },
    {
      id: "designing-for-reliability",
      title: "Designing for reliability",
      whatMD: `Reliability is engineered to a **target**, not maximised. An **SLO** sets the goal and an **error budget** is the allowed unreliability that funds change velocity.`,
      howMD: `Define SLOs from user experience, spend the error budget on shipping features, and slow down when the budget is exhausted. Reliability comes from redundancy, timeouts, circuit breakers, and graceful degradation — not from hoping nothing fails.`,
      interviewPoints: [
        "SLOs and error budgets balance reliability against velocity.",
        "100% is the wrong target — it is infinitely expensive.",
        "Degrade gracefully: shed non-critical features under stress.",
        "Redundancy and isolation make the system tolerate failure, not avoid it.",
      ],
      realWorldMD: `When the error budget is healthy the team ships fast; when a bad month burns it, they freeze risky changes and invest in reliability until it recovers.`,
      interviewQuestions: [
        "How do you decide how reliable a service should be?",
      ],
    },
    {
      id: "blast-radius",
      title: "Containing blast radius",
      whatMD: `**Blast radius** is how much breaks when one thing fails. Staff engineers design so a bad deploy, a poisoned cache, or a dead dependency affects the smallest possible slice.`,
      howMD: `Roll changes out progressively (canary, cells, regions), isolate tenants and dependencies with bulkheads, and keep every change reversible. The question is never "will it fail" but "how much fails, and how fast can we recover".`,
      diagram: {
        title: "Limit what one failure can take down",
        body: `progressive rollout : 1% -> 10% -> 100% (stop on breach)
cell / region       : failure stays inside one cell
bulkhead            : one dependency cannot exhaust shared pools
reversible change   : recover fast by rolling back`,
      },
      interviewPoints: [
        "Progressive rollout caps how many users a bad change can reach.",
        "Cells/regions and bulkheads isolate failure domains.",
        "Design for fast recovery (reversibility), not zero failure.",
        "Measure blast radius and MTTR, not just uptime.",
      ],
      realWorldMD: `A bad config reaches only the 1% canary cell; it is rolled back before the other cells ever see it, so blast radius stays tiny.`,
      interviewQuestions: [
        "How do you keep one bad change from taking down the whole fleet?",
      ],
    },
    {
      id: "platform-mindset",
      title: "The platform / paved-path mindset",
      whatMD: `At scale, a staff engineer's leverage is the **platform**: shared pipelines, libraries, and paved paths that make the safe thing the easy default for every team.`,
      howMD: `Instead of fixing 50 services by hand, you encode best practice — health gating, rollback, observability — into a shared template teams adopt by default. Good defaults beat documentation nobody reads.`,
      interviewPoints: [
        "Leverage comes from platforms, not from fixing services one by one.",
        "Make the safe path the default path — good defaults over docs.",
        "Encode rollout, rollback, and observability into shared tooling.",
        "Measure adoption; a paved path only helps if teams actually use it.",
      ],
      realWorldMD: `A shared deploy template ships canary, health gating, and auto-rollback to every service; new teams get production-grade releases without designing them from scratch.`,
      interviewQuestions: [
        "As a staff engineer, how do you raise the reliability of 50 teams at once?",
      ],
    },
  ],
  keyTakeaways: [
    "Answer with trade-offs against explicit constraints, not absolutes.",
    "Engineer reliability to an SLO and spend the error budget on velocity.",
    "Contain blast radius with progressive rollout, isolation, and reversibility.",
    "Optimise for fast recovery (MTTR), not for never failing.",
    "Scale your impact through platforms and paved paths, not manual fixes.",
  ],
  relatedQuestionIds: [
    "cicd-50-microservices",
    "azure-zero-downtime-api",
    "kafka-consumer-lag",
    "obs-alerting-slo",
    "prod-cascading-failure",
  ],
};
