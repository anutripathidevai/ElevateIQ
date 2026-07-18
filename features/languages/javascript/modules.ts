import type { CourseModule } from "../types";

/**
 * The full 14-module JavaScript curriculum. Every module is listed so the
 * landing page and roadmap show the complete learning journey. Modules 1–3 are
 * fully authored and published; the remainder are defined (with their real
 * topic lists) and marked `coming-soon` so they appear in the roadmap and are
 * ready to be filled in by authoring topic data — no app-code changes needed.
 *
 * Topic slugs are the source of truth for structure and ordering. All are
 * prefixed `js-`.
 */
export const JS_MODULES: CourseModule[] = [
  {
    id: "fundamentals",
    order: 1,
    title: "JavaScript Fundamentals",
    summary:
      "How JavaScript really runs: engines, the runtime, single-threading, and a first look at the event loop.",
    status: "published",
    topicSlugs: [
      "js-history",
      "js-ecmascript",
      "js-engine",
      "js-v8-engine",
      "js-browser-vs-node",
      "js-runtime",
      "js-compilation-vs-interpretation",
      "js-single-threaded",
      "js-event-loop-intro",
    ],
  },
  {
    id: "variables-data-types",
    order: 2,
    title: "Variables & Data Types",
    summary:
      "Declarations and the type system — var/let/const, primitives vs references, and the quirky values interviewers love.",
    status: "published",
    topicSlugs: [
      "js-var",
      "js-let",
      "js-const",
      "js-primitive-types",
      "js-reference-types",
      "js-typeof",
      "js-null",
      "js-undefined",
      "js-symbol",
      "js-bigint",
    ],
  },
  {
    id: "scope-closures",
    order: 3,
    title: "Scope & Closures",
    summary:
      "The mental model behind closures — scope kinds, the lexical scope chain, memory implications, and real-world uses.",
    status: "published",
    topicSlugs: [
      "js-global-scope",
      "js-function-scope",
      "js-block-scope",
      "js-lexical-scope",
      "js-closures",
      "js-closure-memory",
      "js-closure-uses",
    ],
  },
  {
    id: "execution-context-hoisting",
    order: 4,
    title: "Execution Context & Hoisting",
    summary:
      "The two-phase execution model, hoisting, the temporal dead zone, and the call stack.",
    status: "coming-soon",
    topicSlugs: [
      "js-execution-context",
      "js-memory-creation-phase",
      "js-execution-phase",
      "js-hoisting",
      "js-temporal-dead-zone",
      "js-call-stack",
    ],
  },
  {
    id: "functions",
    order: 5,
    title: "Functions",
    summary:
      "Everything functions — declarations, expressions, arrows, IIFEs, callbacks, and higher-order/pure functions.",
    status: "coming-soon",
    topicSlugs: [
      "js-function-declaration",
      "js-function-expression",
      "js-arrow-functions",
      "js-anonymous-functions",
      "js-iife",
      "js-callbacks",
      "js-higher-order-functions",
      "js-first-class-functions",
      "js-pure-functions",
    ],
  },
  {
    id: "objects-prototypes",
    order: 6,
    title: "Objects & Prototypes",
    summary:
      "Objects, property descriptors, freeze/seal/create, and the prototype chain that powers inheritance.",
    status: "coming-soon",
    topicSlugs: [
      "js-objects",
      "js-property-descriptors",
      "js-object-freeze",
      "js-object-seal",
      "js-object-create",
      "js-prototype",
      "js-prototype-chain",
      "js-inheritance",
    ],
  },
  {
    id: "this-keyword",
    order: 7,
    title: "The this Keyword",
    summary:
      "How `this` is determined in every context, plus call, apply, and bind.",
    status: "coming-soon",
    topicSlugs: [
      "js-this-global",
      "js-this-object",
      "js-this-function",
      "js-this-arrow",
      "js-call",
      "js-apply",
      "js-bind",
    ],
  },
  {
    id: "async-javascript",
    order: 8,
    title: "Asynchronous JavaScript",
    summary:
      "The event loop in depth — Web APIs, task vs microtask queues, callbacks, callback hell, promises, and async/await.",
    status: "coming-soon",
    topicSlugs: [
      "js-event-loop",
      "js-web-apis",
      "js-task-queue",
      "js-microtask-queue",
      "js-async-callbacks",
      "js-callback-hell",
      "js-promises-intro",
      "js-async-await",
    ],
  },
  {
    id: "promises",
    order: 9,
    title: "Promises",
    summary:
      "The promise lifecycle, chaining, error handling, and the combinators (all/any/allSettled/race).",
    status: "coming-soon",
    topicSlugs: [
      "js-promise-lifecycle",
      "js-promise-chaining",
      "js-promise-error-handling",
      "js-promise-all",
      "js-promise-any",
      "js-promise-allsettled",
      "js-promise-race",
    ],
  },
  {
    id: "es6-features",
    order: 10,
    title: "ES6+ Features",
    summary:
      "Modern syntax that shows up in every interview — destructuring, spread/rest, optional chaining, nullish coalescing, and modules.",
    status: "coming-soon",
    topicSlugs: [
      "js-destructuring",
      "js-spread",
      "js-rest",
      "js-template-literals",
      "js-optional-chaining",
      "js-nullish-coalescing",
      "js-modules",
      "js-import-export",
    ],
  },
  {
    id: "advanced",
    order: 11,
    title: "Advanced JavaScript",
    summary:
      "The machine-coding toolkit — currying, memoization, debounce/throttle, deep clone, generators, iterators, WeakMap/Set, Proxy, and Reflect.",
    status: "coming-soon",
    topicSlugs: [
      "js-currying",
      "js-memoization",
      "js-debouncing",
      "js-throttling",
      "js-deep-clone",
      "js-event-delegation-adv",
      "js-generators",
      "js-iterators",
      "js-weakmap",
      "js-weakset",
      "js-proxy",
      "js-reflect",
    ],
  },
  {
    id: "browser-apis",
    order: 12,
    title: "Browser APIs",
    summary:
      "The DOM, the event model (bubbling, capturing, delegation), and client storage.",
    status: "coming-soon",
    topicSlugs: [
      "js-dom",
      "js-events",
      "js-event-bubbling",
      "js-event-capturing",
      "js-event-delegation",
      "js-local-storage",
      "js-session-storage",
      "js-cookies",
    ],
  },
  {
    id: "design-patterns",
    order: 13,
    title: "JavaScript Design Patterns",
    summary:
      "The patterns interviewers ask you to implement — module, factory, singleton, observer, and pub/sub.",
    status: "coming-soon",
    topicSlugs: [
      "js-module-pattern",
      "js-factory-pattern",
      "js-singleton-pattern",
      "js-observer-pattern",
      "js-pubsub-pattern",
    ],
  },
  {
    id: "machine-coding",
    order: 14,
    title: "Machine Coding",
    summary:
      "Build interview-favourite features end to end — debounced search, autocomplete, infinite scroll, event emitter, polyfills, LRU cache, and a mini virtual DOM.",
    status: "coming-soon",
    topicSlugs: [
      "js-mc-debounced-search",
      "js-mc-autocomplete",
      "js-mc-infinite-scroll",
      "js-mc-todo-app",
      "js-mc-event-emitter",
      "js-mc-promise-polyfills",
      "js-mc-array-polyfills",
      "js-mc-deep-clone",
      "js-mc-lru-cache",
      "js-mc-mini-vdom",
    ],
  },
];
