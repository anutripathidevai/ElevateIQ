import type { GenAILessonContent } from "../types";

export const modelContextProtocolContent: GenAILessonContent = {
  slug: "model-context-protocol",
  introductionMD: `Model Context Protocol, usually shortened to MCP, is an open standard originating from Anthropic for connecting LLM applications to external tools and data through a uniform client/server protocol. Instead of every IDE, chat client, agent framework, and desktop app inventing a different integration format, MCP gives them a shared way to discover capabilities, exchange messages, and call external systems.

The core idea is simple: integrations should be written once and reused across many hosts. A host application runs one or more MCP clients, and each client maintains a connection to an MCP server. The server exposes capabilities such as model-callable tools, readable resources, and reusable prompts. The model still reasons in the host, but the host can now obtain context and perform actions through standardized servers.

In interviews, MCP is a strong signal topic because it sits at the boundary between LLM product design and distributed systems. A good explanation distinguishes MCP from raw tool calling, describes the initialize and capabilities handshake, names the transports and JSON-RPC 2.0 framing, and calls out trust, permissions, and resource exposure as first-class design concerns.`,
  realWorldMD: `MCP shows up anywhere a product wants LLM features to reach real systems without hardcoding every integration into every app.

- AI coding assistants connect to source control, issue trackers, local files, build tools, and documentation servers.
- Enterprise copilots expose approved CRM, ticketing, wiki, calendar, and data warehouse context through reusable servers.
- Agent platforms let teams install third-party MCP servers instead of writing custom adapters for each host.
- Desktop and IDE hosts can run local stdio servers for private machine context while also connecting to remote HTTP servers for cloud services.`,
  learningObjectives: [
    "Explain MCP as an open client/server standard for connecting LLM hosts to tools, resources, and prompts.",
    "Describe the host, MCP client, MCP server, and underlying external system roles.",
    "Differentiate the three core server primitives: tools, resources, and prompts.",
    "Understand stdio and streamable HTTP/SSE transports, JSON-RPC 2.0 framing, and the initialize handshake.",
    "Contrast MCP with raw function or tool calling in a model request.",
    "Identify security risks around server trust, permissions, sensitive resources, and tool authorization."
  ],
  theory: [
    {
      label: "MCP standardizes integrations around the host and server boundary",
      detailMD: `MCP treats the LLM application as a **host**. The host might be an IDE, desktop chat client, web chat product, agent runtime, or internal copilot. The host runs one or more **MCP clients**, and each client connects to exactly one **MCP server** over a supported transport.

The server owns an integration boundary. It might know how to read a repository, query a database, search a wiki, create a ticket, or call an internal API. The host does not need to know each service API directly. It only needs to speak MCP, discover what the server offers, and decide when to surface those capabilities to the model or user.`
    },
    {
      label: "The M-by-N integration problem becomes M hosts plus N servers",
      detailMD: `Without a shared protocol, every host has to build a custom adapter for every external system. Five hosts and ten services can become fifty integration projects, each with its own schemas, authentication assumptions, error handling, and permission UX.

MCP changes that shape. Each host implements MCP client behavior once, and each service exposes an MCP server once. New hosts can reuse existing servers, and new servers become available to existing hosts. This does not remove product-specific policy, but it removes a large amount of repetitive transport and capability plumbing.`
    },
    {
      label: "Tools are model-callable functions",
      detailMD: `An MCP **tool** is an operation the host may allow the model to call. A tool has a name, description, input schema, and result. Examples include search_issues, summarize_ticket, run_sql_readonly, create_calendar_hold, or fetch_pull_request_diff.

Tools are the closest MCP primitive to familiar LLM function calling, but the important difference is where the integration lives. In raw function calling, the application usually sends tool schemas inside a model request and executes the functions itself. In MCP, the server publishes tools through a reusable protocol, and multiple hosts can discover and call the same server-defined capability.`
    },
    {
      label: "Resources are readable context",
      detailMD: `An MCP **resource** is data the application can load as context. Resources are usually addressed by a URI-like identifier and may represent files, documents, database rows, logs, tickets, dashboards, or generated views over a service.

Resources are not automatically safe just because they are read-only. A server can expose sensitive documents, private paths, or stale data if it is configured carelessly. A production host should make resource selection visible, enforce authorization outside the model, and avoid loading broad private context simply because a server can provide it.`
    },
    {
      label: "Prompts are reusable task templates",
      detailMD: `An MCP **prompt** is a reusable, parameterized prompt template published by a server. Prompts let an integration package recommended workflows with the context source it understands. For example, a repository server could publish prompts for reviewing a pull request, explaining a module, or drafting a changelog from commits.

Prompts are not a replacement for the host system prompt. They are reusable assets the host may present to the user or combine with application policy. A mature host still decides priority, safety rules, model selection, and what context or tools are allowed for a given user action.`
    },
    {
      label: "Protocol mechanics: JSON-RPC, transports, and capabilities",
      detailMD: `MCP messages use JSON-RPC 2.0 style request, response, and notification framing. The client and server begin with an initialize exchange where they negotiate protocol version and advertise capabilities. After initialization, the client can ask the server to list tools, list resources, list prompts, read a resource, get a prompt, or call a tool.

For local integrations, stdio is common: the host starts the MCP server as a subprocess and exchanges JSON-RPC messages over standard input and output. For remote integrations, streamable HTTP and SSE-style streaming support networked servers. The transport changes how bytes move, but the capability model stays consistent.`
    }
  ],
  architecture: {
    width: 960,
    height: 560,
    captionMD: `MCP keeps the LLM host on the left, integration servers on the right, and external systems behind those servers. The host runs MCP clients, each client speaks JSON-RPC over a transport, and each server exposes tools, resources, and prompts backed by real systems.`,
    nodes: [
      { id: "host-app", label: "Host app", kind: "client", x: 70, y: 250, sublabel: "IDE, chat client, agent runtime" },
      { id: "local-client", label: "MCP client", kind: "service", x: 270, y: 165, sublabel: "Local session in the host" },
      { id: "remote-client", label: "MCP client", kind: "service", x: 270, y: 335, sublabel: "Remote session in the host" },
      { id: "local-server", label: "Local MCP server", kind: "service", x: 485, y: 165, sublabel: "Subprocess over stdio" },
      { id: "remote-server", label: "Remote MCP server", kind: "service", x: 485, y: 335, sublabel: "HTTP or SSE endpoint" },
      { id: "capabilities", label: "Server primitives", kind: "worker", x: 690, y: 250, sublabel: "Tools, resources, prompts" },
      { id: "local-systems", label: "Local systems", kind: "storage", x: 870, y: 160, sublabel: "Files, CLIs, repos" },
      { id: "external-systems", label: "External systems", kind: "external", x: 870, y: 340, sublabel: "APIs, databases, SaaS" }
    ],
    edges: [
      { from: "host-app", to: "local-client", label: "runs client" },
      { from: "host-app", to: "remote-client", label: "runs client" },
      { from: "local-client", to: "local-server", label: "stdio JSON-RPC" },
      { from: "remote-client", to: "remote-server", label: "HTTP/SSE JSON-RPC" },
      { from: "local-server", to: "capabilities", label: "lists and invokes" },
      { from: "remote-server", to: "capabilities", label: "lists and invokes" },
      { from: "capabilities", to: "local-systems", label: "read or act" },
      { from: "capabilities", to: "external-systems", label: "read or act" }
    ]
  },
  architectureNotesMD: `The diagram intentionally separates the **host** from the **server**. The host owns the model conversation, user experience, policy decisions, and permission prompts. The server owns service-specific integration code and exposes a normalized MCP surface.

The MCP client is not the model. It is host-side protocol machinery. The model may propose using a tool or request context, but the host decides whether to call an MCP server, which arguments to send, whether the user must approve, and how returned data enters the model context.

Local stdio servers are attractive for private developer workflows because the host can spawn a subprocess with limited local permissions. Remote servers are attractive for shared enterprise integrations, but they require stronger authentication, tenant isolation, network controls, audit logs, and careful handling of streaming responses.`,
  requestFlow: [
    {
      step: "1. User opens a host application",
      detailMD: `The user works inside an LLM host such as an IDE, chat client, or agent console. The host has its own model configuration, system prompt, UI, account identity, and product policy. MCP does not replace that host; it gives the host a standard way to reach outside capabilities.`
    },
    {
      step: "2. Host starts or connects MCP clients",
      detailMD: `For each configured server, the host creates an MCP client session. A local server may be launched as a subprocess over stdio. A remote server may be contacted over streamable HTTP or SSE. Each client tracks one server connection, lifecycle, and protocol state.`
    },
    {
      step: "3. Client and server initialize",
      detailMD: `The first protocol exchange negotiates version and capabilities. The client sends initialize information, the server replies with the protocol version and supported features, and the session moves into normal operation. If versions or required capabilities do not match, the host should fail closed or degrade cleanly.`
    },
    {
      step: "4. Host discovers capabilities",
      detailMD: `The host asks the server to list available tools, resources, and prompts. This is discovery, not automatic permission to use everything. A good host filters capabilities by user identity, workspace trust, admin policy, and whether a server is local, remote, first-party, or third-party.`
    },
    {
      step: "5. User or model selects a capability",
      detailMD: `The model may infer that a tool would help, the user may choose a prompt, or the host may load a resource as context. The host should make the action understandable: which server is involved, what data will be sent, what operation will occur, and whether the operation is read-only or mutating.`
    },
    {
      step: "6. Client sends a JSON-RPC request",
      detailMD: `The MCP client sends a typed request such as reading a resource, getting a prompt, or calling a tool. Arguments are serialized through JSON-RPC 2.0 framing. The server validates the request, runs integration logic, and returns structured content, errors, or progress notifications depending on the capability.`
    },
    {
      step: "7. Host injects results into the LLM workflow",
      detailMD: `The returned data may become model context, a displayed artifact, a tool result message, or a follow-up prompt. The host should preserve provenance so the model and user can distinguish server-provided evidence from user instructions and model-generated text.`
    },
    {
      step: "8. Host audits and enforces policy",
      detailMD: `Production hosts log the server, capability name, arguments, user identity, approval decision, response status, latency, and errors. For sensitive or mutating actions, the host should require explicit approval, apply allowlists, and keep enough audit data to investigate misuse.`
    }
  ],
  deepDives: [
    {
      label: "MCP is not the same as function calling",
      detailMD: `Function calling is usually a model API feature: the application supplies a set of function schemas in the model request, the model selects a function-like call, and the application executes local code. That is powerful, but the schema and execution path are often specific to one app.

MCP is an integration and transport standard. It defines how hosts discover and call capabilities from servers outside the model request. A host may still translate MCP tools into whatever tool-calling format its chosen model provider expects. MCP standardizes the application-to-integration boundary, not the model provider interface itself.`
    },
    {
      label: "Capability discovery changes product UX",
      detailMD: `Because servers can list tools, resources, and prompts at runtime, a host can build dynamic UI around installed integrations. Users can inspect what a server offers, approve a specific operation, or choose a reusable prompt exposed by a domain-specific server.

The risk is overexposure. A server with hundreds of tools or broad resource roots can overwhelm both the user and the model. Good hosts rank, filter, group, and describe capabilities rather than dumping every server action into the model context on every turn.`
    },
    {
      label: "Transports affect trust and operations",
      detailMD: `Stdio is simple for local integrations because the server runs as a child process of the host. It is easy to install, works offline, and can access local developer context when allowed. It also means the host is executing code on the user's machine, so package trust, path configuration, and environment variables matter.

Remote HTTP or SSE-style transports make shared enterprise servers easier to operate, patch, observe, and govern. They also introduce network failures, authentication flows, rate limits, multi-tenant authorization, and data residency questions. The protocol is uniform, but the operational risk profile is not.`
    },
    {
      label: "Resources need provenance and least privilege",
      detailMD: `A resource can look harmless because it is read-only, but reading the wrong thing into an LLM context can leak secrets or create prompt injection risk. Files, tickets, documents, and dashboards may contain instructions that should be treated as data, not policy.

Production designs should scope resource roots, require user authorization, label resource origin, and avoid blindly loading large or sensitive context. The host should also protect higher-priority instructions from being overridden by content that came from a resource.`
    },
    {
      label: "Errors and partial results are normal",
      detailMD: `MCP servers are integrations, and integrations fail. A tool call can time out, a resource can disappear, a remote server can rate limit, or a local subprocess can crash. The host should render errors in a way the model and user can act on instead of silently retrying until state changes unexpectedly.

For mutating tools, idempotency and confirmation are especially important. If a create_ticket call times out after reaching the external API, a retry might create duplicates unless the server or host uses request ids, deduplication keys, or an explicit read-after-write verification step.`
    }
  ],
  productionConsiderations: [
    {
      label: "Server trust and supply chain",
      detailMD: `Installing an MCP server is closer to installing an integration plugin than adding a prompt snippet. A local server may execute code on the user's machine, and a remote server may receive sensitive context. Enterprises need allowlists, provenance checks, version pinning, package review, and clear ownership for every approved server.`
    },
    {
      label: "Permission prompts and approval design",
      detailMD: `The host should ask for approval at the right granularity. Reading a known public README is different from reading a private directory. Searching tickets is different from closing a ticket. Permission prompts should show the server name, capability name, arguments, data scope, and whether the action is read-only or mutating.`
    },
    {
      label: "Observability and audit logs",
      detailMD: `Log capability discovery, tool calls, resource reads, prompt usage, transport errors, latency, approval outcomes, user identity, workspace identity, and server version. These logs help debug model behavior, investigate data access, and prove that the host enforced policy rather than letting the model act freely.`
    },
    {
      label: "Timeouts, retries, and graceful degradation",
      detailMD: `A slow server should not stall the whole chat or IDE. Hosts need request timeouts, cancellation, bounded retries, and clear fallback behavior. Remote servers should return structured errors and rate-limit information. Local servers should be restarted only when safe, with crash loops surfaced to the user instead of hidden.`
    }
  ],
  interview: {
    whatInterviewersLookFor: [
      "A precise definition of MCP as an open client/server standard for LLM integrations, not another model architecture.",
      "Clear architecture language: host runs MCP clients, each client connects to an MCP server, and the server exposes tools, resources, and prompts.",
      "Understanding of protocol mechanics: stdio and HTTP/SSE transports, JSON-RPC 2.0 messages, initialize handshake, and capability discovery.",
      "Security maturity around server trust, permission prompts, least-privilege resources, and not treating prompts as access control."
    ],
    followUps: [
      {
        question: "How is MCP different from raw function calling?",
        answerMD: `Raw function calling is usually defined inside a model provider request: the app sends tool schemas, the model emits a tool call, and the app executes local code. MCP is a reusable integration protocol between a host and external servers. A host may translate MCP tools into provider-specific function calls, but MCP standardizes discovery, transport, and server reuse across hosts.`
      },
      {
        question: "What are the three core MCP server primitives?",
        answerMD: `Tools are model-callable operations. Resources are readable data or context the app can load. Prompts are reusable, parameterized prompt templates published by a server. A mature host treats these differently because calling a tool, reading a resource, and applying a prompt have different user experience and security implications.`
      },
      {
        question: "Why does MCP reduce the M-by-N integration problem?",
        answerMD: `Each host implements MCP client behavior once, and each external system can expose one MCP server. Instead of every host writing a custom integration for every service, hosts and servers meet at a shared protocol. Product policy still differs by host, but the transport, discovery, and capability model are reusable.`
      },
      {
        question: "What should a host do before allowing a tool call from an MCP server?",
        answerMD: `The host should verify that the server is trusted, the user is authorized, the capability is allowed in this workspace, the arguments are understandable, and the action is safe or explicitly approved. For mutating tools, the host should show a permission prompt and log the decision, arguments, result, and external system status.`
      }
    ],
    alternativeDesigns: [
      {
        name: "Direct app integrations",
        detailMD: `The host directly implements every service integration. This gives maximum control and can be best for a small number of first-party, deeply integrated workflows. It scales poorly when many hosts and many services need to interoperate because each pair needs custom code and maintenance.`
      },
      {
        name: "Provider-specific tool schemas only",
        detailMD: `The application describes tools directly in each model request using one provider's function-calling format. This is straightforward for a single app and a fixed model provider. It becomes less reusable when multiple hosts, model providers, or external service teams need a shared integration surface.`
      },
      {
        name: "Plugin marketplace without a shared protocol",
        detailMD: `A marketplace can solve discovery and distribution but still leave each plugin with custom runtime contracts. MCP is lower level: it defines how a host and server communicate. A marketplace can sit on top of MCP, but the protocol is what makes server capabilities portable across hosts.`
      }
    ],
    commonMistakes: [
      "Calling MCP a model feature instead of an application integration protocol.",
      "Forgetting that the host runs clients and owns policy; the MCP server exposes capabilities but should not decide all user-facing safety behavior.",
      "Dumping every discovered tool and resource into model context without filtering, ranking, or permission checks.",
      "Assuming read-only resources are automatically safe to expose to an LLM."
    ]
  },
  interviewHints: [
    "Start by naming the roles: host, MCP client, MCP server, and underlying system.",
    "Then list the primitives: tools, resources, and prompts.",
    "Explain the protocol mechanics: initialize, capabilities, JSON-RPC 2.0, stdio, and HTTP/SSE.",
    "Close with why it matters and how you secure it: reuse, permissions, least privilege, and auditability."
  ],
  playground: {
    descriptionMD: `This static playground frames MCP as a host design choice. The same external ticketing integration can be exposed as a reusable MCP server instead of hardcoded into one chat product.`,
    systemPrompt: `You are designing an enterprise LLM host that supports MCP integrations.
Explain integration choices in terms of reuse, trust, capability discovery, and user permissions.
Do not assume that a server is trusted just because it implements MCP.`,
    userPrompt: `Scenario: The support team wants an AI assistant to summarize tickets and draft replies from the company ticketing system.

Compare two options:
1. Build a one-off ticketing integration directly inside the host.
2. Build a ticketing MCP server exposing read_ticket, search_tickets, and draft_reply_prompt.

Return a concise recommendation with security checks.`,
    parameters: [
      { name: "transport", value: "streamable_http", note: "A remote shared server fits a centrally operated enterprise ticketing integration." },
      { name: "capability_scope", value: "read_ticket, search_tickets, draft_reply_prompt", note: "Expose a narrow set first instead of the full ticketing API." },
      { name: "permission_mode", value: "prompt_on_sensitive_read", note: "Ask for approval when reading private or customer-sensitive tickets." },
      { name: "audit_fields", value: "user, server, capability, arguments, approval, status", note: "The host and server should both leave an investigation trail." }
    ],
    sampleOutputMD: `Recommendation: use an MCP server if the ticketing integration should be reused by multiple hosts or teams. The host should still control which users can access the server, which tools are visible, when approval is required, and how ticket data is inserted into model context.

Security checks:
- Approve the server package and owner.
- Scope ticket reads by user role and workspace.
- Display the tool name and ticket ids before sensitive reads.
- Treat ticket text as data, not instructions.
- Log capability calls and returned status.`
  },
  comparisons: [
    {
      title: "MCP server primitives",
      columns: ["Primitive", "What it exposes", "Best use", "Main risk"],
      rows: [
        ["Tools", "Callable operations with schemas and results", "Searching, creating, updating, or computing through external systems", "Mutating actions can be triggered without clear approval"],
        ["Resources", "Readable data or context addressed by identifiers", "Files, documents, tickets, database views, logs, and dashboards", "Sensitive or untrusted content may enter the model context"],
        ["Prompts", "Reusable parameterized prompt templates", "Shared workflows such as review, summarize, explain, or draft", "Template priority can be confused with host policy"]
      ]
    },
    {
      title: "Transports and deployment shapes",
      columns: ["Transport", "Typical deployment", "Best fit", "Tradeoff"],
      rows: [
        ["stdio", "Local subprocess started by the host", "Developer tools, local files, CLIs, private machine context", "Local code execution and environment trust matter"],
        ["streamable HTTP", "Remote server reached over the network", "Shared enterprise integrations and centrally operated services", "Requires authentication, tenancy, rate limits, and network resilience"],
        ["SSE-style streaming", "Remote endpoint that can stream events", "Long-running operations or incremental updates", "More operational complexity and connection handling"]
      ]
    },
    {
      title: "MCP versus nearby patterns",
      columns: ["Pattern", "Where the contract lives", "Reuse model", "When to choose it"],
      rows: [
        ["MCP", "Between host clients and MCP servers", "One server can serve many hosts", "When integrations should be portable across LLM applications"],
        ["Raw function calling", "Inside a model provider request", "Usually specific to one app and provider path", "When a single app owns the tools and execution loop"],
        ["Direct REST integration", "Inside host application code", "Reusable only if the app team packages it separately", "When tight product control matters more than portability"],
        ["Plugin API", "Inside a host-specific extension runtime", "Reusable mainly within that host ecosystem", "When distribution and UI extension points are host-specific"]
      ]
    }
  ],
  decisionGuideMD: `## Choosing when to use MCP

Use **MCP** when a capability should be reused across more than one LLM host, when service teams want to own their integration code, or when a product needs runtime discovery of tools, resources, and prompts.

Use **raw function calling** when one application owns a small set of tools and does not need portability. It is often simpler for a single product workflow, especially when the tool code already lives beside the model orchestration layer.

Use **direct integrations** when the host needs deep, custom UX and policy that would be awkward to express through a generic server. This can be right for first-party flagship features, but it does not scale well across many services and hosts.

Prefer **stdio** for local developer or desktop workflows where the server needs local context and can be installed with clear trust boundaries. Prefer **remote HTTP/SSE** when a company wants centralized operations, shared credentials, audit controls, and consistent updates.

Before adopting any MCP server, answer four questions:
1. Who owns and updates the server?
2. What tools, resources, and prompts does it expose?
3. What data can leave the host and what data can enter the model context?
4. Which actions require user approval, admin approval, audit logging, or complete blocking?`,
  handsOn: [
    {
      title: "Sketch a minimal MCP server exposing one tool",
      detailMD: `This Python sketch uses the MCP Python SDK style to expose a single read-only tool. In a real server, replace the in-memory dictionary with an authorized service call and keep the transport, permissions, and audit behavior explicit.`,
      code: {
        language: "python",
        label: "server.py",
        body: `from mcp.server.fastmcp import FastMCP

mcp = FastMCP("workspace-helper")

@mcp.tool()
def summarize_ticket(ticket_id: str) -> str:
    tickets = {
        "INC-1001": "Checkout errors increased after deploy 42. Rollback completed.",
        "INC-1002": "Search latency is high in region west. Index rebuild is in progress."
    }
    details = tickets.get(ticket_id)
    if details is None:
        return "Ticket not found: " + ticket_id
    return "Ticket " + ticket_id + ": " + details

if __name__ == "__main__":
    mcp.run(transport="stdio")`
      }
    },
    {
      title: "Configure a host to start the local server",
      detailMD: `A local stdio server is commonly registered in host configuration. The important product details are not just the command and arguments; the host should also know whether the workspace trusts this server and what capabilities should be visible to the model.`,
      code: {
        language: "json",
        label: "mcp_config.json",
        body: `{
  "mcpServers": {
    "workspace-helper": {
      "command": "python",
      "args": ["server.py"],
      "env": {
        "READ_ONLY": "true"
      }
    }
  }
}`
      }
    }
  ],
  quiz: [
    {
      question: "What problem does MCP primarily solve?",
      options: [
        "It replaces transformer attention with a new model architecture",
        "It standardizes how LLM hosts connect to external tools, resources, and prompts",
        "It guarantees that model outputs are always correct",
        "It removes the need for host-side permissions"
      ],
      answerIndex: 1,
      explanationMD: `MCP is an integration protocol. It gives hosts and servers a standard way to discover capabilities and exchange JSON-RPC messages, reducing custom integration work across many hosts and services.`
    },
    {
      question: "Which architecture description is correct?",
      options: [
        "The MCP server runs the model and the host only renders tokens",
        "The external database connects directly to the model provider",
        "The host runs MCP clients, and each client connects to an MCP server",
        "Every tool must be embedded directly in the system prompt"
      ],
      answerIndex: 2,
      explanationMD: `The host is the LLM application. It runs MCP clients, and each client maintains a connection to an MCP server that exposes capabilities.`
    },
    {
      question: "Which list names the three core MCP server primitives?",
      options: [
        "Tools, resources, and prompts",
        "Tokens, logits, and embeddings",
        "Queues, caches, and load balancers",
        "Models, GPUs, and samplers"
      ],
      answerIndex: 0,
      explanationMD: `MCP servers expose tools for callable actions, resources for readable context, and prompts for reusable prompt templates.`
    },
    {
      question: "What protocol mechanics are central to MCP?",
      options: [
        "SQL over WebSockets with no initialization",
        "JSON-RPC 2.0 framing, supported transports, and an initialize/capabilities handshake",
        "Only batch CSV uploads to a model provider",
        "A browser cookie format for plugin discovery"
      ],
      answerIndex: 1,
      explanationMD: `MCP uses JSON-RPC 2.0 style messages. Client and server initialize the session and advertise capabilities before normal tool, resource, and prompt operations.`
    },
    {
      question: "How should you contrast MCP with raw function calling?",
      options: [
        "They are identical names for the same model API feature",
        "MCP is only for prompt templates, while function calling is only for databases",
        "MCP standardizes host-to-server integrations; function calling usually describes tool schemas sent in a model request",
        "MCP removes the need to execute any external code"
      ],
      answerIndex: 2,
      explanationMD: `A host may translate MCP tools into provider-specific function calls, but MCP itself is the reusable integration protocol between host clients and servers.`
    },
    {
      question: "Which security practice is most appropriate for MCP?",
      options: [
        "Trust every server automatically if it exposes read-only resources",
        "Show permission prompts for sensitive actions and scope resources by user authorization",
        "Put secrets into resource descriptions so the model can decide access",
        "Disable audit logs because MCP already standardizes calls"
      ],
      answerIndex: 1,
      explanationMD: `MCP does not remove the need for access control. Hosts should verify server trust, scope data, prompt for sensitive or mutating actions, and audit capability usage.`
    }
  ],
  flashcards: [
    { front: "What is MCP?", back: "An open client/server standard, originating from Anthropic, for connecting LLM applications to external tools, resources, and prompts." },
    { front: "What is an MCP host?", back: "The LLM application, such as an IDE or chat client, that runs MCP clients and owns the user experience and policy." },
    { front: "What is an MCP client?", back: "Host-side protocol machinery that maintains a session with one MCP server." },
    { front: "What is an MCP server?", back: "An integration server that exposes tools, resources, and prompts backed by local or remote systems." },
    { front: "What are MCP tools?", back: "Model-callable operations with schemas and results, such as searching tickets or reading a pull request diff." },
    { front: "What are MCP resources?", back: "Readable data or context, such as files, documents, database views, logs, or tickets." },
    { front: "What transports does MCP commonly use?", back: "stdio for local subprocess servers and streamable HTTP/SSE-style transports for remote servers." },
    { front: "Why does MCP matter?", back: "It turns many custom host-service integrations into reusable hosts plus reusable servers, while preserving host-side policy decisions." }
  ],
  cheatSheetMD: `## Model Context Protocol cheat sheet

### Definition
- **MCP** is an open standard for connecting LLM applications to external tools and data through a uniform client/server protocol.
- It originated from Anthropic and is designed so integrations can be written once and reused across hosts.
- MCP is about the application integration boundary, not about changing transformer architecture.

### Roles
- **Host**: the LLM app, such as an IDE, chat client, desktop app, or agent runtime.
- **MCP client**: host-side session that connects to one server.
- **MCP server**: integration process or service that exposes capabilities.
- **Underlying systems**: files, CLIs, databases, SaaS APIs, internal services, and knowledge stores.

### Server primitives
- **Tools**: callable operations the host may let the model invoke.
- **Resources**: readable data or context the host can load.
- **Prompts**: reusable parameterized prompt templates.

### Protocol mechanics
- Messages use JSON-RPC 2.0 style request, response, and notification framing.
- Sessions start with initialize and capability negotiation.
- Local servers commonly use stdio.
- Remote servers use streamable HTTP or SSE-style streaming.
- Capability discovery lets hosts list tools, resources, and prompts at runtime.

### MCP versus function calling
- **Function calling** usually describes provider-specific tool schemas in a model request.
- **MCP** describes how a host connects to reusable external servers.
- A host can expose MCP tools to a model through function calling, but the concepts live at different layers.

### Security checklist
- Trust the server before installing or connecting.
- Scope tools and resources by user, workspace, and admin policy.
- Prompt for sensitive reads and mutating actions.
- Treat resource content as data, not instructions.
- Log server, capability, arguments, approval, result, latency, and errors.
- Do not expose broad local files, secrets, or private systems blindly.

### Interview answer shape
1. Define MCP as an open client/server integration standard.
2. Name host, MCP client, MCP server, and underlying system roles.
3. Explain tools, resources, and prompts.
4. Mention stdio, HTTP/SSE, JSON-RPC 2.0, and initialize/capabilities.
5. Contrast MCP with raw function calling.
6. Close with permissions, trust, least privilege, and auditability.`,
  references: [
    { title: "Model Context Protocol Introduction", kind: "Docs", url: "https://modelcontextprotocol.io/introduction", author: "Model Context Protocol" },
    { title: "Model Context Protocol Specification", kind: "Docs", url: "https://modelcontextprotocol.io/specification", author: "Model Context Protocol" },
    { title: "Introducing the Model Context Protocol", kind: "Blog", url: "https://www.anthropic.com/news/model-context-protocol", author: "Anthropic" },
    { title: "MCP Python SDK", kind: "Docs", url: "https://github.com/modelcontextprotocol/python-sdk", author: "Model Context Protocol" }
  ],
  relatedLessons: [
    { slug: "function-and-tool-calling", note: "Shows how model-level tool schemas relate to MCP server tools." },
    { slug: "prompt-templates-and-chaining", note: "Connects to MCP prompts as reusable workflow templates." },
    { slug: "design-ai-agent", note: "Explains where standardized tools and resources fit inside an agent loop." },
    { slug: "defending-against-prompt-injection", note: "Covers why resource content and tool outputs must be treated as untrusted data." }
  ]
};
