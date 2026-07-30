import type { Topic } from "../../types";

export const TOPICS: Topic[] = [
  {
    slug: "js-objects",
    moduleId: "objects-prototypes",
    order: 42,
    title: "Objects",
    difficulty: "Beginner",
    estimatedReadingMin: 8,
    estimatedPracticeMin: 5,
    tags: ["Objects", "Properties", "References", "Fundamentals"],
    introMD: "Objects are JavaScript's primary way to group data and behaviour. An object is a dynamic collection of properties, where each property key maps to a value, and values can be primitives, arrays, functions, or other objects.\n\nInterviews use objects to test much more than syntax: reference identity, dot vs bracket access, own vs inherited properties, property enumeration, and how the prototype system starts to participate in a lookup.",
    whyItMattersMD: "Almost every non-trivial JavaScript value you work with is an object or behaves like one: arrays, functions, dates, maps, class instances, errors, and plain records. A precise object mental model prevents common bugs such as accidentally mutating shared state, checking inherited properties as if they were own data, or assuming object equality compares structure.",
    theoryMD: "### Object literals\n\nThe most common way to create an object is an object literal: `{ name: 'Ada', score: 10 }`. Each entry creates a property. Property keys are strings or symbols; numeric-looking keys are converted to strings.\n\n### Dot access vs bracket access\n\nUse dot access when the property name is a valid identifier and known at author time: `user.name`. Use bracket access when the key is dynamic, contains punctuation, starts with a number, or is a symbol: `user[key]` or `user['current-role']`.\n\n### Objects are reference values\n\nAssigning an object to another variable copies the reference, not the object itself. If `const a = { count: 1 }; const b = a;`, then `a` and `b` point at the same object. Mutating `b.count` also changes what `a.count` reads.\n\n### Own properties vs inherited properties\n\nAn object can have its own properties and also see properties through its prototype chain. The `in` operator checks both own and inherited properties. `Object.hasOwn(obj, key)` or `Object.prototype.hasOwnProperty.call(obj, key)` checks only the object itself.\n\n### Enumeration order in practice\n\n`Object.keys`, `Object.values`, and `Object.entries` return own enumerable string-keyed properties. Modern JavaScript has a specified order: array-index keys first in numeric order, then other string keys in insertion order, then symbols for APIs that include symbols. Interview snippets usually depend only on simple insertion order for normal string keys.\n\n### Object equality\n\nObjects compare by identity, not by shape. `{ a: 1 } === { a: 1 }` is `false` because those are two different objects in memory.",
    diagrams: [
      {
        title: "Object property lookup starts locally",
        ascii: `user object
+---------------------+
| own name  -> 'Ada'  |
| own score -> 10     |
+---------------------+
          |
          v
prototype object
+---------------------+
| inherited toString  |
+---------------------+`,
        caption: "A read checks own properties first, then walks to the prototype if needed.",
      },
    ],
    codeExamples: [
      {
        title: "Dot access, bracket access, and dynamic keys",
        descriptionMD: "Dot access is concise for known identifier-like keys. Bracket access is required for dynamic or non-identifier keys.",
        language: "javascript",
        code: `const user = {
  id: 101,
  name: 'Ada',
  'current-role': 'Engineer'
};

const key = 'name';

console.log(user.name);              // Ada
console.log(user[key]);              // Ada
console.log(user['current-role']);   // Engineer`,
      },
      {
        title: "Reference identity, not structural equality",
        descriptionMD: "Two object literals with the same properties are still different objects. Two variables can also point at the same object.",
        language: "javascript",
        code: `const first = { count: 1 };
const second = { count: 1 };
const alias = first;

alias.count = 2;

console.log(first === second); // false
console.log(first === alias);  // true
console.log(first.count);      // 2`,
      },
    ],
    playground: [
      {
        title: "Explore own and inherited properties",
        descriptionMD: "Run this to see the difference between a key that exists anywhere in the lookup path and a key owned directly by the object.",
        code: `const user = { name: 'Ada', score: 10 };
const field = 'score';

user[field] = user[field] + 5;

console.log(user.name + ':' + user.score);
console.log('toString' in user);
console.log(Object.prototype.hasOwnProperty.call(user, 'toString'));`,
      },
    ],
    outputPredictions: [
      {
        code: `const user = { name: 'Ada' };
const key = 'name';

user[key] = 'Grace';
user.role = 'Engineer';

console.log(user.name);
console.log('role' in user);
console.log(Object.keys(user).join(','));`,
        answer: "Grace\ntrue\nname,role",
        explanationMD: "`key` contains the string `name`, so `user[key]` updates the same property as `user.name`. `role` is then added as an own enumerable property, so `Object.keys` returns `name,role` in insertion order.",
      },
      {
        code: `const parent = { role: 'admin' };
const child = Object.create(parent);
child.name = 'Sam';

console.log(child.role);
console.log(Object.prototype.hasOwnProperty.call(child, 'role'));
console.log('role' in child);`,
        answer: "admin\nfalse\ntrue",
        explanationMD: "`role` is not an own property of `child`; it is found on `parent` through the prototype chain. `hasOwnProperty` reports `false`, while the `in` operator reports `true` because it includes inherited properties.",
      },
    ],
    codingExercises: [
      {
        title: "Count only own enumerable properties",
        difficulty: "Easy",
        promptMD: "Implement `countOwnEnumerable(obj)` so it returns the number of own enumerable string-keyed properties on `obj`. It must not count inherited properties.",
        hints: [
          "`for...in` walks inherited enumerable properties too, so it needs an own-property guard.",
          "`Object.keys` already returns only own enumerable string keys.",
          "Symbols are intentionally out of scope for this exercise.",
        ],
        solutionCode: `function countOwnEnumerable(obj) {
  return Object.keys(obj).length;
}

const base = { inherited: true };
const item = Object.create(base);
item.name = 'Ada';
item.score = 10;

console.log(countOwnEnumerable(item));`,
        complexity: { time: "O(n)", space: "O(n)" },
        explanationMD: "`Object.keys` visits only own enumerable string-keyed properties, so inherited `base.inherited` is ignored. The array of keys is why the auxiliary space is `O(n)`.",
      },
    ],
    interviewQuestions: [
      {
        question: "How do dot access and bracket access differ?",
        answerMD: "Dot access requires a property name that is a valid identifier and known in the source code, such as `user.name`. Bracket access evaluates an expression to get the key, so it supports dynamic keys, keys with punctuation, numeric-looking keys, and symbols: `user[key]`, `user['current-role']`, or `user[symbolKey]`.",
        companies: ["Amazon", "Microsoft"],
        followUps: ["When would `obj.key` be wrong if you have a variable named `key`?", "How do symbols change property access?"],
      },
      {
        question: "What is the difference between `in` and `hasOwnProperty`?",
        answerMD: "The `in` operator checks whether a property can be found anywhere on the object or its prototype chain. `hasOwnProperty` checks only direct properties. In modern code, `Object.hasOwn(obj, key)` is often clearer and safer because it works even if the object has no normal prototype.",
        companies: ["Google", "Meta"],
      },
    ],
    quiz: [
      {
        question: "What does `{ a: 1 } === { a: 1 }` evaluate to?",
        options: ["`true`, because both objects have the same shape", "`false`, because object equality compares identity", "`true`, because object literals are interned", "It throws a TypeError"],
        correctIndex: 1,
        explanationMD: "Objects compare by reference identity. Two separate object literals create two different objects, even if their properties match exactly.",
      },
      {
        question: "Which API returns only own enumerable string-keyed properties?",
        options: ["`Object.keys(obj)`", "`key in obj`", "`Object.getPrototypeOf(obj)`", "`obj.__proto__`"],
        correctIndex: 0,
        explanationMD: "`Object.keys` returns own enumerable string-keyed properties. The `in` operator includes inherited properties, while the other options inspect prototypes.",
      },
    ],
    summary: [
      "Objects are dynamic collections of string or symbol keyed properties.",
      "Dot access is for known identifier-like keys; bracket access is for dynamic or unusual keys.",
      "Objects compare by reference identity, not by structural equality.",
      "Own-property checks are different from prototype-chain checks.",
    ],
    cheatSheetMD: "**Create:** `{ name: 'Ada' }`\n\n**Read/write:** `obj.name`, `obj[key]`\n\n**Own keys:** `Object.keys`, `Object.values`, `Object.entries`\n\n**Own check:** `Object.hasOwn(obj, key)` or `Object.prototype.hasOwnProperty.call(obj, key)`\n\n**Prototype-aware check:** `key in obj`\n\n**Equality:** objects compare by identity, not by shape.",
  },  {
    slug: "js-property-descriptors",
    moduleId: "objects-prototypes",
    order: 43,
    title: "Property Descriptors",
    difficulty: "Intermediate",
    estimatedReadingMin: 10,
    estimatedPracticeMin: 7,
    tags: ["Descriptors", "defineProperty", "Getters", "Setters", "Enumerability"],
    introMD: "Every JavaScript property has metadata, not just a value. A **property descriptor** tells the engine whether a property can be reassigned, enumerated, reconfigured, read through a getter, or written through a setter.\n\nThis topic turns object properties from a surface-level syntax feature into an internals model you can use to explain `Object.freeze`, `Object.seal`, getters, non-enumerable fields, and many interview traps.",
    whyItMattersMD: "Descriptors are the hidden control panel behind object APIs. Interviewers use them to test whether you know why `Object.keys` skips some properties, why assignment to a read-only property may fail, and how frameworks expose computed values without storing them directly.",
    theoryMD: "### Data descriptors\n\nA data property has a `value` and descriptor flags:\n\n| Flag | Meaning | Default in `defineProperty` |\n| --- | --- | --- |\n| `writable` | Can assignment change the value? | `false` |\n| `enumerable` | Does it appear in `Object.keys` and `for...in`? | `false` |\n| `configurable` | Can the descriptor be changed or the property deleted? | `false` |\n\nObject literal properties are usually writable, enumerable, and configurable. `Object.defineProperty` is intentionally stricter: omitted flags default to `false`.\n\n### Accessor descriptors\n\nAn accessor property has `get` and/or `set` functions instead of `value` and `writable`. Reading calls the getter. Assigning calls the setter. A descriptor cannot be both a data descriptor and an accessor descriptor.\n\n### Configurable is the strongest lock\n\nIf `configurable: false`, you generally cannot delete the property or change its descriptor shape. Some narrow changes are allowed, such as changing `writable` from `true` to `false`, but not back to `true`.\n\n### Strict mode vs sloppy mode\n\nWriting to a non-writable property throws in strict mode and is silently ignored in sloppy mode. Interview answers should mention both behaviours when the snippet depends on assignment failure. Safer runtime APIs such as `Reflect.defineProperty` return `false` instead of relying on mode-dependent assignment behaviour.\n\n### Inspecting descriptors\n\nUse `Object.getOwnPropertyDescriptor(obj, key)` for one property and `Object.getOwnPropertyDescriptors(obj)` for all own properties. This is essential when cloning objects without losing getters, setters, or enumerability flags.",
    diagrams: [
      {
        title: "Two descriptor families",
        ascii: `Property descriptor
        |
        +-- data:     value + writable + enumerable + configurable
        |
        +-- accessor: get + set + enumerable + configurable`,
        caption: "A property is either data-backed or accessor-backed, never both at the same time.",
      },
    ],
    codeExamples: [
      {
        title: "Define a non-enumerable read-only property",
        descriptionMD: "Omitted descriptor flags default to `false`, which is different from an object literal.",
        language: "javascript",
        code: `const account = {};

Object.defineProperty(account, 'id', {
  value: 7
});

account.name = 'Ada';

console.log(account.id);                // 7
console.log(Object.keys(account));      // ['name']
console.log(Object.getOwnPropertyDescriptor(account, 'id').writable); // false`,
      },
      {
        title: "Getter and setter descriptors",
        descriptionMD: "Accessor properties compute their value through functions. They are useful for validation, derived values, and lazy calculation.",
        language: "javascript",
        code: `const meter = { raw: 0 };

Object.defineProperty(meter, 'value', {
  get: function () {
    return this.raw;
  },
  set: function (next) {
    if (next < 0) {
      throw new RangeError('value must be positive');
    }
    this.raw = next;
  },
  enumerable: true,
  configurable: true
});

meter.value = 5;
console.log(meter.value); // 5`,
      },
    ],
    playground: [
      {
        title: "Inspect descriptor defaults",
        descriptionMD: "Notice how `id` exists but does not appear in `Object.keys` because `enumerable` defaults to `false`.",
        code: `const user = {};

Object.defineProperty(user, 'id', {
  value: 123
});

user.name = 'Ada';

const descriptor = Object.getOwnPropertyDescriptor(user, 'id');

console.log(Object.keys(user).join(','));
console.log(descriptor.writable);
console.log(descriptor.enumerable);
console.log(descriptor.configurable);`,
      },
    ],
    outputPredictions: [
      {
        code: `const obj = {};

Object.defineProperty(obj, 'x', {
  value: 1
});

console.log(Object.keys(obj).length);
console.log(obj.x);
console.log(Object.getOwnPropertyDescriptor(obj, 'x').writable);`,
        answer: "0\n1\nfalse",
        explanationMD: "`Object.defineProperty` creates omitted flags as `false`. The property exists and reads as `1`, but it is non-enumerable and non-writable.",
      },
      {
        code: `let writes = 0;
const obj = {};

Object.defineProperty(obj, 'value', {
  get: function () {
    return writes * 2;
  },
  set: function (next) {
    writes = next;
  },
  enumerable: true
});

obj.value = 5;
console.log(obj.value);
console.log(Object.keys(obj).join(','));`,
        answer: "10\nvalue",
        explanationMD: "Assignment calls the setter, storing `5` in `writes`. Reading calls the getter, which returns `writes * 2`, so the first log is `10`. The property is enumerable, so it appears in `Object.keys`.",
      },
    ],
    codingExercises: [
      {
        title: "Create a hidden immutable id",
        difficulty: "Medium",
        promptMD: "Implement `attachId(obj, id)` so it adds an `id` property that can be read, does not appear in `Object.keys`, cannot be reassigned, and cannot be deleted or reconfigured.",
        hints: [
          "Use `Object.defineProperty` rather than direct assignment.",
          "The defaults for `writable`, `enumerable`, and `configurable` are already `false`.",
          "Return the original object so calls can be chained.",
        ],
        solutionCode: `function attachId(obj, id) {
  Object.defineProperty(obj, 'id', {
    value: id
  });

  return obj;
}

const user = attachId({ name: 'Ada' }, 101);

console.log(user.id);
console.log(Object.keys(user).join(','));
console.log(Object.getOwnPropertyDescriptor(user, 'id').configurable);`,
        complexity: { time: "O(1)", space: "O(1)" },
        explanationMD: "The omitted descriptor flags default to `false`, so `id` is non-writable, non-enumerable, and non-configurable. Direct assignment would have created a normal enumerable writable property instead.",
      },
    ],
    interviewQuestions: [
      {
        question: "What are `writable`, `enumerable`, and `configurable`?",
        answerMD: "`writable` controls whether assignment can change a data property's value. `enumerable` controls whether the property appears in APIs such as `Object.keys` and `for...in`. `configurable` controls whether the property can be deleted or have its descriptor changed. With `Object.defineProperty`, omitted flags default to `false`.",
        companies: ["Google", "Microsoft", "Amazon"],
        followUps: ["Can a non-configurable property ever be changed?", "How does strict mode affect writes to non-writable properties?"],
      },
      {
        question: "How are getter/setter properties different from normal value properties?",
        answerMD: "Getter/setter properties are accessor descriptors. They do not store a `value` or have a `writable` flag. Reading the property calls `get`; assigning calls `set`. A descriptor cannot combine `value` with `get` or `set`.",
        companies: ["Meta", "Netflix"],
      },
    ],
    quiz: [
      {
        question: "What is the default value of `enumerable` when omitted in `Object.defineProperty`?",
        options: ["`true`", "`false`", "It copies from the prototype", "It depends on strict mode"],
        correctIndex: 1,
        explanationMD: "For `Object.defineProperty`, omitted descriptor flags default to `false`. Object literal properties are the common case where properties are enumerable by default.",
      },
      {
        question: "Which descriptor shape is invalid?",
        options: ["`{ value: 1, writable: true }`", "`{ get() { return 1; } }`", "`{ set(v) {} }`", "`{ value: 1, get() { return 1; } }`"],
        correctIndex: 3,
        explanationMD: "A descriptor cannot be both a data descriptor and an accessor descriptor. `value` cannot be combined with `get` or `set`.",
      },
    ],
    summary: [
      "Property descriptors describe both the value mechanism and metadata flags of a property.",
      "`Object.defineProperty` defaults omitted flags to `false`.",
      "Data descriptors use `value` and `writable`; accessor descriptors use `get` and `set`.",
      "`configurable: false` prevents deletion and most descriptor changes.",
    ],
    cheatSheetMD: "**Inspect one:** `Object.getOwnPropertyDescriptor(obj, key)`\n\n**Inspect all:** `Object.getOwnPropertyDescriptors(obj)`\n\n**Data descriptor:** `value`, `writable`, `enumerable`, `configurable`\n\n**Accessor descriptor:** `get`, `set`, `enumerable`, `configurable`\n\n**defineProperty defaults:** `writable: false`, `enumerable: false`, `configurable: false`.",
  },  {
    slug: "js-object-freeze",
    moduleId: "objects-prototypes",
    order: 44,
    title: "Object.freeze",
    difficulty: "Intermediate",
    estimatedReadingMin: 9,
    estimatedPracticeMin: 6,
    tags: ["Object.freeze", "Immutability", "Descriptors", "Shallow"],
    introMD: "`Object.freeze(obj)` is JavaScript's built-in way to make an object's top-level shape and top-level data properties immutable. It prevents new properties, prevents deleting or reconfiguring existing properties, and makes existing data properties non-writable.\n\nThe key interview phrase is **shallow freeze**: nested objects are still mutable unless they are frozen too.",
    whyItMattersMD: "`Object.freeze` appears in state-management discussions, library API design, and output-prediction questions. Knowing the exact descriptor changes helps you avoid the common but wrong answer that `freeze` makes a whole object graph deeply immutable.",
    theoryMD: "### What `Object.freeze` does\n\nFreezing an object performs three top-level operations:\n\n1. Prevents extensions, so new own properties cannot be added.\n2. Marks existing own properties as `configurable: false`, so they cannot be deleted or reconfigured.\n3. For existing data properties, marks `writable: false`, so assignment cannot change their values.\n\n### What it does not do\n\nIt does not recursively freeze nested objects. If a frozen object has a property whose value is another object, that nested object can still be changed unless it is also frozen. It also does not make private engine internals disappear, and accessor properties may still compute changing values if their getter reads mutable external state.\n\n### Strict mode caveat\n\nAttempting to write to a frozen data property throws in strict mode and is ignored in sloppy mode. Use descriptor inspection, `Object.isFrozen`, or `Reflect.defineProperty` examples when you need output that is independent of strict-mode configuration.\n\n### Freeze vs const\n\n`const` protects a variable binding. `Object.freeze` protects an object's top-level own properties. They solve different problems and are often used together: `const config = Object.freeze({ mode: 'prod' })`.\n\n### When to use it\n\nFreeze is useful for constants, configuration objects, defensive library boundaries, and teaching immutability. It is not a complete replacement for immutable data structures or disciplined copy-on-write updates in large state trees.",
    diagrams: [
      {
        title: "Freeze is shallow",
        ascii: `frozen config
+------------------------------+
| theme: 'dark'                |  locked top-level data property
| nested: -------------------- | ----+
+------------------------------+     |
                                      v
                              nested object
                              +------------------+
                              | compact: false   |  still mutable
                              +------------------+`,
        caption: "The outer object is frozen; the nested object is a separate object with its own descriptors.",
      },
    ],
    codeExamples: [
      {
        title: "Inspect what freeze changes",
        descriptionMD: "A frozen object's data properties become non-writable and non-configurable, and the object becomes non-extensible.",
        language: "javascript",
        code: `const settings = Object.freeze({ mode: 'prod' });
const descriptor = Object.getOwnPropertyDescriptor(settings, 'mode');

console.log(Object.isExtensible(settings)); // false
console.log(descriptor.writable);           // false
console.log(descriptor.configurable);       // false
console.log(Object.isFrozen(settings));     // true`,
      },
      {
        title: "Nested objects are not frozen automatically",
        descriptionMD: "The reference stored in `settings.nested` is locked at the top level, but the nested object itself remains mutable.",
        language: "javascript",
        code: `const settings = Object.freeze({
  nested: { compact: false }
});

settings.nested.compact = true;

console.log(settings.nested.compact);       // true
console.log(Object.isFrozen(settings));     // true
console.log(Object.isFrozen(settings.nested)); // false`,
      },
    ],
    playground: [
      {
        title: "Shallow freeze in action",
        descriptionMD: "The outer object is frozen, but the nested object remains mutable because it has not been frozen separately.",
        code: `const config = Object.freeze({
  theme: 'dark',
  nested: { compact: false }
});

config.nested.compact = true;

console.log(Object.isFrozen(config));
console.log(config.nested.compact);
console.log(Object.isFrozen(config.nested));`,
      },
    ],
    outputPredictions: [
      {
        code: `const inner = { count: 0 };
const frozen = Object.freeze({ inner: inner });

inner.count += 1;
frozen.inner.count += 1;

console.log(frozen.inner.count);
console.log(Object.isFrozen(frozen));
console.log(Object.isFrozen(frozen.inner));`,
        answer: "2\ntrue\nfalse",
        explanationMD: "Only the outer object is frozen. The `inner` object remains mutable, and both references point to that same nested object, so the count becomes `2`.",
      },
      {
        code: `const obj = Object.freeze({ a: 1 });
const added = Reflect.defineProperty(obj, 'b', {
  value: 2
});

console.log(added);
console.log(Object.keys(obj).join(','));
console.log(Object.getOwnPropertyDescriptor(obj, 'a').writable);`,
        answer: "false\na\nfalse",
        explanationMD: "A frozen object is non-extensible, so `Reflect.defineProperty` cannot add `b` and returns `false`. Existing data property `a` is non-writable.",
      },
    ],
    codingExercises: [
      {
        title: "Write a simple deepFreeze",
        difficulty: "Medium",
        promptMD: "Implement `deepFreeze(value)` for plain acyclic objects and arrays. It should recursively freeze nested objects before returning the original value.",
        hints: [
          "Skip `null` and primitive values.",
          "Call `Object.freeze` on the current object.",
          "Recurse through `Object.keys` for this simplified version.",
        ],
        solutionCode: `function deepFreeze(value) {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  Object.keys(value).forEach(function (key) {
    deepFreeze(value[key]);
  });

  return Object.freeze(value);
}

const state = deepFreeze({ user: { name: 'Ada' } });

console.log(Object.isFrozen(state));
console.log(Object.isFrozen(state.user));`,
        complexity: { time: "O(n)", space: "O(d)" },
        explanationMD: "The function visits each reachable own enumerable property once, so time is linear in the number of visited objects and properties. Recursion depth `d` determines call-stack usage. Production-grade versions also handle cycles, symbols, maps, sets, and functions deliberately.",
      },
    ],
    interviewQuestions: [
      {
        question: "What exactly does `Object.freeze` do?",
        answerMD: "It prevents extensions, marks existing own properties as non-configurable, and marks existing data properties as non-writable. It is shallow: nested objects are not frozen automatically. Writes to frozen data properties throw in strict mode and are ignored in sloppy mode.",
        companies: ["Meta", "Microsoft", "Amazon"],
        followUps: ["How is it different from `const`?", "How would you implement a deep freeze?"],
      },
      {
        question: "Does freezing an object make arrays inside it immutable?",
        answerMD: "No. The property that points to the array is locked on the frozen object, but the array object itself is separate. You must freeze the nested array too if you need it to be immutable.",
        companies: ["Google", "Netflix"],
      },
    ],
    quiz: [
      {
        question: "Which statement about `Object.freeze` is true?",
        options: ["It recursively freezes the full object graph", "It prevents adding properties only", "It shallowly prevents extensions and locks existing own properties", "It is the same as `const`"],
        correctIndex: 2,
        explanationMD: "`Object.freeze` is shallow. It prevents extensions, makes existing own properties non-configurable, and makes existing data properties non-writable.",
      },
      {
        question: "What does `Object.isFrozen(obj)` check?",
        options: ["Whether every nested object is frozen", "Whether the object itself is frozen", "Whether the variable binding is `const`", "Whether the object has no prototype"],
        correctIndex: 1,
        explanationMD: "`Object.isFrozen` checks the target object itself, not the entire reachable object graph and not the variable binding.",
      },
    ],
    summary: [
      "`Object.freeze` prevents extensions and locks existing own properties at the top level.",
      "Existing data properties become non-writable and non-configurable.",
      "Freeze is shallow; nested objects remain mutable unless frozen separately.",
      "`const` protects a binding, while `Object.freeze` protects object properties.",
    ],
    cheatSheetMD: "**Freeze means:** non-extensible + own properties non-configurable + data properties non-writable.\n\n**Check:** `Object.isFrozen(obj)`\n\n**Shallow:** nested objects are not automatically frozen.\n\n**Mode caveat:** failed assignments throw in strict mode and are ignored in sloppy mode.\n\n**Use for:** constants, configs, defensive boundaries, interview immutability questions.",
  },  {
    slug: "js-object-seal",
    moduleId: "objects-prototypes",
    order: 45,
    title: "Object.seal",
    difficulty: "Intermediate",
    estimatedReadingMin: 8,
    estimatedPracticeMin: 5,
    tags: ["Object.seal", "preventExtensions", "Descriptors", "Object Shape"],
    introMD: "`Object.seal(obj)` locks an object's top-level shape without necessarily locking its existing values. After sealing, you cannot add properties, delete properties, or reconfigure existing properties, but writable data properties can still be updated.\n\nThink of seal as **same keys, values may change**. That makes it different from `Object.freeze`, which also makes data properties non-writable.",
    whyItMattersMD: "Seal, freeze, and preventExtensions are easy to mix up. Interviewers often ask for a precise comparison because the difference maps directly to property descriptors: extensibility, configurability, and writability.",
    theoryMD: "### What `Object.seal` does\n\nSealing an object:\n\n1. Prevents extensions, so no new own properties can be added.\n2. Marks existing own properties as `configurable: false`, so they cannot be deleted or reconfigured.\n3. Leaves `writable` unchanged for data properties. If a property was writable before sealing, its value can still change.\n\n### Seal vs freeze\n\n`Object.freeze` is stricter. Freeze includes everything seal does and additionally marks existing data properties as non-writable. Seal locks the set of properties; freeze locks both the set and the top-level values.\n\n### Seal vs preventExtensions\n\n`Object.preventExtensions` only prevents adding new properties. Existing configurable properties can still be deleted. `Object.seal` goes further by making existing properties non-configurable.\n\n### Shallow operation\n\nLike freeze, seal is shallow. If a sealed object points to a nested object, that nested object can still gain properties, lose properties, or be mutated unless it is separately sealed or frozen.\n\n### Reliable checks\n\nUse `Object.isSealed(obj)` to test the target object. Use `Reflect.defineProperty` and `Reflect.deleteProperty` in examples when you want boolean results instead of strict-mode-dependent exceptions.",
    diagrams: [
      {
        title: "preventExtensions vs seal vs freeze",
        ascii: `Operation                Add props   Delete props   Change writable values
-----------------------  ---------   ------------   ----------------------
preventExtensions        no          maybe          yes
seal                     no          no             yes, if writable
freeze                   no          no             no, for data props`,
        caption: "Each operation adds another descriptor-level restriction.",
      },
    ],
    codeExamples: [
      {
        title: "A sealed object can still update writable values",
        descriptionMD: "The shape is locked, but normal writable data properties can still receive new values.",
        language: "javascript",
        code: `const user = { name: 'Ada', score: 10 };

Object.seal(user);
user.score = 11;

const added = Reflect.defineProperty(user, 'role', {
  value: 'admin'
});
const deleted = Reflect.deleteProperty(user, 'name');

console.log(user.score);        // 11
console.log(added);             // false
console.log(deleted);           // false
console.log(Object.isSealed(user)); // true`,
      },
      {
        title: "preventExtensions is weaker than seal",
        descriptionMD: "A non-extensible object cannot gain properties, but configurable existing properties can still be deleted.",
        language: "javascript",
        code: `const draft = { title: 'Objects' };

Object.preventExtensions(draft);

const added = Reflect.defineProperty(draft, 'status', {
  value: 'published'
});
const deleted = Reflect.deleteProperty(draft, 'title');

console.log(added);                    // false
console.log(deleted);                  // true
console.log(Object.keys(draft).length); // 0`,
      },
    ],
    playground: [
      {
        title: "Seal locks shape but not writable values",
        descriptionMD: "This snippet avoids mode-dependent assignment failures by using `Reflect` for add/delete attempts.",
        code: `const user = { name: 'Ada' };

Object.seal(user);
user.name = 'Grace';

const added = Reflect.defineProperty(user, 'role', {
  value: 'admin'
});
const deleted = Reflect.deleteProperty(user, 'name');

console.log(user.name);
console.log(added);
console.log(deleted);
console.log(Object.isSealed(user));`,
      },
    ],
    outputPredictions: [
      {
        code: `const settings = { mode: 'dev' };

Object.seal(settings);
settings.mode = 'prod';

const added = Reflect.defineProperty(settings, 'debug', {
  value: true
});

console.log(settings.mode);
console.log(added);
console.log(Object.keys(settings).join(','));`,
        answer: "prod\nfalse\nmode",
        explanationMD: "Sealing prevents adding `debug`, so `Reflect.defineProperty` returns `false`. The existing `mode` property remains writable, so updating it to `prod` works.",
      },
      {
        code: `const obj = { a: 1 };

Object.preventExtensions(obj);

const added = Reflect.defineProperty(obj, 'b', {
  value: 2
});
const deleted = Reflect.deleteProperty(obj, 'a');

console.log(added);
console.log(deleted);
console.log(Object.keys(obj).length);`,
        answer: "false\ntrue\n0",
        explanationMD: "`preventExtensions` blocks adding `b`, but it does not make existing property `a` non-configurable. The delete succeeds, leaving zero own enumerable keys.",
      },
    ],
    codingExercises: [
      {
        title: "Lock an API response shape",
        difficulty: "Easy",
        promptMD: "Implement `sealUser(user)` so callers can update existing top-level fields but cannot add or remove top-level fields. Return the same object.",
        hints: [
          "This is exactly the shape-locking behaviour of `Object.seal`.",
          "Do not use `Object.freeze`; that would also block writable value updates.",
          "Use `Object.isSealed` to verify your result.",
        ],
        solutionCode: `function sealUser(user) {
  return Object.seal(user);
}

const user = sealUser({ name: 'Ada', score: 10 });
user.score = 12;

const added = Reflect.defineProperty(user, 'role', {
  value: 'admin'
});

console.log(user.score);
console.log(added);
console.log(Object.isSealed(user));`,
        complexity: { time: "O(n)", space: "O(1)" },
        explanationMD: "Sealing must visit the object's own properties to mark them non-configurable, so the operation is linear in the number of own properties. It returns the same object after locking its top-level shape.",
      },
    ],
    interviewQuestions: [
      {
        question: "How is `Object.seal` different from `Object.freeze`?",
        answerMD: "Both prevent extensions and make existing own properties non-configurable. `Object.freeze` additionally makes existing data properties non-writable. A sealed object's writable properties can still change; a frozen object's data properties cannot.",
        companies: ["Google", "Amazon"],
        followUps: ["Where does `Object.preventExtensions` fit in?", "Are these operations deep or shallow?"],
      },
      {
        question: "Can you delete a property from a sealed object?",
        answerMD: "No. Sealing marks existing own properties as non-configurable, and non-configurable properties cannot be deleted. `Reflect.deleteProperty` returns `false`; `delete` can throw in strict mode.",
        companies: ["Microsoft", "Meta"],
      },
    ],
    quiz: [
      {
        question: "After `Object.seal(obj)`, which operation can still work for a writable data property?",
        options: ["Adding a new property", "Deleting the property", "Changing the property's value", "Changing the property to an accessor"],
        correctIndex: 2,
        explanationMD: "Seal leaves writability unchanged. If the property was writable, its value can still be changed, but the shape and configurability are locked.",
      },
      {
        question: "Which operation is the weakest shape restriction?",
        options: ["`Object.freeze`", "`Object.seal`", "`Object.preventExtensions`", "`Object.create(null)`"],
        correctIndex: 2,
        explanationMD: "`Object.preventExtensions` only blocks adding new properties. Seal and freeze add stronger restrictions on existing properties.",
      },
    ],
    summary: [
      "`Object.seal` prevents adding new own properties and deleting existing own properties.",
      "Sealed properties become non-configurable, but writable data properties can still change value.",
      "`Object.freeze` is stricter because it also makes data properties non-writable.",
      "`Object.preventExtensions` is weaker because existing configurable properties can still be deleted.",
    ],
    cheatSheetMD: "**preventExtensions:** cannot add new properties.\n\n**seal:** cannot add/delete/reconfigure top-level properties; writable values may change.\n\n**freeze:** seal + data properties become non-writable.\n\n**Checks:** `Object.isExtensible`, `Object.isSealed`, `Object.isFrozen`.\n\n**All are shallow.**",
  },  {
    slug: "js-object-create",
    moduleId: "objects-prototypes",
    order: 46,
    title: "Object.create",
    difficulty: "Intermediate",
    estimatedReadingMin: 9,
    estimatedPracticeMin: 6,
    tags: ["Object.create", "Null Prototype", "Delegation", "Descriptors"],
    introMD: "`Object.create(proto)` creates a new object whose internal `[[Prototype]]` is exactly `proto`. It is the most direct way to build prototype delegation without invoking a constructor function or using `class`.\n\nIts second argument also lets you define properties with descriptors at creation time, which connects this API directly to property descriptors.",
    whyItMattersMD: "`Object.create` is the cleanest way to explain prototype delegation. It also solves a real security and correctness problem: null-prototype dictionaries avoid accidental collisions with inherited names such as `toString`, `constructor`, or `__proto__`.",
    theoryMD: "### Basic form\n\n`Object.create(proto)` returns a fresh empty object whose prototype is `proto`. Reads that miss on the new object continue on `proto`. Writes usually create or update own properties on the receiver, not on the prototype.\n\n### Second argument: descriptors\n\n`Object.create(proto, descriptors)` works like creating the object and then calling `Object.defineProperties`. Descriptor defaults are the same strict defaults: omitted `writable`, `enumerable`, and `configurable` flags are `false`.\n\n### Null-prototype objects\n\n`Object.create(null)` creates an object with no prototype at all. It does not inherit `toString`, `valueOf`, `constructor`, or `hasOwnProperty`. This is useful for dictionary-style data where every key should be user data, not inherited behaviour.\n\n### Trade-offs of null-prototype dictionaries\n\nThe benefit is no inherited-key collision. The cost is that common object methods are missing, so you must use safe static or borrowed APIs such as `Object.keys(dict)` and `Object.prototype.hasOwnProperty.call(dict, key)`.\n\n### Relationship to inheritance\n\nConstructor-function inheritance commonly uses `Child.prototype = Object.create(Parent.prototype)`. That gives instances of `Child` a prototype chain that reaches `Parent.prototype` without running the parent constructor just to set up inheritance.",
    diagrams: [
      {
        title: "Object.create sets the next lookup step",
        ascii: `const child = Object.create(parent)

child
+---------------------+
| own name: 'Ada'     |
+---------------------+
          |
          v
parent
+---------------------+
| role: 'reader'      |
+---------------------+
          |
          v
Object.prototype
+---------------------+
| toString, valueOf   |
+---------------------+`,
        caption: "The created object starts empty but delegates missing reads to the prototype you pass in.",
      },
      {
        title: "Null-prototype dictionary",
        ascii: `dictionary = Object.create(null)

+---------------------+
| apple: 2            |
| toString: 1         |  own data key, not inherited method
+---------------------+
          |
          v
        null`,
        caption: "With no prototype, every key is data you explicitly put there.",
      },
    ],
    codeExamples: [
      {
        title: "Create an object that delegates to defaults",
        descriptionMD: "The order has its own `total` but inherits `currency` from `defaults`.",
        language: "javascript",
        code: `const defaults = { currency: 'USD' };
const order = Object.create(defaults);

order.total = 20;

console.log(order.total);      // 20
console.log(order.currency);   // USD
console.log(Object.keys(order)); // ['total']`,
      },
      {
        title: "Use a null-prototype dictionary",
        descriptionMD: "A null-prototype object is useful when user-provided keys should not collide with inherited object methods.",
        language: "javascript",
        code: `const counts = Object.create(null);

counts.apple = 2;
counts.toString = 1;

console.log(Object.getPrototypeOf(counts)); // null
console.log(counts.toString);               // 1
console.log(Object.keys(counts));           // ['apple', 'toString']`,
      },
    ],
    playground: [
      {
        title: "Null prototype means no inherited methods",
        descriptionMD: "The key `toString` is normal data here because the dictionary has no prototype.",
        code: `const dictionary = Object.create(null);

dictionary.apple = 2;
dictionary.toString = 1;

console.log(Object.getPrototypeOf(dictionary) === null);
console.log(dictionary.toString);
console.log('toString' in dictionary);`,
      },
    ],
    outputPredictions: [
      {
        code: `const base = { role: 'reader' };
const user = Object.create(base);

user.name = 'Ada';

console.log(user.role);
console.log(Object.keys(user).join(','));
console.log(Object.getPrototypeOf(user) === base);`,
        answer: "reader\nname\ntrue",
        explanationMD: "`role` is inherited from `base`. The only own enumerable key is `name`. `Object.getPrototypeOf(user)` returns exactly the object passed to `Object.create`.",
      },
      {
        code: `const obj = Object.create(null, {
  id: { value: 1, enumerable: true },
  hidden: { value: 2 }
});

console.log(Object.keys(obj).join(','));
console.log(obj.hidden);
console.log(Object.getPrototypeOf(obj));`,
        answer: "id\n2\nnull",
        explanationMD: "The descriptor for `id` is enumerable, so it appears in `Object.keys`. `hidden` exists but is non-enumerable by default. The prototype is `null`.",
      },
    ],
    codingExercises: [
      {
        title: "Build a safe string counter",
        difficulty: "Medium",
        promptMD: "Implement `countWords(words)` so it returns a null-prototype dictionary mapping each word to its count. Keys like `toString` and `constructor` must be counted as normal words.",
        hints: [
          "Start with `Object.create(null)`.",
          "A missing key reads as `undefined`.",
          "Use `dict[word] = (dict[word] || 0) + 1` for this simple positive-count case.",
        ],
        solutionCode: `function countWords(words) {
  const counts = Object.create(null);

  words.forEach(function (word) {
    counts[word] = (counts[word] || 0) + 1;
  });

  return counts;
}

const counts = countWords(['toString', 'apple', 'toString']);

console.log(Object.getPrototypeOf(counts) === null);
console.log(counts.toString);
console.log(counts.apple);`,
        complexity: { time: "O(n)", space: "O(k)" },
        explanationMD: "The function processes `n` words and stores up to `k` distinct keys. Because the dictionary has a null prototype, inherited names do not collide with user data.",
      },
    ],
    interviewQuestions: [
      {
        question: "What does `Object.create(proto)` do?",
        answerMD: "It creates a new object whose internal `[[Prototype]]` is `proto`. The new object starts with no own properties unless descriptors are provided. Missing property reads delegate to `proto` through the prototype chain.",
        companies: ["Google", "Microsoft"],
        followUps: ["What happens if `proto` is `null`?", "How does the second argument work?"],
      },
      {
        question: "Why would you use `Object.create(null)`?",
        answerMD: "It creates a dictionary object with no inherited keys. That prevents collisions with names like `toString`, `constructor`, or `hasOwnProperty`. The trade-off is that those inherited methods are unavailable, so you should use static or borrowed object utilities.",
        companies: ["Amazon", "Meta"],
      },
    ],
    quiz: [
      {
        question: "What is the prototype of `Object.create(null)`?",
        options: ["`Object.prototype`", "`null`", "The global object", "A frozen empty object"],
        correctIndex: 1,
        explanationMD: "`Object.create(null)` creates an object with no prototype. Its prototype is literally `null`.",
      },
      {
        question: "What does the second argument to `Object.create` contain?",
        options: ["A list of constructor arguments", "Property descriptors", "A class body", "An array of prototype names"],
        correctIndex: 1,
        explanationMD: "The second argument is a descriptor map, equivalent to using `Object.defineProperties` on the newly created object.",
      },
    ],
    summary: [
      "`Object.create(proto)` creates an object with an explicit prototype.",
      "The second argument defines own properties through descriptors.",
      "`Object.create(null)` is useful for dictionary objects with no inherited-key collisions.",
      "Constructor-function inheritance commonly uses `Object.create(Parent.prototype)`.",
    ],
    cheatSheetMD: "**Basic:** `const child = Object.create(parent)`\n\n**Null dictionary:** `const dict = Object.create(null)`\n\n**With descriptors:** `Object.create(proto, { id: { value: 1, enumerable: true } })`\n\n**Own keys:** inherited properties do not appear in `Object.keys(child)`.\n\n**Caution:** null-prototype objects do not have `hasOwnProperty` as a method.",
  },  {
    slug: "js-prototype",
    moduleId: "objects-prototypes",
    order: 47,
    title: "Prototypes",
    difficulty: "Intermediate",
    estimatedReadingMin: 10,
    estimatedPracticeMin: 7,
    tags: ["Prototype", "Constructor Functions", "__proto__", "[[Prototype]]"],
    introMD: "Every ordinary JavaScript object has an internal `[[Prototype]]` reference to another object or to `null`. That reference is what powers inherited property lookup.\n\nDo not confuse an object's internal `[[Prototype]]` with a function's `.prototype` property. They are related by `new`, but they are not the same concept.",
    whyItMattersMD: "Prototype confusion is one of the highest-signal JavaScript interview areas. If you can distinguish `obj.[[Prototype]]`, `Constructor.prototype`, and legacy `__proto__`, you can explain `new`, methods on class instances, `instanceof`, and inheritance without memorising snippets.",
    theoryMD: "### The internal `[[Prototype]]`\n\nAn object's `[[Prototype]]` is an internal link used when a property is not found directly on the object. You inspect it with `Object.getPrototypeOf(obj)` and can change it with `Object.setPrototypeOf(obj, proto)`, although changing prototypes of existing objects is usually bad for performance and clarity.\n\n### The `.prototype` property on functions\n\nMost normal functions have a `.prototype` object. When you call a function with `new`, JavaScript creates a new object whose `[[Prototype]]` points to that function's `.prototype`. That is why methods assigned to `User.prototype` are shared by all instances created with `new User()`.\n\n### `__proto__`\n\n`__proto__` is a legacy accessor on `Object.prototype` that exposes an object's internal prototype in many environments. Prefer `Object.getPrototypeOf` and `Object.setPrototypeOf` in teaching and production code because they are explicit and work better with unusual objects.\n\n### Constructors and shared methods\n\nPutting methods on the prototype avoids creating a new function per instance. Each instance stores its own data, while methods are shared through the prototype.\n\n### Arrow functions and `.prototype`\n\nArrow functions cannot be used as constructors and do not have a useful `.prototype` for `new`. This is one reason constructor functions, method shorthand, and classes have different roles in the language.",
    diagrams: [
      {
        title: "Constructor prototype vs instance prototype",
        ascii: `function User(name) { ... }

User --------------------------+
| prototype ----------------+  |
+---------------------------|--+
                            v
                    User.prototype
                    +--------------------+
                    | greet: function    |
                    | constructor: User  |
                    +--------------------+
                              ^
                              |
new User('Ada')               |
instance.[[Prototype]] --------+`,
        caption: "`User.prototype` becomes the `[[Prototype]]` of objects created with `new User()`.",
      },
    ],
    codeExamples: [
      {
        title: "Methods shared through a constructor prototype",
        descriptionMD: "Each instance owns `name`; the `greet` method is shared on `User.prototype`.",
        language: "javascript",
        code: `function User(name) {
  this.name = name;
}

User.prototype.greet = function () {
  return 'Hello, ' + this.name;
};

const ada = new User('Ada');

console.log(ada.greet());
console.log(Object.getPrototypeOf(ada) === User.prototype);
console.log(ada.hasOwnProperty('greet'));`,
      },
      {
        title: "Prefer Object.getPrototypeOf over __proto__",
        descriptionMD: "`__proto__` is widely available but legacy. The standard explicit API is clearer.",
        language: "javascript",
        code: `const parent = { kind: 'parent' };
const child = { own: true };

Object.setPrototypeOf(child, parent);

console.log(child.kind); // parent
console.log(Object.getPrototypeOf(child) === parent); // true
console.log(child.__proto__ === parent); // true in typical modern engines`,
      },
    ],
    playground: [
      {
        title: "Follow an instance back to its constructor prototype",
        descriptionMD: "The instance does not own the method; it finds it through its internal prototype.",
        code: `function Person(name) {
  this.name = name;
}

Person.prototype.sayName = function () {
  console.log('name:' + this.name);
};

const ada = new Person('Ada');

ada.sayName();
console.log(Object.getPrototypeOf(ada) === Person.prototype);
console.log(Person.prototype.constructor === Person);`,
      },
    ],
    outputPredictions: [
      {
        code: `function Box(value) {
  this.value = value;
}

Box.prototype.get = function () {
  return this.value;
};

const box = new Box(7);

console.log(box.get());
console.log(box.hasOwnProperty('get'));
console.log(Object.getPrototypeOf(box) === Box.prototype);`,
        answer: "7\nfalse\ntrue",
        explanationMD: "`value` is an own property created by the constructor. `get` is found on `Box.prototype`, so `box.hasOwnProperty('get')` is `false`, and the internal prototype is exactly `Box.prototype`.",
      },
      {
        code: `const proto = { shared: true };
const obj = { own: true };

Object.setPrototypeOf(obj, proto);

console.log(obj.shared);
console.log(obj.__proto__ === proto);
console.log(Object.getPrototypeOf(obj) === proto);`,
        answer: "true\ntrue\ntrue",
        explanationMD: "After `Object.setPrototypeOf`, missing reads on `obj` can find `shared` on `proto`. In typical modern engines, legacy `__proto__` and standard `Object.getPrototypeOf` expose the same internal link.",
      },
    ],
    codingExercises: [
      {
        title: "Create a constructor with a shared method",
        difficulty: "Medium",
        promptMD: "Implement a `Counter` constructor. Each instance should own its `count`, and all instances should share an `increment()` method through `Counter.prototype`.",
        hints: [
          "Assign instance data inside the constructor with `this.count = ...`.",
          "Assign methods to `Counter.prototype`, not inside the constructor.",
          "Return the incremented count from the method.",
        ],
        solutionCode: `function Counter(start) {
  this.count = start;
}

Counter.prototype.increment = function () {
  this.count += 1;
  return this.count;
};

const first = new Counter(0);
const second = new Counter(10);

console.log(first.increment());
console.log(second.increment());
console.log(first.increment === second.increment);`,
        complexity: { time: "O(1)", space: "O(1) per instance" },
        explanationMD: "Each instance stores only its own `count`. The method function is allocated once on `Counter.prototype`, so all instances share it through their internal prototype link.",
      },
    ],
    interviewQuestions: [
      {
        question: "What is the difference between `[[Prototype]]` and `.prototype`?",
        answerMD: "`[[Prototype]]` is an internal link every ordinary object has to another object or `null`. A function's `.prototype` is a normal property used by `new`: instances created with `new Fn()` get their `[[Prototype]]` set to `Fn.prototype`.",
        companies: ["Google", "Meta", "Microsoft"],
        followUps: ["How does `new` use `.prototype`?", "Why do arrow functions not work with `new`?"],
      },
      {
        question: "Should you use `__proto__`?",
        answerMD: "For interviews, know that `__proto__` is a legacy accessor exposing the internal prototype on many objects. In production and explanations, prefer `Object.getPrototypeOf` and `Object.setPrototypeOf` because they are explicit standard APIs. Avoid changing prototypes of existing hot objects unless you have a strong reason.",
        companies: ["Amazon", "Netflix"],
      },
    ],
    quiz: [
      {
        question: "When `const x = new User()`, what is usually true?",
        options: ["`Object.getPrototypeOf(x) === User.prototype`", "`x.prototype === User`", "`User.__proto__ === x`", "`x` has no prototype"],
        correctIndex: 0,
        explanationMD: "The `new` operator creates an object whose internal prototype points to the constructor function's `.prototype` object.",
      },
      {
        question: "Which API is preferred for reading an object's internal prototype?",
        options: ["`obj.prototype`", "`obj.__proto__`", "`Object.getPrototypeOf(obj)`", "`Object.create(obj)`"],
        correctIndex: 2,
        explanationMD: "`Object.getPrototypeOf(obj)` is the explicit standard API. `__proto__` is legacy, and `obj.prototype` is not how ordinary instances expose their internal prototype.",
      },
    ],
    summary: [
      "An object's internal `[[Prototype]]` is the next object searched during property lookup.",
      "A constructor function's `.prototype` becomes the `[[Prototype]]` of instances created with `new`.",
      "`__proto__` is legacy; prefer `Object.getPrototypeOf` and `Object.setPrototypeOf`.",
      "Prototype methods are shared, while instance data is usually owned by each instance.",
    ],
    cheatSheetMD: "**Internal link:** `Object.getPrototypeOf(obj)` reads `obj.[[Prototype]]`.\n\n**Constructor property:** `Fn.prototype` is used by `new Fn()`.\n\n**Legacy:** `obj.__proto__` often exposes the same link but should not be your default API.\n\n**Shared method:** `Fn.prototype.method = function () { ... }`\n\n**Instance check:** `Object.getPrototypeOf(instance) === Fn.prototype`.",
  },  {
    slug: "js-prototype-chain",
    moduleId: "objects-prototypes",
    order: 48,
    title: "The Prototype Chain",
    difficulty: "Intermediate",
    estimatedReadingMin: 11,
    estimatedPracticeMin: 8,
    tags: ["Prototype Chain", "Lookup", "Shadowing", "Mutation"],
    introMD: "The prototype chain is the ordered lookup path JavaScript follows when reading a property. The engine checks the object itself first, then its prototype, then the prototype's prototype, continuing until it finds the property or reaches `null`.\n\nThis is the mechanism behind inherited methods, class instances, constructor-function inheritance, and many classic output-prediction puzzles.",
    whyItMattersMD: "A strong prototype-chain model lets you answer questions about method lookup, property shadowing, `instanceof`, shared mutable prototype state, and why adding a property to one object can hide but not modify a property higher in the chain.",
    theoryMD: "### Lookup algorithm\n\nFor a read like `obj.name`, JavaScript first checks whether `obj` has an own property named `name`. If not, it repeats the check on `Object.getPrototypeOf(obj)`. The search stops at the first match or at `null`.\n\n### Shadowing\n\nIf a child object has an own property with the same name as a prototype property, the own property shadows the inherited one. Deleting the own property reveals the inherited property again. Assignment usually creates or updates an own property on the receiver rather than mutating the prototype.\n\n### Shared prototype mutation\n\nIf a prototype property is a mutable object, all children that inherit that property see the same object. Mutating that shared object through one child is visible through another child. Assigning a new property on one child shadows the prototype property for that child only.\n\n### Method calls and `this`\n\nEven when a method is found on a prototype, `this` is usually the receiver before the dot. In `child.method()`, the function may live on `parent`, but `this` inside the call is `child`.\n\n### End of the chain\n\nThe top of most ordinary object chains is `Object.prototype`, whose prototype is `null`. Null-prototype objects skip `Object.prototype` entirely.",
    diagrams: [
      {
        title: "Prototype chain lookup",
        ascii: `beagle
+----------------------+
| own name: 'Scout'    |
+----------------------+
          |
          | missing property?
          v
dog
+----------------------+
| barks: true          |
+----------------------+
          |
          v
animal
+----------------------+
| eats: true           |
+----------------------+
          |
          v
Object.prototype
+----------------------+
| toString, valueOf    |
+----------------------+
          |
          v
        null`,
        caption: "Reads walk down this chain until the first matching property is found.",
      },
    ],
    codeExamples: [
      {
        title: "Own property checks vs chain checks",
        descriptionMD: "`in` sees through the chain; an own-property check does not.",
        language: "javascript",
        code: `const animal = { eats: true };
const dog = Object.create(animal);
dog.barks = true;

const beagle = Object.create(dog);
beagle.name = 'Scout';

console.log(beagle.eats); // true
console.log('eats' in beagle); // true
console.log(Object.prototype.hasOwnProperty.call(beagle, 'eats')); // false`,
      },
      {
        title: "Shadowing and revealing inherited properties",
        descriptionMD: "An own property hides the prototype property until the own property is deleted.",
        language: "javascript",
        code: `const defaults = { theme: 'dark' };
const user = Object.create(defaults);

console.log(user.theme); // dark

user.theme = 'light';
console.log(user.theme);     // light
console.log(defaults.theme); // dark

delete user.theme;
console.log(user.theme);     // dark`,
      },
    ],
    playground: [
      {
        title: "Trace a three-level chain",
        descriptionMD: "Follow where each property comes from and how the chain ends at `null`.",
        code: `const animal = { eats: true };
const dog = Object.create(animal);
dog.barks = true;

const beagle = Object.create(dog);
beagle.name = 'Scout';

console.log(beagle.name);
console.log(beagle.barks);
console.log(beagle.eats);
console.log(Object.getPrototypeOf(Object.getPrototypeOf(beagle)) === animal);`,
      },
    ],
    outputPredictions: [
      {
        code: `const shared = { skills: [] };
const ada = Object.create(shared);
const grace = Object.create(shared);

ada.skills.push('js');
console.log(grace.skills.join(','));

ada.skills = ['react'];
console.log(ada.skills.join(','));
console.log(grace.skills.join(','));`,
        answer: "js\nreact\njs",
        explanationMD: "At first, neither child has its own `skills`, so both read the same inherited array and `push` mutates that shared array. The later assignment creates an own `skills` property on `ada`, shadowing the prototype array only for `ada`.",
      },
      {
        code: `const parent = { level: 1 };
const child = Object.create(parent);

console.log(child.level);
child.level = 2;
console.log(child.level);
console.log(parent.level);

delete child.level;
console.log(child.level);`,
        answer: "1\n2\n1\n1",
        explanationMD: "The first read finds `level` on `parent`. Assignment creates an own `child.level` with value `2`, shadowing the parent. Deleting the own property reveals the inherited `parent.level` again.",
      },
    ],
    codingExercises: [
      {
        title: "Find which object owns a property",
        difficulty: "Medium",
        promptMD: "Implement `findPropertyOwner(obj, key)` so it returns the first object in the prototype chain that owns `key`, or `null` if the property does not exist anywhere in the chain.",
        hints: [
          "Use a loop that starts at `obj` and repeatedly calls `Object.getPrototypeOf`.",
          "Use an own-property check at each level.",
          "Stop when the current object becomes `null`.",
        ],
        solutionCode: `function findPropertyOwner(obj, key) {
  let current = obj;

  while (current !== null) {
    if (Object.prototype.hasOwnProperty.call(current, key)) {
      return current;
    }

    current = Object.getPrototypeOf(current);
  }

  return null;
}

const parent = { role: 'admin' };
const child = Object.create(parent);
child.name = 'Ada';

console.log(findPropertyOwner(child, 'name') === child);
console.log(findPropertyOwner(child, 'role') === parent);
console.log(findPropertyOwner(child, 'missing') === null);`,
        complexity: { time: "O(d)", space: "O(1)" },
        explanationMD: "The loop checks at most one object per prototype-chain level, where `d` is the depth of the chain. It stores only the current pointer.",
      },
    ],
    interviewQuestions: [
      {
        question: "How does property lookup work in the prototype chain?",
        answerMD: "JavaScript first checks the receiver's own properties. If the key is missing, it checks the receiver's prototype, then that object's prototype, and so on until it finds a match or reaches `null`. The first match wins, which is why own properties shadow inherited ones.",
        companies: ["Google", "Amazon", "Meta"],
        followUps: ["What is property shadowing?", "How does `this` behave when a method is found on a prototype?"],
      },
      {
        question: "Why is shared mutable data on a prototype dangerous?",
        answerMD: "All objects that inherit that property see the same referenced object. Mutating it through one instance mutates the shared object for all other instances. Instance-specific arrays or objects should be created per instance, usually in the constructor or factory.",
        companies: ["Microsoft", "Netflix"],
      },
    ],
    quiz: [
      {
        question: "If an object and its prototype both have a property named `x`, which value does `obj.x` return?",
        options: ["The prototype's value", "The object's own value", "Both values as an array", "It throws because the name is ambiguous"],
        correctIndex: 1,
        explanationMD: "Own properties are checked before prototype properties, so the object's own `x` shadows the inherited `x`.",
      },
      {
        question: "Where does a normal object prototype chain usually end?",
        options: ["`window`", "`Function.prototype`", "`null`", "The original constructor call"],
        correctIndex: 2,
        explanationMD: "Prototype chains end at `null`. For ordinary objects, the chain often passes through `Object.prototype`, whose prototype is `null`.",
      },
    ],
    summary: [
      "Property reads check own properties first, then walk the prototype chain.",
      "Own properties shadow inherited properties with the same name.",
      "Mutating inherited reference values can affect every object sharing that prototype.",
      "Most ordinary object chains eventually reach `Object.prototype` and then `null`.",
    ],
    cheatSheetMD: "**Lookup:** own object → prototype → next prototype → `null`.\n\n**Shadowing:** own property with same key hides inherited property.\n\n**Reveal inherited:** delete the own shadowing property.\n\n**Own check:** `Object.hasOwn(obj, key)` or borrowed `hasOwnProperty`.\n\n**Chain check:** `key in obj`.\n\n**Shared mutable warning:** arrays/objects on prototypes are shared by inheritors.",
  },  {
    slug: "js-inheritance",
    moduleId: "objects-prototypes",
    order: 49,
    title: "Prototypal Inheritance",
    difficulty: "Advanced",
    estimatedReadingMin: 12,
    estimatedPracticeMin: 9,
    tags: ["Inheritance", "Classes", "Constructor Functions", "Delegation", "instanceof"],
    introMD: "JavaScript inheritance is prototype delegation. Objects inherit from other objects by having those objects in their prototype chain. Constructor functions and `class` syntax are structured ways to create and link those objects.\n\nThe most important interview sentence: **ES6 `class` is syntactic sugar over prototypes, not a switch to classical Java-style inheritance.**",
    whyItMattersMD: "Senior JavaScript interviews often ask you to translate between constructor functions, `Object.create`, and `class extends`. Understanding the common prototype mechanics lets you debug `instanceof`, fix broken `constructor` links, avoid shared mutable prototype state, and choose composition when inheritance would make the design brittle.",
    theoryMD: "### Prototype-based, not class-based at the core\n\nJavaScript objects delegate to other objects. `class` syntax gives a familiar declaration style, but methods still live on `.prototype`, instances still have internal `[[Prototype]]` links, and `extends` still creates a prototype chain between prototype objects.\n\n### Constructor-function inheritance pattern\n\nBefore ES6 classes, a common pattern was:\n\n1. Call the parent constructor inside the child constructor with `Parent.call(this, ...)` to initialise instance data.\n2. Set `Child.prototype = Object.create(Parent.prototype)` so child instances can inherit parent methods.\n3. Restore `Child.prototype.constructor = Child` because replacing the prototype object overwrites the default constructor reference.\n4. Add child-specific methods to `Child.prototype`.\n\n### ES6 class syntax\n\n`class Child extends Parent` performs the prototype linking for you. `super(...)` calls the parent constructor. Methods declared in the class body are placed on the prototype, not copied onto every instance.\n\n### `instanceof` mental model\n\n`value instanceof Constructor` checks whether `Constructor.prototype` appears anywhere in `value`'s prototype chain. It is chain-based, not field-based.\n\n### Prefer composition when possible\n\nInheritance is useful for true substitutability and shared protocol. Composition is often better for UI and application logic because behaviours can be assembled without deep fragile chains.",
    diagrams: [
      {
        title: "Constructor inheritance chain",
        ascii: `dog instance
+----------------------+
| own name: 'Rex'      |
+----------------------+
          |
          v
Dog.prototype
+----------------------+
| speak: function      |
| constructor: Dog     |
+----------------------+
          |
          v
Animal.prototype
+----------------------+
| eat: function        |
| constructor: Animal  |
+----------------------+
          |
          v
Object.prototype
+----------------------+
| toString, valueOf    |
+----------------------+
          |
          v
        null`,
        caption: "`extends` and the older `Object.create` pattern both build chains like this.",
      },
    ],
    codeExamples: [
      {
        title: "Pre-ES6 constructor-function inheritance",
        descriptionMD: "This is the pattern that `class extends` makes easier to read, while still relying on prototypes underneath.",
        language: "javascript",
        code: `function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function () {
  return this.name + ' makes a noise';
};

function Dog(name) {
  Animal.call(this, name);
}

Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.speak = function () {
  return this.name + ' barks';
};

const rex = new Dog('Rex');

console.log(rex.speak());
console.log(rex instanceof Dog);
console.log(rex instanceof Animal);`,
      },
      {
        title: "The same relationship with class syntax",
        descriptionMD: "Class syntax is clearer, but methods still live on prototypes and `extends` still creates prototype-chain links.",
        language: "javascript",
        code: `class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return this.name + ' makes a noise';
  }
}

class Dog extends Animal {
  speak() {
    return this.name + ' barks';
  }
}

const rex = new Dog('Rex');

console.log(rex.speak());
console.log(Object.getPrototypeOf(Dog.prototype) === Animal.prototype);`,
      },
    ],
    playground: [
      {
        title: "Class extends still creates a prototype chain",
        descriptionMD: "Run this to see `instanceof` and prototype-object links line up.",
        code: `class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return this.name + ' makes noise';
  }
}

class Dog extends Animal {
  speak() {
    return this.name + ' barks';
  }
}

const dog = new Dog('Rex');

console.log(dog.speak());
console.log(dog instanceof Dog);
console.log(dog instanceof Animal);
console.log(Object.getPrototypeOf(Dog.prototype) === Animal.prototype);`,
      },
    ],
    outputPredictions: [
      {
        code: `function Parent() {}

Parent.prototype.say = function () {
  return 'parent';
};

function Child() {}

Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;

const child = new Child();

console.log(child.say());
console.log(child instanceof Parent);
console.log(child.constructor === Child);`,
        answer: "parent\ntrue\ntrue",
        explanationMD: "`Child.prototype` delegates to `Parent.prototype`, so `child.say()` is found there and `child instanceof Parent` is true. Restoring `constructor` makes `child.constructor === Child` true.",
      },
      {
        code: `function User(name) {
  this.name = name;
}

User.prototype.tags = [];

const ada = new User('Ada');
const grace = new User('Grace');

ada.tags.push('admin');
console.log(grace.tags.join(','));

grace.tags = ['editor'];
console.log(ada.tags.join(','));
console.log(grace.tags.join(','));`,
        answer: "admin\nadmin\neditor",
        explanationMD: "`tags` starts as one shared array on `User.prototype`, so pushing through `ada` is visible through `grace`. Assigning `grace.tags` creates an own property on `grace`, shadowing the shared prototype array only for that instance.",
      },
    ],
    codingExercises: [
      {
        title: "Implement constructor inheritance",
        difficulty: "Hard",
        promptMD: "Create `Vehicle` and `Car` constructor functions. `Vehicle` should store `make` and expose `describe()` on its prototype. `Car` should inherit from `Vehicle`, store `model`, restore its `constructor`, and override `describe()` to include both make and model.",
        hints: [
          "Call `Vehicle.call(this, make)` inside `Car`.",
          "Use `Object.create(Vehicle.prototype)` to connect the prototypes.",
          "After replacing `Car.prototype`, set `Car.prototype.constructor = Car`.",
        ],
        solutionCode: `function Vehicle(make) {
  this.make = make;
}

Vehicle.prototype.describe = function () {
  return this.make;
};

function Car(make, model) {
  Vehicle.call(this, make);
  this.model = model;
}

Car.prototype = Object.create(Vehicle.prototype);
Car.prototype.constructor = Car;

Car.prototype.describe = function () {
  return this.make + ' ' + this.model;
};

const car = new Car('Tesla', 'Model 3');

console.log(car.describe());
console.log(car instanceof Car);
console.log(car instanceof Vehicle);
console.log(car.constructor === Car);`,
        complexity: { time: "O(1)", space: "O(1) per instance" },
        explanationMD: "The constructor call initialises inherited instance data. `Object.create` links method lookup to `Vehicle.prototype` without executing `Vehicle`. Restoring `constructor` preserves the conventional reflection link after replacing `Car.prototype`.",
      },
    ],
    interviewQuestions: [
      {
        question: "Is JavaScript `class` real class-based inheritance?",
        answerMD: "`class` is syntax over JavaScript's prototype system. Class methods are stored on the constructor's `.prototype`, instances delegate through `[[Prototype]]`, and `extends` links prototype objects. It feels class-like, but the runtime inheritance mechanism is still prototypal delegation.",
        companies: ["Google", "Microsoft", "Meta"],
        followUps: ["Where do class methods live?", "What does `super` do in a derived constructor?"],
      },
      {
        question: "How does `instanceof` work?",
        answerMD: "`obj instanceof Fn` checks whether `Fn.prototype` appears anywhere in `obj`'s prototype chain. It does not check which constructor function originally ran or whether the object has particular fields. Changing prototypes can therefore affect `instanceof` results.",
        companies: ["Amazon", "Netflix"],
      },
    ],
    quiz: [
      {
        question: "In constructor-function inheritance, why set `Child.prototype = Object.create(Parent.prototype)`?",
        options: ["To copy all parent instance fields immediately", "To make child instances delegate to parent methods", "To freeze the child prototype", "To call the parent constructor automatically"],
        correctIndex: 1,
        explanationMD: "The assignment links `Child.prototype` to `Parent.prototype`, so child instances can find parent methods through the prototype chain. It does not call the parent constructor.",
      },
      {
        question: "Where are methods declared inside an ES6 class body usually stored?",
        options: ["On every instance as own properties", "On the class constructor's `.prototype`", "In a hidden global registry", "On `Object.prototype`"],
        correctIndex: 1,
        explanationMD: "Prototype methods declared in a class body are stored on the constructor's `.prototype`, so instances share them through prototype lookup.",
      },
    ],
    summary: [
      "JavaScript inheritance is prototype delegation at runtime.",
      "Constructor-function inheritance links child prototypes with `Object.create(Parent.prototype)`.",
      "ES6 `class` and `extends` are clearer syntax over the same prototype mechanics.",
      "Avoid shared mutable prototype state; create instance-specific arrays and objects per instance.",
    ],
    cheatSheetMD: "**Old pattern:** `Parent.call(this, args)` + `Child.prototype = Object.create(Parent.prototype)` + restore `constructor`.\n\n**Class pattern:** `class Child extends Parent { constructor(...) { super(...); } }`\n\n**Core truth:** class syntax still uses prototypes.\n\n**instanceof:** checks whether `Constructor.prototype` appears in the object's chain.\n\n**Pitfall:** arrays or objects on prototypes are shared across instances.",
  },
];