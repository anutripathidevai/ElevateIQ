import type { LabContent } from "../types";

/**
 * Lab 10 — AI Evaluation.
 *
 * Shows how teams compare prompt or model versions with a fixed eval set,
 * deterministic judging, pass thresholds, and regression counts before shipping
 * a change to production users.
 */
export const aiEvaluationContent: LabContent = {
  slug: "ai-evaluation",

  overviewMD: `
## Why AI evaluation exists

AI features are probabilistic, prompt-sensitive, and easy to break accidentally.
Changing a system prompt can improve one answer while quietly regressing another.
Without an eval set, teams argue from anecdotes: "it feels better" or "it worked
on my example." Production teams need repeatable tests.

This lab turns evaluation into a small, inspectable loop:

1. Define cases with inputs and ideal points.
2. Run a chosen prompt version's output.
3. Judge each output against a rubric.
4. Apply a pass threshold.
5. Compare against the other version to detect regressions.

The demo uses a deterministic rubric judge rather than a real model judge, but
the workflow mirrors the LLM-as-judge systems teams use at scale.

## Why it matters

Evaluation is how you ship AI safely. It gives product, engineering, and subject
matter experts a shared language: pass rate, average score, missing criteria,
and regressions. It also turns prompt engineering into software engineering: make
a change, run tests, inspect failures, and decide whether to release.

## Where it is used

- Prompt and model version comparisons
- RAG answer quality checks
- Safety and policy compliance reviews
- Release gates for assistants, copilots, and support bots
`.trim(),

  whatYouBuild: [
    "A fixed eval set with inputs and ideal answer points",
    "A prompt-version selector that compares v1 and v2 outputs",
    "A deterministic rubric judge that scores each case from 1 to 5",
    "Pass-rate and average-score metric cards tied to a threshold",
    "Regression counts showing improved, regressed, and unchanged cases versus the other version",
  ],

  architecture: {
    title: "How an eval run detects quality changes",
    flow: [
      "[ Eval set ]",
      "     |  inputs + ideal points",
      "     v",
      "[ Choose prompt version ]",
      "     |  v1 or v2 output",
      "     v",
      "[ Run system ]",
      "     |",
      "     v",
      "[ Rubric judge ]",
      "     |  score + rationale per case",
      "     v",
      "[ Aggregate metrics ] ---> [ Regression vs other version ]",
    ].join("\n"),
    nodes: [
      {
        id: "eval-set",
        label: "Eval set",
        whatMD:
          "A curated list of representative inputs with the key facts or behaviours a good answer should contain.",
        whyMD:
          "A fixed set turns quality into something repeatable. You can rerun the same cases after every prompt, model, or retrieval change.",
        input: "Realistic user inputs + ideal points",
        output: "Cases ready to run through a system version",
        commonFailure:
          "Testing only happy-path examples, so the eval misses the failures users actually experience.",
        interviewQuestion:
          "How do you choose eval cases that represent production quality risk?",
      },
      {
        id: "prompt-version",
        label: "Prompt version",
        whatMD:
          "The system output being judged comes from either v1 or v2, letting you compare a proposed change against a baseline.",
        whyMD:
          "AI quality changes are rarely uniformly better. Versioned prompts make it possible to detect both improvements and regressions.",
        input: "Selected version key",
        output: "One candidate output per eval case",
        commonFailure:
          "Overwriting prompts without keeping a baseline, making regressions hard to reproduce.",
        interviewQuestion:
          "Why should prompt changes be versioned like code changes?",
      },
      {
        id: "rubric-judge",
        label: "Rubric judge",
        whatMD:
          "The judge scores each output by checking how many ideal points are covered and writing a short rationale.",
        whyMD:
          "Judges convert subjective quality into structured signals. A deterministic rubric is easy to inspect; an LLM judge can handle richer criteria but must be calibrated.",
        input: "Case input, ideal points, candidate output",
        output: "Score from 1 to 5 and rationale",
        commonFailure:
          "Using a vague judge prompt such as 'is this good?' without criteria, which produces noisy scores.",
        interviewQuestion:
          "What makes an LLM-as-judge rubric reliable enough to gate releases?",
      },
      {
        id: "metrics-threshold",
        label: "Metrics + threshold",
        whatMD:
          "Each case passes or fails based on the selected score threshold; the run reports pass rate and average score.",
        whyMD:
          "Teams need release-level signals, not just individual examples. Thresholds make quality gates explicit and auditable.",
        input: "Per-case scores + pass mark",
        output: "Pass/fail labels, pass rate, average score",
        commonFailure:
          "Reporting only an average score, which can hide a small number of severe failures.",
        interviewQuestion:
          "When would you use pass rate instead of average score as the primary metric?",
      },
      {
        id: "regression-compare",
        label: "Regression comparison",
        whatMD:
          "The selected version's score is compared with the other version for each case, producing improved, regressed, and same counts.",
        whyMD:
          "A change that raises average score can still break an important case. Regression counts force teams to inspect trade-offs before shipping.",
        input: "Scores for selected version and baseline version",
        output: "Improved, regressed, same case counts",
        commonFailure:
          "Shipping because the new prompt improved demos, without checking whether existing cases got worse.",
        interviewQuestion:
          "How would you handle a prompt update that improves pass rate but regresses one critical case?",
      },
    ],
  },

  demo: "ai-evaluation",

  executionMD: `
## What the execution trace shows

The demo trace follows the eval loop exactly:

1. **Load eval set** — read the five fixed cases and their ideal points.
2. **Run system (v1 or v2)** — select the deterministic output for the chosen
   prompt version.
3. **Judge case n** — score each output from 1 to 5 by matching ideal points and
   record a one-line rationale.
4. **Aggregate** — compute pass rate, average score, and regression counts versus
   the other version.

The final metrics estimate the tokens represented by the eval inputs, ideal
points, outputs, and rationales. In production, this is where you watch cost and
latency for an eval suite before running it on every pull request or release.
`.trim(),

  learnMD: `
## Eval sets are product requirements in executable form

An eval case should encode something the product must do well: answer a policy
question, preserve a safety rule, include required citations, refuse a risky
request, or follow a tone requirement. Good eval sets include common cases,
edge cases, and past incidents.

## LLM-as-judge is a tool, not an oracle

LLM judges can score open-ended answers more flexibly than exact string tests,
but they need a clear rubric, calibration examples, and spot checks. For facts,
you can often start with deterministic checks like this demo. For helpfulness,
tone, or policy reasoning, a judge model may be appropriate if its decisions are
audited.

## Metrics must match risk

Average score is useful for trends, but pass rate is better for release gates
when every case has a minimum acceptable quality. Some teams weight critical
cases more heavily or require zero regressions in safety categories.

## Regression is the key habit

The real question is not "is v2 good?" It is "is v2 better than v1 without
breaking important behaviour?" Always compare against a baseline, keep historical
results, and inspect cases that moved down even if the aggregate improved.

## Evaluation is continuous

Every production failure should become a new eval case. Over time, the eval set
becomes a memory of product quality: what users need, what has broken before,
and what must never regress.
`.trim(),

  challenge: {
    promptMD: `
Design an eval suite for a **RAG support assistant** that answers from help-center
articles.

Specify:

1. The fields each eval case should contain.
2. The rubric dimensions an LLM-as-judge should score.
3. The release rule that decides whether a new prompt or retriever can ship.

Include how you would catch regressions where the answer is fluent but not
grounded in the retrieved source.
`.trim(),
    hints: [
      "Include the user question, retrieved passages, ideal answer points, required citations, and known unacceptable claims.",
      "Judge groundedness separately from helpfulness so a polished hallucination fails.",
      "Use a release gate with minimum pass rate plus zero regressions on critical policy cases.",
    ],
    expectedApproachMD: `
A strong eval case includes the input question, the source passages the system
should rely on, ideal answer points, required citations, and disallowed claims.
The judge scores factual coverage, groundedness, citation quality, helpfulness,
and policy compliance as separate dimensions.

The release rule should compare the candidate against the current production
version. For example: average score must improve or stay flat, pass rate must be
above 90%, and there must be zero regressions on critical policy or safety cases.
Fluent but ungrounded answers fail the groundedness dimension even if they sound
helpful.
`.trim(),
  },

  interviewQuestions: [
    {
      id: "eval-q1",
      question: "What belongs in a good AI eval case?",
      difficulty: "Intermediate",
      answerMD:
        "A good eval case has a realistic input, any context the system receives, expected behaviours or ideal answer points, and metadata such as category, difficulty, source, and severity. It should be specific enough to judge repeatably but not so narrow that it only tests exact wording. Cases should cover common paths, edge cases, past bugs, and high-risk behaviours.",
      keyPoints: [
        "Realistic input and system context",
        "Ideal points or rubric criteria",
        "Metadata for category and severity",
        "Coverage of common, edge, and past-failure cases",
      ],
      followUps: [
        "How many eval cases do you need before launch?",
        "How should production incidents feed back into the eval set?",
      ],
    },
    {
      id: "eval-q2",
      question: "When would you use deterministic checks versus an LLM-as-judge?",
      difficulty: "Intermediate",
      answerMD:
        "Use deterministic checks for facts that can be asserted mechanically: required keywords, valid JSON, citations present, policy labels, or refusal phrases. Use an LLM-as-judge when quality is semantic: helpfulness, completeness, tone, reasoning quality, or groundedness across paraphrases. Many systems combine both: hard deterministic gates for must-have constraints and judge scores for nuanced quality.",
      keyPoints: [
        "Deterministic checks are best for hard constraints",
        "LLM judges handle semantic quality",
        "Combine hard gates with rubric scores",
        "Calibrate judges with examples and audits",
      ],
      followUps: [
        "How do you detect judge drift?",
        "What should be a hard fail rather than a scored dimension?",
      ],
    },
    {
      id: "eval-q3",
      question: "How do you make an LLM-as-judge reliable?",
      difficulty: "Advanced",
      answerMD:
        "Write a specific rubric with dimensions and score anchors, provide examples, require rationales, and periodically compare judge decisions to human labels. Keep the judge prompt versioned, run it at low temperature, and monitor agreement over time. For release gates, prefer stable aggregate thresholds and inspect borderline or regressed cases manually.",
      keyPoints: [
        "Specific rubric and score anchors",
        "Calibration examples and rationales",
        "Versioned low-temperature judge prompt",
        "Human agreement checks and audits",
      ],
      followUps: [
        "How would you measure inter-rater agreement between humans and the judge?",
        "Should the judge see which prompt version produced the answer?",
      ],
    },
    {
      id: "eval-q4",
      question: "How should a team interpret an improved average score with several regressions?",
      difficulty: "Advanced",
      answerMD:
        "An improved average is not an automatic ship. The team should inspect which cases regressed, their severity, and whether they affect protected categories, safety, revenue, or core product promises. If regressions are low-risk, the change may ship with follow-up work. If a critical case regressed, block the release or adjust the prompt until the regression is fixed.",
      keyPoints: [
        "Average score can hide important failures",
        "Inspect regressed cases by severity",
        "Critical regressions should block release",
        "Use weighted or category-specific gates when needed",
      ],
      followUps: [
        "How would you weight eval cases?",
        "What is your rollback plan if production quality drops?",
      ],
    },
    {
      id: "eval-q5",
      question: "How do evals fit into a CI/CD workflow for AI features?",
      difficulty: "Advanced",
      answerMD:
        "Treat prompts, retrieval configs, and model choices like code. On each change, run a fast smoke eval in CI and a larger suite before release. Store results by version, compare to the production baseline, and fail the gate if pass rate drops or critical regressions appear. Keep human review for new categories and periodically refresh the eval set from production feedback.",
      keyPoints: [
        "Version prompts and model configs",
        "Run smoke and full eval suites",
        "Compare against production baseline",
        "Fail CI or release gates on critical regressions",
      ],
      followUps: [
        "How would you keep eval costs manageable?",
        "What evals should run on every pull request versus nightly?",
      ],
    },
  ],
};
