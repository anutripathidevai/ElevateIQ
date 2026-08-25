import type { LabContent } from "../types";

/**
 * Lab 4 — RAG Pipeline.
 *
 * Teaches chunking, retrieval, context injection, and citations by running a
 * complete local RAG-style pipeline over a fictional HTTP cache document.
 */
export const ragPipelineContent: LabContent = {
  slug: "rag-pipeline",

  overviewMD: `
## What is RAG?

Retrieval-Augmented Generation (RAG) is the standard pattern for making an AI
answer from **your documents** instead of only from the model's training data. The
system first retrieves relevant context, then gives that context to the model with
the user's question, and finally asks for a grounded answer.

This lab runs that pipeline locally over a fictional product document for the
Photon HTTP cache. You will split the document into chunks, embed each chunk,
retrieve the most relevant chunks for a question, and synthesize an answer with
citations back to the retrieved context.

## The core problem

LLMs have context limits and do not automatically know your private or changing
knowledge. Dumping an entire knowledge base into every prompt is expensive,
slow, and often impossible. RAG solves this by selecting a small, relevant slice
of context at request time.

## Where it is used

- Documentation assistants and enterprise knowledge search
- Customer support copilots grounded in help-center articles
- Legal, finance, and policy Q&A over controlled source material
- Codebase assistants that answer from repository files and symbols
`.trim(),

  whatYouBuild: [
    "A chunker that splits one source document into overlapping word windows",
    "A local embedding index for the document chunks",
    "A top-K retriever that ranks chunks against the user's question",
    "An extractive answer that stitches retrieved sentences together",
    "Citation markers that map the answer back to retrieved chunk ids",
  ],

  architecture: {
    title: "The RAG request path",
    flow: [
      "[ Source document ]",
      "        | chunk size + overlap",
      "        v",
      "[ Chunk document ] -> [ Embed chunks ]",
      "                              |",
      "[ User question ] -> [ Embed question ]",
      "                              | cosine similarity",
      "                              v",
      "                       [ Retrieve top-K ]",
      "                              |",
      "                              v",
      "              [ Grounded answer + citations ]",
    ].join("\n"),
    nodes: [
      {
        id: "source-document",
        label: "Source document",
        whatMD: `
The single editable document the demo treats as its knowledge base: a product note
about Photon, a fictional HTTP cache.
`.trim(),
        whyMD: `
RAG starts from source material. The answer should be grounded in this text, not
invented from the model's general memory.
`.trim(),
        input: "A user-editable text document",
        output: "Raw words ready for chunking",
        commonFailure:
          "Letting stale or untrusted documents into the corpus without ownership, timestamps, or permissions.",
        interviewQuestion:
          "What metadata should you keep with documents before putting them into a RAG index?",
      },
      {
        id: "chunker",
        label: "Chunk document",
        whatMD: `
The document is split into overlapping word windows using the selected chunk size
and overlap controls.
`.trim(),
        whyMD: `
Chunks keep retrieval precise and keep prompts small. Overlap protects sentences
or ideas that straddle a boundary between two chunks.
`.trim(),
        input: "Source text + chunk size + overlap",
        output: "Ordered chunks with ids and word counts",
        commonFailure:
          "Chunks that are too large retrieve irrelevant context, while chunks that are too small lose meaning.",
        interviewQuestion:
          "How do chunk size and overlap affect RAG quality and cost?",
      },
      {
        id: "chunk-embeddings",
        label: "Embed chunks",
        whatMD: `
Each chunk becomes a vector using the same local trigram-hash embedding used in
the semantic-search lab.
`.trim(),
        whyMD: `
Chunk vectors are the searchable index. In production they are precomputed and
stored so each question only embeds the query.
`.trim(),
        input: "Chunk text",
        output: "One vector per chunk",
        commonFailure:
          "Forgetting to re-embed chunks after the source document changes, so retrieval serves old context.",
        interviewQuestion:
          "When documents change, how do you keep a vector index fresh?",
      },
      {
        id: "retriever",
        label: "Retrieve top-K",
        whatMD: `
The question is embedded, scored against every chunk vector with cosine
similarity, and the top-K chunks are selected as context.
`.trim(),
        whyMD: `
The retriever is the gatekeeper for answer quality. If the right evidence is not
retrieved, the answer layer cannot reliably recover.
`.trim(),
        input: "Question vector + chunk vectors + top-K",
        output: "Ranked retrieved chunks with scores",
        commonFailure:
          "Using top-K blindly without thresholds, filters, or reranking, so weak context still gets injected.",
        interviewQuestion:
          "Why is retrieval quality often the bottleneck in RAG systems?",
      },
      {
        id: "grounded-answer",
        label: "Grounded answer",
        whatMD: `
The demo stitches leading sentences from retrieved chunks and appends citation
markers that point back to the retrieved context list.
`.trim(),
        whyMD: `
Citations make the answer inspectable. A user can verify what evidence was used
instead of trusting a fluent paragraph with no source trail.
`.trim(),
        input: "Retrieved chunks + question",
        output: "Extractive answer with citation markers",
        commonFailure:
          "Generating a confident answer without requiring it to cite retrieved evidence.",
        interviewQuestion:
          "How do citations reduce hallucination risk, and what can they not guarantee?",
      },
    ],
  },

  demo: "rag-pipeline",

  executionMD: `
## What the execution trace shows

Each run records the complete local RAG path:

1. **Chunk document** — the source text is split into overlapping word windows.
2. **Embed chunks** — every chunk is converted into a local vector.
3. **Embed question** — the user's question becomes a vector in the same space.
4. **Retrieve top-K** — chunks are ranked by cosine similarity and trimmed to K.
5. **Synthesize grounded answer** — leading sentences from retrieved chunks are
   stitched into an extractive answer with citation markers.

In a hosted RAG system, the final step would usually call an LLM with the retrieved
context injected into the prompt. This demo keeps the answer extractive so you can
see exactly which retrieved text produced each citation.
`.trim(),

  learnMD: `
## RAG is retrieval first, generation second

The most important RAG lesson is that the model can only answer from the context
you give it. If retrieval misses the relevant passage, a generative model may
hallucinate or answer from stale general knowledge. That is why chunking,
metadata, ranking, and evaluation matter as much as prompt wording.

## Chunking and overlap

A chunk is a retrieval unit. Large chunks preserve context but may include
irrelevant material. Small chunks are precise but can lose the sentence before or
after the key fact. Overlap repeats a few words between adjacent chunks so facts
that cross a boundary are still retrievable.

## Context injection

After retrieval, the application builds a prompt that contains the user's question
and the retrieved chunks. A good prompt tells the model to answer only from that
context, cite sources, and say when the answer is not present. The prompt should
also keep chunk ids or source metadata so citations can survive generation.

## Citations and groundedness

A citation is not decoration; it is the contract between answer and evidence. The
best systems make each claim traceable to a source chunk. Citations reduce
hallucination risk and make review possible, but they do not prove the cited text
is true, current, or permissioned — your ingestion pipeline still owns that.

## Production concerns

Real RAG adds document permissions, freshness, chunk metadata, reranking, answer
validation, and evaluation sets. You track retrieval recall, groundedness,
latency, and cost. When quality drops, debug the stages separately: ingestion,
chunking, embeddings, retrieval, prompt construction, and answer synthesis.
`.trim(),

  challenge: {
    promptMD: `
Add a **no-answer path** to this RAG design.

A production assistant should not always answer. Design a policy for when the
retrieved context is too weak or irrelevant:

1. What threshold or signal tells you retrieval failed?
2. What should the assistant say instead of guessing?
3. What telemetry would you log so the missing knowledge can be fixed?
`.trim(),
    hints: [
      "Look at both the top score and the gap between the best and worst retrieved chunks.",
      "A safe fallback says the answer was not found in the provided sources and suggests the next action.",
      "Log the question, retrieved ids, scores, and whether the user marked the answer helpful.",
    ],
    expectedApproachMD: `
A strong answer adds a retrieval-confidence gate before synthesis:

- Compute a minimum acceptable score for the top chunk and optionally require a
  meaningful margin over lower-ranked chunks.
- If retrieval is weak, do not call the answer step. Return a grounded fallback:
  "I could not find this in the provided Photon document." Offer to broaden the
  search or route to a human/source owner.
- Log the question, top-K chunk ids, scores, fallback reason, and user feedback so
  the team can improve docs, chunking, or embeddings.

The key is that abstaining is a feature. A RAG system that knows when not to
answer is safer than one that fills every gap with confident prose.
`.trim(),
  },

  interviewQuestions: [
    {
      id: "rag-q1",
      question: "What is Retrieval-Augmented Generation, and why use it?",
      difficulty: "Beginner",
      answerMD: `
RAG is a pattern where the application retrieves relevant documents or chunks for
a user question, injects that context into the model prompt, and asks the model to
answer from the retrieved evidence. It is used when answers must reflect private,
recent, or large knowledge that is not reliably contained in the model's training
data.
`.trim(),
      keyPoints: [
        "Retrieve relevant context before generation",
        "Inject context into the prompt",
        "Ground answers in private or changing knowledge",
        "Avoid sending an entire corpus to every request",
      ],
      followUps: [
        "What happens if retrieval misses the right document?",
        "How is RAG different from fine-tuning?",
      ],
    },
    {
      id: "rag-q2",
      question: "How do chunk size and overlap affect a RAG pipeline?",
      difficulty: "Intermediate",
      answerMD: `
Chunk size controls the retrieval unit. Large chunks preserve more surrounding
context but increase prompt cost and may dilute relevance. Small chunks are
precise but can split an idea across boundaries. Overlap repeats neighbouring
words so boundary-crossing facts remain retrievable, but too much overlap creates
near-duplicate chunks and wastes tokens.
`.trim(),
      keyPoints: [
        "Large chunks preserve context but add noise and cost",
        "Small chunks improve precision but can lose meaning",
        "Overlap protects boundary facts",
        "Too much overlap causes duplicates and higher token usage",
      ],
      followUps: [
        "Would you chunk code, policy docs, and FAQs the same way?",
        "How would you evaluate the best chunk size?",
      ],
    },
    {
      id: "rag-q3",
      question: "Why are citations important in grounded AI answers?",
      difficulty: "Intermediate",
      answerMD: `
Citations connect claims in the answer back to retrieved evidence. They let users
inspect sources, help developers debug whether retrieval or generation failed,
and discourage unsupported claims. They do not guarantee the source is correct or
current; ingestion, permissions, and source governance still matter.
`.trim(),
      keyPoints: [
        "Claims should trace back to evidence",
        "Users can inspect and trust-but-verify",
        "Developers can debug retrieval versus generation",
        "Citations do not prove source quality",
      ],
      followUps: [
        "How would you cite multiple chunks for one claim?",
        "How do you prevent fake citations?",
      ],
    },
    {
      id: "rag-q4",
      question: "How do you reduce hallucinations in a RAG system?",
      difficulty: "Advanced",
      answerMD: `
Reduce hallucinations by improving retrieval recall, filtering by permissions and
metadata, reranking candidates, and prompting the model to answer only from the
provided context. Add an abstention path when retrieval confidence is low, require
citations for factual claims, and validate outputs with groundedness checks or
human review for high-risk domains.
`.trim(),
      keyPoints: [
        "Improve retrieval and reranking",
        "Constrain the prompt to provided context",
        "Abstain when evidence is weak",
        "Require citations and evaluate groundedness",
      ],
      followUps: [
        "What signals would trigger abstention?",
        "How would you test groundedness automatically?",
      ],
    },
    {
      id: "rag-q5",
      question: "Design a production RAG architecture for enterprise documents.",
      difficulty: "Advanced",
      answerMD: `
Ingest documents with ownership, timestamps, permissions, and source URLs; clean
and chunk them; embed chunks asynchronously; store vectors with metadata; retrieve
with permission filters and top-K search; rerank candidates; build a prompt with
chunk ids; generate or extract an answer with citations; and log retrieval,
latency, token cost, feedback, and groundedness metrics. Add re-indexing when
documents or embedding models change.
`.trim(),
      keyPoints: [
        "Ingestion keeps metadata and permissions",
        "Chunk and embed asynchronously",
        "Retrieve, filter, rerank, then inject context",
        "Observe quality, latency, cost, and freshness",
      ],
      followUps: [
        "How do you enforce document-level permissions at retrieval time?",
        "How would you migrate to a new embedding model?",
      ],
    },
  ],
};
