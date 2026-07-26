import type { GenAILessonContent } from "../types";

export const promptEngineeringFoundationsContent: GenAILessonContent = {
  slug: "prompt-engineering-foundations",
  introductionMD: `Prompt engineering is the discipline of turning an intention into instructions a language model can reliably follow. It is not magic wording. It is requirements engineering for probabilistic systems: define the task, provide the right context, constrain the answer, and make success easy to judge.

In interviews, prompt engineering is often used to test whether a candidate understands how LLM applications actually behave in production. A strong answer separates roles, context, examples, input, and output format; explains zero-shot and few-shot prompting; and calls out failure modes such as conflicting instructions, stale facts, and prompt injection.

The practical goal is repeatability. A good prompt should work on more than one happy-path example, be easy to evaluate, and be versioned like any other product artifact. This lesson gives you a framework for designing prompts that are clear, grounded, testable, and safe enough to sit inside a real AI feature.`,
  realWorldMD: `Prompt engineering appears anywhere an application asks an LLM to transform, classify, summarize, reason, or converse.

- Support copilots use prompts to define tone, escalation rules, and citation requirements.
- RAG systems use prompts to separate trusted retrieved context from user instructions.
- Coding assistants use system prompts, examples, and tool rules to keep responses actionable.
- Data extraction pipelines use JSON schemas, constraints, and validation to reduce brittle outputs.
- Evaluation teams treat prompts as versioned artifacts and test them across representative cases before release.`,
  learningObjectives: [
    "Identify the parts of a strong prompt: roles, instructions, context, examples, input, and output format.",
    "Choose between zero-shot, few-shot, role prompting, delimiters, structured output, and explicit constraints.",
    "Use reasoning prompts, concise rationale requests, self-consistency, and reasoning models appropriately.",
    "Reduce ambiguity by decomposing tasks, giving examples, defining success criteria, and allowing I do not know.",
    "Recognize common prompt failures such as vague instructions, conflicts, overstuffed context, and private fact assumptions.",
    "Ground prompts with trusted context and delimiters while accounting for prompt injection risk."
  ],
  theory: [
    {
      label: "A prompt is a structured contract, not a sentence",
      detailMD: `A production prompt usually has several parts. The **system** role defines durable behavior and boundaries. The **user** role carries the current request and task-specific input. The **assistant** role can provide prior examples in a conversation or represent model outputs that become context for later turns.

Within those roles, a strong prompt separates instructions, background context, examples, the actual input, and the required output format. This separation matters because it reduces ambiguity and makes it easier to test which part caused a failure. If the prompt is one long paragraph, debugging becomes guesswork.`
    },
    {
      label: "Roles define priority and conversation state",
      detailMD: `System messages should hold stable rules: identity, safety boundaries, style, tool policy, and what to do when evidence is missing. User messages should hold the immediate task, user-provided data, and any fresh constraints. Assistant messages represent prior model outputs and should be treated as conversational state, not a place to hide permanent policy.

This priority model is central to prompt injection defense. A user can ask the model to ignore instructions, but the application should put trusted policy in a higher-priority role and put untrusted content inside clearly labeled context. Good role design does not eliminate attacks, but it makes the desired hierarchy explicit.`
    },
    {
      label: "Zero-shot, few-shot, and in-context learning",
      detailMD: `In **zero-shot prompting**, you give the task and constraints but no examples. It works well for familiar tasks such as summarization, classification, or rewriting when the expected style is simple. It is fast to author and cheaper in tokens, but it can be underspecified.

In **few-shot prompting**, you include examples of inputs and ideal outputs. The model learns the pattern from context without updating its weights, which is called in-context learning. Few-shot examples are especially useful when the output style, edge cases, labels, or formatting rules are hard to describe abstractly.`
    },
    {
      label: "Specificity beats clever wording",
      detailMD: `Specific prompts reduce the search space. Name the audience, task, constraints, evidence source, acceptable assumptions, output shape, and success criteria. If the answer should be JSON, list the fields. If uncertainty is acceptable, tell the model to say I do not know when the provided context is insufficient.

Ambiguous prompts force the model to infer the missing requirements from pretraining and conversation context. That can look helpful in a demo, but it is fragile in production. The more important the task, the more the prompt should make hidden requirements explicit.`
    },
    {
      label: "Reasoning prompts and reasoning models",
      detailMD: `For multi-step work, asking the model to think step by step can improve planning and reduce skipped steps. In production, however, it is often better to ask for a concise rationale, checklist, or final answer with key assumptions rather than a full chain of thought. Full reasoning traces can be verbose, misleading, or inappropriate to expose to end users.

Use reasoning-capable models when the task requires long planning, mathematical proof, multi-hop analysis, or careful tradeoff evaluation. Prompting a smaller non-reasoning model to reason harder cannot fully replace a model trained and served for deeper reasoning. Self-consistency, where you sample several reasoning paths and choose the most common or best-supported answer, can help on hard questions at higher cost.`
    },
    {
      label: "Grounding and delimiters reduce hallucination risk",
      detailMD: `Grounding means telling the model which source of information is authoritative for the current answer. In a RAG prompt, the retrieved passages are the evidence, not the model memory. Clear delimiters around evidence, user input, and examples help the model avoid blending instructions with data.

Delimiters are not a security boundary by themselves. A retrieved document can still contain prompt injection text such as instructions to ignore the system message. The application should combine delimiters with role separation, retrieval filtering, output validation, and explicit instructions to treat retrieved text as data rather than commands.`
    }
  ],
  requestFlow: [
    {
      step: "1. Define the job",
      detailMD: `Start by writing the task in one concrete sentence. Decide whether the model is summarizing, extracting, classifying, planning, critiquing, or generating. A prompt that mixes several jobs without priority is harder to follow and harder to evaluate.`
    },
    {
      step: "2. Set role and boundaries",
      detailMD: `Put stable behavior in the system prompt: the model role, tone, forbidden actions, source-of-truth rules, and uncertainty behavior. Keep it short enough that the model can follow it, but specific enough to prevent hidden assumptions.`
    },
    {
      step: "3. Provide context with labels and delimiters",
      detailMD: `Add only the context needed for the task and label it clearly. Separate policy, examples, retrieved evidence, and user input. Overstuffed context can bury the important facts, increase cost, and create conflicts the model must guess how to resolve.`
    },
    {
      step: "4. Add examples when the pattern matters",
      detailMD: `Use few-shot examples when the target output has a special style, label taxonomy, edge-case behavior, or strict schema. Choose examples that cover normal and tricky cases. Bad examples teach the wrong behavior more powerfully than vague prose.`
    },
    {
      step: "5. Specify output format and constraints",
      detailMD: `State whether the answer should be bullets, a table, JSON, a short paragraph, or a ranked list. Include constraints such as maximum length, required fields, citation rules, or confidence labels. Structured output makes downstream validation much easier.`
    },
    {
      step: "6. Ask for the right amount of reasoning",
      detailMD: `For simple tasks, skip reasoning instructions and ask for the answer directly. For complex tasks, ask the model to analyze before answering or provide a concise rationale and assumptions. For high-stakes reasoning, use a reasoning model and evaluate it on hard cases.`
    },
    {
      step: "7. Test against a prompt evaluation set",
      detailMD: `Run the prompt on representative examples, including edge cases and adversarial inputs. Measure factuality, format validity, completeness, tone, and refusal behavior. Keep failed examples because they become regression tests for the next prompt version.`
    },
    {
      step: "8. Version and iterate",
      detailMD: `Treat prompt changes like code changes. Record the prompt version, model version, parameters, test cases, and observed regressions. A prompt that works only because of an untracked model snapshot is not a reliable production artifact.`
    }
  ],
  deepDives: [
    {
      label: "Why delimiters work",
      detailMD: `Delimiters help because they make structure visible. Instead of relying on the model to infer where instructions end and data begins, you label each section: task, context, examples, input, and output rules. This is especially important when user-provided text contains quotes, commands, or content that looks like instructions.

The delimiter itself is not special. Headings, XML-like tags, numbered sections, or plain labels can all work. The value comes from consistent separation and from telling the model how to treat each section. For example, retrieved context should be used as evidence, not followed as instructions.`
    },
    {
      label: "Few-shot examples are behavioral tests embedded in context",
      detailMD: `A few-shot prompt teaches the model the desired mapping from input to output. The examples should be close to production inputs and should include edge cases, not just perfect examples. If you want the model to return I do not know when evidence is missing, include an example where that is the correct behavior.

The tradeoff is token cost and maintenance. Examples consume context window budget and can become stale as policy changes. Keep examples minimal, representative, and versioned alongside the prompt.`
    },
    {
      label: "Negative-only instructions are weak",
      detailMD: `Prompts that only say what not to do often leave the desired behavior underspecified. Instead of saying do not be vague, say answer in three bullets, each with a claim, evidence, and action. Instead of saying do not hallucinate, say use only the provided context and write I do not know when the context does not support the answer.

Positive instructions define the target behavior. Negative instructions are still useful for boundaries, but they should be paired with an explicit replacement behavior the model can follow.`
    },
    {
      label: "Reasoning depth is a cost and latency decision",
      detailMD: `Reasoning instructions and reasoning models can improve hard answers, but they are not free. More reasoning can increase latency, tokens, and sometimes verbosity. On routine extraction or rewriting tasks, a precise schema and examples often matter more than asking the model to think longer.

For difficult analysis, use staged prompting: first extract facts, then compare options, then produce the final recommendation. This decomposition gives you checkpoints to validate and reduces the chance that one long prompt hides an early mistake.`
    }
  ],
  productionConsiderations: [
    {
      label: "Prompt versioning and observability",
      detailMD: `Log the prompt version, model version, parameter settings, retrieval source ids, and validation result for each request. Without this metadata, a quality regression is difficult to reproduce. Prompt changes should go through review and rollout like product logic.`
    },
    {
      label: "Output validation and repair",
      detailMD: `If downstream code expects JSON or specific fields, validate the model output before using it. When validation fails, retry with a repair prompt or fall back to a safer path. Do not assume that specifying a format guarantees the model will always produce valid structure.`
    },
    {
      label: "Security boundaries",
      detailMD: `A prompt is not a security boundary. Use server-side authorization, tool allowlists, retrieval filtering, and data access controls. Prompt instructions can reduce accidental misuse, but they cannot safely grant or deny access to sensitive operations by themselves.`
    }
  ],
  interview: {
    whatInterviewersLookFor: [
      "A clear decomposition of prompt anatomy: roles, instructions, context, examples, input, and output format.",
      "Ability to choose zero-shot, few-shot, role prompting, delimiters, and structured output based on the task.",
      "Awareness that grounding, citations, and I do not know behavior reduce hallucination but do not eliminate it.",
      "Production instincts: prompt versioning, evaluation sets, output validation, and prompt injection risk."
    ],
    followUps: [
      {
        question: "When would you use few-shot prompting instead of zero-shot prompting?",
        answerMD: `Use few-shot prompting when the desired behavior is hard to describe with rules alone: a custom label taxonomy, a strict style, edge-case handling, or a specialized output pattern. Use zero-shot when the task is common, the format is simple, and examples would add token cost without improving reliability.`
      },
      {
        question: "How do you reduce hallucinations in a prompt?",
        answerMD: `Ground the answer in trusted context, label that context clearly, require citations or evidence references, and instruct the model to say I do not know when the context is insufficient. Then validate the output and evaluate against cases where the right answer is unknown. Prompting helps, but model choice and retrieval quality also matter.`
      },
      {
        question: "Should you ask a model to show its full chain of thought?",
        answerMD: `Usually no. For complex tasks, ask the model to reason carefully internally and provide the final answer with a concise rationale, assumptions, or checklist. If the task truly needs deeper reasoning, choose a reasoning model and evaluate it. Exposing long reasoning traces can be noisy, misleading, and unnecessary for users.`
      }
    ],
    alternativeDesigns: [
      {
        name: "Prompt-only workflow",
        detailMD: `The application sends one well-structured prompt and uses the result directly. This is simple and cheap, and it works well for low-risk summarization or rewriting. It becomes fragile when tasks require private data, tool calls, strict schemas, or multi-step verification.`
      },
      {
        name: "Prompt plus programmatic guardrails",
        detailMD: `The application combines prompts with retrieval, tool permissions, schema validation, retries, evaluation, and monitoring. This is the usual production design because it treats the model as one probabilistic component inside a deterministic system.`
      }
    ],
    commonMistakes: [
      "Writing vague prompts such as summarize this without audience, length, source, or success criteria.",
      "Putting conflicting instructions in different sections and expecting the model to infer the true priority.",
      "Adding huge amounts of context without ranking or delimiting the parts that matter.",
      "Assuming the model knows private company facts, current data, or user-specific policy without providing it."
    ]
  },
  interviewHints: [
    "Start with anatomy: system role, user task, context, examples, input, and output format.",
    "Name the main techniques and tie each one to when you would use it.",
    "Call out hallucination and prompt injection as production risks, not just model quirks.",
    "End with evaluation: prompts should be versioned and tested against examples."
  ],
  playground: {
    descriptionMD: `This static example contrasts a vague request with a structured prompt that defines role, evidence, output format, uncertainty behavior, and evaluation-friendly constraints.`,
    systemPrompt: `You are a careful customer-support analyst.
Use only the customer note provided by the user.
If the note does not contain enough evidence, write I do not know from the provided note.
Return concise JSON with the fields summary, customer_sentiment, likely_issue, next_action, and confidence.`,
    userPrompt: `Task: Analyze the customer note.

Customer note:
I upgraded yesterday and now my invoice shows two workspace seats. I only have one employee using the product. The billing page says the change renews tomorrow, and I need to know whether I will be charged twice.

Output rules:
- Keep summary under 25 words.
- confidence must be one of low, medium, or high.
- Do not invent policy details that are not in the note.`,
    parameters: [
      { name: "model", value: "reasoning-light", note: "A lower-cost model is enough for short extraction with clear evidence." },
      { name: "temperature", value: "0.2", note: "Low randomness improves repeatability for support triage." },
      { name: "max_output_tokens", value: "220", note: "The JSON response is intentionally small." },
      { name: "response_format", value: "json_object", note: "The application should still validate the result." }
    ],
    sampleOutputMD: `A vague prompt such as Analyze this customer message might produce a friendly paragraph but miss the billing ambiguity.

The structured prompt makes the desired response testable:

{
  "summary": "Customer sees two workspace seats after upgrading and worries about being charged twice.",
  "customer_sentiment": "concerned",
  "likely_issue": "Possible billing or seat-count confusion after an upgrade.",
  "next_action": "Check the account seat count and renewal billing details before confirming the charge.",
  "confidence": "medium"
}

The answer avoids inventing the billing policy because the note does not prove whether the customer will be charged twice.`
  },
  comparisons: [
    {
      title: "Prompting techniques and when to use them",
      columns: ["Technique", "Best use", "Strength", "Risk"],
      rows: [
        ["Zero-shot", "Common tasks with simple formats", "Low token cost and fast authoring", "Can be underspecified"],
        ["Few-shot", "Custom labels, style, or edge cases", "Teaches the pattern in context", "Examples consume context and can go stale"],
        ["Role prompting", "Tone, expertise, or operating mode", "Sets expectations quickly", "Persona cannot replace facts or policy"],
        ["Structured output", "Extraction and automation", "Easy to validate downstream", "Still needs schema validation"],
        ["Reasoning prompt", "Multi-step analysis", "Reduces skipped steps", "Can increase latency and verbosity"]
      ]
    },
    {
      title: "Prompt sections",
      columns: ["Section", "What it contains", "Where it belongs", "Common failure"],
      rows: [
        ["System role", "Stable behavior, boundaries, uncertainty rules", "System message", "Too long or internally conflicting"],
        ["Context", "Trusted facts, retrieved passages, policy snippets", "Labeled context block", "Untrusted text treated as instructions"],
        ["Examples", "Input-output pairs showing the pattern", "Before the live input", "Examples do not cover edge cases"],
        ["Input", "The current user data or task payload", "Clearly delimited user section", "Mixed with instructions or context"],
        ["Output format", "Fields, length, citations, schema, tone", "Explicit final instructions", "Format not validated after generation"]
      ]
    },
    {
      title: "Common prompt pitfalls",
      columns: ["Pitfall", "Symptom", "Better approach"],
      rows: [
        ["Vague instruction", "Model gives generic or overly broad output", "Define audience, objective, constraints, and success criteria"],
        ["Conflicting instructions", "Model follows one rule and violates another", "Remove conflicts and state priority in the system prompt"],
        ["Overstuffed context", "Important facts are ignored or blended", "Rank, trim, and label context sections"],
        ["Negative-only rules", "Model avoids one behavior but chooses another bad one", "State the desired replacement behavior"],
        ["Private fact assumption", "Model invents internal policy or current facts", "Provide the facts or require I do not know"]
      ]
    }
  ],
  decisionGuideMD: `## Choosing a prompting approach

Use **zero-shot** when the task is familiar, the answer format is simple, and failures are low risk. Add exact output rules if the result feeds another system.

Use **few-shot** when examples communicate the target behavior better than prose. Include one normal example, one edge case, and one missing-evidence case when uncertainty matters.

Use **structured output** when software will parse the response. Specify the fields, allowed values, and length limits, then validate the output outside the model.

Use **grounded prompting** when factual accuracy matters. Provide trusted context, label it as evidence, require citations or evidence-based wording, and allow I do not know.

Use **reasoning models or staged prompts** when the task needs planning, tradeoff analysis, math, or multi-hop reasoning. For routine extraction, prefer simpler prompts with strong schemas and examples.

Use **prompt plus guardrails** for production. The prompt should guide behavior, while code enforces access control, schema validation, logging, evaluation, and safe fallbacks.`,
  handsOn: [
    {
      title: "Rewrite a vague prompt into a testable prompt",
      detailMD: `Take a vague request and add the missing contract: task, audience, evidence, constraints, and output format. The goal is not to make the prompt longer; it is to make the expected behavior observable.`,
      code: {
        language: "python",
        label: "prompt_builder.py",
        body: `def build_incident_prompt(audience, incident_note):
    sections = []
    sections.append("Task: Rewrite the incident note for " + audience + ".")
    sections.append("Use only the incident note as evidence.")
    sections.append("If a fact is missing, write I do not know from the provided note.")
    sections.append("Output format:")
    sections.append("1. One-sentence summary")
    sections.append("2. Customer impact")
    sections.append("3. Known cause")
    sections.append("4. Next action")
    sections.append("Incident note:")
    sections.append(incident_note)
    return "\\n".join(sections)

note = "Checkout errors increased after the 09:00 deploy. Rollback started at 09:20."
print(build_incident_prompt("a non-technical support lead", note))`
      }
    },
    {
      title: "Create a small prompt regression set",
      detailMD: `A prompt should be tested against examples before it ships. This simple harness tracks expected output properties instead of relying on one demo result.`,
      code: {
        language: "python",
        label: "prompt_eval_cases.py",
        body: `cases = [
    {
        "id": "supported-answer",
        "input": "Policy says refunds are available within 30 days.",
        "must_include": ["30 days"],
        "must_not_include": ["lifetime"]
    },
    {
        "id": "missing-evidence",
        "input": "The note mentions a refund but gives no policy window.",
        "must_include": ["I do not know"],
        "must_not_include": ["30 days"]
    }
]

def check_output(output, case):
    for text in case["must_include"]:
        if text not in output:
            return False
    for text in case["must_not_include"]:
        if text in output:
            return False
    return True

example_outputs = {
    "supported-answer": "Refunds are available within 30 days.",
    "missing-evidence": "I do not know from the provided note."
}

for case in cases:
    result = check_output(example_outputs[case["id"]], case)
    print(case["id"] + ": " + str(result))`
      }
    }
  ],
  quiz: [
    {
      question: "Which set of parts best describes a strong production prompt?",
      options: [
        "A clever phrase, a high temperature, and a long output",
        "Roles, instructions, context, examples, input, and output format",
        "Only a persona and a request to be creative",
        "A list of negative instructions with no desired behavior"
      ],
      answerIndex: 1,
      explanationMD: `A strong prompt separates the contract into roles, instructions, context, examples, live input, and output format so behavior can be tested and debugged.`
    },
    {
      question: "When is few-shot prompting most useful?",
      options: [
        "When examples show a custom pattern or edge-case behavior better than prose",
        "When the model should ignore all context",
        "When the task has no repeated structure",
        "When token cost must be minimized above all else"
      ],
      answerIndex: 0,
      explanationMD: `Few-shot examples demonstrate the desired input-output mapping in context, which is valuable for specialized labels, formats, tone, and edge cases.`
    },
    {
      question: "What is the best prompt behavior when the provided context does not support an answer?",
      options: [
        "Infer the missing fact from general model knowledge",
        "Make the answer sound less certain but still guess",
        "Say I do not know from the provided context when that rule is part of the prompt",
        "Ask the user to ignore the missing evidence"
      ],
      answerIndex: 2,
      explanationMD: `Allowing I do not know gives the model a safe out and reduces pressure to invent unsupported facts.`
    },
    {
      question: "Why are delimiters useful in prompts?",
      options: [
        "They guarantee complete security against prompt injection",
        "They make section boundaries clear so instructions, examples, context, and input are less likely to blend",
        "They increase the model parameter count",
        "They replace the need for output validation"
      ],
      answerIndex: 1,
      explanationMD: `Delimiters clarify structure, especially when untrusted input contains text that looks like instructions. They help but do not replace real security controls.`
    },
    {
      question: "What is a good production practice for prompt changes?",
      options: [
        "Change prompts directly in production without tracking versions",
        "Only test prompts on the easiest success case",
        "Version prompts and evaluate them against representative and adversarial examples",
        "Rely on the model to keep the same behavior forever"
      ],
      answerIndex: 2,
      explanationMD: `Prompts are product logic. Versioning and evaluation make changes reproducible and help catch regressions before rollout.`
    },
    {
      question: "When should you consider a reasoning model instead of only adding think step by step to a prompt?",
      options: [
        "For every short rewriting task",
        "When the task requires long planning, multi-hop reasoning, math, or careful tradeoff analysis",
        "When the prompt has no output format",
        "When you want to avoid all evaluation"
      ],
      answerIndex: 1,
      explanationMD: `Reasoning models are better suited for genuinely complex reasoning tasks. For routine extraction, clear schemas and examples are usually more important.`
    }
  ],
  flashcards: [
    { front: "What are the main parts of a prompt?", back: "Roles, instructions, context, examples, live input, and output format." },
    { front: "What belongs in the system role?", back: "Stable behavior such as role, boundaries, source-of-truth rules, tone, and uncertainty behavior." },
    { front: "What is zero-shot prompting?", back: "Asking for the task directly without examples, relying on the model general capability and the prompt instructions." },
    { front: "What is few-shot prompting?", back: "Providing input-output examples so the model learns the desired pattern in context." },
    { front: "Why specify JSON or another structured format?", back: "Structured output is easier for downstream software to validate, parse, and test." },
    { front: "What is grounding?", back: "Providing trusted context and instructing the model to base the answer on that evidence." },
    { front: "What is a prompt injection risk?", back: "Untrusted text may contain instructions that try to override the application prompt or misuse tools." },
    { front: "Why version prompts?", back: "Prompt behavior changes with wording, models, parameters, and context, so versions make evaluation and rollback possible." }
  ],
  cheatSheetMD: `## Prompt engineering cheat sheet

### Anatomy
- **System role**: stable behavior, policy, tone, tool boundaries, uncertainty rules.
- **User role**: current task, input, fresh constraints, user-specific context.
- **Assistant role**: prior responses or examples in the conversation.
- **Instructions**: what to do and what success means.
- **Context**: trusted facts or retrieved evidence.
- **Examples**: input-output pairs that demonstrate the desired pattern.
- **Output format**: JSON, bullets, table, labels, citations, length limits.

### Core techniques
- **Zero-shot**: use for simple, familiar tasks.
- **Few-shot**: use when examples define the pattern better than rules.
- **Role prompting**: set expertise, tone, and operating mode.
- **Delimiters**: separate instructions, context, examples, and input.
- **Structured output**: make downstream validation possible.
- **Constraints**: specify length, allowed values, citations, and success criteria.
- **Reasoning prompts**: use for multi-step tasks, but prefer concise rationale for users.

### Reliability moves
- Be specific about audience, source of truth, and desired action.
- Decompose complex work into steps or staged prompts.
- Include missing-evidence behavior such as I do not know.
- Test on representative examples, edge cases, and adversarial inputs.
- Track prompt version, model version, parameters, and failures.

### Pitfalls
- Vague instructions.
- Conflicting instructions.
- Overstuffed context.
- Negative-only instructions without replacement behavior.
- Assuming the model knows private, user-specific, or current facts.
- Treating prompts as security boundaries.

### Interview answer shape
1. Define the task and roles.
2. Add trusted context and delimiters.
3. Choose zero-shot or few-shot.
4. Specify output format and constraints.
5. Add grounding and I do not know behavior.
6. Evaluate and version the prompt.`,
  references: [
    { title: "OpenAI Prompt Engineering Guide", kind: "Docs", url: "https://platform.openai.com/docs/guides/prompt-engineering", author: "OpenAI" },
    { title: "Anthropic Prompt Engineering Overview", kind: "Docs", url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview", author: "Anthropic" },
    { title: "Language Models are Few-Shot Learners", kind: "Paper", url: "https://arxiv.org/abs/2005.14165", author: "Brown et al." },
    { title: "Self-Consistency Improves Chain of Thought Reasoning in Language Models", kind: "Paper", url: "https://arxiv.org/abs/2203.11171", author: "Wang et al." }
  ],
  relatedLessons: [
    { slug: "hallucinations-and-limitations", note: "Explains why grounded prompts and I do not know behavior are necessary but not sufficient." },
    { slug: "choosing-the-right-model", note: "Helps decide when prompt design is enough and when a stronger or reasoning model is needed." },
    { slug: "design-chatgpt", note: "Shows how system prompts, conversation state, and safety rules fit into a chat product." },
    { slug: "design-rag-pipeline", note: "Applies prompt grounding and delimiters to retrieval-augmented generation." }
  ]
};
