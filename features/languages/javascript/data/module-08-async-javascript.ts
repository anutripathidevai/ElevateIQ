import type { Topic } from "../../types";

export const TOPICS: Topic[] = [
  {
    slug: "js-event-loop",
    moduleId: "async-javascript",
    order: 57,
    title: "The Event Loop In Depth",
    difficulty: "Advanced",
    estimatedReadingMin: 14,
    estimatedPracticeMin: 18,
    tags: ["Event Loop", "Call Stack", "Microtasks", "Macrotasks", "Output Prediction"],
    introMD: "The **event loop** is the runtime mechanism that lets single-threaded JavaScript coordinate synchronous code, timers, browser or host APIs, promises, and UI work without blocking the whole environment.\n\nFor interviews, this is the highest-yield async topic. If you can accurately trace the call stack, Web APIs, the task queue, and the microtask queue, you can solve almost every `setTimeout` + `Promise.then` output puzzle.",
    whyItMattersMD: "Senior interviewers use event-loop questions to test whether you reason from first principles or memorize snippets. The most important rule is simple but unforgiving: **after the current synchronous work finishes, the runtime drains all microtasks before it runs the next task/macrotask**. Missing that rule is the reason most wrong answers put `setTimeout(..., 0)` before promise callbacks.",
    theoryMD: "### The parts of the model\n\nJavaScript execution is **run-to-completion**: once a function starts running on the call stack, nothing else interrupts it until the stack becomes empty. Async behavior comes from the runtime around the engine.\n\n- **Call stack**: where currently executing function frames live. Synchronous code enters and leaves this stack.\n- **Host APIs / Web APIs**: capabilities supplied by the environment, such as timers, DOM events, network work, and message channels. They are not all part of the ECMAScript language.\n- **Task queue**, often called the macrotask queue: callbacks from timers, UI events, message events, and similar task sources wait here.\n- **Microtask queue**: promise reactions (`then`, `catch`, `finally`), `queueMicrotask`, and a few host features wait here.\n\n### One event-loop turn\n\nA useful interview algorithm is:\n\n1. Run the currently selected task. The initial script itself is a task.\n2. Keep executing synchronous calls until the call stack is empty.\n3. Drain the **entire** microtask queue. If a microtask schedules another microtask, it is appended and must also run before the loop moves on.\n4. In browsers, rendering may happen after microtasks drain.\n5. Pick the next task from a task queue and repeat.\n\n### The key ordering rule\n\n`setTimeout(fn, 0)` does not mean \"run immediately\". It means \"after at least this delay, enqueue `fn` as a future task\". Promise callbacks are microtasks, so they run after the current stack clears but before that future timer task.\n\n### Starvation\n\nBecause the runtime drains all microtasks before the next task, recursively scheduling microtasks can starve timers, user input, and rendering. That is why high-volume scheduling sometimes deliberately yields with a task, such as a timer, rather than chaining only promises.\n\n### Browser versus Node nuance\n\nNode.js has its own event-loop phases and an extra `process.nextTick` queue, but the premium interview mental model remains: synchronous code first, promise microtasks next, timer or I/O tasks later. This course focuses on browser/Web Worker compatible behavior unless a Node-specific example is explicitly marked.",
    diagrams: [
      {
        title: "Event loop interview mental model",
        ascii: `
Initial script task
        |
        v
+------------------+       async request        +------------------+
|   Call stack     | -------------------------> |    Web APIs      |
| function frames  |                            | timers, events   |
+------------------+                            +------------------+
        |                                                  |
        | stack empty                                      | callback ready
        v                                                  v
+------------------+                            +------------------+
| Microtask queue  | <--- promises,             |   Task queue     |
| drain all of it  |      queueMicrotask        | timers, events   |
+------------------+                            +------------------+
        |                                                  ^
        | all microtasks done                              |
        +---------------- event loop picks next task -------+
`,
        caption: "The event loop runs a task, drains every microtask, then moves to the next task.",
      },
      {
        title: "One complete loop turn",
        ascii: `
[Task starts]
   |
   v
Run synchronous JavaScript on the call stack
   |
   v
Call stack empty?
   |
   v
Drain microtask queue until empty
   |
   v
Browser may render
   |
   v
Pick the next task
`,
        caption: "Microtasks are not one-per-turn; the entire microtask queue drains before the next task.",
      },
    ],
    codeExamples: [
      {
        title: "Classic event-loop ordering",
        descriptionMD: "The timer callback is a future task. The promise callback is a microtask, so it runs first after synchronous code completes.",
        language: "javascript",
        code: `
console.log('script start');

setTimeout(function () {
  console.log('timer task');
}, 0);

Promise.resolve().then(function () {
  console.log('promise microtask');
});

console.log('script end');
`,
      },
      {
        title: "A browser event is another task source",
        descriptionMD: "DOM event callbacks are queued as tasks by the browser. Promise work scheduled inside an event handler drains before the browser moves to the next task.",
        language: "javascript",
        code: `
button.addEventListener('click', function () {
  console.log('click task start');

  Promise.resolve().then(function () {
    console.log('microtask inside click');
  });

  console.log('click task end');
});
`,
      },
    ],
    playground: [
      {
        title: "Trace sync, microtask, task",
        descriptionMD: "Run this and map each line to the call stack, microtask queue, or task queue.",
        code: `
console.log('A sync');

setTimeout(function () {
  console.log('D timer task');
}, 0);

Promise.resolve().then(function () {
  console.log('C promise microtask');
});

console.log('B sync');
`,
      },
    ],
    outputPredictions: [
      {
        code: `
console.log('A');

setTimeout(function () {
  console.log('B');
}, 0);

Promise.resolve().then(function () {
  console.log('C');
});

console.log('D');
`,
        answer: "A\nD\nC\nB",
        explanationMD: "The synchronous logs run first: `A`, then `D`. The promise reaction is a microtask, so `C` runs after the stack clears. The timer callback is a later task, so `B` runs last.",
      },
      {
        code: `
console.log('start');

setTimeout(function () {
  console.log('timer 1');

  Promise.resolve().then(function () {
    console.log('microtask inside timer');
  });
}, 0);

setTimeout(function () {
  console.log('timer 2');
}, 0);

Promise.resolve().then(function () {
  console.log('promise 1');
});

console.log('end');
`,
        answer: "start\nend\npromise 1\ntimer 1\nmicrotask inside timer\ntimer 2",
        explanationMD: "The initial script logs `start` and `end`, then drains the initial promise microtask. The first timer task logs `timer 1` and schedules a microtask. That microtask must drain before the event loop can run the second timer task.",
      },
    ],
    codingExercises: [
      {
        title: "Build an ordering tracer",
        difficulty: "Medium",
        promptMD: "Implement `traceEventLoop()` so it logs `sync start`, `sync end`, `microtask 1`, `microtask 2`, and `task` in exactly that order. Use one timer and two microtasks.",
        hints: [
          "The two synchronous logs should happen before any queued callback.",
          "Use `Promise.resolve().then(...)` or `queueMicrotask(...)` for microtasks.",
          "A timer scheduled with delay `0` still waits for all current microtasks to drain.",
        ],
        solutionCode: `
function traceEventLoop() {
  console.log('sync start');

  setTimeout(function () {
    console.log('task');
  }, 0);

  Promise.resolve().then(function () {
    console.log('microtask 1');
  });

  queueMicrotask(function () {
    console.log('microtask 2');
  });

  console.log('sync end');
}

traceEventLoop();
`,
        complexity: { time: "O(1)", space: "O(1)" },
        explanationMD: "The function first runs all synchronous statements. Both microtasks are queued during that same task and drain in FIFO order before the timer task can run.",
      },
    ],
    interviewQuestions: [
      {
        question: "Explain the event loop using call stack, Web APIs, task queue, and microtask queue.",
        answerMD: "The engine runs synchronous JavaScript on the call stack. Host APIs handle async work such as timers or events and enqueue callbacks later. Timer and event callbacks enter the task queue. Promise reactions and `queueMicrotask` callbacks enter the microtask queue. After each task finishes and the call stack is empty, the event loop drains **all** microtasks before selecting the next task.",
        companies: ["Google", "Meta", "Microsoft"],
        followUps: [
          "Why does a promise callback run before `setTimeout(..., 0)`?",
          "What happens if a microtask schedules another microtask?",
        ],
      },
      {
        question: "What does `setTimeout(fn, 0)` guarantee?",
        answerMD: "It guarantees only that `fn` will not run until the current call stack has cleared and the timer is eligible. It does not guarantee immediate execution. Promise microtasks already queued for the current turn run before that timer task, and other tasks may also affect when the timer is picked.",
      },
    ],
    quiz: [
      {
        question: "After the current call stack becomes empty, what does the event loop do before running the next timer task?",
        options: [
          "Runs exactly one microtask",
          "Drains the entire microtask queue",
          "Renders immediately and skips microtasks",
          "Runs all timers before any promises",
        ],
        correctIndex: 1,
        explanationMD: "The microtask queue drains completely. Newly queued microtasks are also processed before the event loop moves to the next task.",
      },
      {
        question: "Which callback normally runs first after synchronous code: `Promise.resolve().then(fn)` or `setTimeout(fn, 0)`?",
        options: [
          "The promise callback",
          "The timer callback",
          "Whichever was written first",
          "They run at the same time",
        ],
        correctIndex: 0,
        explanationMD: "The promise callback is a microtask. The timer callback is a task. Microtasks drain before the next task.",
      },
    ],
    summary: [
      "JavaScript runs synchronous code to completion on the call stack.",
      "Host APIs enqueue future callbacks into task queues when async work is ready.",
      "Promise reactions and `queueMicrotask` callbacks are microtasks.",
      "After each task, the runtime drains all microtasks before running the next task.",
    ],
    cheatSheetMD: "**Ordering:** sync code → all microtasks → next task/macrotask.\n\n**Task examples:** initial script, timers, DOM events, message events.\n\n**Microtask examples:** `Promise.then`, `catch`, `finally`, `queueMicrotask`.\n\n**Interview rule:** `setTimeout(..., 0)` is never before already queued promise callbacks.",
  },
  {
    slug: "js-web-apis",
    moduleId: "async-javascript",
    order: 58,
    title: "Web APIs",
    difficulty: "Intermediate",
    estimatedReadingMin: 11,
    estimatedPracticeMin: 12,
    tags: ["Web APIs", "Runtime", "Timers", "DOM Events", "Host Environment"],
    introMD: "**Web APIs** are capabilities provided by the browser or worker runtime around the JavaScript engine. They include timers, DOM events, network APIs, storage, observers, and messaging.\n\nThis distinction matters because the engine executes JavaScript, but the runtime schedules async work. `setTimeout` is not defined by ECMAScript; the host provides it and later queues its callback as a task.",
    whyItMattersMD: "Interviewers often ask, `Is setTimeout part of JavaScript?` The best answer is precise: it is a host API available in browsers and many other runtimes, not a core language feature. That precision helps you separate language semantics, engine behavior, and runtime scheduling.",
    theoryMD: "### Engine versus runtime\n\nA JavaScript engine understands language syntax and semantics: functions, objects, promises, lexical environments, and the call stack. A browser runtime adds APIs that let JavaScript interact with the outside world: timers, the DOM, user input, network requests, storage, and rendering.\n\n### What happens when you call a Web API\n\nWhen code calls `setTimeout(callback, 0)`, the call itself runs synchronously. The runtime records the timer. When the delay has elapsed and the current task can eventually yield, the callback becomes eligible to enter a task queue. The callback does **not** sit on the call stack while waiting.\n\nFor DOM events, the browser listens outside your JavaScript call stack. When a click happens, the browser queues an event task that later invokes your listener.\n\nFor promises, be careful: the `Promise` constructor and state machine are part of JavaScript, but promise reactions are scheduled as microtasks by the host integration. Network APIs such as `fetch` return promises, but the network work itself is performed by the host.\n\n### Web Worker sandbox mental model\n\nIn a worker, you still have timers, promises, microtasks, and the event loop, but not the DOM. That is why safe interview playground snippets should stick to `console.log`, `setTimeout`, `Promise`, and `queueMicrotask` unless they are explicitly browser-page examples.\n\n### Common API categories\n\n- **Timers**: `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval`.\n- **Events**: DOM events, message events, worker messages.\n- **Network**: `fetch`, WebSocket, server-sent events.\n- **Observers**: MutationObserver, ResizeObserver, IntersectionObserver.\n- **Scheduling and messaging**: MessageChannel, postMessage, requestAnimationFrame in windows.",
    diagrams: [
      {
        title: "Engine and host responsibilities",
        ascii: `
+-----------------------------+
| JavaScript engine           |
| - parses and executes code  |
| - manages call stack        |
| - implements promises       |
+--------------+--------------+
               |
               | calls host API
               v
+-----------------------------+
| Browser or worker runtime   |
| - timers                    |
| - events                    |
| - network                   |
| - queues callbacks          |
+-----------------------------+
`,
        caption: "The engine runs JavaScript; the host supplies APIs that schedule future work.",
      },
      {
        title: "Timer delegation",
        ascii: `
Call stack: setTimeout(callback, 0)
      |
      v
Web API timer starts outside the stack
      |
      v
Delay elapsed
      |
      v
callback enters task queue
      |
      v
event loop runs it when stack is empty and microtasks are drained
`,
        caption: "The callback waits in the runtime, not on the JavaScript call stack.",
      },
    ],
    codeExamples: [
      {
        title: "DOM events are host-provided tasks",
        descriptionMD: "The browser observes the click and later invokes your listener as an event task.",
        language: "javascript",
        code: `
const button = document.querySelector('button');

button.addEventListener('click', function () {
  console.log('click handler is running as a task');

  Promise.resolve().then(function () {
    console.log('microtask before the next task');
  });
});
`,
      },
      {
        title: "Network work is host work; promise handling is JavaScript-facing",
        descriptionMD: "`fetch` is a browser API. It returns a promise; the network request is handled by the host, and your `.then` callback runs as a microtask once the promise settles.",
        language: "javascript",
        code: `
fetch('/api/profile')
  .then(function (response) {
    return response.json();
  })
  .then(function (profile) {
    console.log(profile.name);
  })
  .catch(function (error) {
    console.error('Request failed', error);
  });
`,
      },
    ],
    playground: [
      {
        title: "Timer callback leaves the stack",
        descriptionMD: "The timer is delegated to the host. The current script continues immediately.",
        code: `
console.log('before timer');

setTimeout(function () {
  console.log('timer callback');
}, 0);

console.log('after timer');
`,
      },
    ],
    outputPredictions: [
      {
        code: `
console.log('script');

setTimeout(function () {
  console.log('timeout callback');
}, 0);

console.log('after scheduling');
`,
        answer: "script\nafter scheduling\ntimeout callback",
        explanationMD: "`setTimeout` registers a timer with the host and returns immediately. The callback is queued as a later task, so the final synchronous log happens first.",
      },
      {
        code: `
console.log('A');

setTimeout(function () {
  console.log('B');
}, 0);

queueMicrotask(function () {
  console.log('C');
});

console.log('D');
`,
        answer: "A\nD\nC\nB",
        explanationMD: "The host timer queues a task. `queueMicrotask` queues a microtask. After synchronous logs `A` and `D`, the microtask `C` runs before the timer task `B`.",
      },
    ],
    codingExercises: [
      {
        title: "Wrap a timer as a callback API",
        difficulty: "Easy",
        promptMD: "Implement `delayMessage(message, delay, callback)` so it waits for `delay` milliseconds and then calls `callback(message)`. Keep the API callback-based, not promise-based.",
        hints: [
          "The timer is the host API.",
          "The callback should be invoked inside the timer callback.",
          "Do not block with a loop while waiting.",
        ],
        solutionCode: `
function delayMessage(message, delay, callback) {
  setTimeout(function () {
    callback(message);
  }, delay);
}

delayMessage('ready', 0, function (message) {
  console.log(message);
});
`,
        complexity: { time: "O(1) scheduling work", space: "O(1)" },
        explanationMD: "The function delegates waiting to `setTimeout`, so JavaScript does not block. When the host timer fires, it queues the callback as a task and the callback receives the original message.",
      },
    ],
    interviewQuestions: [
      {
        question: "Is `setTimeout` part of the JavaScript language?",
        answerMD: "No. `setTimeout` is a host API provided by browsers, workers, Node.js, and other runtimes. ECMAScript defines the language and promises, but timers come from the environment. The timer callback is later queued as a task.",
        companies: ["Amazon", "Google"],
        followUps: [
          "Where does the callback wait while the timer is pending?",
          "Why does the callback not block the call stack?",
        ],
      },
      {
        question: "What is the difference between a JavaScript engine and a browser runtime?",
        answerMD: "The engine parses, compiles, and executes JavaScript and manages the heap and call stack. The browser runtime surrounds the engine with Web APIs, queues, rendering, networking, storage, and the event loop integration that schedules callbacks.",
      },
    ],
    quiz: [
      {
        question: "Where does a timer wait after `setTimeout(callback, 1000)` is called?",
        options: [
          "On the JavaScript call stack",
          "Inside the host runtime until it is ready to queue a task",
          "Inside the microtask queue immediately",
          "Inside the promise reaction queue",
        ],
        correctIndex: 1,
        explanationMD: "The host runtime tracks the timer. When the delay elapses, the callback can be queued as a task.",
      },
      {
        question: "Which statement is most precise?",
        options: [
          "`fetch` is an ECMAScript syntax feature",
          "The DOM is implemented by the JavaScript engine",
          "Web APIs are supplied by the host environment",
          "Promises are task-queue callbacks",
        ],
        correctIndex: 2,
        explanationMD: "Web APIs are host-provided. Promise reactions are microtasks, not task-queue callbacks.",
      },
    ],
    summary: [
      "Web APIs are supplied by the host environment, not by ECMAScript itself.",
      "Calling a host API is synchronous; the async completion is queued later.",
      "Timer and event callbacks usually enter task queues.",
      "Promise reactions use the microtask queue once a promise settles.",
    ],
    cheatSheetMD: "**Engine:** runs JavaScript syntax and semantics.\n\n**Runtime:** adds timers, DOM, events, network, storage, rendering, and queues.\n\n**Timer flow:** call `setTimeout` → host tracks delay → callback enters task queue → event loop runs it later.\n\n**Interview phrasing:** `setTimeout` is a host API, not core ECMAScript.",
  },
  {
    slug: "js-task-queue",
    moduleId: "async-javascript",
    order: 59,
    title: "The Task (Macrotask) Queue",
    difficulty: "Intermediate",
    estimatedReadingMin: 12,
    estimatedPracticeMin: 14,
    tags: ["Task Queue", "Macrotask", "Timers", "Scheduling", "Event Loop"],
    introMD: "The **task queue**, commonly called the **macrotask queue** in interviews, holds callbacks for future event-loop turns: timers, UI events, message events, and other host-driven work.\n\nA task is bigger than a microtask. The event loop runs one task, lets it finish completely, drains all microtasks created by that task, and only then chooses another task.",
    whyItMattersMD: "Most async output puzzles depend on recognizing when something becomes a future task. Timer callbacks do not interleave with synchronous code, and a timer scheduled inside another timer usually goes behind already queued timer tasks. This is the difference between merely knowing `setTimeout` and actually tracing the queue.",
    theoryMD: "### What counts as a task\n\nThe initial script is a task. After it starts, it runs to completion. Other common task sources include `setTimeout`, `setInterval`, DOM event callbacks, `postMessage`, MessageChannel, and many I/O completion callbacks in host environments.\n\nThe term **macrotask** is popular in tutorials and interviews. The HTML specification talks about task queues and task sources. In interviews, saying `task queue, often called macrotask queue` is both practical and accurate.\n\n### FIFO within a source, not a global guarantee for everything\n\nFor simple interview snippets with multiple `setTimeout(..., 0)` calls, callbacks generally run in the order they are queued. Real browsers have multiple task sources and scheduling policy, so do not overstate that there is one universal FIFO queue for every possible async source.\n\n### Task versus microtask\n\nA task represents a new event-loop turn. A microtask is a checkpoint that runs after the current stack clears and before the next task. Therefore, if a timer callback schedules a promise callback, that promise callback runs before the next timer callback.\n\n### Nested timers\n\nIf task A schedules a new timer while task B is already queued, the new timer does not jump ahead of B. It becomes a future task. This is a common interview trick.\n\n### Rendering and responsiveness\n\nBrowsers may render between tasks after microtasks drain. Long tasks block input, rendering, and timers because the event loop cannot move on while the call stack is busy. Performance tooling often calls any task longer than about 50ms a long task.",
    diagrams: [
      {
        title: "Tasks are event-loop turns",
        ascii: `
Task queue
  |
  v
+------------------+      microtask checkpoint      +------------------+
| Run one task     | -----------------------------> | Drain microtasks |
| until stack empty|                                | until empty      |
+------------------+                                +------------------+
  |
  v
Browser may render, then pick another task
`,
        caption: "Only one task is executed at a time, but all microtasks drain after it.",
      },
      {
        title: "Nested timer ordering",
        ascii: `
Initial script queues:
  task A: timer A
  task B: timer B

Run task A:
  logs A
  queues task C: nested timer C

Queue is now:
  task B
  task C
`,
        caption: "A nested timer is appended after already queued timer work.",
      },
    ],
    codeExamples: [
      {
        title: "Timer task schedules a microtask",
        descriptionMD: "The microtask created inside the first timer drains before the second timer task.",
        language: "javascript",
        code: `
setTimeout(function () {
  console.log('timer A');

  Promise.resolve().then(function () {
    console.log('microtask after timer A');
  });
}, 0);

setTimeout(function () {
  console.log('timer B');
}, 0);
`,
      },
      {
        title: "Long tasks block the next task",
        descriptionMD: "A busy synchronous task prevents timers and event handlers from running. Avoid this shape in production UI code.",
        language: "javascript",
        code: `
setTimeout(function () {
  console.log('timer cannot run until the loop finishes');
}, 0);

var start = performance.now();
while (performance.now() - start < 200) {
  // Simulate expensive synchronous work.
}

console.log('long task finished');
`,
      },
    ],
    playground: [
      {
        title: "Timer tasks stay behind microtasks",
        descriptionMD: "Both timers are tasks, but a microtask inside the first timer runs before the second timer task.",
        code: `
setTimeout(function () {
  console.log('timer 1');

  Promise.resolve().then(function () {
    console.log('promise inside timer 1');
  });
}, 0);

setTimeout(function () {
  console.log('timer 2');
}, 0);

console.log('sync');
`,
      },
    ],
    outputPredictions: [
      {
        code: `
console.log('one');

setTimeout(function () {
  console.log('two');
}, 0);

setTimeout(function () {
  console.log('three');
}, 0);

Promise.resolve().then(function () {
  console.log('four');
});

console.log('five');
`,
        answer: "one\nfive\nfour\ntwo\nthree",
        explanationMD: "Synchronous code logs `one` and `five`. The promise microtask logs `four`. The two timers are tasks and then run in the order they were queued.",
      },
      {
        code: `
setTimeout(function () {
  console.log('timer A');

  setTimeout(function () {
    console.log('timer C');
  }, 0);
}, 0);

setTimeout(function () {
  console.log('timer B');
}, 0);

console.log('sync');
`,
        answer: "sync\ntimer A\ntimer B\ntimer C",
        explanationMD: "The initial script queues timer A and timer B, then logs `sync`. When timer A runs, it queues timer C behind already queued work, so timer B runs before timer C.",
      },
    ],
    codingExercises: [
      {
        title: "Yield work in chunks",
        difficulty: "Medium",
        promptMD: "Implement `processInTasks(items, size, work, done)` so it processes `size` items synchronously, then yields with `setTimeout(..., 0)` before processing the next chunk. Call `done()` after all items are processed.",
        hints: [
          "Keep an index outside the inner loop.",
          "Process at most `size` items per task.",
          "Schedule the next chunk with a timer instead of a recursive synchronous call.",
        ],
        solutionCode: `
function processInTasks(items, size, work, done) {
  var index = 0;

  function runChunk() {
    var end = Math.min(index + size, items.length);

    while (index < end) {
      work(items[index]);
      index += 1;
    }

    if (index < items.length) {
      setTimeout(runChunk, 0);
    } else {
      done();
    }
  }

  runChunk();
}

processInTasks([1, 2, 3], 2, function (item) {
  console.log(item);
}, function () {
  console.log('done');
});
`,
        complexity: { time: "O(n)", space: "O(1) besides the input" },
        explanationMD: "Chunking prevents one very long task. Each timer creates a new task, giving the event loop a chance to process other queued work between chunks.",
      },
    ],
    interviewQuestions: [
      {
        question: "What is a macrotask, and how is it different from a microtask?",
        answerMD: "A macrotask, more precisely a task, is a full event-loop turn such as the initial script, a timer callback, or an event callback. A microtask is a smaller callback checkpoint, such as a promise reaction, that runs after the current task's stack is empty and before the next task starts.",
        companies: ["Netflix", "Meta", "Google"],
      },
      {
        question: "If a timer callback schedules another timer, can the nested timer run before an already queued timer?",
        answerMD: "In the normal timer examples interviewers use, no. The nested timer is scheduled only when the first timer task runs, so it is queued behind timer tasks that were already eligible and waiting.",
        followUps: [
          "What if the first timer schedules a promise instead?",
          "Why can long tasks hurt UI responsiveness?",
        ],
      },
    ],
    quiz: [
      {
        question: "Which item is typically a task/macrotask?",
        options: [
          "`Promise.then` callback",
          "`queueMicrotask` callback",
          "`setTimeout` callback",
          "A synchronous function call already on the stack",
        ],
        correctIndex: 2,
        explanationMD: "Timer callbacks run as tasks. Promise and `queueMicrotask` callbacks are microtasks.",
      },
      {
        question: "What happens after a timer task finishes before the next timer task runs?",
        options: [
          "All queued microtasks drain",
          "Exactly one queued microtask runs",
          "The next timer always runs immediately",
          "Synchronous code from the previous task resumes",
        ],
        correctIndex: 0,
        explanationMD: "A microtask checkpoint runs after each task. It drains the microtask queue completely before the next task.",
      },
    ],
    summary: [
      "Tasks are full event-loop turns; timer and event callbacks are common task sources.",
      "The initial script itself runs as a task.",
      "After one task completes, all microtasks drain before the next task.",
      "Nested timers are future tasks and do not jump ahead of already queued work.",
    ],
    cheatSheetMD: "**Task/macrotask examples:** initial script, `setTimeout`, `setInterval`, DOM events, message events.\n\n**After every task:** call stack empty → drain all microtasks → maybe render → next task.\n\n**Nested timer trick:** a timer scheduled inside timer A goes behind timer B if B was already queued.\n\n**Performance:** long tasks block input, rendering, and async callbacks.",
  },
  {
    slug: "js-microtask-queue",
    moduleId: "async-javascript",
    order: 60,
    title: "The Microtask Queue",
    difficulty: "Advanced",
    estimatedReadingMin: 13,
    estimatedPracticeMin: 18,
    tags: ["Microtasks", "Promises", "queueMicrotask", "Starvation", "Output Prediction"],
    introMD: "The **microtask queue** is where promise reactions and `queueMicrotask` callbacks wait. It has higher priority than the task queue: after the current stack clears, the runtime drains every queued microtask before the next timer or event task.\n\nThis queue is the secret behind most async ordering puzzles.",
    whyItMattersMD: "Many candidates know that promises are async, but fewer can explain **how async** they are. Promise handlers do not run synchronously when a promise resolves, but they also do not wait for the next timer task. They run at the microtask checkpoint.",
    theoryMD: "### Sources of microtasks\n\nCommon microtask sources are:\n\n- `Promise.prototype.then`\n- `Promise.prototype.catch`\n- `Promise.prototype.finally`\n- `queueMicrotask`\n- MutationObserver callbacks in browsers\n\nThe callback passed to the `Promise` constructor is **not** a microtask. The executor runs synchronously. The reactions registered with `.then`, `.catch`, and `.finally` are microtasks.\n\n### Drain-until-empty semantics\n\nAt a microtask checkpoint, the runtime does not run just one microtask. It repeatedly dequeues and runs microtasks until the queue is empty. If a microtask enqueues another microtask, the new one is added to the end and still runs before the next task.\n\n### FIFO ordering\n\nFor ordinary promise and `queueMicrotask` examples, microtasks run in the order they are queued. Promise chaining can create new microtasks later. For example, the second `.then` in a chain cannot run until the promise returned by the first `.then` settles, so another already queued microtask may run between the two.\n\n### Starvation risk\n\nA recursive microtask loop can prevent timers and rendering from happening. That makes microtasks powerful but dangerous for heavy work. Use them for small follow-up actions that must happen before the next task, not for long-running loops.\n\n### Interview checklist\n\nWhen solving output predictions, mark each line as one of three categories: synchronous now, microtask later in this turn, or task in a future turn. Then drain all microtasks before touching tasks.",
    diagrams: [
      {
        title: "Microtask checkpoint",
        ascii: `
Current task completes
        |
        v
Microtask queue:
  1. promise then A
  2. queueMicrotask B
        |
        v
Run A
  A queues C
        |
        v
Queue now:
  1. B
  2. C
        |
        v
Run B, then C, then next task
`,
        caption: "New microtasks are appended and still drain before any task callback.",
      },
      {
        title: "Promise chain interleaving",
        ascii: `
Initial queue:
  first then of chain
  independent then

Run first then:
  logs A
  resolves returned promise
  queues second then of chain

Queue:
  independent then
  second then of chain
`,
        caption: "A promise chain can be interleaved with other already queued microtasks.",
      },
    ],
    codeExamples: [
      {
        title: "Promise executor is synchronous; reaction is microtask",
        descriptionMD: "A very common interview trap: creating a promise runs the executor immediately.",
        language: "javascript",
        code: `
const promise = new Promise(function (resolve) {
  console.log('executor runs now');
  resolve('fulfilled');
});

promise.then(function (value) {
  console.log('then runs later with', value);
});

console.log('synchronous end');
`,
      },
      {
        title: "Avoid recursive microtask starvation",
        descriptionMD: "This shape can keep the runtime busy with microtasks and delay timers. Use task-based yielding for large workloads.",
        language: "javascript",
        code: `
function spin(count) {
  if (count === 0) {
    return;
  }

  queueMicrotask(function () {
    spin(count - 1);
  });
}

spin(1000);
`,
      },
    ],
    playground: [
      {
        title: "Drain all microtasks",
        descriptionMD: "A microtask scheduled by another microtask still runs before the timer.",
        code: `
console.log('start');

queueMicrotask(function () {
  console.log('microtask 1');

  queueMicrotask(function () {
    console.log('microtask 3');
  });
});

Promise.resolve().then(function () {
  console.log('microtask 2');
});

setTimeout(function () {
  console.log('timer');
}, 0);

console.log('end');
`,
      },
    ],
    outputPredictions: [
      {
        code: `
console.log('start');

queueMicrotask(function () {
  console.log('microtask 1');

  queueMicrotask(function () {
    console.log('microtask 3');
  });
});

Promise.resolve().then(function () {
  console.log('microtask 2');
});

setTimeout(function () {
  console.log('timer');
}, 0);

console.log('end');
`,
        answer: "start\nend\nmicrotask 1\nmicrotask 2\nmicrotask 3\ntimer",
        explanationMD: "The script logs `start` and `end`. The first queued microtask logs `microtask 1` and appends `microtask 3`. The already queued promise microtask logs `microtask 2`, then the appended microtask logs `microtask 3`. Only then can the timer task run.",
      },
      {
        code: `
Promise.resolve()
  .then(function () {
    console.log('A');
  })
  .then(function () {
    console.log('B');
  });

Promise.resolve().then(function () {
  console.log('C');
});

console.log('D');
`,
        answer: "D\nA\nC\nB",
        explanationMD: "The first `.then` and the independent `.then` are initially queued as microtasks. After `A` runs, the second `.then` in the chain is queued behind the already waiting `C`, so the order is `D`, `A`, `C`, `B`.",
      },
    ],
    codingExercises: [
      {
        title: "Schedule after the current stack",
        difficulty: "Easy",
        promptMD: "Implement `afterCurrentTurn(callback)` so `callback` runs after the current synchronous code but before a `setTimeout(..., 0)` task.",
        hints: [
          "This is exactly what a microtask is for.",
          "Use `queueMicrotask` if available in the sandbox.",
          "A promise reaction is also a microtask.",
        ],
        solutionCode: `
function afterCurrentTurn(callback) {
  queueMicrotask(callback);
}

console.log('before');

afterCurrentTurn(function () {
  console.log('microtask callback');
});

setTimeout(function () {
  console.log('timer task');
}, 0);

console.log('after');
`,
        complexity: { time: "O(1)", space: "O(1)" },
        explanationMD: "`queueMicrotask` schedules the callback for the microtask checkpoint. It runs after `before` and `after`, but before the timer task.",
      },
    ],
    interviewQuestions: [
      {
        question: "What goes into the microtask queue?",
        answerMD: "Promise reactions from `then`, `catch`, and `finally`, callbacks passed to `queueMicrotask`, and browser features such as MutationObserver. The promise executor itself is synchronous and does not go into the microtask queue.",
        companies: ["Google", "Uber", "Microsoft"],
      },
      {
        question: "Can microtasks starve the task queue?",
        answerMD: "Yes. Because the runtime drains microtasks until the queue is empty before running the next task, a microtask that continuously queues more microtasks can delay timers, input handling, and rendering indefinitely.",
        followUps: [
          "When would you choose a task instead of a microtask?",
          "Why can promise chains delay rendering?",
        ],
      },
    ],
    quiz: [
      {
        question: "Which statement about promise executors is true?",
        options: [
          "The executor runs as a task",
          "The executor runs as a microtask",
          "The executor runs synchronously when the promise is created",
          "The executor runs only after `.then` is attached",
        ],
        correctIndex: 2,
        explanationMD: "The executor function passed to `new Promise` runs immediately and synchronously. Reactions registered with `.then` run as microtasks.",
      },
      {
        question: "If a microtask schedules another microtask, when does the new microtask run?",
        options: [
          "Before the next task, after older queued microtasks",
          "Only after all timer tasks",
          "Synchronously inside `queueMicrotask`",
          "Never, because microtasks cannot nest",
        ],
        correctIndex: 0,
        explanationMD: "The new microtask is appended to the queue, and the queue drains completely before the event loop picks the next task.",
      },
    ],
    summary: [
      "Promise reactions and `queueMicrotask` callbacks are microtasks.",
      "Promise executors run synchronously; `.then` handlers run later.",
      "The microtask queue drains until empty before the next task.",
      "Recursive microtasks can starve timers, input, and rendering.",
    ],
    cheatSheetMD: "**Microtask sources:** `Promise.then`, `catch`, `finally`, `queueMicrotask`, MutationObserver.\n\n**Not a microtask:** the `new Promise` executor.\n\n**Drain rule:** run all queued microtasks; newly queued ones are appended and also run before the next task.\n\n**Puzzle tactic:** sync first, then FIFO microtasks, then tasks.",
  },
  {
    slug: "js-async-callbacks",
    moduleId: "async-javascript",
    order: 61,
    title: "Asynchronous Callbacks",
    difficulty: "Intermediate",
    estimatedReadingMin: 10,
    estimatedPracticeMin: 12,
    tags: ["Callbacks", "Inversion of Control", "Timers", "Error First", "Async Patterns"],
    introMD: "A **callback** is a function passed to another function to be called later. An **asynchronous callback** is invoked after some future event: a timer fires, data arrives, a user clicks, or an operation completes.\n\nCallbacks are the oldest JavaScript async pattern. They are still everywhere, even when hidden behind promises and async/await.",
    whyItMattersMD: "Callbacks reveal two interview-critical ideas: not every callback is asynchronous, and passing a callback creates **inversion of control**. You give another function the power to decide if, when, how often, and with what arguments your function runs.",
    theoryMD: "### Callback does not automatically mean async\n\n`[1, 2, 3].map(callback)` calls the callback synchronously during the same stack. `setTimeout(callback, 0)` calls the callback asynchronously as a later task. Always ask: who invokes the callback, and when?\n\n### One-shot versus repeated callbacks\n\nSome async callbacks are one-shot, such as a timer or a single completion handler. Others are repeated, such as event listeners or intervals. Repeated callbacks need cleanup, otherwise they can cause leaks or duplicate work.\n\n### Error-first convention\n\nMany Node-style APIs use `(error, data)` callbacks. The first argument is non-null if the operation failed. This convention made errors explicit before promises were standardized, but it also created repetitive branching and nested control flow.\n\n### Inversion of control risks\n\nWhen you hand a callback to another function, you trust that function to call it exactly once, call it asynchronously if promised, preserve arguments, and handle errors. Bugs such as double-calling a callback are common in callback-heavy systems.\n\n### Callback scheduling\n\nA callback-based API can still choose different scheduling mechanisms: synchronous invocation, microtask scheduling, or task scheduling. Good APIs document this. In interviews, always trace the specific scheduling primitive in the snippet.",
    diagrams: [
      {
        title: "Callback ownership",
        ascii: `
Your code
  |
  | passes callback
  v
Async API or helper
  |
  | later decides when to call
  v
callback(value)
`,
        caption: "Callbacks invert control: the callee owns the moment of invocation.",
      },
      {
        title: "Synchronous callback versus async callback",
        ascii: `
Synchronous:
  caller -> helper -> callback -> helper returns -> caller continues

Asynchronous:
  caller -> helper schedules work -> helper returns -> caller continues
                                      later task -> callback
`,
        caption: "The word callback describes a shape, not a scheduling guarantee.",
      },
    ],
    codeExamples: [
      {
        title: "Error-first callback style",
        descriptionMD: "This is common in Node-style APIs. The pattern is useful to recognize even if modern code wraps it in promises.",
        language: "javascript",
        code: `
readUser('u1', function (error, user) {
  if (error) {
    console.error('Could not read user', error);
    return;
  }

  console.log(user.name);
});
`,
      },
      {
        title: "Guard against double callbacks",
        descriptionMD: "Robust callback APIs often protect consumers from accidental double invocation.",
        language: "javascript",
        code: `
function once(callback) {
  var called = false;

  return function (value) {
    if (called) {
      return;
    }

    called = true;
    callback(value);
  };
}
`,
      },
    ],
    playground: [
      {
        title: "Synchronous and asynchronous callbacks",
        descriptionMD: "The first callback runs immediately. The timer callback runs as a future task.",
        code: `
function runNow(callback) {
  callback('sync callback');
}

function runLater(callback) {
  setTimeout(function () {
    callback('async callback');
  }, 0);
}

console.log('start');

runNow(function (message) {
  console.log(message);
});

runLater(function (message) {
  console.log(message);
});

console.log('end');
`,
      },
    ],
    outputPredictions: [
      {
        code: `
function maybeAsync(callback) {
  callback('sync');

  setTimeout(function () {
    callback('async');
  }, 0);
}

console.log('before');

maybeAsync(function (value) {
  console.log(value);
});

console.log('after');
`,
        answer: "before\nsync\nafter\nasync",
        explanationMD: "The first callback call is synchronous, so `sync` logs before `after`. The timer callback is a future task, so `async` logs last.",
      },
      {
        code: `
console.log('start');

setTimeout(function () {
  console.log('callback');
}, 0);

Promise.resolve().then(function () {
  console.log('promise');
});

console.log('end');
`,
        answer: "start\nend\npromise\ncallback",
        explanationMD: "The timer uses an async callback queued as a task. The promise handler is a microtask, so it runs after synchronous code but before the timer callback.",
      },
    ],
    codingExercises: [
      {
        title: "Create a once-only async callback",
        difficulty: "Medium",
        promptMD: "Implement `onceAsync(callback)` so the returned function can be called many times, but schedules the original callback at most once. The original callback should run asynchronously with the first value.",
        hints: [
          "Store a boolean flag in a closure.",
          "Return early after the first call.",
          "Use a timer to make the final callback asynchronous.",
        ],
        solutionCode: `
function onceAsync(callback) {
  var called = false;

  return function (value) {
    if (called) {
      return;
    }

    called = true;

    setTimeout(function () {
      callback(value);
    }, 0);
  };
}

var done = onceAsync(function (value) {
  console.log(value);
});

done('first');
done('second');
`,
        complexity: { time: "O(1)", space: "O(1)" },
        explanationMD: "The closure stores whether the callback has already been scheduled. Only the first call sets the flag and creates a timer task.",
      },
    ],
    interviewQuestions: [
      {
        question: "Does passing a callback make code asynchronous?",
        answerMD: "No. A callback is just a function argument. It is asynchronous only if the receiving API invokes it later, such as from a timer, event, or I/O completion. Array methods like `map` call callbacks synchronously.",
        companies: ["Amazon", "Microsoft"],
      },
      {
        question: "What is inversion of control in callback-based code?",
        answerMD: "You hand control of your continuation to another function. That function decides when to invoke it, whether to invoke it once or multiple times, what arguments to pass, and how errors are represented. Promises reduce some of this risk by standardizing one settlement and chainable error propagation.",
        followUps: [
          "How do promises prevent double completion?",
          "Why are repeated event callbacks different from completion callbacks?",
        ],
      },
    ],
    quiz: [
      {
        question: "Which callback is synchronous?",
        options: [
          "The callback passed to `setTimeout`",
          "The callback passed to `Promise.then`",
          "The callback passed to `Array.prototype.map`",
          "A click event listener",
        ],
        correctIndex: 2,
        explanationMD: "`map` invokes its callback during the current synchronous call. The others run later.",
      },
      {
        question: "What is a common risk of callback-based APIs?",
        options: [
          "They cannot receive arguments",
          "The callee controls when and how often the callback runs",
          "They always run as microtasks",
          "They cannot represent errors",
        ],
        correctIndex: 1,
        explanationMD: "Callbacks invert control. The provider may call too early, too late, more than once, or with inconsistent arguments unless carefully designed.",
      },
    ],
    summary: [
      "A callback is a function passed to be invoked by another function.",
      "Callbacks can be synchronous or asynchronous depending on the API.",
      "Async callbacks often run as future tasks, but callback style alone does not determine the queue.",
      "Callback-heavy code suffers from inversion of control and repetitive error handling.",
    ],
    cheatSheetMD: "**Callback:** function passed to another function.\n\n**Not always async:** `map` is sync; `setTimeout` is async.\n\n**One-shot:** completion handlers, timers.\n\n**Repeated:** events, intervals.\n\n**Risk:** inversion of control, double calls, missing errors, hard nesting.",
  },
  {
    slug: "js-callback-hell",
    moduleId: "async-javascript",
    order: 62,
    title: "Callback Hell",
    difficulty: "Intermediate",
    estimatedReadingMin: 11,
    estimatedPracticeMin: 14,
    tags: ["Callback Hell", "Pyramid of Doom", "Promises", "Error Handling", "Refactoring"],
    introMD: "**Callback hell** is the deeply nested, hard-to-maintain shape that appears when multiple async callback operations depend on each other. It is also called the **pyramid of doom** because the indentation grows with each step.\n\nThe problem is not callbacks themselves; it is sequencing, error propagation, and shared state spread across many nested functions.",
    whyItMattersMD: "Interviewers ask about callback hell because it motivates promises and async/await. A strong answer does more than say `it looks ugly`; it explains lost linear flow, duplicated error handling, difficult composition, and why promises flatten the control flow.",
    theoryMD: "### What makes callback hell painful\n\nNested callbacks create several problems at once:\n\n- **Readability**: the main path is indented several levels deep.\n- **Error handling**: each level must remember to check and return on errors.\n- **Composition**: it is difficult to run independent operations in parallel and join results.\n- **Control flow**: early returns, retries, cancellation, and cleanup are scattered.\n- **Testing**: deeply nested anonymous functions are harder to isolate.\n\n### Pyramid of doom example\n\nA typical flow is: load user → load orders → calculate total → save report. With callbacks, every step is nested inside the previous step's success path. The error path is repeated at each level.\n\n### How promises improve it\n\nPromises standardize a single eventual result: pending → fulfilled or rejected. A `.then` can return another promise, letting the next `.then` wait for it without another indentation level. A single `.catch` can handle errors from the whole chain.\n\n### How async/await improves it further\n\n`async`/`await` lets you write promise-based code in a synchronous-looking sequence. `try/catch` handles errors naturally, and `Promise.all` expresses parallelism.\n\n### Important nuance\n\nPromises do not make async work faster by themselves. They improve composition and error propagation. For speed, you must identify independent operations and start them before awaiting them.",
    diagrams: [
      {
        title: "Pyramid of doom",
        ascii: `
getUser(function (user) {
  getOrders(user, function (orders) {
    getInvoice(orders, function (invoice) {
      sendEmail(invoice, function () {
        done();
      });
    });
  });
});
`,
        caption: "Each dependency adds another level of nesting and another error path.",
      },
      {
        title: "Flattening with promises",
        ascii: `
getUser()
  -> then getOrders
  -> then getInvoice
  -> then sendEmail
  -> catch errors once
`,
        caption: "Promise chaining moves the happy path back toward the left edge.",
      },
    ],
    codeExamples: [
      {
        title: "Nested callbacks with repeated errors",
        descriptionMD: "This shape is hard to scan because the main path and error path are interleaved at every level.",
        language: "javascript",
        code: `
getUser(id, function (userError, user) {
  if (userError) {
    handleError(userError);
    return;
  }

  getOrders(user.id, function (ordersError, orders) {
    if (ordersError) {
      handleError(ordersError);
      return;
    }

    createReport(orders, function (reportError, report) {
      if (reportError) {
        handleError(reportError);
        return;
      }

      render(report);
    });
  });
});
`,
      },
      {
        title: "The same dependency chain with promises",
        descriptionMD: "Each step returns a promise. A single catch handles rejections from any earlier step.",
        language: "javascript",
        code: `
getUser(id)
  .then(function (user) {
    return getOrders(user.id);
  })
  .then(function (orders) {
    return createReport(orders);
  })
  .then(function (report) {
    render(report);
  })
  .catch(function (error) {
    handleError(error);
  });
`,
      },
    ],
    playground: [
      {
        title: "Nested timer callbacks",
        descriptionMD: "This tiny example shows the pyramid shape even before real error handling is added.",
        code: `
setTimeout(function () {
  console.log('load user');

  setTimeout(function () {
    console.log('load orders');

    setTimeout(function () {
      console.log('render page');
    }, 0);
  }, 0);
}, 0);

console.log('scheduled');
`,
      },
    ],
    outputPredictions: [
      {
        code: `
console.log('start');

setTimeout(function () {
  console.log('user');

  setTimeout(function () {
    console.log('orders');
  }, 0);
}, 0);

setTimeout(function () {
  console.log('audit');
}, 0);

console.log('end');
`,
        answer: "start\nend\nuser\naudit\norders",
        explanationMD: "The initial script queues the `user` timer and the `audit` timer, then logs `end`. The nested `orders` timer is not queued until the `user` timer runs, so it goes behind `audit`.",
      },
      {
        code: `
function step(name, callback) {
  setTimeout(function () {
    console.log(name);
    callback();
  }, 0);
}

step('A', function () {
  step('B', function () {
    console.log('done');
  });
});

console.log('scheduled');
`,
        answer: "scheduled\nA\nB\ndone",
        explanationMD: "`step('A')` schedules a timer and returns, so `scheduled` logs first. Timer A logs `A` and schedules timer B. Timer B later logs `B`, then its callback logs `done` synchronously inside that timer task.",
      },
    ],
    codingExercises: [
      {
        title: "Promisify a callback API",
        difficulty: "Medium",
        promptMD: "Implement `delayValue(value, delay)` so it returns a promise that fulfills with `value` after `delay` milliseconds. Then chain two calls so the output is `first`, `second`, `done`.",
        hints: [
          "Wrap `setTimeout` inside `new Promise`.",
          "Call `resolve(value)` from the timer callback.",
          "Return the second promise from the first `.then` to flatten the chain.",
        ],
        solutionCode: `
function delayValue(value, delay) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(value);
    }, delay);
  });
}

delayValue('first', 0)
  .then(function (value) {
    console.log(value);
    return delayValue('second', 0);
  })
  .then(function (value) {
    console.log(value);
    console.log('done');
  });
`,
        complexity: { time: "O(1) scheduling work", space: "O(1)" },
        explanationMD: "The promise wrapper converts a callback completion into a composable value. Returning the second promise from the first `.then` prevents another nesting level.",
      },
    ],
    interviewQuestions: [
      {
        question: "What is callback hell?",
        answerMD: "Callback hell is deeply nested callback-based control flow where each async step is inside the previous step. It hurts readability, duplicates error handling, makes composition difficult, and spreads control flow across nested functions.",
        companies: ["PayPal", "Amazon", "Microsoft"],
      },
      {
        question: "How do promises address callback hell?",
        answerMD: "Promises represent one eventual fulfillment or rejection. Returning promises from `.then` handlers flattens dependent async steps, and a shared `.catch` centralizes error handling. Async/await builds on promises to make the same flow read more linearly.",
        followUps: [
          "When should you use `Promise.all` instead of sequential chaining?",
          "Do promises make the underlying async operation faster?",
        ],
      },
    ],
    quiz: [
      {
        question: "Which issue is callback hell most associated with?",
        options: [
          "Too many primitive values",
          "Deeply nested async continuations and repeated error handling",
          "Promises resolving too quickly",
          "The lack of a call stack",
        ],
        correctIndex: 1,
        explanationMD: "Callback hell is about nested continuations, difficult control flow, and repeated error paths.",
      },
      {
        question: "What promise behavior helps flatten dependent async steps?",
        options: [
          "A `.then` handler can return another promise",
          "Promise executors always run as tasks",
          "A promise can be fulfilled many times",
          "`setTimeout` becomes a microtask inside promises",
        ],
        correctIndex: 0,
        explanationMD: "If a `.then` returns a promise, the next `.then` waits for it, allowing a flat chain instead of nested callbacks.",
      },
    ],
    summary: [
      "Callback hell is nested async control flow, not merely the existence of callbacks.",
      "It makes error handling, composition, and testing harder.",
      "Promises flatten dependent steps and centralize rejection handling.",
      "Async/await improves readability further while still using promises underneath.",
    ],
    cheatSheetMD: "**Symptoms:** nested callbacks, repeated error checks, hard-to-follow sequencing.\n\n**Promise fix:** return promises from `.then` to flatten the chain; use `.catch` once.\n\n**Async/await fix:** write linear code with `try/catch`.\n\n**Performance note:** promises improve composition, not the speed of the underlying operation.",
  },
  {
    slug: "js-promises-intro",
    moduleId: "async-javascript",
    order: 63,
    title: "Introduction to Promises",
    difficulty: "Intermediate",
    estimatedReadingMin: 13,
    estimatedPracticeMin: 18,
    tags: ["Promises", "Then", "Catch", "Microtasks", "Chaining"],
    introMD: "A **promise** is an object representing the eventual result of an asynchronous operation. It starts pending, then settles exactly once as either fulfilled with a value or rejected with a reason.\n\nPromises replaced many callback patterns because they standardize completion, support chaining, and move error propagation into the chain.",
    whyItMattersMD: "Promises are the foundation under `async`/`await`, `fetch`, modern testing utilities, and almost every JavaScript async abstraction. Interviewers expect you to know not only the states, but also that `.then` callbacks are microtasks and the promise executor runs synchronously.",
    theoryMD: "### Promise states\n\nA promise has three conceptual states:\n\n- **Pending**: the operation has not settled yet.\n- **Fulfilled**: the operation completed successfully with a value.\n- **Rejected**: the operation failed with a reason.\n\nOnce settled, a promise cannot change state. Calling `resolve` or `reject` again has no effect.\n\n### Executor versus reactions\n\nThe function passed to `new Promise(executor)` runs immediately and synchronously. The callbacks passed to `.then`, `.catch`, and `.finally` run later as microtasks.\n\n### Chaining\n\n`.then` always returns a new promise. If the handler returns a plain value, the next promise fulfills with that value. If it throws, the next promise rejects. If it returns another promise, the next promise waits for that promise to settle. This is the rule that lets promises flatten async sequences.\n\n### Error propagation\n\nA rejection skips fulfillment handlers until a rejection handler is found. A `.catch` is shorthand for `.then(undefined, onRejected)`. After a catch handles the error and returns normally, the chain becomes fulfilled again.\n\n### Promise is eager, not lazy\n\nCreating a promise with `new Promise` starts the executor immediately. It is not a lazy recipe. If you need laziness, wrap promise creation in a function and call that function later.\n\n### Promise limitations\n\nNative promises do not include cancellation by themselves, and they represent one completion, not repeated events. Use AbortController for cancellable Web APIs and events or streams for repeated values.",
    diagrams: [
      {
        title: "Promise lifecycle",
        ascii: `
              resolve(value)
Pending ------------------------> Fulfilled
   |
   | reject(reason)
   v
Rejected

Settled promises do not change state again.
`,
        caption: "A promise settles exactly once.",
      },
      {
        title: "Promise chaining",
        ascii: `
then handler returns value
  -> next promise fulfills with value

then handler throws error
  -> next promise rejects with error

then handler returns promise
  -> next promise adopts that promise's eventual state
`,
        caption: "Every `.then` returns a new promise, enabling flat composition.",
      },
    ],
    codeExamples: [
      {
        title: "Creating and consuming a promise",
        descriptionMD: "The executor starts immediately. The `then` handler runs as a microtask after the current stack.",
        language: "javascript",
        code: `
const userPromise = new Promise(function (resolve) {
  console.log('executor');
  resolve({ id: 1, name: 'Ada' });
});

userPromise.then(function (user) {
  console.log(user.name);
});

console.log('after attaching then');
`,
      },
      {
        title: "Error propagation through a chain",
        descriptionMD: "Throwing inside a `.then` rejects the promise returned by that `.then`.",
        language: "javascript",
        code: `
loadUser()
  .then(function (user) {
    if (!user.active) {
      throw new Error('Inactive user');
    }

    return loadDashboard(user.id);
  })
  .then(function (dashboard) {
    renderDashboard(dashboard);
  })
  .catch(function (error) {
    showError(error.message);
  });
`,
      },
    ],
    playground: [
      {
        title: "Executor now, then later",
        descriptionMD: "Notice the executor log is synchronous, while the `.then` log is a microtask.",
        code: `
const promise = new Promise(function (resolve) {
  console.log('executor');
  resolve('fulfilled value');
});

promise.then(function (value) {
  console.log(value);
});

console.log('after promise');
`,
      },
    ],
    outputPredictions: [
      {
        code: `
const promise = new Promise(function (resolve) {
  console.log('executor');
  resolve('value');
});

promise.then(function (value) {
  console.log(value);
});

console.log('after');
`,
        answer: "executor\nafter\nvalue",
        explanationMD: "The promise executor runs synchronously and logs `executor`. The `.then` callback is a microtask, so `after` logs before `value`.",
      },
      {
        code: `
Promise.resolve()
  .then(function () {
    console.log('first');
    return 'second';
  })
  .then(function (value) {
    console.log(value);
  });

setTimeout(function () {
  console.log('timer');
}, 0);

console.log('sync');
`,
        answer: "sync\nfirst\nsecond\ntimer",
        explanationMD: "The synchronous `sync` log comes first. The promise chain runs through microtasks, and all microtasks drain before the timer task runs.",
      },
      {
        code: `
Promise.resolve('A')
  .then(function (value) {
    console.log(value);
    throw new Error('boom');
  })
  .catch(function () {
    console.log('caught');
  })
  .then(function () {
    console.log('done');
  });

console.log('sync');
`,
        answer: "sync\nA\ncaught\ndone",
        explanationMD: "`sync` logs first. The first `.then` logs `A` and throws, so the chain jumps to `.catch`. The catch handles the rejection and returns normally, so the final `.then` logs `done`.",
      },
    ],
    codingExercises: [
      {
        title: "Run promise tasks sequentially",
        difficulty: "Medium",
        promptMD: "Implement `runSequentially(tasks)` where `tasks` is an array of functions. Each function returns a promise. Run them one after another and return a promise that fulfills with an array of results in order.",
        hints: [
          "Start with `Promise.resolve([])`.",
          "In each `.then`, call the next task only after the previous promise fulfilled.",
          "Return a new array or push into the existing result array carefully.",
        ],
        solutionCode: `
function runSequentially(tasks) {
  return tasks.reduce(function (chain, task) {
    return chain.then(function (results) {
      return task().then(function (value) {
        results.push(value);
        return results;
      });
    });
  }, Promise.resolve([]));
}

function makeTask(value) {
  return function () {
    return Promise.resolve(value);
  };
}

runSequentially([makeTask('A'), makeTask('B')]).then(function (results) {
  console.log(results.join(','));
});
`,
        complexity: { time: "O(n)", space: "O(n)" },
        explanationMD: "The reduce builds a promise chain. Each task starts only after the previous chain has fulfilled, preserving order and collecting results.",
      },
    ],
    interviewQuestions: [
      {
        question: "What are the states of a promise?",
        answerMD: "A promise starts pending and then settles exactly once as fulfilled with a value or rejected with a reason. After settlement, further attempts to resolve or reject are ignored.",
        companies: ["Google", "Amazon", "Meta"],
      },
      {
        question: "What is the difference between the promise executor and a `.then` callback?",
        answerMD: "The executor passed to `new Promise` runs synchronously at construction time. A `.then` callback is a promise reaction and runs later as a microtask after the current call stack clears.",
        followUps: [
          "What happens if a `.then` handler returns a promise?",
          "What happens if it throws?",
        ],
      },
    ],
    quiz: [
      {
        question: "What does `.then` return?",
        options: [
          "The same promise every time",
          "A new promise",
          "The raw value returned by the handler",
          "A timer id",
        ],
        correctIndex: 1,
        explanationMD: "`.then` always returns a new promise, which fulfills, rejects, or adopts another promise based on the handler result.",
      },
      {
        question: "When does the function passed to `new Promise(function (resolve) { ... })` run?",
        options: [
          "Synchronously during construction",
          "As a microtask after construction",
          "As a timer task",
          "Only after `.then` is attached",
        ],
        correctIndex: 0,
        explanationMD: "The executor runs immediately and synchronously. Reactions attached with `.then` run as microtasks.",
      },
    ],
    summary: [
      "A promise represents one eventual fulfillment or rejection.",
      "Promise executors run synchronously; reactions run as microtasks.",
      "`.then` returns a new promise and supports flattening by returning another promise.",
      "Errors thrown in a chain become rejections and can be handled by `.catch`.",
    ],
    cheatSheetMD: "**States:** pending → fulfilled or rejected; settled once.\n\n**Executor:** synchronous.\n\n**Reactions:** `.then`, `.catch`, `.finally` are microtasks.\n\n**Chaining:** return value → fulfill next; throw → reject next; return promise → adopt it.\n\n**Catch:** handles rejection and can turn the chain back to fulfilled.",
  },
  {
    slug: "js-async-await",
    moduleId: "async-javascript",
    order: 64,
    title: "async / await",
    difficulty: "Intermediate",
    estimatedReadingMin: 13,
    estimatedPracticeMin: 18,
    tags: ["async await", "Promises", "Sequential", "Parallel", "Error Handling"],
    introMD: "`async`/`await` is syntax built on promises. An `async` function always returns a promise, and `await` pauses that async function until the awaited value is fulfilled or rejected.\n\nIt makes promise-based code read like ordinary sequential code, but it does **not** make asynchronous work synchronous. The call stack still unwinds, and the continuation after `await` runs later as promise/microtask work.",
    whyItMattersMD: "Modern frontend and backend JavaScript is full of `async` functions. Interviews test whether you know the difference between clean syntax and actual concurrency: sequential awaits can be slow, while starting promises first and then awaiting `Promise.all` enables parallel work.",
    theoryMD: "### What `async` does\n\nAn `async function` wraps its return value in a promise. Returning `42` from an async function fulfills the returned promise with `42`. Throwing an error rejects the returned promise.\n\n### What `await` does\n\n`await expression` converts the expression to a promise-like value and suspends only the current async function. The outer caller keeps running. When the awaited value settles, the rest of the async function continues later. That continuation is scheduled through promise mechanics, so it behaves like microtask work.\n\n### Error handling\n\nInside an async function, use `try/catch` around awaited work. A rejection from an awaited promise acts like a thrown error at that line. If it is not caught, the async function's returned promise rejects.\n\n### Sequential versus parallel awaits\n\nThis is one of the most important production and interview distinctions:\n\n- **Sequential**: `const a = await loadA(); const b = await loadB();` starts `loadB` only after `loadA` finishes. Use this when B depends on A.\n- **Parallel**: `const aPromise = loadA(); const bPromise = loadB(); const [a, b] = await Promise.all([aPromise, bPromise]);` starts both immediately and waits for both. Use this when they are independent.\n\n### Top-level await note\n\nTop-level `await` exists in ES modules, but many interview snippets avoid it because support depends on module context. In ordinary scripts, use an async function wrapper.\n\n### Common mistakes\n\nDo not use `await` inside `Array.prototype.forEach` expecting the outer function to wait. Use `for...of` for sequential work or `Promise.all(items.map(...))` for parallel work.",
    diagrams: [
      {
        title: "Async function execution",
        ascii: `
caller invokes async function
        |
        v
sync part of async function runs immediately
        |
        v
await reached
        |
        +---- async function returns pending promise to caller
        |
        v
awaited promise settles later
        |
        v
continuation after await runs as promise work
`,
        caption: "`await` pauses the async function, not the whole program.",
      },
      {
        title: "Sequential versus parallel",
        ascii: `
Sequential:
  start A -> wait A -> start B -> wait B

Parallel:
  start A ------------------ wait both
  start B ------------------ wait both
`,
        caption: "Parallel awaits require starting the promises before awaiting their results.",
      },
    ],
    codeExamples: [
      {
        title: "Sequential when one result depends on another",
        descriptionMD: "This is correct when the second request needs the first result.",
        language: "javascript",
        code: `
async function loadDashboard(userId) {
  const user = await getUser(userId);
  const dashboard = await getDashboard(user.organizationId);

  return {
    user: user,
    dashboard: dashboard,
  };
}
`,
      },
      {
        title: "Parallel when operations are independent",
        descriptionMD: "Start both promises before awaiting. This often cuts total wait time.",
        language: "javascript",
        code: `
async function loadHomePage() {
  const profilePromise = getProfile();
  const notificationsPromise = getNotifications();

  const results = await Promise.all([
    profilePromise,
    notificationsPromise,
  ]);

  return {
    profile: results[0],
    notifications: results[1],
  };
}
`,
      },
    ],
    playground: [
      {
        title: "Await pauses only the async function",
        descriptionMD: "The caller continues after the async function reaches `await`.",
        code: `
async function demo() {
  console.log('inside 1');
  await Promise.resolve();
  console.log('inside 2');
}

console.log('before');
demo();
console.log('after');
`,
      },
    ],
    outputPredictions: [
      {
        code: `
async function demo() {
  console.log('inside 1');
  await Promise.resolve();
  console.log('inside 2');
}

console.log('before');
demo();
console.log('after');
`,
        answer: "before\ninside 1\nafter\ninside 2",
        explanationMD: "`demo()` starts synchronously and logs `inside 1`. At `await`, it returns a pending promise to the caller. The outer script logs `after`, then the async continuation logs `inside 2` as promise work.",
      },
      {
        code: `
function wait(label) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      console.log(label);
      resolve(label);
    }, 0);
  });
}

async function run() {
  const a = wait('A');
  const b = wait('B');

  await a;
  await b;

  console.log('done');
}

run();
console.log('scheduled');
`,
        answer: "scheduled\nA\nB\ndone",
        explanationMD: "Both timers are started before the first await. The script logs `scheduled`. Timer A resolves `a`; the async function continues, reaches `await b`, and waits because B has not run yet. Timer B then resolves `b`, and the continuation logs `done`.",
      },
    ],
    codingExercises: [
      {
        title: "Convert sequential awaits to parallel awaits",
        difficulty: "Medium",
        promptMD: "Implement `loadPair(loadA, loadB)` so it starts both independent async functions immediately, waits for both, and returns an object `{ a, b }`.",
        hints: [
          "Call both functions before the first `await`.",
          "Use `Promise.all` to wait for both results.",
          "Destructure or index the result array.",
        ],
        solutionCode: `
async function loadPair(loadA, loadB) {
  const aPromise = loadA();
  const bPromise = loadB();

  const results = await Promise.all([aPromise, bPromise]);

  return {
    a: results[0],
    b: results[1],
  };
}

loadPair(
  function () {
    return Promise.resolve('A');
  },
  function () {
    return Promise.resolve('B');
  }
).then(function (pair) {
  console.log(pair.a + pair.b);
});
`,
        complexity: { time: "O(1) scheduling work plus async latency", space: "O(1)" },
        explanationMD: "Calling both loaders first starts both operations. `Promise.all` waits for both to fulfill and preserves result order based on the input array, not completion order.",
      },
    ],
    interviewQuestions: [
      {
        question: "What does an async function return?",
        answerMD: "It always returns a promise. A returned plain value fulfills that promise, and a thrown error rejects it. If it returns another promise, the async function's returned promise adopts that result.",
        companies: ["Google", "Meta", "Amazon"],
      },
      {
        question: "How do you decide between sequential and parallel awaits?",
        answerMD: "Use sequential awaits when later work depends on earlier results. Use parallel awaits when operations are independent: start all promises first, then await `Promise.all`. This improves latency without changing the single-threaded execution model.",
        followUps: [
          "What happens if one promise in `Promise.all` rejects?",
          "Why is `await` inside `forEach` usually a bug?",
        ],
      },
    ],
    quiz: [
      {
        question: "What happens when an `async` function throws?",
        options: [
          "The error is thrown synchronously to the caller in all cases",
          "The async function returns a rejected promise",
          "The error is converted to `undefined`",
          "The function retries automatically",
        ],
        correctIndex: 1,
        explanationMD: "Thrown errors inside async functions reject the promise returned by that async function.",
      },
      {
        question: "Which pattern starts two independent operations in parallel?",
        options: [
          "`const a = await loadA(); const b = await loadB();`",
          "`const aPromise = loadA(); const bPromise = loadB(); await Promise.all([aPromise, bPromise]);`",
          "`await loadA(); await loadB();` inside `forEach`",
          "`setTimeout(loadA, 0); await loadB();`",
        ],
        correctIndex: 1,
        explanationMD: "Both operations are started before awaiting either result, and `Promise.all` waits for both.",
      },
    ],
    summary: [
      "`async` functions always return promises.",
      "`await` pauses only the current async function; callers continue running.",
      "Awaited rejections behave like thrown errors and can be handled with `try/catch`.",
      "Start independent promises before awaiting to run them in parallel with `Promise.all`.",
    ],
    cheatSheetMD: "**async:** return value → fulfilled promise; thrown error → rejected promise.\n\n**await:** pauses the async function, not the whole program.\n\n**Sequential:** await A, then start B when B depends on A.\n\n**Parallel:** start A and B first, then `await Promise.all([a, b])`.\n\n**Pitfall:** `forEach(async item => ...)` does not make the outer function wait.",
  },
];
