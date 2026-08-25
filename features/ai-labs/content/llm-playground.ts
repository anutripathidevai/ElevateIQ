import type { LabContent } from "../types";

/**
 * Lab 1 — LLM Playground.
 *
 * The entry point to AI Labs: a real Azure OpenAI call the user drives with a
 * system prompt, user prompt, temperature, and max tokens, streamed token by
 * token with a live execution trace and token/latency/cost readout. When Azure
 * is not configured the route falls back to a clearly-labelled demo provider so
 * the lab always works in the live guest-mode deployment.
 */
export const llmPlaygroundContent: LabContent = {
  slug: "llm-playground",

  overviewMD: `
## What is the LLM Playground?

Every AI feature you have ever used — ChatGPT, Copilot, a "summarize this" button —
is, at its core, a single call to a **Large Language Model (LLM)**. You send text
in, the model predicts the most likely continuation, and you get text back, one
token at a time.

This lab strips that call down to its essentials so you can *feel* how each knob
changes the output. You send a **system prompt** (who the model should be), a
**user prompt** (what you're asking), and control **temperature** (how random the
output is) and **max tokens** (how long the answer can get).

## Why it matters

Understanding the raw LLM call is the foundation for everything else in AI Labs.
RAG, agents, tool-calling, and guardrails are all *wrappers* around this exact
request. If you know how prompts, temperature, tokens, and streaming behave, the
advanced labs become straightforward.

## Where it is used

- Chat assistants and "ask AI" features
- Content generation (emails, summaries, code)
- Classification and extraction (with structured output — Lab 2)
- As the reasoning engine inside every agent (Lab 7)

## What you'll build

A working prompt console that talks to a real model, streams the answer live,
and shows you exactly how many tokens went in and out, how long it took, and the
approximate cost — the same metrics you'd watch in production.
`.trim(),

  whatYouBuild: [
    "A prompt console with separate system and user prompts",
    "Temperature and max-token controls that visibly change the output",
    "Live token-by-token streaming, just like ChatGPT",
    "A metrics readout: input/output tokens, latency, and estimated cost",
    "A live execution trace showing every stage of the request",
  ],

  architecture: {
    title: "How one LLM request flows",
    flow: [
      "[ Your Prompt ]",
      "      |  system + user + temperature + maxTokens",
      "      v",
      "[ Client ] --- POST /api/ai-labs/llm --->  [ API Route ]",
      "                                                |",
      "                        validate + auth + usage guard",
      "                                                v",
      "                                        [ LLM Gateway ]",
      "                                        |            |",
      "                              Azure configured?   no -> [ Demo Provider ]",
      "                                        | yes",
      "                                        v",
      "                                 [ Azure OpenAI ]",
      "                                        |",
      "                          stream tokens + usage back",
      "                                        v",
      "[ Client ] <--- NDJSON: trace / token / done ---  [ API Route ]",
    ].join("\n"),
    nodes: [
      {
        id: "prompt",
        label: "Prompt (system + user)",
        whatMD:
          "The two messages you send: a **system** message that sets the model's role and rules, and a **user** message with the actual request.",
        whyMD:
          "Separating role from request lets you reuse one system prompt across many user inputs — the basis of every prompt template.",
        input: "Your typed text",
        output: "A messages array: [{role:'system'}, {role:'user'}]",
        commonFailure:
          "Cramming instructions into the user message so they get diluted by the user's content.",
        interviewQuestion:
          "What is the difference between a system prompt and a user prompt, and why keep them separate?",
      },
      {
        id: "params",
        label: "Sampling params",
        whatMD:
          "**Temperature** controls randomness (0 = deterministic, higher = more varied). **Max tokens** caps the length of the answer.",
        whyMD:
          "The same prompt can produce a precise extraction or a creative brainstorm depending on temperature — one model, many behaviours.",
        input: "temperature (0-2), maxTokens",
        output: "Sampling configuration attached to the request",
        commonFailure:
          "Using high temperature for tasks that need exact answers (JSON, math), causing flaky output.",
        interviewQuestion:
          "When would you set temperature to 0 versus 0.9?",
      },
      {
        id: "route",
        label: "API route + guards",
        whatMD:
          "A Node route validates the request, resolves the user, and checks a daily usage limit before spending any tokens.",
        whyMD:
          "The API key must never reach the browser, and unbounded AI calls are a cost and abuse risk — the server is the trust boundary.",
        input: "Validated request + user id",
        output: "An authorised, rate-limited call to the gateway",
        commonFailure:
          "Calling the model directly from the client and leaking the API key.",
        interviewQuestion:
          "Why must LLM calls go through your server instead of the browser?",
      },
      {
        id: "gateway",
        label: "LLM gateway",
        whatMD:
          "A thin abstraction that picks a provider (real Azure OpenAI, or a demo provider when Azure is not configured) behind one interface.",
        whyMD:
          "Programming to an interface means you can swap models, add fallbacks, or run offline demos without touching the UI.",
        input: "Provider-agnostic messages + params",
        output: "A stream of tokens + usage",
        commonFailure:
          "Hard-coding one vendor's SDK throughout the app, making the model impossible to swap.",
        interviewQuestion:
          "How would you design an LLM layer that can fail over from one provider to another?",
      },
      {
        id: "stream",
        label: "Streaming response",
        whatMD:
          "Tokens are sent to the browser as they are generated using an NDJSON event stream (trace, token, done events).",
        whyMD:
          "Streaming makes the app feel instant and lets you show progress and a live trace instead of a spinner.",
        input: "Model token stream",
        output: "NDJSON events rendered live in the UI",
        commonFailure:
          "Buffering the whole answer server-side, so the user stares at a spinner for 10 seconds.",
        interviewQuestion:
          "Why is streaming important for LLM UX, and how do you implement it end to end?",
      },
    ],
  },

  demo: "llm-playground",

  executionMD: `
## What the execution trace shows

Every run records the real stages of the request with timings:

1. **Validate** — the prompt and params are checked and the usage guard runs.
2. **Provider select** — Azure OpenAI if configured, otherwise the demo provider.
3. **First token** — how long until the model started responding (time-to-first-token).
4. **Stream** — tokens arriving until the model stops.
5. **Done** — final token counts, total latency, and estimated cost.

Watching these numbers is exactly how you debug AI in production: a slow
time-to-first-token points at the model or network, a huge output-token count
points at a prompt that needs tightening, and cost is just tokens × price.
`.trim(),

  learnMD: `
## Tokens, not words

LLMs read and write **tokens** — chunks of text roughly 4 characters long. "Compile"
might be one token; "Readiness" might be two. You are billed per token (input +
output), and every model has a **context window** — the maximum tokens it can
consider at once. Long prompts and long answers both cost more and can hit that
limit.

## Temperature and sampling

At each step the model produces a probability distribution over the next token.
**Temperature** reshapes that distribution:

- **0** — always take the most likely token: deterministic, best for extraction,
  classification, and code.
- **0.7-1.0** — sample more freely: good for brainstorming and writing.
- **> 1.0** — high variety, but risk of incoherence.

## System vs user prompts

The **system** message is your standing instruction — persona, tone, rules,
output format. The **user** message is the specific request. Keeping them
separate lets you template the system prompt once and vary only the user input,
which is how real products stay consistent across millions of requests.

## Streaming

Instead of waiting for the full answer, the server forwards tokens as they are
produced. This is why ChatGPT "types". Under the hood you read chunks from the
model and flush them to the client — here as newline-delimited JSON events so
the UI can also render a live trace and final usage.

## Reasoning models

Some newer models "think" before answering and ignore \`temperature\`, requiring a
minimum token budget instead. A good LLM layer detects the model family and tunes
parameters automatically — which is exactly what the gateway in this lab does.
`.trim(),

  challenge: {
    promptMD: `
Make the model behave like a **strict senior code reviewer**. Using only the
system prompt and sampling controls in the playground:

1. Write a system prompt that makes it terse, blunt, and focused only on bugs and
   security — no praise, no restating the code.
2. Set the temperature so the review is consistent every time you run it.
3. Ask it to review a small function (paste any snippet as the user prompt).

The goal: the same input should give you essentially the same review twice.
`.trim(),
    hints: [
      "Put the persona and the 'only report real problems' rule in the SYSTEM prompt, not the user prompt.",
      "Consistency means low randomness — think about which temperature gives deterministic output.",
      "Explicitly tell it the output format (e.g. a numbered list of issues) so it stays terse.",
    ],
    expectedApproachMD: `
A strong answer sets **temperature to 0** for repeatability and puts all the
behaviour in the system prompt, for example:

> You are a strict senior code reviewer. Report only bugs, security issues, and
> correctness problems as a numbered list. Do not praise, summarize, or restate
> the code. If there are no issues, reply "No issues found."

Then the user prompt is just the code. Because temperature is 0 and the rules
live in the system message, the review is stable across runs — the same
separation-of-concerns you would use to ship a reliable AI feature.
`.trim(),
  },

  interviewQuestions: [
    {
      id: "llm-q1",
      question: "What is a token, and why does it matter for cost and context limits?",
      difficulty: "Beginner",
      answerMD:
        "A token is a sub-word chunk of text (roughly 4 characters) that the model reads and generates. Models are billed per input and output token, and each model has a fixed **context window** — the maximum number of tokens it can process at once. Longer prompts and answers cost more and can exceed the window, so token budgeting (trimming context, capping max tokens) is a core production concern.",
      keyPoints: [
        "Tokens ≈ sub-words, not characters or words",
        "You pay for input + output tokens",
        "Context window is a hard token limit",
        "Token budgeting controls cost and avoids truncation",
      ],
      followUps: [
        "How would you fit a long document into a small context window?",
        "How do you estimate tokens before sending a request?",
      ],
    },
    {
      id: "llm-q2",
      question: "Explain temperature. When would you use 0 versus 0.9?",
      difficulty: "Beginner",
      answerMD:
        "Temperature scales the randomness of token sampling. At **0** the model always picks the highest-probability token, giving deterministic, repeatable output — ideal for extraction, classification, JSON, and code. At **0.9** it samples more freely for variety and creativity — good for brainstorming or writing. High temperature on a task that needs exact answers causes flaky, hard-to-test behaviour.",
      keyPoints: [
        "Temperature reshapes the next-token probability distribution",
        "0 = deterministic; higher = more diverse",
        "Low temp for structured/precise tasks",
        "Higher temp for creative/open tasks",
      ],
      followUps: [
        "What are top-p and top-k, and how do they relate to temperature?",
        "Why might temperature 0 still not be perfectly deterministic?",
      ],
    },
    {
      id: "llm-q3",
      question: "Why should LLM calls go through your backend instead of the browser?",
      difficulty: "Intermediate",
      answerMD:
        "The backend is the trust boundary. Calling the model from the browser would expose the API key to anyone who opens dev tools, and it removes your ability to authenticate users, enforce rate limits, validate input, log usage, and control cost. Routing through the server lets you keep secrets safe, apply guardrails, and swap or fail over providers without shipping new client code.",
      keyPoints: [
        "Keeps the API key server-side",
        "Enables auth, rate limiting, and abuse protection",
        "Central place for validation, logging, and cost control",
        "Lets you change providers without client changes",
      ],
      followUps: [
        "How would you rate-limit AI calls per user?",
        "How do you stream a model response through your own server?",
      ],
    },
    {
      id: "llm-q4",
      question: "How does token streaming work end to end, and why use it?",
      difficulty: "Intermediate",
      answerMD:
        "The model emits tokens incrementally. The server reads those chunks and forwards them to the client over a streaming response (SSE, chunked HTTP, or NDJSON events) instead of waiting for the full answer. The client appends each chunk as it arrives. Streaming drastically improves perceived latency (the user sees output immediately), enables progress and live traces, and lets you cancel early to save cost.",
      keyPoints: [
        "Model produces tokens incrementally",
        "Server forwards chunks as they arrive",
        "Client renders progressively",
        "Improves perceived latency; enables cancel and live trace",
      ],
      followUps: [
        "How do you get final token usage when streaming?",
        "How would you handle a client that disconnects mid-stream?",
      ],
    },
    {
      id: "llm-q5",
      question:
        "Design an LLM access layer that can swap providers and fall back on failure.",
      difficulty: "Advanced",
      answerMD:
        "Define a provider-agnostic interface (messages in, a token stream + usage out) and implement it per vendor. A gateway selects a primary provider, and on error (timeout, rate limit, outage) retries or fails over to a secondary, optionally degrading to a cheaper model or a canned demo response. The UI depends only on the interface, so adding a provider or changing the fallback policy never touches client code. Add per-model parameter tuning (e.g. reasoning models ignore temperature) inside each implementation so callers stay simple.",
      keyPoints: [
        "Program to an interface, not a vendor SDK",
        "Gateway owns provider selection + fallback policy",
        "Retries, timeouts, and graceful degradation",
        "Per-model parameter tuning hidden behind the interface",
      ],
      followUps: [
        "How would you add response caching to this layer?",
        "How do you observe latency and cost per provider?",
      ],
    },
  ],
};
