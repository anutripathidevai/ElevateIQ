import type { GenAILessonContent } from "../types";

export const streamingResponsesContent: GenAILessonContent = {
  slug: "streaming-responses",
  introductionMD: `Streaming responses let an LLM application send partial output as soon as the provider produces it, instead of waiting for the whole completion. The user does not receive the final answer sooner, but the first visible token can arrive much earlier. That reduction in time-to-first-token is why a streamed answer feels faster even when total latency is similar.

In interviews, streaming tests whether you understand both the model API and the web transport. A strong answer covers Server-Sent Events, provider-specific delta formats, reassembling the final message, cancellation, backpressure, proxy buffering, mid-stream failures, usage accounting, and the UI work needed to render partial text smoothly.

The production goal is not simply to print tokens. It is to build a controlled streaming pipeline from provider to app server to browser, where billing stops on abort, partial failures are explicit, tool-call arguments are buffered safely, and observability can explain latency, cost, and quality for every stream.`,
  realWorldMD: `Streaming shows up in almost every conversational AI product where users wait for generated text.

- Chat assistants stream the answer to make long responses feel interactive.
- Coding assistants stream code edits, explanations, and tool status while work continues.
- Search and answer engines stream a draft answer before citations and final metadata are complete.
- Agentic systems stream reasoning status, tool-call argument deltas, tool results, and final summaries.
- Enterprise gateways proxy provider streams so authentication, audit logging, policy, and cost controls stay server-side.`,
  learningObjectives: [
    "Explain the difference between time-to-first-token, perceived latency, and total latency.",
    "Use Server-Sent Events correctly, including data lines, event boundaries, and the [DONE] sentinel.",
    "Parse provider-specific delta events and reassemble full text, tool calls, finish state, and usage.",
    "Design cancellation, backpressure, and buffering controls between the provider, server, proxies, and browser.",
    "Handle mid-stream errors after partial output has already reached the user.",
    "Render partial tokens smoothly while accounting for streaming token usage and billing."
  ],
  theory: [
    {
      label: "Streaming optimizes perceived latency, not necessarily total latency",
      detailMD: `A non-streaming call waits until the model finishes, then sends one complete response. A streaming call sends chunks as the model decodes them. The total work can be almost the same, but time-to-first-token can drop from several seconds to a few hundred milliseconds after the provider starts generation.

That distinction matters in product design. Streaming does not make the model think faster, and it can add server and UI complexity. It is valuable when users benefit from early progress, can start reading before the answer is complete, or need visible status for long-running generation. It is less useful for small structured outputs where the application must validate the whole object before showing anything.`
    },
    {
      label: "SSE is the common browser-facing transport",
      detailMD: `Server-Sent Events are a simple HTTP response format for one-way server-to-browser updates. The response uses Content-Type text/event-stream. Each event is UTF-8 text with optional event: lines, one or more data: lines, and a blank line that terminates the event.

Many LLM providers also stream over SSE. OpenAI style streams commonly send lines like data: followed by JSON, and then a final data: [DONE] sentinel. Your server can consume the provider stream, translate or filter events, and forward its own SSE stream to the browser. The browser should not receive provider secrets, raw credentials, or internal policy metadata.`
    },
    {
      label: "Provider chunks are deltas, not complete messages",
      detailMD: `Streaming APIs usually emit incremental deltas. OpenAI Chat Completions chunks place partial content in choices[0].delta, and tool-call fragments can arrive in choices[0].delta.tool_calls. The finish reason appears near the end, and usage may require an option such as stream_options include_usage.

Anthropic streams use named events such as message_start, content_block_start, content_block_delta, content_block_stop, message_delta, and message_stop. Text commonly arrives in content_block_delta events, while message_start and message_stop define the lifecycle. A provider adapter should normalize these event shapes into your internal events: token, tool_args_delta, usage, error, and done.`
    },
    {
      label: "Reassembly is a state machine",
      detailMD: `The server or client must rebuild the final message from pieces. For text, append each content delta in order. For multiple content blocks, track the provider block index. For tool calls, buffer fragments by tool call index or id, because arguments often arrive as partial JSON strings that are not parseable until the call is complete.

Do not execute a tool merely because the first argument fragment looks valid. Wait until the provider signals that the tool call is complete, assemble the full argument string, parse it once, validate it against your schema, enforce authorization, and only then call the tool. Streaming makes the UI more responsive, but it must not weaken tool safety.`
    },
    {
      label: "Backpressure connects three different streams",
      detailMD: `A production pipeline has at least three flow-control boundaries: provider to app server, app server to proxy or CDN, and proxy to browser. If the browser is slow, the server should not keep buffering unbounded data in memory. In Node, a false return from response.write means wait for drain before writing more. In Web Streams, use reader and writer backpressure rather than accumulating every chunk.

Backpressure is also a cost and reliability control. If the client disconnects, cancel the upstream provider request immediately. Otherwise the model may continue generating tokens that nobody will see, increasing billable output and wasting capacity.`
    },
    {
      label: "Streaming changes error and usage semantics",
      detailMD: `With a normal response, an error can be represented by an HTTP status code and no body. With streaming, the server may have already sent status 200 and several tokens before the provider times out, rate limits, or returns a malformed event. At that point the only honest response is an in-stream error event plus a partial answer state in the UI.

Usage accounting also moves to the end of the lifecycle. Some providers send final usage metadata only after generation completes. Others send cumulative usage deltas. For aborted streams, you may need a provider billing record, final event if available, and local estimates to reconcile prompt tokens, completion tokens, cached tokens, and tokens generated after a disconnect race.`
    }
  ],
  architecture: {
    width: 960,
    height: 560,
    nodes: [
      { id: "browser", label: "Browser client", kind: "client", x: 70, y: 230, sublabel: "Consumes SSE and renders partial tokens" },
      { id: "sse-edge", label: "SSE endpoint", kind: "gateway", x: 300, y: 230, sublabel: "text/event-stream response, flush enabled" },
      { id: "app-server", label: "App server gateway", kind: "service", x: 530, y: 230, sublabel: "Auth, provider adapter, abort, backpressure" },
      { id: "provider", label: "LLM provider", kind: "external", x: 790, y: 230, sublabel: "Streams text, tool deltas, finish, usage" },
      { id: "observability", label: "Usage and traces", kind: "monitoring", x: 530, y: 430, sublabel: "TTFT, token counts, aborts, errors" }
    ],
    edges: [
      { from: "browser", to: "sse-edge", label: "Prompt request and abort signal" },
      { from: "sse-edge", to: "app-server", label: "Authenticated stream request" },
      { from: "app-server", to: "provider", label: "Streaming API call" },
      { from: "provider", to: "app-server", label: "Delta events and [DONE]" },
      { from: "app-server", to: "sse-edge", label: "Normalized SSE events" },
      { from: "sse-edge", to: "browser", label: "event: token data lines" },
      { from: "app-server", to: "observability", label: "Usage, errors, latency", dashed: true },
      { from: "sse-edge", to: "observability", label: "Disconnect and flush metrics", dashed: true }
    ],
    captionMD: `A robust streaming architecture keeps provider credentials on the app server, forwards only safe normalized SSE events to the browser, and treats cancellation, backpressure, and final usage as first-class parts of the flow.`
  },
  architectureNotesMD: `The SSE endpoint can be part of the app server or an edge gateway, but it must not buffer the entire answer before sending it. Disable response buffering in reverse proxies and CDNs, flush an initial comment or small event, and keep the connection open until done, error, or abort.

The app server owns the provider request. It should attach an AbortController to the browser connection, parse provider events incrementally, enforce tool and policy boundaries before forwarding sensitive data, and emit consistent client events such as token, tool_args_delta, usage, error, and done.`,
  requestFlow: [
    {
      step: "1. Browser starts a stream",
      detailMD: `The browser sends a prompt or conversation id to the app server and begins reading a streaming response. It may use EventSource for a simple GET stream, or fetch with a ReadableStream when it needs POST bodies, custom headers, or an AbortController.`
    },
    {
      step: "2. Server opens an SSE response",
      detailMD: `The server authenticates the user, checks rate limits, writes text/event-stream headers, disables caching and buffering, and flushes an initial event or comment. From this point, the HTTP status is committed, so later failures must be represented inside the stream.`
    },
    {
      step: "3. Server calls the LLM provider with streaming enabled",
      detailMD: `The provider request includes stream true or the provider equivalent. The server attaches an abort signal tied to the browser connection so a disconnect or cancel action stops upstream generation and reduces wasted billable tokens.`
    },
    {
      step: "4. Provider emits incremental events",
      detailMD: `The provider sends SSE frames or stream chunks. OpenAI-style chunks place content in choices[0].delta, while Anthropic-style streams use events such as message_start, content_block_delta, and message_stop. The adapter parses bytes into lines, lines into events, and events into internal deltas.`
    },
    {
      step: "5. Server reassembles state and forwards safe deltas",
      detailMD: `The server appends text deltas to the full answer, buffers tool-call argument fragments by index or id, records finish reasons and usage metadata, and forwards only the client-facing pieces. Tool calls should not execute until arguments are complete and validated.`
    },
    {
      step: "6. Backpressure controls each write",
      detailMD: `If the response writer reports that the browser or proxy is slow, the server waits for drain rather than buffering unlimited chunks. If the client disconnects, the server cancels the provider request, marks the stream aborted, and avoids writing more data to a closed socket.`
    },
    {
      step: "7. Browser renders partial output",
      detailMD: `The UI appends token events to a local buffer and renders at animation-frame or short batch intervals. It should preserve scroll behavior, show a typing state, tolerate incomplete Markdown, and make partial-error states visible rather than pretending the answer completed.`
    },
    {
      step: "8. Stream ends with done, error, or abort",
      detailMD: `A normal provider stream ends with a sentinel such as [DONE] or a provider stop event, followed by final usage if available. A failure after tokens have been sent becomes an error event. An abort should close both downstream and upstream streams and log partial usage.`
    }
  ],
  deepDives: [
    {
      label: "Time-to-first-token versus total latency",
      detailMD: `Users experience waiting in phases: connection setup, queueing, prompt processing, first token, token cadence, and final completion. Streaming mainly improves the first visible phase. It also gives the product a chance to show progress while the model continues decoding.

Total latency can still be high for long answers, slow models, large prompts, tool calls, or congested providers. Measure both time-to-first-token and time-to-last-token. A stream with fast first token but a slow token cadence can feel better than a blank screen, but it may still fail service-level objectives for workflows that need the complete answer.`
    },
    {
      label: "Parsing SSE safely",
      detailMD: `SSE is line-oriented, but network chunks do not align with event boundaries. A TCP chunk can contain half a line, several complete events, or a line split across multibyte characters. Use a TextDecoder in streaming mode, keep a carryover buffer, split on newline, and process only complete lines.

For provider streams, ignore blank lines and comments, handle repeated data: lines when present, treat [DONE] as a terminal sentinel, and wrap JSON parsing so one malformed event becomes a controlled stream error. Do not assume every provider event contains a text token.`
    },
    {
      label: "Streaming tool-call arguments",
      detailMD: `Tool arguments are especially easy to mishandle because they often arrive as partial JSON. The first fragment might be an opening brace, the next fragment might contain a property name, and the last fragment might close the object. Parsing each fragment independently creates false errors and can tempt unsafe early execution.

Maintain a map from provider tool call index or id to an argument buffer. Append each argument delta exactly once. When the provider signals the tool call is complete, parse the full string, validate it against the declared schema, check permissions, and then call the tool. If the stream fails before completion, discard the partial tool call or mark it incomplete for debugging only.`
    },
    {
      label: "Mid-stream failures are normal",
      detailMD: `A stream can fail after the user has already seen useful tokens. The provider can time out, rate limit after partial output, return an overloaded error, send malformed JSON, or close the connection unexpectedly. Your HTTP status may already be 200, so the stream protocol needs an explicit error event.

The UI should label the response as partial, offer retry or continue controls when appropriate, and avoid saving the partial answer as if it were complete. Observability should record how many tokens were shown, the failure point, provider request id, and whether the user or server aborted.`
    },
    {
      label: "Buffering and proxy gotchas",
      detailMD: `Reverse proxies and CDNs often optimize normal HTTP responses by buffering upstream data before sending it downstream. That breaks streaming because the browser sees nothing until the buffer fills or the response ends. Common fixes include no-transform cache control, disabling proxy buffering, sending X-Accel-Buffering: no for NGINX-based stacks, and avoiding compression layers that buffer small chunks.

Also check platform-specific idle timeouts and minimum chunk sizes. A local server may stream perfectly while production appears frozen because an ingress, serverless platform, or CDN is coalescing chunks.`
    },
    {
      label: "Usage accounting arrives late",
      detailMD: `Streaming output makes token accounting asynchronous. Prompt tokens are known or estimable when the request starts, but completion tokens grow over time. Some providers return final usage only at the end, some emit usage deltas, and some omit usage for aborted requests.

For billing and analytics, log the provider request id, prompt metadata, stream start, first token, end state, final usage event, and local token estimates. Reconcile final provider invoices against your logs, especially for aborted streams where generation may continue briefly until the upstream cancel takes effect.`
    }
  ],
  productionConsiderations: [
    {
      label: "Cancellation should stop billing work",
      detailMD: `A cancel button that only hides the UI is not enough. The browser should abort the fetch or close the EventSource, the server should detect the disconnect, and the server should cancel the upstream provider request. Log the abort reason and whether the provider confirmed cancellation or simply closed the stream.`
    },
    {
      label: "Smooth rendering needs batching",
      detailMD: `Rendering every token as a separate DOM update can create jank, especially for Markdown, syntax highlighting, or long chat histories. Keep an append-only text buffer, schedule rendering with requestAnimationFrame or a short debounce, and progressively enhance formatting. For incomplete Markdown, prefer stable plain text or a tolerant incremental renderer until the stream finishes.`
    },
    {
      label: "Observability should separate stream phases",
      detailMD: `Track request accepted time, provider request start, first provider byte, first browser token, final token, done event, aborts, and errors. Record provider model, parameters, prompt size, output tokens, finish reason, retry count, and buffering indicators. Without phase metrics, streaming bugs look like vague slowness.`
    },
    {
      label: "Retries and fallbacks are constrained after flush",
      detailMD: `Before any bytes are sent, the server can retry another provider or return a normal error. After bytes are flushed, silent retry can duplicate text or change the answer mid-sentence. Prefer explicit error events, user-visible retry actions, or a continue generation flow that starts a new request with the partial transcript as context.`
    }
  ],
  interview: {
    whatInterviewersLookFor: [
      "Clear explanation of time-to-first-token, perceived latency, and why streaming does not necessarily reduce total latency.",
      "Accurate understanding of SSE framing, provider delta events, [DONE], and message reassembly.",
      "Production instincts around cancellation, backpressure, proxy buffering, mid-stream errors, and token usage.",
      "Awareness that streaming tool-call arguments require buffering and validation before execution."
    ],
    followUps: [
      {
        question: "Why use SSE instead of WebSockets for token streaming?",
        answerMD: `SSE is simpler for one-way server-to-browser updates. It works over ordinary HTTP, is easy to proxy, supports event names and data lines, and fits token streaming because the browser usually only needs to receive updates after sending a request. WebSockets are better when the client and server need long-lived bidirectional messaging, but they add connection management and infrastructure complexity.`
      },
      {
        question: "What happens if the provider fails after the user has seen tokens?",
        answerMD: `The server cannot change the HTTP status after it has flushed the stream. It should send an in-stream error event if the connection is still open, close the stream, mark the answer partial, and log the provider error, partial token count, and request id. The UI should show that the answer stopped unexpectedly and offer retry or continue rather than presenting it as complete.`
      },
      {
        question: "How do you stream function or tool calls safely?",
        answerMD: `Buffer argument fragments by tool call index or id, because streamed arguments may be partial JSON. Wait for the provider finish signal, parse the complete argument string, validate it against the schema, apply authorization and rate limits, and only then execute the tool. Never execute a tool from an early fragment just because it looks parseable.`
      },
      {
        question: "How do you stop paying for tokens after the user clicks cancel?",
        answerMD: `The client should abort the stream, the server should detect the closed downstream connection, and the server should cancel the upstream provider request with an abort signal or provider-specific cancellation mechanism. The system should log the abort and reconcile usage because a small number of tokens may be generated before cancellation reaches the provider.`
      },
      {
        question: "Why might streaming work locally but not in production?",
        answerMD: `A proxy, CDN, compression layer, serverless platform, or load balancer may buffer response chunks. The fix is to use text/event-stream, disable response buffering and transformation, flush an early event, check idle timeouts, and verify with production-like infrastructure rather than only a local development server.`
      }
    ],
    alternativeDesigns: [
      {
        name: "Direct browser to provider streaming",
        detailMD: `The browser calls the provider streaming API directly. This is usually unacceptable for production because it exposes credentials, bypasses central authorization and audit, and makes cost controls harder. It can be useful only for trusted internal demos or provider-managed client tokens with strict scopes.`
      },
      {
        name: "App server SSE gateway",
        detailMD: `The browser streams from your app server, and the server streams from the provider. This is the usual production design because it keeps secrets server-side, normalizes provider events, handles cancellation and backpressure, enforces policy, and records usage centrally.`
      },
      {
        name: "WebSocket session for agent streams",
        detailMD: `A WebSocket can carry bidirectional agent events, user interrupts, tool progress, and token deltas on one connection. It is more flexible than SSE but requires more careful scaling, heartbeat handling, reconnect semantics, and authorization for long-lived connections.`
      }
    ],
    commonMistakes: [
      "Forwarding provider chunks directly to the browser without filtering secrets, internal errors, or provider-specific quirks.",
      "Ignoring client disconnects, allowing the upstream model to keep generating billable tokens.",
      "Parsing each network chunk as a complete SSE event instead of buffering incomplete lines.",
      "Executing streamed tool-call arguments before the full JSON is assembled and validated."
    ]
  },
  interviewHints: [
    "Start with the user experience: streaming lowers time-to-first-token and perceived latency.",
    "Then describe the transport: SSE data lines, blank-line event boundaries, and [DONE].",
    "Explain reassembly: text deltas, provider event lifecycles, and tool-call argument buffers.",
    "Finish with production controls: abort, backpressure, buffering, errors, rendering, and usage accounting."
  ],
  playground: {
    descriptionMD: `This static playground shows the kind of request settings and stream events a gateway might normalize before sending them to a browser.`,
    systemPrompt: `You are a concise technical tutor.
Answer in short paragraphs.
If generation is interrupted, the application will label the answer partial.`,
    userPrompt: `Explain why Server-Sent Events are useful for streaming LLM responses.
Include time-to-first-token, provider deltas, cancellation, and final usage accounting.`,
    parameters: [
      { name: "model", value: "gpt-4o-mini", note: "A fast model makes first token latency and token cadence easier to observe." },
      { name: "stream", value: "true", note: "Requests incremental chunks instead of one final response." },
      { name: "stream_options.include_usage", value: "true", note: "Asks compatible providers to include final token usage in the stream." },
      { name: "temperature", value: "0.2", note: "Low randomness keeps demos and latency comparisons more repeatable." },
      { name: "response_transport", value: "SSE", note: "The gateway forwards normalized text/event-stream events to the browser." }
    ],
    sampleOutputMD: `Expected normalized client events might look like this in sequence:

1. token event with text: Streaming improves perceived latency...
2. token event with text: The server receives provider deltas...
3. usage event with prompt and completion token counts.
4. done event with finish reason stop.

If the provider fails after event 2, the gateway should send an error event and the UI should mark the answer partial.`
  },
  comparisons: [
    {
      title: "Streaming versus non-streaming responses",
      columns: ["Dimension", "Streaming response", "Non-streaming response", "Production implication"],
      rows: [
        ["First visible output", "Arrives after the first provider delta", "Arrives only after the full answer is complete", "Streaming improves perceived latency"],
        ["Total completion time", "Usually similar to normal generation", "Usually similar for the same model and prompt", "Measure time-to-last-token separately"],
        ["Error handling", "Can fail after partial output", "Can return one clean status before body", "Use in-stream error events and partial states"],
        ["Validation", "Harder before the answer is complete", "Can validate full payload before display", "Structured outputs may need buffering"],
        ["Infrastructure", "Sensitive to buffering and disconnects", "Works with ordinary request-response buffering", "Configure proxies and abort paths explicitly"]
      ]
    },
    {
      title: "Provider event shapes",
      columns: ["Provider style", "Important events or fields", "What to buffer", "Completion signal"],
      rows: [
        ["OpenAI Chat Completions", "choices[0].delta content, role, and tool_calls", "Text by choice and tool arguments by tool index", "finish_reason plus data: [DONE]"],
        ["Anthropic Messages", "message_start, content_block_delta, message_delta, message_stop", "Text by content block index and usage deltas", "message_stop"],
        ["Gateway normalized SSE", "event: token, event: tool_args_delta, event: usage", "Full client-visible answer and pending tool buffers", "event: done or event: error"],
        ["Browser fetch stream", "ReadableStream byte chunks", "Partial lines until blank-line event boundary", "Reader done or done event"]
      ]
    },
    {
      title: "Streaming failure modes",
      columns: ["Failure", "What the user sees", "Server action"],
      rows: [
        ["Provider timeout mid-answer", "Partial text stops", "Send error event, close stream, log partial usage"],
        ["Client disconnect", "Tab closes or cancel is clicked", "Abort upstream provider request and stop writing"],
        ["Proxy buffering", "No tokens appear until the end", "Disable buffering and flush early events"],
        ["Slow browser", "Rendering lags behind generation", "Respect backpressure and batch UI updates"],
        ["Malformed provider event", "Stream ends with partial-error state", "Catch parse error and record raw event metadata safely"]
      ]
    }
  ],
  decisionGuideMD: `## Choosing a streaming design

Use **non-streaming** when the output is small, must be fully validated before display, or feeds an automated workflow where partial text has no value.

Use **SSE through your app server** for most chat, writing, support, and coding assistant experiences. It gives users early feedback while preserving server-side control over credentials, policy, logging, cancellation, and provider normalization.

Use **WebSockets** when the session is truly bidirectional: live user interrupts, collaborative editing, agent event streams, tool progress, and multiple message types over one long-lived channel.

Buffer **structured outputs** until they are parseable and valid. Streaming a JSON object directly to the UI is often worse than showing progress events and displaying the final validated object.

Always validate the infrastructure path. A design is not production-ready until it has been tested through the actual gateway, CDN, reverse proxy, compression settings, browser, and mobile network conditions.`,
  handsOn: [
    {
      title: "Proxy an OpenAI-style streaming response as browser SSE",
      detailMD: `This TypeScript example keeps the provider key on the server, parses data: lines from an OpenAI-style stream, forwards normalized token events to the browser, buffers streamed tool-call arguments, respects backpressure, and aborts the upstream request when the browser disconnects.`,
      code: {
        language: "typescript",
        label: "server.ts",
        body: `import http, { type IncomingMessage, type ServerResponse } from "node:http";

type SseResponse = ServerResponse<IncomingMessage>;

async function writeSSE(res: SseResponse, eventName: string, payload: unknown) {
  const chunk = "event: " + eventName + "\\n" + "data: " + JSON.stringify(payload) + "\\n\\n";
  if (!res.write(chunk)) {
    await new Promise(resolve => res.once("drain", resolve));
  }
}

async function readBody(req: IncomingMessage) {
  let body = "";
  for await (const chunk of req) {
    body += chunk.toString();
  }
  return body;
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    });
    res.end();
    return;
  }

  if (req.url !== "/stream" || req.method !== "POST") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const controller = new AbortController();
  res.on("close", () => {
    if (!res.writableEnded) {
      controller.abort();
    }
  });

  const bodyText = await readBody(req);
  const parsed = bodyText.length > 0 ? JSON.parse(bodyText) : {};
  const prompt = typeof parsed.prompt === "string" ? parsed.prompt : "Explain streaming responses.";

  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
    "Access-Control-Allow-Origin": "*"
  });
  res.write(": connected\\n\\n");

  let fullText = "";
  const toolArgs: Record<string, string> = {};

  try {
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + (process.env.OPENAI_API_KEY || "")
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        stream: true,
        stream_options: { include_usage: true },
        messages: [
          { role: "system", content: "Answer clearly and concisely." },
          { role: "user", content: prompt }
        ]
      }),
      signal: controller.signal
    });

    if (!upstream.ok || !upstream.body) {
      await writeSSE(res, "error", { message: "Upstream failed", status: upstream.status });
      res.end();
      return;
    }

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const result = await reader.read();
      if (result.done) {
        break;
      }

      buffer += decoder.decode(result.value, { stream: true });
      const lines = buffer.split("\\n");
      buffer = lines.pop() || "";

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (line.length === 0 || line.startsWith(":")) {
          continue;
        }
        if (!line.startsWith("data:")) {
          continue;
        }

        const data = line.slice(5).trim();
        if (data === "[DONE]") {
          await writeSSE(res, "done", { text: fullText, toolArgumentsByIndex: toolArgs });
          res.end();
          return;
        }

        const json = JSON.parse(data);
        const choice = json.choices && json.choices.length > 0 ? json.choices[0] : {};
        const delta = choice.delta || {};

        if (typeof delta.content === "string" && delta.content.length > 0) {
          fullText += delta.content;
          await writeSSE(res, "token", { text: delta.content });
        }

        if (Array.isArray(delta.tool_calls)) {
          for (const call of delta.tool_calls) {
            const index = String(call.index === undefined ? 0 : call.index);
            if (!toolArgs[index]) {
              toolArgs[index] = "";
            }
            if (call.function && typeof call.function.arguments === "string") {
              toolArgs[index] += call.function.arguments;
              await writeSSE(res, "tool_args_delta", { index: index, text: call.function.arguments });
            }
          }
        }

        if (json.usage) {
          await writeSSE(res, "usage", json.usage);
        }
      }
    }

    await writeSSE(res, "done", { text: fullText, toolArgumentsByIndex: toolArgs });
    res.end();
  } catch (error) {
    if (controller.signal.aborted) {
      return;
    }
    await writeSSE(res, "error", { message: "Stream failed after partial output" });
    res.end();
  }
});

server.listen(8787, () => {
  console.log("Streaming proxy listening on http://localhost:8787");
});`
      }
    },
    {
      title: "Consume the SSE stream with fetch and render smoothly",
      detailMD: `This browser-side example uses fetch instead of EventSource so it can send a POST body and attach an AbortController. It parses normalized SSE events, batches DOM rendering, records usage, and treats stream errors as partial answers.`,
      code: {
        language: "typescript",
        label: "client.ts",
        body: `type UsagePayload = Record<string, unknown>;

async function streamAnswer(promptText: string, output: HTMLElement, controller: AbortController) {
  const response = await fetch("/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: promptText }),
    signal: controller.signal
  });

  if (!response.ok || !response.body) {
    throw new Error("Stream request failed");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let eventName = "message";
  let fullText = "";
  let usage: UsagePayload | null = null;
  let renderScheduled = false;

  function scheduleRender() {
    if (renderScheduled) {
      return;
    }
    renderScheduled = true;
    requestAnimationFrame(() => {
      output.textContent = fullText;
      renderScheduled = false;
    });
  }

  while (true) {
    const result = await reader.read();
    if (result.done) {
      break;
    }

    buffer += decoder.decode(result.value, { stream: true });
    const lines = buffer.split("\\n");
    buffer = lines.pop() || "";

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      if (line.length === 0) {
        eventName = "message";
        continue;
      }
      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim();
        continue;
      }
      if (!line.startsWith("data:")) {
        continue;
      }

      const payload = JSON.parse(line.slice(5).trim());
      if (eventName === "token") {
        fullText += payload.text || "";
        scheduleRender();
      } else if (eventName === "usage") {
        usage = payload;
      } else if (eventName === "error") {
        output.setAttribute("data-state", "partial-error");
        throw new Error(payload.message || "Stream failed");
      } else if (eventName === "done") {
        scheduleRender();
        output.setAttribute("data-state", "complete");
        output.setAttribute("data-usage", JSON.stringify(usage));
        return fullText;
      }
    }
  }

  output.setAttribute("data-state", "partial-closed");
  return fullText;
}

const output = document.getElementById("answer") as HTMLElement;
const cancelButton = document.getElementById("cancel") as HTMLButtonElement;
const controller = new AbortController();

cancelButton.addEventListener("click", () => {
  controller.abort();
});

streamAnswer("Explain streaming responses in one paragraph.", output, controller).catch(error => {
  if (!controller.signal.aborted) {
    output.setAttribute("data-error", String(error.message || error));
  }
});`
      }
    }
  ],
  quiz: [
    {
      question: "What user-facing metric does streaming most directly improve?",
      options: [
        "Time-to-first-token and perceived latency",
        "The number of model parameters",
        "The maximum context window",
        "The need for output validation"
      ],
      answerIndex: 0,
      explanationMD: `Streaming sends partial output as soon as it is available, so users see progress earlier. Total time-to-last-token may be similar to a non-streaming request.`
    },
    {
      question: "What does the [DONE] sentinel usually mean in an OpenAI-style SSE stream?",
      options: [
        "The HTTP connection must be retried immediately",
        "The provider has finished sending stream chunks for that response",
        "The first token has been generated",
        "A tool call should execute before validation"
      ],
      answerIndex: 1,
      explanationMD: `OpenAI-style streams send data: [DONE] as a terminal marker after JSON chunks. The client or gateway should treat it as the normal end of the provider stream.`
    },
    {
      question: "Why should streamed tool-call arguments be buffered before execution?",
      options: [
        "They are always encrypted until the final event",
        "They often arrive as partial JSON fragments that are unsafe to parse or execute early",
        "They are unrelated to the model output",
        "They can only be sent through WebSockets"
      ],
      answerIndex: 1,
      explanationMD: `Tool-call arguments can arrive one fragment at a time. The application should assemble the full argument string, parse it, validate it, and enforce authorization before executing any tool.`
    },
    {
      question: "What should a server do when the browser disconnects during a stream?",
      options: [
        "Keep the provider request running so the answer can be cached",
        "Cancel the upstream provider request and stop writing to the closed downstream connection",
        "Switch from SSE to polling without telling the client",
        "Ignore the disconnect because billing stops automatically"
      ],
      answerIndex: 1,
      explanationMD: `Disconnects should propagate upstream through an abort signal or provider cancellation mechanism. Otherwise the provider may continue generating billable tokens that nobody receives.`
    },
    {
      question: "Why can proxy buffering break streaming?",
      options: [
        "It converts all JSON into XML",
        "It stores chunks and sends them later, so the browser does not see tokens as they arrive",
        "It prevents the model from generating tokens",
        "It forces the provider to use tool calling"
      ],
      answerIndex: 1,
      explanationMD: `Streaming depends on small chunks reaching the browser quickly. Proxy or CDN buffering can coalesce those chunks until the buffer fills or the response ends.`
    },
    {
      question: "How should a UI handle an error after partial tokens have already rendered?",
      options: [
        "Erase all partial text without explanation",
        "Pretend the answer completed successfully",
        "Mark the answer as partial, show an error or retry option, and avoid saving it as complete",
        "Run the tool call immediately to recover"
      ],
      answerIndex: 2,
      explanationMD: `After partial output has been shown, the honest state is a partial answer with an error. The UI should make that visible and provide recovery options.`
    }
  ],
  flashcards: [
    { front: "What is time-to-first-token?", back: "The time from starting a request until the first generated token or chunk is visible to the user." },
    { front: "What Content-Type is used for browser SSE?", back: "text/event-stream, usually with no-cache and buffering disabled." },
    { front: "What are SSE data lines?", back: "Lines beginning with data: that carry the event payload. A blank line terminates the event." },
    { front: "What does [DONE] represent in OpenAI-style streams?", back: "A terminal sentinel indicating that provider stream chunks for the response are complete." },
    { front: "Where does OpenAI-style streamed text usually appear?", back: "In choices[0].delta.content, with tool-call fragments under choices[0].delta.tool_calls." },
    { front: "What Anthropic events define the message lifecycle?", back: "Events such as message_start, content_block_delta, message_delta, and message_stop." },
    { front: "Why cancel upstream on client disconnect?", back: "To stop wasted generation, reduce billable tokens, and avoid writing to a closed downstream socket." },
    { front: "Why not render every token immediately?", back: "Too many DOM updates can cause jank, so batch rendering with animation frames or short intervals." }
  ],
  cheatSheetMD: `## Streaming responses cheat sheet

### Core idea
- Streaming sends partial model output as deltas.
- It mainly improves time-to-first-token and perceived latency.
- Total latency still depends on prompt size, model speed, queueing, tool calls, and output length.
- Use streaming when early progress helps the user.

### SSE basics
- Response header: Content-Type text/event-stream.
- Each event can include event: name and one or more data: payload lines.
- A blank line terminates the event.
- OpenAI-style streams send data: JSON chunks and a final data: [DONE].
- Your gateway can translate provider events into client events such as token, usage, error, and done.

### Provider parsing
- OpenAI text deltas commonly arrive in choices[0].delta.content.
- OpenAI tool-call fragments can arrive in choices[0].delta.tool_calls.
- Anthropic streams include message_start, content_block_start, content_block_delta, content_block_stop, message_delta, and message_stop.
- Network chunks are not event boundaries. Keep a buffer for incomplete lines.

### Reassembly rules
- Append text deltas in order.
- Track content block indexes when providers use multiple blocks.
- Buffer tool-call arguments by index or id.
- Parse and validate tool arguments only after the provider signals completion.
- Store finish reason and final usage when available.

### Production controls
- Tie browser cancellation to provider cancellation.
- Respect response backpressure and wait for drain when writes slow down.
- Disable proxy and CDN buffering for streaming routes.
- Send an explicit in-stream error after partial output failures.
- Mark partial answers as partial in the UI.
- Batch DOM rendering to avoid jank.
- Log first token, last token, aborts, errors, usage, and provider request ids.

### Interview answer shape
1. Explain perceived latency and time-to-first-token.
2. Describe SSE framing and the [DONE] sentinel.
3. Normalize provider delta events into application events.
4. Reassemble text and tool-call arguments safely.
5. Cover abort, backpressure, buffering, mid-stream errors, UI rendering, and usage accounting.`,
  references: [
    { title: "OpenAI Streaming API Documentation", kind: "Docs", url: "https://platform.openai.com/docs/api-reference/streaming", author: "OpenAI" },
    { title: "Anthropic Streaming Messages Documentation", kind: "Docs", url: "https://docs.anthropic.com/en/docs/build-with-claude/streaming", author: "Anthropic" },
    { title: "Using Server-Sent Events", kind: "Docs", url: "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events", author: "MDN Web Docs" },
    { title: "NGINX Proxy Buffering Documentation", kind: "Docs", url: "https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_buffering", author: "NGINX" }
  ],
  relatedLessons: [
    { slug: "calling-the-openai-api", note: "Provides the request and response foundation for OpenAI-style streaming chunks." },
    { slug: "calling-the-anthropic-api", note: "Covers Anthropic message events that streaming adapters must normalize." },
    { slug: "function-and-tool-calling", note: "Explains the tool-call lifecycle that becomes trickier when arguments stream incrementally." },
    { slug: "design-streaming-token-delivery", note: "Expands the same mechanics into a full production system design." }
  ]
};
