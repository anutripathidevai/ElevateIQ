import type { InterviewHub } from "../types";

/**
 * The JavaScript interview-prep hub: curated questions, machine-coding
 * problems, output-prediction puzzles, and a searchable cheat sheet. Authored
 * as representative, high-value content and structured to grow.
 */
export const JS_INTERVIEW_HUB: InterviewHub = {
  language: "javascript",
  questions: [
    {
      id: "hq-eq-vs-eqeq",
      question: "What is the difference between == and === in JavaScript?",
      difficulty: "Easy",
      answerMD: "### Short answer\n\n`===` performs **strict equality**: values must have the same type and value. `==` performs **loose equality**: when types differ, JavaScript tries to coerce one or both operands before comparing.\n\n### Interview-grade explanation\n\nPrefer `===` by default because it is predictable. Loose equality creates surprising truths such as `0 == false`, `\"\" == false`, and `null == undefined`. The common intentional exception is `value == null`, which checks for both `null` and `undefined`.\n\n`Object.is` is related but slightly different: it treats `NaN` as equal to itself and distinguishes `+0` from `-0`.",
      tags: ["Equality", "Coercion", "Fundamentals"],
    },
    {
      id: "hq-var-let-const",
      question: "How are var, let, and const different?",
      difficulty: "Easy",
      answerMD: "### Key differences\n\n| Feature | `var` | `let` | `const` |\n| --- | --- | --- | --- |\n| Scope | Function/global scoped | Block scoped | Block scoped |\n| Hoisting | Initialised to `undefined` | Hoisted but in TDZ | Hoisted but in TDZ |\n| Reassignment | Allowed | Allowed | Not allowed |\n| Redeclaration in same scope | Allowed | Not allowed | Not allowed |\n\nUse `const` by default, `let` when reassignment is needed, and avoid `var` in modern code. `const` does **not** make objects immutable; it only prevents rebinding the variable. `const user = {}` can still be mutated with `user.name = \"Ada\"`.\n\n`let` and `const` also avoid the classic loop-closure problem because each iteration gets a fresh block-scoped binding.",
      tags: ["Scope", "ES6", "Declarations"],
    },
    {
      id: "hq-null-vs-undefined",
      question: "What is the difference between null and undefined?",
      difficulty: "Easy",
      answerMD: "`undefined` usually means **a value has not been assigned**: an unpassed parameter, a missing object property, or a declared variable without an initial value. `null` is an **intentional empty value** chosen by the programmer.\n\nImportant details:\n\n- `typeof undefined` is `\"undefined\"`; `typeof null` is historically `\"object\"`.\n- `null == undefined` is `true`, but `null === undefined` is `false`.\n- Optional chaining and nullish coalescing (`?.`, `??`) treat both as nullish.\n\nA strong answer explains API intent: use `undefined` for omitted values and `null` when absence is a meaningful state, such as \"user intentionally cleared profile image\".",
      tags: ["Types", "Nullish", "Fundamentals"],
    },
    {
      id: "hq-closures",
      question: "What is a closure and why is it useful?",
      difficulty: "Medium",
      answerMD: "A **closure** is created when a function remembers variables from its lexical scope even after that outer scope has finished executing. The closed-over variables live as long as some reachable function can still access them.\n\nClosures are useful for:\n\n- **Data privacy**: expose methods while hiding internal state.\n- **Function factories**: create configured functions like `makeAdder(5)`.\n- **Async callbacks**: callbacks remember the state from when they were created.\n- **Memoization and decorators**: retain a cache between calls.\n\nA senior candidate also mentions the risk: closures can keep large objects alive, so long-lived listeners and caches must be cleaned up.",
      tags: ["Closures", "Scope", "Functions"],
    },
    {
      id: "hq-this-call-apply-bind",
      question: "How does this work in JavaScript, and how do call, apply, and bind differ?",
      difficulty: "Medium",
      answerMD: "`this` is determined mostly by **how a function is called**, not where it is defined.\n\nPractical rules:\n\n1. `new Fn()` creates a new object and binds `this` to it.\n2. `obj.method()` binds `this` to `obj`.\n3. `fn.call(x, a)` / `fn.apply(x, [a])` explicitly bind `this` for one call.\n4. `fn.bind(x)` returns a new function permanently bound to `x`.\n5. Plain `fn()` uses `undefined` in strict mode, or the global object in sloppy mode.\n\nArrow functions do not have their own `this`; they capture `this` lexically from the surrounding scope. `call` passes arguments individually, `apply` passes an array-like list, and `bind` does not execute immediately.",
      tags: ["this", "Functions", "Binding"],
    },
    {
      id: "hq-prototype-chain",
      question: "Explain prototypal inheritance and the prototype chain.",
      difficulty: "Medium",
      answerMD: "JavaScript objects inherit from other objects through an internal `[[Prototype]]` link. When you read `obj.x`, the engine checks `obj` first, then walks up the prototype chain until it finds `x` or reaches `null`.\n\nConstructor functions use their `.prototype` object as the prototype for instances created with `new`. ES6 `class` syntax is mostly a cleaner syntax over the same prototype-based model.\n\nImportant interview points:\n\n- Own properties shadow prototype properties.\n- Methods are usually placed on the prototype so all instances share one function.\n- `Object.create(proto)` creates an object with an explicit prototype.\n- `Object.getPrototypeOf(obj)` is preferred over `obj.__proto__` for inspection.\n\nPrototype lookup is dynamic, so changing a prototype method can affect existing instances.",
      tags: ["Prototype", "Inheritance", "Objects"],
    },
    {
      id: "hq-hoisting-tdz",
      question: "What is hoisting and what is the temporal dead zone?",
      difficulty: "Medium",
      answerMD: "**Hoisting** means declarations are processed before code execution within their scope. It does not literally move code; it is a consequence of the creation phase of an execution context.\n\n`var` declarations are hoisted and initialised to `undefined`, so reading them before the declaration returns `undefined`. Function declarations are hoisted with their function value, so they can be called before they appear.\n\n`let` and `const` are also hoisted, but they are not initialised until their declaration is evaluated. The period from entering the scope until initialisation is the **temporal dead zone (TDZ)**. Accessing the binding during the TDZ throws `ReferenceError`.",
      tags: ["Hoisting", "TDZ", "Execution Context"],
    },
    {
      id: "hq-shallow-vs-deep-copy",
      question: "What is the difference between shallow copy and deep copy?",
      difficulty: "Medium",
      answerMD: "A **shallow copy** copies the top-level container but keeps references to nested objects. For example, `{ ...user }` creates a new outer object, but `user.address` and `copy.address` still point to the same object.\n\nA **deep copy** recursively copies nested data so changes to the clone do not affect the original. In modern JavaScript, `structuredClone(value)` is the safest built-in for many serialisable values, including Dates, Maps, Sets, typed arrays, and cycles.\n\nCommon caveats:\n\n- Spread and `Object.assign` are shallow.\n- `JSON.parse(JSON.stringify(obj))` drops functions, `undefined`, symbols, `Date` identity, `Map`, `Set`, `BigInt`, and cycles.\n- Deep cloning class instances, accessors, DOM nodes, or functions requires clear requirements.",
      tags: ["Objects", "Copying", "References"],
    },
    {
      id: "hq-promises-async-combinators",
      question: "Compare promises with async/await, and Promise.all, allSettled, and race.",
      difficulty: "Medium",
      answerMD: "A **Promise** represents a future value that is pending, fulfilled, or rejected. `async/await` is syntax built on promises: an `async` function always returns a promise, and `await` pauses that function until the awaited value settles while letting the event loop continue.\n\nCombinators:\n\n- `Promise.all([...])`: resolves when all resolve, preserves input order, rejects fast on the first rejection.\n- `Promise.allSettled([...])`: waits for every promise and returns `{ status, value/reason }` results; it does not reject because one input failed.\n- `Promise.race([...])`: settles as soon as the first input settles, whether fulfilled or rejected.\n- `Promise.any([...])`: fulfils on the first fulfilment, rejects with `AggregateError` only if all reject.\n\nUse `try/catch` around `await` for local error handling. Start independent promises before awaiting if you want parallelism.",
      tags: ["Promises", "Async Await", "Concurrency"],
    },
    {
      id: "hq-debounce-vs-throttle",
      question: "What is the difference between debounce and throttle?",
      difficulty: "Medium",
      answerMD: "**Debounce** waits until calls stop for a given delay, then runs once. It is ideal for \"do this after the user pauses\" tasks such as search suggestions, resize-final calculations, or autosave after typing stops.\n\n**Throttle** guarantees at most one call per time window. It is ideal for continuous streams where you still need regular updates, such as scroll tracking, drag movement, or rate-limited analytics.\n\nInterview distinction:\n\n- Debounce collapses a burst into the **last** call after quiet time.\n- Throttle samples a burst at a **fixed maximum frequency**.\n\nGood implementations preserve `this` and arguments, expose cancellation, and document leading/trailing behavior.",
      tags: ["Performance", "Timers", "Frontend"],
    },
    {
      id: "hq-event-loop-microtasks",
      question: "Explain the event loop, microtasks, and macrotasks.",
      difficulty: "Hard",
      answerMD: "JavaScript runs synchronous code on a single call stack. The host environment provides async APIs and queues callbacks. The **event loop** repeatedly runs one task, lets the stack empty, drains the microtask queue, then may render, then moves to the next task.\n\nImportant ordering:\n\n1. Run the current synchronous script/task.\n2. Drain **microtasks** completely: promise `.then`, `catch`, `finally`, `queueMicrotask`, and `await` continuations.\n3. Run the next **task/macrotask**: `setTimeout`, `setInterval`, UI events, network callbacks, message events.\n\nBecause microtasks drain before timers, `Promise.resolve().then(...)` runs before `setTimeout(..., 0)`. A long microtask chain can starve rendering and delay timers.",
      tags: ["Event Loop", "Microtasks", "Async"],
    },
    {
      id: "hq-currying-partial-application",
      question: "Explain currying and partial application.",
      difficulty: "Hard",
      answerMD: "**Currying** transforms a function of multiple arguments into a chain of unary functions: `add(a, b, c)` becomes `curriedAdd(a)(b)(c)`. Each call captures one argument in a closure until enough arguments are collected.\n\n**Partial application** fixes some arguments of a function and returns a new function waiting for the rest: `partial(add, 2)(3, 4)`. It does not require one argument per call.\n\nWhy it matters:\n\n- Creates reusable specialised functions, like `multiplyBy(10)`.\n- Enables functional composition and pipelines.\n- Helps dependency injection by pre-filling configuration.\n\nA strong answer mentions trade-offs: curried APIs can improve composition but may reduce readability, and `this` handling must be intentional.",
      tags: ["Functional Programming", "Closures", "Currying"],
    },
  ],
  codingQuestions: [
    {
      id: "hc-implement-debounce",
      title: "Implement debounce",
      difficulty: "Medium",
      promptMD: "### Problem\n\nImplement `debounce(fn, wait, options)` that returns a debounced version of `fn`. The debounced function should postpone execution until `wait` milliseconds have passed since the most recent call.\n\n### Requirements\n\n- Preserve the caller's `this` and latest arguments.\n- Support `options.leading === true` to run immediately on the first call in a burst.\n- Support `options.trailing !== false` so trailing execution is enabled by default.\n- Expose `cancel()` to drop a pending call and `flush()` to immediately run the pending trailing call.",
      approachMD: "Track one timer and the latest call context. Every invocation replaces the pending arguments and resets the timer. If `leading` is enabled and there is no active timer, invoke immediately. When the timer expires, run the latest saved call only if trailing execution is enabled and a call is still pending.",
      solutionCode: "function debounce(fn, wait, options) {\n  if (typeof fn !== 'function') {\n    throw new TypeError('fn must be a function');\n  }\n\n  options = options || {};\n  var leading = options.leading === true;\n  var trailing = options.trailing !== false;\n  var timerId = null;\n  var lastArgs;\n  var lastThis;\n  var result;\n\n  function invoke() {\n    var args = lastArgs;\n    var context = lastThis;\n    lastArgs = undefined;\n    lastThis = undefined;\n    result = fn.apply(context, args);\n    return result;\n  }\n\n  function startTimer() {\n    timerId = setTimeout(function () {\n      timerId = null;\n      if (trailing && lastArgs) {\n        invoke();\n      } else {\n        lastArgs = undefined;\n        lastThis = undefined;\n      }\n    }, wait);\n  }\n\n  function debounced() {\n    lastArgs = arguments;\n    lastThis = this;\n\n    var shouldInvokeLeading = leading && timerId === null;\n\n    if (timerId !== null) {\n      clearTimeout(timerId);\n    }\n    startTimer();\n\n    if (shouldInvokeLeading) {\n      return invoke();\n    }\n\n    return result;\n  }\n\n  debounced.cancel = function () {\n    if (timerId !== null) {\n      clearTimeout(timerId);\n    }\n    timerId = null;\n    lastArgs = undefined;\n    lastThis = undefined;\n  };\n\n  debounced.flush = function () {\n    if (timerId === null) {\n      return result;\n    }\n\n    clearTimeout(timerId);\n    timerId = null;\n\n    if (lastArgs && trailing) {\n      return invoke();\n    }\n\n    lastArgs = undefined;\n    lastThis = undefined;\n    return result;\n  };\n\n  return debounced;\n}\n\n// Example:\n// var save = debounce(function (value) { console.log('save ' + value); }, 300);\n// save('a');\n// save('ab');\n// save('abc');",
      complexity: { time: "O(1) per call", space: "O(1)" },
      discussionMD: "Edge cases interviewers care about: preserving `this`, using the latest arguments, cancelling pending work when a component unmounts, and defining leading/trailing behavior precisely. In UI code, debounce is useful for search boxes and resize handlers, but it can make interfaces feel laggy if the wait is too high.",
    },
    {
      id: "hc-implement-throttle",
      title: "Implement throttle",
      difficulty: "Medium",
      promptMD: "### Problem\n\nImplement `throttle(fn, wait, options)` that returns a throttled version of `fn`. The throttled function should execute at most once every `wait` milliseconds.\n\n### Requirements\n\n- Preserve `this` and the latest arguments.\n- Run on the leading edge by default.\n- Run one trailing call by default if calls happened during the blocked window.\n- Support `options.leading === false`, `options.trailing === false`, plus `cancel()`.",
      approachMD: "Store the time of the last real invocation. On each call, compute how much time remains in the current window. If the window has expired, invoke immediately. Otherwise, if trailing execution is allowed and no timer is scheduled, schedule one invocation using the latest saved arguments.",
      solutionCode: "function throttle(fn, wait, options) {\n  if (typeof fn !== 'function') {\n    throw new TypeError('fn must be a function');\n  }\n\n  options = options || {};\n  var leading = options.leading !== false;\n  var trailing = options.trailing !== false;\n  var timerId = null;\n  var lastInvokeTime = 0;\n  var lastArgs;\n  var lastThis;\n  var result;\n\n  function invoke(time) {\n    lastInvokeTime = time;\n    var args = lastArgs;\n    var context = lastThis;\n    lastArgs = undefined;\n    lastThis = undefined;\n    result = fn.apply(context, args);\n    return result;\n  }\n\n  function remainingWait(time) {\n    return wait - (time - lastInvokeTime);\n  }\n\n  function timerExpired() {\n    timerId = null;\n\n    if (trailing && lastArgs) {\n      invoke(Date.now());\n    } else {\n      lastArgs = undefined;\n      lastThis = undefined;\n    }\n  }\n\n  function throttled() {\n    var now = Date.now();\n\n    if (lastInvokeTime === 0 && leading === false) {\n      lastInvokeTime = now;\n    }\n\n    lastArgs = arguments;\n    lastThis = this;\n\n    var remaining = remainingWait(now);\n\n    if (remaining <= 0 || remaining > wait) {\n      if (timerId !== null) {\n        clearTimeout(timerId);\n        timerId = null;\n      }\n      return invoke(now);\n    }\n\n    if (timerId === null && trailing) {\n      timerId = setTimeout(timerExpired, remaining);\n    }\n\n    return result;\n  }\n\n  throttled.cancel = function () {\n    if (timerId !== null) {\n      clearTimeout(timerId);\n    }\n    timerId = null;\n    lastInvokeTime = 0;\n    lastArgs = undefined;\n    lastThis = undefined;\n  };\n\n  return throttled;\n}\n\n// Example:\n// var onScroll = throttle(function (y) { console.log('scroll ' + y); }, 100);",
      complexity: { time: "O(1) per call", space: "O(1)" },
      discussionMD: "Throttle is about regular sampling, not waiting for silence. Clarify whether the first call should run immediately and whether the final call should be delivered. In production, `requestAnimationFrame` can be better for visual updates because it aligns work with browser rendering.",
    },
    {
      id: "hc-implement-deep-clone",
      title: "Implement a deep clone",
      difficulty: "Medium",
      promptMD: "### Problem\n\nImplement `deepClone(value)` for common JavaScript data structures.\n\n### Requirements\n\n- Return primitives and functions as-is.\n- Clone arrays, plain objects, class instances, `Date`, `RegExp`, `Map`, `Set`, and `ArrayBuffer`.\n- Preserve circular references.\n- Preserve property descriptors and symbol keys for objects where practical.",
      approachMD: "Use recursion plus a `WeakMap` from original objects to their clones. Store the clone in the map **before** cloning children so cycles can point back to it. Handle built-ins with special constructors, then fall back to creating an object with the same prototype and copying own property descriptors.",
      solutionCode: "function deepClone(value, seen) {\n  if (value === null || typeof value !== 'object') {\n    return value;\n  }\n\n  if (typeof seen === 'undefined') {\n    seen = new WeakMap();\n  }\n\n  if (seen.has(value)) {\n    return seen.get(value);\n  }\n\n  if (value instanceof Date) {\n    return new Date(value.getTime());\n  }\n\n  if (value instanceof RegExp) {\n    var copiedRegExp = new RegExp(value.source, value.flags);\n    copiedRegExp.lastIndex = value.lastIndex;\n    return copiedRegExp;\n  }\n\n  if (value instanceof ArrayBuffer) {\n    return value.slice(0);\n  }\n\n  if (value instanceof Map) {\n    var copiedMap = new Map();\n    seen.set(value, copiedMap);\n    value.forEach(function (mapValue, mapKey) {\n      copiedMap.set(deepClone(mapKey, seen), deepClone(mapValue, seen));\n    });\n    return copiedMap;\n  }\n\n  if (value instanceof Set) {\n    var copiedSet = new Set();\n    seen.set(value, copiedSet);\n    value.forEach(function (setValue) {\n      copiedSet.add(deepClone(setValue, seen));\n    });\n    return copiedSet;\n  }\n\n  var clone = Array.isArray(value)\n    ? []\n    : Object.create(Object.getPrototypeOf(value));\n\n  seen.set(value, clone);\n\n  Reflect.ownKeys(value).forEach(function (key) {\n    var descriptor = Object.getOwnPropertyDescriptor(value, key);\n    if (!descriptor) {\n      return;\n    }\n\n    if (Object.prototype.hasOwnProperty.call(descriptor, 'value')) {\n      descriptor.value = deepClone(descriptor.value, seen);\n    }\n\n    Object.defineProperty(clone, key, descriptor);\n  });\n\n  return clone;\n}\n\n// Example:\n// var original = { name: 'Ada', meta: { active: true } };\n// original.self = original;\n// var copy = deepClone(original);\n// console.log(copy !== original);\n// console.log(copy.meta !== original.meta);\n// console.log(copy.self === copy);",
      complexity: {
        time: "O(n), where n is the number of reachable entries/properties",
        space: "O(n) for recursion and the WeakMap",
      },
      discussionMD: "Deep cloning is requirement-sensitive. This implementation handles many interview cases, but production code may prefer `structuredClone` when supported. Discuss limitations: functions are shared, WeakMap/WeakSet cannot be enumerated, DOM nodes need DOM APIs, and cloning class instances may not preserve private fields.",
    },
    {
      id: "hc-implement-memoize",
      title: "Implement memoize",
      difficulty: "Medium",
      promptMD: "### Problem\n\nImplement `memoize(fn, resolver)` that caches results of expensive function calls.\n\n### Requirements\n\n- Without a resolver, cache by the full argument list using argument identity for objects.\n- With a resolver, use `resolver(...args)` as the cache key.\n- Preserve `this` when invoking the original function.\n- Expose `clear()` to empty the cache.",
      approachMD: "A single `JSON.stringify(args)` key is fragile because object key order, cycles, and reference identity can break it. Instead, use a tree of nested `Map` objects: each argument moves one level deeper. At the leaf, store the computed result under a private symbol.",
      solutionCode: "function memoize(fn, resolver) {\n  if (typeof fn !== 'function') {\n    throw new TypeError('fn must be a function');\n  }\n\n  var root = new Map();\n  var RESULT = Symbol('result');\n\n  function memoized() {\n    var keyParts;\n\n    if (typeof resolver === 'function') {\n      keyParts = [resolver.apply(this, arguments)];\n    } else {\n      keyParts = Array.prototype.slice.call(arguments);\n    }\n\n    var node = root;\n    for (var i = 0; i < keyParts.length; i += 1) {\n      var key = keyParts[i];\n      if (!node.has(key)) {\n        node.set(key, new Map());\n      }\n      node = node.get(key);\n    }\n\n    if (node.has(RESULT)) {\n      return node.get(RESULT);\n    }\n\n    var result = fn.apply(this, arguments);\n    node.set(RESULT, result);\n    return result;\n  }\n\n  memoized.clear = function () {\n    root.clear();\n  };\n\n  memoized.cache = root;\n  return memoized;\n}\n\n// Example:\n// var slowSquare = memoize(function (n) {\n//   console.log('computing');\n//   return n * n;\n// });\n// console.log(slowSquare(9));\n// console.log(slowSquare(9));",
      complexity: {
        time: "O(k) per cache lookup, where k is the number of key parts, plus original function cost on a miss",
        space: "O(m * k) for m cached argument paths",
      },
      discussionMD: "Memoization is best for pure functions: same inputs should always produce the same output and no important side effects should be skipped. Discuss cache invalidation, memory growth, object identity vs structural equality, and whether rejected promises should be cached for async functions.",
    },
  ],
  outputPredictions: [
    {
      code: "console.log('A');\nsetTimeout(function () {\n  console.log('B');\n}, 0);\nPromise.resolve().then(function () {\n  console.log('C');\n});\nconsole.log('D');",
      answer: "A\nD\nC\nB",
      explanationMD: "The current script runs first, so `A` and `D` print synchronously. Promise callbacks are microtasks and run after the stack clears but before timer tasks, so `C` prints before the `setTimeout` callback `B`.",
    },
    {
      code: "for (var i = 0; i < 3; i += 1) {\n  setTimeout(function () {\n    console.log('var ' + i);\n  }, 0);\n}\n\nfor (let j = 0; j < 3; j += 1) {\n  setTimeout(function () {\n    console.log('let ' + j);\n  }, 0);\n}",
      answer: "var 3\nvar 3\nvar 3\nlet 0\nlet 1\nlet 2",
      explanationMD: "`var` is function-scoped, so all three callbacks close over the same `i`, whose final value is `3`. `let` creates a fresh binding for each loop iteration, so the callbacks remember `0`, `1`, and `2`. Timers run in registration order here.",
    },
    {
      code: "console.log(typeof null);\nconsole.log(typeof NaN);\nconsole.log(typeof undefined);\nconsole.log(Number.isNaN(NaN));",
      answer: "object\nnumber\nundefined\ntrue",
      explanationMD: "`typeof null` is the famous legacy bug that returns `\"object\"`. `NaN` is still a number value, so `typeof NaN` is `\"number\"`. `Number.isNaN(NaN)` is the precise check for the actual `NaN` value.",
    },
    {
      code: "console.log(0.1 + 0.2);\nconsole.log(0.1 + 0.2 === 0.3);\nconsole.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON);",
      answer: "0.30000000000000004\nfalse\ntrue",
      explanationMD: "JavaScript uses IEEE-754 binary floating-point numbers. Many decimal fractions cannot be represented exactly, so `0.1 + 0.2` rounds to `0.30000000000000004`. Compare floating-point results with a tolerance when exact decimal math is not guaranteed.",
    },
    {
      code: "console.log('x' + ([] + []) + 'y');\nconsole.log([] + {});\nconsole.log([1, 2] + [3, 4]);",
      answer: "xy\n[object Object]\n1,23,4",
      explanationMD: "The `+` operator with objects performs primitive conversion. Arrays convert to comma-joined strings, so `[] + []` becomes an empty string and `[1, 2] + [3, 4]` becomes `\"1,2\" + \"3,4\"`. A plain object converts to `\"[object Object]\"`.",
    },
    {
      code: "console.log(a);\nvar a = 10;\nconsole.log(b);\nlet b = 20;",
      answer: "undefined\nReferenceError: Cannot access 'b' before initialization",
      explanationMD: "`var a` is hoisted and initialised to `undefined`, so the first log succeeds. `let b` is hoisted but remains in the temporal dead zone until its declaration runs, so reading it earlier throws `ReferenceError` and execution stops.",
    },
    {
      code: "async function run() {\n  console.log('async start');\n  await Promise.resolve();\n  console.log('async end');\n}\n\nconsole.log('script start');\nrun();\nPromise.resolve().then(function () {\n  console.log('promise then');\n});\nconsole.log('script end');",
      answer: "script start\nasync start\nscript end\nasync end\npromise then",
      explanationMD: "Calling the async function runs synchronously until the first `await`. The continuation after `await` is queued as a microtask before the later `.then(...)` microtask, so `async end` prints before `promise then` after the script finishes.",
    },
    {
      code: "var a = {};\nvar b = {};\nvar store = {};\n\nstore[a] = 'first';\nstore[b] = 'second';\n\nconsole.log(a === b);\nconsole.log(store[a]);\nconsole.log(Object.keys(store)[0]);",
      answer: "false\nsecond\n[object Object]",
      explanationMD: "`a` and `b` are different object references, so strict equality is `false`. Plain object property keys are strings or symbols; both object keys are coerced to the same string `\"[object Object]\"`, so the second assignment overwrites the first.",
    },
  ],
  machineCoding: [
    {
      id: "hm-event-emitter",
      title: "Implement an EventEmitter",
      difficulty: "Medium",
      promptMD: "### Problem\n\nBuild an `EventEmitter` supporting `on`, `off`, `emit`, and `once`.\n\n### Requirements\n\n- `on(eventName, listener)` registers a listener and returns an unsubscribe function.\n- `off(eventName, listener)` removes matching listeners.\n- `emit(eventName, ...args)` calls listeners with the supplied arguments and returns `true` if any listener existed.\n- `once(eventName, listener)` registers a listener that runs at most once.\n- Listeners added during an `emit` should not run until the next `emit`.",
      approachMD: "Store a `Map` from event names to arrays of listener records. Use a snapshot copy during `emit` so mutation while emitting is predictable. For `once`, wrap the original listener, remove the wrapper before invoking it, and remember the original so `off(event, original)` still works.",
      solutionCode: "function EventEmitter() {\n  this.events = new Map();\n}\n\nEventEmitter.prototype._add = function (eventName, listener, original, once) {\n  if (typeof listener !== 'function') {\n    throw new TypeError('listener must be a function');\n  }\n\n  if (!this.events.has(eventName)) {\n    this.events.set(eventName, []);\n  }\n\n  var record = {\n    listener: listener,\n    original: original || listener,\n    once: once === true\n  };\n\n  this.events.get(eventName).push(record);\n\n  var self = this;\n  return function unsubscribe() {\n    self.off(eventName, listener);\n  };\n};\n\nEventEmitter.prototype.on = function (eventName, listener) {\n  return this._add(eventName, listener, listener, false);\n};\n\nEventEmitter.prototype.once = function (eventName, listener) {\n  var self = this;\n\n  function wrapped() {\n    self.off(eventName, wrapped);\n    return listener.apply(this, arguments);\n  }\n\n  return this._add(eventName, wrapped, listener, true);\n};\n\nEventEmitter.prototype.off = function (eventName, listener) {\n  var list = this.events.get(eventName);\n  if (!list) {\n    return this;\n  }\n\n  var filtered = list.filter(function (record) {\n    return record.listener !== listener && record.original !== listener;\n  });\n\n  if (filtered.length === 0) {\n    this.events.delete(eventName);\n  } else {\n    this.events.set(eventName, filtered);\n  }\n\n  return this;\n};\n\nEventEmitter.prototype.emit = function (eventName) {\n  var list = this.events.get(eventName);\n  if (!list || list.length === 0) {\n    return false;\n  }\n\n  var args = Array.prototype.slice.call(arguments, 1);\n  var snapshot = list.slice();\n\n  for (var i = 0; i < snapshot.length; i += 1) {\n    var record = snapshot[i];\n    if (record.once) {\n      this.off(eventName, record.listener);\n    }\n    record.listener.apply(this, args);\n  }\n\n  return true;\n};\n\nEventEmitter.prototype.listenerCount = function (eventName) {\n  var list = this.events.get(eventName);\n  return list ? list.length : 0;\n};\n\n// Example:\n// var bus = new EventEmitter();\n// var unsubscribe = bus.on('message', function (text) { console.log(text); });\n// bus.emit('message', 'hello');\n// unsubscribe();",
      complexity: {
        time: "`on`: O(1), `emit`: O(n), `off`: O(n) for n listeners on the event",
        space: "O(n) listeners plus O(n) snapshot during emit",
      },
      discussionMD: "Production emitters may support wildcard events, max-listener warnings, async listeners, error channels, and listener priority. Be explicit about mutation semantics during `emit`; snapshot semantics are easy to reason about and prevent newly added listeners from firing in the same cycle.",
    },
    {
      id: "hm-promise-all",
      title: "Implement Promise.all from scratch",
      difficulty: "Hard",
      promptMD: "### Problem\n\nImplement `promiseAll(iterable)` with behavior similar to `Promise.all`.\n\n### Requirements\n\n- Accept any iterable of values or promises.\n- Resolve to an array of fulfilled values in the original input order.\n- Resolve immediately with `[]` for an empty iterable.\n- Reject as soon as any input rejects.\n- Treat non-promise values as already fulfilled values.",
      approachMD: "Convert the iterable to an array so indexes are stable. Create a result array of the same length and a `remaining` counter. Wrap each item with `Promise.resolve` to assimilate values and thenables. Store each fulfillment at its original index; when the counter reaches zero, resolve. Use the outer promise's `reject` directly for fast rejection.",
      solutionCode: "function promiseAll(iterable) {\n  return new Promise(function (resolve, reject) {\n    var items;\n\n    try {\n      items = Array.from(iterable);\n    } catch (error) {\n      reject(error);\n      return;\n    }\n\n    var results = new Array(items.length);\n    var remaining = items.length;\n\n    if (remaining === 0) {\n      resolve([]);\n      return;\n    }\n\n    items.forEach(function (item, index) {\n      Promise.resolve(item).then(\n        function (value) {\n          results[index] = value;\n          remaining -= 1;\n\n          if (remaining === 0) {\n            resolve(results);\n          }\n        },\n        function (reason) {\n          reject(reason);\n        }\n      );\n    });\n  });\n}\n\n// Example:\n// promiseAll([Promise.resolve(1), 2, Promise.resolve(3)])\n//   .then(function (values) { console.log(values); });",
      complexity: {
        time: "O(n) setup plus the time for input promises to settle",
        space: "O(n) for the copied items and result array",
      },
      discussionMD: "The subtle requirement is preserving input order even when promises settle out of order. Real ECMAScript `Promise.all` has additional specification details, such as iterator closing and species constructors, but this is the core behavior interviewers expect.",
    },
    {
      id: "hm-lru-cache",
      title: "Implement an LRU Cache",
      difficulty: "Hard",
      promptMD: "### Problem\n\nImplement an `LRUCache` with fixed capacity. It should evict the **least recently used** key when inserting beyond capacity.\n\n### Requirements\n\n- `get(key)` returns the value and marks the key as recently used, or returns `undefined` if missing.\n- `set(key, value)` inserts or updates and marks the key as recently used.\n- `has(key)`, `delete(key)`, `clear()`, `size`, and `keys()` are useful extras.\n- Average-case `get` and `set` should be O(1).",
      approachMD: "In JavaScript, `Map` preserves insertion order. Treat the oldest map entry as least recently used and the newest as most recently used. On `get` or update, delete and reinsert the key to move it to the back. When size exceeds capacity, delete `map.keys().next().value`.",
      solutionCode: "class LRUCache {\n  constructor(capacity) {\n    if (!Number.isInteger(capacity) || capacity < 1) {\n      throw new RangeError('capacity must be a positive integer');\n    }\n\n    this.capacity = capacity;\n    this.map = new Map();\n  }\n\n  get size() {\n    return this.map.size;\n  }\n\n  get(key) {\n    if (!this.map.has(key)) {\n      return undefined;\n    }\n\n    var value = this.map.get(key);\n    this.map.delete(key);\n    this.map.set(key, value);\n    return value;\n  }\n\n  set(key, value) {\n    if (this.map.has(key)) {\n      this.map.delete(key);\n    }\n\n    this.map.set(key, value);\n\n    if (this.map.size > this.capacity) {\n      var oldestKey = this.map.keys().next().value;\n      this.map.delete(oldestKey);\n    }\n\n    return this;\n  }\n\n  has(key) {\n    return this.map.has(key);\n  }\n\n  delete(key) {\n    return this.map.delete(key);\n  }\n\n  clear() {\n    this.map.clear();\n  }\n\n  keys() {\n    return Array.from(this.map.keys());\n  }\n}\n\n// Example:\n// var cache = new LRUCache(2);\n// cache.set('a', 1).set('b', 2);\n// cache.get('a');\n// cache.set('c', 3);\n// console.log(cache.has('b'));\n// console.log(cache.keys());",
      complexity: { time: "O(1) average for get, set, has, and delete", space: "O(capacity)" },
      discussionMD: "A Map-based LRU is concise and interview-friendly. In languages without ordered maps, use a hash map plus a doubly linked list. Discuss whether `has` should refresh recency; this implementation does not, while `get` and `set` do.",
    },
  ],
  cheatSheet: [
    {
      id: "cs-equality-coercion",
      title: "Equality & coercion",
      bodyMD: "### Equality\n\n| Operator | Meaning | Use |\n| --- | --- | --- |\n| `===` | Strict equality, no type coercion | Default choice |\n| `==` | Loose equality with coercion | Rare; sometimes `value == null` |\n| `Object.is` | SameValue comparison | `NaN`, `+0` vs `-0` edge cases |\n\n### Falsy values\n\nOnly these are falsy: `false`, `0`, `-0`, `0n`, `\"\"`, `null`, `undefined`, `NaN`. Everything else, including `[]`, `{}`, and `\"0\"`, is truthy.\n\n### Coercion reminders\n\n- `+` with a string performs string concatenation.\n- `Number([]) === 0`, `Number([1]) === 1`, `Number([1,2])` is `NaN`.\n- `null == undefined` is `true`; both are nullish for `??` and `?.`.",
    },
    {
      id: "cs-scope-closures",
      title: "Scope & closures",
      bodyMD: "### Scope rules\n\n- `var` is function scoped and initialised to `undefined`.\n- `let` and `const` are block scoped and have a temporal dead zone.\n- Function declarations are hoisted with their function value.\n- Modules run in strict mode and have their own top-level scope.\n\n### Closure mental model\n\nA closure is a function plus references to variables from its lexical environment. It is created naturally whenever an inner function outlives or is passed away from its outer scope.\n\n### Common uses\n\n- Private state\n- Function factories\n- Callbacks that remember context\n- Memoization and decorators\n\n### Watch out\n\nLong-lived closures can keep large objects alive. Remove event listeners and clear caches when they are no longer needed.",
    },
    {
      id: "cs-event-loop",
      title: "The event loop",
      bodyMD: "### Ordering model\n\n1. Run the current synchronous task until the call stack is empty.\n2. Drain the microtask queue completely.\n3. Render if the browser chooses to.\n4. Run the next task/macrotask.\n\n### Microtasks\n\n- Promise `.then`, `.catch`, `.finally`\n- `await` continuations\n- `queueMicrotask`\n\n### Tasks / macrotasks\n\n- `setTimeout`, `setInterval`\n- DOM events\n- Network callbacks\n- Message channel callbacks\n\n### Interview line\n\n`Promise.resolve().then(...)` runs before `setTimeout(..., 0)` because microtasks drain before the next task. Too many microtasks can starve timers and rendering.",
    },
    {
      id: "cs-this-binding",
      title: "`this` binding rules",
      bodyMD: "### Binding priority\n\n1. `new Fn()` → `this` is the new object.\n2. `fn.call(x)` / `fn.apply(x)` / `fn.bind(x)` → explicit binding.\n3. `obj.method()` → `this` is `obj`.\n4. Plain `fn()` → `undefined` in strict mode, global object in sloppy mode.\n\n### Arrow functions\n\nArrow functions do not bind their own `this`; they capture it lexically from the surrounding scope. They are great for callbacks but poor as object prototype methods when dynamic `this` is needed.\n\n### call vs apply vs bind\n\n- `call(thisArg, a, b)` invokes now with listed args.\n- `apply(thisArg, [a, b])` invokes now with array-like args.\n- `bind(thisArg, a)` returns a new function for later.",
    },
    {
      id: "cs-array-object-methods",
      title: "Array/Object methods worth memorising",
      bodyMD: "### Array methods\n\n| Method | Returns | Typical use |\n| --- | --- | --- |\n| `map` | New array | Transform each item |\n| `filter` | New array | Keep matching items |\n| `reduce` | Any value | Accumulate/group/sum |\n| `find` | First item or `undefined` | Locate one item |\n| `some` | Boolean | Any item matches |\n| `every` | Boolean | All items match |\n| `flatMap` | New flattened array | Map then flatten one level |\n\n### Object methods\n\n- `Object.keys(obj)` → own enumerable string keys.\n- `Object.values(obj)` → own enumerable values.\n- `Object.entries(obj)` → `[key, value]` pairs, great with `Map`.\n- `Object.assign(target, source)` and spread make shallow copies.\n- `Object.create(proto)` creates an object with a chosen prototype.",
    },
    {
      id: "cs-async-patterns",
      title: "Async patterns",
      bodyMD: "### Promise combinators\n\n| API | Settles when | Rejects when |\n| --- | --- | --- |\n| `Promise.all` | All fulfil | First rejection |\n| `Promise.allSettled` | All settle | Never due to one failed input |\n| `Promise.race` | First settles | First settled value is rejection |\n| `Promise.any` | First fulfils | All reject (`AggregateError`) |\n\n### async/await\n\n- `async` functions always return promises.\n- `await` pauses only the current async function, not the whole thread.\n- Use `try/catch` for awaited errors.\n- Start independent work before awaiting to keep concurrency.\n\n### Patterns\n\n- Sequential: `for...of` with `await`.\n- Parallel fail-fast: `await Promise.all(tasks)`.\n- Parallel collect-all: `await Promise.allSettled(tasks)`.\n- Timeout: `Promise.race([work, timeoutPromise])`.",
    },
  ],
};
