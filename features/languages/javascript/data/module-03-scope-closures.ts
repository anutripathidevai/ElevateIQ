import type { Topic } from "../../types";

export const TOPICS: Topic[] = [
  {
    "slug": "js-global-scope",
    "moduleId": "scope-closures",
    "order": 20,
    "title": "Global Scope",
    "difficulty": "Beginner",
    "estimatedReadingMin": 6,
    "estimatedPracticeMin": 2,
    "tags": [
      "Scope",
      "Global Object",
      "Variables",
      "Fundamentals"
    ],
    "introMD": "**Global scope** is the outermost scope of a JavaScript program. A name placed there can be reached from almost anywhere, which makes it powerful — and dangerous.\n\nIn browsers the global object is commonly `window`; in Node.js it is `global`; in modern JavaScript the portable name is **`globalThis`**. Understanding what truly lives globally is essential before you can reason about modules, closures, and accidental variable leaks.",
    "whyItMattersMD": "Global scope questions look simple, but they reveal whether you understand real production hazards: accidental globals, naming collisions between scripts, top-level `var` behaving differently from `let`/`const`, and why modules were introduced. Interviewers often use this topic to test precision before moving into closures.",
    "theoryMD": "### What is global scope?\n\nGlobal scope is the outermost environment JavaScript consults when resolving an identifier. If code cannot find a variable in the current local scope, it walks outward until it reaches the global scope. If the name is still missing, reading it throws a `ReferenceError` (except `typeof missingName`, which returns `\"undefined\"`).\n\n### The global object\n\n| Environment | Common global object | Portable name |\n| --- | --- | --- |\n| Browser page | `window` | `globalThis` |\n| Web Worker | `self` | `globalThis` |\n| Node.js | `global` | `globalThis` |\n\nUse `globalThis` when you truly need the global object. Most application code should avoid writing to it.\n\n### Top-level `var` vs `let`/`const`\n\nIn a **classic browser script**, top-level `var` declarations and function declarations create properties on `window`. Top-level `let` and `const` create global lexical bindings, but **do not** become properties on `window`. In ES modules, top-level declarations are module-scoped, not global.\n\n| Declaration location | Classic script behavior | ES module behavior |\n| --- | --- | --- |\n| `var x = 1` | global binding + `window.x` | module-scoped |\n| `let x = 1` | global lexical binding, no `window.x` | module-scoped |\n| `const x = 1` | global lexical binding, no `window.x` | module-scoped |\n| `function f(){}` | usually `window.f` in classic scripts | module-scoped |\n\n### Implicit globals\n\nIn sloppy mode, assigning to an undeclared name creates a property on the global object: `count = 1`. That typo can silently leak state across your app. In strict mode, the same assignment throws a `ReferenceError`, which is one reason modern tooling and modules are strict by default.\n\n### Global pollution\n\nEvery global name is shared space. Two libraries defining `config`, `user`, or `debug` can collide. Prefer modules, function scope, block scope, or one deliberate namespace object instead of many globals.",
    "diagrams": [
      {
        "title": "Identifier lookup reaches global scope last",
        "ascii": "read name\n   |\n   v\n[current local scope]\n   | not found\n   v\n[outer function / block scopes]\n   | not found\n   v\n[global lexical scope]\n   | not found\n   v\n[global object: globalThis]\n   | not found\n   v\nReferenceError when read directly",
        "caption": "Global scope is the final stop in the normal scope-chain lookup."
      }
    ],
    "codeExamples": [
      {
        "title": "Prefer explicit global access when you really need it",
        "descriptionMD": "Using `globalThis` makes it clear that the value is shared across the whole runtime. Most code should still prefer imports or local variables.",
        "language": "javascript",
        "code": "globalThis.appSettings = {\n  course: 'JavaScript Interview Mastery',\n  mode: 'practice'\n};\n\nfunction printSettings() {\n  console.log(globalThis.appSettings.course);\n}\n\nprintSettings();"
      },
      {
        "title": "Accidental globals in sloppy mode",
        "descriptionMD": "A missing declaration can leak a name to the global object. Strict mode turns this bug into an immediate error.",
        "language": "javascript",
        "code": "function unsafeUpdate() {\n  score = 10; // sloppy mode: creates globalThis.score\n}\n\nfunction safeUpdate() {\n  'use strict';\n  // score = 10; // ReferenceError: score is not defined\n  let score = 10;\n  return score;\n}"
      }
    ],
    "outputPredictions": [
      {
        "code": "const key = 'courseMode';\nglobalThis[key] = 'interview';\n\nfunction readGlobal(name) {\n  console.log(globalThis[name]);\n}\n\nreadGlobal(key);\nconsole.log(typeof globalThis.notDeclaredYet);\ndelete globalThis[key];",
        "answer": "interview\nundefined",
        "explanationMD": "`globalThis[key]` writes an explicit property on the global object, so `readGlobal` prints `interview`. A missing property on an object evaluates to `undefined`, so `typeof globalThis.notDeclaredYet` prints `undefined` rather than throwing."
      }
    ],
    "interviewQuestions": [
      {
        "question": "What is the difference between the global scope and the global object?",
        "answerMD": "The **global scope** is the outermost place where identifiers can be resolved. The **global object** is an object (`window`, `global`, or `globalThis`) that stores global properties. In classic browser scripts, top-level `var` and function declarations become properties on the global object, but top-level `let` and `const` create global lexical bindings that are **not** object properties. In modules, top-level declarations are module-scoped, not global.",
        "companies": [
          "Microsoft",
          "Google",
          "Amazon"
        ],
        "followUps": [
          "Why does `globalThis` exist?",
          "How do ES modules reduce global pollution?"
        ]
      },
      {
        "question": "Why are implicit globals dangerous?",
        "answerMD": "They are usually typos that silently create shared mutable state. Because every script can read or overwrite that global property, the bug may appear far from the assignment. Strict mode and ES modules prevent this by throwing `ReferenceError` for undeclared assignments."
      }
    ],
    "quiz": [
      {
        "question": "In a classic browser script, which top-level declaration becomes a property on `window`?",
        "options": [
          "`let token = 'x'`",
          "`const token = 'x'`",
          "`var token = 'x'`",
          "All top-level declarations behave the same"
        ],
        "correctIndex": 2,
        "explanationMD": "In classic scripts, top-level `var` creates a global object property. Top-level `let` and `const` create global lexical bindings but do not become `window` properties. In ES modules, all three are module-scoped."
      },
      {
        "question": "What does assigning to an undeclared identifier do in strict mode?",
        "options": [
          "Creates a property on `globalThis`",
          "Creates a block-scoped variable",
          "Throws a `ReferenceError`",
          "Creates a `const` binding"
        ],
        "correctIndex": 2,
        "explanationMD": "Strict mode prevents implicit globals. Assigning to an undeclared name throws `ReferenceError`, which catches typos early."
      }
    ],
    "summary": [
      "Global scope is the final outer scope used for identifier lookup.",
      "`globalThis` is the portable way to refer to the global object across environments.",
      "Classic scripts attach top-level `var` to the global object; `let`/`const` do not, and modules are module-scoped.",
      "Avoid global pollution and implicit globals; use modules, declarations, and strict mode."
    ]
  },
  {
    "slug": "js-function-scope",
    "moduleId": "scope-closures",
    "order": 21,
    "title": "Function Scope",
    "difficulty": "Beginner",
    "estimatedReadingMin": 6,
    "estimatedPracticeMin": 3,
    "tags": [
      "Scope",
      "Functions",
      "var",
      "Nested Functions"
    ],
    "introMD": "**Function scope** means a variable is visible throughout the function in which it is declared. Before ES6 introduced `let` and `const`, JavaScript developers mostly used `var`, and `var` is scoped to the nearest function — not to `if`, `for`, or other blocks.\n\nThis is the reason many older interview snippets feel surprising: a `var` declared deep inside an `if` can still be read later in the same function.",
    "whyItMattersMD": "Function scope explains `var` hoisting, nested functions, and many closure questions. If you cannot trace where a function-local variable exists, you will struggle to explain why a returned inner function can still access it after the outer function finishes.",
    "theoryMD": "### A function creates a local environment\n\nEvery function call creates a new function environment containing:\n\n- its parameters,\n- variables declared with `var`,\n- function declarations,\n- and block-scoped declarations inside nested blocks (`let`/`const`) where applicable.\n\nWhen the function returns, its ordinary local frame is done — unless an inner function closes over variables from it.\n\n### `var` is function-scoped\n\n`var` belongs to the nearest function, even when written inside a block. The declaration is hoisted to the top of the function and initialised to `undefined`; the assignment stays where it is.\n\n| Construct | Scope boundary for `var` | Scope boundary for `let`/`const` |\n| --- | --- | --- |\n| Function body | yes | yes |\n| `if` block | no | yes |\n| `for` block | no | yes |\n| Plain `{}` block | no | yes |\n\n### Nested functions\n\nA nested function can read variables from its own scope, its outer function's scope, and then the global scope. The reverse is not true: an outer function cannot read variables declared inside an inner function.\n\n### Parameters are local too\n\nFunction parameters behave like local bindings. If an inner function uses a parameter, that parameter is part of the outer function's lexical environment and can be captured by a closure.",
    "diagrams": [
      {
        "title": "Nested function lookup",
        "ascii": "outer(name) function scope\n  var greeting\n  |\n  +-- inner() function scope\n        local variables\n        | not found locally\n        v\n      outer scope: name, greeting\n        | not found\n        v\n      global scope",
        "caption": "Inner functions can see outward; outer functions cannot see inward."
      }
    ],
    "codeExamples": [
      {
        "title": "A nested function reads outer function variables",
        "descriptionMD": "`inner` can use both `greeting` and `name` because it is written inside `outer`.",
        "language": "javascript",
        "code": "function outer(name) {\n  var greeting = 'Hello';\n\n  function inner() {\n    console.log(greeting + ', ' + name);\n  }\n\n  inner();\n}\n\nouter('Ada'); // Hello, Ada"
      },
      {
        "title": "`var` ignores block boundaries",
        "descriptionMD": "The declaration belongs to the whole function, even though it appears inside an `if` block.",
        "language": "javascript",
        "code": "function choose(flag) {\n  if (flag) {\n    var result = 'from if block';\n  }\n\n  return result;\n}\n\nconsole.log(choose(true));  // from if block\nconsole.log(choose(false)); // undefined"
      }
    ],
    "outputPredictions": [
      {
        "code": "function test(flag) {\n  if (flag) {\n    var functionScoped = 'visible';\n    let blockScoped = 'hidden';\n  }\n\n  console.log(functionScoped);\n  console.log(typeof blockScoped);\n}\n\ntest(true);",
        "answer": "visible\nundefined",
        "explanationMD": "`functionScoped` is declared with `var`, so it belongs to the whole `test` function and is visible after the `if` block. `blockScoped` is declared with `let`, so it only exists inside the block; outside that block the identifier is unresolvable, and `typeof` reports `undefined`."
      }
    ],
    "interviewQuestions": [
      {
        "question": "What does it mean that `var` is function-scoped?",
        "answerMD": "A `var` declaration is scoped to the nearest enclosing function, not to the nearest block. Its declaration is hoisted and initialised to `undefined` for the whole function, while the assignment happens at runtime where written. Therefore `var` declared inside an `if` or `for` can still be read elsewhere in the same function.",
        "companies": [
          "Amazon",
          "Microsoft",
          "Meta"
        ],
        "followUps": [
          "How is this different from `let`?",
          "What value do you get before the assignment runs?"
        ]
      },
      {
        "question": "Can an inner function access variables from an outer function? Can the outer function access variables from the inner function?",
        "answerMD": "The inner function can access variables from the outer function through lexical scope. The outer function cannot access variables declared inside the inner function because lookup only walks outward, never inward."
      }
    ],
    "quiz": [
      {
        "question": "What does `choose(false)` return here? `function choose(flag){ if(flag){ var x = 1; } return x; }`",
        "options": [
          "`1`",
          "`undefined`",
          "`ReferenceError`",
          "`null`"
        ],
        "correctIndex": 1,
        "explanationMD": "The `var x` declaration is hoisted to the function and initialised to `undefined`. When `flag` is false, the assignment never runs, so `x` remains `undefined`."
      },
      {
        "question": "A nested function's identifier lookup can move…",
        "options": [
          "Only inside its own body",
          "Outward to enclosing scopes",
          "Inward into functions it calls",
          "Randomly depending on the caller"
        ],
        "correctIndex": 1,
        "explanationMD": "JavaScript uses lexical scope. Lookup starts locally and moves outward through enclosing scopes, never inward into child functions or dynamically into callers."
      }
    ],
    "summary": [
      "Each function call creates a local function scope for parameters, `var`, and function declarations.",
      "`var` is scoped to the nearest function, not the nearest block.",
      "Nested functions can read variables from outer functions via the scope chain.",
      "Function scope is the foundation for closures: an inner function can keep using outer variables later."
    ]
  },
  {
    "slug": "js-block-scope",
    "moduleId": "scope-closures",
    "order": 22,
    "title": "Block Scope",
    "difficulty": "Beginner",
    "estimatedReadingMin": 7,
    "estimatedPracticeMin": 3,
    "tags": [
      "Scope",
      "let",
      "const",
      "Loops"
    ],
    "introMD": "A **block** is a pair of curly braces: an `if` body, a `for` body, a `while` body, or even a standalone `{ ... }`. Variables declared with `let` and `const` are scoped to the nearest block.\n\nBlock scope is one of the biggest practical improvements in modern JavaScript because it makes variables live exactly where readers expect them to live.",
    "whyItMattersMD": "Many classic interview bugs come from using `var` in loops and callbacks. `let` fixes those bugs not by magic, but by creating a fresh binding for each block or loop iteration. This is a must-know bridge from basic scope to closures.",
    "theoryMD": "### `let` and `const` are block-scoped\n\nA `let` or `const` binding exists only inside the closest `{ ... }` block that contains it. Once execution leaves the block, that name is not available.\n\n### `const` means the binding cannot be reassigned\n\n`const` prevents reassignment of the variable binding, not mutation of the value. A `const` object can still have properties changed; the variable just cannot be pointed at a different object.\n\n### The temporal dead zone\n\n`let` and `const` are hoisted in a technical sense, but they are not usable before the declaration line runs. The region before the declaration is called the **temporal dead zone** (TDZ), and reading the variable there throws a `ReferenceError`.\n\n### Loop bindings\n\n`for (let i = 0; ...)` creates a new `i` binding for each iteration. That is why callbacks created in a `let` loop remember the value from their own iteration. `for (var i = 0; ...)` uses one function-scoped `i`, so every callback shares the same final value.\n\n| Pattern | Binding behavior | Callback result |\n| --- | --- | --- |\n| `for (var i...)` | one shared function-scoped `i` | all callbacks see final `i` |\n| `for (let i...)` | fresh `i` per iteration | each callback sees its own `i` |\n| IIFE around `var` | captures argument per call | each callback sees captured copy |",
    "diagrams": [
      {
        "title": "Block scope boundaries",
        "ascii": "function demo() scope\n  var a  ----------------------------------- visible through whole function\n\n  if (condition) {\n    let b  -------- visible only inside this block\n    const c ------- visible only inside this block\n  }\n\n  b and c are gone here\n  a is still visible here",
        "caption": "`let` and `const` stop at the block boundary; `var` stops at the function boundary."
      }
    ],
    "codeExamples": [
      {
        "title": "`if` blocks hide `let` and `const`",
        "descriptionMD": "The `status` binding exists only inside the `if` block. Use this to reduce accidental reuse.",
        "language": "javascript",
        "code": "function render(isAdmin) {\n  if (isAdmin) {\n    const status = 'admin';\n    console.log(status);\n  }\n\n  // console.log(status); // ReferenceError\n}\n\nrender(true);"
      },
      {
        "title": "The loop closure bug and both fixes",
        "descriptionMD": "The `var` version shares one binding. The `let` version creates per-iteration bindings. The IIFE version captures a value in a function argument.",
        "language": "javascript",
        "code": "var broken = [];\nfor (var i = 0; i < 3; i++) {\n  broken.push(function () {\n    return i;\n  });\n}\n\nvar fixedWithLet = [];\nfor (let j = 0; j < 3; j++) {\n  fixedWithLet.push(function () {\n    return j;\n  });\n}\n\nvar fixedWithIife = [];\nfor (var k = 0; k < 3; k++) {\n  (function (capturedK) {\n    fixedWithIife.push(function () {\n      return capturedK;\n    });\n  })(k);\n}"
      }
    ],
    "outputPredictions": [
      {
        "code": "const varCallbacks = [];\nfor (var i = 0; i < 3; i++) {\n  varCallbacks.push(function () {\n    return i;\n  });\n}\n\nconst letCallbacks = [];\nfor (let j = 0; j < 3; j++) {\n  letCallbacks.push(function () {\n    return j;\n  });\n}\n\nconsole.log(varCallbacks[0](), varCallbacks[1](), varCallbacks[2]());\nconsole.log(letCallbacks[0](), letCallbacks[1](), letCallbacks[2]());",
        "answer": "3 3 3\n0 1 2",
        "explanationMD": "The `var` loop has one shared `i`. After the loop ends, `i` is `3`, so every callback returns `3`. The `let` loop creates a fresh `j` for each iteration, so the callbacks return `0`, `1`, and `2`."
      }
    ],
    "interviewQuestions": [
      {
        "question": "Why does `let` fix the classic loop callback problem?",
        "answerMD": "A `for` loop with `let` creates a new binding for the loop variable on each iteration. Each callback closes over its own iteration's binding. With `var`, there is one function-scoped binding shared by all callbacks, so they all see the final value after the loop finishes.",
        "companies": [
          "Google",
          "Amazon",
          "Apple"
        ],
        "followUps": [
          "How would you fix it before `let` existed?",
          "What role does an IIFE play here?"
        ]
      },
      {
        "question": "What is the difference between `const` and immutability?",
        "answerMD": "`const` makes the variable binding non-reassignable. It does not freeze the value. A `const` object can still be mutated unless you also use techniques such as `Object.freeze` or immutable data structures."
      }
    ],
    "quiz": [
      {
        "question": "Why do callbacks created in `for (let i = 0; i < 3; i++)` see `0`, `1`, and `2` instead of all seeing `3`?",
        "options": [
          "`let` copies the function body",
          "`let` creates a fresh binding for each iteration",
          "`let` disables closures",
          "`let` makes callbacks synchronous"
        ],
        "correctIndex": 1,
        "explanationMD": "The ES6 loop semantics for `let` create a separate binding per iteration, so each closure points at the binding created for its own iteration."
      },
      {
        "question": "What happens if you read a `let` variable before its declaration line runs?",
        "options": [
          "You get `undefined`",
          "You get `null`",
          "A `ReferenceError` is thrown",
          "The value is read from `globalThis`"
        ],
        "correctIndex": 2,
        "explanationMD": "Before the declaration line, the variable is in the temporal dead zone. Reading it throws `ReferenceError`."
      }
    ],
    "summary": [
      "Blocks are `{ ... }` regions; `let` and `const` are scoped to the nearest block.",
      "`var` ignores block scope and belongs to the nearest function or global scope.",
      "`for (let ...)` creates a fresh binding per iteration, fixing the classic callback bug.",
      "`const` prevents reassignment of the binding, not mutation of the value."
    ]
  },
  {
    "slug": "js-lexical-scope",
    "moduleId": "scope-closures",
    "order": 23,
    "title": "Lexical Scope & the Scope Chain",
    "difficulty": "Intermediate",
    "estimatedReadingMin": 7,
    "estimatedPracticeMin": 3,
    "tags": [
      "Lexical Scope",
      "Scope Chain",
      "Closures",
      "Name Resolution"
    ],
    "introMD": "**Lexical scope** means JavaScript decides which variables a function can access by where that function is **written** in the source code, not where it is called.\n\nThe **scope chain** is the ordered set of environments JavaScript searches when resolving a name: local scope first, then outer lexical scopes, and finally global scope.",
    "whyItMattersMD": "This is the exact mental model interviewers expect before closures. A function passed across your program does not adopt the caller's local variables. It keeps access to the variables from the place it was created.",
    "theoryMD": "### Lexical means source-position based\n\nA function's accessible outer variables are determined at creation time from the surrounding source code. Calling the function from a different place does not change that outer environment. This is also called **static scope**.\n\n### The scope chain algorithm\n\nWhen JavaScript reads an identifier like `userId`, it searches:\n\n1. the current function or block environment,\n2. the next outer lexical environment,\n3. continuing outward one environment at a time,\n4. the global environment,\n5. and if still not found, a direct read throws `ReferenceError`.\n\n### Shadowing\n\nIf an inner scope declares the same name as an outer scope, the inner binding **shadows** the outer one. Lookup stops at the first match. Shadowing is legal, but overusing it makes code harder to trace.\n\n### Lexical, not dynamic\n\n| Question | JavaScript answer |\n| --- | --- |\n| Does a function use variables from where it is called? | No |\n| Does a function use variables from where it is written/created? | Yes |\n| Can an inner function see outer variables? | Yes |\n| Can an outer function see inner variables? | No |",
    "diagrams": [
      {
        "title": "A function keeps its written scope chain",
        "ascii": "global scope\n  label = 'global'\n\n  makePrinter() scope\n    label = 'outer'\n\n    printer() scope\n      read label\n        |\n        v\n      finds makePrinter label first\n\ncallFromElsewhere() scope\n  label = 'caller'\n  printer() still does NOT use this label",
        "caption": "The caller's local variables are not inserted into the callee's lexical scope chain."
      }
    ],
    "codeExamples": [
      {
        "title": "Where a function is written matters",
        "descriptionMD": "`printer` is called from `callWithLocal`, but it still reads `label` from `makePrinter` because that is where it was created.",
        "language": "javascript",
        "code": "const label = 'global';\n\nfunction makePrinter() {\n  const label = 'outer';\n\n  return function printer() {\n    console.log(label);\n  };\n}\n\nfunction callWithLocal(fn) {\n  const label = 'caller';\n  fn();\n}\n\ncallWithLocal(makePrinter()); // outer"
      },
      {
        "title": "Shadowing stops lookup early",
        "descriptionMD": "The inner `id` hides the outer `id`. JavaScript does not keep searching after it finds a local match.",
        "language": "javascript",
        "code": "const id = 'global-id';\n\nfunction show() {\n  const id = 'function-id';\n  console.log(id);\n}\n\nshow(); // function-id"
      }
    ],
    "outputPredictions": [
      {
        "code": "const label = 'global';\n\nfunction makePrinter() {\n  const label = 'outer';\n  return function () {\n    console.log(label);\n  };\n}\n\nfunction callWithLocal(fn) {\n  const label = 'caller';\n  fn();\n}\n\ncallWithLocal(makePrinter());",
        "answer": "outer",
        "explanationMD": "The returned function was created inside `makePrinter`, so its outer lexical environment contains `label = 'outer'`. The `label = 'caller'` inside `callWithLocal` is not part of the function's lexical scope chain, even though that is where the function is invoked."
      }
    ],
    "interviewQuestions": [
      {
        "question": "What is lexical scope, and how is it different from dynamic scope?",
        "answerMD": "Lexical scope means a function's accessible variables are determined by where the function is **defined in the source code**. Dynamic scope would mean variables are resolved based on the call stack or caller. JavaScript is lexically scoped: passing a function to another function does not make it see the caller's local variables.",
        "companies": [
          "Microsoft",
          "Google",
          "Meta",
          "Netflix"
        ],
        "followUps": [
          "How does this lead to closures?",
          "What is variable shadowing?"
        ]
      },
      {
        "question": "Describe the scope chain lookup process.",
        "answerMD": "Lookup starts in the current local environment. If the name is not found, JavaScript checks the next outer lexical environment, then the next, until it reaches the global environment. If no binding exists, reading the identifier throws `ReferenceError`."
      }
    ],
    "quiz": [
      {
        "question": "A function's outer variables are determined by…",
        "options": [
          "Where the function is called",
          "Where the function is written/created",
          "The name of the caller",
          "The most recent object property access"
        ],
        "correctIndex": 1,
        "explanationMD": "JavaScript has lexical (static) scope. A function carries the scope chain from the place it was created, not the place it is later called."
      },
      {
        "question": "If an inner scope and outer scope both declare `value`, which one is read inside the inner scope?",
        "options": [
          "The global one",
          "The outer one",
          "The inner one",
          "Both are merged"
        ],
        "correctIndex": 2,
        "explanationMD": "Lookup stops at the first matching binding, so the inner declaration shadows the outer declaration."
      }
    ],
    "summary": [
      "Lexical scope is based on where functions and blocks are written, not where functions are called.",
      "The scope chain searches local scope, then outer lexical scopes, then global scope.",
      "Inner declarations can shadow outer declarations.",
      "Closures work because functions keep access to their lexical scope chain."
    ]
  },
  {
    "slug": "js-closures",
    "moduleId": "scope-closures",
    "order": 24,
    "title": "Closures",
    "difficulty": "Intermediate",
    "estimatedReadingMin": 9,
    "estimatedPracticeMin": 5,
    "tags": [
      "Closures",
      "Lexical Environment",
      "Private State",
      "Interview Classic"
    ],
    "introMD": "A **closure** is a function bundled with references to variables from its lexical environment. In plain English: an inner function can keep using variables from an outer function even after the outer function has returned.\n\nIf Module 3 has one flagship concept, this is it. Closures power callbacks, data privacy, function factories, memoization, debouncing, and many of the most common JavaScript interview questions.",
    "whyItMattersMD": "Closures are one of the most-tested JavaScript topics at Microsoft, Google, Amazon, Meta, Netflix, and Apple. Interviewers expect you to define them crisply, trace output questions, explain private state, and fix the `var` loop callback bug. A strong closure explanation signals that your mental model is deeper than syntax.",
    "theoryMD": "### Interview-ready definition\n\nA **closure** is a function together with the lexical environment it was created in, allowing the function to access outer variables even after the outer function has finished executing.\n\nA concise interview answer: **A closure is a function that remembers variables from the scope where it was created.**\n\n### The mental model\n\nWhen JavaScript creates a function, it records a hidden link to the surrounding lexical environment. If that function is returned, stored in an array, passed as a callback, or called later, the link remains. The outer variables it can still reach stay alive as long as the closure is reachable.\n\nImportant nuance: closures capture **bindings**, not frozen snapshots. If multiple closures point at the same binding, they see the same changing value. If a loop creates a fresh binding per iteration with `let`, each closure gets a different binding.\n\n### The counter factory\n\nThe classic example is `function makeCounter(){ let c=0; return function(){ return ++c; }; }`. Each call to `makeCounter` creates a new lexical environment with its own `c`. The returned function closes over that `c`, so it can increment it later. Two counters are independent because they were created by two different calls.\n\n### Private state\n\nClosures can hide variables from the outside world. If `balance` is local to a factory function and only returned methods can reach it, outside code cannot read or assign `balance` directly. This is the old-school JavaScript route to encapsulation and still appears in interviews.\n\n### The classic `var` loop bug\n\nWith `var`, a loop has one shared function-scoped binding. Every callback closes over that same binding, so after the loop ends they all see the final value. Fix it by using `let` (fresh per-iteration binding) or by wrapping each iteration in an IIFE that captures the current value as an argument.\n\n| Pattern | What the closure remembers | Result |\n| --- | --- | --- |\n| Counter factory | one `c` per factory call | independent counters |\n| Private module | hidden local variables | controlled access |\n| `for (var i...)` callbacks | one shared `i` | all see final value |\n| `for (let i...)` callbacks | one `i` per iteration | each sees its own value |",
    "diagrams": [
      {
        "title": "A closure keeps an environment alive",
        "ascii": "makeCounter() call\n  creates environment E1\n  c = 0\n      |\n      v\n  returns inner function\n      |\n      v\ncounter variable in outer code -----> function object\n                                      hidden link -----> E1 { c }\n\nCalling counter() later follows the hidden link and updates c.",
        "caption": "The outer call is gone from the stack, but the captured environment remains reachable through the returned function."
      }
    ],
    "codeExamples": [
      {
        "title": "Counter factory: each call gets private state",
        "descriptionMD": "This is the closure example every JavaScript interviewer expects you to know.",
        "language": "javascript",
        "code": "function makeCounter() {\n  let c = 0;\n\n  return function () {\n    return ++c;\n  };\n}\n\nconst first = makeCounter();\nconst second = makeCounter();\n\nconsole.log(first());  // 1\nconsole.log(first());  // 2\nconsole.log(second()); // 1"
      },
      {
        "title": "Private variables through closures",
        "descriptionMD": "`balance` is not a property on the returned object. Only the returned methods can access it.",
        "language": "javascript",
        "code": "function createBankAccount(initialBalance) {\n  let balance = initialBalance;\n\n  return {\n    deposit: function (amount) {\n      balance += amount;\n      return balance;\n    },\n    withdraw: function (amount) {\n      if (amount > balance) {\n        return 'insufficient funds';\n      }\n      balance -= amount;\n      return balance;\n    },\n    getBalance: function () {\n      return balance;\n    }\n  };\n}\n\nconst account = createBankAccount(100);\nconsole.log(account.deposit(50));\nconsole.log(account.balance); // undefined"
      },
      {
        "title": "Fixing `var` loop closures with `let` or an IIFE",
        "descriptionMD": "Both fixes work because they create a separate binding for each callback to close over.",
        "language": "javascript",
        "code": "const fixedWithLet = [];\nfor (let i = 0; i < 3; i++) {\n  fixedWithLet.push(function () {\n    return i;\n  });\n}\n\nconst fixedWithIife = [];\nfor (var j = 0; j < 3; j++) {\n  (function (capturedJ) {\n    fixedWithIife.push(function () {\n      return capturedJ;\n    });\n  })(j);\n}\n\nconsole.log(fixedWithLet[2]());  // 2\nconsole.log(fixedWithIife[2]()); // 2"
      }
    ],
    "playground": [
      {
        "title": "Two counters are independent",
        "descriptionMD": "Run this and notice that `a` and `b` do not share the same `c`. Each call to `makeCounter` created a new lexical environment.",
        "code": "function makeCounter() {\n  let c = 0;\n\n  return function () {\n    c += 1;\n    return c;\n  };\n}\n\nconst a = makeCounter();\nconst b = makeCounter();\n\nconsole.log('a:', a());\nconsole.log('a:', a());\nconsole.log('b:', b());\nconsole.log('a:', a());"
      },
      {
        "title": "The loop closure bug and two fixes",
        "descriptionMD": "The first group closes over one shared `var i`. The second uses `let`. The third uses an IIFE to capture the current value.",
        "code": "const broken = [];\nfor (var i = 0; i < 3; i++) {\n  broken.push(function () {\n    console.log('var i =', i);\n  });\n}\nbroken[0]();\nbroken[1]();\nbroken[2]();\n\nconst fixedLet = [];\nfor (let j = 0; j < 3; j++) {\n  fixedLet.push(function () {\n    console.log('let j =', j);\n  });\n}\nfixedLet[0]();\nfixedLet[1]();\nfixedLet[2]();\n\nconst fixedIife = [];\nfor (var k = 0; k < 3; k++) {\n  (function (capturedK) {\n    fixedIife.push(function () {\n      console.log('iife k =', capturedK);\n    });\n  })(k);\n}\nfixedIife[0]();\nfixedIife[1]();\nfixedIife[2]();"
      }
    ],
    "outputPredictions": [
      {
        "code": "function makeCounter() {\n  let c = 0;\n  return function () {\n    return ++c;\n  };\n}\n\nconst a = makeCounter();\nconst b = makeCounter();\n\nconsole.log(a());\nconsole.log(a());\nconsole.log(b());\nconsole.log(a());",
        "answer": "1\n2\n1\n3",
        "explanationMD": "`a` and `b` are returned from two different `makeCounter` calls, so they close over two different `c` bindings. Calls to `a` update only `a`'s `c`; the first call to `b` starts at its own `0`."
      },
      {
        "code": "const fns = [];\n\nfor (var i = 0; i < 2; i++) {\n  fns.push(function () {\n    return i;\n  });\n}\n\nfor (let j = 0; j < 2; j++) {\n  fns.push(function () {\n    return j;\n  });\n}\n\nconsole.log(fns[0](), fns[1](), fns[2](), fns[3]());",
        "answer": "2 2 0 1",
        "explanationMD": "The first two functions share the one `var i`, whose final value is `2`. The last two functions were created in a `let` loop, so each closes over a separate per-iteration `j`: `0` and `1`."
      }
    ],
    "codingExercises": [
      {
        "title": "Build a private counter object",
        "difficulty": "Medium",
        "promptMD": "Implement `createCounter(initial)` that returns an object with methods `increment()`, `decrement()`, `get()`, and `reset()`. The current count must be private: outside code should not be able to read or write it as a property on the returned object.",
        "hints": [
          "Declare `count` inside `createCounter`, not on the returned object.",
          "Return methods that read and update `count`.",
          "Store the original `initial` value if `reset()` must return to it."
        ],
        "solutionCode": "function createCounter(initial) {\n  let count = initial;\n  const start = initial;\n\n  return {\n    increment: function () {\n      count += 1;\n      return count;\n    },\n    decrement: function () {\n      count -= 1;\n      return count;\n    },\n    get: function () {\n      return count;\n    },\n    reset: function () {\n      count = start;\n      return count;\n    }\n  };\n}\n\nconst counter = createCounter(10);\nconsole.log(counter.increment()); // 11\nconsole.log(counter.get());       // 11\nconsole.log(counter.count);       // undefined\nconsole.log(counter.reset());     // 10",
        "complexity": {
          "time": "O(1) per operation",
          "space": "O(1)"
        },
        "explanationMD": "`count` and `start` are local variables inside `createCounter`. The returned methods close over those bindings, so they can update and read the values later. Because `count` is not stored as a property on the returned object, outside code cannot access it directly."
      }
    ],
    "interviewQuestions": [
      {
        "question": "Define a closure in JavaScript. Give a crisp answer an interviewer would accept.",
        "answerMD": "A closure is a function bundled with its lexical environment. It lets the function access variables from the scope where it was created, even after that outer scope has finished executing. Example: a `makeCounter` function returns an inner function that keeps accessing and updating the outer `c` variable.",
        "companies": [
          "Microsoft",
          "Google",
          "Amazon",
          "Meta",
          "Netflix",
          "Apple"
        ],
        "followUps": [
          "Do closures capture values or bindings?",
          "Why are two counters independent?"
        ]
      },
      {
        "question": "How would you explain a closure to a junior developer?",
        "answerMD": "I would say: imagine a function carries a backpack. When it is created, it puts the outer variables it needs into that backpack by reference. Later, even if the outer function is done, the inner function still has the backpack, so it can keep using those variables. That is why a counter function can remember its count between calls.",
        "followUps": [
          "What is the limitation of the backpack analogy?",
          "Why do multiple closures sometimes share the same variable?"
        ]
      },
      {
        "question": "How do closures provide private variables?",
        "answerMD": "Declare the variable inside a factory function and return functions that operate on it. The variable is not exposed as an object property or global name, so outside code cannot access it directly. Only the returned closures can read or modify it."
      }
    ],
    "quiz": [
      {
        "question": "What does a closure remember?",
        "options": [
          "Only the return value of the outer function",
          "References to variables from its lexical environment",
          "The caller's local variables",
          "A copy of the entire global object"
        ],
        "correctIndex": 1,
        "explanationMD": "A closure keeps access to lexical bindings from where the function was created. It does not use the caller's local scope, and it does not simply store a return value."
      },
      {
        "question": "What is printed? `function outer(){ let x = 0; return [function(){ x++; return x; }, function(){ x++; return x; }]; } const pair = outer(); console.log(pair[0]()); console.log(pair[1]());`",
        "options": [
          "`1` then `1`",
          "`1` then `2`",
          "`0` then `0`",
          "`ReferenceError`"
        ],
        "correctIndex": 1,
        "explanationMD": "Both returned functions close over the same `x` binding created by one call to `outer`. The first call increments it to `1`; the second increments the same binding to `2`."
      },
      {
        "question": "What is printed? `const f=[]; for(var i=0;i<2;i++){ f.push(function(){ return i; }); } for(let j=0;j<2;j++){ f.push(function(){ return j; }); } console.log(f[0](), f[1](), f[2](), f[3]());`",
        "options": [
          "`0 1 0 1`",
          "`2 2 2 2`",
          "`2 2 0 1`",
          "`0 0 1 1`"
        ],
        "correctIndex": 2,
        "explanationMD": "This is the shared vs per-iteration closure distinction. The `var i` loop creates one shared binding that ends at `2`, so the first two functions return `2`. The `let j` loop creates a fresh binding per iteration, so the last two functions return `0` and `1`."
      }
    ],
    "summary": [
      "A closure is a function plus access to variables from its lexical environment.",
      "Closures capture bindings, so shared bindings show updated values, not frozen snapshots.",
      "Each factory call creates a new environment, which is why two counters are independent.",
      "Closures enable private state, callbacks, factories, and fixes for classic loop problems."
    ],
    "cheatSheetMD": "**Definition:** a closure is a function bundled with its lexical environment.\n\n**Mantra:** functions remember where they were created, not where they are called.\n\n**Counter:** `makeCounter` returns a function that keeps using `c`; each factory call gets a new `c`.\n\n**Bindings, not snapshots:** multiple closures can share one binding; `let` loop iterations create fresh bindings.\n\n**Private state:** keep variables local to a factory and expose methods that close over them.\n\n**Loop bug:** `var` = one shared `i`; fix with `let` or an IIFE."
  },
  {
    "slug": "js-closure-memory",
    "moduleId": "scope-closures",
    "order": 25,
    "title": "Closures & Memory",
    "difficulty": "Advanced",
    "estimatedReadingMin": 7,
    "estimatedPracticeMin": 3,
    "tags": [
      "Closures",
      "Memory",
      "Garbage Collection",
      "Leaks"
    ],
    "introMD": "Closures are not just a syntax feature; they affect memory. If a function closes over a variable and that function is still reachable, the captured variable must remain reachable too.\n\nThat is usually exactly what you want — a counter remembering its count — but it can become a memory leak when long-lived callbacks accidentally retain large objects.",
    "whyItMattersMD": "Senior JavaScript interviews often move from \"what is a closure?\" to \"what does it keep alive?\". Understanding closure memory helps you debug leaks caused by event handlers, timers, caches, and stale callbacks in long-running applications.",
    "theoryMD": "### Closures keep reachable bindings alive\n\nJavaScript garbage collection is based on **reachability**. If an object can be reached from roots such as the global object, the call stack, active timers, event listeners, or module state, it cannot be collected.\n\nA reachable closure points to its captured lexical environment. Any captured variable that can still be used by the closure must stay alive. Engines can optimise details, but the semantic rule is simple: if reachable code can observe it later, it cannot disappear.\n\n### A closure does not always mean a leak\n\nMost closures are short-lived and cheap. A closure becomes a leak risk when it is held for longer than intended and captures more data than necessary. Common examples:\n\n| Long-lived holder | Captured by closure | Leak risk |\n| --- | --- | --- |\n| Event listener | large object or component state | listener not removed |\n| `setInterval` callback | old data snapshot | interval not cleared |\n| Unbounded memoization cache | many results | cache grows forever |\n| Global array of callbacks | request/user objects | callbacks never removed |\n\n### When is closure memory freed?\n\nThe captured environment can be collected when no reachable closure can use it anymore. Practically, that means you remove event listeners, clear timers, delete callbacks from registries, or let the returned function itself become unreachable.\n\nYou can also release heavy captured data earlier by assigning the captured variable to `null` when it is no longer needed. The closure may remain, but it no longer retains the large object through that variable.\n\n### Avoid overclaiming\n\nIn interviews, avoid saying \"closures keep the whole stack frame forever.\" The accurate model is: closures keep the necessary lexical bindings reachable. Engines may optimise unused variables, but observable captured values must behave as if they remain available.",
    "diagrams": [
      {
        "title": "How a long-lived closure can retain memory",
        "ascii": "GC roots\n  |\n  v\nactive interval / listener\n  |\n  v\ncallback function (closure)\n  | hidden lexical link\n  v\ncaptured environment\n  |\n  v\nlarge object or stale state\n\nClear the interval/listener or clear the captured reference to allow collection.",
        "caption": "Garbage collection follows reachability. A reachable callback can keep its captured data alive."
      }
    ],
    "codeExamples": [
      {
        "title": "A timer closure retains what it uses",
        "descriptionMD": "The interval callback keeps `items` reachable until the interval is cleared or the callback becomes unreachable.",
        "language": "javascript",
        "code": "function startPolling(items) {\n  const id = setInterval(function () {\n    console.log('items in memory:', items.length);\n  }, 1000);\n\n  return function stopPolling() {\n    clearInterval(id);\n  };\n}\n\nconst stop = startPolling(['a', 'b', 'c']);\n// Later: stop();"
      },
      {
        "title": "Release a heavy captured value explicitly",
        "descriptionMD": "If the closure must remain alive but no longer needs the heavy data, clear the captured reference.",
        "language": "javascript",
        "code": "function createReader(data) {\n  let cachedData = data;\n\n  return {\n    readSize: function () {\n      return cachedData ? cachedData.length : 0;\n    },\n    release: function () {\n      cachedData = null;\n    }\n  };\n}"
      }
    ],
    "outputPredictions": [
      {
        "code": "function makeReader() {\n  let data = ['large', 'payload'];\n\n  return {\n    read: function () {\n      return data ? data.length : 0;\n    },\n    release: function () {\n      data = null;\n    }\n  };\n}\n\nconst reader = makeReader();\nconsole.log(reader.read());\nreader.release();\nconsole.log(reader.read());",
        "answer": "2\n0",
        "explanationMD": "The `read` and `release` methods close over the same `data` binding. Initially it points to an array of length `2`. After `release` sets that binding to `null`, `read` returns `0`. This also removes the closure's reference to the original array."
      }
    ],
    "interviewQuestions": [
      {
        "question": "Do closures cause memory leaks?",
        "answerMD": "Closures do not inherently cause leaks. They keep captured variables alive while the closure is reachable, which is correct behavior. A leak happens when a closure is unintentionally kept alive for too long — for example by an uncleared interval, an event listener that was not removed, or an unbounded cache — and it retains large data that should have been released.",
        "companies": [
          "Netflix",
          "Meta",
          "Google",
          "Microsoft"
        ],
        "followUps": [
          "How would you fix an event-listener leak?",
          "Can a captured variable be cleared while the closure remains?"
        ]
      },
      {
        "question": "When can the memory captured by a closure be garbage-collected?",
        "answerMD": "When it is no longer reachable. If no reachable function can access the captured environment, the environment can be collected. You can make that happen by dropping references to the closure, removing listeners, clearing timers, deleting callbacks from registries, or clearing captured references such as setting a large object variable to `null`."
      }
    ],
    "quiz": [
      {
        "question": "A closure captures a large array. When can that array be garbage-collected?",
        "options": [
          "Immediately after the outer function returns",
          "Only when the browser tab closes",
          "When no reachable closure or other reference can access it",
          "Never, because closures disable garbage collection"
        ],
        "correctIndex": 2,
        "explanationMD": "Garbage collection is reachability-based. If a reachable closure can still access the array, it stays alive. Once no reachable reference can access it, it can be collected."
      },
      {
        "question": "Which pattern is most likely to leak memory?",
        "options": [
          "A short-lived callback that captures a number",
          "An event listener that captures a large object and is never removed",
          "A local variable inside a function with no returned closure",
          "A `const` primitive inside a block"
        ],
        "correctIndex": 1,
        "explanationMD": "A long-lived listener is a GC root path to its callback. If the callback captures a large object and the listener is never removed, that object can stay alive indefinitely."
      }
    ],
    "summary": [
      "Reachable closures keep their captured lexical bindings reachable.",
      "Closures are not leaks by default; leaks come from closures that live longer than intended.",
      "Timers, listeners, registries, and unbounded caches are common retention sources.",
      "Free memory by removing holders, dropping closure references, bounding caches, or clearing captured heavy values."
    ]
  },
  {
    "slug": "js-closure-uses",
    "moduleId": "scope-closures",
    "order": 26,
    "title": "Practical Uses of Closures",
    "difficulty": "Intermediate",
    "estimatedReadingMin": 8,
    "estimatedPracticeMin": 5,
    "tags": [
      "Closures",
      "Encapsulation",
      "Factories",
      "Memoization",
      "Debounce"
    ],
    "introMD": "Closures are not an academic trick. They are the reason JavaScript can express private state, function factories, partial application, memoization, event handlers that remember context, module patterns, and utilities like debounce.\n\nOnce you see closures as \"functions with remembered lexical state,\" many common patterns become one idea in different clothing.",
    "whyItMattersMD": "Interviewers rarely stop at the definition. They ask where you would use closures in real code. Strong answers connect closures to encapsulation, reusable function factories, cached computation, and UI/event behavior — then mention the tradeoff that long-lived closures can retain memory.",
    "theoryMD": "### 1. Data privacy and encapsulation\n\nA factory can keep variables local and return methods that close over them. Outside code gets a controlled API, not direct access to the state.\n\n### 2. Function factories\n\nA function can accept configuration once and return a specialised function. Examples: `makeMultiplier(2)`, `makeValidator(rules)`, or `makeLogger(prefix)`.\n\n### 3. Partial application and currying preview\n\nClosures let you pre-fill some arguments and return a new function waiting for the rest. This is the basis of partial application and currying, both common in functional JavaScript.\n\n### 4. Memoization preview\n\nA memoized function keeps a private cache in a closure. The caller sees a normal function; internally, repeated inputs can return cached results.\n\n### 5. Event handlers and async callbacks\n\nA callback can remember the data that existed when it was registered: an item id, a retry count, a previous value, or a timer id. This is powerful, but it is also why stale closures and memory retention matter.\n\n### 6. Module pattern preview\n\nBefore ES modules were standard, developers used IIFEs to create private module scope and return a public API. The idea is still useful for interviews because it demonstrates closures clearly.\n\n### 7. Debounce as a motivating example\n\nA debounced function must remember the most recent timer id across calls. That timer id belongs in a closure: every call cancels the old timer and schedules a new one.\n\n| Use case | Captured value | Why closure fits |\n| --- | --- | --- |\n| Private counter | `count` | state hidden from callers |\n| Function factory | configuration | reuse without passing config every time |\n| Partial application | earlier arguments | create a more specific function |\n| Memoization | cache object | persist results between calls |\n| Debounce | timer id | coordinate multiple calls over time |",
    "diagrams": [
      {
        "title": "One closure idea, many patterns",
        "ascii": "factory(config / state)\n      |\n      v\nreturns function or API object\n      | hidden link\n      v\nremembered variables\n      |\n      +--> privacy\n      +--> specialised functions\n      +--> memoization cache\n      +--> event handler context\n      +--> debounce timer id",
        "caption": "Practical closure patterns are all functions carrying remembered lexical state."
      }
    ],
    "codeExamples": [
      {
        "title": "Function factory",
        "descriptionMD": "The returned function remembers `factor` without requiring the caller to pass it again.",
        "language": "javascript",
        "code": "function makeMultiplier(factor) {\n  return function (value) {\n    return value * factor;\n  };\n}\n\nconst double = makeMultiplier(2);\nconsole.log(double(8)); // 16"
      },
      {
        "title": "Memoization with a private cache",
        "descriptionMD": "The cache is not global and not visible to callers. It lives inside the closure.",
        "language": "javascript",
        "code": "function memoize(fn) {\n  const cache = Object.create(null);\n\n  return function (key) {\n    if (Object.prototype.hasOwnProperty.call(cache, key)) {\n      return cache[key];\n    }\n\n    const result = fn(key);\n    cache[key] = result;\n    return result;\n  };\n}"
      },
      {
        "title": "Debounce remembers a timer id",
        "descriptionMD": "Every call shares the same `timerId` binding, so the wrapper can cancel the previous scheduled call.",
        "language": "javascript",
        "code": "function debounce(fn, delay) {\n  let timerId = null;\n\n  return function (...args) {\n    const context = this;\n    clearTimeout(timerId);\n\n    timerId = setTimeout(function () {\n      fn.apply(context, args);\n    }, delay);\n  };\n}"
      }
    ],
    "playground": [
      {
        "title": "Memoization uses a private cache",
        "descriptionMD": "The second call with `4` hits the cache. The cache persists because the returned function closes over it.",
        "code": "function memoizeSquare() {\n  const cache = Object.create(null);\n\n  return function (n) {\n    if (Object.prototype.hasOwnProperty.call(cache, n)) {\n      console.log('cache hit for ' + n);\n      return cache[n];\n    }\n\n    console.log('computing ' + n);\n    cache[n] = n * n;\n    return cache[n];\n  };\n}\n\nconst square = memoizeSquare();\nconsole.log(square(4));\nconsole.log(square(4));\nconsole.log(square(5));"
      },
      {
        "title": "Debounce keeps only the latest call",
        "descriptionMD": "Only the latest rapid call is executed because all calls share one closed-over `timerId`.",
        "code": "function debounce(fn, delay) {\n  let timerId = null;\n\n  return function (value) {\n    clearTimeout(timerId);\n    timerId = setTimeout(function () {\n      fn(value);\n    }, delay);\n  };\n}\n\nconst save = debounce(function (value) {\n  console.log('saved ' + value);\n}, 20);\n\nsave('a');\nsave('ab');\nsave('abc');\n\nsetTimeout(function () {\n  save('abcd');\n}, 40);"
      }
    ],
    "outputPredictions": [
      {
        "code": "function makeMultiplier(factor) {\n  return function (value) {\n    return value * factor;\n  };\n}\n\nconst double = makeMultiplier(2);\nconst triple = makeMultiplier(3);\n\nconsole.log(double(5));\nconsole.log(triple(5));",
        "answer": "10\n15",
        "explanationMD": "`double` closes over `factor = 2`; `triple` closes over `factor = 3`. They are produced by separate calls to `makeMultiplier`, so each returned function keeps its own configuration."
      }
    ],
    "codingExercises": [
      {
        "title": "Implement debounce",
        "difficulty": "Medium",
        "promptMD": "Write `debounce(fn, delay)` that returns a new function. When the returned function is called repeatedly, it should cancel the previous scheduled call and invoke `fn` only after `delay` milliseconds have passed since the most recent call. Preserve `this` and arguments.",
        "hints": [
          "Store the timer id in the outer `debounce` scope.",
          "Call `clearTimeout(timerId)` before scheduling a new timer.",
          "Use `fn.apply(context, args)` so callers do not lose `this` or arguments."
        ],
        "solutionCode": "function debounce(fn, delay) {\n  let timerId = null;\n\n  return function (...args) {\n    const context = this;\n\n    clearTimeout(timerId);\n    timerId = setTimeout(function () {\n      fn.apply(context, args);\n    }, delay);\n  };\n}\n\nconst logSearch = debounce(function (query) {\n  console.log('searching for ' + query);\n}, 300);\n\nlogSearch('j');\nlogSearch('ja');\nlogSearch('jav');\nlogSearch('java');",
        "complexity": {
          "time": "O(1) scheduling per call",
          "space": "O(1) plus captured arguments for the pending call"
        },
        "explanationMD": "All calls to the returned wrapper share the same `timerId` binding. Each call cancels the previous timer and schedules a new one, so only the latest call can eventually invoke `fn`. The wrapper also captures `context` and `args` for the pending invocation."
      }
    ],
    "interviewQuestions": [
      {
        "question": "Give practical uses of closures in JavaScript.",
        "answerMD": "Closures are used for private state/encapsulation, function factories, partial application and currying, memoization caches, event handlers that remember context, the module pattern, and utilities like debounce or throttle. The common idea is a returned or stored function remembering variables from where it was created.",
        "companies": [
          "Amazon",
          "Microsoft",
          "Google",
          "Meta",
          "Netflix"
        ],
        "followUps": [
          "What is the tradeoff of memoization?",
          "How does debounce use a closure?"
        ]
      },
      {
        "question": "How does debounce rely on closures?",
        "answerMD": "`debounce` returns a wrapper function that remembers a `timerId` variable from the outer `debounce` call. Every invocation clears the previous timer and stores a new timer id in the same closed-over binding. Without a closure, the wrapper would not remember which pending call to cancel."
      }
    ],
    "quiz": [
      {
        "question": "Which closure use case stores previous results in a private cache?",
        "options": [
          "Memoization",
          "Shadowing",
          "Implicit globals",
          "Dynamic scope"
        ],
        "correctIndex": 0,
        "explanationMD": "Memoization uses a cache, often held in a closure, to return stored results for repeated inputs."
      },
      {
        "question": "What must a debounced function remember between calls?",
        "options": [
          "The global object",
          "The previous timer id",
          "The entire call stack",
          "Every variable in the program"
        ],
        "correctIndex": 1,
        "explanationMD": "Debounce works by clearing the previous scheduled timer before creating a new one, so the timer id must live in a shared closure."
      }
    ],
    "summary": [
      "Closures enable private state, factories, partial application, memoization, event handlers, module patterns, and debounce.",
      "The shared theme is a function remembering lexical state between calls.",
      "Debounce works because the wrapper closes over one timer id shared by all invocations.",
      "Practical closure patterns are powerful, but long-lived closures should avoid retaining unnecessary data."
    ],
    "cheatSheetMD": "**Privacy:** local variable + returned methods = controlled access.\n\n**Factory:** capture configuration once, return a specialised function.\n\n**Partial application/currying:** capture some arguments now, accept the rest later.\n\n**Memoization:** private cache in a closure; watch cache growth.\n\n**Event handlers:** callbacks remember ids/state from registration time.\n\n**Module pattern:** IIFE creates private scope and returns a public API.\n\n**Debounce:** one closed-over `timerId`; clear old timer, schedule latest call."
  }
];
