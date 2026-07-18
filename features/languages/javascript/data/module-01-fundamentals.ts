import type { Topic } from "../../types";

/**
 * Module 1 — JavaScript Fundamentals.
 *
 * The mental model an engineer needs before touching syntax: what JavaScript is,
 * who standardises it, what actually runs it (engine vs runtime), how it is
 * compiled, why it is single-threaded, and a first, honest look at the event
 * loop. Every later module leans on this foundation.
 */
export const TOPICS: Topic[] = [
  // 1 ---------------------------------------------------------------------
  {
    slug: "js-history",
    moduleId: "fundamentals",
    order: 1,
    title: "History of JavaScript",
    difficulty: "Beginner",
    estimatedReadingMin: 6,
    estimatedPracticeMin: 2,
    tags: ["History", "ECMAScript", "Fundamentals"],
    introMD:
      "JavaScript was created by Brendan Eich at Netscape in **1995**, reportedly in about ten days. It was first called *Mocha*, then *LiveScript*, and finally *JavaScript* — a marketing decision to ride the popularity of Java, even though the two languages are unrelated.\n\nUnderstanding this history explains many of the language's quirks (`==` coercion, `typeof null === 'object'`, hoisting) and why the language has evolved so aggressively since 2015.",
    whyItMattersMD:
      "Interviewers rarely ask for exact dates, but they do probe whether you understand **why** JavaScript behaves the way it does. Knowing the timeline lets you answer follow-ups like *\"why does `let` exist if we already had `var`?\"* or *\"what changed in ES6?\"* with confidence instead of guesses.",
    theoryMD:
      "### The timeline that matters\n\n- **1995** — Brendan Eich builds the first version at Netscape in ~10 days.\n- **1996** — Microsoft ships JScript in Internet Explorer, creating two incompatible dialects.\n- **1997** — The language is standardised as **ECMAScript** (ECMA-262) to end the fragmentation.\n- **2009 (ES5)** — Strict mode, `JSON`, array methods (`map`, `filter`, `reduce`), getters/setters.\n- **2015 (ES6 / ES2015)** — The turning point: `let`/`const`, arrow functions, classes, promises, modules, destructuring, template literals. From here, a new spec ships **every year**.\n- **2016+** — Yearly editions (ES2016…ES2023) add smaller, focused features (`async/await`, optional chaining, nullish coalescing, `Array.flat`, top-level `await`).\n\n### Why the quirks exist\n\nBecause the first version shipped in days and then had to stay **backwards compatible forever** (\"don't break the web\"), early mistakes could never be removed — only worked around. That is why we have `let` (to fix `var`), `===` (to fix `==`), and modules (to fix implicit globals).",
    diagrams: [
      {
        title: "JavaScript evolution at a glance",
        ascii:
          "1995        1997         2009          2015              2016 -> now\n |           |            |             |                  |\nMocha ---> ECMAScript --> ES5 --------> ES6 (ES2015) -----> yearly editions\n(Netscape)  (standard)   (strict mode) (let/const, class,   (async/await,\n                          JSON, map)    promises, modules)   optional chaining)",
        caption:
          "One rushed prototype became a standardised language with a yearly release cadence.",
      },
    ],
    interviewQuestions: [
      {
        question:
          "Why is JavaScript named 'JavaScript' if it has nothing to do with Java?",
        answerMD:
          "It was a **marketing decision**. In 1995 Java was extremely popular, so Netscape rebranded LiveScript as JavaScript to benefit from the association. The languages share some C-like syntax but differ fundamentally: JavaScript is dynamically typed, prototype-based, and single-threaded with an event loop, whereas Java is statically typed and class-based.",
        companies: ["Amazon", "Microsoft"],
      },
      {
        question: "What was the single most important release in JS history?",
        answerMD:
          "**ES6 (ES2015)**. It introduced `let`/`const`, arrow functions, classes, template literals, destructuring, default/rest/spread, promises, and native modules. It also began the yearly release cadence. Nearly every modern codebase is written in ES6+.",
      },
    ],
    quiz: [
      {
        question: "Who created JavaScript and in which year?",
        options: [
          "Guido van Rossum, 1991",
          "Brendan Eich, 1995",
          "James Gosling, 1995",
          "Ryan Dahl, 2009",
        ],
        correctIndex: 1,
        explanationMD:
          "Brendan Eich created it at Netscape in 1995. Guido van Rossum created Python, James Gosling created Java, and Ryan Dahl created Node.js.",
      },
    ],
    summary: [
      "JavaScript was created by Brendan Eich at Netscape in 1995.",
      "It was standardised as ECMAScript (ECMA-262) in 1997 to stop browser fragmentation.",
      "ES6 (2015) was the watershed release and began a yearly cadence.",
      "Backwards compatibility (\"don't break the web\") is why the language's early quirks still exist.",
    ],
  },

  // 2 ---------------------------------------------------------------------
  {
    slug: "js-ecmascript",
    moduleId: "fundamentals",
    order: 2,
    title: "ECMAScript & Language Versions",
    difficulty: "Beginner",
    estimatedReadingMin: 7,
    estimatedPracticeMin: 3,
    tags: ["ECMAScript", "TC39", "Standards"],
    introMD:
      "**ECMAScript** is the *specification*; **JavaScript** is the most popular *implementation* of it. When people say \"ES6 features\" they mean features defined in the 6th edition of the ECMAScript standard.\n\nThe spec is maintained by **TC39**, a committee of browser vendors and companies, through a public, staged proposal process.",
    whyItMattersMD:
      "Knowing the difference between ECMAScript and JavaScript — and how features graduate through TC39 stages — signals that you understand the ecosystem, not just the syntax. It also explains why tools like **Babel** and **TypeScript** exist: to use new syntax before every engine supports it.",
    theoryMD:
      "### ECMAScript vs JavaScript\n\n- **ECMAScript (ECMA-262)** is the standard document that defines the language's grammar, types, and semantics.\n- **JavaScript** is an implementation of that standard (with host additions like the DOM in browsers or `fs` in Node).\n- Other implementations exist historically (JScript, ActionScript).\n\n### The TC39 proposal process\n\nEvery new feature moves through five stages:\n\n| Stage | Name | Meaning |\n| --- | --- | --- |\n| 0 | Strawperson | An idea. |\n| 1 | Proposal | Problem and rough API described. |\n| 2 | Draft | Formal spec text; syntax is taking shape. |\n| 3 | Candidate | Spec complete; awaiting implementation feedback. |\n| 4 | Finished | Shipped in engines; included in the next yearly edition. |\n\n### Naming: edition vs year\n\nAfter ES6, editions are named by **year**: ES2016, ES2017 … ES2023. \"ES6\" and \"ES2015\" are the same thing. Prefer the year names for clarity when discussing recent features.\n\n### Transpilation\n\nBecause engines adopt features at different speeds, teams write modern syntax and use **Babel** (transpiler) to down-compile to widely-supported code, and **polyfills** to add missing runtime APIs.",
    diagrams: [
      {
        title: "How a feature becomes part of the language",
        ascii:
          "Idea\n |\n[0] Strawperson\n |\n[1] Proposal    -- problem + rough API\n |\n[2] Draft       -- formal spec text\n |\n[3] Candidate   -- implementations + feedback\n |\n[4] Finished    -- ships in engines, added to yearly edition",
        caption: "TC39's staged process keeps the language stable yet evolving.",
      },
    ],
    codeExamples: [
      {
        title: "Feature detection instead of version checks",
        descriptionMD:
          "You almost never check the ECMAScript version at runtime. Instead, detect whether a feature exists:",
        language: "javascript",
        code:
          "// Prefer capability detection over version detection\nif (typeof Array.prototype.flat === 'function') {\n  console.log([1, [2, 3]].flat()); // [1, 2, 3]\n} else {\n  console.log('flat() not supported - use a polyfill');\n}",
      },
    ],
    interviewQuestions: [
      {
        question: "What is the difference between JavaScript and ECMAScript?",
        answerMD:
          "**ECMAScript** is the language specification (ECMA-262) maintained by TC39. **JavaScript** is an implementation of that specification, plus host-specific APIs (DOM in the browser, filesystem in Node). Saying an engine \"supports ES2021\" means it implements that edition of the spec.",
        companies: ["Google", "Meta"],
      },
      {
        question: "What is TC39 and what are the proposal stages?",
        answerMD:
          "TC39 is the technical committee that evolves ECMAScript. Proposals advance through five stages: **0 strawperson, 1 proposal, 2 draft, 3 candidate, 4 finished**. A Stage-4 proposal is included in the next annual edition.",
      },
    ],
    quiz: [
      {
        question: "\"ES6\" and \"ES2015\" refer to…",
        options: [
          "Two different specifications",
          "The same specification",
          "ES2015 is newer than ES6",
          "ES6 is a Babel plugin",
        ],
        correctIndex: 1,
        explanationMD:
          "They are the same edition. After the 6th edition, TC39 switched to year-based naming, so ES6 = ES2015.",
      },
      {
        question: "At which TC39 stage is a feature guaranteed to ship?",
        options: ["Stage 1", "Stage 2", "Stage 3", "Stage 4"],
        correctIndex: 3,
        explanationMD:
          "Stage 4 (Finished) means the feature is implemented in engines and included in the next yearly edition.",
      },
    ],
    summary: [
      "ECMAScript is the specification; JavaScript is its main implementation.",
      "TC39 evolves the language through five stages (0–4); Stage 4 ships.",
      "After ES6, editions are named by year (ES2016+).",
      "Babel (transpile) and polyfills let teams use new syntax before universal support.",
    ],
    cheatSheetMD:
      "**ECMAScript** = spec (ECMA-262, by TC39). **JavaScript** = implementation.\n\n**Stages:** 0 strawperson → 1 proposal → 2 draft → 3 candidate → 4 finished (ships).\n\n**Naming:** ES6 == ES2015; after that, year names.\n\n**Tooling:** Babel = transpile syntax; polyfill = add missing runtime APIs.",
  },

  // 3 ---------------------------------------------------------------------
  {
    slug: "js-engine",
    moduleId: "fundamentals",
    order: 3,
    title: "The JavaScript Engine",
    difficulty: "Beginner",
    estimatedReadingMin: 8,
    estimatedPracticeMin: 3,
    tags: ["Engine", "Parsing", "JIT", "Internals"],
    introMD:
      "A **JavaScript engine** is a program that reads your source code and executes it. Every browser ships one — **V8** (Chrome/Edge), **SpiderMonkey** (Firefox), **JavaScriptCore** (Safari) — and Node.js embeds V8.\n\nThe engine is *not* the whole runtime: it executes the language, but features like `setTimeout`, `fetch`, and the DOM come from the surrounding **host** environment.",
    whyItMattersMD:
      "Once you can picture the parse → compile → execute pipeline, previously \"magic\" behaviours become obvious: **hoisting** falls out of the parsing phase, **JIT optimisation** explains why hot loops speed up, and you can reason about performance instead of guessing.",
    theoryMD:
      "### What the engine does\n\n1. **Parsing** — the source text is tokenised and turned into an **Abstract Syntax Tree (AST)**. Syntax errors are caught here, before any code runs.\n2. **Compilation** — a baseline compiler turns the AST into **bytecode** (V8's interpreter is called *Ignition*).\n3. **Execution** — the bytecode runs. Meanwhile a **profiler** watches which functions run often (\"hot\").\n4. **Optimisation (JIT)** — hot functions are recompiled to highly optimised machine code by an optimising compiler (V8's *TurboFan*). If an assumption breaks (e.g. a variable's type changes), the engine **deoptimises** back to bytecode.\n\n### Core components\n\n- **Memory Heap** — where objects and closures are allocated.\n- **Call Stack** — where function frames are pushed/popped as code runs.\n- **Garbage Collector** — reclaims memory that is no longer reachable.\n\n### Key insight: JavaScript is compiled, then interpreted, then re-compiled\n\nModern engines blur the line between \"interpreted\" and \"compiled\". Your code is compiled to bytecode up front and the hottest parts are JIT-compiled to native code at runtime.",
    diagrams: [
      {
        title: "The engine pipeline",
        ascii:
          "Source code\n   |\n   v\n[ Parser ] --> AST --> [ Interpreter (Ignition) ] --> Bytecode --> Execute\n                                   |                              ^\n                                   | hot function?                |\n                                   v                              |\n                        [ Optimising compiler (TurboFan) ] -------+\n                                   |  (deoptimise if assumption breaks)\n                                   v\n                          Optimised machine code",
        caption:
          "V8's two-tier design: fast startup via bytecode, peak speed via JIT.",
      },
    ],
    interviewQuestions: [
      {
        question: "Walk me through what happens when a JS engine runs a file.",
        answerMD:
          "The engine **parses** the source into tokens and an AST (catching syntax errors). A baseline compiler turns the AST into **bytecode**, which an interpreter executes. A profiler marks frequently-run (\"hot\") functions, and an optimising **JIT** compiler recompiles them to native machine code. If a runtime assumption is invalidated, the engine **deoptimises** back to bytecode. Throughout, objects live in the **heap**, execution uses the **call stack**, and a **garbage collector** frees unreachable memory.",
        companies: ["Google", "Microsoft"],
        followUps: [
          "What is deoptimisation and what triggers it?",
          "Where do closures live — stack or heap?",
        ],
      },
      {
        question: "Is JavaScript interpreted or compiled?",
        answerMD:
          "Both, in modern engines. Code is **compiled** to bytecode ahead of execution and **interpreted**, then hot paths are **JIT-compiled** to machine code at runtime. Calling JS purely \"interpreted\" is outdated.",
      },
    ],
    quiz: [
      {
        question: "In V8, which component turns hot bytecode into machine code?",
        options: ["Ignition", "TurboFan", "The parser", "The garbage collector"],
        correctIndex: 1,
        explanationMD:
          "Ignition is the interpreter that produces/executes bytecode; TurboFan is the optimising JIT compiler that produces native machine code for hot functions.",
      },
      {
        question: "Where are objects and closures allocated?",
        options: ["Call stack", "Memory heap", "Bytecode", "Event queue"],
        correctIndex: 1,
        explanationMD:
          "The heap stores objects and closures; the call stack stores lightweight function frames and primitive locals.",
      },
    ],
    summary: [
      "An engine parses source into an AST, compiles it to bytecode, and executes it.",
      "A JIT compiler recompiles hot functions to native code and can deoptimise them.",
      "The engine provides the heap, the call stack, and the garbage collector.",
      "V8 (Chrome/Node), SpiderMonkey (Firefox), and JavaScriptCore (Safari) are the major engines.",
    ],
  },

  // 4 ---------------------------------------------------------------------
  {
    slug: "js-v8-engine",
    moduleId: "fundamentals",
    order: 4,
    title: "Inside the V8 Engine",
    difficulty: "Intermediate",
    estimatedReadingMin: 8,
    estimatedPracticeMin: 3,
    tags: ["V8", "JIT", "Performance", "Internals"],
    introMD:
      "**V8** is Google's open-source JavaScript engine, written in C++. It powers Chrome, Edge, and — crucially — **Node.js** and Deno. It is the engine most interview questions implicitly refer to.\n\nV8 is famous for its two-tier compilation strategy that balances **fast startup** with **peak performance**.",
    whyItMattersMD:
      "Senior interviews often drift into performance: *\"why is this loop slow?\"*, *\"what is a hidden class?\"*, *\"why keep object shapes consistent?\"*. A working model of V8 lets you write JIT-friendly code and explain your reasoning.",
    theoryMD:
      "### The two-tier pipeline\n\n- **Ignition** — the interpreter. It compiles the AST to compact **bytecode** and executes it. This gives fast startup and low memory.\n- **TurboFan** — the optimising compiler. When Ignition's profiler flags a function as **hot**, TurboFan recompiles it to optimised machine code using assumptions gathered at runtime (e.g. \"this argument is always a number\").\n\n### Hidden classes (shapes)\n\nJavaScript objects are dynamic, but V8 secretly assigns each object a **hidden class** describing its property layout. Objects created with the **same properties in the same order** share a hidden class, letting V8 use fast, array-like property access instead of a dictionary lookup.\n\nAdding properties in different orders — or adding them after creation — creates **new hidden classes** and can force V8 to fall back to slow dictionary mode.\n\n### Inline caches\n\nV8 remembers where a property was found last time (an **inline cache**). Stable object shapes keep these caches \"monomorphic\" (one shape) and fast; mixing many shapes makes them \"megamorphic\" and slow.\n\n### Practical rules for JIT-friendly code\n\n- Initialise all object properties in the **constructor**, in a consistent order.\n- Avoid deleting properties (`delete obj.x`) on hot objects.\n- Keep arrays **packed** and of a single element type where possible.\n- Don't change a variable's type across iterations of a hot loop.",
    diagrams: [
      {
        title: "V8 two-tier compilation",
        ascii:
          "               profiler marks 'hot'\nAST --> [Ignition] --> bytecode --> execute\n            ^                          |\n            |    deoptimise            v\n            +-------------------- [TurboFan] --> optimised machine code\n                                   (uses runtime type assumptions)",
        caption:
          "Fast startup from Ignition, peak speed from TurboFan, safety via deopt.",
      },
    ],
    codeExamples: [
      {
        title: "Consistent object shapes help V8",
        descriptionMD:
          "Both objects below have the same properties **in the same order**, so V8 can give them the same hidden class — the fast path:",
        language: "javascript",
        code:
          "function makePoint(x, y) {\n  // Always initialise properties in the same order\n  return { x: x, y: y };\n}\n\nconst a = makePoint(1, 2);\nconst b = makePoint(3, 4);\n// a and b share a hidden class -> fast property access\nconsole.log(a.x + b.y); // 5",
      },
    ],
    outputPredictions: [
      {
        code:
          "const obj1 = {};\nobj1.a = 1;\nobj1.b = 2;\n\nconst obj2 = {};\nobj2.b = 2;\nobj2.a = 1;\n\nconsole.log(obj1.a === obj2.a);",
        answer: "true",
        explanationMD:
          "The **values** are equal, so the comparison is `true`. The subtle point is about **performance, not correctness**: because the properties were added in a different order, `obj1` and `obj2` end up with **different hidden classes** in V8. The result is identical, but V8 can't share optimisations between them.",
      },
    ],
    interviewQuestions: [
      {
        question: "What is a hidden class in V8 and why should I care?",
        answerMD:
          "A **hidden class** (or \"shape\") is V8's internal description of an object's property layout. Objects with the same properties added in the same order share a hidden class, enabling fast, offset-based property access and effective **inline caches**. Creating objects with inconsistent shapes forces slower dictionary lookups. Practical takeaway: initialise all properties in the constructor, in a consistent order, and avoid `delete` on hot objects.",
        companies: ["Google", "Meta", "Amazon"],
      },
      {
        question: "What are Ignition and TurboFan?",
        answerMD:
          "**Ignition** is V8's interpreter that compiles the AST to bytecode and runs it (fast startup, low memory). **TurboFan** is the optimising JIT compiler that recompiles hot functions to machine code using runtime type feedback, deoptimising if an assumption is later violated.",
      },
    ],
    quiz: [
      {
        question: "Which practice is most JIT-friendly in V8?",
        options: [
          "Adding object properties in random order at runtime",
          "Initialising all properties in the constructor in a consistent order",
          "Using delete frequently on hot objects",
          "Mixing element types in hot arrays",
        ],
        correctIndex: 1,
        explanationMD:
          "Consistent property initialisation lets objects share a hidden class, keeping inline caches monomorphic and property access fast.",
      },
    ],
    summary: [
      "V8 is Google's C++ engine powering Chrome, Edge, and Node.js.",
      "Ignition interprets bytecode for fast startup; TurboFan JIT-compiles hot code.",
      "Hidden classes let objects with identical shapes share fast property access.",
      "Consistent object shapes and packed arrays keep code on V8's fast path.",
    ],
    cheatSheetMD:
      "**V8 tiers:** Ignition (interpreter, bytecode) + TurboFan (optimising JIT).\n\n**Hidden class:** internal object shape. Same props, same order → shared shape → fast.\n\n**Do:** init props in constructor, consistent order; keep arrays packed/typed.\n\n**Avoid:** `delete` on hot objects; changing a variable's type in hot loops.",
  },

  // 5 ---------------------------------------------------------------------
  {
    slug: "js-browser-vs-node",
    moduleId: "fundamentals",
    order: 5,
    title: "Browser vs Node.js",
    difficulty: "Beginner",
    estimatedReadingMin: 7,
    estimatedPracticeMin: 3,
    tags: ["Node.js", "Browser", "Runtime", "Environment"],
    introMD:
      "The **same language** runs in two very different homes. In the **browser**, JavaScript manipulates web pages and talks to the user. In **Node.js**, it runs on a server with access to the filesystem, network sockets, and the operating system.\n\nBoth embed a JS engine (usually V8) but surround it with **different host APIs**.",
    whyItMattersMD:
      "Confusing browser and Node APIs is a classic bug source: `window` and `document` don't exist in Node; `require`/`fs`/`process` don't exist in the browser. Interviewers use this to check whether you understand that *the engine is not the environment*.",
    theoryMD:
      "### What they share\n\n- The **ECMAScript language** itself (syntax, types, `Promise`, `Array`, `JSON`).\n- A JS **engine** (V8 in Chrome and Node).\n- The **event loop** model (though the implementations differ — libuv in Node).\n\n### What differs\n\n| Concern | Browser | Node.js |\n| --- | --- | --- |\n| Global object | `window` / `self` | `global` / `globalThis` |\n| DOM | `document`, `window` | none |\n| Timers | `setTimeout`, `setInterval` | same names, libuv-backed |\n| Networking | `fetch`, `XMLHttpRequest` | `http`, `fetch` (v18+), sockets |\n| Filesystem | none (sandboxed) | `fs` |\n| Modules | ES Modules (`import`) | CommonJS (`require`) and ESM |\n| Process info | none | `process`, `process.env` |\n| Event loop impl | browser-provided | **libuv** |\n\n### globalThis\n\nBecause the global object has different names, ES2020 added **`globalThis`** — a single, portable reference that works in both environments.",
    codeExamples: [
      {
        title: "Write environment-agnostic code",
        descriptionMD:
          "Use `globalThis` and feature detection so a module works in both the browser and Node:",
        language: "javascript",
        code:
          "// Works in the browser and in Node\nconst root = globalThis;\n\nfunction hasDom() {\n  return typeof root.document !== 'undefined';\n}\n\nconsole.log('Running in a browser:', hasDom());",
      },
    ],
    interviewQuestions: [
      {
        question: "What is the difference between JavaScript in the browser and in Node.js?",
        answerMD:
          "Both run the same ECMAScript language on a JS engine (V8), but provide **different host APIs**. The browser exposes the **DOM**, `window`, `fetch`, and `localStorage`, and sandboxes the filesystem. Node exposes `fs`, `http`, `process`, and `require`, and uses **libuv** for its event loop. Code that assumes `window`/`document` breaks in Node, and code that assumes `fs`/`require` breaks in the browser. `globalThis` gives a portable global reference.",
        companies: ["Amazon", "Microsoft", "Netflix"],
      },
      {
        question: "Does Node.js use the same event loop as the browser?",
        answerMD:
          "The **concept** is the same (a loop that processes queued callbacks), but the **implementation differs**. Node's event loop is provided by **libuv** and has distinct phases (timers, poll, check, close) plus `process.nextTick` and microtask handling. The browser's event loop is defined by the HTML spec and integrates rendering.",
      },
    ],
    quiz: [
      {
        question: "Which of these exists in the browser but NOT in Node.js?",
        options: ["process", "document", "globalThis", "setTimeout"],
        correctIndex: 1,
        explanationMD:
          "`document` (the DOM) is browser-only. `process` is Node-only. `globalThis` and `setTimeout` exist in both.",
      },
    ],
    summary: [
      "Browser and Node run the same language but expose different host APIs.",
      "Browser: DOM, window, fetch, localStorage. Node: fs, http, process, require.",
      "Node's event loop is implemented by libuv; the browser's by the HTML spec.",
      "Use globalThis and feature detection for portable code.",
    ],
  },

  // 6 ---------------------------------------------------------------------
  {
    slug: "js-runtime",
    moduleId: "fundamentals",
    order: 6,
    title: "The JavaScript Runtime",
    difficulty: "Intermediate",
    estimatedReadingMin: 8,
    estimatedPracticeMin: 3,
    tags: ["Runtime", "Event Loop", "Web APIs", "Architecture"],
    introMD:
      "The **runtime** is the engine *plus everything around it* that makes asynchronous, real-world programs possible: the **call stack**, the **heap**, the host's **Web APIs**, the **callback/task queue**, the **microtask queue**, and the **event loop** that ties them together.\n\nThe engine alone can only run synchronous code. The runtime is what lets `setTimeout`, `fetch`, and promises work.",
    whyItMattersMD:
      "This is the single most important mental model in JavaScript. Almost every tricky interview question — output ordering, `setTimeout(fn, 0)`, promise vs `setTimeout`, \"why doesn't my UI update\" — is answered by picturing the runtime correctly.",
    theoryMD:
      "### The pieces\n\n- **Call stack** — a LIFO stack of function frames. JavaScript has exactly **one** call stack (single-threaded).\n- **Heap** — unstructured memory where objects live.\n- **Web APIs / host APIs** — provided by the browser or Node, *not* the engine: `setTimeout`, `fetch`, DOM events, `fs`. These can do work **concurrently** with your code.\n- **Task queue (macrotask queue)** — callbacks ready to run: timer callbacks, I/O, UI events.\n- **Microtask queue** — higher-priority callbacks: resolved promise handlers (`.then`), `queueMicrotask`, `MutationObserver`.\n- **Event loop** — the coordinator.\n\n### The event loop algorithm (simplified)\n\n1. Run all synchronous code on the call stack until it is empty.\n2. Drain the **entire microtask queue** (running new microtasks they schedule too).\n3. Take **one** task from the macrotask queue and run it to completion.\n4. Drain microtasks again.\n5. (In the browser) render if needed. Repeat.\n\n### The key rule\n\n**Microtasks always run before the next macrotask.** That is why a resolved `Promise.then` callback runs before a `setTimeout(..., 0)` callback scheduled at the same time.",
    diagrams: [
      {
        title: "The runtime and the event loop",
        ascii:
          "        +-------------------+        +-----------------------+\n        |    Call Stack     |        |   Web / Host APIs     |\n        |  (one thread)     |        | setTimeout, fetch,    |\n        |                   |------->| DOM events, fs        |\n        +-------------------+        +-----------+-----------+\n                 ^                               | when done, enqueue callback\n                 |                               v\n            [ Event Loop ]  <----  Microtask queue (.then, queueMicrotask)\n                 |            <----  Macrotask queue (timers, I/O, events)\n                 |\n   pick microtasks first (drain all), then ONE macrotask, repeat",
        caption:
          "The engine runs code on the stack; the host runs async work; the loop feeds callbacks back in.",
      },
    ],
    playground: [
      {
        title: "Sync vs async ordering",
        descriptionMD:
          "Predict the order, then run it. Notice that the timer callback runs last even with a 0 ms delay.",
        code:
          "console.log('1: sync start');\n\nsetTimeout(function () {\n  console.log('2: setTimeout (macrotask)');\n}, 0);\n\nPromise.resolve().then(function () {\n  console.log('3: promise (microtask)');\n});\n\nconsole.log('4: sync end');",
      },
    ],
    outputPredictions: [
      {
        code:
          "console.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\nconsole.log('D');",
        answer: "A\nD\nC\nB",
        explanationMD:
          "Synchronous logs run first: **A**, then **D**. When the stack is empty, the event loop drains **microtasks** — the promise callback **C**. Only then does it run the next **macrotask**, the timer callback **B**. So the order is A, D, C, B.",
      },
    ],
    interviewQuestions: [
      {
        question: "Explain the JavaScript runtime and the role of the event loop.",
        answerMD:
          "The runtime is the engine plus the **call stack**, **heap**, host **Web APIs**, a **macrotask queue**, a **microtask queue**, and the **event loop**. Synchronous code runs on the single call stack. Async operations are handed to Web APIs, which enqueue a callback when they finish. The event loop waits for the stack to empty, then **drains all microtasks**, then runs **one macrotask**, and repeats. This is how a single-threaded language handles concurrency without blocking.",
        companies: ["Google", "Meta", "Amazon", "Microsoft"],
        followUps: [
          "Why do promises run before setTimeout?",
          "What happens if a microtask schedules another microtask?",
        ],
      },
    ],
    quiz: [
      {
        question: "Which queue does the event loop drain completely before running the next task?",
        options: [
          "The macrotask queue",
          "The microtask queue",
          "The call stack",
          "The render queue",
        ],
        correctIndex: 1,
        explanationMD:
          "The event loop drains the **entire** microtask queue after each task and before the next macrotask, which is why promise callbacks have priority over timers.",
      },
    ],
    summary: [
      "The runtime = engine + call stack + heap + host APIs + queues + event loop.",
      "There is one call stack; async work is done by host Web APIs off the stack.",
      "The event loop drains all microtasks, then runs one macrotask, and repeats.",
      "Microtasks (promises) always run before the next macrotask (timers, I/O).",
    ],
    cheatSheetMD:
      "**Runtime pieces:** call stack (1), heap, Web APIs, macrotask queue, microtask queue, event loop.\n\n**Loop order:** run sync → drain ALL microtasks → run ONE macrotask → repeat.\n\n**Priority:** microtasks (`.then`, `queueMicrotask`) > macrotasks (`setTimeout`, I/O, events).\n\n**Mantra:** \"stack empty → microtasks → one macrotask → microtasks → …\"",
  },

  // 7 ---------------------------------------------------------------------
  {
    slug: "js-compilation-vs-interpretation",
    moduleId: "fundamentals",
    order: 7,
    title: "Compilation vs Interpretation (JIT)",
    difficulty: "Intermediate",
    estimatedReadingMin: 7,
    estimatedPracticeMin: 2,
    tags: ["JIT", "Compilation", "Interpretation", "Performance"],
    introMD:
      "Is JavaScript compiled or interpreted? The honest answer is **both**. Modern engines use **Just-In-Time (JIT)** compilation: they interpret bytecode for fast startup and compile hot code to native machine code for speed.\n\nUnderstanding this removes a common misconception and explains why benchmarks \"warm up\".",
    whyItMattersMD:
      "Saying \"JavaScript is interpreted\" in a senior interview is a red flag. Explaining the JIT pipeline — and phenomena like warm-up and deoptimisation — shows real depth.",
    theoryMD:
      "### The classic definitions\n\n- **Interpreter** — reads and executes code line by line. Fast to start, slower to run.\n- **Compiler (AOT)** — translates the whole program to machine code before running. Slow to start, fast to run.\n\n### JIT: the best of both\n\nA **Just-In-Time** compiler combines them:\n\n1. Code is parsed to an AST and compiled to **bytecode**, which an interpreter runs immediately (fast startup).\n2. A **profiler** counts how often each function runs and records the **types** it sees.\n3. **Hot** functions are recompiled to optimised **machine code** using those type assumptions.\n4. If an assumption is violated later (a \"number\" argument suddenly is a string), the engine **deoptimises** — throws away the optimised code and falls back to bytecode.\n\n### Consequences you can observe\n\n- **Warm-up:** the same loop gets faster after running many times as the JIT kicks in.\n- **Deopt cost:** type-unstable code (changing shapes/types) can be slower than stable code because it keeps deoptimising.\n- **Monomorphism wins:** functions that always see the same types are the easiest to optimise.",
    diagrams: [
      {
        title: "Interpreter vs AOT vs JIT",
        ascii:
          "Interpreter : source --> run line by line            (fast start, slow run)\nAOT compiler: source --> machine code --> run         (slow start, fast run)\nJIT (JS)    : source --> bytecode --> run             (fast start)\n                         + profile hot code\n                         --> optimise to machine code (fast run)\n                         --> deopt if assumptions break",
        caption: "JIT gives fast startup and, for hot code, near-native speed.",
      },
    ],
    outputPredictions: [
      {
        code:
          "function add(a, b) {\n  return a + b;\n}\n\n// Stable types: the JIT can optimise this well\nlet total = 0;\nfor (let i = 0; i < 5; i++) {\n  total = add(total, i);\n}\nconsole.log(total);",
        answer: "10",
        explanationMD:
          "`add` is called with **numbers** every time, so the JIT can compile a fast, monomorphic version. The loop sums 0+0, +1, +2, +3, +4 = **10**. If you sometimes called `add('x', 'y')`, the function would become polymorphic and harder to optimise.",
      },
    ],
    interviewQuestions: [
      {
        question: "Is JavaScript compiled or interpreted?",
        answerMD:
          "Both. Modern engines use **JIT compilation**: source is compiled to bytecode and interpreted for fast startup, then **hot** functions are compiled to optimised machine code at runtime using type feedback, with **deoptimisation** as a safety net. Describing JS as purely interpreted is inaccurate for engines like V8.",
        companies: ["Google", "Microsoft", "Apple"],
      },
      {
        question: "What is deoptimisation and how do I avoid triggering it?",
        answerMD:
          "Deoptimisation is when the engine discards optimised machine code because a runtime assumption (usually about types or object shape) was violated, falling back to slower bytecode. Avoid it by keeping functions **monomorphic** — pass consistent types, keep object shapes stable, and don't mix element types in hot arrays.",
      },
    ],
    quiz: [
      {
        question: "What best describes JIT compilation?",
        options: [
          "Compile the whole program to machine code before running",
          "Interpret every line, never compile",
          "Interpret bytecode, then compile hot code to machine code at runtime",
          "Convert JS to another language like TypeScript",
        ],
        correctIndex: 2,
        explanationMD:
          "JIT interprets bytecode for fast startup and compiles frequently-executed (hot) code to native machine code during execution.",
      },
    ],
    summary: [
      "Modern JavaScript uses JIT compilation — it is both interpreted and compiled.",
      "Bytecode gives fast startup; hot functions are JIT-compiled to machine code.",
      "The engine deoptimises when runtime type/shape assumptions are violated.",
      "Type-stable, monomorphic code is the easiest for the JIT to optimise.",
    ],
  },

  // 8 ---------------------------------------------------------------------
  {
    slug: "js-single-threaded",
    moduleId: "fundamentals",
    order: 8,
    title: "The Single-Threaded Model",
    difficulty: "Intermediate",
    estimatedReadingMin: 8,
    estimatedPracticeMin: 4,
    tags: ["Concurrency", "Call Stack", "Blocking", "Event Loop"],
    introMD:
      "JavaScript runs your code on a **single thread** with **one call stack**. Only one statement executes at any instant. Yet apps feel concurrent — they fetch data, animate, and respond to clicks \"at the same time\".\n\nThe resolution to this apparent paradox is **non-blocking, asynchronous I/O**: the single thread offloads slow work to the host and keeps moving.",
    whyItMattersMD:
      "This model explains why a long synchronous loop **freezes the whole UI**, why `setTimeout(fn, 0)` still runs after your code, and why CPU-heavy work belongs in a **Web Worker**. It is one of the most common senior-level discussion topics.",
    theoryMD:
      "### Single thread, one call stack\n\nEvery function call pushes a frame; every return pops one. Because there is only one stack, JavaScript cannot run two functions truly simultaneously. \"Run-to-completion\" applies: a function runs fully before anything else can.\n\n### Blocking is the enemy\n\nIf a function takes a long time (a huge loop, synchronous file read, `alert`), the single thread is **blocked** — no other code, events, or rendering can happen until it returns. In a browser this looks like a frozen page.\n\n### How concurrency is achieved anyway\n\nSlow operations are handed to the **host** (Web APIs / libuv), which may use its own threads under the hood. When the work finishes, a **callback** is queued and the event loop runs it once the stack is clear. The JS you write stays single-threaded; the *environment* provides the concurrency.\n\n### True parallelism: Web Workers\n\nFor CPU-bound work, browsers offer **Web Workers** (and Node offers **worker threads**): separate threads with their **own** call stack and memory, communicating via message passing. They don't share the main thread's variables, which keeps the model race-free by default.",
    diagrams: [
      {
        title: "Run-to-completion on one stack",
        ascii:
          "Time --->\nmain()  [==================================]\n            push a()  [====]\n                push b() [==]\n            (b returns) pop\n            (a returns) pop\n(main returns) pop\n\nNothing else runs until the stack is empty. A long frame blocks everything.",
        caption:
          "One call stack means one thing at a time; long tasks block the whole app.",
      },
    ],
    playground: [
      {
        title: "See non-blocking scheduling",
        descriptionMD:
          "The timer is scheduled first but runs last, because the synchronous code must finish (run-to-completion) before any queued callback.",
        code:
          "console.log('start');\n\nsetTimeout(function () {\n  console.log('timeout callback');\n}, 0);\n\n// Synchronous work runs to completion first\nlet sum = 0;\nfor (let i = 0; i < 1000000; i++) {\n  sum += i;\n}\nconsole.log('finished loop, sum =', sum);\nconsole.log('end');",
      },
    ],
    outputPredictions: [
      {
        code:
          "console.log('one');\nsetTimeout(() => console.log('two'), 0);\nconsole.log('three');",
        answer: "one\nthree\ntwo",
        explanationMD:
          "`setTimeout` hands its callback to the host and returns immediately — it does **not** pause the thread. The synchronous logs **one** and **three** run first; the callback **two** runs only after the stack is empty. Hence one, three, two.",
      },
    ],
    codingExercises: [
      {
        title: "Don't block the thread: chunk the work",
        difficulty: "Medium",
        promptMD:
          "You must sum the numbers 0..N where N is very large, but you must **not freeze the UI**. Write a function `sumInChunks(n, chunkSize, done)` that processes the sum in small chunks, yielding to the event loop between chunks, and calls `done(total)` when finished.",
        hints: [
          "Use setTimeout(fn, 0) to yield control back to the event loop between chunks.",
          "Keep a running index and running total across chunks.",
          "Process only `chunkSize` numbers per tick, then schedule the next tick.",
        ],
        solutionCode:
          "function sumInChunks(n, chunkSize, done) {\n  let i = 0;\n  let total = 0;\n\n  function processChunk() {\n    const end = Math.min(i + chunkSize, n + 1);\n    while (i < end) {\n      total += i;\n      i++;\n    }\n    if (i <= n) {\n      // Yield to the event loop so the UI stays responsive\n      setTimeout(processChunk, 0);\n    } else {\n      done(total);\n    }\n  }\n\n  processChunk();\n}\n\nsumInChunks(1000000, 50000, function (total) {\n  console.log('total =', total);\n});",
        complexity: { time: "O(n)", space: "O(1)" },
        explanationMD:
          "By processing `chunkSize` items per tick and scheduling the next chunk with `setTimeout(..., 0)`, the thread returns to the event loop between chunks. That lets the browser handle events and repaint, so the page stays responsive while the total is computed. For real CPU-bound work, a **Web Worker** is the production-grade answer.",
      },
    ],
    interviewQuestions: [
      {
        question: "If JavaScript is single-threaded, how can it do things concurrently?",
        answerMD:
          "The **JavaScript code** runs on one thread with one call stack, but the **environment** provides concurrency. Slow operations (timers, network, file I/O) are delegated to host **Web APIs**/libuv, which may use OS threads. When they complete, a callback is queued and the **event loop** runs it once the stack is empty. So concurrency comes from non-blocking I/O and the event loop, not from multiple JS threads.",
        companies: ["Amazon", "Meta", "Microsoft"],
        followUps: [
          "What blocks the main thread and how do you avoid it?",
          "When would you reach for a Web Worker?",
        ],
      },
      {
        question: "What does it mean that JavaScript has 'run-to-completion' semantics?",
        answerMD:
          "Once a function starts, it runs **fully** before any other queued task or callback can execute — the event loop won't interrupt it. This makes reasoning about state easier (no pre-emption mid-function) but means a long-running function blocks everything, including rendering and events.",
      },
    ],
    quiz: [
      {
        question: "Why does a long synchronous for-loop freeze the browser UI?",
        options: [
          "Because loops are always slow",
          "Because the single thread is blocked and can't process events or render",
          "Because setTimeout is disabled during loops",
          "Because the garbage collector stops",
        ],
        correctIndex: 1,
        explanationMD:
          "With one thread and run-to-completion, a long loop occupies the call stack, so no events, callbacks, or repaints can happen until it finishes.",
      },
      {
        question: "Where should heavy CPU-bound work go to keep the UI responsive?",
        options: [
          "In a setInterval",
          "In a Web Worker (separate thread)",
          "In a Promise",
          "In a bigger for-loop",
        ],
        correctIndex: 1,
        explanationMD:
          "A Web Worker runs on its own thread with its own stack and memory, communicating via messages, so it won't block the main thread. Promises and timers still run on the main thread.",
      },
    ],
    summary: [
      "JavaScript executes your code on one thread with a single call stack.",
      "Run-to-completion: a function finishes before anything else runs.",
      "Long synchronous work blocks events and rendering — keep tasks short.",
      "Concurrency comes from non-blocking host APIs + the event loop; parallelism from Web Workers.",
    ],
    cheatSheetMD:
      "**Model:** one thread, one call stack, run-to-completion.\n\n**Blocking:** long sync work freezes UI (no events, no repaint).\n\n**Concurrency:** host APIs do slow work off-thread → queue callbacks → event loop.\n\n**Parallelism:** Web Workers / worker threads (own stack + memory, message passing).",
  },

  // 9 ---------------------------------------------------------------------
  {
    slug: "js-event-loop-intro",
    moduleId: "fundamentals",
    order: 9,
    title: "The Event Loop (Introduction)",
    difficulty: "Intermediate",
    estimatedReadingMin: 9,
    estimatedPracticeMin: 5,
    tags: ["Event Loop", "Microtasks", "Macrotasks", "Async"],
    introMD:
      "The **event loop** is the mechanism that lets single-threaded JavaScript be **asynchronous and non-blocking**. It continuously checks: *is the call stack empty? If so, what callback should run next?*\n\nThis is a first, practical introduction — Module 8 revisits it in full depth. Master the ordering rules here and most \"what's the output?\" questions become easy.",
    whyItMattersMD:
      "The event loop is *the* most-asked JavaScript interview topic. Being able to trace macrotasks vs microtasks out loud, correctly, instantly signals competence. It also underpins real debugging: race conditions, UI jank, and unexpected ordering.",
    theoryMD:
      "### The core loop\n\nThe event loop repeats these steps forever:\n\n1. If the **call stack** is not empty, keep running (synchronous code has priority).\n2. When the stack is empty, run **every** queued **microtask** (draining the queue, including microtasks scheduled by microtasks).\n3. Run **one** **macrotask** (a.k.a. task) from the task queue.\n4. Go back to step 2 (drain microtasks again).\n5. In the browser, render between iterations if needed.\n\n### Macrotasks vs microtasks\n\n| | Macrotasks (tasks) | Microtasks |\n| --- | --- | --- |\n| Examples | `setTimeout`, `setInterval`, I/O, UI events, `setImmediate` (Node) | `Promise.then/catch/finally`, `queueMicrotask`, `await` continuation, `MutationObserver` |\n| When they run | one per loop iteration | **all** of them, after each task |\n| Priority | lower | higher |\n\n### The golden rules\n\n1. **Synchronous code always runs first**, to completion.\n2. **All microtasks** run before the **next** macrotask.\n3. `setTimeout(fn, 0)` does **not** run immediately — it queues a macrotask.\n4. `await x` pauses the async function and schedules the rest as a **microtask**.\n\n### Watch out: microtask starvation\n\nBecause the loop drains **all** microtasks before the next task, a microtask that keeps scheduling more microtasks can **starve** timers and rendering forever. Prefer not to recurse infinitely in microtasks.",
    diagrams: [
      {
        title: "One turn of the event loop",
        ascii:
          "call stack empty?\n      |\n      v\n[ drain ALL microtasks ]  <-- .then, queueMicrotask, await continuations\n      |\n      v\n[ run ONE macrotask ]     <-- setTimeout, I/O, UI event\n      |\n      v\n[ drain ALL microtasks ]\n      |\n      v\n[ render if needed ] --> repeat",
        caption: "Microtasks are fully drained after every single macrotask.",
      },
    ],
    playground: [
      {
        title: "Trace the full ordering",
        descriptionMD:
          "Predict every line's position, then run. Try adding a nested `.then` inside a `.then` and see it still run before the timeout.",
        code:
          "console.log('1 sync');\n\nsetTimeout(function () {\n  console.log('5 timeout (macrotask)');\n}, 0);\n\nPromise.resolve()\n  .then(function () {\n    console.log('3 promise 1 (microtask)');\n  })\n  .then(function () {\n    console.log('4 promise 2 (microtask)');\n  });\n\nconsole.log('2 sync');",
      },
      {
        title: "async/await is microtasks in disguise",
        descriptionMD:
          "The code after `await` is scheduled as a microtask, so it runs before the timeout.",
        code:
          "async function run() {\n  console.log('A');\n  await null; // pause; resume as a microtask\n  console.log('C');\n}\n\nsetTimeout(function () {\n  console.log('D timeout');\n}, 0);\n\nrun();\nconsole.log('B');",
      },
    ],
    outputPredictions: [
      {
        code:
          "console.log('start');\n\nsetTimeout(() => console.log('timeout'), 0);\n\nPromise.resolve().then(() => {\n  console.log('promise 1');\n  Promise.resolve().then(() => console.log('promise 2'));\n});\n\nconsole.log('end');",
        answer: "start\nend\npromise 1\npromise 2\ntimeout",
        explanationMD:
          "Sync first: **start**, **end**. Draining microtasks runs **promise 1**, which schedules another microtask; the loop keeps draining, so **promise 2** runs *before* the macrotask. Only then does **timeout** run. Nested microtasks still beat a timer.",
      },
      {
        code:
          "async function f() {\n  console.log('1');\n  await Promise.resolve();\n  console.log('3');\n}\nf();\nconsole.log('2');",
        answer: "1\n2\n3",
        explanationMD:
          "`f()` runs synchronously up to the `await`, logging **1**. `await` suspends `f` and schedules the continuation as a microtask, so control returns and **2** logs. When the stack clears, the microtask resumes `f` and logs **3**.",
      },
    ],
    codingExercises: [
      {
        title: "Order the logs without running the code",
        difficulty: "Medium",
        promptMD:
          "Given the snippet below, write down the exact console output order. Then implement a function `scheduleOrdered()` that reproduces the order **A, D, B, C** using one `setTimeout` and one `Promise`.\n\n```\nconsole.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\nconsole.log('D');\n```\n\n(The snippet prints A, D, C, B. Your task: make it print A, D, B, C instead.)",
        hints: [
          "A and D are synchronous, so they always come first.",
          "To make B (timeout) come before C, schedule C from inside the timeout as a microtask, or schedule C with a longer timer.",
          "Nesting the promise inside the setTimeout guarantees B before C.",
        ],
        solutionCode:
          "function scheduleOrdered() {\n  console.log('A');\n\n  setTimeout(function () {\n    console.log('B');\n    // Scheduling C here guarantees it runs after B\n    Promise.resolve().then(function () {\n      console.log('C');\n    });\n  }, 0);\n\n  console.log('D');\n}\n\nscheduleOrdered(); // A, D, B, C",
        complexity: { time: "O(1)", space: "O(1)" },
        explanationMD:
          "A and D are synchronous. By moving the promise **inside** the timeout callback, C is only queued (as a microtask) once B is already running, so the order becomes A, D, B, C. This demonstrates that microtasks are relative to the task that schedules them.",
      },
    ],
    interviewQuestions: [
      {
        question: "Explain the difference between a macrotask and a microtask.",
        answerMD:
          "**Macrotasks** (tasks) include `setTimeout`, `setInterval`, I/O, and UI events; the event loop runs **one** per iteration. **Microtasks** include promise callbacks (`.then/.catch/.finally`), `queueMicrotask`, and `await` continuations; the loop runs **all** of them after each task and before the next task. Therefore microtasks have higher priority: a resolved promise callback runs before a `setTimeout(fn, 0)` scheduled at the same time.",
        companies: ["Google", "Meta", "Amazon", "Microsoft", "Netflix"],
        followUps: [
          "What is microtask starvation?",
          "Where does await fit in?",
          "Does the browser render between microtasks?",
        ],
      },
      {
        question: "Why does setTimeout(fn, 0) not run immediately?",
        answerMD:
          "`setTimeout` schedules a **macrotask**; it doesn't pause the current code. The callback can only run after (a) the current synchronous code finishes and (b) all pending microtasks are drained. The `0` is a *minimum* delay, not a guarantee — nested timers are also clamped to ~4 ms in browsers.",
      },
    ],
    quiz: [
      {
        question: "Which runs first when scheduled together: a resolved Promise.then or setTimeout(fn, 0)?",
        options: [
          "setTimeout, because 0 ms is immediate",
          "The Promise.then, because microtasks run before the next macrotask",
          "They run in random order",
          "They run at the same time",
        ],
        correctIndex: 1,
        explanationMD:
          "Promise callbacks are microtasks and are fully drained before the next macrotask (the timer callback), so the Promise.then runs first.",
      },
      {
        question: "The code after an `await` runs as…",
        options: [
          "Synchronous code",
          "A macrotask",
          "A microtask",
          "A Web Worker message",
        ],
        correctIndex: 2,
        explanationMD:
          "`await` suspends the async function and schedules its continuation as a microtask, so it resumes before the next macrotask.",
      },
    ],
    summary: [
      "The event loop runs queued callbacks when the call stack is empty.",
      "Order: all synchronous code → drain ALL microtasks → one macrotask → repeat.",
      "Microtasks (promises, await, queueMicrotask) outrank macrotasks (timers, I/O, events).",
      "setTimeout(fn, 0) queues a macrotask; it never runs before pending microtasks.",
    ],
    cheatSheetMD:
      "**Loop:** sync (run-to-completion) → drain ALL microtasks → 1 macrotask → repeat.\n\n**Microtasks:** `.then/.catch/.finally`, `queueMicrotask`, `await` continuation. Run **all** each turn.\n\n**Macrotasks:** `setTimeout`, `setInterval`, I/O, UI events. Run **one** per turn.\n\n**Rules:** sync first · microtasks before next macrotask · `setTimeout(fn,0)` = macrotask · beware microtask starvation.",
  },
];
