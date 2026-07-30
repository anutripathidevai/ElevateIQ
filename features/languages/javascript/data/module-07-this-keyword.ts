import type { Topic } from "../../types";

export const TOPICS: Topic[] = [
  {
    slug: "js-this-global",
    moduleId: "this-keyword",
    order: 50,
    title: "this in the Global Context",
    difficulty: "Intermediate",
    estimatedReadingMin: 9,
    estimatedPracticeMin: 5,
    tags: ["this", "Global Object", "Strict Mode", "Binding Rules"],
    introMD:
      "`this` is not a variable you declare. It is a runtime value supplied when a function is called. In the global context, its value depends heavily on where the code runs: classic browser scripts, ES modules, Node wrappers, and Web Workers differ.\n\nFor interviews, the safe mental model is: never guess from the text alone; ask **how the function is invoked**. Top-level `this` is mostly an environment detail, while function-call `this` follows binding rules.",
    whyItMattersMD:
      "Many senior-looking bugs come from assuming `this` means the surrounding object or the current file. Interviewers use global-context questions to test whether you can separate JavaScript language semantics from host-environment behavior. In production, this matters when moving code between browser scripts, ES modules, bundlers, Web Workers, and Node.",
    theoryMD:
      "### The interview-safe framing\n\nAt the top level, `this` is **host and source-type dependent**:\n\n| Context | Typical top-level `this` |\n| --- | --- |\n| Classic browser script | The global object (`window`) |\n| ES module in browser or Node | `undefined` |\n| Node CommonJS file | `module.exports`, because Node wraps the file in a function |\n| Web Worker | Environment-dependent enough that output puzzles should avoid printing it directly |\n\nThe important lesson is not memorising every host. The important lesson is learning that **top-level `this` is not the same interview problem as function-call `this`**.\n\n### The four binding rules\n\nWhen a regular function executes, JavaScript determines `this` from the call site using these rules:\n\n1. **Default binding** — plain call: `fn()`. In sloppy mode, `this` is substituted with the global object; in strict mode, `this` stays `undefined`.\n2. **Implicit binding** — property call: `obj.fn()`. `this` is `obj`.\n3. **Explicit binding** — `fn.call(obj)`, `fn.apply(obj)`, or `fn.bind(obj)`. `this` is the supplied object, except arrows ignore it.\n4. **new binding** — `new Fn()`. A fresh object becomes `this` inside the constructor.\n\n### Precedence\n\nThe rules have a useful precedence order:\n\n`new` binding > explicit binding (`call`, `apply`, `bind`) > implicit binding > default binding.\n\nA bound function called with `new` still uses the newly-created object as `this`. A method reference passed around without its object falls back to default binding unless it is bound or wrapped.\n\n### Strict mode changes default binding\n\nStrict mode does not change implicit, explicit, or `new` binding. It changes the plain-call fallback. In strict mode, a plain call leaves `this` as `undefined`, which is safer because bugs fail loudly instead of silently writing to the global object.",
    diagrams: [
      {
        title: "Call-site decision tree",
        ascii: `How was the regular function called?
 |
 +-- new Fn(...)              -> this is the new object
 |
 +-- fn.call(obj, ...)        -> this is obj
 +-- fn.apply(obj, args)      -> this is obj
 +-- fn.bind(obj)(...)        -> this is obj
 |
 +-- obj.fn(...)              -> this is obj
 |
 +-- fn()                     -> default binding
                                strict: undefined
                                sloppy: global object`,
        caption:
          "For regular functions, the call site matters more than where the function was written.",
      },
    ],
    codeExamples: [
      {
        title: "Top-level this is environment-specific",
        descriptionMD:
          "Use this as context, not as a portable rule. Modern code should prefer `globalThis` when it truly needs the global object.",
        language: "javascript",
        code: `// Classic browser script only:
// console.log(this === window); // true

// ES module:
// console.log(this); // undefined

// Node CommonJS file:
// console.log(this === module.exports); // true

console.log(globalThis.Math === Math); // true in modern environments`,
      },
      {
        title: "Strict mode makes default this fail loudly",
        descriptionMD:
          "A strict regular function called without an owner receives `undefined` as `this`.",
        language: "javascript",
        code: `function showDefaultThis() {
  'use strict';
  return this;
}

console.log(showDefaultThis() === undefined); // true`,
      },
    ],
    playground: [
      {
        title: "Default binding without printing the global object",
        descriptionMD:
          "This playground avoids printing raw top-level `this`. It compares strict default binding and explicit binding using concrete values.",
        code: `function strictDefault() {
  'use strict';
  console.log('strict default is undefined: ' + (this === undefined));
}

function showName() {
  'use strict';
  console.log('explicit name: ' + this.name);
}

strictDefault();
showName.call({ name: 'Ada' });`,
      },
    ],
    outputPredictions: [
      {
        code: `function inspectDefault() {
  'use strict';
  if (this === undefined) {
    console.log('strict default');
  }
}

function inspectExplicit() {
  'use strict';
  console.log(this.label);
}

inspectDefault();
inspectExplicit.call({ label: 'explicit object' });`,
        answer: "strict default\nexplicit object",
        explanationMD:
          "The strict plain call uses default binding and receives `undefined`. The second call uses `call` with a concrete object, so `this.label` is `explicit object`.",
      },
      {
        code: `function Person(name) {
  this.name = name;
}

const ada = new Person('Ada');
console.log(ada.name);
console.log(ada instanceof Person);`,
        answer: "Ada\ntrue",
        explanationMD:
          "`new Person('Ada')` creates a fresh object, binds it as `this` inside `Person`, links it to `Person.prototype`, and returns it because the constructor does not return another object.",
      },
    ],
    codingExercises: [
      {
        title: "Classify a call site's this binding",
        difficulty: "Easy",
        promptMD:
          "Implement `classifyCallSite(expression)` for the four expressions shown in the starter comments. Return `default`, `implicit`, `explicit`, or `new`. This is a reading exercise: focus on the syntax at the call site, not on where the function was defined.",
        hints: [
          "A plain `fn()` call is default binding.",
          "`obj.fn()` is implicit binding because the object to the left of the final dot owns the call.",
          "`call`, `apply`, and `bind` are explicit binding tools.",
          "`new Fn()` has the highest precedence.",
        ],
        solutionCode: `function classifyCallSite(expression) {
  if (expression.indexOf('new ') === 0) {
    return 'new';
  }

  if (
    expression.indexOf('.call(') !== -1 ||
    expression.indexOf('.apply(') !== -1 ||
    expression.indexOf('.bind(') !== -1
  ) {
    return 'explicit';
  }

  if (expression.indexOf('.') !== -1) {
    return 'implicit';
  }

  return 'default';
}

console.log(classifyCallSite('fn()'));
console.log(classifyCallSite('user.print()'));
console.log(classifyCallSite('print.call(user)'));
console.log(classifyCallSite('new User()'));`,
        complexity: { time: "O(n)", space: "O(1)" },
        explanationMD:
          "This simplified classifier mirrors the interview mental model. Real JavaScript parsing has more syntax cases, but the binding categories are decided by the call-site shape: plain call, property call, explicit helper, or constructor call.",
      },
    ],
    interviewQuestions: [
      {
        question:
          "What is `this` at the top level of JavaScript code?",
        answerMD:
          "It depends on the host and source type. In a classic browser script, top-level `this` is usually `window`. In an ES module, it is `undefined`. In Node CommonJS, the file is wrapped and top-level `this` is `module.exports`. For interviews, say that top-level `this` is environment-specific and then pivot to function-call binding rules.",
        companies: ["Microsoft", "Google", "Amazon"],
        followUps: [
          "How is top-level `this` different in an ES module?",
          "Why is `globalThis` safer when you need the global object?",
        ],
      },
      {
        question:
          "List the four `this` binding rules and their precedence.",
        answerMD:
          "The rules are default (`fn()`), implicit (`obj.fn()`), explicit (`call`, `apply`, `bind`), and `new` binding (`new Fn()`). Precedence is `new` > explicit > implicit > default. Strict mode affects only default binding: a plain call receives `undefined` instead of the global object.",
        companies: ["Meta", "Netflix"],
      },
    ],
    quiz: [
      {
        question:
          "Which statement about top-level `this` is the safest interview answer?",
        options: [
          "It is always the global object",
          "It is always `undefined`",
          "It depends on host environment and source type",
          "It is always the nearest object literal",
        ],
        correctIndex: 2,
        explanationMD:
          "Classic scripts, ES modules, Node CommonJS files, and workers can differ. The portable answer is that top-level `this` depends on the environment and source type.",
      },
      {
        question:
          "Which binding rule has the highest precedence for regular functions?",
        options: ["Default binding", "Implicit binding", "Explicit binding", "`new` binding"],
        correctIndex: 3,
        explanationMD:
          "`new` binding wins over explicit, implicit, and default binding. Calling a bound function with `new` still gives the constructor call its newly-created object.",
      },
    ],
    summary: [
      "Top-level `this` is environment-specific; do not treat it as one portable rule.",
      "Regular function `this` is determined by the call site.",
      "The four rules are default, implicit, explicit, and `new` binding.",
      "Precedence is `new` > explicit > implicit > default.",
      "Strict mode changes default binding from global-object substitution to `undefined`.",
    ],
    cheatSheetMD:
      "**Top-level:** classic script often global object; ES module `undefined`; Node CommonJS `module.exports`; workers vary.\n\n**Rules:** `fn()` default, `obj.fn()` implicit, `fn.call(obj)` / `apply` / `bind` explicit, `new Fn()` new binding.\n\n**Precedence:** `new` > explicit > implicit > default.\n\n**Strict mode:** only default binding changes; plain-call `this` stays `undefined`.",
  },
  {
    slug: "js-this-object",
    moduleId: "this-keyword",
    order: 51,
    title: "this in Object Methods",
    difficulty: "Intermediate",
    estimatedReadingMin: 9,
    estimatedPracticeMin: 6,
    tags: ["this", "Objects", "Implicit Binding", "Callbacks"],
    introMD:
      "When a regular function is called as a property, as in `user.getName()`, JavaScript uses **implicit binding**: `this` inside the function is the object to the left of the final dot.\n\nThe trap is that the function does not permanently belong to that object. If you copy the method into a variable or pass it as a callback, the original object is no longer part of the call site, so `this` changes.",
    whyItMattersMD:
      "The classic production bug is `button.onClick = user.save` or `setTimeout(user.save, 1000)`. The method worked when called as `user.save()`, then broke when passed around. Interviewers love this because it tests whether you reason from call sites rather than definitions.",
    theoryMD:
      "### Implicit binding\n\nIn `obj.method()`, `this` is `obj`. If the property access is longer, the object immediately left of the final call wins: `team.lead.sayName()` binds `this` to `team.lead`, not `team`.\n\nObject literals do not create a special `this` scope. A method's `this` is not fixed when the object is created. It is decided every time the function is called.\n\n### The lost-this problem\n\nA method reference is just a function value:\n\n`const fn = user.getName; fn();`\n\nThat second call is a plain call. The original `user` object has disappeared from the call site. In strict mode, `this` becomes `undefined`; in sloppy mode, it falls back to the global object. Either way, it is not `user`.\n\n### Safe fixes\n\nUse one of these patterns:\n\n- Call through the object: `user.getName()`.\n- Wrap the method: `() => user.getName()`.\n- Pre-bind it: `const getName = user.getName.bind(user)`.\n- Pass the receiver separately when an API supports it.\n\n### Nested objects and aliasing\n\nImplicit binding only cares about the object used for the final property access. If two objects share the same function, whichever object performs the call becomes `this`.",
    diagrams: [
      {
        title: "The object left of the call owns this",
        ascii: `team.lead.sayName()
          |
          +-- final property access is lead.sayName
              this === team.lead

const fn = team.lead.sayName
fn()
 |
 +-- no owning object at call site
     default binding applies`,
        caption:
          "A method can be borrowed or lost because functions are values.",
      },
    ],
    codeExamples: [
      {
        title: "Implicit binding uses the final receiver",
        descriptionMD:
          "The object immediately to the left of the final dot is the receiver.",
        language: "javascript",
        code: `const team = {
  name: 'Platform',
  lead: {
    name: 'Ada',
    describe: function () {
      return this.name;
    }
  }
};

console.log(team.lead.describe()); // Ada`,
      },
      {
        title: "One function, two receivers",
        descriptionMD:
          "The same function can be used as a method on different objects. `this` follows the receiver used at call time.",
        language: "javascript",
        code: `function describeRole() {
  return this.role;
}

const admin = { role: 'admin', describeRole: describeRole };
const guest = { role: 'guest', describeRole: describeRole };

console.log(admin.describeRole()); // admin
console.log(guest.describeRole()); // guest`,
      },
    ],
    playground: [
      {
        title: "Watch a method lose and regain this",
        descriptionMD:
          "Passing a method as a callback removes the original receiver. Binding restores a fixed receiver.",
        code: `const user = {
  name: 'Ada',
  showName: function () {
    'use strict';
    if (this === undefined) {
      console.log('lost this');
      return;
    }
    console.log('name: ' + this.name);
  }
};

function run(callback) {
  callback();
}

user.showName();
run(user.showName);
run(user.showName.bind(user));`,
      },
    ],
    outputPredictions: [
      {
        code: `const user = {
  name: 'Ada',
  show: function () {
    'use strict';
    if (this === undefined) {
      console.log('lost');
    } else {
      console.log(this.name);
    }
  }
};

function later(callback) {
  callback();
}

user.show();
later(user.show);`,
        answer: "Ada\nlost",
        explanationMD:
          "`user.show()` uses implicit binding, so `this` is `user`. `later(user.show)` passes only the function value. Inside `later`, `callback()` is a plain call, and because the method body is strict, `this` is `undefined`.",
      },
      {
        code: `const counter = {
  value: 1,
  inc: function () {
    this.value = this.value + 1;
    console.log(this.value);
  }
};

const other = { value: 10, inc: counter.inc };
counter.inc();
other.inc();`,
        answer: "2\n11",
        explanationMD:
          "The same function is called with two different receivers. `counter.inc()` increments `counter.value`; `other.inc()` increments `other.value`.",
      },
    ],
    codingExercises: [
      {
        title: "Preserve this when scheduling methods",
        difficulty: "Medium",
        promptMD:
          "Implement `scheduleMethod(object, methodName, delay)` so it schedules the named method and preserves the object as `this`. The function should work for methods that read or write object state.",
        hints: [
          "Do not pass `object[methodName]` directly to `setTimeout`.",
          "Wrap the method call in another function.",
          "The wrapper should call the method through the object or use `call`.",
        ],
        solutionCode: `function scheduleMethod(object, methodName, delay) {
  setTimeout(function () {
    object[methodName].call(object);
  }, delay);
}

const job = {
  status: 'queued',
  run: function () {
    this.status = 'done';
    console.log(this.status);
  }
};

scheduleMethod(job, 'run', 0);`,
        complexity: { time: "O(1)", space: "O(1)" },
        explanationMD:
          "The wrapper is the callback passed to `setTimeout`; inside it, the method is invoked with an explicit receiver. That prevents the original method from being called as an unowned plain function.",
      },
    ],
    interviewQuestions: [
      {
        question:
          "What is implicit binding, and when is it lost?",
        answerMD:
          "Implicit binding happens when a regular function is called as an object property: `obj.fn()`, so `this` is `obj`. It is lost when the function is extracted or passed around, such as `const fn = obj.fn; fn()` or `setTimeout(obj.fn, 0)`, because the call site no longer includes `obj`.",
        companies: ["Amazon", "Microsoft", "Meta"],
        followUps: [
          "How would you fix `setTimeout(user.save, 1000)`?",
          "What is `this` in `a.b.c()`?",
        ],
      },
      {
        question:
          "If the same function is assigned as a method on two objects, which object is `this`?",
        answerMD:
          "Whichever object is used as the receiver at the call site. Functions do not permanently remember the object they were assigned to. If `admin.show()` calls the function, `this` is `admin`; if `guest.show()` calls the same function, `this` is `guest`.",
      },
    ],
    quiz: [
      {
        question:
          "In `team.lead.sayName()`, what is `this` inside `sayName`?",
        options: ["`team`", "`team.lead`", "The global object", "`undefined` always"],
        correctIndex: 1,
        explanationMD:
          "Implicit binding uses the object immediately to the left of the final property call. Here, the final receiver is `team.lead`.",
      },
      {
        question:
          "Why does `const fn = user.show; fn()` usually break a method that uses `this`?",
        options: [
          "The function is deleted from `user`",
          "The call site no longer has `user` as the receiver",
          "Object methods cannot be assigned to variables",
          "The method automatically becomes an arrow function",
        ],
        correctIndex: 1,
        explanationMD:
          "Assigning the method to a variable copies the function value. The later `fn()` call is a plain call, so implicit binding is gone.",
      },
    ],
    summary: [
      "`obj.method()` uses implicit binding: `this` is `obj`.",
      "For nested property calls, the object left of the final dot is the receiver.",
      "Methods do not permanently remember their original object.",
      "Passing a method as a callback often loses `this`.",
      "Wrap, bind, or explicitly call the method to preserve its receiver.",
    ],
    cheatSheetMD:
      "**Implicit binding:** `obj.fn()` means `this === obj`.\n\n**Nested call:** `a.b.fn()` means `this === a.b`.\n\n**Lost method:** `const fn = obj.fn; fn()` is default binding, not implicit binding.\n\n**Fixes:** `obj.fn()`, `() => obj.fn()`, `obj.fn.bind(obj)`, or `obj.fn.call(obj)`.",
  },
  {
    slug: "js-this-function",
    moduleId: "this-keyword",
    order: 52,
    title: "this in Regular Functions",
    difficulty: "Intermediate",
    estimatedReadingMin: 10,
    estimatedPracticeMin: 6,
    tags: ["this", "Functions", "Default Binding", "Constructors"],
    introMD:
      "Regular functions get their `this` from **how they are called**. They do not capture `this` from where they are written. That single sentence explains most interview puzzles around plain functions, callbacks, constructors, and method borrowing.\n\nA regular function can use all four binding rules: default, implicit, explicit, and `new`.",
    whyItMattersMD:
      "Regular functions are still everywhere: object methods, prototype methods, class methods under the hood, constructors, event callbacks, and utility functions. If you can predict `this` for a regular function, arrow functions and `bind` become much easier to reason about.",
    theoryMD:
      "### Regular function `this` is dynamic\n\nA regular function's `this` is resolved when the function is invoked, not when it is defined. The same function can see different receivers across calls.\n\n### Default binding\n\nA plain call, `fn()`, uses default binding. In sloppy mode, `this` is substituted with the global object. In strict mode, `this` remains `undefined`. Most interview explanations should prefer strict mode because it exposes the bug clearly.\n\n### Implicit binding\n\nA property call, `obj.fn()`, sets `this` to `obj`. If the method is later extracted, this binding is gone.\n\n### Explicit binding\n\n`call`, `apply`, and `bind` let you provide the receiver yourself. They are useful for method borrowing, callback repair, and partial application.\n\n### new binding\n\nWhen a regular function is called with `new`, JavaScript creates a fresh object, assigns it as `this`, links it to the function's prototype, and returns it unless the constructor explicitly returns another object.\n\n### Constructor return rule\n\nIf a constructor returns a primitive, JavaScript ignores it and returns the new object. If it returns an object, that object replaces the new instance. This is a common advanced follow-up.",
    diagrams: [
      {
        title: "One regular function, four call sites",
        ascii: `function show() { ... }

show()                  -> default binding
profile.show()          -> implicit binding
show.call(profile)      -> explicit binding
new ShowConstructor()   -> new binding`,
        caption:
          "Regular functions are flexible because `this` is call-site driven.",
      },
    ],
    codeExamples: [
      {
        title: "The same function can have different this values",
        descriptionMD:
          "This is why you cannot inspect only the function definition to know `this`.",
        language: "javascript",
        code: `function label() {
  return this.name;
}

const a = { name: 'Ada', label: label };
const b = { name: 'Grace', label: label };

console.log(a.label());       // Ada
console.log(b.label());       // Grace
console.log(label.call(a));   // Ada`,
      },
      {
        title: "Constructor functions use new binding",
        descriptionMD:
          "Before `class`, constructor functions relied on `new` to provide the instance as `this`.",
        language: "javascript",
        code: `function User(name) {
  this.name = name;
}

User.prototype.sayName = function () {
  return this.name;
};

const user = new User('Ada');
console.log(user.sayName()); // Ada`,
      },
    ],
    playground: [
      {
        title: "Compare default, implicit, explicit, and new binding",
        descriptionMD:
          "Each call site invokes a regular function with a different binding rule.",
        code: `function show() {
  'use strict';
  if (this === undefined) {
    console.log('default');
  } else {
    console.log(this.label);
  }
}

const box = { label: 'implicit', show: show };

function Item(label) {
  this.label = label;
}

show();
box.show();
show.call({ label: 'explicit' });
const item = new Item('new');
console.log(item.label);`,
      },
    ],
    outputPredictions: [
      {
        code: `function show() {
  'use strict';
  console.log(this === undefined ? 'plain' : this.name);
}

const user = { name: 'Ada', show: show };
const fn = user.show;

user.show();
fn();
show.call({ name: 'Grace' });`,
        answer: "Ada\nplain\nGrace",
        explanationMD:
          "`user.show()` is implicit binding. `fn()` is a plain call, and the strict function receives `undefined`. `show.call({ name: 'Grace' })` uses explicit binding.",
      },
      {
        code: `function User(name) {
  this.name = name;
  return 'ignored';
}

const user = new User('Ada');
console.log(user.name);
console.log(user instanceof User);`,
        answer: "Ada\ntrue",
        explanationMD:
          "A constructor called with `new` returns the newly-created object unless it explicitly returns another object. Returning the primitive string is ignored.",
      },
    ],
    codingExercises: [
      {
        title: "Build a safe method invoker",
        difficulty: "Medium",
        promptMD:
          "Implement `invoke(object, methodName, args)` so it calls `object[methodName]` with `object` as `this` and returns the method's result. Use it to avoid losing `this` when methods are selected dynamically.",
        hints: [
          "Read the function from the object using `methodName`.",
          "Use `apply` so the arguments array can be forwarded.",
          "The receiver should be the original object.",
        ],
        solutionCode: `function invoke(object, methodName, args) {
  const method = object[methodName];
  return method.apply(object, args);
}

const cart = {
  total: 0,
  add: function (price, quantity) {
    this.total = this.total + price * quantity;
    return this.total;
  }
};

console.log(invoke(cart, 'add', [5, 3]));
console.log(cart.total);`,
        complexity: { time: "O(k)", space: "O(1)" },
        explanationMD:
          "`apply` calls the selected function with `object` as the receiver and forwards the provided argument list. The method can safely read and write `this.total`.",
      },
    ],
    interviewQuestions: [
      {
        question:
          "How is `this` determined in a regular function?",
        answerMD:
          "For a regular function, `this` is determined by the call site. A plain call uses default binding, a property call uses implicit binding, `call` / `apply` / `bind` use explicit binding, and `new` creates a new receiver object. Strict mode changes plain-call default binding so `this` remains `undefined`.",
        companies: ["Google", "Microsoft", "Amazon"],
      },
      {
        question:
          "What happens if a constructor function returns a value?",
        answerMD:
          "If it returns a primitive, the return value is ignored and the newly-created object is returned. If it returns an object or function, that object replaces the newly-created instance. This only matters when the function is called with `new`.",
        followUps: [
          "How does this differ from factory functions?",
          "What does `new` do step by step?",
        ],
      },
    ],
    quiz: [
      {
        question:
          "A regular function is called as `fn()`. In strict mode, what is `this`?",
        options: ["The global object", "`undefined`", "The function object", "The nearest object literal"],
        correctIndex: 1,
        explanationMD:
          "Strict mode prevents global-object substitution for default binding. A plain call receives `undefined` as `this`.",
      },
      {
        question:
          "Which call uses implicit binding?",
        options: ["`fn()`", "`obj.fn()`", "`fn.call(obj)`", "`new Fn()`"],
        correctIndex: 1,
        explanationMD:
          "`obj.fn()` calls a function as a property of `obj`, so `obj` is the implicit receiver.",
      },
    ],
    summary: [
      "Regular functions have dynamic `this`; it is decided at invocation time.",
      "Plain calls use default binding; strict mode makes default `this` `undefined`.",
      "Property calls use implicit binding.",
      "`call`, `apply`, and `bind` use explicit binding.",
      "`new` creates a fresh receiver object and has the highest precedence.",
    ],
    cheatSheetMD:
      "**Regular function:** `this` comes from the call site.\n\n**Plain call:** strict `undefined`, sloppy global object.\n\n**Property call:** receiver object.\n\n**Explicit call:** supplied receiver.\n\n**Constructor call:** fresh object. Primitive constructor returns are ignored; object returns replace the instance.",
  },
  {
    slug: "js-this-arrow",
    moduleId: "this-keyword",
    order: 53,
    title: "this in Arrow Functions",
    difficulty: "Intermediate",
    estimatedReadingMin: 10,
    estimatedPracticeMin: 7,
    tags: ["this", "Arrow Functions", "Lexical this", "Callbacks"],
    introMD:
      "Arrow functions do **not** have their own `this`. They capture `this` lexically from the surrounding scope where they are created.\n\nThat makes arrows excellent for callbacks that should keep an outer method's receiver, but dangerous as object methods when you expect `obj.method()` to set `this` to `obj`.",
    whyItMattersMD:
      "Arrow-related `this` puzzles are among the most common JavaScript interview questions. Production React, timers, promises, and array callbacks often use arrows specifically to preserve an outer `this`. But using an arrow as an object method is a classic bug.",
    theoryMD:
      "### Lexical this\n\nA regular function asks the call site for `this`. An arrow function does not. It closes over the `this` value from the nearest surrounding non-arrow scope.\n\nThis means `call`, `apply`, and `bind` can pass arguments to an arrow, but they cannot change the arrow's `this`.\n\n### Arrows are great inside methods\n\nA regular method can create an arrow callback. The method gets `this` from the receiver, and the arrow captures that `this` for later use. This is why arrows fix many callback bugs.\n\n### Arrows are usually bad as object methods\n\nIf you write `show: () => this.name` in an object literal, `this` is not the object. Object literals do not create `this` scopes. The arrow captures whatever `this` was in the surrounding file or function.\n\n### Arrows cannot be constructors\n\nArrow functions do not have `[[Construct]]` and do not have their own `prototype` property for instances. Calling an arrow with `new` throws a TypeError.\n\n### Also lexical: arguments and super\n\nArrows also do not have their own `arguments`, `super`, or `new.target`. For interviews, the headline is still: arrows capture `this`; they do not bind it dynamically.",
    diagrams: [
      {
        title: "Arrow this is captured, not rebound",
        ascii: `user.makeGreeter()
 |
 +-- regular method call: this === user
     |
     +-- creates arrow
         |
         +-- arrow remembers user

greeter.call(other)
 |
 +-- call supplies other, but arrow ignores it
     this is still user`,
        caption:
          "An arrow's `this` is fixed by the surrounding scope where the arrow was created.",
      },
    ],
    codeExamples: [
      {
        title: "Arrow callback preserves the method receiver",
        descriptionMD:
          "The method is regular so it receives `user`; the nested arrow captures that same receiver.",
        language: "javascript",
        code: `const user = {
  name: 'Ada',
  makeGreeter: function () {
    return () => {
      return 'Hello, ' + this.name;
    };
  }
};

const greet = user.makeGreeter();
console.log(greet()); // Hello, Ada`,
      },
      {
        title: "Do not use arrows for dynamic object methods",
        descriptionMD:
          "This example is wrapped in a factory so the captured `this` is concrete and visible.",
        language: "javascript",
        code: `function makeProfile() {
  return {
    name: 'Inner',
    show: () => this.name
  };
}

const profile = makeProfile.call({ name: 'Outer' });
console.log(profile.show()); // Outer, not Inner`,
      },
    ],
    playground: [
      {
        title: "call cannot rebind an arrow function",
        descriptionMD:
          "The arrow captures `this` from `makeGreeter`. Later explicit binding attempts are ignored.",
        code: `const user = {
  name: 'Ada',
  makeGreeter: function () {
    return () => {
      console.log('hello ' + this.name);
    };
  }
};

const greeter = user.makeGreeter();
greeter.call({ name: 'Grace' });`,
      },
    ],
    outputPredictions: [
      {
        code: `const user = {
  name: 'Ada',
  makeGreeter: function () {
    return () => {
      console.log(this.name);
    };
  }
};

const greeter = user.makeGreeter();
greeter.call({ name: 'Grace' });`,
        answer: "Ada",
        explanationMD:
          "`makeGreeter` is called as `user.makeGreeter()`, so its `this` is `user`. The returned arrow captures that value. `call({ name: 'Grace' })` cannot change an arrow's `this`.",
      },
      {
        code: `function makeTool() {
  return {
    name: 'inner',
    show: () => {
      console.log(this.name);
    }
  };
}

const tool = makeTool.call({ name: 'outer' });
tool.show.call({ name: 'call' });`,
        answer: "outer",
        explanationMD:
          "The arrow is created inside `makeTool`, whose `this` was explicitly bound to `{ name: 'outer' }`. The later `tool.show.call(...)` cannot rebind the arrow.",
      },
    ],
    codingExercises: [
      {
        title: "Convert a callback to preserve this",
        difficulty: "Easy",
        promptMD:
          "Refactor `makeDelayedLogger` so the scheduled callback logs the object's `label`. Use an arrow for the nested callback and keep `makeDelayedLogger` as a regular method.",
        hints: [
          "The outer method must be regular so `obj.makeDelayedLogger()` can set `this`.",
          "The inner callback should be an arrow so it captures the method's `this`.",
          "Avoid storing `const self = this`; use lexical `this` directly.",
        ],
        solutionCode: `const task = {
  label: 'build',
  makeDelayedLogger: function () {
    return () => {
      console.log(this.label);
    };
  }
};

const logLater = task.makeDelayedLogger();
setTimeout(logLater, 0);`,
        complexity: { time: "O(1)", space: "O(1)" },
        explanationMD:
          "The regular method receives `task` through implicit binding. The returned arrow captures that receiver, so it still logs `task.label` when used later as a timer callback.",
      },
    ],
    interviewQuestions: [
      {
        question:
          "How is `this` in an arrow function different from `this` in a regular function?",
        answerMD:
          "A regular function gets `this` dynamically from its call site. An arrow function has no own `this`; it captures the `this` value from the surrounding lexical scope. Therefore `call`, `apply`, and `bind` cannot change an arrow's `this`.",
        companies: ["Google", "Meta", "Netflix"],
      },
      {
        question:
          "Why is an arrow function usually a bad object method?",
        answerMD:
          "Object literals do not create a `this` scope. An arrow method captures `this` from the surrounding scope, not from the object. So `obj.arrowMethod()` does not make `this` equal to `obj`. Use a regular method when the method needs the object as its receiver.",
        followUps: [
          "When is an arrow inside a method useful?",
          "Can an arrow function be used with `new`?",
        ],
      },
    ],
    quiz: [
      {
        question:
          "What happens when you call an arrow function with `call` and a `thisArg`?",
        options: [
          "The arrow's `this` becomes the `thisArg`",
          "The arrow ignores the `thisArg` for `this` binding",
          "The arrow throws immediately",
          "The arrow becomes a constructor",
        ],
        correctIndex: 1,
        explanationMD:
          "`call` can still pass arguments, but it cannot change the lexical `this` captured by an arrow function.",
      },
      {
        question:
          "Which pattern is best when a method needs to schedule a callback that reads the method receiver?",
        options: [
          "Make the outer method an arrow and the callback regular",
          "Make both the method and callback arrows",
          "Use a regular outer method and an arrow inner callback",
          "Use no function at all",
        ],
        correctIndex: 2,
        explanationMD:
          "The regular method receives `this` from `obj.method()`. The inner arrow captures that `this` for later callback execution.",
      },
    ],
    summary: [
      "Arrow functions do not have their own `this`.",
      "An arrow captures `this` from the surrounding lexical scope.",
      "`call`, `apply`, and `bind` cannot rebind an arrow's `this`.",
      "Arrows are useful as callbacks inside regular methods.",
      "Arrows are usually wrong for object methods that need dynamic receivers.",
    ],
    cheatSheetMD:
      "**Arrow `this`:** lexical, captured at creation.\n\n**Ignored:** `call`, `apply`, and `bind` cannot change arrow `this`.\n\n**Good use:** callback inside a regular method.\n\n**Bad use:** object method that expects `obj.method()` to set `this`.\n\n**Constructor:** arrows cannot be called with `new`.",
  },
  {
    slug: "js-call",
    moduleId: "this-keyword",
    order: 54,
    title: "Function.prototype.call",
    difficulty: "Intermediate",
    estimatedReadingMin: 8,
    estimatedPracticeMin: 6,
    tags: ["this", "call", "Explicit Binding", "Method Borrowing"],
    introMD:
      "`Function.prototype.call` invokes a function immediately with a specific `this` value and a comma-separated list of arguments: `fn.call(thisArg, arg1, arg2)`.\n\nIt is the most direct explicit-binding tool and the foundation for many interview patterns: method borrowing, safe dynamic invocation, and repairing lost `this`.",
    whyItMattersMD:
      "`call` shows that `this` is not magic ownership; it is an invocation parameter for regular functions. If you understand `call`, you can explain `apply`, `bind`, method borrowing, and why arrows ignore explicit binding.",
    theoryMD:
      "### Syntax\n\n`fn.call(thisArg, arg1, arg2, ...)`\n\n`call` does two things:\n\n1. Invokes `fn` immediately.\n2. Uses `thisArg` as `this` inside `fn`, unless `fn` is an arrow.\n\n### Strict vs sloppy thisArg conversion\n\nFor strict regular functions, `this` is exactly the `thisArg` you pass. For sloppy functions, `null` or `undefined` are replaced with the global object, and primitive values can be boxed. Prefer strict mental models in interviews because they avoid surprising coercion.\n\n### Method borrowing\n\nYou can use a method from one object on another object if the method only relies on `this` shape. For example, `Array.prototype.slice.call(arrayLike)` historically converted array-like values to real arrays.\n\n### call vs direct invocation\n\n`user.show()` and `show.call(user)` can produce the same `this`, but they communicate different intent. Direct invocation uses the object as the receiver. `call` says, explicitly, `run this function with this receiver`.\n\n### call and arrows\n\n`call` cannot change an arrow function's `this`, because arrows do not have their own `this` binding. It can still pass normal arguments.",
    diagrams: [
      {
        title: "call supplies this and arguments separately",
        ascii: `print.call(user, 'Hello')
  |       |       |
  |       |       +-- first normal argument
  |       +---------- thisArg
  +------------------ function to invoke now

Inside print:
  this === user
  message === 'Hello'`,
        caption:
          "`call` is immediate explicit binding with positional arguments.",
      },
    ],
    codeExamples: [
      {
        title: "Repair a lost method with call",
        descriptionMD:
          "Even if the method was extracted, `call` can provide the receiver at invocation time.",
        language: "javascript",
        code: `const user = {
  name: 'Ada',
  show: function (prefix) {
    return prefix + ' ' + this.name;
  }
};

const show = user.show;
console.log(show.call(user, 'Dr.')); // Dr. Ada`,
      },
      {
        title: "Borrow a method",
        descriptionMD:
          "This pattern works when the borrowed method only needs compatible properties on `this`.",
        language: "javascript",
        code: `const formatter = {
  format: function (label) {
    return label + ': ' + this.value;
  }
};

const metric = { value: 42 };
console.log(formatter.format.call(metric, 'score')); // score: 42`,
      },
    ],
    playground: [
      {
        title: "Use call for explicit binding",
        descriptionMD:
          "The same function is invoked with two different concrete receivers.",
        code: `function introduce(greeting, punctuation) {
  console.log(greeting + ', I am ' + this.name + punctuation);
}

introduce.call({ name: 'Ada' }, 'Hello', '!');
introduce.call({ name: 'Grace' }, 'Hi', '.');`,
      },
    ],
    outputPredictions: [
      {
        code: `function addToTotal(amount) {
  this.total = this.total + amount;
  console.log(this.total);
}

const cart = { total: 10 };
addToTotal.call(cart, 5);
addToTotal.call(cart, 7);`,
        answer: "15\n22",
        explanationMD:
          "`call` invokes `addToTotal` immediately with `cart` as `this`. The first call changes `cart.total` to `15`; the second changes it to `22`.",
      },
      {
        code: `const outer = {
  name: 'outer',
  makeArrow: function () {
    return () => {
      console.log(this.name);
    };
  }
};

const arrow = outer.makeArrow();
arrow.call({ name: 'call' });`,
        answer: "outer",
        explanationMD:
          "The arrow captured `this` from `outer.makeArrow()`. `call` cannot rebind an arrow's `this`, so it still logs `outer`.",
      },
    ],
    codingExercises: [
      {
        title: "Implement method borrowing with call",
        difficulty: "Medium",
        promptMD:
          "Implement `borrow(methodOwner, methodName, receiver)` so it returns a function that calls `methodOwner[methodName]` with `receiver` as `this` and forwards one argument. Keep the exercise focused on `call`.",
        hints: [
          "Read the method from `methodOwner`.",
          "Return a wrapper function.",
          "Inside the wrapper, use `method.call(receiver, argument)`.",
        ],
        solutionCode: `function borrow(methodOwner, methodName, receiver) {
  const method = methodOwner[methodName];

  return function (argument) {
    return method.call(receiver, argument);
  };
}

const formatter = {
  format: function (label) {
    return label + ': ' + this.value;
  }
};

const formatScore = borrow(formatter, 'format', { value: 99 });
console.log(formatScore('score'));`,
        complexity: { time: "O(1)", space: "O(1)" },
        explanationMD:
          "The returned wrapper explicitly invokes the borrowed method with the receiver. `call` is ideal when the arguments are already known position by position.",
      },
    ],
    interviewQuestions: [
      {
        question:
          "What does `Function.prototype.call` do?",
        answerMD:
          "`call` invokes a function immediately with an explicit `this` value and positional arguments: `fn.call(thisArg, arg1, arg2)`. For regular functions, `this` inside `fn` is `thisArg`, subject to sloppy-mode conversions. Arrow functions ignore the `thisArg` for `this` binding.",
        companies: ["Microsoft", "Amazon", "Google"],
      },
      {
        question:
          "When would you use `call` instead of directly invoking a method?",
        answerMD:
          "Use `call` when the function is not being invoked through the desired receiver: method borrowing, dynamic invocation, extracted methods, or APIs where you need to provide the receiver separately. Direct `obj.fn()` is clearer when the function already lives on the receiver.",
      },
    ],
    quiz: [
      {
        question:
          "Which call invokes `sum` with `cart` as `this` and `5` as the first argument?",
        options: [
          "`sum(cart, 5)`",
          "`sum.call(cart, 5)`",
          "`cart.call(sum, 5)`",
          "`new sum(cart, 5)`",
        ],
        correctIndex: 1,
        explanationMD:
          "`sum.call(cart, 5)` invokes `sum` immediately, setting `this` to `cart` and passing `5` as the first normal argument.",
      },
      {
        question:
          "What happens when `call` is used on an arrow function?",
        options: [
          "It changes the arrow's `this`",
          "It can pass arguments but cannot change the arrow's lexical `this`",
          "It always throws a SyntaxError",
          "It converts the arrow to a regular function",
        ],
        correctIndex: 1,
        explanationMD:
          "Arrows do not have their own `this`, so `call` cannot rebind it. Arguments are still passed normally.",
      },
    ],
    summary: [
      "`call` invokes a function immediately.",
      "The first argument to `call` is the explicit `this` value.",
      "Remaining arguments are passed positionally to the function.",
      "`call` is useful for method borrowing and repairing lost receivers.",
      "Arrow functions ignore `call` for `this` binding.",
    ],
    cheatSheetMD:
      "**Syntax:** `fn.call(thisArg, arg1, arg2)`.\n\n**Timing:** immediate invocation.\n\n**Arguments:** comma-separated.\n\n**Use cases:** method borrowing, dynamic invocation, lost-`this` repair.\n\n**Arrow caveat:** arguments pass through, but `thisArg` is ignored for `this`.",
  },
  {
    slug: "js-apply",
    moduleId: "this-keyword",
    order: 55,
    title: "Function.prototype.apply",
    difficulty: "Intermediate",
    estimatedReadingMin: 8,
    estimatedPracticeMin: 6,
    tags: ["this", "apply", "Explicit Binding", "Arguments"],
    introMD:
      "`Function.prototype.apply` invokes a function immediately with a specific `this` value and an array-like list of arguments: `fn.apply(thisArg, argsArray)`.\n\nIt is the sibling of `call`. Use `call` when arguments are already separate; use `apply` when arguments are already collected.",
    whyItMattersMD:
      "`apply` appears in legacy JavaScript, polyfills, function forwarding, and many interview implementations. Even though spread syntax replaced some common uses, `apply` remains essential for understanding how `bind` and function delegation work.",
    theoryMD:
      "### Syntax\n\n`fn.apply(thisArg, argsArray)`\n\n`apply` does two things:\n\n1. Invokes `fn` immediately.\n2. Expands `argsArray` into positional arguments while binding `this` to `thisArg` for regular functions.\n\n### call vs apply\n\n| Tool | Argument style | Timing |\n| --- | --- | --- |\n| `call` | `fn.call(obj, a, b)` | Immediate |\n| `apply` | `fn.apply(obj, [a, b])` | Immediate |\n| `bind` | `fn.bind(obj, a)` | Later |\n\n### Forwarding arguments\n\n`apply` is especially useful when writing wrappers. If a wrapper receives an array of values and needs to forward them to another function, `apply` avoids manually indexing each one.\n\n### Modern spread comparison\n\n`fn.apply(obj, args)` is similar to `fn.call(obj, ...args)`, but `apply` works directly with array-like values in older code. Modern code often uses spread for arrays, but interviews still ask `apply` because it reveals explicit binding mechanics.\n\n### Arrow caveat\n\nLike `call`, `apply` cannot change an arrow function's lexical `this`.",
    diagrams: [
      {
        title: "apply expands an argument list",
        ascii: `calculate.apply(invoice, [2, 5, 1])
      |       |        |
      |       |        +-- array-like arguments
      |       +----------- thisArg
      +------------------- function to invoke now

Inside calculate:
  this === invoice
  first arg === 2
  second arg === 5
  third arg === 1`,
        caption:
          "`apply` is explicit binding plus argument-list expansion.",
      },
    ],
    codeExamples: [
      {
        title: "Forward a collected argument list",
        descriptionMD:
          "Wrappers often receive arguments as an array and forward them with `apply`.",
        language: "javascript",
        code: `function charge(price, quantity, tax) {
  this.total = this.total + price * quantity + tax;
  return this.total;
}

const invoice = { total: 0 };
const args = [10, 2, 1];

console.log(charge.apply(invoice, args)); // 21`,
      },
      {
        title: "Legacy maximum with apply",
        descriptionMD:
          "Before spread syntax, `apply` was the common way to pass an array to a variadic function.",
        language: "javascript",
        code: `const scores = [10, 40, 25];
console.log(Math.max.apply(null, scores)); // 40

// Modern equivalent:
console.log(Math.max(...scores)); // 40`,
      },
    ],
    playground: [
      {
        title: "Use apply to forward arguments",
        descriptionMD:
          "The wrapper receives an array and forwards it while preserving the receiver.",
        code: `function describe(prefix, suffix) {
  console.log(prefix + this.name + suffix);
}

const user = { name: 'Ada' };
const parts = ['Hello ', '!'];

describe.apply(user, parts);`,
      },
    ],
    outputPredictions: [
      {
        code: `function multiply(a, b) {
  console.log(this.factor * a * b);
}

const context = { factor: 3 };
multiply.apply(context, [2, 5]);`,
        answer: "30",
        explanationMD:
          "`apply` binds `this` to `context` and expands `[2, 5]` into `a = 2` and `b = 5`. The result is `3 * 2 * 5`.",
      },
      {
        code: `function joinThree(a, b, c) {
  console.log(this.prefix + a + b + c);
}

joinThree.apply({ prefix: 'id-' }, [1, 2, 3]);`,
        answer: "id-123",
        explanationMD:
          "The array elements become positional arguments. The receiver contributes the `prefix`, so the concatenated output is `id-123`.",
      },
    ],
    codingExercises: [
      {
        title: "Implement an argument-forwarding wrapper",
        difficulty: "Medium",
        promptMD:
          "Implement `withReceiver(fn, receiver)` so it returns a function that accepts an array of arguments and invokes `fn` with `receiver` as `this`. Use `apply`.",
        hints: [
          "Return a new function that takes `args`.",
          "Inside the returned function, call `fn.apply(receiver, args)`.",
          "The returned function should return the original function's return value.",
        ],
        solutionCode: `function withReceiver(fn, receiver) {
  return function (args) {
    return fn.apply(receiver, args);
  };
}

function add(a, b) {
  this.total = this.total + a + b;
  return this.total;
}

const state = { total: 10 };
const addToState = withReceiver(add, state);

console.log(addToState([2, 3]));
console.log(state.total);`,
        complexity: { time: "O(k)", space: "O(1)" },
        explanationMD:
          "The wrapper receives a collected argument list and uses `apply` to expand it into the original function while fixing the receiver.",
      },
    ],
    interviewQuestions: [
      {
        question:
          "What is the difference between `call` and `apply`?",
        answerMD:
          "Both invoke a function immediately with an explicit `this` value. `call` takes arguments one by one: `fn.call(obj, a, b)`. `apply` takes a single array-like argument list: `fn.apply(obj, [a, b])`.",
        companies: ["Amazon", "Microsoft", "Google"],
      },
      {
        question:
          "When is `apply` useful in modern JavaScript?",
        answerMD:
          "It is useful for forwarding a collected argument list, writing wrappers, maintaining legacy code, and understanding polyfills such as simplified `bind`. Modern spread syntax covers many array use cases, but `apply` is still the explicit-binding primitive for array-like forwarding.",
      },
    ],
    quiz: [
      {
        question:
          "Which expression calls `fn` with `obj` as `this` and `[1, 2]` as the argument list?",
        options: [
          "`fn.call(obj, [1, 2])`",
          "`fn.apply(obj, [1, 2])`",
          "`fn.bind(obj, [1, 2])`",
          "`new fn(obj, [1, 2])`",
        ],
        correctIndex: 1,
        explanationMD:
          "`apply` expects the second argument to be an array-like list that is expanded into positional arguments.",
      },
      {
        question:
          "What is the timing difference between `apply` and `bind`?",
        options: [
          "`apply` invokes immediately; `bind` returns a function for later",
          "`bind` invokes immediately; `apply` returns a function",
          "Both only return functions",
          "Both only work with constructors",
        ],
        correctIndex: 0,
        explanationMD:
          "`apply`, like `call`, invokes immediately. `bind` creates a bound function that can be invoked later.",
      },
    ],
    summary: [
      "`apply` invokes a function immediately with explicit `this`.",
      "The second argument to `apply` is an array-like list of arguments.",
      "`apply` is ideal for forwarding collected arguments.",
      "Modern spread replaces some uses but not the underlying concept.",
      "Arrow functions ignore `apply` for `this` binding.",
    ],
    cheatSheetMD:
      "**Syntax:** `fn.apply(thisArg, argsArray)`.\n\n**Timing:** immediate invocation.\n\n**Arguments:** collected array-like list.\n\n**Use cases:** wrappers, argument forwarding, legacy variadic calls.\n\n**Compare:** `call` takes separate args; `bind` returns a later function.",
  },
  {
    slug: "js-bind",
    moduleId: "this-keyword",
    order: 56,
    title: "Function.prototype.bind",
    difficulty: "Intermediate",
    estimatedReadingMin: 10,
    estimatedPracticeMin: 8,
    tags: ["this", "bind", "Explicit Binding", "Polyfills"],
    introMD:
      "`Function.prototype.bind` does **not** invoke the function immediately. It returns a new function whose `this` is permanently set for normal calls, optionally with some arguments pre-filled.\n\nUse `bind` when you need to pass a function around but keep its receiver, especially for callbacks.",
    whyItMattersMD:
      "`bind` is the standard answer to the lost-method problem: `setTimeout(user.save.bind(user), 1000)`. Interviewers also ask candidates to implement a simplified `bind` because it tests closures, `this`, `apply`, argument concatenation, and constructor edge cases.",
    theoryMD:
      "### Syntax\n\n`const bound = fn.bind(thisArg, presetArg1, presetArg2)`\n\n`bind` returns a new function. When that new function is called, it invokes the original function with:\n\n- `this` fixed to `thisArg` for normal calls.\n- preset arguments placed before later arguments.\n\n### Hard binding\n\nA bound function ignores later attempts to change `this` with `call` or `apply`. Once bound, normal calls use the bound receiver.\n\n### Partial application\n\n`bind` can pre-fill leading arguments. This is useful when you want a specialised function: `const addTax = calculate.bind(invoice, 0.18)`.\n\n### bind vs call/apply\n\n| Tool | Invokes now? | Argument style | Main use |\n| --- | --- | --- | --- |\n| `call` | Yes | Separate arguments | Immediate explicit call |\n| `apply` | Yes | Array-like arguments | Forward collected args |\n| `bind` | No | Preset plus later args | Save receiver for later |\n\n### Constructor caveat\n\nNative `bind` has a special rule with `new`: if a bound function is used as a constructor, the newly-created object becomes `this`, not the bound receiver. Many interview polyfills start with a simplified normal-call implementation, then discuss constructor support as a follow-up.\n\n### Arrow caveat\n\nBinding an arrow returns a new callable function, but it does not change the arrow's lexical `this`.",
    diagrams: [
      {
        title: "bind stores receiver and leading arguments",
        ascii: `const bound = fn.bind(receiver, 'A')
                    |
                    +-- remembers receiver
                    +-- remembers leading argument 'A'

bound('B')
  |
  +-- invokes fn with:
      this === receiver
      arguments === ['A', 'B']`,
        caption:
          "`bind` is delayed explicit binding plus optional partial application.",
      },
    ],
    codeExamples: [
      {
        title: "Fix a lost callback with bind",
        descriptionMD:
          "The bound function can be passed around safely because normal calls use the stored receiver.",
        language: "javascript",
        code: `const user = {
  name: 'Ada',
  show: function () {
    return this.name;
  }
};

const showUser = user.show.bind(user);
console.log(showUser()); // Ada
console.log(showUser.call({ name: 'Grace' })); // Ada`,
      },
      {
        title: "Partial application with bind",
        descriptionMD:
          "Preset arguments are placed before arguments supplied later.",
        language: "javascript",
        code: `function createLabel(prefix, id, suffix) {
  return prefix + id + suffix;
}

const createUserLabel = createLabel.bind(null, 'user-');
console.log(createUserLabel(42, '-active')); // user-42-active`,
      },
    ],
    playground: [
      {
        title: "bind returns a delayed, fixed-this function",
        descriptionMD:
          "Calling the bound function with `call` later does not replace the bound receiver.",
        code: `function show(prefix, suffix) {
  console.log(prefix + this.name + suffix);
}

const bound = show.bind({ name: 'Ada' }, 'Hello ');

bound('!');
bound.call({ name: 'Grace' }, '?');`,
      },
    ],
    outputPredictions: [
      {
        code: `function show(prefix, suffix) {
  console.log(prefix + this.name + suffix);
}

const user = { name: 'Ada' };
const bound = show.bind(user, 'Hi ');

bound('!');
bound.call({ name: 'Grace' }, '?');`,
        answer: "Hi Ada!\nHi Ada?",
        explanationMD:
          "`bind` stores `user` as the receiver and presets the first argument. Later `call` can provide remaining arguments, but it cannot replace the bound receiver for a normal call.",
      },
      {
        code: `function add(a, b, c) {
  console.log(this.base + a + b + c);
}

const addFromTen = add.bind({ base: 10 }, 1, 2);
addFromTen(3);`,
        answer: "16",
        explanationMD:
          "The bound function uses `base = 10`, presets `a = 1` and `b = 2`, then receives `c = 3`. The sum is `16`.",
      },
    ],
    codingExercises: [
      {
        title: "Implement myBind with apply and concatenated args",
        difficulty: "Hard",
        promptMD:
          "Implement `Function.prototype.myBind` for normal function calls. It should return a new function, preserve the chosen `thisArg`, support preset arguments, and append later arguments. Use `apply` plus concatenated arrays. As a stretch follow-up, discuss how native `bind` behaves when the bound function is called with `new`.",
        hints: [
          "`this` inside `myBind` is the original function being bound.",
          "Convert `arguments` to arrays with `Array.prototype.slice.call`.",
          "The returned function should call the original function with `apply`.",
          "Preset arguments come before later arguments.",
        ],
        solutionCode: `Function.prototype.myBind = function (thisArg) {
  const originalFn = this;
  const presetArgs = Array.prototype.slice.call(arguments, 1);

  return function () {
    const laterArgs = Array.prototype.slice.call(arguments);
    const allArgs = presetArgs.concat(laterArgs);
    return originalFn.apply(thisArg, allArgs);
  };
};

function show(prefix, suffix) {
  return prefix + this.name + suffix;
}

const user = { name: 'Ada' };
const showUser = show.myBind(user, 'Hello ');

console.log(showUser('!'));`,
        complexity: { time: "O(p + l)", space: "O(p + l)" },
        explanationMD:
          "`myBind` closes over the original function, the receiver, and any preset arguments. The returned function collects later arguments, concatenates them after the preset arguments, and uses `apply` to invoke the original function with the fixed receiver. This simplified version intentionally covers normal calls; native `bind` has additional constructor behavior.",
      },
    ],
    interviewQuestions: [
      {
        question:
          "What is the difference between `call`, `apply`, and `bind`?",
        answerMD:
          "`call` and `apply` invoke immediately with an explicit `this`; `call` takes separate arguments while `apply` takes an array-like argument list. `bind` does not invoke immediately. It returns a new function with fixed `this` for normal calls and optional preset arguments.",
        companies: ["Google", "Amazon", "Microsoft"],
      },
      {
        question:
          "How would you implement a simplified `bind`?",
        answerMD:
          "Store the original function from `this`, store preset arguments, and return a wrapper. When the wrapper is called, collect later arguments, concatenate preset and later arguments, then call `originalFn.apply(thisArg, allArgs)`. Then mention the advanced follow-up: native `bind` has special behavior when used with `new`.",
        followUps: [
          "How does native `bind` behave with `new`?",
          "Can `bind` change an arrow function's `this`?",
        ],
      },
    ],
    quiz: [
      {
        question:
          "What does `bind` return?",
        options: [
          "The immediate result of calling the original function",
          "A new function with stored receiver and optional preset arguments",
          "An array of arguments",
          "The global object",
        ],
        correctIndex: 1,
        explanationMD:
          "`bind` returns a new function. The original function is not called until the bound function is invoked.",
      },
      {
        question:
          "After `const bound = fn.bind(obj)`, what happens in `bound.call(other)` for a normal call?",
        options: [
          "`this` becomes `other`",
          "`this` remains `obj`",
          "`fn` is called with no `this`",
          "A SyntaxError is thrown",
        ],
        correctIndex: 1,
        explanationMD:
          "Bound functions use the receiver stored by `bind` for normal calls. Later `call` or `apply` cannot replace it.",
      },
    ],
    summary: [
      "`bind` returns a new function instead of invoking immediately.",
      "The bound function stores a receiver for normal calls.",
      "Bound functions can also store leading preset arguments.",
      "Later `call` or `apply` cannot replace a bound function's receiver for normal calls.",
      "A simplified `bind` polyfill uses a closure, argument concatenation, and `apply`.",
    ],
    cheatSheetMD:
      "**Syntax:** `const bound = fn.bind(thisArg, preset1)`.\n\n**Timing:** later invocation.\n\n**Receiver:** fixed for normal calls.\n\n**Arguments:** preset arguments come before later arguments.\n\n**Polyfill idea:** capture original function + receiver + preset args, return wrapper, call `originalFn.apply(thisArg, presetArgs.concat(laterArgs))`.\n\n**Caveats:** native `bind` has special `new` behavior; arrows ignore bound `this`.",
  },
];
