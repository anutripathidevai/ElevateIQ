import type { GenAILessonContent } from "../types";

export const howLlmInferenceWorksContent: GenAILessonContent = {
  slug: "how-llm-inference-works",
  introductionMD: `LLM inference is the process that turns a prompt into a generated response. The model is not writing a whole answer in one pass. It predicts one next token, appends that token to the context, then repeats the same operation until a stop condition fires.

In interviews, this lesson is where transformer knowledge becomes production knowledge. A strong answer explains why the prompt stage feels different from the generation stage, what the key-value cache stores, why long context and long output affect different latency metrics, and how serving engines keep GPUs busy.

This lesson follows the complete serving loop: tokenize the prompt, run prefill, build the KV cache, decode one token at a time, sample from logits, stream partial text, and stop safely. The goal is to reason about time-to-first-token, tokens per second, memory pressure, batching, and cost with enough precision to design real LLM systems.`,
  realWorldMD: `LLM inference shows up anywhere a product calls a generative model.

- Chat assistants and copilots use streaming inference so users see tokens before the full answer is ready.
- Search and RAG systems care about time-to-first-token because retrieval already added front-end latency.
- Coding agents and document tools often pay heavily for long prompts and long generated outputs.
- Model serving teams tune batching, quantization, and KV cache layout to reduce GPU cost.
- API platform teams expose max tokens, stop sequences, and streaming because they map directly to the inference loop.`,
  learningObjectives: [
    "Explain autoregressive generation as a loop that predicts one token and feeds it back into the next step.",
    "Distinguish prefill from decode and connect each phase to time-to-first-token and inter-token latency.",
    "Describe what the KV cache stores and why it avoids recomputing attention over past tokens.",
    "Reason about compute-bound prefill, memory-bandwidth-bound decode, throughput, and tokens per second.",
    "Compare static batching with continuous or in-flight batching for serving many requests.",
    "Identify the main latency and cost levers: model size, quantization, context length, output length, and streaming."
  ],
  theory: [
    {
      label: "Autoregressive generation is a feedback loop",
      detailMD: `A decoder-only LLM generates text from left to right. Given a prompt, it produces logits for the next token, a decoding strategy chooses one token, and that token is appended to the context. The enlarged context becomes the input for the next prediction.

This loop is why output length is such a direct cost driver. A 500 token answer requires roughly 500 decode iterations after the prompt has been processed. The model can process the prompt in parallel, but it cannot generate token 200 until token 199 has been chosen.`
    },
    {
      label: "Prefill processes the prompt and builds the KV cache",
      detailMD: `The prefill phase runs the full prompt through the transformer. Because all prompt tokens are already known, the GPU can process many positions in parallel and compute the key and value tensors for every layer. Those tensors become the KV cache.

Prefill also produces the first next-token logits. From a user perspective, prefill is the main contributor to time-to-first-token. Long prompts, large models, and high batch sizes all increase this first visible delay.`
    },
    {
      label: "Decode reuses the cache one token at a time",
      detailMD: `After prefill, each decode step receives only the latest token plus the existing KV cache. The model computes new query, key, and value projections for the new position, attends over cached keys and values from prior positions, appends the new key and value to the cache, and emits logits for the next token.

This reuse is the reason inference is practical. Without the KV cache, every generated token would require rerunning the entire prompt and all previous output tokens through the model, wasting huge amounts of attention work.`
    },
    {
      label: "Prefill and decode stress the GPU differently",
      detailMD: `Prefill is usually compute-bound. It performs large matrix multiplications over a full prompt and can keep tensor cores busy, especially when requests are batched together. Decode is often memory-bandwidth-bound because each step does relatively little new compute but must read model weights and a growing KV cache for each token.

That distinction explains two different user metrics. Time-to-first-token measures how long the prefill path takes before the first token can be streamed. Inter-token latency measures the gap between generated tokens during decode, and tokens per second is its throughput view.`
    },
    {
      label: "Sampling and stopping sit after logits",
      detailMD: `The transformer does not directly output text. It outputs logits over the vocabulary. A decoding strategy such as greedy decoding, temperature sampling, top-p, or top-k chooses the next token from those logits. The sampling-and-decoding lesson covers those policies in depth.

The generation loop stops when the sampler picks an EOS token, when the request reaches its max tokens budget, or when the detokenized output matches a configured stop sequence. Serving systems need all three because model-native stopping, product limits, and application-specific delimiters solve different problems.`
    }
  ],
  architecture: {
    width: 980,
    height: 560,
    nodes: [
      { id: "prompt", label: "Prompt Tokens", kind: "client", x: 40, y: 260, sublabel: "input ids" },
      { id: "prefill", label: "Prefill", kind: "service", x: 180, y: 260, sublabel: "parallel prompt pass" },
      { id: "kvcache", label: "KV Cache", kind: "cache", x: 330, y: 260, sublabel: "keys and values by layer" },
      { id: "decode", label: "Decode Step", kind: "worker", x: 500, y: 170, sublabel: "one new token" },
      { id: "logits", label: "Logits", kind: "analytics", x: 650, y: 170, sublabel: "vocab scores" },
      { id: "sampler", label: "Sampler", kind: "service", x: 800, y: 170, sublabel: "choose next token" },
      { id: "next", label: "Next Token", kind: "worker", x: 800, y: 360, sublabel: "append to context" },
      { id: "output", label: "Output Buffer", kind: "cache", x: 650, y: 440, sublabel: "generated ids" },
      { id: "detok", label: "Detokenize", kind: "service", x: 500, y: 440, sublabel: "ids to text" },
      { id: "response", label: "Response", kind: "client", x: 330, y: 440, sublabel: "stream or final text" }
    ],
    edges: [
      { from: "prompt", to: "prefill", label: "token ids" },
      { from: "prefill", to: "kvcache", label: "build cache" },
      { from: "kvcache", to: "decode", label: "past K and V" },
      { from: "decode", to: "logits", label: "next-token scores" },
      { from: "logits", to: "sampler", label: "decode policy" },
      { from: "sampler", to: "next", label: "selected token" },
      { from: "next", to: "decode", label: "feed back", dashed: true },
      { from: "decode", to: "kvcache", label: "append K and V", dashed: true },
      { from: "next", to: "output", label: "append id" },
      { from: "output", to: "detok", label: "token ids" },
      { from: "detok", to: "response", label: "text chunks" }
    ],
    captionMD: `The inference loop has a parallel prefill stage followed by a sequential decode loop. The KV cache carries attention state forward, the sampler chooses each next token from logits, and the output buffer is detokenized into a streaming or final response.`
  },
  architectureNotesMD: `The diagram separates logical responsibilities rather than physical processes. In a real serving engine, prefill, decode, logits projection, sampling, and cache writes may be fused or scheduled across multiple GPUs, but the control flow is the same: process the prompt once, then generate one token at a time.

The KV cache is drawn as a first-class cache because it is the central state object during inference. It stores key and value tensors for every layer and every active sequence position. As context grows, cache memory grows linearly with batch size and sequence length, which is why the context-windows-and-kv-cache lesson is a direct follow-up.

The loop edge from next token back to decode is the autoregressive dependency. It is also the source of inter-token latency: the system cannot start the next decode step for a request until sampling has selected the current token and stop checks have passed.`,
  requestFlow: [
    {
      step: "1. Tokenize the prompt",
      detailMD: `The client text is converted into token ids. The server also records request settings such as max tokens, temperature, stop sequences, stream mode, and any batching priority metadata.`
    },
    {
      step: "2. Schedule the request",
      detailMD: `The serving engine places the request into a prefill batch. Static batching waits for a fixed group or timeout, while continuous batching can insert work as GPU slots become available. The scheduler is trying to raise utilization without adding too much queueing delay.`
    },
    {
      step: "3. Run prefill over all prompt tokens",
      detailMD: `The model processes the prompt positions in parallel through every transformer layer. This phase performs large dense matrix operations, builds key and value tensors for all prompt tokens, and produces logits for the first generated token.`
    },
    {
      step: "4. Store the KV cache",
      detailMD: `For each layer, the engine stores the key and value tensors that future tokens will attend to. Cache allocation can be simple contiguous memory or a paged layout that avoids wasting memory when sequences have different lengths.`
    },
    {
      step: "5. Sample the first token",
      detailMD: `The logits are adjusted by the configured decoding strategy. Greedy decoding may pick the largest logit, while temperature, top-k, or top-p sampling inject controlled randomness. The selected token is appended to the generated output.`
    },
    {
      step: "6. Decode the next token using the cache",
      detailMD: `The model receives only the newest token for this request. It computes that token query, key, and value, reads cached keys and values for the full prior context, writes the new key and value, and emits another logits vector.`
    },
    {
      step: "7. Stream and check stop conditions",
      detailMD: `The server can detokenize and stream text chunks as tokens arrive. After each token, it checks for EOS, max tokens, stop sequences, cancellation, or safety gates. If none apply, the decode loop continues.`
    },
    {
      step: "8. Finalize the response",
      detailMD: `When generation stops, the server flushes any buffered text, returns usage metadata such as prompt tokens and completion tokens, releases KV cache blocks, and records latency metrics for prefill, decode, and total request time.`
    }
  ],
  deepDives: [
    {
      label: "Why prefill is compute-bound",
      detailMD: `Prefill looks like training forward pass without the backward pass. The model evaluates many prompt positions at once, so matrix multiplications are large enough to use GPU tensor cores efficiently. Attention over the prompt is also parallel because every prompt token is known before generation starts.

This is why prompt length has a strong effect on time-to-first-token. More prompt tokens mean more dense compute before the first streamed token can appear. Batching several prompts can improve GPU utilization, but it can also increase queueing delay if the scheduler waits too long to form a batch.`
    },
    {
      label: "Why decode is memory-bandwidth-bound",
      detailMD: `Decode performs one position per active request at a time. Each step still has to read model weights and scan cached keys and values, but it does not have enough arithmetic work per request to fully occupy the GPU. The limiting factor often becomes moving bytes from GPU memory rather than raw floating point operations.

This is why tokens per second improves with batching up to a point. More active sequences give the GPU more work per decode iteration, but the KV cache also grows and consumes memory bandwidth. A serving system is constantly balancing throughput, latency, and memory headroom.`
    },
    {
      label: "KV cache mechanics and growth",
      detailMD: `The KV cache stores the key and value projections generated inside self-attention for every layer. During decode, the new token query attends to all previous keys and uses the corresponding values to build the attention output. Cached keys and values avoid recomputing projections for past tokens.

Cache size grows linearly with batch size, number of layers, KV heads, head dimension, and total sequence length. It also grows as output tokens are generated. This is the practical reason long context windows are expensive even when attention compute has been optimized, and the context-windows-and-kv-cache lesson covers the memory math in more detail.`
    },
    {
      label: "Static batching versus continuous batching",
      detailMD: `Static batching groups requests at a fixed boundary, runs them together, and usually waits for the whole group to finish. It is simple, but it wastes GPU slots when short generations finish while long generations continue.

Continuous batching, also called in-flight batching, lets new requests join between decode steps and removes completed requests immediately. This keeps the GPU busier for mixed workloads and is a major reason modern LLM serving engines can deliver high throughput without requiring every request to have the same length.`
    },
    {
      label: "Serving engines and PagedAttention",
      detailMD: `Engines such as vLLM and TensorRT-LLM optimize the same logical loop with specialized kernels, scheduling, memory planners, tensor parallelism, and fast sampling paths. They try to keep the GPU doing useful work while minimizing cache fragmentation and wasted memory copies.

PagedAttention is the idea of managing the KV cache in fixed-size blocks, similar to virtual memory pages. Instead of reserving one large contiguous buffer for every request, the engine maps each sequence to cache pages. This improves memory utilization when request lengths vary and makes continuous batching easier to schedule.`
    }
  ],
  productionConsiderations: [
    {
      label: "Latency metrics need phase boundaries",
      detailMD: `Track queue time, prefill time, time-to-first-token, inter-token latency, output tokens per second, and total latency separately. A system can have a fast decode loop but poor user experience if requests wait too long in a batch queue, or if long prompts dominate prefill.`
    },
    {
      label: "Cost levers are mostly token and model levers",
      detailMD: `Larger models increase weight memory and per-token compute. Longer prompts increase prefill work and KV cache size. Longer outputs increase the number of decode steps. Quantization can reduce memory and bandwidth, but it must be tested for quality regressions on the product workload.`
    },
    {
      label: "Streaming improves perceived latency, not total work",
      detailMD: `Streaming sends detokenized chunks as soon as the decode loop produces them, which makes the application feel responsive after time-to-first-token. It does not reduce the number of model steps. It can even add application complexity because clients must handle partial text, cancellation, and final usage metadata.`
    },
    {
      label: "Operational guardrails protect the serving pool",
      detailMD: `Production systems enforce max context, max output tokens, request timeouts, admission control, and per-tenant quotas. These limits prevent a small number of very long requests from monopolizing KV cache memory and reducing throughput for everyone else.`
    }
  ],
  interview: {
    whatInterviewersLookFor: [
      "A crisp explanation that generation is autoregressive and sequential after the prompt has been processed.",
      "Correct distinction between prefill, decode, time-to-first-token, inter-token latency, and tokens per second.",
      "Understanding of the KV cache as stored keys and values, not a generic response cache.",
      "Ability to connect batching, quantization, context length, and output length to concrete latency and cost tradeoffs."
    ],
    followUps: [
      {
        question: "Why does the first token often take longer than later tokens?",
        answerMD: `The first token waits for tokenization, queueing, prefill, and sampling. Prefill processes the entire prompt through all transformer layers and builds the KV cache, so a long prompt can be expensive before any output is visible. Later tokens reuse the cache and only run one new position at a time, so the user sees smaller inter-token gaps.`
      },
      {
        question: "Why does decode become memory-bandwidth-bound?",
        answerMD: `Each decode step has limited new arithmetic because it processes only the latest token for each active sequence. However, it still reads model weights and the KV cache, and the cache grows with sequence length. The bottleneck often becomes moving those bytes through GPU memory fast enough, not doing more floating point math.`
      },
      {
        question: "How would you improve throughput for a high-traffic chat API?",
        answerMD: `Use continuous batching so new requests can join between decode steps, cap prompt and output lengths, choose an appropriately sized model, quantize if quality allows, and use a serving engine with efficient KV cache management. Then monitor time-to-first-token and tokens per second separately because optimizations can improve one while hurting the other.`
      }
    ],
    alternativeDesigns: [
      {
        name: "No KV cache",
        detailMD: `A naive implementation could rerun the whole prompt and generated prefix for every next token. It is simpler to explain but far too expensive in production because it recomputes attention projections for every past token on every step.`
      },
      {
        name: "Speculative decoding",
        detailMD: `A smaller draft model proposes several tokens, and the larger target model verifies them. When the draft is accurate, the server accepts multiple tokens per target-model pass. This can reduce latency, but it adds model coordination complexity and does not remove the need for KV cache management.`
      }
    ],
    commonMistakes: [
      "Saying the model generates the whole answer in parallel instead of one token at a time.",
      "Describing the KV cache as cached final text rather than cached attention keys and values.",
      "Optimizing only total latency while ignoring time-to-first-token and inter-token latency.",
      "Assuming larger batches always help, without considering queueing delay, cache memory, and tail latency.",
      "Forgetting that stop sequences are checked on detokenized text, while EOS is a model token."
    ]
  },
  interviewHints: [
    "Start with the loop: logits, sampler, next token, append, repeat.",
    "Name the two phases early: prefill builds the cache, decode reuses it.",
    "Tie prefill to time-to-first-token and decode to inter-token latency.",
    "Explain cost with four levers: model size, prompt length, output length, and precision."
  ],
  comparisons: [
    {
      title: "Prefill versus decode",
      columns: ["Phase", "What it processes", "Main bottleneck", "User-facing metric"],
      rows: [
        ["Prefill", "All prompt tokens in parallel", "Compute", "Time-to-first-token"],
        ["Decode", "One new token per active request", "Memory bandwidth", "Inter-token latency"],
        ["Sampling", "One logits vector", "Policy and filtering overhead", "Per-token choice quality"]
      ]
    },
    {
      title: "Latency and cost levers",
      columns: ["Lever", "Primary effect", "Tradeoff", "Common mitigation"],
      rows: [
        ["Model size", "More weights and compute per token", "Higher quality but higher latency and cost", "Use the smallest model that meets quality"],
        ["Context length", "More prefill work and KV cache memory", "Better grounding but slower first token", "Retrieve and trim to relevant context"],
        ["Output length", "More decode iterations", "More complete answer but higher total latency", "Set max tokens and concise instructions"],
        ["Quantization", "Lower memory and bandwidth", "Possible quality or accuracy loss", "Evaluate on production-like prompts"]
      ]
    },
    {
      title: "Batching strategies",
      columns: ["Strategy", "How it works", "Strength", "Risk"],
      rows: [
        ["Static batching", "Runs a fixed group together", "Simple and predictable", "Wastes slots when requests finish at different times"],
        ["Continuous batching", "Adds and removes requests between decode steps", "Higher utilization for mixed lengths", "Requires more complex scheduling"],
        ["Priority batching", "Schedules by tier or deadline", "Controls latency for important traffic", "Can starve low-priority workloads without quotas"]
      ]
    }
  ],
  decisionGuideMD: `## How to tune an inference path

Use a **smaller or quantized model** when latency and serving cost matter more than marginal quality. Validate quality with the same prompt shapes your product will send.

Use **prompt trimming and retrieval discipline** when time-to-first-token is high. Long prompts expand prefill work and KV cache memory before the user sees anything.

Use **continuous batching** when traffic is high and request lengths vary. It usually improves GPU utilization more than static batching, especially during decode.

Use **streaming responses** when perceived responsiveness matters. Streaming does not reduce compute, but it turns a long wait into visible progress after the first token.

Use **output caps and stop sequences** to control cost. The decode loop runs once per generated token, so unbounded generation is both a latency and budget problem.`,
  handsOn: [
    {
      title: "Estimate KV cache memory",
      detailMD: `This rough estimator shows why sequence length and batch size matter. It counts keys and values for every layer, token, and active sequence. Real engines add alignment and paging overhead, but the scaling relationship is the important lesson.`,
      code: {
        language: "python",
        label: "kv_cache_estimate.py",
        body: `def kv_cache_gib(layers, kv_heads, head_dim, tokens, batch, bytes_per_value=2):
    values = 2 * layers * kv_heads * head_dim * tokens * batch * bytes_per_value
    return round(values / (1024 ** 3), 2)

small_batch = kv_cache_gib(layers=32, kv_heads=8, head_dim=128, tokens=4096, batch=4)
large_batch = kv_cache_gib(layers=32, kv_heads=8, head_dim=128, tokens=16384, batch=16)

print("small batch GiB:", small_batch)
print("large batch GiB:", large_batch)`
      }
    },
    {
      title: "Simulate the autoregressive loop",
      detailMD: `This pseudocode-like Python keeps the key pieces visible: logits are produced, a sampler chooses a token, the token is appended, and stop conditions are checked after each step.`,
      code: {
        language: "python",
        label: "decode_loop.py",
        body: `def model_step(context_tokens, kv_cache):
    logits = {"hello": 3.2, "world": 2.1, "<eos>": 0.4}
    kv_cache.append("new_key_value")
    return logits, kv_cache

def greedy_sample(logits):
    return max(logits, key=logits.get)

context = ["Prompt:"]
kv_cache = []
output = []
max_tokens = 5
stop_sequences = ["hello world"]

for _ in range(max_tokens):
    logits, kv_cache = model_step(context, kv_cache)
    token = greedy_sample(logits)
    if token == "<eos>":
        break
    output.append(token)
    context.append(token)
    text = " ".join(output)
    if any(text.endswith(stop) for stop in stop_sequences):
        break

print("generated:", " ".join(output))`
      }
    }
  ],
  quiz: [
    {
      question: "What does autoregressive generation mean for a decoder-only LLM?",
      options: [
        "The model generates the entire answer in one parallel operation",
        "The model predicts one next token, appends it, and repeats",
        "The tokenizer chooses the next word without running the model",
        "The KV cache stores completed responses for reuse"
      ],
      answerIndex: 1,
      explanationMD: `Autoregressive generation is a feedback loop. Each generated token becomes part of the context used to predict the next token.`
    },
    {
      question: "What is the main job of the prefill phase?",
      options: [
        "Process the full prompt and build the KV cache",
        "Delete old cache pages after generation ends",
        "Choose a stop sequence before logits exist",
        "Compress the final response for the client"
      ],
      answerIndex: 0,
      explanationMD: `Prefill runs the prompt through the model in parallel, creates key and value tensors for the prompt, and produces the first next-token logits.`
    },
    {
      question: "Why does the KV cache improve decode efficiency?",
      options: [
        "It stores final text so the model never runs",
        "It stores past attention keys and values so they do not need to be recomputed",
        "It removes the need for sampling",
        "It makes every generated token independent of previous tokens"
      ],
      answerIndex: 1,
      explanationMD: `The cache stores key and value tensors for prior positions. New tokens can attend to those cached tensors instead of recomputing them from the whole prefix.`
    },
    {
      question: "Which metric is most directly tied to the decode loop after generation has started?",
      options: [
        "Dataset size",
        "Inter-token latency",
        "Training loss",
        "Embedding dimension only"
      ],
      answerIndex: 1,
      explanationMD: `Inter-token latency is the delay between streamed tokens during decode. Tokens per second is the throughput view of the same phase.`
    },
    {
      question: "Why do modern serving engines use continuous or in-flight batching?",
      options: [
        "To avoid using GPUs at all",
        "To let new requests join and completed requests leave between decode steps",
        "To force every request to generate the same number of tokens",
        "To replace the KV cache with a database"
      ],
      answerIndex: 1,
      explanationMD: `Continuous batching keeps GPU slots filled as request lengths vary, improving throughput compared with waiting for a fixed static batch to finish.`
    },
    {
      question: "Which stop condition is model-native rather than application-defined?",
      options: [
        "EOS token",
        "HTTP timeout",
        "User scrolling away",
        "A custom text delimiter only"
      ],
      answerIndex: 0,
      explanationMD: `EOS is a token the model can emit to indicate completion. Max tokens and stop sequences are request or application controls around the generation loop.`
    }
  ],
  flashcards: [
    { front: "What is LLM inference?", back: "The serving-time process of turning prompt tokens into generated tokens using the trained model weights." },
    { front: "What does autoregressive mean?", back: "The model predicts one token at a time, appends it to the context, and uses it to predict the next token." },
    { front: "What is prefill?", back: "The phase that processes the full prompt in parallel, builds the KV cache, and produces the first next-token logits." },
    { front: "What is decode?", back: "The repeated phase that processes one new token per request while reusing and extending the KV cache." },
    { front: "What does the KV cache store?", back: "Attention key and value tensors for previous tokens at each transformer layer." },
    { front: "Why is prefill often compute-bound?", back: "It performs large parallel matrix multiplications over all prompt positions, which can keep tensor cores busy." },
    { front: "Why is decode often memory-bandwidth-bound?", back: "Each step has little new compute but must read model weights and a growing KV cache." },
    { front: "What is continuous batching?", back: "A serving strategy that adds new requests and removes completed requests between decode steps to improve GPU utilization." }
  ],
  cheatSheetMD: `## LLM inference cheat sheet

### The loop
1. Tokenize the prompt.
2. Run prefill over the full prompt.
3. Build the KV cache.
4. Produce logits for the next token.
5. Sample one token.
6. Append the token to context and output.
7. Decode the next token using the cache.
8. Stop on EOS, max tokens, stop sequence, timeout, or cancellation.

### Prefill
- Processes all prompt tokens in parallel.
- Builds key and value tensors for every layer.
- Drives time-to-first-token.
- Usually compute-bound.
- Gets more expensive as prompt length grows.

### Decode
- Processes one new token per active request.
- Reuses the KV cache for prior positions.
- Drives inter-token latency and tokens per second.
- Often memory-bandwidth-bound.
- Gets more expensive as output length and active batch size grow.

### KV cache
- Stores attention keys and values, not final text.
- Avoids recomputing attention projections for past tokens.
- Grows with layers, KV heads, head dimension, batch size, and total sequence length.
- Needs careful memory management for long contexts and mixed request lengths.

### Serving levers
- Model size: larger usually means better quality but more latency and cost.
- Quantization: lowers memory and bandwidth, with possible quality tradeoffs.
- Context length: increases prefill and cache memory.
- Output length: increases decode iterations.
- Batching: improves GPU utilization but can add queueing delay.
- Streaming: improves perceived responsiveness after the first token.

### Interview one-liner
LLM inference is a two-phase autoregressive serving loop: prefill computes the prompt and builds the KV cache, then decode repeatedly reuses that cache to generate one sampled token at a time.`,
  references: [
    { title: "Efficient Memory Management for Large Language Model Serving with PagedAttention", kind: "Paper", url: "https://arxiv.org/abs/2309.06180", author: "Kwon et al." },
    { title: "TensorRT-LLM Documentation", kind: "Docs", url: "https://nvidia.github.io/TensorRT-LLM/", author: "NVIDIA" },
    { title: "Hugging Face Text Generation Strategies", kind: "Docs", url: "https://huggingface.co/docs/transformers/generation_strategies", author: "Hugging Face" },
    { title: "Orca: A Distributed Serving System for Transformer-Based Generative Models", kind: "Paper", url: "https://www.usenix.org/conference/osdi22/presentation/yu", author: "Yu et al." }
  ],
  relatedLessons: [
    { slug: "transformer-architecture", note: "Explains the decoder-only stack that runs during prefill and decode." },
    { slug: "attention-mechanism", note: "Goes deeper on the keys and values stored in the KV cache." },
    { slug: "sampling-and-decoding", note: "Covers the policies that choose the next token from logits." },
    { slug: "context-windows-and-kv-cache", note: "Expands on cache growth, context length, and memory pressure." }
  ]
};
