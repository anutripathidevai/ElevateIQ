import type { GenAILessonContent } from "../types";

export const jsonModeContent: GenAILessonContent = {
  slug: "json-mode",
  introductionMD: `JSON mode is the syntax guardrail for LLM applications that need machine-readable output but are not yet ready to enforce a full schema at generation time. With OpenAI, the common form is response_format set to json_object, which constrains the model to emit syntactically valid JSON instead of free-form prose. Similar goals can be achieved with provider-specific JSON response settings, schema response settings, or tool-use APIs depending on the platform.

The most important interview distinction is that JSON mode guarantees **valid JSON**, not **valid business data**. The model can still omit fields, rename keys, use the wrong type, choose an unsupported enum value, or return a shape your code did not expect. Structured outputs go further by constraining the response to a schema, while tool calling is best when the model is selecting an action for the application to execute.

Production JSON mode is therefore a contract between prompting and code. You instruct the model to return JSON and describe the fields, enable the syntax constraint, detect truncation, parse defensively, validate with a schema, and retry or repair failures before downstream systems consume the data.`,
  realWorldMD: `JSON mode shows up whenever an LLM result feeds software instead of a human reader.

- Support systems extract sentiment, priority, and next action from tickets.
- Sales tools convert call notes into CRM updates.
- Moderation pipelines ask the model for category labels and evidence snippets.
- RAG systems request answer objects with citations, confidence, and missing-evidence flags.
- Workflow agents use JSON as an intermediate representation before validation or tool calls.`,
  learningObjectives: [
    "Use JSON mode to force syntactically valid JSON from a model response.",
    "Explain why JSON mode does not guarantee required fields, types, enums, or schema compliance.",
    "Write prompts that explicitly ask for JSON and describe the desired fields even when a JSON flag is enabled.",
    "Detect and recover from truncated JSON when finish_reason is length or token limits cut off the object.",
    "Parse safely, validate with a schema, and repair or retry invalid outputs before using them.",
    "Choose between JSON mode, structured outputs, and tool calling for common LLM application designs."
  ],
  theory: [
    {
      label: "JSON mode is a syntax constraint",
      detailMD: `JSON mode changes the decoder contract from free text to valid JSON text. In OpenAI Chat Completions, that means setting response_format to an object with type json_object. In Azure OpenAI, the same family of model APIs exposes the same response_format concept. In Gemini, the closest syntax-oriented setting is a JSON response MIME type such as application/json, while a response schema moves closer to structured outputs. For providers without a dedicated JSON flag, tool use or schema output is usually more reliable than prompt-only JSON.

The key word is **syntax**. The response should parse as JSON, but the object can still be semantically wrong for your application. It might be an array instead of an object, include a string where your code expects a number, or use confidence_label instead of confidence. JSON mode makes parsing possible; validation decides whether the parsed value is acceptable.`
    },
    {
      label: "The prompt still has to ask for JSON",
      detailMD: `The API flag does not describe your business contract. You still need prompt instructions that say the response must be JSON and list the fields, allowed values, and constraints. OpenAI JSON mode is especially strict about this pattern: the request context should mention JSON, because otherwise the model may produce unhelpful whitespace until it hits the token limit or the API may reject the request on some surfaces.

A good prompt says more than return JSON. It describes the keys, types, enum values, missing-evidence behavior, and whether extra fields are allowed. This reduces schema drift, makes repair prompts easier, and gives the validator a clear target.`
    },
    {
      label: "Valid JSON is not the same as structured outputs",
      detailMD: `Structured outputs use a schema to constrain the generation more tightly. With strict structured output, the model is expected to produce data matching the schema: required fields, nested objects, arrays, enum values, and types. JSON mode only says the bytes should form valid JSON.

In an interview, this distinction is often the crux. If the task is low-risk extraction where you can tolerate occasional repair, JSON mode plus validation can be enough. If the output drives automation, payments, policy decisions, database writes, or user-visible state, structured outputs are usually the stronger default because the schema is part of the generation contract.`
    },
    {
      label: "Truncation can still create invalid or incomplete output",
      detailMD: `JSON mode cannot make an impossible token budget work. If max_tokens or max_output_tokens is too small, the model may be cut off in the middle of an object. Providers usually expose a finish reason such as length to indicate that generation stopped because the token limit was reached.

A robust client checks finish_reason before parsing. If the finish reason is length, treat the response as incomplete even if a partial prefix looks promising. Retry with a larger output budget, ask for a shorter object, or split the task into smaller calls. Do not pass a truncated object to a best-effort parser and hope it means the same thing.`
    },
    {
      label: "Parsing and schema validation are application responsibilities",
      detailMD: `After the call, parse with a real JSON parser and validate with a schema library. In Python, a Pydantic model can enforce required fields, field types, length limits, numeric ranges, and enum choices. In TypeScript, Zod can do the same before the result reaches application logic.

Validation should be explicit and observable. Log the prompt version, model, finish reason, parse error, validation error, and repair outcome. Then decide whether to retry, repair, fall back to a human-readable response, or fail closed. JSON mode is one layer in a reliability stack, not a substitute for typed boundaries.`
    },
    {
      label: "Repair is a recovery path, not the happy path",
      detailMD: `Sometimes a model returns prose wrapped around JSON, a fenced-looking block from a prompt habit, or a partial object from truncation. Recovery options include stripping text before the first opening brace and after the last closing brace, retrying the original request with clearer instructions, or sending a repair prompt that asks the model to convert the bad output into one valid object.

Repair should be bounded. Allow a small number of attempts, validate the repaired object, and stop if it still fails. Unlimited repair loops hide product bugs, increase cost, and can turn a simple extraction feature into a slow, unpredictable workflow.`
    }
  ],
  requestFlow: [
    {
      step: "1. Define the target object",
      detailMD: `Write the fields the application needs before writing the prompt. Include field names, types, allowed values, optionality, and maximum lengths. If you cannot define this contract, JSON mode will only give you a parseable version of ambiguity.`
    },
    {
      step: "2. Put JSON instructions in the prompt",
      detailMD: `Tell the model to return JSON only, with no prose before or after the object. Describe each key and the missing-data behavior. The syntax flag constrains the output format, but the prompt tells the model what the object should mean.`
    },
    {
      step: "3. Enable the provider JSON constraint",
      detailMD: `For OpenAI-compatible APIs, set response_format to json_object. For Gemini-style APIs, use a JSON response MIME type for syntax-only JSON or a response schema when you need stronger guarantees. For Anthropic-style workflows, prefer tool use or structured output patterns when a strict object is required, and otherwise prompt clearly and validate.`
    },
    {
      step: "4. Budget enough output tokens",
      detailMD: `Estimate the maximum size of the object, including nested arrays and citation strings. Keep fields concise and avoid asking for long explanations inside JSON. If the object might be large, paginate the task or split extraction from summarization.`
    },
    {
      step: "5. Check finish reason before parsing",
      detailMD: `If the provider reports length, max_tokens, or another token-limit finish reason, treat the output as truncated. Retry with a larger budget or a shorter requested object. Only parse after the response ended normally or with a provider-specific successful stop condition.`
    },
    {
      step: "6. Parse and validate",
      detailMD: `Use json.loads, JSON.parse, Pydantic, Zod, or an equivalent parser and validator. Reject missing keys, wrong types, unsupported enum values, and extra data if your downstream code cannot handle it. Validation errors should be handled before side effects occur.`
    },
    {
      step: "7. Retry, repair, or fall back",
      detailMD: `For parse failures or schema failures, retry once with the same contract or send a repair prompt containing the invalid output and the validation error. If repair fails, use a safe fallback such as manual review, a default object with explicit failure status, or a user-visible error.`
    },
    {
      step: "8. Log quality signals",
      detailMD: `Record prompt version, provider, model, response_format setting, finish reason, parse status, schema validation status, retry count, and final action. These signals reveal whether failures come from prompt drift, model changes, token budgets, or schema evolution.`
    }
  ],
  deepDives: [
    {
      label: "Provider differences matter",
      detailMD: `OpenAI JSON mode is commonly configured with response_format type json_object. Azure OpenAI follows the same pattern for supported models. Gemini supports JSON-oriented generation through response MIME type and can add response schemas for schema control. Anthropic workflows often use tool definitions or explicit prompting with validation rather than a syntax-only flag on every surface.

The portable design is to separate concerns: prompt for the object, request the strongest provider constraint available, parse with a standard parser, and validate in your code. This makes the application resilient when you switch models or providers.`
    },
    {
      label: "Schema drift is the main hidden failure",
      detailMD: `JSON mode can return a valid object that silently changes your contract. A field named priority can become urgency, a numeric confidence can become high, or citations can move from an array to a comma-separated string. These failures are dangerous because they parse successfully and then break business logic later.

Schema validation catches drift at the boundary. Treat validation failures as first-class outcomes, not rare exceptions. The validator should produce clear errors that can be sent to a repair prompt or used to improve the original prompt.`
    },
    {
      label: "Truncation is different from malformed output",
      detailMD: `Malformed output means the model finished but the text is not usable JSON or does not validate. Truncation means generation was forcibly stopped before the object completed. The recovery strategies differ. Malformed output can be repaired. Truncated output should usually be regenerated, because missing tail fields may change the meaning of the object.

Always inspect finish_reason. A partial object with a closing brace inserted by a repair routine may look valid, but it can hide missing evidence, incomplete arrays, or half-written strings. Increase the token budget or reduce the requested payload before trying semantic repair.`
    },
    {
      label: "Prompt clarity reduces repair cost",
      detailMD: `The best repair is the one you never need. List fields in the prompt in the same order your schema expects. Provide enum values directly. Tell the model what to do when information is missing, such as using null for optional fields or an explicit unknown label. Avoid asking for explanatory prose in the same response when downstream code expects only JSON.

Examples can help when the shape is unusual, but they also consume context. For beginner JSON mode tasks, a concise field contract and low temperature often matter more than many examples.`
    },
    {
      label: "Security and injection do not disappear",
      detailMD: `JSON mode does not stop prompt injection, data exfiltration attempts, or unsafe tool arguments. An attacker can still put malicious text inside a field value, or try to make the model output a dangerous action encoded as JSON. Treat model output as untrusted input until validated and authorized.

If the JSON object will trigger side effects, combine validation with allowlists, authorization checks, and human review for risky actions. Tool calling is often safer for action selection because the application owns the tool schema and execution policy.`
    }
  ],
  productionConsiderations: [
    {
      label: "Observability for every boundary",
      detailMD: `Log the response_format or equivalent provider setting, prompt version, model version, finish reason, parse result, validation result, retry count, and repair result. Aggregate these by use case so you can see whether one prompt or model is responsible for most JSON failures.`
    },
    {
      label: "Retry policy and fallback behavior",
      detailMD: `Use a bounded retry policy. A common pattern is one regeneration for truncation with a larger token budget, one repair attempt for malformed or wrapped output, and then a safe fallback. The fallback should be explicit: return a validation_error status, route to manual review, or ask the user to narrow the input.`
    },
    {
      label: "Cost and latency control",
      detailMD: `JSON mode usually has small overhead, but retries, repair calls, and overly large objects can double latency and token use. Keep JSON fields compact, avoid long natural-language explanations inside objects, and separate large summaries from strict extraction when needed.`
    },
    {
      label: "Compatibility and migration",
      detailMD: `Design the application so provider JSON mode is behind an adapter. The adapter can choose OpenAI response_format, Gemini response MIME type, Anthropic tool use, or structured outputs. Keep the application validator stable even if the provider feature changes.`
    }
  ],
  interview: {
    whatInterviewersLookFor: [
      "A crisp distinction between valid JSON syntax and schema-correct structured output.",
      "Knowledge of real provider controls such as OpenAI response_format json_object and equivalent JSON or schema settings elsewhere.",
      "A production flow that checks finish_reason, parses safely, validates with Pydantic or Zod, and handles repair or retry.",
      "Good judgment about when JSON mode is enough and when structured outputs or tool calling are safer."
    ],
    followUps: [
      {
        question: "If JSON mode guarantees valid JSON, why do we still need Pydantic or Zod?",
        answerMD: `Because valid JSON only means the text can be parsed. It says nothing about required fields, field names, types, enum values, ranges, or business invariants. Pydantic and Zod turn a parsed value into a typed contract and reject objects that would break downstream code.`
      },
      {
        question: "What should your client do when finish_reason is length?",
        answerMD: `Treat the response as truncated and incomplete. Do not try to use the partial object. Retry with a larger token budget, ask for a shorter response, or split the task into smaller calls. Only parse and validate after the model reaches a normal stop condition.`
      },
      {
        question: "Why does the prompt need to mention JSON if the API flag is enabled?",
        answerMD: `The flag constrains syntax, but it does not describe the fields or business meaning. The model still needs instructions to return JSON only and to use the expected keys, types, and missing-data rules. Some OpenAI-compatible surfaces also expect JSON to appear in the request context for JSON mode.`
      },
      {
        question: "When would you use tool calling instead of JSON mode?",
        answerMD: `Use tool calling when the model is deciding that the application should perform an action: search, send email, update a ticket, charge an account, or call an internal API. Tool definitions provide an action schema and let the application authorize and execute the side effect. JSON mode is better for passive extraction or formatting.`
      }
    ],
    alternativeDesigns: [
      {
        name: "Prompt-only JSON",
        detailMD: `The application asks for JSON in the prompt but does not enable a provider constraint. This is portable and can work for demos, but it is brittle because the model can return prose, markdown-style wrappers, or invalid syntax. Use it only for low-risk prototypes or providers with no stronger option, and always validate.`
      },
      {
        name: "JSON mode plus validation",
        detailMD: `The application enables syntax-level JSON mode, prompts for fields, parses the result, and validates with a schema. This is a practical default for beginner extraction tasks and for providers where full schema-constrained generation is unavailable or too restrictive.`
      },
      {
        name: "Structured outputs or tool calling",
        detailMD: `The application gives the model a schema or tool definition and expects responses that match it. This is the safer design for strict automation, nested objects, critical workflows, or side effects. It requires more upfront schema design but reduces repair code and ambiguous outputs.`
      }
    ],
    commonMistakes: [
      "Assuming JSON mode means the object matches the desired schema.",
      "Enabling response_format but forgetting to prompt for JSON and field names.",
      "Ignoring finish_reason length and trying to parse a truncated object.",
      "Using repaired JSON directly without validating it again."
    ]
  },
  interviewHints: [
    "Start by defining JSON mode as a syntax guarantee, not a schema guarantee.",
    "Mention the full pipeline: prompt, provider flag, finish_reason check, parse, validate, retry or repair.",
    "Contrast JSON mode with structured outputs and tool calling using risk and side effects.",
    "Call out truncation and schema drift as the failures that pass many demos but break production."
  ],
  playground: {
    descriptionMD: `This static playground shows a support-ticket extraction prompt using JSON mode. Notice that the prompt describes the object even though the parameters also request JSON syntax. The application would still parse and validate the response after the call.`,
    systemPrompt: `You are a careful support triage extractor.
Return JSON only. Do not include prose before or after the JSON object.
The JSON object must have summary, sentiment, priority, next_action, and confidence.
sentiment must be negative, neutral, or positive.
priority must be low, medium, or high.
confidence must be a number from 0 to 1.
If the ticket does not contain enough evidence, use neutral sentiment, low priority, and explain the uncertainty in next_action.`,
    userPrompt: `Ticket:
The customer says the invoice doubled after adding a workspace member. They are worried renewal is tomorrow and ask whether they will be charged twice. No account id is included.

Return the extraction object as JSON only.`,
    parameters: [
      { name: "model", value: "gpt-4.1-mini", note: "A small general model is enough for short extraction when the prompt and validator are strict." },
      { name: "temperature", value: "0", note: "Low randomness improves repeatability for structured extraction." },
      { name: "response_format", value: "json_object", note: "OpenAI-style JSON mode. It guarantees valid JSON syntax, not schema validity." },
      { name: "max_tokens", value: "220", note: "Large enough for the object, but still checked through finish_reason." }
    ],
    sampleOutputMD: `A valid response might be:

{
  "summary": "Customer worries an added workspace member doubled the invoice before renewal.",
  "sentiment": "negative",
  "priority": "medium",
  "next_action": "Check seat count and renewal invoice details, then explain whether duplicate billing will occur.",
  "confidence": 0.78
}

This parses as JSON, but production code should still validate that all fields exist, sentiment and priority use allowed values, and confidence is numeric.`
  },
  comparisons: [
    {
      title: "JSON mode versus stricter alternatives",
      columns: ["Approach", "Guarantee", "Best use", "Main risk"],
      rows: [
        ["Prompt-only JSON", "No hard syntax guarantee", "Prototype or unsupported provider", "Prose or invalid JSON may appear"],
        ["JSON mode", "Valid JSON syntax", "Low-risk extraction with validation", "Schema drift can parse successfully"],
        ["Structured outputs", "Schema-shaped response for supported schemas", "Automation that needs required fields and types", "Schema limitations and provider coupling"],
        ["Tool calling", "Arguments for a declared tool or action", "Choosing app actions or side effects", "Unsafe execution if authorization is weak"]
      ]
    },
    {
      title: "Failure modes and recovery",
      columns: ["Failure", "Signal", "Primary response", "Validation still needed"],
      rows: [
        ["Truncation", "finish_reason is length or token limit", "Retry with more tokens or shorter fields", "Yes, after regeneration"],
        ["Wrapped output", "Prose before or after JSON", "Strip to object or retry with JSON-only prompt", "Yes, before use"],
        ["Malformed JSON", "Parser raises JSON error", "Repair prompt or retry", "Yes, repaired output can drift"],
        ["Wrong schema", "Pydantic or Zod validation error", "Repair using validation error or fail closed", "Yes, this is the validation step"]
      ]
    },
    {
      title: "Provider guidance",
      columns: ["Provider pattern", "Syntax control", "Schema control", "Practical guidance"],
      rows: [
        ["OpenAI-compatible", "response_format json_object", "Structured outputs with strict schemas", "Use JSON mode for simple parseability, structured outputs for contracts"],
        ["Azure OpenAI", "OpenAI-compatible response_format on supported deployments", "Structured outputs where supported", "Keep deployment capability checks in the provider adapter"],
        ["Gemini", "JSON response MIME type", "Response schema", "Use MIME type for syntax, schema for typed extraction"],
        ["Anthropic-style", "Prompting or tool-use pattern depending on API surface", "Tool definitions and structured output patterns", "Prefer tools or schemas for strict objects, validate either way"]
      ]
    }
  ],
  decisionGuideMD: `## Choosing the right output contract

Use **JSON mode** when you need a parseable object, the shape is simple, the task is low risk, and your application already validates and can repair failures. It is a good beginner default for extraction, classification, routing metadata, and compact summaries.

Use **structured outputs** when the response must match a known schema before it reaches business logic. Choose this for required fields, nested objects, enums, numeric ranges, database writes, workflow state, or user-visible automation where schema drift would be expensive.

Use **tool calling** when the model is selecting an action for the application to execute. Tool calling is not just JSON formatting; it is an action boundary. The application should authorize the tool, validate arguments, execute the side effect, and return the result to the model if another step is needed.

Use **plain prompt-only JSON** only when the provider has no better mechanism or the task is a quick prototype. Even then, parse and validate. Never let unvalidated model JSON directly update state, trigger side effects, or bypass authorization.

For interviews, answer with a layered design: prompt for JSON, enable the provider constraint, check finish_reason, parse, validate with a schema, retry or repair once, log outcomes, and choose structured outputs or tools when risk increases.`,
  handsOn: [
    {
      title: "Request JSON mode, parse, validate, and repair",
      detailMD: `This example uses OpenAI-style JSON mode for syntax, then Pydantic for the actual schema. The repair path is only used after parsing or validation fails, and the repaired result is validated again before use.`,
      code: {
        language: "python",
        label: "json_mode_triage.py",
        body: `import json
from typing import Literal
from openai import OpenAI
from pydantic import BaseModel, Field, ValidationError

client = OpenAI()

class TicketTriage(BaseModel):
    summary: str = Field(min_length=1, max_length=140)
    sentiment: Literal["negative", "neutral", "positive"]
    priority: Literal["low", "medium", "high"]
    next_action: str = Field(min_length=1, max_length=200)
    confidence: float = Field(ge=0, le=1)

def call_json_mode(task_text, max_tokens):
    system_prompt = (
        "You extract support ticket triage data. Return JSON only. "
        + "Use the fields summary, sentiment, priority, next_action, and confidence. "
        + "sentiment must be negative, neutral, or positive. "
        + "priority must be low, medium, or high. "
        + "confidence must be a number from 0 to 1."
    )
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": task_text}
        ],
        response_format={"type": "json_object"},
        temperature=0,
        max_tokens=max_tokens
    )
    choice = response.choices[0]
    if choice.finish_reason == "length":
        raise RuntimeError("The JSON object was truncated by the token limit.")
    return choice.message.content

def extract_json_object(text):
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start == -1 or end == -1 or end <= start:
            raise
        return json.loads(text[start:end + 1])

def validate_triage(text):
    data = extract_json_object(text)
    return TicketTriage.model_validate(data)

def repair_output(bad_output, error_message):
    repair_prompt = (
        "Repair this into one valid JSON object. Return JSON only. "
        + "The required fields are summary, sentiment, priority, next_action, and confidence. "
        + "Validation error: " + error_message + "\\nBad output:\\n" + bad_output
    )
    repaired = call_json_mode(repair_prompt, 300)
    return validate_triage(repaired)

ticket = (
    "The invoice doubled after I added a workspace member. "
    + "Renewal is tomorrow and I need to know if I will be charged twice."
)

raw_output = ""
try:
    raw_output = call_json_mode("Ticket: " + ticket, 220)
    result = validate_triage(raw_output)
except RuntimeError:
    raw_output = call_json_mode("Ticket: " + ticket + "\\nUse short field values.", 400)
    result = validate_triage(raw_output)
except (json.JSONDecodeError, ValidationError) as exc:
    result = repair_output(raw_output, str(exc))

print(json.dumps(result.model_dump(), indent=2))`
      }
    },
    {
      title: "Add small recovery helpers around a JSON response",
      detailMD: `This helper layer is provider-neutral. It separates truncation handling, wrapper stripping, and schema validation so failures are observable instead of being hidden in one broad exception.`,
      code: {
        language: "python",
        label: "json_recovery_helpers.py",
        body: `import json

class JsonModeError(Exception):
    pass

def ensure_not_truncated(finish_reason):
    if finish_reason == "length" or finish_reason == "max_tokens":
        raise JsonModeError("The model stopped because the output token limit was reached.")

def load_possible_wrapped_json(text):
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start < 0 or end < 0 or end <= start:
            raise
        return json.loads(text[start:end + 1])

def require_keys(data, keys):
    missing = []
    for key in keys:
        if key not in data:
            missing.append(key)
    if missing:
        raise JsonModeError("Missing required keys: " + ", ".join(missing))

def parse_ticket_object(text, finish_reason):
    ensure_not_truncated(finish_reason)
    data = load_possible_wrapped_json(text)
    require_keys(data, ["summary", "priority", "next_action"])
    if data["priority"] not in ["low", "medium", "high"]:
        raise JsonModeError("priority must be low, medium, or high")
    return data

sample_text = "Result: {\\"summary\\": \\"Billing concern\\", \\"priority\\": \\"medium\\", \\"next_action\\": \\"Check renewal invoice\\"}"
parsed = parse_ticket_object(sample_text, "stop")
print(parsed["priority"] + ": " + parsed["next_action"])`
      }
    }
  ],
  quiz: [
    {
      question: "What does JSON mode primarily guarantee?",
      options: [
        "The response is syntactically valid JSON",
        "The response matches your full business schema",
        "The model will call the correct external tool",
        "The response cannot contain unsafe user data"
      ],
      answerIndex: 0,
      explanationMD: `JSON mode is a syntax guarantee. It makes the output parseable as JSON, but schema and safety still need application validation.`
    },
    {
      question: "Why should the prompt still describe the desired JSON fields?",
      options: [
        "Because the JSON flag only constrains syntax and does not define business meaning",
        "Because JSON parsers require field descriptions in natural language",
        "Because schema validation is impossible after a model call",
        "Because tool calling cannot return structured data"
      ],
      answerIndex: 0,
      explanationMD: `The provider flag does not know your required keys, enum values, or missing-data behavior. The prompt must state the object contract clearly.`
    },
    {
      question: "What should you do when finish_reason indicates length?",
      options: [
        "Assume the object is complete if it starts with an opening brace",
        "Try to close the object yourself and use it immediately",
        "Treat it as truncated and retry with more tokens or a shorter requested object",
        "Ignore validation because JSON mode was enabled"
      ],
      answerIndex: 2,
      explanationMD: `A length finish reason means the output token limit stopped generation. Regenerate with a better budget or smaller object before parsing and validating.`
    },
    {
      question: "Which failure can pass JSON parsing but still break the application?",
      options: [
        "A required field is renamed from priority to urgency",
        "The response contains no opening brace",
        "The transport request times out before a response arrives",
        "The model refuses to produce any output"
      ],
      answerIndex: 0,
      explanationMD: `A renamed field can still be valid JSON, but it violates the application schema. This is why validation is required after parsing.`
    },
    {
      question: "When are structured outputs usually preferable to JSON mode?",
      options: [
        "When strict schema adherence is required for automation or state changes",
        "When the result is a casual paragraph for a human reader",
        "When no fields are known in advance",
        "When validation will never run"
      ],
      answerIndex: 0,
      explanationMD: `Structured outputs are stronger when the schema is known and failures would be costly. JSON mode is lighter but needs repair and validation code.`
    },
    {
      question: "When is tool calling a better fit than JSON mode?",
      options: [
        "When the model should choose an application action with validated arguments",
        "When you only need a short human-readable summary",
        "When you want to avoid authorization checks",
        "When JSON parsing is not needed anywhere"
      ],
      answerIndex: 0,
      explanationMD: `Tool calling is designed for action selection and arguments. The application still validates and authorizes the call before executing side effects.`
    }
  ],
  flashcards: [
    { front: "What is JSON mode?", back: "A provider feature that constrains model output to syntactically valid JSON." },
    { front: "What does JSON mode not guarantee?", back: "It does not guarantee required fields, names, types, enums, or business schema compliance." },
    { front: "What is the OpenAI-style JSON mode parameter?", back: "response_format with type json_object on supported OpenAI-compatible APIs." },
    { front: "Why mention JSON in the prompt?", back: "The flag constrains syntax, but the prompt defines the desired fields and behavior." },
    { front: "What does finish_reason length mean?", back: "The output was cut off by the token limit and should be regenerated with more budget or a smaller object." },
    { front: "What should happen after JSON parsing?", back: "Validate the parsed value with a schema library such as Pydantic or Zod before use." },
    { front: "When should you prefer structured outputs?", back: "When strict schema adherence is required for automation, state changes, or critical workflows." },
    { front: "When should you prefer tool calling?", back: "When the model is selecting an application action and supplying arguments for code to execute." }
  ],
  cheatSheetMD: `## JSON mode cheat sheet

### Core idea
- JSON mode constrains the response to valid JSON syntax.
- It does not guarantee your schema.
- The prompt must still say return JSON and describe fields, types, allowed values, and missing-data behavior.
- OpenAI-compatible APIs commonly use response_format with type json_object.
- Other providers may use a JSON MIME type, response schema, tool use, or prompt-plus-validation depending on the API.

### Safe client flow
1. Define the target object and validator first.
2. Prompt for JSON only and list the required fields.
3. Enable the strongest provider output constraint available.
4. Set a realistic output token budget.
5. Check finish_reason before parsing.
6. Parse with a real JSON parser.
7. Validate with Pydantic, Zod, or an equivalent schema library.
8. Retry truncation, repair malformed or wrapped output, and fail closed after bounded attempts.
9. Log prompt version, model, provider setting, finish reason, parse result, validation result, and retry count.

### Recovery rules
- **finish_reason length**: regenerate with more tokens or a shorter object.
- **Wrapped JSON**: strip text outside the first complete object only as a recovery step, then validate.
- **Malformed JSON**: retry or ask the model to repair into one JSON object.
- **Schema validation error**: repair using the validation message or fail closed.
- **Repeated failure**: route to manual review or return an explicit validation_error state.

### Decision guide
- Use **JSON mode** for simple parseable extraction with validation.
- Use **structured outputs** when required fields, nested schemas, enums, or state changes matter.
- Use **tool calling** when the model chooses an action for the application to execute.
- Use **prompt-only JSON** only for low-risk prototypes or provider gaps.

### Interview answer shape
1. Define JSON mode as syntax-only.
2. Contrast it with structured outputs.
3. Explain the prompt requirement.
4. Mention truncation and finish_reason length.
5. Describe parsing, schema validation, retry, repair, and fallback.
6. End with when to choose JSON mode, structured outputs, or tool calling.`,
  references: [
    { title: "OpenAI Structured Outputs and JSON Mode Guide", kind: "Docs", url: "https://platform.openai.com/docs/guides/structured-outputs", author: "OpenAI" },
    { title: "OpenAI Chat Completions API Reference", kind: "Docs", url: "https://platform.openai.com/docs/api-reference/chat", author: "OpenAI" },
    { title: "Gemini Structured Output Documentation", kind: "Docs", url: "https://ai.google.dev/gemini-api/docs/structured-output", author: "Google AI" },
    { title: "Anthropic Tool Use Documentation", kind: "Docs", url: "https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview", author: "Anthropic" }
  ],
  relatedLessons: [
    { slug: "structured-outputs", note: "Shows how schema-constrained generation strengthens the guarantees beyond JSON syntax." },
    { slug: "function-and-tool-calling", note: "Explains when a JSON-like object should become validated tool arguments for an action." },
    { slug: "output-guardrails-and-validation", note: "Covers validators, retries, repair, and fail-closed behavior after model output." },
    { slug: "calling-the-openai-api", note: "Connects JSON mode to the practical API request and response handling flow." }
  ]
};
