import type { GenAILessonContent } from "../types";

export const samplingAndDecodingContent: GenAILessonContent = {
  slug: "sampling-and-decoding",
  introductionMD: `Sampling and decoding are the final decision layer of language model inference. The transformer produces logits for every possible next token, but a product still needs a policy for turning that score vector into one concrete token. That policy can make the same model sound precise, bland, surprising, repetitive, or invalid.

In interviews, this topic separates people who have only used model defaults from people who understand why generation behaves the way it does. A strong answer explains softmax, temperature, greedy decoding, top-k and top-p sampling, beam search, penalties, and how all of those controls interact.

This lesson teaches the practical mental model: logits are shaped, filtered, normalized, and sampled one token at a time. You will learn when to use deterministic settings, when to allow diversity, why temperature zero is not an absolute reproducibility guarantee, and why structured output needs constraints rather than just a low temperature.`,
  realWorldMD: `Decoding settings show up anywhere a production system calls a generative model.

- Customer support bots use lower temperature to keep answers stable and policy compliant.
- Creative writing and brainstorming tools use broader sampling so outputs feel fresh.
- Code generation and data extraction prefer deterministic or constrained decoding because small token mistakes break syntax.
- Translation and summarization systems may use beam search or reranking when there is a tighter notion of sequence quality.
- Safety, brand voice, and cost controls often depend on penalties, stop conditions, and schema constraints as much as the base model.`,
  learningObjectives: [
    "Explain how logits become probabilities through softmax at each generation step.",
    "Describe how temperature rescales logits before softmax and why temperature zero behaves like greedy decoding.",
    "Compare greedy decoding, top-k sampling, top-p sampling, min-p sampling, and beam search.",
    "Use repetition, frequency, and presence penalties to reduce loops without overcorrecting.",
    "Choose decoding presets for factual, creative, coding, chat, and structured output tasks.",
    "Explain reproducibility limits around seeds, floating point kernels, backend changes, and temperature zero."
  ],
  theory: [
    {
      label: "Logits become probabilities through softmax",
      detailMD: `At each step, the model emits one raw score per vocabulary token. These scores are **logits**. A higher logit means the model currently prefers that token, but logits are not probabilities and do not need to sum to one.

Softmax converts logits into a probability distribution by exponentiating each score and dividing by the sum of all exponentiated scores. After softmax, every token has a probability, and the probabilities sum to one. Decoding is the policy that decides whether to take the highest probability token, sample from the distribution, or reshape the distribution first.`
    },
    {
      label: "Temperature changes the shape of the distribution",
      detailMD: `Temperature scales logits before softmax. Lower temperature divides by a small number, making high logits dominate and pushing the distribution toward the most likely token. Higher temperature flattens the distribution, giving lower ranked tokens more chance.

In practice, temperature zero is treated as greedy or near-greedy decoding: choose the highest scoring token instead of sampling. Values around 0.0 to 0.3 are common for extraction, classification, and factual answering. Values around 0.7 to 1.1 are common for brainstorming and creative writing, with higher values increasing surprise and the risk of incoherence.`
    },
    {
      label: "Greedy decoding is simple but brittle",
      detailMD: `Greedy decoding picks the highest probability token at every step. It is fast, easy to reason about, and useful when the task has a narrow target, such as emitting a boolean label or completing a short deterministic phrase.

The failure mode is myopia. The locally best next token can lead to a globally poor sequence, and once the model falls into a common phrase or repeated pattern, greedy decoding keeps reinforcing it. Outputs can become bland, overconfident, repetitive, or stuck in loops because the decoder never explores an alternative path.`
    },
    {
      label: "Top-k, top-p, and min-p truncate the tail",
      detailMD: `Sampling from the full vocabulary can let extremely unlikely tail tokens slip in, especially at higher temperature. **Top-k** keeps only the k most likely tokens before sampling. Typical k values are 40 to 100 for open-ended generation, while smaller values produce safer but narrower text.

**Top-p**, also called nucleus sampling, sorts tokens by probability and keeps the smallest set whose cumulative probability reaches p. Typical p values are 0.8 to 0.95 for chat and creative tasks. **Min-p** keeps tokens whose probability is at least a fraction of the top token probability, often around 0.05 to 0.15, which adapts better when the model is either very confident or very uncertain.`
    },
    {
      label: "Penalties steer token choice without changing model weights",
      detailMD: `Repetition controls modify logits before sampling. A **frequency penalty** lowers tokens proportionally to how often they have already appeared. A **presence penalty** lowers any token that has appeared at least once, encouraging the model to introduce new concepts. Some systems also use a repetition penalty that divides or subtracts from logits for repeated tokens.

These penalties interact with temperature and truncation. A high penalty plus high temperature can make the model avoid useful terms and drift off topic. A small penalty with top-p can reduce loops while preserving coherence. For factual answers, penalties should be mild; for poetry, brainstorming, or long-form prose, moderate penalties can improve variety.`
    }
  ],
  requestFlow: [
    {
      step: "1. Produce next-token logits",
      detailMD: `The model reads the prompt plus all tokens generated so far and produces a logit for every token in the vocabulary. This vector is the raw material for every decoding strategy.`
    },
    {
      step: "2. Apply logit processors",
      detailMD: `Before probabilities are computed, the serving layer may adjust logits for stop tokens, banned tokens, token bias, repetition penalties, frequency penalties, presence penalties, or structured-output constraints. These processors change which tokens are eligible or attractive.`
    },
    {
      step: "3. Scale logits by temperature",
      detailMD: `For nonzero temperature, logits are divided by the temperature before softmax. Lower values sharpen the distribution; higher values flatten it. Temperature zero is handled as a special greedy case rather than literal division by zero.`
    },
    {
      step: "4. Convert scores with softmax",
      detailMD: `Softmax turns the adjusted logits into probabilities. Numerically stable implementations subtract the maximum logit before exponentiation so very large scores do not overflow.`
    },
    {
      step: "5. Truncate the candidate set",
      detailMD: `The decoder may apply top-k, top-p, min-p, or a combination. Tokens outside the retained set are removed or assigned zero probability. This prevents sampling from the long tail of unlikely tokens.`
    },
    {
      step: "6. Renormalize the remaining probabilities",
      detailMD: `After truncation, the remaining probabilities must be normalized again so they sum to one. The final distribution is usually much smaller than the full vocabulary but still reflects the model preferences among retained tokens.`
    },
    {
      step: "7. Choose the next token",
      detailMD: `Greedy decoding takes the highest probability token. Sampling draws randomly according to the final distribution. Beam search keeps several partial sequences at once, expands each one, and retains the best scoring beams for the next step.`
    },
    {
      step: "8. Append, stop, or continue",
      detailMD: `The chosen token is appended to the context and the process repeats until a stop token, stop sequence, length limit, tool call, or schema-complete output ends generation. Decoding is therefore an iterative control loop, not a one-time choice.`
    }
  ],
  deepDives: [
    {
      label: "Beam search optimizes sequences, not chat quality",
      detailMD: `Beam search keeps multiple candidate sequences, called beams, and scores them by cumulative log probability, often with a length penalty. At each step, it expands every beam, keeps the highest scoring continuations, and repeats until completion. This helps tasks such as machine translation where there is a tighter target and the highest likelihood sequence is often a good answer.

For open-ended chat, beam search is rarely the default. It tends to produce generic high-probability text, can reduce diversity, increases latency by evaluating more candidates, and may still repeat common phrases. Modern chat systems usually prefer sampling plus instruction tuning, reranking, safety filters, and tool constraints.`
    },
    {
      label: "Temperature, top-p, top-k, and min-p are coupled",
      detailMD: `These knobs do not act independently. Temperature changes the probability shape before truncation. Top-k uses rank, top-p uses cumulative probability, and min-p uses probability relative to the best token. A high temperature can push more tokens into the nucleus, while a low temperature can make top-p keep only a few tokens.

A useful tuning rule is to change one major diversity control at a time. If the output is too bland, increase temperature slightly or increase top-p. If it is incoherent, lower temperature or top-p. If rare nonsense words appear, add top-k or min-p to cut the tail.`
    },
    {
      label: "Why temperature zero is not perfectly deterministic",
      detailMD: `Temperature zero removes sampling randomness, but production inference still has sources of variation. GPU kernels can be nondeterministic, floating point reductions can resolve near ties differently, batch scheduling can change execution paths, and providers may update model weights, tokenizers, safety layers, or system prompts.

Seeds improve reproducibility only when the provider supports them and the same model version, prompt bytes, parameters, backend, and tool state are held constant. Treat seeded output as repeatable within a controlled environment, not as a permanent contract across time.`
    },
    {
      label: "Structured output needs constrained decoding",
      detailMD: `Low temperature makes JSON or tool calls more stable, but it does not guarantee validity. The model can still choose a missing comma, an extra field, or a natural-language apology when the probability distribution allows it.

Constrained decoding solves a different problem: it masks invalid next tokens according to a grammar, JSON schema, function signature, or tool protocol. For production extraction and tool use, combine clear instructions, low temperature, schema validation, retries, and constrained decoding when available.`
    }
  ],
  productionConsiderations: [
    {
      label: "Use presets instead of ad hoc knobs",
      detailMD: `Production teams should define named presets such as deterministic extraction, balanced assistant, creative brainstorming, and strict JSON. Presets make behavior reviewable, simplify experiments, and prevent one feature team from quietly using unsafe settings for a regulated workflow.`
    },
    {
      label: "Log decoding parameters with every response",
      detailMD: `Store model version, temperature, top-p, top-k, min-p, penalties, seed, max tokens, stop rules, and schema mode with traces. When users report a bad answer, decoding settings are often the difference between a model issue and an integration issue.`
    },
    {
      label: "Validate outputs after generation",
      detailMD: `Decoding controls are not substitutes for validation. Factual tasks still need grounding and citations, code still needs tests or static checks, and structured outputs still need parsing and schema validation. The decoder reduces risk; it does not prove correctness.`
    }
  ],
  interview: {
    whatInterviewersLookFor: [
      "A clear explanation that logits are raw scores and softmax converts them to probabilities.",
      "Correct understanding that temperature rescales logits before softmax and that zero means greedy or near-greedy decoding.",
      "Ability to compare greedy decoding, top-k, top-p, min-p, beam search, and penalties with real tradeoffs.",
      "Practical guidance for deterministic, creative, and structured-output workloads."
    ],
    followUps: [
      {
        question: "Why can greedy decoding produce worse text than sampling even though it always picks the most likely token?",
        answerMD: `Greedy decoding is locally optimal, not globally optimal. A token that looks best now can lead to a dull or repetitive continuation, while a slightly less likely token may open a better sequence. Sampling allows the model to explore plausible alternatives, which is important for open-ended language where many continuations can be valid.`
      },
      {
        question: "How would you tune settings for a JSON extraction task?",
        answerMD: `Use a low temperature, often zero to 0.2, with a tight max token limit, clear field instructions, stop conditions, and schema validation. If the platform supports constrained decoding or tool schemas, use them because they can mask invalid tokens. Do not rely on low temperature alone to guarantee valid JSON.`
      },
      {
        question: "When would beam search be a reasonable choice?",
        answerMD: `Beam search is reasonable when the output has a strong sequence-level objective, such as translation, speech recognition, or some summarization systems with reranking. It is less attractive for chat because it is slower, less diverse, and often favors generic high-probability wording over helpfulness.`
      }
    ],
    alternativeDesigns: [
      {
        name: "Reranking multiple sampled candidates",
        detailMD: `Instead of one decode, generate several candidates with moderate diversity, then rank them with a reward model, evaluator, rules engine, or task-specific scorer. This can improve quality for high-value tasks, but it increases cost and latency.`
      },
      {
        name: "Constrained or grammar-based decoding",
        detailMD: `A constrained decoder tracks the allowed output grammar and masks tokens that would make the response invalid. This is stronger than prompt-only formatting and is especially useful for JSON, SQL fragments, tool calls, and domain-specific languages.`
      }
    ],
    commonMistakes: [
      "Saying temperature changes probabilities after softmax instead of scaling logits before softmax.",
      "Assuming temperature zero guarantees identical output forever across providers and model versions.",
      "Using high temperature and high penalties together, then blaming the base model for drifting off topic.",
      "Expecting low temperature alone to guarantee valid structured output.",
      "Using beam search for open-ended chat without considering latency, diversity, and generic-output failure modes."
    ]
  },
  interviewHints: [
    "Start the answer with logits, softmax, and next-token selection.",
    "Separate diversity controls from repetition controls.",
    "Mention that top-p adapts to distribution shape while top-k uses a fixed rank cutoff.",
    "For production, connect settings to task type: extraction, chat, creative writing, and JSON."
  ],
  playground: {
    descriptionMD: `This static playground shows how the same prompt can produce different behavior when decoding settings change. The numbers are illustrative, not a live model call.`,
    systemPrompt: "You are a concise product copywriter. Return one paragraph.",
    userPrompt: "Name a new note-taking app for researchers and explain the vibe in two sentences.",
    parameters: [
      { name: "temperature", value: "0.2 versus 1.1", note: "Lower is steadier; higher gives less likely words more chance." },
      { name: "top_p", value: "0.9", note: "Sample from the nucleus that covers 90 percent cumulative probability." },
      { name: "top_k", value: "50", note: "Keep only the 50 highest ranked tokens before sampling." },
      { name: "frequency_penalty", value: "0.2", note: "Slightly discourages repeating the same terms." },
      { name: "seed", value: "1234", note: "Improves reproducibility only on the same backend and model version." }
    ],
    sampleOutputMD: `**Low temperature sample**

Scholar Notes is a focused note-taking app for researchers who need clean citation capture, summaries, and project organization. The vibe is calm, precise, and academic, with very little surprise.

**High temperature sample**

Margin Lantern is a research companion that turns scattered quotes, half-formed hypotheses, and late-night article trails into a glowing map of ideas. The vibe is curious and slightly magical, like a lab notebook crossed with a reading room after midnight.`
  },
  comparisons: [
    {
      title: "Decoding strategy comparison",
      columns: ["Strategy", "How it chooses", "Strength", "Risk", "Best use"],
      rows: [
        ["Greedy", "Always picks the highest probability next token", "Fast and stable", "Bland or repetitive", "Labels, short extraction, strict tasks"],
        ["Sampling", "Draws from the probability distribution", "Diverse and natural", "Can drift or vary", "Chat, writing, ideation"],
        ["Top-k", "Samples only from the k highest ranked tokens", "Cuts rare tail tokens", "Fixed cutoff can be too narrow or too wide", "General open-ended generation"],
        ["Top-p", "Samples from the smallest nucleus reaching cumulative probability p", "Adapts to confidence", "Can still allow odd tokens at high temperature", "Assistants and creative tasks"],
        ["Beam search", "Keeps multiple high scoring partial sequences", "Better sequence search", "Generic, slower, less diverse", "Translation and speech recognition"]
      ]
    },
    {
      title: "Parameter effects",
      columns: ["Control", "Mechanism", "Typical range", "Watch out"],
      rows: [
        ["Temperature", "Scales logits before softmax", "0.0 to 1.2 for most products", "High values amplify randomness and errors"],
        ["Top-p", "Keeps tokens until cumulative probability reaches p", "0.8 to 0.95 for balanced generation", "Very low p can sound cramped"],
        ["Top-k", "Keeps a fixed number of highest ranked tokens", "40 to 100 for broad sampling", "Not available in every API"],
        ["Min-p", "Keeps tokens above a fraction of the best token probability", "0.05 to 0.15 when supported", "Too high can remove useful alternatives"],
        ["Frequency penalty", "Penalizes tokens by repeat count", "0.1 to 0.8 for long-form variety", "Can suppress necessary domain terms"],
        ["Presence penalty", "Penalizes tokens once they have appeared", "0.1 to 0.8 for topic expansion", "Can push the answer away from the requested topic"]
      ]
    },
    {
      title: "Practical presets",
      columns: ["Workload", "Temperature", "Truncation", "Penalties", "Extra guardrail"],
      rows: [
        ["Factual QA", "0.0 to 0.3", "top_p 0.8 to 1.0", "None or mild", "Grounding and citations"],
        ["JSON extraction", "0.0 to 0.2", "Narrow or default", "Usually none", "Schema validation or constrained decoding"],
        ["Creative writing", "0.7 to 1.1", "top_p 0.9 to 0.95 or top_k 50", "Mild to moderate", "Human review"],
        ["Brainstorming", "0.8 to 1.2", "Broad nucleus", "Presence penalty can help", "Generate multiple candidates"],
        ["Code generation", "0.0 to 0.4", "Moderate nucleus", "Low or none", "Tests, lint, and syntax checks"]
      ]
    }
  ],
  decisionGuideMD: `## Choosing decoding settings

Use **low temperature and tight constraints** when correctness, reproducibility, or parseability matters. This includes extraction, classification, code edits, database filters, and tool calls.

Use **moderate temperature with top-p** for normal assistant chat. This keeps responses natural without letting the model wander too far into low-probability text.

Use **higher temperature, broader top-p, and mild penalties** for creative work. Generate multiple candidates when quality matters, because diversity is useful only if you can select the best output.

Use **constrained decoding** when the output must be JSON, a tool call, or a grammar-bound artifact. Low temperature reduces variation, but constraints define what is legally allowed.

Use **seeds for experiments**, not as a product guarantee. Pin model version, prompt construction, parameters, and backend when you need repeatable comparisons.`,
  handsOn: [
    {
      title: "Inspect how temperature reshapes probabilities",
      detailMD: `This small Python example shows the same logit vector under several temperatures. Notice how low temperature concentrates probability on the best token while high temperature spreads mass across alternatives.`,
      code: {
        language: "python",
        label: "temperature_softmax.py",
        body: `import math

def softmax_with_temperature(logits, temperature):
    if temperature == 0:
        best = max(range(len(logits)), key=lambda i: logits[i])
        return [1.0 if i == best else 0.0 for i in range(len(logits))]

    scaled = [value / temperature for value in logits]
    shift = max(scaled)
    weights = [math.exp(value - shift) for value in scaled]
    total = sum(weights)
    return [round(weight / total, 3) for weight in weights]

tokens = ["clear", "bold", "strange", "banana"]
logits = [5.0, 4.6, 2.2, 0.4]

for temperature in [0, 0.3, 0.7, 1.2]:
    print("temperature", temperature)
    print(softmax_with_temperature(logits, temperature))`
      }
    },
    {
      title: "Filter candidates with top-k, top-p, and min-p",
      detailMD: `This pseudocode-style Python keeps the main filtering ideas visible. Real serving systems do this over tens of thousands of tokens and then renormalize before drawing the next token.`,
      code: {
        language: "python",
        label: "candidate_filtering.py",
        body: `def filter_candidates(items, top_k=None, top_p=None, min_p=None):
    items = sorted(items, key=lambda item: item["prob"], reverse=True)

    if top_k is not None:
        items = items[:top_k]

    if top_p is not None:
        kept = []
        running = 0.0
        for item in items:
            kept.append(item)
            running = running + item["prob"]
            if running >= top_p:
                break
        items = kept

    if min_p is not None and len(items) > 0:
        threshold = items[0]["prob"] * min_p
        items = [item for item in items if item["prob"] >= threshold]

    total = sum(item["prob"] for item in items)
    for item in items:
        item["renormalized"] = round(item["prob"] / total, 3)
    return items

candidates = [
    {"token": "clear", "prob": 0.42},
    {"token": "concise", "prob": 0.24},
    {"token": "careful", "prob": 0.16},
    {"token": "unexpected", "prob": 0.07},
    {"token": "purple", "prob": 0.01},
]

print(filter_candidates(candidates, top_k=4, top_p=0.9, min_p=0.1))`
      }
    }
  ],
  quiz: [
    {
      question: "What are logits in language model decoding?",
      options: [
        "Raw model scores for each possible next token before softmax",
        "Already normalized probabilities that sum to one",
        "The final text returned to the user",
        "The attention weights from the first transformer layer"
      ],
      answerIndex: 0,
      explanationMD: `Logits are raw next-token scores. Softmax turns them into a probability distribution that a decoder can sample from or maximize.`
    },
    {
      question: "What does temperature do?",
      options: [
        "It changes the prompt length before tokenization",
        "It scales logits before softmax, sharpening or flattening the distribution",
        "It removes the need for stop tokens",
        "It reranks complete answers after generation"
      ],
      answerIndex: 1,
      explanationMD: `Temperature is applied before softmax. Lower temperature sharpens the distribution; higher temperature flattens it.`
    },
    {
      question: "How does top-p sampling choose its candidate set?",
      options: [
        "It always keeps exactly p tokens",
        "It keeps all tokens whose text starts with p",
        "It keeps the smallest set of highest probability tokens whose cumulative probability reaches p",
        "It keeps only tokens that have never appeared before"
      ],
      answerIndex: 2,
      explanationMD: `Top-p, or nucleus sampling, sorts by probability and keeps enough tokens to reach the cumulative probability threshold.`
    },
    {
      question: "Why is beam search rarely the default for open-ended chat?",
      options: [
        "It cannot generate more than one token",
        "It tends to be slower, less diverse, and biased toward generic high-probability text",
        "It only works with image models",
        "It prevents the model from using softmax"
      ],
      answerIndex: 1,
      explanationMD: `Beam search is useful for sequence optimization tasks, but chat quality often benefits from diversity and preference tuning rather than only high likelihood.`
    },
    {
      question: "Which setting is strongest for guaranteeing valid JSON when the platform supports it?",
      options: [
        "High temperature",
        "A larger top-k value",
        "Constrained decoding with a schema or grammar",
        "A stronger presence penalty"
      ],
      answerIndex: 2,
      explanationMD: `Low temperature helps, but constrained decoding can mask invalid next tokens according to the schema or grammar.`
    },
    {
      question: "What is a frequency penalty designed to do?",
      options: [
        "Lower tokens based on how many times they have already appeared",
        "Increase the context window",
        "Convert logits into embeddings",
        "Force beam search to use more beams"
      ],
      answerIndex: 0,
      explanationMD: `A frequency penalty discourages repeated tokens in proportion to their count, which can reduce loops and repeated phrases.`
    }
  ],
  flashcards: [
    { front: "What is the role of softmax in decoding?", back: "It converts adjusted logits into probabilities over the next token." },
    { front: "What does temperature zero mean in practice?", back: "Greedy or near-greedy decoding that chooses the highest scoring token, subject to implementation details." },
    { front: "What is the main weakness of greedy decoding?", back: "It is locally optimal and can become bland, repetitive, or stuck in a poor continuation." },
    { front: "How does top-k sampling truncate candidates?", back: "It keeps only the k highest ranked tokens before sampling." },
    { front: "How does top-p sampling truncate candidates?", back: "It keeps the smallest high-probability set whose cumulative probability reaches p." },
    { front: "What does min-p do?", back: "It keeps tokens whose probability is at least a chosen fraction of the top token probability." },
    { front: "When is beam search most useful?", back: "When there is a tighter sequence-level target, such as translation or speech recognition." },
    { front: "Why is low temperature not enough for JSON?", back: "It reduces variation but cannot prevent invalid tokens; schema or grammar constraints are stronger." }
  ],
  cheatSheetMD: `## Sampling and decoding cheat sheet

### Core pipeline
1. Model emits logits for the next token.
2. Logit processors apply penalties, bans, biases, stop rules, or constraints.
3. Temperature scales logits before softmax.
4. Softmax converts scores into probabilities.
5. Top-k, top-p, or min-p may truncate the candidate set.
6. Remaining probabilities are renormalized.
7. A token is selected by greedy decoding, sampling, or beam search.
8. The token is appended and the loop repeats.

### Strategy summary
- **Greedy**: fastest and most stable, but can be bland or repetitive.
- **Temperature sampling**: controls how sharp or flat the distribution is.
- **Top-k**: fixed rank cutoff, useful for removing rare tail tokens.
- **Top-p**: adaptive nucleus cutoff, common default for chat.
- **Min-p**: relative probability cutoff, useful when supported.
- **Beam search**: sequence search, strong for translation, weak default for chat.

### Practical presets
- **Factual QA**: temperature 0.0 to 0.3, mild or no penalties, grounding required.
- **Extraction and JSON**: temperature 0.0 to 0.2, constrained decoding when possible, validate output.
- **Balanced assistant**: temperature 0.4 to 0.8, top_p around 0.9.
- **Creative writing**: temperature 0.8 to 1.1, broad top_p, mild penalties.
- **Brainstorming**: generate multiple candidates, then rank or select.

### Reproducibility
- Temperature zero reduces randomness but is not a permanent guarantee.
- Seeds help only when the same model version, prompt bytes, backend, and parameters are fixed.
- Log every decoding parameter with production traces.

### Structured output
- Low temperature improves consistency.
- Constrained decoding defines legal next tokens.
- Schema validation and retries still belong in the application layer.`,
  references: [
    { title: "The Curious Case of Neural Text Degeneration", kind: "Paper", url: "https://arxiv.org/abs/1904.09751", author: "Holtzman et al." },
    { title: "Hugging Face Transformers Generation Strategies", kind: "Docs", url: "https://huggingface.co/docs/transformers/main/en/generation_strategies", author: "Hugging Face" },
    { title: "OpenAI API Reference for Generation Parameters", kind: "Docs", url: "https://platform.openai.com/docs/api-reference/responses/create", author: "OpenAI" },
    { title: "Beam Search Strategies for Neural Machine Translation", kind: "Paper", url: "https://arxiv.org/abs/1702.01806", author: "Freitag and Al-Onaizan" }
  ],
  relatedLessons: [
    { slug: "how-llm-inference-works", note: "Shows where the next-token decoding loop fits into serving and latency." },
    { slug: "transformer-architecture", note: "Explains how the model produces the logits that decoding consumes." },
    { slug: "prompt-engineering-foundations", note: "Connects prompt design to decoding settings for stable outputs." },
    { slug: "hallucinations-and-limitations", note: "Explains why decoding controls reduce but do not eliminate incorrect answers." }
  ]
};
