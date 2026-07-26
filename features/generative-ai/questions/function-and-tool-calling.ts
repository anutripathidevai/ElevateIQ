import type { GenAILessonContent } from "../types";

export const functionAndToolCallingContent: GenAILessonContent = {
  slug: "function-and-tool-calling",
  introductionMD: `Function and tool calling is the pattern that lets an LLM ask your application to run real code instead of trying to answer from text alone. The model does not execute the function. Your app sends tool schemas with the request, the model returns one or more tool call requests with JSON arguments, and your server validates and executes those calls.

In interviews, this topic tests whether you understand the boundary between probabilistic planning and deterministic execution. A strong answer explains the full loop: assistant tool call, application execution, tool result message, another model call, and then a final answer. It also names provider differences without treating them as different architectures.

The key production idea is control. Tool schemas guide the model, but code enforces allowlists, authorization, schema validation, retries, idempotency, and audit logging. Tool calling is the building block for agents, and protocols such as MCP standardize how tools are discovered and invoked, but the application remains responsible for safety.`,
  realWorldMD: `Tool calling appears anywhere an LLM product needs live data or real actions.

- Support copilots fetch account state, search policy docs, and create ticket updates.
- Data assistants run approved queries, summarize results, and refuse unsafe operations.
- Shopping and travel assistants check inventory, prices, calendars, or booking systems.
- Developer copilots call search, repository, test, and issue-management tools.
- Agent systems chain tool calls over multiple turns to plan, observe, and act.`,
  learningObjectives: [
    "Explain how tool schemas are passed to the model with name, description, and JSON Schema parameters.",
    "Describe the full assistant tool call, application execution, tool result, and final answer loop.",
    "Handle parallel tool calls by executing independent calls and returning all matching results.",
    "Validate model-provided JSON arguments and recover from hallucinated, missing, or unsafe values.",
    "Use tool_choice modes such as auto, required, specific tool, and none to control model behavior.",
    "Compare OpenAI, Anthropic, and Gemini tool-calling message shapes while preserving the same system design."
  ],
  theory: [
    {
      label: "Tool schemas are contracts sent with the request",
      detailMD: `A tool definition tells the model what capabilities are available. The schema usually includes a stable **name**, a clear **description**, and **parameters** expressed as JSON Schema: object type, properties, required fields, allowed enums, descriptions, and sometimes additionalProperties restrictions.

The schema is not just documentation. It shapes the model choice of whether to call a tool and what arguments to produce. Good schemas use precise names, narrow fields, explicit allowed values, and descriptions that say when the tool should and should not be used. Overbroad tools make the model guess; narrow tools make failures easier to validate and repair.`
    },
    {
      label: "The model returns a tool call instead of prose",
      detailMD: `When the model decides a tool is needed, it returns a structured assistant message rather than a final user-facing answer. In OpenAI-style APIs, the response contains **tool_calls** and commonly ends with **finish_reason** equal to **tool_calls**. Each call has an id, a function name, and JSON arguments.

That response is a request for your application to do work. It is not proof that the call is allowed, safe, or valid. The application should parse the JSON, validate it against the tool schema, authorize the operation for the current user, execute the mapped server-side function, and record the result.`
    },
    {
      label: "The tool-result loop is the core control flow",
      detailMD: `The full loop has four phases. First, the app sends messages and tool schemas to the provider. Second, the assistant returns one or more tool calls with JSON arguments. Third, the app executes the requested tools and appends tool result messages tied to the original call ids. Fourth, the app calls the model again so it can use the tool results to produce a final answer or request another tool.

This loop can repeat. A simple support answer may need one account lookup. An agentic workflow may observe a result, decide the next action, call another tool, and continue until it reaches a stop condition, budget limit, or final answer.`
    },
    {
      label: "Parallel tool calls return multiple results in one turn",
      detailMD: `Some providers allow the assistant to request multiple independent tools in one response. For example, a support assistant might ask for customer profile, recent invoices, and policy search at the same time. If the calls do not depend on each other and are safe to run concurrently, the app can execute them in parallel to reduce latency.

The important rule is correlation. Each returned tool result must reference the matching tool call id or provider-specific block id, and the app should append all results before asking the model to continue. If one call fails, return a structured error result for that call or retry according to policy instead of silently dropping it.`
    },
    {
      label: "Validation handles hallucinated and invalid arguments",
      detailMD: `Models can invent tool names, omit required fields, pass the wrong type, choose impossible enum values, or include arguments that look plausible but violate business rules. JSON Schema validation catches structural issues, but it does not prove that the user is authorized or that the requested action is safe.

A robust implementation validates in layers: tool allowlist, JSON parse, schema validation, business validation, authorization, idempotency checks, and safe execution. Invalid arguments can trigger a repair turn, a user clarification, or a refusal. Sensitive actions should not be fixed by guessing missing values.`
    },
    {
      label: "Tool choice and provider dialects are policy knobs",
      detailMD: `Most providers expose a way to control tool use. **auto** lets the model decide whether to call tools. **required** forces at least one tool call. A **specific tool** choice forces one named tool. **none** disables tools for a turn, which is useful for pure summarization or when rendering a final answer from already gathered evidence.

The names differ by provider. OpenAI uses **tools** and **tool_calls**. Anthropic represents tool requests as **tool_use** content blocks and results as **tool_result** content blocks. Gemini uses **functionCall** and **functionResponse** parts. The message dialect changes, but the application-owned loop and security boundary stay the same.`
    }
  ],
  architecture: {
    width: 960,
    height: 560,
    captionMD: `Tool calling is an application-controlled loop: model/provider <-> app server -> tool executors -> external APIs or databases, with validated results flowing back through the app before the final answer.`,
    nodes: [
      { id: "client", label: "Client", kind: "client", x: 40, y: 240, sublabel: "User request and final answer" },
      { id: "app", label: "App server", kind: "service", x: 230, y: 240, sublabel: "Messages, tool policy, validation" },
      { id: "provider", label: "Model/provider", kind: "external", x: 450, y: 110, sublabel: "OpenAI, Anthropic, Gemini" },
      { id: "executor", label: "Tool executors", kind: "worker", x: 470, y: 350, sublabel: "Typed functions and adapters" },
      { id: "policy", label: "Auth and allowlist", kind: "gateway", x: 650, y: 245, sublabel: "Server-side permissions" },
      { id: "database", label: "Application DB", kind: "database", x: 830, y: 300, sublabel: "Private product data" },
      { id: "externalApis", label: "External APIs", kind: "external", x: 830, y: 410, sublabel: "Payments, tickets, search" },
      { id: "observability", label: "Observability", kind: "monitoring", x: 665, y: 80, sublabel: "Traces, cost, audit log" }
    ],
    edges: [
      { from: "client", to: "app", label: "1. request" },
      { from: "app", to: "provider", label: "2. messages plus tool schemas" },
      { from: "provider", to: "app", label: "3. tool call JSON args" },
      { from: "app", to: "executor", label: "4. validated tool request" },
      { from: "executor", to: "policy", label: "5. authorize action" },
      { from: "policy", to: "database", label: "approved DB operation" },
      { from: "policy", to: "externalApis", label: "approved API call" },
      { from: "database", to: "executor", label: "DB result", dashed: true },
      { from: "externalApis", to: "executor", label: "API result", dashed: true },
      { from: "executor", to: "app", label: "6. tool result message" },
      { from: "app", to: "provider", label: "7. tool results for final answer" },
      { from: "provider", to: "app", label: "8. final answer" },
      { from: "app", to: "client", label: "9. response" },
      { from: "app", to: "observability", label: "trace, tokens, audit", dashed: true }
    ]
  },
  architectureNotesMD: `The model/provider is intentionally outside the trust boundary. It can propose actions, but the app server decides which tools are available, validates arguments, authorizes the user, executes server-side functions, and stores an audit trail. Tool executors should be small adapters around real business capabilities, not a generic shell or unrestricted network bridge.`,
  requestFlow: [
    {
      step: "1. Receive the user request and select available tools",
      detailMD: `The app starts with the user message, conversation state, tenant context, and policy. It chooses a narrow set of tools for this turn instead of exposing every internal capability. Tool selection can depend on product area, user permissions, environment, and safety mode.`
    },
    {
      step: "2. Send messages, tool schemas, and tool_choice",
      detailMD: `The request includes the normal model messages plus tool definitions: name, description, and JSON Schema parameters. The app can set tool_choice to auto, required, a specific tool, or none depending on whether a live capability is allowed or necessary for the current turn.`
    },
    {
      step: "3. Receive assistant tool calls",
      detailMD: `If the model wants a tool, it returns a structured assistant message with one or more calls and JSON arguments. In OpenAI-style APIs this often arrives with finish_reason set to tool_calls. The app should treat this as a proposed action, not as an executed operation.`
    },
    {
      step: "4. Parse, validate, and authorize arguments",
      detailMD: `The app parses the arguments, validates them against the declared schema, rejects unknown tools, checks business rules, and verifies the user is allowed to perform the requested action. Invalid or unsafe arguments should become a controlled error, clarification, retry, or refusal.`
    },
    {
      step: "5. Execute tools safely",
      detailMD: `The server maps each allowed tool name to a real function or adapter. Read-only calls can often run directly. Mutating calls need stronger controls such as confirmation, idempotency keys, transaction boundaries, and audit logging. Independent calls can run in parallel.`
    },
    {
      step: "6. Append tool result messages",
      detailMD: `For each tool call, the app appends a tool result message that includes the matching call id and a compact result payload. Multiple parallel calls should produce multiple result messages so the model can associate every observation with the request that caused it.`
    },
    {
      step: "7. Ask the model to continue",
      detailMD: `The app calls the model again with the original conversation, the assistant tool call message, and the tool results. The model can now produce a final answer grounded in the returned data or ask for another tool if the workflow needs another step.`
    },
    {
      step: "8. Stop, answer, or recover",
      detailMD: `The loop stops when the model returns a final answer, reaches a configured step limit, asks for a disallowed action, or hits an error policy. Production systems should log the trace, cost, latency, tool outcomes, and final response for debugging and evaluation.`
    }
  ],
  deepDives: [
    {
      label: "Designing tools the model can choose correctly",
      detailMD: `A tool should represent one clear capability. Names should be action-oriented, descriptions should include when to use the tool, and schemas should encode constraints with required fields, enums, length limits, and additionalProperties set to false when possible.

Avoid generic tools such as execute_query or call_api unless they are heavily constrained by server-side policy. Broad tools give the model too much room to invent parameters and make it harder to reason about access control. A good tool surface looks like a small product API, not a bag of arbitrary powers.`
    },
    {
      label: "Parallel calls reduce latency but require independence",
      detailMD: `Parallel tool calls are useful when the model needs several observations that do not depend on one another. Running customer lookup, policy search, and invoice retrieval concurrently can save a full round trip compared with asking the model to request them one by one.

Do not parallelize calls that have ordering constraints, shared mutable state, or side effects that must happen conditionally. For mutating actions, prefer explicit planning, user confirmation, idempotency keys, and sequential execution so the app can stop safely after a failed or denied step.`
    },
    {
      label: "Tool errors are observations, not hidden exceptions",
      detailMD: `A failed tool call can be returned to the model as a structured result saying the lookup timed out, the id was not found, or the user is not authorized. That lets the model explain the issue, ask for clarification, or choose another allowed tool.

The app should still distinguish retryable infrastructure failures from permanent validation failures. Retry transient network errors with backoff. Do not retry unsafe mutations blindly. Do not expose raw stack traces, secrets, internal table names, or policy details in tool result content.`
    },
    {
      label: "Extra model turns change latency and cost",
      detailMD: `Tool calling usually requires at least two model calls: one to request the tool and one to answer after receiving results. Agentic loops can require many more. Each loop adds provider latency, token cost, tool latency, and operational failure modes.

Reduce cost by exposing only relevant tools, keeping result payloads compact, summarizing large tool outputs before sending them back, caching read-only observations when safe, and setting a maximum step budget. A tool loop should be measured as an end-to-end transaction, not just a model call.`
    },
    {
      label: "Provider differences are message-format differences",
      detailMD: `OpenAI commonly represents tools as a top-level tools array and tool calls as assistant message fields. Anthropic represents tool use and tool result as content blocks inside messages. Gemini represents function calls and function responses as parts. Some providers return arguments as JSON strings, while others expose structured objects.

Build an internal abstraction that normalizes provider events into tool requested, tool result appended, final answer, and error. That keeps business logic independent from provider syntax while still preserving provider-specific ids needed to correlate results.`
    },
    {
      label: "Relationship to agents and MCP",
      detailMD: `Tool calling is the primitive. An agent is a policy loop that repeatedly decides what to do, calls tools, observes results, updates state, and continues toward a goal. Without tools, most agents are just chat prompts with memory. With tools, they can inspect live state and take bounded actions.

MCP, the Model Context Protocol, standardizes how applications expose tools, resources, and prompts to AI clients. MCP can make tool discovery and integration cleaner, but it does not remove the need for application-level authorization, validation, observability, and least-privilege tool design.`
    }
  ],
  productionConsiderations: [
    {
      label: "Security and permissions",
      detailMD: `Treat tools as real capabilities. Keep an allowlist of exposed tools, map tool names to server-owned functions, authorize every call server-side, and never trust model-provided arguments for sensitive actions. User confirmation is appropriate for irreversible writes, purchases, emails, deletes, permission changes, and financial operations.`
    },
    {
      label: "Observability and auditability",
      detailMD: `Log the model request id, tool schema version, tool_choice mode, selected tool name, validated arguments, execution outcome, latency, token usage, and final answer. For sensitive domains, record who authorized the action and what user-visible confirmation was shown.`
    },
    {
      label: "Reliability, retries, and idempotency",
      detailMD: `Read-only tools can often be retried after transient failures. Mutating tools need idempotency keys, deduplication, timeouts, and clear rollback or compensation behavior. The app should cap loop depth so a model cannot spin forever calling tools after repeated failures.`
    },
    {
      label: "Data minimization and result shaping",
      detailMD: `Return only the fields the model needs to answer. Large raw records increase tokens, leak unnecessary data, and invite reasoning over irrelevant details. Shape tool results into small, explicit objects with safe error messages and redact secrets before appending them to the conversation.`
    }
  ],
  interview: {
    whatInterviewersLookFor: [
      "A precise explanation that the model requests tool calls while the application executes and authorizes them.",
      "Understanding of the full tool-result loop, including assistant tool_call, tool result message, and final model answer.",
      "Practical handling of parallel tool calls, validation failures, retries, idempotency, and step limits.",
      "Provider literacy across OpenAI, Anthropic, and Gemini without confusing API syntax with architecture."
    ],
    followUps: [
      {
        question: "What exactly do you send to the model to enable tool calling?",
        answerMD: `You send the normal messages plus tool schemas. Each schema includes a tool name, a natural-language description, and JSON Schema parameters describing allowed arguments. You may also send a tool_choice policy such as auto, required, a specific tool, or none. The model uses this contract to decide whether to return a tool call instead of a final answer.`
      },
      {
        question: "What do you do after the model returns finish_reason tool_calls?",
        answerMD: `Parse the returned tool call message, validate the JSON arguments, check that the tool is allowlisted, authorize the user, execute the server-side function, and append a tool result message tied to the tool call id. Then call the model again with the tool result so it can produce the final answer or request another tool.`
      },
      {
        question: "How should an application handle hallucinated arguments?",
        answerMD: `Treat them as untrusted input. Reject unknown tools, parse JSON carefully, validate against the schema, enforce business rules, and check authorization. For safe read-only failures, you can return a structured error result or ask the model to repair. For sensitive actions, ask the user for clarification or refuse instead of guessing.`
      },
      {
        question: "When are parallel tool calls safe?",
        answerMD: `They are safe when calls are independent, read-only or otherwise idempotent, and do not rely on each other's outputs. Return one result per tool call id before continuing the model loop. Avoid parallelizing ordered mutations, conditional actions, or operations sharing state without transaction control.`
      },
      {
        question: "How is MCP related to tool calling?",
        answerMD: `MCP standardizes how AI clients discover and invoke tools, resources, and prompts across servers. It is an integration protocol around the same core idea: the model requests a capability and software executes it. MCP does not replace server-side authorization, schema validation, audit logs, or least-privilege tool design.`
      }
    ],
    alternativeDesigns: [
      {
        name: "No tools, answer from model context only",
        detailMD: `This is simplest and cheapest for generic explanation or rewriting tasks. It fails when the answer needs private data, current state, calculations, or side effects. It also pushes the model toward guessing when the correct answer requires a live lookup.`
      },
      {
        name: "Application calls tools before the model",
        detailMD: `The app can deterministically fetch known context before prompting, such as account details on a support page. This avoids a tool-selection turn and reduces latency. It is less flexible when the needed data depends on the user's question or requires multi-step planning.`
      },
      {
        name: "Agent loop with tool calling",
        detailMD: `An agent repeatedly plans, calls tools, observes results, and continues until done. This is powerful for open-ended tasks, but it needs stronger budgets, state management, safety checks, and observability than a single tool call for a narrow workflow.`
      }
    ],
    commonMistakes: [
      "Thinking the model executes tools directly instead of requesting the application to execute them.",
      "Trusting model-provided arguments without schema validation, authorization, and business-rule checks.",
      "Exposing broad tools such as unrestricted SQL, shell access, or generic HTTP calls to the model.",
      "Forgetting to append tool results with the correct call id before asking the model for the final answer."
    ]
  },
  interviewHints: [
    "Start with the contract: name, description, and JSON Schema parameters are sent with the request.",
    "Walk the loop in order: assistant tool call, app execution, tool result message, final answer.",
    "Add production controls: allowlist, validation, authorization, retries, idempotency, and audit logs.",
    "Mention provider dialects and then connect the topic to agents and MCP."
  ],
  playground: {
    descriptionMD: `This static playground shows the shape of a tool-enabled request and the two-turn response pattern. The first model turn requests a tool; the second uses the tool result to answer.`,
    systemPrompt: `You are a support assistant. Use tools when the user asks about live order status. Do not invent shipping status. If a tool result is unavailable, ask for the missing information or say you cannot verify it.`,
    userPrompt: `Where is order ord_123 and when should it arrive?`,
    parameters: [
      { name: "tools", value: "get_order_status with JSON Schema parameters", note: "The schema defines order_id as a required string." },
      { name: "tool_choice", value: "auto", note: "The model may answer directly or request a tool when live status is needed." },
      { name: "parallel_tool_calls", value: "true", note: "Independent calls can be returned together when the provider supports it." },
      { name: "max_tool_iterations", value: "3", note: "The app should cap the loop to avoid runaway tool use." }
    ],
    sampleOutputMD: `Turn 1 assistant message:

{
  "finish_reason": "tool_calls",
  "tool_calls": [
    {
      "id": "call_1",
      "name": "get_order_status",
      "arguments": {
        "order_id": "ord_123"
      }
    }
  ]
}

The application validates order_id, authorizes the current user for that order, executes get_order_status, and appends a tool result:

{
  "role": "tool",
  "tool_call_id": "call_1",
  "content": {
    "status": "shipped",
    "eta": "Tuesday"
  }
}

Turn 2 final answer:

Order ord_123 has shipped and is expected to arrive Tuesday.`
  },
  comparisons: [
    {
      title: "Tool choice modes",
      columns: ["Mode", "Meaning", "Use when", "Risk"],
      rows: [
        ["auto", "The model decides whether to call a tool", "General assistants with optional live data", "The model may skip a useful tool"],
        ["required", "The model must call at least one tool", "The answer must be grounded in live data", "Can force awkward calls for unclear requests"],
        ["specific tool", "The app forces one named tool", "A workflow step is deterministic", "Wrong if the user's intent changed"],
        ["none", "Tools are disabled for the turn", "Final synthesis, pure writing, or unsafe context", "The model may answer without needed live data"]
      ]
    },
    {
      title: "Provider tool-calling dialects",
      columns: ["Provider", "Tool request shape", "Tool result shape", "Important detail"],
      rows: [
        ["OpenAI", "tools definitions and assistant tool_calls", "tool messages tied to tool_call_id", "Arguments are often JSON strings that your app parses"],
        ["Anthropic", "tool_use content blocks", "tool_result content blocks", "Tool use and text can appear as separate content blocks"],
        ["Gemini", "functionCall parts", "functionResponse parts", "Function calls and responses are represented as message parts"]
      ]
    },
    {
      title: "Execution patterns",
      columns: ["Pattern", "Best use", "Strength", "Watch out"],
      rows: [
        ["Single tool call", "One live lookup or calculation", "Simple to validate and debug", "Still needs a second model turn"],
        ["Parallel tool calls", "Independent reads needed for one answer", "Lower end-to-end latency", "Requires result correlation and partial failure handling"],
        ["Sequential loop", "Steps depend on previous observations", "Supports planning and correction", "Higher latency and runaway-loop risk"],
        ["MCP tools", "Standardized tool discovery across servers", "Cleaner integrations", "Protocol does not replace authorization"]
      ]
    }
  ],
  decisionGuideMD: `## Choosing a tool-calling design

Use **no tools** when the task is pure rewriting, brainstorming, or explanation and does not require private or current data.

Use **pre-fetched context** when the app already knows exactly which data is needed, such as a support page that always includes the active account and current subscription.

Use **auto tool calling** when the needed data depends on the user's question. Keep the available tools narrow and descriptions clear so the model can choose well.

Use **required or specific tool choice** when the workflow demands a verified lookup or a deterministic step. This is common for eligibility checks, policy search, and structured extraction before final synthesis.

Use **parallel tool calls** for independent reads. Return one tool result per call id and include structured error results for failures.

Use **sequential agent loops** when each observation changes the next action. Add loop limits, budgets, safety checks, user confirmations for side effects, and audit logs.

Use **MCP** when you need a standard way for AI clients to discover and call tools from multiple servers. Keep the same least-privilege and validation rules you would use for native tools.`,
  handsOn: [
    {
      title: "Implement a minimal tool-result loop",
      detailMD: `This example shows the core loop without calling a real provider. The fake provider first returns a tool call, the app validates and executes it, then the fake provider returns a final answer after seeing the tool result.`,
      code: {
        language: "python",
        label: "tool_loop.py",
        body: `import json

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_order_status",
            "description": "Look up shipping status for an order owned by the current user.",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_id": {
                        "type": "string",
                        "description": "Order id such as ord_123."
                    }
                },
                "required": ["order_id"],
                "additionalProperties": False
            }
        }
    }
]

tools_by_name = {}
for tool in tools:
    tools_by_name[tool["function"]["name"]] = tool

def validate_arguments(schema, args):
    if schema.get("type") != "object" or not isinstance(args, dict):
        raise ValueError("Tool arguments must be an object.")
    properties = schema.get("properties", {})
    for name in schema.get("required", []):
        if name not in args:
            raise ValueError("Missing required argument: " + name)
    for name in args:
        if name not in properties:
            raise ValueError("Unexpected argument: " + name)
        expected_type = properties[name].get("type")
        if expected_type == "string" and not isinstance(args[name], str):
            raise ValueError("Argument must be a string: " + name)
    return args

def get_order_status(order_id):
    if not order_id.startswith("ord_"):
        raise ValueError("Invalid order id.")
    return {
        "order_id": order_id,
        "status": "shipped",
        "eta": "Tuesday"
    }

executors = {
    "get_order_status": get_order_status
}

def fake_provider(messages, available_tools):
    has_tool_result = False
    for message in messages:
        if message.get("role") == "tool":
            has_tool_result = True
    if not has_tool_result:
        return {
            "finish_reason": "tool_calls",
            "message": {
                "role": "assistant",
                "content": None,
                "tool_calls": [
                    {
                        "id": "call_1",
                        "type": "function",
                        "function": {
                            "name": "get_order_status",
                            "arguments": json.dumps({"order_id": "ord_123"})
                        }
                    }
                ]
            }
        }
    return {
        "finish_reason": "stop",
        "message": {
            "role": "assistant",
            "content": "Order ord_123 has shipped and is expected Tuesday."
        }
    }

messages = [
    {"role": "system", "content": "Use tools for live order status."},
    {"role": "user", "content": "Where is order ord_123?"}
]

while True:
    response = fake_provider(messages, tools)
    assistant_message = response["message"]
    if response["finish_reason"] != "tool_calls":
        print(assistant_message["content"])
        break

    messages.append(assistant_message)
    for call in assistant_message["tool_calls"]:
        function_name = call["function"]["name"]
        if function_name not in executors:
            raise ValueError("Tool not allowed: " + function_name)
        raw_arguments = call["function"]["arguments"]
        parsed_arguments = json.loads(raw_arguments)
        schema = tools_by_name[function_name]["function"]["parameters"]
        arguments = validate_arguments(schema, parsed_arguments)
        result = executors[function_name](**arguments)
        messages.append({
            "role": "tool",
            "tool_call_id": call["id"],
            "name": function_name,
            "content": json.dumps(result)
        })`
      }
    },
    {
      title: "Return multiple parallel tool results",
      detailMD: `When the assistant requests independent tools in one turn, execute them concurrently and append one result message per call id before continuing the model loop.`,
      code: {
        language: "python",
        label: "parallel_tool_results.py",
        body: `import json
from concurrent.futures import ThreadPoolExecutor

def search_policy(query):
    return {
        "query": query,
        "answer": "Refunds are available within 30 days for eligible orders."
    }

def get_customer(customer_id):
    return {
        "customer_id": customer_id,
        "plan": "business",
        "region": "us"
    }

executors = {
    "search_policy": search_policy,
    "get_customer": get_customer
}

assistant_message = {
    "role": "assistant",
    "tool_calls": [
        {
            "id": "call_policy",
            "type": "function",
            "function": {
                "name": "search_policy",
                "arguments": json.dumps({"query": "refund window"})
            }
        },
        {
            "id": "call_customer",
            "type": "function",
            "function": {
                "name": "get_customer",
                "arguments": json.dumps({"customer_id": "cus_42"})
            }
        }
    ]
}

def execute_call(call):
    function_name = call["function"]["name"]
    if function_name not in executors:
        return {
            "role": "tool",
            "tool_call_id": call["id"],
            "name": function_name,
            "content": json.dumps({"error": "Tool is not allowlisted."})
        }
    arguments = json.loads(call["function"]["arguments"])
    result = executors[function_name](**arguments)
    return {
        "role": "tool",
        "tool_call_id": call["id"],
        "name": function_name,
        "content": json.dumps(result)
    }

with ThreadPoolExecutor(max_workers=len(assistant_message["tool_calls"])) as pool:
    tool_results = list(pool.map(execute_call, assistant_message["tool_calls"]))

messages_for_next_model_call = [assistant_message] + tool_results
for message in messages_for_next_model_call:
    print(json.dumps(message))`
      }
    }
  ],
  quiz: [
    {
      question: "What does the model do during tool calling?",
      options: [
        "It directly executes the function inside the provider runtime",
        "It returns a structured request for the application to execute a tool",
        "It bypasses the application and writes to the database",
        "It guarantees that all arguments are safe"
      ],
      answerIndex: 1,
      explanationMD: `The model proposes a tool call with arguments. The application validates, authorizes, executes, and returns the result.`
    },
    {
      question: "What belongs in a typical tool schema?",
      options: [
        "Only the function source code",
        "Name, description, and JSON Schema parameters",
        "A user password and database connection string",
        "Only an example final answer"
      ],
      answerIndex: 1,
      explanationMD: `Tool schemas describe the callable capability and its allowed arguments so the model can choose and fill the tool request.`
    },
    {
      question: "What should happen after the assistant returns tool_calls?",
      options: [
        "Show the raw arguments directly to the user as the final answer",
        "Validate and execute the call, append tool results, then call the model again",
        "Assume the provider already executed the function",
        "Delete the conversation state"
      ],
      answerIndex: 1,
      explanationMD: `The application-owned loop requires execution and a tool result message before the model can produce a grounded final answer.`
    },
    {
      question: "Why is argument validation required even when a JSON Schema was supplied?",
      options: [
        "The model can still hallucinate fields, types, values, or unsafe requests",
        "JSON Schema is only for styling the UI",
        "Validation makes all authorization unnecessary",
        "Schemas are never visible to the model"
      ],
      answerIndex: 0,
      explanationMD: `Schemas guide generation but do not enforce safety. Your code must parse, validate, authorize, and apply business rules.`
    },
    {
      question: "When are parallel tool calls appropriate?",
      options: [
        "When calls are independent and can be safely executed at the same time",
        "When one call must wait for another call's output",
        "When every call mutates shared state",
        "When you do not plan to return tool results"
      ],
      answerIndex: 0,
      explanationMD: `Parallel calls are best for independent observations. Return all matching results before continuing the model loop.`
    },
    {
      question: "Which statement about provider differences is most accurate?",
      options: [
        "OpenAI, Anthropic, and Gemini use different message shapes but the application loop is the same",
        "Only OpenAI supports tool calling",
        "Provider syntax removes the need for server-side authorization",
        "Gemini function responses are final answers and cannot be sent back to the model"
      ],
      answerIndex: 0,
      explanationMD: `OpenAI tool_calls, Anthropic tool_use and tool_result blocks, and Gemini functionCall and functionResponse parts express the same application-controlled pattern.`
    }
  ],
  flashcards: [
    { front: "What is tool calling?", back: "A pattern where the model requests a named tool with JSON arguments and the application executes it." },
    { front: "What are the core parts of a tool schema?", back: "Name, description, and JSON Schema parameters." },
    { front: "What does finish_reason tool_calls mean?", back: "The model is asking for tool execution rather than returning a final answer." },
    { front: "Who validates and authorizes tool arguments?", back: "The application server, not the model or provider." },
    { front: "How do you return parallel tool results?", back: "Append one tool result message for each tool call id before the next model call." },
    { front: "What does tool_choice none do?", back: "It disables tool use for that model turn." },
    { front: "How is tool calling related to agents?", back: "Agents repeatedly choose tools, observe results, and continue toward a goal." },
    { front: "What does MCP standardize?", back: "Discovery and invocation of tools, resources, and prompts across AI clients and servers." }
  ],
  cheatSheetMD: `## Function and tool calling cheat sheet

### Core loop
1. App receives the user request.
2. App sends messages plus tool schemas.
3. Model returns assistant tool call JSON arguments instead of final prose.
4. App parses, validates, authorizes, and executes server-side functions.
5. App appends tool result messages tied to call ids.
6. App calls the model again.
7. Model returns a final answer or requests another tool.

### Tool schema design
- Use a stable, descriptive tool name.
- Write a description that says when to use and when not to use the tool.
- Define parameters with JSON Schema.
- Mark required fields.
- Use enums for bounded choices.
- Reject unknown fields when possible.
- Keep tools narrow and product-shaped.

### Tool choice
- **auto**: model decides.
- **required**: at least one tool call is required.
- **specific tool**: app forces one named tool.
- **none**: tools are disabled for this turn.

### Validation layers
- Tool name is allowlisted.
- JSON parses successfully.
- Arguments match schema.
- Business rules pass.
- User is authorized.
- Mutating action is idempotent or confirmed.
- Result is redacted and shaped before returning to the model.

### Parallel calls
- Run only independent calls in parallel.
- Preserve every provider call id.
- Return one result per call.
- Represent failures as structured tool results or controlled retries.
- Avoid parallel side effects unless transaction semantics are clear.

### Provider mapping
- OpenAI: tools and tool_calls, then tool messages with tool_call_id.
- Anthropic: tool_use and tool_result content blocks.
- Gemini: functionCall and functionResponse parts.

### Interview answer shape
1. Define the schema contract.
2. Explain the assistant tool call response.
3. Walk through execution and tool result messages.
4. Cover validation, authorization, and invalid arguments.
5. Mention parallel calls and provider differences.
6. Connect the loop to agents and MCP.`,
  references: [
    { title: "OpenAI Function Calling Guide", kind: "Docs", url: "https://platform.openai.com/docs/guides/function-calling", author: "OpenAI" },
    { title: "Anthropic Tool Use Documentation", kind: "Docs", url: "https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview", author: "Anthropic" },
    { title: "Gemini Function Calling Documentation", kind: "Docs", url: "https://ai.google.dev/gemini-api/docs/function-calling", author: "Google" },
    { title: "Model Context Protocol Documentation", kind: "Docs", url: "https://modelcontextprotocol.io/docs", author: "Model Context Protocol" }
  ],
  relatedLessons: [
    { slug: "model-context-protocol", note: "Shows how MCP standardizes discovery and invocation of tools across AI clients and servers." },
    { slug: "design-ai-agent", note: "Builds on tool calling to create a planning, acting, and observing agent loop." },
    { slug: "structured-outputs", note: "Explains schema-constrained outputs, which are closely related to tool argument validation." },
    { slug: "defending-against-prompt-injection", note: "Covers attacks where untrusted content tries to misuse tools or override policy." }
  ]
};
