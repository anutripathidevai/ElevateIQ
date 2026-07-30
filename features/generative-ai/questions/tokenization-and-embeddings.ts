import type { GenAILessonContent } from "../types";

export const tokenizationAndEmbeddingsContent: GenAILessonContent = {
  slug: "tokenization-and-embeddings",
  introductionMD: `Tokenization and embeddings are the first translation layer between human text and neural computation. A language model never sees words directly. It sees integer token ids, then dense vectors, and every later transformer block operates on those vectors.

In interviews, this topic separates API familiarity from systems understanding. A strong answer explains why modern models use **subword tokens**, how a tokenizer learns a vocabulary, how token ids index an embedding matrix, and why token count controls cost, latency, and context limits.

This lesson covers the practical path from raw text to vectors: byte-level BPE and related tokenizers, special tokens such as beginning of sequence, end of sequence, and padding, the embedding matrix learned during training, and the geometry behind cosine similarity.

The same concepts also power retrieval. Sentence and document embeddings are stored in vector databases for RAG, while prompt tokenization determines how much retrieved context fits in the model window. If you can reason about both, you can design cheaper, more reliable LLM systems.`,
  realWorldMD: `Tokenization and embeddings show up in every production LLM feature.

- Chat products estimate prompt size, output room, and price in tokens, not words.
- Long documents must be chunked by token count so they do not overflow the context window.
- Multilingual text, emojis, logs, and code can consume more tokens than expected.
- Embedding models turn chunks into vectors that can be searched in a vector database.
- RAG quality depends on both chunk tokenization and the embedding model used for retrieval.
- Model upgrades can require tokenizer compatibility checks and embedding re-indexing.`,
  learningObjectives: [
    "Define what a token is and why modern LLMs usually use subword tokens.",
    "Explain how BPE learns a vocabulary by repeatedly merging frequent adjacent pairs.",
    "Distinguish byte-level BPE, WordPiece, and SentencePiece at a practical level.",
    "Trace how tokens become ids, special tokens, and embedding vectors.",
    "Use token-count heuristics to reason about pricing, context limits, truncation, and prompt budgets.",
    "Compare static, contextual, and sentence or document embeddings for retrieval and RAG."
  ],
  theory: [
    {
      label: "A token is the model input unit",
      detailMD: `A **token** is one item from the tokenizer vocabulary. It may be a whole word, part of a word, punctuation, whitespace, a byte sequence, or a common code fragment. The model input is not text; it is a sequence of token ids, one integer per token.

Subword tokens are the practical compromise between words and characters. Word-level tokenizers break on rare words, names, typos, and morphology. Character-level tokenizers produce very long sequences. Subword tokenizers keep common words whole but split rare words into reusable pieces, giving a manageable vocabulary and shorter sequences.`
    },
    {
      label: "BPE learns vocabulary by merging frequent pairs",
      detailMD: `Byte-Pair Encoding starts from small symbols and repeatedly merges the most frequent adjacent pair in the training corpus. If the pair t plus h appears often, it may become th. Later th plus e may become the. After many merges, the tokenizer has a vocabulary containing single symbols, common subwords, whole common words, punctuation patterns, and code fragments.

At inference time the learned merge rules are applied greedily and deterministically. The tokenizer does not understand meaning; it follows a learned compression scheme that tends to keep frequent patterns short and splits uncommon patterns into smaller pieces.`
    },
    {
      label: "Byte-level BPE, WordPiece, and SentencePiece",
      detailMD: `Byte-level BPE starts from bytes instead of a fixed set of characters. This gives full coverage: any Unicode text, emoji, binary-looking log fragment, or unusual symbol can be represented without an unknown token. The tradeoff is that some non-English text and unusual strings can tokenize into more pieces.

WordPiece, used by BERT-style models, is also a subword method but selects vocabulary entries using a likelihood-oriented objective rather than pure pair frequency. SentencePiece is a tokenizer toolkit that treats text as a raw stream and can train BPE or unigram tokenizers without relying on spaces, which makes it useful across languages.`
    },
    {
      label: "Token ids and special tokens",
      detailMD: `After segmentation, every token is mapped to an integer id by a vocabulary table. The sequence of ids is what the model receives. The same visible text can produce different ids under different tokenizers, which is why tokenizer and model versions are tied together.

Special tokens are reserved ids with control meaning. A beginning-of-sequence token can mark the start of input, an end-of-sequence token can mark completion, and a padding token can fill shorter examples in a batch. Training and serving code must handle special tokens and padding masks consistently.`
    },
    {
      label: "The embedding matrix maps ids to dense vectors",
      detailMD: `The embedding layer is a learned matrix with one row per vocabulary id and one column per hidden dimension. Looking up token id 824 means selecting row 824 from that matrix. The result is a dense vector, and a prompt becomes a sequence of dense vectors before it enters the transformer.

These vectors are learned during training. Tokens that appear in similar contexts tend to receive related representations, so the geometry carries semantic information. Cosine similarity measures the angle between vectors and is commonly used when comparing embeddings because it focuses on direction rather than raw magnitude.`
    },
    {
      label: "Static, contextual, and retrieval embeddings",
      detailMD: `Static embeddings such as word2vec and GloVe assign one vector to a word type, so bank has the same vector in river bank and investment bank. Transformer models produce contextual token states, so the representation of bank can change based on neighboring tokens.

Sentence and document embeddings compress a span of text into one vector for search, clustering, or retrieval. These are usually produced by embedding models trained for semantic similarity. In RAG, those vectors are indexed in a vector database, and the most similar chunks are retrieved before generation.`
    }
  ],
  architecture: {
    width: 980,
    height: 560,
    nodes: [
      { id: "raw", label: "Raw Text", kind: "client", x: 40, y: 250, sublabel: "prompt, chunk, code" },
      { id: "tokenizer", label: "Tokenizer", kind: "service", x: 180, y: 250, sublabel: "apply BPE merges" },
      { id: "vocab", label: "Vocabulary", kind: "storage", x: 180, y: 90, sublabel: "tokens, ids, specials" },
      { id: "ids", label: "Token IDs", kind: "analytics", x: 340, y: 250, sublabel: "integer sequence" },
      { id: "matrix", label: "Embedding Matrix", kind: "database", x: 500, y: 250, sublabel: "vocab size by hidden" },
      { id: "vectors", label: "Dense Vectors", kind: "analytics", x: 670, y: 250, sublabel: "one vector per token" },
      { id: "model", label: "Transformer Model", kind: "service", x: 850, y: 250, sublabel: "contextual processing" },
      { id: "vectordb", label: "Vector Database", kind: "search", x: 670, y: 430, sublabel: "RAG retrieval index" }
    ],
    edges: [
      { from: "raw", to: "tokenizer", label: "text bytes" },
      { from: "vocab", to: "tokenizer", label: "merge rules", dashed: true },
      { from: "tokenizer", to: "ids", label: "token to id" },
      { from: "ids", to: "matrix", label: "row lookup" },
      { from: "matrix", to: "vectors", label: "learned vectors" },
      { from: "vectors", to: "model", label: "hidden input" },
      { from: "vectors", to: "vectordb", label: "index embeddings", dashed: true },
      { from: "vectordb", to: "model", label: "retrieved context", dashed: true }
    ],
    captionMD: `Text becomes model input through a deterministic tokenizer and a learned embedding lookup. The same vector idea also appears in retrieval systems, where sentence or document embeddings are indexed in a vector database and used to bring relevant context back to the model.`
  },
  architectureNotesMD: `The diagram separates deterministic preprocessing from learned parameters. The tokenizer and vocabulary are fixed for a model release: they decide the token boundaries and ids. The embedding matrix is learned during training and maps those ids into the hidden vector space used by the transformer.

The vector database branch is conceptual. Internal token embeddings feed the transformer, while RAG systems usually store sentence or document embeddings produced by a retrieval embedding model. Both rely on dense-vector geometry, but they are trained for different objectives and should not be treated as interchangeable.

The dashed retrieval edge means retrieved text must still be placed into the prompt and tokenized before generation. Retrieval reduces the amount of raw context the model must read, but the final request is still limited and priced by tokens.`,
  requestFlow: [
    {
      step: "1. Receive raw text",
      detailMD: `The system starts with user text, a document chunk, a tool result, or source code. Before modeling, the text is interpreted as a sequence of bytes or Unicode characters, including whitespace and punctuation that may affect token boundaries.`
    },
    {
      step: "2. Apply tokenizer rules",
      detailMD: `The tokenizer applies its learned vocabulary and merge rules. Frequent substrings are kept as larger tokens, while rare words, names, non-English text, or unusual code patterns are split into smaller pieces.`
    },
    {
      step: "3. Map tokens to ids",
      detailMD: `Each token is replaced with its integer vocabulary id. The serving request may also add beginning-of-sequence, end-of-sequence, separator, or role-control tokens depending on the model and chat format.`
    },
    {
      step: "4. Pad or truncate for batching and limits",
      detailMD: `Training batches often pad shorter sequences so tensors have the same length. In serving, systems count tokens before sending a request and may truncate history, summarize old turns, or drop low-value context to stay within the model window.`
    },
    {
      step: "5. Look up rows in the embedding matrix",
      detailMD: `Every token id selects one row from the embedding matrix. This converts a sequence of integers into a sequence of dense vectors with the model hidden size.`
    },
    {
      step: "6. Add position and contextualize",
      detailMD: `The model injects positional information and then passes vectors through transformer blocks. After attention layers, token representations become contextual, so a token vector reflects both the token identity and surrounding text.`
    },
    {
      step: "7. Produce retrieval embeddings when needed",
      detailMD: `For search, a separate embedding model converts each chunk or query into a sentence or document vector. Those vectors are normalized or otherwise prepared for similarity search, then stored with metadata in a vector database.`
    },
    {
      step: "8. Retrieve and fit context into the prompt",
      detailMD: `At query time the system embeds the query, retrieves similar chunks, and adds selected text to the prompt. The final prompt still has to be tokenized, counted, and budgeted against the context window and expected output length.`
    }
  ],
  deepDives: [
    {
      label: "Why not tokenize by words",
      detailMD: `A word tokenizer needs a huge vocabulary to cover names, compounds, misspellings, languages with rich morphology, and code identifiers. Unknown words become a serious failure mode. It also handles punctuation and whitespace poorly unless many special cases are added.

Subword tokenization avoids most unknowns while keeping sequences much shorter than characters. It can represent tokenization as token plus ization, or split a rare identifier into meaningful fragments. The result is not perfect semantics, but it is a robust engineering compromise.`
    },
    {
      label: "Why token count controls product cost",
      detailMD: `LLM providers price and limit requests in tokens because tokens drive computation. Input tokens consume context window space and prompt-processing compute. Output tokens require iterative generation work and usually affect latency directly.

A rough English heuristic is that one token is about four characters or about three quarters of a word. This is only a planning estimate. Non-English text, emojis, tables, dense punctuation, and source code can use more tokens per visible character, so production systems should count with the exact model tokenizer.`
    },
    {
      label: "Embedding geometry and cosine similarity",
      detailMD: `An embedding vector is useful because distance in the vector space often correlates with semantic relatedness. Queries about password reset should land near documents about account recovery, even if the exact words differ.

Cosine similarity compares vector directions. It is popular in retrieval because two vectors can point in a similar semantic direction even if their magnitudes differ. Many vector databases optimize for cosine similarity, dot product, or Euclidean distance, and the embedding model documentation tells you which metric to use.`
    },
    {
      label: "Tokenizer choices affect truncation quality",
      detailMD: `When a prompt is too long, truncation is not just removing characters. It removes tokens, and token boundaries can split words, code, or structured data in awkward places if truncation is naive.

Good systems truncate at semantic boundaries: whole messages, sections, JSON fields, paragraphs, or document chunks. They reserve output space first, then allocate the remaining token budget to system instructions, user input, conversation history, retrieved chunks, and tool results.`
    }
  ],
  productionConsiderations: [
    {
      label: "Use the exact tokenizer for budgeting",
      detailMD: `Do not estimate production limits with word counts alone. Use the tokenizer for the target model to count messages after chat formatting, tool schemas, retrieved chunks, and hidden control tokens. Keep a safety margin for output and for provider-specific wrapping.`
    },
    {
      label: "Version tokenizers and embedding models",
      detailMD: `Tokenizer changes can alter token ids and prompt length. Embedding model changes can alter vector dimension, distance distribution, and nearest-neighbor rankings. Store model name, tokenizer version, embedding dimension, and normalization policy with every indexed corpus.`
    },
    {
      label: "Design truncation as a product behavior",
      detailMD: `A system that silently drops the wrong context can become incorrect or unsafe. Prefer explicit policies: preserve system instructions, keep recent user intent, rank retrieved chunks, summarize old history, and log how many tokens were removed from each category.`
    },
    {
      label: "Plan for multilingual and code-heavy workloads",
      detailMD: `The four-character heuristic is English-centric. Some languages and many code or log formats tokenize less efficiently. Capacity planning, chunk size, and cost estimates should be based on representative traffic, not only English prose examples.`
    }
  ],
  interview: {
    whatInterviewersLookFor: [
      "A precise explanation that models consume token ids, not words or raw strings.",
      "Correct understanding of BPE-style vocabulary learning and why subwords are the dominant compromise.",
      "Ability to connect token count to pricing, context limits, latency, and truncation behavior.",
      "Clear separation between token embeddings inside a transformer and sentence or document embeddings used for retrieval."
    ],
    followUps: [
      {
        question: "How does BPE handle a word it has never seen before?",
        answerMD: `BPE breaks the word into known subword units by applying learned merge rules. With byte-level BPE, it can always fall back to byte tokens, so there is no unknown token for arbitrary input. The model may still understand rare strings poorly, but they remain representable.`
      },
      {
        question: "Why does a 10 page English document and a 10 page code file not necessarily cost the same?",
        answerMD: `Cost follows token count, not page count. Code has punctuation, indentation, rare identifiers, symbols, and short fragments that may tokenize into many pieces. Some non-English text and mixed-format logs also tokenize less efficiently than plain English prose, so exact tokenizer counting is required.`
      },
      {
        question: "What is the difference between contextual token embeddings and retrieval embeddings?",
        answerMD: `Contextual token embeddings are internal transformer states that change with surrounding tokens and are used by the model to continue computation. Retrieval embeddings are usually one vector per sentence, passage, or document, trained so semantically similar text is close for search. They serve different objectives.`
      }
    ],
    alternativeDesigns: [
      {
        name: "Word-level tokenization",
        detailMD: `A word-level tokenizer is easy to explain and can be efficient for common words, but it fails on rare words, names, misspellings, many languages, and code. It also requires an enormous vocabulary or an unknown-token escape hatch. Subword tokenization is more robust.`
      },
      {
        name: "Character-level tokenization",
        detailMD: `Character-level tokenization has tiny vocabulary and full coverage, but sequences become much longer. Longer sequences increase attention cost, reduce effective context, and make it harder for the model to learn higher-level units. It is simple but often too expensive for general LLMs.`
      }
    ],
    commonMistakes: [
      "Saying tokens are always words, when many tokens are subwords, spaces, punctuation, or bytes.",
      "Using word count as an exact cost estimate instead of counting with the model tokenizer.",
      "Treating word2vec-style static embeddings and transformer contextual states as the same thing.",
      "Assuming a vector database stores the chat model internal token embeddings rather than embeddings from a retrieval model."
    ]
  },
  interviewHints: [
    "Start with the pipeline: text, tokens, ids, embedding lookup, transformer vectors.",
    "Explain subword tokenization as the compromise between unknown words and long character sequences.",
    "Mention that pricing and context windows are measured in tokens, then give the English heuristic.",
    "Separate internal model embeddings from retrieval embeddings used in RAG."
  ],
  comparisons: [
    {
      title: "Tokenization granularity tradeoffs",
      columns: ["Granularity", "Strength", "Weakness", "Typical use"],
      rows: [
        ["Word", "Short sequences for common words", "Large vocabulary and unknown-word problems", "Simple NLP baselines"],
        ["Character", "Tiny vocabulary and full coverage", "Very long sequences and higher attention cost", "Specialized models or fallback logic"],
        ["Subword", "Robust coverage with moderate sequence length", "Token boundaries are not always intuitive", "Modern LLM tokenizers"]
      ]
    },
    {
      title: "Embedding types",
      columns: ["Type", "Representation", "Context sensitivity", "Common use"],
      rows: [
        ["Static word embeddings", "One vector per word type", "No, same vector in every sentence", "Classic NLP features and similarity"],
        ["Transformer token states", "One vector per token position", "Yes, changes with neighboring tokens", "Internal model computation"],
        ["Sentence or document embeddings", "One vector per text span", "Usually trained for span-level meaning", "Vector search, clustering, and RAG"]
      ]
    },
    {
      title: "Tokenizer families",
      columns: ["Tokenizer", "Core idea", "Coverage behavior", "Where it appears"],
      rows: [
        ["BPE", "Merge frequent adjacent pairs", "Depends on starting symbols", "GPT-style tokenizers"],
        ["Byte-level BPE", "Run BPE from byte symbols", "Can represent arbitrary input", "Many modern generative models"],
        ["WordPiece", "Choose subwords by likelihood benefit", "Uses known pieces and continuation markers", "BERT-style encoders"],
        ["SentencePiece", "Train from raw text without space pre-tokenization", "Works well across languages", "Multilingual and encoder-decoder models"]
      ]
    }
  ],
  decisionGuideMD: `## How to use tokenization and embeddings in system design

Use the **exact model tokenizer** whenever you budget prompts, chunk documents, or estimate cost. A rough heuristic is useful for early planning, but production code should count final formatted requests, including system messages, tool schemas, retrieved context, and expected output room.

Use **semantic chunking by token count** for RAG. Choose chunk sizes that preserve meaning, include small overlaps when needed, and avoid cutting through tables, JSON objects, code blocks, or policy statements. Store the token count with each chunk so retrieval can fit a bounded prompt.

Use a **retrieval embedding model** for vector search, not the chat model hidden states. Match the vector database metric to the embedding model recommendation, and re-index when you change embedding model, dimension, normalization, or chunking policy.

Use **truncation policies** that protect correctness. Keep system instructions and current user intent, rank retrieved chunks by relevance, summarize old conversation when possible, and log what was removed so quality issues can be debugged.`,
  handsOn: [
    {
      title: "Estimate a prompt budget before calling a model",
      detailMD: `This quick estimator uses the English planning heuristic, then reserves output tokens before deciding whether the prompt fits. Production code should replace the heuristic with the exact tokenizer for the selected model.`,
      code: {
        language: "python",
        label: "prompt_budget.py",
        body: `def rough_english_tokens(text):
    by_chars = round(len(text) / 4)
    by_words = round(len(text.split()) / 0.75)
    return max(1, max(by_chars, by_words))


def budget_prompt(system_text, user_text, retrieved_chunks, max_context, expected_output):
    prompt_text = system_text + "\\n" + user_text + "\\n" + "\\n".join(retrieved_chunks)
    prompt_tokens = rough_english_tokens(prompt_text)
    available_for_prompt = max_context - expected_output
    return {
        "prompt_tokens_estimate": prompt_tokens,
        "available_for_prompt": available_for_prompt,
        "fits": prompt_tokens <= available_for_prompt,
        "tokens_to_remove": max(0, prompt_tokens - available_for_prompt),
    }

chunks = ["Account recovery policy for locked users.", "Password reset audit requirements."]
result = budget_prompt("Answer with citations.", "How do I reset access?", chunks, 4096, 512)
print(result)`
      }
    },
    {
      title: "Simulate one BPE merge step",
      detailMD: `This tiny example shows the training idea behind BPE: count adjacent pairs and merge the most frequent one. Real tokenizers add normalization, byte handling, special tokens, and many thousands of merge steps.`,
      code: {
        language: "python",
        label: "bpe_merge_demo.py",
        body: `from collections import Counter


def adjacent_pairs(tokens):
    counts = Counter()
    for token in tokens:
        for index in range(len(token) - 1):
            pair = (token[index], token[index + 1])
            counts[pair] += 1
    return counts


def merge_pair(token, pair):
    merged = []
    index = 0
    while index < len(token):
        if index < len(token) - 1 and (token[index], token[index + 1]) == pair:
            merged.append(token[index] + token[index + 1])
            index += 2
        else:
            merged.append(token[index])
            index += 1
    return merged

corpus = [list("lowest"), list("lower"), list("newest"), list("newer")]
best_pair = adjacent_pairs(corpus).most_common(1)[0][0]
updated = [merge_pair(token, best_pair) for token in corpus]
print("best pair", best_pair)
print(updated)`
      }
    }
  ],
  quiz: [
    {
      question: "What does an LLM consume after tokenization?",
      options: [
        "Raw words with spaces preserved as separate model objects",
        "A sequence of integer token ids",
        "Only sentence-level vectors stored in a vector database",
        "A list of grammar rules"
      ],
      answerIndex: 1,
      explanationMD: `The tokenizer maps text into tokens and then ids. The embedding layer turns those ids into dense vectors for the transformer.`
    },
    {
      question: "Why do modern LLMs usually use subword tokens instead of pure word tokens?",
      options: [
        "Subwords remove the need for an embedding matrix",
        "Subwords are a compromise between unknown-word coverage and sequence length",
        "Subwords make every language use exactly the same number of tokens",
        "Subwords prevent the model from seeing punctuation"
      ],
      answerIndex: 1,
      explanationMD: `Subword tokenizers can represent rare words and unusual strings while keeping sequences much shorter than character-level tokenization.`
    },
    {
      question: "What is the core training idea of BPE tokenization?",
      options: [
        "Repeatedly merge frequent adjacent pairs to build a vocabulary",
        "Assign one token to every dictionary word and discard unknowns",
        "Use cosine similarity to rank documents",
        "Generate the next token with a softmax"
      ],
      answerIndex: 0,
      explanationMD: `BPE starts from small symbols and repeatedly adds frequent adjacent merges until it reaches the target vocabulary size.`
    },
    {
      question: "Why does token count matter in production LLM systems?",
      options: [
        "It only affects how text is displayed in the browser",
        "It determines GPU brand selection but not request behavior",
        "Pricing, context limits, prompt truncation, and latency are tied to tokens",
        "It replaces the need for monitoring"
      ],
      answerIndex: 2,
      explanationMD: `Providers price and limit requests by tokens because tokens drive prompt processing, generation work, and context-window usage.`
    },
    {
      question: "What does the embedding matrix do?",
      options: [
        "It maps token ids to learned dense vectors",
        "It merges frequent byte pairs during tokenizer training",
        "It stores retrieved documents by URL only",
        "It converts cosine similarity into markdown"
      ],
      answerIndex: 0,
      explanationMD: `The embedding matrix has one learned row per token id. Lookup converts ids into vectors with the model hidden dimension.`
    },
    {
      question: "Which statement best describes retrieval embeddings in RAG?",
      options: [
        "They are always the raw token embeddings from the chat model first layer",
        "They are usually sentence or document vectors trained for semantic search",
        "They are special padding tokens used to fill batches",
        "They are merge rules stored in the tokenizer vocabulary"
      ],
      answerIndex: 1,
      explanationMD: `RAG systems usually index one vector per chunk using a retrieval embedding model, then search for vectors close to the query vector.`
    }
  ],
  flashcards: [
    { front: "What is a token?", back: "A tokenizer vocabulary item that may be a word, subword, punctuation mark, whitespace pattern, byte sequence, or code fragment." },
    { front: "Why use subword tokens?", back: "They balance coverage and efficiency: fewer unknowns than word tokens and shorter sequences than character tokens." },
    { front: "What does BPE learn?", back: "A vocabulary and merge rules created by repeatedly merging frequent adjacent pairs in training text." },
    { front: "What is byte-level BPE?", back: "A BPE variant that starts from bytes so any input text can be represented without an unknown token." },
    { front: "What are special tokens?", back: "Reserved ids for control meanings such as beginning of sequence, end of sequence, separators, roles, or padding." },
    { front: "What does the embedding matrix do?", back: "It maps each token id to a learned dense vector used as the transformer input." },
    { front: "What is cosine similarity used for?", back: "Comparing embedding vector directions, often for semantic similarity search in retrieval systems." },
    { front: "How are retrieval embeddings different from token embeddings?", back: "Retrieval embeddings represent spans for search, while token embeddings and contextual states are internal to model computation." }
  ],
  cheatSheetMD: `## Tokenization and embeddings cheat sheet

### Text to ids
1. Raw text enters the tokenizer.
2. The tokenizer applies vocabulary and merge rules.
3. Tokens map to integer ids.
4. Special tokens may mark boundaries, roles, separators, end of sequence, or padding.
5. Token ids index rows in the embedding matrix.
6. The model receives dense vectors, not words.

### Tokenization facts
- A token is not necessarily a word.
- Subword tokenization balances vocabulary size and sequence length.
- BPE learns by merging frequent adjacent pairs.
- Byte-level BPE can represent arbitrary input through byte fallback.
- WordPiece and SentencePiece are related subword approaches used by many encoder and multilingual models.
- Tokenizer and model versions are linked because ids must match learned embedding rows.

### Token budget facts
- Providers price and limit requests in tokens.
- Context windows are measured in tokens.
- A rough English estimate is one token per four characters or about three quarters of a word.
- Non-English text, code, logs, emojis, and punctuation-heavy data can tokenize less efficiently.
- Always reserve output tokens before filling the prompt.
- Truncate by semantic units, not arbitrary characters.

### Embedding facts
- The embedding matrix has shape vocabulary size by hidden size.
- Rows are learned during training.
- Similar contexts push representations into useful semantic geometry.
- Cosine similarity compares vector direction and is common in retrieval.
- Static embeddings assign one vector per word type.
- Transformer contextual states change with surrounding tokens.
- Sentence and document embeddings are used for vector search and RAG.

### RAG connection
- Chunk documents with token budgets in mind.
- Embed chunks with a retrieval embedding model.
- Store vectors and metadata in a vector database.
- Embed the query, retrieve similar chunks, then place selected text into the prompt.
- The final prompt is still tokenized, priced, truncated, and limited by the generation model context window.`,
  references: [
    { title: "Neural Machine Translation of Rare Words with Subword Units", kind: "Paper", url: "https://arxiv.org/abs/1508.07909", author: "Sennrich et al." },
    { title: "SentencePiece: A simple and language independent subword tokenizer and detokenizer for Neural Text Processing", kind: "Paper", url: "https://arxiv.org/abs/1808.06226", author: "Kudo and Richardson" },
    { title: "GloVe: Global Vectors for Word Representation", kind: "Paper", url: "https://aclanthology.org/D14-1162/", author: "Pennington et al." },
    { title: "tiktoken", kind: "Docs", url: "https://github.com/openai/tiktoken", author: "OpenAI" }
  ],
  relatedLessons: [
    { slug: "transformer-architecture", note: "Shows how token embeddings become the hidden states processed by transformer blocks." },
    { slug: "context-windows-and-kv-cache", note: "Explains why token count and long context affect memory, latency, and serving behavior." },
    { slug: "design-rag-pipeline", note: "Applies document chunking and retrieval embeddings to end-to-end grounded generation." },
    { slug: "design-vector-database", note: "Goes deeper on storing, indexing, and searching embedding vectors at scale." }
  ]
};
