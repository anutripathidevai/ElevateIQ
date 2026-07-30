import type { Topic } from "../../types";

export const TOPICS: Topic[] = [

{
  "slug": "js-var",
  "moduleId": "variables-data-types",
  "order": 10,
  "title": "The var Declaration",
  "difficulty": "Beginner",
  "estimatedReadingMin": 8,
  "estimatedPracticeMin": 5,
  "tags": [
    "var",
    "Hoisting",
    "Scope",
    "Closures"
  ],
  "introMD": "`var` is JavaScript's original variable declaration. It is **function-scoped**, can be **redeclared**, is **hoisted and initialised to `undefined`**, and browser-script globals declared with `var` become properties on the global object.\n\nModern JavaScript prefers `let` and `const`, but interviews still ask `var` constantly because it exposes core execution-context ideas: hoisting, scope, closures, and the classic loop bug.",
  "whyItMattersMD": "Legacy codebases, old interview snippets, and many tricky output questions still use `var`. If you can explain why a `var` loop prints the final value repeatedly, you can also explain lexical environments, closure capture, and why ES6 introduced `let`.",
  "theoryMD": "### What makes `var` different\n\n`var` is scoped to the nearest **function** or to the global script, not to a block. An `if`, `for`, or `while` block does not create a new `var` scope.\n\n| Feature | `var` behaviour | Interview consequence |\n| --- | --- | --- |\n| Scope | Function/global scoped | A `var` inside `if` is visible outside the block. |\n| Hoisting | Declaration is hoisted and initialised to `undefined` | Reading before the line does not throw; it returns `undefined`. |\n| Redeclaration | Allowed in the same scope | Accidental duplicate names can hide bugs. |\n| Reassignment | Allowed | The binding can point to a new value. |\n| Global object | Top-level browser-script `var` creates `window.name` / `globalThis.name` | `let` and `const` do not do this. |\n\n### Hoisting precisely\n\nDuring the creation phase of an execution context, JavaScript registers `var` declarations and gives them the value `undefined`. The assignment still happens later during execution.\n\nSo `console.log(x); var x = 10;` behaves like `var x; console.log(x); x = 10;`. This is different from `let` and `const`, which are hoisted too but stay in the temporal dead zone until initialisation.\n\n### The loop closure bug\n\nA `for (var i = 0; ...)` loop has **one shared `i` binding** for the whole function. If callbacks run after the loop, they all close over the same binding. By then the loop has finished, so every callback sees the final value.\n\n### When should you use it?\n\nAlmost never in new code. Use `const` by default and `let` when reassignment is needed. Learn `var` to read legacy code and ace interview questions, not because it is a best practice.",
  "diagrams": [
    {
      "title": "var hoisting and assignment",
      "ascii": "Creation phase\n  var score -> undefined\n\nExecution phase\n  console.log(score) -> undefined\n  score = 42\n  console.log(score) -> 42",
      "caption": "The declaration is registered before execution; the assignment still runs at its original line."
    },
    {
      "title": "One shared loop binding",
      "ascii": "for (var i = 0; i < 3; i++)\n        |\n        +-- callback A closes over same i\n        +-- callback B closes over same i\n        +-- callback C closes over same i\n\nAfter loop: i === 3, so all callbacks read 3",
      "caption": "`var` does not create a fresh binding for each loop iteration."
    }
  ],
  "codeExamples": [
    {
      "title": "Function scope, not block scope",
      "descriptionMD": "The `var` binding leaks out of block statements because only functions create a new `var` scope.",
      "language": "javascript",
      "code": "function checkAccess(isAdmin) {\n  if (isAdmin) {\n    var message = 'allowed';\n  }\n\n  console.log(message);\n}\n\ncheckAccess(true);  // allowed\ncheckAccess(false); // undefined, not ReferenceError"
    },
    {
      "title": "Redeclaration and browser global caveat",
      "descriptionMD": "At the top level of a classic browser script, `var` adds a property to the global object. This is not true for ES modules or Node CommonJS wrappers.",
      "language": "javascript",
      "code": "var status = 'loading';\nvar status = 'ready';\n\nconsole.log(status); // ready\n\n// In a classic browser script only:\n// var appName = 'ElevateIQ';\n// console.log(window.appName); // ElevateIQ"
    }
  ],
  "playground": [
    {
      "title": "See the classic loop bug",
      "descriptionMD": "All callbacks read the same `i` binding after the loop has already finished.",
      "code": "for (var i = 0; i < 3; i++) {\n  setTimeout(function () {\n    console.log('var callback sees', i);\n  }, 0);\n}\n\nconsole.log('loop finished with i =', i);"
    }
  ],
  "outputPredictions": [
    {
      "code": "for (var i = 0; i < 3; i++) {\n  setTimeout(function () {\n    console.log(i);\n  }, 0);\n}",
      "answer": "3\n3\n3",
      "explanationMD": "The loop has one shared `var i` binding. The callbacks run later, after the loop increments `i` to `3`, so each callback logs the same final value."
    },
    {
      "code": "console.log(score);\nvar score = 42;\nconsole.log(score);",
      "answer": "undefined\n42",
      "explanationMD": "The declaration is hoisted and initialised to `undefined`, so the first read is allowed. The assignment to `42` happens only when execution reaches that line."
    }
  ],
  "codingExercises": [
    {
      "title": "Capture the current loop value with legacy var",
      "difficulty": "Medium",
      "promptMD": "You are maintaining legacy code that must keep `var`. Implement `makeLoggers(n)` so it returns an array of functions. Calling the returned functions should log `0`, `1`, ..., `n - 1` instead of logging the final loop value every time.",
      "hints": [
        "A function call creates a new scope for `var` parameters.",
        "Pass the current loop value into an IIFE or helper function.",
        "Each returned logger should close over a different parameter, not the shared loop variable."
      ],
      "solutionCode": "function makeLoggers(n) {\n  var loggers = [];\n\n  for (var i = 0; i < n; i++) {\n    loggers.push((function (value) {\n      return function () {\n        console.log(value);\n      };\n    })(i));\n  }\n\n  return loggers;\n}\n\nvar loggers = makeLoggers(3);\nloggers[0]();\nloggers[1]();\nloggers[2]();",
      "complexity": {
        "time": "O(n)",
        "space": "O(n)"
      },
      "explanationMD": "The IIFE receives the current `i` as `value`. Each call creates a fresh function scope, so each logger closes over a different `value`. In modern code, `let` in the loop header gives you this per-iteration binding automatically."
    }
  ],
  "interviewQuestions": [
    {
      "question": "What is hoisting for `var`, and why does reading a `var` before declaration return `undefined`?",
      "answerMD": "During the creation phase of a function or global execution context, `var` declarations are registered and initialised to `undefined`. The assignment remains where it is. Therefore a read before the assignment sees the initial value `undefined`, not a ReferenceError. `let` and `const` are also hoisted, but they are not usable before initialisation because of the temporal dead zone.",
      "companies": [
        "Microsoft",
        "Amazon",
        "Google"
      ],
      "followUps": [
        "How is this different from `let`?",
        "What is the temporal dead zone?"
      ]
    },
    {
      "question": "Why does `for (var i = 0; i < 3; i++) setTimeout(() => console.log(i))` print `3` three times?",
      "answerMD": "`var` creates one function-scoped `i` binding shared by every iteration. The timer callbacks close over that binding, not over a snapshot of its value. By the time callbacks run, the loop has completed and `i` is `3`, so each callback logs `3`. Use `let`, an IIFE, or pass the value as an argument to capture each iteration separately.",
      "companies": [
        "Meta",
        "Netflix",
        "Apple"
      ]
    }
  ],
  "quiz": [
    {
      "question": "Which statement about `var` is true?",
      "options": [
        "It is block-scoped and has a temporal dead zone",
        "It is function-scoped and initialised to `undefined` during hoisting",
        "It cannot be redeclared in the same scope",
        "It creates a new binding for every loop iteration"
      ],
      "correctIndex": 1,
      "explanationMD": "`var` is function-scoped, redeclarable, and hoisted with an initial value of `undefined`. It does not create block scope or per-iteration loop bindings."
    }
  ],
  "summary": [
    "`var` is function-scoped, not block-scoped.",
    "`var` declarations are hoisted and initialised to `undefined`; assignments are not hoisted.",
    "Top-level `var` in classic browser scripts becomes a global-object property, unlike `let` and `const`.",
    "The classic loop closure bug happens because all callbacks share one `var` loop binding."
  ],
  "cheatSheetMD": "**Scope:** nearest function or global script.\n\n**Hoisting:** declaration hoisted + initialised to `undefined`; assignment stays put.\n\n**Allowed:** redeclaration and reassignment.\n\n**Avoid in new code:** prefer `const`, then `let`.\n\n**Classic bug:** `for (var i...)` callbacks share one `i`; use `let` or an IIFE."
},
{
  "slug": "js-let",
  "moduleId": "variables-data-types",
  "order": 11,
  "title": "The let Declaration",
  "difficulty": "Beginner",
  "estimatedReadingMin": 7,
  "estimatedPracticeMin": 4,
  "tags": [
    "let",
    "Block Scope",
    "TDZ",
    "Loops"
  ],
  "introMD": "`let` is the modern declaration for values that need to be **reassigned**. It is **block-scoped**, cannot be redeclared in the same scope, and has a **temporal dead zone** before its declaration line is executed.\n\nIn interviews, `let` is usually tested as the fix for `var`: it prevents accidental block leaks and creates a fresh binding for each `for` loop iteration.",
  "whyItMattersMD": "Most production JavaScript uses `const` by default and `let` when a value changes. Interviewers ask about `let` to see whether you understand lexical scope and why `let` loop callbacks print `0, 1, 2` while `var` callbacks print the final value.",
  "theoryMD": "### Block scope\n\nA `let` binding belongs to the nearest block: `{ ... }`, `if`, `for`, `while`, `try`, or a function body. It is not visible outside that block.\n\n| Feature | `let` behaviour | Why it matters |\n| --- | --- | --- |\n| Scope | Block-scoped | Prevents values from leaking out of `if` and loop blocks. |\n| Hoisting | Hoisted but uninitialised | Access before declaration throws ReferenceError. |\n| Redeclaration | Not allowed in the same scope | Catches duplicate-name mistakes early. |\n| Reassignment | Allowed | Use when the binding must change. |\n| Loop binding | Fresh binding per iteration in `for` loops | Fixes the classic closure bug. |\n\n### Temporal dead zone\n\nThe **temporal dead zone** (TDZ) is the time from entering a scope until the `let` declaration is executed. The name exists, but it cannot be read or written yet. That is why `typeof x` can throw if `x` is a TDZ binding in the current scope.\n\n### Per-iteration bindings\n\nFor `for (let i = 0; i < 3; i++)`, the language creates a new lexical binding for each iteration. Closures created inside the loop capture that iteration's `i`, not a single shared variable.\n\n### When to choose `let`\n\nUse `let` only when reassignment is part of the design: counters, accumulators, state machines, retry loops, or variables assigned in different branches. If a binding never changes, prefer `const`.",
  "diagrams": [
    {
      "title": "Block scope and TDZ",
      "ascii": "enter block\n  name exists but is uninitialised  <- TDZ\n  reading name throws ReferenceError\n\n  let name = 'Ada'\n  name is usable\n\nleave block\n  name is out of scope",
      "caption": "`let` is known to the scope before its declaration, but it is unusable until initialised."
    }
  ],
  "codeExamples": [
    {
      "title": "Block-scoped reassignment",
      "descriptionMD": "The outer `count` and inner `count` are different bindings because the `if` block creates a lexical scope.",
      "language": "javascript",
      "code": "let count = 1;\n\nif (true) {\n  let count = 2;\n  count = count + 1;\n  console.log(count); // 3\n}\n\nconsole.log(count); // 1"
    },
    {
      "title": "No redeclaration in the same scope",
      "descriptionMD": "Trying to declare the same `let` name twice in one scope is a SyntaxError, which catches accidental duplicates before runtime.",
      "language": "javascript",
      "code": "let userId = 101;\nuserId = 102; // reassignment is allowed\n\n// SyntaxError if uncommented:\n// let userId = 103;"
    }
  ],
  "playground": [
    {
      "title": "let fixes the loop callback bug",
      "descriptionMD": "Each timer closes over the `i` binding for its own iteration.",
      "code": "for (let i = 0; i < 3; i++) {\n  setTimeout(function () {\n    console.log('let callback sees', i);\n  }, 0);\n}"
    }
  ],
  "outputPredictions": [
    {
      "code": "for (let i = 0; i < 3; i++) {\n  setTimeout(function () {\n    console.log(i);\n  }, 0);\n}",
      "answer": "0\n1\n2",
      "explanationMD": "A `let` loop creates a fresh binding for each iteration. Each callback closes over its own `i`, so the callbacks log `0`, `1`, and `2`."
    },
    {
      "code": "try {\n  console.log(total);\n  let total = 5;\n} catch (error) {\n  console.log(error.name);\n}",
      "answer": "ReferenceError",
      "explanationMD": "`total` is in the temporal dead zone from the start of the block until the `let total = 5` line executes. Reading it before then throws ReferenceError."
    }
  ],
  "interviewQuestions": [
    {
      "question": "How is `let` different from `var`?",
      "answerMD": "`let` is block-scoped, cannot be redeclared in the same scope, and is unavailable before initialisation because of the TDZ. `var` is function-scoped, can be redeclared, and is hoisted with `undefined`. In loops, `let` creates a fresh binding per iteration, which fixes the classic closure bug.",
      "companies": [
        "Google",
        "Microsoft",
        "Amazon"
      ],
      "followUps": [
        "Is `let` hoisted?",
        "Why does `typeof` sometimes throw with `let`?"
      ]
    }
  ],
  "quiz": [
    {
      "question": "What happens when you read a `let` variable before its declaration line runs?",
      "options": [
        "It returns `undefined`",
        "It returns `null`",
        "It throws a ReferenceError because of the temporal dead zone",
        "It creates a global variable"
      ],
      "correctIndex": 2,
      "explanationMD": "`let` bindings are hoisted but not initialised. Reading them in the TDZ throws ReferenceError."
    }
  ],
  "summary": [
    "`let` is block-scoped and reassignable.",
    "A `let` binding is hoisted but cannot be accessed during the temporal dead zone.",
    "Redeclaring the same `let` name in one scope is a SyntaxError.",
    "`for` loops with `let` create a fresh binding per iteration, fixing the `var` closure bug."
  ],
  "cheatSheetMD": "**Use for:** variables that must be reassigned.\n\n**Scope:** nearest block.\n\n**TDZ:** from scope entry until declaration execution; read/write throws ReferenceError.\n\n**Loop win:** `for (let i...)` gives each iteration its own `i`.\n\n**Default style:** prefer `const`; use `let` only when reassignment is needed."
},
{
  "slug": "js-const",
  "moduleId": "variables-data-types",
  "order": 12,
  "title": "The const Declaration",
  "difficulty": "Beginner",
  "estimatedReadingMin": 7,
  "estimatedPracticeMin": 4,
  "tags": [
    "const",
    "Bindings",
    "Immutability",
    "Best Practices"
  ],
  "introMD": "`const` creates a block-scoped binding that **must be initialised** and **cannot be reassigned**. The key interview distinction is that `const` protects the **binding**, not the value.\n\nSo `const arr = []; arr.push(1)` works because the array is mutated in place, but `arr = []` throws because it tries to reassign the binding.",
  "whyItMattersMD": "Modern JavaScript style is `const` by default, `let` when reassignment is required, and almost never `var`. Understanding binding vs value prevents a common false statement: `const` does not make objects or arrays immutable.",
  "theoryMD": "### Binding vs value\n\nA variable binding is the name-to-value connection. `const` says that this connection cannot be pointed at a different value after initialisation. It does **not** recursively freeze the value.\n\n| Operation | With `const` | Why |\n| --- | --- | --- |\n| Declare without value | SyntaxError | `const` must be initialised immediately. |\n| Reassign primitive | TypeError at runtime | The binding cannot point elsewhere. |\n| Mutate object property | Allowed | The binding still points to the same object. |\n| Push into array | Allowed | The array object changes; the binding does not. |\n| Redeclare in same scope | SyntaxError | Same as `let`. |\n\n### `const` and object mutation\n\nObjects, arrays, functions, maps, and sets are reference values. A `const` binding can still reference a mutable object. To prevent mutation you need techniques such as `Object.freeze`, immutable update patterns, or persistent data structures. `Object.freeze` is shallow, so nested objects may still be mutable.\n\n### Temporal dead zone\n\nLike `let`, `const` is block-scoped and has a TDZ. You cannot read it before initialisation. Unlike `let`, you cannot declare first and assign later.\n\n### Best-practice rule\n\nUse `const` by default because it communicates intent: this binding should not change. If you later need reassignment, change it to `let`. This reduces accidental state changes and makes code easier to reason about.",
  "diagrams": [
    {
      "title": "A const binding pointing to a mutable object",
      "ascii": "const user ---------------> { name: 'Ada' }\n\nAllowed:   user.name = 'Grace'\nForbidden: user = { name: 'Lin' }",
      "caption": "`const` locks the arrow from the name to the object, not the inside of the object."
    }
  ],
  "codeExamples": [
    {
      "title": "Array mutation is not reassignment",
      "descriptionMD": "The binding still points to the same array after `push`, so the mutation is allowed.",
      "language": "javascript",
      "code": "const scores = [];\nscores.push(10);\nscores.push(20);\n\nconsole.log(scores.join(',')); // 10,20\n\n// TypeError if executed:\n// scores = [];"
    },
    {
      "title": "Shallow freezing",
      "descriptionMD": "`Object.freeze` can help, but it is shallow: nested objects need their own freeze if you require deep immutability.",
      "language": "javascript",
      "code": "const settings = Object.freeze({\n  theme: 'dark',\n  nested: { compact: false }\n});\n\nsettings.nested.compact = true;\nconsole.log(settings.nested.compact); // true"
    }
  ],
  "playground": [
    {
      "title": "Binding is fixed; object can change",
      "descriptionMD": "Run this and notice that mutation succeeds but reassignment throws TypeError.",
      "code": "const cart = [];\ncart.push('book');\nconsole.log(cart.length);\n\ntry {\n  cart = [];\n} catch (error) {\n  console.log(error.name);\n}\n\nconst user = { name: 'Ada' };\nuser.name = 'Grace';\nconsole.log(user.name);"
    }
  ],
  "outputPredictions": [
    {
      "code": "const arr = [];\narr.push(1);\nconsole.log(arr.length);\n\ntry {\n  arr = [];\n} catch (error) {\n  console.log(error.name);\n}",
      "answer": "1\nTypeError",
      "explanationMD": "`arr.push(1)` mutates the array object, so it is allowed. `arr = []` tries to reassign the `const` binding to a new array, so it throws TypeError."
    }
  ],
  "codingExercises": [
    {
      "title": "Add an item without mutating the original array",
      "difficulty": "Easy",
      "promptMD": "Implement `appendItem(items, item)` using `const`-friendly immutable style. It should return a new array with `item` at the end and leave the original array unchanged.",
      "hints": [
        "A `const` binding can point to an array, but the array can still be mutated.",
        "Use `concat` or spread syntax to create a new array.",
        "Check that the original array length is unchanged after the call."
      ],
      "solutionCode": "function appendItem(items, item) {\n  const nextItems = items.concat([item]);\n  return nextItems;\n}\n\nconst original = ['a', 'b'];\nconst updated = appendItem(original, 'c');\n\nconsole.log(original.join(','));\nconsole.log(updated.join(','));",
      "complexity": {
        "time": "O(n)",
        "space": "O(n)"
      },
      "explanationMD": "`concat` creates a new array, so the original input is not mutated. `const` helps document that `nextItems` will not be reassigned, but immutability comes from returning a new value rather than pushing into the old one."
    }
  ],
  "interviewQuestions": [
    {
      "question": "Does `const` make an object immutable?",
      "answerMD": "No. `const` makes the **binding** immutable, not the object. You cannot reassign the variable to another object, but you can mutate properties of the referenced object unless the object is frozen or otherwise protected. `const user = {}; user.name = 'Ada'` is valid; `user = {}` throws.",
      "companies": [
        "Microsoft",
        "Meta",
        "Amazon"
      ],
      "followUps": [
        "What does `Object.freeze` do?",
        "Is `Object.freeze` deep or shallow?"
      ]
    }
  ],
  "quiz": [
    {
      "question": "Which line is valid after `const user = { name: 'Ada' };`?",
      "options": [
        "`user = { name: 'Grace' };`",
        "`user.name = 'Grace';`",
        "`const user = {};` in the same scope",
        "Declaring `const user;` without an initializer"
      ],
      "correctIndex": 1,
      "explanationMD": "Mutating a property is allowed because the binding still points to the same object. Reassignment, redeclaration, and missing initializers are not allowed."
    }
  ],
  "summary": [
    "`const` is block-scoped, has a TDZ, and must be initialised immediately.",
    "`const` prevents reassignment of the binding, not mutation of the referenced value.",
    "Objects and arrays declared with `const` can still be mutated unless separately frozen or copied immutably.",
    "Prefer `const` by default; use `let` only when reassignment is intentional."
  ],
  "cheatSheetMD": "**Must initialise:** `const x = value`.\n\n**Cannot:** reassign or redeclare in same scope.\n\n**Can:** mutate referenced objects/arrays (`arr.push`, `obj.x = 1`).\n\n**Immutability:** use immutable updates, `Object.freeze` (shallow), or libraries — not `const` alone.\n\n**Style:** default to `const`, upgrade to `let` only when reassignment is needed."
},
{
  "slug": "js-primitive-types",
  "moduleId": "variables-data-types",
  "order": 13,
  "title": "Primitive Types",
  "difficulty": "Beginner",
  "estimatedReadingMin": 8,
  "estimatedPracticeMin": 3,
  "tags": [
    "Primitives",
    "Types",
    "Number",
    "Immutability"
  ],
  "introMD": "JavaScript has seven primitive types: **string, number, boolean, null, undefined, symbol, and bigint**. A primitive is a value that is not an object and has no mutable internal properties.\n\nPrimitives are copied by value, compared by value, and behave as immutable values even when JavaScript temporarily boxes them to access methods like `'hello'.toUpperCase()`.",
  "whyItMattersMD": "Many interview traps come from type fundamentals: `typeof NaN === 'number'`, `0.1 + 0.2 !== 0.3`, strings cannot be mutated character-by-character, and primitives do not share state when assigned to another variable.",
  "theoryMD": "### The seven primitives\n\n| Primitive | Example | Notes |\n| --- | --- | --- |\n| `string` | `'Ada'` | Immutable sequence of UTF-16 code units. |\n| `number` | `42`, `3.14`, `NaN`, `Infinity` | IEEE-754 double; safe integers only up to `Number.MAX_SAFE_INTEGER`. |\n| `boolean` | `true`, `false` | Often produced by comparisons. |\n| `null` | `null` | Intentional absence of an object/value. |\n| `undefined` | `undefined` | Missing or uninitialised value. |\n| `symbol` | `Symbol('id')` | Unique property key / protocol hook. |\n| `bigint` | `123n` | Arbitrary-precision integer. |\n\n### Immutability\n\nPrimitive values cannot be changed in place. Operations produce new values. For example, strings feel array-like, but assigning to `name[0]` does not change the string.\n\n### Pass by value\n\nWhen you assign a primitive to another variable or pass it into a function, JavaScript copies the primitive value. Reassigning the parameter or second variable does not affect the original.\n\n### Number interview classics\n\n`NaN` is still a number type because it is a numeric sentinel for an invalid numeric result. Floating-point decimals are binary approximations, so `0.1 + 0.2` is `0.30000000000000004`, not exactly `0.3`. Use tolerances for decimal comparisons, and use `bigint` for very large integers when fractional values are not needed.",
  "diagrams": [
    {
      "title": "Primitive assignment copies the value",
      "ascii": "let a = 10\nlet b = a\n\na -> 10\nb -> 10\n\nb = 11\n\na -> 10\nb -> 11",
      "caption": "Changing `b` does not affect `a` because primitives are copied by value."
    }
  ],
  "codeExamples": [
    {
      "title": "Primitive values do not share mutation",
      "descriptionMD": "The function receives a copy of the primitive value. Reassigning the parameter cannot change the caller's variable.",
      "language": "javascript",
      "code": "function increment(value) {\n  value = value + 1;\n  return value;\n}\n\nlet count = 10;\nlet next = increment(count);\n\nconsole.log(count); // 10\nconsole.log(next);  // 11"
    },
    {
      "title": "Number quirks to know",
      "descriptionMD": "`number` covers normal numbers, `NaN`, and infinities. Decimal arithmetic uses binary floating point.",
      "language": "javascript",
      "code": "console.log(typeof NaN);\nconsole.log(Number.isNaN(NaN));\nconsole.log(0.1 + 0.2);\nconsole.log(0.1 + 0.2 === 0.3);"
    }
  ],
  "outputPredictions": [
    {
      "code": "let word = 'cat';\nword[0] = 'b';\nconsole.log(word);\n\nlet a = 10;\nlet b = a;\nb = b + 1;\nconsole.log(a);\nconsole.log(b);\n\nconsole.log(typeof NaN);\nconsole.log(0.1 + 0.2 === 0.3);",
      "answer": "cat\n10\n11\nnumber\nfalse",
      "explanationMD": "Strings are immutable, so assigning to `word[0]` does not change `'cat'` in non-strict code. `a` and `b` hold independent primitive values. `NaN` has type `number`, and binary floating-point rounding means `0.1 + 0.2` is not exactly `0.3`."
    }
  ],
  "interviewQuestions": [
    {
      "question": "List the primitive types in JavaScript and explain how they are passed.",
      "answerMD": "The seven primitives are `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, and `bigint`. They are immutable values and are assigned/passed by value. If a function parameter receives a primitive and reassigns it, the caller's original variable is unchanged.",
      "companies": [
        "Apple",
        "Amazon",
        "Microsoft"
      ],
      "followUps": [
        "Why is `typeof null` not `null`?",
        "Why does `typeof NaN` return `number`?"
      ]
    }
  ],
  "quiz": [
    {
      "question": "Which is NOT a JavaScript primitive type?",
      "options": [
        "symbol",
        "bigint",
        "array",
        "undefined"
      ],
      "correctIndex": 2,
      "explanationMD": "Arrays are objects. The primitive types are string, number, boolean, null, undefined, symbol, and bigint."
    },
    {
      "question": "Why is `0.1 + 0.2 === 0.3` false?",
      "options": [
        "Because `+` concatenates decimals as strings",
        "Because JavaScript numbers use binary floating-point approximation",
        "Because `0.3` is a BigInt",
        "Because `===` cannot compare numbers"
      ],
      "correctIndex": 1,
      "explanationMD": "JavaScript numbers are IEEE-754 doubles. Some decimal fractions cannot be represented exactly in binary, so tiny rounding errors appear."
    }
  ],
  "summary": [
    "JavaScript has seven primitives: string, number, boolean, null, undefined, symbol, and bigint.",
    "Primitives are immutable and are copied by value on assignment or function call.",
    "`NaN` is a number value; `typeof NaN` returns `number`.",
    "Floating-point arithmetic can produce precision surprises such as `0.1 + 0.2 !== 0.3`."
  ],
  "cheatSheetMD": "**Primitives:** `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`.\n\n**Properties:** immutable, compared by value, copied by value.\n\n**Number gotchas:** `typeof NaN === 'number'`; decimal precision errors; safe integers up to `Number.MAX_SAFE_INTEGER`.\n\n**Strings:** immutable; methods return new strings."
},
{
  "slug": "js-reference-types",
  "moduleId": "variables-data-types",
  "order": 14,
  "title": "Reference Types",
  "difficulty": "Intermediate",
  "estimatedReadingMin": 9,
  "estimatedPracticeMin": 5,
  "tags": [
    "Objects",
    "Arrays",
    "References",
    "Copying"
  ],
  "introMD": "Objects, arrays, and functions are **reference types**. Variables do not hold the whole object directly; they hold a reference value that points to the object.\n\nThis explains why assigning an object to another variable can share mutations, why two identical-looking arrays are not equal, and why shallow copies still share nested objects.",
  "whyItMattersMD": "Reference semantics power a huge number of JavaScript interview questions: mutation through aliases, React state bugs, shallow-copy surprises, equality checks, and function arguments that mutate caller-owned objects.",
  "theoryMD": "### What is a reference value?\n\nWhen you write `const user = { name: 'Ada' }`, the variable stores a reference to an object in memory. Copying the variable copies the reference value, not the object itself.\n\n| Concept | Behaviour | Example consequence |\n| --- | --- | --- |\n| Assignment | Copies the reference value | `b = a` makes both variables point to the same object. |\n| Mutation | Changes the shared object | `b.name = 'Grace'` is visible through `a`. |\n| Reassignment | Changes only one binding | `b = {}` does not move `a`. |\n| Equality | Compares references | `{ } === { }` is `false`. |\n| Shallow copy | Copies top-level properties only | Nested objects are still shared. |\n\n### Pass by reference value\n\nJavaScript is often described as passing objects by reference, but the precise model is **pass by value of the reference**. A function receives a copy of the reference value. It can mutate the object that reference points to, but if it reassigns the parameter to a new object, the caller's variable still points to the original object.\n\n### Shallow vs deep copy\n\nA shallow copy (`{ ...obj }`, `Object.assign`, `array.slice`, `array.concat`) creates a new container but reuses nested references. A deep copy recursively copies nested values. Modern environments provide `structuredClone` for many data types, but it does not clone functions and has its own limitations. JSON-based copying loses dates, `undefined`, `symbol`, functions, `Map`, `Set`, and more.\n\n### Equality by identity\n\nObjects are equal only when they are the same object reference. Two arrays with the same items are still different arrays, so `[1, 2] === [1, 2]` is `false`.",
  "diagrams": [
    {
      "title": "Two variables, one object",
      "ascii": "const a = { count: 1 }\nconst b = a\n\na -----> { count: 1 }\n          ^\nb --------+\n\nb.count = 2 changes the same object",
      "caption": "Assignment copied the reference value, so both names point to one object."
    },
    {
      "title": "Shallow copy shares nested objects",
      "ascii": "original --> { profile --> { city: 'Delhi' } }\ncopy     --> { profile -----------+ }\n                         same nested object\n\nTop-level object is new; nested profile is shared.",
      "caption": "Spread syntax is shallow, not recursive."
    }
  ],
  "codeExamples": [
    {
      "title": "Mutation through an alias",
      "descriptionMD": "Both variables point to the same object until one binding is reassigned.",
      "language": "javascript",
      "code": "const original = { count: 1 };\nconst alias = original;\n\nalias.count = 2;\nconsole.log(original.count); // 2\n\nconst replacement = { count: 3 };\nconsole.log(original.count);    // 2\nconsole.log(replacement.count); // 3"
    },
    {
      "title": "Shallow copy surprise",
      "descriptionMD": "The spread creates a new top-level object, but `profile` is still shared.",
      "language": "javascript",
      "code": "const user = {\n  name: 'Ada',\n  profile: { city: 'London' }\n};\n\nconst copy = { ...user };\ncopy.profile.city = 'Paris';\n\nconsole.log(user.profile.city); // Paris"
    }
  ],
  "playground": [
    {
      "title": "Reference sharing vs reassignment",
      "descriptionMD": "Mutating through a parameter affects the original object; reassigning the parameter does not.",
      "code": "function mutateAndReplace(item) {\n  item.count = item.count + 1;\n  item = { count: 100 };\n  console.log('inside', item.count);\n}\n\nconst box = { count: 1 };\nmutateAndReplace(box);\nconsole.log('outside', box.count);\n\nconsole.log({ a: 1 } === { a: 1 });"
    }
  ],
  "outputPredictions": [
    {
      "code": "const a = { count: 1 };\nconst b = a;\n\nb.count = 2;\nconsole.log(a.count);\n\nfunction replace(obj) {\n  obj.count = 3;\n  obj = { count: 4 };\n}\n\nreplace(a);\nconsole.log(a.count);\nconsole.log(a === b);\nconsole.log([1, 2] === [1, 2]);",
      "answer": "2\n3\ntrue\nfalse",
      "explanationMD": "`a` and `b` share one object, so mutating through `b` changes `a.count`. The function receives a copy of the reference value; it can mutate the object to `3`, but reassigning `obj` does not affect `a`. `a === b` is true because both references point to the same object. Two array literals create two different arrays, so they are not equal."
    }
  ],
  "codingExercises": [
    {
      "title": "Update one user immutably",
      "difficulty": "Medium",
      "promptMD": "Implement `renameUser(users, id, nextName)`. Return a new array. Only the matching user object should be copied with the new name; non-matching user objects should keep their original references.",
      "hints": [
        "Use `map` to create a new array.",
        "For the matching user, return a shallow copy with the changed `name`.",
        "For all other users, return the original object reference."
      ],
      "solutionCode": "function renameUser(users, id, nextName) {\n  return users.map(function (user) {\n    if (user.id !== id) {\n      return user;\n    }\n\n    return {\n      ...user,\n      name: nextName\n    };\n  });\n}\n\nconst users = [\n  { id: 1, name: 'Ada' },\n  { id: 2, name: 'Lin' }\n];\n\nconst nextUsers = renameUser(users, 2, 'Grace');\nconsole.log(users[1].name);\nconsole.log(nextUsers[1].name);\nconsole.log(users[0] === nextUsers[0]);\nconsole.log(users[1] === nextUsers[1]);",
      "complexity": {
        "time": "O(n)",
        "space": "O(n)"
      },
      "explanationMD": "The returned array is new because `map` creates a new array. The changed user is also a new object, while unchanged users preserve identity. This is the common immutable update pattern used in UI state management."
    }
  ],
  "interviewQuestions": [
    {
      "question": "Are objects passed by reference in JavaScript?",
      "answerMD": "More precisely, JavaScript passes the **reference value by value**. The function parameter receives a copy of a reference to the same object. Mutating the object through that parameter affects the caller-visible object. Reassigning the parameter to a new object affects only the local parameter binding.",
      "companies": [
        "Google",
        "Meta",
        "Netflix",
        "Amazon"
      ],
      "followUps": [
        "How do shallow copies differ from deep copies?",
        "Why is `{}` === `{}` false?"
      ]
    }
  ],
  "quiz": [
    {
      "question": "What does `{ ...user }` do when `user.profile` is an object?",
      "options": [
        "It deep-clones `user` and `user.profile`",
        "It creates a new top-level object but shares the same `profile` reference",
        "It mutates `user` in place",
        "It converts `profile` into a primitive"
      ],
      "correctIndex": 1,
      "explanationMD": "Object spread is shallow. The top-level object is new, but nested object references are copied as references."
    },
    {
      "question": "Why is `[1, 2] === [1, 2]` false?",
      "options": [
        "Arrays cannot be compared in JavaScript",
        "The arrays contain numbers, and numbers are imprecise",
        "Each array literal creates a different object reference",
        "`===` performs string comparison for arrays"
      ],
      "correctIndex": 2,
      "explanationMD": "Objects and arrays are compared by reference identity. The two literals create two separate arrays."
    }
  ],
  "summary": [
    "Objects, arrays, and functions are reference types.",
    "Assignment copies the reference value, so aliases can share mutations.",
    "JavaScript passes object references by value: mutation is visible, parameter reassignment is not.",
    "Shallow copies create a new container but still share nested references."
  ],
  "cheatSheetMD": "**Reference types:** objects, arrays, functions.\n\n**Assignment:** copies the reference value, not the object.\n\n**Equality:** identity-based (`a === b` only if same object).\n\n**Function calls:** can mutate shared object; cannot reassign caller's binding.\n\n**Copying:** spread/Object.assign/slice are shallow; use `structuredClone` or custom logic for deep copies."
},
{
  "slug": "js-typeof",
  "moduleId": "variables-data-types",
  "order": 15,
  "title": "The typeof Operator",
  "difficulty": "Beginner",
  "estimatedReadingMin": 7,
  "estimatedPracticeMin": 3,
  "tags": [
    "typeof",
    "Type Checking",
    "Runtime",
    "Quirks"
  ],
  "introMD": "`typeof` is a unary operator that returns a string describing the broad runtime type of a value. It is useful for primitives and safe checks for undeclared names, but it has famous quirks: `typeof null` is `'object'`, arrays are `'object'`, and functions are `'function'`.",
  "whyItMattersMD": "`typeof` appears in almost every JavaScript interview because it tests both practical type checking and historical knowledge. The safest candidates know what `typeof` can answer, what it cannot, and why `typeof null === 'object'` should not be used to detect objects blindly.",
  "theoryMD": "### Return values\n\n`typeof value` always returns one of a small set of strings. It does not return constructor names like `Array` or `Date`.\n\n| Expression | Result | Notes |\n| --- | --- | --- |\n| `typeof undefined` | `'undefined'` | Also works for undeclared names. |\n| `typeof true` | `'boolean'` | Boolean primitive. |\n| `typeof 123` / `typeof NaN` | `'number'` | `NaN` is still a number value. |\n| `typeof 'x'` | `'string'` | String primitive. |\n| `typeof 10n` | `'bigint'` | BigInt primitive. |\n| `typeof Symbol('x')` | `'symbol'` | Symbol primitive. |\n| `typeof function () {}` | `'function'` | Special callable object result. |\n| `typeof {}` / `typeof []` / `typeof null` | `'object'` | `null` is the historical bug. |\n\n### The `null` bug\n\n`typeof null` returns `'object'` because of an early implementation tag bug that became web-compatible behaviour. It cannot be fixed without breaking old code. Always check `value !== null` when using `typeof value === 'object'`.\n\n### Safe undeclared checks\n\n`typeof maybeMissing` returns `'undefined'` even if `maybeMissing` was never declared. Directly reading `maybeMissing` would throw ReferenceError. This is useful for feature detection.\n\n### What `typeof` cannot do\n\n`typeof` cannot distinguish arrays, dates, maps, sets, regexps, or plain objects. Use `Array.isArray(value)`, `value instanceof Date`, or more precise checks depending on the problem.",
  "diagrams": [
    {
      "title": "typeof decision shortcut",
      "ascii": "primitive? -> string such as number, string, boolean, bigint, symbol, undefined\nfunction?  -> function\nnull?      -> object   (historical bug)\nobject?    -> object   (arrays, dates, plain objects)",
      "caption": "`typeof` is broad; use specialised checks for object subtypes."
    }
  ],
  "codeExamples": [
    {
      "title": "Safe object check",
      "descriptionMD": "Always exclude `null` when using `typeof value === 'object'`.",
      "language": "javascript",
      "code": "function isObjectLike(value) {\n  return value !== null && typeof value === 'object';\n}\n\nconsole.log(isObjectLike({}));   // true\nconsole.log(isObjectLike([]));   // true\nconsole.log(isObjectLike(null)); // false"
    },
    {
      "title": "Feature detection with typeof",
      "descriptionMD": "`typeof` can safely test undeclared globals without throwing.",
      "language": "javascript",
      "code": "if (typeof fetch === 'function') {\n  console.log('fetch is available');\n} else {\n  console.log('fetch is not available');\n}\n\nconsole.log(typeof completelyMissingName); // undefined"
    }
  ],
  "outputPredictions": [
    {
      "code": "console.log(typeof null);\nconsole.log(typeof function () {});\nconsole.log(typeof NaN);\nconsole.log(typeof []);\nconsole.log(typeof notDeclaredYet);",
      "answer": "object\nfunction\nnumber\nobject\nundefined",
      "explanationMD": "`null` returns `'object'` due to a historical bug. Functions get the special result `'function'`. `NaN` is a number value. Arrays are objects. `typeof` can check an undeclared name without throwing and returns `'undefined'`."
    }
  ],
  "interviewQuestions": [
    {
      "question": "Why does `typeof null` return `'object'`?",
      "answerMD": "It is a historical implementation bug from early JavaScript. Values were represented with type tags, and the null pointer matched the object tag pattern. The result became web-compatible behaviour, so it remains. In real checks, use `value !== null && typeof value === 'object'`.",
      "companies": [
        "Google",
        "Microsoft",
        "Apple"
      ],
      "followUps": [
        "How do you check for arrays?",
        "Can `typeof` check an undeclared variable safely?"
      ]
    }
  ],
  "quiz": [
    {
      "question": "What is the result of `typeof NaN`?",
      "options": [
        "'NaN'",
        "'number'",
        "'undefined'",
        "'object'"
      ],
      "correctIndex": 1,
      "explanationMD": "`NaN` is a special numeric value, so `typeof NaN` returns `'number'."
    },
    {
      "question": "Which is the safest plain object-like guard among these?",
      "options": [
        "`typeof value === 'object'`",
        "`value !== null && typeof value === 'object'`",
        "`typeof value !== 'function'`",
        "`value == undefined`"
      ],
      "correctIndex": 1,
      "explanationMD": "Because `typeof null` is `'object'`, you must exclude `null` before treating a value as object-like."
    }
  ],
  "summary": [
    "`typeof` returns broad type strings such as `number`, `string`, `undefined`, `object`, and `function`.",
    "`typeof null` is `'object'`, a historical bug you must guard against.",
    "`typeof function () {}` is `'function'`; arrays are still `'object'`.",
    "`typeof undeclaredName` safely returns `'undefined'` instead of throwing."
  ],
  "cheatSheetMD": "**Results:** `undefined`, `boolean`, `number`, `string`, `bigint`, `symbol`, `function`, `object`.\n\n**Quirks:** `typeof null === 'object'`; `typeof [] === 'object'`; `typeof NaN === 'number'`.\n\n**Safe undeclared:** `typeof maybeGlobal === 'undefined'`.\n\n**Better checks:** `Array.isArray`, `value instanceof Date`, `value !== null && typeof value === 'object'`."
},
{
  "slug": "js-null",
  "moduleId": "variables-data-types",
  "order": 16,
  "title": "null",
  "difficulty": "Beginner",
  "estimatedReadingMin": 6,
  "estimatedPracticeMin": 3,
  "tags": [
    "null",
    "Absence",
    "Equality",
    "JSON"
  ],
  "introMD": "`null` is a primitive value that usually means **intentional absence**: a value is expected, but it is deliberately empty. It is different from `undefined`, which usually means missing, uninitialised, or not provided.\n\nThe classic quirk is `typeof null === 'object'`, but `null` itself is still a primitive value.",
  "whyItMattersMD": "APIs often use `null` to say `no result`, databases use it heavily, and JSON preserves it. Interviews use `null` to test equality rules, `typeof` quirks, and whether you can design clear missing-value semantics.",
  "theoryMD": "### Intentional absence\n\nUse `null` when your program deliberately sets a variable or property to no value. For example, a search result may be `null` when no user exists.\n\n| Situation | Prefer | Reason |\n| --- | --- | --- |\n| No selected item yet | `null` | Absence is intentional state. |\n| Optional parameter omitted | `undefined` | JavaScript supplies it automatically. |\n| Object property intentionally cleared | `null` | Communicates deliberate emptiness. |\n| JSON API field with no value | `null` | JSON supports `null`, not `undefined`. |\n\n### `typeof null` quirk\n\n`typeof null` returns `'object'`, but this is a historical bug. Do not use it as proof that `null` is an object. To check for object-like values, write `value !== null && typeof value === 'object'`.\n\n### Equality with undefined\n\n`null == undefined` is `true` because loose equality treats them as the same kind of absence. `null === undefined` is `false` because they are different primitive values. In interviews and production code, prefer explicit checks unless you intentionally want to match both.\n\n### JSON behaviour\n\n`JSON.stringify` keeps `null` object properties but omits properties whose value is `undefined`. In arrays, both `undefined` slots and `null` become `null` in JSON output.",
  "diagrams": [
    {
      "title": "Absence semantics",
      "ascii": "undefined -> not provided / not initialised / missing by default\nnull      -> provided deliberately as empty\n\nAPI response: { user: null } means the field exists and no user was found",
      "caption": "Use `null` when absence is an intentional value in your domain model."
    }
  ],
  "codeExamples": [
    {
      "title": "Checking for null explicitly",
      "descriptionMD": "Strict equality makes the intent clear and avoids accidental matches with `undefined`.",
      "language": "javascript",
      "code": "function greet(user) {\n  if (user === null) {\n    console.log('No user selected');\n    return;\n  }\n\n  console.log('Hello ' + user.name);\n}\n\ngreet(null);"
    },
    {
      "title": "JSON preserves null",
      "descriptionMD": "`null` is part of JSON. `undefined` is not a JSON value for object properties.",
      "language": "javascript",
      "code": "const payload = {\n  selectedUser: null,\n  temporaryValue: undefined\n};\n\nconsole.log(JSON.stringify(payload)); // {\"selectedUser\":null}"
    }
  ],
  "outputPredictions": [
    {
      "code": "console.log(typeof null);\nconsole.log(null == undefined);\nconsole.log(null === undefined);\nconsole.log(JSON.stringify({ a: null, b: undefined }));\nconsole.log(JSON.stringify([undefined, null]));",
      "answer": "object\ntrue\nfalse\n{\"a\":null}\n[null,null]",
      "explanationMD": "The `typeof` result is the historical bug. Loose equality treats `null` and `undefined` as equal, while strict equality does not. JSON keeps the `null` property, drops the `undefined` object property, and converts array `undefined` to `null`."
    }
  ],
  "interviewQuestions": [
    {
      "question": "When would you use `null` instead of `undefined`?",
      "answerMD": "Use `null` when absence is intentional and meaningful in the domain: no selected item, no database row found, or a field deliberately cleared. `undefined` is better for values JavaScript naturally leaves missing: uninitialised variables, omitted arguments, missing properties, or functions without returns.",
      "companies": [
        "Amazon",
        "Microsoft",
        "Netflix"
      ],
      "followUps": [
        "Why does `typeof null` return `object`?",
        "How does JSON treat `null` and `undefined` differently?"
      ]
    }
  ],
  "quiz": [
    {
      "question": "Which statement is correct?",
      "options": [
        "`null` and `undefined` are strictly equal",
        "`typeof null` returns `'null'`",
        "`null == undefined` is true but `null === undefined` is false",
        "JSON.stringify always removes `null` properties"
      ],
      "correctIndex": 2,
      "explanationMD": "Loose equality treats `null` and `undefined` as equivalent absence values, but strict equality keeps them distinct. JSON preserves `null`."
    }
  ],
  "summary": [
    "`null` represents intentional absence and is a primitive value.",
    "`typeof null` returns `'object'` because of a historical bug.",
    "`null == undefined` is true, but `null === undefined` is false.",
    "JSON preserves `null` object properties but omits `undefined` object properties."
  ],
  "cheatSheetMD": "**Meaning:** deliberate empty value / no object / no result.\n\n**Type quirk:** `typeof null === 'object'`.\n\n**Equality:** `null == undefined` true; `null === undefined` false.\n\n**JSON:** `null` is preserved; object properties with `undefined` are omitted.\n\n**Guard:** `value === null` for exactly null; `value == null` only if you intentionally mean null or undefined."
},
{
  "slug": "js-undefined",
  "moduleId": "variables-data-types",
  "order": 17,
  "title": "undefined",
  "difficulty": "Beginner",
  "estimatedReadingMin": 6,
  "estimatedPracticeMin": 3,
  "tags": [
    "undefined",
    "Missing Values",
    "Defaults",
    "void"
  ],
  "introMD": "`undefined` is the primitive value JavaScript uses when something has not been given a value: an uninitialised variable, a missing property, an omitted argument, or a function that returns nothing.\n\nWhere `null` often means deliberate emptiness, `undefined` usually means the value is missing by default.",
  "whyItMattersMD": "`undefined` shows up everywhere in real debugging: optional config, missing API fields, default parameters, array holes, and forgotten `return` statements. Interviewers use it to test whether you can distinguish language defaults from intentional application state.",
  "theoryMD": "### Where `undefined` comes from\n\n| Source | Example | Result |\n| --- | --- | --- |\n| Declared but not assigned | `let x;` | `x` is `undefined`. |\n| Missing property | `obj.missing` | `undefined`. |\n| Omitted argument | `fn()` for parameter `x` | `x` is `undefined`. |\n| No explicit return | `function f() {}` | `f()` returns `undefined`. |\n| `void` operator | `void 0` | Always evaluates to `undefined`. |\n\n### `undefined` vs undeclared\n\nA declared variable can have the value `undefined`. An undeclared name does not exist in the scope chain and direct access throws ReferenceError. `typeof undeclaredName` is the safe exception: it returns `'undefined'`.\n\n### Defaults\n\nDefault parameters and nullish coalescing often treat `undefined` as missing. `function greet(name = 'friend')` uses the default when the argument is omitted or explicitly `undefined`, but not when it is `null`.\n\n### `void 0`\n\nHistorically, `void 0` was used as a guaranteed way to produce `undefined` because old JavaScript allowed the global `undefined` property to be overwritten. Modern code can use `undefined` directly, but `void 0` still appears in minified or legacy snippets.",
  "diagrams": [
    {
      "title": "Missing-value pipeline",
      "ascii": "let x;              -> undefined\n({}).missing        -> undefined\nfunction f() {} f() -> undefined\nvoid 0              -> undefined",
      "caption": "`undefined` is the default value for several forms of missingness."
    }
  ],
  "codeExamples": [
    {
      "title": "Default parameters use undefined",
      "descriptionMD": "The default runs for omitted or `undefined`, but not for `null`.",
      "language": "javascript",
      "code": "function greet(name = 'friend') {\n  console.log('Hello ' + name);\n}\n\ngreet();\ngreet(undefined);\ngreet(null);"
    },
    {
      "title": "Declared undefined vs undeclared",
      "descriptionMD": "A variable can exist with value `undefined`; an undeclared name is not in scope.",
      "language": "javascript",
      "code": "let declaredButEmpty;\nconsole.log(declaredButEmpty === undefined);\nconsole.log(typeof notDeclaredAnywhere);"
    }
  ],
  "outputPredictions": [
    {
      "code": "let value;\nfunction noReturn() {}\nfunction show(arg) {\n  console.log(arg);\n}\n\nconsole.log(value);\nconsole.log({}.missing);\nconsole.log(noReturn());\nshow();\nconsole.log(void 0 === undefined);",
      "answer": "undefined\nundefined\nundefined\nundefined\ntrue",
      "explanationMD": "Uninitialised variables, missing properties, functions with no explicit return, and omitted parameters all produce `undefined`. `void 0` also evaluates to `undefined`."
    }
  ],
  "interviewQuestions": [
    {
      "question": "What is the difference between `undefined`, `null`, and an undeclared variable?",
      "answerMD": "`undefined` is a real primitive value that usually means missing by default. `null` is a real primitive value used for intentional absence. An undeclared variable is not bound in the scope chain; direct access throws ReferenceError, although `typeof undeclaredName` safely returns `'undefined'`.",
      "companies": [
        "Google",
        "Apple",
        "Microsoft"
      ],
      "followUps": [
        "When do default parameters apply?",
        "What does `void 0` do?"
      ]
    }
  ],
  "quiz": [
    {
      "question": "Which expression does NOT naturally produce `undefined`?",
      "options": [
        "Reading a missing object property",
        "Calling a function with no `return`",
        "An omitted function argument",
        "A variable explicitly assigned `null`"
      ],
      "correctIndex": 3,
      "explanationMD": "`null` is a distinct primitive value. Missing properties, no-return functions, and omitted parameters produce `undefined`."
    }
  ],
  "summary": [
    "`undefined` means a value is missing, uninitialised, omitted, or not returned.",
    "A declared variable can hold `undefined`; an undeclared name is a ReferenceError on direct access.",
    "Default parameters apply to omitted or explicitly `undefined` arguments, not to `null`.",
    "`void 0` is a legacy-safe way to produce `undefined`."
  ],
  "cheatSheetMD": "**Common sources:** `let x;`, missing property, omitted argument, no return, `void 0`.\n\n**Declared vs undeclared:** declared can equal `undefined`; undeclared direct access throws.\n\n**Defaults:** parameter defaults trigger on `undefined`, not `null`.\n\n**Nullish checks:** `value == null` matches both null and undefined; use only when intentional."
},
{
  "slug": "js-symbol",
  "moduleId": "variables-data-types",
  "order": 18,
  "title": "Symbol",
  "difficulty": "Intermediate",
  "estimatedReadingMin": 8,
  "estimatedPracticeMin": 4,
  "tags": [
    "Symbol",
    "Property Keys",
    "Iterators",
    "Protocols"
  ],
  "introMD": "`Symbol` is a primitive type whose values are guaranteed to be unique. Symbols are often used as non-colliding object property keys and as hooks into JavaScript protocols such as iteration via `Symbol.iterator`.\n\n`Symbol('id')` and another `Symbol('id')` have the same description but are different values. `Symbol.for('id')` uses a global registry and can return the same symbol for the same key.",
  "whyItMattersMD": "Symbols are less common than strings and numbers, but they are high-signal in interviews. They reveal whether you understand property keys, enumeration, uniqueness, and language protocols like `for...of` and custom iterables.",
  "theoryMD": "### Unique primitive identifiers\n\nEvery call to `Symbol(description)` returns a new unique primitive. The description is only for debugging; it does not participate in equality.\n\n| Use case | Symbol role | Example |\n| --- | --- | --- |\n| Avoid property-name collisions | Unique object key | Library metadata on user objects. |\n| Hide from common enumeration | Symbol keys skipped by `Object.keys` and JSON | Internal-ish fields. |\n| Well-known protocols | Built-in symbols customize behaviour | `Symbol.iterator`, `Symbol.toStringTag`. |\n| Shared symbol by key | Global registry | `Symbol.for('app.id')`. |\n\n### Symbols as property keys\n\nObject property keys can be strings or symbols. Symbol-keyed properties are not returned by `Object.keys`, `for...in`, or JSON serialization. They are still real properties and can be retrieved with `Object.getOwnPropertySymbols` or `Reflect.ownKeys`.\n\n### Well-known symbols\n\nJavaScript defines well-known symbols that engines look for to customize behaviour. The most important early example is `Symbol.iterator`: if an object has a method at that key, `for...of` can iterate it.\n\n### Global symbol registry\n\n`Symbol.for(key)` checks a runtime-wide registry. If a symbol for the key exists, it returns it; otherwise it creates one. `Symbol.keyFor(symbol)` returns the registry key for registered symbols, but returns `undefined` for local symbols created with `Symbol()`.",
  "diagrams": [
    {
      "title": "Local symbols vs registry symbols",
      "ascii": "Symbol('id')  -> unique A\nSymbol('id')  -> unique B\nA !== B\n\nSymbol.for('id') -> registry symbol R\nSymbol.for('id') -> same registry symbol R",
      "caption": "Descriptions are not identities. The global registry is the exception when you intentionally want sharing."
    }
  ],
  "codeExamples": [
    {
      "title": "Symbol property keys",
      "descriptionMD": "Symbol keys avoid collisions and are skipped by common string-key enumeration APIs.",
      "language": "javascript",
      "code": "const internalId = Symbol('internalId');\nconst user = { name: 'Ada' };\n\nuser[internalId] = 123;\n\nconsole.log(Object.keys(user));\nconsole.log(Object.getOwnPropertySymbols(user).length);\nconsole.log(user[internalId]);"
    },
    {
      "title": "A custom iterable with Symbol.iterator",
      "descriptionMD": "`for...of` looks for a method stored under the well-known `Symbol.iterator` key.",
      "language": "javascript",
      "code": "const numbers = {\n  start: 1,\n  end: 3,\n  [Symbol.iterator]: function () {\n    let current = this.start;\n    const end = this.end;\n\n    return {\n      next: function () {\n        if (current <= end) {\n          return { value: current++, done: false };\n        }\n\n        return { value: undefined, done: true };\n      }\n    };\n  }\n};\n\nfor (const value of numbers) {\n  console.log(value);\n}"
    }
  ],
  "playground": [
    {
      "title": "Explore symbol keys and registry symbols",
      "descriptionMD": "Compare local symbols with registry symbols, then inspect which keys normal enumeration can see.",
      "code": "const localA = Symbol('id');\nconst localB = Symbol('id');\nconst sharedA = Symbol.for('id');\nconst sharedB = Symbol.for('id');\n\nconsole.log(localA === localB);\nconsole.log(sharedA === sharedB);\n\nconst user = { name: 'Ada' };\nuser[localA] = 42;\n\nconsole.log(JSON.stringify(Object.keys(user)));\nconsole.log(Object.getOwnPropertySymbols(user).length);"
    }
  ],
  "outputPredictions": [
    {
      "code": "const a = Symbol('id');\nconst b = Symbol('id');\nconsole.log(a === b);\n\nconst c = Symbol.for('id');\nconst d = Symbol.for('id');\nconsole.log(c === d);\n\nconst secret = Symbol('secret');\nconst user = { name: 'Ada' };\nuser[secret] = 99;\n\nconsole.log(JSON.stringify(Object.keys(user)));\nconsole.log(user[secret]);\nconsole.log(JSON.stringify(user));",
      "answer": "false\ntrue\n[\"name\"]\n99\n{\"name\":\"Ada\"}",
      "explanationMD": "Local symbols are always unique, even with the same description. `Symbol.for` returns the shared registry symbol for the same key. Symbol-keyed properties are skipped by `Object.keys` and JSON serialization, but they remain accessible through the symbol itself."
    }
  ],
  "codingExercises": [
    {
      "title": "Create an iterable range",
      "difficulty": "Medium",
      "promptMD": "Implement `makeRange(start, end)` so the returned object can be used in `for...of` and yields every integer from `start` through `end` inclusive. Use `Symbol.iterator` directly.",
      "hints": [
        "Return an object with a method at `[Symbol.iterator]`.",
        "That method should return an iterator object with a `next()` method.",
        "Each `next()` call returns `{ value, done }`."
      ],
      "solutionCode": "function makeRange(start, end) {\n  return {\n    [Symbol.iterator]: function () {\n      let current = start;\n\n      return {\n        next: function () {\n          if (current <= end) {\n            return { value: current++, done: false };\n          }\n\n          return { value: undefined, done: true };\n        }\n      };\n    }\n  };\n}\n\nfor (const value of makeRange(2, 4)) {\n  console.log(value);\n}",
      "complexity": {
        "time": "O(n)",
        "space": "O(1)"
      },
      "explanationMD": "`for...of` calls the object's `Symbol.iterator` method to get an iterator. The iterator's `next()` method yields numbers until the range is exhausted, then returns `done: true`."
    }
  ],
  "interviewQuestions": [
    {
      "question": "What are Symbols used for in JavaScript?",
      "answerMD": "Symbols are unique primitive values commonly used as object property keys that cannot collide with normal string keys. They are skipped by common enumeration methods like `Object.keys` and JSON serialization. Well-known symbols such as `Symbol.iterator` let objects participate in language protocols. `Symbol.for` is used when you intentionally want a shared symbol from the global registry.",
      "companies": [
        "Google",
        "Meta",
        "Apple"
      ],
      "followUps": [
        "Are symbol properties private?",
        "What is the difference between `Symbol()` and `Symbol.for()`?"
      ]
    }
  ],
  "quiz": [
    {
      "question": "What is `Symbol('x') === Symbol('x')`?",
      "options": [
        "true",
        "false",
        "It throws TypeError",
        "It depends on strict mode"
      ],
      "correctIndex": 1,
      "explanationMD": "Every `Symbol()` call creates a new unique symbol. The description is only a debugging label."
    },
    {
      "question": "Which API returns symbol keys from an object?",
      "options": [
        "Object.keys",
        "JSON.stringify",
        "Object.getOwnPropertySymbols",
        "parseInt"
      ],
      "correctIndex": 2,
      "explanationMD": "`Object.getOwnPropertySymbols(obj)` returns an array of an object's own symbol keys."
    }
  ],
  "summary": [
    "`Symbol()` creates a unique primitive value, even when descriptions match.",
    "Symbols can be object property keys and avoid name collisions.",
    "Symbol-keyed properties are skipped by `Object.keys`, `for...in`, and JSON serialization.",
    "Well-known symbols like `Symbol.iterator` customize language protocols; `Symbol.for` uses a global registry."
  ],
  "cheatSheetMD": "**Create:** `const key = Symbol('debug description')`.\n\n**Unique:** `Symbol('x') !== Symbol('x')`.\n\n**Registry:** `Symbol.for('x') === Symbol.for('x')`; `Symbol.keyFor`.\n\n**Object keys:** use `obj[key]`; find with `Object.getOwnPropertySymbols` or `Reflect.ownKeys`.\n\n**Protocols:** `Symbol.iterator` enables `for...of`."
},
{
  "slug": "js-bigint",
  "moduleId": "variables-data-types",
  "order": 19,
  "title": "BigInt",
  "difficulty": "Intermediate",
  "estimatedReadingMin": 7,
  "estimatedPracticeMin": 4,
  "tags": [
    "BigInt",
    "Numbers",
    "Precision",
    "Integers"
  ],
  "introMD": "`BigInt` is JavaScript's primitive type for **arbitrary-precision integers**. It solves the integer precision limit of `number`, which is safe only up to `Number.MAX_SAFE_INTEGER` (`2^53 - 1`).\n\nCreate BigInts with the `n` suffix (`9007199254740993n`) or the `BigInt()` function. BigInts cannot be mixed with Numbers in arithmetic, and `Math` methods do not accept them.",
  "whyItMattersMD": "BigInt appears whenever identifiers, counters, timestamps, cryptography, or financial integer units can exceed 53 safe bits. Interviewers ask it to see whether you know the `number` limit and the TypeError caused by mixing `1n + 1`.",
  "theoryMD": "### Why BigInt exists\n\nJavaScript `number` is an IEEE-754 double. It can represent very large magnitudes, but it can only represent integers exactly up to `Number.MAX_SAFE_INTEGER`, which is `9007199254740991` (`2^53 - 1`). After that, adjacent integers may collapse to the same number.\n\n| Topic | BigInt rule | Example |\n| --- | --- | --- |\n| Literal | Add `n` suffix | `123n`. |\n| Constructor | Use `BigInt(value)` for integer strings/numbers | `BigInt('123')`. |\n| Arithmetic | Use BigInt with BigInt | `1n + 2n`. |\n| Mixing | Number + BigInt throws | `1n + 1` is TypeError. |\n| Division | Integer division truncates | `5n / 2n` is `2n`. |\n| Math | `Math.max(1n, 2n)` throws | Convert carefully if safe. |\n| JSON | `JSON.stringify(1n)` throws | Convert to string first. |\n\n### BigInt vs Number\n\nUse `number` for normal arithmetic, decimals, UI measurements, and `Math` APIs. Use `bigint` for integers that must remain exact beyond the safe-number range. BigInt has no fractional values, so `1.5n` is invalid.\n\n### Conversions\n\nConvert intentionally. `Number(big)` may lose precision if the BigInt is outside the safe integer range. `BigInt(number)` requires the number to be an integer. For API payloads, BigInts are commonly serialized as strings.\n\n### Comparisons\n\nRelational comparisons like `1n < 2` are allowed, but arithmetic mixing is not. Strict equality keeps types distinct: `1n === 1` is false, while loose equality `1n == 1` is true. Prefer strict equality and explicit conversion.",
  "diagrams": [
    {
      "title": "Safe integer boundary",
      "ascii": "Number safe integers\n\n-(2^53 - 1) ---------------- 0 ---------------- (2^53 - 1)\n                                              9007199254740991\n\nBeyond this boundary, Number integer precision is not guaranteed.\nBigInt can keep growing exactly for integers.",
      "caption": "BigInt is for exact integers beyond the safe range of Number."
    }
  ],
  "codeExamples": [
    {
      "title": "Safe integer collapse",
      "descriptionMD": "Past `Number.MAX_SAFE_INTEGER`, two different mathematical integers can compare equal as Numbers.",
      "language": "javascript",
      "code": "const max = Number.MAX_SAFE_INTEGER;\n\nconsole.log(max);\nconsole.log(max + 1);\nconsole.log(max + 2);\nconsole.log(max + 1 === max + 2);"
    },
    {
      "title": "BigInt arithmetic rules",
      "descriptionMD": "Keep both operands BigInt, and remember that division truncates because BigInt represents integers only.",
      "language": "javascript",
      "code": "console.log(10n + 5n);\nconsole.log(5n / 2n);\n\ntry {\n  console.log(1n + 1);\n} catch (error) {\n  console.log(error.name);\n}"
    }
  ],
  "playground": [
    {
      "title": "Compare Number precision with BigInt precision",
      "descriptionMD": "Numbers lose integer precision past the safe limit; BigInt stays exact.",
      "code": "const unsafe = Number.MAX_SAFE_INTEGER + 1;\nconsole.log(unsafe === unsafe + 1);\n\nconst exact = BigInt(Number.MAX_SAFE_INTEGER) + 1n;\nconsole.log(String(exact));\nconsole.log(String(exact + 1n));\n\ntry {\n  console.log(Math.max(1n, 2n));\n} catch (error) {\n  console.log(error.name);\n}"
    }
  ],
  "outputPredictions": [
    {
      "code": "console.log(Number.MAX_SAFE_INTEGER);\nconsole.log(Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2);\nconsole.log(String(9007199254740993n + 2n));\n\ntry {\n  console.log(1n + 1);\n} catch (error) {\n  console.log(error.name);\n}",
      "answer": "9007199254740991\ntrue\n9007199254740995\nTypeError",
      "explanationMD": "The maximum safe Number integer is `2^53 - 1`. Past that, adjacent integer values may collapse, so `max + 1` and `max + 2` compare equal. BigInt arithmetic remains exact, but mixing BigInt and Number in arithmetic throws TypeError."
    }
  ],
  "interviewQuestions": [
    {
      "question": "Why do we need BigInt if JavaScript already has Number?",
      "answerMD": "`number` is a floating-point type and can only represent integers exactly up to `Number.MAX_SAFE_INTEGER` (`2^53 - 1`). BigInt represents integers with arbitrary precision, so it is used when exact large integers matter. It cannot represent fractions, cannot be used with `Math` methods, and cannot be mixed with Number in arithmetic without explicit conversion.",
      "companies": [
        "Google",
        "Amazon",
        "Microsoft",
        "Meta"
      ],
      "followUps": [
        "What happens with `1n + 1`?",
        "Can BigInt be serialized directly with JSON?"
      ]
    }
  ],
  "quiz": [
    {
      "question": "What happens when JavaScript evaluates `1n + 1`?",
      "options": [
        "It returns `2n`",
        "It returns `2`",
        "It throws TypeError because BigInt and Number cannot be mixed in arithmetic",
        "It returns `NaN`"
      ],
      "correctIndex": 2,
      "explanationMD": "Arithmetic operators require both operands to be compatible. BigInt and Number must be converted explicitly before arithmetic."
    },
    {
      "question": "Which value is the largest safe integer for JavaScript Number?",
      "options": [
        "2^31 - 1",
        "2^32 - 1",
        "2^53 - 1",
        "Infinity"
      ],
      "correctIndex": 2,
      "explanationMD": "`Number.MAX_SAFE_INTEGER` is `9007199254740991`, which is `2^53 - 1`."
    }
  ],
  "summary": [
    "BigInt represents arbitrary-precision integers with the `bigint` primitive type.",
    "Number integers are only safe up to `Number.MAX_SAFE_INTEGER` (`2^53 - 1`).",
    "Create BigInts with the `n` suffix or `BigInt()` for integer inputs.",
    "BigInt cannot be mixed with Number in arithmetic, cannot use `Math`, and should be serialized intentionally."
  ],
  "cheatSheetMD": "**Create:** `123n`, `BigInt('123')`.\n\n**Use for:** exact large integers beyond `Number.MAX_SAFE_INTEGER`.\n\n**No mixing:** `1n + 1` throws TypeError; convert explicitly.\n\n**No decimals:** BigInt is integer-only; division truncates.\n\n**No Math / JSON direct:** `Math.max(1n, 2n)` throws; `JSON.stringify(1n)` throws — convert to string."
}
];

