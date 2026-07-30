import type { Topic } from "../../types";

export const TOPICS: Topic[] = [
  {
    slug: "js-module-pattern",
    moduleId: "design-patterns",
    order: 100,
    title: "The Module Pattern",
    difficulty: "Intermediate",
    estimatedReadingMin: 11,
    estimatedPracticeMin: 14,
    tags: ["Design Patterns", "Closures", "IIFE", "Encapsulation"],
    introMD:
      "The **Module Pattern** uses functions and closures to create a private scope, then returns only the public API that other code should call. Before native ES modules became standard, this was the classic way to avoid global variables and protect internal state.\n\nIn interviews, the module pattern is a practical test of whether you truly understand closures: private variables remain alive because exported functions keep a reference to the lexical environment where those variables were created.",
    whyItMattersMD:
      "Interviewers ask this pattern because it connects three concepts at once: closures, encapsulation, and API design. A strong answer explains both the old IIFE style and the modern lesson behind it: expose a small surface area, keep implementation details private, and avoid accidental global state.",
    theoryMD:
      "### Core idea\n\nA module is an object with public methods that close over private variables. The common classic form is an **Immediately Invoked Function Expression** (IIFE): define a function, run it once, keep its local variables hidden, and return an object.\n\n### Why an IIFE creates privacy\n\nFunction scope is not accessible from the outside. When the IIFE returns, its stack frame is gone, but any inner functions that were returned still hold a closure over the variables they use. That closure is what makes private state persistent.\n\n### Revealing module variant\n\nThe **revealing module pattern** defines private functions normally, then returns an object that maps public names to selected private functions. This makes the exported API easy to scan:\n\n- private data stays in the closure,\n- private helpers are not returned,\n- public methods are listed in one place.\n\n### Modern JavaScript context\n\nNative ES modules now solve many original module-pattern problems: file-level scope, explicit imports, and explicit exports. However, ES module exports are not the same as per-instance private state. A closure-based module is still useful for interview exercises, small factories, counters, memoizers, and objects that need private mutable data without classes.\n\n### Common pitfalls\n\nDo not expose the private object itself unless callers are allowed to mutate it. Returning `items` directly from a shopping cart module breaks privacy because external code can push into it. Return copies, derived values, or narrow methods instead.",
    diagrams: [
      {
        title: "IIFE module shape",
        ascii: `global code
   |
   v
call IIFE once
   |
   +-- private variables live in the closure
   +-- private helper functions stay hidden
   |
   v
returned public API object
   |
   +-- method A closes over private state
   +-- method B closes over private state`,
        caption:
          "The caller receives only the returned API; the private lexical environment remains reachable through closures.",
      },
    ],
    codeExamples: [
      {
        title: "Classic IIFE module",
        descriptionMD:
          "The `count` variable cannot be read directly. Only the returned methods can interact with it.",
        language: "javascript",
        code: `const counterModule = (function () {
  let count = 0;

  return {
    increment: function () {
      count += 1;
      return count;
    },
    getCount: function () {
      return count;
    },
    reset: function () {
      count = 0;
    }
  };
})();

console.log(counterModule.increment());
console.log(counterModule.getCount());
console.log(counterModule.count);`,
      },
      {
        title: "Revealing module variant",
        descriptionMD:
          "Private functions are declared first. The returned object reveals only the names that should be public.",
        language: "javascript",
        code: `const userModule = (function () {
  const users = [];

  function normaliseName(name) {
    return String(name).trim().toLowerCase();
  }

  function addUser(name) {
    users.push(normaliseName(name));
  }

  function hasUser(name) {
    return users.indexOf(normaliseName(name)) !== -1;
  }

  function countUsers() {
    return users.length;
  }

  return {
    add: addUser,
    has: hasUser,
    count: countUsers
  };
})();`,
      },
    ],
    playground: [
      {
        title: "Build a private cart module",
        descriptionMD:
          "Run the snippet and notice that callers can add items and read totals, but they cannot access the private `items` array directly.",
        code: `const cartModule = (function () {
  const items = [];

  function add(name, price) {
    items.push({
      name: name,
      price: price
    });
  }

  function total() {
    return items.reduce(function (sum, item) {
      return sum + item.price;
    }, 0);
  }

  function list() {
    return items.map(function (item) {
      return item.name;
    }).join(', ');
  }

  return {
    add: add,
    total: total,
    list: list
  };
})();

cartModule.add('Notebook', 30);
cartModule.add('Pen', 5);

console.log(cartModule.list());
console.log(cartModule.total());
console.log(cartModule.items);`,
      },
    ],
    outputPredictions: [
      {
        code: `const wallet = (function () {
  let balance = 0;

  return {
    deposit: function (amount) {
      balance += amount;
      console.log(balance);
    },
    getBalance: function () {
      return balance;
    }
  };
})();

wallet.deposit(10);
wallet.balance = 100;
console.log(wallet.getBalance());
console.log(wallet.balance);`,
        answer: "10\n10\n100",
        explanationMD:
          "`balance` inside the IIFE is private closure state. Assigning `wallet.balance = 100` adds a new public property; it does not modify the private `balance` variable used by `getBalance()`.",
      },
    ],
    codingExercises: [
      {
        title: "Implement a private counter module",
        difficulty: "Medium",
        promptMD:
          "Implement `createCounterModule(initialValue)` using the module pattern. It should return an object with `increment()`, `decrement()`, `reset()`, and `getValue()`. The current value must remain private; callers should not be able to mutate it except through the public methods.",
        hints: [
          "Store the current value in a local variable inside `createCounterModule`.",
          "Return an object whose methods close over that local variable.",
          "Keep the original initial value in another private variable so `reset()` can restore it.",
        ],
        solutionCode: `function createCounterModule(initialValue) {
  let value = initialValue;
  const initial = initialValue;

  function increment() {
    value += 1;
    return value;
  }

  function decrement() {
    value -= 1;
    return value;
  }

  function reset() {
    value = initial;
    return value;
  }

  function getValue() {
    return value;
  }

  return {
    increment: increment,
    decrement: decrement,
    reset: reset,
    getValue: getValue
  };
}

const counter = createCounterModule(5);
console.log(counter.increment());
console.log(counter.decrement());
console.log(counter.reset());
console.log(counter.value);`,
        complexity: { time: "O(1) per operation", space: "O(1)" },
        explanationMD:
          "The returned methods close over `value` and `initial`, so those variables stay alive after `createCounterModule` returns. No public `value` property is exposed, which preserves encapsulation.",
      },
    ],
    interviewQuestions: [
      {
        question: "How does the module pattern create private state in JavaScript?",
        answerMD:
          "It creates a function scope, usually with an IIFE or factory function, stores state in local variables, and returns public methods that close over those variables. Outside code cannot access the local variables directly, but the public methods keep them alive through closure references.",
        companies: ["Microsoft", "Amazon", "Meta"],
        followUps: [
          "How is this different from an ES module?",
          "What is the revealing module pattern?",
        ],
      },
      {
        question: "What are the trade-offs of the module pattern compared with classes?",
        answerMD:
          "The module pattern gives strong privacy through closures and a simple public API. It is excellent for single modules or factory-created objects with private state. Compared with classes, each instance can allocate new function objects unless methods are shared carefully, and inheritance or prototype-based optimisations are less direct. Modern code often uses ES modules or classes with private fields, but closure privacy remains interview-relevant and useful.",
      },
    ],
    quiz: [
      {
        question: "What keeps private variables alive after an IIFE module has returned?",
        options: [
          "The variables become global properties",
          "Returned functions close over the lexical environment",
          "The event loop stores every local variable forever",
          "The object returned by the IIFE copies every private variable by default",
        ],
        correctIndex: 1,
        explanationMD:
          "Closures keep the referenced lexical environment reachable. The private variables are not global and are not automatically copied onto the returned object.",
      },
      {
        question: "Which statement best describes the revealing module pattern?",
        options: [
          "It exposes every private variable for debugging",
          "It defines private functions first and returns only the public names",
          "It requires `new` for every module instance",
          "It is the same thing as publishing events through a broker",
        ],
        correctIndex: 1,
        explanationMD:
          "The revealing module pattern keeps implementation details private and returns an object that deliberately reveals selected functions as the public API.",
      },
    ],
    summary: [
      "The module pattern uses closures to protect private state and expose a small public API.",
      "An IIFE runs once and returns methods that continue to reference its private lexical scope.",
      "The revealing module variant lists public methods clearly while keeping helpers private.",
      "Modern ES modules reduce the need for IIFEs, but closure-based privacy remains a core interview skill.",
    ],
    cheatSheetMD:
      "**Shape:** IIFE or factory function + private variables + returned API.\n\n**Privacy mechanism:** closure over local variables.\n\n**Revealing module:** define private functions, return selected public names.\n\n**Use for:** encapsulated counters, carts, memoizers, single-purpose services.\n\n**Avoid:** returning mutable private objects directly.",
  },
  {
    slug: "js-factory-pattern",
    moduleId: "design-patterns",
    order: 101,
    title: "The Factory Pattern",
    difficulty: "Intermediate",
    estimatedReadingMin: 10,
    estimatedPracticeMin: 14,
    tags: ["Design Patterns", "Factory Functions", "Object Creation", "Polymorphism"],
    introMD:
      "The **Factory Pattern** centralises object creation in a function. Instead of calling `new` directly throughout the codebase, callers ask a factory for an object that satisfies a contract.\n\nIn JavaScript, factories are especially natural because functions can return object literals, closures can provide private state, and the factory can choose different implementations at runtime.",
    whyItMattersMD:
      "Factory questions reveal whether you can design flexible APIs rather than just write classes. Interviewers often ask for factories when they want object creation without `new`, conditional creation based on type, or private per-object state through closures.",
    theoryMD:
      "### Core idea\n\nA factory is a function whose job is to create and return objects. The caller does not need to know the exact construction details. It only depends on the methods or properties the returned object promises to provide.\n\n### Factory function vs class constructor\n\nA class constructor is invoked with `new` and usually creates instances that share methods through a prototype. A factory is just a normal function. It can return any object, reuse cached objects, compose behaviour from smaller functions, or return different shapes based on input.\n\n### When factories are a good fit\n\nUse a factory when:\n\n- object creation has validation or defaults,\n- callers should not care which concrete implementation they receive,\n- you want closure-based private state,\n- you want to compose small behaviours instead of building an inheritance tree,\n- tests need easy dependency injection.\n\n### Trade-offs\n\nFactories are flexible, but if every call creates many new methods, memory use can be higher than prototype methods on a class. You can reduce that cost by sharing stateless helper functions outside the factory or by returning objects that delegate to shared behaviour.",
    diagrams: [
      {
        title: "Factory creates the right object",
        ascii: `caller options
     |
     v
factory function
     |
     +-- validates defaults
     +-- chooses implementation
     +-- creates private state if needed
     |
     v
object with expected public contract`,
        caption:
          "The caller depends on the returned contract, not on construction details.",
      },
    ],
    codeExamples: [
      {
        title: "A factory with private state",
        descriptionMD:
          "Each counter returned by the factory owns a separate `value` variable.",
        language: "javascript",
        code: `function createNamedCounter(name) {
  let value = 0;

  return {
    increment: function () {
      value += 1;
      return name + ':' + value;
    },
    getValue: function () {
      return value;
    }
  };
}

const alpha = createNamedCounter('alpha');
const beta = createNamedCounter('beta');

console.log(alpha.increment());
console.log(beta.increment());`,
      },
      {
        title: "Factory chooses an implementation",
        descriptionMD:
          "The caller receives an object with the same `format` method, regardless of which implementation the factory selected.",
        language: "javascript",
        code: `function createFormatter(type) {
  if (type === 'upper') {
    return {
      format: function (value) {
        return String(value).toUpperCase();
      }
    };
  }

  if (type === 'lower') {
    return {
      format: function (value) {
        return String(value).toLowerCase();
      }
    };
  }

  return {
    format: function (value) {
      return String(value);
    }
  };
}`,
      },
    ],
    playground: [
      {
        title: "Create validators without new",
        descriptionMD:
          "The factory returns different validators with the same `isValid` method, so the caller can treat them uniformly.",
        code: `function createValidator(type) {
  if (type === 'email') {
    return {
      isValid: function (value) {
        return String(value).indexOf('@') !== -1;
      }
    };
  }

  if (type === 'minLength') {
    return {
      isValid: function (value) {
        return String(value).length >= 5;
      }
    };
  }

  return {
    isValid: function () {
      return true;
    }
  };
}

const emailValidator = createValidator('email');
const nameValidator = createValidator('minLength');

console.log(emailValidator.isValid('learner@example.com'));
console.log(emailValidator.isValid('missing-at-symbol'));
console.log(nameValidator.isValid('Ada'));
console.log(nameValidator.isValid('Grace'));`,
      },
    ],
    outputPredictions: [
      {
        code: `function createCounter(label) {
  let value = 0;

  return {
    increment: function () {
      value += 1;
      console.log(label + ':' + value);
    }
  };
}

const a = createCounter('A');
const b = createCounter('B');

a.increment();
a.increment();
b.increment();`,
        answer: "A:1\nA:2\nB:1",
        explanationMD:
          "Each factory call creates a fresh `value` binding. `a` and `b` do not share private state, so `b.increment()` starts from zero even after `a` has incremented twice.",
      },
    ],
    codingExercises: [
      {
        title: "Implement a shape factory",
        difficulty: "Medium",
        promptMD:
          "Implement `createShape(type, options)` without using `new`. It should support `circle` with `radius` and `rectangle` with `width` and `height`. Each returned object must have `area()` and `describe()` methods. Throw an error for an unknown shape type.",
        hints: [
          "Branch on the `type` argument inside the factory.",
          "Return object literals with the same method names for each supported shape.",
          "Use `Math.PI * radius * radius` for the circle area.",
        ],
        solutionCode: `function createShape(type, options) {
  if (type === 'circle') {
    const radius = options.radius;

    return {
      area: function () {
        return Math.PI * radius * radius;
      },
      describe: function () {
        return 'circle radius ' + radius;
      }
    };
  }

  if (type === 'rectangle') {
    const width = options.width;
    const height = options.height;

    return {
      area: function () {
        return width * height;
      },
      describe: function () {
        return 'rectangle ' + width + 'x' + height;
      }
    };
  }

  throw new Error('Unknown shape type: ' + type);
}

const circle = createShape('circle', { radius: 2 });
const rectangle = createShape('rectangle', { width: 3, height: 4 });

console.log(circle.describe());
console.log(Math.round(circle.area()));
console.log(rectangle.describe());
console.log(rectangle.area());`,
        complexity: { time: "O(1) per creation and area call", space: "O(1)" },
        explanationMD:
          "The factory hides construction logic behind one function and returns objects with a shared public contract. The caller can call `area()` and `describe()` without knowing which concrete object shape was created.",
      },
    ],
    interviewQuestions: [
      {
        question: "When would you prefer a factory function over a class in JavaScript?",
        answerMD:
          "Prefer a factory when construction needs conditional logic, validation, defaulting, dependency injection, or closure-based private state. Factories are also useful when callers should depend on an interface rather than a specific class. Prefer classes when you need a clear prototype, inheritance with `extends`, or many instances sharing methods efficiently.",
        companies: ["Google", "Amazon", "Stripe"],
        followUps: [
          "What is the memory trade-off of returning methods from a factory?",
          "How can factories support dependency injection?",
        ],
      },
      {
        question: "Does the factory pattern require returning a new object every time?",
        answerMD:
          "No. A factory centralises creation, but it can return a new object, a cached object, a singleton, a pooled object, or different implementations based on inputs. The important idea is that callers ask the factory instead of constructing concrete objects directly.",
      },
    ],
    quiz: [
      {
        question: "What is the main purpose of a factory function?",
        options: [
          "To force every object to be created with `new`",
          "To centralise object creation behind a function",
          "To subscribe observers to a subject",
          "To make all objects immutable by default",
        ],
        correctIndex: 1,
        explanationMD:
          "A factory function hides construction details and returns an object that satisfies the expected contract.",
      },
      {
        question: "Which scenario is a strong reason to use a factory?",
        options: [
          "The object has no construction logic and only one literal is needed",
          "The creation logic must choose among multiple implementations",
          "You need direct DOM access inside the constructor",
          "You want every method to be a global function",
        ],
        correctIndex: 1,
        explanationMD:
          "Factories shine when object creation includes branching, defaults, validation, or implementation selection.",
      },
    ],
    summary: [
      "A factory is a normal function that creates and returns objects.",
      "Factories avoid exposing construction details and do not require `new`.",
      "They are useful for conditional creation, private state, composition, and dependency injection.",
      "Classes can be more memory-efficient for many instances because prototype methods are shared.",
    ],
    cheatSheetMD:
      "**Shape:** `function createThing(options) { return { ...methods }; }`\n\n**Use when:** creation has branching, validation, defaults, or private closure state.\n\n**Factory vs class:** factory is a normal function; class usually uses `new` and prototype methods.\n\n**Trade-off:** flexible creation, but repeated per-instance methods can cost memory.\n\n**Interview phrase:** callers depend on the returned contract, not on concrete construction.",
  },
  {
    slug: "js-singleton-pattern",
    moduleId: "design-patterns",
    order: 102,
    title: "The Singleton Pattern",
    difficulty: "Intermediate",
    estimatedReadingMin: 11,
    estimatedPracticeMin: 13,
    tags: ["Design Patterns", "Singleton", "Shared State", "Lazy Initialization"],
    introMD:
      "The **Singleton Pattern** ensures that a system has exactly one shared instance of something and provides a controlled way to access it. In JavaScript, this can be implemented with closure state, module-level state, or a factory that caches its first result.\n\nInterviewers expect you to implement lazy initialisation, explain why every call returns the same object, and discuss why singletons can make tests harder when they hide mutable global state.",
    whyItMattersMD:
      "Singletons appear in real applications as configuration stores, analytics clients, loggers, caches, feature-flag clients, and connection managers. The interview-grade answer is balanced: you can implement one, but you also understand the coupling and testing costs.",
    theoryMD:
      "### Core idea\n\nA singleton has one instance for the lifetime of a runtime. Instead of calling a constructor repeatedly, callers use an accessor such as `getInstance()`. The accessor creates the instance once, then returns the cached instance on future calls.\n\n### Eager vs lazy\n\n- **Eager singleton:** create the instance immediately when the module loads.\n- **Lazy singleton:** create the instance only on the first `getInstance()` call.\n\nLazy initialisation is common in interviews because it proves you can store private state in a closure and guard creation.\n\n### JavaScript-specific note\n\nES modules are evaluated once per runtime and cached by the module loader, so a module-level object can behave like a singleton. That is convenient, but it is still shared mutable state. Treat it carefully.\n\n### Pros\n\n- One source of truth for shared configuration or resources.\n- Avoids repeatedly constructing expensive objects.\n- Gives a central access point.\n\n### Cons and testing pitfalls\n\n- Hidden global state makes test order matter.\n- State can leak between tests unless you provide a reset hook or inject dependencies.\n- Consumers become tightly coupled to the singleton accessor.\n- Overuse turns ordinary state into application-wide state, which makes reasoning harder.\n\nUse singletons sparingly and prefer explicit dependency injection when code needs to be easy to test.",
    diagrams: [
      {
        title: "Lazy singleton access",
        ascii: `caller A ----+
            |
caller B ----+--> getInstance()
            |        |
caller C ----+        +-- first call creates object
                     |
                     +-- later calls return same object`,
        caption:
          "The accessor owns the cached reference and controls when the object is created.",
      },
    ],
    codeExamples: [
      {
        title: "Closure-based lazy singleton",
        descriptionMD:
          "The private `instance` variable is created once and reused.",
        language: "javascript",
        code: `const ConfigStore = (function () {
  let instance;

  function createStore() {
    const values = {};

    return {
      set: function (key, value) {
        values[key] = value;
      },
      get: function (key) {
        return values[key];
      }
    };
  }

  return {
    getInstance: function () {
      if (!instance) {
        instance = createStore();
      }

      return instance;
    }
  };
})();`,
      },
      {
        title: "Generic singleton factory",
        descriptionMD:
          "A reusable helper can turn any creation function into a lazy singleton accessor.",
        language: "javascript",
        code: `function once(createValue) {
  let created = false;
  let value;

  return function () {
    if (!created) {
      value = createValue();
      created = true;
    }

    return value;
  };
}`,
      },
    ],
    playground: [
      {
        title: "Share one logger instance",
        descriptionMD:
          "Both variables point to the same logger. Messages written through one reference are visible through the other.",
        code: `const LoggerSingleton = (function () {
  let instance;

  function createLogger() {
    const entries = [];

    return {
      log: function (message) {
        entries.push(message);
      },
      count: function () {
        return entries.length;
      },
      dump: function () {
        return entries.join(' | ');
      }
    };
  }

  return {
    getInstance: function () {
      if (!instance) {
        instance = createLogger();
      }

      return instance;
    }
  };
})();

const firstLogger = LoggerSingleton.getInstance();
const secondLogger = LoggerSingleton.getInstance();

console.log(firstLogger === secondLogger);
firstLogger.log('started');
secondLogger.log('ready');
console.log(firstLogger.count());
console.log(secondLogger.dump());`,
      },
    ],
    outputPredictions: [
      {
        code: `const registry = (function () {
  let instance;
  let createdCount = 0;

  return {
    getInstance: function () {
      if (!instance) {
        createdCount += 1;
        instance = {
          id: createdCount
        };
      }

      return instance;
    }
  };
})();

const first = registry.getInstance();
const second = registry.getInstance();

first.name = 'primary';

console.log(first === second);
console.log(second.name);
console.log(second.id);`,
        answer: "true\nprimary\n1",
        explanationMD:
          "The first call creates the object with `id: 1`. The second call returns the same reference. Mutating `first.name` is visible through `second` because both variables point to the single shared instance.",
      },
    ],
    codingExercises: [
      {
        title: "Implement a lazy singleton accessor",
        difficulty: "Medium",
        promptMD:
          "Implement `createSingleton(createValue)`. It should return a function. The returned function calls `createValue()` only the first time and returns the same value for every later call, even if the created value is falsy.",
        hints: [
          "Use a boolean flag such as `hasInstance` instead of checking whether the cached value is truthy.",
          "Store the cached value in a variable outside the returned function.",
          "Return the cached value every time after the first creation.",
        ],
        solutionCode: `function createSingleton(createValue) {
  let hasInstance = false;
  let instance;

  return function getInstance() {
    if (!hasInstance) {
      instance = createValue();
      hasInstance = true;
    }

    return instance;
  };
}

let calls = 0;
const getNumber = createSingleton(function () {
  calls += 1;
  return 0;
});

console.log(getNumber());
console.log(getNumber());
console.log(calls);`,
        complexity: { time: "O(1) per access", space: "O(1)" },
        explanationMD:
          "The boolean flag separates `created` from the truthiness of the instance. That matters because valid singleton values can be `0`, `false`, `null`, or an empty string.",
      },
    ],
    interviewQuestions: [
      {
        question: "How do you implement a singleton with lazy initialisation in JavaScript?",
        answerMD:
          "Keep a private `instance` variable in module scope or closure scope. Expose `getInstance()`. On the first call, create the object and store it in `instance`; on later calls, return the cached reference. If the created value can be falsy, track creation with a separate boolean flag.",
        companies: ["Microsoft", "Uber", "Amazon"],
        followUps: [
          "How would you reset it in tests?",
          "How do ES modules behave like singletons?",
        ],
      },
      {
        question: "Why are singletons controversial?",
        answerMD:
          "They are convenient for shared resources, but they hide global mutable state. That can create tight coupling, make test order matter, leak state between tests, and make dependencies less explicit. A strong design often injects a dependency rather than having every consumer call a global singleton accessor.",
      },
    ],
    quiz: [
      {
        question: "Why should a robust singleton accessor use a separate `created` flag?",
        options: [
          "Because object identity cannot be compared in JavaScript",
          "Because the singleton value might be falsy but still valid",
          "Because closures cannot store objects",
          "Because `new` can only be called once per file",
        ],
        correctIndex: 1,
        explanationMD:
          "Checking `if (!instance)` fails when the valid cached value is `0`, `false`, `null`, or an empty string. A separate flag tracks whether creation already happened.",
      },
      {
        question: "What is a common downside of singletons?",
        options: [
          "They prevent all mutation",
          "They make shared state implicit and can complicate testing",
          "They require a browser DOM",
          "They cannot be implemented with closures",
        ],
        correctIndex: 1,
        explanationMD:
          "Singletons often behave like hidden global state. Without reset hooks or dependency injection, tests can leak state into each other.",
      },
    ],
    summary: [
      "A singleton exposes one shared instance through a controlled access point.",
      "Lazy initialisation creates the instance on the first access and caches it afterward.",
      "JavaScript can implement singletons with closures or module-level state.",
      "Singletons are useful for shared resources but can create hidden coupling and test pollution.",
    ],
    cheatSheetMD:
      "**Shape:** private `instance` + public `getInstance()`.\n\n**Lazy:** create on first call, return cached reference later.\n\n**Robust flag:** use `created` when the instance may be falsy.\n\n**Good for:** config, logging, caches, expensive shared clients.\n\n**Risk:** hidden global mutable state; prefer dependency injection for testable code.",
  },
  {
    slug: "js-observer-pattern",
    moduleId: "design-patterns",
    order: 103,
    title: "The Observer Pattern",
    difficulty: "Intermediate",
    estimatedReadingMin: 12,
    estimatedPracticeMin: 16,
    tags: ["Design Patterns", "Observer", "Events", "State Changes"],
    introMD:
      "The **Observer Pattern** lets a subject notify a list of dependent observers when its state changes. The subject owns the observer list, and observers usually implement an `update()` method.\n\nThis is one of the most common JavaScript interview patterns because it powers UI state updates, model-view relationships, custom event systems, and reactive programming ideas.",
    whyItMattersMD:
      "Observer questions test more than syntax. A good implementation shows that you can manage subscriptions, preserve notification order, avoid mutation bugs during notification, and explain the coupling between a subject and its observers.",
    theoryMD:
      "### Core idea\n\nThe subject maintains a collection of observers. Observers subscribe to the subject. When the subject changes, it calls `notify(data)`, and the subject pushes the update to every observer.\n\n### Roles\n\n- **Subject:** owns state, stores observers, exposes `subscribe()`, `unsubscribe()`, and `notify()`.\n- **Observer:** object that reacts to updates, commonly by implementing `update(value)`.\n\n### Notification order\n\nMost simple implementations notify observers in subscription order. That detail matters in output-prediction interviews: if A subscribes before B, A is called before B.\n\n### Safe notification\n\nUse a shallow copy of the observer list before iterating. That prevents a subscription or unsubscription during notification from corrupting the current traversal.\n\n### Coupling\n\nObserver is somewhat coupled: the subject directly stores observer references and calls their `update()` method. That makes the relationship easy to trace, but subjects and observers know about each other more directly than in Publish/Subscribe.\n\n### Observer vs Pub/Sub preview\n\nObserver has no separate broker; the subject itself manages observers. Pub/Sub introduces an intermediary event bus and topic strings, so publishers and subscribers do not need direct references to each other.",
    diagrams: [
      {
        title: "Subject notifies observers",
        ascii: `            subscribe
Observer A ------------+
                       |
Observer B ------------+--> Subject observer list
                       |
Observer C ------------+

Subject state changes
       |
       v
notify(value)
       |
       +--> A.update(value)
       +--> B.update(value)
       +--> C.update(value)`,
        caption:
          "The subject directly owns the observer list and pushes updates to each observer.",
      },
    ],
    codeExamples: [
      {
        title: "Observer with update methods",
        descriptionMD:
          "The subject stores observer objects and calls `update()` when data changes.",
        language: "javascript",
        code: `function createSubject() {
  const observers = [];

  return {
    subscribe: function (observer) {
      observers.push(observer);

      return function unsubscribe() {
        const index = observers.indexOf(observer);
        if (index !== -1) {
          observers.splice(index, 1);
        }
      };
    },
    notify: function (value) {
      observers.slice().forEach(function (observer) {
        observer.update(value);
      });
    }
  };
}

const subject = createSubject();

subject.subscribe({
  update: function (value) {
    console.log('A saw ' + value);
  }
});

subject.notify('ready');`,
      },
      {
        title: "A stateful subject",
        descriptionMD:
          "Subjects often own state and notify observers only when that state changes.",
        language: "javascript",
        code: `function createTemperatureSubject(initialTemperature) {
  let temperature = initialTemperature;
  const observers = [];

  return {
    subscribe: function (observer) {
      observers.push(observer);
    },
    setTemperature: function (nextTemperature) {
      temperature = nextTemperature;

      observers.slice().forEach(function (observer) {
        observer.update(temperature);
      });
    }
  };
}`,
      },
    ],
    playground: [
      {
        title: "Notify and unsubscribe observers",
        descriptionMD:
          "Run the demo to see subscription order and the effect of unsubscribing one observer.",
        code: `function createSubject() {
  const observers = [];

  return {
    subscribe: function (observer) {
      observers.push(observer);

      return function unsubscribe() {
        const index = observers.indexOf(observer);
        if (index !== -1) {
          observers.splice(index, 1);
        }
      };
    },
    notify: function (message) {
      observers.slice().forEach(function (observer) {
        observer.update(message);
      });
    }
  };
}

const releaseSubject = createSubject();

const emailObserver = {
  update: function (message) {
    console.log('email:' + message);
  }
};

const dashboardObserver = {
  update: function (message) {
    console.log('dashboard:' + message);
  }
};

releaseSubject.subscribe(emailObserver);
const stopDashboard = releaseSubject.subscribe(dashboardObserver);

releaseSubject.notify('version 2 shipped');
stopDashboard();
releaseSubject.notify('hotfix shipped');`,
      },
    ],
    outputPredictions: [
      {
        code: `function Subject() {
  this.observers = [];
}

Subject.prototype.subscribe = function (observer) {
  this.observers.push(observer);
};

Subject.prototype.notify = function (value) {
  this.observers.forEach(function (observer) {
    observer.update(value);
  });
};

const subject = new Subject();

subject.subscribe({
  update: function (value) {
    console.log('A:' + value);
  }
});

subject.subscribe({
  update: function (value) {
    console.log('B:' + value);
  }
});

subject.subscribe({
  update: function (value) {
    console.log('C:' + value);
  }
});

subject.notify('deploy');`,
        answer: "A:deploy\nB:deploy\nC:deploy",
        explanationMD:
          "Observers are stored in the order they subscribe. `notify()` iterates that array from left to right, so A receives the update first, then B, then C.",
      },
    ],
    codingExercises: [
      {
        title: "Implement an observable value",
        difficulty: "Medium",
        promptMD:
          "Implement `createObservableValue(initialValue)`. It should return `getValue()`, `setValue(nextValue)`, and `subscribe(observer)`. Observers are objects with `update(nextValue, previousValue)`. `subscribe()` should return an unsubscribe function. Notify observers only when the value actually changes.",
        hints: [
          "Keep the current value and observers array in closure state.",
          "Use `Object.is` to compare old and new values accurately.",
          "Iterate over a copy of observers during notification.",
        ],
        solutionCode: `function createObservableValue(initialValue) {
  let value = initialValue;
  const observers = [];

  function subscribe(observer) {
    observers.push(observer);

    return function unsubscribe() {
      const index = observers.indexOf(observer);
      if (index !== -1) {
        observers.splice(index, 1);
      }
    };
  }

  function setValue(nextValue) {
    if (Object.is(value, nextValue)) {
      return;
    }

    const previousValue = value;
    value = nextValue;

    observers.slice().forEach(function (observer) {
      observer.update(value, previousValue);
    });
  }

  function getValue() {
    return value;
  }

  return {
    getValue: getValue,
    setValue: setValue,
    subscribe: subscribe
  };
}

const score = createObservableValue(0);

const unsubscribe = score.subscribe({
  update: function (next, previous) {
    console.log(previous + ' -> ' + next);
  }
});

score.setValue(1);
score.setValue(1);
unsubscribe();
score.setValue(2);`,
        complexity: {
          time: "O(n) per value change, O(1) for getValue and subscribe",
          space: "O(n)",
        },
        explanationMD:
          "`setValue()` compares the new value to the current value and notifies a copied observer list only when there is a real change. Unsubscribe removes the exact observer reference from the private array.",
      },
    ],
    interviewQuestions: [
      {
        question: "Implement the Observer Pattern and explain the responsibilities of Subject and Observer.",
        answerMD:
          "The subject owns state and an observer collection. It exposes `subscribe(observer)`, `unsubscribe(observer)` or an unsubscribe callback, and `notify(data)`. Each observer implements `update(data)`. When the subject changes, it iterates over observers and calls `update()`, usually in subscription order.",
        companies: ["Meta", "Google", "Microsoft"],
        followUps: [
          "Why copy the observer list before notifying?",
          "What happens if an observer unsubscribes itself during notification?",
        ],
      },
      {
        question: "What is the difference between Observer and Pub/Sub?",
        answerMD:
          "Observer has a direct relationship: the subject stores observer references and calls their `update()` methods. Pub/Sub introduces a broker or event bus; publishers publish messages to topic strings and subscribers listen to topics. Pub/Sub is more decoupled and supports many-to-many communication, but the flow can be harder to trace.",
      },
    ],
    quiz: [
      {
        question: "In the Observer Pattern, who usually stores the list of observers?",
        options: ["The subject", "The JavaScript engine", "A module bundler", "Each observer stores every subject"],
        correctIndex: 0,
        explanationMD:
          "The subject maintains the observer list and calls each observer when it needs to send an update.",
      },
      {
        question: "Why is `observers.slice().forEach(...)` often used during notification?",
        options: [
          "To convert observers into strings",
          "To prevent list mutation during notification from corrupting the current iteration",
          "To make notifications asynchronous",
          "To sort observers alphabetically",
        ],
        correctIndex: 1,
        explanationMD:
          "Iterating over a shallow copy makes notification stable even if observers subscribe or unsubscribe while updates are being delivered.",
      },
    ],
    summary: [
      "Observer lets a subject push state changes to subscribed observers.",
      "Observers commonly implement an `update()` method.",
      "Simple implementations notify in subscription order.",
      "The subject directly owns observer references, making Observer more coupled than Pub/Sub.",
    ],
    cheatSheetMD:
      "**Roles:** Subject stores observers; Observer implements `update()`.\n\n**Core methods:** `subscribe`, `unsubscribe`, `notify`.\n\n**Order:** usually subscription order.\n\n**Safety:** notify over a copied list.\n\n**Observer vs Pub/Sub:** Observer is direct subject-to-observer; Pub/Sub uses an event broker and topic strings.",
  },
  {
    slug: "js-pubsub-pattern",
    moduleId: "design-patterns",
    order: 104,
    title: "The Publish/Subscribe Pattern",
    difficulty: "Intermediate",
    estimatedReadingMin: 12,
    estimatedPracticeMin: 16,
    tags: ["Design Patterns", "Pub/Sub", "Event Bus", "Decoupling"],
    introMD:
      "The **Publish/Subscribe Pattern** routes messages through an intermediary broker, often called an event bus. Publishers send messages to topic strings; subscribers register handlers for topics. Publishers and subscribers do not need direct references to each other.\n\nThis pattern is interview-famous because it is simple to implement, easy to extend, and gives a clean comparison point against the Observer Pattern.",
    whyItMattersMD:
      "Pub/Sub appears in front-end event buses, analytics pipelines, notification systems, WebSocket message routing, and distributed systems. In JavaScript interviews, candidates are often asked to implement `subscribe`, `publish`, and `unsubscribe` with correct handler order and cleanup.",
    theoryMD:
      "### Core idea\n\nA broker stores a mapping from topic names to subscriber handlers. A publisher calls `publish(topic, payload)`. The broker looks up handlers for that topic and invokes them with the payload.\n\n### Roles\n\n- **Publisher:** emits a message to a topic.\n- **Subscriber:** registers a handler for a topic.\n- **Broker or event bus:** stores topic subscriptions and dispatches messages.\n\n### Why it is more decoupled than Observer\n\nIn Observer, the subject owns observer references and directly calls `observer.update()`. In Pub/Sub, the publisher only knows a topic name and the broker. Subscribers also only know the broker and topic name. This means publishers and subscribers can be added, removed, tested, or moved independently.\n\n### Costs of loose coupling\n\nLoose coupling can make flow harder to debug. Topic strings can be misspelled, event payload contracts can drift, and it may be unclear who is listening. Production systems often add constants, typed events, logging, or schema validation to reduce those risks.\n\n### Interview implementation checklist\n\nA solid Pub/Sub implementation should:\n\n1. store handlers per topic,\n2. return an unsubscribe function from `subscribe()`,\n3. preserve subscription order during `publish()`,\n4. copy the handler list before publishing so unsubscription during delivery is safe,\n5. handle topics with no subscribers gracefully.",
    diagrams: [
      {
        title: "Pub/Sub with an event broker",
        ascii: `Publisher A
    |
    v
publish topic order.created
    |
    v
Event broker
    |
    +--> subscriber 1 for order.created
    +--> subscriber 2 for order.created

Publisher and subscribers do not reference each other directly`,
        caption:
          "The broker is the intermediary that decouples message producers from message consumers.",
      },
    ],
    codeExamples: [
      {
        title: "Minimal event bus",
        descriptionMD:
          "A topic map stores handlers by event name. `subscribe()` returns an unsubscribe function.",
        language: "javascript",
        code: `function createEventBus() {
  const topics = Object.create(null);

  return {
    subscribe: function (topic, handler) {
      if (!topics[topic]) {
        topics[topic] = [];
      }

      topics[topic].push(handler);

      return function unsubscribe() {
        const handlers = topics[topic];
        if (!handlers) {
          return;
        }

        const index = handlers.indexOf(handler);
        if (index !== -1) {
          handlers.splice(index, 1);
        }
      };
    },
    publish: function (topic, payload) {
      const handlers = topics[topic] || [];

      handlers.slice().forEach(function (handler) {
        handler(payload);
      });
    }
  };
}`,
      },
      {
        title: "Same topic, multiple subscribers",
        descriptionMD:
          "The publisher does not know whether there are zero, one, or many subscribers.",
        language: "javascript",
        code: `const bus = createEventBus();

bus.subscribe('user.created', function (user) {
  console.log('send welcome email to ' + user.email);
});

bus.subscribe('user.created', function (user) {
  console.log('track signup for ' + user.id);
});

bus.publish('user.created', {
  id: 7,
  email: 'ada@example.com'
});`,
      },
    ],
    playground: [
      {
        title: "Publish orders through a broker",
        descriptionMD:
          "The checkout code publishes one topic. Audit and email subscribers react without the publisher knowing about either subscriber.",
        code: `function createEventBus() {
  const topics = Object.create(null);

  return {
    subscribe: function (topic, handler) {
      if (!topics[topic]) {
        topics[topic] = [];
      }

      topics[topic].push(handler);

      return function unsubscribe() {
        const handlers = topics[topic];
        if (!handlers) {
          return;
        }

        const index = handlers.indexOf(handler);
        if (index !== -1) {
          handlers.splice(index, 1);
        }
      };
    },
    publish: function (topic, payload) {
      const handlers = topics[topic] || [];

      handlers.slice().forEach(function (handler) {
        handler(payload);
      });
    }
  };
}

const bus = createEventBus();

const stopAudit = bus.subscribe('order.created', function (order) {
  console.log('audit order ' + order.id);
});

bus.subscribe('order.created', function (order) {
  console.log('email total ' + order.total);
});

bus.publish('order.created', {
  id: 42,
  total: 99
});

stopAudit();

bus.publish('order.created', {
  id: 43,
  total: 49
});`,
      },
    ],
    outputPredictions: [
      {
        code: `function createBus() {
  const topics = {};

  return {
    subscribe: function (topic, handler) {
      if (!topics[topic]) {
        topics[topic] = [];
      }

      topics[topic].push(handler);

      return function () {
        const index = topics[topic].indexOf(handler);
        if (index !== -1) {
          topics[topic].splice(index, 1);
        }
      };
    },
    publish: function (topic, payload) {
      const handlers = topics[topic] || [];
      handlers.slice().forEach(function (handler) {
        handler(payload);
      });
    }
  };
}

const bus = createBus();

bus.subscribe('score', function (value) {
  console.log('first:' + value);
});

const stopSecond = bus.subscribe('score', function (value) {
  console.log('second:' + value);
});

bus.publish('score', 10);
stopSecond();
bus.publish('score', 20);`,
        answer: "first:10\nsecond:10\nfirst:20",
        explanationMD:
          "The first publish calls both handlers in subscription order. After `stopSecond()` removes the second handler, the next publish reaches only the first handler.",
      },
    ],
    codingExercises: [
      {
        title: "Implement a topic-based Pub/Sub broker",
        difficulty: "Medium",
        promptMD:
          "Implement `createPubSub()` with `subscribe(topic, handler)` and `publish(topic, payload)`. `subscribe()` must return an unsubscribe function. `publish()` should call handlers for that topic in subscription order and do nothing for unknown topics.",
        hints: [
          "Use an object or `Map` from topic names to arrays of handlers.",
          "Create the topic array lazily inside `subscribe()`.",
          "Use a shallow copy of the handlers array inside `publish()`.",
        ],
        solutionCode: `function createPubSub() {
  const topics = Object.create(null);

  function subscribe(topic, handler) {
    if (!topics[topic]) {
      topics[topic] = [];
    }

    topics[topic].push(handler);

    return function unsubscribe() {
      const handlers = topics[topic];
      if (!handlers) {
        return;
      }

      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }

      if (handlers.length === 0) {
        delete topics[topic];
      }
    };
  }

  function publish(topic, payload) {
    const handlers = topics[topic];
    if (!handlers) {
      return;
    }

    handlers.slice().forEach(function (handler) {
      handler(payload);
    });
  }

  return {
    subscribe: subscribe,
    publish: publish
  };
}

const pubsub = createPubSub();

const unsubscribe = pubsub.subscribe('cart.updated', function (cart) {
  console.log('items:' + cart.items);
});

pubsub.publish('cart.updated', {
  items: 3
});

unsubscribe();

pubsub.publish('cart.updated', {
  items: 4
});`,
        complexity: {
          time: "O(1) subscribe, O(n) publish for n subscribers on the topic",
          space: "O(t + h) for topics and handlers",
        },
        explanationMD:
          "The broker owns a topic-to-handlers registry. Publishing looks up only the requested topic, copies the handler list for safe iteration, and calls each handler in order. Unknown topics simply have no handlers to call.",
      },
    ],
    interviewQuestions: [
      {
        question: "Implement Publish/Subscribe and explain how it differs from Observer.",
        answerMD:
          "Pub/Sub stores handlers in a broker keyed by topic names. `subscribe(topic, handler)` registers a handler and returns an unsubscribe function; `publish(topic, payload)` asks the broker to invoke handlers for that topic. Observer is more direct: a subject stores observer objects and calls `update()` on them. Pub/Sub adds an intermediary, so publishers and subscribers are more loosely coupled and can communicate many-to-many through topics.",
        companies: ["Netflix", "Meta", "Amazon"],
        followUps: [
          "How would you avoid typo-prone topic strings?",
          "How should errors in one subscriber affect the others?",
        ],
      },
      {
        question: "What are the disadvantages of Pub/Sub?",
        answerMD:
          "The same decoupling that makes Pub/Sub flexible can make it hard to debug. Event flow is indirect, topic names can drift, payload contracts can become unclear, and unused subscriptions can leak memory. Strong systems add naming constants, schemas or TypeScript types, logging, and disciplined cleanup.",
      },
    ],
    quiz: [
      {
        question: "What extra component does Pub/Sub add compared with Observer?",
        options: [
          "A prototype chain",
          "An event broker or bus",
          "A DOM event target",
          "A class constructor",
        ],
        correctIndex: 1,
        explanationMD:
          "Pub/Sub routes messages through a broker. Observer usually has the subject directly store and notify observers.",
      },
      {
        question: "Why should `publish()` iterate over a copy of the handler list?",
        options: [
          "So a handler can unsubscribe during delivery without breaking the current publish",
          "So all events become asynchronous",
          "So topic names are converted to numbers",
          "So handlers are called in random order",
        ],
        correctIndex: 0,
        explanationMD:
          "A copied list gives stable delivery for the current publish even if handlers unsubscribe or new handlers subscribe while the event is being dispatched.",
      },
    ],
    summary: [
      "Pub/Sub uses a broker that maps topic strings to subscriber handlers.",
      "Publishers and subscribers do not reference each other directly.",
      "`subscribe()` should return an unsubscribe function to prevent leaks.",
      "Compared with Observer, Pub/Sub is more decoupled but can be harder to trace and validate.",
    ],
    cheatSheetMD:
      "**Roles:** publisher emits, subscriber handles, broker routes.\n\n**Core methods:** `subscribe(topic, handler)`, `publish(topic, payload)`, unsubscribe callback.\n\n**Data structure:** topic name -> handlers array.\n\n**Observer vs Pub/Sub:** Observer = subject directly calls observers. Pub/Sub = broker + topic strings + looser coupling.\n\n**Risks:** typo-prone topics, hidden flow, payload drift, forgotten unsubscriptions.",
  },
];
