import type { GenAILessonContent } from "../types";

export const attentionMechanismContent: GenAILessonContent = {
  slug: "attention-mechanism",
  introductionMD: `Attention is the mechanism that lets a transformer decide which tokens matter to each token representation. Instead of forcing an entire sentence into one fixed state, every position keeps its own hidden vector and can pull information from other positions through learned query, key, and value projections.

In interviews, attention is where vague LLM explanations usually break down. A strong answer connects the math to behavior: dot products become relevance scores, scaling keeps those scores numerically controlled, softmax turns them into weights that sum to one, and the weighted sum of values becomes the information carried forward.

This lesson builds that mental model from one scaled dot-product attention head up to multi-head attention, causal masking, rotary position embeddings, and serving optimizations such as the KV cache and grouped-query attention. The goal is to explain attention clearly enough to reason about model quality, context length, latency, and interpretability in production systems.`,
  realWorldMD: `Attention appears in almost every serious generative AI system.

- Chat and coding models use **causal self-attention** to predict the next token without seeing future tokens.
- Encoder models use bidirectional self-attention to create embeddings for retrieval and classification.
- Encoder-decoder models use **cross-attention** so the decoder can read an encoded source document or instruction.
- Long-context serving cost is dominated by the n by n attention score matrix during prompt processing.
- KV caches, grouped-query attention, and position encodings determine how efficiently a model can serve long conversations.
- Interpretability research often starts by inspecting attention heads that track syntax, coreference, or matching delimiters.`,
  learningObjectives: [
    "Explain query, key, and value vectors and why query-key dot products measure relevance.",
    "Derive scaled dot-product attention in words, including the divide-by-sqrt(d_k) factor.",
    "Describe how softmax produces attention weights that sum to one and how those weights mix value vectors.",
    "Distinguish self-attention, cross-attention, and causal self-attention in decoder-only models.",
    "Explain why multi-head attention splits the hidden state into several specialized relationship channels.",
    "Connect attention to positional information, quadratic cost, KV caching, grouped-query attention, and interpretability."
  ],
  theory: [
    {
      label: "Query, key, and value are learned views of hidden states",
      detailMD: `Attention starts with a sequence of hidden vectors, one per token position. Three learned linear projections turn each hidden vector into a query, a key, and a value. The query asks what this position is looking for, the key advertises what another position contains, and the value is the information that will be copied if that position is selected.

These are not separate tokens or hand-written features. They are learned coordinate systems. During training, the model discovers projections that make useful relationships easy to score, such as a pronoun looking for its antecedent, an operator looking for its operands, or a closing bracket looking for the opening bracket.`
    },
    {
      label: "Dot products turn compatibility into attention scores",
      detailMD: `For one token to decide whether another token matters, the model takes the dot product between the first token query and the second token key. If the vectors point in similar directions, the dot product is large. If they are unrelated or opposed, the score is smaller. This gives each query a relevance score against every key.

Across a sequence of length n, doing this for every query-key pair creates an n by n score matrix. Row i answers the question: for token i, how much should it attend to each token j before masking and normalization? This pairwise comparison is the source of both attention power and its quadratic cost.`
    },
    {
      label: "Scaling and softmax make the scores usable",
      detailMD: `Raw dot products grow larger as the key and query dimension d_k grows. If those scores become too large, softmax saturates: one position gets almost all the probability, gradients become tiny for the others, and training becomes less stable. Scaled dot-product attention divides each score by sqrt(d_k) before softmax.

Softmax is applied across each row of scores. The result is a set of nonnegative weights that sum to one for each query position. The output for that position is then a weighted sum of value vectors, so high-weight tokens contribute more information and low-weight tokens contribute little.`
    },
    {
      label: "Self-attention, cross-attention, and causal masking",
      detailMD: `In self-attention, queries, keys, and values all come from the same sequence. Encoder-style models usually allow every token to attend to every other token. Decoder-only models use causal self-attention, where a mask blocks each position from attending to future positions so next-token prediction cannot leak the answer.

In cross-attention, the query usually comes from a decoder state, while keys and values come from another source, such as an encoder output. This is common in encoder-decoder translation models and can also appear in multimodal systems where text queries attend over image or audio representations.`
    },
    {
      label: "Multi-head attention runs several attention patterns in parallel",
      detailMD: `A single attention head has one query-key-value space. Multi-head attention splits the hidden representation into several smaller heads, runs scaled dot-product attention independently in each head, concatenates the head outputs, and projects the result back to the model hidden size.

The benefit is specialization. One head can learn local syntax, another can track coreference, another can match brackets or quotes, and another can retrieve task-specific tokens. Heads are not guaranteed to be human-interpretable, but the architecture gives the model several parallel channels for different relationships.`
    },
    {
      label: "Attention needs position information because it is order-agnostic",
      detailMD: `Plain attention compares vectors and does not inherently know whether a token came first or last. If the model received the same token vectors in a different order without positional information, the attention computation would not reliably distinguish the original sentence from a shuffled one.

Older transformers added learned or sinusoidal position vectors to token embeddings. Many modern LLMs use rotary position embeddings, or RoPE, which rotate query and key dimensions according to position before the dot product. RoPE makes relative distances visible inside attention scores and tends to work better for long-context decoder-only models than simple absolute position tables.`
    }
  ],
  architecture: {
    width: 980,
    height: 520,
    nodes: [
      { id: "input", label: "Input Hidden States", kind: "client", x: 40, y: 250, sublabel: "one vector per token" },
      { id: "qproj", label: "Q Projection", kind: "service", x: 210, y: 110, sublabel: "queries" },
      { id: "kproj", label: "K Projection", kind: "service", x: 210, y: 250, sublabel: "keys" },
      { id: "vproj", label: "V Projection", kind: "service", x: 210, y: 390, sublabel: "values" },
      { id: "scores", label: "Scores", kind: "analytics", x: 430, y: 180, sublabel: "Q dot K^T" },
      { id: "softmax", label: "Scale + Softmax", kind: "worker", x: 610, y: 180, sublabel: "divide by sqrt(d_k)" },
      { id: "weighted", label: "Weighted Sum with V", kind: "worker", x: 760, y: 310, sublabel: "attention weights times values" },
      { id: "output", label: "Attention Output", kind: "analytics", x: 910, y: 310, sublabel: "mixed hidden states" }
    ],
    edges: [
      { from: "input", to: "qproj", label: "linear" },
      { from: "input", to: "kproj", label: "linear" },
      { from: "input", to: "vproj", label: "linear" },
      { from: "qproj", to: "scores", label: "queries" },
      { from: "kproj", to: "scores", label: "keys" },
      { from: "scores", to: "softmax", label: "score matrix" },
      { from: "softmax", to: "weighted", label: "weights" },
      { from: "vproj", to: "weighted", label: "values" },
      { from: "weighted", to: "output", label: "sum" }
    ],
    captionMD: `Scaled dot-product attention: hidden states are projected into queries, keys, and values; query-key scores are scaled and normalized with softmax; the resulting weights mix value vectors into the attention output.`
  },
  architectureNotesMD: `The diagram shows one attention head. A real multi-head attention layer repeats this flow in parallel with different learned projection matrices, then concatenates all head outputs and applies a final output projection. The surrounding transformer block adds residual connections, normalization, and a feed-forward network.

The score node represents the n by n matrix created by comparing every query position with every key position. In a decoder-only model, a causal mask is applied before softmax so entries pointing to future tokens are set to a very negative number and receive effectively zero probability.

The value path is separate on purpose. Keys decide which positions are relevant, but values provide the content that is actually mixed into the output. This separation lets the model learn one representation for matching and another representation for information transfer.`,
  requestFlow: [
    {
      step: "1. Receive a sequence of hidden states",
      detailMD: `The attention layer receives one hidden vector per token position from the embedding layer or previous transformer block. The shape is conceptually sequence length by hidden size.`
    },
    {
      step: "2. Project hidden states into Q, K, and V",
      detailMD: `Three learned linear projections create query, key, and value vectors. In multi-head attention, the projected vectors are split across heads so each head works with a smaller dimension.`
    },
    {
      step: "3. Compute query-key relevance scores",
      detailMD: `Each query is compared with every key using a dot product. The result is one row of scores per query position, and each row contains a score for every possible source position.`
    },
    {
      step: "4. Scale scores and apply masks",
      detailMD: `Scores are divided by sqrt(d_k) to keep their variance controlled. If the model is decoder-only, the causal mask sets future-token scores to a very negative value before softmax. Padding masks can also hide padding tokens.`
    },
    {
      step: "5. Normalize scores with softmax",
      detailMD: `Softmax converts each row into nonnegative attention weights that sum to one. The model can now treat the row as a distribution over which value vectors should influence the current token.`
    },
    {
      step: "6. Mix value vectors",
      detailMD: `For each query position, the layer multiplies every value vector by its attention weight and sums the results. This produces one attention output vector for that position.`
    },
    {
      step: "7. Concatenate heads and project",
      detailMD: `In multi-head attention, each head produces its own output vectors. The model concatenates those head outputs and applies a final learned projection back to the hidden size expected by the rest of the transformer block.`
    },
    {
      step: "8. Reuse keys and values during generation",
      detailMD: `During autoregressive serving, previously computed keys and values are stored in the KV cache. New tokens only need fresh queries plus attention over cached keys and values, which reduces repeated work during token-by-token decoding.`
    }
  ],
  deepDives: [
    {
      label: "Why divide by sqrt(d_k)",
      detailMD: `If query and key components have roughly unit variance, their dot product has variance proportional to d_k. Larger head dimensions therefore produce larger raw scores. Large scores push softmax into sharp, saturated distributions where one entry dominates and gradients for the rest become weak.

Dividing by sqrt(d_k) keeps score magnitudes in a healthier range across different head sizes. This does not change which keys are more aligned with a query, but it changes the temperature of the softmax so training is more stable and attention does not collapse too early.`
    },
    {
      label: "Quadratic attention cost and serving optimizations",
      detailMD: `For a prompt of length n, self-attention creates an n by n score matrix in every layer and head. That makes prompt prefill expensive for long contexts because every token can compare with every other token. Memory for activations and intermediate attention data also grows quickly during training or large-batch inference.

The KV cache reduces generation cost after prefill by saving old keys and values instead of recomputing them for every new token. Grouped-query attention reduces serving memory by letting multiple query heads share fewer key-value heads. These optimizations reduce decoding and memory pressure, but they do not make full prompt prefill free. The context-windows-and-kv-cache lesson goes deeper on this tradeoff.`
    },
    {
      label: "RoPE versus learned and sinusoidal positions",
      detailMD: `Learned absolute position embeddings store a vector per position, which is simple but tied to the trained context range. Sinusoidal embeddings use fixed waves, which avoid a learned table and expose relative patterns indirectly, but they are less common in frontier decoder-only LLMs today.

RoPE applies a position-dependent rotation to query and key dimensions before the dot product. Because the same rotation structure is used across positions, the resulting attention score naturally depends on relative distance. This is one reason RoPE is popular in modern decoder-only models and why long-context extensions often focus on RoPE scaling.`
    },
    {
      label: "Interpretability through attention heads",
      detailMD: `Attention weights are not a complete explanation of model behavior, but they are a useful window into some learned circuits. Researchers have found heads that track syntax, copy previous tokens, link pronouns to names, attend from a closing delimiter to its opener, or focus on induction patterns that repeat text structure.

A careful interview answer should avoid saying attention alone equals explanation. The attention output is later transformed by feed-forward layers and residual streams. Still, attention heads provide concrete evidence that transformers learn reusable relationship detectors rather than only memorizing surface statistics.`
    }
  ],
  productionConsiderations: [
    {
      label: "Long-context latency and memory",
      detailMD: `The n by n attention score matrix makes long prompts expensive, especially during prefill. Production systems control this with context limits, prompt compression, retrieval, batching policy, paged KV caches, and model variants designed for efficient attention.`
    },
    {
      label: "Masking and numerical stability",
      detailMD: `Masks must be applied before softmax and must use values that behave correctly in the chosen precision. Implementations also subtract the row maximum before exponentiation so softmax stays stable in FP16, BF16, and quantized serving paths.`
    },
    {
      label: "KV cache layout and attention variants",
      detailMD: `The KV cache grows with layers, sequence length, batch size, and the number of key-value heads. Multi-query and grouped-query attention reduce cache size by sharing keys and values across query heads, improving throughput with a small architecture tradeoff that must match the trained model configuration.`
    }
  ],
  interview: {
    whatInterviewersLookFor: [
      "A precise explanation of Q, K, V and the weighted-sum data flow, not just the phrase attention finds important words.",
      "Correct reasoning about scaling by sqrt(d_k), softmax normalization, and causal masking.",
      "Ability to distinguish self-attention, cross-attention, multi-head attention, and decoder-only causal attention.",
      "Awareness of production consequences: quadratic prompt cost, KV cache behavior, grouped-query attention, and positional encodings."
    ],
    followUps: [
      {
        question: "Why do attention scores get divided by sqrt(d_k)?",
        answerMD: `Without scaling, dot products grow in magnitude as the key-query dimension grows. Large logits make softmax overly sharp, which can cause saturated probabilities and weaker gradients. Dividing by sqrt(d_k) keeps the score distribution in a stable range across head sizes.`
      },
      {
        question: "How is cross-attention different from self-attention?",
        answerMD: `In self-attention, queries, keys, and values come from the same sequence. In cross-attention, queries come from one stream, usually the decoder, while keys and values come from another stream, such as encoder outputs or multimodal features. The decoder asks what it needs, and the source sequence provides the information to attend over.`
      },
      {
        question: "Does the KV cache remove the quadratic cost of attention?",
        answerMD: `It removes repeated recomputation during token-by-token decoding, but it does not remove the quadratic comparison cost of processing a full prompt during prefill. For each new generated token, the model can reuse cached keys and values and compute attention from the new query to the existing cache. Long prompts are still expensive, and the cache itself consumes memory proportional to context length.`
      }
    ],
    alternativeDesigns: [
      {
        name: "Sparse or windowed attention",
        detailMD: `Instead of letting every token attend to every other token, sparse designs restrict attention to local windows or selected global tokens. This can reduce long-context cost, but it may miss relationships outside the allowed pattern and is harder to make universally strong.`
      },
      {
        name: "Grouped-query or multi-query attention",
        detailMD: `These variants keep many query heads but share fewer key-value heads. They are popular in serving-oriented decoder models because they reduce KV cache memory and bandwidth while preserving much of the benefit of multiple query heads.`
      }
    ],
    commonMistakes: [
      "Saying values determine relevance. Keys determine matching with queries; values provide the content that gets mixed.",
      "Forgetting that softmax is row-wise, so each query position gets its own weights that sum to one.",
      "Describing decoder-only attention without a causal mask, which would leak future tokens during training.",
      "Assuming KV caching makes long context cheap instead of understanding the difference between prefill and decoding."
    ]
  },
  interviewHints: [
    "Start with one head before mentioning multi-head attention.",
    "Use the sentence: queries ask, keys match, values carry information.",
    "Mention scaling and masking before softmax, because order matters.",
    "Close with cost: attention forms an n by n matrix, then serving uses KV cache and grouped-query attention to reduce decoding pressure."
  ],
  comparisons: [
    {
      title: "Attention variants",
      columns: ["Variant", "Who provides Q", "Who provides K and V", "Masking and use"],
      rows: [
        ["Self-attention", "The same sequence", "The same sequence", "Bidirectional in encoders or causal in decoders"],
        ["Causal self-attention", "The decoder prefix", "The decoder prefix", "Future positions are masked for generation"],
        ["Cross-attention", "The decoder or querying stream", "An encoder output or other source", "Usually reads the full source sequence"]
      ]
    },
    {
      title: "Position encoding choices",
      columns: ["Method", "How position enters", "Strength", "Tradeoff"],
      rows: [
        ["Learned absolute", "Add a learned vector for each position", "Simple and flexible within the trained range", "Extrapolates poorly beyond trained positions"],
        ["Sinusoidal absolute", "Add fixed sine and cosine vectors", "No learned table and covers arbitrary indices", "Less common in modern decoder-only LLMs"],
        ["RoPE", "Rotate query and key dimensions by position", "Makes relative distance visible in attention scores", "Long extensions need careful scaling"]
      ]
    }
  ],
  decisionGuideMD: `## How to reason about attention in interviews

Use **one-head scaled dot-product attention** when explaining the core math. Define Q, K, and V, compute query-key scores, divide by sqrt(d_k), apply masks, softmax each row, and take the weighted sum of values.

Use **causal self-attention** when the model is decoder-only and generating text. Emphasize that future tokens are masked before softmax, both in training and inference.

Use **cross-attention** when one stream needs to read another stream, such as a decoder reading encoder outputs or a text model attending to image features.

For **long-context production systems**, immediately connect attention to the n by n score matrix, KV cache memory, grouped-query attention, and retrieval or summarization as ways to avoid sending unnecessary tokens.`,
  handsOn: [
    {
      title: "Implement scaled dot-product attention",
      detailMD: `This small Python example computes one attention layer without model libraries. It shows the exact order: dot products, scaling, softmax, then weighted sum of values.`,
      code: {
        language: "python",
        label: "scaled_attention.py",
        body: `import math


def dot(left, right):
    return sum(a * b for a, b in zip(left, right))


def softmax(scores):
    row_max = max(scores)
    exps = [math.exp(score - row_max) for score in scores]
    total = sum(exps)
    return [value / total for value in exps]


def weighted_sum(weights, values):
    result = [0.0 for _ in values[0]]
    for weight, vector in zip(weights, values):
        for index, number in enumerate(vector):
            result[index] += weight * number
    return result


def scaled_dot_product_attention(queries, keys, values):
    scale = math.sqrt(len(keys[0]))
    outputs = []
    for query in queries:
        scores = [dot(query, key) / scale for key in keys]
        weights = softmax(scores)
        outputs.append(weighted_sum(weights, values))
    return outputs


queries = [[1.0, 0.0], [0.0, 1.0]]
keys = [[1.0, 0.0], [0.0, 1.0]]
values = [[10.0, 0.0], [0.0, 20.0]]
print(scaled_dot_product_attention(queries, keys, values))`
      }
    },
    {
      title: "Apply a causal mask before softmax",
      detailMD: `The causal mask changes the score matrix before normalization. Future positions become impossible choices, so their softmax weights are effectively zero.`,
      code: {
        language: "python",
        label: "causal_attention_mask.py",
        body: `import math


def apply_causal_mask(scores):
    masked = []
    for row_index, row in enumerate(scores):
        masked_row = []
        for column_index, score in enumerate(row):
            if column_index > row_index:
                masked_row.append(-math.inf)
            else:
                masked_row.append(score)
        masked.append(masked_row)
    return masked


def softmax(scores):
    row_max = max(scores)
    exps = [0.0 if score == -math.inf else math.exp(score - row_max) for score in scores]
    total = sum(exps)
    return [value / total for value in exps]


scores = [
    [1.2, 0.7, 0.4],
    [0.5, 1.1, 0.9],
    [0.3, 0.6, 1.4],
]

for row in apply_causal_mask(scores):
    print(row)
    print(softmax(row))`
      }
    }
  ],
  quiz: [
    {
      question: "In scaled dot-product attention, what do the query and key vectors primarily determine?",
      options: [
        "Which positions are relevant to each other",
        "The final vocabulary logits directly",
        "The size of the tokenizer vocabulary",
        "The number of transformer layers"
      ],
      answerIndex: 0,
      explanationMD: `Query-key dot products produce relevance scores. Values are the vectors that get mixed using the resulting attention weights.`
    },
    {
      question: "Why are attention scores divided by sqrt(d_k)?",
      options: [
        "To reduce the vocabulary size",
        "To keep dot-product magnitudes stable before softmax",
        "To make the model bidirectional",
        "To remove the need for positional information"
      ],
      answerIndex: 1,
      explanationMD: `The dot-product variance grows with the key-query dimension. Scaling by sqrt(d_k) keeps softmax from becoming too saturated as head dimension changes.`
    },
    {
      question: "What does softmax produce in an attention head?",
      options: [
        "A new tokenizer",
        "A set of nonnegative weights over source positions for each query position",
        "A replacement for the feed-forward network",
        "A cached copy of model weights"
      ],
      answerIndex: 1,
      explanationMD: `Softmax is applied row-wise to the score matrix. Each row becomes weights that sum to one and are used to combine value vectors.`
    },
    {
      question: "What is the purpose of a causal mask in a decoder-only model?",
      options: [
        "It prevents a token from attending to future tokens",
        "It prevents a token from attending to itself",
        "It forces every token to attend equally to all tokens",
        "It converts values into keys"
      ],
      answerIndex: 0,
      explanationMD: `The causal mask blocks future positions before softmax, preserving the left-to-right next-token prediction objective.`
    },
    {
      question: "What changes in cross-attention compared with self-attention?",
      options: [
        "Queries and keys must always be identical",
        "Queries come from one stream while keys and values come from another stream",
        "Softmax is no longer used",
        "The model no longer needs learned weights"
      ],
      answerIndex: 1,
      explanationMD: `Cross-attention lets a querying stream, often a decoder, attend over keys and values produced by another source such as an encoder.`
    },
    {
      question: "Why does grouped-query attention help serving efficiency?",
      options: [
        "It removes all attention computation",
        "It shares fewer key-value heads across many query heads, reducing KV cache memory",
        "It replaces the causal mask with learned positions",
        "It makes sequence length irrelevant"
      ],
      answerIndex: 1,
      explanationMD: `Grouped-query attention keeps multiple query heads but uses fewer key-value heads, which reduces cache memory and bandwidth during decoding.`
    }
  ],
  flashcards: [
    { front: "What is the role of a query vector?", back: "It represents what a token position is looking for when scoring other positions." },
    { front: "What is the role of a key vector?", back: "It represents what a token position offers for matching against queries." },
    { front: "What is the role of a value vector?", back: "It carries the information that is mixed into the output when a position receives attention weight." },
    { front: "Why scale attention scores by sqrt(d_k)?", back: "To keep dot-product magnitudes stable so softmax does not saturate as head dimension grows." },
    { front: "What does row-wise softmax do in attention?", back: "It turns each query row of scores into nonnegative weights over source positions that sum to one." },
    { front: "What is causal self-attention?", back: "Self-attention with a mask that blocks future tokens, used by decoder-only generation models." },
    { front: "Why does attention have quadratic prompt cost?", back: "A sequence of length n forms an n by n score matrix by comparing every query with every key." },
    { front: "What does RoPE change?", back: "It rotates query and key dimensions by position so relative distance affects attention scores." }
  ],
  cheatSheetMD: `## Attention mechanism cheat sheet

### Scaled dot-product attention
1. Start with hidden states, one vector per token.
2. Project each vector into Q, K, and V.
3. Compute scores with Q times K transpose.
4. Divide scores by sqrt(d_k).
5. Apply padding or causal masks before softmax.
6. Softmax each row so weights sum to one.
7. Multiply weights by V and sum to produce output vectors.

### Q, K, and V intuition
- **Query**: what this position is looking for.
- **Key**: what each source position advertises for matching.
- **Value**: what information gets copied into the output.

### Variants
- **Self-attention**: Q, K, and V come from the same sequence.
- **Causal self-attention**: self-attention with future positions masked.
- **Cross-attention**: Q comes from one stream, K and V from another stream.
- **Multi-head attention**: several attention heads run in parallel, concatenate, then project.

### Position
- Attention alone is order-agnostic.
- Learned absolute positions add a trained vector per position.
- Sinusoidal positions add fixed wave patterns.
- RoPE rotates Q and K by position, making relative distance visible to dot products.

### Cost and serving
- Prompt attention forms an n by n score matrix.
- KV cache stores previous keys and values during generation.
- Grouped-query attention reduces KV cache size by sharing key-value heads.
- Long-context systems still need retrieval, summarization, or careful context budgeting.

### Interview phrasing
Say: **queries ask, keys match, values carry information; scaling stabilizes softmax; masks enforce visibility; heads specialize; positions restore order.**`,
  references: [
    { title: "Attention Is All You Need", kind: "Paper", url: "https://arxiv.org/abs/1706.03762", author: "Vaswani et al." },
    { title: "RoFormer: Enhanced Transformer with Rotary Position Embedding", kind: "Paper", url: "https://arxiv.org/abs/2104.09864", author: "Su et al." },
    { title: "The Illustrated Transformer", kind: "Blog", url: "https://jalammar.github.io/illustrated-transformer/", author: "Jay Alammar" },
    { title: "A Mathematical Framework for Transformer Circuits", kind: "Paper", url: "https://transformer-circuits.pub/2021/framework/index.html", author: "Anthropic" }
  ],
  relatedLessons: [
    { slug: "transformer-architecture", note: "Places attention inside the full transformer block with residuals and feed-forward layers." },
    { slug: "tokenization-and-embeddings", note: "Explains the token and embedding vectors that enter attention." },
    { slug: "how-llm-inference-works", note: "Shows how attention is executed during prefill and autoregressive decoding." },
    { slug: "context-windows-and-kv-cache", note: "Goes deeper on KV cache memory, context windows, and serving tradeoffs." }
  ]
};