import type { LabContent } from "../types";

/**
 * Lab 8 — AI Memory.
 *
 * Teaches how chat systems keep useful state across turns without sending the
 * entire conversation forever: recent turns stay verbatim, older turns are
 * summarized, durable facts are extracted, and the next prompt assembles all of
 * that into the model's context window.
 */
export const aiMemoryContent: LabContent = {
  slug: "ai-memory",

  overviewMD: `
## Why memory is more than chat history

A model does not remember you by itself. Every answer is generated from the text
you send in the current request. If you want an assistant to remember a user's
name, company, preferences, or earlier decisions, your application has to decide
what to keep, what to compress, and what to recall.

This lab shows the three practical layers behind memory:

- **Short-term memory** — the last few conversation turns kept verbatim.
- **Summarization** — older turns condensed so they still fit the context window.
- **Long-term memory** — durable facts extracted from messages and reattached to
  future prompts.
- **Recall** — answering a later question from stored facts, not from magic.

## Why it matters

Memory is what makes an AI product feel personal and continuous. It is also a
source of cost, privacy, and correctness risk. Sending every prior token is
expensive and eventually impossible; extracting the wrong fact creates creepy or
incorrect personalization. Good systems make memory explicit, inspectable, and
bounded.

## Where it is used

- Personal assistants that remember names, roles, and preferences
- Customer-support copilots that carry case history across turns
- Coding agents that summarize long work sessions
- Sales and onboarding assistants that recall account context
`.trim(),

  whatYouBuild: [
    "A chat that keeps a bounded short-term context window",
    "A deterministic long-term fact extractor for name, company, role, and preferences",
    "A summarizer that condenses older turns into one compact memory line",
    "A context viewer showing exactly what the model would receive",
    "A recall reply that answers from saved memory when recent turns no longer contain the fact",
  ],

  architecture: {
    title: "How memory is assembled for one reply",
    flow: [
      "[ User message ]",
      "        |",
      "        v",
      "[ Append turn ] ---> [ Extract long-term facts ]",
      "        |                         |",
      "        v                         v",
      "[ Trim / summarize window ]   [ Memory store ]",
      "        |                         |",
      "        '----------.--------------'",
      "                   v",
      "          [ Assemble context ]",
      "                   |",
      "                   v",
      "          [ Deterministic reply ]",
    ].join("\n"),
    nodes: [
      {
        id: "memory-append-turn",
        label: "Append turn",
        whatMD:
          "The user's new message is added to the full conversation transcript before any memory work happens.",
        whyMD:
          "The current request must be part of the prompt. Treating turns as explicit data also makes trimming and auditing predictable.",
        input: "User message text",
        output: "Full conversation with the new user turn appended",
        commonFailure:
          "Building the prompt from stale state, so the model answers without seeing the latest user message.",
        interviewQuestion:
          "Why should a chat system separate the full transcript from the model's current context window?",
      },
      {
        id: "memory-fact-extractor",
        label: "Extract long-term facts",
        whatMD:
          "Simple patterns identify durable facts such as name, workplace, role, and preferences, then de-duplicate them in a memory list.",
        whyMD:
          "Facts the user expects you to remember should survive context trimming. Extracting them explicitly is cheaper and more reliable than hoping they remain in raw chat history.",
        input: "Latest user message",
        output: "Long-term memory facts such as Name: Sam",
        commonFailure:
          "Storing entire messages as memory, which mixes useful preferences with noisy or sensitive one-off details.",
        interviewQuestion:
          "What makes a fact safe and useful enough to store as long-term memory?",
      },
      {
        id: "memory-summarizer",
        label: "Trim / summarize window",
        whatMD:
          "Only the most recent N turns stay verbatim. Older user turns are condensed into one deterministic summary line.",
        whyMD:
          "Every model has a context limit and every token costs money. Summaries preserve continuity while keeping the prompt bounded.",
        input: "Full conversation + selected window size",
        output: "Recent turns plus an optional Earlier the user mentioned summary",
        commonFailure:
          "Letting chat history grow forever until the request becomes slow, expensive, or rejected by the model.",
        interviewQuestion:
          "How do you decide what to keep verbatim versus summarize in a long chat?",
      },
      {
        id: "memory-context-assembler",
        label: "Assemble context",
        whatMD:
          "The prompt context is built from the optional summary, the short-term window, and the long-term facts list.",
        whyMD:
          "Models only see what you send. A transparent context builder makes recall debuggable: if a fact is not in the assembled context, the model cannot reliably use it.",
        input: "Summary, recent turns, long-term facts",
        output: "Exact text that would be sent to the model",
        commonFailure:
          "Saving facts in a database but forgetting to retrieve and inject them into the next prompt.",
        interviewQuestion:
          "What should you inspect when a memory-enabled assistant fails to recall a known fact?",
      },
      {
        id: "memory-reply",
        label: "Reply",
        whatMD:
          "A deterministic local stand-in answers the user and demonstrates recall from long-term memory when asked.",
        whyMD:
          "The lesson is the memory pipeline, not provider randomness. A deterministic reply makes it obvious which context item caused the answer.",
        input: "Assembled context + latest user question",
        output: "Assistant turn added to the full conversation",
        commonFailure:
          "Presenting memory as if the model magically remembers, instead of showing the retrieved facts that informed the reply.",
        interviewQuestion:
          "How would you explain AI memory to a user in a way that builds trust?",
      },
    ],
  },

  demo: "ai-memory",

  executionMD: `
## What the execution trace shows

Each send records the memory pipeline the demo actually runs:

1. **Append turn** — add the user's message to the full conversation history.
2. **Extract long-term facts** — scan the message for name, workplace, role, and
   preference facts, then de-duplicate them.
3. **Trim / summarize window** — keep only the configured number of recent turns
   verbatim and condense older user turns into one summary string.
4. **Assemble context** — build the exact prompt context: summary, recent turns,
   and long-term memory facts.
5. **Reply** — generate a deterministic local answer that can recall stored facts.

The final metrics estimate tokens for the assembled context and reply. In a real
system, those are the tokens you would pay for and the context you would debug.
`.trim(),

  learnMD: `
## Short-term memory is just context

The short-term window is the recent conversation included verbatim. It preserves
wording, nuance, and exact references, but it is bounded by the model's context
limit. Production systems usually keep the last few turns raw and treat the rest
as candidates for summarization or retrieval.

## Long-term memory is extracted state

Long-term memory should be deliberate. A fact like "Name: Sam" is compact,
inspectable, and easy to delete. A full paragraph of chat history is not. Real
systems often attach metadata: who asserted the fact, when it was updated,
confidence, consent, and whether it is sensitive.

## Summaries are lossy but useful

Summaries trade detail for space. They are best for continuity: what was already
discussed, decisions made, goals, blockers. They are risky for exact data such as
IDs, amounts, deadlines, or legal language. Those should be stored as structured
facts or retrieved from source systems.

## Recall requires retrieval

Saving memory is only half the feature. The relevant facts must be selected and
included in the next prompt. If a user asks "what's my name?" and "Name: Sam" is
not in the assembled context, the model has no reliable basis for answering.

## Privacy and control

Memory needs product controls: show what is stored, let users edit or delete it,
avoid storing sensitive details by default, and scope memory to the right person
or workspace. Good memory feels helpful because it is transparent.
`.trim(),

  challenge: {
    promptMD: `
Extend the memory demo to support **expiry and confidence** for long-term facts.

Design how you would store facts like "Prefers: concise answers" with:

1. A confidence score based on how explicit the user was.
2. A timestamp or expiry policy so stale facts can be ignored.
3. A UI affordance that lets the user delete a remembered fact.

Explain how the context assembler should choose which facts to include when the
memory list becomes large.
`.trim(),
    hints: [
      "Treat each fact as a small record: type, value, confidence, source turn, and updatedAt.",
      "Use exact user statements for high confidence; inferred facts should be lower confidence or not stored.",
      "At assembly time, rank by relevance to the latest message, recency, and confidence instead of injecting everything.",
    ],
    expectedApproachMD: `
A strong design stores memory as structured records, not raw strings. For
example: type = preference, value = concise answers, confidence = 0.9, source =
turn id, updatedAt = timestamp. Facts expire or are down-ranked if old, and the
UI exposes them so users can remove mistakes.

When assembling context, retrieve only facts relevant to the latest request and
fit them into a token budget. Prefer explicit, recent, high-confidence facts.
Summaries preserve conversational continuity, while structured memory preserves
durable facts.
`.trim(),
  },

  interviewQuestions: [
    {
      id: "memory-q1",
      question: "What is the difference between short-term and long-term memory in an AI chat product?",
      difficulty: "Intermediate",
      answerMD:
        "Short-term memory is the recent context sent verbatim with the next request: the last few user and assistant turns. Long-term memory is extracted, durable state stored outside the prompt, such as a user's name, role, preferences, or account facts. Short-term memory preserves exact wording but is bounded by token limits. Long-term memory is compact and persistent, but it must be intentionally extracted, stored, retrieved, and injected back into context.",
      keyPoints: [
        "Short-term memory equals recent prompt context",
        "Long-term memory is stored structured state",
        "Context windows are bounded by tokens",
        "Recall requires retrieval and prompt injection",
      ],
      followUps: [
        "What should happen when a user corrects a remembered fact?",
        "How would you expose memory controls to users?",
      ],
    },
    {
      id: "memory-q2",
      question: "Why not send the entire chat history on every request?",
      difficulty: "Intermediate",
      answerMD:
        "Sending everything becomes slow, expensive, and eventually impossible because models have fixed context limits. It also increases privacy risk and can distract the model with stale or irrelevant details. A better design keeps a recent verbatim window, summarizes older context, and retrieves only relevant long-term facts or documents. That gives continuity while controlling cost and accuracy.",
      keyPoints: [
        "Token cost and context limits grow with history",
        "Old details can distract or conflict",
        "Privacy exposure increases with unnecessary context",
        "Use windows, summaries, and retrieval instead",
      ],
      followUps: [
        "How would you choose the window size?",
        "What information should never be summarized?",
      ],
    },
    {
      id: "memory-q3",
      question: "How do summarization memories fail, and how do you mitigate that?",
      difficulty: "Advanced",
      answerMD:
        "Summaries are lossy. They can omit important constraints, blur exact values, or accidentally introduce facts the user never said. Mitigate this by keeping exact source references for critical facts, validating structured facts separately, using bounded summary updates, and making summaries inspectable. For high-stakes domains, do not rely on summaries for numbers, legal obligations, permissions, or identity claims.",
      keyPoints: [
        "Summaries lose detail and can hallucinate",
        "Keep source links for critical facts",
        "Store exact values as structured facts",
        "Make memory inspectable and correctable",
      ],
      followUps: [
        "How would you test summary drift over a 100-turn chat?",
        "When should you regenerate versus incrementally update a summary?",
      ],
    },
    {
      id: "memory-q4",
      question: "Design a memory retrieval strategy for a user with hundreds of stored facts.",
      difficulty: "Advanced",
      answerMD:
        "Do not inject every fact. Classify facts by type, embed or keyword-index their text, and retrieve only facts relevant to the current message and task. Rank by relevance, recency, confidence, and sensitivity, then fit the selected facts into a token budget. Always include identity or preference facts only when appropriate, and allow the user to inspect or delete them.",
      keyPoints: [
        "Retrieve selectively, not all memory",
        "Rank by relevance, recency, confidence, and sensitivity",
        "Apply a token budget",
        "Respect user controls and scopes",
      ],
      followUps: [
        "How would workspace-level memory differ from personal memory?",
        "How do you prevent a sensitive fact from being recalled in the wrong context?",
      ],
    },
    {
      id: "memory-q5",
      question: "How do you evaluate whether AI memory is working well?",
      difficulty: "Advanced",
      answerMD:
        "Create eval conversations with planted facts, corrections, irrelevant facts, and stale facts. Measure recall accuracy, false recall, update handling, privacy leaks, and token cost. Include regression tests where a fact falls out of the short-term window and must be recalled from long-term memory. Human review is useful for trust and creepiness, but automated checks should verify the stored context and the final answer.",
      keyPoints: [
        "Use scripted conversations with planted facts",
        "Measure recall and false recall",
        "Test corrections, staleness, and privacy boundaries",
        "Inspect both assembled context and final answer",
      ],
      followUps: [
        "What is a false memory in this context?",
        "How would you measure whether memory feels helpful instead of creepy?",
      ],
    },
  ],
};
