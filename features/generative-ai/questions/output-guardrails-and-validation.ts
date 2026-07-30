import type { GenAILessonContent } from "../types";

export const outputGuardrailsAndValidationContent: GenAILessonContent = {
  slug: "output-guardrails-and-validation",
  introductionMD: `Output guardrails are the part of an LLM system that decides whether a model response is safe, valid, policy-compliant, and trustworthy enough to use. They matter because a language model is probabilistic software. Even with a careful prompt, it can return malformed JSON, unsupported facts, unsafe content, off-policy advice, private data, or instructions copied from an attacker.

In interviews, this topic tests whether you treat the model as one component inside a larger system instead of as an oracle. A strong engineer validates the response before parsing it into business logic, showing it to a user, writing it to a database, or passing it to a tool. The answer should separate structural validation, safety classification, business-rule checks, grounding checks, retries, fallbacks, and observability.

The practical goal is not to make the model perfect. The goal is to build a bounded control loop: validate, repair when the failure is recoverable, retry a small number of times, and then fall back to a safe canned response or human handoff. Good guardrails make failures visible, auditable, and recoverable instead of silently trusting whatever text the model produced.`,
  realWorldMD: `Output guardrails show up anywhere LLM output affects users, decisions, tools, or data.

- Customer-support copilots validate tone, safety, citations, refund claims, and escalation rules before sending a reply.
- Data extraction pipelines validate JSON shape, allowed labels, date ranges, and entity references before saving records.
- RAG applications check that answers cite retrieved context and do not invent unsupported claims.
- Agentic systems validate tool arguments, action permissions, and prompt-injection signals before executing side effects.
- Regulated workflows log block reasons and route uncertain cases to human review instead of silently failing open.`,
  learningObjectives: [
    "Explain why model output must be treated as untrusted until it passes validation.",
    "Design layered guardrails for schema, safety, business rules, and grounded RAG answers.",
    "Distinguish input guardrails from output guardrails and explain where prompt-injection defense fits.",
    "Implement a bounded validate-then-repair loop with safe fallback behavior.",
    "Choose deterministic validators, classifiers, LLM-as-judge checks, or human review based on risk and cost.",
    "Log validation outcomes and block reasons so quality, safety, and policy failures can be debugged."
  ],
  theory: [
    {
      label: "Model output is untrusted data",
      detailMD: `An LLM response is not a typed return value. It is sampled text shaped by the prompt, model weights, context, tools, and decoding settings. The response can be syntactically malformed, semantically wrong, unsafe, off-policy, or influenced by untrusted text that was included in the prompt.

This is why production systems validate before trust. If downstream code expects JSON, validate the JSON before parsing it into a database write. If the answer affects a user decision, validate claims and policy. If the response contains tool arguments, validate authorization and allowed values before execution. Guardrails convert a probabilistic component into a controlled workflow with explicit pass, repair, block, or handoff states.`
    },
    {
      label: "Input guardrails and output guardrails solve different problems",
      detailMD: `Input guardrails inspect the user request and any retrieved or uploaded content before the model call. They detect abuse, toxicity, self-harm risk, PII exposure, prompt-injection attempts, policy violations, and requests the product should not answer. They can block, redact, rewrite, or route the request before expensive inference.

Output guardrails inspect the model response after generation. They catch malformed structure, unsafe completions, unsupported claims, forbidden business promises, leaking private data, or action arguments that should not be executed. Mature systems use both because an allowed input can still produce a bad output, and a bad input can sometimes be made safe through refusal, redaction, or constrained routing.`
    },
    {
      label: "Schema validation guarantees shape, not truth",
      detailMD: `Schema validation is the first layer when software must consume the response. JSON Schema, Pydantic, and Zod can enforce required fields, types, enums, length limits, nullable values, arrays, nested objects, and versioned contracts. This prevents fragile parsing and stops malformed text from reaching business logic.

Schema validation is necessary but not sufficient. A response can be valid JSON and still contain a false claim, a forbidden recommendation, or an unsafe instruction. Treat schemas as the gate that says the output has the expected shape, then add content-safety, business-rule, and grounding checks for the meaning of the data.`
    },
    {
      label: "Safety classifiers should run on input and output",
      detailMD: `Moderation and safety classifiers categorize text against policy areas such as harassment, hate, sexual content, violence, self-harm, dangerous instructions, PII, and other product-specific categories. Running them on input protects the model and the system from disallowed requests. Running them on output prevents the model from returning unsafe or policy-violating content even when the request looked acceptable.

Classifiers can be deterministic rules, provider moderation endpoints, custom ML models, or LLM-based judges. They should return a category, severity, confidence, and decision. The application should define what happens for each decision: allow, redact, refuse, escalate, or ask for clarification.`
    },
    {
      label: "Business rules encode product truth",
      detailMD: `Business-rule validators apply constraints that the model should not be trusted to remember. They check allowed values, numeric ranges, date windows, customer eligibility, account references, inventory ids, geographic availability, authorization, and forbidden claims such as guaranteed refunds, medical diagnosis, legal advice, or unapproved pricing promises.

These validators are usually deterministic because product policy should be explicit. They are also the right place for referential checks against databases or services. A model may output customer_id as text, but the application must verify that the customer exists, belongs to the authenticated user, and is eligible for the requested action.`
    },
    {
      label: "Grounding checks protect RAG answers and injection boundaries",
      detailMD: `In RAG, the answer should be faithful to the retrieved context. A grounding validator checks whether required claims cite provided passages, whether every citation id exists, and whether the answer says I do not know when the context is insufficient. Stronger systems compare claims against source spans or use a judge model to score faithfulness.

Prompt-injection defense is part of the same guardrail design. Retrieved documents, web pages, emails, and user uploads are untrusted data even when they are placed in the context window. Input filters, role separation, tool permissions, retrieval sanitization, output validation, and action allowlists work together to prevent injected instructions from becoming model behavior.`
    }
  ],
  architecture: {
    width: 960,
    height: 560,
    nodes: [
      { id: "user", label: "User", kind: "client", x: 40, y: 250, sublabel: "Request" },
      { id: "inputGuardrail", label: "Input guardrail", kind: "service", x: 190, y: 250, sublabel: "Policy, PII, injection" },
      { id: "llm", label: "LLM provider", kind: "external", x: 370, y: 250, sublabel: "External model call" },
      { id: "outputValidator", label: "Output validator", kind: "service", x: 550, y: 250, sublabel: "Schema, safety, rules" },
      { id: "repairLoop", label: "Repair loop", kind: "worker", x: 550, y: 405, sublabel: "Bounded retries" },
      { id: "response", label: "Response", kind: "client", x: 790, y: 220, sublabel: "Shown to user" },
      { id: "fallback", label: "Fallback or handoff", kind: "service", x: 790, y: 405, sublabel: "Safe response" },
      { id: "auditLog", label: "Validation log", kind: "monitoring", x: 550, y: 85, sublabel: "Outcomes and reasons" }
    ],
    edges: [
      { from: "user", to: "inputGuardrail", label: "request" },
      { from: "inputGuardrail", to: "llm", label: "allowed input" },
      { from: "inputGuardrail", to: "fallback", label: "blocked input", dashed: true },
      { from: "llm", to: "outputValidator", label: "raw output" },
      { from: "outputValidator", to: "response", label: "valid output" },
      { from: "outputValidator", to: "repairLoop", label: "repairable fail", dashed: true },
      { from: "repairLoop", to: "llm", label: "repair prompt", dashed: true },
      { from: "outputValidator", to: "fallback", label: "unsafe or exhausted", dashed: true },
      { from: "fallback", to: "response", label: "safe message" },
      { from: "inputGuardrail", to: "auditLog", label: "input decision", dashed: true },
      { from: "outputValidator", to: "auditLog", label: "output decision", dashed: true },
      { from: "fallback", to: "auditLog", label: "fallback reason", dashed: true }
    ],
    captionMD: "A guarded LLM flow validates both sides of the model call. Input guardrails decide whether the request is safe to send, output validators decide whether the response is safe to use, and the repair loop has a strict retry budget before falling back."
  },
  architectureNotesMD: `The important design choice is that the model is not the policy engine. The input guardrail, output validator, repair loop, fallback path, and audit log are application services with deterministic behavior wherever possible.

The repair loop should only handle recoverable failures such as malformed JSON, missing fields, or unsupported formatting. Unsafe content, blocked categories, unauthorized actions, and exhausted retries should move to fallback or human review instead of repeatedly asking the model to try again.`,
  requestFlow: [
    {
      step: "1. Receive and classify the request",
      detailMD: "Start with the user request, authenticated user context, product surface, and any retrieved content. Attach metadata such as tenant, feature, prompt version, model version, risk tier, and whether the flow can execute side effects. This metadata determines which guardrail policy applies."
    },
    {
      step: "2. Run input guardrails before inference",
      detailMD: "Check the request for disallowed categories, prompt-injection patterns, PII exposure, self-harm risk, toxic content, and product-specific policy violations. The decision can be allow, redact, refuse, route to a safer prompt, ask for clarification, or hand off to a human."
    },
    {
      step: "3. Build the prompt with explicit boundaries",
      detailMD: "Put durable policy in the system role, trusted evidence in labeled context, and untrusted user or retrieved text in data sections. Make source-of-truth and refusal behavior explicit. Prompt design helps the model behave, but the following validators still enforce the contract."
    },
    {
      step: "4. Call the LLM and treat the response as raw text",
      detailMD: "The model returns raw output, not trusted application state. Even when using structured outputs or JSON mode, the application should handle refusal text, partial responses, invalid fields, provider errors, timeouts, and model-version changes."
    },
    {
      step: "5. Validate structure first",
      detailMD: "Parse the response and validate it against the expected schema. Required fields, types, enums, maximum lengths, nested objects, and version fields should be enforced before any business logic reads the data. If the shape is wrong but the content is otherwise safe, it may be repairable."
    },
    {
      step: "6. Run safety and business validators",
      detailMD: "Moderate the output for toxicity, self-harm, PII, and policy categories. Then apply business rules: allowed values, ranges, referential checks, account permissions, no forbidden claims, and no unauthorized tool arguments. These checks decide whether the output can be shown or acted on."
    },
    {
      step: "7. Check grounding when the answer uses context",
      detailMD: "For RAG answers, verify that citations refer to provided context and that key claims are supported by the cited passages. If context is insufficient, the answer should say I do not know or ask for more information instead of filling gaps from model memory."
    },
    {
      step: "8. Repair, fall back, and log",
      detailMD: "If validation fails for a recoverable reason, send a repair prompt that includes the failure reason and the required contract. Bound retries to a small number. If the output is unsafe, still invalid, or policy-blocked, return a safe canned response or human handoff. Log the validator results and block reasons."
    }
  ],
  deepDives: [
    {
      label: "Schema enforcement is the cheapest reliability win",
      detailMD: `Schema validation gives the application a crisp contract: either the object can be parsed and has the required fields, or it cannot proceed. This is especially important for extraction, routing, tool calls, and agent plans. JSON Schema is portable across languages, while Pydantic and Zod make typed validation convenient in Python and TypeScript services.

The tradeoff is that schema validity can create false confidence. A perfectly shaped object can still be wrong. For high-risk flows, schema validation should be followed by semantic checks such as allowed claims, source citations, and policy categories.`
    },
    {
      label: "Moderation is a policy decision, not just a score",
      detailMD: `A safety classifier usually returns categories and confidence, but the product must decide what to do with them. A mild toxicity signal in a user quote may be allowed in a summarization workflow, while the same signal in a generated assistant reply may need rewriting or refusal. Self-harm content may require a supportive crisis-safe response instead of a generic block.

Run moderation on both sides because input and output have different risk profiles. Input moderation protects the model call and controls abuse. Output moderation protects the user and prevents the application from amplifying unsafe content.`
    },
    {
      label: "Business rules catch errors that prompts cannot own",
      detailMD: `The model should not be the source of truth for product rules. If the refund window is 30 days, the validator should check the order date. If an action requires an active subscription, the validator should call the entitlement service. If a response must not promise a cure, refund, lawsuit outcome, or investment return, the validator should block those claims.

This layer is often where real incidents are prevented. The model may sound confident and empathetic, but the system must enforce allowed actions, ranges, references, and commitments.`
    },
    {
      label: "Grounding checks vary by strictness",
      detailMD: `The simplest RAG grounding check requires at least one citation and verifies that every citation id appears in the retrieved context. A stronger check maps each claim to a source span. A still stronger check uses an LLM-as-judge or entailment model to decide whether the cited text actually supports the claim.

Choose strictness based on risk. Internal search can tolerate lighter checks with visible citations. Medical, legal, financial, or customer-facing policy answers need stronger faithfulness validation, clearer uncertainty behavior, and human review for low-confidence cases.`
    },
    {
      label: "Deterministic validators and LLM-as-judge validators trade flexibility for certainty",
      detailMD: `Deterministic validators are fast, cheap, auditable, and reliable for explicit constraints such as JSON shape, enum values, length limits, known ids, and numeric ranges. They are weak for fuzzy judgments such as whether a paragraph is faithful to a source or whether an answer is helpful enough.

LLM-as-judge validators handle semantic judgments and can explain failures, but they add cost, latency, model variance, and another prompt surface that needs evaluation. Use deterministic checks first, then reserve judge models for cases where rules cannot capture the quality dimension.`
    },
    {
      label: "Prompt injection defense is a layered guardrail problem",
      detailMD: `Prompt injection can enter through user text, retrieved documents, emails, web pages, or tool outputs. The model may be asked to ignore system rules, reveal hidden prompts, call tools, exfiltrate data, or change the output format. Prompt wording helps, but it is not enough.

Defensive systems combine input filtering, role hierarchy, context labeling, retrieval sanitization, tool allowlists, authorization checks, output validation, and audit logging. The key principle is to treat every external text source as data, not as instructions with authority.`
    }
  ],
  productionConsiderations: [
    {
      label: "Observability and auditability",
      detailMD: "Log validation outcomes, block reasons, validator versions, prompt version, model version, retry count, fallback type, latency, and policy category. Store enough metadata to reproduce a failure without retaining unnecessary sensitive text. Dashboards should show schema failures, moderation blocks, repair success rate, and false-positive reports."
    },
    {
      label: "Bounded retries and safe fallbacks",
      detailMD: "Repair prompts are useful for malformed structure or missing fields, but retries must be bounded. Repeatedly asking the model to fix unsafe content can waste tokens and still fail. After the retry budget, return a safe canned response, ask for clarification, or route to human review. Fallback behavior should be product-specific and tested."
    },
    {
      label: "Latency, cost, and ordering",
      detailMD: "Every validator adds latency and sometimes model or classifier cost. Put cheap deterministic checks early, batch moderation calls where possible, cache static policy lookups, and only call expensive LLM-as-judge checks for cases that need semantic review. Define service-level objectives for both allowed and blocked paths."
    },
    {
      label: "Policy versioning and evaluation",
      detailMD: "Guardrail rules are product logic and should be versioned, reviewed, tested, and rolled out gradually. Maintain evaluation sets with normal, edge-case, adversarial, and false-positive examples. A guardrail update that blocks too much can damage user experience, while one that blocks too little creates safety and compliance risk."
    }
  ],
  interview: {
    whatInterviewersLookFor: [
      "Clear recognition that LLM output is probabilistic and must be validated before trust.",
      "A layered design: schema validation, moderation, business rules, grounding checks, repair loop, fallback, and logging.",
      "Ability to separate input guardrails, output guardrails, and prompt-injection defense.",
      "Practical tradeoff reasoning around deterministic validators, LLM-as-judge checks, latency, cost, and reliability."
    ],
    followUps: [
      {
        question: "Why is JSON mode or a structured output feature not enough by itself?",
        answerMD: "It improves the chance that the response has a parseable structure, but it does not prove the content is true, safe, authorized, or policy-compliant. The application still needs schema checks, business rules, moderation, and grounding validation before using the output."
      },
      {
        question: "What should happen when validation fails?",
        answerMD: "First classify the failure. Recoverable structure problems can go through a bounded repair prompt. Unsafe content, unauthorized actions, or repeated failures should skip repair and move to a safe canned response, clarification, or human handoff. The reason should be logged."
      },
      {
        question: "When would you use an LLM-as-judge validator?",
        answerMD: "Use it when the validation question is semantic and hard to encode as rules, such as whether a RAG answer is faithful to cited passages or whether a response follows nuanced policy. Avoid it for simple checks that deterministic code can do faster, cheaper, and more reliably."
      },
      {
        question: "How do guardrails help with prompt injection?",
        answerMD: "They reduce the chance that untrusted text becomes executable instruction. Input filters detect malicious patterns, prompts label untrusted context as data, tool policies enforce authorization, output validators catch suspicious actions or format changes, and logs make attacks visible."
      }
    ],
    alternativeDesigns: [
      {
        name: "Prompt-only validation",
        detailMD: "The prompt asks the model to return safe, valid, policy-compliant output, and the application trusts it. This is simple and low latency, but it fails open when the model makes a mistake, follows injected instructions, or invents a forbidden claim. It is only reasonable for low-risk prototypes."
      },
      {
        name: "Deterministic guardrail pipeline",
        detailMD: "The application uses schemas, rules, classifiers, databases, and policy tables to decide pass, repair, block, or handoff. This is auditable and reliable for explicit constraints, but it may miss nuanced quality or faithfulness issues that require semantic judgment."
      },
      {
        name: "Hybrid guardrails with judge models",
        detailMD: "Cheap deterministic checks run first, then selected outputs go to an LLM-as-judge or specialist classifier for semantic evaluation. This design is stronger for RAG faithfulness and nuanced safety policy, but it costs more and requires evaluation of the judge itself."
      }
    ],
    commonMistakes: [
      "Assuming a prompt instruction or JSON mode guarantees valid, safe output.",
      "Only moderating user input and forgetting that the model can generate unsafe output.",
      "Retrying indefinitely instead of using bounded repair and a clear fallback path.",
      "Logging raw sensitive content unnecessarily instead of recording structured outcomes and reasons."
    ]
  },
  interviewHints: [
    "Start by saying the model response is untrusted until validated.",
    "Name the layers: schema, safety, business rules, grounding, repair, fallback, logging.",
    "Separate deterministic checks from LLM-as-judge checks and explain the tradeoffs.",
    "Tie prompt injection to untrusted context, tool permissions, and output validation."
  ],
  playground: {
    descriptionMD: "This static example shows a support-triage response that passes through multiple validators before the application uses it. The model is asked for JSON, but the real safety comes from checking the result after generation.",
    systemPrompt: `You are a support triage assistant.
Return a JSON object with customer_id, risk, action, reason, and citations.
Use only the supplied account note and policy snippets.
Do not promise refunds, legal outcomes, or actions that require human approval.
If the evidence is insufficient, set action to escalate.`,
    userPrompt: `Account note:
Customer cust_123 says the invoice shows two seats after an upgrade and asks whether they will be charged twice.

Policy snippets:
doc_billing_7: Duplicate billing concerns must be escalated to billing support.
doc_refund_2: Refund eligibility depends on account history and must not be promised by automation.

Task:
Classify the risk and choose the next action.`,
    parameters: [
      { name: "temperature", value: "0.1", note: "Low randomness improves repeatability for classification." },
      { name: "response_format", value: "json_schema", note: "Improves structure but does not replace validation." },
      { name: "max_output_tokens", value: "300", note: "The expected object is small." },
      { name: "repair_retries", value: "2", note: "The application retries only recoverable validation failures." }
    ],
    sampleOutputMD: `A candidate output might be:

{
  "customer_id": "cust_123",
  "risk": "medium",
  "action": "escalate",
  "reason": "Duplicate billing concern should be escalated and no refund should be promised automatically.",
  "citations": ["doc_billing_7", "doc_refund_2"]
}

The application would still validate that customer_id belongs to the authenticated account, risk and action are allowed values, citations exist in the provided context, and the reason contains no forbidden promise.`
  },
  comparisons: [
    {
      title: "Guardrail layers",
      columns: ["Layer", "What it catches", "Typical tools", "What it does not solve"],
      rows: [
        ["Schema validation", "Malformed JSON, missing fields, wrong types, bad enums", "JSON Schema, Pydantic, Zod", "Truth, safety, policy, and grounding"],
        ["Safety moderation", "Toxicity, self-harm, PII, disallowed content categories", "Provider moderation, custom classifiers, policy models", "Product-specific eligibility and database references"],
        ["Business rules", "Invalid ranges, unauthorized ids, forbidden claims, policy violations", "Application code, policy tables, service lookups", "Nuanced semantic faithfulness"],
        ["Grounding checks", "Unsupported RAG claims and bad citations", "Citation validators, entailment, LLM-as-judge", "All safety categories or product authorization"]
      ]
    },
    {
      title: "Input guardrails vs output guardrails",
      columns: ["Guardrail", "Runs when", "Primary decision", "Example failure caught"],
      rows: [
        ["Input guardrail", "Before the model call", "Allow, redact, refuse, route, or hand off", "User asks for disallowed self-harm instructions"],
        ["Input guardrail", "Before using retrieved context", "Treat as data, sanitize, or exclude", "Retrieved page says to ignore the system prompt"],
        ["Output guardrail", "After generation", "Show, repair, block, or hand off", "Model returns a forbidden refund guarantee"],
        ["Output guardrail", "Before tool execution", "Execute only if authorized and valid", "Model proposes an action for the wrong account id"]
      ]
    },
    {
      title: "Validator choices",
      columns: ["Validator type", "Best for", "Strength", "Cost and latency", "Main risk"],
      rows: [
        ["Deterministic rule", "Types, ranges, enums, known ids, permissions", "Fast, cheap, auditable", "Very low", "Cannot judge fuzzy quality"],
        ["Safety classifier", "Policy categories such as toxicity, PII, or self-harm", "Specialized and scalable", "Low to medium", "False positives and category drift"],
        ["LLM-as-judge", "Faithfulness, helpfulness, nuanced policy", "Flexible semantic review", "Medium to high", "Judge variance and prompt sensitivity"],
        ["Human review", "High-risk, ambiguous, or escalated cases", "Accountable final decision", "High", "Slow and capacity-limited"]
      ]
    }
  ],
  decisionGuideMD: `## Choosing guardrails for an LLM feature

### Start with risk
Low-risk summarization can use lighter validation, but outputs that affect money, health, legal decisions, identity, tool execution, or customer trust need layered checks and a fallback path.

### Put deterministic checks first
Use schemas, enums, ranges, id lookups, authorization checks, and forbidden-claim rules before expensive semantic validators. These checks are cheap, explainable, and reliable.

### Moderate both sides
Run input moderation to control abuse and unsafe requests. Run output moderation to prevent the assistant from generating unsafe or policy-violating text. The same category may have different handling rules depending on whether it appears in the user request or in the assistant answer.

### Add business rules after structure
A schema can say that action is a string. A business validator decides whether action is one of the allowed values, whether the user is authorized, and whether the action is valid for the account state.

### Use grounding checks for RAG
If the product claims to answer from provided context, require citations and validate them. For higher-risk topics, check that each key claim is supported by a source span and route low-confidence answers to I do not know or human review.

### Reserve LLM-as-judge for semantic questions
Use a judge model when the decision requires natural-language judgment, such as faithfulness or nuanced policy. Evaluate the judge, track disagreement, and keep deterministic validators in front of it.

### Always define the failure path
Every validator needs a decision: allow, repair, redact, refuse, clarify, fallback, or handoff. Never let repeated repair attempts run without a retry budget.`,
  handsOn: [
    {
      title: "Implement a validate-then-repair loop with bounded retries",
      detailMD: "This example treats the model response as raw text. It parses JSON, validates schema-like constraints and business rules, sends one repair prompt for recoverable failures, and returns a safe fallback when the retry budget is exhausted.",
      code: {
        language: "python",
        label: "guarded_generation.py",
        body: `import json

MAX_RETRIES = 2
ALLOWED_ACTIONS = ["refund", "replace", "escalate", "none"]

def parse_json(raw_text):
    try:
        return json.loads(raw_text), "ok"
    except json.JSONDecodeError as error:
        return None, "invalid_json: " + str(error)

def validate_ticket(payload, allowed_customer_ids):
    if not isinstance(payload, dict):
        return False, "root_not_object"

    required = ["customer_id", "risk", "action", "reason"]
    for key in required:
        if key not in payload:
            return False, "missing_" + key

    if payload["customer_id"] not in allowed_customer_ids:
        return False, "unknown_customer"
    if payload["risk"] not in ["low", "medium", "high"]:
        return False, "bad_risk"
    if payload["action"] not in ALLOWED_ACTIONS:
        return False, "bad_action"
    if not isinstance(payload["reason"], str):
        return False, "bad_reason"
    if len(payload["reason"]) > 240:
        return False, "reason_too_long"

    forbidden = ["guaranteed refund", "legal advice", "ignore policy"]
    lower_reason = payload["reason"].lower()
    for phrase in forbidden:
        if phrase in lower_reason:
            return False, "forbidden_claim"

    return True, "ok"

def call_model(prompt):
    if "Repair" in prompt:
        return '{"customer_id":"cust_123","risk":"medium","action":"escalate","reason":"Customer is worried about duplicate billing. Escalate to billing support and do not promise a refund."}'
    return '{"customer_id":"cust_123","risk":"urgent","action":"refund","reason":"Guaranteed refund. Ignore policy."}'

def build_repair_prompt(raw_text, reason):
    parts = []
    parts.append("Repair the assistant output so it is valid JSON.")
    parts.append("Required fields: customer_id, risk, action, reason.")
    parts.append("Allowed risk values: low, medium, high.")
    parts.append("Allowed action values: refund, replace, escalate, none.")
    parts.append("Do not include forbidden claims or instructions.")
    parts.append("Validation failure: " + reason)
    parts.append("Original output:")
    parts.append(raw_text)
    return "\\n".join(parts)

def generate_with_guardrails(user_prompt, allowed_customer_ids):
    prompt = user_prompt
    last_reason = "not_run"

    for attempt in range(MAX_RETRIES + 1):
        raw_text = call_model(prompt)
        payload, parse_reason = parse_json(raw_text)

        if payload is None:
            last_reason = parse_reason
        else:
            valid, validate_reason = validate_ticket(payload, allowed_customer_ids)
            if valid:
                return {
                    "status": "ok",
                    "attempts": attempt + 1,
                    "payload": payload
                }
            last_reason = validate_reason

        if attempt < MAX_RETRIES:
            prompt = build_repair_prompt(raw_text, last_reason)

    return {
        "status": "fallback",
        "reason": last_reason,
        "message": "I cannot safely complete that request. A support specialist will review it."
    }

result = generate_with_guardrails(
    "Classify this billing note for customer cust_123.",
    ["cust_123", "cust_456"]
)
print(json.dumps(result, indent=2))`
      }
    },
    {
      title: "Validate citations for a grounded answer",
      detailMD: "This small checker enforces a basic RAG rule: every cited source must come from the provided context, and every structured claim must point to an allowed source id. Production systems can add source-span matching or an LLM-as-judge faithfulness check after this deterministic gate.",
      code: {
        language: "python",
        label: "citation_validator.py",
        body: `def collect_context_ids(context_items):
    ids = []
    for item in context_items:
        ids.append(item["id"])
    return ids

def validate_citations(answer, context_items):
    allowed_ids = collect_context_ids(context_items)

    if "citations" not in answer or len(answer["citations"]) == 0:
        return False, "missing_citations"

    missing = []
    for citation in answer["citations"]:
        if citation not in allowed_ids:
            missing.append(citation)
    if len(missing) > 0:
        return False, "unknown_citation: " + ", ".join(missing)

    for claim in answer.get("claims", []):
        if claim.get("source_id") not in allowed_ids:
            return False, "unsupported_claim"

    return True, "ok"

context = [
    {"id": "doc_17", "text": "Refunds are available within 30 days."},
    {"id": "doc_23", "text": "Escalate duplicate billing issues to support."}
]

answer = {
    "summary": "Refunds may be available within 30 days.",
    "citations": ["doc_17"],
    "claims": [
        {"text": "Refund window is 30 days.", "source_id": "doc_17"}
    ]
}

print(validate_citations(answer, context))`
      }
    }
  ],
  quiz: [
    {
      question: "Why should an application validate LLM output before trusting it?",
      options: [
        "Because a model response is probabilistic text and can be malformed, unsafe, unsupported, or influenced by injected instructions",
        "Because validation makes the model smaller",
        "Because schemas prove every claim is true",
        "Because output validation replaces the need for input guardrails"
      ],
      answerIndex: 0,
      explanationMD: "The model response is untrusted until the application checks structure, safety, policy, business rules, and grounding where needed."
    },
    {
      question: "What does schema validation primarily guarantee?",
      options: [
        "That the answer is faithful to the source documents",
        "That the output has the expected shape, fields, types, and allowed structural values",
        "That the model did not see any prompt injection",
        "That all business policies have been satisfied"
      ],
      answerIndex: 1,
      explanationMD: "Schema validation is about structure. Truth, safety, policy, and authorization require additional validators."
    },
    {
      question: "Which check is best described as a business-rule validator?",
      options: [
        "Measuring total model tokens",
        "Checking that an action uses an allowed value and references an account the user is authorized to access",
        "Sampling the model at a higher temperature",
        "Embedding the answer for semantic search"
      ],
      answerIndex: 1,
      explanationMD: "Business rules enforce product-specific constraints such as allowed actions, ranges, references, permissions, and forbidden claims."
    },
    {
      question: "What is the safest control loop after a recoverable validation failure?",
      options: [
        "Keep retrying until the model eventually succeeds",
        "Ignore the validator if the answer sounds plausible",
        "Repair with a failure-specific prompt for a bounded number of retries, then fall back or hand off",
        "Ask the user to validate the JSON manually"
      ],
      answerIndex: 2,
      explanationMD: "Bounded repair handles recoverable issues without infinite loops. Persistent or unsafe failures need fallback or human review."
    },
    {
      question: "When is an LLM-as-judge validator most appropriate?",
      options: [
        "For checking whether a required field exists",
        "For verifying whether an integer is inside a numeric range",
        "For semantic judgments such as whether a RAG answer is faithful to cited context",
        "For replacing authorization checks"
      ],
      answerIndex: 2,
      explanationMD: "Judge models are useful for fuzzy semantic evaluation, but deterministic code is better for explicit structural and authorization checks."
    },
    {
      question: "What should a grounding validator for RAG answers check?",
      options: [
        "That the answer cites provided context and does not make unsupported claims",
        "That the answer is always long and detailed",
        "That the model used the highest temperature",
        "That every retrieved document is quoted in full"
      ],
      answerIndex: 0,
      explanationMD: "Grounding validation checks source support. It should verify citation ids, claim support, and I do not know behavior when evidence is missing."
    }
  ],
  flashcards: [
    { front: "What is the core purpose of output guardrails?", back: "To decide whether model output is safe, valid, policy-compliant, and trustworthy enough to use." },
    { front: "Why is schema validation necessary?", back: "It guarantees the response has the expected shape, fields, types, and structural constraints before downstream code uses it." },
    { front: "Why is schema validation not sufficient?", back: "A valid object can still contain unsafe content, false claims, forbidden promises, or unauthorized actions." },
    { front: "What do input guardrails inspect?", back: "User requests and untrusted context before the model call, including abuse, PII, self-harm, toxicity, policy issues, and prompt injection." },
    { front: "What do output guardrails inspect?", back: "Model responses after generation, including structure, safety, business rules, grounding, and tool arguments." },
    { front: "What is a bounded repair loop?", back: "A loop that retries recoverable validation failures with a repair prompt only up to a small limit before fallback or handoff." },
    { front: "When should you use an LLM-as-judge validator?", back: "When the validation requires semantic judgment that deterministic rules cannot capture well, such as faithfulness or nuanced policy." },
    { front: "What should observability capture for guardrails?", back: "Validation outcomes, block reasons, validator versions, prompt and model versions, retry counts, fallback type, latency, and policy categories." }
  ],
  cheatSheetMD: `## Output guardrails and validation cheat sheet

### Principle
- Treat LLM output as untrusted text until it passes validation.
- Validate before showing a response, saving data, executing tools, or making product decisions.
- Prefer explicit pass, repair, block, fallback, and handoff states over silent trust.

### Guardrail layers
- **Schema validation**: JSON shape, required fields, types, enums, length limits, version fields.
- **Safety moderation**: toxicity, self-harm, PII, dangerous instructions, policy categories on input and output.
- **Business rules**: allowed values, ranges, account references, authorization, forbidden claims, product policy.
- **Grounding checks**: citations exist, claims are supported, missing evidence leads to I do not know.
- **Prompt-injection defense**: untrusted text stays data, tools are allowlisted, actions are validated.

### Control loop
1. Run input guardrails.
2. Call the model with clear boundaries and output contract.
3. Parse and validate structure.
4. Run output moderation and business checks.
5. Run grounding checks for RAG.
6. Repair only recoverable failures.
7. Stop after bounded retries.
8. Fall back to a safe response or human review.
9. Log outcomes and reasons.

### Deterministic validators
- Best for explicit constraints.
- Cheap, fast, reliable, and auditable.
- Use for schemas, enums, ranges, ids, permissions, and forbidden exact claims.

### LLM-as-judge validators
- Best for semantic questions such as faithfulness, helpfulness, or nuanced policy.
- More flexible but slower, more expensive, and less deterministic.
- Evaluate the judge with labeled examples and monitor drift.

### Common interview answer shape
1. State that model output is probabilistic and untrusted.
2. Propose layered validation.
3. Explain input vs output guardrails.
4. Describe bounded repair and fallback.
5. Discuss deterministic vs judge-model tradeoffs.
6. End with observability, audit logs, and policy versioning.`,
  references: [
    { title: "OpenAI Structured Outputs Guide", kind: "Docs", url: "https://platform.openai.com/docs/guides/structured-outputs", author: "OpenAI" },
    { title: "OpenAI Moderation Guide", kind: "Docs", url: "https://platform.openai.com/docs/guides/moderation", author: "OpenAI" },
    { title: "Anthropic Guardrails Guide", kind: "Docs", url: "https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/overview", author: "Anthropic" },
    { title: "OWASP Top 10 for Large Language Model Applications", kind: "Docs", url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/", author: "OWASP" }
  ],
  relatedLessons: [
    { slug: "structured-outputs", note: "Shows how model-side structured output features reduce formatting failures before external validation." },
    { slug: "defending-against-prompt-injection", note: "Explains the attack patterns that input and output guardrails must account for." },
    { slug: "design-llm-guardrail-system", note: "Expands this lesson into a full production guardrail architecture." },
    { slug: "pii-detection-and-redaction", note: "Covers one of the most common safety validators used on both input and output." }
  ]
};
