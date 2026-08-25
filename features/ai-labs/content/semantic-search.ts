import type { LabContent } from "../types";

/**
 * Lab 3 — Semantic Search.
 *
 * Teaches embeddings, vectors, cosine similarity, and top-K ranking by running a
 * real local vector search over a small software-engineering corpus.
 */
export const semanticSearchContent: LabContent = {
  slug: "semantic-search",

  overviewMD: `
## What is semantic search?

Keyword search asks, "did the words match?" Semantic search asks, "is the meaning
close?" Instead of comparing raw text, each document and query is converted into
an **embedding** — a vector of numbers that places related ideas near each other.
Then the system ranks documents by vector similarity.

This lab searches a small software-engineering corpus about indexing, caching,
load balancing, queues, OAuth, pagination, rate limiting, sharding, CDNs, and
connection pooling. You will type a natural-language question, embed it, and rank
the corpus with real cosine similarity.

## The core problem

Users rarely phrase questions with the exact words your documents use. Someone
may ask "how do I make reads faster?" while the relevant page says "B-tree index"
or "connection pool". Semantic search gives the system a way to retrieve useful
context even when the vocabulary differs.

## Where it is used

- Documentation search and developer portals
- Support deflection and help-center answers
- Retrieval-Augmented Generation (RAG) pipelines — Lab 4
- Product search, recommendations, and duplicate detection
`.trim(),

  whatYouBuild: [
    "A fixed corpus of ten engineering documents embedded into vectors",
    "A query embedding created from the user's natural-language question",
    "Real cosine similarity scoring and top-K ranking",
    "A side-by-side keyword baseline that counts exact token hits",
    "A live execution trace showing embedding, scoring, and token estimates",
  ],

  architecture: {
    title: "How semantic search ranks by meaning",
    flow: [
      "[ Query text ]",
      "      |",
      "      v",
      "[ Embed query ] -------------------.",
      "                                  | cosine similarity",
      "[ Corpus documents ] -> [ Embed corpus ] -> [ Score + rank ]",
      "                                                    |",
      "                                         top-K semantic results",
      "                                                    |",
      "                           optional exact-token keyword ranking",
    ].join("\n"),
    nodes: [
      {
        id: "corpus",
        label: "Corpus",
        whatMD: `
The searchable collection: ten short documents with an id, title, and text. In a
real product this could be docs pages, tickets, product records, or code chunks.
`.trim(),
        whyMD: `
Search quality starts with the corpus. Each item needs stable identity and useful
text so the ranker can return something the UI can cite, open, or inspect.
`.trim(),
        input: "Fixed engineering documents",
        output: "Document ids, titles, and text",
        commonFailure:
          "Embedding noisy boilerplate or missing titles, so many documents look artificially similar.",
        interviewQuestion:
          "What document text should you embed: title only, body only, or both, and why?",
      },
      {
        id: "document-embeddings",
        label: "Embed corpus",
        whatMD: `
Each document's title and body are transformed into a numeric vector using the
local trigram-hash embedding helper.
`.trim(),
        whyMD: `
Vectors make text comparable with math. Once documents are embedded, a query can
be ranked against the whole collection using the same representation.
`.trim(),
        input: "title + text for each document",
        output: "One vector per corpus document",
        commonFailure:
          "Recomputing every document vector on every request instead of precomputing and storing them.",
        interviewQuestion:
          "Where would you store document embeddings in a production search system?",
      },
      {
        id: "query-embedding",
        label: "Embed query",
        whatMD: `
The user's question is embedded with the exact same function as the documents so
both live in one vector space.
`.trim(),
        whyMD: `
Similarity only means something when the query and documents use a compatible
embedding model, dimensionality, and normalization strategy.
`.trim(),
        input: "Natural-language query",
        output: "One query vector",
        commonFailure:
          "Embedding the query with a different model version than the documents, making scores meaningless.",
        interviewQuestion:
          "Why must query and document embeddings come from the same model family?",
      },
      {
        id: "cosine-rank",
        label: "Score + rank",
        whatMD: `
The demo computes cosine similarity between the query vector and each document
vector, sorts descending, and keeps the top-K results selected by the slider.
`.trim(),
        whyMD: `
Cosine similarity measures direction rather than raw magnitude, which is why it is
a common default for normalized embedding search.
`.trim(),
        input: "Query vector + document vectors + top-K",
        output: "Ranked semantic results with scores",
        commonFailure:
          "Treating cosine scores as calibrated probabilities instead of relative ranking signals.",
        interviewQuestion:
          "What does a cosine similarity score mean, and what does it not mean?",
      },
      {
        id: "keyword-baseline",
        label: "Keyword baseline",
        whatMD: `
When enabled, the demo also counts how many query tokens appear exactly in each
document and shows that ranking beside the semantic result list.
`.trim(),
        whyMD: `
A baseline makes the trade-off visible: exact matching is simple and explainable,
but it misses related wording that embeddings can still retrieve.
`.trim(),
        input: "Tokenized query and tokenized documents",
        output: "Exact-token hit counts",
        commonFailure:
          "Shipping vector search without a lexical baseline or hybrid fallback, then losing obvious exact matches.",
        interviewQuestion:
          "When would you combine keyword search with vector search instead of choosing one?",
      },
    ],
  },

  demo: "semantic-search",

  executionMD: `
## What the execution trace shows

Each run records the local vector-search pipeline:

1. **Embed corpus** — all ten document titles and bodies become vectors.
2. **Embed query** — the user's question is embedded into the same vector space.
3. **Score & rank (cosine)** — every document is scored against the query vector,
   sorted, and trimmed to the selected top-K.
4. **Compare keyword ranking** — when enabled, an exact-token baseline is computed
   so you can compare semantic retrieval with lexical matching.

There is no network request and no hosted model in this demo. The embedding is a
small deterministic trigram-hash vector, but the mechanics are the same ones you
use with neural embeddings: precompute document vectors, embed the query, compute
similarity, and return the nearest neighbours.
`.trim(),

  learnMD: `
## Embeddings are coordinates for text

An embedding turns text into a list of numbers. You can think of that list as a
point in a high-dimensional map where nearby points tend to mean related things.
Real embedding models learn that map from data; this lab uses a tiny local hash
embedding so the whole pipeline is inspectable in the browser.

## Cosine similarity

Cosine similarity compares the angle between two vectors. If two vectors point in
a similar direction, their score is close to 1. If they are unrelated, the score is
lower. Because many embedding systems normalize vector length, cosine is a strong
first choice for ranking text by meaning.

## Top-K and kNN

A search engine usually does not need every score; it needs the best few. Top-K
retrieval means "return the K nearest neighbours." With ten documents the demo can
score everything directly. At production scale you use an approximate nearest
neighbour index so millions of vectors can be searched quickly.

## Semantic is not always better

Keyword search is excellent for exact identifiers: error codes, function names,
URLs, product SKUs. Semantic search is excellent when users phrase intent in many
ways. Production systems often use **hybrid search**: lexical retrieval catches
exact matches, vector retrieval catches meaning, and a reranker blends the two.

## Why this leads to RAG

RAG starts with retrieval. Before a model can answer from your private documents,
you must find the right chunks. Semantic search is that retrieval step without the
answer-generation layer added yet.
`.trim(),

  challenge: {
    promptMD: `
Improve the search experience for a production documentation site.

Design a **hybrid search** strategy that combines exact keyword matching with
vector similarity for pages that contain API names, conceptual explanations, and
error codes. Decide:

1. Which fields you embed and which fields you keep lexical.
2. How you merge or rerank keyword and vector candidates.
3. What score, title, and snippet you show so users can trust the result.
`.trim(),
    hints: [
      "Keep exact identifiers searchable with lexical matching; embeddings can blur short codes and names.",
      "Retrieve more candidates than you show, then rerank with a weighted blend or a cross-encoder.",
      "Expose snippets and source titles; raw vector scores alone are not user-facing explanations.",
    ],
    expectedApproachMD: `
A strong answer keeps both retrieval modes and gives each a job:

- Embed titles plus meaningful body chunks for semantic recall.
- Index exact fields like endpoint names, error codes, and function names with a
  lexical search engine.
- Retrieve candidates from both systems, de-duplicate by document id, then rerank
  with a weighted score or a learned reranker.
- Show the final title, snippet, and source location. Keep internal scores for
  debugging, but explain results with matched text and document context.

That design preserves exact-match reliability while gaining the semantic recall
this demo demonstrates.
`.trim(),
  },

  interviewQuestions: [
    {
      id: "ss-q1",
      question: "What is an embedding, and why is it useful for search?",
      difficulty: "Beginner",
      answerMD: `
An embedding is a numeric vector representation of text. It is useful because it
lets a search system compare meaning with vector math instead of relying only on
exact word overlap. Documents and queries embedded into the same space can be
ranked by similarity, so related wording can be found even when the user does not
use the document's exact terms.
`.trim(),
      keyPoints: [
        "Text becomes a vector of numbers",
        "Query and documents must share the same embedding space",
        "Similarity ranking can find related wording",
        "Embeddings complement, not replace, lexical search",
      ],
      followUps: [
        "What kinds of queries still need keyword search?",
        "How would you evaluate whether an embedding model is good enough?",
      ],
    },
    {
      id: "ss-q2",
      question: "How does cosine similarity work for vector search?",
      difficulty: "Intermediate",
      answerMD: `
Cosine similarity measures the angle between two vectors. If the vectors point in
a similar direction, the score is high; if they point in different directions, the
score is low. For normalized embeddings it is a common ranking metric because it
focuses on direction rather than vector length. The score is best treated as a
relative ranking signal, not a probability that the answer is correct.
`.trim(),
      keyPoints: [
        "Compares vector direction",
        "High score means closer in embedding space",
        "Works well with normalized embeddings",
        "Scores are relative, not calibrated truth",
      ],
      followUps: [
        "When might dot product or Euclidean distance be preferable?",
        "How do you choose a similarity threshold?",
      ],
    },
    {
      id: "ss-q3",
      question: "Why can semantic search beat keyword search, and where does it fail?",
      difficulty: "Intermediate",
      answerMD: `
Semantic search can beat keyword search when the user's wording differs from the
document's wording, because embeddings can place related concepts near each other.
It can fail on exact identifiers, rare names, numbers, and very short queries
where the precise token matters more than broad meaning. That is why many
production systems combine vector retrieval with lexical retrieval and reranking.
`.trim(),
      keyPoints: [
        "Better recall for paraphrases and concepts",
        "Weak on exact codes, names, and rare tokens",
        "Short queries can be ambiguous",
        "Hybrid search often wins in production",
      ],
      followUps: [
        "How would you debug a surprising semantic result?",
        "What metadata filters would you apply before vector ranking?",
      ],
    },
    {
      id: "ss-q4",
      question: "What changes when you scale top-K search from ten documents to millions?",
      difficulty: "Advanced",
      answerMD: `
With ten documents you can compute every cosine score. With millions, brute force
is too slow and expensive, so you precompute embeddings and store them in a vector
index that supports approximate nearest-neighbour search. You also need metadata
filters, batching, re-embedding jobs when documents or models change, and
observability for latency, recall, and drift.
`.trim(),
      keyPoints: [
        "Precompute and store document vectors",
        "Use approximate nearest-neighbour indexes",
        "Filter by metadata before or during retrieval",
        "Plan for model upgrades and re-embedding",
      ],
      followUps: [
        "How do HNSW and IVF indexes trade recall for speed?",
        "How do you roll out a new embedding model safely?",
      ],
    },
    {
      id: "ss-q5",
      question: "How would you evaluate semantic-search quality?",
      difficulty: "Advanced",
      answerMD: `
Build a labelled evaluation set of queries and relevant documents, then measure
retrieval metrics such as recall@K, precision@K, mean reciprocal rank, and nDCG.
Inspect failures by query type: exact identifier, conceptual, navigational, or
ambiguous. Pair offline metrics with production signals like clicks, reformulated
queries, dwell time, and user feedback, but avoid treating clicks as perfect truth.
`.trim(),
      keyPoints: [
        "Use labelled query-document pairs",
        "Measure recall@K, precision@K, MRR, and nDCG",
        "Segment failures by query type",
        "Combine offline eval with production behaviour",
      ],
      followUps: [
        "How do you collect labels without biasing toward current results?",
        "What is a good regression test for search relevance?",
      ],
    },
  ],
};
