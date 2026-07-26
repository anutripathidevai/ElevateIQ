import type { GenAILessonContent } from "../types";

export const structuredOutputsContent: GenAILessonContent = {
  slug: "structured-outputs",
  introductionMD: `Structured outputs turn an LLM response from best-effort text into a contract that application code can parse. Instead of asking the model to please return JSON, the application supplies a schema and the provider constrains generation so the normal response conforms to that schema.

For a strong engineer, the key distinction is reliability. Plain JSON mode usually guarantees syntactically valid JSON, but it does not guarantee the fields, enum values, required properties, or nesting your code expects. Structured outputs use a provider-supported schema subset, often JSON Schema, and can reject or separately surface safety refusals rather than mixing them into the data shape.

In production, structured outputs are the bridge between probabilistic language and deterministic software. They are used for extraction, classification, routing, tool inputs, workflow decisions, and UI-ready objects. They reduce parsing failures, but they do not remove the need for validation, observability, fallback, and careful schema design.`,
  realWorldMD: `Structured outputs show up anywhere an LLM result feeds code instead of being shown directly to a human.

- Support systems classify tickets into priority, sentiment, product area, and escalation reason.
- Sales workflows extract accounts, contacts, next steps, and confidence labels from notes.
- RAG applications return answer objects with citations, missing-evidence flags, and follow-up questions.
- Agent frameworks require tool arguments to match strict input schemas before executing actions.
- Evaluation pipelines score outputs against typed rubrics instead of scraping prose.`,
  learningObjectives: [
    "Explain how schema-constrained responses differ from ordinary JSON mode.",
    "Use OpenAI response_format json_schema with strict:true, Anthropic tool-based structuring, and Gemini responseSchema patterns.",
    "Describe guided decoding as token masking against a schema-derived grammar.",
    "Design schemas with required fields, additionalProperties:false, enums, nullable fields, and shallow structure.",
    "Handle safety refusals separately from successful parsed objects.",
    "Apply validation, repair, logging, and fallback as defense in depth even when strict schemas are enabled."
  ],
  theory: [
    {
      label: "Structured output is a schema contract",
      detailMD: `A structured output request gives the model an explicit target shape. With OpenAI, that commonly means response_format with type json_schema, a named schema, and strict:true. With Anthropic, the most reliable pattern is tool-based structuring: define a tool input schema, instruct the model to use that tool, then read the tool input as the structured object. With Gemini, generation config can set a JSON MIME type and responseSchema so the model emits data matching the declared schema.

The practical effect is that downstream code no longer scrapes natural language. It receives an object such as a classification, extraction, route decision, or rubric score. The schema becomes an API boundary between the LLM and the rest of the system. That boundary should be reviewed, versioned, tested, and monitored like any other interface.`
    },
    {
      label: "Strict schemas are different from JSON mode",
      detailMD: `Plain JSON mode is useful but weaker. It tells the model to produce valid JSON, so the output is usually parseable by a JSON parser. It does not guarantee that priority is one of low, medium, or high, that required fields are present, that extra fields are absent, or that nested objects match your domain model.

Structured outputs add schema-level constraints. A strict schema can require fields, disallow unknown properties with additionalProperties:false, constrain strings with enums, and express limited unions with anyOf. If software depends on exact keys and values, structured outputs are the correct default; JSON mode is mainly for loose human-assisted workflows or quick prototypes.`
    },
    {
      label: "Guided decoding masks invalid tokens",
      detailMD: `Under the hood, providers compile the supported schema into a grammar, finite-state machine, or similar constraint representation. At each decoding step, the sampler only allows tokens that can still lead to a valid object. Tokens that would break the schema are masked out before sampling.

That is why schema-constrained decoding can guarantee parseability for normal completions. If the next legal character must be a quote, a comma, a closing brace, or one of a small set of enum values, the model cannot freely emit arbitrary prose. The model still chooses among allowed continuations, so the content can be wrong or low quality, but the container is valid.`
    },
    {
      label: "Provider APIs expose the idea differently",
      detailMD: `OpenAI exposes strict structured output through response_format json_schema, including a schema name and strict:true. Modern SDKs may also provide parse helpers that return a typed parsed object when the response is successful.

Anthropic often uses tools for structure. A tool definition includes an input_schema, and the assistant emits a tool_use block with JSON input. You may force a specific tool choice when the only acceptable successful output is that structured payload. Gemini supports responseSchema with response MIME type application/json, so the response is generated as JSON matching the schema shape supported by the API. The names differ, but the application pattern is the same: declare the shape, parse only the normal structured channel, and treat refusals or safety blocks separately.`
    },
    {
      label: "Schema subset limits are product constraints",
      detailMD: `Provider-supported schemas are intentionally narrower than full JSON Schema. Common constraints include object types, properties, required arrays, additionalProperties:false, enums, arrays, primitive types, and limited anyOf unions. Some providers require every property to be listed as required, with optionality represented by an explicit nullable union such as string or null.

Advanced JSON Schema features may be rejected or ignored: arbitrary patternProperties, complex conditional validation, deeply recursive definitions, unbounded recursion, very deep nesting, huge enums, or root-level unions. Treat the provider schema subset as a product constraint. Keep schemas small, explicit, and close to what the model must decide.`
    },
    {
      label: "Refusal is not a malformed object",
      detailMD: `A safety refusal should not be forced into your business schema. If the user asks for disallowed content, the provider can surface a refusal or safety block through a separate field, message part, stop reason, or candidate status. In that case, the application should not attempt to parse the normal schema payload.

This separation is important for correctness and security. A normal parsed object means the model accepted the task and produced schema-shaped data. A refusal means the task was not completed as structured data. Your code path should branch early: handle refusal UX, audit the event, and avoid feeding a fake parsed object into downstream automation.`
    }
  ],
  requestFlow: [
    {
      step: "1. Choose the business object",
      detailMD: `Start with the object the application actually needs: a ticket triage result, extracted invoice fields, a moderation decision, or a search query plan. Do not begin with prose and hope to parse it later.`
    },
    {
      step: "2. Design the schema",
      detailMD: `Define object properties, required fields, enum values, array item shapes, and additionalProperties:false. Prefer explicit nullable fields over omitted optional fields when the provider expects all fields to be required.`
    },
    {
      step: "3. Attach the schema to the provider call",
      detailMD: `For OpenAI, send response_format with type json_schema and strict:true. For Anthropic, define a tool with an input_schema and force or strongly prefer that tool. For Gemini, set responseSchema with application/json response MIME type.`
    },
    {
      step: "4. The provider constrains decoding",
      detailMD: `During generation, the decoder masks tokens that would violate the schema-derived grammar. The model can still choose values among legal continuations, but it cannot emit invalid JSON structure in the normal path.`
    },
    {
      step: "5. Check for refusal or safety stop",
      detailMD: `Before parsing, inspect provider-specific refusal and safety fields. If the model refused or the response was blocked, route to a refusal UX or fallback path instead of trying to coerce it into the schema.`
    },
    {
      step: "6. Parse and validate",
      detailMD: `Parse the structured channel into an object and run application-side validation. Validation catches provider regressions, SDK misuse, schema version mismatches, domain constraints, and any relaxed behavior in non-strict fallback paths.`
    },
    {
      step: "7. Use the object in deterministic code",
      detailMD: `Only after successful parsing and validation should the object drive workflow actions, database writes, tool calls, UI rendering, or analytics. Keep raw model output and parsed data separate in logs.`
    },
    {
      step: "8. Monitor and iterate",
      detailMD: `Track refusal rate, validation failures, enum distributions, missing-evidence flags, latency, token usage, and repair retries. Schema changes should be versioned because they change both model behavior and downstream expectations.`
    }
  ],
  deepDives: [
    {
      label: "Constrained decoding improves syntax, not truth",
      detailMD: `Guided decoding can guarantee that the response is parseable and schema-shaped, but it cannot guarantee that the extracted date is correct, that the classification is fair, or that the answer is grounded in evidence. The model still predicts content based on prompt, context, and learned behavior.

This distinction matters in interviews. Structured outputs solve interface reliability. They do not solve factuality, authorization, prompt injection, or business-rule enforcement. You still need grounding, retrieval quality, server-side checks, and evaluation.`
    },
    {
      label: "Enums are stronger than free text",
      detailMD: `If a downstream workflow has known states, use enums. A priority field with low, medium, high, and urgent is easier to validate, measure, and route than a free-text priority_reason field that the model can phrase in many ways.

Enums also reduce decoding ambiguity. The model chooses from a small set of allowed continuations, which improves repeatability and reduces accidental synonyms. Free text should be reserved for human-readable explanations, evidence snippets, or fields where open-ended language is truly required.`
    },
    {
      label: "Nullable fields beat hidden optionality",
      detailMD: `Many strict schema implementations work best when every property is required. That can feel odd for optional fields, but it is usually better to require the field and allow null than to let the key disappear.

Explicit null has product value. It forces the prompt and schema to define what missing evidence means. For example, renewal_date can be a string or null, and a separate missing_fields array can explain what evidence was absent. Downstream code no longer guesses whether a missing key means unknown, unsupported, or model error.`
    },
    {
      label: "Deep nesting increases model and schema risk",
      detailMD: `A deeply nested schema may be valid for software but hard for the model to fill consistently. Every nested level increases the number of braces, arrays, required fields, and decisions the decoder must satisfy. It can also make provider limits more likely.

Prefer flat or moderately nested objects for LLM outputs. If the business object is complex, split the task into stages: extract core facts first, validate them, then call a second schema for enrichment or planning. Smaller schemas are easier to test and easier to repair.`
    },
    {
      label: "Repair loops are still useful",
      detailMD: `Strict structured outputs reduce malformed JSON, but repair remains useful for non-strict fallbacks, provider outages, domain validation failures, and business constraints that are outside the schema subset. For example, a schema can require a date string, but your validator may reject dates before account creation.

A good repair loop is bounded and observable. Send the validation error, the original task, and the invalid object to a repair prompt with the same schema. Retry once or twice, then fall back to a human review queue or safe default. Infinite repair loops turn model uncertainty into latency and cost.`
    }
  ],
  productionConsiderations: [
    {
      label: "Version schemas and prompts together",
      detailMD: `Schema changes are API changes. Adding an enum value, renaming a field, or changing nullable behavior can break parsers, dashboards, evaluation cases, and downstream workflow rules. Record schema_version with each request and tie it to the prompt and model version.`
    },
    {
      label: "Log parse and refusal outcomes",
      detailMD: `Track whether each request ended as parsed, refused, blocked, validation_failed, repaired, or fallback. This makes quality regressions visible. A rising validation failure rate usually indicates prompt drift, schema mismatch, a provider behavior change, or new user inputs not represented in tests.`
    },
    {
      label: "Keep deterministic checks outside the model",
      detailMD: `Do not ask the model to enforce permissions, billing policy, or irreversible side-effect rules just because the output is structured. Use application code for authorization, quotas, idempotency, data access, and final tool execution decisions.`
    },
    {
      label: "Budget for latency and token overhead",
      detailMD: `Schemas consume request tokens and constrained decoding can add latency depending on provider implementation, schema size, and enum complexity. The tradeoff is often worth it for automation, but high-volume paths should measure cost, latency, and failure rate against simpler classifiers or deterministic rules.`
    }
  ],
  interview: {
    whatInterviewersLookFor: [
      "A crisp distinction between JSON mode and schema-guaranteed structured output.",
      "Knowledge of provider-specific mechanisms: OpenAI response_format json_schema strict:true, Anthropic tool input schemas, and Gemini responseSchema.",
      "Understanding that guided decoding masks invalid next tokens but does not guarantee semantic truth.",
      "Production instincts around refusal handling, validation, schema versioning, observability, repair, and fallback."
    ],
    followUps: [
      {
        question: "How does constrained decoding guarantee schema-valid JSON?",
        answerMD: `The provider converts the supported schema into a grammar or state machine. At each generation step, tokens that cannot lead to a valid object are masked out before sampling. The model still chooses content among legal continuations, but invalid braces, missing required keys, extra properties, or enum values outside the schema are not available in the normal structured path.`
      },
      {
        question: "What is the difference between JSON mode and structured outputs?",
        answerMD: `JSON mode targets syntactic JSON. It helps prevent prose around the answer, but the object may still miss fields, add extra fields, or use unexpected values. Structured outputs target a schema, so required fields, property names, allowed enum values, object shapes, and additionalProperties:false can be enforced when supported by the provider.`
      },
      {
        question: "How should a service handle a safety refusal?",
        answerMD: `Check the provider refusal or safety status before parsing. If the response is refused or blocked, route to a refusal UX, audit log, or fallback. Do not fabricate a schema-shaped object, and do not treat refusal text as a normal parsed payload.`
      },
      {
        question: "Why validate if strict:true already guarantees the schema?",
        answerMD: `Validation is defense in depth. It catches SDK misuse, provider configuration mistakes, schema-version mismatches, non-strict fallback paths, and business rules outside the provider schema subset. It also gives you metrics and repair triggers when inputs drift.`
      }
    ],
    alternativeDesigns: [
      {
        name: "Plain JSON mode plus validator",
        detailMD: `The model is asked for valid JSON and application code validates the result. This is simple and portable, but failures are more common because decoding is not constrained to the exact schema. It can be acceptable for low-risk internal tools or prototypes.`
      },
      {
        name: "Strict structured output",
        detailMD: `The provider constrains the normal response to a declared schema. This is the best default when code depends on fields, enums, and object shape. It requires learning provider schema limits and designing compact schemas.`
      },
      {
        name: "Tool-call-only structuring",
        detailMD: `The application represents the desired object as a tool input and reads the tool_use arguments instead of assistant prose. This fits agent systems and Anthropic-style APIs well, especially when the same schema later drives a real tool execution step.`
      }
    ],
    commonMistakes: [
      "Confusing valid JSON with schema-valid structured output.",
      "Designing large, deeply nested schemas that exceed provider limits or confuse the model.",
      "Ignoring refusals and trying to parse every response as a normal object.",
      "Skipping validation, logging, and repair because the provider call uses strict mode."
    ]
  },
  interviewHints: [
    "Start by separating syntax guarantees from schema guarantees.",
    "Name the provider mechanisms before discussing abstract design.",
    "Explain guided decoding with token masks and a schema-derived grammar.",
    "End with production handling: refusal branch, validation, repair, metrics, and schema versioning."
  ],
  playground: {
    descriptionMD: `This static playground shows a ticket triage schema that favors enums and explicit nulls. The same shape can be used with OpenAI strict json_schema, Anthropic tool input schemas, or Gemini responseSchema.`,
    systemPrompt: `You classify customer support notes into a strict triage object.
Use only the note provided by the user.
If evidence is missing, use null for the field and add the field name to missing_fields.
Do not invent account policy or billing outcomes.`,
    userPrompt: `Customer note:
I upgraded yesterday and now my invoice shows two workspace seats. I only have one employee using the product. The billing page says the change renews tomorrow, and I need to know whether I will be charged twice.

Return the triage object using the provided schema.`,
    parameters: [
      { name: "model", value: "gpt-4o-mini", note: "A smaller model is often enough for short extraction when the schema is tight." },
      { name: "response_format.type", value: "json_schema", note: "OpenAI structured output mode for a JSON Schema contract." },
      { name: "response_format.json_schema.strict", value: "true", note: "Rejects unsupported loose output and constrains normal decoding to the schema." },
      { name: "temperature", value: "0.1", note: "Low randomness improves repeatability for routing decisions." }
    ],
    sampleOutputMD: `A successful normal response would parse as an object like this:

{
  "category": "billing",
  "priority": "medium",
  "customer_sentiment": "concerned",
  "requires_human_review": true,
  "renewal_date": "tomorrow",
  "missing_fields": ["billing_policy"],
  "summary": "Customer sees two seats after upgrade and worries about being charged twice."
}

If the request were unsafe or disallowed, the provider should surface a refusal or safety block separately. The application should not try to force that refusal into this object.`
  },
  comparisons: [
    {
      title: "Output reliability modes",
      columns: ["Mode", "Guarantee", "Best use", "Main risk"],
      rows: [
        ["Free-form text", "No machine-readable guarantee", "Human-facing explanations", "Brittle parsing and hidden assumptions"],
        ["JSON mode", "Valid JSON syntax in normal cases", "Loose prototypes and human-assisted workflows", "Fields and values may not match expectations"],
        ["Strict structured output", "Supported schema shape for normal responses", "Automation, routing, extraction, and typed UI objects", "Schema subset limits and semantic errors still apply"],
        ["Tool input schema", "Tool arguments match declared input shape when tool is used", "Agents and action workflows", "Tool choice and refusal handling must be explicit"]
      ]
    },
    {
      title: "Provider patterns",
      columns: ["Provider", "Mechanism", "Normal structured channel", "Refusal or safety path"],
      rows: [
        ["OpenAI", "response_format json_schema with strict:true", "Message content or SDK parsed object matching the schema", "Refusal field or safety-related response path before parsing"],
        ["Anthropic", "Tool definition with input_schema and tool choice", "tool_use block input", "Text refusal, stop reason, or no tool_use block"],
        ["Gemini", "responseSchema with application/json response MIME type", "JSON response matching supported schema", "Blocked candidate or safety metadata"],
        ["Portable fallback", "Prompt asks for JSON plus local validator", "Parsed JSON if validation succeeds", "Validation failure, repair retry, or human review"]
      ]
    },
    {
      title: "Schema design choices",
      columns: ["Choice", "Prefer", "Avoid", "Why it matters"],
      rows: [
        ["Labels", "Enums for known categories", "Open-ended labels for routing", "Enums reduce synonyms and simplify metrics"],
        ["Optional data", "Required field with explicit null when unknown", "Missing keys with unclear meaning", "Downstream code can distinguish unknown from parser failure"],
        ["Shape", "Flat or moderately nested objects", "Deep recursive structures", "Smaller schemas decode faster and fail less often"],
        ["Extra fields", "additionalProperties:false", "Allowing arbitrary model-invented keys", "Unexpected keys create integration and security risk"],
        ["Explanations", "Short rationale fields tied to evidence", "Long prose mixed with control fields", "Keeps automation data separate from human-readable context"]
      ]
    }
  ],
  decisionGuideMD: `## Choosing an output strategy

Use **strict structured outputs** when application code depends on exact fields, enum values, arrays, or object shapes. This is the default for extraction, classification, routing, and any workflow that writes to a database or calls tools.

Use **tool-based structuring** when the structured object is naturally a tool input or when the provider exposes its strongest schema guarantees through tools. This is common in Anthropic workflows and agent systems.

Use **Gemini responseSchema** when building on Gemini and the response should be JSON matching a declared schema. Pair it with response MIME type application/json and local validation.

Use **JSON mode** only when valid JSON is enough and schema drift is tolerable, such as early prototypes, internal analysis, or human-reviewed output. Add a local validator and repair loop if the result feeds code.

Keep schemas **small, explicit, and boring**. Prefer enums over free text, explicit null over missing keys, additionalProperties:false over open objects, and shallow structures over deep nesting. If the object becomes large, split the workflow into multiple schema-constrained calls.

Always branch on **refusal before parse**, then validate, log, and apply deterministic business rules outside the model.`,
  handsOn: [
    {
      title: "Define a strict JSON schema and parse the result",
      detailMD: `This Python example defines a schema for ticket triage, sends it as an OpenAI strict json_schema response_format, checks for refusal first, then parses the normal response. It uses string concatenation and ordinary JSON parsing so the control flow is clear.`,
      code: {
        language: "python",
        label: "openai_structured_output.py",
        body: `import json
from openai import OpenAI

client = OpenAI()

triage_schema = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "category": {
            "type": "string",
            "enum": ["billing", "technical", "account", "sales"]
        },
        "priority": {
            "type": "string",
            "enum": ["low", "medium", "high", "urgent"]
        },
        "requires_human_review": {
            "type": "boolean"
        },
        "renewal_date": {
            "anyOf": [
                {"type": "string"},
                {"type": "null"}
            ]
        },
        "missing_fields": {
            "type": "array",
            "items": {"type": "string"}
        },
        "summary": {
            "type": "string"
        }
    },
    "required": [
        "category",
        "priority",
        "requires_human_review",
        "renewal_date",
        "missing_fields",
        "summary"
    ]
}

note = (
    "I upgraded yesterday and now my invoice shows two workspace seats. "
    + "I only have one employee using the product. "
    + "The billing page says the change renews tomorrow."
)

completion = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {
            "role": "system",
            "content": "Classify the support note. Use null when evidence is missing."
        },
        {
            "role": "user",
            "content": "Support note: " + note
        }
    ],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "support_ticket_triage",
            "strict": True,
            "schema": triage_schema
        }
    }
)

message = completion.choices[0].message

if getattr(message, "refusal", None):
    print("Refusal: " + message.refusal)
else:
    parsed = json.loads(message.content)
    print("Priority: " + parsed["priority"])
    print("Category: " + parsed["category"])
    print("Missing fields: " + ", ".join(parsed["missing_fields"]))`
      }
    },
    {
      title: "Validate and repair after parsing",
      detailMD: `Strict schemas protect the interface, while application validation protects product rules. This example rejects an object that is schema-shaped but violates a domain rule, then prepares a bounded repair prompt.`,
      code: {
        language: "python",
        label: "validate_and_repair.py",
        body: `allowed_categories = ["billing", "technical", "account", "sales"]
allowed_priorities = ["low", "medium", "high", "urgent"]

def validate_triage(obj):
    errors = []
    if obj.get("category") not in allowed_categories:
        errors.append("category must be one of " + ", ".join(allowed_categories))
    if obj.get("priority") not in allowed_priorities:
        errors.append("priority must be one of " + ", ".join(allowed_priorities))
    if obj.get("priority") == "urgent" and obj.get("requires_human_review") is False:
        errors.append("urgent tickets must require human review")
    if len(obj.get("summary", "")) > 180:
        errors.append("summary must be 180 characters or fewer")
    return errors

def build_repair_prompt(original_note, invalid_obj, errors):
    parts = []
    parts.append("Repair the triage object so it satisfies the schema and product rules.")
    parts.append("Use only the original support note as evidence.")
    parts.append("Original support note:")
    parts.append(original_note)
    parts.append("Invalid object:")
    parts.append(str(invalid_obj))
    parts.append("Validation errors:")
    parts.append("; ".join(errors))
    parts.append("Return only the corrected structured object.")
    return "\\n".join(parts)

candidate = {
    "category": "billing",
    "priority": "urgent",
    "requires_human_review": False,
    "renewal_date": "tomorrow",
    "missing_fields": ["billing_policy"],
    "summary": "Customer worries about being charged for two seats after an upgrade."
}

note = "Customer sees two seats after an upgrade and asks whether billing will double."
errors = validate_triage(candidate)

if errors:
    repair_prompt = build_repair_prompt(note, candidate, errors)
    print(repair_prompt)
else:
    print("Object is ready for deterministic workflow code.")`
      }
    },
    {
      title: "Model the same object as a tool input",
      detailMD: `Tool-based structuring represents the desired payload as tool arguments. In an Anthropic-style flow, the application reads the tool_use input rather than parsing assistant prose.`,
      code: {
        language: "python",
        label: "tool_schema_shape.py",
        body: `triage_tool = {
    "name": "record_ticket_triage",
    "description": "Record the structured triage result for one support ticket.",
    "input_schema": {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "category": {
                "type": "string",
                "enum": ["billing", "technical", "account", "sales"]
            },
            "priority": {
                "type": "string",
                "enum": ["low", "medium", "high", "urgent"]
            },
            "requires_human_review": {
                "type": "boolean"
            },
            "summary": {
                "type": "string"
            }
        },
        "required": ["category", "priority", "requires_human_review", "summary"]
    }
}

def find_tool_input(content_blocks, tool_name):
    for block in content_blocks:
        if block.get("type") == "tool_use" and block.get("name") == tool_name:
            return block.get("input")
    return None

example_blocks = [
    {
        "type": "tool_use",
        "name": "record_ticket_triage",
        "input": {
            "category": "billing",
            "priority": "medium",
            "requires_human_review": True,
            "summary": "Customer asks whether two seats after upgrade will double billing."
        }
    }
]

tool_input = find_tool_input(example_blocks, triage_tool["name"])

if tool_input is None:
    print("No structured tool input was produced; handle refusal or retry.")
else:
    print("Structured tool input category: " + tool_input["category"])`
      }
    }
  ],
  quiz: [
    {
      question: "What does strict structured output guarantee that plain JSON mode does not?",
      options: [
        "That the answer is factually correct",
        "That supported schema constraints such as required fields and enums are followed in the normal response",
        "That the model will never refuse a request",
        "That no application validation is needed"
      ],
      answerIndex: 1,
      explanationMD: `Strict structured output constrains the normal response to a supported schema. It does not guarantee truth, eliminate refusals, or replace application validation.`
    },
    {
      question: "How does guided decoding usually enforce a schema?",
      options: [
        "It samples freely and fixes the JSON after generation",
        "It masks tokens that cannot lead to a schema-valid continuation",
        "It increases temperature until the model finds valid JSON",
        "It asks a second model to rewrite the answer as prose"
      ],
      answerIndex: 1,
      explanationMD: `The provider uses a schema-derived grammar or state machine to decide which next tokens are legal, then masks invalid options before sampling.`
    },
    {
      question: "Which schema design is usually best for a known routing category?",
      options: [
        "A free-text string with no constraints",
        "An enum with the allowed categories",
        "A deeply nested object with many optional labels",
        "A paragraph explaining all possible categories"
      ],
      answerIndex: 1,
      explanationMD: `Enums reduce ambiguity, make validation simple, and help workflow metrics stay consistent.`
    },
    {
      question: "What should code do before parsing a structured response?",
      options: [
        "Ignore provider-specific status and parse immediately",
        "Check for refusal, safety blocks, or missing structured channel",
        "Append extra text to make the response more readable",
        "Convert every refusal into a default successful object"
      ],
      answerIndex: 1,
      explanationMD: `Refusals and safety blocks are separate outcomes. The application should branch before normal parsing.`
    },
    {
      question: "Why is additionalProperties:false useful?",
      options: [
        "It allows the model to invent helpful extra fields",
        "It prevents unexpected keys from entering downstream code",
        "It makes every field optional",
        "It disables all enum validation"
      ],
      answerIndex: 1,
      explanationMD: `Disallowing extra properties keeps the model output aligned with the interface your application expects.`
    },
    {
      question: "Why keep validation even when strict schemas are enabled?",
      options: [
        "Because validation can enforce domain rules, catch integration mistakes, and trigger repair or fallback",
        "Because strict schemas never affect decoding",
        "Because JSON parsers cannot parse structured outputs",
        "Because validation removes the need for schemas"
      ],
      answerIndex: 0,
      explanationMD: `Strict schemas protect the shape. Application validation adds business rules, version checks, observability, and defense in depth.`
    }
  ],
  flashcards: [
    { front: "What are structured outputs?", back: "LLM responses constrained to a declared schema so application code can parse a predictable object." },
    { front: "How is JSON mode weaker than structured output?", back: "JSON mode targets syntactic JSON, while structured output targets schema constraints such as required fields, enums, and object shape." },
    { front: "What does OpenAI use for strict schema output?", back: "response_format with type json_schema, a named json_schema object, and strict:true." },
    { front: "What is the Anthropic pattern for structure?", back: "Define a tool input_schema and read the tool_use input as the structured payload." },
    { front: "What is Gemini responseSchema used for?", back: "It declares the schema shape for JSON output, usually paired with response MIME type application/json." },
    { front: "What is guided decoding?", back: "A decoding process where invalid next tokens are masked based on a schema-derived grammar." },
    { front: "Why use explicit nulls?", back: "They make missing evidence visible while keeping required keys stable for downstream code." },
    { front: "Why validate strict outputs?", back: "To enforce domain rules, catch integration mistakes, handle fallbacks, and collect quality metrics." }
  ],
  cheatSheetMD: `## Structured outputs cheat sheet

### Core distinction
- **Free text**: best for human-facing prose, worst for automation.
- **JSON mode**: produces valid JSON, but fields and values can drift.
- **Structured output**: constrains the normal response to a supported schema.
- **Tool input schema**: treats the structured payload as tool arguments.

### Provider names
- **OpenAI**: response_format type json_schema, json_schema name, strict:true, schema.
- **Anthropic**: tool definition with input_schema, then read tool_use input.
- **Gemini**: responseSchema with response MIME type application/json.

### Guided decoding
1. Provider compiles the supported schema into a grammar or state machine.
2. Decoder computes legal next tokens for the current state.
3. Invalid tokens are masked before sampling.
4. The normal response remains parseable, but the content still needs quality checks.

### Schema design
- Use object schemas with explicit properties.
- Mark fields required when the provider expects it.
- Use additionalProperties:false to prevent surprise keys.
- Use enums for labels, routes, statuses, and priorities.
- Use anyOf with null for explicit nullable fields.
- Prefer shallow schemas over deep recursive structures.
- Keep explanations short and separate from control fields.

### Refusal handling
- Check refusal, safety metadata, stop reason, or missing structured channel before parsing.
- Do not coerce a refusal into a fake business object.
- Log refused, blocked, parsed, validation_failed, repaired, and fallback outcomes separately.

### Defense in depth
- Validate parsed objects locally.
- Enforce authorization and business rules in code.
- Use bounded repair retries for validation failures.
- Version schema, prompt, and model together.
- Monitor enum distributions, null rates, repair rate, refusal rate, latency, and cost.

### Interview answer shape
1. Define structured outputs versus JSON mode.
2. Name provider mechanisms.
3. Explain guided decoding token masking.
4. Discuss schema subset limits.
5. Branch on refusal before parse.
6. Validate, repair, log, and fallback in production.`,
  references: [
    { title: "OpenAI Structured Outputs", kind: "Docs", url: "https://platform.openai.com/docs/guides/structured-outputs", author: "OpenAI" },
    { title: "Anthropic Tool Use", kind: "Docs", url: "https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview", author: "Anthropic" },
    { title: "Gemini Structured Output", kind: "Docs", url: "https://ai.google.dev/gemini-api/docs/structured-output", author: "Google" },
    { title: "JSON Schema Core Specification", kind: "Docs", url: "https://json-schema.org/draft/2020-12/json-schema-core", author: "JSON Schema" }
  ],
  relatedLessons: [
    { slug: "json-mode", note: "Compares loose JSON syntax guarantees with schema-level constraints." },
    { slug: "function-and-tool-calling", note: "Shows how tool input schemas extend structured output into action workflows." },
    { slug: "output-guardrails-and-validation", note: "Covers validation, repair, and safety checks around model outputs." },
    { slug: "calling-the-openai-api", note: "Provides the API foundation for using response_format in production calls." }
  ]
};
