import type { Topic } from "../../types";

export const TOPICS: Topic[] = [
  // 33 ---------------------------------------------------------------------
  {
    slug: "js-function-declaration",
    moduleId: "functions",
    order: 33,
    title: "Function Declarations",
    difficulty: "Beginner",
    estimatedReadingMin: 9,
    estimatedPracticeMin: 8,
    tags: ["Functions", "Hoisting", "Declarations", "Call Stack"],
    introMD: "A **function declaration** defines a named, reusable block of code with the `function` keyword. It creates a binding in the current scope and, unlike most values, the function body is available throughout that scope during execution.\n\nThat hoisting behavior is why `calculateTotal()` can be called above the line where `function calculateTotal(...)` appears. Declarations are the clearest choice for top-level utilities, domain operations, and functions that deserve a stable name in stack traces and interview explanations.",
    whyItMattersMD: "Function declarations are the baseline for almost every JavaScript interview. They test whether you understand hoisting, execution contexts, parameters, return values, recursion, and the difference between a named callable binding and a function value stored later in a variable.",
    theoryMD: "### Syntax and behavior\n\nA declaration has a name, optional parameters, and a body: `function add(a, b) { return a + b; }`. When JavaScript creates an execution context, it registers function declarations before running the body of that scope. The binding points to the actual function object, not to `undefined`, so declarations can be called before their source line.\n\n| Concept | Function declaration behavior |\n| --- | --- |\n| Name | Required and visible in its scope. |\n| Hoisting | Entire function is available before the declaration line executes. |\n| Return value | `return` exits immediately; missing `return` produces `undefined`. |\n| Scope | Parameters and local variables belong to the function call. |\n| Recursion | Easy because the function has a stable internal name. |\n\nCalling a function pushes a new frame onto the call stack. That frame contains parameters, local variables, and the return address. When the function returns or throws, the frame is popped and control resumes at the caller. Declarations also make code read like an API: high-level flow can appear above helper implementations.\n\nIn modern strict-mode JavaScript, block-level function declarations are block-scoped. Older sloppy-mode browser behavior was inconsistent, so for interview clarity prefer top-level declarations inside a function or module, or use a `const` function expression when you need a block-local function value.",
    diagrams: [
      {
        title: "Function declaration hoisting",
        ascii: `Creation phase
  add -> function object

Execution phase
  console.log(add(2, 3)) -> 5
  function add(a, b) { ... } line is reached later`,
        caption: "The declaration is registered with its function body before execution starts."
      }
    ],
    codeExamples: [
      {
        title: "Calling a declaration before its source line",
        descriptionMD: "The binding already points to the function object during execution, so this works.",
        language: "javascript",
        code: `console.log(calculateTotal(40, 2));

function calculateTotal(price, tax) {
  return price + tax;
}`
      },
      {
        title: "Guard clauses keep declarations readable",
        descriptionMD: "Named declarations are excellent for business rules because each branch can return as soon as the answer is known.",
        language: "javascript",
        code: `function getDiscountTier(points) {
  if (points >= 1000) {
    return 'platinum';
  }

  if (points >= 500) {
    return 'gold';
  }

  if (points >= 100) {
    return 'silver';
  }

  return 'standard';
}

console.log(getDiscountTier(720));`
      }
    ],
    playground: [
      {
        title: "Trace a function call",
        descriptionMD: "Run this, then change the input object. Notice how the declaration can appear below the call site.",
        code: `const user = { first: 'Ada', last: 'Lovelace' };
console.log(formatUser(user));

function formatUser(person) {
  const fullName = person.first + ' ' + person.last;
  return fullName.toUpperCase();
}`
      }
    ],
    outputPredictions: [
      {
        code: `console.log(add(2, 3));

function add(a, b) {
  return a + b;
}

console.log(typeof add);`,
        answer: "5\nfunction",
        explanationMD: "The declaration is hoisted with the function body, so the first call succeeds even though the source line appears later. `typeof add` is `function` because the binding points to a callable function object."
      }
    ],
    codingExercises: [
      {
        title: "Write an interview-friendly range classifier",
        difficulty: "Easy",
        promptMD: "Implement a function declaration `classifyScore(score)` that returns `excellent` for scores 90 and above, `good` for 75 to 89, `pass` for 50 to 74, and `fail` below 50. Use clear guard clauses and return strings exactly as specified.",
        hints: ["Use a named function declaration, not an arrow function.", "Check the highest threshold first so each branch can return immediately.", "A missing final return would produce `undefined`, so include a default branch."],
        solutionCode: `function classifyScore(score) {
  if (score >= 90) {
    return 'excellent';
  }

  if (score >= 75) {
    return 'good';
  }

  if (score >= 50) {
    return 'pass';
  }

  return 'fail';
}

console.log(classifyScore(96));
console.log(classifyScore(81));
console.log(classifyScore(62));
console.log(classifyScore(34));`,
        complexity: { time: "O(1)", space: "O(1)" },
        explanationMD: "Each guard clause handles one threshold and returns immediately. The order matters: if you checked `score >= 50` first, every passing score would be classified as `pass` before higher tiers were considered."
      }
    ],
    interviewQuestions: [
      {
        question: "What is hoisted for a function declaration?",
        answerMD: "The function binding and the function body are created during the creation phase of the surrounding execution context. That means you can call a declaration before its source line. This differs from `var` function expressions, where only the variable is hoisted as `undefined`, and from `let` or `const` function expressions, which are in the temporal dead zone until initialized.",
        companies: ["Microsoft", "Amazon", "Google"],
        followUps: ["How is this different from a function expression assigned to `const`?", "What does a function return if it has no explicit `return`?"]
      },
      {
        question: "When would you prefer a function declaration over an arrow function?",
        answerMD: "Use a declaration for named, reusable operations where hoisting, stack-trace names, recursion, or API-like readability are helpful. Use arrows for short callbacks or when you intentionally want lexical `this`. Declarations are especially clear for top-level domain functions and interview solutions."
      }
    ],
    quiz: [
      {
        question: "Why can a function declaration be called before it appears in source code?",
        options: ["Because JavaScript runs files from bottom to top", "Because the declaration is registered with its function body during the creation phase", "Because function calls are asynchronous", "Because declarations are stored on arrays"],
        correctIndex: 1,
        explanationMD: "During execution-context creation, function declarations are bound to their function objects before the code runs. The assignment-style initialization step does not need to be reached first."
      }
    ],
    summary: [
      "A function declaration creates a named callable binding with the `function` keyword.",
      "Declarations are hoisted with their body, so they can be called before their source line.",
      "Each call creates a call-stack frame with parameters and local variables.",
      "Use declarations for reusable, named operations that should read like an API."
    ],
    cheatSheetMD: "**Syntax:** `function name(params) { return value; }`.\n\n**Hoisting:** callable before the declaration line because the function body is registered during creation.\n\n**Return:** missing `return` means `undefined`.\n\n**Best for:** top-level utilities, recursive functions, interview solutions, readable domain operations.\n\n**Compare:** declarations are ready immediately; `const fn = function () {}` is not usable before initialization."
  },

  // 34 ---------------------------------------------------------------------
  {
    slug: "js-function-expression",
    moduleId: "functions",
    order: 34,
    title: "Function Expressions",
    difficulty: "Beginner",
    estimatedReadingMin: 9,
    estimatedPracticeMin: 10,
    tags: ["Functions", "Expressions", "TDZ", "Closures"],
    introMD: "A **function expression** creates a function value as part of an expression. That value can be assigned to a variable, passed as an argument, returned from another function, or stored in an object.\n\nThe most common modern form is `const fn = function (...) { ... }`. The variable follows normal `const` or `let` rules, so the function value is not available until the assignment line executes.",
    whyItMattersMD: "Function expressions are where functions start to feel like values. They explain callback-heavy JavaScript, decorators like `once`, named function expressions for recursion, and one of the most common output puzzles: declaration hoisting works, but a `const` function expression is in the temporal dead zone.",
    theoryMD: "### Expression, not declaration\n\nA declaration creates a named binding directly. A function expression evaluates to a function object. The receiving variable or property determines how you access it.\n\n| Form | Hoisting behavior | Typical use |\n| --- | --- | --- |\n| `function run() {}` | Function body is available throughout scope. | Named reusable operation. |\n| `const run = function () {}` | `run` is in TDZ until initialized. | Function value assigned to a constant. |\n| `const run = function namedRun() {}` | Outer name is `run`; inner name helps recursion/debugging. | Recursion and better stack traces. |\n\nA function expression can be anonymous or named. Named expressions are underrated: the inner name is available inside the function body, which helps recursion and stack traces without leaking a second name into the outer scope.\n\nIf a function expression is assigned to `const` or `let`, the binding exists but cannot be read before initialization. If assigned to `var`, the variable is hoisted as `undefined`, so calling it early usually throws TypeError because `undefined` is not callable.\n\nBecause function expressions are values, they are ideal for wrappers. A wrapper can keep private variables in a closure and return a new function that controls how the original function is called. This is how utilities such as `once`, `memoize`, `debounce`, and `throttle` are built.",
    diagrams: [
      {
        title: "Function expression initialization",
        ascii: `enter scope
  makeLabel exists but is uninitialized  <- TDZ

execute assignment
  makeLabel -> function object

later
  makeLabel('Ada') calls the stored function value`,
        caption: "The variable follows `const` or `let` timing; the function object is created when the expression runs."
      }
    ],
    codeExamples: [
      {
        title: "Named function expression for recursion",
        descriptionMD: "The inner name `fact` is available inside the function, even though callers use the outer variable `factorial`.",
        language: "javascript",
        code: `const factorial = function fact(n) {
  if (n <= 1) {
    return 1;
  }

  return n * fact(n - 1);
};

console.log(factorial(5));`
      },
      {
        title: "Expressions can be selected at runtime",
        descriptionMD: "Because functions are values, a branch can choose which implementation to store.",
        language: "javascript",
        code: `const useStrictValidation = true;

const validateName = useStrictValidation
  ? function (name) {
      return name.length >= 3 && name.indexOf(' ') === -1;
    }
  : function (name) {
      return name.length > 0;
    };

console.log(validateName('Ada'));`
      }
    ],
    playground: [
      {
        title: "Declaration hoisting vs expression TDZ",
        descriptionMD: "Run this and compare the declaration call with the expression call before initialization.",
        code: `console.log(declaredGreeting('Ada'));

function declaredGreeting(name) {
  return 'Hello ' + name;
}

try {
  console.log(expressionGreeting('Ada'));
} catch (error) {
  console.log(error.name);
}

const expressionGreeting = function (name) {
  return 'Hi ' + name;
};

console.log(expressionGreeting('Ada'));`
      }
    ],
    outputPredictions: [
      {
        code: `console.log(declared());

function declared() {
  return 'declaration ready';
}

try {
  console.log(expressed());
} catch (error) {
  console.log(error.name);
}

const expressed = function () {
  return 'expression ready';
};

console.log(expressed());`,
        answer: "declaration ready\nReferenceError\nexpression ready",
        explanationMD: "The declaration is callable before its source line. The `const expressed` binding exists but is uninitialized until the assignment runs, so reading it early throws ReferenceError. After initialization, it holds a normal function value."
      }
    ],
    codingExercises: [
      {
        title: "Implement once as a function expression",
        difficulty: "Medium",
        promptMD: "Implement `once(fn)` using a function expression. It should return a wrapper that calls `fn` only the first time. Later calls should return the first result without calling `fn` again. Preserve the caller's `this` and arguments.",
        hints: ["Keep `called` and `result` in the closure created by `once`.", "Use a normal function for the returned wrapper if you need dynamic `this`.", "Use `fn.apply(this, args)` to forward both `this` and all arguments."],
        solutionCode: `const once = function (fn) {
  let called = false;
  let result;

  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }

    return result;
  };
};

const createId = once(function (prefix) {
  console.log('creating id');
  return prefix + '-1';
});

console.log(createId('user'));
console.log(createId('order'));
console.log(createId('team'));`,
        complexity: { time: "O(1) per call plus the wrapped function on the first call", space: "O(1)" },
        explanationMD: "`called` and `result` live in the closure of the returned wrapper. The first call invokes `fn` and stores its result. Later calls skip `fn` entirely and return the cached result. Using a normal function wrapper preserves dynamic `this` via `apply`."
      }
    ],
    interviewQuestions: [
      {
        question: "How does a function expression assigned to `const` differ from a function declaration?",
        answerMD: "A declaration is hoisted with its function body and can be called before its source line. A `const` function expression follows lexical-binding rules: the name is in the temporal dead zone until the assignment executes. After initialization, both refer to callable function objects, but their creation timing and readability tradeoffs differ.",
        companies: ["Google", "Meta", "Amazon"],
        followUps: ["What happens if the expression is assigned to `var` instead?", "Why might you use a named function expression?"]
      },
      {
        question: "Why are function expressions useful for wrappers like `once` or `memoize`?",
        answerMD: "They are values that can be returned from other functions. The returned wrapper closes over private state such as a cache, a called flag, or timing metadata, while exposing a normal callable API to the outside."
      }
    ],
    quiz: [
      {
        question: "What happens when you call a `const` function expression before the assignment line executes?",
        options: ["It works because all functions are hoisted with their bodies", "It returns `undefined`", "It throws ReferenceError because the binding is in the temporal dead zone", "It becomes a global function automatically"],
        correctIndex: 2,
        explanationMD: "The function object is created when the expression is evaluated. Before that, the `const` binding is uninitialized and cannot be read."
      }
    ],
    summary: [
      "A function expression evaluates to a function value.",
      "`const` and `let` function expressions are not callable before initialization because of the TDZ.",
      "Named function expressions improve recursion and stack traces without creating a second outer binding.",
      "Expressions are ideal for wrappers that close over private state."
    ],
    cheatSheetMD: "**Syntax:** `const fn = function (params) { ... };`.\n\n**Timing:** variable rules apply. `const` and `let` are TDZ before initialization; `var` is `undefined` before assignment.\n\n**Named expression:** `const f = function inner() { inner(); };` helps recursion/debugging.\n\n**Power move:** return function expressions to build wrappers like `once`, `memoize`, `debounce`, and `throttle`."
  },

  // 35 ---------------------------------------------------------------------
  {
    slug: "js-arrow-functions",
    moduleId: "functions",
    order: 35,
    title: "Arrow Functions",
    difficulty: "Intermediate",
    estimatedReadingMin: 10,
    estimatedPracticeMin: 10,
    tags: ["Arrow Functions", "Lexical this", "Callbacks", "ES6"],
    introMD: "Arrow functions are a concise ES6 syntax for function expressions. They are excellent for short callbacks and small transformations, but their most important semantic feature is not brevity: arrow functions have **lexical `this`**.\n\nAn arrow does not create its own `this`, `arguments`, `super`, or `new.target`. It closes over those values from the surrounding scope, which is powerful for nested callbacks and dangerous when you need a method with dynamic `this`.",
    whyItMattersMD: "Arrow functions are everywhere in modern JavaScript and React code. Interviewers use them to separate syntax memorization from real understanding: concise return rules are easy, but lexical `this`, constructor limitations, and method pitfalls are the high-signal parts.",
    theoryMD: "### Syntax forms\n\n- Expression body: `const double = n => n * 2;` implicitly returns the expression.\n- Block body: `const double = n => { return n * 2; };` needs an explicit `return`.\n- Multiple parameters require parentheses: `(a, b) => a + b`.\n- Returning an object literal from an expression body requires parentheses: `() => ({ ok: true })`.\n\nNormal functions get `this` from how they are called: `obj.method()`, `fn.call(value)`, `new Fn()`, and so on. Arrow functions skip that binding step. They read `this` from the closest surrounding non-arrow function or module scope.\n\nThe safest interview demonstration uses an explicit object method: a normal method receives `this` as the object, then returns an arrow that remembers that same object even when called later. Avoid examples that depend on the value of global `this`, because it differs across modules, browsers, workers, and strict mode.\n\nArrow functions cannot be constructors, so `new Arrow()` throws TypeError. They also do not have their own `arguments` object; use rest parameters instead. Because `this` is lexical, arrows are usually the wrong choice for object methods that expect `obj.method()` to set `this`. Use arrows for small callbacks, pure transformations, and nested functions that should inherit `this`.",
    diagrams: [
      {
        title: "Lexical this through an explicit object",
        ascii: `team.makeLabeler()
  normal method call sets this -> team
  method returns arrow
  arrow closes over team

later labeler.call(other, 'Ada')
  call cannot replace arrow this
  arrow still reads team.prefix`,
        caption: "An arrow's `this` is chosen where the arrow is created, not where it is called."
      }
    ],
    codeExamples: [
      {
        title: "Arrow remembers the method receiver",
        descriptionMD: "The normal method gets `this` from `team.makeLabeler()`. The nested arrow captures that `this` and keeps it for later.",
        language: "javascript",
        code: `const team = {
  prefix: 'Core',
  makeLabeler: function () {
    return (name) => this.prefix + ': ' + name;
  }
};

const label = team.makeLabeler();
console.log(label('Ada'));`
      },
      {
        title: "Use rest parameters instead of arguments",
        descriptionMD: "Arrows do not have their own `arguments`, so rest parameters are the explicit modern replacement.",
        language: "javascript",
        code: `const sum = (...numbers) => numbers.reduce(function (total, value) {
  return total + value;
}, 0);

console.log(sum(1, 2, 3, 4));`
      }
    ],
    playground: [
      {
        title: "Lexical this without relying on global this",
        descriptionMD: "The returned arrow updates the `counter` object because it captured `this` from the normal method call.",
        code: `const counter = {
  value: 0,
  makeIncrementer: function () {
    return () => {
      this.value += 1;
      return this.value;
    };
  }
};

const inc = counter.makeIncrementer();
console.log(inc());
console.log(inc());
console.log(counter.value);`
      }
    ],
    outputPredictions: [
      {
        code: `const profile = {
  name: 'Ada',
  makeArrowReader: function () {
    return () => this.name;
  },
  makeRegularReader: function () {
    return function () {
      return this.name;
    };
  }
};

const arrowReader = profile.makeArrowReader();
const regularReader = profile.makeRegularReader();
const other = { name: 'Grace' };

console.log(arrowReader.call(other));
console.log(regularReader.call(other));`,
        answer: "Ada\nGrace",
        explanationMD: "The arrow was created inside a normal method call where `this` was `profile`, so `.call(other)` cannot change it. The regular returned function gets `this` from how it is called, so `.call(other)` makes it read `other.name`."
      }
    ],
    codingExercises: [
      {
        title: "Build a prefix formatter with lexical this",
        difficulty: "Medium",
        promptMD: "Complete `makeFormatter` on the `formatter` object so it returns a function. The returned function should format values as `PREFIX:value`, and it must keep using the original object even if the returned function is called with a different `this`.",
        hints: ["Define `makeFormatter` as a normal method so `formatter.makeFormatter()` sets `this` correctly.", "Return an arrow from inside that method to capture the method's `this`.", "Do not read from global `this`; use the explicit object receiver."],
        solutionCode: `const formatter = {
  prefix: 'USER',
  makeFormatter: function () {
    return (value) => this.prefix + ':' + value;
  }
};

const format = formatter.makeFormatter();
const other = { prefix: 'ORDER' };

console.log(format('42'));
console.log(format.call(other, '42'));`,
        complexity: { time: "O(1) per formatted value", space: "O(1)" },
        explanationMD: "The normal method call sets `this` to `formatter`. The returned arrow captures that `this`, so both direct calls and `.call(other)` continue to use `formatter.prefix`. This is the correct, explicit way to demonstrate lexical `this`."
      }
    ],
    interviewQuestions: [
      {
        question: "What does it mean that arrow functions have lexical `this`?",
        answerMD: "An arrow does not bind its own `this`. It reads `this` from the surrounding scope where the arrow is created. Therefore `.call`, `.apply`, `.bind`, or method-call syntax cannot replace an arrow's `this`. This is useful for nested callbacks but wrong for methods that need dynamic receivers.",
        companies: ["Google", "Meta", "Microsoft", "Netflix"],
        followUps: ["Can an arrow function be used with `new`?", "Why do arrows not have their own `arguments` object?"]
      },
      {
        question: "When should you avoid arrow functions?",
        answerMD: "Avoid arrows for object methods that rely on `this`, constructor functions, generator functions, and wrappers that intentionally forward dynamic `this`. Use normal functions in those cases."
      }
    ],
    quiz: [
      {
        question: "Which statement about arrow functions is true?",
        options: ["They always bind `this` to the object before the dot", "They have lexical `this` and cannot be used as constructors", "They are hoisted like function declarations", "They have their own `arguments` object"],
        correctIndex: 1,
        explanationMD: "Arrows capture `this` from the surrounding scope, cannot be called with `new`, and do not have their own `arguments`. They are function expressions, not declarations."
      }
    ],
    summary: [
      "Arrow functions are concise function expressions introduced in ES6.",
      "Expression bodies implicitly return; block bodies require `return`.",
      "Arrows have lexical `this` and do not bind their own `arguments`.",
      "Use arrows for callbacks and inherited `this`; avoid them for dynamic methods and constructors."
    ],
    cheatSheetMD: "**Forms:** `x => x * 2`, `(a, b) => a + b`, `() => ({ ok: true })`.\n\n**Lexical this:** chosen where the arrow is created; `.call` and `.bind` cannot replace it.\n\n**No own:** `this`, `arguments`, `super`, `new.target`.\n\n**Cannot:** be constructors or generators.\n\n**Use for:** small callbacks, transformations, nested functions that should inherit `this`."
  },

  // 36 ---------------------------------------------------------------------
  {
    slug: "js-anonymous-functions",
    moduleId: "functions",
    order: 36,
    title: "Anonymous Functions",
    difficulty: "Beginner",
    estimatedReadingMin: 8,
    estimatedPracticeMin: 8,
    tags: ["Anonymous Functions", "Callbacks", "Debugging", "Readability"],
    introMD: "An **anonymous function** is a function expression without its own explicit name. Anonymous functions are common as inline callbacks: `items.map(function (item) { ... })` or `items.map(item => ...)`.\n\nThey are convenient, but they are not always free. Naming a function can improve stack traces, recursion, profiling, and readability when the body grows beyond a small callback.",
    whyItMattersMD: "Interviewers use anonymous functions to discuss callbacks, first-class functions, and debugging maturity. A strong answer is balanced: anonymous callbacks are fine for tiny local behavior, but important behavior deserves a name.",
    theoryMD: "### What anonymous means\n\nA function can be unnamed syntactically and still be assigned to a variable. Engines may infer a display name from the variable or property, but the function expression itself has no explicit internal name.\n\n| Example | Anonymous? | Notes |\n| --- | --- | --- |\n| `const f = function () {}` | Yes syntactically | Engine often infers the name `f`. |\n| `[function () {}]` | Yes | Usually has an empty `.name`. |\n| `const f = function inner() {}` | No | `inner` is usable inside the body. |\n| `items.map(x => x.id)` | Yes | Arrow callback has no explicit name. |\n\nAnonymous functions shine when behavior is short, local, and not reused: array transforms, one-off timer callbacks, and small predicate functions. Give the function a name when it is recursive, reused, complex enough to deserve a concept, or likely to appear in a stack trace. Names also make profiling flame charts and error reports easier to read.\n\nA practical rule: if the function body is a simple expression, anonymous is often clear. If you need multiple branches, error handling, or comments to explain it, extract and name it.",
    diagrams: [
      {
        title: "Inline callback flow",
        ascii: `array method receives function value
        |
        v
for each item -> call anonymous callback -> collect result
        |
        v
callback is local to this one operation`,
        caption: "Anonymous callbacks are best when the behavior belongs only to the immediate call site."
      }
    ],
    codeExamples: [
      {
        title: "Small anonymous callback",
        descriptionMD: "This callback is short and local, so keeping it inline is readable.",
        language: "javascript",
        code: `const names = ['Ada', 'Grace', 'Lin'];
const initials = names.map(function (name) {
  return name[0];
});

console.log(initials.join(','));`
      },
      {
        title: "Name complex behavior",
        descriptionMD: "Once a callback contains real business logic, a name communicates intent and improves stack traces.",
        language: "javascript",
        code: `function isEligibleForInterview(user) {
  return user.score >= 80 && user.available === true;
}

const users = [
  { name: 'Ada', score: 91, available: true },
  { name: 'Lin', score: 77, available: true }
];

console.log(users.filter(isEligibleForInterview).length);`
      }
    ],
    playground: [
      {
        title: "Pass an anonymous callback",
        descriptionMD: "The `repeat` function receives a function value and calls it for each index.",
        code: `function repeat(times, action) {
  for (let i = 0; i < times; i++) {
    action(i);
  }
}

repeat(3, function (index) {
  console.log('square ' + (index * index));
});`
      }
    ],
    outputPredictions: [
      {
        code: `const functions = [
  function () {
    return 'first';
  },
  function namedSecond() {
    return 'second';
  }
];

console.log(functions[0].name || 'anonymous');
console.log(functions[1].name);
console.log(functions.map(function (fn) {
  return fn();
}).join(','));`,
        answer: "anonymous\nnamedSecond\nfirst,second",
        explanationMD: "The first function expression has no explicit or inferred name in the array literal, so the fallback prints `anonymous`. The second has the explicit name `namedSecond`. Both are still ordinary callable values."
      }
    ],
    codingExercises: [
      {
        title: "Implement repeat with a callback",
        difficulty: "Easy",
        promptMD: "Implement `repeat(times, action)` so it calls the supplied function once for each index from `0` to `times - 1`. Then call it with an anonymous function that logs the cube of each index.",
        hints: ["Use a `for` loop from `0` while `i < times`.", "Call `action(i)` inside the loop.", "The anonymous callback can compute `i * i * i`."],
        solutionCode: `function repeat(times, action) {
  for (let i = 0; i < times; i++) {
    action(i);
  }
}

repeat(4, function (index) {
  console.log(index * index * index);
});`,
        complexity: { time: "O(n)", space: "O(1)" },
        explanationMD: "`repeat` is a tiny higher-order utility: it accepts a callback and decides when to call it. The callback is anonymous because its behavior is short and only needed at this call site."
      }
    ],
    interviewQuestions: [
      {
        question: "What are the tradeoffs of anonymous functions?",
        answerMD: "They keep short, local callbacks concise, but overusing them can hurt debugging and readability. Named functions give clearer stack traces, better profiling labels, easier recursion, and a reusable concept. A good rule is anonymous for tiny local behavior, named for anything complex or reused.",
        companies: ["Amazon", "Microsoft", "Meta"],
        followUps: ["How can engines infer names for anonymous function expressions?", "Why might a named callback be easier to remove or test?"]
      },
      {
        question: "Is an arrow function anonymous?",
        answerMD: "An arrow function has no explicit function name in its syntax, so it is anonymous syntactically. However, engines may infer a display name from the variable or property it is assigned to."
      }
    ],
    quiz: [
      {
        question: "When is an anonymous function usually the best choice?",
        options: ["For a large recursive algorithm", "For a short one-off callback whose meaning is obvious at the call site", "For public API functions that appear in stack traces", "For functions that must be called before they are defined"],
        correctIndex: 1,
        explanationMD: "Anonymous functions are most readable when the behavior is small, local, and not reused. Larger or recursive behavior should be named."
      }
    ],
    summary: [
      "Anonymous functions are function expressions without explicit names.",
      "They are common as inline callbacks for arrays, timers, and local behavior.",
      "Names improve recursion, stack traces, profiling, testing, and readability.",
      "Prefer anonymous callbacks only when the body is short and obvious."
    ],
    cheatSheetMD: "**Anonymous:** `function () { ... }` or `x => x * 2`.\n\n**Good for:** tiny inline callbacks, local predicates, one-off transformations.\n\n**Prefer named when:** recursive, reused, complex, public, or important in stack traces.\n\n**Name inference:** engines may display a variable/property name, but an explicit function name is clearer."
  },

  // 37 ---------------------------------------------------------------------
  {
    slug: "js-iife",
    moduleId: "functions",
    order: 37,
    title: "IIFE (Immediately Invoked Function Expressions)",
    difficulty: "Intermediate",
    estimatedReadingMin: 9,
    estimatedPracticeMin: 9,
    tags: ["IIFE", "Scope", "Closures", "Modules"],
    introMD: "An **IIFE** is a function expression that is invoked immediately after it is created: `(function () { ... })()`.\n\nBefore ES modules and block-scoped `let`/`const`, IIFEs were the standard way to create private scope, avoid accidental globals, and capture loop values. They still appear in legacy code, build output, bookmarklets, and occasional scripts that need a one-time private setup.",
    whyItMattersMD: "IIFEs connect several core ideas at once: expressions, function scope, closures, private state, and historical JavaScript module patterns. Interviewers also use them to fix the classic `var` loop callback bug.",
    theoryMD: "### Why the parentheses?\n\n`function () {}` by itself is parsed as a declaration in many positions, and declarations require names. Wrapping it in parentheses forces JavaScript to treat it as an expression, which can then be invoked immediately. Common forms are `(function () { ... })()`, `(function () { ... }())`, and `(() => { ... })()`.\n\nA function call creates a new scope. Variables declared inside the IIFE are not visible outside. This prevents temporary setup names from leaking into the surrounding scope. An IIFE can also return functions or objects that close over private variables. The outside world can use the returned API but cannot directly access the hidden state.\n\nES modules, `let`, `const`, and block scope replaced many IIFE use cases. Still, understanding IIFEs helps you read older code and explain how closures can create privacy without classes or private fields.",
    diagrams: [
      {
        title: "IIFE scope boundary",
        ascii: `outer scope
  appName
  counterApi -> returned object

IIFE scope
  private count
  helper functions

outside can call counterApi.next()
outside cannot read count directly`,
        caption: "The IIFE runs once, then its local variables survive only if returned functions close over them."
      }
    ],
    codeExamples: [
      {
        title: "Isolate setup variables",
        descriptionMD: "The temporary variables disappear after the IIFE finishes, keeping the outer scope clean.",
        language: "javascript",
        code: `(function () {
  const rawName = '  Ada Lovelace  ';
  const normalized = rawName.trim().toLowerCase();
  console.log(normalized);
})();`
      },
      {
        title: "Create private state",
        descriptionMD: "Only the returned methods can access `count`. This is the classic closure-based module pattern.",
        language: "javascript",
        code: `const counter = (function () {
  let count = 0;

  return {
    next: function () {
      count += 1;
      return count;
    },
    current: function () {
      return count;
    }
  };
})();

console.log(counter.next());
console.log(counter.current());`
      }
    ],
    playground: [
      {
        title: "Scope isolation in action",
        descriptionMD: "The variable inside the IIFE does not leak into the outside scope.",
        code: `(function () {
  var message = 'inside iife';
  console.log(message);
})();

try {
  console.log(message);
} catch (error) {
  console.log(error.name);
}`
      }
    ],
    outputPredictions: [
      {
        code: `var value = 'global';

(function () {
  var value = 'iife';
  console.log(value);
})();

console.log(value);`,
        answer: "iife\nglobal",
        explanationMD: "The `var value` inside the IIFE belongs to the IIFE's function scope. It shadows the outer `value` only while the IIFE runs. The outer variable remains `global`."
      },
      {
        code: `for (var i = 0; i < 3; i++) {
  (function (copy) {
    setTimeout(function () {
      console.log(copy);
    }, 0);
  })(i);
}`,
        answer: "0\n1\n2",
        explanationMD: "Each IIFE call receives the current `i` as `copy`, creating a fresh function scope. The timer callbacks close over different `copy` parameters instead of the one shared `var i`."
      }
    ],
    codingExercises: [
      {
        title: "Build a private ID generator",
        difficulty: "Medium",
        promptMD: "Use an IIFE to create `nextOrderId`. The returned function should keep a private counter starting at `1` and return IDs like `ORD-1`, `ORD-2`, and `ORD-3`. The counter must not be directly accessible from outside.",
        hints: ["The IIFE should run once and return a function.", "Declare the counter inside the IIFE so only the returned function can close over it.", "Increment the counter after building each ID."],
        solutionCode: `const nextOrderId = (function () {
  let next = 1;

  return function () {
    const id = 'ORD-' + next;
    next += 1;
    return id;
  };
})();

console.log(nextOrderId());
console.log(nextOrderId());
console.log(nextOrderId());`,
        complexity: { time: "O(1) per ID", space: "O(1)" },
        explanationMD: "The IIFE creates one private `next` binding and returns a function that closes over it. Outside code can call `nextOrderId`, but it cannot directly read or reset `next`."
      }
    ],
    interviewQuestions: [
      {
        question: "What problem did IIFEs solve before ES modules and `let`?",
        answerMD: "They created a private function scope immediately, preventing temporary variables from leaking into the global scope. They also enabled closure-based module patterns and captured loop values for `var` callbacks. Modern modules and block scope reduce the need, but IIFEs remain important for reading legacy JavaScript.",
        companies: ["Microsoft", "Amazon", "Google"],
        followUps: ["Why are parentheses needed around the function?", "How does an IIFE fix the `var` loop closure bug?"]
      },
      {
        question: "How can an IIFE create private state?",
        answerMD: "The IIFE runs once, creates local variables, and returns functions that close over those variables. The returned functions can read or update the hidden state later, but outside code has no direct reference to the local bindings."
      }
    ],
    quiz: [
      {
        question: "What is the primary purpose of an IIFE?",
        options: ["To make JavaScript multi-threaded", "To create and immediately execute a function scope", "To hoist a `const` variable", "To fetch modules from the network"],
        correctIndex: 1,
        explanationMD: "An IIFE is a function expression invoked immediately. Its call creates a scope that can isolate variables and create closures."
      }
    ],
    summary: [
      "An IIFE is a function expression called immediately after creation.",
      "Parentheses force the function into expression position so it can be invoked.",
      "IIFEs isolate temporary variables and can create closure-based private state.",
      "Modern modules and block scope reduce IIFE usage, but legacy and interview code still rely on them."
    ],
    cheatSheetMD: "**Forms:** `(function () { ... })()` and `(() => { ... })()`.\n\n**Why:** create a scope immediately, avoid globals, hide setup variables, capture `var` loop values.\n\n**Private state:** return functions that close over IIFE locals.\n\n**Modern replacement:** ES modules, `let`, `const`, block scope, private class fields."
  },

  // 38 ---------------------------------------------------------------------
  {
    slug: "js-callbacks",
    moduleId: "functions",
    order: 38,
    title: "Callbacks",
    difficulty: "Intermediate",
    estimatedReadingMin: 10,
    estimatedPracticeMin: 11,
    tags: ["Callbacks", "Async", "Inversion of Control", "Event Loop"],
    introMD: "A **callback** is a function you pass to another function so it can be called later or at a specific moment. Callbacks power array methods, event handlers, timers, and the pre-Promise async style of JavaScript.\n\nThe key mental shift is inversion of control: you hand behavior to another function, and that function decides when and how often to call it.",
    whyItMattersMD: "Callbacks are the bridge from simple functions to asynchronous JavaScript. If you can reason about sync callbacks, async callbacks, error-first conventions, and callback hell, promises and async/await become much easier to learn.",
    theoryMD: "### Synchronous callbacks\n\nArray methods such as `map`, `filter`, `some`, and `reduce` call your callback immediately during the current call stack. The outer method controls iteration; your callback supplies behavior.\n\n### Asynchronous callbacks\n\nTimers, I/O, and user events call your callback later, after the current synchronous code finishes. This is why `setTimeout(callback, 0)` still runs after the current stack and pending microtasks.\n\n### Inversion of control\n\nPassing a callback means you give another function control over execution timing. That is powerful, but it also means you must understand whether the callback is called once, many times, synchronously, asynchronously, with errors, or with a particular `this`.\n\n### Error-first callbacks\n\nNode popularized the convention `callback(error, result)`: if `error` is non-null, handle it; otherwise use `result`. Even if you use promises today, recognizing this pattern helps when reading older APIs. Deeply nested callbacks make error handling and sequencing hard; fixes include named functions, small helpers, promises, async/await, or breaking work into composable steps.",
    diagrams: [
      {
        title: "Callback handoff",
        ascii: `caller creates callback
        |
        v
passes callback to scheduler or iterator
        |
        v
other function decides when to call it
        |
        v
callback runs with provided arguments`,
        caption: "A callback packages behavior and hands control of timing to another function."
      }
    ],
    codeExamples: [
      {
        title: "Synchronous predicate callback",
        descriptionMD: "`filter` controls the loop; the callback controls which values are kept.",
        language: "javascript",
        code: `const scores = [92, 61, 88, 40];
const passing = scores.filter(function (score) {
  return score >= 70;
});

console.log(passing.join(','));`
      },
      {
        title: "Error-first callback shape",
        descriptionMD: "This style is common in older Node APIs and many interview discussions, even though modern code often wraps it in promises.",
        language: "javascript",
        code: `function parseJson(text, callback) {
  try {
    callback(null, JSON.parse(text));
  } catch (error) {
    callback(error, null);
  }
}

parseJson('{"ok":true}', function (error, value) {
  if (error) {
    console.log('invalid json');
    return;
  }

  console.log(value.ok);
});`
      }
    ],
    playground: [
      {
        title: "Async callback ordering",
        descriptionMD: "The callback is scheduled first but runs after synchronous code completes.",
        code: `function doLater(callback) {
  setTimeout(function () {
    callback('done');
  }, 0);
}

console.log('before');
doLater(function (result) {
  console.log(result);
});
console.log('after');`
      }
    ],
    outputPredictions: [
      {
        code: `function doLater(callback) {
  setTimeout(function () {
    callback('done');
  }, 0);
}

console.log('before');
doLater(function (result) {
  console.log(result);
});
console.log('after');`,
        answer: "before\nafter\ndone",
        explanationMD: "`doLater` schedules a timer and returns immediately. The synchronous logs run first: `before`, then `after`. The callback logs `done` in a later macrotask."
      }
    ],
    codingExercises: [
      {
        title: "Run callback tasks sequentially",
        difficulty: "Hard",
        promptMD: "Implement `runTasks(tasks, done)`. Each task is a function that accepts a callback and eventually calls it with one result. Run tasks in order, collect their results, and call `done(results)` after the last task finishes. Do not start task `i + 1` until task `i` has called its callback.",
        hints: ["Keep an index and a results array in closure state.", "Define a `next` function that starts the current task.", "When a task callback fires, push the result and call `next` again."],
        solutionCode: `function runTasks(tasks, done) {
  const results = [];
  let index = 0;

  function next() {
    if (index === tasks.length) {
      done(results);
      return;
    }

    const task = tasks[index];
    index += 1;

    task(function (result) {
      results.push(result);
      next();
    });
  }

  next();
}

const tasks = [
  function (callback) {
    setTimeout(function () {
      callback('A');
    }, 0);
  },
  function (callback) {
    callback('B');
  },
  function (callback) {
    setTimeout(function () {
      callback('C');
    }, 0);
  }
];

runTasks(tasks, function (results) {
  console.log(results.join(','));
});`,
        complexity: { time: "O(n)", space: "O(n)" },
        explanationMD: "The `next` function is the coordinator. It starts one task, waits for that task's callback, stores the result, and then starts the next task. This is the callback-based shape behind many older async control-flow libraries."
      }
    ],
    interviewQuestions: [
      {
        question: "What is inversion of control in callbacks?",
        answerMD: "You pass a function to another API and let that API decide when, how often, and with what arguments it will call your function. This is useful for async work and iteration, but it means you must trust the caller's contract. Promises reduce some inversion-of-control problems by representing the eventual result as a value.",
        companies: ["Google", "Amazon", "Netflix", "Microsoft"],
        followUps: ["How do promises improve on callback nesting?", "What is the error-first callback convention?"]
      },
      {
        question: "Are all callbacks asynchronous?",
        answerMD: "No. `Array.map` and `Array.filter` callbacks are synchronous; they run immediately during the array method call. Timer, I/O, and event callbacks are asynchronous because the host schedules them for later. Always identify which kind you are dealing with before predicting output."
      }
    ],
    quiz: [
      {
        question: "Which callback is asynchronous?",
        options: ["The callback passed to `Array.prototype.map`", "The callback passed to `Array.prototype.filter`", "The callback passed to `setTimeout`", "The reducer callback passed to `reduce`"],
        correctIndex: 2,
        explanationMD: "Array callbacks run synchronously during the method call. `setTimeout` schedules the callback as a later macrotask."
      }
    ],
    summary: [
      "A callback is a function passed to another function to be called later or during an operation.",
      "Callbacks can be synchronous, such as array callbacks, or asynchronous, such as timers.",
      "Callbacks involve inversion of control: another function controls invocation timing.",
      "Error-first callbacks and callback hell are key historical patterns leading toward promises."
    ],
    cheatSheetMD: "**Callback:** function passed as behavior.\n\n**Sync examples:** `map`, `filter`, `reduce`, custom iteration.\n\n**Async examples:** `setTimeout`, events, I/O.\n\n**Error-first:** `callback(error, result)`.\n\n**Pitfalls:** nested callback hell, unclear timing, repeated calls, lost errors.\n\n**Fixes:** named helpers, promises, async/await, small composable functions."
  },

  // 39 ---------------------------------------------------------------------
  {
    slug: "js-higher-order-functions",
    moduleId: "functions",
    order: 39,
    title: "Higher-Order Functions",
    difficulty: "Intermediate",
    estimatedReadingMin: 10,
    estimatedPracticeMin: 14,
    tags: ["Higher-Order Functions", "map", "filter", "reduce", "Abstraction"],
    introMD: "A **higher-order function** is a function that accepts another function, returns another function, or both. JavaScript makes this natural because functions are first-class values.\n\nArray methods like `map`, `filter`, and `reduce` are the most familiar examples, but higher-order functions also power middleware, validators, decorators, memoization, composition, and functional pipelines.",
    whyItMattersMD: "Higher-order functions are a favorite interview topic because they reveal whether you can abstract behavior, not just write loops. Implementing `map`, `filter`, and `reduce` by hand is also a classic way to prove you understand callbacks, indexes, accumulators, and immutability.",
    theoryMD: "### Definition\n\nA function is higher-order if it takes a function as an argument, returns a function as its result, or both. `filter(items, predicate)` is higher-order because it receives `predicate`. `makeMultiplier(factor)` is higher-order because it returns a new function.\n\nHOFs separate **control flow** from **custom behavior**. A loop decides how to traverse data; a callback decides what to do with each item. This reduces duplication and lets you compose small behaviors.\n\n| Method | Callback role | Result |\n| --- | --- | --- |\n| `map` | transform each item | New array of same length. |\n| `filter` | keep or drop each item | New array of selected items. |\n| `reduce` | combine item into accumulator | Any final value. |\n| `some` | test if any item passes | Boolean. |\n| `every` | test if all items pass | Boolean. |\n\nFactories like `makeThresholdFilter(80)` return specialized functions. Decorators like `once(fn)` return wrapped versions of existing functions. In both cases, closures preserve configuration. Do not hide simple logic behind overly clever chains; HOFs should make intent clearer.",
    diagrams: [
      {
        title: "Control flow plus behavior",
        ascii: `higher-order function
  owns traversal, timing, or wrapping
        |
        +-- calls callback with item, index, collection
        |
        v
returns transformed data, decision, accumulator, or new function`,
        caption: "The HOF owns the skeleton; the callback supplies the changing behavior."
      }
    ],
    codeExamples: [
      {
        title: "A returned predicate function",
        descriptionMD: "The outer function captures `minimum`; the returned predicate uses it later inside `filter`.",
        language: "javascript",
        code: `function makeMinimumScoreFilter(minimum) {
  return function (candidate) {
    return candidate.score >= minimum;
  };
}

const candidates = [
  { name: 'Ada', score: 92 },
  { name: 'Lin', score: 71 }
];

const strongCandidates = candidates.filter(makeMinimumScoreFilter(80));
console.log(strongCandidates[0].name);`
      },
      {
        title: "Transform, filter, then reduce",
        descriptionMD: "Each HOF has one job. The chain reads as a data pipeline.",
        language: "javascript",
        code: `const orders = [
  { total: 120, paid: true },
  { total: 40, paid: false },
  { total: 80, paid: true }
];

const paidTotal = orders
  .filter(function (order) {
    return order.paid;
  })
  .map(function (order) {
    return order.total;
  })
  .reduce(function (sum, total) {
    return sum + total;
  }, 0);

console.log(paidTotal);`
      }
    ],
    playground: [
      {
        title: "Build a small data pipeline",
        descriptionMD: "Change the numbers and observe how each step transforms the data.",
        code: `const numbers = [1, 2, 3, 4, 5];

const result = numbers
  .filter(function (n) {
    return n % 2 === 1;
  })
  .map(function (n) {
    return n * n;
  })
  .reduce(function (sum, n) {
    return sum + n;
  }, 0);

console.log(result);`
      }
    ],
    outputPredictions: [
      {
        code: `const numbers = [1, 2, 3, 4];

const result = numbers
  .filter(function (n) {
    console.log('filter ' + n);
    return n % 2 === 0;
  })
  .map(function (n) {
    console.log('map ' + n);
    return n * 10;
  });

console.log(result.join(','));`,
        answer: "filter 1\nfilter 2\nfilter 3\nfilter 4\nmap 2\nmap 4\n20,40",
        explanationMD: "The whole `filter` call runs first and logs every input. It returns `[2, 4]`. Then `map` runs only for those kept values, logging `map 2` and `map 4`, and returns `[20, 40]`."
      }
    ],
    codingExercises: [
      {
        title: "Implement map, filter, and reduce",
        difficulty: "Hard",
        promptMD: "Implement `myMap`, `myFilter`, and `myReduce` for arrays. Each callback should receive `(value, index, array)`. `myReduce` should require an explicit initial value. Do not mutate the input array.",
        hints: ["`myMap` creates a result array with one transformed value per input item.", "`myFilter` pushes the original value only when the predicate returns truthy.", "`myReduce` updates an accumulator on each iteration and returns the final accumulator."],
        solutionCode: `function myMap(items, transform) {
  const result = [];

  for (let i = 0; i < items.length; i++) {
    result.push(transform(items[i], i, items));
  }

  return result;
}

function myFilter(items, predicate) {
  const result = [];

  for (let i = 0; i < items.length; i++) {
    if (predicate(items[i], i, items)) {
      result.push(items[i]);
    }
  }

  return result;
}

function myReduce(items, reducer, initialValue) {
  let accumulator = initialValue;

  for (let i = 0; i < items.length; i++) {
    accumulator = reducer(accumulator, items[i], i, items);
  }

  return accumulator;
}

const values = [1, 2, 3, 4];
const doubled = myMap(values, function (value) {
  return value * 2;
});
const evens = myFilter(doubled, function (value) {
  return value % 4 === 0;
});
const total = myReduce(evens, function (sum, value) {
  return sum + value;
}, 0);

console.log(doubled.join(','));
console.log(evens.join(','));
console.log(total);`,
        complexity: { time: "O(n) per helper call", space: "O(n) for map/filter and O(1) extra for reduce" },
        explanationMD: "Each helper owns traversal and delegates item-specific behavior to a callback. The input array is never mutated. This is the core pattern behind many JavaScript abstractions."
      }
    ],
    interviewQuestions: [
      {
        question: "What is a higher-order function? Give examples.",
        answerMD: "A higher-order function accepts a function, returns a function, or both. `map`, `filter`, and `reduce` accept callbacks. `makeMultiplier(2)` returns a new function. Decorators like `once(fn)` accept a function and return a wrapped function. This works because JavaScript functions are first-class values.",
        companies: ["Google", "Meta", "Amazon", "Microsoft"],
        followUps: ["How would you implement `map` from scratch?", "What is the difference between `map` and `forEach`?"]
      },
      {
        question: "Why are higher-order functions useful?",
        answerMD: "They separate reusable control flow from variable behavior. Instead of rewriting loops, validation, or wrapping logic, you pass or return functions that specialize the generic operation. This reduces duplication and improves composability when used clearly."
      }
    ],
    quiz: [
      {
        question: "Which function is higher-order?",
        options: ["`function add(a, b) { return a + b; }`", "`function twice(fn, value) { return fn(fn(value)); }`", "`function today() { return 'Monday'; }`", "`function square(n) { return n * n; }`"],
        correctIndex: 1,
        explanationMD: "`twice` accepts another function as `fn`, so it is higher-order. The other options only consume and return non-function values."
      }
    ],
    summary: [
      "A higher-order function accepts a function, returns a function, or both.",
      "HOFs separate reusable control flow from custom behavior.",
      "`map`, `filter`, and `reduce` are core array higher-order functions.",
      "Returned-function HOFs use closures to preserve configuration and private state."
    ],
    cheatSheetMD: "**Definition:** takes a function, returns a function, or both.\n\n**Array HOFs:** `map` transforms, `filter` selects, `reduce` accumulates, `some` checks any, `every` checks all.\n\n**Returned functions:** factories, decorators, middleware, validators.\n\n**Interview drill:** implement `map`, `filter`, `reduce` with `(value, index, array)` callbacks.\n\n**Rule:** use HOFs to clarify intent, not to show off cleverness."
  },

  // 40 ---------------------------------------------------------------------
  {
    slug: "js-first-class-functions",
    moduleId: "functions",
    order: 40,
    title: "First-Class Functions",
    difficulty: "Intermediate",
    estimatedReadingMin: 9,
    estimatedPracticeMin: 12,
    tags: ["First-Class Functions", "Closures", "Composition", "Function Values"],
    introMD: "JavaScript has **first-class functions**, which means functions are values. You can store them in variables, put them in arrays or objects, pass them to other functions, and return them from functions.\n\nHigher-order functions are a pattern; first-class functions are the language capability that makes the pattern possible.",
    whyItMattersMD: "First-class functions are the reason JavaScript can express callbacks, closures, dependency injection, strategies, middleware, and composition so naturally. Interviewers expect you to distinguish the language feature from higher-order function usage.",
    theoryMD: "### What first-class means\n\nA value is first-class if the language treats it like any other value. In JavaScript, functions can be assigned to variables, stored in arrays, stored in object properties, passed as arguments, returned from other functions, and compared by reference identity.\n\nEvery function expression creates a function object. Two functions with identical source are still different objects. Assigning a function to another variable copies the reference to the same function object.\n\nWhen a function returns another function, the inner function can keep using variables from the outer call even after the outer call has finished. This is how factories like `makeAdder(10)` work. Storing functions in an object also lets you choose behavior by key instead of writing long conditional chains; this is common in validators, formatters, reducers, and command handlers.\n\nBecause functions are values, you can build new functions by combining smaller ones. Helpers like `pipe` and `compose` are interview staples because they test first-class functions, higher-order functions, closures, rest parameters, and reduction all at once.",
    diagrams: [
      {
        title: "Functions move like values",
        ascii: `function object
   |\
   | \ assigned to variable
   |  \ stored in object or array
   |   \ passed as argument
   |    \ returned from another function
   v
same callable value can travel through the program`,
        caption: "First-class functions let behavior be stored, selected, passed, and returned."
      }
    ],
    codeExamples: [
      {
        title: "Store strategies in an object",
        descriptionMD: "Selecting a function by key is often cleaner than a long conditional chain.",
        language: "javascript",
        code: `const formatters = {
  upper: function (value) {
    return value.toUpperCase();
  },
  lower: function (value) {
    return value.toLowerCase();
  },
  title: function (value) {
    return value[0].toUpperCase() + value.slice(1).toLowerCase();
  }
};

const selected = formatters.title;
console.log(selected('aDA'));`
      },
      {
        title: "Return a specialized function",
        descriptionMD: "The returned function closes over `factor`, even after `makeMultiplier` has returned.",
        language: "javascript",
        code: `function makeMultiplier(factor) {
  return function (value) {
    return value * factor;
  };
}

const double = makeMultiplier(2);
const triple = makeMultiplier(3);

console.log(double(5));
console.log(triple(5));`
      }
    ],
    playground: [
      {
        title: "Functions in variables, arrays, and returns",
        descriptionMD: "The same function values can be stored and invoked from different places.",
        code: `function makeAdder(base) {
  return function (value) {
    return base + value;
  };
}

const add10 = makeAdder(10);
const add20 = makeAdder(20);
const operations = [add10, add20];

console.log(add10(1));
console.log(operations[1](1));
console.log(operations[0] === add10);`
      }
    ],
    outputPredictions: [
      {
        code: `function makeAdder(base) {
  return function (value) {
    return base + value;
  };
}

const add10 = makeAdder(10);
const add20 = makeAdder(20);
const list = [add10, add20];

console.log(add10(1));
console.log(add20(1));
console.log(list[0](5) + list[1](5));`,
        answer: "11\n21\n40",
        explanationMD: "Each call to `makeAdder` creates a new closure with its own `base`. `add10(1)` is `11`, `add20(1)` is `21`, and the array stores those same function values, so `15 + 25` is `40`."
      }
    ],
    codingExercises: [
      {
        title: "Implement pipe and compose",
        difficulty: "Hard",
        promptMD: "Implement `pipe(...fns)` and `compose(...fns)`. `pipe(a, b, c)(value)` should run left to right: `c(b(a(value)))`. `compose(a, b, c)(value)` should run right to left: `a(b(c(value)))`. Assume each function accepts one value and returns one value.",
        hints: ["Both helpers return a new function that closes over `fns`.", "Use `reduce` for left-to-right evaluation.", "Use `reduceRight` for right-to-left evaluation."],
        solutionCode: `function pipe(...fns) {
  return function (initialValue) {
    return fns.reduce(function (value, fn) {
      return fn(value);
    }, initialValue);
  };
}

function compose(...fns) {
  return function (initialValue) {
    return fns.reduceRight(function (value, fn) {
      return fn(value);
    }, initialValue);
  };
}

function trim(value) {
  return value.trim();
}

function upper(value) {
  return value.toUpperCase();
}

function exclaim(value) {
  return value + '!';
}

const cleanThenShout = pipe(trim, upper, exclaim);
const shoutComposed = compose(exclaim, upper, trim);

console.log(cleanThenShout('  hello  '));
console.log(shoutComposed('  hello  '));`,
        complexity: { time: "O(k) per invocation where k is the number of functions", space: "O(1) extra besides the stored function list" },
        explanationMD: "Both helpers are higher-order functions enabled by first-class functions. They accept function values, return a new function value, and use reduction to pass the intermediate result from one function to the next."
      }
    ],
    interviewQuestions: [
      {
        question: "What does it mean that functions are first-class in JavaScript?",
        answerMD: "It means functions are values. They can be assigned to variables, stored in arrays or objects, passed as arguments, returned from other functions, and compared by reference. This capability enables callbacks, higher-order functions, closures, composition, and strategy patterns.",
        companies: ["Google", "Meta", "Amazon", "Microsoft"],
        followUps: ["How is first-class function support different from a higher-order function?", "Why does returning a function often create a closure?"]
      },
      {
        question: "What is the difference between first-class functions and higher-order functions?",
        answerMD: "First-class functions are a language feature: functions can be treated as values. A higher-order function is a function that uses that feature by accepting or returning a function. JavaScript supports first-class functions, so we can write higher-order functions."
      }
    ],
    quiz: [
      {
        question: "Which example demonstrates first-class functions most directly?",
        options: ["A function adding two numbers", "A function stored in an array and called later", "A `for` loop counting from 1 to 10", "A string converted to uppercase"],
        correctIndex: 1,
        explanationMD: "Storing a function in an array treats it as a value, which is exactly what first-class function support means."
      }
    ],
    summary: [
      "First-class functions means functions are values in JavaScript.",
      "Functions can be assigned, stored, passed, returned, and compared by reference.",
      "Returning functions commonly creates closures over outer variables.",
      "Composition helpers like `pipe` and `compose` rely on first-class functions."
    ],
    cheatSheetMD: "**First-class:** functions are values.\n\n**Can be:** assigned, stored, passed, returned, compared by reference.\n\n**Enables:** callbacks, HOFs, closures, strategies, middleware, composition.\n\n**HOF vs first-class:** first-class is the capability; HOF is a function that accepts or returns functions.\n\n**Composition:** `pipe(f, g)(x)` = `g(f(x))`; `compose(f, g)(x)` = `f(g(x))`."
  },

  // 41 ---------------------------------------------------------------------
  {
    slug: "js-pure-functions",
    moduleId: "functions",
    order: 41,
    title: "Pure Functions",
    difficulty: "Intermediate",
    estimatedReadingMin: 10,
    estimatedPracticeMin: 12,
    tags: ["Pure Functions", "Immutability", "Testing", "Functional Programming"],
    introMD: "A **pure function** always returns the same output for the same input and has no side effects. It does not mutate inputs, write to external state, read changing external state, perform I/O, or depend on time or randomness.\n\nPurity is not a moral rule; it is an engineering tool. Pure functions are easier to test, cache, refactor, parallelize, and reason about.",
    whyItMattersMD: "Pure functions appear in interviews through reducers, React state updates, memoization, testability, and referential transparency. They also reveal whether you can separate business logic from side effects like logging, network calls, and mutation.",
    theoryMD: "### The two rules\n\nA function is pure if it is deterministic and side-effect free. Deterministic means the same inputs always produce the same output. Side-effect free means it does not change anything outside itself and does not depend on changing outside state.\n\nSide effects include mutating an input object or array, mutating module/global state, logging, network calls, DOM updates, timers, file I/O, and directly reading changing values such as `Date.now()` or `Math.random()`.\n\nReferential transparency means a function call can be replaced by its returned value without changing program behavior. `add(2, 3)` can be replaced by `5`. `Date.now()` cannot, because it changes over time.\n\nReal applications need side effects. The practical architecture is to keep calculations pure and push side effects to the edges: parse input, call pure logic, then perform output. Pure functions often return new objects or arrays instead of mutating existing ones, which is why reducers in UI state management return next state without modifying previous state.",
    diagrams: [
      {
        title: "Pure core, impure shell",
        ascii: `impure input
  read event, API, time
        |
        v
pure core
  data in -> deterministic calculation -> data out
        |
        v
impure output
  render, log, save, send`,
        caption: "Keep side effects at the edges and the decision-making core pure."
      }
    ],
    codeExamples: [
      {
        title: "Impure mutation vs pure update",
        descriptionMD: "The pure version returns a new array and leaves the original untouched.",
        language: "javascript",
        code: `function addItemImpure(cart, item) {
  cart.push(item);
  return cart;
}

function addItemPure(cart, item) {
  return cart.concat([item]);
}

const original = ['book'];
const next = addItemPure(original, 'pen');

console.log(original.join(','));
console.log(next.join(','));`
      },
      {
        title: "Inject changing values instead of reading them",
        descriptionMD: "Passing the timestamp in makes the formatter deterministic and testable.",
        language: "javascript",
        code: `function formatAuditMessage(userId, timestamp) {
  return 'user ' + userId + ' at ' + timestamp;
}

console.log(formatAuditMessage(42, 1700000000000));`
      }
    ],
    playground: [
      {
        title: "Same input, same output",
        descriptionMD: "Pure calculations can be repeated safely, and immutable updates keep old values intact.",
        code: `function applyDiscount(price, percent) {
  return price - price * percent;
}

function addItem(cart, item) {
  return cart.concat([item]);
}

const cart = ['book'];
const nextCart = addItem(cart, 'pen');

console.log(applyDiscount(100, 0.2));
console.log(applyDiscount(100, 0.2));
console.log(cart.join(','));
console.log(nextCart.join(','));`
      }
    ],
    outputPredictions: [
      {
        code: `const numbers = [1, 2];

function appendImpure(items, value) {
  items.push(value);
  return items;
}

function appendPure(items, value) {
  return items.concat([value]);
}

const a = appendImpure(numbers, 3);
const b = appendPure(numbers, 4);

console.log(numbers.join(','));
console.log(a === numbers);
console.log(b.join(','));
console.log(b === numbers);`,
        answer: "1,2,3\ntrue\n1,2,3,4\nfalse",
        explanationMD: "`appendImpure` mutates the original array and returns that same array, so `numbers` becomes `1,2,3` and `a === numbers` is true. `appendPure` creates a new array with `4`, leaving `numbers` unchanged after that call, so `b` has different identity."
      }
    ],
    codingExercises: [
      {
        title: "Update cart quantity purely",
        difficulty: "Medium",
        promptMD: "Implement `updateCartQuantity(cart, id, quantity)` as a pure function. Return a new cart array. For the matching item, return a new object with the updated quantity. Non-matching items should keep their original object references. Do not mutate the input array or item objects.",
        hints: ["Use `map` to create a new array.", "Return the original item object when the id does not match.", "For the matching item, return a shallow copy with the new `quantity`."],
        solutionCode: `function updateCartQuantity(cart, id, quantity) {
  return cart.map(function (item) {
    if (item.id !== id) {
      return item;
    }

    return {
      ...item,
      quantity: quantity
    };
  });
}

const cart = [
  { id: 'book', quantity: 1 },
  { id: 'pen', quantity: 2 }
];

const updated = updateCartQuantity(cart, 'pen', 5);

console.log(cart[1].quantity);
console.log(updated[1].quantity);
console.log(cart === updated);
console.log(cart[0] === updated[0]);
console.log(cart[1] === updated[1]);`,
        complexity: { time: "O(n)", space: "O(n)" },
        explanationMD: "The function returns a new array with `map`. It preserves object identity for unchanged items and creates a new object only for the modified item. The original cart remains untouched, making the function deterministic and easy to test."
      }
    ],
    interviewQuestions: [
      {
        question: "What makes a function pure?",
        answerMD: "It is deterministic and side-effect free. Given the same inputs, it returns the same output every time, and it does not mutate inputs or external state, perform I/O, depend on time or randomness, or change anything outside itself. Pure functions are easier to test, memoize, and reason about.",
        companies: ["Meta", "Google", "Amazon", "Microsoft"],
        followUps: ["Is `Math.random()` pure?", "How do pure reducers update nested state?"]
      },
      {
        question: "What is referential transparency?",
        answerMD: "An expression is referentially transparent if it can be replaced by its value without changing program behavior. Pure function calls have this property: `add(2, 3)` can be replaced with `5`. Calls such as `Date.now()` or functions that mutate state are not referentially transparent."
      }
    ],
    quiz: [
      {
        question: "Which function is pure?",
        options: ["`function now() { return Date.now(); }`", "`function add(a, b) { return a + b; }`", "`function push(arr, x) { arr.push(x); return arr; }`", "`function log(x) { console.log(x); return x; }`"],
        correctIndex: 1,
        explanationMD: "`add` is deterministic and has no side effects. The other functions depend on time, mutate an input, or perform logging."
      }
    ],
    summary: [
      "Pure functions are deterministic and side-effect free.",
      "They do not mutate inputs or depend on changing external state.",
      "Referential transparency means a call can be replaced by its returned value.",
      "A practical architecture keeps business logic pure and pushes side effects to the edges."
    ],
    cheatSheetMD: "**Pure:** same input -> same output, no side effects.\n\n**Avoid inside pure functions:** mutation, globals, logging, DOM, network, timers, `Date.now()`, `Math.random()`.\n\n**Benefits:** easy tests, memoization, predictable reducers, safer refactors.\n\n**Pattern:** pure core + impure shell.\n\n**Immutable update:** return new arrays/objects; preserve references for unchanged pieces when useful."
  }
];
