import type { GenAILessonContent } from "../types";

export const callingTheGeminiApiContent: GenAILessonContent = {
  slug: "calling-the-gemini-api",
  introductionMD: `Calling the Google Gemini API means sending a structured generation request to a Gemini model and treating the response as one component in an application, not as a magic text box. The core API is **generateContent** for complete responses and **streamGenerateContent** for incremental responses. Both use the same mental model: conversation turns live in **contents**, each turn has a role, and each turn contains a list of parts.

In interviews, a strong beginner answer does more than say call the endpoint with a prompt. It explains how text, images, audio, video, and file references become parts; how **systemInstruction**, **generationConfig**, **safetySettings**, and tools change behavior; how blocked prompts and blocked candidates surface; and how usage metadata, quota errors, and retries are handled in production.

The practical goal is reliability. A Gemini request should be explicit about what the model should do, what media it should inspect, what output shape is expected, what safety thresholds apply, and how the client will respond to streaming, grounding, long context, and errors.`,
  realWorldMD: `Gemini API calls show up in document assistants, image understanding workflows, customer support copilots, research tools, coding assistants, and multimodal extraction pipelines.

- A receipt scanner sends text instructions plus an image part and asks for structured JSON.
- A video review tool sends a file reference and asks for timestamped findings.
- A research assistant enables Google Search grounding so answers can cite fresh web evidence.
- A chat product streams tokens to the UI while recording usageMetadata for cost and quota monitoring.
- A production gateway retries transient failures, handles 429 quota responses, and treats safety blocks as first-class outcomes.`,
  learningObjectives: [
    "Explain the difference between generateContent and streamGenerateContent and when to use each one.",
    "Build a Gemini contents array with user and model roles and multiple parts.",
    "Represent multimodal inputs with text parts, inline media data, and file references.",
    "Use systemInstruction, generationConfig, responseMimeType, and responseSchema to shape model behavior.",
    "Interpret safetySettings, promptFeedback, finishReason SAFETY, and usageMetadata correctly.",
    "Plan for Google Search grounding, long context windows, quota limits, retries, and production error handling."
  ],
  theory: [
    {
      label: "generateContent is the standard request-response API",
      detailMD: `The **generateContent** API sends a complete request and waits for a complete model response. It is the right default for short prompts, structured extraction, offline jobs, and server-side workflows where the caller does not need token-by-token display.

The request usually includes a model name, **contents**, optional **systemInstruction**, optional **generationConfig**, optional **safetySettings**, and optional **tools** such as Google Search grounding. The response returns candidates, finish reasons, safety ratings, prompt feedback, and usage metadata. Treat all of those fields as part of the API contract, not as debugging extras.`
    },
    {
      label: "streamGenerateContent improves perceived latency",
      detailMD: `The **streamGenerateContent** API returns partial chunks as the model generates. It is useful for chat interfaces, long answers, coding assistants, and any product where users should see progress before the final response is complete.

Streaming does not remove the need for final validation. The client still has to assemble chunks, watch for the final finish reason, handle network interruption, and decide what to do if the output is incomplete or blocked. For structured JSON, many teams prefer non-streaming generation or buffer the stream until the final object can be validated.`
    },
    {
      label: "contents contains roles and a list of parts",
      detailMD: `Gemini requests use a **contents** array to represent conversation turns. A turn has a role, usually **user** for user or application input and **model** for prior model output in a multi-turn conversation. Each turn contains **parts**, and parts is a list because one turn can combine several inputs: text instructions, an image, an audio clip, a video reference, or separate text sections.

This design matters for multimodal applications. Instead of flattening everything into one string, the request can preserve boundaries between instruction text and media. It also allows follow-up turns to include prior model messages, which is how a stateless HTTP call can carry conversation state.`
    },
    {
      label: "Multimodal parts can be inline data or file references",
      detailMD: `A text-only request uses text parts. A multimodal request can add inline image, audio, or video bytes with a MIME type, or it can reference media uploaded through a file service. Inline data is convenient for small payloads. File references are better for larger media, repeated use, and long videos or documents that should not be embedded in every request body.

Parts should be ordered intentionally. Put the instruction text near the media it describes, label what the model should inspect, and avoid mixing unrelated tasks in one turn. Long context windows make large inputs possible, but clear structure still improves accuracy and reduces cost.`
    },
    {
      label: "systemInstruction and generationConfig shape behavior",
      detailMD: `**systemInstruction** holds durable guidance such as role, tone, source-of-truth rules, and output discipline. It should not contain user-specific untrusted text. The live task and payload belong in **contents**.

**generationConfig** controls sampling and output constraints. **temperature** changes randomness, **topP** and **topK** control nucleus and candidate-token sampling, **maxOutputTokens** caps response length, **responseMimeType** can request JSON, and **responseSchema** can describe the expected structure for structured output. For extraction, use low temperature and a schema. For creative drafts, allow more randomness and more output budget.`
    },
    {
      label: "Safety, grounding, and usage fields are first-class signals",
      detailMD: `**safetySettings** let the application configure harm categories and thresholds, such as harassment, hate speech, sexually explicit content, dangerous content, and civic integrity where supported. Thresholds such as BLOCK_LOW_AND_ABOVE, BLOCK_MEDIUM_AND_ABOVE, and BLOCK_ONLY_HIGH define when content is blocked. Provider defaults are a good baseline, and stricter products can tighten them.

Blocking can surface before or after generation. A blocked prompt can appear in **promptFeedback** with a block reason and no useful candidates. A blocked candidate can return **finishReason** SAFETY. When Google Search grounding is enabled as a tool, the model can use web grounding and return grounding metadata. **usageMetadata** reports token accounting such as promptTokenCount, candidatesTokenCount, and totalTokenCount so cost and quota can be monitored.`
    }
  ],
  requestFlow: [
    {
      step: "1. Choose the model and method",
      detailMD: `Pick a Gemini model that matches the task, latency target, context size, and cost budget. Use **generateContent** for complete responses and **streamGenerateContent** when the user experience benefits from incremental output.`
    },
    {
      step: "2. Build the contents array",
      detailMD: `Create one or more conversation turns. Use role **user** for the current instruction and payload. Add role **model** turns only when carrying previous assistant messages into a multi-turn conversation.`
    },
    {
      step: "3. Add parts to each turn",
      detailMD: `Represent each unit of input as a part: text instructions, inline image bytes, inline audio or video bytes, or a file reference. Keeping parts separate helps the model understand boundaries and helps the application control payload size.`
    },
    {
      step: "4. Set systemInstruction",
      detailMD: `Put stable behavior in **systemInstruction**: role, domain, tone, source rules, and what to do when evidence is missing. Keep user-provided text in **contents** so trusted instructions and untrusted input do not blend.`
    },
    {
      step: "5. Configure generation behavior",
      detailMD: `Use **generationConfig** for temperature, topP, topK, maxOutputTokens, responseMimeType, and responseSchema. A structured extraction call usually uses low temperature, a small output cap, application/json, and a schema.`
    },
    {
      step: "6. Configure safety and tools",
      detailMD: `Set **safetySettings** when the product needs explicit harm thresholds. Add the Google Search tool when the answer should be grounded in fresh web information, and make sure the UI can show or audit grounding metadata.`
    },
    {
      step: "7. Send the request and process candidates",
      detailMD: `For non-streaming calls, read the final candidates. For streaming calls, assemble chunks while keeping track of the final state. Check finishReason, safety ratings, and whether the response is complete before using it.`
    },
    {
      step: "8. Record metadata and handle errors",
      detailMD: `Log usageMetadata, model name, prompt version, safety outcomes, latency, and retry count. Handle invalid requests, authentication failures, quota errors, transient service failures, and safety blocks as separate cases.`
    }
  ],
  deepDives: [
    {
      label: "Why parts is a list instead of one prompt string",
      detailMD: `A single prompt string is enough for simple text generation, but it is a poor abstraction for multimodal applications. A Gemini content turn can contain text, images, audio, video, and file references. A list of parts lets the client preserve type information and ordering.

This also makes prompt engineering cleaner. The instruction can be one text part, the media can be another part, and a follow-up question can be a new turn. The model receives a structured request instead of a manually concatenated blob.`
    },
    {
      label: "Streaming is a UI feature and a reliability challenge",
      detailMD: `Streaming improves perceived latency because users see partial output quickly. It also creates edge cases: the network can close mid-answer, the user can cancel, the final chunk can indicate a stop reason, and structured output may not be parseable until the stream finishes.

A robust client keeps a buffer, exposes partial text only when appropriate, and validates the final output before triggering side effects. If the application needs strict JSON, consider buffering the stream or using non-streaming generation with responseSchema.`
    },
    {
      label: "Structured output depends on config and validation",
      detailMD: `Setting **responseMimeType** to application/json tells the model to emit JSON. Adding **responseSchema** narrows the target structure further, which is valuable for extraction, routing, and automation. This is more reliable than a natural-language request to please return JSON.

Still validate the result in code. A schema improves the model behavior, but production software should parse the response, check required fields, enforce business rules, and retry or fall back when validation fails.`
    },
    {
      label: "Long context windows are powerful but not free",
      detailMD: `Gemini models can support very long contexts, which is useful for documents, transcripts, codebases, and video analysis. Long context does not mean every request should be huge. More input increases latency, cost, and the chance that important facts are buried.

For long inputs, label sections, ask focused questions, and consider chunking or file references. Track promptTokenCount so the team knows when a feature is crossing cost or quota thresholds.`
    },
    {
      label: "Safety blocking is not the same as a normal empty answer",
      detailMD: `A prompt can be blocked before generation, usually visible through **promptFeedback**. A candidate can also be blocked during or after generation with **finishReason** SAFETY. The product should distinguish these cases from empty text, max token truncation, and normal stop conditions.

User experience matters. A blocked response should return a safe explanation or escalation path, not a broken parser error. Logs should record the category and threshold outcome without storing unnecessary sensitive content.`
    },
    {
      label: "Quota and transient errors need a policy",
      detailMD: `Gemini API callers should expect invalid argument errors for malformed requests, authentication or permission errors for bad credentials, 429 or RESOURCE_EXHAUSTED for quota pressure, and 500 or 503 style failures for transient service issues.

Use exponential backoff with jitter for retryable failures, avoid retry storms, and fall back to a cheaper model or a queued workflow when appropriate. Do not blindly retry safety blocks or schema errors without changing the request.`
    }
  ],
  productionConsiderations: [
    {
      label: "Authentication and secret handling",
      detailMD: `Keep API keys or service credentials on the server side. Browser clients should call your backend, not the Gemini API directly with a long-lived secret. Separate development and production projects so quota, billing, and access can be controlled independently.`
    },
    {
      label: "Observability and cost control",
      detailMD: `Log model name, method, latency, finishReason, promptFeedback outcome, retry count, promptTokenCount, candidatesTokenCount, and totalTokenCount. These fields make it possible to debug quality issues, estimate cost, find runaway prompts, and set user-level rate limits.`
    },
    {
      label: "Retries, fallback, and quotas",
      detailMD: `Retry only errors that are likely transient, such as 429 and 503, and use exponential backoff with jitter. For sustained quota pressure, degrade gracefully: shorter context, smaller maxOutputTokens, a cheaper model, delayed processing, or a clear product message.`
    },
    {
      label: "Safety, privacy, and grounding governance",
      detailMD: `Choose safety thresholds based on product risk and jurisdiction. Avoid sending unnecessary personal data, especially in multimodal files. When using Google Search grounding, show or store grounding evidence where the product needs auditability, and do not treat grounded output as automatically correct.`
    }
  ],
  interview: {
    whatInterviewersLookFor: [
      "A clear explanation of generateContent, streamGenerateContent, contents, roles, and parts.",
      "Ability to configure systemInstruction, generationConfig, structured output, safetySettings, and Google Search grounding.",
      "Understanding of response handling: candidates, finishReason SAFETY, promptFeedback, usageMetadata, and token counts.",
      "Production instincts around long context, multimodal payloads, quota errors, retries, validation, and observability."
    ],
    followUps: [
      {
        question: "When would you use streamGenerateContent instead of generateContent?",
        answerMD: `Use **streamGenerateContent** when the user experience benefits from partial output, such as chat, long explanations, or coding assistance. Use **generateContent** when the application needs a complete response before acting, especially for structured JSON extraction or batch jobs.`
      },
      {
        question: "Why does Gemini use a contents array with parts?",
        answerMD: `The contents array represents conversation turns, and each turn can contain multiple typed parts. This supports text plus images, audio, video, or file references without flattening everything into one string. It also preserves role-based conversation state across stateless API calls.`
      },
      {
        question: "How do safety blocks surface in the response?",
        answerMD: `A prompt blocked before generation can appear in **promptFeedback** with a block reason. A candidate blocked during generation can have **finishReason** SAFETY. The client should treat both as expected outcomes and avoid parsing them as normal model text.`
      },
      {
        question: "How do responseMimeType and responseSchema help structured output?",
        answerMD: `**responseMimeType** can request application/json, and **responseSchema** describes the desired fields and types. Together they make structured extraction more reliable, but application code should still parse and validate the output before using it.`
      },
      {
        question: "What should a production client do when it receives a 429 quota error?",
        answerMD: `The client should apply exponential backoff with jitter, respect any retry guidance, and avoid retry storms. If quota pressure continues, it should reduce context or output size, fall back to a cheaper model, queue the task, or show a clear message instead of looping indefinitely.`
      }
    ],
    alternativeDesigns: [
      {
        name: "Direct provider call from one backend service",
        detailMD: `The application backend calls Gemini directly for each feature. This is simple, easy to start with, and appropriate for one product surface. It can become messy when many teams need shared logging, rate limits, retries, and safety policies.`
      },
      {
        name: "Internal LLM gateway",
        detailMD: `An internal gateway wraps Gemini calls with authentication, prompt versioning, rate limiting, logging, fallback, and provider-specific adapters. This adds operational work but gives larger organizations consistent governance and observability.`
      },
      {
        name: "Batch or queued generation",
        detailMD: `For long media, large documents, or noninteractive workloads, a queue can absorb quota spikes and retry transient failures safely. Users get slower completion, but the system has better control over cost, backpressure, and retries.`
      }
    ],
    commonMistakes: [
      "Sending one giant string instead of a structured contents array with typed parts.",
      "Ignoring promptFeedback, finishReason, and safety ratings and assuming response text is always usable.",
      "Requesting JSON but skipping responseSchema and downstream validation.",
      "Retrying every failure, including safety blocks and malformed requests, instead of separating retryable and non-retryable cases."
    ]
  },
  interviewHints: [
    "Start with the request shape: model, contents, roles, parts, and method.",
    "Then add controls: systemInstruction, generationConfig, safetySettings, and tools.",
    "Explain how blocking and usage metadata appear in the response.",
    "Finish with production handling: streaming, long context, retries, quotas, validation, and observability."
  ],
  playground: {
    descriptionMD: `This static playground shows a receipt extraction call. The model receives a system instruction, a user request with an image part, low-randomness generation settings, JSON output configuration, and a schema.`,
    systemPrompt: `You are a careful expense extraction service.
Use only visible evidence from the receipt.
Return JSON that matches the requested schema.
If a value is not visible, use null rather than guessing.`,
    userPrompt: `Task: Extract merchant, total, currency, purchase date, and line items from the attached receipt image.

Output rules:
- Return only JSON.
- Do not invent missing fields.
- Use numbers for prices.
- Keep item names as they appear on the receipt.`,
    parameters: [
      { name: "method", value: "generateContent", note: "The app wants a complete JSON object before parsing." },
      { name: "model", value: "gemini-2.5-flash", note: "A fast multimodal model is enough for a beginner receipt extraction example." },
      { name: "temperature", value: "0.1", note: "Low randomness improves repeatability for extraction." },
      { name: "topP", value: "0.8", note: "Keeps sampling conservative while leaving some flexibility." },
      { name: "topK", value: "40", note: "Limits candidate token choices during sampling." },
      { name: "maxOutputTokens", value: "500", note: "Caps cost and prevents overly long output." },
      { name: "responseMimeType", value: "application/json", note: "Requests JSON output." },
      { name: "responseSchema", value: "receipt object schema", note: "Defines required fields and expected types." },
      { name: "safetySettings", value: "provider defaults plus product-specific thresholds", note: "Safety remains explicit even for utility tasks." }
    ],
    sampleOutputMD: `A successful response should be parseable JSON, followed by metadata available to the application.

{
  "merchant": "Northwind Market",
  "total": 42.18,
  "currency": "USD",
  "purchase_date": "2026-07-25",
  "items": [
    {
      "name": "Coffee",
      "price": 12.99
    }
  ]
}

The client should also inspect finishReason, promptFeedback, and usageMetadata before marking the extraction as complete.`
  },
  comparisons: [
    {
      title: "Gemini generation methods",
      columns: ["API", "Best use", "Client behavior", "Watch outs"],
      rows: [
        ["generateContent", "Complete answers and structured extraction", "Waits for the final candidate before processing", "Long answers have higher perceived latency"],
        ["streamGenerateContent", "Chat, long explanations, and live UI updates", "Processes chunks as they arrive and assembles a final answer", "Final validation and interruption handling are still required"]
      ]
    },
    {
      title: "Input shapes in contents",
      columns: ["Input shape", "Typical representation", "Best use", "Implementation note"],
      rows: [
        ["Text part", "Instruction or user text in a part", "Prompts, questions, labels, and task framing", "Keep trusted instructions separate from untrusted payloads"],
        ["Inline media", "Bytes plus MIME type", "Small images, audio snippets, or short videos", "Watch request size and encode the correct MIME type"],
        ["File reference", "Uploaded file URI or provider file object", "Large media, repeated use, and long documents", "Use when inline data would be too large or reused"],
        ["Model role turn", "Previous model output in contents", "Multi-turn conversation state", "Do not hide durable policy in prior model messages"]
      ]
    },
    {
      title: "Important request and response controls",
      columns: ["Control", "What it affects", "Typical beginner setting", "Failure mode"],
      rows: [
        ["systemInstruction", "Stable role, tone, and source rules", "Short domain-specific instruction", "Trusted policy mixed with user data"],
        ["temperature", "Randomness in generation", "0.0 to 0.3 for extraction", "High randomness on deterministic tasks"],
        ["maxOutputTokens", "Maximum response length", "Small cap for JSON, larger cap for prose", "Truncation with incomplete output"],
        ["responseSchema", "Expected structured output shape", "Schema for JSON extraction", "Schema not validated downstream"],
        ["safetySettings", "Harm category blocking thresholds", "Provider defaults or stricter product policy", "Blocked content treated as parser failure"],
        ["usageMetadata", "Token accounting after the call", "Log prompt, candidate, and total counts", "No visibility into cost or quota pressure"]
      ]
    }
  ],
  decisionGuideMD: `## Choosing how to call Gemini

Use **generateContent** when your application needs a complete answer before doing anything else. This is the normal choice for extraction, classification, routing, summarization jobs, and any workflow where you must validate the final output.

Use **streamGenerateContent** when the user experience matters more than immediate final validation. It is a good fit for chat, tutoring, coding help, and long explanations. Buffer and validate the final text before triggering irreversible actions.

Use **inline media parts** for small images, audio, or video snippets that are unique to one request. Use **file references** for larger media, repeated analysis, long videos, or documents that would make request bodies too large.

Use **responseMimeType** and **responseSchema** when software will parse the result. The model should be guided toward the structure, and the application should still parse, validate, and repair or retry when the output is invalid.

Enable **Google Search grounding** when the task requires fresh public information or citations. Do not enable it for private data tasks, deterministic extraction, or cases where web evidence would be a privacy or compliance problem.

Treat long context as a budget, not a dumping ground. Label sections, trim irrelevant material, and record usageMetadata so cost and latency remain visible.

For production, centralize retry policy, quota handling, safety handling, logging, and prompt versioning. A Gemini call is easiest to maintain when it sits behind a small service or gateway with consistent controls.`,
  handsOn: [
    {
      title: "Call generateContent for structured multimodal extraction",
      detailMD: `This Python example uses the Google Gen AI SDK to send a text instruction plus an inline receipt image. It sets system instructions, generation settings, a JSON response MIME type, a response schema, and a safety threshold, then checks safety and usage fields before using the text.`,
      code: {
        language: "python",
        label: "call_gemini_receipt.py",
        body: `from pathlib import Path
from google import genai
from google.genai import types

client = genai.Client()

image_bytes = Path("receipt.png").read_bytes()

receipt_schema = {
    "type": "object",
    "properties": {
        "merchant": {"type": "string"},
        "total": {"type": "number"},
        "currency": {"type": "string"},
        "purchase_date": {"type": "string"},
        "items": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "price": {"type": "number"}
                },
                "required": ["name", "price"]
            }
        }
    },
    "required": ["merchant", "total", "currency", "items"]
}

contents = [
    types.Content(
        role="user",
        parts=[
            types.Part.from_text(
                text="Extract receipt fields. Use null only when a visible value is unreadable."
            ),
            types.Part.from_bytes(
                data=image_bytes,
                mime_type="image/png"
            )
        ]
    )
]

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=contents,
    config=types.GenerateContentConfig(
        system_instruction="You are a careful expense extraction service. Return only JSON that matches the schema.",
        temperature=0.1,
        top_p=0.8,
        top_k=40,
        max_output_tokens=500,
        response_mime_type="application/json",
        response_schema=receipt_schema,
        safety_settings=[
            types.SafetySetting(
                category="HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold="BLOCK_MEDIUM_AND_ABOVE"
            )
        ]
    )
)

if response.prompt_feedback and response.prompt_feedback.block_reason:
    print("Prompt blocked: " + str(response.prompt_feedback.block_reason))
else:
    candidate = response.candidates[0]
    if str(candidate.finish_reason) == "SAFETY":
        print("Candidate blocked by safety settings")
    else:
        print(response.text)
        if response.usage_metadata:
            print("prompt tokens: " + str(response.usage_metadata.prompt_token_count))
            print("candidate tokens: " + str(response.usage_metadata.candidates_token_count))
            print("total tokens: " + str(response.usage_metadata.total_token_count))`
      }
    },
    {
      title: "Stream an answer with Google Search grounding and retries",
      detailMD: `This example streams a grounded answer and retries only likely transient failures. The code buffers chunks for the final answer, prints partial text for the user, and records usage metadata when the final chunks provide it.`,
      code: {
        language: "python",
        label: "stream_grounded_answer.py",
        body: `import random
import time
from google import genai
from google.genai import types

client = genai.Client()

def is_retryable_error(error):
    message = str(error)
    retry_markers = [
        "429",
        "RESOURCE_EXHAUSTED",
        "503",
        "UNAVAILABLE",
        "INTERNAL"
    ]
    for marker in retry_markers:
        if marker in message:
            return True
    return False

def stream_grounded_answer(question):
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(
                    text="Answer with current public information and mention when search evidence is uncertain. Question: " + question
                )
            ]
        )
    ]

    for attempt in range(5):
        try:
            stream = client.models.generate_content_stream(
                model="gemini-2.5-flash",
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction="You are a concise research assistant. Use Google Search grounding when helpful.",
                    tools=[
                        types.Tool(
                            google_search=types.GoogleSearch()
                        )
                    ],
                    temperature=0.2,
                    max_output_tokens=700
                )
            )

            chunks = []
            last_usage = None
            for chunk in stream:
                if chunk.text:
                    chunks.append(chunk.text)
                    print(chunk.text, end="")
                if chunk.usage_metadata:
                    last_usage = chunk.usage_metadata

            print("")
            if last_usage:
                print("total tokens: " + str(last_usage.total_token_count))
            return "".join(chunks)
        except Exception as error:
            if not is_retryable_error(error) or attempt == 4:
                raise
            delay_seconds = (2 ** attempt) + random.random()
            time.sleep(delay_seconds)

answer = stream_grounded_answer("What should a developer check before using a new Gemini model in production?")
print("")
print("final characters: " + str(len(answer)))`
      }
    }
  ],
  quiz: [
    {
      question: "Which API should you normally use when you need a complete JSON object before parsing?",
      options: [
        "streamGenerateContent, because partial chunks are always valid JSON",
        "generateContent, because the client receives the final candidate before processing",
        "usageMetadata, because it generates model text",
        "safetySettings, because it replaces the generation call"
      ],
      answerIndex: 1,
      explanationMD: `**generateContent** is the normal choice when the application needs the complete response before parsing or validation. Streaming can be buffered, but chunks are not guaranteed to be complete JSON.`
    },
    {
      question: "Why is parts a list inside a Gemini content turn?",
      options: [
        "So one turn can include multiple typed inputs such as text, image, audio, video, or file references",
        "So the API can ignore roles",
        "So safety settings can be skipped",
        "So token counting is disabled"
      ],
      answerIndex: 0,
      explanationMD: `A content turn can combine several typed parts. This is the basis for clean multimodal requests and structured conversation state.`
    },
    {
      question: "What belongs in systemInstruction?",
      options: [
        "Stable behavior such as role, tone, source rules, and output discipline",
        "Untrusted user documents copied without labels",
        "Only image bytes",
        "The final usage token counts"
      ],
      answerIndex: 0,
      explanationMD: `**systemInstruction** should hold durable trusted guidance. User payloads and media belong in **contents**.`
    },
    {
      question: "What does finishReason SAFETY usually mean?",
      options: [
        "The response ended because the maximum output token limit was reached",
        "The candidate was blocked by safety handling",
        "The prompt was automatically grounded with Google Search",
        "The request used too few parts"
      ],
      answerIndex: 1,
      explanationMD: `A candidate with **finishReason** SAFETY should be treated as a blocked candidate, not as ordinary generated text.`
    },
    {
      question: "Which pair is most useful for structured JSON extraction?",
      options: [
        "High temperature and no output validation",
        "responseMimeType application/json and responseSchema",
        "Google Search grounding and no schema",
        "A model role with no user content"
      ],
      answerIndex: 1,
      explanationMD: `Requesting JSON with **responseMimeType** and narrowing the shape with **responseSchema** improves reliability, while downstream validation remains necessary.`
    },
    {
      question: "What is usageMetadata primarily used for?",
      options: [
        "Counting prompt, candidate, and total tokens for cost, quota, and observability",
        "Replacing safety settings",
        "Uploading video files",
        "Choosing harm block thresholds automatically"
      ],
      answerIndex: 0,
      explanationMD: `**usageMetadata** exposes fields such as promptTokenCount, candidatesTokenCount, and totalTokenCount, which are essential for cost and quota monitoring.`
    }
  ],
  flashcards: [
    { front: "What is generateContent?", back: "The standard Gemini API call that returns a complete generated response for a request." },
    { front: "What is streamGenerateContent?", back: "The Gemini API call that emits chunks as the model generates so the UI can show progress." },
    { front: "What are the usual content roles?", back: "user for user or application input, and model for prior model output in a multi-turn conversation." },
    { front: "Why are parts useful?", back: "They let one turn combine typed inputs such as text, images, audio, video, and file references while preserving structure." },
    { front: "What does systemInstruction control?", back: "Stable model behavior such as role, tone, source rules, safety posture, and output discipline." },
    { front: "What does responseSchema do?", back: "It describes the expected structured output shape, often paired with application/json." },
    { front: "Where can safety blocking appear?", back: "Prompt-level blocking can appear in promptFeedback, and candidate-level blocking can appear as finishReason SAFETY." },
    { front: "What does usageMetadata report?", back: "Token accounting such as promptTokenCount, candidatesTokenCount, and totalTokenCount." }
  ],
  cheatSheetMD: `## Gemini API cheat sheet

### Core methods
- **generateContent**: request-response generation. Best for complete answers, extraction, classification, and structured output.
- **streamGenerateContent**: chunked generation. Best for chat and long responses where perceived latency matters.

### Request anatomy
- **model**: choose based on quality, latency, context window, multimodal support, and cost.
- **contents**: conversation turns.
- **role**: usually user or model.
- **parts**: typed inputs inside a turn, such as text, inline media data, or file references.
- **systemInstruction**: durable trusted behavior and output rules.
- **generationConfig**: temperature, topP, topK, maxOutputTokens, responseMimeType, and responseSchema.
- **safetySettings**: harm categories and block thresholds.
- **tools**: optional capabilities such as Google Search grounding.

### Multimodal inputs
- Use text parts for instructions and questions.
- Use inline data for small image, audio, or video payloads.
- Use file references for larger media, repeated analysis, and long documents.
- Keep instructions close to the media they describe.
- Do not treat long context as a reason to send unrelated data.

### Structured output
- Set responseMimeType to application/json.
- Add responseSchema for expected fields and types.
- Keep temperature low for extraction.
- Validate the returned JSON in code.
- Retry repairable format failures, not safety blocks.

### Safety handling
- Configure harm categories and thresholds based on product risk.
- Check promptFeedback for prompt-level blocking.
- Check finishReason for candidate-level SAFETY blocks.
- Provide a safe user experience for blocked content.
- Log safety outcomes without storing unnecessary sensitive content.

### Grounding
- Enable Google Search grounding when fresh public information matters.
- Inspect grounding metadata when citations or auditability are required.
- Do not use web grounding for private data extraction unless the product explicitly needs it.
- Grounded output still needs critical evaluation.

### Token and quota operations
- Record promptTokenCount, candidatesTokenCount, and totalTokenCount.
- Watch long context cost and latency.
- Use maxOutputTokens to cap runaway output.
- Treat 429 and RESOURCE_EXHAUSTED as quota pressure.
- Retry transient 429, 500, and 503 style failures with exponential backoff and jitter.
- Do not blindly retry invalid requests, schema mistakes, or safety blocks.

### Interview answer shape
1. Name the method: generateContent or streamGenerateContent.
2. Describe contents, roles, and parts.
3. Add systemInstruction and generationConfig.
4. Explain safetySettings and blocking surfaces.
5. Mention Google Search grounding when freshness is needed.
6. Close with usageMetadata, long context tradeoffs, retries, quotas, and validation.`,
  references: [
    { title: "Gemini API Text Generation", kind: "Docs", url: "https://ai.google.dev/gemini-api/docs/text-generation", author: "Google AI for Developers" },
    { title: "GenerateContent API Reference", kind: "Docs", url: "https://ai.google.dev/api/generate-content", author: "Google AI for Developers" },
    { title: "Gemini API Structured Output", kind: "Docs", url: "https://ai.google.dev/gemini-api/docs/structured-output", author: "Google AI for Developers" },
    { title: "Grounding with Google Search", kind: "Docs", url: "https://ai.google.dev/gemini-api/docs/google-search", author: "Google AI for Developers" }
  ],
  relatedLessons: [
    { slug: "prompt-engineering-foundations", note: "Explains how to write the system and user instructions that go into Gemini requests." },
    { slug: "structured-outputs", note: "Goes deeper on schemas, validation, and repair loops for model output." },
    { slug: "streaming-responses", note: "Expands on token streaming, buffering, cancellation, and UI tradeoffs." },
    { slug: "function-and-tool-calling", note: "Connects Gemini tools and grounding to the broader tool-calling pattern." }
  ]
};
