import type { GenAILessonContent } from "../types";

export const transformerArchitectureContent: GenAILessonContent = {
  slug: "transformer-architecture",
  introductionMD: `The transformer is the architecture behind every modern large language model, from GPT and Claude to Gemini and Llama. If you understand one transformer block, you understand the whole model, because a large language model is mostly the same block stacked dozens of times with a token embedding at the bottom and a prediction head on top.

In interviews, transformer architecture is the most common opening question in the AI foundations round because it reveals whether a candidate actually understands what an LLM is doing or has only used the API. A strong answer explains the data flow through one block, why residual connections and normalization matter, and how stacking blocks turns token embeddings into a next-token distribution.

This lesson walks the full path: how a sequence of token ids becomes vectors, how self-attention lets each token gather information from other tokens, how the feed-forward network transforms each position, and how the final layer produces logits over the vocabulary. The goal is a mental model precise enough to reason about cost, context length, and quality tradeoffs later in the roadmap.`,
  realWorldMD: `The transformer block shows up in essentially every production AI system you will design.

- Decoder-only transformers power chat assistants, coding copilots, and answer engines.
- Encoder transformers produce the embeddings that feed vector databases and retrieval.
- The number of layers and the hidden size drive GPU memory, latency, and serving cost.
- Context length, a direct property of the attention mechanism, decides how much retrieved data or conversation history a system can use.
- Understanding residual streams and attention is the basis for interpretability, fine-tuning, and safety work.`,
  learningObjectives: [
    "Trace the full data flow through a decoder-only transformer from token ids to output logits.",
    "Explain the role of token embeddings, positional information, self-attention, and the feed-forward network in one block.",
    "Describe why residual connections and layer normalization make deep transformers trainable.",
    "Explain how stacking many identical blocks builds representational depth without changing the interface.",
    "Connect architectural choices such as layer count, hidden size, and head count to memory, latency, and cost.",
    "Distinguish encoder-only, decoder-only, and encoder-decoder transformers and where each is used."
  ],
  theory: [
    {
      label: "A language model is one block repeated many times",
      detailMD: `A decoder-only transformer has three conceptual parts. First, an embedding layer maps each token id to a vector and adds positional information. Second, a stack of identical transformer blocks refines those vectors. Third, a language modeling head projects the final vectors back to a probability distribution over the vocabulary.

The important insight for interviews is uniformity. Every block has the same shape and the same interface: it takes a sequence of hidden vectors and returns a sequence of hidden vectors of the same size. This is why the architecture scales so cleanly. Making a model bigger usually means more blocks, wider hidden vectors, or more attention heads, not a new design.`
    },
    {
      label: "Self-attention moves information between positions",
      detailMD: `Inside a block, self-attention is the only component that lets tokens exchange information. Each token produces a query, a key, and a value vector. The attention score between two tokens is the dot product of one token query and another token key, scaled and passed through softmax. Each token then builds a weighted sum of value vectors using those scores.

This is how a pronoun can attend to the noun it refers to, or how a closing bracket can attend to its opening bracket. In a decoder-only model, a causal mask prevents a token from attending to future positions, which is what makes next-token prediction well defined. The attention mechanism lesson goes deeper on the math.`
    },
    {
      label: "The feed-forward network transforms each position independently",
      detailMD: `After attention mixes information across positions, the feed-forward network, sometimes called the MLP, transforms each position on its own. It is usually two linear layers with a nonlinearity such as GELU in between, and it expands the hidden size by a factor of about four before projecting back.

A useful intuition is division of labor. Attention decides which other tokens matter, and the feed-forward network decides what to compute given the gathered context. A large fraction of a model parameters live in these feed-forward layers, which is why they dominate compute during the position-wise transformation.`
    },
    {
      label: "Residual connections and normalization keep deep models trainable",
      detailMD: `Each sub-layer is wrapped in a residual connection: the output is the input plus the sub-layer result. This creates a residual stream that runs from the embedding all the way to the final layer, and it lets gradients flow through dozens of blocks without vanishing.

Layer normalization stabilizes the scale of activations so training stays numerically healthy. Modern models usually apply normalization before each sub-layer, a pattern called pre-norm, which trains more reliably at depth. The residual stream view is central to interpretability: each block reads from and writes to this shared stream rather than replacing it.`
    },
    {
      label: "Depth and width create capability",
      detailMD: `Stacking blocks gives the model depth. Early layers tend to capture local and syntactic structure, while later layers capture more abstract and semantic relationships. Width, meaning the hidden size and the number of attention heads, controls how much information each position can hold and how many distinct relationships attention can track at once.

For interviews, remember the levers. Parameter count grows with both depth and width. Attention cost grows with sequence length squared. Feed-forward cost grows with hidden size. These relationships explain why long context and large models are expensive, a theme that returns in the inference and context window lessons.`
    }
  ],
  architecture: {
    width: 960,
    height: 520,
    nodes: [
      { id: "tokens", label: "Input Token IDs", kind: "client", x: 40, y: 240, sublabel: "sequence of ids" },
      { id: "embed", label: "Embedding + Position", kind: "service", x: 170, y: 240, sublabel: "ids to vectors" },
      { id: "attn", label: "Multi-Head Attention", kind: "service", x: 340, y: 130, sublabel: "query, key, value" },
      { id: "addnorm1", label: "Add and Norm", kind: "worker", x: 340, y: 350, sublabel: "residual + LayerNorm" },
      { id: "ffn", label: "Feed-Forward Network", kind: "service", x: 540, y: 130, sublabel: "MLP with GELU" },
      { id: "addnorm2", label: "Add and Norm", kind: "worker", x: 540, y: 350, sublabel: "residual + LayerNorm" },
      { id: "layers", label: "N Stacked Blocks", kind: "external", x: 720, y: 240, sublabel: "repeat 32 to 96x" },
      { id: "lmhead", label: "LM Head + Softmax", kind: "analytics", x: 870, y: 240, sublabel: "logits over vocab" }
    ],
    edges: [
      { from: "tokens", to: "embed", label: "lookup" },
      { from: "embed", to: "attn", label: "hidden states" },
      { from: "attn", to: "addnorm1", label: "attention out" },
      { from: "addnorm1", to: "ffn", label: "normalized" },
      { from: "ffn", to: "addnorm2", label: "ffn out" },
      { from: "addnorm2", to: "layers", label: "block output" },
      { from: "layers", to: "lmhead", label: "final hidden" },
      { from: "embed", to: "addnorm1", label: "residual", dashed: true },
      { from: "addnorm1", to: "addnorm2", label: "residual", dashed: true }
    ],
    captionMD: `A single decoder-only transformer block: attention mixes information across positions, the feed-forward network transforms each position, and residual connections plus normalization wrap both sub-layers. The block is repeated many times before the language modeling head produces logits.`
  },
  architectureNotesMD: `The diagram shows the logical flow of one block, not the physical GPU layout. In practice the embedding, all blocks, and the head live on one or more GPUs, and the same block weights are applied at every layer position with independent parameters per layer.

The residual edges are drawn dashed because they carry the unchanged input forward and add it to each sub-layer output. This shared residual stream is why information from the embedding can reach the final layer directly, and why the model can learn to make small, additive edits at each block rather than rebuilding the representation from scratch.

The N stacked blocks node stands for the full depth of the model. A small model might have a dozen blocks, while a frontier model can have many dozens. Every block has the same interface, so the model can be scaled by changing depth and width without redesigning the flow.`,
  requestFlow: [
    {
      step: "1. Tokenize and look up embeddings",
      detailMD: `The input text is already converted to token ids by the tokenizer. The embedding layer maps each id to a learned vector by indexing a large embedding matrix. The result is a sequence of hidden vectors, one per token.`
    },
    {
      step: "2. Add positional information",
      detailMD: `Attention alone is order agnostic, so the model injects position. Older models add sinusoidal or learned positional vectors, while most modern models use rotary position embeddings applied inside attention. Either way, the model now knows both what each token is and where it sits.`
    },
    {
      step: "3. Compute self-attention with a causal mask",
      detailMD: `Each token forms query, key, and value vectors. Attention scores are query-key dot products, scaled and softmaxed. A causal mask sets scores for future tokens to negative infinity so each position only attends to itself and earlier positions. Each token output is a weighted sum of value vectors.`
    },
    {
      step: "4. Apply the first residual and normalization",
      detailMD: `The attention output is added back to the block input through a residual connection, and normalization keeps activations well scaled. In a pre-norm model, normalization is applied before the sub-layer, which is the common modern arrangement.`
    },
    {
      step: "5. Run the feed-forward network",
      detailMD: `Each position independently passes through two linear layers with a nonlinearity between them. This is where much of the model per-token computation and many of its parameters live. It transforms the attention-enriched representation into the block output.`
    },
    {
      step: "6. Apply the second residual and normalization",
      detailMD: `The feed-forward output is added back through a second residual connection and normalized. The block now returns a sequence of hidden vectors with the same shape it received, ready for the next block.`
    },
    {
      step: "7. Repeat through all blocks",
      detailMD: `Steps three through six repeat for every block in the stack. Each block reads the residual stream, adds its contribution, and passes it on. Representations become progressively more abstract with depth.`
    },
    {
      step: "8. Project to vocabulary logits",
      detailMD: `The final hidden vector for the last position passes through the language modeling head, a linear projection to vocabulary size, producing a logit for every possible next token. Softmax turns logits into probabilities, and the sampling lesson covers how a concrete token is then chosen.`
    }
  ],
  deepDives: [
    {
      label: "Why attention cost grows with the square of sequence length",
      detailMD: `Self-attention compares every token to every other token, so for a sequence of length n the attention matrix has n times n entries. Doubling the context roughly quadruples attention compute and the memory for attention scores. This quadratic term is the reason long context is expensive and the reason a whole research area exists around efficient and approximate attention.

For interviews, tie this to product limits. A 128K context request does far more attention work than a 4K request, which affects both latency and price. The context window lesson expands on how the key-value cache changes this picture during generation.`
    },
    {
      label: "Multi-head attention and why more heads help",
      detailMD: `Instead of one attention computation, the model splits the hidden vector into several heads, each with its own smaller query, key, and value projections. Each head can specialize, for example one head tracking subject-verb agreement while another tracks bracket matching. The head outputs are concatenated and projected back to the hidden size.

The practical tradeoff is that more heads give more distinct relationship channels but each head has a smaller dimension. Head count and head dimension are tuned together, and modern serving optimizations such as grouped-query attention reduce the key-value memory by sharing keys and values across heads.`
    },
    {
      label: "Parameter budget: where the weights actually live",
      detailMD: `The largest parameter groups are the token embedding matrix, the attention projection matrices, and the feed-forward layers. Feed-forward layers usually dominate because they expand the hidden size by roughly four times and then project back, at every layer. The embedding and output projection can share weights in some models to save parameters.

Knowing this helps you reason about scaling. Widening the hidden size grows feed-forward and attention weights, while adding layers multiplies the whole block. Both increase quality and cost, which is exactly the tradeoff the model selection lesson formalizes.`
    },
    {
      label: "Encoder, decoder, and encoder-decoder variants",
      detailMD: `Encoder-only transformers such as BERT read the whole sequence bidirectionally and are ideal for producing embeddings and classifications. Decoder-only transformers such as GPT use causal masking and are ideal for generation. Encoder-decoder transformers such as the original translation model use an encoder to read the input and a decoder to generate the output.

Most chat and coding models today are decoder-only because a single causal stack is simpler to scale and serve, and it handles both understanding and generation. Embedding models used for retrieval are usually encoder-style, which is why the tokenization and embeddings lesson connects here.`
    }
  ],
  productionConsiderations: [
    {
      label: "Memory and layout on the GPU",
      detailMD: `Serving a transformer means holding the weights and the activations in GPU memory. Weights are fixed, but activations and the key-value cache grow with batch size and sequence length. Large models are sharded across GPUs using tensor and pipeline parallelism, and the block uniformity makes this sharding regular and predictable.`
    },
    {
      label: "Numerical precision",
      detailMD: `Production inference commonly uses lower precision such as FP16, BF16, or INT8 quantization to fit larger models and run faster. Normalization layers and attention softmax need care to stay numerically stable in low precision. Precision choices trade a small amount of quality for large gains in memory and throughput.`
    },
    {
      label: "Architecture versioning and reproducibility",
      detailMD: `The exact architecture, including layer count, head count, normalization placement, and position encoding, must be recorded with each model version. Mismatched architecture assumptions cause silent quality regressions, so serving stacks pin model configuration alongside weights.`
    }
  ],
  interview: {
    whatInterviewersLookFor: [
      "A clear end-to-end trace from token ids to output logits without hand waving.",
      "Correct understanding that attention mixes information across positions and the feed-forward network transforms each position.",
      "Awareness of residual connections and normalization as the reason deep transformers train.",
      "Ability to connect architecture to cost, especially the quadratic attention term and where parameters live."
    ],
    followUps: [
      {
        question: "Why do transformers need positional information when recurrent networks do not?",
        answerMD: `Attention treats the input as a set and computes the same scores regardless of order, so without positional information the model cannot tell a sentence from its shuffled version. Recurrent networks process tokens in sequence, so order is implicit. Transformers add positional encodings or rotary embeddings to restore order while keeping the parallelism that makes them fast to train.`
      },
      {
        question: "What makes the causal mask necessary in a decoder-only model?",
        answerMD: `Next-token prediction must not let a position peek at future tokens, otherwise training would leak the answer. The causal mask sets attention scores to future positions to negative infinity before softmax, so each token only attends to itself and earlier tokens. This makes the training objective well defined and matches how generation works one token at a time.`
      },
      {
        question: "How would you reduce the cost of very long context?",
        answerMD: `Options include sparse or windowed attention that limits how many tokens each position attends to, grouped-query attention to shrink the key-value cache, retrieval so the model reads a short relevant slice instead of everything, and caching of the prompt prefix. Each trades some quality or generality for lower compute and memory, and the right choice depends on the workload.`
      }
    ],
    alternativeDesigns: [
      {
        name: "State-space and recurrent alternatives",
        detailMD: `Architectures such as state-space models aim for linear scaling with sequence length instead of quadratic. They can be attractive for very long sequences, but transformers remain dominant for general language tasks due to quality and tooling maturity.`
      },
      {
        name: "Mixture-of-experts feed-forward",
        detailMD: `Instead of one dense feed-forward network per block, a mixture-of-experts routes each token to a few expert networks. This increases total parameters and capability while keeping per-token compute lower, at the cost of routing complexity and serving challenges.`
      }
    ],
    commonMistakes: [
      "Claiming attention understands meaning by itself, when it only computes weighted sums that the feed-forward network then transforms.",
      "Forgetting the causal mask and describing a decoder that can see future tokens.",
      "Ignoring residual connections and normalization, which are the reason deep models train at all.",
      "Assuming making a model bigger means a new architecture rather than more depth and width."
    ]
  },
  interviewHints: [
    "Start by naming the three parts: embedding, stacked blocks, and the output head.",
    "Explain one block fully before talking about depth.",
    "Separate the two jobs clearly: attention mixes across positions, the feed-forward transforms each position.",
    "Bring in cost at the end: quadratic attention and feed-forward-heavy parameter counts."
  ],
  comparisons: [
    {
      title: "Transformer family variants",
      columns: ["Variant", "Masking", "Best for", "Example"],
      rows: [
        ["Encoder-only", "Bidirectional, no causal mask", "Embeddings and classification", "BERT"],
        ["Decoder-only", "Causal mask", "Text generation and chat", "GPT, Claude, Llama"],
        ["Encoder-decoder", "Encoder bidirectional, decoder causal", "Translation and summarization", "T5"]
      ]
    },
    {
      title: "What each sub-layer does",
      columns: ["Sub-layer", "Operates across", "Main job", "Cost driver"],
      rows: [
        ["Self-attention", "All positions", "Gather relevant context", "Sequence length squared"],
        ["Feed-forward", "Each position alone", "Transform the representation", "Hidden size"],
        ["Add and Norm", "Each position", "Stabilize and preserve the residual stream", "Small"]
      ]
    }
  ],
  decisionGuideMD: `## How to reason about transformer size

Use a **small model with fewer blocks** when latency and cost dominate and the task is narrow. It will be cheaper and faster but less capable on complex reasoning.

Use a **larger model with more blocks and wider hidden size** when quality on hard, open-ended tasks matters more than cost. Expect higher latency and memory.

For **long context needs**, remember attention scales with the square of length. Prefer retrieval to feed a short relevant slice, or choose a model with efficient attention, before paying for a giant raw context window.

For **embeddings and retrieval**, reach for an encoder-style model rather than a large decoder, since you only need a good vector, not generation.`,
  handsOn: [
    {
      title: "Estimate parameters from architecture dimensions",
      detailMD: `A rough parameter estimate helps you reason about memory before you ever load a model. This estimator counts the dominant feed-forward and attention projection weights across all layers.`,
      code: {
        language: "python",
        label: "param_estimate.py",
        body: `def estimate_params(hidden, layers, ffn_multiplier=4, vocab=50000):
    attn_per_layer = 4 * hidden * hidden
    ffn_per_layer = 2 * hidden * (ffn_multiplier * hidden)
    per_layer = attn_per_layer + ffn_per_layer
    blocks = per_layer * layers
    embedding = vocab * hidden
    total = blocks + embedding
    return {
        "per_layer_millions": round(per_layer / 1e6, 1),
        "blocks_billions": round(blocks / 1e9, 2),
        "total_billions": round(total / 1e9, 2),
    }

print(estimate_params(hidden=4096, layers=32))
print(estimate_params(hidden=8192, layers=80))`
      }
    },
    {
      title: "Apply a causal mask to attention scores",
      detailMD: `The causal mask is a lower-triangular allow pattern. This snippet shows how future positions are set to a very negative value before softmax so they receive near-zero weight.`,
      code: {
        language: "python",
        label: "causal_mask.py",
        body: `import math

def masked_scores(scores):
    n = len(scores)
    for i in range(n):
        for j in range(n):
            if j > i:
                scores[i][j] = -math.inf
    return scores

example = [[0.2, 0.9, 0.1], [0.5, 0.3, 0.4], [0.1, 0.2, 0.7]]
for row in masked_scores(example):
    print(row)`
      }
    }
  ],
  quiz: [
    {
      question: "What is the interface of a single transformer block?",
      options: [
        "It takes token ids and returns token ids",
        "It takes a sequence of hidden vectors and returns a sequence of hidden vectors of the same shape",
        "It takes an image and returns a caption",
        "It takes logits and returns embeddings"
      ],
      answerIndex: 1,
      explanationMD: `Every block preserves the shape of the hidden state sequence, which is exactly why blocks can be stacked uniformly to any depth.`
    },
    {
      question: "Which component allows tokens to exchange information with each other?",
      options: [
        "The feed-forward network",
        "Layer normalization",
        "Self-attention",
        "The embedding matrix"
      ],
      answerIndex: 2,
      explanationMD: `Self-attention is the only sub-layer that mixes information across positions. The feed-forward network operates on each position independently.`
    },
    {
      question: "Why does attention compute scale with the square of sequence length?",
      options: [
        "Because every token is compared to every other token",
        "Because embeddings double in size with length",
        "Because the feed-forward network runs twice per token",
        "Because normalization is applied per pair of tokens"
      ],
      answerIndex: 0,
      explanationMD: `The attention matrix has one entry per pair of positions, so its size and compute grow with n times n.`
    },
    {
      question: "What is the purpose of residual connections in a transformer?",
      options: [
        "They compress the vocabulary",
        "They add each sub-layer input back to its output so gradients and information flow through depth",
        "They replace attention at inference time",
        "They convert logits to probabilities"
      ],
      answerIndex: 1,
      explanationMD: `Residual connections create a shared stream from embedding to output, which keeps deep networks trainable and lets blocks make additive edits.`
    },
    {
      question: "Which transformer variant is the usual choice for text generation and chat?",
      options: [
        "Encoder-only",
        "Decoder-only",
        "Encoder-decoder only",
        "A convolutional network"
      ],
      answerIndex: 1,
      explanationMD: `Decoder-only transformers use causal masking and scale cleanly for generation, which is why most chat and coding models are decoder-only.`
    },
    {
      question: "Where do most of a transformer parameters usually live?",
      options: [
        "In the softmax function",
        "In the positional encodings",
        "In the feed-forward layers",
        "In the causal mask"
      ],
      answerIndex: 2,
      explanationMD: `The feed-forward layers expand the hidden size and project back at every layer, so they hold a large share of the weights.`
    }
  ],
  flashcards: [
    { front: "What are the three parts of a decoder-only LLM?", back: "An embedding layer, a stack of identical transformer blocks, and a language modeling head." },
    { front: "What does self-attention do?", back: "It lets each token gather information from other tokens using query-key-value weighted sums." },
    { front: "What does the feed-forward network do?", back: "It transforms each position independently, and it holds much of the model compute and parameters." },
    { front: "Why are residual connections important?", back: "They add each sub-layer input to its output, keeping deep transformers trainable and preserving a shared residual stream." },
    { front: "What is the causal mask?", back: "A rule that blocks attention to future tokens so next-token prediction is well defined." },
    { front: "Why is long context expensive?", back: "Attention compares every pair of tokens, so cost grows with the square of sequence length." },
    { front: "What is multi-head attention?", back: "Splitting attention into several smaller heads that each learn different relationships, then concatenating them." },
    { front: "Which variant produces embeddings for retrieval?", back: "Encoder-only transformers, which read the whole sequence bidirectionally." }
  ],
  cheatSheetMD: `## Transformer architecture cheat sheet

### The stack, top to bottom
1. Token ids in.
2. Embedding lookup plus positional information.
3. N identical blocks, each with attention then feed-forward, both wrapped in residual and normalization.
4. LM head projects the final hidden state to vocabulary logits.
5. Softmax and sampling pick the next token.

### One block
- Self-attention: mixes information across positions using query, key, value.
- Add and Norm: residual connection plus normalization.
- Feed-forward: transforms each position, expands by about four times then projects back.
- Add and Norm again.

### Key facts
- Attention cost grows with sequence length squared.
- Feed-forward layers hold most parameters.
- Residual stream runs from embedding to output.
- Causal mask enforces left-to-right prediction in decoder-only models.

### Cost levers
- More blocks: more depth, more capability, more latency.
- Wider hidden size: more capacity, larger feed-forward and attention weights.
- More heads: more relationship channels, smaller per-head dimension.
- Longer context: quadratic attention growth.

### Variants
- Encoder-only: embeddings and classification.
- Decoder-only: generation and chat.
- Encoder-decoder: translation and summarization.`,
  references: [
    { title: "Attention Is All You Need", kind: "Paper", url: "https://arxiv.org/abs/1706.03762", author: "Vaswani et al." },
    { title: "The Illustrated Transformer", kind: "Blog", url: "https://jalammar.github.io/illustrated-transformer/", author: "Jay Alammar" },
    { title: "Language Models are Few-Shot Learners", kind: "Paper", url: "https://arxiv.org/abs/2005.14165", author: "Brown et al." },
    { title: "A Mathematical Framework for Transformer Circuits", kind: "Paper", url: "https://transformer-circuits.pub/2021/framework/index.html", author: "Anthropic" }
  ],
  relatedLessons: [
    { slug: "attention-mechanism", note: "Goes deep on the query, key, value math that this lesson summarizes." },
    { slug: "tokenization-and-embeddings", note: "Explains how text becomes the token ids and vectors that enter the stack." },
    { slug: "how-llm-inference-works", note: "Shows what running this architecture looks like at generation time." },
    { slug: "context-windows-and-kv-cache", note: "Expands on the quadratic attention cost and how the KV cache changes it." }
  ]
};
