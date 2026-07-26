import type { GenAILessonContent } from "../types";

export const contextWindowsAndKvCacheContent: GenAILessonContent = {
  slug: "context-windows-and-kv-cache",
  introductionMD: `A context window is the maximum number of tokens a model can attend to in one request, counting both the input prompt and the tokens the model will generate. If a model has a 32K context window and you reserve 2K tokens for the answer, the prompt must fit in roughly 30K tokens after tokenization.

This topic is advanced because context length is both a product feature and an infrastructure constraint. A larger window can let an assistant read more conversation history, source code, documents, or retrieved passages, but it also increases latency, GPU memory pressure, and the chance that irrelevant text distracts the model.

The key serving mechanism is the **KV cache**. During generation, each attention layer stores the key and value vectors for past tokens so the model does not recompute them every time it predicts the next token. This turns repeated attention over old tokens into cache reads, but the cache itself grows with sequence length and can dominate GPU memory at long context.

In interviews, strong candidates connect the user-facing limit, the transformer attention math, and the serving system. They can explain why prefill is expensive, why decode uses a growing cache, why grouped-query attention and PagedAttention matter, and why retrieval or summarization often beats simply buying a larger context window.`,
  realWorldMD: `Context windows and KV caches show up in almost every production LLM system.

- Chat applications must decide how much conversation history to keep and how much answer space to reserve.
- RAG systems must pack retrieved chunks into the prompt without crowding out the user task.
- Coding assistants need enough context for files, diffs, logs, and instructions, but not so much that irrelevant code distracts the model.
- Model serving platforms size GPU memory around weights, activations, batching, and the per-request KV cache.
- Long-document summarization and agent memory systems must choose between raw context, retrieval, and compression.
- API pricing and latency often rise with input tokens, output tokens, and the maximum context tier selected.`,
  learningObjectives: [
    "Define a context window as the combined prompt plus output token budget the model can attend to.",
    "Trace how prefill and decode use attention differently during inference.",
    "Explain what the KV cache stores and why it grows linearly with sequence length, layers, heads, head dimension, batch size, and precision.",
    "Reason about why long context is expensive: quadratic prefill attention plus linear but large KV cache memory.",
    "Compare grouped-query attention, multi-query attention, PagedAttention, sliding-window attention, streaming attention, and prompt caching.",
    "Choose between larger context, retrieval, summarization, and compression for practical system design."
  ],
  theory: [
    {
      label: "The context window is a shared token budget",
      detailMD: `The context window is not just the input length. It is the total number of tokens the model can condition on during a request, including system instructions, developer messages, user text, retrieved documents, tool outputs, conversation history, and generated output. If the prompt consumes the whole window, the model has no room to answer.

Typical production windows vary widely. Older and smaller models often support 4K to 8K tokens, many current general models support 16K, 32K, or 128K tokens, and specialized long-context models can reach hundreds of thousands of tokens or more. Sizes vary because model architecture, positional encoding, training data mixture, serving hardware, and product latency targets all constrain what is practical.`
    },
    {
      label: "Inference has a prefill phase and a decode phase",
      detailMD: `In **prefill**, the model processes the entire prompt and computes hidden states plus keys and values for all prompt tokens. Attention over the prompt compares many token pairs, so the attention work grows roughly with sequence length squared. Prefill is highly parallel but expensive for very long prompts.

In **decode**, the model generates one new token at a time. Each new token creates a query and attends to keys and values from earlier tokens. Without a cache, the model would repeatedly recompute past keys and values at every step. With a KV cache, decode reads the stored past and appends the new token key and value at each layer.`
    },
    {
      label: "The KV cache trades repeated compute for memory",
      detailMD: `For each generated or prompt token, each attention layer stores two tensors: the **key** and the **value**. The rough memory intuition is 2 * layers * heads * head_dim * seq_len * batch * bytes_per_value. The leading 2 is for keys plus values. The layer count multiplies the cache because every layer has its own attention state. The sequence length and batch size multiply it because every active request needs entries for every token still in context.

In this formula, **heads** means the number of key-value heads held in the cache. Dense multi-head attention stores one key-value head per query head. Grouped-query attention stores fewer key-value heads shared across groups of query heads, and multi-query attention goes further by sharing one key-value head across many query heads.`
    },
    {
      label: "Long context is expensive in two different ways",
      detailMD: `Long prompts make prefill expensive because attention builds relationships across many prompt positions. Doubling prompt length can roughly quadruple the attention score work during full prompt processing. Optimized kernels reduce constants, but the underlying all-pairs pressure remains a core reason long context is slower and more costly.

Long active sequences also make decode memory expensive. The KV cache grows linearly with the number of tokens kept alive, and for large models the cache can consume more GPU memory than many engineers expect. This reduces batch size, lowers throughput, and can force requests onto larger or more GPUs.`
    },
    {
      label: "More context is not always better context",
      detailMD: `Long context increases what the model can see, but it also increases distraction. The **lost-in-the-middle** effect describes models retrieving information more reliably from the beginning or end of a long prompt than from the middle. Even when the target facts are present, the model may underuse them if they are buried among less relevant tokens.

Teams also observe **context rot**, where accumulated history, stale decisions, repeated tool logs, and loosely related documents make the prompt less focused over time. A smaller, cleaner prompt with targeted retrieval can outperform a massive prompt full of weakly relevant material.`
    }
  ],
  architecture: {
    width: 1000,
    height: 560,
    nodes: [
      { id: "tokenStream", label: "Token Stream", kind: "client", x: 50, y: 260, sublabel: "prompt plus generated tokens" },
      { id: "scheduler", label: "Batch Scheduler", kind: "service", x: 240, y: 110, sublabel: "prefill and decode batches" },
      { id: "attentionLayer", label: "Attention Layer", kind: "service", x: 250, y: 300, sublabel: "read past, write current" },
      { id: "gqaSharing", label: "GQA/MQA Sharing", kind: "worker", x: 470, y: 150, sublabel: "many query heads share KV" },
      { id: "kvCache", label: "KV Cache Store", kind: "cache", x: 500, y: 340, sublabel: "grows one token per step" },
      { id: "pageManager", label: "PagedAttention Manager", kind: "worker", x: 710, y: 340, sublabel: "maps tokens to pages" },
      { id: "gpuMemory", label: "GPU Memory", kind: "storage", x: 910, y: 340, sublabel: "paged KV blocks" },
      { id: "memoryMetrics", label: "Memory Metrics", kind: "monitoring", x: 850, y: 120, sublabel: "utilization and pressure" }
    ],
    edges: [
      { from: "tokenStream", to: "scheduler", label: "prompt budget" },
      { from: "scheduler", to: "attentionLayer", label: "run prefill or decode" },
      { from: "tokenStream", to: "attentionLayer", label: "next token" },
      { from: "attentionLayer", to: "gqaSharing", label: "query heads" },
      { from: "gqaSharing", to: "kvCache", label: "shared K/V heads" },
      { from: "kvCache", to: "attentionLayer", label: "read past K/V" },
      { from: "attentionLayer", to: "kvCache", label: "append current K/V" },
      { from: "kvCache", to: "pageManager", label: "logical cache blocks" },
      { from: "pageManager", to: "gpuMemory", label: "physical pages" },
      { from: "gpuMemory", to: "kvCache", label: "resident pages", dashed: true },
      { from: "pageManager", to: "memoryMetrics", label: "fragmentation and usage" },
      { from: "memoryMetrics", to: "scheduler", label: "admission signals", dashed: true }
    ],
    captionMD: `During decode, each attention layer reads past keys and values from the KV cache and appends the key and value for the current token. Grouped-query or multi-query attention reduces how many key-value heads are stored, while a PagedAttention-style manager maps logical cache blocks onto GPU memory pages to reduce fragmentation.`
  },
  architectureNotesMD: `The diagram separates the logical attention operation from the physical memory layout. The attention layer conceptually needs all relevant previous keys and values, but the serving system may store them in non-contiguous blocks and use an indirection table so requests can grow, finish, and be batched without moving large tensors.

The GQA/MQA sharing node shows an important modern optimization. The model can keep many query heads for expressiveness while storing fewer key-value heads in the cache. This reduces memory bandwidth and cache footprint during decode, often with much less quality loss than simply shrinking the whole model.

The monitoring feedback loop matters in production. Cache pressure changes how many requests can be batched, whether a long-context request should be admitted, and whether the system needs to evict, spill, or reject work. Long context is therefore a scheduler and capacity-planning problem, not just a model configuration flag.`,
  requestFlow: [
    {
      step: "1. Count the requested tokens",
      detailMD: `The serving layer tokenizes the system prompt, user prompt, conversation history, retrieved passages, tool outputs, and requested maximum output. The combined total must fit within the model context window. If the prompt is too large, the system must trim, summarize, retrieve fewer chunks, or reject the request.`
    },
    {
      step: "2. Reserve output space",
      detailMD: `A reliable application reserves tokens for the answer before packing the prompt. For a 32K window, a team might reserve 2K to 4K output tokens and treat the remaining budget as the maximum prompt size. This avoids the common failure mode where a huge prompt leaves the model too little room to respond.`
    },
    {
      step: "3. Run prefill over the prompt",
      detailMD: `The model processes the full prompt in parallel. Each layer computes attention over prompt positions, applies the feed-forward network, and creates initial key and value tensors for every prompt token. This phase is where very long context pays the quadratic attention cost.`
    },
    {
      step: "4. Allocate KV cache blocks",
      detailMD: `The runtime stores the prompt keys and values in GPU memory. A page-based manager can allocate fixed-size blocks instead of one large contiguous tensor, which helps many requests with different lengths share the GPU without severe fragmentation.`
    },
    {
      step: "5. Decode the first output token",
      detailMD: `For the next token, the model computes a query for the current position and reads cached keys and values from all previous positions that remain in context. It then samples or selects the next token and appends that token key and value to the cache.`
    },
    {
      step: "6. Repeat decode while the cache grows",
      detailMD: `Each generated token increases sequence length by one. The per-step compute reads a longer cache, and the cache memory grows linearly until the model stops, reaches the output limit, or hits the context limit. Batching improves throughput but multiplies active cache memory.`
    },
    {
      step: "7. Reuse shared prefixes when possible",
      detailMD: `If many requests share the same system prompt, policy text, or document prefix, a prompt or prefix cache can reuse the precomputed KV entries for that prefix. This saves prefill time and memory bandwidth, especially for workloads with stable instructions and many similar user questions.`
    },
    {
      step: "8. Free or recycle cache pages",
      detailMD: `When a request finishes, the runtime releases its cache blocks for other requests. Production systems track cache utilization, fragmentation, batch size, and latency because these metrics directly determine whether long-context serving is profitable and reliable.`
    }
  ],
  deepDives: [
    {
      label: "Prefill is parallel but still quadratic",
      detailMD: `Prefill can use large matrix operations across the whole prompt, so GPUs handle it efficiently compared with one-token-at-a-time decode. However, full attention still needs to form relationships between prompt positions. For a prompt of length n, the attention score pattern is roughly n by n per layer and head.

This is why long-document requests can have high time-to-first-token. The model must read and process the whole prompt before producing the first output token. Faster kernels, tensor parallelism, and batching help, but they do not make a 128K prompt behave like an 8K prompt.`
    },
    {
      label: "KV cache memory formula intuition",
      detailMD: `The cache stores keys and values, so start with 2. Multiply by layers because every transformer layer has its own attention state. Multiply by heads and head_dim because each key or value vector has per-head dimensions. Multiply by seq_len and batch because every active token in every active request needs storage. Multiply by bytes_per_value because BF16 or FP16 usually costs 2 bytes, while lower-precision cache formats cost less.

The important interview move is to say that cache memory grows linearly with context length, but the constant can be huge. A model with many layers and many key-value heads can burn gigabytes of GPU memory per long-context batch, even before considering model weights.`
    },
    {
      label: "Grouped-query and multi-query attention shrink the cache",
      detailMD: `Classic multi-head attention gives every query head its own key head and value head. Grouped-query attention keeps many query heads but shares a smaller number of key-value heads across groups. Multi-query attention is the extreme version where many query heads share one key head and one value head.

This directly reduces the heads term in the KV cache formula. If a model has 32 query heads but only 8 key-value heads, the cache can be about one quarter of the dense key-value size. The tradeoff is that sharing can reduce attention expressiveness, so model designers tune the grouping based on quality and serving efficiency.`
    },
    {
      label: "PagedAttention solves memory management, not attention math",
      detailMD: `Long and variable-length requests create GPU memory fragmentation if each request needs a large contiguous cache allocation. PagedAttention treats the KV cache more like virtual memory: each request has logical token blocks mapped to physical GPU pages. Finished requests release pages, and growing requests receive new pages.

This improves utilization and makes high-throughput serving practical for mixed prompt lengths. It does not remove the need to store keys and values, and it does not make prefill attention quadratic cost disappear. It is a memory-management optimization that lets the GPU hold more useful active work.`
    },
    {
      label: "Sliding-window, streaming attention, and prefix caching",
      detailMD: `Sliding-window attention limits each token to a recent window of tokens instead of the entire history. Streaming attention variants keep a bounded state or selected memory so very long streams can be processed without retaining all past tokens. These approaches reduce memory and compute but may lose information outside the retained window.

Prompt or prefix caching attacks a different problem. If requests share a prefix, such as a long system prompt or a common document, the runtime can reuse the prefix KV cache instead of recomputing it. This is most valuable when many requests share stable instructions and differ only in the final user question.`
    },
    {
      label: "Lost-in-the-middle and context rot",
      detailMD: `A larger context window does not guarantee better reasoning over all included tokens. Models often pay more attention to the beginning and end of a prompt than to facts buried in the middle, especially when the prompt contains many similar passages. Positioning, chunk ordering, and concise citations can matter as much as raw token budget.

Context rot is the operational version of the same problem. Long-running agents accumulate old decisions, repeated logs, obsolete plans, and irrelevant documents. The prompt becomes technically complete but semantically noisy. Good systems periodically summarize, retrieve only what is needed, and discard stale state.`
    }
  ],
  productionConsiderations: [
    {
      label: "Capacity planning around cache, not only weights",
      detailMD: `Engineers often estimate GPU needs from model parameter size, then discover that long-context KV cache memory is the real limiter. Capacity plans should model maximum sequence length, average sequence length, batch size, number of layers, key-value heads, head dimension, and cache precision. Admission control should protect the system from a few huge requests starving many normal ones.`
    },
    {
      label: "Latency and cost controls",
      detailMD: `Production APIs should expose or enforce maximum input tokens, maximum output tokens, retrieval chunk limits, and per-tenant budgets. Track time-to-first-token separately from tokens-per-second because prefill and decode bottleneck differently. Long prompts usually hurt time-to-first-token, while long outputs keep decode slots and cache memory occupied.`
    },
    {
      label: "Prompt packing and retrieval hygiene",
      detailMD: `Use retrieval to keep context small and relevant. Rank, deduplicate, compress, and cite chunks before insertion. Put critical instructions and the immediate task in stable positions, avoid dumping raw logs unless needed, and prefer concise summaries for old conversation history. The best context is the smallest context that preserves the evidence needed for the answer.`
    },
    {
      label: "Observability for long-context serving",
      detailMD: `Monitor prompt tokens, output tokens, cache bytes, cache hit rate for shared prefixes, page fragmentation, eviction behavior, request rejection rate, and quality regressions by prompt length. Long-context failures often look like latency spikes, incomplete answers, or answers that ignore evidence in the middle of the prompt.`
    }
  ],
  interview: {
    whatInterviewersLookFor: [
      "A precise definition that the context window includes prompt tokens plus generated output tokens.",
      "A correct prefill versus decode explanation, including quadratic prefill attention and cached decode.",
      "Ability to derive the KV cache memory drivers from the formula 2 * layers * heads * head_dim * seq_len * batch * bytes_per_value.",
      "Knowledge of practical serving optimizations such as GQA, MQA, PagedAttention, sliding windows, streaming attention, and prefix caching.",
      "Judgment that long context can hurt quality through distraction, lost-in-the-middle behavior, and stale accumulated state."
    ],
    followUps: [
      {
        question: "Why does the KV cache grow linearly while prefill attention is often described as quadratic?",
        answerMD: `The KV cache stores one key and one value per token per layer and key-value head, so each additional token adds one more slice of storage. That is linear in sequence length. Prefill attention compares prompt positions against other prompt positions, producing an all-pairs pattern that grows roughly with length squared. Decode avoids recomputing past keys and values by reading the cache, but the cache must still be stored.`
      },
      {
        question: "How do GQA and MQA reduce serving cost?",
        answerMD: `They reduce the number of key-value heads stored and read during decode. Grouped-query attention lets several query heads share one key-value head group, while multi-query attention shares a single key-value set more broadly. The model can keep multiple query heads for representation while shrinking the KV cache footprint and memory bandwidth.`
      },
      {
        question: "When should you increase the context window instead of using retrieval or summarization?",
        answerMD: `Increase the window when the model truly needs many tokens at once and the relevant evidence cannot be reliably selected or compressed, such as comparing many sections of one contract or reasoning over a large code diff. Use retrieval when only a small subset is relevant, and use summarization when old state matters but exact wording does not. The design-rag-pipeline lesson covers the retrieval-first version of this decision.`
      },
      {
        question: "What is prompt or prefix caching, and when does it help?",
        answerMD: `Prefix caching reuses precomputed KV entries for a shared beginning of the prompt. It helps when many requests start with the same system instructions, policy text, tool schema, or document prefix. It helps less when every request has a unique prompt or when the shared prefix changes frequently.`
      }
    ],
    alternativeDesigns: [
      {
        name: "Retrieval-first context",
        detailMD: `Instead of feeding the model the entire corpus or full conversation, retrieve the most relevant chunks and pack only those into the prompt. This keeps prefill and cache costs lower and usually improves focus, but it depends on embedding quality, chunking, ranking, and recall.`
      },
      {
        name: "Hierarchical summarization memory",
        detailMD: `Compress old conversation turns, documents, or tool traces into summaries and keep only the current working set verbatim. This lowers token count and context rot, but it can lose exact details, quotes, or edge cases that matter later.`
      },
      {
        name: "Windowed or streaming model architecture",
        detailMD: `Use a model or attention pattern designed to keep only a recent window or bounded recurrent state. This can support very long streams with predictable memory, but it may perform worse when the task requires arbitrary recall from far back in the sequence.`
      }
    ],
    commonMistakes: [
      "Treating context window as input-only and forgetting to reserve tokens for the output.",
      "Saying the KV cache makes long context free, when it only avoids recomputing past keys and values during decode.",
      "Using the number of query heads in the cache estimate for a GQA model instead of the smaller number of key-value heads.",
      "Assuming a larger context window always improves quality, ignoring lost-in-the-middle behavior and context rot.",
      "Confusing PagedAttention with an attention approximation, when it is primarily a KV cache memory-management technique."
    ]
  },
  interviewHints: [
    "Start with the budget: prompt plus output must fit in the context window.",
    "Separate prefill from decode before discussing the cache.",
    "Use the KV cache formula and explain every multiplier in words.",
    "Name one memory optimization, one attention-window optimization, and one prompt-level optimization.",
    "Close with product judgment: retrieval and compression often beat raw long context."
  ],
  comparisons: [
    {
      title: "Long-context cost drivers",
      columns: ["Driver", "Scaling pattern", "Primary impact", "Mitigation"],
      rows: [
        ["Prefill attention", "Roughly sequence length squared", "High time-to-first-token for long prompts", "Shorter prompts, retrieval, efficient kernels"],
        ["KV cache memory", "Linear in sequence length and batch", "Lower batch size and higher GPU memory pressure", "GQA, MQA, cache quantization, paging"],
        ["Decode work", "One step per output token reading growing history", "Longer generation latency and occupied slots", "Output limits, stopping rules, smaller models"],
        ["Prompt noise", "Usually increases with more included text", "Lost-in-the-middle and distraction", "Reranking, summaries, clean prompt packing"]
      ]
    },
    {
      title: "Technique comparison",
      columns: ["Technique", "What it saves", "Tradeoff", "Best fit"],
      rows: [
        ["Grouped-query attention", "KV cache size and bandwidth", "Some sharing across query heads", "General-purpose modern LLM serving"],
        ["Multi-query attention", "Even more KV cache size and bandwidth", "More aggressive sharing can affect quality", "Latency-sensitive decode workloads"],
        ["PagedAttention", "Fragmentation and wasted GPU memory", "Extra indirection and runtime complexity", "Many variable-length concurrent requests"],
        ["Sliding-window attention", "Compute and cache for distant tokens", "Cannot attend to all history directly", "Streams where recent context matters most"],
        ["Prefix caching", "Repeated prefill for shared prompt prefixes", "Only helps stable shared prefixes", "Common system prompts, policies, and templates"]
      ]
    },
    {
      title: "Context strategy decisions",
      columns: ["Choice", "Use when", "Avoid when", "Reason"],
      rows: [
        ["Raise context window", "Many exact tokens must be considered together", "Only a few facts are relevant", "Keeps raw evidence but costs more"],
        ["Use retrieval", "Relevant facts are sparse in a larger corpus", "Recall cannot be trusted for the task", "Keeps prompt small and focused"],
        ["Summarize history", "Older state matters but exact wording does not", "Legal, safety, or code details require exact text", "Compresses stale context"],
        ["Drop context", "Text is obsolete or unrelated", "The model needs provenance for the decision", "Reduces distraction and context rot"]
      ]
    }
  ],
  decisionGuideMD: `## Practical context budgeting

Start every design with a **token budget**. Reserve output tokens first, then allocate the remaining prompt budget across instructions, current user request, retrieved evidence, conversation history, and tool outputs. Do not let retrieval fill the whole window by default.

Use **retrieval** when the answer depends on a small subset of a larger corpus. The **design-rag-pipeline** lesson shows how chunking, embeddings, ranking, and reranking keep the prompt focused. Retrieval is usually better than raw long context when evidence is sparse.

Use **summarization or compression** when old state matters but exact wording does not. Conversation memory, long tool traces, and old planning notes are often better represented as concise state summaries than as full transcripts.

Raise the **context window** when exact cross-document or cross-file reasoning requires many tokens to be visible at once, and when the quality gain justifies higher latency and GPU memory. If the model is missing facts because they were never retrieved, increase retrieval quality before increasing context size.

Watch for **lost-in-the-middle** failures. Put critical instructions and the final task near stable, salient positions. Keep retrieved chunks ordered by relevance, remove duplicates, and avoid burying the key evidence among weak context.`,
  handsOn: [
    {
      title: "Estimate KV cache memory",
      detailMD: `This rough estimator shows how the cache grows with model and request dimensions. Use key-value heads, not query heads, when the model uses grouped-query or multi-query attention.`,
      code: {
        language: "python",
        label: "kv_cache_estimate.py",
        body: `def kv_cache_gib(layers, kv_heads, head_dim, seq_len, batch, bytes_per_value):
    total_bytes = 2 * layers * kv_heads * head_dim * seq_len * batch * bytes_per_value
    gib = total_bytes / (1024 ** 3)
    return round(gib, 2)

layers = 32
head_dim = 128
seq_len = 32768
batch = 8
bf16_bytes = 2

dense_heads = 32
gqa_heads = 8

print("dense cache GiB", kv_cache_gib(layers, dense_heads, head_dim, seq_len, batch, bf16_bytes))
print("gqa cache GiB", kv_cache_gib(layers, gqa_heads, head_dim, seq_len, batch, bf16_bytes))`
      }
    },
    {
      title: "Plan a prompt and output budget",
      detailMD: `This example reserves output first, then checks whether instructions, retrieval, and history fit. A production system would combine this with ranking, deduplication, and fallback summarization.`,
      code: {
        language: "python",
        label: "context_budget.py",
        body: `def plan_context(model_window, output_reserve, system_tokens, user_tokens, retrieved_chunks, chunk_tokens, history_tokens):
    prompt_budget = model_window - output_reserve
    retrieval_tokens = retrieved_chunks * chunk_tokens
    used_prompt = system_tokens + user_tokens + retrieval_tokens + history_tokens
    headroom = prompt_budget - used_prompt
    return {
        "prompt_budget": prompt_budget,
        "used_prompt": used_prompt,
        "headroom": headroom,
        "fits": headroom >= 0
    }

plan = plan_context(
    model_window=32768,
    output_reserve=2048,
    system_tokens=700,
    user_tokens=900,
    retrieved_chunks=12,
    chunk_tokens=600,
    history_tokens=3500
)

print(plan)`
      }
    }
  ],
  quiz: [
    {
      question: "What does a model context window limit?",
      options: [
        "Only the number of input characters before tokenization",
        "The combined prompt and generated output tokens the model can attend to",
        "Only the number of generated output tokens",
        "Only the number of documents a retrieval system can store"
      ],
      answerIndex: 1,
      explanationMD: `The context window is a token budget for the whole request state the model can attend to, including prompt tokens and generated tokens.`
    },
    {
      question: "What does the KV cache store during decode?",
      options: [
        "The final natural-language answer",
        "The model weights for future requests",
        "Keys and values for past tokens at each attention layer",
        "Only the user prompt as plain text"
      ],
      answerIndex: 2,
      explanationMD: `The cache stores attention keys and values for previous tokens so future decode steps can read them instead of recomputing them.`
    },
    {
      question: "Why is prefill attention expensive for long prompts?",
      options: [
        "It compares many prompt positions with many other prompt positions",
        "It cannot run on GPUs",
        "It stores only one token at a time",
        "It skips the feed-forward network"
      ],
      answerIndex: 0,
      explanationMD: `During prefill, attention over the prompt has an all-pairs pattern, so the attention work grows roughly with sequence length squared.`
    },
    {
      question: "In the KV cache memory formula, what does the leading 2 represent?",
      options: [
        "Input tokens plus output tokens",
        "Two GPUs",
        "Keys plus values",
        "Two model replicas"
      ],
      answerIndex: 2,
      explanationMD: `Each cached attention state contains both a key tensor and a value tensor, so the formula starts with 2.`
    },
    {
      question: "How does grouped-query attention reduce KV cache memory?",
      options: [
        "It deletes the context window",
        "It shares fewer key-value heads across multiple query heads",
        "It stores the cache on the CPU only",
        "It replaces tokenization with embeddings"
      ],
      answerIndex: 1,
      explanationMD: `GQA keeps multiple query heads but stores fewer key-value heads, reducing the heads term in the cache footprint.`
    },
    {
      question: "What problem does PagedAttention primarily address?",
      options: [
        "GPU memory fragmentation and allocation waste for KV caches",
        "Hallucination caused by bad training data",
        "Choosing the next token from logits",
        "Converting words into token ids"
      ],
      answerIndex: 0,
      explanationMD: `PagedAttention manages KV cache memory in fixed-size pages so many variable-length requests can share GPU memory more efficiently.`
    },
    {
      question: "Why can a larger context window make answer quality worse?",
      options: [
        "The model cannot generate any output when context is larger than 8K",
        "Extra irrelevant or stale tokens can distract the model and bury key facts in the middle",
        "The KV cache changes model weights",
        "Retrieval stops working with long prompts"
      ],
      answerIndex: 1,
      explanationMD: `Long prompts can suffer from lost-in-the-middle behavior and context rot, where relevant evidence is present but diluted by irrelevant or stale material.`
    }
  ],
  flashcards: [
    { front: "What is a context window?", back: "The maximum number of prompt plus generated output tokens the model can attend to in one request." },
    { front: "Why reserve output tokens?", back: "Because the prompt and answer share the same window, and an overfilled prompt leaves too little room to respond." },
    { front: "What is prefill?", back: "The inference phase that processes the full prompt and creates initial keys and values for all prompt tokens." },
    { front: "What is decode?", back: "The generation phase that produces one token at a time while reading and appending to the KV cache." },
    { front: "What does the KV cache store?", back: "Keys and values for past tokens at each attention layer." },
    { front: "What is the rough KV cache memory formula?", back: "2 * layers * heads * head_dim * seq_len * batch * bytes_per_value, where heads means key-value heads for cached tensors." },
    { front: "How do GQA and MQA help?", back: "They reduce the number of key-value heads stored in the cache by sharing them across query heads." },
    { front: "What is lost-in-the-middle?", back: "A long-context failure mode where models use information near the beginning or end more reliably than information buried in the middle." },
    { front: "When is retrieval better than a larger context window?", back: "When relevant evidence is sparse and can be selected into a smaller, cleaner prompt." }
  ],
  cheatSheetMD: `## Context windows and KV cache cheat sheet

### Core definitions
- **Context window**: maximum prompt plus output tokens the model can attend to.
- **Prompt budget**: context window minus reserved output tokens.
- **Prefill**: full prompt processing before the first generated token.
- **Decode**: one-token-at-a-time generation after prefill.
- **KV cache**: stored keys and values for past tokens, per layer and key-value head.

### Cost rules
- Prefill attention is roughly quadratic in prompt length.
- KV cache memory is linear in sequence length and batch size.
- The rough cache formula is 2 * layers * heads * head_dim * seq_len * batch * bytes_per_value.
- With GQA or MQA, use key-value heads for the heads term, not query heads.
- Long outputs keep decode slots active and grow the cache one token at a time.

### Serving techniques
- **GQA**: several query heads share each key-value head group.
- **MQA**: many query heads share one key-value set.
- **PagedAttention**: maps logical cache blocks to physical GPU pages to reduce fragmentation.
- **Sliding-window attention**: attends mainly to recent tokens.
- **Streaming attention**: keeps bounded state for long streams.
- **Prefix caching**: reuses KV entries for shared prompt prefixes.

### Quality warnings
- More context can create distraction.
- Lost-in-the-middle means important evidence buried mid-prompt may be ignored.
- Context rot comes from stale history, repeated logs, and irrelevant state.
- A short, well-ranked prompt often beats a huge prompt.

### Practical rules
1. Reserve output tokens first.
2. Pack the current task and critical instructions clearly.
3. Use retrieval for sparse evidence.
4. Summarize old history when exact wording is not required.
5. Raise context size only when many exact tokens must be visible together.
6. Monitor cache memory, time-to-first-token, cache hit rate, and quality by prompt length.`,
  references: [
    { title: "Attention Is All You Need", kind: "Paper", url: "https://arxiv.org/abs/1706.03762", author: "Vaswani et al." },
    { title: "Efficient Memory Management for Large Language Model Serving with PagedAttention", kind: "Paper", url: "https://arxiv.org/abs/2309.06180", author: "Kwon et al." },
    { title: "Fast Transformer Decoding: One Write-Head is All You Need", kind: "Paper", url: "https://arxiv.org/abs/1911.02150", author: "Shazeer" },
    { title: "Lost in the Middle: How Language Models Use Long Contexts", kind: "Paper", url: "https://arxiv.org/abs/2307.03172", author: "Liu et al." }
  ],
  relatedLessons: [
    { slug: "how-llm-inference-works", note: "Explains prefill, decode, batching, and token generation from the serving perspective." },
    { slug: "attention-mechanism", note: "Goes deeper on the query, key, and value operations behind the cache." },
    { slug: "transformer-architecture", note: "Shows where attention layers and heads fit inside the full model block." },
    { slug: "design-rag-pipeline", note: "Shows how retrieval keeps prompts small and focused instead of relying on raw long context." }
  ]
};
