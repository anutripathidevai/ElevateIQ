import type { Topic } from "../../types";

export const TOPICS: Topic[] = [
  {
    slug: "js-currying",
    moduleId: "advanced",
    order: 80,
    title: "Currying",
    difficulty: "Advanced",
    estimatedReadingMin: 13,
    estimatedPracticeMin: 22,
    tags: ["Currying", "Functional Programming", "Closures", "Machine Coding"],
    introMD: "Currying transforms a function that expects multiple arguments into a chain of functions that can receive those arguments gradually. `sum(a, b, c)` becomes something that can be called as `sum(1)(2)(3)`, `sum(1, 2)(3)`, or `sum(1)(2, 3)` depending on the implementation.\n\nIn interviews, currying is less about clever syntax and more about closures, arity, partial application, argument collection, and preserving `this` when forwarding a final call.",
    whyItMattersMD: "Currying appears in machine-coding rounds because it combines rest arguments, closures, recursion, `Function.length`, and `apply`. It also appears in production through validators, logging helpers, Redux-style middleware, and function composition utilities.",
    theoryMD: "### Core idea\n\nA normal function consumes all required inputs in one call. A curried function keeps returning another function until it has collected enough arguments to call the original function. The collected arguments live inside closures.\n\n### Arity and completion\n\nMost interview implementations use `fn.length`, the number of declared parameters before the first default or rest parameter, as the target arity. When collected arguments are at least that count, call the original function. Otherwise return another collector.\n\n### Mixed partial calls\n\nA strong `curry` accepts more than one argument per step. Each new call concatenates the old arguments with the new arguments. That supports `curried(1)(2)(3)`, `curried(1, 2)(3)`, and `curried(1)(2, 3)` with one implementation.\n\n### Pitfalls\n\nForgetting to concatenate arguments, losing `this`, and relying blindly on `fn.length` for functions with default or rest parameters are the common bugs.",
    diagrams: [
      {
        title: "Argument collection across calls",
        ascii: `curried(1) stores [1]
   |
returns a collector
   |
collector(2, 3) concatenates [1] + [2, 3]
   |
collected enough arguments
   |
call original function`,
        caption: "Each partial call closes over the arguments collected so far.",
      },
    ],
    codeExamples: [
      {
        title: "A curry helper with mixed partial application",
        descriptionMD: "The helper concatenates arguments at every step and forwards the final call with `apply`.",
        language: "javascript",
        code: `function curry(fn) {
  return function curried() {
    var args = Array.prototype.slice.call(arguments);

    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }

    return function () {
      var nextArgs = Array.prototype.slice.call(arguments);
      return curried.apply(this, args.concat(nextArgs));
    };
  };
}

function add3(a, b, c) {
  return a + b + c;
}

var add = curry(add3);
console.log(add(1)(2)(3));
console.log(add(1, 2)(3));
console.log(add(1)(2, 3));`,
      },
    ],
    playground: [
      {
        title: "Try different groupings",
        descriptionMD: "All calls collect the same final argument list before execution.",
        code: `function curry(fn) {
  return function curried() {
    var args = Array.prototype.slice.call(arguments);
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function () {
      var more = Array.prototype.slice.call(arguments);
      return curried.apply(this, args.concat(more));
    };
  };
}

function join3(a, b, c) {
  return a + '-' + b + '-' + c;
}

var join = curry(join3);
console.log(join('A')('B')('C'));
console.log(join('A', 'B')('C'));
console.log(join('A')('B', 'C'));`,
      },
    ],
    outputPredictions: [
      {
        code: `function curry(fn) {
  return function curried() {
    var args = Array.prototype.slice.call(arguments);
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function () {
      var more = Array.prototype.slice.call(arguments);
      return curried.apply(this, args.concat(more));
    };
  };
}

function join(a, b, c) {
  return a + '-' + b + '-' + c;
}

var curried = curry(join);
console.log(curried('A')('B')('C'));
console.log(curried('A', 'B')('C'));
console.log(curried('A')('B', 'C'));`,
        answer: "A-B-C\nA-B-C\nA-B-C",
        explanationMD: "`join.length` is `3`. Every call path eventually collects `A`, `B`, and `C`, then invokes the original function.",
      },
    ],
    codingExercises: [
      {
        title: "Implement curry with mixed partial calls",
        difficulty: "Medium",
        promptMD: "Write `curry(fn)` so the returned function can be called with any grouping of arguments until `fn.length` arguments have been collected. Preserve the call-time `this` value when invoking the original function.",
        hints: ["Use `fn.length` as the required arity.", "Convert `arguments` to an array and concatenate old and new arguments.", "Use `apply` for the final invocation so the receiver is not lost."],
        solutionCode: `function curry(fn) {
  return function curried() {
    var collected = Array.prototype.slice.call(arguments);

    if (collected.length >= fn.length) {
      return fn.apply(this, collected);
    }

    return function () {
      var next = Array.prototype.slice.call(arguments);
      return curried.apply(this, collected.concat(next));
    };
  };
}

function multiply(a, b, c) {
  return a * b * c;
}

var curriedMultiply = curry(multiply);
console.log(curriedMultiply(2)(3)(4));
console.log(curriedMultiply(2, 3)(4));
console.log(curriedMultiply(2)(3, 4));`,
        complexity: { time: "O(k) per partial step to copy k collected arguments", space: "O(k) for collected arguments" },
        explanationMD: "Each partial call captures the arguments collected so far. When the count reaches the original function's arity, the implementation forwards the full argument list with the current receiver.",
      },
    ],
    interviewQuestions: [
      {
        question: "What is currying, and how is it different from partial application?",
        answerMD: "Currying transforms a multi-argument function into staged calls that gather arguments over time. Partial application fixes some arguments and returns a function for the rest. A curry helper often enables partial application, but the concepts are not identical.",
        companies: ["Meta", "Amazon", "Microsoft"],
        followUps: ["How would you support placeholders?", "What happens with default parameters?"],
      },
      {
        question: "Why does a curry implementation use closures?",
        answerMD: "Each returned function must remember the arguments collected by previous calls. Closures keep that private state alive until enough arguments have been gathered.",
      },
    ],
    quiz: [
      {
        question: "When should a basic curry helper call the original function?",
        options: ["When exactly one argument is received", "When collected arguments are at least `fn.length`", "Only when no arguments are passed", "Only if the original function returns another function"],
        correctIndex: 1,
        explanationMD: "A standard interview curry uses `fn.length` as the target arity and invokes the function once enough arguments are collected.",
      },
    ],
    summary: ["Currying collects arguments across multiple calls using closures.", "A robust helper supports mixed groups by concatenating arguments.", "`fn.length` is the common arity signal, with caveats for default and rest parameters.", "Use `apply` when forwarding the final call to avoid losing `this`."],
    cheatSheetMD: "**Currying:** turn `fn(a, b, c)` into staged calls.\n\n**Completion:** call original when collected args `>= fn.length`.\n\n**Tools:** closures, argument arrays, concatenation, `apply`.\n\n**Pitfall:** default and rest parameters change what `fn.length` reports.",
  },
  {
    slug: "js-memoization",
    moduleId: "advanced",
    order: 81,
    title: "Memoization",
    difficulty: "Advanced",
    estimatedReadingMin: 14,
    estimatedPracticeMin: 24,
    tags: ["Memoization", "Caching", "Map", "Dynamic Programming"],
    introMD: "Memoization caches the result of a function call so repeated calls with the same inputs can return instantly. It is one of the most common optimization patterns in JavaScript interviews because it turns repeated work into a cache lookup.\n\nA complete answer also discusses key generation, purity, memory growth, invalidation, and whether arguments can be serialized safely.",
    whyItMattersMD: "Memoization powers dynamic programming, derived selectors, expensive formatting, search suggestions, compiler caches, and API-layer deduplication. It tests both implementation skill and performance judgment.",
    theoryMD: "### What can be memoized\n\nMemoization is safest for pure functions: the same arguments always produce the same result and the function has no important side effects. If the function depends on time, random values, mutable external state, or network data, caching may return stale results.\n\n### Map-based cache\n\nA `Map` is a better default than a plain object because it avoids prototype collisions, has a clear `has` method, and preserves insertion order for LRU eviction. For primitive interview inputs, `JSON.stringify(args)` is a common key.\n\n### Serialization trade-offs\n\n`JSON.stringify` is convenient but imperfect. It drops some values, cannot serialize functions or symbols, throws on cycles, and treats object property order as part of the key. Production caches often accept a custom resolver or use nested maps keyed by identity.\n\n### Cache growth\n\nA memoized function can leak memory if the cache grows forever. Stronger versions expose `clear`, enforce `maxSize`, or use time-based expiration.",
    diagrams: [
      {
        title: "Memoized call flow",
        ascii: `call fn(2, 3)
   |
serialize args -> [2,3]
   |
cache has key? -- yes --> return cached result
   |
  no
   |
compute original function
   |
store result in Map
   |
return result`,
        caption: "Only cache misses run the expensive function.",
      },
    ],
    codeExamples: [
      {
        title: "Map-based memoize",
        descriptionMD: "The default key uses serialized arguments. A resolver can replace that for custom keys.",
        language: "javascript",
        code: `function memoize(fn, resolver) {
  var cache = new Map();

  return function () {
    var args = Array.prototype.slice.call(arguments);
    var key = resolver ? resolver.apply(this, args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    var result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

var square = memoize(function (n) {
  return n * n;
});

console.log(square(9));
console.log(square(9));`,
      },
    ],
    playground: [
      {
        title: "Watch hits and misses",
        descriptionMD: "The second identical call returns from cache without running the original function.",
        code: `function memoize(fn) {
  var cache = new Map();
  return function () {
    var args = Array.prototype.slice.call(arguments);
    var key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log('cache hit ' + key);
      return cache.get(key);
    }
    console.log('cache miss ' + key);
    var result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

var add = memoize(function (a, b) {
  console.log('computing');
  return a + b;
});

console.log(add(2, 3));
console.log(add(2, 3));
console.log(add(3, 2));`,
      },
    ],
    outputPredictions: [
      {
        code: `function memoize(fn) {
  var cache = new Map();
  return function () {
    var args = Array.prototype.slice.call(arguments);
    var key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log('hit ' + key);
      return cache.get(key);
    }
    console.log('miss ' + key);
    var result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

var add = memoize(function (a, b) {
  console.log('compute');
  return a + b;
});

console.log(add(2, 3));
console.log(add(2, 3));
console.log(add(3, 2));`,
        answer: "miss [2,3]\ncompute\n5\nhit [2,3]\n5\nmiss [3,2]\ncompute\n5",
        explanationMD: "The first `[2,3]` call computes. The second `[2,3]` call returns the cached value. `[3,2]` is a different serialized key.",
      },
    ],
    codingExercises: [
      {
        title: "Memoize with a maximum cache size",
        difficulty: "Hard",
        promptMD: "Implement `memoize(fn, options)` using a `Map`. Use `JSON.stringify(args)` by default, allow an optional `resolver`, and evict the least recently used entry when `maxSize` is exceeded.",
        hints: ["A `Map` preserves insertion order.", "On a hit, delete and reinsert the key to mark it as most recently used.", "When size is too large, evict `cache.keys().next().value`."],
        solutionCode: `function memoize(fn, options) {
  var settings = options || {};
  var maxSize = settings.maxSize || Infinity;
  var resolver = settings.resolver;
  var cache = new Map();

  function memoized() {
    var args = Array.prototype.slice.call(arguments);
    var key = resolver ? resolver.apply(this, args) : JSON.stringify(args);

    if (cache.has(key)) {
      var cached = cache.get(key);
      cache.delete(key);
      cache.set(key, cached);
      return cached;
    }

    var result = fn.apply(this, args);
    cache.set(key, result);

    if (cache.size > maxSize) {
      var oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    return result;
  }

  memoized.clear = function () {
    cache.clear();
  };

  return memoized;
}

var double = memoize(function (n) {
  return n * 2;
}, { maxSize: 2 });

console.log(double(1));
console.log(double(2));
console.log(double(1));
console.log(double(3));`,
        complexity: { time: "O(s) to serialize arguments plus O(1) average Map operations", space: "O(m) for up to m cached entries" },
        explanationMD: "The `Map` stores results and acts as an LRU list. Re-inserting a hit moves it to the newest position; the first key is the least recently used entry.",
      },
    ],
    interviewQuestions: [
      {
        question: "When is memoization unsafe?",
        answerMD: "It is unsafe when the function is not pure: external mutable state, current time, random values, network data, or important side effects can make cached answers incorrect.",
        companies: ["Google", "Amazon", "Netflix"],
        followUps: ["How would you prevent unbounded memory growth?", "How would you memoize object arguments by identity?"],
      },
      {
        question: "Why use `Map` instead of a plain object for a cache?",
        answerMD: "`Map` avoids prototype-key collisions, has reliable key APIs, preserves insertion order for eviction, and communicates key-value cache semantics clearly.",
      },
    ],
    quiz: [
      {
        question: "What is the biggest weakness of `JSON.stringify(args)` as a memoization key?",
        options: ["It cannot be used with numbers", "It is always slower than recomputation", "It cannot represent all JavaScript values and fails on cycles", "It prevents using `Map`"],
        correctIndex: 2,
        explanationMD: "Serialization is convenient but lossy. Functions, symbols, `undefined`, object identity, property order, and cycles need special handling.",
      },
    ],
    summary: ["Memoization caches function results by argument key.", "It works best for pure functions with stable inputs and outputs.", "A `Map` plus serialized arguments is the standard interview implementation.", "Production-grade caches need eviction, invalidation, and better key strategies."],
    cheatSheetMD: "**Pattern:** key args → check cache → compute on miss → store result.\n\n**Default key:** `JSON.stringify(args)` for primitive inputs.\n\n**Use `Map`:** safe keys, insertion order, clear API.\n\n**Watch out:** impure functions, cycles, object identity, unbounded growth.",
  },
  {
    slug: "js-debouncing",
    moduleId: "advanced",
    order: 82,
    title: "Debouncing",
    difficulty: "Advanced",
    estimatedReadingMin: 12,
    estimatedPracticeMin: 22,
    tags: ["Debounce", "Timers", "Performance", "Machine Coding"],
    introMD: "Debouncing delays a function until calls have stopped for a specified amount of time. If a user triggers an event repeatedly, only the final call after the quiet period runs.\n\nIn interviews, debounce is the canonical timer machine-coding question. A strong answer handles trailing execution, optional leading execution, argument preservation, `this`, and cancellation.",
    whyItMattersMD: "Debouncing protects expensive work from bursty input: search boxes, resize recalculation, autosave, validation, and analytics. It tests whether you can reason about asynchronous timers and state that survives across calls.",
    theoryMD: "### Mental model\n\nEach call resets a timer. The wrapped function runs only if no new call arrives before the timer expires. That is why debounce is ideal for wait-until-the-user-pauses behavior.\n\n### Trailing vs leading\n\nTrailing debounce runs after the quiet period with the latest arguments. Leading debounce runs immediately on the first call in a burst, then suppresses later calls until the wait window closes. Some utilities support both, but the implementation must avoid double-calling a single isolated invocation.\n\n### Debounce vs throttle\n\nDebounce waits for silence. Throttle allows execution at a maximum rate. For a search input, debounce usually makes sense. For scroll progress, throttle usually makes sense.\n\n### Implementation state\n\nA debounce wrapper stores a timer id, latest arguments, and latest receiver. On every call, it clears the old timer and schedules a new one.",
    diagrams: [
      {
        title: "Debounce timeline",
        ascii: `calls:  A ---- B ---- C ---------------- D
wait:        reset reset run C after quiet   run D
output:                 C                    D`,
        caption: "Only the last call in each burst survives the quiet period.",
      },
    ],
    codeExamples: [
      {
        title: "Debounce with leading and trailing options",
        descriptionMD: "This implementation is framework-agnostic and works anywhere `setTimeout` exists.",
        language: "javascript",
        code: `function debounce(fn, wait, options) {
  var settings = options || {};
  var leading = Boolean(settings.leading);
  var trailing = settings.trailing !== false;
  var timer = null;
  var lastArgs;
  var lastThis;

  function invoke() {
    timer = null;
    if (trailing && lastArgs) {
      fn.apply(lastThis, lastArgs);
      lastArgs = null;
      lastThis = null;
    }
  }

  function debounced() {
    lastArgs = Array.prototype.slice.call(arguments);
    lastThis = this;

    var shouldCallNow = leading && timer === null;
    clearTimeout(timer);
    timer = setTimeout(invoke, wait);

    if (shouldCallNow) {
      fn.apply(lastThis, lastArgs);
      lastArgs = null;
      lastThis = null;
    }
  }

  debounced.cancel = function () {
    clearTimeout(timer);
    timer = null;
    lastArgs = null;
    lastThis = null;
  };

  return debounced;
}`,
      },
    ],
    playground: [
      {
        title: "Debounce a burst of calls",
        descriptionMD: "Calls A, B, and C are one burst, so only C runs. D is a later burst and runs separately.",
        code: `function debounce(fn, wait) {
  var timer = null;
  return function (value) {
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn(value);
    }, wait);
  };
}

var log = debounce(function (value) {
  console.log(value);
}, 20);

log('A');
setTimeout(function () { log('B'); }, 5);
setTimeout(function () { log('C'); }, 10);
setTimeout(function () { log('D'); }, 40);
setTimeout(function () { console.log('done'); }, 80);`,
      },
    ],
    outputPredictions: [
      {
        code: `function debounce(fn, wait) {
  var timer = null;
  return function (value) {
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn(value);
    }, wait);
  };
}

var log = debounce(function (value) {
  console.log(value);
}, 20);

log('A');
setTimeout(function () { log('B'); }, 5);
setTimeout(function () { log('C'); }, 10);
setTimeout(function () { log('D'); }, 40);
setTimeout(function () { console.log('done'); }, 80);`,
        answer: "C\nD\ndone",
        explanationMD: "A is replaced by B, and B is replaced by C before the 20ms quiet period ends. C runs around 30ms. D starts a new burst at 40ms and runs around 60ms, before `done` at 80ms.",
      },
    ],
    codingExercises: [
      {
        title: "Build debounce with cancel and flush",
        difficulty: "Hard",
        promptMD: "Implement `debounce(fn, wait, options)` with trailing execution by default, optional `leading`, plus `.cancel()` and `.flush()` methods. Preserve the latest arguments and `this` value.",
        hints: ["Store `timer`, `lastArgs`, and `lastThis` in the closure.", "A leading call happens only when there is no active timer.", "`flush` should immediately run a pending trailing call and clear the timer."],
        solutionCode: `function debounce(fn, wait, options) {
  var settings = options || {};
  var leading = Boolean(settings.leading);
  var trailing = settings.trailing !== false;
  var timer = null;
  var lastArgs = null;
  var lastThis = null;
  var lastResult;

  function run() {
    var args = lastArgs;
    var receiver = lastThis;
    lastArgs = null;
    lastThis = null;
    lastResult = fn.apply(receiver, args);
    return lastResult;
  }

  function onTimer() {
    timer = null;
    if (trailing && lastArgs) {
      run();
    }
  }

  function debounced() {
    lastArgs = Array.prototype.slice.call(arguments);
    lastThis = this;
    var callNow = leading && timer === null;
    clearTimeout(timer);
    timer = setTimeout(onTimer, wait);
    if (callNow) {
      run();
    }
    return lastResult;
  }

  debounced.cancel = function () {
    clearTimeout(timer);
    timer = null;
    lastArgs = null;
    lastThis = null;
  };

  debounced.flush = function () {
    if (timer === null) {
      return lastResult;
    }
    clearTimeout(timer);
    timer = null;
    if (lastArgs && trailing) {
      return run();
    }
    return lastResult;
  };

  return debounced;
}`,
        complexity: { time: "O(1) per call", space: "O(1)" },
        explanationMD: "The closure keeps one active timer and the latest call details. Repeated calls replace pending work, `cancel` drops it, and `flush` runs it immediately.",
      },
    ],
    interviewQuestions: [
      {
        question: "Explain debounce vs throttle with an example for each.",
        answerMD: "Debounce waits until calls stop, fitting search suggestions after typing pauses. Throttle runs at most once per interval, fitting scroll or resize progress updates during continuous activity.",
        companies: ["Google", "Meta", "Uber"],
        followUps: ["How do leading and trailing debounce differ?", "How would you add cancel support?"],
      },
      {
        question: "Why must debounce store the latest arguments?",
        answerMD: "The call that finally runs should represent the most recent event in the burst. Without latest arguments and receiver, the delayed call can execute with stale data or the wrong `this` value.",
      },
    ],
    quiz: [
      {
        question: "A trailing debounce is best described as:",
        options: ["Run immediately and then never again", "Run at a fixed interval while calls continue", "Run after calls have stopped for the wait period", "Run every call but in a microtask"],
        correctIndex: 2,
        explanationMD: "Trailing debounce resets the timer on each call and invokes the function after a quiet period.",
      },
    ],
    summary: ["Debounce waits for a quiet period before invoking the function.", "Trailing debounce runs with the latest arguments after the burst.", "Leading debounce runs at the start of a burst and suppresses later calls during the wait window.", "A complete implementation preserves `this`, supports cancellation, and avoids stale arguments."],
    cheatSheetMD: "**Debounce:** reset timer on every call.\n\n**Trailing:** run after silence with latest args.\n\n**Leading:** run immediately on first call in burst.\n\n**Use for:** search input, autosave, validation, resize end.\n\n**State:** timer id, latest args, latest receiver.",
  },
  {
    slug: "js-throttling",
    moduleId: "advanced",
    order: 83,
    title: "Throttling",
    difficulty: "Advanced",
    estimatedReadingMin: 12,
    estimatedPracticeMin: 22,
    tags: ["Throttle", "Timers", "Performance", "Rate Limiting"],
    introMD: "Throttling limits a function so it can run at most once per time window. Unlike debounce, it does not wait for silence; it permits periodic execution while calls continue.\n\nThis is a favorite interview problem because it looks similar to debounce but has a different timeline, different edge cases, and different leading and trailing semantics.",
    whyItMattersMD: "Throttle is the right tool for continuous streams where the UI should update regularly but not excessively: scroll position, drag movement, resize progress, pointer tracking, and telemetry sampling. It also maps cleanly to backend rate-limiting ideas.",
    theoryMD: "### Mental model\n\nA throttled function opens a time window after it runs. Calls inside that window are ignored or saved as the trailing call, depending on options. When the window ends, the saved latest call may run.\n\n### Leading and trailing\n\nLeading throttle runs immediately when the first call arrives. Trailing throttle remembers the latest call during the wait window and runs it at the end. Many production utilities enable both, giving immediate feedback and one final update with the latest data.\n\n### Debounce comparison\n\nDebounce compresses a burst into one call after silence. Throttle samples a burst at a controlled rate. If calls keep arriving for five seconds, debounce may run once at the end; throttle may run many times, but no more often than the interval.\n\n### Implementation approaches\n\nTimestamp-only throttle is simple but may drop the final call. Timer-assisted throttle can support trailing execution with the latest arguments.",
    diagrams: [
      {
        title: "Throttle timeline",
        ascii: `calls:  A -- B -- C -- D -- E
window: [100ms] [100ms] [100ms]
leading only output: A       D
leading plus trailing: A   C   E`,
        caption: "Throttle samples a burst instead of waiting for complete silence.",
      },
    ],
    codeExamples: [
      {
        title: "Throttle with leading and trailing behavior",
        descriptionMD: "This timer-assisted version keeps the latest call for the trailing edge.",
        language: "javascript",
        code: `function throttle(fn, wait, options) {
  var settings = options || {};
  var leading = settings.leading !== false;
  var trailing = settings.trailing !== false;
  var lastRun = 0;
  var timer = null;
  var lastArgs = null;
  var lastThis = null;

  function invoke(time) {
    lastRun = time;
    timer = null;
    fn.apply(lastThis, lastArgs);
    lastArgs = null;
    lastThis = null;
  }

  return function () {
    var now = Date.now();
    if (!lastRun && !leading) {
      lastRun = now;
    }

    lastArgs = Array.prototype.slice.call(arguments);
    lastThis = this;

    var remaining = wait - (now - lastRun);
    if (remaining <= 0 || remaining > wait) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      invoke(now);
    } else if (!timer && trailing) {
      timer = setTimeout(function () {
        invoke(Date.now());
      }, remaining);
    }
  };
}`,
      },
    ],
    playground: [
      {
        title: "Throttle a burst with trailing updates",
        descriptionMD: "The function can run immediately and then at most once every 30ms with the latest value.",
        code: `function throttle(fn, wait) {
  var lastRun = 0;
  var timer = null;
  var lastValue;

  return function (value) {
    var now = Date.now();
    var remaining = wait - (now - lastRun);
    lastValue = value;

    if (remaining <= 0) {
      clearTimeout(timer);
      timer = null;
      lastRun = now;
      fn(value);
    } else if (!timer) {
      timer = setTimeout(function () {
        lastRun = Date.now();
        timer = null;
        fn(lastValue);
      }, remaining);
    }
  };
}

var log = throttle(function (value) {
  console.log(value);
}, 30);

log('A');
setTimeout(function () { log('B'); }, 5);
setTimeout(function () { log('C'); }, 10);
setTimeout(function () { log('D'); }, 50);
setTimeout(function () { log('E'); }, 55);`,
      },
    ],
    outputPredictions: [
      {
        code: `function makeThrottle(fn, wait) {
  var lastTime = -Infinity;
  return function (value, time) {
    if (time - lastTime >= wait) {
      lastTime = time;
      fn(value);
    }
  };
}

var log = makeThrottle(function (value) {
  console.log(value);
}, 100);

log('A', 0);
log('B', 50);
log('C', 100);
log('D', 150);
log('E', 220);`,
        answer: "A\nC\nE",
        explanationMD: "The fake-time throttle only runs when at least 100ms have passed since the previous execution. Calls at 50ms and 150ms are inside active windows, so they are skipped.",
      },
    ],
    codingExercises: [
      {
        title: "Implement throttle with leading and trailing options",
        difficulty: "Hard",
        promptMD: "Write `throttle(fn, wait, options)` where `leading` and `trailing` default to `true`. Preserve the latest arguments for trailing execution and expose `.cancel()`.",
        hints: ["Track the last execution time.", "Store latest arguments and receiver for a trailing call.", "If a timer is already scheduled, do not schedule another one."],
        solutionCode: `function throttle(fn, wait, options) {
  var settings = options || {};
  var leading = settings.leading !== false;
  var trailing = settings.trailing !== false;
  var lastRun = 0;
  var timer = null;
  var lastArgs = null;
  var lastThis = null;
  var lastResult;

  function invoke(time) {
    lastRun = time;
    timer = null;
    lastResult = fn.apply(lastThis, lastArgs);
    lastArgs = null;
    lastThis = null;
    return lastResult;
  }

  function throttled() {
    var now = Date.now();
    if (!lastRun && !leading) {
      lastRun = now;
    }

    lastArgs = Array.prototype.slice.call(arguments);
    lastThis = this;

    var remaining = wait - (now - lastRun);
    if (remaining <= 0 || remaining > wait) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      return invoke(now);
    }

    if (!timer && trailing) {
      timer = setTimeout(function () {
        invoke(leading === false ? 0 : Date.now());
      }, remaining);
    }

    return lastResult;
  }

  throttled.cancel = function () {
    clearTimeout(timer);
    timer = null;
    lastRun = 0;
    lastArgs = null;
    lastThis = null;
  };

  return throttled;
}`,
        complexity: { time: "O(1) per call", space: "O(1)" },
        explanationMD: "The wrapper either invokes immediately when the interval has elapsed or schedules one trailing timer. The latest call data replaces older data, so the trailing invocation represents the newest event in the window.",
      },
    ],
    interviewQuestions: [
      {
        question: "When would you choose throttle instead of debounce?",
        answerMD: "Choose throttle when work should continue at a controlled rate during ongoing activity, such as scroll progress or drag updates. Choose debounce when only the final value after a pause matters.",
        companies: ["LinkedIn", "Microsoft", "Airbnb"],
        followUps: ["How do you implement trailing throttle?", "What happens if both leading and trailing are false?"],
      },
      {
        question: "Why does timestamp-only throttle often miss the final event?",
        answerMD: "Because it only runs when a call arrives after the interval has elapsed. If the final call happens inside the interval and no later call arrives, there is no timer to execute it later.",
      },
    ],
    quiz: [
      {
        question: "Which statement correctly describes throttle?",
        options: ["It runs only after calls stop", "It guarantees every call eventually runs", "It limits execution to at most once per interval", "It only works with DOM events"],
        correctIndex: 2,
        explanationMD: "Throttle is rate limiting for a function: calls may be dropped or coalesced, but execution cannot exceed the configured frequency.",
      },
    ],
    summary: ["Throttle limits a function to a maximum execution rate.", "Leading throttle gives immediate feedback; trailing throttle preserves the latest update in the window.", "Debounce waits for silence; throttle samples continuous activity.", "Timer-assisted throttle is needed when the final call should not be lost."],
    cheatSheetMD: "**Throttle:** run at most once per `wait`.\n\n**Use for:** scroll, resize progress, dragging, telemetry.\n\n**Leading:** first call runs now.\n\n**Trailing:** latest call runs when the window closes.\n\n**Contrast:** debounce waits for silence; throttle samples activity.",
  },
  {
    slug: "js-deep-clone",
    moduleId: "advanced",
    order: 84,
    title: "Deep Clone",
    difficulty: "Advanced",
    estimatedReadingMin: 15,
    estimatedPracticeMin: 26,
    tags: ["Deep Clone", "Objects", "Recursion", "structuredClone"],
    introMD: "A deep clone creates a new object graph instead of copying only the top-level references. Mutating a nested value in the clone should not mutate the original.\n\nDeep clone questions reveal how well you understand references, recursion, arrays, plain objects, cycles, built-in types, and the limits of shortcuts like JSON serialization.",
    whyItMattersMD: "Cloning appears in state management, undo stacks, optimistic UI updates, test fixtures, and data normalization. In interviews, it is a practical way to test recursion and edge-case thinking without relying on a framework.",
    theoryMD: "### Shallow vs deep\n\nA shallow copy duplicates the outer container but keeps nested references. A deep copy recursively creates new containers for nested data.\n\n### The modern built-in\n\n`structuredClone(value)` is the best built-in option when available. It supports many built-in types and circular references, but it does not clone functions or DOM nodes. Interviewers still ask for manual implementations because they want to see the algorithm.\n\n### JSON shortcut limitations\n\n`JSON.parse(JSON.stringify(value))` drops functions, symbols, `undefined`, `Date` identity, `Map`, `Set`, prototypes, and throws on cycles. It is a shortcut for simple data, not a general deep clone.\n\n### Manual recursion\n\nThe basic algorithm is: return primitives as-is; clone arrays element by element; clone objects property by property. To support cycles, store source-to-clone mappings in a `WeakMap` before recursing into children.\n\n### Scope your answer\n\nA great interview response states what is supported: plain objects, arrays, dates, maps, sets, and cycles might be included; functions are usually returned by reference.",
    diagrams: [
      {
        title: "Shallow copy vs deep copy",
        ascii: `original.user ----> { name: Ada }
shallow.user -----^ same nested object

deep.user --------> { name: Ada } new nested object`,
        caption: "A deep clone breaks nested reference sharing.",
      },
    ],
    codeExamples: [
      {
        title: "Recursive clone for arrays and plain objects",
        descriptionMD: "This small version handles nested arrays and plain objects, but not cycles, Map, Set, Date, or custom prototypes.",
        language: "javascript",
        code: `function deepClone(value) {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(function (item) {
      return deepClone(item);
    });
  }

  var clone = {};
  Object.keys(value).forEach(function (key) {
    clone[key] = deepClone(value[key]);
  });
  return clone;
}`,
      },
      {
        title: "Cycle-safe cloning with WeakMap",
        descriptionMD: "Store the empty clone before cloning children so a cycle can point back to the existing clone.",
        language: "javascript",
        code: `function cloneObject(value, seen) {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (seen.has(value)) {
    return seen.get(value);
  }

  var clone = Array.isArray(value) ? [] : {};
  seen.set(value, clone);

  Object.keys(value).forEach(function (key) {
    clone[key] = cloneObject(value[key], seen);
  });

  return clone;
}

var a = { name: 'cycle' };
a.self = a;
var b = cloneObject(a, new WeakMap());
console.log(b !== a);
console.log(b.self === b);`,
      },
    ],
    playground: [
      {
        title: "Mutate the clone, not the original",
        descriptionMD: "Nested objects and arrays are copied, so changing the clone leaves the original untouched.",
        code: `function deepClone(value) {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(deepClone);
  }
  var clone = {};
  Object.keys(value).forEach(function (key) {
    clone[key] = deepClone(value[key]);
  });
  return clone;
}

var original = { user: { name: 'Ada' }, scores: [1, 2] };
var copy = deepClone(original);
copy.user.name = 'Grace';
copy.scores.push(3);

console.log(original.user.name);
console.log(original.scores.length);
console.log(copy.scores.length);`,
      },
    ],
    outputPredictions: [
      {
        code: `function deepClone(value) {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(deepClone);
  }
  var clone = {};
  Object.keys(value).forEach(function (key) {
    clone[key] = deepClone(value[key]);
  });
  return clone;
}

var original = { user: { name: 'Ada' }, scores: [1, 2] };
var copy = deepClone(original);
copy.user.name = 'Grace';
copy.scores.push(3);

console.log(original.user.name);
console.log(original.scores.length);
console.log(copy.scores.length);`,
        answer: "Ada\n2\n3",
        explanationMD: "The nested object and array were cloned, so mutating `copy.user` and `copy.scores` does not affect the original nested references.",
      },
    ],
    codingExercises: [
      {
        title: "Implement a cycle-safe deep clone",
        difficulty: "Hard",
        promptMD: "Write `deepClone(value)` that supports primitives, arrays, plain objects, `Date`, `Map`, `Set`, and circular references. Return functions by reference.",
        hints: ["Use a `WeakMap` from original object to cloned object.", "Store the empty clone before cloning children.", "Clone `Map` keys and values; clone `Set` values."],
        solutionCode: `function deepClone(value, seen) {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  var visited = seen || new WeakMap();
  if (visited.has(value)) {
    return visited.get(value);
  }

  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  if (value instanceof Map) {
    var mapClone = new Map();
    visited.set(value, mapClone);
    value.forEach(function (mapValue, mapKey) {
      mapClone.set(deepClone(mapKey, visited), deepClone(mapValue, visited));
    });
    return mapClone;
  }

  if (value instanceof Set) {
    var setClone = new Set();
    visited.set(value, setClone);
    value.forEach(function (setValue) {
      setClone.add(deepClone(setValue, visited));
    });
    return setClone;
  }

  var clone = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value));
  visited.set(value, clone);

  Reflect.ownKeys(value).forEach(function (key) {
    clone[key] = deepClone(value[key], visited);
  });

  return clone;
}

var original = { name: 'root' };
original.self = original;
var copy = deepClone(original);
console.log(copy !== original);
console.log(copy.self === copy);`,
        complexity: { time: "O(n) where n is reachable properties and collection entries", space: "O(n) for clones plus the WeakMap" },
        explanationMD: "The `WeakMap` breaks cycles by returning an existing clone when the same source object is encountered again. Specialized branches preserve common built-in containers better than a plain-object-only clone.",
      },
    ],
    interviewQuestions: [
      {
        question: "Why is JSON serialization not a complete deep clone?",
        answerMD: "It only handles JSON-compatible data. It loses `undefined`, functions, symbols, prototypes, `Date` objects, `Map`, `Set`, and cannot process circular references.",
        companies: ["Amazon", "Microsoft", "Adobe"],
        followUps: ["How would you handle cycles?", "When would you use `structuredClone`?"],
      },
      {
        question: "Why does a cycle-safe clone use `WeakMap`?",
        answerMD: "A `WeakMap` lets original objects be garbage-collected when no longer referenced elsewhere. The clone operation should not keep source objects alive only because they were used as bookkeeping keys.",
      },
    ],
    quiz: [
      {
        question: "What must a cycle-safe deep clone do before cloning child properties?",
        options: ["Freeze the source object", "Store the source-to-clone mapping", "Convert the object to JSON", "Sort all keys alphabetically"],
        correctIndex: 1,
        explanationMD: "The clone must be registered before recursion so a self-reference can reuse the clone instead of recursing forever.",
      },
    ],
    summary: ["Deep clone recursively copies nested containers instead of sharing references.", "`structuredClone` is the modern built-in, but manual implementations are still interview staples.", "JSON cloning is limited to JSON-compatible acyclic data.", "Cycle-safe cloning stores source-to-clone mappings in a `WeakMap`."],
    cheatSheetMD: "**Base case:** primitives and `null` return as-is.\n\n**Containers:** arrays map recursively; objects copy keys recursively.\n\n**Cycles:** `WeakMap` original → clone.\n\n**Built-in:** `structuredClone` handles many cases.\n\n**JSON shortcut:** simple data only; no cycles, functions, symbols, prototypes, Map, Set, Date identity.",
  },
  {
    slug: "js-event-delegation-adv",
    moduleId: "advanced",
    order: 85,
    title: "Event Delegation (Advanced)",
    difficulty: "Advanced",
    estimatedReadingMin: 13,
    estimatedPracticeMin: 20,
    tags: ["Event Delegation", "Events", "DOM", "Architecture"],
    introMD: "Event delegation attaches one listener to a stable ancestor and handles events from matching descendants. Instead of binding a click handler to every row, button, or menu item, the ancestor inspects the event target and dispatches the action.\n\nAdvanced delegation is about correctness: bubbling, nearest matching, containment checks, dynamic elements, nested clickable regions, propagation blockers, and Shadow DOM boundaries.",
    whyItMattersMD: "Delegation reduces listener count, supports dynamically inserted elements, and centralizes behavior. Interviewers use it to test event flow and whether you can write robust UI infrastructure instead of one-off handlers.",
    theoryMD: "### How delegation works\n\nMost DOM events bubble from the original target up through ancestors. A delegated listener on an ancestor receives the event and can inspect the target to decide what action to run.\n\n### Robust pattern\n\nFind the nearest actionable descendant, then verify the ancestor contains that element. The containment check prevents handling a match from outside the delegated root.\n\n### Dynamic children\n\nBecause the listener is attached to the parent, elements added later are automatically covered. This is the biggest practical benefit over binding individual listeners.\n\n### Advanced edge cases\n\nSome events do not bubble, `stopPropagation` can block the ancestor, nested actions need priority rules, and Shadow DOM can retarget events. Keep DOM-specific code out of worker-only sandboxes.",
    diagrams: [
      {
        title: "Bubbling path for delegated handling",
        ascii: `button with action
   | event bubbles
list item
   |
list root  <-- one delegated listener decides action
   |
page`,
        caption: "One ancestor listener can handle many current and future descendants.",
      },
    ],
    codeExamples: [
      {
        title: "Robust delegated DOM click handler",
        descriptionMD: "DOM code is intentionally read-only here. Runnable sections use plain-object simulations instead.",
        language: "javascript",
        code: `var list = document.querySelector('#todo-list');

list.addEventListener('click', function (event) {
  var button = event.target.closest('[data-action]');

  if (!button || !list.contains(button)) {
    return;
  }

  var action = button.dataset.action;
  var id = button.dataset.id;

  if (action === 'complete') {
    markTodoComplete(id);
  }

  if (action === 'delete') {
    deleteTodo(id);
  }
});`,
      },
      {
        title: "Dispatch table for delegated actions",
        descriptionMD: "A dispatch table keeps the handler open to new actions without a long conditional chain.",
        language: "javascript",
        code: `var actions = {
  complete: function (element) {
    markTodoComplete(element.dataset.id);
  },
  delete: function (element) {
    deleteTodo(element.dataset.id);
  }
};

document.querySelector('#todo-list').addEventListener('click', function (event) {
  var element = event.target.closest('[data-action]');
  if (!element) {
    return;
  }

  var handler = actions[element.dataset.action];
  if (handler) {
    handler(element, event);
  }
});`,
      },
    ],
    playground: [
      {
        title: "Simulate delegation without the DOM",
        descriptionMD: "This plain-object model mirrors the parent walk used by delegated handlers and runs in a worker sandbox.",
        code: `function findActionNode(target, root) {
  var node = target;
  while (node) {
    if (node.dataset && node.dataset.action) {
      return node;
    }
    if (node === root) {
      return null;
    }
    node = node.parent;
  }
  return null;
}

var root = { name: 'list', parent: null };
var row = { name: 'row', parent: root };
var button = { name: 'button', parent: row, dataset: { action: 'delete', id: '42' } };
var icon = { name: 'icon', parent: button };

function handleClick(target) {
  var actionNode = findActionNode(target, root);
  if (!actionNode) {
    console.log('ignored');
    return;
  }
  console.log(actionNode.dataset.action + ':' + actionNode.dataset.id);
}

handleClick(icon);
handleClick(root);`,
      },
    ],
    outputPredictions: [
      {
        code: `function findActionNode(target, root) {
  var node = target;
  while (node) {
    if (node.dataset && node.dataset.action) {
      return node;
    }
    if (node === root) {
      return null;
    }
    node = node.parent;
  }
  return null;
}

var root = { name: 'root', parent: null };
var row = { name: 'row', parent: root };
var button = { name: 'button', parent: row, dataset: { action: 'edit', id: '7' } };
var label = { name: 'label', parent: button };

var found = findActionNode(label, root);
console.log(found.name);
console.log(found.dataset.action);
console.log(findActionNode(row, root));`,
        answer: "button\nedit\nnull",
        explanationMD: "The simulated target walk climbs from `label` to `button`, where it finds action metadata. Starting from `row` reaches the root without finding an action, so it returns `null`.",
      },
    ],
    codingExercises: [
      {
        title: "Create a delegated dispatcher simulation",
        difficulty: "Medium",
        promptMD: "In a non-DOM environment, model event delegation with plain objects. Implement `createDelegatedDispatcher(root, handlers)` so it walks from `event.target` toward `root`, finds the nearest node with `dataset.action`, and invokes the matching handler with `(node, event)`.",
        hints: ["Use a loop that follows `node.parent`.", "Stop when the root has been checked.", "Ignore events with no matching action or no registered handler."],
        solutionCode: `function createDelegatedDispatcher(root, handlers) {
  function findActionNode(target) {
    var node = target;
    while (node) {
      if (node.dataset && node.dataset.action) {
        return node;
      }
      if (node === root) {
        return null;
      }
      node = node.parent;
    }
    return null;
  }

  return function dispatch(event) {
    var node = findActionNode(event.target);
    if (!node) {
      return false;
    }

    var action = node.dataset.action;
    var handler = handlers[action];
    if (!handler) {
      return false;
    }

    handler(node, event);
    return true;
  };
}

var root = { name: 'root', parent: null };
var item = { name: 'item', parent: root };
var button = { name: 'button', parent: item, dataset: { action: 'archive', id: '9' } };

var dispatch = createDelegatedDispatcher(root, {
  archive: function (node) {
    console.log('archive:' + node.dataset.id);
  }
});

console.log(dispatch({ target: button }));
console.log(dispatch({ target: item }));`,
        complexity: { time: "O(h) per event where h is the height from target to root", space: "O(1)" },
        explanationMD: "Delegation is a parent walk plus dispatch. The simulation uses the same algorithmic shape as DOM delegation while staying runnable in a worker-safe environment.",
      },
    ],
    interviewQuestions: [
      {
        question: "Why does event delegation work well for dynamic lists?",
        answerMD: "The listener is attached to a stable ancestor, not to each child. New children added later still bubble events to that ancestor, so they are handled automatically without rebinding listeners.",
        companies: ["Meta", "Google", "Atlassian"],
        followUps: ["Why use nearest matching?", "What can break delegation?"],
      },
      {
        question: "Why should a delegated handler check containment?",
        answerMD: "A match can come from an unexpected target outside the intended root. Verifying containment ensures the action belongs to the delegated region before executing behavior.",
      },
    ],
    quiz: [
      {
        question: "What is the main advantage of event delegation?",
        options: ["It makes events run synchronously", "It avoids all propagation", "One ancestor listener can handle many current and future descendants", "It only works for keyboard events"],
        correctIndex: 2,
        explanationMD: "Delegation relies on bubbling so a stable ancestor can handle events from many descendants, including dynamically added ones.",
      },
    ],
    summary: ["Event delegation uses one ancestor listener and bubbling to handle descendant events.", "Use nearest-match logic and containment checks for robust handlers.", "Delegation naturally supports dynamically inserted children.", "Advanced cases include propagation blockers, non-bubbling events, nested actions, and Shadow DOM boundaries."],
    cheatSheetMD: "**Pattern:** ancestor listener → inspect target → nearest actionable node → dispatch.\n\n**Benefits:** fewer listeners, dynamic children, centralized behavior.\n\n**Robustness:** nearest match, containment check, clear nested-action rules.\n\n**Watch out:** non-bubbling events, `stopPropagation`, Shadow DOM retargeting.",
  },
  {
    slug: "js-generators",
    moduleId: "advanced",
    order: 86,
    title: "Generators",
    difficulty: "Advanced",
    estimatedReadingMin: 14,
    estimatedPracticeMin: 22,
    tags: ["Generators", "Iterators", "Lazy Evaluation", "function*"],
    introMD: "A generator is a function that can pause and resume. It is declared with `function*`, produces values with `yield`, and returns an iterator whose `next()` method advances execution.\n\nGenerators make lazy sequences natural: ranges, paginated adapters, infinite counters, parser streams, cooperative workflows, and custom iteration protocols.",
    whyItMattersMD: "Interviewers use generators to test execution suspension, the iterator protocol, and lazy evaluation. They also connect cleanly to infinite sequences and composing iterables with `yield*`.",
    theoryMD: "### Execution model\n\nCalling a generator function does not run its body immediately. It returns a generator object. The body starts only when `next()` is called. Each `yield` pauses execution and returns `{ value, done: false }`. A `return` or falling off the end returns `{ value, done: true }`.\n\n### Lazy sequences\n\nGenerators compute values on demand. That means you can model large or infinite sequences without allocating all values up front. Consumers decide how many values to take.\n\n### Sending values back in\n\n`next(value)` sends a value into the paused generator as the result of the current `yield` expression. The first `next` starts the generator and its argument is ignored.\n\n### Delegation with `yield*`\n\n`yield* iterable` forwards iteration to another iterable. It is useful for flattening generators or composing smaller sequence producers.",
    diagrams: [
      {
        title: "Generator pause and resume",
        ascii: `call generator -> returns iterator, body not run
next() -> run until first yield -> pause
next() -> resume after yield -> pause at next yield
next() -> resume -> return done true`,
        caption: "The call stack re-enters the generator body on each `next()`.",
      },
    ],
    codeExamples: [
      {
        title: "Finite and infinite generators",
        descriptionMD: "The infinite generator is safe because consumers can stop after taking a limited number of values.",
        language: "javascript",
        code: `function* range(start, end) {
  for (var value = start; value <= end; value++) {
    yield value;
  }
}

function* naturals() {
  var value = 1;
  while (true) {
    yield value;
    value += 1;
  }
}

function take(iterable, count) {
  var result = [];
  for (var value of iterable) {
    if (result.length === count) {
      break;
    }
    result.push(value);
  }
  return result;
}

console.log(Array.from(range(3, 5)));
console.log(take(naturals(), 4));`,
      },
    ],
    playground: [
      {
        title: "Step through a generator",
        descriptionMD: "Notice that the body starts only when `next()` is called.",
        code: `function* workflow() {
  console.log('start');
  yield 'load';
  console.log('middle');
  yield 'render';
  return 'done';
}

var iterator = workflow();
console.log('created');
console.log(iterator.next().value);
console.log(iterator.next().value);
console.log(iterator.next().value);`,
      },
    ],
    outputPredictions: [
      {
        code: `function* steps() {
  console.log('start');
  yield 'A';
  console.log('middle');
  yield 'B';
  return 'C';
}

var iterator = steps();
console.log('created');
console.log(iterator.next().value);
console.log(iterator.next().value);
console.log(iterator.next().value);`,
        answer: "created\nstart\nA\nmiddle\nB\nC",
        explanationMD: "Calling `steps()` only creates the iterator. The first `next()` starts the body and pauses at `yield 'A'`. The final `next()` logs the returned value `C`.",
      },
    ],
    codingExercises: [
      {
        title: "Build lazy range and take helpers",
        difficulty: "Medium",
        promptMD: "Implement `range(start, end, step)` as a generator and `take(iterable, count)` as a helper that consumes at most `count` values from any iterable.",
        hints: ["Use `function*` and `yield` for `range`.", "Validate that `step` is not zero.", "`take` should stop early even if the iterable is infinite."],
        solutionCode: `function* range(start, end, step) {
  var actualStep = step === undefined ? 1 : step;
  if (actualStep === 0) {
    throw new Error('step cannot be zero');
  }

  if (actualStep > 0) {
    for (var value = start; value <= end; value += actualStep) {
      yield value;
    }
  } else {
    for (var current = start; current >= end; current += actualStep) {
      yield current;
    }
  }
}

function take(iterable, count) {
  var result = [];
  if (count <= 0) {
    return result;
  }

  for (var value of iterable) {
    result.push(value);
    if (result.length === count) {
      break;
    }
  }

  return result;
}

console.log(take(range(1, 10, 2), 3).join(','));
console.log(take(range(5, 1, -2), 10).join(','));`,
        complexity: { time: "O(k) where k is the number of yielded values consumed", space: "O(k) for `take`; O(1) for the generator state" },
        explanationMD: "The generator stores only the current value and step. `take` controls consumption, so it can safely work with infinite iterables by breaking after `count` values.",
      },
    ],
    interviewQuestions: [
      {
        question: "What happens when you call a generator function?",
        answerMD: "The body does not execute immediately. The call returns a generator object that implements the iterator protocol. Execution begins on the first `next()` and pauses at each `yield`.",
        companies: ["Google", "Bloomberg", "Microsoft"],
        followUps: ["What does `next(value)` do?", "How does `yield*` work?"],
      },
      {
        question: "Why are generators useful for infinite sequences?",
        answerMD: "They produce values lazily. Only requested values are computed, so an infinite sequence can be represented safely as long as consumers stop after a finite number of `next()` calls.",
      },
    ],
    quiz: [
      {
        question: "When does a generator function body start executing?",
        options: ["When the generator function is called", "When the first `next()` is called", "When the file is parsed", "Only after `return`"],
        correctIndex: 1,
        explanationMD: "Calling a generator creates an iterator. The body begins only when the iterator is advanced with `next()`.",
      },
    ],
    summary: ["Generators are declared with `function*` and pause at `yield`.", "Calling a generator returns an iterator without running the body immediately.", "Generators are ideal for lazy and infinite sequences.", "`yield*` delegates iteration to another iterable."],
    cheatSheetMD: "**Declare:** `function* name()`.\n\n**Pause:** `yield value` returns `{ value, done: false }`.\n\n**Finish:** `return value` returns `{ value, done: true }`.\n\n**Lazy:** body runs only as consumers call `next()`.\n\n**Compose:** `yield* otherIterable`.",
  },
  {
    slug: "js-iterators",
    moduleId: "advanced",
    order: 87,
    title: "Iterators",
    difficulty: "Advanced",
    estimatedReadingMin: 13,
    estimatedPracticeMin: 20,
    tags: ["Iterators", "Iterable Protocol", "Symbol.iterator", "for...of"],
    introMD: "The iterator protocol is JavaScript's standard way to pull values one at a time from a sequence. An iterator has a `next()` method that returns `{ value, done }`. An iterable has a `Symbol.iterator` method that returns an iterator.\n\nThis protocol explains why arrays, strings, maps, sets, generators, spread, destructuring, and `for...of` all work together.",
    whyItMattersMD: "Iterator questions test protocol-level JavaScript, not memorized APIs. They also prepare you to design custom collections that integrate with language syntax and to reason about lazy iteration performance.",
    theoryMD: "### Iterator protocol\n\nAn iterator is any object with a `next()` method. Each call returns an object with `value` and `done`. When `done` is `true`, iteration is complete.\n\n### Iterable protocol\n\nAn iterable is any object with a method at `Symbol.iterator`. That method returns an iterator. `for...of`, spread, array destructuring, `Array.from`, `Map`, and `Set` consume iterables.\n\n### Iterator vs iterable\n\nAn iterator produces values. An iterable can produce an iterator. Many objects are both: a generator object is iterable because its `Symbol.iterator` returns itself.\n\n### Fresh iterators matter\n\nFor reusable collections, `Symbol.iterator` should return a fresh iterator each time. Otherwise one loop can accidentally exhaust the collection for future consumers.",
    diagrams: [
      {
        title: "Iterable and iterator relationship",
        ascii: `iterable object
   | has Symbol.iterator()
   v
iterator object
   | next()
   v
{ value, done }`,
        caption: "Language features call `Symbol.iterator` and then repeatedly call `next()`.",
      },
    ],
    codeExamples: [
      {
        title: "Make a plain object iterable",
        descriptionMD: "This collection returns a fresh iterator, so it can be iterated more than once.",
        language: "javascript",
        code: `var team = {
  members: ['Ada', 'Grace', 'Linus'],
  [Symbol.iterator]: function () {
    var index = 0;
    var values = this.members;

    return {
      next: function () {
        if (index < values.length) {
          return { value: values[index++], done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
};

for (var member of team) {
  console.log(member);
}`,
      },
    ],
    playground: [
      {
        title: "Custom iterable with spread",
        descriptionMD: "Once an object implements `Symbol.iterator`, spread and `for...of` can consume it.",
        code: `var countdown = {
  from: 3,
  [Symbol.iterator]: function () {
    var current = this.from;
    return {
      next: function () {
        if (current >= 1) {
          return { value: current--, done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
};

console.log([...countdown].join(','));
for (var value of countdown) {
  console.log(value);
}`,
      },
    ],
    outputPredictions: [
      {
        code: `var bag = {
  values: ['x', 'y'],
  [Symbol.iterator]: function () {
    var index = 0;
    var values = this.values;
    return {
      next: function () {
        if (index < values.length) {
          return { value: values[index++], done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
};

for (var value of bag) {
  console.log(value);
}
console.log([...bag].join('-'));`,
        answer: "x\ny\nx-y",
        explanationMD: "`for...of` gets one fresh iterator and prints `x`, then `y`. Spread calls `Symbol.iterator` again, receives a new iterator, and produces `x-y`.",
      },
    ],
    codingExercises: [
      {
        title: "Create an iterable numeric range object",
        difficulty: "Medium",
        promptMD: "Implement `createRange(start, end, step)` that returns an iterable object. It should work with `for...of`, spread, positive steps, and negative steps. Throw if step is zero.",
        hints: ["Return an object with `[Symbol.iterator]`.", "The iterator should close over a `current` value.", "Each call to `[Symbol.iterator]` should create a fresh iterator."],
        solutionCode: `function createRange(start, end, step) {
  var actualStep = step === undefined ? 1 : step;
  if (actualStep === 0) {
    throw new Error('step cannot be zero');
  }

  return {
    [Symbol.iterator]: function () {
      var current = start;
      return {
        next: function () {
          var inRange = actualStep > 0 ? current <= end : current >= end;
          if (!inRange) {
            return { value: undefined, done: true };
          }

          var value = current;
          current += actualStep;
          return { value: value, done: false };
        }
      };
    }
  };
}

console.log([...createRange(1, 5, 2)].join(','));
console.log([...createRange(5, 1, -2)].join(','));`,
        complexity: { time: "O(1) per `next()` call", space: "O(1) iterator state" },
        explanationMD: "The range object is reusable because each call to `Symbol.iterator` creates a new iterator with its own `current` variable. Consumers pull values lazily.",
      },
    ],
    interviewQuestions: [
      {
        question: "What is the difference between an iterator and an iterable?",
        answerMD: "An iterator has `next()` and produces `{ value, done }`. An iterable has `[Symbol.iterator]()` and returns an iterator. `for...of` requires an iterable, not merely an object with `next()`.",
        companies: ["Google", "Microsoft", "Shopify"],
        followUps: ["Why should reusable collections return fresh iterators?", "Are generator objects iterable?"],
      },
      {
        question: "Which language features consume iterables?",
        answerMD: "`for...of`, spread syntax, array destructuring, `Array.from`, `Promise.all`, `Map`, `Set`, and many library APIs consume iterables through `Symbol.iterator`.",
      },
    ],
    quiz: [
      {
        question: "What method must a custom object define to be consumed by `for...of`?",
        options: ["`next` directly on the object only", "`Symbol.iterator` returning an iterator", "`toString` returning an array", "`valueOf` returning a number"],
        correctIndex: 1,
        explanationMD: "`for...of` looks for `[Symbol.iterator]()` and uses the returned iterator's `next()` method.",
      },
    ],
    summary: ["An iterator has `next()` and returns `{ value, done }`.", "An iterable has `[Symbol.iterator]()` returning an iterator.", "Arrays, strings, maps, sets, and generators are iterable.", "Reusable custom collections should return a fresh iterator each time."],
    cheatSheetMD: "**Iterator:** `{ next() { return { value, done }; } }`.\n\n**Iterable:** object with `[Symbol.iterator]()` returning an iterator.\n\n**Consumers:** `for...of`, spread, destructuring, `Array.from`, `Map`, `Set`.\n\n**Best practice:** fresh iterator for reusable collections.",
  },
  {
    slug: "js-weakmap",
    moduleId: "advanced",
    order: 88,
    title: "WeakMap",
    difficulty: "Advanced",
    estimatedReadingMin: 12,
    estimatedPracticeMin: 18,
    tags: ["WeakMap", "Garbage Collection", "Private Data", "Object Identity"],
    introMD: "A `WeakMap` stores key-value pairs where keys must be objects and those keys are held weakly. If nothing else references a key object, the garbage collector may remove it and its associated value.\n\nWeakMap is not a smaller Map. It is a specialized structure for associating metadata with object identities without preventing garbage collection.",
    whyItMattersMD: "WeakMap shows up in interviews around memory leaks, private data, metadata, memoization by object identity, and cycle detection. It proves that you understand reachability and why enumeration is intentionally impossible.",
    theoryMD: "### Weak keys\n\nOnly objects can be keys in a `WeakMap`. Primitive keys throw `TypeError`. The weak part means the map does not keep the key alive. If the key becomes unreachable elsewhere, its entry can disappear.\n\n### No enumeration\n\n`WeakMap` has no `keys`, `values`, `entries`, `forEach`, or `size`. If enumeration were allowed, observing garbage collection would become possible and nondeterministic.\n\n### Private data pattern\n\nWeakMap is a common way to store per-instance private state outside the instance object. The instance is the key; private data is the value.\n\n### Metadata without leaks\n\nWeakMap is ideal for caching metadata about objects you do not own: validation state, parsed AST info, observer records, or clone bookkeeping. When the object is gone, the metadata can go too.",
    diagrams: [
      {
        title: "Weak association",
        ascii: `object key <---- app reference
   |
WeakMap stores metadata

when app reference disappears:
object key can be collected
WeakMap entry can vanish`,
        caption: "The WeakMap does not count as a strong reference to the key.",
      },
    ],
    codeExamples: [
      {
        title: "Private state with WeakMap",
        descriptionMD: "The state cannot be reached through instance properties or enumeration.",
        language: "javascript",
        code: `var privateState = new WeakMap();

class Counter {
  constructor() {
    privateState.set(this, { value: 0 });
  }

  increment() {
    var state = privateState.get(this);
    state.value += 1;
    return state.value;
  }
}

var counter = new Counter();
console.log(counter.increment());
console.log(Object.keys(counter).length);`,
      },
    ],
    playground: [
      {
        title: "Object identity as the key",
        descriptionMD: "Two objects with the same shape are still different WeakMap keys.",
        code: `var cache = new WeakMap();
var first = { id: 1 };
var second = { id: 1 };

cache.set(first, 'metadata for first');

console.log(cache.get(first));
console.log(cache.get(second));
console.log(cache.has(first));`,
      },
    ],
    outputPredictions: [
      {
        code: `var weak = new WeakMap();
var a = { id: 1 };
var b = { id: 1 };

weak.set(a, 'first');

console.log(weak.get(a));
console.log(weak.get(b));
console.log(weak.has(a));

try {
  weak.set('x', 1);
} catch (error) {
  console.log(error.name);
}`,
        answer: "first\nundefined\ntrue\nTypeError",
        explanationMD: "WeakMap keys use object identity, so `a` and `b` are different keys even with the same shape. Primitive keys are invalid and throw `TypeError`.",
      },
    ],
    codingExercises: [
      {
        title: "Build a private counter using WeakMap",
        difficulty: "Medium",
        promptMD: "Implement a `Counter` class whose count cannot be read through public object properties. Use a module-level `WeakMap` for private state with `increment`, `decrement`, and `value` methods.",
        hints: ["Create one `WeakMap` outside the class.", "Use `this` as the key for each instance.", "Store a small state object as the value."],
        solutionCode: `var stateByCounter = new WeakMap();

class Counter {
  constructor(initialValue) {
    stateByCounter.set(this, { count: initialValue || 0 });
  }

  increment() {
    var state = stateByCounter.get(this);
    state.count += 1;
    return state.count;
  }

  decrement() {
    var state = stateByCounter.get(this);
    state.count -= 1;
    return state.count;
  }

  value() {
    return stateByCounter.get(this).count;
  }
}

var counter = new Counter(10);
console.log(counter.increment());
console.log(counter.decrement());
console.log(Object.keys(counter).length);`,
        complexity: { time: "O(1) per operation", space: "O(n) for n live Counter instances" },
        explanationMD: "The WeakMap stores private state by instance identity. When a counter instance becomes unreachable, its WeakMap entry can be collected too.",
      },
    ],
    interviewQuestions: [
      {
        question: "Why can you not iterate over a WeakMap?",
        answerMD: "WeakMap entries may disappear whenever keys become unreachable, and garbage collection timing is intentionally not observable. Enumeration or `size` would expose GC behavior and make programs nondeterministic.",
        companies: ["Google", "Meta", "Microsoft"],
        followUps: ["Why must keys be objects?", "When would `Map` be better?"],
      },
      {
        question: "Give a real use case for WeakMap.",
        answerMD: "Store metadata or private state for object instances without preventing those objects from being garbage-collected. Examples include private class state, clone bookkeeping, AST metadata, and memoizing results by object identity.",
      },
    ],
    quiz: [
      {
        question: "Which operation is available on `WeakMap`?",
        options: ["`keys()`", "`size`", "`forEach()`", "`get(objectKey)`"],
        correctIndex: 3,
        explanationMD: "WeakMap supports `get`, `set`, `has`, and `delete`. It intentionally does not support enumeration or size.",
      },
    ],
    summary: ["WeakMap keys must be objects and are held weakly.", "WeakMap does not expose enumeration or size.", "Use WeakMap for private state and metadata that should not keep objects alive.", "Use Map when you need primitive keys or iteration."],
    cheatSheetMD: "**API:** `set`, `get`, `has`, `delete`.\n\n**Keys:** objects only.\n\n**Weakness:** key is not kept alive by the WeakMap.\n\n**No enumeration:** no `size`, `keys`, `values`, `entries`.\n\n**Use cases:** private data, metadata, cycle tracking, object-identity memoization.",
  },
  {
    slug: "js-weakset",
    moduleId: "advanced",
    order: 89,
    title: "WeakSet",
    difficulty: "Advanced",
    estimatedReadingMin: 11,
    estimatedPracticeMin: 18,
    tags: ["WeakSet", "Garbage Collection", "Visited Set", "Object Identity"],
    introMD: "A `WeakSet` stores objects weakly, representing membership without preventing garbage collection. It answers one question: has this object been seen or marked?\n\nIt is ideal for visited-object tracking, cycle detection, and hidden membership flags where enumeration is unnecessary or harmful.",
    whyItMattersMD: "WeakSet appears in deep-clone, graph traversal, serializer, and cycle-detection interviews. It also tests a subtle memory concept: tracking objects should not always keep those objects alive.",
    theoryMD: "### Object membership only\n\nLike WeakMap keys, WeakSet values must be objects. Adding a primitive throws `TypeError`. Membership is based on object identity, not structural equality.\n\n### Weak references\n\nIf an object in a WeakSet becomes unreachable elsewhere, it can be garbage-collected. The WeakSet does not keep it alive.\n\n### No enumeration\n\nWeakSet has `add`, `has`, and `delete`, but no `size` or iteration. This prevents programs from observing garbage collection timing.\n\n### Common uses\n\nTrack visited objects in recursive algorithms, mark objects as initialized or validated, detect cycles without leaks, and hide membership without mutating the object. Use `Set` when you need primitives, enumeration, or counts.",
    diagrams: [
      {
        title: "WeakSet visited tracking",
        ascii: `visit object A
   | add A to WeakSet
visit child B
   | add B to WeakSet
visit A again
   | WeakSet has A -> cycle detected`,
        caption: "WeakSet is perfect when the only stored information is seen or not seen.",
      },
    ],
    codeExamples: [
      {
        title: "Detect cycles during traversal",
        descriptionMD: "The WeakSet marks objects already on the traversal path.",
        language: "javascript",
        code: `function hasCycle(value, seen) {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  if (seen.has(value)) {
    return true;
  }

  seen.add(value);

  return Object.keys(value).some(function (key) {
    return hasCycle(value[key], seen);
  });
}

var a = {};
a.self = a;
console.log(hasCycle(a, new WeakSet()));`,
      },
    ],
    playground: [
      {
        title: "WeakSet membership by identity",
        descriptionMD: "Two separate objects with the same contents are not the same member.",
        code: `var seen = new WeakSet();
var first = { id: 1 };
var second = { id: 1 };

seen.add(first);

console.log(seen.has(first));
console.log(seen.has(second));
console.log(seen.delete(first));
console.log(seen.has(first));`,
      },
    ],
    outputPredictions: [
      {
        code: `var seen = new WeakSet();
var a = {};
var b = {};

seen.add(a);

console.log(seen.has(a));
console.log(seen.has(b));

try {
  seen.add(1);
} catch (error) {
  console.log(error.name);
}`,
        answer: "true\nfalse\nTypeError",
        explanationMD: "WeakSet membership uses object identity. `a` was added, `b` was not, and primitives cannot be WeakSet members.",
      },
    ],
    codingExercises: [
      {
        title: "Detect cycles in an object graph",
        difficulty: "Medium",
        promptMD: "Implement `hasCycle(value)` for arrays and objects. It should return `true` if traversal reaches an object already seen, and it should use `WeakSet` to avoid leaking visited objects.",
        hints: ["Primitives and `null` cannot form object-reference cycles.", "Check `seen.has(value)` before recursing.", "Use `Reflect.ownKeys` to include symbol keys as well as string keys."],
        solutionCode: `function hasCycle(value) {
  var seen = new WeakSet();

  function visit(node) {
    if (node === null || typeof node !== 'object') {
      return false;
    }

    if (seen.has(node)) {
      return true;
    }

    seen.add(node);

    var keys = Reflect.ownKeys(node);
    for (var i = 0; i < keys.length; i++) {
      if (visit(node[keys[i]])) {
        return true;
      }
    }

    return false;
  }

  return visit(value);
}

var a = { name: 'a' };
var b = { name: 'b', next: a };
a.next = b;
console.log(hasCycle(a));
console.log(hasCycle({ child: { value: 1 } }));`,
        complexity: { time: "O(n) for n reachable properties and objects", space: "O(o) for o reachable objects plus recursion stack" },
        explanationMD: "The WeakSet records object identities that have already been visited. Seeing the same object again means the graph contains a cycle reachable from the input.",
      },
    ],
    interviewQuestions: [
      {
        question: "How is WeakSet different from Set?",
        answerMD: "WeakSet stores only objects, holds them weakly, and cannot be iterated or sized. Set can store primitives, is iterable, has `size`, and strongly retains its values.",
        companies: ["Amazon", "Google", "Meta"],
        followUps: ["Why does WeakSet not expose `size`?", "Where would you use WeakSet in deep clone?"],
      },
      {
        question: "Why is WeakSet useful for cycle detection?",
        answerMD: "Cycle detection only needs membership, not enumeration. WeakSet can mark visited objects without mutating them and without keeping them alive longer than necessary.",
      },
    ],
    quiz: [
      {
        question: "Which value can be added to a WeakSet?",
        options: ["`42`", "`'id'`", "`{ id: 1 }`", "`null`"],
        correctIndex: 2,
        explanationMD: "WeakSet members must be non-null objects. Primitives and `null` are invalid.",
      },
    ],
    summary: ["WeakSet stores object membership weakly.", "It supports `add`, `has`, and `delete`, but not iteration or `size`.", "Use it for visited tracking, cycle detection, and hidden object marks.", "Use Set when you need primitives, enumeration, or counts."],
    cheatSheetMD: "**API:** `add`, `has`, `delete`.\n\n**Members:** objects only.\n\n**No enumeration:** no `size`, no iteration.\n\n**Use cases:** visited objects, cycle detection, hidden marks.\n\n**Memory:** membership does not keep objects alive.",
  },
  {
    slug: "js-proxy",
    moduleId: "advanced",
    order: 90,
    title: "Proxy",
    difficulty: "Advanced",
    estimatedReadingMin: 15,
    estimatedPracticeMin: 24,
    tags: ["Proxy", "Metaprogramming", "Reflect", "Validation"],
    introMD: "A `Proxy` wraps a target object and intercepts fundamental operations through traps such as `get`, `set`, `has`, `deleteProperty`, and `ownKeys`. It lets you customize object behavior without changing every call site.\n\nProxy is powerful interview material because it combines object semantics, invariants, validation, logging, and the `Reflect` API used for safe default forwarding.",
    whyItMattersMD: "Proxies power observable state, validation layers, API clients, access control, deprecation warnings, virtual properties, and testing utilities. They force you to think about what operations JavaScript performs under property syntax and the `in` operator.",
    theoryMD: "### Target, handler, traps\n\n`new Proxy(target, handler)` returns a proxy object. The target stores the real data. The handler defines traps for operations. If a trap is missing, the operation forwards to the target normally.\n\n### Common traps\n\n`get(target, property, receiver)` intercepts reads. `set(target, property, value, receiver)` intercepts writes and should return a boolean. `has(target, property)` intercepts the `in` operator. Other traps cover deletion, keys, construction, and descriptors.\n\n### Use Reflect for default behavior\n\nInside traps, `Reflect.get`, `Reflect.set`, and friends perform the default operation with normal JavaScript semantics. This avoids subtle bugs with accessors, prototypes, and receivers.\n\n### Invariants and cost\n\nProxy traps cannot lie about certain non-configurable or non-writable properties. Violating invariants throws. Proxy is flexible but can be slower and harder to trace than direct objects.",
    diagrams: [
      {
        title: "Proxy interception",
        ascii: `caller reads proxy.name
   |
Proxy get trap
   | validate, log, or virtualize
   v
Reflect.get(target, name, receiver)
   |
actual value`,
        caption: "A trap can add behavior and then forward the default operation.",
      },
    ],
    codeExamples: [
      {
        title: "get, set, and has traps",
        descriptionMD: "Use `Reflect` inside traps to preserve default semantics while adding behavior.",
        language: "javascript",
        code: `var user = { name: 'Ada', role: 'admin' };

var proxy = new Proxy(user, {
  get: function (target, property, receiver) {
    console.log('read ' + String(property));
    return Reflect.get(target, property, receiver);
  },
  set: function (target, property, value, receiver) {
    if (property === 'role' && value !== 'admin' && value !== 'user') {
      throw new TypeError('invalid role');
    }
    return Reflect.set(target, property, value, receiver);
  },
  has: function (target, property) {
    console.log('checking ' + String(property));
    return Reflect.has(target, property);
  }
});

console.log(proxy.name);
proxy.role = 'user';
console.log('role' in proxy);`,
      },
    ],
    playground: [
      {
        title: "Virtual property with Proxy",
        descriptionMD: "The `fullName` property is computed even though it is not stored on the target.",
        code: `var person = { first: 'Ada', last: 'Lovelace' };

var proxy = new Proxy(person, {
  get: function (target, property, receiver) {
    if (property === 'fullName') {
      return target.first + ' ' + target.last;
    }
    return Reflect.get(target, property, receiver);
  },
  has: function (target, property) {
    if (property === 'fullName') {
      return true;
    }
    return Reflect.has(target, property);
  }
});

console.log(proxy.fullName);
console.log('fullName' in proxy);
console.log(proxy.first);`,
      },
    ],
    outputPredictions: [
      {
        code: `var target = { count: 1 };
var proxy = new Proxy(target, {
  get: function (obj, prop, receiver) {
    console.log('get ' + String(prop));
    return Reflect.get(obj, prop, receiver);
  },
  set: function (obj, prop, value, receiver) {
    console.log('set ' + String(prop) + '=' + value);
    return Reflect.set(obj, prop, value, receiver);
  },
  has: function (obj, prop) {
    console.log('has ' + String(prop));
    return Reflect.has(obj, prop);
  }
});

proxy.count = 2;
console.log(proxy.count);
console.log('count' in proxy);`,
        answer: "set count=2\nget count\n2\nhas count\ntrue",
        explanationMD: "Assignment triggers `set`. Reading `proxy.count` triggers `get`, then logs the returned value. The `in` operator triggers `has` and logs `true`.",
      },
    ],
    codingExercises: [
      {
        title: "Create a schema-validated object proxy",
        difficulty: "Hard",
        promptMD: "Implement `createValidatedObject(target, schema)` where schema values are validator functions. The proxy should validate known properties on assignment, reject unknown properties, and forward reads with `Reflect.get`.",
        hints: ["Use a `set` trap for validation.", "Return `true` when assignment succeeds.", "Use `Reflect.has(schema, property)` to check whether the property is allowed."],
        solutionCode: `function createValidatedObject(target, schema) {
  return new Proxy(target, {
    get: function (obj, property, receiver) {
      return Reflect.get(obj, property, receiver);
    },
    set: function (obj, property, value, receiver) {
      if (!Reflect.has(schema, property)) {
        throw new TypeError('unknown property: ' + String(property));
      }

      var validate = Reflect.get(schema, property);
      if (!validate(value)) {
        throw new TypeError('invalid value for: ' + String(property));
      }

      return Reflect.set(obj, property, value, receiver);
    },
    has: function (obj, property) {
      return Reflect.has(obj, property);
    }
  });
}

var user = createValidatedObject({}, {
  name: function (value) { return typeof value === 'string' && value.length > 0; },
  age: function (value) { return Number.isInteger(value) && value >= 0; }
});

user.name = 'Ada';
user.age = 36;
console.log(user.name);
console.log('age' in user);`,
        complexity: { time: "O(1) average per property operation", space: "O(1) beyond the target and schema" },
        explanationMD: "The proxy centralizes validation at the assignment boundary. `Reflect` performs the normal property operation after validation, preserving prototype and receiver semantics.",
      },
    ],
    interviewQuestions: [
      {
        question: "What are Proxy traps, and why should `set` return a boolean?",
        answerMD: "Traps are handler methods that intercept object operations. The `set` trap represents assignment and must return a boolean indicating success. Returning false can cause assignment to fail, and in strict mode it throws a TypeError.",
        companies: ["Meta", "Google", "Microsoft"],
        followUps: ["What is the receiver parameter?", "Why use `Reflect.get` inside a get trap?"],
      },
      {
        question: "Name a pitfall of using Proxy in production code.",
        answerMD: "Proxy can make behavior harder to trace and may be slower than plain objects on hot paths. Traps must also respect invariants around non-configurable and non-writable properties.",
      },
    ],
    quiz: [
      {
        question: "Which Proxy trap intercepts the `in` operator?",
        options: ["`get`", "`set`", "`has`", "`ownKeys`"],
        correctIndex: 2,
        explanationMD: "The `has` trap is called for property existence checks such as `'name' in proxy`.",
      },
    ],
    summary: ["Proxy wraps a target and intercepts operations through traps.", "Common traps include `get`, `set`, and `has`.", "Use `Reflect` inside traps for default forwarding semantics.", "Proxy is powerful but should respect invariants and performance costs."],
    cheatSheetMD: "**Create:** `new Proxy(target, handler)`.\n\n**Traps:** `get`, `set`, `has`, `deleteProperty`, `ownKeys`.\n\n**Forward:** use `Reflect.get/set/has` inside traps.\n\n**Use cases:** validation, logging, virtual properties, access control.\n\n**Pitfalls:** invariants, strict-mode assignment, performance, debuggability.",
  },
  {
    slug: "js-reflect",
    moduleId: "advanced",
    order: 91,
    title: "Reflect",
    difficulty: "Advanced",
    estimatedReadingMin: 12,
    estimatedPracticeMin: 18,
    tags: ["Reflect", "Proxy", "Metaprogramming", "Objects"],
    introMD: "`Reflect` is a built-in object containing methods that mirror JavaScript's fundamental object operations: get, set, has, delete, apply, construct, defineProperty, ownKeys, and more.\n\nIt is most valuable when paired with Proxy traps because it forwards default behavior using the same internal operation that ordinary syntax would use.",
    whyItMattersMD: "Reflect turns metaprogramming into explicit function calls. Interviewers expect you to know why Proxy examples call `Reflect.get` or `Reflect.set`, and how Reflect methods differ from older APIs that throw or return different values.",
    theoryMD: "### Reflect as operation functions\n\nMany JavaScript operations have syntax forms: property access, the `in` operator, deletion, function application, and construction. `Reflect` exposes these as functions.\n\n### Better return values\n\nSome Reflect methods return booleans instead of throwing for normal failure. `Reflect.set` and `Reflect.defineProperty` return whether the operation succeeded, which is useful inside traps.\n\n### Pairing with Proxy\n\nEvery major Proxy trap has a corresponding Reflect method. The common pattern is intercept, add behavior, then call the matching Reflect method to preserve default semantics.\n\n### Receiver matters\n\n`Reflect.get(target, property, receiver)` and `Reflect.set(target, property, value, receiver)` preserve correct `this` behavior for getters and setters along the prototype chain. Direct target access does not always do that. `Reflect` is a namespace object, not a constructor.",
    diagrams: [
      {
        title: "Proxy and Reflect pairing",
        ascii: `Proxy trap receives operation
   | add logging or validation
   v
Reflect.method performs default operation
   |
trap returns Reflect result`,
        caption: "Reflect keeps custom traps aligned with normal JavaScript semantics.",
      },
    ],
    codeExamples: [
      {
        title: "Reflect operations as functions",
        descriptionMD: "These calls mirror common syntax while returning values useful for metaprogramming.",
        language: "javascript",
        code: `var user = { name: 'Ada' };

console.log(Reflect.has(user, 'name'));
console.log(Reflect.get(user, 'name'));
console.log(Reflect.set(user, 'role', 'admin'));
console.log(user.role);

function add(a, b) {
  return a + b;
}

console.log(Reflect.apply(add, null, [2, 3]));`,
      },
      {
        title: "Default forwarding inside a proxy",
        descriptionMD: "The matching Reflect method avoids reimplementing JavaScript's object semantics by hand.",
        language: "javascript",
        code: `var proxy = new Proxy({ count: 1 }, {
  get: function (target, property, receiver) {
    console.log('read ' + String(property));
    return Reflect.get(target, property, receiver);
  },
  set: function (target, property, value, receiver) {
    console.log('write ' + String(property));
    return Reflect.set(target, property, value, receiver);
  }
});

proxy.count = 2;
console.log(proxy.count);`,
      },
    ],
    playground: [
      {
        title: "Use Reflect for explicit operations",
        descriptionMD: "This is the same work as property syntax, but expressed as function calls.",
        code: `var target = { name: 'Ada' };

console.log(Reflect.has(target, 'name'));
console.log(Reflect.get(target, 'missing'));
console.log(Reflect.set(target, 'role', 'engineer'));
console.log(target.role);

function add(a, b) {
  return a + b;
}

console.log(Reflect.apply(add, null, [2, 5]));`,
      },
    ],
    outputPredictions: [
      {
        code: `var target = { name: 'Ada' };

console.log(Reflect.has(target, 'name'));
console.log(Reflect.get(target, 'missing'));
console.log(Reflect.set(target, 'role', 'engineer'));
console.log(target.role);

function add(a, b) {
  return a + b;
}

console.log(Reflect.apply(add, null, [2, 5]));`,
        answer: "true\nundefined\ntrue\nengineer\n7",
        explanationMD: "`Reflect.has` mirrors the `in` operator. Missing reads return `undefined`. `Reflect.set` succeeds and returns `true`, then `Reflect.apply` calls `add` with the provided argument list.",
      },
    ],
    codingExercises: [
      {
        title: "Create an audited object with Reflect forwarding",
        difficulty: "Medium",
        promptMD: "Implement `createAuditedObject(target)` that returns `{ proxy, log }`. The proxy should log `get`, `set`, `has`, and `deleteProperty` operations, then forward each operation using the matching Reflect method.",
        hints: ["Push strings into a shared `log` array from each trap.", "Use `String(property)` so symbol keys are safe to log.", "Return the result of the matching Reflect method."],
        solutionCode: `function createAuditedObject(target) {
  var log = [];

  var proxy = new Proxy(target, {
    get: function (obj, property, receiver) {
      log.push('get:' + String(property));
      return Reflect.get(obj, property, receiver);
    },
    set: function (obj, property, value, receiver) {
      log.push('set:' + String(property));
      return Reflect.set(obj, property, value, receiver);
    },
    has: function (obj, property) {
      log.push('has:' + String(property));
      return Reflect.has(obj, property);
    },
    deleteProperty: function (obj, property) {
      log.push('delete:' + String(property));
      return Reflect.deleteProperty(obj, property);
    }
  });

  return { proxy: proxy, log: log };
}

var audited = createAuditedObject({ count: 1 });
audited.proxy.count = 2;
console.log(audited.proxy.count);
console.log('count' in audited.proxy);
delete audited.proxy.count;
console.log(audited.log.join('|'));`,
        complexity: { time: "O(1) per intercepted operation", space: "O(k) for k log entries" },
        explanationMD: "Each trap records the operation and delegates to the matching Reflect method. Returning the Reflect result keeps the proxy compatible with normal JavaScript operation semantics.",
      },
    ],
    interviewQuestions: [
      {
        question: "Why is Reflect commonly used inside Proxy traps?",
        answerMD: "Reflect provides function forms of the default internal operations. Calling the matching Reflect method inside a trap forwards the operation with correct semantics for prototypes, accessors, receivers, and boolean success values.",
        companies: ["Google", "Microsoft", "Meta"],
        followUps: ["What does the receiver argument do?", "How is `Reflect.apply` different from older apply patterns?"],
      },
      {
        question: "Is Reflect a class or constructor?",
        answerMD: "No. `Reflect` is a namespace-like built-in object containing static methods. You do not instantiate it.",
      },
    ],
    quiz: [
      {
        question: "Which Reflect method calls a function with an explicit `this` value and argument list?",
        options: ["`Reflect.get`", "`Reflect.apply`", "`Reflect.construct`", "`Reflect.ownKeys`"],
        correctIndex: 1,
        explanationMD: "`Reflect.apply(fn, thisArg, args)` performs a function call with the supplied receiver and argument array.",
      },
    ],
    summary: ["Reflect exposes fundamental object operations as functions.", "Most Proxy traps have matching Reflect methods for default forwarding.", "Reflect methods often return useful booleans for success or failure.", "`Reflect.get` and `Reflect.set` preserve receiver semantics for accessors and prototypes."],
    cheatSheetMD: "**Common methods:** `get`, `set`, `has`, `deleteProperty`, `ownKeys`, `apply`, `construct`, `defineProperty`.\n\n**Proxy pattern:** trap → custom logic → matching `Reflect` call.\n\n**Benefits:** explicit operations, correct receiver semantics, useful boolean returns.\n\n**Not:** a constructor or replacement for all object APIs.",
  },
];
