import type { Topic } from "../../types";

export const TOPICS: Topic[] = [
  {
    slug: "js-promise-lifecycle",
    moduleId: "promises",
    order: 65,
    title: "The Promise Lifecycle",
    difficulty: "Intermediate",
    estimatedReadingMin: 13,
    estimatedPracticeMin: 8,
    tags: ["Promises", "Lifecycle", "Microtasks", "Thenables"],
    introMD: "A `Promise` is a state machine for a future value. It starts **pending**, then settles exactly once as **fulfilled** with a value or **rejected** with a reason. Once settled, the result is immutable and every observer sees the same outcome.\n\nThe interview-grade mental model separates four moments: executor execution, settlement, thenable adoption, and reaction callbacks running later as microtasks.",
    whyItMattersMD: "Most promise output puzzles become straightforward once you know that the executor runs synchronously, `.then` callbacks run as microtasks, `resolve` can adopt another promise or thenable, and only the first settlement attempt counts.",
    theoryMD: "### States and settlement\n\nA promise has three observable states: **pending**, **fulfilled**, and **rejected**. Fulfilled and rejected are the two **settled** states. Settlement is one-way: the first effective `resolve` or `reject` wins, and later calls are ignored.\n\n### Executor now, reactions later\n\nThe executor passed to `new Promise` runs immediately and synchronously. Callback functions registered with `.then`, `.catch`, and `.finally` are promise reactions, so they run later as **microtasks** after the current call stack is empty.\n\n### Resolved is not always fulfilled\n\n`resolve(value)` fulfils with ordinary values, but if `value` is a promise or thenable, the outer promise adopts that object's eventual outcome. A promise can therefore be **resolved to a pending promise** and still remain pending until the inner promise settles.\n\n| Term | Precise meaning |\n| --- | --- |\n| Pending | No final result yet. |\n| Fulfilled | Settled successfully with a value. |\n| Rejected | Settled unsuccessfully with a reason. |\n| Settled | Fulfilled or rejected. |\n| Resolved | Locked to a value, promise, or thenable; may still be pending. |\n\n### Thenable assimilation\n\nA thenable is any object with a callable `then` property. Promise resolution calls that method and adopts the outcome, while still protecting settle-once semantics. Badly behaved thenables that call both callbacks cannot change the result after the first call.\n\n### Throws in the executor\n\nIf the executor throws before settlement, the promise rejects with that thrown value. If it throws after the promise has already settled, the throw is ignored for that promise.\n\n### Output-puzzle checklist\n\n1. Run all synchronous code, including promise executors.\n2. Note which promises settle and which reactions are queued.\n3. Drain microtasks after the stack empties.\n4. Run timers and other macrotasks only after microtasks.",
    diagrams: [
      {
        title: "Promise state machine",
        ascii: `                 resolve(value)
              +----------------+
              |                v
[ pending ] --+----------> [ fulfilled ]
     |
     | reject(reason) or executor throw
     v
[ rejected ]

fulfilled and rejected are settled states.
After settlement, later resolve or reject calls are ignored.`,
        caption: "A promise transitions out of pending exactly once.",
      },
      {
        title: "Executor now, reactions later",
        ascii: `new Promise(executor)
        |
        v
executor runs synchronously
        |
        v
promise settles or remains pending
        |
        v
then and catch reactions run as microtasks after the stack is empty`,
        caption: "Construction is synchronous; observation is asynchronous.",
      },
    ],
    codeExamples: [
      {
        title: "Settle-once semantics",
        descriptionMD: "Only the first settlement attempt matters. Later calls are ignored.",
        language: "javascript",
        code: `const promise = new Promise(function (resolve, reject) {
  resolve('first result');
  reject(new Error('too late'));
  resolve('also too late');
});

promise.then(function (value) {
  console.log(value); // first result
});`,
      },
      {
        title: "Resolving to a thenable",
        descriptionMD: "Resolving with a thenable adopts the thenable's eventual outcome instead of storing the object as-is.",
        language: "javascript",
        code: `const thenable = {
  then: function (resolve) {
    setTimeout(function () {
      resolve('value from thenable');
    }, 10);
  },
};

Promise.resolve(thenable).then(function (value) {
  console.log(value); // value from thenable
});`,
      },
    ],
    playground: [
      {
        title: "Executor, microtask, timer",
        descriptionMD: "The executor logs immediately; the `.then` callback waits for the microtask checkpoint.",
        code: `console.log('script start');

const promise = new Promise(function (resolve) {
  console.log('executor start');
  resolve('promise value');
  console.log('executor end');
});

promise.then(function (value) {
  console.log('then sees ' + value);
});

setTimeout(function () {
  console.log('timer');
}, 0);

console.log('script end');`,
      },
    ],
    outputPredictions: [
      {
        code: `console.log('A');

const promise = new Promise(function (resolve) {
  console.log('B');
  resolve('C');
  console.log('D');
});

promise.then(function (value) {
  console.log(value);
});

console.log('E');`,
        answer: "A\nB\nD\nE\nC",
        explanationMD: "`A`, `B`, `D`, and `E` are synchronous. The promise is fulfilled during the executor, but the `.then` handler runs later as a microtask.",
      },
      {
        code: `const promise = new Promise(function (resolve, reject) {
  resolve('first');
  reject('second');
  resolve('third');
});

promise.then(
  function (value) {
    console.log(value);
  },
  function (reason) {
    console.log(reason);
  }
);`,
        answer: "first",
        explanationMD: "`resolve('first')` settles the promise. The later `reject` and second `resolve` are ignored.",
      },
    ],
    codingExercises: [
      {
        title: "Promisify an error-first callback",
        difficulty: "Medium",
        promptMD: "Implement `promisify(fn)`. The wrapped function should return a promise. The original `fn` receives a final callback shaped like `callback(error, value)`; reject for a truthy error and fulfil with the value otherwise.",
        hints: [
          "Return a wrapper function that gathers arguments with rest syntax.",
          "Create a new `Promise` because you are bridging from callbacks.",
          "Append a callback that maps error to `reject` and value to `resolve`.",
        ],
        solutionCode: `function promisify(fn) {
  return function (...args) {
    return new Promise(function (resolve, reject) {
      fn(...args, function (error, value) {
        if (error) {
          reject(error);
          return;
        }

        resolve(value);
      });
    });
  };
}

function legacyDouble(value, callback) {
  setTimeout(function () {
    callback(null, value * 2);
  }, 10);
}

const doubleAsync = promisify(legacyDouble);
doubleAsync(21).then(function (value) {
  console.log(value);
});`,
        complexity: { time: "O(1) wrapper overhead plus the wrapped operation", space: "O(1) wrapper overhead" },
        explanationMD: "The wrapper converts the callback's two possible outcomes into the promise's fulfilled or rejected settled states.",
      },
    ],
    interviewQuestions: [
      {
        question: "What are the states of a promise, and can a settled promise change state?",
        answerMD: "A promise starts pending, then settles exactly once as fulfilled or rejected. Fulfilled and rejected are final states; once settled, the result cannot change and later calls to `resolve` or `reject` are ignored.",
        companies: ["Google", "Microsoft", "Amazon"],
        followUps: ["What is the difference between resolved and fulfilled?", "When do `.then` callbacks run?"],
      },
      {
        question: "What happens if a promise is resolved with another promise or thenable?",
        answerMD: "The outer promise adopts the inner promise or thenable's eventual outcome. It fulfils if the adopted value fulfils and rejects if the adopted value rejects. If the adopted promise is still pending, the outer promise is resolved but not yet fulfilled.",
      },
    ],
    quiz: [
      {
        question: "Which statement about a promise executor is true?",
        options: ["It runs later as a microtask", "It runs synchronously when the promise is constructed", "It runs only after `.then` is attached", "It runs once for every `.then` handler"],
        correctIndex: 1,
        explanationMD: "The executor passed to `new Promise` runs immediately and synchronously. Promise reactions run later as microtasks.",
      },
      {
        question: "A promise can be resolved but not fulfilled when it is resolved with...",
        options: ["A number", "A string", "A pending promise", "`undefined`"],
        correctIndex: 2,
        explanationMD: "Resolving with a pending promise locks the outer promise to the inner promise's outcome, but the outer promise remains pending until the inner one settles.",
      },
    ],
    summary: [
      "Promises start pending and settle exactly once as fulfilled or rejected.",
      "The executor runs synchronously; `.then`, `.catch`, and `.finally` callbacks run as microtasks.",
      "`resolve` adopts promises and thenables, so resolved and fulfilled are not always the same moment.",
      "After a promise settles, later resolve or reject attempts are ignored.",
    ],
    cheatSheetMD: "**States:** pending → fulfilled or rejected. Fulfilled/rejected = settled.\n\n**Settle once:** first `resolve` or `reject` wins.\n\n**Executor:** runs synchronously.\n\n**Reactions:** `.then`, `.catch`, `.finally` run as microtasks.\n\n**Resolve vs fulfil:** `resolve(thenable)` adopts the thenable and may remain pending.",
  },
  {
    slug: "js-promise-chaining",
    moduleId: "promises",
    order: 66,
    title: "Promise Chaining",
    difficulty: "Intermediate",
    estimatedReadingMin: 13,
    estimatedPracticeMin: 10,
    tags: ["Promises", "Chaining", "Microtasks", "Composition"],
    introMD: "Promise chaining is not just calling `.then` repeatedly. Every `.then` call returns a **new promise**. The callback's return value determines that new promise: a plain value fulfils it, a thrown error rejects it, and a returned promise or thenable is flattened into it.\n\nThis is how promise chains express async pipelines without nested callback pyramids.",
    whyItMattersMD: "Chaining tests whether you understand flattening, error propagation, and sequencing. A senior answer should explain why returning a promise makes the next link wait, while starting async work without returning it breaks the chain.",
    theoryMD: "### Every `.then` returns a new promise\n\n`.then(onFulfilled, onRejected)` attaches handlers to one promise and immediately returns another promise. That returned promise represents the result of whichever handler eventually runs. The original promise is not mutated.\n\n| Handler behavior | Next promise state |\n| --- | --- |\n| Returns a plain value | Fulfilled with that value. |\n| Returns nothing | Fulfilled with `undefined`. |\n| Throws an error | Rejected with that error. |\n| Returns a fulfilled promise | Fulfilled with that promise's value. |\n| Returns a rejected promise | Rejected with that promise's reason. |\n| Returns a pending promise | Waits, then adopts its outcome. |\n\n### Flattening\n\nWhen a handler returns a promise, the next `.then` receives the eventual value, not a promise wrapper. This unwrapping is why `return loadUser().then(...)` composes cleanly.\n\nThe classic bug is forgetting `return`. If a handler starts async work but returns nothing, the next link receives `undefined` immediately and the chain no longer waits for that work.\n\n### Missing handlers pass through\n\nA `.then` with no fulfillment handler passes fulfillment through unchanged. A `.then` with no rejection handler passes rejection through unchanged. This is why a final `.catch` can handle errors thrown anywhere above it.\n\n### Sequential vs parallel\n\nChains are sequential by default. If step 2 depends on step 1, chaining is perfect. If operations are independent, start them together and combine them with `Promise.all`; otherwise you accidentally serialize work.\n\n### Microtask boundaries\n\nEach reaction runs in a microtask. Returning a plain value queues the next link as another microtask in the same checkpoint. Returning a timer-backed promise pauses the chain until a future macrotask settles it.",
    diagrams: [
      {
        title: "A chain is a pipeline of new promises",
        ascii: `p0 fulfilled with 2
        |
        v
then returns p1 -- handler returns 6
        |
        v
then returns p2 -- handler returns delayed promise
        |
        v
then returns p3 -- handler receives delayed value

Each step creates a new promise.`,
        caption: "The chain transforms outcomes without mutating previous promises.",
      },
    ],
    codeExamples: [
      {
        title: "Return values become the next value",
        descriptionMD: "A plain return value fulfils the promise returned by `.then`.",
        language: "javascript",
        code: `Promise.resolve(2)
  .then(function (value) {
    return value * 3;
  })
  .then(function (value) {
    console.log(value); // 6
  });`,
      },
      {
        title: "Returned promises are flattened",
        descriptionMD: "The second handler receives the eventual string, not a nested promise object.",
        language: "javascript",
        code: `function delayValue(value, ms) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(value);
    }, ms);
  });
}

Promise.resolve('user')
  .then(function (value) {
    return delayValue(value + ':permissions', 10);
  })
  .then(function (value) {
    console.log(value); // user:permissions
  });`,
      },
      {
        title: "Forgetting return breaks sequencing",
        descriptionMD: "The outer chain does not wait for `saveAuditLog` because its promise is not returned.",
        language: "javascript",
        code: `function saveAuditLog() {
  return new Promise(function (resolve) {
    setTimeout(function () {
      console.log('audit saved');
      resolve();
    }, 10);
  });
}

Promise.resolve('checkout')
  .then(function () {
    saveAuditLog();
  })
  .then(function () {
    console.log('continued before audit finished');
  });`,
      },
    ],
    playground: [
      {
        title: "Flattening across a delayed step",
        descriptionMD: "The final handler waits for the promise returned by the second handler.",
        code: `Promise.resolve(2)
  .then(function (value) {
    console.log('first ' + value);
    return value * 3;
  })
  .then(function (value) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve(value + 1);
      }, 10);
    });
  })
  .then(function (value) {
    console.log('final ' + value);
  });

console.log('sync done');`,
      },
    ],
    outputPredictions: [
      {
        code: `Promise.resolve('start')
  .then(function (value) {
    console.log(value);
    return 'middle';
  })
  .then(function (value) {
    console.log(value);
    return Promise.resolve('end');
  })
  .then(function (value) {
    console.log(value);
  });

console.log('sync');`,
        answer: "sync\nstart\nmiddle\nend",
        explanationMD: "The synchronous log runs first. Then each promise reaction runs as a microtask and feeds its result to the next link.",
      },
      {
        code: `Promise.resolve()
  .then(function () {
    console.log('A');
    return new Promise(function (resolve) {
      setTimeout(function () {
        console.log('B');
        resolve('C');
      }, 0);
    });
  })
  .then(function (value) {
    console.log(value);
  });

setTimeout(function () {
  console.log('D');
}, 0);

console.log('E');`,
        answer: "E\nA\nD\nB\nC",
        explanationMD: "`E` is synchronous. The first `.then` logs `A` and schedules the `B` timer. The `D` timer was scheduled earlier, so it runs first. Resolving the returned promise queues the final handler, which logs `C`.",
      },
    ],
    codingExercises: [
      {
        title: "Run promise-returning tasks sequentially",
        difficulty: "Medium",
        promptMD: "Implement `runSequentially(tasks)`, where each task is a function returning a value or promise. Run tasks one after another and resolve to an array of results. Reject immediately if any task rejects.",
        hints: ["Start with `Promise.resolve([])`.", "Call the next task inside the previous `.then`.", "Return the promise for each task so the chain waits."],
        solutionCode: `function runSequentially(tasks) {
  return tasks.reduce(function (chain, task) {
    return chain.then(function (results) {
      return Promise.resolve()
        .then(task)
        .then(function (value) {
          results.push(value);
          return results;
        });
    });
  }, Promise.resolve([]));
}

const tasks = [
  function () {
    return Promise.resolve('A');
  },
  function () {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve('B');
      }, 10);
    });
  },
  function () {
    return 'C';
  },
];

runSequentially(tasks).then(function (results) {
  console.log(results.join(','));
});`,
        complexity: { time: "O(n) plus task durations", space: "O(n) for results" },
        explanationMD: "The reducer builds a single chain. Each link waits for the accumulated promise, invokes one task, normalises its result, and passes the result array forward.",
      },
    ],
    interviewQuestions: [
      {
        question: "What does `.then` return, and how is that promise resolved?",
        answerMD: "`.then` always returns a new promise. If the chosen handler returns a plain value, the new promise fulfils with it. If the handler throws, the new promise rejects. If the handler returns a promise or thenable, the new promise adopts that outcome.",
        companies: ["Meta", "Google", "Netflix"],
        followUps: ["What happens if the handler returns nothing?", "Why does forgetting `return` break sequencing?"],
      },
      {
        question: "How do you avoid promise nesting when one async step depends on another?",
        answerMD: "Return the inner promise from the `.then` handler. The next link in the outer chain waits for it because promise resolution flattens returned promises.",
      },
    ],
    quiz: [
      {
        question: "Inside a `.then` handler, what happens when you `return Promise.resolve(42)`?",
        options: ["The next handler receives the promise object", "The chain waits and the next handler receives `42`", "The original promise is mutated", "The chain becomes synchronous"],
        correctIndex: 1,
        explanationMD: "Returned promises are flattened; the next handler receives the fulfilled value.",
      },
      {
        question: "What is the result of a `.then` handler that completes without returning?",
        options: ["The next promise fulfils with `undefined`", "The chain stops", "The next promise rejects", "The previous value is always preserved"],
        correctIndex: 0,
        explanationMD: "No return is equivalent to returning `undefined`. The previous value passes through only when no fulfillment handler is supplied.",
      },
    ],
    summary: [
      "Every `.then` returns a new promise and does not mutate the original.",
      "Plain return values fulfil the next promise; throws reject it; returned promises are flattened.",
      "Forgetting to return async work causes the chain to continue too early with `undefined`.",
      "Chains are sequential; use combinators for independent parallel work.",
    ],
    cheatSheetMD: "**`.then` returns:** a new promise.\n\n**Return value:** next promise fulfils with it.\n\n**Throw:** next promise rejects.\n\n**Return promise:** next promise adopts it.\n\n**No return:** next value is `undefined`.\n\n**Rule:** return async work when the chain must wait.",
  },
  {
    slug: "js-promise-error-handling",
    moduleId: "promises",
    order: 67,
    title: "Promise Error Handling",
    difficulty: "Intermediate",
    estimatedReadingMin: 14,
    estimatedPracticeMin: 10,
    tags: ["Promises", "Errors", "catch", "finally"],
    introMD: "Promise errors travel through the same chain as values, but on the rejection path. A rejection keeps moving forward until a rejection handler handles it. `.catch(fn)` is shorthand for `.then(undefined, fn)`, and what that handler returns determines whether the chain recovers or remains failed.",
    whyItMattersMD: "Production async bugs often come from swallowed errors, catch blocks in the wrong place, or cleanup code that masks the original failure. Interviews test this because it reveals whether you can reason about failure paths, not just happy paths.",
    theoryMD: "### Rejection propagation\n\nWhen a promise rejects, JavaScript looks for the next rejection handler in the chain. A `.then` with only a fulfillment handler does not handle the rejection, so the rejection passes through unchanged. This is why a final `.catch` can observe errors thrown anywhere above it.\n\n`.catch(onRejected)` is equivalent to `.then(undefined, onRejected)`. It returns a new promise just like `.then`.\n\n### Throwing and returning in handlers\n\n| Handler action | Next promise |\n| --- | --- |\n| Return a fallback value | Fulfilled with that fallback; the error is swallowed. |\n| Return a promise | Adopts that promise. |\n| Throw a new error | Rejected with the new error. |\n| Return `Promise.reject(reason)` | Rejected with that reason. |\n\nA catch in the middle can recover and let later steps run. A catch at the end is usually a terminal reporter unless it rethrows.\n\n### Error swallowing\n\nA common bug is logging inside `.catch` but not rethrowing. If the catch handler returns normally, the chain becomes fulfilled, often with `undefined`. The caller may think the operation succeeded. If you cannot recover, rethrow the error or return a rejected promise.\n\n### `.finally` semantics\n\n`.finally(callback)` runs after fulfillment or rejection and receives no value or reason. If it returns normally, the original value or reason passes through. If it throws or returns a rejected promise, it replaces the original outcome with that new rejection.\n\n### Unhandled rejections\n\nIf a rejection has no handler by the end of the current turn, runtimes report an unhandled rejection. Browsers expose `unhandledrejection`; Node exposes `unhandledRejection`. Treat global handlers as telemetry, not normal recovery. Attach local catches where you can add context, recover, or report a precise failure.\n\n### Placement rule\n\nPlace catches at the level that can make a decision: recover with a fallback, add context and rethrow, or convert the failure into user-facing state. Do not catch only to silence warnings.",
    diagrams: [
      {
        title: "Rejection propagation",
        ascii: `p0 rejected with Error
        |
        v
then with fulfillment handler only -- pass rejection through
        |
        v
then with fulfillment handler only -- still rejected
        |
        v
catch handles or rethrows
        |
        v
next promise is fulfilled if catch returns, rejected if catch throws`,
        caption: "A rejection keeps moving until a rejection handler changes it.",
      },
    ],
    codeExamples: [
      {
        title: "Recover vs rethrow",
        descriptionMD: "Returning from `catch` recovers. Throwing from `catch` keeps the failure path alive.",
        language: "javascript",
        code: `Promise.reject(new Error('network'))
  .catch(function (error) {
    console.log('logging ' + error.message);
    return { items: [] };
  })
  .then(function (data) {
    console.log(data.items.length); // 0
  });

Promise.reject(new Error('permission'))
  .catch(function (error) {
    throw new Error('load failed: ' + error.message);
  })
  .catch(function (error) {
    console.log(error.message); // load failed: permission
  });`,
      },
      {
        title: "Browser unhandled rejection telemetry",
        descriptionMD: "Global handlers are useful for monitoring, but they should not replace local error handling.",
        language: "javascript",
        code: `globalThis.addEventListener('unhandledrejection', function (event) {
  console.log('Unhandled promise rejection:', event.reason);
});

Promise.reject(new Error('reported by global handler'));`,
      },
      {
        title: "`finally` preserves the original result unless it fails",
        descriptionMD: "Cleanup should usually avoid throwing so it does not hide the original outcome.",
        language: "javascript",
        code: `Promise.resolve('data')
  .finally(function () {
    console.log('cleanup');
  })
  .then(function (value) {
    console.log(value); // data
  });`,
      },
    ],
    playground: [
      {
        title: "Catch, finally, continue",
        descriptionMD: "A catch can convert a rejection into a fulfilled fallback, and `finally` passes that value through.",
        code: `Promise.resolve('start')
  .then(function (value) {
    console.log(value);
    throw new Error('boom');
  })
  .catch(function (error) {
    console.log('caught ' + error.message);
    return 'fallback';
  })
  .finally(function () {
    console.log('cleanup');
  })
  .then(function (value) {
    console.log(value);
  });

console.log('sync');`,
      },
    ],
    outputPredictions: [
      {
        code: `Promise.reject(new Error('fail'))
  .then(function () {
    console.log('then');
  })
  .catch(function (error) {
    console.log('catch ' + error.message);
    return 'ok';
  })
  .then(function (value) {
    console.log(value);
  });

console.log('sync');`,
        answer: "sync\ncatch fail\nok",
        explanationMD: "The fulfillment handler is skipped. The catch handler runs as a microtask, returns `ok`, and the following `.then` receives that recovered value.",
      },
      {
        code: `Promise.resolve()
  .then(function () {
    throw new Error('one');
  })
  .catch(function (error) {
    console.log(error.message);
    throw new Error('two');
  })
  .catch(function (error) {
    console.log(error.message);
  });`,
        answer: "one\ntwo",
        explanationMD: "The first handler throws, so the first catch receives `one`. That catch throws a new error, so the next catch receives `two`.",
      },
      {
        code: `Promise.reject('bad')
  .finally(function () {
    console.log('finally');
  })
  .catch(function (reason) {
    console.log(reason);
  });

console.log('sync');`,
        answer: "sync\nfinally\nbad",
        explanationMD: "`finally` runs on rejection but does not consume the reason. Because it returns normally, the original rejection passes through to `catch`.",
      },
    ],
    codingExercises: [
      {
        title: "Retry a promise-returning operation",
        difficulty: "Medium",
        promptMD: "Implement `retry(fn, attempts)`. `fn` returns a value or promise. Call it until it fulfils or until all attempts are used. If every attempt fails, reject with the last error.",
        hints: ["Wrap `fn` with `Promise.resolve().then(fn)` so synchronous throws become rejections.", "On catch, rethrow when no attempts remain.", "Otherwise call the attempt function again."],
        solutionCode: `function retry(fn, attempts) {
  function run(remaining) {
    return Promise.resolve()
      .then(fn)
      .catch(function (error) {
        if (remaining === 1) {
          throw error;
        }

        return run(remaining - 1);
      });
  }

  return run(attempts);
}

let calls = 0;
retry(function () {
  calls += 1;
  if (calls < 3) {
    return Promise.reject(new Error('not yet'));
  }
  return 'success on ' + calls;
}, 3).then(function (value) {
  console.log(value);
});`,
        complexity: { time: "O(a) attempts plus operation time", space: "O(a) promise chain depth" },
        explanationMD: "The helper treats synchronous throws and promise rejections uniformly. Each failure either consumes one attempt or rethrows the last error.",
      },
    ],
    interviewQuestions: [
      {
        question: "What is the difference between returning a value from `catch` and throwing inside `catch`?",
        answerMD: "Returning a value from `catch` recovers the chain: the promise returned by `catch` is fulfilled with that value. Throwing inside `catch` rejects the next promise, so the error continues to the next rejection handler. Logging and returning normally swallows the error.",
        companies: ["Amazon", "Google", "Microsoft"],
        followUps: ["How would you add context and preserve failure?", "What should global unhandled rejection handlers be used for?"],
      },
      {
        question: "How does `.finally` behave with fulfilled and rejected promises?",
        answerMD: "`.finally` runs for both outcomes and receives no value or reason. If it returns normally or returns a fulfilled promise, the original outcome passes through. If it throws or returns a rejected promise, the chain rejects with that new reason.",
      },
    ],
    quiz: [
      {
        question: "What does `.catch(handler)` mean?",
        options: ["It is equivalent to `.then(handler)`", "It is equivalent to `.then(undefined, handler)`", "It only handles synchronous exceptions outside the chain", "It stops all later `.then` handlers from running"],
        correctIndex: 1,
        explanationMD: "`.catch` registers a rejection handler and returns a new promise, just like `.then(undefined, handler)`.",
      },
      {
        question: "A `catch` logs an error and returns normally. What happens next?",
        options: ["The chain remains rejected", "The chain becomes fulfilled with the returned value, often `undefined`", "The runtime automatically rethrows", "The next `.finally` is skipped"],
        correctIndex: 1,
        explanationMD: "A catch handler that returns normally is a recovery point. If it does not return a fallback, the next promise fulfils with `undefined`.",
      },
    ],
    summary: [
      "Rejections propagate until a rejection handler handles or transforms them.",
      "`.catch(fn)` is shorthand for `.then(undefined, fn)` and returns a new promise.",
      "Returning from `catch` recovers; throwing or returning a rejected promise keeps the chain rejected.",
      "`.finally` is for cleanup and passes the original outcome through unless it fails itself.",
    ],
    cheatSheetMD: "**Propagation:** rejection skips fulfillment-only handlers.\n\n**`.catch(fn)`:** same as `.then(undefined, fn)`.\n\n**Recover:** return a value.\n\n**Rethrow:** throw or return `Promise.reject`.\n\n**`finally`:** cleanup on both paths; original outcome passes through unless finally fails.\n\n**Avoid:** logging and swallowing errors unintentionally.",
  },
  {
    slug: "js-promise-all",
    moduleId: "promises",
    order: 68,
    title: "Promise.all",
    difficulty: "Intermediate",
    estimatedReadingMin: 13,
    estimatedPracticeMin: 11,
    tags: ["Promises", "Combinators", "Parallelism", "Fail Fast"],
    introMD: "`Promise.all(iterable)` is the fail-fast combinator for independent async work that must **all** succeed. It observes every input, fulfils with an array of values in input order, and rejects as soon as the first input rejects.",
    whyItMattersMD: "`Promise.all` is the default answer for parallel independent work, but interviewers expect exact details: output order is input order, rejection is fail-fast, non-promises are allowed, empty input fulfils with `[]`, and fail-fast does not cancel in-flight work.",
    theoryMD: "### Exact semantics\n\n`Promise.all` accepts any iterable of values, promises, or thenables. Each input is normalised through promise resolution, so plain values count as already fulfilled.\n\nIt fulfils only when **every** input fulfils. The fulfillment value is an array whose indexes match the input order, not completion order.\n\nIt rejects as soon as the **first input rejects in time**. The rejection reason is that first rejection reason. Other operations are not cancelled; their timers, network work, or side effects may continue even though the combined promise has already rejected.\n\nFor an empty iterable, `Promise.all([])` returns an already fulfilled promise with `[]`, but attached `.then` callbacks still run asynchronously as microtasks.\n\n### Combinator comparison\n\n| Combinator | Fulfils when | Rejects when | Result shape | Typical use |\n| --- | --- | --- | --- | --- |\n| `Promise.all` | Every input fulfils | First input rejects | Array of values in input order | All-or-nothing parallel work |\n| `Promise.any` | First input fulfils | Every input rejects | First fulfilled value or `AggregateError` | Redundant sources, fastest success |\n| `Promise.allSettled` | Every input settles | Never because of input rejection | Array of status objects in input order | Partial success reporting |\n| `Promise.race` | First input fulfils if it settles first | First input rejects if it settles first | First settled value or reason | Timeouts, first signal wins |\n\n### When to use it\n\nUse `Promise.all` when tasks are independent and the next step requires every result: profile plus permissions, multiple validations that must all pass, or independent calculations. Use `Promise.allSettled` when partial results are acceptable. If you need cancellation after a failure, build it into the underlying operations separately.",
    diagrams: [
      {
        title: "Input order is preserved",
        ascii: `inputs:     [ A, B, C ]
settle time:    C first, A second, B third

Promise.all output after all fulfil:
            [ valueA, valueB, valueC ]

Completion order does not change array indexes.`,
        caption: "The returned array is indexed like the input iterable.",
      },
      {
        title: "Fail-fast does not mean cancel-fast",
        ascii: `A starts -------- resolves later
B starts ---- rejects first ---- Promise.all rejects with B reason
C starts --------------- resolves later

A and C can still finish because Promise.all only stops waiting.`,
        caption: "The combined promise rejects early, but underlying work continues unless separately cancelled.",
      },
    ],
    codeExamples: [
      {
        title: "Parallel work with ordered results",
        descriptionMD: "The fastest task can finish first, but the result array still follows input order.",
        language: "javascript",
        code: `function waitFor(label, ms) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(label);
    }, ms);
  });
}

Promise.all([waitFor('profile', 30), waitFor('permissions', 10)])
  .then(function (values) {
    console.log(values.join(' + ')); // profile + permissions
  });`,
      },
      {
        title: "Fail-fast rejection",
        descriptionMD: "The first rejection rejects the combined promise. Other promises are not cancelled automatically.",
        language: "javascript",
        code: `const good = Promise.resolve('ok');
const bad = Promise.reject(new Error('db unavailable'));

Promise.all([good, bad])
  .then(function () {
    console.log('all succeeded');
  })
  .catch(function (error) {
    console.log(error.message); // db unavailable
  });`,
      },
    ],
    playground: [
      {
        title: "Ordered values after staggered completions",
        descriptionMD: "`B` completes before `A`, but the final array remains `A,B,C` because input order wins.",
        code: `function waitFor(label, ms) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      console.log('done ' + label);
      resolve(label);
    }, ms);
  });
}

Promise.all([waitFor('A', 30), waitFor('B', 10), 'C'])
  .then(function (values) {
    console.log(values.join(','));
  });

console.log('started');`,
      },
    ],
    outputPredictions: [
      {
        code: `function task(label, ms, shouldReject) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      console.log('settled ' + label);
      if (shouldReject) {
        reject(label);
      } else {
        resolve(label);
      }
    }, ms);
  });
}

Promise.all([
  task('A', 30, false),
  task('B', 10, true),
  task('C', 20, false),
])
  .then(function (values) {
    console.log('all ' + values.join(','));
  })
  .catch(function (reason) {
    console.log('catch ' + reason);
  });`,
        answer: "settled B\ncatch B\nsettled C\nsettled A",
        explanationMD: "`B` rejects first, so `Promise.all` rejects with `B` and the catch handler runs as a microtask. `C` and `A` still finish later because `Promise.all` does not cancel them.",
      },
      {
        code: `Promise.all([Promise.resolve('A'), 'B'])
  .then(function (values) {
    console.log(values.join(','));
  });

console.log('sync');`,
        answer: "sync\nA,B",
        explanationMD: "Plain values are treated as fulfilled inputs, and result order follows the input array. The `.then` handler still runs asynchronously.",
      },
    ],
    codingExercises: [
      {
        title: "Implement a mini Promise.all",
        difficulty: "Hard",
        promptMD: "Implement `promiseAll(iterable)`: accept values or promises, preserve input order, resolve to `[]` for empty input, fulfil only after all inputs fulfil, and reject as soon as the first input rejects.",
        hints: ["Convert the iterable to an array.", "Use `Promise.resolve(input)` to normalise values and thenables.", "Store fulfilled values by original index.", "Use the outer `reject` as each rejection handler."],
        solutionCode: `function promiseAll(iterable) {
  const inputs = Array.from(iterable);

  return new Promise(function (resolve, reject) {
    if (inputs.length === 0) {
      resolve([]);
      return;
    }

    const results = new Array(inputs.length);
    let fulfilledCount = 0;

    inputs.forEach(function (input, index) {
      Promise.resolve(input).then(
        function (value) {
          results[index] = value;
          fulfilledCount += 1;

          if (fulfilledCount === inputs.length) {
            resolve(results);
          }
        },
        reject
      );
    });
  });
}

promiseAll([
  Promise.resolve('A'),
  new Promise(function (resolve) {
    setTimeout(function () {
      resolve('B');
    }, 10);
  }),
  'C',
]).then(function (values) {
  console.log(values.join(','));
});`,
        complexity: { time: "O(n) setup plus input settlement time", space: "O(n) for input and result arrays" },
        explanationMD: "Results are stored by original index. The first rejection settles the outer promise; later attempts are ignored by promise settle-once semantics.",
      },
    ],
    interviewQuestions: [
      {
        question: "Explain the exact behavior of `Promise.all`.",
        answerMD: "`Promise.all` takes an iterable of values or promises and returns a promise. It fulfils when every input fulfils, with values in input order. It rejects as soon as the first input rejects, using that reason. Empty input fulfils with `[]`. It does not cancel other work after a rejection.",
        companies: ["Google", "Amazon", "Uber"],
        followUps: ["Does completion order affect the result array?", "What should you use when partial failures are acceptable?"],
      },
      {
        question: "If one promise in `Promise.all` rejects, what happens to the other promises?",
        answerMD: "The combined promise rejects immediately with the first rejection reason, but the other promises are not cancelled. They may still fulfil, reject, log, mutate state, or perform side effects. Cancellation must be built into the underlying operations separately.",
      },
    ],
    quiz: [
      {
        question: "What does `Promise.all([slowA, fastB])` return when both fulfil?",
        options: ["Values in completion order", "Values in input order", "Only the last fulfilled value", "An array of `{ status, value }` objects"],
        correctIndex: 1,
        explanationMD: "`Promise.all` preserves input order regardless of completion order.",
      },
      {
        question: "When does `Promise.all` reject?",
        options: ["Only after every input rejects", "As soon as the first input rejects", "Never; it always fulfils with status objects", "Only if the first input in the array rejects"],
        correctIndex: 1,
        explanationMD: "`Promise.all` is fail-fast by time: the first rejection causes the combined promise to reject.",
      },
    ],
    summary: [
      "`Promise.all` fulfils only when every input fulfils.",
      "Its fulfillment array preserves input order, not completion order.",
      "It rejects fast on the first rejection reason and does not cancel other work.",
      "Use it for all-or-nothing parallel work; use `allSettled` for partial success reporting.",
    ],
    cheatSheetMD: "**Use when:** independent tasks must all succeed.\n\n**Fulfil:** all inputs fulfil → array in input order.\n\n**Reject:** first rejection by time.\n\n**Empty:** fulfils with `[]`.\n\n**Values:** non-promises are allowed.\n\n**Caveat:** fail-fast does not cancel in-flight work.",
  },
  {
    slug: "js-promise-any",
    moduleId: "promises",
    order: 69,
    title: "Promise.any",
    difficulty: "Advanced",
    estimatedReadingMin: 12,
    estimatedPracticeMin: 10,
    tags: ["Promises", "Combinators", "AggregateError", "First Success"],
    introMD: "`Promise.any(iterable)` is the fastest-success combinator. It fulfils as soon as the first input fulfils and ignores earlier rejections. It rejects only when **every** input rejects, using an `AggregateError` containing all rejection reasons.",
    whyItMattersMD: "`Promise.any` is easy to confuse with `Promise.race`. The interview distinction is that `any` wants the first fulfillment, while `race` wants the first settlement. A fast rejection can win `race`, but it cannot win `any` unless all inputs reject.",
    theoryMD: "### Exact semantics\n\n`Promise.any` accepts an iterable of values, promises, or thenables. Plain values count as fulfilled inputs, so a plain value can make `Promise.any` fulfil.\n\nIt fulfils with the value from the first input that fulfils **in time**. Rejections before that are collected but do not reject the combined promise.\n\nIt rejects only if every input rejects. The rejection reason is an `AggregateError`, and `error.errors` contains the individual rejection reasons in input order. For an empty iterable, there is no possible fulfillment, so it rejects with an `AggregateError` whose `errors` array is empty.\n\nLike other combinators, it does not cancel slower inputs after a winner fulfils.\n\n### Combinator comparison\n\n| Combinator | Fulfils when | Rejects when | Result shape | Typical use |\n| --- | --- | --- | --- | --- |\n| `Promise.all` | Every input fulfils | First input rejects | Array of values in input order | All-or-nothing parallel work |\n| `Promise.any` | First input fulfils | Every input rejects | First fulfilled value or `AggregateError` | Redundant sources, fastest success |\n| `Promise.allSettled` | Every input settles | Never because of input rejection | Array of status objects in input order | Partial success reporting |\n| `Promise.race` | First input fulfils if it settles first | First input rejects if it settles first | First settled value or reason | Timeouts, first signal wins |\n\n### When to use it\n\nUse `Promise.any` when you have multiple acceptable sources: fastest cache, fastest CDN mirror, primary and fallback providers, or redundant replicas. Do not use it when a fast rejection should fail the whole operation; use `Promise.race` or direct chaining for that.",
    diagrams: [
      {
        title: "First fulfillment wins",
        ascii: `A rejects early --------- ignored for now
B fulfils next ---------- Promise.any fulfils with B
C fulfils later --------- ignored by combined promise

Only if A, B, and C all reject does Promise.any reject.`,
        caption: "Rejections are tolerated until no candidates remain.",
      },
      {
        title: "All rejected produces AggregateError",
        ascii: `inputs: [ A, B, C ]
A rejects with reasonA
B rejects with reasonB
C rejects with reasonC

Promise.any rejects with AggregateError
errors: [ reasonA, reasonB, reasonC ]`,
        caption: "The `errors` array follows input order, not rejection order.",
      },
    ],
    codeExamples: [
      {
        title: "Use the first successful mirror",
        descriptionMD: "A fast failure is ignored because another source may still fulfil.",
        language: "javascript",
        code: `function mirror(label, ms, shouldFail) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (shouldFail) {
        reject(new Error(label + ' failed'));
      } else {
        resolve(label + ' data');
      }
    }, ms);
  });
}

Promise.any([
  mirror('primary', 10, true),
  mirror('secondary', 30, false),
  mirror('backup', 50, false),
]).then(function (value) {
  console.log(value); // secondary data
});`,
      },
      {
        title: "Inspect AggregateError",
        descriptionMD: "When every input rejects, you can inspect all failure reasons.",
        language: "javascript",
        code: `Promise.any([
  Promise.reject('cache miss'),
  Promise.reject('network down'),
]).catch(function (error) {
  console.log(error.name); // AggregateError
  console.log(error.errors.join(', ')); // cache miss, network down
});`,
      },
    ],
    playground: [
      {
        title: "Fastest success beats early failure",
        descriptionMD: "The first rejection is ignored because a later fulfillment succeeds.",
        code: `function candidate(label, ms, shouldFulfill) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (shouldFulfill) {
        console.log('fulfill ' + label);
        resolve(label);
      } else {
        console.log('reject ' + label);
        reject(label);
      }
    }, ms);
  });
}

Promise.any([
  candidate('A', 10, false),
  candidate('B', 30, true),
  candidate('C', 20, true),
]).then(function (value) {
  console.log('winner ' + value);
});

console.log('searching');`,
      },
    ],
    outputPredictions: [
      {
        code: `function candidate(label, ms, shouldFulfill) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      console.log(label);
      if (shouldFulfill) {
        resolve(label);
      } else {
        reject(label);
      }
    }, ms);
  });
}

Promise.any([
  candidate('A reject', 10, false),
  candidate('B fulfill', 30, true),
  candidate('C fulfill', 20, true),
]).then(function (value) {
  console.log('any ' + value);
});`,
        answer: "A reject\nC fulfill\nany C fulfill\nB fulfill",
        explanationMD: "The first rejection is recorded but ignored. `C fulfill` is the first fulfillment, so `Promise.any` fulfils with that value. `B` still completes later because work is not cancelled.",
      },
      {
        code: `Promise.any([
  Promise.reject('x'),
  new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject('y');
    }, 0);
  }),
]).catch(function (error) {
  console.log(error.name);
  console.log(error.errors.join(','));
});

console.log('sync');`,
        answer: "sync\nAggregateError\nx,y",
        explanationMD: "The immediate rejection does not finish `Promise.any` because another input is pending. After the timer rejects, every input has rejected, so the catch receives `AggregateError` with reasons in input order.",
      },
    ],
    codingExercises: [
      {
        title: "Implement a mini Promise.any",
        difficulty: "Hard",
        promptMD: "Implement `promiseAny(iterable)`: fulfil with the first fulfilled input, ignore rejections until all inputs reject, reject empty input with `AggregateError`, and preserve final rejection reasons in input order.",
        hints: ["Convert the iterable to an array for indexes and empty handling.", "Resolve the outer promise immediately when any input fulfils.", "Store each rejection reason by index and count rejections.", "Reject with `new AggregateError(errors, 'All promises were rejected')` only after every input rejects."],
        solutionCode: `function promiseAny(iterable) {
  const inputs = Array.from(iterable);

  return new Promise(function (resolve, reject) {
    if (inputs.length === 0) {
      reject(new AggregateError([], 'All promises were rejected'));
      return;
    }

    const errors = new Array(inputs.length);
    let rejectedCount = 0;

    inputs.forEach(function (input, index) {
      Promise.resolve(input).then(
        resolve,
        function (reason) {
          errors[index] = reason;
          rejectedCount += 1;

          if (rejectedCount === inputs.length) {
            reject(new AggregateError(errors, 'All promises were rejected'));
          }
        }
      );
    });
  });
}

promiseAny([
  Promise.reject('miss'),
  new Promise(function (resolve) {
    setTimeout(function () {
      resolve('hit');
    }, 10);
  }),
]).then(function (value) {
  console.log(value);
});`,
        complexity: { time: "O(n) setup plus time until first fulfillment or all rejections", space: "O(n) for stored rejection reasons" },
        explanationMD: "The outer promise resolves on the first fulfillment. Rejections are stored until the function knows no fulfillment is possible.",
      },
    ],
    interviewQuestions: [
      {
        question: "How is `Promise.any` different from `Promise.race`?",
        answerMD: "`Promise.any` fulfils with the first fulfilled input and ignores rejections unless every input rejects. `Promise.race` settles with the first input to settle, whether fulfilled or rejected. A fast rejection rejects `race` but does not reject `any` while another input can still fulfil.",
        companies: ["Google", "Meta", "Amazon"],
        followUps: ["What error does `Promise.any` reject with?", "Does `Promise.any` cancel slower inputs after success?"],
      },
      {
        question: "What happens when every input to `Promise.any` rejects?",
        answerMD: "The returned promise rejects with an `AggregateError`. The `errors` property contains all rejection reasons in input order. Empty input also rejects with `AggregateError` because there is no possible fulfillment.",
      },
    ],
    quiz: [
      {
        question: "Which input outcome makes `Promise.any` fulfil?",
        options: ["The first settlement", "The first fulfillment", "All settlements", "The first rejection"],
        correctIndex: 1,
        explanationMD: "`Promise.any` is fastest-success. It fulfils on the first fulfillment and ignores rejections until all inputs reject.",
      },
      {
        question: "If every input to `Promise.any` rejects, the returned promise rejects with...",
        options: ["The first rejection reason", "The last rejection reason", "An `AggregateError`", "An array of status objects"],
        correctIndex: 2,
        explanationMD: "`Promise.any` rejects with `AggregateError` only when all inputs reject.",
      },
    ],
    summary: [
      "`Promise.any` fulfils with the first fulfilled input.",
      "Early rejections are ignored unless every input rejects.",
      "If all inputs reject, it rejects with `AggregateError` containing reasons in input order.",
      "Use it for redundant sources where any successful result is acceptable.",
    ],
    cheatSheetMD: "**Use when:** fastest successful result wins.\n\n**Fulfil:** first fulfillment by time.\n\n**Reject:** only if all inputs reject → `AggregateError`.\n\n**Errors:** `error.errors` preserves input order.\n\n**Empty:** rejects with `AggregateError`.\n\n**Not race:** fast rejection does not win unless all reject.",
  },
  {
    slug: "js-promise-allsettled",
    moduleId: "promises",
    order: 70,
    title: "Promise.allSettled",
    difficulty: "Intermediate",
    estimatedReadingMin: 12,
    estimatedPracticeMin: 9,
    tags: ["Promises", "Combinators", "Partial Failure", "Reporting"],
    introMD: "`Promise.allSettled(iterable)` waits for every input to finish, regardless of success or failure. It never rejects because one input rejected. Instead, it fulfils with an array of result objects: `{ status: 'fulfilled', value }` or `{ status: 'rejected', reason }`.",
    whyItMattersMD: "Real systems often need partial success: upload five files and report which failed, query optional services, or run validations and show every error. `Promise.allSettled` is the combinator for complete reporting without fail-fast behavior.",
    theoryMD: "### Exact semantics\n\n`Promise.allSettled` accepts an iterable of values, promises, or thenables. It waits until **every** input is settled, meaning every input is either fulfilled or rejected.\n\nThe returned promise fulfils with an array in input order. Each element has one of two shapes:\n\n| Input outcome | Result object |\n| --- | --- |\n| Fulfilled with value | `{ status: 'fulfilled', value: value }` |\n| Rejected with reason | `{ status: 'rejected', reason: reason }` |\n\nIt does not reject merely because an input rejected. Empty input fulfils with `[]`.\n\n### Combinator comparison\n\n| Combinator | Fulfils when | Rejects when | Result shape | Typical use |\n| --- | --- | --- | --- | --- |\n| `Promise.all` | Every input fulfils | First input rejects | Array of values in input order | All-or-nothing parallel work |\n| `Promise.any` | First input fulfils | Every input rejects | First fulfilled value or `AggregateError` | Redundant sources, fastest success |\n| `Promise.allSettled` | Every input settles | Never because of input rejection | Array of status objects in input order | Partial success reporting |\n| `Promise.race` | First input fulfils if it settles first | First input rejects if it settles first | First settled value or reason | Timeouts, first signal wins |\n\n### Why not just catch each promise?\n\nYou can emulate `allSettled` by mapping each input to a promise that catches and returns a status object. The built-in version gives that pattern a standard shape and avoids accidentally missing a catch.\n\n### When to use it\n\nUse it when you need a complete audit of outcomes and one failure should not hide other results. Do not use it when a single failure should stop the operation; `Promise.all` communicates that all-or-nothing contract better.",
    diagrams: [
      {
        title: "Collect every outcome",
        ascii: `inputs: [ A, B, C ]
A fulfils
B rejects
C fulfils

Promise.allSettled waits for A, B, and C:
[
  fulfilled with A value,
  rejected with B reason,
  fulfilled with C value
]`,
        caption: "The combined promise fulfils after every input has settled.",
      },
    ],
    codeExamples: [
      {
        title: "Report successes and failures together",
        descriptionMD: "No individual rejection escapes; every outcome becomes data.",
        language: "javascript",
        code: `const checks = [
  Promise.resolve('email ok'),
  Promise.reject('password too short'),
  Promise.resolve('profile ok'),
];

Promise.allSettled(checks).then(function (results) {
  results.forEach(function (result) {
    if (result.status === 'fulfilled') {
      console.log('pass: ' + result.value);
    } else {
      console.log('fail: ' + result.reason);
    }
  });
});`,
      },
      {
        title: "Partition settled results",
        descriptionMD: "A common production pattern is separating fulfilled values from rejection reasons for UI reporting.",
        language: "javascript",
        code: `function partition(results) {
  return results.reduce(
    function (acc, result) {
      if (result.status === 'fulfilled') {
        acc.values.push(result.value);
      } else {
        acc.errors.push(result.reason);
      }
      return acc;
    },
    { values: [], errors: [] }
  );
}`,
      },
    ],
    playground: [
      {
        title: "Wait for every result",
        descriptionMD: "Even though `B` rejects first, the combined promise waits for slower `A` before printing the summary.",
        code: `function item(label, ms, shouldFulfill) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      console.log('done ' + label);
      if (shouldFulfill) {
        resolve(label);
      } else {
        reject(label);
      }
    }, ms);
  });
}

Promise.allSettled([
  item('A', 20, true),
  item('B', 10, false),
]).then(function (results) {
  console.log(results[0].status + ':' + results[0].value);
  console.log(results[1].status + ':' + results[1].reason);
});

console.log('start');`,
      },
    ],
    outputPredictions: [
      {
        code: `function item(label, ms, shouldFulfill) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      console.log('done ' + label);
      if (shouldFulfill) {
        resolve(label);
      } else {
        reject(label);
      }
    }, ms);
  });
}

Promise.allSettled([
  item('A', 20, true),
  item('B', 10, false),
]).then(function (results) {
  console.log(results[0].status + ':' + results[0].value);
  console.log(results[1].status + ':' + results[1].reason);
});

console.log('start');`,
        answer: "start\ndone B\ndone A\nfulfilled:A\nrejected:B",
        explanationMD: "The synchronous log prints first. `B` settles first, but `allSettled` waits for `A`. The result array follows input order: index 0 for `A`, index 1 for `B`.",
      },
      {
        code: `Promise.allSettled([Promise.resolve(1), Promise.reject(2), 3])
  .then(function (results) {
    console.log(results.map(function (result) {
      return result.status;
    }).join(','));
  });

console.log('sync');`,
        answer: "sync\nfulfilled,rejected,fulfilled",
        explanationMD: "Plain value `3` is treated as fulfilled. The combined promise fulfils with status objects after every input has settled.",
      },
    ],
    codingExercises: [
      {
        title: "Implement a mini Promise.allSettled",
        difficulty: "Medium",
        promptMD: "Implement `promiseAllSettled(iterable)`: accept values or promises, wait for every input to settle, and fulfil with result objects in input order. It should not reject because an input promise rejects.",
        hints: ["Map each input to a promise that always fulfils with a status object.", "Use `Promise.resolve(input).then(onFulfilled, onRejected)`.", "Once each mapped promise always fulfils, `Promise.all` can collect them safely."],
        solutionCode: `function promiseAllSettled(iterable) {
  const wrapped = Array.from(iterable).map(function (input) {
    return Promise.resolve(input).then(
      function (value) {
        return { status: 'fulfilled', value: value };
      },
      function (reason) {
        return { status: 'rejected', reason: reason };
      }
    );
  });

  return Promise.all(wrapped);
}

promiseAllSettled([Promise.resolve('A'), Promise.reject('B')])
  .then(function (results) {
    console.log(results[0].status + ':' + results[0].value);
    console.log(results[1].status + ':' + results[1].reason);
  });`,
        complexity: { time: "O(n) setup plus time for all inputs to settle", space: "O(n) for wrapped promises and result objects" },
        explanationMD: "Each input is converted into a promise that always fulfils with a normalized object. Because the mapped promises do not reject for input failures, `Promise.all` can collect the full array.",
      },
    ],
    interviewQuestions: [
      {
        question: "When would you choose `Promise.allSettled` over `Promise.all`?",
        answerMD: "Use `Promise.allSettled` when you need every outcome and partial failure is acceptable or must be reported. `Promise.all` is all-or-nothing and rejects on the first failure. `allSettled` waits for all inputs and returns status objects in input order.",
        companies: ["Microsoft", "Amazon", "Atlassian"],
        followUps: ["What is the shape of each result object?", "Does `allSettled` preserve input order?"],
      },
      {
        question: "Does `Promise.allSettled` ever reject?",
        answerMD: "It does not reject because an input promise rejects; those rejections become `{ status: 'rejected', reason }` result objects. In normal usage it fulfils with an array after every input settles. Edge cases like a bad iterable can still reject before normal input observation.",
      },
    ],
    quiz: [
      {
        question: "What does `Promise.allSettled` return when one input rejects?",
        options: ["It rejects immediately with that reason", "It fulfils after all inputs settle with status objects", "It fulfils with only successful values", "It rejects with `AggregateError`"],
        correctIndex: 1,
        explanationMD: "Input rejections are converted to `{ status: 'rejected', reason }` objects. The combined promise fulfils after every input settles.",
      },
      {
        question: "Which property exists on a fulfilled `allSettled` result object?",
        options: ["reason", "value", "errors", "winner"],
        correctIndex: 1,
        explanationMD: "Fulfilled entries have `{ status: 'fulfilled', value }`. Rejected entries have `{ status: 'rejected', reason }`.",
      },
    ],
    summary: [
      "`Promise.allSettled` waits for every input to fulfil or reject.",
      "It fulfils with status objects in input order and does not reject because an input failed.",
      "Fulfilled entries have `value`; rejected entries have `reason`.",
      "Use it for partial success, reporting, dashboards, and bulk operations.",
    ],
    cheatSheetMD: "**Use when:** you need every outcome.\n\n**Settles:** after all inputs settle.\n\n**Fulfil value:** array in input order.\n\n**Shapes:** `{ status: 'fulfilled', value }` or `{ status: 'rejected', reason }`.\n\n**Rejects on input failure:** no.\n\n**Empty:** fulfils with `[]`.",
  },
  {
    slug: "js-promise-race",
    moduleId: "promises",
    order: 71,
    title: "Promise.race",
    difficulty: "Intermediate",
    estimatedReadingMin: 12,
    estimatedPracticeMin: 9,
    tags: ["Promises", "Combinators", "Race", "Timeouts"],
    introMD: "`Promise.race(iterable)` settles as soon as the first input settles, whether that input fulfils or rejects. It is the first-signal-wins combinator, commonly used for timeouts, fallback signals, and taking the earliest result when both success and failure should be decisive.",
    whyItMattersMD: "`race` is a common source of wrong answers because candidates treat it like fastest success. It is not. A fast rejection rejects the race. A plain value can win before timer-backed promises. The losers are not cancelled automatically.",
    theoryMD: "### Exact semantics\n\n`Promise.race` accepts an iterable of values, promises, or thenables. It settles with the outcome of the first input that settles. If the first settled input fulfils, the race fulfils with that value. If the first settled input rejects, the race rejects with that reason.\n\nPlain values are treated as already fulfilled, so a plain value usually wins over promises that settle in future timer turns. If several already-settled promises are observed together, their reactions are queued in iteration order, so the earliest observed reaction wins.\n\nFor an empty iterable, there is no input that can settle, so `Promise.race([])` returns a promise that remains pending forever.\n\nLike all promise combinators, `race` does **not** cancel losers. A timeout race can reject quickly while the original operation continues unless the underlying API supports cancellation.\n\n### Combinator comparison\n\n| Combinator | Fulfils when | Rejects when | Result shape | Typical use |\n| --- | --- | --- | --- | --- |\n| `Promise.all` | Every input fulfils | First input rejects | Array of values in input order | All-or-nothing parallel work |\n| `Promise.any` | First input fulfils | Every input rejects | First fulfilled value or `AggregateError` | Redundant sources, fastest success |\n| `Promise.allSettled` | Every input settles | Never because of input rejection | Array of status objects in input order | Partial success reporting |\n| `Promise.race` | First input fulfils if it settles first | First input rejects if it settles first | First settled value or reason | Timeouts, first signal wins |\n\n### Timeout pattern\n\nThe classic pattern races real work against a promise that rejects after a delay. This limits how long the caller waits, but it does not stop the real work by itself. In production, pair the timeout with a cancellation mechanism when possible.\n\n### Race vs any\n\nUse `race` when the earliest signal should decide the outcome, including failure. Use `any` when failures are tolerable and you want the first success.",
    diagrams: [
      {
        title: "First settlement wins",
        ascii: `A pending -------- fulfils later
B pending ---- rejects first ---- Promise.race rejects with B reason
C pending -------- fulfils later

The first settled input decides the combined promise.`,
        caption: "Race observes settlement, not success.",
      },
      {
        title: "Timeout race shape",
        ascii: `real work promise ---------------- maybe fulfils later
timeout promise ---- rejects first
        |
        v
Promise.race rejects with timeout reason

The real work is still running unless cancelled separately.`,
        caption: "A timeout race limits waiting; it does not automatically cancel work.",
      },
    ],
    codeExamples: [
      {
        title: "Build a timeout with Promise.race",
        descriptionMD: "The timeout rejects the race if the operation takes too long. Cancellation of the operation is separate.",
        language: "javascript",
        code: `function withTimeout(operationPromise, ms) {
  const timeoutPromise = new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject(new Error('Timed out after ' + ms + 'ms'));
    }, ms);
  });

  return Promise.race([operationPromise, timeoutPromise]);
}

withTimeout(new Promise(function (resolve) {
  setTimeout(function () {
    resolve('slow result');
  }, 50);
}), 10).catch(function (error) {
  console.log(error.message); // Timed out after 10ms
});`,
      },
      {
        title: "Plain values can win the race",
        descriptionMD: "Values are normalised through promise resolution, so a non-promise input can settle the race before async work.",
        language: "javascript",
        code: `Promise.race([
  new Promise(function (resolve) {
    setTimeout(function () {
      resolve('timer');
    }, 0);
  }),
  'plain value',
]).then(function (value) {
  console.log(value); // plain value
});`,
      },
    ],
    playground: [
      {
        title: "Fast rejection wins a race",
        descriptionMD: "Unlike `Promise.any`, a fast rejection decides the race immediately.",
        code: `function contender(label, ms, shouldFulfill) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      console.log('settle ' + label);
      if (shouldFulfill) {
        resolve(label);
      } else {
        reject(label);
      }
    }, ms);
  });
}

Promise.race([
  contender('slow success', 30, true),
  contender('fast failure', 10, false),
]).then(function (value) {
  console.log('fulfilled ' + value);
}).catch(function (reason) {
  console.log('rejected ' + reason);
});

console.log('racing');`,
      },
    ],
    outputPredictions: [
      {
        code: `const slow = new Promise(function (resolve) {
  setTimeout(function () {
    console.log('slow done');
    resolve('slow');
  }, 20);
});

const fast = new Promise(function (resolve, reject) {
  setTimeout(function () {
    console.log('fast failed');
    reject('fast');
  }, 10);
});

Promise.race([slow, fast])
  .then(function (value) {
    console.log('win ' + value);
  })
  .catch(function (reason) {
    console.log('lose ' + reason);
  });

console.log('sync');`,
        answer: "sync\nfast failed\nlose fast\nslow done",
        explanationMD: "The synchronous log runs first. The fast promise rejects first, so the race rejects and the catch handler logs `lose fast`. The slow timer still completes later because `race` does not cancel it.",
      },
      {
        code: `Promise.race([
  new Promise(function (resolve) {
    setTimeout(function () {
      resolve('timer');
    }, 0);
  }),
  'plain',
]).then(function (value) {
  console.log(value);
});

console.log('sync');`,
        answer: "sync\nplain",
        explanationMD: "The plain value is treated as an already fulfilled input. The race handler runs as a microtask after the synchronous log and before the timer matters.",
      },
    ],
    codingExercises: [
      {
        title: "Implement a mini Promise.race",
        difficulty: "Medium",
        promptMD: "Implement `promiseRace(iterable)`: accept values or promises and settle with the first input to settle, whether fulfilled or rejected. Empty input should leave the returned promise pending.",
        hints: ["Create and return a new promise.", "For each input, use `Promise.resolve(input).then(resolve, reject)`.", "Do not add special empty handling; a promise with no resolve or reject call remains pending."],
        solutionCode: `function promiseRace(iterable) {
  return new Promise(function (resolve, reject) {
    Array.from(iterable).forEach(function (input) {
      Promise.resolve(input).then(resolve, reject);
    });
  });
}

promiseRace([
  new Promise(function (resolve) {
    setTimeout(function () {
      resolve('slow');
    }, 20);
  }),
  new Promise(function (resolve) {
    setTimeout(function () {
      resolve('fast');
    }, 10);
  }),
]).then(function (value) {
  console.log(value);
});`,
        complexity: { time: "O(n) setup plus time to first settlement", space: "O(n) reaction registrations" },
        explanationMD: "Every input is normalised to a promise and wired to the same outer `resolve` and `reject`. Whichever reaction runs first settles the outer promise; later attempts are ignored.",
      },
    ],
    interviewQuestions: [
      {
        question: "Explain `Promise.race` and a common use case.",
        answerMD: "`Promise.race` returns a promise that settles with the first input to settle, whether fulfilled or rejected. A common use case is racing an operation against a timeout promise. If the timeout rejects first, the caller stops waiting, but the original operation is not automatically cancelled.",
        companies: ["Netflix", "Google", "Microsoft"],
        followUps: ["How is it different from `Promise.any`?", "What happens with `Promise.race([])`?"],
      },
      {
        question: "Does `Promise.race` cancel the losing promises?",
        answerMD: "No. `Promise.race` only settles the combined promise with the first settlement. Losing promises continue to run and may still produce side effects. If cancellation matters, the underlying operation must support cancellation and you must trigger it explicitly.",
      },
    ],
    quiz: [
      {
        question: "Which input wins `Promise.race`?",
        options: ["The first fulfilled input only", "The first rejected input only", "The first input to settle either way", "The last input to settle"],
        correctIndex: 2,
        explanationMD: "`Promise.race` settles with the first settlement, whether that settlement is fulfillment or rejection.",
      },
      {
        question: "What does `Promise.race([])` do?",
        options: ["Fulfils with `[]`", "Rejects with `AggregateError`", "Returns a promise that stays pending", "Throws synchronously"],
        correctIndex: 2,
        explanationMD: "With no inputs, there is no promise or value that can settle the race, so the returned promise remains pending.",
      },
    ],
    summary: [
      "`Promise.race` settles with the first input to settle, fulfilled or rejected.",
      "A fast rejection rejects the race; use `Promise.any` when you want fastest success instead.",
      "Plain values can win because inputs are normalised through promise resolution.",
      "`race` does not cancel losers, and `Promise.race([])` stays pending forever.",
    ],
    cheatSheetMD: "**Use when:** first signal wins.\n\n**Fulfil:** first settled input fulfils.\n\n**Reject:** first settled input rejects.\n\n**Empty:** pending forever.\n\n**Timeout pattern:** `Promise.race([work, timeout])`.\n\n**Caveat:** losers continue unless cancelled separately.",
  },
];
