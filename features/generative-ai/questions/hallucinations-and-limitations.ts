import type { GenAILessonContent } from "../types";

export const hallucinationsAndLimitationsContent: GenAILessonContent = {
  slug: "hallucinations-and-limitations",
  introductionMD: `A hallucination is fluent, confident model output that is factually wrong, logically invalid, or unsupported by the information the model was given. The danger is not just that the answer is wrong. The danger is that it often sounds polished enough to pass a quick human scan.

Large language models are trained to predict likely next tokens, not to verify facts against a trusted database. They can combine memorized patterns, incomplete training data, stale knowledge, ambiguous prompts, and conversational pressure into an answer that feels plausible but has no reliable basis. This is why a model can invent a citation, misread a source, make a simple arithmetic mistake, or claim certainty where none is warranted.

In interviews and production design, hallucination is the central reliability problem for generative AI systems. A strong engineer does not say the model is smart enough or that prompt engineering solves it. A strong engineer designs grounding, tool use, citations, evaluation, human review, and graceful failure into the product from the start.

This lesson gives you a practical taxonomy of hallucinations and broader LLM limitations, then maps each risk to mitigation patterns you can defend in an AI system design interview.`,
  realWorldMD: `Hallucination and limitation handling appears in every serious LLM product.

- Customer support bots must avoid inventing refund policies or account facts.
- Legal, medical, and finance assistants must separate sourced claims from unsupported suggestions.
- Enterprise search systems must cite internal documents and say when no evidence was found.
- Coding assistants must avoid fabricating APIs, package names, or security guidance.
- Analytics copilots must route math, SQL, and counting to tools instead of guessing.
- Public chat products must handle bias, prompt sensitivity, and non-deterministic answers consistently.`,
  learningObjectives: [
    "Define hallucination as fluent but false or unsupported output, and explain why next-token prediction can produce it.",
    "Distinguish intrinsic hallucinations that contradict a source from extrinsic hallucinations that add unsupported claims.",
    "Identify common limitation classes including stale knowledge, weak arithmetic, prompt sensitivity, context limits, bias, sycophancy, and non-determinism.",
    "Choose mitigation patterns such as retrieval, citations, tool use, structured output, verification passes, lower temperature, and human review.",
    "Explain how groundedness, faithfulness, factuality evaluations, and red-teaming measure reliability.",
    "Frame product behavior around graceful failure, source visibility, confidence handling, and saying I do not know."
  ],
  theory: [
    {
      label: "A hallucination is an unsupported claim, not just a weird answer",
      detailMD: `The precise definition matters. A hallucination is output that is presented as true but is either factually wrong or not supported by the available evidence. If the user provides a contract and the model says the termination clause requires 90 days when the document says 30 days, that is an intrinsic hallucination. If the model adds that the contract was reviewed by a named law firm when no source says that, it is extrinsic.

Fluency makes hallucinations hard to catch. The model may use correct grammar, domain vocabulary, and confident phrasing while the underlying claim is false. Production systems must therefore evaluate the evidence behind the answer, not the surface quality of the prose.`
    },
    {
      label: "Why next-token prediction can produce confident falsehoods",
      detailMD: `A language model learns statistical regularities from training data and uses the prompt plus previous tokens to predict a distribution over the next token. That objective rewards plausible continuation, not truth verification. Unless the system adds retrieval, tools, or explicit checks, the model has no built-in ground truth source at generation time.

Hallucinations become more likely when the prompt asks for obscure facts, the answer depends on recent events, the model has seen conflicting examples, or the conversation pressures it to provide an answer anyway. Higher temperature and loose instructions can increase variety, which can also increase unsupported claims.`
    },
    {
      label: "Intrinsic versus extrinsic hallucination",
      detailMD: `Intrinsic hallucination contradicts the source the model was supposed to use. In summarization, that means the summary says the report revenue grew when the report says it declined. In question answering, it means the answer conflicts with the retrieved passage.

Extrinsic hallucination adds information that is not present in any source. It may be true in the outside world, but it is still unsupported by the evidence available to the system. This distinction is important for evaluation because intrinsic errors can be caught by contradiction checks, while extrinsic errors require source attribution and evidence coverage checks.`
    },
    {
      label: "Hallucination is one reliability risk among many",
      detailMD: `LLMs also have limitations that are not exactly hallucinations. They may have stale knowledge because training data ends at a cutoff. They may count tokens, characters, or items poorly because generation is not exact symbolic computation. They may be sensitive to small prompt changes, lose information beyond the context window, reproduce training biases, or agree with a user even when the user is wrong.

These limitations share a product lesson: the model is a probabilistic component, not an oracle. Treat it as one part of a larger system that can retrieve evidence, call deterministic tools, apply policies, and escalate uncertain cases.`
    },
    {
      label: "Mitigation is a system design problem",
      detailMD: `There is no single switch that removes hallucinations. Reliable products combine grounding through retrieval, citations that expose evidence, tool use for fresh facts and math, constrained output formats, verification passes, conservative decoding, human-in-the-loop review, and continuous evaluation.

The design goal is not to force the model to always answer. The design goal is to make the product truthful about what it knows, transparent about sources, and safe when evidence is missing. A good system can answer, ask for clarification, call a tool, or say I do not know depending on the situation.`
    }
  ],
  requestFlow: [
    {
      step: "1. Classify the user request",
      detailMD: `Start by deciding whether the request needs external facts, private data, recent data, exact math, policy interpretation, or open-ended generation. This classification determines whether the model can answer directly or must use retrieval, tools, or human review.`
    },
    {
      step: "2. Gather grounding evidence when needed",
      detailMD: `For factual or enterprise questions, retrieve relevant passages from trusted sources such as documents, databases, search indexes, or APIs. Grounding narrows the model context to evidence that can support the final answer. The **design-rag-pipeline** lesson covers this pattern end to end.`
    },
    {
      step: "3. Route deterministic work to tools",
      detailMD: `Do not ask the model to guess arithmetic, counts, dates, database results, or current status. Use calculators, SQL, code execution, search, or function calling, then pass the tool result back to the model as evidence.`
    },
    {
      step: "4. Generate with constraints",
      detailMD: `Ask the model to answer only from provided evidence, cite sources for factual claims, and use a structured schema when downstream systems need reliable parsing. Lower temperature can reduce random variation when consistency matters.`
    },
    {
      step: "5. Verify faithfulness before showing the answer",
      detailMD: `Run a second pass that checks whether each claim is supported by the retrieved evidence or tool output. The verifier should flag contradictions, missing citations, invented entities, and unsupported certainty.`
    },
    {
      step: "6. Handle uncertainty explicitly",
      detailMD: `If evidence is weak or missing, the product should say it cannot determine the answer, ask a clarifying question, or offer a safe partial answer with clear caveats. This is better than forcing the model to fill gaps.`
    },
    {
      step: "7. Present sources and confidence carefully",
      detailMD: `Show the source passages or links behind important claims. Confidence should reflect evidence quality and tool success, not just the model tone. Avoid fake precision such as exact percentages when the system did not measure them.`
    },
    {
      step: "8. Log outcomes for evaluation",
      detailMD: `Capture prompts, retrieved sources, tool calls, answer text, verifier results, user feedback, and escalations. These logs become the dataset for factuality evaluation, red-teaming, regression tests, and product quality dashboards.`
    }
  ],
  deepDives: [
    {
      label: "Intrinsic hallucinations are failures of faithfulness",
      detailMD: `Intrinsic hallucinations are especially damaging in summarization and RAG because the product claims to be grounded in a source. Examples include reversing a legal obligation, changing a date, inventing a conclusion from a report, or answering with a fact that contradicts the retrieved passage.

The mitigation is faithfulness checking: compare answer claims against source spans. Strong systems require every material claim to map to evidence, and they block or revise answers when the evidence says something different.`
    },
    {
      label: "Extrinsic hallucinations are failures of evidence coverage",
      detailMD: `Extrinsic hallucinations often look helpful because they add context. The model may invent a customer name, cite a paper that does not exist, include a plausible URL, or add a best practice that was never in the source. In an open web answer, the extra claim may even be true, but the product cannot justify it from the evidence it retrieved.

Source attribution is the key control. If a claim cannot be attached to a source, the answer should either remove it, label it as general background, or ask permission to search for more evidence.`
    },
    {
      label: "Math, counting, and structured reasoning need external checks",
      detailMD: `LLMs can explain arithmetic patterns but still fail at exact computation. Counting words, summing invoice rows, comparing dates, and validating formulas should be delegated to deterministic tools. The model can plan the calculation and explain the result, but the calculation itself should come from code, SQL, or a calculator.

This also applies to structured constraints. If the output must be valid JSON, valid SQL, or a policy-compliant decision, use schemas, parsers, validators, and retry loops rather than trusting the first generation.`
    },
    {
      label: "Prompt sensitivity, sycophancy, and non-determinism",
      detailMD: `Small prompt changes can move the model to a different region of its learned distribution. A leading question can make it agree with a false premise. A higher temperature can produce different answers on repeated runs. These behaviors are not bugs in the usual software sense; they are properties of probabilistic generation.

Mitigations include stable prompt templates, explicit refusal and uncertainty policies, adversarial test sets, lower temperature for factual tasks, and self-consistency checks where multiple attempts must converge before the system trusts the answer.`
    }
  ],
  productionConsiderations: [
    {
      label: "Design for graceful failure",
      detailMD: `A reliable AI product needs a first-class failure path. When evidence is missing, the system should say I do not know, ask for more context, route to search, escalate to a human, or explain what it can answer safely. This is a product feature, not a weakness.

Graceful failure also means avoiding overconfident UI. Do not hide uncertainty behind polished prose. Show sources, caveats, and next actions in a way users can understand.`
    },
    {
      label: "Evaluate rather than trust",
      detailMD: `You cannot prove reliability by reading a few impressive examples. Build evaluation sets that include groundedness checks, factuality questions, stale-knowledge cases, adversarial prompts, unsupported-citation traps, and regression examples from production incidents.

Track metrics such as faithfulness to source, citation precision, answer correctness, refusal correctness, tool-call success, and human escalation rate. Red-team the system before launch and after every major model, prompt, or retrieval change.`
    },
    {
      label: "Guardrails and governance",
      detailMD: `Guardrails should operate before, during, and after generation. Input filters can detect unsafe or out-of-scope requests. Prompt and policy constraints can limit what the model is allowed to claim. Output validators can require citations, schema validity, and policy compliance.

For sensitive domains, human-in-the-loop review is often mandatory. The system should make review efficient by showing evidence, model reasoning summaries, flagged unsupported claims, and a clear audit trail.`
    }
  ],
  interview: {
    whatInterviewersLookFor: [
      "A precise definition of hallucination as false or unsupported output, not simply low-quality text.",
      "Clear separation of intrinsic, extrinsic, factual, citation, math, and staleness failure modes.",
      "Ability to map each limitation to a concrete mitigation such as RAG, tools, citations, structured output, verification, or human review.",
      "Product judgment around graceful failure, evaluation, red-teaming, and confidence handling."
    ],
    followUps: [
      {
        question: "Why can a model hallucinate even when it was trained on correct facts?",
        answerMD: `Training teaches the model patterns for likely continuations. At inference time it is not looking up a verified fact table unless the system gives it one. If the prompt is ambiguous, the fact is rare, the context is incomplete, or decoding samples a plausible continuation, the model can produce a confident statement that is not actually supported.`
      },
      {
        question: "How would you reduce hallucinations in an enterprise question answering bot?",
        answerMD: `Use retrieval from trusted enterprise sources, chunk and rank passages carefully, instruct the model to answer only from retrieved evidence, require citations for material claims, verify faithfulness before display, and say I do not know when evidence is insufficient. Add logging, human feedback, and regression evaluations for continuous improvement.`
      },
      {
        question: "When is lowering temperature useful, and why is it not enough?",
        answerMD: `Lower temperature reduces randomness and can make factual answers more consistent. It does not add missing knowledge, verify claims, fix stale training data, or make arithmetic exact. It is a helpful decoding control, but reliability still requires grounding, tools, constraints, and evaluation.`
      }
    ],
    alternativeDesigns: [
      {
        name: "Prompt-only assistant",
        detailMD: `A prompt-only design is cheap and simple for brainstorming, rewriting, and low-risk drafting. It is not appropriate for high-stakes factual answers because it has no independent evidence source and no deterministic verification path.`
      },
      {
        name: "Grounded assistant with tools and review",
        detailMD: `A grounded design retrieves sources, calls tools for exact work, verifies answer claims, and escalates uncertain cases. It costs more to build, but it is the right pattern for enterprise search, analytics, support, legal, medical, and financial workflows.`
      }
    ],
    commonMistakes: [
      "Treating hallucination as a prompt wording problem instead of a system reliability problem.",
      "Assuming citations are trustworthy without checking that they exist and support the exact claim.",
      "Using the model for exact math or database facts when a deterministic tool should be called.",
      "Reporting model confidence as if it were calibrated factual probability.",
      "Ignoring negative evaluation cases because the happy-path demo looks good."
    ]
  },
  interviewHints: [
    "Start with the definition: fluent and confident can still be false or unsupported.",
    "Name intrinsic and extrinsic hallucinations before listing examples.",
    "Connect limitations to mitigations instead of listing limitations in isolation.",
    "End with product behavior: sources, uncertainty, evaluation, and graceful failure."
  ],
  comparisons: [
    {
      title: "Hallucination failure modes",
      columns: ["Failure mode", "Definition", "Example", "Primary mitigation"],
      rows: [
        ["Intrinsic hallucination", "Contradicts a provided source", "Summary says revenue grew when the report says revenue declined", "Faithfulness checking against source spans"],
        ["Extrinsic hallucination", "Adds unsupported information", "Answer invents a customer name not present in any document", "Require evidence coverage and remove uncited claims"],
        ["Fabricated citation", "Claims a source exists or supports a claim when it does not", "Invents a paper title, URL, or page number", "Citation validation and source previews"],
        ["Wrong math", "Produces an incorrect computed result", "Sums invoice rows incorrectly", "Calculator, SQL, or code execution"],
        ["Outdated answer", "Uses stale training knowledge", "Gives an old product price or policy", "Fresh retrieval or live API lookup"]
      ]
    },
    {
      title: "Core LLM limitations",
      columns: ["Limitation", "Why it happens", "Product risk", "Mitigation"],
      rows: [
        ["Knowledge cutoff", "Training data is fixed at a point in time", "Stale facts and policies", "Live retrieval, APIs, and timestamped sources"],
        ["Weak arithmetic and counting", "Generation is not exact symbolic computation", "Incorrect totals, counts, and comparisons", "Tool calls and deterministic validators"],
        ["Prompt sensitivity", "Different wording changes the token distribution", "Inconsistent user experience", "Stable templates and prompt regression tests"],
        ["Context limits", "Only tokens inside the window can influence generation", "Missing earlier details or source evidence", "Retrieval, summarization, and context budgeting"],
        ["Bias", "Training data and feedback contain social and cultural patterns", "Unfair or harmful outputs", "Policy guardrails, audits, and diverse evaluations"],
        ["Sycophancy", "The model may over-optimize for agreement with the user", "Confirms false premises", "Contradiction handling and instruction to challenge assumptions"],
        ["Non-determinism", "Sampling and serving differences can vary outputs", "Hard-to-reproduce behavior", "Lower temperature, fixed seeds where available, and evaluations"]
      ]
    },
    {
      title: "Mitigation patterns",
      columns: ["Pattern", "Best for", "Strength", "Weakness"],
      rows: [
        ["Retrieval-augmented generation", "Questions answered from documents or knowledge bases", "Grounds answers in source evidence", "Quality depends on retrieval and chunking"],
        ["Citations and source attribution", "User-facing factual claims", "Makes evidence inspectable", "Citations can still be wrong unless validated"],
        ["Tool use and function calling", "Math, search, databases, and current facts", "Delegates exact work to reliable systems", "Requires tool schemas, auth, and error handling"],
        ["Constrained structured output", "APIs, workflows, and automation", "Improves parseability and policy checks", "Does not guarantee factual correctness by itself"],
        ["Verification passes", "High-value factual answers", "Catches unsupported or contradictory claims", "Adds latency and can share model blind spots"],
        ["Human-in-the-loop", "High-risk or ambiguous decisions", "Adds accountability and domain judgment", "Costs time and needs good review tooling"]
      ]
    }
  ],
  decisionGuideMD: `## Mitigation selection guide

Use **retrieval-augmented generation** when the answer should come from a document set, internal knowledge base, or policy source. Link the design to the **design-rag-pipeline** pattern: retrieve, rerank, answer with citations, verify groundedness, and log outcomes.

Use **tool use or function calling** when the answer depends on exact computation, database state, live product data, search, calendars, tickets, accounts, or any other system of record. The model should orchestrate and explain; the tool should compute or fetch.

Use **citations and source previews** when users must trust or audit factual claims. Citations should point to source spans that actually support the sentence, not just documents that happen to be nearby.

Use **lower temperature and stable prompts** when consistency matters, especially for support, compliance, and workflow automation. This reduces variation but does not replace grounding or verification.

Use **verification passes and evaluations** when failures are costly. Add faithfulness checks, factuality tests, red-team prompts, and regression cases from real incidents.

Use **human-in-the-loop review** when the domain is high-stakes, ambiguous, regulated, or personally consequential. Design the UI so reviewers see the answer, evidence, uncertainty flags, and recommended action quickly.

If evidence is missing, the correct product behavior is usually **I do not know**, **I need more context**, or **I can answer only this part**. Do not reward the system for always producing a complete-looking response.`,
  handsOn: [
    {
      title: "Score simple groundedness against source claims",
      detailMD: `This toy checker illustrates the core idea behind groundedness evaluation. A production evaluator would use stronger claim extraction and semantic matching, but the principle is the same: important answer claims must be supported by evidence.`,
      code: {
        language: "python",
        label: "groundedness_check.py",
        body: `source_claims = [
    "Refunds are available within 30 days",
    "Enterprise plans include audit logs",
    "Support is available Monday through Friday"
]

answer_claims = [
    "Refunds are available within 30 days",
    "Enterprise plans include audit logs",
    "Support is available every day"
]

supported = []
unsupported = []

for claim in answer_claims:
    if claim in source_claims:
        supported.append(claim)
    else:
        unsupported.append(claim)

score = len(supported) / len(answer_claims)

print("groundedness_score", round(score, 2))
print("supported_claims", supported)
print("unsupported_claims", unsupported)`
      }
    },
    {
      title: "Route exact work away from the model",
      detailMD: `This example shows a simple reliability rule: let deterministic code compute totals, then let the model explain the result using that trusted output. In a real system the tool might be SQL, search, a calculator, or a business API.`,
      code: {
        language: "python",
        label: "tool_routing.py",
        body: `def calculate_invoice_total(items):
    total = 0
    for item in items:
        total = total + item["quantity"] * item["unit_price"]
    return round(total, 2)

invoice_items = [
    {"name": "Seats", "quantity": 12, "unit_price": 19.0},
    {"name": "Storage", "quantity": 3, "unit_price": 8.5},
    {"name": "Support", "quantity": 1, "unit_price": 99.0}
]

tool_result = calculate_invoice_total(invoice_items)

answer = "The invoice total is " + str(tool_result) + ". This total came from the calculator tool."
print(answer)`
      }
    }
  ],
  quiz: [
    {
      question: "What is the best definition of an LLM hallucination?",
      options: [
        "Any answer that is longer than necessary",
        "Fluent output that is factually wrong or unsupported by the available evidence",
        "Any answer generated with high temperature",
        "A refusal to answer a user question"
      ],
      answerIndex: 1,
      explanationMD: `A hallucination is not defined by length or style. It is a claim presented as true even though it is false or not supported by the source context.`
    },
    {
      question: "What is an intrinsic hallucination?",
      options: [
        "A claim that contradicts the provided source",
        "A claim that is unsupported but not contradicted by a source",
        "A response generated without a system prompt",
        "A response that uses a citation"
      ],
      answerIndex: 0,
      explanationMD: `Intrinsic hallucination means the output conflicts with the source it was supposed to follow, such as a summary reversing a reported result.`
    },
    {
      question: "Which mitigation is best for exact arithmetic in an LLM product?",
      options: [
        "Use a more polite prompt",
        "Increase temperature",
        "Call a calculator, SQL query, or code tool",
        "Ask the model to answer more confidently"
      ],
      answerIndex: 2,
      explanationMD: `Exact arithmetic should be delegated to deterministic tools. The model can explain the result, but the computation should come from a reliable system.`
    },
    {
      question: "Why are citations alone not a complete solution?",
      options: [
        "Users never want citations",
        "Citations can be fabricated or point to sources that do not support the claim",
        "Citations make answers non-deterministic",
        "Citations remove the need for retrieval"
      ],
      answerIndex: 1,
      explanationMD: `A system must validate that citations exist and support the exact claims. Otherwise the model can produce convincing but false attribution.`
    },
    {
      question: "What should a product do when evidence is insufficient?",
      options: [
        "Force the model to produce a complete answer",
        "Hide uncertainty to keep the experience smooth",
        "Say I do not know, ask for clarification, retrieve more evidence, or escalate",
        "Increase the maximum token limit only"
      ],
      answerIndex: 2,
      explanationMD: `Graceful failure is a core reliability feature. The system should avoid unsupported claims and choose a safe next action.`
    },
    {
      question: "Which metric best checks whether an answer is supported by retrieved sources?",
      options: [
        "Token count",
        "Groundedness or faithfulness",
        "Response length",
        "Model parameter count"
      ],
      answerIndex: 1,
      explanationMD: `Groundedness and faithfulness evaluate whether answer claims are supported by the provided evidence, which is central for hallucination control.`
    }
  ],
  flashcards: [
    { front: "What is a hallucination?", back: "A fluent answer that is factually wrong or unsupported by the available evidence." },
    { front: "What is intrinsic hallucination?", back: "Output that contradicts the source the model was supposed to use." },
    { front: "What is extrinsic hallucination?", back: "Output that adds claims not supported by any provided source." },
    { front: "Why do LLMs hallucinate?", back: "They predict likely tokens rather than verifying facts against built-in ground truth." },
    { front: "What is the main mitigation for knowledge-base questions?", back: "Retrieval-augmented generation with source-grounded answers and citations." },
    { front: "What should handle exact math?", back: "A deterministic tool such as a calculator, SQL query, or code execution environment." },
    { front: "Why is lower temperature not enough?", back: "It reduces randomness but does not add missing knowledge, verify facts, or make computation exact." },
    { front: "What is graceful failure?", back: "Designing the product to say I do not know, ask for clarification, retrieve more evidence, or escalate when needed." }
  ],
  cheatSheetMD: `## Hallucinations and LLM limitations cheat sheet

### Definition
- A hallucination is fluent, confident output that is false or unsupported.
- The problem is evidence, not tone. Polished prose can still be wrong.
- LLMs predict likely next tokens; they do not automatically verify facts.

### Main hallucination types
- **Intrinsic:** contradicts the provided source.
- **Extrinsic:** adds unsupported claims not found in any source.
- **Fabricated citation:** invents a source or misattributes support.
- **Wrong math:** produces an incorrect computed answer.
- **Outdated knowledge:** answers from stale training data.

### Other core limitations
- Knowledge cutoff and stale facts.
- Weak arithmetic, counting, and exact symbolic work.
- Sensitivity to prompt phrasing.
- Limited context window and lost evidence.
- Bias from data and feedback.
- Sycophancy, meaning agreement with false user premises.
- Non-determinism from sampling and serving behavior.

### Mitigations
- Ground factual answers with retrieval.
- Cite source spans and validate citation support.
- Use tools for math, databases, search, and current facts.
- Lower temperature for consistency on factual tasks.
- Add verification passes for faithfulness and unsupported claims.
- Constrain outputs with schemas and validators.
- Use human review for high-stakes cases.
- Build guardrails, evals, and red-team suites.

### Measurement
- **Groundedness:** are answer claims supported by evidence?
- **Faithfulness:** does the answer avoid contradicting sources?
- **Factuality:** is the answer correct in the real world?
- **Citation precision:** do cited sources support the specific claim?
- **Refusal correctness:** does the system decline when it should?
- **Regression tests:** do old failures stay fixed after changes?

### Product rules
- Show sources for important claims.
- Prefer I do not know over unsupported certainty.
- Separate model confidence from evidence quality.
- Design clear fallbacks: clarify, retrieve, call a tool, or escalate.
- Evaluate continuously because demos do not prove reliability.`,
  references: [
    { title: "A Survey of Hallucination in Natural Language Generation", kind: "Paper", url: "https://arxiv.org/abs/2202.03629", author: "Ji et al." },
    { title: "TruthfulQA: Measuring How Models Mimic Human Falsehoods", kind: "Paper", url: "https://arxiv.org/abs/2109.07958", author: "Lin et al." },
    { title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", kind: "Paper", url: "https://arxiv.org/abs/2005.11401", author: "Lewis et al." },
    { title: "OpenAI Evals", kind: "Docs", url: "https://github.com/openai/evals", author: "OpenAI" }
  ],
  relatedLessons: [
    { slug: "design-rag-pipeline", note: "Shows how retrieval and grounding reduce unsupported factual answers." },
    { slug: "prompt-engineering-foundations", note: "Covers instruction patterns that reduce ambiguity and encourage uncertainty handling." },
    { slug: "sampling-and-decoding", note: "Explains how temperature and sampling affect consistency and variation." },
    { slug: "how-llm-inference-works", note: "Connects next-token generation to why fluent but unsupported text can appear." }
  ]
};
