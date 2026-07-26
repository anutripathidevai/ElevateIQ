import type { GenAILessonContent } from "../types";

export const callingTheAnthropicApiContent: GenAILessonContent = {
  slug: "calling-the-anthropic-api",
  introductionMD: `Calling the Anthropic API means sending a structured conversation to the Messages API and treating Claude as one service inside a larger application. A strong engineer does not just know how to send text. They know where the system prompt belongs, how the messages array represents user and assistant turns, why responses arrive as content blocks, and how token limits, stop reasons, streaming, caching, and retries affect production behavior.

The key beginner mistake is assuming every provider accepts the same chat schema. Anthropic's Messages API has its own important shape: **system** is a separate top-level field, **messages** contains only user and assistant turns, **max_tokens** is required, and **content** can be a list of typed blocks such as text, image, tool_use, and tool_result. That shape is what enables multimodal input, tool workflows, prompt caching, and streaming without inventing a new endpoint for every feature.

In interviews, this topic tests whether you can turn a model demo into a reliable API integration. You should be able to describe the request body, read **stop_reason** and **usage**, choose sampling parameters, stream server-sent events, reduce cost with prompt caching, and handle rate limits and transient errors without retry storms.`,
  realWorldMD: `Teams use the Anthropic API for support copilots, document analysis, coding assistants, agentic workflows, safety review, search answer generation, and internal automation.

- A customer support app sends policy as the top-level system prompt and a ticket as a user message.
- A document QA tool sends long stable context with prompt caching so repeated questions are cheaper and faster.
- A tool-using agent receives tool_use blocks, executes server-side functions, then sends tool_result blocks back in a later user turn.
- A chat UI streams server-sent events so users see tokens quickly instead of waiting for the full response.`,
  learningObjectives: [
    "Build a valid Anthropic Messages API request with model, max_tokens, top-level system, and messages.",
    "Explain why the system prompt is separate from the messages array and why messages contain only user and assistant turns.",
    "Use content blocks for text, images, tool_use, and tool_result instead of assuming content is always one string.",
    "Interpret stop_reason values, including end_turn, max_tokens, stop_sequence, and tool_use.",
    "Tune temperature, top_p, and top_k while keeping deterministic production tasks repeatable.",
    "Apply prompt caching, streaming, token accounting, and retry handling to reduce cost, latency, and failures."
  ],
  theory: [
    {
      label: "The Messages API is the default conversation endpoint",
      detailMD: `The Messages API takes a model name, a required **max_tokens** budget, optional generation controls, optional top-level **system** instructions, and a **messages** array. Each message has a role of user or assistant and content that can be a string or an explicit list of content blocks.

The response mirrors this structured design. It includes an id, type, role, model, a **content** list, **stop_reason**, optional **stop_sequence**, and a **usage** object. Production code should read these fields instead of scraping plain text from the response. The shape gives the application enough metadata to decide whether the answer is complete, truncated, waiting for a tool result, or failed upstream.`
    },
    {
      label: "System prompt is top-level, not a message role",
      detailMD: `Anthropic separates durable instructions from conversation turns. The system prompt is provided as a top-level **system** field, not as a message with role system. The **messages** array contains only user and assistant turns: the current user request, prior user messages, and prior assistant outputs that define conversation state.

This distinction matters in migrations from other chat APIs. If you put a fake system message into **messages**, you are not using the Anthropic schema correctly. A clean integration keeps policy, tone, source-of-truth rules, and tool rules in **system**, while user data and previous assistant answers remain in **messages**.`
    },
    {
      label: "Content is a list of typed blocks",
      detailMD: `A message can contain content as a simple string for basic text, but serious integrations should understand the block model. A content list can hold text blocks, image blocks, assistant tool_use blocks, and user tool_result blocks. The response is also a content list, so the first item is not guaranteed to be the only meaningful item.

The list design lets one message carry multiple modalities and multiple actions. A user message can include text plus an image. An assistant message can include explanatory text plus one or more tool_use requests. A later user message can include tool_result blocks that connect server-side execution back to Claude. Treating content as blocks keeps the protocol extensible and avoids brittle string conventions.`
    },
    {
      label: "max_tokens and stop_reason define completion behavior",
      detailMD: `Anthropic requires **max_tokens** on Messages API calls. It is the maximum number of output tokens Claude may produce, not the total context window and not a guarantee that the model will use all of them. Set it high enough for the desired answer and low enough to protect latency and cost.

After a response, **stop_reason** tells you why generation stopped. **end_turn** means Claude naturally finished the turn. **max_tokens** means the output hit the requested budget and may be incomplete. **stop_sequence** means a caller-provided stop sequence was encountered. **tool_use** means Claude is asking the application to run a tool and return tool_result content in a follow-up message.`
    },
    {
      label: "temperature, top_p, and top_k control sampling",
      detailMD: `Sampling parameters affect how predictable the output is. **temperature** controls randomness directly: lower values are better for extraction, classification, and support workflows, while higher values can help brainstorming. **top_p** nucleus sampling limits choices to a cumulative probability mass. **top_k** limits the next-token candidates to a fixed count.

In production, change one sampling control at a time. For most beginner integrations, use low temperature and leave top_p and top_k at provider defaults unless you have evaluation data. Over-tuning all three can make behavior harder to reason about and harder to reproduce during an incident.`
    },
    {
      label: "Usage and token accounting are part of the contract",
      detailMD: `Every successful response includes a **usage** object with **input_tokens** and **output_tokens**. Log these values with the model, prompt version, cache behavior, request id, latency, and stop_reason. That data is how teams explain cost spikes, truncation, and quality regressions.

Prompt caching adds more token accounting fields in supported responses, such as cache creation and cache read token counts. Those fields are important because cached reads and cache writes are priced differently. The application should treat usage as billing and performance telemetry, not as a debugging afterthought.`
    }
  ],
  requestFlow: [
    {
      step: "1. Choose the model and output budget",
      detailMD: `Pick the Claude model for the task, then set **max_tokens** according to the expected answer length. A short classifier may need only a few hundred output tokens, while a document synthesis task may need more. Do not omit max_tokens; it is required for the Messages API.`
    },
    {
      step: "2. Write the top-level system prompt",
      detailMD: `Put stable behavior in the top-level **system** field: role, tone, safety boundaries, evidence rules, tool policy, and what to do when information is missing. Keep user-specific input out of system unless it is trusted application policy.`
    },
    {
      step: "3. Build the messages array",
      detailMD: `Add user and assistant turns in order. The latest user task usually appears last. Prior assistant messages are useful for conversational continuity, but they should represent actual prior state, not hidden policy.`
    },
    {
      step: "4. Represent content as blocks when needed",
      detailMD: `Use a plain string only for simple text. Use content block lists when you need text plus images, tool_use responses, tool_result messages, cache_control on long blocks, or clearer protocol handling. Always assume a response can contain multiple blocks.`
    },
    {
      step: "5. Set sampling and stop controls",
      detailMD: `Set temperature for the desired repeatability, and only adjust top_p or top_k when you have a reason. If the application has a natural boundary, provide stop sequences and handle **stop_sequence** in the response.`
    },
    {
      step: "6. Send the request or enable streaming",
      detailMD: `For simple back-end jobs, a normal request is easiest. For user-facing chat, enable streaming so the server receives server-sent events such as message_start, content_block_delta, message_delta, and message_stop while Claude is still generating.`
    },
    {
      step: "7. Read content, stop_reason, and usage",
      detailMD: `Extract text from text blocks, detect tool_use blocks, inspect **stop_reason**, and log **usage.input_tokens** and **usage.output_tokens**. If stop_reason is max_tokens, the application should treat the output as potentially truncated.`
    },
    {
      step: "8. Handle errors and rate limits",
      detailMD: `Retry only transient failures such as 429 rate limits, overloaded responses, connection errors, and selected 5xx errors. Honor retry-after headers when present, add exponential backoff with jitter, and never retry permanent schema or authentication errors as if they will fix themselves.`
    }
  ],
  deepDives: [
    {
      label: "Why Anthropic keeps system outside messages",
      detailMD: `The top-level system field makes the request contract explicit. Conversation turns are the transcript; system is the application instruction layer. That separation improves portability across turns and makes it clear which text is durable policy versus user-provided content.

This also helps with prompt caching and prompt management. Stable system context can be authored, versioned, and cached separately from the rapidly changing user message. In an interview, call out that role priority is not just style. It affects security, maintainability, and debugging.`
    },
    {
      label: "Why content blocks are not just formatting",
      detailMD: `Content blocks are the protocol surface for multimodal and agentic behavior. A text block carries ordinary language. An image block carries visual input. A tool_use block is Claude asking the application to call a named tool with JSON input. A tool_result block is the application returning the result in a later user turn.

This model avoids fragile instructions such as write TOOL_CALL followed by JSON. The application can inspect a typed block and route it deterministically. It also lets one response mix text and tool calls, so client code should iterate through the whole content array rather than assuming content at index zero is all that matters.`
    },
    {
      label: "Prompt caching reduces repeated long-context cost and latency",
      detailMD: `Prompt caching is useful when a large part of the prompt is stable across requests: policy manuals, product documentation, long examples, or tool definitions. Add **cache_control** with type **ephemeral** to supported content blocks near the end of the reusable prefix. Anthropic can cache that prefix so later calls avoid reprocessing the same tokens.

The default ephemeral cache has a 5-minute TTL. Cache writes and cache reads are billed differently: writing cached tokens has its own creation price, while reading cached tokens is much cheaper than sending the same uncached input again. The break-even point depends on model pricing and reuse frequency, but the rule is simple: cache long stable context that will be reused soon, not tiny one-off prompts.`
    },
    {
      label: "Streaming is server-sent events, not partial JSON polling",
      detailMD: `When streaming is enabled, Anthropic sends server-sent events over one HTTP response. The client receives lifecycle events such as message_start, content_block_start, content_block_delta, content_block_stop, message_delta, and message_stop. Text usually arrives in delta events, while final usage and stop information arrive later in the stream.

A robust streaming client separates transport handling from UI rendering. It should buffer deltas, handle ping events, surface stream errors, and still reconcile the final stop_reason. The user sees faster first-token latency, but the application still needs a complete final state for logging and safety checks.`
    },
    {
      label: "Retries must protect the provider and your users",
      detailMD: `Retrying every failure is dangerous. Validation errors, missing max_tokens, unknown model names, and authentication failures are permanent until the request changes. Retrying them only adds load and hides the real bug. Transient failures are different: 429 rate_limit_error, connection resets, timeouts, overloaded responses, and selected 5xx errors can succeed after a delay.

Use exponential backoff with jitter, respect retry-after, cap attempts, and make idempotency decisions deliberately. For user-facing chat, show progress or a graceful fallback instead of freezing the UI. For background jobs, put failed work on a queue with a retry budget and dead-letter path.`
    }
  ],
  productionConsiderations: [
    {
      label: "Observability and request tracing",
      detailMD: `Log the model, prompt version, max_tokens, sampling parameters, stop_reason, latency, input_tokens, output_tokens, cache read and write token counts, and provider request id. Without these fields, debugging cost, truncation, and model changes becomes guesswork.`
    },
    {
      label: "Rate limits, quotas, and graceful degradation",
      detailMD: `Design for 429 responses before launch. Use client-side concurrency limits, per-tenant quotas, exponential backoff, and fallback behavior for non-critical features. If a chat UI streams, handle both HTTP errors before the stream starts and error events inside the stream.`
    },
    {
      label: "Cost controls and prompt caching",
      detailMD: `Set max_tokens intentionally, trim stale conversation history, summarize old turns when appropriate, and cache long stable context with ephemeral cache_control. Monitor cache write and cache read tokens separately so you can prove the cache is actually saving money.`
    },
    {
      label: "Security around keys, tools, and user data",
      detailMD: `Keep API keys server-side, never expose them in browser code, and avoid logging sensitive prompt content by default. For tool_use, authorize every tool call on your server. Claude can request a tool, but your application decides whether that tool may run for the current user and tenant.`
    }
  ],
  interview: {
    whatInterviewersLookFor: [
      "A correct Messages API shape: model, required max_tokens, top-level system, and user or assistant messages.",
      "Clear understanding that content is a list of typed blocks, including text, image, tool_use, and tool_result.",
      "Ability to interpret stop_reason and usage instead of treating the response as one plain text string.",
      "Production instincts around streaming, prompt caching, retries, rate limits, observability, and API key security."
    ],
    followUps: [
      {
        question: "Where do you put the system prompt in an Anthropic Messages API request?",
        answerMD: `Put it in the top-level **system** field. Do not add a message with role system. The messages array contains only user and assistant turns, while the top-level system prompt carries stable application behavior such as role, tone, tool rules, and evidence policy.`
      },
      {
        question: "Why is message content a list of blocks?",
        answerMD: `Blocks let the protocol represent more than one kind of content. Text, images, tool_use requests, and tool_result responses can be handled as typed items. This is safer and more extensible than encoding everything as plain text and asking downstream code to parse conventions.`
      },
      {
        question: "What should your application do when stop_reason is tool_use?",
        answerMD: `Inspect the tool_use content block, validate the requested tool and input on the server, run the allowed tool, then send a follow-up user message containing a tool_result block. The model has not completed the user-facing answer until the tool result is returned and Claude continues.`
      },
      {
        question: "When is prompt caching worth using?",
        answerMD: `Use it when a long prefix is stable and reused soon, such as a policy manual, product documentation, long examples, or tool definitions. The ephemeral cache has a 5-minute TTL, cache writes and reads have separate pricing, and cached reads are much cheaper than resending the same long context uncached.`
      }
    ],
    alternativeDesigns: [
      {
        name: "Direct provider integration",
        detailMD: `The application calls Anthropic directly from a trusted server. This is simple and good for early products, but each service must implement its own retries, logging, prompt versioning, rate limits, and cost controls.`
      },
      {
        name: "LLM gateway",
        detailMD: `A shared internal gateway wraps Anthropic and other providers. It centralizes API keys, tracing, retries, caching, model routing, and policy enforcement. The tradeoff is another service to operate and the need to expose provider-specific features without flattening them incorrectly.`
      },
      {
        name: "Cached long-context workflow",
        detailMD: `The application places stable long context in cacheable blocks and sends only the changing user question each turn. This can reduce latency and cost for document-heavy workloads, but it is only valuable when the same prefix is reused within the cache TTL.`
      }
    ],
    commonMistakes: [
      "Putting a fake system role inside messages instead of using the top-level system field.",
      "Omitting max_tokens or setting it so low that normal answers are truncated.",
      "Assuming response content is always one text string and ignoring tool_use or multiple content blocks.",
      "Retrying permanent 400-level request errors instead of fixing schema, model, authentication, or validation bugs."
    ]
  },
  interviewHints: [
    "Start by describing the request body: model, max_tokens, system, messages, and content blocks.",
    "Then explain response handling: content blocks, stop_reason, stop_sequence, and usage.",
    "Call out production features: streaming server-sent events, prompt caching, retries, and rate limits.",
    "End with common pitfalls: fake system role, missing max_tokens, unchecked tool_use, and unbounded retries."
  ],
  playground: {
    descriptionMD: `Try this in the Anthropic Console or a small server-side script. The example keeps durable behavior in the top-level system prompt, sends the live ticket as a user message, uses low temperature for repeatability, and sets max_tokens explicitly.`,
    systemPrompt: `You are a support triage assistant.
Use only the ticket text provided by the user.
Return concise JSON with the fields summary, urgency, customer_need, next_action, and confidence.
If the ticket does not contain enough evidence, write I do not know for that field.`,
    userPrompt: `Ticket:
The customer says their workspace now shows two paid seats after an upgrade. They expected one seat and are worried the renewal tomorrow will charge them twice.

Task:
Classify the ticket and recommend the next support action.`,
    parameters: [
      { name: "model", value: "claude-3-5-haiku-latest", note: "Fast, low-cost model for short support classification." },
      { name: "max_tokens", value: "350", note: "Required by the Messages API and large enough for concise JSON." },
      { name: "temperature", value: "0.2", note: "Low randomness for repeatable triage output." },
      { name: "top_p", value: "default", note: "Leave at default unless evaluation shows a reason to tune it." },
      { name: "top_k", value: "default", note: "Avoid changing top_p and top_k together without tests." }
    ],
    sampleOutputMD: `A typical response object includes content, stop_reason, and usage metadata:

{
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "{\\"summary\\":\\"Customer sees two paid seats after upgrade and worries about duplicate renewal charge.\\",\\"urgency\\":\\"medium\\",\\"customer_need\\":\\"Billing verification before renewal\\",\\"next_action\\":\\"Check seat count and upcoming invoice, then confirm whether duplicate charge will occur.\\",\\"confidence\\":\\"medium\\"}"
    }
  ],
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 115,
    "output_tokens": 72
  }
}

If stop_reason were max_tokens, the JSON might be incomplete. If it were tool_use, the application would need to run a tool and return a tool_result block before expecting the final answer.`
  },
  comparisons: [
    {
      title: "Messages API request parts",
      columns: ["Part", "Where it appears", "Purpose", "Common mistake"],
      rows: [
        ["model", "Top-level field", "Selects the Claude model", "Using an unsupported or stale model name"],
        ["max_tokens", "Top-level field", "Caps generated output tokens and is required", "Omitting it or setting it too low"],
        ["system", "Top-level field", "Holds durable behavior and policy", "Putting role system inside messages"],
        ["messages", "Top-level array", "Contains user and assistant turns", "Mixing hidden policy with user content"],
        ["content", "Inside each message and response", "Carries text, images, tools, or results", "Assuming it is always one string"]
      ]
    },
    {
      title: "stop_reason values",
      columns: ["stop_reason", "Meaning", "Application response"],
      rows: [
        ["end_turn", "Claude finished the assistant turn naturally", "Use the answer after normal validation"],
        ["max_tokens", "The output reached the requested token cap", "Treat as possibly truncated and retry or ask for continuation"],
        ["stop_sequence", "A caller-provided stop sequence was reached", "Confirm the stop boundary was expected"],
        ["tool_use", "Claude requested one or more tools", "Run allowed tools and send tool_result blocks back"]
      ]
    },
    {
      title: "Operational controls",
      columns: ["Control", "What it affects", "Good beginner default", "Risk"],
      rows: [
        ["temperature", "Randomness in token sampling", "Low for extraction and support tasks", "High values can reduce repeatability"],
        ["top_p", "Probability mass considered during sampling", "Leave default unless measured", "Tuning with temperature can confuse debugging"],
        ["top_k", "Maximum candidate token count", "Leave default for most apps", "Over-constraining can hurt quality"],
        ["prompt caching", "Repeated long-prefix cost and latency", "Cache stable reused context", "Caching tiny or one-off prompts adds complexity"],
        ["streaming", "First-token latency and UI responsiveness", "Use for chat interfaces", "Must handle stream errors and final reconciliation"]
      ]
    }
  ],
  decisionGuideMD: `## Choosing how to call Anthropic

Use a **basic Messages API call** when the task is a short server-side job: classification, rewriting, summarization, or extraction. Keep system top-level, send one user message, set max_tokens, choose low temperature, and validate the output.

Use **content block lists** when the input is multimodal, when you need prompt caching on a specific block, or when tools are involved. Blocks are the correct abstraction for text, image, tool_use, and tool_result.

Use **streaming** for user-facing chat, long answers, and copilots where first-token latency matters. Streaming improves perceived speed, but the application still needs final stop_reason and usage for logging and control flow.

Use **prompt caching** when a long stable prefix will be reused within about 5 minutes. Cache policy documents, large examples, long system context, and tool definitions. Do not cache short unique prompts just because caching exists.

Use **retries with backoff** only for transient failures. Retry 429, overloaded, connection, timeout, and selected server errors. Do not retry invalid requests, bad authentication, unknown models, or malformed content blocks.

Use an **LLM gateway** once multiple teams need shared model routing, quotas, observability, retries, audit logging, and key management. Keep provider-specific fields available so the gateway does not hide important Anthropic features.`,
  handsOn: [
    {
      title: "Make a basic Messages API call",
      detailMD: `This Python example uses the Anthropic SDK from a server-side process. It keeps the system prompt top-level, sends the user content as a text block, sets max_tokens explicitly, and prints stop_reason plus usage.`,
      code: {
        language: "python",
        label: "anthropic_messages_basic.py",
        body: `import os
from anthropic import Anthropic

client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

def classify_ticket(ticket_text):
    response = client.messages.create(
        model="claude-3-5-haiku-latest",
        max_tokens=350,
        temperature=0.2,
        system="You are a support triage assistant. Use only the ticket text. Return concise JSON.",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Ticket:\\n" + ticket_text
                    }
                ]
            }
        ]
    )

    print("stop_reason: " + str(response.stop_reason))
    print("input_tokens: " + str(response.usage.input_tokens))
    print("output_tokens: " + str(response.usage.output_tokens))

    text_parts = []
    for block in response.content:
        if block.type == "text":
            text_parts.append(block.text)
    return "\\n".join(text_parts)

ticket = "I upgraded and now see two paid seats. Will I be charged twice tomorrow?"
print(classify_ticket(ticket))`
      }
    },
    {
      title: "Stream text for a chat UI",
      detailMD: `The SDK hides most server-sent event parsing, but the underlying transport is still a stream. The important application behavior is to display deltas quickly while preserving final response handling for logs and safety checks.`,
      code: {
        language: "python",
        label: "anthropic_streaming.py",
        body: `import os
from anthropic import Anthropic

client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

with client.messages.stream(
    model="claude-3-5-haiku-latest",
    max_tokens=500,
    temperature=0.3,
    system="You explain API behavior to beginner engineers in concise language.",
    messages=[
        {
            "role": "user",
            "content": "Explain why Anthropic message content can be a list of blocks."
        }
    ]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)

    final_message = stream.get_final_message()
    print("\\nstop_reason: " + str(final_message.stop_reason))
    print("output_tokens: " + str(final_message.usage.output_tokens))`
      }
    },
    {
      title: "Cache stable context and retry transient failures",
      detailMD: `This example marks a long stable policy block as ephemeral cacheable context, then retries rate limits and transient provider failures with exponential backoff and jitter. Real systems should also add concurrency limits and request tracing.`,
      code: {
        language: "python",
        label: "anthropic_cache_and_retry.py",
        body: `import os
import random
import time
from anthropic import Anthropic, APIConnectionError, APIStatusError, RateLimitError

client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

stable_policy = (
    "Refund policy: refunds are available within 30 days. "
    + "Enterprise contracts require account manager approval. "
    + "Never promise a billing outcome unless the provided policy supports it."
)

def ask_with_retry(question):
    for attempt in range(5):
        try:
            return client.messages.create(
                model="claude-3-5-haiku-latest",
                max_tokens=400,
                temperature=0.2,
                system=[
                    {
                        "type": "text",
                        "text": stable_policy,
                        "cache_control": {"type": "ephemeral"}
                    },
                    {
                        "type": "text",
                        "text": "Answer using only the policy. If unsupported, say I do not know."
                    }
                ],
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": question
                            }
                        ]
                    }
                ]
            )
        except RateLimitError as error:
            retry_after = None
            if error.response is not None:
                retry_after = error.response.headers.get("retry-after")
            if retry_after is not None:
                wait_seconds = float(retry_after)
            else:
                wait_seconds = min(30, (2 ** attempt) + random.random())
            time.sleep(wait_seconds)
        except APIConnectionError:
            wait_seconds = min(30, (2 ** attempt) + random.random())
            time.sleep(wait_seconds)
        except APIStatusError as error:
            if error.status_code not in [500, 529]:
                raise
            wait_seconds = min(30, (2 ** attempt) + random.random())
            time.sleep(wait_seconds)
    raise RuntimeError("Anthropic request failed after retry budget was exhausted")

message = ask_with_retry("Can this customer get a refund after 10 days?")
for block in message.content:
    if block.type == "text":
        print(block.text)
print("input_tokens: " + str(message.usage.input_tokens))
print("output_tokens: " + str(message.usage.output_tokens))`
      }
    }
  ],
  quiz: [
    {
      question: "Which field is required in an Anthropic Messages API request and controls the output token budget?",
      options: [
        "temperature",
        "max_tokens",
        "stop_reason",
        "usage"
      ],
      answerIndex: 1,
      explanationMD: `The Messages API requires max_tokens. It caps generated output tokens and helps control latency and cost.`
    },
    {
      question: "Where should stable system instructions be placed in an Anthropic Messages API call?",
      options: [
        "In a message with role system inside messages",
        "In the top-level system field",
        "In stop_sequence",
        "Only in the final assistant message"
      ],
      answerIndex: 1,
      explanationMD: `Anthropic uses a separate top-level system field. The messages array contains user and assistant turns.`
    },
    {
      question: "Why should client code iterate through response content blocks?",
      options: [
        "Because content can include typed blocks such as text and tool_use",
        "Because usage is stored inside each text character",
        "Because max_tokens is returned as a content block",
        "Because the system prompt is returned as the first block"
      ],
      answerIndex: 0,
      explanationMD: `Responses are block lists. A response can contain text, tool_use, or other typed blocks, so robust code should not assume one plain string.`
    },
    {
      question: "What does stop_reason equal to tool_use mean?",
      options: [
        "Claude has finished the final answer",
        "Claude exceeded the model context window",
        "Claude is asking the application to run a tool and return a tool_result",
        "The API key is invalid"
      ],
      answerIndex: 2,
      explanationMD: `tool_use means the application should inspect the tool request, run an allowed server-side tool, and send the result back in a later user message.`
    },
    {
      question: "When is prompt caching most useful?",
      options: [
        "For tiny prompts that are never reused",
        "For long stable context reused soon across requests",
        "For hiding API keys in browser code",
        "For replacing retry logic"
      ],
      answerIndex: 1,
      explanationMD: `Prompt caching is designed for long reusable prefixes such as policy, documentation, examples, or tool definitions. The default ephemeral cache has a 5-minute TTL.`
    },
    {
      question: "Which retry policy is safest for Anthropic API integrations?",
      options: [
        "Retry every error forever with no delay",
        "Retry only transient failures with exponential backoff, jitter, and retry-after support",
        "Never retry rate limits or overloaded responses",
        "Retry authentication failures until they work"
      ],
      answerIndex: 1,
      explanationMD: `Retry 429, connection, timeout, overloaded, and selected 5xx failures with bounded backoff. Do not retry permanent schema, model, or authentication errors.`
    }
  ],
  flashcards: [
    { front: "What is the main Anthropic endpoint for chat-style requests?", back: "The Messages API, which accepts model, required max_tokens, optional system, and a messages array." },
    { front: "Where does the system prompt go in Anthropic Messages API?", back: "In the top-level system field, not as a message role inside messages." },
    { front: "What roles are valid inside messages?", back: "User and assistant turns." },
    { front: "Why is content often a list?", back: "A list can hold typed blocks such as text, image, tool_use, and tool_result." },
    { front: "What does stop_reason max_tokens mean?", back: "The model hit the output token cap, so the response may be incomplete." },
    { front: "What does usage contain at minimum?", back: "input_tokens and output_tokens for token accounting." },
    { front: "What does ephemeral prompt caching do?", back: "Caches long stable prompt prefixes for a short TTL, commonly 5 minutes, so repeated reads are cheaper and faster." },
    { front: "How should rate limits be handled?", back: "Use bounded retries with exponential backoff, jitter, and retry-after support while avoiding retries for permanent errors." }
  ],
  cheatSheetMD: `## Anthropic API cheat sheet

### Request shape
- Use the **Messages API** for chat-style Claude calls.
- Required top-level fields: **model**, **max_tokens**, and **messages**.
- Optional top-level fields include **system**, **temperature**, **top_p**, **top_k**, **stop_sequences**, **stream**, and **tools**.
- **system** is top-level. It is not a message role.
- **messages** contains user and assistant turns in order.

### Content blocks
- **text**: ordinary natural-language content.
- **image**: visual input in user messages for supported models.
- **tool_use**: assistant block requesting that the application call a tool.
- **tool_result**: user block returning the result of a tool call.
- Iterate through the full content list. Do not assume the first block is the whole answer.

### Completion handling
- **end_turn**: normal completion.
- **max_tokens**: output budget reached; answer may be truncated.
- **stop_sequence**: caller-provided stop sequence was hit.
- **tool_use**: run an allowed tool and send a tool_result block back.
- Always log **usage.input_tokens** and **usage.output_tokens**.

### Sampling
- Lower **temperature** for extraction, classification, and support workflows.
- Higher **temperature** for brainstorming and varied drafts.
- Leave **top_p** and **top_k** at defaults unless evaluation shows a clear need.
- Change one sampling parameter at a time.

### Prompt caching
- Add **cache_control** with type **ephemeral** to long stable reusable blocks.
- Good candidates: policy manuals, product docs, examples, and tool definitions.
- Default ephemeral TTL is about 5 minutes.
- Cache writes and cache reads are billed separately; reads are much cheaper than uncached input.
- Track cache creation and cache read token counts to confirm savings.

### Streaming and errors
- Streaming uses server-sent events such as message_start, content_block_delta, message_delta, and message_stop.
- Handle stream errors as well as normal HTTP errors.
- Retry 429, timeouts, connection errors, overloaded responses, and selected 5xx errors.
- Respect retry-after, use exponential backoff with jitter, and cap attempts.
- Do not retry invalid requests, bad authentication, or malformed message schemas.`,
  references: [
    { title: "Anthropic Messages API", kind: "Docs", url: "https://docs.anthropic.com/en/api/messages", author: "Anthropic" },
    { title: "Anthropic Streaming Messages", kind: "Docs", url: "https://docs.anthropic.com/en/api/streaming", author: "Anthropic" },
    { title: "Anthropic Prompt Caching", kind: "Docs", url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching", author: "Anthropic" },
    { title: "Anthropic Errors", kind: "Docs", url: "https://docs.anthropic.com/en/api/errors", author: "Anthropic" }
  ],
  relatedLessons: [
    { slug: "calling-the-openai-api", note: "Compare provider-specific request shapes and response metadata." },
    { slug: "streaming-responses", note: "Goes deeper on server-sent event handling and UI streaming patterns." },
    { slug: "function-and-tool-calling", note: "Expands the tool_use and tool_result workflow into full tool orchestration." },
    { slug: "prompt-engineering-foundations", note: "Explains how to design the top-level system prompt and user instructions." }
  ]
};
