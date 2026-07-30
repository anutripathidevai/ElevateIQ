import type { Topic } from "../../types";

/**
 * Module 10 — ES6+ Features.
 *
 * Modern syntax that interviewers expect candidates to use fluently: expressive
 * binding patterns, spread/rest, safer property access, precise defaults, and
 * the static module system used by production bundlers.
 */
export const TOPICS: Topic[] = [
  {
    slug: "js-destructuring",
    moduleId: "es6-features",
    order: 72,
    title: "Destructuring",
    difficulty: "Intermediate",
    estimatedReadingMin: 10,
    estimatedPracticeMin: 8,
    tags: ["ES6", "Destructuring", "Objects", "Arrays", "Interview Syntax"],
    introMD:
      "Destructuring is ES6 syntax for unpacking values from arrays and properties from objects into local bindings. It turns repetitive indexing like `user.profile.name` or `items[0]` into a compact pattern that mirrors the shape of the data.\n\nInterviewers use destructuring to test whether you understand defaults, renaming, nested patterns, rest properties, and the subtle rule that defaults run only for `undefined`, not for `null` or other falsy values.",
    whyItMattersMD:
      "Modern JavaScript APIs return objects and arrays constantly: React props, hook tuples, API responses, config objects, and promise results. Destructuring lets you write concise code without losing precision. In interviews, it often appears inside output-prediction puzzles because it combines evaluation order, default values, and object property lookup.",
    theoryMD:
      "### Array destructuring\n\nArray patterns read by **position**. `const [first, second] = values` binds `first` to index `0` and `second` to index `1`. You can skip positions with commas, provide defaults with `=`, collect the remaining items with `...rest`, and swap variables without a temporary value using `[a, b] = [b, a]`.\n\n### Object destructuring\n\nObject patterns read by **property name**. `const { id, name } = user` binds `id` from `user.id` and `name` from `user.name`. Renaming uses `property: localName`, as in `const { name: displayName } = user`. Defaults can be added after the local binding: `const { retries = 3 } = options`.\n\n### Defaults are only for `undefined`\n\nA destructuring default runs when the matched value is exactly `undefined` or the property is missing. It does **not** run for `null`, `0`, `false`, or `\"\"`. This is one of the most common interview traps.\n\n### Nested patterns\n\nNested destructuring mirrors nested data: `const { profile: { city } } = user`. Be careful: if an intermediate object is `undefined`, destructuring throws. Use a default object (`profile: { city } = {}`) or optional chaining when the parent may be absent.\n\n### Function parameters\n\nDestructuring in parameters is powerful for option objects: `function connect({ host, port = 443 } = {})`. The outer `= {}` protects callers who pass no argument; the inner defaults protect missing properties.",
    diagrams: [
      {
        title: "Patterns mirror the data shape",
        ascii: `Array data                 Array pattern
['Ada', 'Lovelace']         const [first, last] = row
   |        |                       |      |
   v        v                       v      v
 first    last                  row[0]  row[1]

Object data                Object pattern
{ id: 7, name: 'Ada' }      const { id, name } = user
    |        |                       |     |
    v        v                       v     v
   id      name                  user.id user.name`,
        caption:
          "Array destructuring is positional; object destructuring is name-based.",
      },
    ],
    codeExamples: [
      {
        title: "Array and object patterns",
        descriptionMD:
          "The pattern on the left side describes where each binding should come from.",
        language: "javascript",
        code: `const row = ['Ada', undefined, 'London'];
const [firstName, lastName = 'Unknown', city] = row;

const user = {
  id: 42,
  profile: {
    name: 'Grace',
    role: 'compiler pioneer'
  }
};

const {
  id: userId,
  profile: { name, role },
  active = true
} = user;

console.log(firstName, lastName, city);
console.log(userId, name, role, active);`,
      },
      {
        title: "Swapping and defensive parameter destructuring",
        descriptionMD:
          "Destructuring works in assignments and function parameters, not only in declarations.",
        language: "javascript",
        code: `let left = 'frontend';
let right = 'backend';

[left, right] = [right, left];
console.log(left, right);

function createRequest({ method = 'GET', retries = 2, headers = {} } = {}) {
  return {
    method,
    retries,
    hasAuth: Boolean(headers.authorization)
  };
}

console.log(createRequest({ headers: { authorization: 'token' } }));`,
      },
    ],
    playground: [
      {
        title: "Practice nested destructuring safely",
        descriptionMD:
          "Run this and change `profile` to see why the default object matters.",
        code: `const response = {
  data: {
    user: {
      name: 'Ada',
      profile: undefined
    }
  }
};

const {
  data: {
    user: {
      name,
      profile: { city = 'Unknown' } = {}
    }
  }
} = response;

console.log(name);
console.log(city);`,
      },
    ],
    outputPredictions: [
      {
        code: `const [a = 'A', b = 'B', c = 'C'] = [undefined, null, ''];
console.log(a);
console.log(b);
console.log(c === '');

const { count = 10, label: name = 'missing' } = {
  count: 0,
  label: undefined
};
console.log(count);
console.log(name);`,
        answer: "A\nnull\ntrue\n0\nmissing",
        explanationMD:
          "Destructuring defaults run only for `undefined`. `a` uses its default, `b` remains `null`, `c` remains the empty string, `count` remains `0`, and `label: undefined` triggers the renamed default `name = 'missing'`.",
      },
      {
        code: `let x = 1;
let y = 2;

[x, y] = [y, x + y];

console.log(x);
console.log(y);`,
        answer: "2\n3",
        explanationMD:
          "The right-hand array is evaluated first using the old values (`y` is `2`, `x + y` is `3`). Then the destructuring assignment updates `x` and `y`.",
      },
    ],
    codingExercises: [
      {
        title: "Normalize a nested user response",
        difficulty: "Medium",
        promptMD:
          "Implement `normalizeUser(response)` using destructuring. It should return `{ id, name, city, tags }`. The response may omit `profile`, `address`, or `tags`. Use defaults so missing city becomes `'Unknown'` and missing tags becomes an empty array.",
        hints: [
          "Destructure from `response.user`.",
          "Use a default object for each optional nested object.",
          "Remember that array/object defaults run for `undefined`, not for `null`.",
        ],
        solutionCode: `function normalizeUser(response) {
  const {
    user: {
      id,
      name,
      profile: {
        address: { city = 'Unknown' } = {},
        tags = []
      } = {}
    }
  } = response;

  return { id, name, city, tags };
}

console.log(normalizeUser({
  user: {
    id: 1,
    name: 'Ada'
  }
}));`,
        complexity: { time: "O(1)", space: "O(1)" },
        explanationMD:
          "Each optional level has a default `{}` so the next nested pattern has something safe to destructure. The `tags = []` default handles a missing property; if the API explicitly returned `tags: null`, the result would preserve `null`.",
      },
    ],
    interviewQuestions: [
      {
        question:
          "What is the difference between array destructuring and object destructuring?",
        answerMD:
          "Array destructuring is **position-based**: `[first]` reads index `0`. Object destructuring is **property-name-based**: `{ first }` reads the `first` property regardless of property order. Object destructuring can rename with `property: localName`; arrays skip positions with commas.",
        companies: ["Microsoft", "Meta", "Amazon"],
        followUps: [
          "When do destructuring defaults run?",
          "How do you safely destructure a nested optional object?",
        ],
      },
      {
        question: "Why does `{ value = 10 } = { value: null }` keep `null`?",
        answerMD:
          "Destructuring defaults run only when the matched value is `undefined` or missing. `null` is an explicit value, so the default is not used. The same is true for `0`, `false`, and `\"\"`.",
      },
    ],
    quiz: [
      {
        question:
          "What is logged by `const { x = 5 } = { x: null }; console.log(x);`?",
        options: ["5", "null", "undefined", "ReferenceError"],
        correctIndex: 1,
        explanationMD:
          "The property exists and its value is `null`, so the destructuring default does not run.",
      },
      {
        question: "Which syntax renames `user.name` to a local variable `label`?",
        options: [
          "const { name as label } = user",
          "const { label: name } = user",
          "const { name: label } = user",
          "const [name: label] = user",
        ],
        correctIndex: 2,
        explanationMD:
          "Object destructuring renaming uses `propertyName: localName`, so `{ name: label }` creates a local binding named `label`.",
      },
    ],
    summary: [
      "Array destructuring reads by position; object destructuring reads by property name.",
      "Defaults run only for `undefined`, not for `null` or other falsy values.",
      "Renaming uses `property: localName`; nested patterns mirror nested data.",
      "Use default objects in nested patterns when intermediate properties may be missing.",
    ],
    cheatSheetMD:
      "**Array:** `const [first, second = 0, ...rest] = values`.\n\n**Object:** `const { id, name: displayName, active = true } = user`.\n\n**Nested:** `const { profile: { city } = {} } = user`.\n\n**Swap:** `[a, b] = [b, a]`.\n\n**Default rule:** only `undefined` triggers defaults.",
  },
  {
    slug: "js-spread",
    moduleId: "es6-features",
    order: 73,
    title: "The Spread Operator",
    difficulty: "Intermediate",
    estimatedReadingMin: 9,
    estimatedPracticeMin: 7,
    tags: ["ES6", "Spread", "Immutability", "Arrays", "Objects"],
    introMD:
      "Spread syntax (`...`) expands an iterable into individual elements, or copies enumerable own properties from one object into another object literal. It is one of the most common tools for immutable updates in modern JavaScript.\n\nThe same three dots also appear in rest syntax, but the direction is opposite: **spread expands**, while **rest collects**.",
    whyItMattersMD:
      "React state updates, Redux reducers, API payload composition, and interview coding exercises frequently rely on spread. Strong candidates know that spread is shallow, that array/function spread requires an iterable, and that object spread copies properties with later values overriding earlier ones.",
    theoryMD:
      "### Where spread is valid\n\nSpread appears in three high-value places:\n\n1. **Array literals** — `[0, ...items, 99]` inserts each item from an iterable.\n2. **Function calls** — `fn(...args)` passes each element as a separate argument.\n3. **Object literals** — `{ ...base, role: 'admin' }` copies enumerable own properties.\n\n### Spread is shallow\n\nSpreading an array or object creates a new outer container, but nested objects are still shared references. `{ ...user }` is not a deep clone. Mutating `copy.profile.city` also mutates `user.profile.city` if both point at the same nested object.\n\n### Override order\n\nFor object spread, properties on the right win: `{ ...defaults, timeout: 1000 }` overrides `defaults.timeout`, while `{ timeout: 1000, ...defaults }` lets defaults override your explicit value.\n\n### Spread vs rest\n\nThe syntax looks identical, but context decides meaning. On the right side of an assignment/call/literal, `...` usually spreads values out. In parameter lists or destructuring patterns, `...` collects values into one array/object.",
    diagrams: [
      {
        title: "Spread expands one container into another",
        ascii: `source:      [1, 2, 3]
                |  |  |
                v  v  v
target: [0,    ...source,    4]
result: [0, 1, 2, 3, 4]

For objects, later keys overwrite earlier keys:
{ ...defaults, timeout: 500 }`,
        caption:
          "Spread copies the outer level; it does not recursively clone nested values.",
      },
    ],
    codeExamples: [
      {
        title: "Array, call, and object spread",
        descriptionMD:
          "The same syntax expands values in arrays, function calls, and object literals.",
        language: "javascript",
        code: `const numbers = [2, 3];
const expanded = [1, ...numbers, 4];

function maxOfThree(a, b, c) {
  return Math.max(a, b, c);
}

const config = {
  retries: 2,
  timeout: 1000
};

const productionConfig = {
  ...config,
  timeout: 3000,
  cache: true
};

console.log(expanded);
console.log(maxOfThree(...numbers, 10));
console.log(productionConfig);`,
      },
      {
        title: "Shallow copy caveat",
        descriptionMD:
          "Spread gives a new outer object, but nested references are reused.",
        language: "javascript",
        code: `const original = {
  name: 'Ada',
  profile: {
    city: 'London'
  }
};

const copy = { ...original };
copy.name = 'Grace';
copy.profile.city = 'New York';

console.log(original.name);
console.log(original.profile.city);`,
      },
    ],
    playground: [
      {
        title: "Build an immutable update",
        descriptionMD:
          "Change the update order and watch which value wins.",
        code: `const defaults = {
  retries: 1,
  timeout: 1000,
  headers: {
    accept: 'json'
  }
};

const request = {
  ...defaults,
  timeout: 2500,
  headers: {
    ...defaults.headers,
    authorization: 'token'
  }
};

console.log(request.retries);
console.log(request.timeout);
console.log(Object.keys(request.headers).join(','));`,
      },
    ],
    outputPredictions: [
      {
        code: `const original = { name: 'Ada', skills: ['JS'] };
const copy = { ...original, name: 'Grace' };

copy.skills.push('TS');

console.log(original.name);
console.log(original.skills.join(','));
console.log(copy.name);`,
        answer: "Ada\nJS,TS\nGrace",
        explanationMD:
          "The outer object was copied, so changing `copy.name` does not affect `original.name`. The nested `skills` array is shared, so pushing through `copy.skills` also changes `original.skills`.",
      },
      {
        code: `const defaults = { retries: 2, mode: 'safe' };
const options = { retries: 5 };

const a = { ...defaults, ...options };
const b = { ...options, ...defaults };

console.log(a.retries);
console.log(b.retries);`,
        answer: "5\n2",
        explanationMD:
          "Object spread applies properties left to right. Later properties overwrite earlier properties with the same key.",
      },
    ],
    codingExercises: [
      {
        title: "Merge unique tags without mutating inputs",
        difficulty: "Easy",
        promptMD:
          "Implement `mergeTags(base, extra)` so it returns a new array with unique tags from both arrays in first-seen order. Do not mutate either input array.",
        hints: [
          "Spread both arrays into one combined array.",
          "`Set` keeps unique values while preserving insertion order.",
          "Spread the `Set` back into an array.",
        ],
        solutionCode: `function mergeTags(base, extra) {
  return [...new Set([...base, ...extra])];
}

const base = ['js', 'react'];
const extra = ['react', 'node'];

console.log(mergeTags(base, extra));
console.log(base);`,
        complexity: { time: "O(n + m)", space: "O(n + m)" },
        explanationMD:
          "The inner spreads create a combined array. `new Set(...)` removes duplicates while keeping first occurrence order, and the outer spread converts the set back to an array. Neither input array is modified.",
      },
    ],
    interviewQuestions: [
      {
        question: "Is object spread a deep clone?",
        answerMD:
          "No. Object spread creates a new outer object and copies enumerable own properties into it. If a property value is itself an object or array, the reference is copied, not deeply cloned. Nested mutation can still affect both objects.",
        companies: ["Netflix", "Meta", "Amazon"],
      },
      {
        question: "How is spread different from rest?",
        answerMD:
          "Spread expands values out of an iterable or object into another call/literal. Rest collects remaining values into one array or object inside a parameter list or destructuring pattern. Direction is the key mental model: spread expands, rest collects.",
        followUps: ["Where can spread syntax appear?", "What happens when object keys collide?"],
      },
    ],
    quiz: [
      {
        question: "What does `{ a: 1, ...{ a: 2, b: 3 } }` evaluate to?",
        options: [
          "{ a: 1, b: 3 }",
          "{ a: 2, b: 3 }",
          "{ a: [1, 2], b: 3 }",
          "SyntaxError",
        ],
        correctIndex: 1,
        explanationMD:
          "Object spread is applied left to right. The later `a: 2` overwrites the earlier `a: 1`.",
      },
      {
        question: "Which statement about spread is false?",
        options: [
          "Array spread requires an iterable.",
          "Function-call spread passes elements as separate arguments.",
          "Object spread performs a recursive deep clone.",
          "Object spread copies enumerable own properties.",
        ],
        correctIndex: 2,
        explanationMD:
          "Spread is shallow. It does not recursively clone nested objects or arrays.",
      },
    ],
    summary: [
      "Spread expands values in array literals, function calls, and object literals.",
      "Object spread copies enumerable own properties and applies overrides left to right.",
      "Spread is shallow; nested references remain shared.",
      "Remember the contrast: spread expands, rest collects.",
    ],
    cheatSheetMD:
      "**Array:** `[first, ...items, last]`.\n\n**Call:** `fn(...args)`.\n\n**Object:** `{ ...base, override: true }`.\n\n**Override order:** rightmost key wins.\n\n**Caveat:** shallow copy only; clone nested structures explicitly.",
  },
  {
    slug: "js-rest",
    moduleId: "es6-features",
    order: 74,
    title: "Rest Parameters",
    difficulty: "Intermediate",
    estimatedReadingMin: 8,
    estimatedPracticeMin: 7,
    tags: ["ES6", "Rest", "Functions", "Destructuring", "Variadic"],
    introMD:
      "Rest syntax (`...`) collects remaining values into a single array or object. In function parameters, rest parameters replace many uses of the older `arguments` object with a real array.\n\nThe interview shortcut is simple: **rest appears where values are being bound**, while spread appears where values are being expanded.",
    whyItMattersMD:
      "Variadic functions, wrapper utilities, reducers, event handlers, and API helpers all need a safe way to accept an unknown number of values. Rest parameters are clearer than `arguments`, work with arrow functions, and compose naturally with destructuring.",
    theoryMD:
      "### Rest parameters\n\nA rest parameter gathers all remaining arguments into a real array: `function log(level, ...messages)`. It must be the final parameter because it consumes everything left. You cannot put another parameter after it.\n\n### Rest is not `arguments`\n\n`arguments` is array-like, not an array, and it is unavailable in arrow functions. Rest parameters are real arrays, so methods like `map`, `filter`, `reduce`, and `slice` work directly.\n\n### Destructuring rest\n\nRest also works in destructuring patterns. `const [head, ...tail] = values` collects remaining array elements. `const { password, ...publicUser } = user` copies remaining object properties into a new object. Like spread, object rest is shallow.\n\n### Rest vs spread in one sentence\n\nIf `...` is on the **left side** of binding values, it collects. If it is on the **right side** producing values, it spreads.",
    diagrams: [
      {
        title: "Rest collects the leftovers",
        ascii: `call:    fn('info', 'created', 'user')
          |       |          |
          v       v          v
params: level   ...messages collects ['created', 'user']

destructure: const [head, ...tail] = [10, 20, 30]
             head = 10
             tail = [20, 30]`,
        caption:
          "Rest syntax is a binding pattern: it creates one variable containing the remaining values.",
      },
    ],
    codeExamples: [
      {
        title: "Rest parameters are real arrays",
        descriptionMD:
          "A rest parameter can be filtered, mapped, reduced, or passed to another function.",
        language: "javascript",
        code: `function sum(label, ...numbers) {
  const total = numbers.reduce(function (acc, value) {
    return acc + value;
  }, 0);

  return {
    label,
    count: numbers.length,
    total
  };
}

console.log(sum('scores', 10, 20, 30));`,
      },
      {
        title: "Rest in destructuring",
        descriptionMD:
          "Object rest is useful for removing fields before logging or returning data.",
        language: "javascript",
        code: `const [first, second, ...others] = ['A', 'B', 'C', 'D'];
console.log(first);
console.log(others);

const user = {
  id: 1,
  email: 'ada@example.com',
  passwordHash: 'secret'
};

const { passwordHash, ...safeUser } = user;
console.log(safeUser);`,
      },
    ],
    playground: [
      {
        title: "Write a variadic logger",
        descriptionMD:
          "Rest parameters make it easy to handle any number of message parts.",
        code: `function log(level, ...parts) {
  const line = parts.join(' ');
  console.log(level.toUpperCase() + ': ' + line);
  console.log(Array.isArray(parts));
}

log('info', 'user', 'created', 42);`,
      },
    ],
    outputPredictions: [
      {
        code: `function collect(label, ...items) {
  console.log(label);
  console.log(items.length);
  console.log(Array.isArray(items));
}

collect('ids', 10, 20);`,
        answer: "ids\n2\ntrue",
        explanationMD:
          "`label` receives the first argument. The rest parameter `items` collects the remaining arguments into a real array.",
      },
      {
        code: `const [first, ...rest] = [1, 2, 3];
const copy = [...rest];

copy.push(4);

console.log(first);
console.log(rest.join('-'));
console.log(copy.join('-'));`,
        answer: "1\n2-3\n2-3-4",
        explanationMD:
          "Array rest collected `[2, 3]` into `rest`. The `copy` array was created with spread, so pushing to it does not mutate `rest`.",
      },
    ],
    codingExercises: [
      {
        title: "Create a flexible average function",
        difficulty: "Easy",
        promptMD:
          "Implement `average(...values)` so it accepts any number of numbers and returns their average. Return `0` when no values are provided.",
        hints: [
          "Use a rest parameter to collect the values.",
          "A rest parameter is already a real array.",
          "Guard the empty-array case before dividing.",
        ],
        solutionCode: `function average(...values) {
  if (values.length === 0) {
    return 0;
  }

  const total = values.reduce(function (acc, value) {
    return acc + value;
  }, 0);

  return total / values.length;
}

console.log(average(10, 20, 30));
console.log(average());`,
        complexity: { time: "O(n)", space: "O(n)" },
        explanationMD:
          "The rest parameter collects all arguments into `values`. The function handles the empty case, sums the array, and divides by the count.",
      },
    ],
    interviewQuestions: [
      {
        question: "Why prefer rest parameters over `arguments`?",
        answerMD:
          "Rest parameters are explicit, named, and real arrays. They work in arrow functions and can use array methods directly. `arguments` is array-like, less readable, unavailable in arrows, and can have legacy aliasing behavior in non-strict functions.",
        companies: ["Google", "Microsoft"],
      },
      {
        question: "Where must a rest parameter appear in a function signature?",
        answerMD:
          "It must be the final parameter because it collects all remaining arguments. `function f(...args, last)` is a syntax error.",
        followUps: ["Can destructuring use rest?", "Is object rest a deep copy?"],
      },
    ],
    quiz: [
      {
        question: "Which declaration is valid?",
        options: [
          "function f(...args, last) {}",
          "function f(first, ...rest) {}",
          "function f(...one, ...two) {}",
          "function f(...args = []) {}",
        ],
        correctIndex: 1,
        explanationMD:
          "A function may have one rest parameter, and it must be the final parameter.",
      },
      {
        question: "In `const { id, ...rest } = user`, what is `rest`?",
        options: [
          "A reference to the original object",
          "A new object containing remaining enumerable own properties",
          "An array of remaining property names",
          "A deep clone of every remaining value",
        ],
        correctIndex: 1,
        explanationMD:
          "Object rest creates a new object with the remaining enumerable own properties. The copy is shallow.",
      },
    ],
    summary: [
      "Rest parameters collect remaining function arguments into a real array.",
      "A rest parameter must be the final parameter.",
      "Array and object destructuring can use rest to collect leftover values.",
      "Spread expands values; rest collects values.",
    ],
    cheatSheetMD:
      "**Function rest:** `function fn(first, ...rest) {}`.\n\n**Array rest:** `const [head, ...tail] = items`.\n\n**Object rest:** `const { secret, ...publicData } = user`.\n\n**Rule:** one rest element, and in function parameters it must be last.\n\n**Rest vs spread:** rest collects; spread expands.",
  },
  {
    slug: "js-template-literals",
    moduleId: "es6-features",
    order: 75,
    title: "Template Literals",
    difficulty: "Intermediate",
    estimatedReadingMin: 9,
    estimatedPracticeMin: 5,
    tags: ["ES6", "Template Literals", "Strings", "Tagged Templates"],
    introMD:
      "Template literals are ES6 string literals written with backtick delimiters instead of quotes. Their key features are interpolation, expression embedding, natural multiline strings, and the advanced tagged-template form.\n\nThe syntax is commonly shown as `` `Hello ${name}` ``: the placeholder `${...}` evaluates an expression and inserts the result into the string. This topic explains the syntax in prose, while the runnable examples demonstrate equivalent results without placing template-literal syntax inside code blocks.",
    whyItMattersMD:
      "Interviewers expect you to know that template literals are not merely prettier string concatenation. They preserve line breaks, evaluate arbitrary expressions in placeholders, and enable tagged templates used by libraries for SQL builders, CSS-in-JS, GraphQL queries, and safe escaping.",
    theoryMD:
      "### Interpolation\n\nA template literal uses backtick delimiters and placeholders. In Markdown form, the pattern is `` `Hello ${name}` ``. The expression inside `${...}` is evaluated, converted to a string, and inserted.\n\n### Expression embedding\n\nThe placeholder can contain any expression, not just a variable: `` `Total: ${price * quantity}` `` or `` `Role: ${user.isAdmin ? 'admin' : 'user'}` ``. Keep expressions readable; if the logic grows, compute a named variable first.\n\n### Multiline strings\n\nA template literal can span multiple lines directly, and the line breaks become part of the string. This is cleaner than manually inserting `\\n` in quoted strings, but indentation becomes part of the result too.\n\n### Tagged templates\n\nA tag is a function placed before a template literal, conceptually like `tag` followed by a template. The function receives an array of static string parts and then each interpolated value as separate arguments. Libraries use this to validate, escape, transform, or cache structured strings.\n\n### Interview caveats\n\nTemplate literals do not automatically sanitize HTML or SQL. Interpolation converts values to strings; it does not make output safe. Tagged templates can implement escaping, but safety depends on the tag function.",
    diagrams: [
      {
        title: "Template literal evaluation model",
        ascii: `source text
  static text parts
  expression values
        |
        v
evaluate expressions left to right
        |
        v
convert values to strings
        |
        v
produce one final string`,
        caption:
          "The syntax is special, but the result is still a normal JavaScript string.",
      },
    ],
    codeExamples: [
      {
        title: "Equivalent result with concatenation",
        descriptionMD:
          "In normal code you would usually use a template literal here. This example intentionally uses single-quoted strings and concatenation while demonstrating the same final output.",
        language: "javascript",
        code: `const name = 'Ada';
const score = 42;

const message = name + ' scored ' + score + ' points';

console.log(message);
console.log(typeof message);`,
      },
      {
        title: "Tagged-template concept without template syntax",
        descriptionMD:
          "A tag function conceptually receives static string pieces separately from dynamic values. This read-only example calls such a function directly to show the data shape.",
        language: "javascript",
        code: `function safeJoin(parts, values) {
  let result = '';

  for (let i = 0; i < parts.length; i++) {
    result += parts[i];

    if (i < values.length) {
      result += String(values[i]).replace('<', '&lt;').replace('>', '&gt;');
    }
  }

  return result;
}

const output = safeJoin(['Hello ', ', role: ', ''], ['Ada', '<admin>']);
console.log(output);`,
      },
    ],
    playground: [
      {
        title: "Compare final string values",
        descriptionMD:
          "This sandbox avoids template-literal syntax and focuses on the resulting strings.",
        code: `const user = 'Grace';
const language = 'JavaScript';
const result = user + ' teaches ' + language + '.';

const lines = [
  'First line',
  'Second line',
  'Third line'
].join('\\n');

console.log(result);
console.log(lines);`,
      },
    ],
    outputPredictions: [
      {
        code: `const name = 'Ada';
const value = 2 + 3;
const message = name + ' has ' + value + ' badges';

console.log(message);
console.log(message.includes('5'));`,
        answer: "Ada has 5 badges\ntrue",
        explanationMD:
          "The arithmetic expression is evaluated first, then concatenated into the final string. A template literal with interpolation would produce the same visible result.",
      },
      {
        code: `const lines = ['A', 'B', 'C'].join('\\n');

console.log(lines.split('\\n').length);
console.log(lines);`,
        answer: "3\nA\nB\nC",
        explanationMD:
          "The string contains two newline characters, so splitting on newline produces three parts. The second `console.log` prints the line breaks as separate output lines.",
      },
    ],
    codingExercises: [
      {
        title: "Format an invoice line",
        difficulty: "Easy",
        promptMD:
          "Implement `formatLine(item)` so it returns text in the form `Widget x 3 = 30`. Use ordinary string operations in the solution here; in production this is a natural place for template literals.",
        hints: [
          "Read `name`, `quantity`, and `price` from the item.",
          "Compute `quantity * price` before building the string.",
          "Use `String(...)` or concatenation to produce the final line.",
        ],
        solutionCode: `function formatLine(item) {
  const total = item.quantity * item.price;
  return item.name + ' x ' + item.quantity + ' = ' + total;
}

console.log(formatLine({
  name: 'Widget',
  quantity: 3,
  price: 10
}));`,
        complexity: { time: "O(1)", space: "O(1)" },
        explanationMD:
          "The function computes the embedded expression first and then assembles the final string. A template literal would make the formatting terser, but the data-flow is the same.",
      },
    ],
    interviewQuestions: [
      {
        question: "What are the main advantages of template literals?",
        answerMD:
          "They support interpolation with `${...}`, multiline strings without manual newline escapes, and tagged templates. They also improve readability for strings that mix static text with computed values.",
        companies: ["Meta", "Microsoft"],
      },
      {
        question: "What is a tagged template?",
        answerMD:
          "A tagged template calls a function with the literal string segments and the interpolated values separated. The tag can transform, validate, escape, or cache the result. This is used by SQL, CSS-in-JS, GraphQL, and i18n libraries.",
        followUps: [
          "Do template literals automatically prevent XSS?",
          "How are multiline template literals different from quoted strings with `\\n`?",
        ],
      },
    ],
    quiz: [
      {
        question: "Which capability is unique to template literals compared with ordinary quoted strings?",
        options: [
          "They create numbers instead of strings",
          "They can contain interpolation placeholders like `${expression}`",
          "They are always safer for HTML",
          "They are evaluated asynchronously",
        ],
        correctIndex: 1,
        explanationMD:
          "Template literals support `${...}` placeholders. They are still strings and are not automatically safe for HTML or SQL.",
      },
      {
        question: "What does a tagged template receive first?",
        options: [
          "Only the final concatenated string",
          "An array-like collection of static string parts",
          "The global object",
          "A promise for the interpolated values",
        ],
        correctIndex: 1,
        explanationMD:
          "The tag receives the static string segments first, followed by the interpolated values as separate arguments.",
      },
    ],
    summary: [
      "Template literals use backtick delimiters and `${...}` placeholders for interpolation.",
      "Placeholders can contain expressions, not only variable names.",
      "Multiline template literals preserve line breaks and indentation.",
      "Tagged templates pass static parts and dynamic values to a function for custom processing.",
    ],
    cheatSheetMD:
      "**Interpolation:** `` `Hello ${name}` ``.\n\n**Expression:** `` `Total: ${price * quantity}` ``.\n\n**Multiline:** line breaks inside the literal become part of the string.\n\n**Tagged template:** conceptually `tag` before a template; the tag receives string parts plus values.\n\n**Security:** interpolation does not sanitize output automatically.",
  },
  {
    slug: "js-optional-chaining",
    moduleId: "es6-features",
    order: 76,
    title: "Optional Chaining",
    difficulty: "Intermediate",
    estimatedReadingMin: 9,
    estimatedPracticeMin: 7,
    tags: ["Optional Chaining", "ES2020", "Null Safety", "Objects"],
    introMD:
      "Optional chaining (`?.`) safely reads a property, calls a method, or indexes a value only when the value to its left is not `null` or `undefined`. If the left side is nullish, the whole optional chain short-circuits to `undefined`.\n\nIt is not a replacement for validation; it is a concise way to express \"continue only if this object exists\".",
    whyItMattersMD:
      "Real applications consume incomplete data: API responses, feature flags, optional callbacks, and configuration objects. Optional chaining prevents defensive code from turning into nested `if` statements while preserving the important distinction between missing data and falsy-but-valid data.",
    theoryMD:
      "### Forms of optional chaining\n\n- **Property access:** `user?.profile`.\n- **Element access:** `rows?.[0]`.\n- **Optional call:** `onSuccess?.(result)`.\n\nThe operator checks only the value immediately to its left. In `user?.profile.name`, `user` is protected, but `profile.name` is not optional. Use `user?.profile?.name` if both levels may be missing.\n\n### Short-circuiting\n\nWhen optional chaining short-circuits, later property lookups, index expressions, and call arguments in that chain are not evaluated. This matters for side effects such as counters or function calls inside arguments.\n\n### Result is `undefined`\n\nThe fallback result is always `undefined`, not `null`. Combine optional chaining with nullish coalescing when you need a default: `user?.profile?.city ?? 'Unknown'`.\n\n### Limits\n\nOptional chaining cannot be used on the left side of assignment (`user?.name = 'Ada'` is invalid). It also does not catch errors thrown by an existing getter or method; it only avoids accessing through `null` or `undefined`.",
    diagrams: [
      {
        title: "Optional chain decision path",
        ascii: `user?.profile?.city
  |
  +-- user is null or undefined? yes -> undefined
  |
  no
  v
profile is null or undefined? yes -> undefined
  |
  no
  v
read city`,
        caption:
          "Each optional hop guards only the value immediately before it.",
      },
    ],
    codeExamples: [
      {
        title: "Property, element, and call forms",
        descriptionMD:
          "Optional chaining is available for the three access patterns you use most often.",
        language: "javascript",
        code: `const user = {
  profile: {
    addresses: [{ city: 'London' }]
  }
};

const missingUser = null;
const onComplete = undefined;

console.log(user?.profile?.addresses?.[0]?.city);
console.log(missingUser?.profile?.name);
console.log(onComplete?.('done'));`,
      },
      {
        title: "Pairing with nullish coalescing",
        descriptionMD:
          "Optional chaining returns `undefined`; `??` provides a default only for nullish results.",
        language: "javascript",
        code: `function getDisplayCity(user) {
  return user?.profile?.city ?? 'Unknown';
}

console.log(getDisplayCity({ profile: { city: '' } }));
console.log(getDisplayCity({ profile: {} }));
console.log(getDisplayCity(null));`,
      },
    ],
    playground: [
      {
        title: "Inspect short-circuiting",
        descriptionMD:
          "The index expression is not evaluated when the left side is nullish.",
        code: `let index = 0;
const users = null;

const firstName = users?.[index++]?.name;

console.log(firstName);
console.log(index);

const realUsers = [{ name: 'Ada' }];
console.log(realUsers?.[index++]?.name);
console.log(index);`,
      },
    ],
    outputPredictions: [
      {
        code: `let calls = 0;
const user = null;

const result = user?.profile?.getCity(calls++);

console.log(result);
console.log(calls);`,
        answer: "undefined\n0",
        explanationMD:
          "The chain short-circuits at `user` because it is `null`. The optional call is never reached, so the argument expression `calls++` is not evaluated.",
      },
      {
        code: `const user = {
  profile: {
    getName: function () {
      return 'Ada';
    }
  }
};

console.log(user?.profile?.getName?.());
console.log(user?.settings?.theme ?? 'light');`,
        answer: "Ada\nlight",
        explanationMD:
          "The method exists, so it is called and returns `Ada`. The `settings` property is missing, so the optional chain returns `undefined`, and `??` supplies `light`.",
      },
    ],
    codingExercises: [
      {
        title: "Read a safe profile summary",
        difficulty: "Easy",
        promptMD:
          "Implement `profileSummary(user)` so it returns `{ name, city, company }`. Use optional chaining and nullish coalescing so missing values become `'Unknown'`, but an empty string is preserved.",
        hints: [
          "Use `user?.profile?.name` for nested reads.",
          "Use `??`, not `||`, to preserve empty strings.",
          "Return a plain object with three keys.",
        ],
        solutionCode: `function profileSummary(user) {
  return {
    name: user?.profile?.name ?? 'Unknown',
    city: user?.profile?.address?.city ?? 'Unknown',
    company: user?.work?.company ?? 'Unknown'
  };
}

console.log(profileSummary({
  profile: {
    name: '',
    address: {}
  }
}));`,
        complexity: { time: "O(1)", space: "O(1)" },
        explanationMD:
          "Optional chaining safely reads each nested path. Nullish coalescing supplies a default only when the result is `null` or `undefined`, so an empty string remains a meaningful value.",
      },
    ],
    interviewQuestions: [
      {
        question: "What exactly does optional chaining guard against?",
        answerMD:
          "It guards against the value immediately to its left being `null` or `undefined`. If that value is nullish, the chain returns `undefined`. It does not guard against other falsy values, and it does not suppress errors thrown by existing getters or methods.",
        companies: ["Amazon", "Meta"],
      },
      {
        question: "Why might `user?.profile.name` still throw?",
        answerMD:
          "Only `user` is optional in that expression. If `user` exists but `profile` is `undefined`, then `.name` is attempted on `undefined` and throws. Use `user?.profile?.name` when both levels are optional.",
        followUps: [
          "How does optional call syntax work?",
          "What value does an optional chain produce when it short-circuits?",
        ],
      },
    ],
    quiz: [
      {
        question: "What is the result of `null?.x`?",
        options: ["null", "undefined", "false", "ReferenceError"],
        correctIndex: 1,
        explanationMD:
          "Optional chaining short-circuits to `undefined` when the value to the left is `null` or `undefined`.",
      },
      {
        question: "Which expression safely calls `onDone` only if it exists?",
        options: [
          "onDone?()",
          "onDone?.()",
          "onDone.?",
          "?.onDone()",
        ],
        correctIndex: 1,
        explanationMD:
          "Optional call syntax is `fn?.(args)`. It calls the function only when the left side is not nullish.",
      },
    ],
    summary: [
      "Optional chaining guards property access, element access, and function calls against `null` and `undefined`.",
      "Each `?.` protects only the value immediately to its left.",
      "A short-circuited optional chain returns `undefined` and skips later side effects in the chain.",
      "Combine `?.` with `??` to provide defaults without replacing valid falsy values.",
    ],
    cheatSheetMD:
      "**Property:** `obj?.prop`.\n\n**Element:** `arr?.[index]`.\n\n**Call:** `callback?.(value)`.\n\n**Nested:** use `?.` at every uncertain level: `user?.profile?.city`.\n\n**Default:** `user?.profile?.city ?? 'Unknown'`.",
  },
  {
    slug: "js-nullish-coalescing",
    moduleId: "es6-features",
    order: 77,
    title: "Nullish Coalescing",
    difficulty: "Intermediate",
    estimatedReadingMin: 9,
    estimatedPracticeMin: 7,
    tags: ["Nullish Coalescing", "ES2020", "Defaults", "Falsy Values"],
    introMD:
      "Nullish coalescing (`??`) returns its right-hand value only when the left-hand value is `null` or `undefined`. It exists because `||` treats every falsy value as missing, which breaks valid values like `0`, `false`, and `\"\"`.\n\nUse `??` when the question is \"is this value absent?\" rather than \"is this value truthy?\".",
    whyItMattersMD:
      "Configuration, pagination, feature flags, form inputs, and numeric settings often use valid falsy values. A senior engineer must not accidentally replace `0` with a default timeout or `false` with `true`. Interviewers love this distinction because it reveals whether you understand JavaScript truthiness versus nullish absence.",
    theoryMD:
      "### The rule\n\n`left ?? right` evaluates to `right` only when `left` is `null` or `undefined`. Otherwise it evaluates to `left`.\n\n### `??` vs `||`\n\n`||` uses truthiness. It falls back for `0`, `false`, `\"\"`, `NaN`, `null`, and `undefined`. `??` falls back only for `null` and `undefined`.\n\n| Value | `value || 'x'` | `value ?? 'x'` |\n| --- | --- | --- |\n| `0` | `'x'` | `0` |\n| `false` | `'x'` | `false` |\n| `\"\"` | `'x'` | `\"\"` |\n| `null` | `'x'` | `'x'` |\n| `undefined` | `'x'` | `'x'` |\n\n### Mixing with `||` or `&&`\n\nJavaScript intentionally forbids mixing `??` with `||` or `&&` without parentheses. `a ?? b || c` is a SyntaxError. Write `(a ?? b) || c` or `a ?? (b || c)` to show the intended precedence.\n\n### Pairing with optional chaining\n\nOptional chaining often produces `undefined`, so `??` is its natural defaulting partner: `user?.settings?.theme ?? 'light'`.",
    diagrams: [
      {
        title: "Nullish coalescing decision",
        ascii: `value ?? fallback
  |
  +-- value is null?       yes -> fallback
  |
  +-- value is undefined?  yes -> fallback
  |
  no
  v
value is returned, even if it is 0, false, empty string, or NaN`,
        caption:
          "`??` is about absence, not truthiness.",
      },
    ],
    codeExamples: [
      {
        title: "Preserving valid falsy values",
        descriptionMD:
          "`??` keeps intentional values that `||` would replace.",
        language: "javascript",
        code: `const config = {
  retries: 0,
  verbose: false,
  label: ''
};

console.log(config.retries || 3);
console.log(config.retries ?? 3);

console.log(config.verbose || true);
console.log(config.verbose ?? true);

console.log(config.label || 'untitled');
console.log(config.label ?? 'untitled');`,
      },
      {
        title: "Parenthesize when combining operators",
        descriptionMD:
          "Mixing `??` with `||` or `&&` requires parentheses so the intent is explicit.",
        language: "javascript",
        code: `const envValue = null;
const fileValue = '';
const fallback = 'default';

const preferNullishThenTruthy = (envValue ?? fileValue) || fallback;
const preferTruthyInsideFallback = envValue ?? (fileValue || fallback);

console.log(preferNullishThenTruthy);
console.log(preferTruthyInsideFallback);`,
      },
    ],
    playground: [
      {
        title: "Default settings correctly",
        descriptionMD:
          "Toggle the values and compare `??` with `||`.",
        code: `const settings = {
  pageSize: 0,
  darkMode: false,
  nickname: ''
};

console.log(settings.pageSize ?? 20);
console.log(settings.pageSize || 20);
console.log(settings.darkMode ?? true);
console.log(settings.darkMode || true);
console.log(settings.nickname ?? 'guest');
console.log(settings.nickname || 'guest');`,
      },
    ],
    outputPredictions: [
      {
        code: `const values = [0, false, '', null, undefined];

for (const value of values) {
  console.log(String(value ?? 'fallback') + '|' + String(value || 'fallback'));
}`,
        answer: "0|fallback\nfalse|fallback\n|fallback\nfallback|fallback\nfallback|fallback",
        explanationMD:
          "`??` preserves `0`, `false`, and the empty string because they are not nullish. `||` replaces every falsy value with the fallback.",
      },
      {
        code: `try {
  eval('const result = null ?? false || true;');
} catch (error) {
  console.log(error.name);
}`,
        answer: "SyntaxError",
        explanationMD:
          "JavaScript forbids mixing `??` with `||` without parentheses. The parser throws a SyntaxError before any result can be computed.",
      },
    ],
    codingExercises: [
      {
        title: "Apply configuration defaults safely",
        difficulty: "Easy",
        promptMD:
          "Implement `withDefaults(options)` so `retries` defaults to `3`, `timeoutMs` defaults to `1000`, and `enabled` defaults to `true`. Preserve explicit values `0` and `false`.",
        hints: [
          "Use `??`, not `||`.",
          "Destructure or read properties directly.",
          "A missing property evaluates to `undefined`.",
        ],
        solutionCode: `function withDefaults(options) {
  return {
    retries: options.retries ?? 3,
    timeoutMs: options.timeoutMs ?? 1000,
    enabled: options.enabled ?? true
  };
}

console.log(withDefaults({
  retries: 0,
  enabled: false
}));`,
        complexity: { time: "O(1)", space: "O(1)" },
        explanationMD:
          "`??` only falls back for `null` or `undefined`, so `0` and `false` remain intentional configuration values.",
      },
    ],
    interviewQuestions: [
      {
        question: "When should you use `??` instead of `||` for defaults?",
        answerMD:
          "Use `??` when only `null` and `undefined` mean missing. Use `||` when any falsy value should trigger the fallback. For configuration and user input, `??` is usually safer because `0`, `false`, and `\"\"` can be valid values.",
        companies: ["Stripe", "Microsoft", "Amazon"],
      },
      {
        question: "Why is `a ?? b || c` a SyntaxError?",
        answerMD:
          "The language disallows mixing `??` with `||` or `&&` without parentheses to avoid ambiguous-looking expressions. Write `(a ?? b) || c` or `a ?? (b || c)` depending on the intended grouping.",
        followUps: [
          "How does `??` pair with optional chaining?",
          "Does `NaN ?? 1` return `NaN` or `1`?",
        ],
      },
    ],
    quiz: [
      {
        question: "What is `0 ?? 10`?",
        options: ["0", "10", "null", "SyntaxError"],
        correctIndex: 0,
        explanationMD:
          "`0` is falsy but not nullish, so `??` returns `0`.",
      },
      {
        question: "Which expression is valid and explicit?",
        options: [
          "a ?? b || c",
          "a || b ?? c",
          "(a ?? b) || c",
          "a ?? || c",
        ],
        correctIndex: 2,
        explanationMD:
          "Parentheses are required when combining `??` with `||` or `&&`.",
      },
    ],
    summary: [
      "`??` falls back only for `null` and `undefined`.",
      "`||` falls back for all falsy values, including `0`, `false`, and `\"\"`.",
      "Mixing `??` with `||` or `&&` requires parentheses.",
      "Optional chaining plus nullish coalescing is the standard safe-default pattern.",
    ],
    cheatSheetMD:
      "**Rule:** `value ?? fallback` uses `fallback` only for `null` or `undefined`.\n\n**Preserves:** `0`, `false`, `\"\"`, and `NaN`.\n\n**Common pair:** `user?.profile?.city ?? 'Unknown'`.\n\n**Parentheses:** use `(a ?? b) || c` or `a ?? (b || c)`; do not mix ungrouped.",
  },
  {
    slug: "js-modules",
    moduleId: "es6-features",
    order: 78,
    title: "ES Modules",
    difficulty: "Advanced",
    estimatedReadingMin: 11,
    estimatedPracticeMin: 6,
    tags: ["ES Modules", "ESM", "Bundlers", "Tree Shaking", "CommonJS"],
    introMD:
      "ES Modules are JavaScript's standard module system. They use static `import` and `export` declarations so tools can understand dependencies before code runs.\n\nThis static structure enables strong editor tooling, bundler optimization, tree-shaking, circular-dependency handling through live bindings, and a cleaner alternative to older CommonJS `require` patterns.",
    whyItMattersMD:
      "Production JavaScript is shipped as modules. Staff-level engineers must explain how module graphs load, why imports are live read-only bindings, why static imports help bundlers, and how ESM differs from CommonJS in Node and browser environments.",
    theoryMD:
      "### Static structure\n\nESM imports and exports are declarations, not ordinary runtime function calls. They must appear at the top level of a module, and their specifiers are string literals. This lets parsers and bundlers build a module graph without executing the program.\n\n### Module loading phases\n\nConceptually, ESM has three phases:\n\n1. **Parse and link** — discover imports/exports and connect bindings across modules.\n2. **Instantiate** — create the module environment records.\n3. **Evaluate** — run module code in dependency order.\n\n### Live bindings\n\nNamed exports are live bindings. If a module exports `let count`, importers observe updates to `count`; they do not receive a frozen copy. Importers cannot reassign imported bindings, but they can see the exporter update them.\n\n### Tree-shaking\n\nBecause imports and exports are static, bundlers can remove unused exports when modules are side-effect safe. This is much harder with dynamic CommonJS patterns.\n\n### ESM vs CommonJS\n\nCommonJS uses `require()` and `module.exports`, traditionally evaluated dynamically at runtime. ESM uses `import` and `export`, has live bindings, is always strict mode, and supports asynchronous loading semantics in environments that need it.",
    diagrams: [
      {
        title: "Static module graph",
        ascii: `app.js
  |
  +--> user-service.js
  |       |
  |       +--> http-client.js
  |
  +--> format-date.js

Parser can discover this graph before running app.js`,
        caption:
          "Static imports let tools link, analyze, and optimize the dependency graph ahead of evaluation.",
      },
    ],
    codeExamples: [
      {
        title: "Named exports and live bindings",
        descriptionMD:
          "This read-only example shows standard module syntax. Do not paste it into the sandbox as one file; each comment represents a separate module file.",
        language: "javascript",
        code: `// counter.js
export let count = 0;

export function increment() {
  count += 1;
}

// app.js
import { count, increment } from './counter.js';

console.log(count);
increment();
console.log(count);

// Invalid because imported bindings are read-only in the importer:
// count = 10;`,
      },
      {
        title: "ESM contrasted with CommonJS",
        descriptionMD:
          "Static ESM is easier for tools to analyze than dynamic CommonJS require patterns.",
        language: "javascript",
        code: `// ESM
import { readFile } from 'node:fs/promises';
export function loadText(path) {
  return readFile(path, 'utf8');
}

// CommonJS
const fs = require('node:fs/promises');
module.exports.loadText = function loadText(path) {
  return fs.readFile(path, 'utf8');
};`,
      },
    ],
    playground: [
      {
        title: "Simulate a live module binding",
        descriptionMD:
          "The sandbox cannot execute module declarations, so this object getter models the live-read behavior importers observe.",
        code: `const moduleScope = {
  count: 0
};

const namespace = {
  get count() {
    return moduleScope.count;
  },
  increment: function () {
    moduleScope.count += 1;
  }
};

console.log(namespace.count);
namespace.increment();
console.log(namespace.count);`,
      },
    ],
    outputPredictions: [
      {
        code: `const moduleScope = { count: 0 };
const namespace = {};

Object.defineProperty(namespace, 'count', {
  get: function () {
    return moduleScope.count;
  }
});

const snapshot = namespace.count;
moduleScope.count += 1;

console.log(snapshot);
console.log(namespace.count);`,
        answer: "0\n1",
        explanationMD:
          "The `snapshot` variable stores the old value. The namespace getter reads the current module state each time, similar to how ESM imports observe live bindings.",
      },
    ],
    codingExercises: [
      {
        title: "Find unused exports from static metadata",
        difficulty: "Medium",
        promptMD:
          "A bundler has collected static metadata. Implement `unusedExports(exports, used)` so it returns export names that are not used by any importer.",
        hints: [
          "Convert the used names into a `Set`.",
          "Filter the export list.",
          "Do not mutate the input arrays.",
        ],
        solutionCode: `function unusedExports(exportsList, usedList) {
  const used = new Set(usedList);

  return exportsList.filter(function (name) {
    return !used.has(name);
  });
}

console.log(unusedExports(
  ['formatDate', 'parseDate', 'debugOnly'],
  ['formatDate']
));`,
        complexity: { time: "O(n + m)", space: "O(m)" },
        explanationMD:
          "Static module metadata lets tools compare exported bindings with imported bindings. Real tree-shaking also considers side effects, but the core reachability idea is similar.",
      },
    ],
    interviewQuestions: [
      {
        question: "Why are ES Modules easier to tree-shake than CommonJS?",
        answerMD:
          "ESM uses static top-level `import` and `export` declarations, so bundlers can build the dependency graph and determine which bindings are referenced before executing code. CommonJS `require()` can be conditional or computed at runtime, which makes safe static analysis harder.",
        companies: ["Google", "Meta", "Vercel"],
        followUps: [
          "What can still prevent tree-shaking?",
          "Why do package side effects matter?",
        ],
      },
      {
        question: "What does it mean that ESM imports are live bindings?",
        answerMD:
          "An imported binding is a read-only view of the exported binding, not a copied value. If the exporting module updates the binding, importers observe the new value. The importer itself cannot reassign the imported name.",
      },
      {
        question: "How does ESM differ from CommonJS?",
        answerMD:
          "ESM uses static `import`/`export`, live bindings, strict mode, and a linked module graph. CommonJS uses runtime `require()` and `module.exports`, often returns object snapshots, and historically loads synchronously in Node.",
      },
    ],
    quiz: [
      {
        question: "Which ESM property enables tree-shaking?",
        options: [
          "Imports are top-level static declarations",
          "Modules run in sloppy mode",
          "Exports are always default exports",
          "Imports can be reassigned by importers",
        ],
        correctIndex: 0,
        explanationMD:
          "Static top-level import/export declarations allow tools to analyze the dependency graph before runtime.",
      },
      {
        question: "What is true about an imported ESM binding?",
        options: [
          "It is a deep clone of the exported value",
          "It is a live read-only view from the importer",
          "It can always be reassigned by the importer",
          "It exists only after a function calls require",
        ],
        correctIndex: 1,
        explanationMD:
          "ESM imports are live bindings. Importers can observe exporter updates but cannot reassign the imported binding.",
      },
    ],
    summary: [
      "ES Modules are JavaScript's standard static module system.",
      "Static `import`/`export` lets tools build dependency graphs before execution.",
      "ESM imports are live read-only views of exported bindings.",
      "Tree-shaking depends on static structure and side-effect-safe modules.",
      "CommonJS is runtime-oriented; ESM is statically linked.",
    ],
    cheatSheetMD:
      "**Named export:** `export function fn() {}` and `import { fn } from './mod.js'`.\n\n**Default export:** one primary value per module: `export default value`.\n\n**Live binding:** importer sees exporter updates but cannot reassign imports.\n\n**Tree-shaking:** static imports/exports plus side-effect information.\n\n**CommonJS:** `require()` / `module.exports`; more dynamic, harder to analyze.",
  },
  {
    slug: "js-import-export",
    moduleId: "es6-features",
    order: 79,
    title: "import / export",
    difficulty: "Advanced",
    estimatedReadingMin: 11,
    estimatedPracticeMin: 6,
    tags: ["import", "export", "ES Modules", "Named Exports", "Default Exports"],
    introMD:
      "`import` and `export` are the declarations that make ES Modules work. Exports decide what a module exposes; imports decide which bindings another module consumes.\n\nThe syntax looks simple, but interviews probe details: named versus default exports, aliases, namespace imports, re-exports, barrels, live read-only bindings, and why static imports cannot be placed inside `if` blocks.",
    whyItMattersMD:
      "Clear module boundaries are a production engineering skill. Good import/export structure improves bundle size, testability, dependency direction, and code review readability. It also prevents common mistakes such as default/named import mismatches and circular barrel dependencies.",
    theoryMD:
      "### Named exports\n\nNamed exports expose one or more bindings by name. Importers must use the exported name or an alias: `import { formatDate as format } from './date.js'`. Named exports are best when a module has several public utilities.\n\n### Default exports\n\nA module can have one default export. Importers choose any local name: `import Button from './Button.js'`. Defaults are common for primary components or classes, but named exports often refactor better because tooling can track names more explicitly.\n\n### Namespace imports\n\n`import * as date from './date.js'` collects the module namespace into an object-like value. It is useful when you want to group related exports, but it can make tree-shaking less obvious in some toolchains if overused.\n\n### Re-exports and barrels\n\nA barrel file re-exports from several modules, often through `export { Button } from './Button.js'`. Barrels improve public APIs but can create accidental cycles or pull in side effects if used carelessly.\n\n### Static import constraints\n\nStatic imports must be top-level. Use dynamic `import()` when you need conditional or lazy loading. Static imports are hoisted and linked before the module body evaluates.",
    diagrams: [
      {
        title: "Export surface and import choices",
        ascii: `date.js exports:
  formatDate
  parseDate
  default locale

consumer choices:
  named import       -> one binding by exported name
  default import     -> the module's primary value
  namespace import   -> object-like namespace of exports
  re-export          -> pass bindings through another module`,
        caption:
          "Choosing the right import/export form makes module APIs easier to read and optimize.",
      },
    ],
    codeExamples: [
      {
        title: "Named, default, alias, and namespace imports",
        descriptionMD:
          "This read-only sample uses separate files. Static imports belong at the top level of an ES module.",
        language: "javascript",
        code: `// math.js
export const PI = 3.14159;

export function area(radius) {
  return PI * radius * radius;
}

export default function diameter(radius) {
  return radius * 2;
}

// app.js
import diameter, { PI, area as circleArea } from './math.js';
import * as math from './math.js';

console.log(PI);
console.log(circleArea(2));
console.log(diameter(2));
console.log(math.area(3));`,
      },
      {
        title: "Re-exports and barrel files",
        descriptionMD:
          "Barrels define a stable public API, but avoid hiding large side-effectful dependency graphs behind one file.",
        language: "javascript",
        code: `// components/Button.js
export function Button(props) {
  return props.label;
}

// components/Input.js
export function Input(props) {
  return props.name;
}

// components/index.js
export { Button } from './Button.js';
export { Input } from './Input.js';

// page.js
import { Button, Input } from './components/index.js';`,
      },
      {
        title: "Dynamic import for conditional loading",
        descriptionMD:
          "Static imports are top-level. When code must load conditionally or lazily, use dynamic import in an async boundary.",
        language: "javascript",
        code: `async function loadChart(shouldLoad) {
  if (!shouldLoad) {
    return null;
  }

  const module = await import('./chart.js');
  return module.renderChart;
}`,
      },
    ],
    playground: [
      {
        title: "Model aliasing without module syntax",
        descriptionMD:
          "The sandbox cannot run import declarations, so this models choosing a local alias from a public API object.",
        code: `const mathModule = {
  area: function (radius) {
    return 3.14 * radius * radius;
  },
  diameter: function (radius) {
    return radius * 2;
  }
};

const circleArea = mathModule.area;
const primary = mathModule.diameter;

console.log(circleArea(2));
console.log(primary(2));`,
      },
    ],
    outputPredictions: [
      {
        code: `let internal = 1;
const namespace = {};

Object.defineProperty(namespace, 'value', {
  get: function () {
    return internal;
  }
});

const snapshot = namespace.value;
internal = 2;

console.log(snapshot);
console.log(namespace.value);`,
        answer: "1\n2",
        explanationMD:
          "A direct snapshot remains `1`, while the namespace getter reads the current value. This models the difference between copying a value and observing a live binding.",
      },
    ],
    codingExercises: [
      {
        title: "Classify import requests",
        difficulty: "Medium",
        promptMD:
          "Implement `classifyImports(requests)` where each request is an object with `kind` equal to `'named'`, `'default'`, or `'namespace'`. Return a count object with keys `named`, `default`, and `namespace`.",
        hints: [
          "Start from `{ named: 0, default: 0, namespace: 0 }`.",
          "Loop through each request and increment the matching key.",
          "Ignore unknown kinds defensively.",
        ],
        solutionCode: `function classifyImports(requests) {
  const counts = {
    named: 0,
    default: 0,
    namespace: 0
  };

  for (const request of requests) {
    if (Object.prototype.hasOwnProperty.call(counts, request.kind)) {
      counts[request.kind] += 1;
    }
  }

  return counts;
}

console.log(classifyImports([
  { kind: 'named' },
  { kind: 'default' },
  { kind: 'named' },
  { kind: 'namespace' }
]));`,
        complexity: { time: "O(n)", space: "O(1)" },
        explanationMD:
          "The exercise mirrors how tooling classifies module usage. Real compilers parse syntax trees; here the parsed request metadata is already provided.",
      },
    ],
    interviewQuestions: [
      {
        question: "What is the difference between named and default exports?",
        answerMD:
          "A module can have many named exports, imported by their exported names or aliases. A module can have only one default export, imported with any local name. Named exports usually improve refactoring and discoverability; default exports are convenient for a module's single primary value.",
        companies: ["Vercel", "Meta", "Microsoft"],
      },
      {
        question: "Can you put a static import inside an `if` statement?",
        answerMD:
          "No. Static `import` declarations must be at the top level of an ES module so the module graph can be linked before evaluation. For conditional or lazy loading, use dynamic `import()`.",
        followUps: [
          "What does a namespace import contain?",
          "When can barrel files hurt a codebase?",
        ],
      },
      {
        question: "Why might a named/default import mismatch fail?",
        answerMD:
          "Named imports must match named exports exactly unless aliased. Default imports read the module's default export. Importing `{ Button }` from a module that only has `export default Button` asks for a named export that does not exist.",
      },
    ],
    quiz: [
      {
        question: "How many default exports can one ES module have?",
        options: ["Zero or one", "Exactly two", "Unlimited", "One per named export"],
        correctIndex: 0,
        explanationMD:
          "A module may have no default export or exactly one default export. It can have many named exports.",
      },
      {
        question: "Which statement about static imports is true?",
        options: [
          "They can appear inside any block.",
          "They are top-level declarations linked before module evaluation.",
          "They return promises.",
          "They use CommonJS `module.exports`.",
        ],
        correctIndex: 1,
        explanationMD:
          "Static imports are top-level ESM declarations. Dynamic `import()` is the promise-based form.",
      },
    ],
    summary: [
      "Named exports expose bindings by name; default export exposes one primary value.",
      "Imports can alias named exports and can collect exports through namespace imports.",
      "Re-export barrels shape public APIs but can hide dependency and side-effect costs.",
      "Static imports must be top-level; dynamic `import()` handles conditional or lazy loading.",
      "Imported ESM bindings are live read-only views.",
    ],
    cheatSheetMD:
      "**Named:** `export const x = 1`; `import { x } from './m.js'`.\n\n**Alias:** `import { x as value } from './m.js'`.\n\n**Default:** `export default Thing`; `import Thing from './Thing.js'`.\n\n**Namespace:** `import * as api from './api.js'`.\n\n**Re-export:** `export { Button } from './Button.js'`.\n\n**Dynamic:** `const mod = await import('./heavy.js')`.",
  },
];
