import type { GenAILessonContent } from "../types";

export const callingTheOpenaiApiContent: GenAILessonContent = {
  slug: "calling-the-openai-api",
  introductionMD: `Calling an LLM API is not just sending text to a model. A production call is a contract between your application and a hosted model service: choose the right endpoint, shape the conversation, control sampling, set output limits, handle rate limits, record usage, and turn provider errors into predictable product behavior.

OpenAI exposes two important interaction styles for beginner engineers to understand. The **Chat Completions API** is the classic chat-shaped endpoint built around a **messages** array with **system**, **user**, and **assistant** roles. The newer **Responses API** is a more general endpoint that can produce text, structured output, tool calls, and multimodal responses through one unified interface.

In interviews, strong candidates explain both the happy path and the operational path. They can describe request parameters such as **model**, **temperature**, **top_p**, **max_tokens** or **max_output_tokens**, **stop**, **seed**, and **n**; parse **choices**, **message.content**, and **finish_reason**; read the **usage** object; and design retries for 429s and transient server errors without accidentally duplicating work.`,
  realWorldMD: `OpenAI API calls sit behind chat products, support copilots, code assistants, summarizers, content generation workflows, extraction pipelines, and internal automation.

- A product backend turns user intent into a model request, stores the provider request id, and logs token usage for cost attribution.
- A support assistant uses low temperature, a bounded output size, and retries with exponential backoff when it hits RPM or TPM limits.
- A workflow engine chooses the Responses API when it needs structured outputs, tool calling, streaming, or a single interface for future multimodal work.`,
  learningObjectives: [
    "Build a complete Chat Completions request with messages, roles, model selection, sampling parameters, output limits, and stop conditions.",
    "Explain how the Responses API differs from Chat Completions and when a new application should prefer it.",
    "Read response objects, including choices, assistant message content, finish_reason, request ids, and token usage.",
    "Map prompt and completion tokens to latency, context limits, rate limits, and provider cost.",
    "Handle authentication failures, 429 rate limits, context length errors, and transient server errors with the right retry behavior.",
    "Know when to use streaming responses, structured outputs, or tool calling instead of a plain text completion."
  ],
  theory: [
    {
      label: "Two endpoint mental models",
      detailMD: `The **Chat Completions API** is conversation-first. You send **messages**, where each message has a **role** and **content**. The model returns one or more **choices**, and each choice contains an assistant message plus a **finish_reason**. This endpoint is easy to teach, easy to debug, and still widely used in existing systems.

The **Responses API** is task-first and more general. It accepts **input** that can be a string or message-like items and can return text, structured output, tool calls, reasoning details for supported models, and multimodal content. For new applications, it is often the better default because it unifies capabilities that used to require multiple endpoint-specific shapes. A strong engineer can maintain legacy Chat Completions code while designing new integrations around Responses where appropriate.`
    },
    {
      label: "Messages and roles are the application contract",
      detailMD: `In Chat Completions, the **messages** array carries the conversation state. A **system** message defines durable behavior: role, tone, source-of-truth rules, safety boundaries, and output expectations. A **user** message carries the current task, user input, or retrieved context. An **assistant** message represents prior model output and can be used to preserve conversation state or provide examples.

Role placement matters. If stable policy is placed in a user message, it becomes easier for later user text to conflict with it. If untrusted retrieved content is mixed with instructions, the model may treat data as commands. A clean messages array separates policy, evidence, user request, and prior assistant turns so failures are easier to reproduce.`
    },
    {
      label: "Core request parameters control behavior and cost",
      detailMD: `The **model** parameter selects the capability, latency, context window, and price point. **temperature** controls randomness; lower values are better for extraction and support workflows, while higher values can help brainstorming. **top_p** is nucleus sampling; most teams tune either temperature or top_p, not both at once, because changing both makes behavior harder to reason about.

Output limits protect latency and cost. Chat Completions commonly uses **max_tokens** for generated output, while Responses commonly uses **max_output_tokens**. **stop** sequences cut generation when a delimiter appears. **seed** can make sampling more repeatable for debugging when supported, but it is not a hard determinism guarantee. **n** asks for multiple completions and multiplies output cost, so it should be used deliberately.`
    },
    {
      label: "Response shape tells you what happened",
      detailMD: `A Chat Completions response usually contains an id, model, timestamp-like metadata, **choices**, and **usage**. Each choice has an **index**, a **message** with assistant content, and a **finish_reason** such as stop, length, content filtering, or tool calls depending on the model and endpoint behavior. If finish_reason is length, the model hit the output limit and the answer may be incomplete.

The Responses API often exposes convenience text such as **output_text** plus richer output items. Even when a helper field exists, production code should still check whether the response completed normally, whether output was truncated, whether a tool call was requested, and whether usage was recorded. Treat the response as structured data, not just a string.`
    },
    {
      label: "Token accounting is product accounting",
      detailMD: `The **usage** object is the bridge between model behavior and business cost. In Chat Completions, usage commonly reports **prompt_tokens**, **completion_tokens**, and **total_tokens**. In Responses, the names often map to **input_tokens**, **output_tokens**, and **total_tokens**. Input or prompt tokens come from system messages, user messages, assistant history, retrieved context, schemas, and tool definitions. Output or completion tokens are generated by the model.

Cost is usually calculated as input tokens times the input price plus output tokens times the output price, often priced per million tokens. Long conversation history, verbose retrieved context, multiple choices with **n**, and retries all increase cost. Logging usage by feature, tenant, prompt version, and model is what lets teams debug runaway bills and build fair quotas.`
    },
    {
      label: "Rate limits are capacity contracts",
      detailMD: `OpenAI rate limits are commonly expressed as requests per minute, or RPM, and tokens per minute, or TPM. RPM limits how many calls you make; TPM limits the sum of input and output tokens flowing through the model. A short high-volume classification endpoint may hit RPM first, while a RAG assistant with long context may hit TPM first.

When the service returns 429, the application should back off, add jitter, honor retry headers when available, and retry only when the operation is safe. For interactive products, show a graceful temporary message after the retry budget is exhausted. For background jobs, queue and reschedule work rather than spinning hot loops that worsen the limit.`
    }
  ],
  requestFlow: [
    {
      step: "1. Choose endpoint and model",
      detailMD: `Start with the product need. Use Chat Completions when maintaining chat-shaped legacy code or teaching the basic message model. Prefer Responses for new work that may need structured output, tool calling, streaming, or multimodal inputs. Then choose a model based on capability, latency, context window, and token price.`
    },
    {
      step: "2. Build the conversation or input",
      detailMD: `For Chat Completions, create a **messages** array. Put durable rules in the system role, the current task in the user role, and previous assistant outputs only when conversation continuity is needed. For Responses, provide **input** as plain text or message-like items, keeping the same discipline around policy and user data.`
    },
    {
      step: "3. Set generation controls",
      detailMD: `Set **temperature**, **top_p**, **max_tokens** or **max_output_tokens**, **stop**, **seed**, and **n** intentionally. For deterministic product workflows, start with a low temperature, one completion, and a tight output cap. For creative drafting, allow more randomness and larger output, then add review or validation.`
    },
    {
      step: "4. Send the request with trace metadata",
      detailMD: `Call the provider from a server-side component, not directly from an untrusted browser with a secret key. Attach your own operation id or job id in logs, store the provider request id when the SDK exposes it, and record prompt version, model, endpoint, and user or tenant context allowed by your privacy policy.`
    },
    {
      step: "5. Parse the response deliberately",
      detailMD: `For Chat Completions, read **choices[0].message.content** for the common one-choice case and check **finish_reason** before trusting the answer. For Responses, read the generated text helper or walk the output items, depending on whether the call returned plain text, structured output, or tool calls.`
    },
    {
      step: "6. Record usage and estimate cost",
      detailMD: `Read **usage** and split input tokens from output tokens. Calculate approximate cost using the model pricing table that was active for the request. Store total tokens, latency, model, status, retry count, and feature name so finance and engineering can identify expensive prompts.`
    },
    {
      step: "7. Handle errors and retries",
      detailMD: `Return immediately on authentication and permission errors because retries will not fix bad credentials. Retry 429s and 5xx errors with exponential backoff and jitter. For context length errors, shrink the prompt, summarize history, or select a larger-context model instead of blindly retrying the same payload.`
    },
    {
      step: "8. Validate and deliver",
      detailMD: `Before showing or using the output, validate format, safety, citations, and business rules. If the feature needs incremental display, use the **streaming-responses** lesson. If the result must be machine-parseable, use **structured-outputs**. If the model must call external actions, use **function-and-tool-calling**.`
    }
  ],
  deepDives: [
    {
      label: "Chat Completions versus Responses in practice",
      detailMD: `Chat Completions is excellent for understanding the basic conversation loop: send messages, receive choices, append the assistant response, and continue. Many production systems still use it because the data model is stable and simple.

Responses is better when the application needs a unified surface for text generation, structured outputs, tool calls, streaming, and future multimodal behavior. It reduces endpoint sprawl and makes it easier to standardize logging around one response object shape. The tradeoff is that teams migrating from Chat Completions must update parsing logic and learn output item semantics rather than assuming every answer is just **choices[0].message.content**.`
    },
    {
      label: "Sampling parameters and repeatability",
      detailMD: `Temperature and top_p both affect diversity. A low temperature narrows likely tokens and improves repeatability for classification, extraction, and support answers. A higher temperature can make drafts, brainstorming, and alternate phrasings more varied. Top_p trims the candidate set to a probability mass, which can also reduce unusual tokens.

In production, tune one sampling control at a time and record the values with every request. **seed** can help reproduce a surprising output when supported by the endpoint and model, but infrastructure, model updates, and parallelism mean it should be treated as a debugging aid rather than a compliance guarantee.`
    },
    {
      label: "Output limits, stop sequences, and truncation",
      detailMD: `Output caps keep latency and cost bounded. If **max_tokens** or **max_output_tokens** is too low, the model may stop mid-sentence or return incomplete JSON. If the cap is too high, a prompt bug can generate expensive rambling. The right cap comes from the expected output shape plus a buffer for edge cases.

Stop sequences are useful when you have a known delimiter, such as ending before a new section marker. They can also cut off useful text if the delimiter appears naturally in the answer. Always inspect **finish_reason**. A normal stop is different from a length stop, and a length stop often means the user-facing answer or downstream parse should be treated as incomplete.`
    },
    {
      label: "Token usage maps to cost and limits",
      detailMD: `Prompt tokens and completion tokens are usually billed at different rates. A long system prompt, chat history, retrieved documents, tool schemas, and examples all count as input. Generated text, JSON fields, tool-call arguments, and multiple choices count as output.

Rate limits also depend on token volume. A single request with 80,000 input tokens can consume more TPM than hundreds of short classification calls. Cost controls should therefore include prompt trimming, history summarization, retrieval limits, model routing, output caps, and alerts on token spikes by feature or tenant.`
    },
    {
      label: "429 handling is a system design problem",
      detailMD: `A 429 is not a random exception. It usually means your application exceeded RPM, TPM, or a quota. The correct response is exponential backoff with jitter, honoring provider retry timing when available, and reducing concurrency if the backlog keeps growing. Retrying every worker immediately can amplify the outage.

Interactive flows should retry a small number of times and then give a friendly temporary failure. Batch flows should use queues, delayed retries, and idempotent job state. If traffic is predictable, add client-side throttling or a server-side LLM gateway that schedules requests against model-specific limits.`
    },
    {
      label: "Idempotency and request ids",
      detailMD: `LLM calls are often read-like, but applications may attach side effects around them: charging a user, writing a generated record, sending an email, or advancing a workflow. Use your own idempotency key for the business operation so a retry does not duplicate the side effect. Store the model response against that operation id when possible.

Provider request ids are for traceability. Log the request id exposed by the SDK or response headers, along with your own correlation id. When support or provider teams investigate latency, safety filters, or unexpected outputs, this id is often the fastest path from an application bug report to the exact provider-side request.`
    }
  ],
  productionConsiderations: [
    {
      label: "Error taxonomy and retry policy",
      detailMD: `Authentication errors, permission errors, and missing model access should fail fast and alert the operator because retries will not fix configuration. Rate limit errors can be retried with backoff. Context length errors need prompt reduction or model routing. Server errors and network timeouts can be retried if the surrounding operation is idempotent. Content policy or safety errors need product handling, not blind retry loops.`
    },
    {
      label: "Observability and cost attribution",
      detailMD: `Log endpoint, model, prompt version, token usage, status code, finish reason, latency, retry count, request id, tenant or feature tag, and validation result. Avoid logging sensitive prompt content unless policy allows it. Aggregating usage by feature lets teams catch regressions such as a prompt template accidentally including full chat history or retrieved documents that are too large.`
    },
    {
      label: "Secrets and network placement",
      detailMD: `API keys belong on the server side or in a controlled backend service, never in a public client. Use environment variables or a secret manager, rotate keys, and scope access by environment. For enterprise systems, route calls through an internal gateway when you need central audit logging, model allowlists, quota enforcement, or tenant-specific policy.`
    },
    {
      label: "Fallbacks and user experience",
      detailMD: `A resilient product defines what happens when the model is slow, rate limited, or unavailable. Options include a smaller fallback model, a cached answer, a queue for background completion, a non-AI fallback workflow, or a clear message asking the user to retry later. The fallback should preserve trust rather than hiding failures behind low-quality output.`
    }
  ],
  interview: {
    whatInterviewersLookFor: [
      "A clear distinction between Chat Completions and Responses, including why new applications may prefer Responses.",
      "Correct use of messages, roles, request parameters, response parsing, finish reasons, and usage accounting.",
      "Operational maturity around RPM, TPM, 429 retries, error taxonomy, idempotency, request ids, logging, and cost controls.",
      "Ability to choose streaming, structured outputs, or tool calling when plain text generation is the wrong abstraction."
    ],
    followUps: [
      {
        question: "How would you explain the messages array to a backend engineer new to LLMs?",
        answerMD: `It is the serialized conversation and instruction contract. The system role holds stable application behavior, the user role holds the current request and input, and assistant messages hold prior model outputs or examples. The model predicts the next assistant message from that context, so role boundaries and ordering directly affect behavior.`
      },
      {
        question: "What should your service do when OpenAI returns a 429?",
        answerMD: `First classify it as a rate limit or quota event, then retry only safe operations with exponential backoff and jitter. Honor retry timing if the provider gives it. Track retry count, reduce concurrency when many workers are failing, and surface a graceful temporary failure after the retry budget is exhausted. For batch jobs, requeue with delay instead of hot-looping.`
      },
      {
        question: "How do prompt tokens and completion tokens affect cost?",
        answerMD: `Prompt or input tokens come from everything you send: system instructions, user content, history, retrieved context, schemas, and tool definitions. Completion or output tokens are generated by the model. Providers often price input and output differently, so estimated cost is input tokens times input price plus output tokens times output price. Multiple completions and retries multiply the bill.`
      },
      {
        question: "When would you choose Responses over Chat Completions?",
        answerMD: `For a new application, choose Responses when you want one endpoint for text, structured output, tool calls, streaming, and multimodal inputs. Keep Chat Completions when you are maintaining an existing chat-shaped integration or need the simplest possible conversation example. The decision is less about model intelligence and more about endpoint capabilities and response parsing.`
      },
      {
        question: "What is the difference between a request id and an idempotency key?",
        answerMD: `A request id is provider trace metadata for debugging a specific API call. An idempotency key is an application-level business key that prevents duplicate side effects when retries happen. You log both: the request id for provider support and the idempotency key to make your workflow safe.`
      }
    ],
    alternativeDesigns: [
      {
        name: "Direct provider call from one backend service",
        detailMD: `The product service calls OpenAI directly and owns prompts, retries, logging, and cost tracking. This is simple and fast for a small application, but policy, quota, and observability logic can become duplicated as more teams add LLM features.`
      },
      {
        name: "Internal LLM gateway",
        detailMD: `All product services call an internal gateway that centralizes provider keys, model allowlists, rate limiting, retries, audit logs, and usage attribution. This adds one hop and operational ownership, but it is often the right design for multi-team or enterprise environments.`
      },
      {
        name: "Asynchronous job pipeline",
        detailMD: `The application writes generation tasks to a queue and workers call the API under controlled concurrency. This is better for batch summarization, document processing, and expensive long-context work because retries, backpressure, and idempotency are easier to manage than in a synchronous request path.`
      }
    ],
    commonMistakes: [
      "Putting API keys in browser code or mobile apps instead of a server-side boundary.",
      "Retrying all errors the same way, including authentication failures and context length errors that cannot succeed unchanged.",
      "Ignoring finish_reason and treating truncated output as complete.",
      "Logging generated text but not usage, model, request id, prompt version, retry count, or validation result."
    ]
  },
  interviewHints: [
    "Start with the request shape: endpoint, model, messages or input, and parameters.",
    "Then describe the response shape: choices, message content, finish_reason, request id, and usage.",
    "Move into operations: tokens drive cost and TPM, requests drive RPM, and 429s need backoff with jitter.",
    "Close by naming when to switch to streaming, structured outputs, or tool calling."
  ],
  playground: {
    descriptionMD: `This static playground shows a conservative support-triage call. It uses Chat Completions vocabulary because the messages array is the clearest beginner mental model, while the same task could be sent through Responses with **input** and **max_output_tokens**.`,
    systemPrompt: `You are a careful support triage assistant.
Use only the ticket text provided by the user.
Return a concise answer with three sections: summary, urgency, and next action.
If the ticket does not contain enough evidence, say I do not know from the ticket.`,
    userPrompt: `Ticket:
The customer says exports have failed three times today. They are on the Pro plan, and the admin page shows the export job as queued for more than 40 minutes. They ask whether data was lost.

Task:
Summarize the issue, classify urgency as low, medium, or high, and recommend the next support action.`,
    parameters: [
      { name: "endpoint", value: "chat.completions", note: "Useful for teaching messages and roles; Responses is the preferred general endpoint for many new apps." },
      { name: "model", value: "gpt-4o-mini", note: "A cost-effective model is enough for short triage when the prompt is clear." },
      { name: "temperature", value: "0.2", note: "Low randomness improves repeatability." },
      { name: "top_p", value: "1", note: "Leave top_p at the default when tuning temperature." },
      { name: "max_tokens", value: "220", note: "Small output cap reduces cost and protects latency." },
      { name: "seed", value: "42", note: "Helpful for debugging repeatability when supported." },
      { name: "n", value: "1", note: "One choice avoids multiplying cost." }
    ],
    sampleOutputMD: `Expected shape:

Summary: Export jobs have failed or remained queued for more than 40 minutes for a Pro customer.

Urgency: High.

Next action: Check export job status and logs, confirm whether data loss occurred, and update the customer with verified status. Do not claim data was lost unless logs prove it.

After the call, the application should inspect finish_reason and usage before storing the result.`
  },
  comparisons: [
    {
      title: "Chat Completions versus Responses",
      columns: ["Dimension", "Chat Completions", "Responses"],
      rows: [
        ["Primary shape", "messages array with system, user, and assistant roles", "input plus output items across text, tools, structure, and multimodal content"],
        ["Best fit", "Existing chat integrations and simple conversation examples", "New applications needing one general generation interface"],
        ["Common text read path", "choices[0].message.content", "output_text helper or traversal of output items"],
        ["Output limit name", "max_tokens for generated tokens", "max_output_tokens for generated tokens"],
        ["Extensibility", "Chat-first, with additional features depending on model support", "Designed as a unified surface for newer capabilities"]
      ]
    },
    {
      title: "Request parameters",
      columns: ["Parameter", "What it controls", "Production guidance"],
      rows: [
        ["model", "Capability, latency, context window, and price", "Route by task complexity and record the exact model used"],
        ["temperature", "Randomness in token selection", "Use low values for extraction and support workflows"],
        ["top_p", "Probability mass considered during sampling", "Usually tune either top_p or temperature, not both"],
        ["max_tokens or max_output_tokens", "Maximum generated output", "Cap output to protect latency and cost"],
        ["stop", "Sequences that end generation early", "Use only when delimiters are reliable"],
        ["seed", "Repeatability aid when supported", "Useful for debugging, not a strict determinism guarantee"],
        ["n", "Number of candidate completions", "Avoid in cost-sensitive paths unless comparing alternatives"]
      ]
    },
    {
      title: "Error handling taxonomy",
      columns: ["Error class", "Typical cause", "Retry behavior", "Product action"],
      rows: [
        ["Authentication or permission", "Bad key, expired key, missing model access", "Do not retry unchanged", "Alert operator and fail safely"],
        ["Rate limit 429", "RPM, TPM, or quota exceeded", "Retry with exponential backoff and jitter", "Throttle, queue, or ask user to retry later"],
        ["Context length", "Prompt plus expected output exceeds context window", "Do not retry unchanged", "Trim context, summarize history, or route to larger context"],
        ["Server or network", "Provider 5xx, timeout, transient connection issue", "Retry if operation is idempotent", "Fallback after retry budget"],
        ["Validation failure", "Output is malformed or violates product schema", "Retry with repair only when safe", "Validate, repair, or ask for human review"]
      ]
    }
  ],
  decisionGuideMD: `## Choosing the right OpenAI API pattern

### Use Chat Completions when
- You are maintaining an existing chat-shaped integration.
- You want the simplest teaching model for **system**, **user**, and **assistant** roles.
- Your output is plain assistant text and **choices[0].message.content** is enough.

### Use Responses when
- You are building a new application and want one endpoint for text, structured output, streaming, tool calls, and multimodal inputs.
- You want a response model that can grow beyond plain chat messages.
- You are already planning to use the related **structured-outputs**, **streaming-responses**, or **function-and-tool-calling** lessons.

### Use streaming responses when
- The answer is long enough that users benefit from seeing partial output.
- Perceived latency matters more than receiving the whole completion at once.
- Your UI and backend can handle partial tokens, cancellation, and final usage accounting.

### Use structured outputs when
- Downstream software must parse the result.
- You need schemas, typed fields, allowed values, or reliable validation.
- A plain text answer would create brittle parsing code.

### Use tool calling when
- The model must request an external action such as search, database lookup, calendar write, or payment workflow.
- The application must control which tools exist, validate arguments, execute tools server-side, and feed results back to the model.

### Production default
Start with the simplest endpoint that satisfies the product need, then add constraints. Use low temperature, one completion, explicit output caps, request logging, usage tracking, and a retry policy. Move complexity into Responses, structured outputs, streaming, or tool calling only when the product requirement justifies it.`,
  handsOn: [
    {
      title: "Build a Chat Completions request and read usage",
      detailMD: `This Python example creates a chat request, retries transient failures, reads the assistant message, checks finish_reason, logs the provider request id when exposed by the SDK, and estimates token cost from usage. Replace the sample prices with the current prices for your selected model.`,
      code: {
        language: "python",
        label: "chat_completion_usage.py",
        body: `import os
import random
import time
from openai import OpenAI

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

messages = [
    {
        "role": "system",
        "content": "You are a careful support triage assistant. Use only the ticket text."
    },
    {
        "role": "user",
        "content": "Ticket: Exports failed three times today and one job has been queued for 40 minutes. Summarize the issue and recommend the next action."
    }
]

def create_chat_completion_with_retries():
    delay_seconds = 1.0
    for attempt in range(5):
        try:
            return client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.2,
                top_p=1,
                max_tokens=300,
                stop=None,
                seed=42,
                n=1
            )
        except Exception as exc:
            status_code = getattr(exc, "status_code", None)
            can_retry = status_code == 429 or (status_code is not None and status_code >= 500)
            if not can_retry or attempt == 4:
                raise
            sleep_seconds = delay_seconds + random.random()
            time.sleep(sleep_seconds)
            delay_seconds = delay_seconds * 2

response = create_chat_completion_with_retries()
choice = response.choices[0]
usage = response.usage

print("request_id: " + str(getattr(response, "_request_id", "not available")))
print("assistant_message: " + str(choice.message.content))
print("finish_reason: " + str(choice.finish_reason))
print("prompt_tokens: " + str(usage.prompt_tokens))
print("completion_tokens: " + str(usage.completion_tokens))
print("total_tokens: " + str(usage.total_tokens))

input_price_per_million = 0.15
output_price_per_million = 0.60
estimated_cost_usd = (usage.prompt_tokens / 1000000 * input_price_per_million) + (usage.completion_tokens / 1000000 * output_price_per_million)
print("estimated_cost_usd: " + format(estimated_cost_usd, ".6f"))

if choice.finish_reason == "length":
    print("warning: output may be truncated")`
      }
    },
    {
      title: "Send the same task through the Responses API",
      detailMD: `The newer Responses API uses **input** and **max_output_tokens**. The exact output traversal can vary by response type, but plain text helpers and usage fields make the common case straightforward.`,
      code: {
        language: "python",
        label: "responses_api_usage.py",
        body: `import os
from openai import OpenAI

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

response = client.responses.create(
    model="gpt-4o-mini",
    input=[
        {
            "role": "system",
            "content": "You are a careful support triage assistant. Use only the ticket text."
        },
        {
            "role": "user",
            "content": "Ticket: Export jobs failed three times today. Summarize the issue, urgency, and next action."
        }
    ],
    temperature=0.2,
    max_output_tokens=300
)

usage = response.usage
print("request_id: " + str(getattr(response, "_request_id", "not available")))
print("output_text: " + str(response.output_text))
print("input_tokens: " + str(usage.input_tokens))
print("output_tokens: " + str(usage.output_tokens))
print("total_tokens: " + str(usage.total_tokens))`
      }
    },
    {
      title: "Classify retry behavior before writing code",
      detailMD: `A retry helper should start from error taxonomy. This small function shows the policy decision separately from the SDK call so tests can cover it without hitting the provider.`,
      code: {
        language: "python",
        label: "retry_policy.py",
        body: `def retry_decision(status_code, error_type):
    if status_code == 401 or status_code == 403:
        return "do_not_retry_auth_or_permission"
    if status_code == 429:
        return "retry_with_backoff_and_jitter"
    if error_type == "context_length_exceeded":
        return "shrink_prompt_or_choose_larger_context"
    if status_code is not None and status_code >= 500:
        return "retry_if_operation_is_idempotent"
    if error_type == "validation_failed":
        return "repair_or_fallback"
    return "inspect_before_retrying"

cases = [
    {"status_code": 401, "error_type": "auth"},
    {"status_code": 429, "error_type": "rate_limit"},
    {"status_code": 400, "error_type": "context_length_exceeded"},
    {"status_code": 503, "error_type": "server_error"}
]

for case in cases:
    decision = retry_decision(case["status_code"], case["error_type"])
    print(str(case["status_code"]) + ": " + decision)`
      }
    }
  ],
  quiz: [
    {
      question: "What is the main purpose of the system role in a Chat Completions messages array?",
      options: [
        "To hold stable application behavior, boundaries, tone, and source-of-truth rules",
        "To store the API key for the request",
        "To count completion tokens before the model runs",
        "To force the model to ignore all user messages"
      ],
      answerIndex: 0,
      explanationMD: `The system role carries durable instructions that should apply across the conversation, while the user role carries the current task and input.`
    },
    {
      question: "Which parameter name is commonly used by the Responses API to cap generated output?",
      options: [
        "max_output_tokens",
        "prompt_tokens",
        "rpm_limit",
        "choice_count"
      ],
      answerIndex: 0,
      explanationMD: `Chat Completions commonly uses max_tokens, while Responses commonly uses max_output_tokens for generated output limits.`
    },
    {
      question: "What does a finish_reason of length usually mean?",
      options: [
        "The model refused because authentication failed",
        "The generated answer hit the output token limit and may be incomplete",
        "The request did not count toward token usage",
        "The API automatically retried the request"
      ],
      answerIndex: 1,
      explanationMD: `A length finish reason indicates truncation at the configured output cap or context boundary, so the application should not assume the answer is complete.`
    },
    {
      question: "How should a production service usually handle a 429 rate limit error?",
      options: [
        "Retry immediately in a tight loop until it succeeds",
        "Delete conversation history and retry with the same concurrency",
        "Use exponential backoff with jitter and honor retry timing when available",
        "Treat it as a successful empty response"
      ],
      answerIndex: 2,
      explanationMD: `429s indicate rate or quota pressure. Backoff, jitter, throttling, and delayed queues prevent the application from making the overload worse.`
    },
    {
      question: "Which statement best describes token usage and cost?",
      options: [
        "Only generated output tokens are billed or limited",
        "Prompt tokens and completion tokens both matter, and they may have different prices",
        "The seed parameter determines the final bill",
        "n reduces output cost by sharing tokens across choices"
      ],
      answerIndex: 1,
      explanationMD: `Input and output tokens both count toward usage, limits, latency, and cost. Multiple choices and retries can multiply generated token cost.`
    },
    {
      question: "When should a plain text API call be replaced with tool calling?",
      options: [
        "When the model must request an external action that the application validates and executes",
        "Whenever temperature is lower than one",
        "Only when the prompt has no system message",
        "When you want to avoid all server-side authorization"
      ],
      answerIndex: 0,
      explanationMD: `Tool calling is appropriate when the model needs to ask the application to run controlled external functions such as lookup, search, write, or workflow actions.`
    }
  ],
  flashcards: [
    { front: "What is the Chat Completions mental model?", back: "Send a messages array with roles and receive choices containing assistant messages and finish reasons." },
    { front: "What is the Responses API mental model?", back: "Send input to a unified endpoint that can return text, structured outputs, tool calls, streaming output, and multimodal results depending on the request." },
    { front: "What belongs in the system role?", back: "Stable behavior such as role, tone, source-of-truth rules, safety boundaries, and output expectations." },
    { front: "What does temperature control?", back: "The randomness of token selection; lower values are more repeatable and higher values are more varied." },
    { front: "Why inspect finish_reason?", back: "It tells whether generation stopped normally, hit a length limit, was filtered, or ended for another endpoint-specific reason." },
    { front: "What does usage measure?", back: "Input or prompt tokens, output or completion tokens, and total tokens used by the request." },
    { front: "What do RPM and TPM mean?", back: "Requests per minute and tokens per minute, the two common dimensions of provider rate limits." },
    { front: "Why log provider request ids?", back: "They let you trace a specific API call when debugging latency, failures, safety behavior, or provider support cases." }
  ],
  cheatSheetMD: `## Calling the OpenAI API cheat sheet

### Endpoint choice
- **Chat Completions**: best for existing chat-shaped apps and learning messages plus roles.
- **Responses**: preferred general surface for many new apps, especially structured outputs, tools, streaming, and multimodal work.

### Message roles
- **System**: durable behavior, boundaries, tone, output rules, source-of-truth policy.
- **User**: current task, user input, retrieved context, fresh constraints.
- **Assistant**: previous model outputs or examples that form conversation state.

### Core parameters
- **model**: capability, latency, context window, and price.
- **temperature**: randomness; lower for repeatability, higher for creative variety.
- **top_p**: nucleus sampling; tune separately from temperature.
- **max_tokens**: Chat Completions output cap.
- **max_output_tokens**: Responses output cap.
- **stop**: sequence that ends generation early.
- **seed**: repeatability aid when supported, not a hard guarantee.
- **n**: number of choices; increases output cost.

### Response parsing
- Chat Completions common path: read **choices[0].message.content**.
- Check **finish_reason** before trusting the answer.
- Responses common path: use **output_text** for plain text or traverse output items for richer results.
- Store provider request id when exposed for traceability.

### Usage and cost
- Chat Completions: **prompt_tokens**, **completion_tokens**, **total_tokens**.
- Responses: **input_tokens**, **output_tokens**, **total_tokens**.
- Estimated cost equals input tokens times input price plus output tokens times output price.
- Long context, schemas, chat history, retrieved documents, **n**, and retries all increase cost.

### Rate limits and retries
- RPM limits request count.
- TPM limits token volume.
- Retry 429 and transient 5xx errors with exponential backoff and jitter.
- Do not retry authentication, permission, or context length errors unchanged.
- Use queues and concurrency limits for batch workloads.

### When to use related patterns
- Use **streaming-responses** for long answers and better perceived latency.
- Use **structured-outputs** when downstream code must parse fields reliably.
- Use **function-and-tool-calling** when the model needs controlled external actions.

### Interview answer shape
1. Name endpoint and model.
2. Build messages or Responses input with clear roles.
3. Set parameters for randomness, output cap, stop, seed, and n.
4. Parse choices or output items and inspect finish_reason.
5. Read usage and estimate cost.
6. Handle rate limits, errors, idempotency, and request ids.
7. Escalate to streaming, structured outputs, or tool calling when needed.`,
  references: [
    { title: "OpenAI API Reference", kind: "Docs", url: "https://platform.openai.com/docs/api-reference", author: "OpenAI" },
    { title: "OpenAI Responses API Guide", kind: "Docs", url: "https://platform.openai.com/docs/guides/responses", author: "OpenAI" },
    { title: "OpenAI Text Generation Guide", kind: "Docs", url: "https://platform.openai.com/docs/guides/text-generation", author: "OpenAI" },
    { title: "OpenAI Rate Limits Guide", kind: "Docs", url: "https://platform.openai.com/docs/guides/rate-limits", author: "OpenAI" }
  ],
  relatedLessons: [
    { slug: "prompt-engineering-foundations", note: "Shows how to write the system and user instructions that become API messages." },
    { slug: "streaming-responses", note: "Use when latency and incremental display matter more than waiting for a full response." },
    { slug: "structured-outputs", note: "Use when the API response must match a schema and feed downstream software." },
    { slug: "function-and-tool-calling", note: "Use when the model needs to request external actions through controlled application tools." }
  ]
};
