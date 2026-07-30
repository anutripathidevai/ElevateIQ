import type { Topic } from "../../types";

export const TOPICS: Topic[] = [
  {
    slug: "js-execution-context",
    moduleId: "execution-context-hoisting",
    order: 27,
    title: "Execution Context",
    difficulty: "Intermediate",
    estimatedReadingMin: 10,
    estimatedPracticeMin: 8,
    tags: ["Execution Context", "Scope", "Hoisting", "Runtime"],
    introMD: "An **execution context** is the environment JavaScript creates to run a piece of code. The global script gets one context, and every function call gets a fresh one. Each context tracks its variables, lexical scope, `this` value, arguments, and where execution should continue after a function returns.\n\nThis is the mental model behind almost every tricky JavaScript question: why a function can be called before it appears, why `var` reads as `undefined`, why `let` throws in the TDZ, and why recursion can crash with a stack overflow.",
    whyItMattersMD: "Interviewers ask output-prediction questions to test whether you can simulate an execution context in your head. In production, the same model helps you debug shadowed variables, accidental globals, closure bugs, stack traces, and initialization order in large modules.",
    theoryMD: "### The big idea\n\nAn execution context is JavaScript's active record for running code. It answers four questions:\n\n1. **What names exist here?** Variables, functions, parameters, classes, and imports are registered as bindings.\n2. **Where should name lookup continue?** Each context points to an outer lexical environment, forming the scope chain.\n3. **What is `this`?** The `this` binding is established for the current context.\n4. **Where does execution resume?** A function context remembers the caller so it can return correctly.\n\n### The three common context types\n\n| Context | When it is created | What makes it special |\n| --- | --- | --- |\n| Global execution context | Once, when a script starts | Holds top-level declarations and starts the program. |\n| Function execution context | Every function call | Holds parameters, local bindings, `arguments` for non-arrow functions, and the function's `this`. |\n| Module execution context | When an ES module is evaluated | Has top-level lexical scope and live imports; top-level `this` is `undefined`. |\n\n### Two phases inside every context\n\n1. **Creation / memory phase** — the engine prepares the environment: creates bindings, initializes `var` to `undefined`, stores function declarations, and leaves `let`/`const`/`class` uninitialized in the temporal dead zone.\n2. **Execution phase** — the engine runs statements line by line: assignments happen, functions are called, expressions are evaluated, and new contexts are pushed for calls.\n\n### Execution context vs lexical environment\n\nPeople often use the terms together, but they are not identical. The execution context is the whole running frame. Its lexical environment is the structure that maps identifiers to values and points to the outer environment. When a closure survives after a function returns, the stack frame is gone, but the needed lexical environment is kept alive on the heap.\n\n### Key interview mantra\n\nJavaScript does not magically move code. It **creates bindings first**, then **executes statements later**. Hoisting is the visible behavior produced by that creation phase.",
    diagrams: [
      {
        title: "A context is prepared, then executed",
        ascii: `Source enters engine
        |
        v
+--------------------------+
|  Creation / memory phase |
|  - create bindings       |
|  - initialize var        |
|  - store functions       |
|  - mark let/const TDZ    |
+-------------+------------+
              |
              v
+--------------------------+
|     Execution phase      |
|  - run line by line      |
|  - assign values         |
|  - call functions        |
|  - return to caller      |
+--------------------------+`,
        caption: "The two-phase model is the foundation for hoisting and TDZ behavior."
      },
      {
        title: "Contexts form a stack while scopes form a chain",
        ascii: `Call stack now

+-----------------------+
| function: inner       |  local bindings
+-----------------------+
| function: outer       |  local bindings
+-----------------------+
| global context        |  global bindings
+-----------------------+

Name lookup from inner: inner environment -> outer environment -> global environment`,
        caption: "The call stack controls active execution; the scope chain controls identifier lookup."
      }
    ],
    codeExamples: [
      {
        title: "A new context for every function call",
        descriptionMD: "`greet` has one function body, but every call gets a separate execution context with its own `name` parameter and local `message` binding.",
        language: "javascript",
        code: `function greet(name) {
  const message = 'Hello ' + name;
  console.log(message);
}

greet('Ada');   // new function execution context
greet('Grace'); // another function execution context`
      },
      {
        title: "Lexical scope is based on where code is written",
        descriptionMD: "The function `printLabel` looks outward to the scope where it was defined, not to the function that happens to call it.",
        language: "javascript",
        code: `const label = 'global';

function printLabel() {
  console.log(label);
}

function caller() {
  const label = 'caller';
  printLabel();
}

caller(); // global`
      }
    ],
    playground: [
      {
        title: "Trace nested execution contexts",
        descriptionMD: "Run it and read the output as push/pop events on the call stack.",
        code: `function inner(value) {
  console.log('enter inner: ' + value);
  console.log('leave inner');
}

function outer(name) {
  console.log('enter outer');
  inner(name.toUpperCase());
  console.log('leave outer');
}

console.log('global start');
outer('ada');
console.log('global end');`
      }
    ],
    outputPredictions: [
      {
        code: `console.log(kind);
var kind = 'global';

function show() {
  console.log(kind);
  var kind = 'local';
  console.log(kind);
}

show();
console.log(kind);`,
        answer: "undefined\nundefined\nlocal\nglobal",
        explanationMD: "The global `var kind` is created as `undefined`, so the first log is `undefined`. Inside `show`, a **separate local `var kind`** is also created as `undefined`, shadowing the global. The assignment to `'local'` happens during execution. The global value remains `'global'`."
      },
      {
        code: `var label = 'outer';

function first() {
  var label = 'first';
  second();
}

function second() {
  console.log(label);
}

first();`,
        answer: "outer",
        explanationMD: "JavaScript uses lexical scope, not dynamic scope. `second` was defined in the global environment, so its outer scope is global. It does not search `first` just because `first` called it."
      }
    ],
    codingExercises: [
      {
        title: "Create independent counter contexts",
        difficulty: "Medium",
        promptMD: "Implement `createCounter(start)` so each call creates an independent counter object with `increment()`, `decrement()`, and `value()` methods. The exercise is about recognizing that every call to `createCounter` gets a fresh execution context and a fresh closed-over environment.",
        hints: [
          "Store the current count in a local variable inside createCounter.",
          "Return methods that close over that local variable.",
          "Call createCounter twice to prove the counters do not share state."
        ],
        solutionCode: `function createCounter(start) {
  let current = start;

  return {
    increment: function () {
      current = current + 1;
      return current;
    },
    decrement: function () {
      current = current - 1;
      return current;
    },
    value: function () {
      return current;
    }
  };
}

const a = createCounter(0);
const b = createCounter(10);

console.log(a.increment());
console.log(a.increment());
console.log(b.decrement());
console.log(a.value());`,
        complexity: { time: "O(1) per operation", space: "O(1) per counter" },
        explanationMD: "Each call to `createCounter` creates a new execution context and a new `current` binding. The returned methods keep that binding alive through closure, so `a` and `b` operate on different environments even though they share the same function code."
      }
    ],
    interviewQuestions: [
      {
        question: "What is an execution context in JavaScript?",
        answerMD: "An execution context is the runtime record used to execute code. It contains the lexical environment for identifiers, the variable environment for `var` declarations, the `this` binding, function parameters/arguments, and bookkeeping needed to return to the caller. JavaScript creates a global context first and a new function context for every function call. Each context has a creation phase and an execution phase.",
        companies: ["Google", "Microsoft", "Amazon"],
        followUps: ["How does an execution context differ from a lexical environment?", "What is created during the memory phase?"]
      },
      {
        question: "Does JavaScript use lexical scope or dynamic scope?",
        answerMD: "JavaScript uses **lexical scope**. A function resolves outer variables based on where the function is written, not based on who calls it. The call stack decides which function is currently running, but the scope chain is determined at creation time from the source structure.",
        companies: ["Meta", "Netflix"]
      }
    ],
    quiz: [
      {
        question: "When is a function execution context created?",
        options: ["When the function is parsed", "Every time the function is called", "Only the first time the function is called", "Only when the function returns"],
        correctIndex: 1,
        explanationMD: "A function declaration may be registered during creation, but a **function execution context** is created for each call."
      },
      {
        question: "Which statement best explains hoisting?",
        options: ["The engine physically moves declarations to the top of the file", "Declarations are processed during the creation phase before execution", "Only assignments are processed before execution", "Only arrow functions are hoisted"],
        correctIndex: 1,
        explanationMD: "Hoisting is the observable result of declaration binding during the creation phase. Assignments still execute where they appear."
      }
    ],
    summary: [
      "An execution context is the runtime environment for running global code, module code, or a function call.",
      "Each context has a creation phase and an execution phase.",
      "The call stack tracks active contexts; the scope chain controls identifier lookup.",
      "Hoisting, TDZ, closures, and stack traces all become easier once you can simulate contexts."
    ],
    cheatSheetMD: "**Execution context:** runtime frame for code.\n\n**Created for:** global script/module once; every function call separately.\n\n**Contains:** lexical environment, variable environment, `this`, parameters/arguments, return bookkeeping.\n\n**Phases:** creation/memory first, execution second.\n\n**Mantra:** bindings first, statements later."
  },
  {
    slug: "js-memory-creation-phase",
    moduleId: "execution-context-hoisting",
    order: 28,
    title: "The Memory (Creation) Phase",
    difficulty: "Intermediate",
    estimatedReadingMin: 11,
    estimatedPracticeMin: 10,
    tags: ["Creation Phase", "Hoisting", "TDZ", "Declarations"],
    introMD: "Before JavaScript executes your first line, it performs a **memory phase** for the current execution context. The engine scans declarations, creates bindings, and decides their initial state. This is where the behaviors called hoisting and temporal dead zone are born.\n\nThe key is precise: declarations are prepared early, but assignments and most expressions still wait for the execution phase.",
    whyItMattersMD: "Most output-prediction bugs are creation-phase bugs. If you can build the memory table before executing a snippet, you can predict `undefined`, `ReferenceError`, `TypeError`, callable function declarations, and shadowing behavior without guessing.",
    theoryMD: "### What the engine prepares\n\nDuring creation, JavaScript builds an environment record for the context. It does not run business logic yet; it prepares names.\n\n| Declaration form | Creation-phase state | What happens when read before the line? |\n| --- | --- | --- |\n| `var x` | Binding exists and is initialized to `undefined` | Returns `undefined`. |\n| `function f() {}` | Binding exists and points to the function object | Callable before its declaration line. |\n| `let x` | Binding exists but is uninitialized | Throws ReferenceError due to TDZ. |\n| `const x` | Binding exists but is uninitialized | Throws ReferenceError due to TDZ. |\n| `class C {}` | Binding exists but is uninitialized | Throws ReferenceError due to TDZ. |\n| `var f = function () {}` | `f` exists as `undefined`; function value assigned later | Calling before assignment throws TypeError. |\n\n### Parameters are initialized too\n\nWhen a function context is created, parameter bindings are initialized before the body runs. Default parameters are evaluated left to right, which creates its own TDZ-like traps: an earlier default cannot read a later parameter.\n\n### Function declarations are special\n\nA function declaration is available as a function object during creation. That is why `sayHi()` can work before the declaration appears in source. A function expression assigned to `var` does **not** get this treatment; only the variable binding is prepared.\n\n### `let` and `const` are hoisted, but not usable\n\nA common incorrect answer is that `let` and `const` are not hoisted. They are hoisted in the sense that the binding is created at scope entry. They are just not initialized until execution reaches the declaration. The interval before that line is the temporal dead zone.\n\n### Mental workflow for interviews\n\n1. Draw a memory table for the current scope.\n2. Fill `var` with `undefined`.\n3. Fill function declarations with function objects.\n4. Mark `let`, `const`, and `class` as TDZ.\n5. Only then execute statements top to bottom.",
    diagrams: [
      {
        title: "Creation-phase memory table",
        ascii: `Code
  console.log(a)
  var a = 1
  let b = 2
  function run() {}

Creation phase
  a   -> undefined
  b   -> uninitialized TDZ
  run -> function object

Execution phase later performs the assignments a = 1 and b = 2`,
        caption: "The declaration kind determines the initial binding state."
      },
      {
        title: "Function expression with var",
        ascii: `Creation phase
  greet -> undefined

Execution phase
  greet() before assignment -> TypeError
  greet = function object
  greet() after assignment  -> works`,
        caption: "The variable is hoisted; the function expression value is not."
      }
    ],
    codeExamples: [
      {
        title: "Build the memory table first",
        descriptionMD: "Before execution, `count` exists as `undefined`, `show` is callable, and `name` is present but unavailable in the TDZ.",
        language: "javascript",
        code: `console.log(count); // undefined
show();             // works

var count = 1;
let name = 'Ada';

function show() {
  console.log('function declaration is ready');
}`
      },
      {
        title: "Function declaration vs function expression",
        descriptionMD: "Only the declaration is initialized to a function object during creation. The expression assignment happens later.",
        language: "javascript",
        code: `declaration(); // works

try {
  expression();
} catch (error) {
  console.log(error.name); // TypeError
}

function declaration() {
  console.log('ready during creation');
}

var expression = function () {
  console.log('assigned during execution');
};`
      }
    ],
    playground: [
      {
        title: "Creation states in action",
        descriptionMD: "This playground catches errors so you can observe each declaration kind safely.",
        code: `console.log('var before assignment: ' + status);
ready();

try {
  console.log(token);
} catch (error) {
  console.log('let before declaration: ' + error.name);
}

try {
  start();
} catch (error) {
  console.log('var function expression before assignment: ' + error.name);
}

var status = 'loading';
function ready() {
  console.log('function declaration is callable');
}
let token = 'abc';
var start = function () {
  console.log('function expression assigned');
};

console.log(status);
console.log(token);
start();`
      }
    ],
    outputPredictions: [
      {
        code: `console.log(score);
var score = 10;
console.log(score);`,
        answer: "undefined\n10",
        explanationMD: "`var score` is created and initialized to `undefined` during creation. The assignment to `10` happens later during execution."
      },
      {
        code: `sayHi();

try {
  greet();
} catch (error) {
  console.log(error.name);
}

function sayHi() {
  console.log('hi');
}

var greet = function () {
  console.log('hello');
};

greet();`,
        answer: "hi\nTypeError\nhello",
        explanationMD: "`sayHi` is a function declaration, so it is callable during creation. `greet` is only a `var` binding initialized to `undefined`; calling `undefined` throws TypeError. After assignment, `greet()` works."
      },
      {
        code: `try {
  console.log(name);
} catch (error) {
  console.log(error.name);
}

let name = 'Ada';
console.log(name);`,
        answer: "ReferenceError\nAda",
        explanationMD: "`let name` is created at scope entry but remains uninitialized until the declaration executes. Reading it in the TDZ throws ReferenceError; after initialization it logs `Ada`."
      }
    ],
    codingExercises: [
      {
        title: "Classify declaration creation states",
        difficulty: "Medium",
        promptMD: "Implement `describeCreationPhase(declarations)`. Each item has `{ name, kind }`, where kind is `'var'`, `'function'`, `'let'`, `'const'`, or `'class'`. Return strings describing the binding's creation-phase state, such as `'count -> undefined'` or `'User -> TDZ'`.",
        hints: [
          "Use a mapping from declaration kind to initial state.",
          "Function declarations are initialized to a function object.",
          "let, const, and class should be marked as TDZ."
        ],
        solutionCode: `function describeCreationPhase(declarations) {
  const states = {
    var: 'undefined',
    function: 'function object',
    let: 'TDZ',
    const: 'TDZ',
    class: 'TDZ'
  };

  return declarations.map(function (declaration) {
    return declaration.name + ' -> ' + states[declaration.kind];
  });
}

const result = describeCreationPhase([
  { name: 'count', kind: 'var' },
  { name: 'run', kind: 'function' },
  { name: 'token', kind: 'const' },
  { name: 'User', kind: 'class' }
]);

console.log(result.join('\\n'));`,
        complexity: { time: "O(n)", space: "O(n)" },
        explanationMD: "The exercise turns the memory phase into a table. `var` starts as `undefined`, function declarations start as callable function objects, and lexical/class declarations start as TDZ until execution reaches their declaration."
      }
    ],
    interviewQuestions: [
      {
        question: "What happens in the creation phase of an execution context?",
        answerMD: "The engine creates the environment record for the scope. It registers declarations, initializes `var` bindings to `undefined`, stores function declarations as function objects, creates `let`/`const`/`class` bindings in an uninitialized TDZ state, sets up the scope chain, and establishes the `this` binding. It does not execute assignments or function expressions yet.",
        companies: ["Google", "Amazon", "Microsoft"],
        followUps: ["Why can function declarations be called before their source line?", "Are let and const hoisted?"]
      },
      {
        question: "Why does calling a var-assigned function expression before its line throw TypeError instead of ReferenceError?",
        answerMD: "Because the `var` binding exists and is initialized to `undefined` during creation, so the name resolves successfully. The error happens because execution tries to call the current value, `undefined`, as a function. That is a TypeError. A missing name would be ReferenceError; a TDZ name would also be ReferenceError.",
        companies: ["Meta", "Netflix"]
      }
    ],
    quiz: [
      {
        question: "What is the creation-phase state of `var total`?",
        options: ["TDZ", "undefined", "null", "The assigned value"],
        correctIndex: 1,
        explanationMD: "`var` declarations are initialized to `undefined` during creation. Their assignments execute later."
      },
      {
        question: "Which declaration is callable before its source line executes?",
        options: ["`var f = function () {}`", "`const f = () => {}`", "`function f() {}`", "`class f {}`"],
        correctIndex: 2,
        explanationMD: "Function declarations are initialized to function objects during the creation phase. Function expressions and classes are not callable before initialization."
      }
    ],
    summary: [
      "The memory phase creates bindings before statements run.",
      "`var` starts as `undefined`; function declarations start as function objects.",
      "`let`, `const`, and `class` bindings exist but are uninitialized in the TDZ.",
      "Function expressions, arrow functions assigned to variables, and assignments happen during execution, not creation."
    ],
    cheatSheetMD: "**Creation phase table:**\n\n`var` -> `undefined`\n\n`function declaration` -> function object\n\n`let` / `const` / `class` -> TDZ until declaration executes\n\n`var f = function () {}` -> `f` is `undefined`; function value assigned later\n\n**Interview process:** make the memory table first, then execute line by line."
  },
  {
    slug: "js-execution-phase",
    moduleId: "execution-context-hoisting",
    order: 29,
    title: "The Execution Phase",
    difficulty: "Intermediate",
    estimatedReadingMin: 9,
    estimatedPracticeMin: 8,
    tags: ["Execution Phase", "Assignments", "Scope Chain", "Run to Completion"],
    introMD: "After the memory phase prepares bindings, JavaScript enters the **execution phase**: statements run in order, expressions are evaluated, assignments happen, and function calls create new execution contexts.\n\nIf the creation phase explains why names exist early, the execution phase explains when values actually change.",
    whyItMattersMD: "Many candidates stop at hoisting and forget that assignments are not hoisted. The execution phase is where real program state changes. It is also where call-stack growth, returns, thrown errors, and closure reads happen in a predictable order.",
    theoryMD: "### What happens during execution\n\nThe engine walks through executable statements in source order. During this phase it:\n\n- evaluates expressions such as `a + b` and function calls,\n- performs assignments such as `count = 1`,\n- initializes `let`, `const`, and `class` declarations when their line is reached,\n- creates a new function execution context for each call,\n- returns values to callers and pops contexts from the stack,\n- throws errors if a read hits TDZ, an undefined value is called, or another runtime rule is violated.\n\n### Assignment is not declaration\n\n`var total = 10` has two conceptual parts: declaration and assignment. The declaration was handled during creation; the assignment happens during execution. This is why reading `total` earlier gives `undefined`, not `10`.\n\n### Name lookup while executing\n\nWhen a statement reads an identifier, JavaScript searches the current lexical environment first, then outer environments until it reaches global scope. Assignment updates the found binding, unless it is immutable (`const`) or missing in strict mode.\n\n### Function calls interrupt the current line\n\nWhen execution reaches a function call, the current context pauses. A new function context is pushed onto the call stack, prepared, executed, and eventually popped. Then the caller resumes with the returned value.\n\n### Run-to-completion\n\nA running context is not preempted in the middle of a synchronous statement. Timers and promise callbacks only run after the current stack clears. This makes execution deterministic, but long synchronous work blocks everything else.",
    diagrams: [
      {
        title: "Declaration prepared first, assignment later",
        ascii: `var total = 10

Creation phase
  total -> undefined

Execution phase
  run statement: total = 10
  total -> 10`,
        caption: "A declaration can be ready before its value is assigned."
      },
      {
        title: "A function call pauses the caller",
        ascii: `global executing
  |
  | calls calculate()
  v
+----------------------+
| calculate context    | runs to return
+----------------------+
  |
  | pops and returns value
  v
global resumes after the call`,
        caption: "The caller waits while the callee context runs to completion."
      }
    ],
    codeExamples: [
      {
        title: "Assignments happen in order",
        descriptionMD: "The `var` binding exists early, but every value change happens exactly when execution reaches the assignment statement.",
        language: "javascript",
        code: `console.log(total); // undefined

var total = 1;
console.log(total); // 1

total = total + 4;
console.log(total); // 5`
      },
      {
        title: "A call creates a nested context",
        descriptionMD: "The outer function pauses while the inner function executes and returns.",
        language: "javascript",
        code: `function double(value) {
  return value * 2;
}

function compute() {
  const first = 10;
  const second = double(first);
  return second + 1;
}

console.log(compute()); // 21`
      }
    ],
    playground: [
      {
        title: "Watch execution pause and resume",
        descriptionMD: "Each log maps to the current function context. Notice how `outer` resumes only after `inner` returns.",
        code: `function inner(number) {
  console.log('inner received ' + number);
  return number * 2;
}

function outer() {
  console.log('outer start');
  const result = inner(5);
  console.log('outer got ' + result);
  return result + 1;
}

console.log('global start');
console.log(outer());
console.log('global end');`
      }
    ],
    outputPredictions: [
      {
        code: `var value = 1;

function change() {
  console.log(value);
  var value = 2;
  console.log(value);
}

change();
console.log(value);`,
        answer: "undefined\n2\n1",
        explanationMD: "Inside `change`, the local `var value` is created as `undefined` during creation and shadows the global. During execution it logs `undefined`, assigns `2`, then logs `2`. The global `value` remains `1`."
      },
      {
        code: `let count = 0;

function addOne() {
  count = count + 1;
  return count;
}

console.log(addOne());
console.log(addOne());
console.log(count);`,
        answer: "1\n2\n2",
        explanationMD: "Each call to `addOne` creates a new function context, but both calls update the same outer `count` binding. The first call returns `1`, the second returns `2`, and the final read sees `2`."
      },
      {
        code: `var run = function () {
  console.log('first');
};

run();

run = function () {
  console.log('second');
};

run();`,
        answer: "first\nsecond",
        explanationMD: "The `run` binding is reassigned during execution. The first call uses the first function value; after reassignment, the second call uses the new function value."
      }
    ],
    codingExercises: [
      {
        title: "Apply operations in execution order",
        difficulty: "Easy",
        promptMD: "Implement `runTransaction(balance, operations)`. `operations` is an array of objects like `{ type: 'deposit', amount: 10 }` or `{ type: 'withdraw', amount: 5 }`. Return an array of balances after applying each operation in order. This mirrors execution-phase state changes.",
        hints: [
          "Keep a mutable current balance inside the function.",
          "Loop through operations from left to right.",
          "Push the balance after each operation."
        ],
        solutionCode: `function runTransaction(balance, operations) {
  let current = balance;
  const history = [];

  for (let i = 0; i < operations.length; i++) {
    const operation = operations[i];

    if (operation.type === 'deposit') {
      current = current + operation.amount;
    } else if (operation.type === 'withdraw') {
      current = current - operation.amount;
    }

    history.push(current);
  }

  return history;
}

const history = runTransaction(100, [
  { type: 'deposit', amount: 50 },
  { type: 'withdraw', amount: 20 },
  { type: 'deposit', amount: 5 }
]);

console.log(history.join(','));`,
        complexity: { time: "O(n)", space: "O(n)" },
        explanationMD: "Execution is ordered: each operation sees the state produced by the previous operation. The local `current` binding is initialized when its declaration executes and then updated step by step."
      }
    ],
    interviewQuestions: [
      {
        question: "What is the difference between the creation phase and execution phase?",
        answerMD: "The creation phase prepares bindings and initial states: `var` as `undefined`, function declarations as function objects, and lexical declarations in TDZ. The execution phase runs statements in order: assignments happen, expressions are evaluated, functions are called, lexical declarations are initialized, and errors can be thrown.",
        companies: ["Google", "Microsoft", "Amazon"],
        followUps: ["Why are assignments not hoisted?", "When is a let binding initialized?"]
      },
      {
        question: "What happens when execution reaches a function call?",
        answerMD: "The caller pauses. JavaScript creates a new function execution context, prepares its parameters and local bindings, pushes it onto the call stack, executes it, then pops it when the function returns or throws. The caller then resumes with the returned value or handles the thrown error.",
        companies: ["Meta", "Apple"]
      }
    ],
    quiz: [
      {
        question: "In `var x = 7`, which part happens during execution?",
        options: ["Creating the `x` binding", "Initializing `x` to `undefined`", "Assigning `7` to `x`", "Parsing the source code"],
        correctIndex: 2,
        explanationMD: "The `var` binding and initial `undefined` happen during creation. The assignment `x = 7` happens when execution reaches the statement."
      },
      {
        question: "What happens to the caller when a function is called?",
        options: ["It keeps running in parallel", "It pauses until the called function returns or throws", "It is deleted from memory", "It moves to the microtask queue"],
        correctIndex: 1,
        explanationMD: "Synchronous function calls are stack-based. The caller waits while the callee context runs."
      }
    ],
    summary: [
      "The execution phase runs statements and expressions in source order.",
      "Assignments, function expressions, and lexical initializations happen during execution.",
      "Function calls push new contexts; returns pop them and resume the caller.",
      "Run-to-completion means synchronous code is not interrupted in the middle of the current stack."
    ],
    cheatSheetMD: "**Execution phase:** statements run line by line.\n\n**Happens here:** assignments, expression evaluation, function calls, returns, throws, lexical initialization.\n\n**Not here:** declaration discovery; that happened during creation.\n\n**Call rule:** caller pauses -> callee context runs -> callee returns -> caller resumes."
  },
  {
    slug: "js-hoisting",
    moduleId: "execution-context-hoisting",
    order: 30,
    title: "Hoisting",
    difficulty: "Intermediate",
    estimatedReadingMin: 12,
    estimatedPracticeMin: 12,
    tags: ["Hoisting", "var", "Function Declarations", "Output Prediction"],
    introMD: "**Hoisting** is the name for JavaScript's behavior of processing declarations before executing code. It makes some names available before their source line appears — but different declaration kinds behave very differently.\n\nThe most important correction: hoisting does **not** mean JavaScript physically moves your code. It means bindings are created during the memory phase.",
    whyItMattersMD: "Hoisting is one of the highest-frequency JavaScript interview topics because it combines execution contexts, declaration types, TDZ, and function calls. A strong answer is precise: `var` is hoisted to `undefined`, function declarations are hoisted as callable functions, and `let`/`const`/`class` are hoisted but blocked by TDZ.",
    theoryMD: "### Hoisting by declaration kind\n\n| Source form | What is hoisted? | Early read/call result |\n| --- | --- | --- |\n| `var x` | Binding initialized to `undefined` | `undefined`. |\n| `function f() {}` | Binding initialized to function object | Callable. |\n| `let x` | Binding created but uninitialized | ReferenceError in TDZ. |\n| `const x` | Binding created but uninitialized | ReferenceError in TDZ. |\n| `class C {}` | Binding created but uninitialized | ReferenceError in TDZ. |\n| `var f = function () {}` | Only `f` binding initialized to `undefined` | Calling gives TypeError. |\n| `const f = () => {}` | `f` binding in TDZ | Reading/calling gives ReferenceError. |\n\n### Assignments do not hoist\n\n`console.log(x); var x = 5;` does not become `var x = 5; console.log(x);`. The actual mental rewrite is closer to `var x; console.log(x); x = 5;`.\n\n### Function declarations vs expressions\n\nA function declaration is callable before it appears because the memory phase creates the function object. A function expression is just a value produced during execution. The variable may be hoisted, but the value is not assigned until the execution phase reaches the assignment.\n\n### `let` and `const` are not unhoisted\n\nIf `let` were truly not hoisted, an inner `let` would not affect code before its declaration. But it does: it shadows the outer name from the beginning of the block and throws in the TDZ. That proves the binding exists early.\n\n### Practical advice\n\nDo not rely on hoisting for readability. Put declarations near the top of the scope, prefer `const`, use function declarations intentionally, and avoid mixing `var` with modern lexical declarations.",
    diagrams: [
      {
        title: "Hoisting is binding creation, not code movement",
        ascii: `Original source
  console.log(x)
  var x = 5

Mental model
  Creation: x -> undefined
  Execution: console.log(x) -> undefined
             x = 5

Not true
  var x = 5 moved above console.log`,
        caption: "Only the declaration binding is prepared early; the assignment stays in place."
      },
      {
        title: "Declaration behavior ladder",
        ascii: `Most available before line

function declaration -> callable
var declaration      -> readable as undefined
let / const / class  -> binding exists but TDZ throws

Least available before line`,
        caption: "Hoisting is not one behavior; it depends on the declaration kind."
      }
    ],
    codeExamples: [
      {
        title: "Function declaration vs function expression",
        descriptionMD: "The declaration is callable early. The expression assigned to `var` is not.",
        language: "javascript",
        code: `declared(); // works

try {
  expressed();
} catch (error) {
  console.log(error.name); // TypeError
}

function declared() {
  console.log('function declaration');
}

var expressed = function () {
  console.log('function expression');
};`
      },
      {
        title: "Hoisting does not hoist the assignment",
        descriptionMD: "The first read sees the creation-phase value, not the later assigned value.",
        language: "javascript",
        code: `console.log(points); // undefined
var points = 100;
console.log(points); // 100`
      },
      {
        title: "Classes have a temporal dead zone",
        descriptionMD: "Class declarations are hoisted as bindings, but they cannot be used before initialization.",
        language: "javascript",
        code: `try {
  new User('Ada');
} catch (error) {
  console.log(error.name); // ReferenceError
}

class User {
  constructor(name) {
    this.name = name;
  }
}`
      }
    ],
    playground: [
      {
        title: "Compare hoisting behaviors",
        descriptionMD: "This snippet safely catches the errors produced by different declaration forms.",
        code: `console.log('var item before: ' + item);
show();

try {
  expression();
} catch (error) {
  console.log('expression before assignment: ' + error.name);
}

try {
  console.log(total);
} catch (error) {
  console.log('let before declaration: ' + error.name);
}

var item = 'book';
let total = 3;
function show() {
  console.log('function declaration works');
}
var expression = function () {
  console.log('function expression works');
};

console.log('var item after: ' + item);
console.log('let total after: ' + total);
expression();`
      }
    ],
    outputPredictions: [
      {
        code: `console.log(item);
var item = 'book';
console.log(item);`,
        answer: "undefined\nbook",
        explanationMD: "`var item` is hoisted and initialized to `undefined`; the assignment to `'book'` happens during execution."
      },
      {
        code: `console.log(typeof getName);
console.log(typeof getAge);

function getName() {
  return 'Ada';
}

var getAge = function () {
  return 42;
};`,
        answer: "function\nundefined",
        explanationMD: "`getName` is a function declaration and is initialized as a function object during creation. `getAge` is a `var` binding initialized to `undefined`; the function expression is assigned later."
      },
      {
        code: `foo();

function foo() {
  console.log('A');
}

foo = function () {
  console.log('B');
};

foo();`,
        answer: "A\nB",
        explanationMD: "The function declaration makes `foo` callable before its line. Later, execution reassigns `foo` to a new function, so the second call logs `B`."
      },
      {
        code: `try {
  console.log(total);
} catch (error) {
  console.log(error.name);
}

let total = 1;
console.log(total);`,
        answer: "ReferenceError\n1",
        explanationMD: "`let total` is hoisted as a binding but remains uninitialized until execution reaches the declaration. Reading it before then throws ReferenceError."
      }
    ],
    codingExercises: [
      {
        title: "Refactor a hoisting trap",
        difficulty: "Medium",
        promptMD: "Rewrite `reportScore` so it has no hoisting surprises. It should return `'missing'` when the input is `null` or `undefined`; otherwise it should return `'score: X'`. Use `const`/`let` and declare values before reading them.",
        hints: [
          "Avoid reading a variable before its declaration.",
          "Use a helper function declaration if it improves readability.",
          "Use `value == null` only if you intentionally want to match both null and undefined."
        ],
        solutionCode: `function reportScore(value) {
  if (value == null) {
    return 'missing';
  }

  const label = format(value);
  return label;
}

function format(score) {
  return 'score: ' + score;
}

console.log(reportScore(7));
console.log(reportScore(null));`,
        complexity: { time: "O(1)", space: "O(1)" },
        explanationMD: "The refactor avoids reading values before initialization. The helper is a function declaration, which is safely available throughout the scope, but the data binding `label` is declared immediately before use."
      }
    ],
    interviewQuestions: [
      {
        question: "What is hoisting in JavaScript?",
        answerMD: "Hoisting is the observable result of the creation phase of an execution context. Declarations are processed before statements execute. `var` bindings are initialized to `undefined`; function declarations are initialized to function objects; `let`, `const`, and `class` bindings are created but remain uninitialized in the temporal dead zone. Assignments are not hoisted.",
        companies: ["Google", "Amazon", "Microsoft", "Meta"],
        followUps: ["Are let and const hoisted?", "Why does a function expression assigned to var throw TypeError when called early?"]
      },
      {
        question: "Is JavaScript moving declarations to the top of the file?",
        answerMD: "No. That is a teaching shortcut, not the real model. The engine creates bindings during the creation phase, then executes code in its original order. This distinction matters because assignments, function expressions, and lexical initializations still happen where they appear.",
        companies: ["Netflix", "Apple"]
      }
    ],
    quiz: [
      {
        question: "What does `console.log(x); var x = 5;` print first?",
        options: ["5", "undefined", "ReferenceError", "null"],
        correctIndex: 1,
        explanationMD: "`var x` is hoisted and initialized to `undefined`; the assignment to `5` has not executed yet."
      },
      {
        question: "What happens when you call a `var` function expression before assignment?",
        options: ["It works because all functions are hoisted", "It throws TypeError because the variable is currently `undefined`", "It throws SyntaxError", "It creates a new global function"],
        correctIndex: 1,
        explanationMD: "Only the `var` binding is initialized early. The function expression value is assigned later, so early call attempts to call `undefined`."
      },
      {
        question: "Which declaration has a TDZ?",
        options: ["Only `var`", "`let`, `const`, and `class`", "Only function declarations", "No declarations have a TDZ"],
        correctIndex: 1,
        explanationMD: "`let`, `const`, and `class` bindings exist before their declaration executes but cannot be accessed during the TDZ."
      }
    ],
    summary: [
      "Hoisting means declarations are processed during creation before execution begins.",
      "`var` is hoisted with value `undefined`; function declarations are hoisted as callable function objects.",
      "`let`, `const`, and `class` are hoisted but inaccessible during the temporal dead zone.",
      "Assignments and function-expression values are not hoisted."
    ],
    cheatSheetMD: "**Hoisting truth:** bindings are prepared early; code is not physically moved.\n\n`var x` -> early value `undefined`\n\n`function f() {}` -> early callable function\n\n`let` / `const` / `class` -> TDZ until declaration executes\n\n`var f = function () {}` -> `f` is `undefined` until assignment\n\n**Avoid traps:** declare before use; prefer `const`; explain creation phase, not code movement."
  },
  {
    slug: "js-temporal-dead-zone",
    moduleId: "execution-context-hoisting",
    order: 31,
    title: "The Temporal Dead Zone",
    difficulty: "Intermediate",
    estimatedReadingMin: 10,
    estimatedPracticeMin: 10,
    tags: ["TDZ", "let", "const", "class", "Scope"],
    introMD: "The **Temporal Dead Zone (TDZ)** is the period between entering a scope and initializing a `let`, `const`, or `class` binding. The name exists, but JavaScript refuses to let you read or write it yet.\n\nThis is why `let` and `const` feel stricter than `var`: early access fails loudly instead of returning `undefined`.",
    whyItMattersMD: "TDZ questions separate memorization from real understanding. Senior interviewers often use shadowing, `typeof`, class declarations, and default parameters to see whether you know that lexical bindings are created early but initialized later.",
    theoryMD: "### The precise rule\n\nFor `let`, `const`, and `class`, the binding is created when the scope is entered. It is initialized only when execution reaches the declaration. Any access before initialization throws ReferenceError.\n\n### TDZ is about time, not just position\n\nThe word temporal matters. A line of code may appear after a declaration but still run before it due to a function call, or it may appear before a declaration but never run. TDZ errors happen at runtime when an access occurs before initialization.\n\n### Shadowing can create surprising TDZ errors\n\nAn inner `let` shadows an outer variable for the entire block, including lines before the inner declaration. So a read at the top of the block does not fall back to the outer variable; it hits the inner uninitialized binding and throws.\n\n### `typeof` exception has an exception\n\n`typeof notDeclared` returns `'undefined'` for a truly undeclared name. But `typeof tdzName` throws ReferenceError if `tdzName` is a lexical binding in the current scope that has not initialized yet.\n\n### Default parameter TDZ\n\nParameters are initialized left to right. A default value can read earlier parameters, but it cannot read later parameters that are not initialized yet. `function f(a = b, b = 1) {}` throws when called with no arguments.\n\n### Why TDZ exists\n\nTDZ prevents subtle bugs. Instead of silently using `undefined`, JavaScript tells you that your code is relying on a value before it has been initialized. It also makes block scope and `const` semantics sound: a `const` binding should not exist in a usable, unassigned state.",
    diagrams: [
      {
        title: "TDZ timeline for a block",
        ascii: `enter block
  |
  | binding exists but is uninitialized
  | reads and writes throw ReferenceError
  v
let value = 10
  |
  | binding initialized
  v
value can be read and written according to declaration rules
  |
leave block`,
        caption: "The binding exists before initialization, but it is unusable."
      },
      {
        title: "Shadowing and TDZ",
        ascii: `outer value = outer

{
  inner value binding created at block entry
  console.log(value) hits inner TDZ, not outer
  let value = inner
}`,
        caption: "The inner lexical binding shadows the outer name for the whole block."
      }
    ],
    codeExamples: [
      {
        title: "Shadowing creates a TDZ trap",
        descriptionMD: "The inner `let user` shadows the outer `user` from the start of the block.",
        language: "javascript",
        code: `const user = 'outer';

{
  try {
    console.log(user);
  } catch (error) {
    console.log(error.name); // ReferenceError
  }

  let user = 'inner';
  console.log(user); // inner
}`
      },
      {
        title: "typeof is not always safe",
        descriptionMD: "A truly undeclared name is safe with `typeof`, but a TDZ binding is not.",
        language: "javascript",
        code: `console.log(typeof completelyMissing); // undefined

try {
  console.log(typeof token);
} catch (error) {
  console.log(error.name); // ReferenceError
}

let token = 'ready';`
      }
    ],
    playground: [
      {
        title: "Explore TDZ safely",
        descriptionMD: "Every risky access is wrapped in try/catch so the snippet can continue.",
        code: `let status = 'outer';

{
  try {
    console.log('inside before declaration: ' + status);
  } catch (error) {
    console.log('shadowed status: ' + error.name);
  }

  let status = 'inner';
  console.log('inside after declaration: ' + status);
}

console.log('outside: ' + status);
console.log('missing typeof: ' + typeof missingName);

try {
  console.log(typeof token);
} catch (error) {
  console.log('tdz typeof: ' + error.name);
}

const token = 'abc';
console.log('token type: ' + typeof token);`
      }
    ],
    outputPredictions: [
      {
        code: `let value = 'outer';

{
  try {
    console.log(value);
  } catch (error) {
    console.log(error.name);
  }

  let value = 'inner';
  console.log(value);
}

console.log(value);`,
        answer: "ReferenceError\ninner\nouter",
        explanationMD: "The block-scoped `let value` shadows the outer `value` from block entry. Before its declaration, the inner binding is in the TDZ, so the first read throws. After initialization it logs `inner`; outside the block, the outer binding logs `outer`."
      },
      {
        code: `console.log(typeof missing);

try {
  console.log(typeof token);
} catch (error) {
  console.log(error.name);
}

let token = 'abc';
console.log(typeof token);`,
        answer: "undefined\nReferenceError\nstring",
        explanationMD: "`missing` is undeclared, so `typeof missing` safely returns `undefined`. `token` is a TDZ binding, so even `typeof token` throws ReferenceError. After initialization, its type is `string`."
      },
      {
        code: `function demo(a = b, b = 2) {
  console.log(a);
  console.log(b);
}

try {
  demo();
} catch (error) {
  console.log(error.name);
}

function okay(a = 1, b = a + 1) {
  console.log(a);
  console.log(b);
}

okay();`,
        answer: "ReferenceError\n1\n2",
        explanationMD: "Default parameters initialize left to right. In `demo`, `a = b` tries to read later parameter `b` before initialization, so it throws. In `okay`, `b` reads earlier initialized parameter `a`, so it logs `1` and `2`."
      }
    ],
    codingExercises: [
      {
        title: "Make configuration initialization TDZ-safe",
        difficulty: "Medium",
        promptMD: "Implement `buildUrl(options)` without reading any variable before it is declared. It should default `protocol` to `'https'`, default `host` to `'example.com'`, default `path` to `'/home'`, and return `protocol + '://' + host + path`.",
        hints: [
          "Declare defaults before combining them.",
          "Use nullish coalescing so empty strings can still be intentional values.",
          "Keep each `const` initialized at its declaration."
        ],
        solutionCode: `function buildUrl(options) {
  const input = options || {};
  const protocol = input.protocol ?? 'https';
  const host = input.host ?? 'example.com';
  const path = input.path ?? '/home';

  return protocol + '://' + host + path;
}

console.log(buildUrl({ host: 'elevateiq.dev', path: '/learn' }));
console.log(buildUrl({ protocol: 'http' }));`,
        complexity: { time: "O(1)", space: "O(1)" },
        explanationMD: "Every `const` is initialized immediately before being used. There is no TDZ access, and nullish coalescing only supplies defaults for `null` or `undefined`, not for intentionally empty values."
      }
    ],
    interviewQuestions: [
      {
        question: "What is the temporal dead zone?",
        answerMD: "The TDZ is the period from entering a scope until a `let`, `const`, or `class` declaration is initialized. The binding exists during that period, but any access throws ReferenceError. This is why lexical declarations are hoisted but not usable before their declaration line executes.",
        companies: ["Google", "Microsoft", "Amazon"],
        followUps: ["Does typeof throw in the TDZ?", "Why does inner let shadow an outer variable before its declaration line?"]
      },
      {
        question: "Why does `typeof x` sometimes throw?",
        answerMD: "`typeof` only safely returns `undefined` for names that are truly undeclared. If `x` is a lexical binding in the current scope but is still uninitialized in the TDZ, `typeof x` triggers the same ReferenceError as a normal read. The name exists; it is just not initialized yet.",
        companies: ["Meta", "Apple"]
      }
    ],
    quiz: [
      {
        question: "When does the TDZ for a `let` binding end?",
        options: ["When the file is parsed", "When execution reaches and initializes the declaration", "When the containing function returns", "When the variable is first read"],
        correctIndex: 1,
        explanationMD: "The TDZ ends only when the declaration is executed and the binding is initialized."
      },
      {
        question: "What does `typeof missingName` return when `missingName` is truly undeclared?",
        options: ["ReferenceError", "`undefined`", "`object`", "`null`"],
        correctIndex: 1,
        explanationMD: "`typeof` is safe for truly undeclared names and returns the string `undefined`. This differs from TDZ bindings."
      },
      {
        question: "Which binding can be read before its declaration line and produce `undefined`?",
        options: ["`let count`", "`const count`", "`class Count {}`", "`var count`"],
        correctIndex: 3,
        explanationMD: "`var` is initialized to `undefined` during creation. Lexical and class declarations throw in the TDZ."
      }
    ],
    summary: [
      "TDZ runs from scope entry until a lexical or class declaration initializes.",
      "`let`, `const`, and `class` are hoisted as bindings but cannot be accessed in the TDZ.",
      "An inner lexical binding shadows outer bindings even before its declaration line.",
      "`typeof` is safe for undeclared names but throws for TDZ bindings."
    ],
    cheatSheetMD: "**TDZ applies to:** `let`, `const`, `class` (and many module-binding scenarios).\n\n**Starts:** when the scope is entered.\n\n**Ends:** when execution initializes the declaration.\n\n**Early access:** ReferenceError, including `typeof` for TDZ bindings.\n\n**Shadowing:** inner lexical binding wins for the whole block, even before its declaration line."
  },
  {
    slug: "js-call-stack",
    moduleId: "execution-context-hoisting",
    order: 32,
    title: "The Call Stack",
    difficulty: "Intermediate",
    estimatedReadingMin: 11,
    estimatedPracticeMin: 10,
    tags: ["Call Stack", "Recursion", "Stack Trace", "Stack Overflow"],
    introMD: "The **call stack** is JavaScript's LIFO structure for tracking active execution contexts. When a function is called, its frame is pushed. When it returns or throws, its frame is popped.\n\nIt explains synchronous execution order, stack traces, recursion, and why a missing base case eventually becomes `RangeError: Maximum call stack size exceeded`.",
    whyItMattersMD: "Debugging JavaScript often starts with a stack trace. Interviews use the call stack to test recursion, event-loop ordering, and error propagation. If you can draw the stack, you can explain why callbacks wait, why deep recursion fails, and why an error points to a chain of callers.",
    theoryMD: "### LIFO execution\n\nThe call stack is **last in, first out**. The most recently called function is the one currently running. A frame usually contains the function's local bindings, parameters, `this` value, and the return address back to the caller.\n\n### Push and pop\n\n1. The global context starts at the bottom.\n2. Calling `a()` pushes an `a` frame.\n3. If `a()` calls `b()`, a `b` frame is pushed above `a`.\n4. When `b()` returns, `b` pops and `a` resumes.\n5. When `a()` returns, `a` pops and global code resumes.\n\n### Stack traces\n\nWhen an error is thrown, the engine can show the active chain of calls. A stack trace is read from the throw site outward toward the original caller. It answers: where did the error happen, and who called into it?\n\n### Stack overflow\n\nEvery function call needs stack space. Recursive code without a base case, or with too many nested calls, eventually exceeds the engine's stack limit and throws a RangeError in most JavaScript engines. Production code often replaces very deep recursion with iteration or an explicit stack.\n\n### Stack vs heap\n\nStack frames are temporary and pop when calls finish. Objects referenced by those frames live on the heap. If a closure needs a variable after the function returns, the engine keeps the needed environment alive beyond the stack frame.\n\n### Event loop connection\n\nThe event loop can only run queued callbacks when the call stack is empty. A long-running stack frame blocks timers, user events, and rendering until it completes.",
    diagrams: [
      {
        title: "Push on call, pop on return",
        ascii: `Start
+----------------+
| global         |
+----------------+

main calls a
+----------------+
| a              |
+----------------+
| global         |
+----------------+

a calls b
+----------------+
| b              |  current frame
+----------------+
| a              |
+----------------+
| global         |
+----------------+

b returns, then a returns, leaving global`,
        caption: "The top frame is always the currently executing function."
      },
      {
        title: "How to read a stack trace",
        ascii: `Error thrown in parseUser

Stack trace shape
  at parseUser      <- throw site
  at handleRequest  <- caller
  at main           <- caller of caller

Read from top to bottom: what failed, then how execution got there.`,
        caption: "The top line is usually the most immediate bug location; lower lines show the call path."
      },
      {
        title: "Recursive overflow",
        ascii: `factorial(5)
  factorial(4)
    factorial(3)
      factorial(2)
        factorial(1)
          base case returns

Missing base case:
  call -> call -> call -> call -> ... until stack limit -> RangeError`,
        caption: "Recursion needs both progress and a base case."
      }
    ],
    codeExamples: [
      {
        title: "A stack trace mirrors nested calls",
        descriptionMD: "This read-only example shows the shape of a stack trace. Exact formatting differs by engine, but the caller chain idea is the same.",
        language: "javascript",
        code: `function parseUser(raw) {
  throw new Error('invalid user');
}

function handleRequest(raw) {
  return parseUser(raw);
}

function main() {
  handleRequest('not-json');
}

try {
  main();
} catch (error) {
  console.log(error.stack);
}`
      },
      {
        title: "Avoid unbounded recursion",
        descriptionMD: "A missing base case grows the stack until the engine throws a RangeError. Keep recursion bounded or convert deep recursion to iteration.",
        language: "javascript",
        code: `function recurseForever() {
  return recurseForever();
}

// Do not run in production demos:
// recurseForever();
// RangeError: Maximum call stack size exceeded`
      }
    ],
    playground: [
      {
        title: "Watch stack order with enter and leave logs",
        descriptionMD: "The leave logs happen after deeper calls return, which reveals LIFO stack behavior.",
        code: `function c() {
  console.log('enter c');
  console.log('leave c');
}

function b() {
  console.log('enter b');
  c();
  console.log('leave b');
}

function a() {
  console.log('enter a');
  b();
  console.log('leave a');
}

console.log('global start');
a();
console.log('global end');`
      }
    ],
    outputPredictions: [
      {
        code: `function countdown(n) {
  console.log('enter ' + n);

  if (n === 0) {
    console.log('base');
    return;
  }

  countdown(n - 1);
  console.log('leave ' + n);
}

countdown(2);`,
        answer: "enter 2\nenter 1\nenter 0\nbase\nleave 1\nleave 2",
        explanationMD: "Each recursive call pushes a new frame. The deepest frame (`n === 0`) returns first, then frames unwind in reverse order, logging `leave 1` and `leave 2`."
      },
      {
        code: `function one() {
  two();
  console.log('after two');
}

function two() {
  throw new Error('boom');
}

try {
  one();
} catch (error) {
  console.log('caught ' + error.message);
}

console.log('done');`,
        answer: "caught boom\ndone",
        explanationMD: "`two` throws before returning, so `one` never reaches `console.log('after two')`. The error unwinds the stack to the nearest catch, logs `caught boom`, and execution continues after the catch."
      }
    ],
    codingExercises: [
      {
        title: "Replace recursion with an explicit stack",
        difficulty: "Hard",
        promptMD: "Implement `sumNested(values)` for arrays that may contain numbers or nested arrays of numbers. Use an explicit stack instead of recursion so very deep input is less likely to overflow the JavaScript call stack.",
        hints: [
          "Start with a stack containing the input array.",
          "Pop one item at a time. If it is an array, push its children.",
          "If it is a number, add it to the total."
        ],
        solutionCode: `function sumNested(values) {
  const stack = [values];
  let total = 0;

  while (stack.length > 0) {
    const current = stack.pop();

    if (Array.isArray(current)) {
      for (let i = 0; i < current.length; i++) {
        stack.push(current[i]);
      }
    } else {
      total = total + current;
    }
  }

  return total;
}

console.log(sumNested([1, [2, 3], [4, [5]]]));`,
        complexity: { time: "O(n)", space: "O(n)" },
        explanationMD: "The algorithm stores pending work in a heap-allocated array instead of relying on JavaScript function calls. It still uses memory proportional to nesting/work items, but it avoids growing the call stack with one frame per nested level."
      }
    ],
    interviewQuestions: [
      {
        question: "What is the call stack in JavaScript?",
        answerMD: "The call stack is a LIFO structure of active execution contexts. The global frame starts at the bottom; each function call pushes a frame; returning or throwing pops frames. The top frame is the one currently executing. It is why synchronous calls run in nested order and why the event loop waits until the stack is empty before running queued callbacks.",
        companies: ["Google", "Meta", "Amazon", "Microsoft"],
        followUps: ["How do you read a stack trace?", "What causes Maximum call stack size exceeded?"]
      },
      {
        question: "What is a stack overflow and how do you avoid it?",
        answerMD: "A stack overflow happens when too many function frames are pushed without enough returning, commonly from recursion without a base case or recursion that is too deep. JavaScript engines usually throw a RangeError. Avoid it by adding a correct base case, ensuring each recursive call progresses, limiting depth, or converting deep recursion to iteration with an explicit stack.",
        companies: ["Apple", "Netflix"]
      },
      {
        question: "What information does a stack trace give you?",
        answerMD: "A stack trace shows the active call chain at the moment an error was created or thrown. The top frames usually show where the failure occurred; lower frames show which functions called into that point. Formatting varies by engine, but the debugging strategy is to start at the top and follow the path downward.",
        companies: ["Microsoft", "Amazon"]
      }
    ],
    quiz: [
      {
        question: "Which frame is currently executing on the call stack?",
        options: ["The bottom frame", "The top frame", "The oldest frame", "All frames at once"],
        correctIndex: 1,
        explanationMD: "The call stack is LIFO. The most recently pushed frame, at the top, is currently executing."
      },
      {
        question: "What usually causes `Maximum call stack size exceeded`?",
        options: ["Too many microtasks", "Too many nested or recursive function calls", "A missing semicolon", "A resolved promise"],
        correctIndex: 1,
        explanationMD: "Each function call consumes stack space. Deep or unbounded recursion can exceed the engine limit and throw a RangeError."
      },
      {
        question: "When can the event loop run the next queued callback?",
        options: ["While any function is still on the stack", "Only after the call stack is empty", "Before synchronous code starts", "Only after garbage collection"],
        correctIndex: 1,
        explanationMD: "Queued callbacks wait until synchronous execution completes and the call stack is empty."
      }
    ],
    summary: [
      "The call stack is a LIFO stack of active execution contexts.",
      "Function calls push frames; returns and thrown errors pop or unwind frames.",
      "Stack traces show the active call chain at an error point.",
      "Deep or unbounded recursion can overflow the stack; iteration or an explicit stack avoids that risk."
    ],
    cheatSheetMD: "**Call stack:** LIFO list of active execution contexts.\n\n**Push:** function call. **Pop:** return. **Unwind:** thrown error until catch or program failure.\n\n**Top frame:** currently executing.\n\n**Stack trace:** top = throw site, below = caller chain.\n\n**Overflow:** too many nested calls -> RangeError. Use base cases or explicit stacks.\n\n**Event loop:** queued callbacks wait for an empty stack."
  }
];
