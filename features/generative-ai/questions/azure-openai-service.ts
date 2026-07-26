import type { GenAILessonContent } from "../types";

export const azureOpenaiServiceContent: GenAILessonContent = {
  slug: "azure-openai-service",
  introductionMD: `Azure OpenAI Service is the enterprise Azure-hosted way to call OpenAI models. The model family may look familiar, but the production contract is different: you create an Azure OpenAI resource in a region, deploy a model into that resource under a deployment name, and call that resource endpoint with an **api-version** query parameter.

In interviews, this topic tests whether you can translate generic OpenAI API knowledge into a cloud platform design. A strong answer explains endpoint shape, deployment names, identity, RBAC, networking, quota, content filtering, privacy, and how to keep application code portable instead of hard-coding provider details everywhere.

The practical goal is controlled model access inside an enterprise boundary. Azure OpenAI lets teams combine LLM calls with Microsoft Entra ID, managed identities, Private Link, regional governance, Azure Monitor, and provisioned capacity while preserving the prompt and message patterns engineers already know from OpenAI-style APIs.`,
  realWorldMD: `Azure OpenAI shows up when an organization wants GPT-class models but needs Azure controls around identity, network isolation, compliance, regional operations, and procurement.

- Internal copilots use managed identities and RBAC instead of distributing API keys to services.
- Regulated workloads choose regions, private endpoints, and public network restrictions to reduce data-exposure risk.
- High-volume products use deployments, quotas, and provisioned throughput units to make latency and capacity more predictable.
- Platform teams wrap Azure OpenAI behind an internal gateway so product teams can switch between OpenAI direct and Azure OpenAI without rewriting feature code.`,
  learningObjectives: [
    "Explain why Azure OpenAI uses resource endpoints, deployment names, and api-version instead of only a model field in the request body.",
    "Choose between API keys and Microsoft Entra ID authentication with managed identities and RBAC.",
    "Describe regional data residency, enterprise privacy commitments, private networking, and public access controls.",
    "Interpret content-filter behavior, response annotations, responsible-AI controls, and abuse-monitoring implications.",
    "Compare pay-as-you-go quota with provisioned throughput units and deployment-level capacity planning.",
    "Design a portable client abstraction that can target OpenAI direct or Azure OpenAI with minimal application changes."
  ],
  theory: [
    {
      label: "Azure OpenAI is deployment-centric",
      detailMD: `With OpenAI direct, application code commonly sends a **model** value in the body. With Azure OpenAI, the important routing decision is usually in the URL: the client calls a specific Azure resource endpoint and a specific deployment name. That deployment is an Azure object that maps to a model version and capacity configuration.

This matters operationally. A deployment name such as customer-support-gpt4o can stay stable while the platform team changes the underlying model version through a controlled rollout. It also means quota, PTUs, content policies, and monitoring can be reasoned about at the deployment boundary instead of being hidden inside arbitrary model strings sent by each application.`
    },
    {
      label: "api-version is part of the API contract",
      detailMD: `Azure OpenAI requests include an **api-version** query parameter. The version controls the REST shape, feature availability, response fields, preview behavior, and sometimes compatibility with model capabilities. Treat it like any other external API version, not as incidental boilerplate.

Pinning an api-version makes behavior reproducible. Upgrading it should be reviewed with tests for streaming, tool calling, structured outputs, content-filter fields, and error handling because a newer API version can expose new capabilities or slightly different response metadata.`
    },
    {
      label: "Authentication can be a key or an identity",
      detailMD: `API keys are simple: the client sends a resource key in the request header. They are useful for quick prototypes and some server-side integrations, but they are bearer secrets that must be stored, rotated, and kept away from browsers and mobile apps.

Microsoft Entra ID is the enterprise pattern. A workload identity or managed identity obtains a token for Azure AI services and Azure RBAC decides whether that identity can call the Azure OpenAI resource. This gives you central revocation, least privilege, auditability, and no long-lived secret in application configuration.`
    },
    {
      label: "Network and region are first-class design choices",
      detailMD: `An Azure OpenAI resource lives in an Azure region, and the chosen deployment type affects where requests are processed and what capacity pool is used. For strict residency, engineers must choose the right region and deployment option, then verify the current Azure data-residency documentation for that SKU and geography.

Private networking is also a product decision. Private Link can expose the resource through a private endpoint inside a VNet, private DNS can resolve the service name to that private address, and public network access can be disabled. That combination lets a backend service call the model without traversing the public internet.`
    },
    {
      label: "Content filtering is part of every request path",
      detailMD: `Azure OpenAI includes content filters that evaluate prompts and completions for safety categories such as hate, sexual content, violence, and self-harm, with additional classifiers depending on capability and policy. A request can be allowed, annotated, or blocked depending on severity and configuration.

The response can include fields such as prompt_filter_results and content_filter_results. Production code should log and interpret these annotations because they explain why an answer was truncated, filtered, or refused. Do not treat a filtered response as a generic model failure.`
    },
    {
      label: "Enterprise privacy is not the same as no processing",
      detailMD: `Azure OpenAI enterprise commitments state that prompts, completions, embeddings, and fine-tuning data are not used to train foundation models and are not used to improve Microsoft or third-party products. That is a major difference from consumer-style assumptions and is often why enterprises choose Azure.

At the same time, requests are still processed by the service for inference, content filtering, logging, abuse monitoring, and operational security according to Azure terms and approved configurations. A careful design separates model-training privacy from runtime data handling, retention, monitoring, and access control.`
    }
  ],
  architecture: {
    width: 960,
    height: 560,
    nodes: [
      { id: "client", label: "Backend client", kind: "client", x: 70, y: 260, sublabel: "Managed identity" },
      { id: "entra", label: "Microsoft Entra ID", kind: "external", x: 210, y: 95, sublabel: "Token and RBAC" },
      { id: "private-link", label: "Private Link", kind: "gateway", x: 280, y: 260, sublabel: "Private endpoint in VNet" },
      { id: "azure-endpoint", label: "Azure OpenAI endpoint", kind: "gateway", x: 470, y: 260, sublabel: "Resource plus api-version" },
      { id: "deployment", label: "Deployment", kind: "service", x: 650, y: 260, sublabel: "Name maps to model" },
      { id: "content-filter", label: "Content filters", kind: "service", x: 810, y: 155, sublabel: "Prompt and completion checks" },
      { id: "model", label: "Model runtime", kind: "worker", x: 835, y: 330, sublabel: "Hosted model capacity" },
      { id: "monitoring", label: "Monitoring and abuse review", kind: "monitoring", x: 650, y: 445, sublabel: "Metrics, logs, responsible AI" }
    ],
    edges: [
      { from: "client", to: "entra", label: "Get token" },
      { from: "entra", to: "azure-endpoint", label: "Bearer token authorized by RBAC" },
      { from: "client", to: "private-link", label: "HTTPS inside VNet" },
      { from: "private-link", to: "azure-endpoint", label: "Private endpoint" },
      { from: "azure-endpoint", to: "deployment", label: "Deployment name in path" },
      { from: "deployment", to: "content-filter", label: "Screen prompt" },
      { from: "content-filter", to: "model", label: "Allowed request" },
      { from: "model", to: "content-filter", label: "Screen completion" },
      { from: "content-filter", to: "azure-endpoint", label: "Return annotations" },
      { from: "azure-endpoint", to: "client", label: "Completion response" },
      { from: "azure-endpoint", to: "monitoring", label: "Usage, quota, abuse signals", dashed: true }
    ],
    captionMD: `A typical enterprise path uses a managed identity to obtain a Microsoft Entra token, reaches Azure OpenAI through Private Link, routes to a deployment name on the resource, and receives both model output and content-filter annotations.`
  },
  architectureNotesMD: `The diagram separates control choices from model behavior. Entra ID decides who can call the resource, Private Link decides where traffic flows, the deployment decides which model and capacity are used, and content filters annotate or block unsafe prompts and completions. In many companies an internal LLM gateway sits in front of this same shape to centralize retries, logging, cost controls, and provider portability.`,
  requestFlow: [
    {
      step: "1. Choose resource, region, and deployment type",
      detailMD: `Create or select an Azure OpenAI resource in the region that matches latency, availability, and data-residency needs. Decide whether the deployment will use pay-as-you-go standard capacity, provisioned throughput units, or another available deployment option for the geography.`
    },
    {
      step: "2. Deploy a model under a stable name",
      detailMD: `Deploy a model into the resource and give it an application-facing name such as invoice-assistant-prod. Application code calls this deployment name, not the raw model identifier in the body. The platform team can then version and migrate model choices behind that stable deployment boundary.`
    },
    {
      step: "3. Configure authentication and authorization",
      detailMD: `For prototypes, a resource API key may be enough. For production services, assign a managed identity and grant the least-privileged Azure RBAC role needed to call the Azure OpenAI resource. The service then requests an Entra token instead of loading a static secret.`
    },
    {
      step: "4. Lock down network access",
      detailMD: `If the workload requires private connectivity, create a private endpoint, configure private DNS, allow the calling subnet, and disable public network access on the Azure OpenAI resource. Test from the application environment so failures are caught before launch.`
    },
    {
      step: "5. Build the Azure request URL",
      detailMD: `The client builds a URL from the resource endpoint, the deployment name, the operation, and the **api-version** query parameter. The request body still contains messages, temperature, max tokens, tools, or structured-output settings, but it usually does not contain the provider-neutral model field used by OpenAI direct.`
    },
    {
      step: "6. Send the request and handle Azure errors",
      detailMD: `Call the endpoint with either an API-key header or an Authorization header carrying the Entra token. Handle 401 and 403 as identity or RBAC problems, 404 as endpoint or deployment mismatch, 429 as quota or capacity pressure, and 400-class validation errors as request-shape or api-version issues.`
    },
    {
      step: "7. Inspect content-filter annotations",
      detailMD: `Read prompt_filter_results and content_filter_results when they appear. A completion can be blocked, partially filtered, or annotated with category severities. These fields should feed user messaging, safety dashboards, and incident triage instead of being discarded.`
    },
    {
      step: "8. Log usage and tune capacity",
      detailMD: `Record deployment name, api-version, latency, status code, token usage, filter outcomes, retries, and quota headers when available. Use those signals to decide whether the workload needs a larger quota, more deployments, PTUs, caching, smaller prompts, or fallback models.`
    }
  ],
  deepDives: [
    {
      label: "Deployment names are an abstraction layer",
      detailMD: `A deployment name is not just a cosmetic alias. It is the stable contract your application calls, and it can represent a particular model version, regional capacity choice, content-filter setup, and quota allocation. This makes it a natural unit for blue-green rollouts and workload isolation.

For portability, use logical names in your app such as chat_reasoning_primary and map them to either an OpenAI model or an Azure deployment in configuration. That prevents product code from depending on provider-specific URL shapes.`
    },
    {
      label: "api-version drift can break edge features",
      detailMD: `Basic chat completion calls may look similar across versions, but advanced features such as tool calling, structured outputs, streaming fields, and filter metadata can depend on the chosen api-version. A silent version change can create confusing failures where one environment supports a feature and another does not.

Treat api-version as pinned infrastructure configuration. Include it in logs and regression tests, and roll it forward deliberately the same way you would upgrade a database driver or cloud SDK.`
    },
    {
      label: "API keys are operationally easy but identity is safer",
      detailMD: `API keys minimize setup but create secret-management work: storage, rotation, leak detection, environment separation, and blast-radius control. They also do not express which workload is calling unless you wrap them with additional gateway logic.

Managed identities and Entra ID shift that burden to the cloud identity plane. They work especially well for Azure-hosted compute because the service can obtain tokens without a client secret. The tradeoff is that local development and cross-cloud workloads need a clear credential strategy.`
    },
    {
      label: "PTUs solve a different problem than quota increases",
      detailMD: `Pay-as-you-go deployments consume quota and share regional service capacity. They are flexible and often the right starting point, but they can hit tokens-per-minute, requests-per-minute, or transient capacity limits as traffic grows.

Provisioned throughput units reserve model-serving capacity for a deployment. PTUs can improve predictable throughput and latency for steady production load, but they require capacity planning and cost commitment. They do not remove the need to control prompt size, concurrency, retries, and fallback behavior.`
    },
    {
      label: "Content filters are signals, not just blockers",
      detailMD: `A filtered response should not be collapsed into a generic error message. Filter annotations can tell you which category and severity were involved, whether the prompt or completion triggered the decision, and whether the user experience should ask for safer wording, escalate, or show a policy explanation.

Applications should track filter rates by feature and deployment. Sudden changes can mean a prompt regression, a new abuse pattern, a model behavior change, or a data-quality problem in retrieved context.`
    },
    {
      label: "Privacy commitments still require data minimization",
      detailMD: `The fact that prompts are not used to train foundation models does not mean every prompt is safe to send. Data can still be subject to runtime processing, logging choices, abuse monitoring, customer support access controls, and retention policies.

Good designs minimize sensitive input, redact unnecessary PII, use private networking when appropriate, restrict RBAC, and document which data categories each deployment may process. Enterprise privacy is a platform capability, not a substitute for application data governance.`
    }
  ],
  productionConsiderations: [
    {
      label: "Observability by deployment",
      detailMD: `Log deployment name, api-version, authentication mode, region, latency, token counts, status codes, retry count, and content-filter annotations. Deployment-level observability lets platform teams find noisy tenants, quota hot spots, unsafe prompt patterns, and version-specific regressions.`
    },
    {
      label: "Retries, fallbacks, and quota protection",
      detailMD: `Retry only transient failures with exponential backoff and jitter. Do not blindly retry 400, 401, 403, or blocked content-filter outcomes. For 429 and temporary capacity pressure, use queueing, request shedding, smaller prompts, cached answers, a secondary deployment, or a lower-cost fallback model.`
    },
    {
      label: "Security posture",
      detailMD: `Prefer managed identities for server workloads, store API keys only in a secure secret store when keys are unavoidable, disable public network access when private connectivity is required, and never expose Azure OpenAI credentials to a browser. Pair RBAC with application-level authorization so users cannot call a model just because the backend can.`
    },
    {
      label: "Responsible-AI operations",
      detailMD: `Plan for content-filter events, abuse-monitoring review, user appeals, audit trails, model access approvals, and policy updates. Responsible AI is not only a launch checklist; it is an operating process that explains why a request was allowed, blocked, escalated, or rate limited.`
    }
  ],
  interview: {
    whatInterviewersLookFor: [
      "A clear distinction between OpenAI direct model selection and Azure OpenAI resource endpoint plus deployment-name routing.",
      "Practical Azure controls: api-version pinning, Entra ID, managed identities, RBAC, Private Link, regional choices, and public access restrictions.",
      "Awareness of content filters, annotations, responsible-AI monitoring, quota, PTUs, and enterprise privacy commitments.",
      "A portability strategy that isolates provider-specific endpoint, authentication, deployment, and error-handling differences."
    ],
    followUps: [
      {
        question: "What changes when moving code from OpenAI direct to Azure OpenAI?",
        answerMD: `The biggest change is routing. OpenAI direct commonly sends a model in the body to a shared API endpoint. Azure OpenAI sends the request to a resource-specific endpoint and a deployment name, with **api-version** in the query string. Authentication may also move from an OpenAI API key to an Azure API key or an Entra token from a managed identity.`
      },
      {
        question: "When would you prefer Microsoft Entra ID over API keys?",
        answerMD: `Use Entra ID for production server workloads, especially on Azure compute. Managed identities avoid long-lived secrets, RBAC provides least privilege, and identity logs make access easier to audit and revoke. API keys are simpler for prototypes but increase secret-management and rotation risk.`
      },
      {
        question: "How do Private Link and disabled public access change the design?",
        answerMD: `They make the model endpoint reachable through a private endpoint in a VNet instead of the public internet. The application environment needs network line of sight, private DNS, and appropriate subnet routing. This improves isolation but adds operational dependencies that must be tested in each environment.`
      },
      {
        question: "How should an application use content-filter annotations?",
        answerMD: `It should inspect the annotations to understand whether the prompt or completion triggered a category, what severity was detected, and whether the response was blocked or modified. Those signals should drive user messaging, logs, safety dashboards, and incident response rather than being treated as a generic error.`
      },
      {
        question: "How do you keep code portable between OpenAI and Azure OpenAI?",
        answerMD: `Create a provider adapter that accepts a logical model name and common request options, then maps them to an OpenAI model or an Azure deployment, endpoint, api-version, and auth mechanism. Keep prompts, message construction, retries, evaluation, and output validation mostly provider-neutral.`
      }
    ],
    alternativeDesigns: [
      {
        name: "Direct Azure OpenAI calls from each service",
        detailMD: `Each backend service owns its endpoint, deployment, credentials, retries, and logging. This is simple for a small team, but it can create inconsistent auth, cost controls, content-filter handling, and provider portability across products.`
      },
      {
        name: "Internal LLM gateway in front of Azure OpenAI",
        detailMD: `Services call an internal gateway that centralizes identity, routing, quota, retries, logging, redaction, content-filter policy, and model fallback. This adds one hop and a platform dependency, but it is usually the cleaner design for many teams or regulated workloads.`
      },
      {
        name: "Hybrid provider adapter",
        detailMD: `Application code uses one interface while configuration chooses OpenAI direct, Azure OpenAI, or another provider per environment. This improves portability and resilience, but the adapter must expose provider-specific features carefully so the common abstraction does not hide important capability differences.`
      }
    ],
    commonMistakes: [
      "Passing a model field the same way as OpenAI direct and forgetting that Azure routing depends on the deployment name in the URL.",
      "Hard-coding api-version, endpoint, and deployment in product code instead of configuration or a provider adapter.",
      "Using API keys everywhere even when managed identities and RBAC are available for server workloads.",
      "Ignoring content-filter annotations, quota headers, 429 behavior, and regional deployment constraints until production traffic arrives."
    ]
  },
  interviewHints: [
    "Start with the endpoint contract: Azure resource endpoint, deployment name, and api-version.",
    "Then discuss enterprise controls: Entra ID, RBAC, Private Link, region, privacy, and public access.",
    "Separate safety mechanisms from model quality: content filters and abuse monitoring are operational controls.",
    "End with capacity and portability: PTUs, per-deployment quota, and an adapter that maps logical model names to provider-specific routes."
  ],
  playground: {
    descriptionMD: `This static example shows the request choices that are different in Azure OpenAI: endpoint, deployment, api-version, and authentication. The payload still looks like a chat request, but routing and identity are Azure-specific.`,
    systemPrompt: `You are an internal policy assistant.
Use only the provided policy excerpt.
If the excerpt does not answer the question, say I do not know from the provided policy.
Return a concise answer and one cited policy sentence.`,
    userPrompt: `Policy excerpt:
Employees may submit travel expenses within 45 days of trip completion. Manager approval is required for lodging exceptions.

Question:
Can an employee submit a hotel exception without manager approval?`,
    parameters: [
      { name: "endpoint", value: "https://contoso-aoai.openai.azure.com", note: "Resource-specific Azure OpenAI endpoint." },
      { name: "deployment", value: "policy-chat-prod", note: "Stable deployment name used in the request path." },
      { name: "api-version", value: "2024-10-21", note: "Pinned API contract for this client." },
      { name: "auth", value: "Microsoft Entra ID", note: "Managed identity obtains a bearer token for Azure AI services." }
    ],
    sampleOutputMD: `A correct answer should say that manager approval is required for lodging exceptions and cite the sentence from the policy excerpt. If the excerpt did not include that rule, the assistant should answer I do not know from the provided policy instead of inventing a travel policy.`
  },
  comparisons: [
    {
      title: "OpenAI direct vs Azure OpenAI",
      columns: ["Concern", "OpenAI direct", "Azure OpenAI Service", "Design implication"],
      rows: [
        ["Routing", "Shared API endpoint plus model in body", "Per-resource endpoint plus deployment name in path", "Hide routing behind a provider adapter"],
        ["Versioning", "Provider API and model versions", "api-version query plus deployment model version", "Pin and test api-version upgrades"],
        ["Authentication", "OpenAI API key or supported platform auth", "Azure API key or Entra ID with RBAC", "Prefer managed identity for Azure workloads"],
        ["Networking", "Public provider endpoint", "Private Link, VNet integration, and public access controls", "Plan DNS and connectivity as part of rollout"],
        ["Governance", "Provider account and project controls", "Azure resource, region, RBAC, policy, logs, and quota", "Align model usage with cloud governance"]
      ]
    },
    {
      title: "Authentication choices",
      columns: ["Method", "Best use", "Strength", "Risk"],
      rows: [
        ["API key", "Prototype or simple server integration", "Fast to configure and widely supported", "Bearer secret must be stored and rotated"],
        ["Managed identity", "Azure-hosted production workload", "No long-lived secret and RBAC-based access", "Requires Azure compute and identity setup"],
        ["Service principal", "Automation or non-Azure workload", "Central identity and revocation", "Client secret or certificate still needs management"],
        ["Internal gateway token", "Many product teams behind one platform", "Central policy, quotas, and audit", "Gateway becomes a critical dependency"]
      ]
    },
    {
      title: "Capacity and safety controls",
      columns: ["Control", "What it manages", "Typical signal", "Operational response"],
      rows: [
        ["Pay-as-you-go quota", "Tokens and requests for deployments", "429 or quota exhaustion", "Request quota increase, reduce tokens, or add fallback"],
        ["Provisioned throughput units", "Reserved serving capacity", "Sustained latency or capacity pressure", "Buy or resize PTUs based on measured load"],
        ["Content filters", "Safety categories in prompts and completions", "Filter annotations or blocked response", "Adjust UX, prompts, policy, or escalation"],
        ["Abuse monitoring", "Misuse and responsible-AI risk", "Review signals or policy events", "Investigate, audit, and tighten access controls"]
      ]
    }
  ],
  decisionGuideMD: `## Choosing an Azure OpenAI design

Use **Azure OpenAI direct from a backend** when one service owns the workload, the team can manage deployment configuration, and the security posture is straightforward. Keep endpoint, deployment, api-version, and auth settings outside business logic.

Use **managed identity and RBAC** for production Azure-hosted services. Choose API keys only when identity integration is unavailable or the integration is intentionally short-lived. Never put either credential type in frontend code.

Use **Private Link and disabled public access** when the workload handles sensitive data, sits inside a regulated network boundary, or must avoid public ingress paths. Budget time for private DNS, subnet access, firewall rules, and environment-specific connectivity tests.

Use **pay-as-you-go deployments** for early traffic, bursty workloads, and experiments. Move to **PTUs** when you have steady load, latency targets, and enough volume to justify reserved capacity. Keep fallbacks because PTUs solve capacity predictability, not every request failure.

Use an **internal gateway or provider adapter** when several teams call LLMs. Centralize logging, policy, quotas, retries, provider mapping, and content-filter handling, while keeping prompts and evaluations portable across OpenAI direct and Azure OpenAI.`,
  handsOn: [
    {
      title: "Call Azure OpenAI with endpoint, deployment, api-version, and Entra auth",
      detailMD: `This Python example uses DefaultAzureCredential so the same code can use a managed identity in Azure or a developer login locally. Notice that the URL contains the Azure endpoint, deployment name, and api-version, while the request body contains messages and generation settings rather than a model field.`,
      code: {
        language: "python",
        label: "azure_openai_entra_chat.py",
        body: `import requests
from azure.identity import DefaultAzureCredential

endpoint = "https://contoso-aoai.openai.azure.com"
deployment = "policy-chat-prod"
api_version = "2024-10-21"

url = endpoint + "/openai/deployments/" + deployment + "/chat/completions?api-version=" + api_version

credential = DefaultAzureCredential()
token = credential.get_token("https://cognitiveservices.azure.com/.default").token

headers = {
    "Authorization": "Bearer " + token,
    "Content-Type": "application/json"
}

payload = {
    "messages": [
        {
            "role": "system",
            "content": "Answer using only the provided policy excerpt."
        },
        {
            "role": "user",
            "content": "Policy: Lodging exceptions require manager approval. Question: Can I skip approval?"
        }
    ],
    "temperature": 0.2,
    "max_tokens": 200
}

response = requests.post(url, headers=headers, json=payload, timeout=30)

if response.status_code == 429:
    raise RuntimeError("Azure OpenAI quota or capacity limit for deployment " + deployment)

response.raise_for_status()
result = response.json()

print(result["choices"][0]["message"]["content"])

choice = result["choices"][0]
if "content_filter_results" in choice:
    print(choice["content_filter_results"])`
      }
    },
    {
      title: "Keep OpenAI and Azure OpenAI routing portable",
      detailMD: `A small adapter can map one logical model name to provider-specific configuration. Product code asks for policy_chat, while configuration decides whether that means an OpenAI model or an Azure deployment.`,
      code: {
        language: "python",
        label: "provider_routing.py",
        body: `def resolve_chat_route(provider, logical_model):
    routes = {
        "openai": {
            "policy_chat": {
                "base_url": "https://api.openai.com/v1",
                "model": "gpt-4o-mini"
            }
        },
        "azure": {
            "policy_chat": {
                "endpoint": "https://contoso-aoai.openai.azure.com",
                "deployment": "policy-chat-prod",
                "api_version": "2024-10-21"
            }
        }
    }
    return routes[provider][logical_model]

def describe_route(provider, logical_model):
    route = resolve_chat_route(provider, logical_model)
    if provider == "azure":
        return route["endpoint"] + "/openai/deployments/" + route["deployment"] + "/chat/completions?api-version=" + route["api_version"]
    return route["base_url"] + "/chat/completions using model " + route["model"]

print(describe_route("azure", "policy_chat"))
print(describe_route("openai", "policy_chat"))`
      }
    }
  ],
  quiz: [
    {
      question: "What is the most important routing difference between OpenAI direct and Azure OpenAI?",
      options: [
        "Azure OpenAI always sends the model only in the request body",
        "Azure OpenAI calls a resource endpoint and deployment name, with api-version in the query string",
        "Azure OpenAI does not support chat-style messages",
        "Azure OpenAI requires every request to come from a browser"
      ],
      answerIndex: 1,
      explanationMD: `Azure OpenAI is deployment-centric. The request goes to a resource-specific endpoint and deployment name, and api-version selects the API contract.`
    },
    {
      question: "Why is Microsoft Entra ID usually preferred over API keys for production Azure-hosted services?",
      options: [
        "It removes the need for authorization",
        "It lets managed identities call the resource through RBAC without storing a long-lived secret",
        "It disables content filtering",
        "It makes api-version unnecessary"
      ],
      answerIndex: 1,
      explanationMD: `Managed identities and Entra ID avoid static secrets and let Azure RBAC control which workload can call the Azure OpenAI resource.`
    },
    {
      question: "What should production code do with content-filter annotations?",
      options: [
        "Ignore them because they are only useful to Microsoft",
        "Treat every annotation as a successful answer",
        "Read them to understand blocked or annotated prompt and completion safety decisions",
        "Use them as a replacement for application authorization"
      ],
      answerIndex: 2,
      explanationMD: `Filter annotations explain safety-category outcomes and should inform logs, user messaging, dashboards, and incident response.`
    },
    {
      question: "When are provisioned throughput units most appropriate?",
      options: [
        "For steady production load that needs more predictable throughput and latency",
        "For removing all need to handle 429 responses",
        "For avoiding any model deployment",
        "For frontend-only calls without a backend"
      ],
      answerIndex: 0,
      explanationMD: `PTUs reserve serving capacity for a deployment. They help predictable workloads but do not eliminate retries, quota planning, or fallback design.`
    },
    {
      question: "Which design best supports private networking for Azure OpenAI?",
      options: [
        "Expose the API key in the browser and rely on HTTPS",
        "Use Private Link with private DNS and disable public network access when required",
        "Put the deployment name in the user prompt",
        "Remove RBAC because the VNet is private"
      ],
      answerIndex: 1,
      explanationMD: `Private Link plus private DNS lets Azure OpenAI be reached through a private endpoint, and disabling public access reduces exposure. RBAC is still required.`
    },
    {
      question: "What is the best way to keep code portable between OpenAI direct and Azure OpenAI?",
      options: [
        "Hard-code Azure endpoint strings throughout the product",
        "Use one provider adapter that maps logical model names to OpenAI models or Azure deployments",
        "Avoid logging api-version and deployment names",
        "Assume every provider supports identical response metadata"
      ],
      answerIndex: 1,
      explanationMD: `A provider adapter isolates endpoint, deployment, api-version, auth, and response differences while preserving common prompt, evaluation, and validation logic.`
    }
  ],
  flashcards: [
    { front: "What does an Azure OpenAI deployment name represent?", back: "An Azure resource object that maps an application-facing name to a model version and capacity configuration." },
    { front: "Where does Azure OpenAI put api-version?", back: "In the request query string, where it selects the REST API contract and feature shape." },
    { front: "What is the main benefit of managed identity?", back: "The workload obtains Entra tokens without storing a long-lived secret, and Azure RBAC controls access." },
    { front: "What does Private Link provide?", back: "Private endpoint connectivity from a VNet to the Azure OpenAI resource, often paired with private DNS and disabled public access." },
    { front: "Are Azure OpenAI prompts used to train foundation models?", back: "Enterprise commitments state that prompts, completions, embeddings, and fine-tuning data are not used to train foundation models." },
    { front: "What do content-filter annotations explain?", back: "Which prompt or completion safety categories were detected, their severity, and whether content was allowed, filtered, or blocked." },
    { front: "How are PTUs different from pay-as-you-go quota?", back: "PTUs reserve throughput for predictable capacity, while pay-as-you-go uses allocated quota and shared regional capacity." },
    { front: "How do you keep provider code portable?", back: "Map logical model names to provider-specific models, deployments, endpoints, api-version values, and auth in a small adapter." }
  ],
  cheatSheetMD: `## Azure OpenAI Service cheat sheet

### Request shape
- **OpenAI direct**: shared endpoint, model commonly appears in the request body.
- **Azure OpenAI**: resource endpoint, deployment name in the path, **api-version** in the query string.
- Keep deployment names stable and map them to model versions through Azure deployment configuration.
- Pin api-version and test upgrades with streaming, tools, structured outputs, and filter metadata.

### Authentication
- **API key**: fast setup, but it is a bearer secret that must be protected and rotated.
- **Microsoft Entra ID**: preferred for production server workloads.
- **Managed identity**: best fit for Azure compute because no client secret is stored.
- **RBAC**: grant only the role needed to call or manage the Azure OpenAI resource.

### Networking and privacy
- Choose the Azure region and deployment type deliberately for latency, availability, and residency requirements.
- Prompts and completions are not used to train foundation models under Azure OpenAI enterprise commitments.
- Private Link provides private endpoint connectivity inside a VNet.
- Disable public network access when the workload requires private-only access.
- Still minimize sensitive data and document retention, logging, and abuse-monitoring behavior.

### Safety and responsible AI
- Content filters check prompts and completions.
- Inspect prompt_filter_results and content_filter_results when present.
- Treat filtered outcomes differently from generic model errors.
- Plan for abuse monitoring, policy review, audit trails, and user-facing explanations.

### Capacity
- Pay-as-you-go is flexible but constrained by quota, regional availability, and shared capacity.
- Quota is often reasoned about by region, model family, and deployment limits.
- PTUs reserve throughput for predictable workloads and cost commitments.
- Monitor latency, tokens, 429s, retries, and deployment-level traffic before buying capacity.

### Interview answer shape
1. State the routing difference: endpoint plus deployment plus api-version.
2. Explain identity: API keys for simplicity, Entra ID and managed identity for production.
3. Add enterprise controls: region, privacy, Private Link, disabled public access, RBAC.
4. Cover safety: content filters, annotations, responsible AI, and abuse monitoring.
5. Cover capacity: per-deployment quota, 429s, pay-as-you-go, and PTUs.
6. Finish with portability: provider adapter maps logical model names to OpenAI models or Azure deployments.`,
  references: [
    { title: "Azure OpenAI Service documentation", kind: "Docs", url: "https://learn.microsoft.com/azure/ai-services/openai/", author: "Microsoft" },
    { title: "Azure OpenAI data privacy and security", kind: "Docs", url: "https://learn.microsoft.com/legal/cognitive-services/openai/data-privacy", author: "Microsoft" },
    { title: "Azure OpenAI content filtering", kind: "Docs", url: "https://learn.microsoft.com/azure/ai-services/openai/concepts/content-filter", author: "Microsoft" },
    { title: "Azure OpenAI quota and limits", kind: "Docs", url: "https://learn.microsoft.com/azure/ai-services/openai/quotas-limits", author: "Microsoft" }
  ],
  relatedLessons: [
    { slug: "calling-the-openai-api", note: "Shows the provider-direct API shape that Azure OpenAI differs from." },
    { slug: "choosing-the-right-model", note: "Helps decide which model family should sit behind an Azure deployment." },
    { slug: "model-access-control-and-rate-limiting", note: "Connects Azure RBAC, quota, and deployment-level access to broader model governance." },
    { slug: "design-llm-gateway", note: "Explains when to centralize Azure OpenAI routing, logging, retries, and provider portability behind a gateway." }
  ]
};
