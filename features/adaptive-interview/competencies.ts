/**
 * The competency framework: the configurable rubric that drives evaluation and
 * adaptive question selection.
 *
 * For every track we define a fixed set of competencies (each with expected
 * concepts and a laddered, non-AI question bank). Seniority then selects the
 * emphasis (per-competency weights), how many questions to ask, and the opening
 * difficulty. `getFramework(track, seniority)` resolves all of this into a single
 * normalized {@link CompetencyFramework}.
 *
 * Everything here is plain data, so a new track / competency / seniority profile
 * is added by editing these tables — no engine changes.
 */
import type { TrackKey } from "@prisma/client";
import type {
  Competency,
  CompetencyFramework,
  Difficulty,
  Seniority,
} from "./types";

/** Base competencies per track. Weights are applied per-seniority below. */
const TRACK_COMPETENCIES: Record<TrackKey, Competency[]> = {
  DSA: [
    {
      id: "problem_solving",
      name: "Problem Solving",
      description: "Decomposes the problem and reasons toward a working approach.",
      expectedConcepts: [
        "brute force",
        "pattern",
        "approach",
        "examples",
        "clarify",
        "invariant",
      ],
      questionBank: {
        easy: [
          "Given an array of integers, how would you find whether any two numbers sum to a target? Walk me through your thinking.",
          "How would you check if a string is a palindrome? Start with the simplest idea.",
        ],
        medium: [
          "You need to find the longest substring without repeating characters. How do you approach it, and how do you arrive at an efficient solution?",
          "Given a list of intervals, how would you merge the overlapping ones? Reason from a brute-force baseline first.",
        ],
        hard: [
          "Design an approach to find the median of a stream of numbers as it arrives. How do you get from the naive idea to something efficient?",
          "How would you find the number of ways to decode a string of digits into letters, and how do you know your recurrence is correct?",
        ],
      },
    },
    {
      id: "algorithms",
      name: "Algorithms & Data Structures",
      description: "Selects and justifies the right algorithm / data structure.",
      expectedConcepts: [
        "hash map",
        "two pointers",
        "sliding window",
        "binary search",
        "heap",
        "stack",
        "queue",
        "graph",
        "dynamic programming",
        "sorting",
      ],
      questionBank: {
        easy: [
          "Which data structure would you use to detect duplicates in a list, and why?",
          "When would you reach for a stack versus a queue? Give a concrete example.",
        ],
        medium: [
          "Explain when a two-pointer technique beats a hash map, using a problem of your choice.",
          "How does a heap help with a 'top K elements' problem, and what is the complexity?",
        ],
        hard: [
          "Walk me through choosing between BFS, DFS, and Dijkstra for a shortest-path variant, and justify the trade-offs.",
          "How would you recognize that a problem needs dynamic programming versus greedy, and how do you define the state?",
        ],
      },
    },
    {
      id: "complexity",
      name: "Complexity Analysis",
      description: "Analyzes time and space complexity precisely.",
      expectedConcepts: [
        "time complexity",
        "space complexity",
        "big o",
        "amortized",
        "trade-off",
        "worst case",
      ],
      questionBank: {
        easy: [
          "What is the time and space complexity of your last approach, and why?",
          "What does O(n log n) mean in practice for this problem size?",
        ],
        medium: [
          "How would you reduce the space complexity of your solution, and what do you trade to get it?",
          "Explain the amortized complexity of appending to a dynamic array.",
        ],
        hard: [
          "Your solution is O(n^2). Talk me through what would need to change to reach O(n log n) or O(n), and the cost.",
          "Analyze the complexity of your recursive solution including the call stack, and how memoization changes it.",
        ],
      },
    },
    {
      id: "correctness",
      name: "Correctness & Edge Cases",
      description: "Handles edge cases and validates correctness.",
      expectedConcepts: [
        "edge case",
        "empty input",
        "overflow",
        "null",
        "boundary",
        "duplicates",
        "test",
      ],
      questionBank: {
        easy: [
          "What edge cases would you test for your solution?",
          "What happens to your approach with an empty or single-element input?",
        ],
        medium: [
          "How do you guard against integer overflow or off-by-one errors here?",
          "Which inputs are most likely to break your solution, and how would you handle them?",
        ],
        hard: [
          "How would you convince a reviewer your solution is correct without running it? What invariants hold?",
          "Describe a systematic way to enumerate edge cases for this problem and verify each.",
        ],
      },
    },
    {
      id: "code_quality",
      name: "Code Quality",
      description: "Writes clean, readable, well-structured code.",
      expectedConcepts: [
        "readable",
        "naming",
        "helper function",
        "modular",
        "clean",
        "maintainable",
      ],
      questionBank: {
        easy: [
          "How would you structure your code so it stays readable as it grows?",
          "What naming and organization choices make your solution easy to follow?",
        ],
        medium: [
          "How would you refactor your solution into small, testable pieces?",
          "Where would you add abstractions, and where would that be over-engineering?",
        ],
        hard: [
          "How do you balance clean abstractions against interview-time constraints and performance?",
          "What would production-ready code for this look like beyond the interview solution?",
        ],
      },
    },
    {
      id: "communication",
      name: "Communication",
      description: "Explains thinking clearly and collaborates.",
      expectedConcepts: [
        "explain",
        "clarify",
        "assumption",
        "trade-off",
        "think aloud",
        "structure",
      ],
      questionBank: {
        easy: [
          "Before coding, how would you summarize the problem back to me in your own words?",
          "What clarifying questions would you ask about this problem?",
        ],
        medium: [
          "Talk me through how you would narrate your approach to an interviewer as you build it.",
          "How do you communicate a change of plan when your first approach isn't working?",
        ],
        hard: [
          "How do you keep an interviewer aligned while exploring multiple approaches under time pressure?",
          "Explain a complex algorithm as if to a teammate who is new to it.",
        ],
      },
    },
  ],
  SYSTEM_DESIGN: [
    {
      id: "requirements",
      name: "Requirements & Scope",
      description: "Clarifies functional and non-functional requirements.",
      expectedConcepts: [
        "functional requirements",
        "non-functional",
        "scope",
        "constraints",
        "assumptions",
        "clarify",
        "users",
      ],
      questionBank: {
        easy: [
          "We want to design a URL shortener. What requirements would you clarify first?",
          "How do you separate functional from non-functional requirements for a new system?",
        ],
        medium: [
          "For a news feed, what functional and non-functional requirements would you nail down before designing?",
          "How do you decide what is in scope versus out of scope in a 45-minute design?",
        ],
        hard: [
          "For a global payments system, how do you elicit the requirements that most constrain the architecture?",
          "How do you turn vague product goals into measurable SLAs and constraints?",
        ],
      },
    },
    {
      id: "estimation",
      name: "Capacity Estimation",
      description: "Estimates scale: QPS, storage, bandwidth.",
      expectedConcepts: [
        "qps",
        "throughput",
        "storage",
        "bandwidth",
        "read/write ratio",
        "back-of-the-envelope",
        "peak",
      ],
      questionBank: {
        easy: [
          "Roughly how would you estimate the storage needed for a URL shortener with 100M links a month?",
          "How do you estimate reads versus writes for a typical social app?",
        ],
        medium: [
          "Estimate the QPS and storage for a photo-sharing service with 500M daily active users.",
          "How do peak-versus-average traffic assumptions change your capacity plan?",
        ],
        hard: [
          "Walk me through capacity planning for a video platform, including egress bandwidth and hot content.",
          "How do your estimates drive concrete decisions about sharding and caching tiers?",
        ],
      },
    },
    {
      id: "architecture",
      name: "High-Level Architecture",
      description: "Designs coherent components and their interactions.",
      expectedConcepts: [
        "load balancer",
        "api gateway",
        "service",
        "cache",
        "database",
        "queue",
        "cdn",
        "components",
      ],
      questionBank: {
        easy: [
          "Sketch the main components for a URL shortener and how a request flows through them.",
          "Where would you put a cache in a read-heavy web service, and why?",
        ],
        medium: [
          "Design the high-level architecture for a chat application. What are the core services?",
          "How would you introduce asynchronous processing with a message queue in your design?",
        ],
        hard: [
          "Design a rate limiter that works across a fleet of API servers. What components are involved?",
          "How would you evolve a monolith into services for a rapidly scaling product?",
        ],
      },
    },
    {
      id: "data_modeling",
      name: "Data Modeling & Storage",
      description: "Chooses appropriate storage and models the data.",
      expectedConcepts: [
        "sql",
        "nosql",
        "schema",
        "index",
        "partition",
        "replication",
        "consistency",
        "key-value",
      ],
      questionBank: {
        easy: [
          "Would you use SQL or NoSQL for a URL shortener, and why?",
          "How would you model the data for a simple messaging app?",
        ],
        medium: [
          "How would you choose a partition key for a high-write time-series workload?",
          "When do you denormalize, and what does it cost you?",
        ],
        hard: [
          "Design the storage layer for a feed system balancing write amplification against read latency.",
          "How would you handle multi-region data with strong versus eventual consistency needs?",
        ],
      },
    },
    {
      id: "scalability",
      name: "Scalability & Reliability",
      description: "Scales the system and handles failure.",
      expectedConcepts: [
        "horizontal scaling",
        "sharding",
        "replication",
        "failover",
        "load balancing",
        "bottleneck",
        "availability",
      ],
      questionBank: {
        easy: [
          "How would you scale a read-heavy service as traffic grows 10x?",
          "What happens in your design if one database node fails?",
        ],
        medium: [
          "Where is the bottleneck in your design at scale, and how do you remove it?",
          "How would you achieve high availability for a stateful service?",
        ],
        hard: [
          "Design for 5-nines availability across regions. What failure modes worry you most?",
          "How do you prevent and recover from a cascading failure or hot shard?",
        ],
      },
    },
    {
      id: "tradeoffs",
      name: "Trade-off Analysis",
      description: "Reasons about competing options and justifies choices.",
      expectedConcepts: [
        "trade-off",
        "consistency",
        "availability",
        "latency",
        "cost",
        "cap theorem",
        "pros and cons",
      ],
      questionBank: {
        easy: [
          "What trade-off did you make when choosing your database, and why was it acceptable?",
          "Explain a consistency-versus-latency trade-off in simple terms.",
        ],
        medium: [
          "Push versus pull for a news feed: what are the trade-offs and when would you switch?",
          "How does the CAP theorem shape a decision in your design?",
        ],
        hard: [
          "Justify a strong-consistency choice that hurts availability. When is that the right call?",
          "Talk me through the cost/performance/complexity trade-offs of your caching strategy.",
        ],
      },
    },
    {
      id: "communication",
      name: "Communication & Structure",
      description: "Drives a structured, well-communicated design discussion.",
      expectedConcepts: [
        "structure",
        "clarify",
        "drive",
        "summarize",
        "diagram",
        "prioritize",
      ],
      questionBank: {
        easy: [
          "How would you structure the first ten minutes of a system design interview?",
          "How do you keep a design discussion organized as it grows?",
        ],
        medium: [
          "How do you decide which part of the system to go deep on versus keep shallow?",
          "How do you surface and confirm assumptions with your interviewer?",
        ],
        hard: [
          "How do you lead a design discussion, incorporate pushback, and still finish on time?",
          "Summarize a complex design decision crisply for a non-expert stakeholder.",
        ],
      },
    },
  ],
  LLD: [
    {
      id: "oo_modeling",
      name: "Object-Oriented Modeling",
      description: "Identifies the right classes, responsibilities, and relations.",
      expectedConcepts: [
        "class",
        "responsibility",
        "encapsulation",
        "relationship",
        "entity",
        "abstraction",
        "interface",
      ],
      questionBank: {
        easy: [
          "Model a parking lot: what are the core classes and their responsibilities?",
          "How would you identify the entities in a simple library management system?",
        ],
        medium: [
          "Design the class model for an elevator system. How do classes collaborate?",
          "How do you keep each class's responsibility focused as the model grows?",
        ],
        hard: [
          "Model a ride-sharing matching system. Where do the abstractions live and why?",
          "How would you model a rules engine so new rules don't require touching existing classes?",
        ],
      },
    },
    {
      id: "solid",
      name: "SOLID Principles",
      description: "Applies SOLID to keep the design maintainable.",
      expectedConcepts: [
        "single responsibility",
        "open closed",
        "liskov",
        "interface segregation",
        "dependency inversion",
        "solid",
      ],
      questionBank: {
        easy: [
          "Which SOLID principle would you apply first in your design, and why?",
          "Give an example of the single-responsibility principle in your class model.",
        ],
        medium: [
          "How does the open/closed principle shape how you'd add a new payment method?",
          "Show where dependency inversion helps you swap an implementation.",
        ],
        hard: [
          "Walk me through refactoring a violation of the interface-segregation principle in a large design.",
          "How do SOLID principles interact and sometimes conflict in a real design?",
        ],
      },
    },
    {
      id: "design_patterns",
      name: "Design Patterns",
      description: "Uses appropriate patterns without over-engineering.",
      expectedConcepts: [
        "factory",
        "strategy",
        "observer",
        "singleton",
        "builder",
        "decorator",
        "state",
        "pattern",
      ],
      questionBank: {
        easy: [
          "Which design pattern fits a notification system that supports email and SMS?",
          "When would you use a factory versus just calling a constructor?",
        ],
        medium: [
          "How would the strategy pattern let you swap pricing algorithms at runtime?",
          "Where would an observer pattern fit in your design, and what does it decouple?",
        ],
        hard: [
          "Combine two patterns to model a vending machine's states and transitions cleanly.",
          "When does reaching for a pattern become over-engineering? Give an example.",
        ],
      },
    },
    {
      id: "extensibility",
      name: "Extensibility & Maintainability",
      description: "Designs for change with minimal ripple.",
      expectedConcepts: [
        "extensible",
        "open for extension",
        "plugin",
        "decouple",
        "maintainable",
        "future requirement",
      ],
      questionBank: {
        easy: [
          "How would your design accommodate a new feature without rewriting existing classes?",
          "What part of your model is most likely to change, and how did you isolate it?",
        ],
        medium: [
          "A new requirement arrives mid-design. Show how your model absorbs it.",
          "How do you keep coupling low so modules can evolve independently?",
        ],
        hard: [
          "Design a plugin architecture so third parties can extend behavior safely.",
          "How do you evolve a public API without breaking existing consumers?",
        ],
      },
    },
    {
      id: "concurrency",
      name: "Concurrency & Edge Cases",
      description: "Handles thread-safety, contention, and edge cases.",
      expectedConcepts: [
        "thread safe",
        "lock",
        "race condition",
        "atomic",
        "synchronization",
        "deadlock",
        "edge case",
      ],
      questionBank: {
        easy: [
          "Where could two threads collide in your design, and how would you protect that?",
          "What edge cases would you handle in your parking-lot model?",
        ],
        medium: [
          "How would you make your seat-booking design safe under concurrent requests?",
          "How do you avoid a deadlock when multiple locks are involved?",
        ],
        hard: [
          "Design a thread-safe rate limiter and reason about its correctness under contention.",
          "How would you make your design lock-free or minimize locking without races?",
        ],
      },
    },
    {
      id: "communication",
      name: "Communication",
      description: "Explains the design and its rationale clearly.",
      expectedConcepts: [
        "explain",
        "rationale",
        "diagram",
        "trade-off",
        "walk through",
        "clarify",
      ],
      questionBank: {
        easy: [
          "Walk me through your class diagram and how a typical operation flows through it.",
          "How would you explain your design choice to a teammate reviewing it?",
        ],
        medium: [
          "How do you justify introducing an abstraction versus keeping it simple?",
          "Talk me through a trade-off you made in the model and why.",
        ],
        hard: [
          "Defend a controversial design decision to a skeptical senior engineer.",
          "Summarize the design's key decisions and risks in a few sentences.",
        ],
      },
    },
  ],
  BEHAVIORAL: [
    {
      id: "star_structure",
      name: "STAR Structure",
      description: "Answers with a clear Situation, Task, Action, Result.",
      expectedConcepts: [
        "situation",
        "task",
        "action",
        "result",
        "context",
        "outcome",
      ],
      questionBank: {
        easy: [
          "Tell me about a time you fixed a difficult bug. Try to structure your answer.",
          "Describe a project you're proud of, walking through the context and outcome.",
        ],
        medium: [
          "Tell me about a time you disagreed with a teammate. Give me the full situation and result.",
          "Describe a time you missed a deadline. What was the task and what did you do?",
        ],
        hard: [
          "Tell me about the most complex project you led end to end. Structure it tightly.",
          "Describe a time you made a decision with incomplete information and its outcome.",
        ],
      },
    },
    {
      id: "ownership",
      name: "Ownership & Initiative",
      description: "Shows drive, accountability, and going beyond the ask.",
      expectedConcepts: [
        "took ownership",
        "initiative",
        "accountable",
        "drove",
        "responsibility",
        "beyond",
      ],
      questionBank: {
        easy: [
          "Tell me about a time you took on something outside your assigned work.",
          "Describe a problem you noticed that nobody asked you to fix.",
        ],
        medium: [
          "Tell me about a time you owned a failure. What did you take responsibility for?",
          "Describe a time you drove a project through ambiguity.",
        ],
        hard: [
          "Tell me about a time you set the technical direction for your team.",
          "Describe how you turned around a struggling project you didn't start.",
        ],
      },
    },
    {
      id: "impact",
      name: "Impact & Results",
      description: "Quantifies the outcome and business/user impact.",
      expectedConcepts: [
        "metric",
        "impact",
        "result",
        "percent",
        "measurable",
        "outcome",
        "business",
      ],
      questionBank: {
        easy: [
          "What was the measurable result of a project you worked on?",
          "How did you know your change actually helped?",
        ],
        medium: [
          "Tell me about your highest-impact contribution and how you measured it.",
          "Describe a time your work moved a key metric.",
        ],
        hard: [
          "Tell me about a project whose impact you can quantify in business terms.",
          "How did you connect your technical work to a measurable company outcome?",
        ],
      },
    },
    {
      id: "leadership",
      name: "Leadership & Influence",
      description: "Influences without authority and grows others.",
      expectedConcepts: [
        "influence",
        "mentored",
        "aligned",
        "persuaded",
        "led",
        "stakeholder",
      ],
      questionBank: {
        easy: [
          "Tell me about a time you helped a teammate grow.",
          "Describe a time you convinced others to adopt your idea.",
        ],
        medium: [
          "Tell me about a time you influenced a decision without being the decision-maker.",
          "Describe how you aligned people who disagreed.",
        ],
        hard: [
          "Tell me about a time you drove alignment across multiple teams.",
          "Describe how you changed the mind of a senior stakeholder.",
        ],
      },
    },
    {
      id: "collaboration",
      name: "Collaboration & Conflict",
      description: "Works well with others and handles conflict maturely.",
      expectedConcepts: [
        "conflict",
        "empathy",
        "compromise",
        "feedback",
        "teamwork",
        "resolved",
      ],
      questionBank: {
        easy: [
          "Tell me about a time you worked with a difficult person.",
          "Describe how you handled critical feedback.",
        ],
        medium: [
          "Tell me about a serious disagreement and how you resolved it.",
          "Describe a time you had to compromise to keep a project moving.",
        ],
        hard: [
          "Tell me about a deep conflict with a peer that you turned into a working relationship.",
          "Describe navigating conflicting priorities across teams under pressure.",
        ],
      },
    },
    {
      id: "communication",
      name: "Communication & Clarity",
      description: "Communicates concisely, honestly, and reflectively.",
      expectedConcepts: [
        "clear",
        "concise",
        "honest",
        "reflection",
        "learned",
        "self-aware",
      ],
      questionBank: {
        easy: [
          "What is something you learned from a mistake?",
          "How would you describe a complex project to a non-technical person?",
        ],
        medium: [
          "Tell me about feedback that changed how you work.",
          "Describe a time you had to deliver bad news. How did you do it?",
        ],
        hard: [
          "Reflect on the biggest lesson of your career and how it changed you.",
          "How do you communicate uncertainty to leadership without losing credibility?",
        ],
      },
    },
  ],
};

/**
 * Raw (un-normalized) weight profiles per seniority. Junior interviews lean on
 * fundamentals; senior/staff shift weight toward trade-offs, scalability, impact,
 * leadership, and communication. Any competency omitted from a profile falls back
 * to weight 1. Weights are normalized in {@link getFramework}.
 */
const SENIORITY_WEIGHTS: Record<Seniority, Record<string, number>> = {
  junior: {
    problem_solving: 2,
    correctness: 2,
    algorithms: 1.5,
    star_structure: 2,
    requirements: 2,
    oo_modeling: 2,
    complexity: 1,
    tradeoffs: 0.75,
    scalability: 0.75,
    leadership: 0.5,
    impact: 1,
  },
  mid: {
    problem_solving: 1.5,
    algorithms: 1.5,
    complexity: 1.25,
    correctness: 1.25,
    architecture: 1.5,
    data_modeling: 1.25,
    solid: 1.5,
    design_patterns: 1.25,
    star_structure: 1.25,
    impact: 1.25,
    tradeoffs: 1,
  },
  senior: {
    tradeoffs: 2,
    scalability: 1.75,
    architecture: 1.5,
    communication: 1.5,
    extensibility: 1.75,
    design_patterns: 1.5,
    impact: 1.75,
    ownership: 1.5,
    leadership: 1.5,
    complexity: 1.25,
    problem_solving: 1,
  },
  staff: {
    tradeoffs: 2.5,
    scalability: 2,
    architecture: 1.75,
    communication: 2,
    extensibility: 2,
    impact: 2,
    leadership: 2,
    ownership: 1.75,
    requirements: 1.5,
    complexity: 1,
    correctness: 0.75,
    problem_solving: 0.75,
    star_structure: 1,
  },
};

const PLANNED_QUESTIONS: Record<Seniority, number> = {
  junior: 4,
  mid: 5,
  senior: 6,
  staff: 6,
};

const BASELINE_DIFFICULTY: Record<Seniority, Difficulty> = {
  junior: "easy",
  mid: "medium",
  senior: "medium",
  staff: "hard",
};

/**
 * Resolve a normalized competency framework for a (track, seniority). Weights are
 * normalized to sum to 1 so scoring and selection are stable regardless of the raw
 * profile numbers.
 */
export function getFramework(
  track: TrackKey,
  seniority: Seniority,
): CompetencyFramework {
  const competencies = TRACK_COMPETENCIES[track];
  const profile = SENIORITY_WEIGHTS[seniority];
  const raw: Record<string, number> = {};
  let total = 0;
  for (const c of competencies) {
    const w = profile[c.id] ?? 1;
    raw[c.id] = w;
    total += w;
  }
  const weights: Record<string, number> = {};
  for (const c of competencies) {
    weights[c.id] = total > 0 ? raw[c.id] / total : 1 / competencies.length;
  }
  return {
    track,
    seniority,
    plannedQuestions: PLANNED_QUESTIONS[seniority],
    baselineDifficulty: BASELINE_DIFFICULTY[seniority],
    competencies,
    weights,
  };
}

/** Look up a competency definition within a track. */
export function getCompetency(
  track: TrackKey,
  competencyId: string,
): Competency | undefined {
  return TRACK_COMPETENCIES[track].find((c) => c.id === competencyId);
}

/** All competency ids for a track (stable order). */
export function competencyIds(track: TrackKey): string[] {
  return TRACK_COMPETENCIES[track].map((c) => c.id);
}

export { TRACK_COMPETENCIES };
