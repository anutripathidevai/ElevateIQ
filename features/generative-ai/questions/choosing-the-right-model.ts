import type { GenAILessonContent } from "../types";

export const choosingTheRightModelContent: GenAILessonContent = {
  slug: "choosing-the-right-model",
  introductionMD: `Choosing the right model is one of the highest-leverage decisions in a generative AI system. The model determines quality, latency, cost, privacy posture, context capacity, modality support, and how much engineering you need around the model to make the product reliable.

In interviews, strong candidates do not answer this question with a favorite vendor or a leaderboard rank. They turn it into a decision framework: define the task, measure the actual workload, compare candidate models on representative evaluations, and choose the cheapest model that clears the quality and risk bar.

This lesson gives you that framework. You will learn the practical axes for model selection, how to compare frontier, small, reasoning, and specialized models, when open-weight hosting makes sense, and how routing, caching, batching, and cascades reduce cost without blindly sacrificing quality.

The goal is to make model choice explicit and testable. By the end, you should be able to defend a model selection in a design interview with concrete tradeoffs, token math, and an evaluation plan instead of vibes.`,
  realWorldMD: `Model selection appears in almost every production AI roadmap.

- A support chatbot may start with a small fast model and escalate difficult conversations to a frontier model.
- A coding assistant may use a specialized code model for completion, an embedding model for repository search, and a stronger reasoning model for multi-file planning.
- A regulated enterprise assistant may prefer open weights in a private region because data residency matters more than quick integration.
- A high-volume summarization pipeline may save more money through batching, prompt caching, and shorter outputs than through another prompt rewrite.
- A multimodal product may choose a model because it supports vision or audio even if a text-only benchmark ranks another model higher.`,
  learningObjectives: [
    "Compare candidate models across quality, latency, token cost, context window, modalities, tool support, privacy, licensing, and fine-tuning options.",
    "Distinguish frontier, small, reasoning, code, embedding, and other specialized model tiers.",
    "Explain when reasoning models justify extra latency and cost, and when a standard model is enough.",
    "Evaluate open-weight self-hosting against proprietary managed APIs using control, privacy, scale economics, reliability, and operations burden.",
    "Design routing and cascade strategies that use cheaper models first and escalate only when needed.",
    "Estimate monthly cost from request volume, input tokens, output tokens, and per-million-token prices."
  ],
  theory: [
    {
      label: "Model choice is a measured product decision",
      detailMD: `A model is not chosen in isolation. It is chosen for a task, a user experience, a risk tolerance, and a budget. The same model that is excellent for open-ended legal drafting may be wasteful for sentiment classification, and the model that is fast enough for autocomplete may fail on complex planning.

The interview signal is structure. Start with the job to be done, define what good output means, identify unacceptable failures, and only then compare models. This prevents a common mistake: choosing the largest or newest model before proving that the workload needs it.`
    },
    {
      label: "Capability, latency, and cost form the first tradeoff triangle",
      detailMD: `The first screen is usually quality, latency, and cost. Capability covers accuracy, reasoning depth, instruction following, robustness, multilingual performance, and domain knowledge. Latency covers time to first token and time to complete the answer. Cost depends on both input and output token prices, because many providers charge different rates for reading tokens and generating tokens.

For many products, the right answer is not the best model. It is the cheapest and fastest model that reliably clears the quality threshold. If the task is narrow, a small model may win. If the task has high user value or high failure cost, a frontier or reasoning model may be justified.`
    },
    {
      label: "Context, modality, tools, and output constraints define fit",
      detailMD: `A model must support the shape of the product. Long-document analysis needs a sufficient context window and strong long-context behavior, not just a large advertised limit. Image understanding needs vision input. Voice agents need audio support or a separate speech pipeline. Agentic workflows need reliable tool calling, function schemas, and structured output.

Structured-output support is especially important in production. If the downstream system expects valid JSON, a model that supports schemas, constrained decoding, or function calling can be safer than a model that scores slightly higher on general chat quality but frequently returns malformed fields.`
    },
    {
      label: "Privacy, residency, licensing, and hosting change the answer",
      detailMD: `The best technical model may not be deployable in your environment. Some workloads require data to stay in a specific region, never leave a virtual private cloud, or avoid vendor retention. Some teams need open weights for auditability, offline operation, customization, or cost control at high scale.

Licensing also matters. Open weights do not automatically mean unrestricted commercial use, and proprietary APIs do not automatically satisfy every compliance requirement. A strong design answer names these constraints early, because they can eliminate options before any quality comparison begins.`
    },
    {
      label: "General, reasoning, and specialized models have different jobs",
      detailMD: `Standard chat models are optimized for broad instruction following with good latency. Reasoning models spend more computation on difficult multi-step problems, which can improve math, planning, coding analysis, and tool-use decisions, but they usually cost more and respond more slowly. Specialized models focus on a narrower function such as code generation, embeddings, reranking, moderation, speech, or image understanding.

Production systems often combine several model types. A retrieval product may use an embedding model to find documents, a reranker to order passages, a standard model for normal answers, and a reasoning model only for ambiguous or high-stakes questions.`
    }
  ],
  requestFlow: [
    {
      step: "1. Define the task and failure cost",
      detailMD: `Write down the user task, output format, acceptable error rate, and impact of a bad answer. A low-stakes draft can tolerate different failures than a medical triage assistant or financial compliance tool. This step sets the quality bar before any vendor comparison.`
    },
    {
      step: "2. Estimate workload shape",
      detailMD: `Measure expected requests per day, input tokens per request, output tokens per request, peak concurrency, context length, modality mix, and latency target. These numbers determine whether token cost, GPU capacity, or responsiveness will dominate the design.`
    },
    {
      step: "3. List hard constraints",
      detailMD: `Filter candidates by requirements that are not negotiable: region, privacy policy, licensing, open-weight availability, supported languages, context window, vision or audio support, tool calling, structured outputs, fine-tuning, and service-level expectations.`
    },
    {
      step: "4. Build a representative evaluation set",
      detailMD: `Create examples from real traffic or realistic synthetic cases. Include common requests, edge cases, adversarial prompts, long-context examples, tool-calling cases, and examples where the correct answer is intentionally uncertain. The eval set should reflect the product, not a generic leaderboard.`
    },
    {
      step: "5. Benchmark quality, latency, and cost together",
      detailMD: `Run each candidate model on the same eval set and capture quality scores, refusal quality, format validity, time to first token, total latency, input tokens, output tokens, and estimated cost. A model that wins quality but doubles latency may not be a product win.`
    },
    {
      step: "6. Try a routing or cascade policy",
      detailMD: `Before defaulting every request to the strongest model, test a cheap-first policy. Use a small model for easy cases, confidence checks or heuristics to detect uncertainty, and a stronger model for escalation. Measure the combined quality and cost of the system, not just each model alone.`
    },
    {
      step: "7. Decide, launch behind monitoring, and revisit",
      detailMD: `Choose the model or route that clears the quality bar at the best cost and latency. Pin model versions when possible, monitor production drift, sample outputs for review, and rerun evaluations when providers release new models or pricing changes.`
    }
  ],
  deepDives: [
    {
      label: "Frontier, small, and specialized model tiers",
      detailMD: `Frontier models are the largest managed models with the broadest capability. They are best for hard reasoning, complex writing, ambiguous user intent, and high-value tasks where errors are expensive. Their drawbacks are higher latency, higher token cost, and sometimes stricter rate limits.

Small and fast models are ideal for classification, extraction, simple summarization, routing, rewriting, and low-latency chat. Specialized models should be used when the product needs a specific representation or skill: embeddings for retrieval, rerankers for search quality, code models for developer workflows, moderation models for safety, and multimodal models for image or audio inputs.`
    },
    {
      label: "Reasoning models versus standard models",
      detailMD: `Reasoning models are worth considering when the task requires multi-step planning, careful math, difficult code analysis, constrained decision making, or tool-use sequencing where a shallow answer fails. They are often not worth it for short extraction, style rewriting, simple Q&A over retrieved context, or classification where a standard model already meets the bar.

The practical test is incremental value. Compare a reasoning model against a standard model on the hardest slice of your eval set. If quality improves only slightly while latency and cost rise sharply, route only the hard slice to the reasoning model or keep it as an escalation path.`
    },
    {
      label: "Open-weight self-hosting versus proprietary managed APIs",
      detailMD: `Open-weight models can give stronger control over data flow, region, deployment topology, customization, and cost at steady high volume. They also let teams inspect weights, fine-tune locally, quantize, run offline, and avoid dependence on a single external API. The tradeoff is operational burden: GPU provisioning, serving stack tuning, autoscaling, reliability, security patching, monitoring, and model upgrades.

Managed APIs are usually faster to adopt and easier to operate. They provide hosted inference, model updates, high availability, safety tooling, and scaling without GPU operations. The tradeoff is less control over weights, pricing, availability, data handling choices, and sometimes version stability. Many mature teams use a hybrid: managed APIs for frontier quality and open weights for private or high-volume narrow workloads.`
    },
    {
      label: "Routing, cascades, and distillation",
      detailMD: `A cascade sends work to a cheap model first and escalates only when the answer is low confidence, high risk, long-context, user-visible, or fails validation. A model router can use rules, a classifier, embeddings, or a learned policy to select the model by task type and difficulty. The benefit is cost control without forcing every request through the most expensive model.

Distillation is a related optimization. A strong teacher model generates labels, rationales, or target outputs that train a smaller student model for a narrow task. Distillation can reduce serving cost dramatically, but it requires evaluation discipline because the student may copy teacher mistakes or fail outside the distilled distribution.`
    },
    {
      label: "Evaluation beyond leaderboards",
      detailMD: `Leaderboards are useful for discovery, but they are not a model-selection process. They may overrepresent tasks unlike your product, hide latency and cost, or include contaminated benchmark examples that appeared in training data. A high rank does not prove the model will follow your schema, handle your domain, or satisfy your safety constraints.

Build a representative eval set and score what matters: factuality, task success, hallucination rate, refusal quality, citation behavior, format validity, tool-call correctness, latency, token usage, and user preference. Keep a holdout set and periodically refresh examples so the model choice remains grounded in current product reality.`
    },
    {
      label: "Token cost math and cost reducers",
      detailMD: `Monthly model cost is roughly requests per day times days per month times input tokens per request times input price, plus the same calculation for output tokens at the output price. Output tokens often cost more because generation is sequential and consumes more inference work than reading cached prompt tokens.

Common cost reducers are shorter prompts, retrieval instead of huge context stuffing, prompt caching for repeated prefixes, batching offline jobs, shorter max output lengths, streaming for perceived latency, cheaper models for easy tasks, and precomputing embeddings. Always measure cost after the full prompt template and tool context are included, not just the user message.`
    }
  ],
  productionConsiderations: [
    {
      label: "Versioning and reproducibility",
      detailMD: `Pin model versions when the provider supports it and record prompt templates, tool schemas, sampling parameters, evaluation scores, and routing rules together. Model upgrades can change behavior even when the API name looks similar, so production systems need release notes, staged rollout, and rollback.`
    },
    {
      label: "Observability by model route",
      detailMD: `Track quality signals, latency, token usage, cost, retries, tool-call errors, schema failures, refusals, and escalation rate separately for each model route. Without route-level metrics, a cascade can silently become expensive or a small model can absorb tasks it should have escalated.`
    },
    {
      label: "Fallbacks and graceful degradation",
      detailMD: `Plan for rate limits, provider outages, regional failures, and model-specific regressions. Fallbacks can include a second provider, a smaller local model, cached answers, read-only mode, or escalating to human review. The fallback should preserve safety even if quality drops.`
    },
    {
      label: "Privacy and data governance",
      detailMD: `Classify data before sending it to a model. Sensitive workloads may require redaction, tenant isolation, private networking, regional endpoints, no-retention settings, audit logs, or self-hosted open weights. The governance decision should be part of model selection, not a patch added after launch.`
    }
  ],
  interview: {
    whatInterviewersLookFor: [
      "A clear framework that starts from task requirements and failure cost instead of naming a favorite model.",
      "Ability to compare quality, latency, input and output token cost, context, modality, tool support, privacy, licensing, and hosting tradeoffs.",
      "Understanding that routing and cascades can beat a single-model design on cost and latency.",
      "A concrete evaluation plan with representative examples, not vibes or generic benchmark rank alone."
    ],
    followUps: [
      {
        question: "When would you pay for a frontier or reasoning model?",
        answerMD: `I would pay for it when the task has high value or high failure cost, requires complex multi-step reasoning, needs strong instruction following across varied inputs, or fails evaluation with smaller models. I would still measure the hard slice separately and consider routing only that slice to the expensive model rather than using it for all traffic.`
      },
      {
        question: "How would you choose between an open-weight model and a managed API?",
        answerMD: `I would compare hard constraints first: data residency, privacy, licensing, offline needs, customization, and vendor policy. Then I would compare scale economics and operations. Open weights can win for private, customized, high-volume workloads if the team can operate GPUs reliably. Managed APIs usually win for speed to market, frontier quality, reliability, and no infrastructure burden.`
      },
      {
        question: "How do you avoid choosing a model based on benchmark vibes?",
        answerMD: `I would build a representative eval set from product tasks, include edge cases and failure modes, score outputs with human review or calibrated graders, and record latency and token cost. Benchmarks can shortlist candidates, but the decision should come from task-specific quality, format reliability, safety, cost, and latency on the actual workload.`
      }
    ],
    alternativeDesigns: [
      {
        name: "Single strong default model",
        detailMD: `Use one frontier or reasoning model for every request. This is simplest and can be appropriate during an early launch or for low-volume high-value products, but it often wastes money on easy tasks and can create avoidable latency.`
      },
      {
        name: "Task-specific model portfolio",
        detailMD: `Use different models for classification, embeddings, reranking, generation, reasoning, vision, and moderation. This improves cost and quality for mature systems, but it requires routing logic, evaluation per route, version management, and careful monitoring.`
      }
    ],
    commonMistakes: [
      "Choosing the newest or largest model without measuring the actual task.",
      "Ignoring output token price and estimating cost from input tokens only.",
      "Using an advertised context limit as proof of long-context quality.",
      "Forgetting privacy, data residency, licensing, and operations constraints until after the model is selected.",
      "Treating a benchmark leaderboard as a deployment evaluation."
    ]
  },
  interviewHints: [
    "Start with the decision axes: quality, latency, cost, context, modality, tools, privacy, and licensing.",
    "Say that the best model is the cheapest one that passes the product eval and risk bar.",
    "Mention routing: cheap model first, stronger model on uncertainty or high-risk tasks.",
    "Include token math with separate input and output prices.",
    "Warn about benchmark contamination and leaderboards that do not match the workload."
  ],
  comparisons: [
    {
      title: "Model selection axes",
      columns: ["Axis", "What to measure", "When it matters", "Common trap"],
      rows: [
        ["Capability and quality", "Task success, factuality, instruction following, robustness", "Open-ended, high-value, ambiguous, or safety-sensitive tasks", "Using a generic leaderboard as the only quality signal"],
        ["Latency", "Time to first token, total completion time, tail latency", "Chat, autocomplete, voice, and interactive agent workflows", "Only measuring average latency instead of p95"],
        ["Cost per token", "Input price, output price, cache discounts, average tokens", "High-volume products and long-answer workflows", "Forgetting that output tokens may cost more than input tokens"],
        ["Context window", "Usable context length, retrieval need, long-context accuracy", "Long documents, multi-turn memory, codebase analysis", "Assuming a bigger window means better use of all tokens"],
        ["Modality", "Text, vision, audio, image generation, speech support", "Products that must read screenshots, documents, voice, or media", "Forcing multimodal tasks through a text-only pipeline"],
        ["Tool and schema support", "Function calling accuracy, structured output validity, retry rate", "Agents, workflows, data extraction, and API orchestration", "Accepting free-form text when downstream systems need strict fields"],
        ["Customization", "Fine-tuning support, adapters, prompt caching, distillation options", "Domain style, private labels, or repeated narrow tasks", "Fine-tuning before proving prompting and retrieval are insufficient"],
        ["Privacy and licensing", "Retention policy, region, open-weight license, auditability", "Regulated, enterprise, offline, or private-data workloads", "Treating all providers and open licenses as equivalent"]
      ]
    },
    {
      title: "Model tier tradeoffs",
      columns: ["Tier", "Strength", "Weakness", "Use when"],
      rows: [
        ["Frontier or large general model", "Best broad capability, strong instruction following, flexible reasoning", "Highest cost, higher latency, external dependency if API-hosted", "Failure is expensive or the task is broad and hard"],
        ["Small fast model", "Low latency, low cost, easy to route at scale", "Weaker on complex reasoning and ambiguous instructions", "The task is narrow, repetitive, or latency-sensitive"],
        ["Reasoning model", "Better multi-step planning, math, code analysis, and tool sequencing", "Extra latency and cost, sometimes overkill for simple tasks", "Hard eval cases fail with standard models"],
        ["Specialized code model", "Strong code completion, repair, and repository-aware behavior", "May be less useful for general conversation or policy-heavy tasks", "The product is developer-facing or code-heavy"],
        ["Embedding or reranking model", "Efficient semantic retrieval and ranking", "Does not generate final natural-language answers", "You need search, RAG, deduplication, clustering, or recommendations"],
        ["Moderation or safety model", "Focused policy classification and risk detection", "Not a substitute for generation quality", "You need scalable safety checks before or after generation"]
      ]
    },
    {
      title: "Open-weight versus managed API",
      columns: ["Option", "Advantages", "Risks", "Best fit"],
      rows: [
        ["Open-weight self-hosted", "Control over data path, region, quantization, fine-tuning, and scale economics", "GPU operations, reliability, autoscaling, security patches, and model upgrade burden", "Private or high-volume workloads with strong infrastructure support"],
        ["Proprietary managed API", "Fast integration, frontier quality, managed reliability, no GPU operations", "Vendor dependency, external data path, pricing changes, and less weight-level control", "Rapid launch, broad capability, and teams without model-serving operations"],
        ["Hybrid portfolio", "Use managed frontier models for hard tasks and open weights for private or cheap routes", "More evaluation, routing, observability, and governance complexity", "Mature products with mixed privacy, quality, and cost requirements"]
      ]
    }
  ],
  decisionGuideMD: `## Practical model-selection checklist

### 1. Define the job
- What user task does the model perform?
- What output format is required?
- What failures are unacceptable?
- Is the task interactive, batch, agentic, or offline?

### 2. Filter by hard constraints
- **Context**: enough usable context for the longest realistic input.
- **Modality**: text, vision, audio, speech, or image support as needed.
- **Tools**: reliable function calling, structured outputs, and schema adherence.
- **Customization**: fine-tuning, distillation, adapters, or prompt caching if required.
- **Governance**: privacy, retention, residency, audit logs, and license terms.

### 3. Run task-specific evals
Use a representative eval set, not vibes. Include normal traffic, edge cases, long-context inputs, adversarial prompts, tool calls, and examples where the right answer is to say uncertainty. Score quality, hallucination rate, format validity, latency, and token usage.

### 4. Choose the cheapest passing route
- If a small model passes, use it.
- If only hard cases need more capability, route easy cases to a cheap model and escalate hard cases.
- If latency matters more than peak quality, prefer smaller or regional models.
- If privacy or residency is strict, consider open weights or private managed deployments.
- If the task is high-value and failure is expensive, pay for frontier or reasoning capability.

### 5. Revisit continuously
Model choice is not permanent. Re-run evals when traffic changes, prompts change, pricing changes, or providers release new versions. Keep a holdout set so improvements are real and not overfit to your examples.`,
  handsOn: [
    {
      title: "Estimate monthly model cost from token prices",
      detailMD: `This small Python helper estimates monthly cost from requests per day, average input tokens, average output tokens, and separate per-million-token prices. Use real measured token counts from logs whenever possible, because prompt templates, retrieved context, and tool results often dominate the user message.`,
      code: {
        language: "python",
        label: "monthly_model_cost.py",
        body: `def estimate_monthly_cost(
    requests_per_day,
    input_tokens_per_request,
    output_tokens_per_request,
    input_price_per_million,
    output_price_per_million,
    days_per_month=30
):
    monthly_input_tokens = requests_per_day * input_tokens_per_request * days_per_month
    monthly_output_tokens = requests_per_day * output_tokens_per_request * days_per_month

    input_cost = monthly_input_tokens / 1000000 * input_price_per_million
    output_cost = monthly_output_tokens / 1000000 * output_price_per_million
    total_cost = input_cost + output_cost

    return {
        "monthly_input_tokens": monthly_input_tokens,
        "monthly_output_tokens": monthly_output_tokens,
        "input_cost_usd": round(input_cost, 2),
        "output_cost_usd": round(output_cost, 2),
        "total_cost_usd": round(total_cost, 2),
    }

baseline = estimate_monthly_cost(
    requests_per_day=50000,
    input_tokens_per_request=1200,
    output_tokens_per_request=400,
    input_price_per_million=2.50,
    output_price_per_million=10.00
)

shorter_prompt = estimate_monthly_cost(
    requests_per_day=50000,
    input_tokens_per_request=800,
    output_tokens_per_request=300,
    input_price_per_million=2.50,
    output_price_per_million=10.00
)

print("Baseline estimate:")
print(baseline)
print("After shorter prompts and answers:")
print(shorter_prompt)`
      }
    },
    {
      title: "Estimate savings from a cheap-first cascade",
      detailMD: `A cascade can lower average cost when most requests are easy. The important metric is blended cost and blended quality: if the small model handles 80 percent of requests and escalation catches most hard cases, the product can feel strong while spending far less than a frontier-only baseline.`,
      code: {
        language: "python",
        label: "cascade_cost.py",
        body: `def blended_request_cost(cheap_cost, strong_cost, escalation_rate):
    cheap_share = 1 - escalation_rate
    return cheap_share * cheap_cost + escalation_rate * strong_cost

cheap_model_cost = 0.002
strong_model_cost = 0.030

for escalation_rate in [0.05, 0.15, 0.30, 0.50]:
    cost = blended_request_cost(cheap_model_cost, strong_model_cost, escalation_rate)
    print("Escalation rate:", escalation_rate)
    print("Blended cost per request USD:", round(cost, 4))`
      }
    }
  ],
  quiz: [
    {
      question: "What is the best first step when choosing a model for a production feature?",
      options: [
        "Pick the largest model available",
        "Define the task, quality bar, latency target, failure cost, and constraints",
        "Choose the model with the longest context window",
        "Use the model ranked first on a public leaderboard"
      ],
      answerIndex: 1,
      explanationMD: `Model selection starts with the product requirement and risk profile. Only then can you compare quality, latency, cost, context, modality, and governance tradeoffs.`
    },
    {
      question: "Why should input and output token prices be estimated separately?",
      options: [
        "Input tokens are always free",
        "Output tokens and input tokens are often priced differently and output generation is usually more expensive",
        "Only output tokens count toward latency",
        "The context window applies only to output tokens"
      ],
      answerIndex: 1,
      explanationMD: `Many providers charge different rates for input and output tokens. Output tokens often cost more because generation is sequential and compute-intensive.`
    },
    {
      question: "When is a reasoning model most likely worth its extra latency and cost?",
      options: [
        "Simple keyword classification",
        "Short style rewriting that a small model already handles",
        "Multi-step planning, difficult math, complex code analysis, or hard tool-use decisions",
        "Embedding documents for vector search"
      ],
      answerIndex: 2,
      explanationMD: `Reasoning models are best reserved for tasks where extra deliberation improves quality on hard examples enough to justify the added cost and latency.`
    },
    {
      question: "What is the main operational downside of self-hosting an open-weight model?",
      options: [
        "It can never run in a private region",
        "It cannot be fine-tuned",
        "The team must operate the serving stack, GPUs, scaling, reliability, monitoring, and upgrades",
        "It cannot reduce cost at high volume"
      ],
      answerIndex: 2,
      explanationMD: `Open weights can provide control and scale economics, but the team takes on GPU operations, reliability, security, autoscaling, observability, and upgrade work.`
    },
    {
      question: "What is a model cascade?",
      options: [
        "A prompt that contains every possible instruction",
        "A strategy that tries a cheaper model first and escalates selected cases to a stronger model",
        "A way to remove all evaluation data",
        "A guarantee that no output validation is needed"
      ],
      answerIndex: 1,
      explanationMD: `A cascade routes easy or low-risk requests to a cheaper model and sends uncertain, hard, or high-risk cases to a stronger model.`
    },
    {
      question: "Why should you be cautious about choosing a model from leaderboard rank alone?",
      options: [
        "Leaderboards never contain useful information",
        "Leaderboards may not match the product task, cost, latency, schema needs, or contamination risk",
        "Leaderboard rank includes only output token price",
        "A leaderboard automatically tests private company data"
      ],
      answerIndex: 1,
      explanationMD: `Leaderboards can shortlist candidates, but the final decision needs representative product evals plus latency, cost, safety, schema, and governance measurements.`
    }
  ],
  flashcards: [
    { front: "What is the core model-selection rule?", back: "Use the cheapest and fastest model or route that reliably clears the quality and risk bar." },
    { front: "Which axes matter beyond quality?", back: "Latency, input and output cost, context, modality, tool support, structured outputs, fine-tuning, privacy, residency, licensing, and hosting." },
    { front: "When should you consider a reasoning model?", back: "When hard multi-step tasks fail with standard models and the quality gain justifies extra cost and latency." },
    { front: "What is the advantage of a small fast model?", back: "Low latency and low cost for narrow, repetitive, or high-volume tasks." },
    { front: "What is a model cascade?", back: "A cheap-first routing pattern that escalates uncertain, hard, or high-risk requests to a stronger model." },
    { front: "Why can open weights be attractive?", back: "They can improve control over data, region, customization, offline use, and cost at scale." },
    { front: "What is the main benefit of managed APIs?", back: "Fast integration, managed reliability, frontier quality, and no GPU operations." },
    { front: "What should an eval set include?", back: "Representative traffic, edge cases, long-context examples, tool calls, adversarial prompts, and examples where uncertainty is correct." }
  ],
  cheatSheetMD: `## Choosing the right model cheat sheet

### Decision axes
- **Quality**: task success, factuality, instruction following, robustness.
- **Latency**: time to first token, total latency, p95 and p99 behavior.
- **Cost**: input tokens, output tokens, cache discounts, batching options.
- **Context**: usable long-context quality, not just advertised maximum.
- **Modality**: text, vision, audio, speech, or images.
- **Tools**: function calling, structured output, schema reliability.
- **Customization**: fine-tuning, distillation, adapters, prompt caching.
- **Governance**: privacy, retention, data residency, auditability, license.

### Model tiers
- **Frontier**: broad quality, higher cost and latency.
- **Small fast**: cheap and responsive for narrow tasks.
- **Reasoning**: best for hard planning, math, code analysis, and tool sequencing.
- **Code**: optimized for developer workflows.
- **Embedding and reranking**: retrieval, search, clustering, and ranking.
- **Moderation and safety**: policy classification and risk checks.

### Open-weight versus managed
- **Open-weight self-hosting** gives control, privacy, customization, and cost leverage at scale, but adds GPU operations and reliability work.
- **Managed APIs** give speed, reliability, no ops, and frontier quality, but reduce control and create vendor dependency.
- **Hybrid** often wins when privacy, scale, and frontier quality all matter.

### Cost formula
1. Monthly input tokens = requests per day times days times input tokens per request.
2. Monthly output tokens = requests per day times days times output tokens per request.
3. Monthly cost = input tokens divided by one million times input price, plus output tokens divided by one million times output price.

### Cost reducers
- Shorter prompts and shorter requested answers.
- Retrieval instead of stuffing huge context.
- Prompt caching for repeated prefixes.
- Batching for offline jobs.
- Cheap-first cascades and model routers.
- Distillation for narrow repeated tasks.

### Interview answer pattern
1. Define task, quality bar, failure cost, and constraints.
2. Shortlist models that support required context, modality, tools, privacy, and licensing.
3. Run representative evals and measure quality, latency, and cost.
4. Prefer the cheapest passing model.
5. Add routing or escalation if hard cases need a stronger model.
6. Monitor production and rerun evals after model or pricing changes.`,
  references: [
    { title: "Holistic Evaluation of Language Models", kind: "Paper", url: "https://arxiv.org/abs/2211.09110", author: "Liang et al." },
    { title: "FrugalGPT: How to Use Large Language Models While Reducing Cost and Improving Performance", kind: "Paper", url: "https://arxiv.org/abs/2305.05176", author: "Chen et al." },
    { title: "OpenAI API pricing", kind: "Docs", url: "https://openai.com/api/pricing/", author: "OpenAI" },
    { title: "Claude models overview", kind: "Docs", url: "https://docs.anthropic.com/en/docs/about-claude/models/overview", author: "Anthropic" }
  ],
  relatedLessons: [
    { slug: "how-llm-inference-works", note: "Explains why model size, output length, batching, and generation affect latency and cost." },
    { slug: "context-windows-and-kv-cache", note: "Helps evaluate context-window requirements and long-context tradeoffs." },
    { slug: "hallucinations-and-limitations", note: "Connects model choice to factuality, uncertainty, and safety evaluation." },
    { slug: "prompt-engineering-foundations", note: "Shows when prompting can improve a smaller model before switching to a larger one." }
  ]
};
