import type { Topic } from "../../types";

export const TOPICS: Topic[] = [
  {
    slug: "js-dom",
    moduleId: "browser-apis",
    order: 92,
    title: "The DOM",
    difficulty: "Beginner",
    estimatedReadingMin: 11,
    estimatedPracticeMin: 8,
    tags: ["DOM", "Browser", "Nodes", "Rendering"],
    introMD: "The **Document Object Model (DOM)** is the browser's live object representation of an HTML page. JavaScript does not edit the original HTML file directly; it reads and mutates a tree of objects such as `document`, `Element`, `Text`, and `Node`.\n\nThis topic gives you the interview mental model for selecting, creating, inserting, removing, and updating nodes without accidentally causing security or performance problems.",
    whyItMattersMD: "DOM fluency separates language-only JavaScript knowledge from frontend engineering. If you can explain the DOM as a tree, attributes vs properties, and why repeated layout reads can be expensive, you can reason through most browser UI questions confidently.",
    theoryMD: "### The DOM is a tree\n\nThe browser parses HTML and creates a tree. The document is the root, element nodes are branches, and text nodes are leaves. JavaScript mutates that live tree, then the browser updates what the user sees.\n\n| Concept | Meaning | Common APIs |\n| --- | --- | --- |\n| `Document` | Whole page | `querySelector`, `createElement` |\n| `Element` | A tag such as `button` or `main` | `classList`, `dataset`, `setAttribute` |\n| `Text` | Text inside an element | `textContent` |\n| `DocumentFragment` | Temporary off-tree container | Batch inserts before one live-tree write |\n\n### Selecting nodes\n\nUse `querySelector` for the first match and `querySelectorAll` for a static list. Scope queries to a known container when possible: `form.querySelector('[name=email]')` is more predictable than searching the whole page.\n\n### Creating and updating\n\nA safe workflow is: create nodes, set `textContent`, set classes or attributes, then append once. Prefer `textContent` for untrusted text because `innerHTML` parses markup and can create XSS bugs if the input is not trusted and sanitized.\n\n### Attributes vs properties\n\nAttributes are string values in markup. Properties are live JavaScript fields on DOM objects. For an input, the `value` attribute is the initial value, while `input.value` is the current value after the user types. Use properties for live state and attributes for metadata, accessibility, and initial configuration.\n\n### Reflow and repaint intuition\n\nDOM changes can trigger style recalculation, layout, paint, and compositing. Reading layout values after writing styles can force layout immediately. Compute data first, batch DOM reads together, then batch DOM writes together.",
    diagrams: [
      {
        title: "DOM tree mental model",
        ascii: `Document
  html
    head
      title
        Text: ElevateIQ
    body
      main#app
        h1
          Text: Browser APIs
        ul.lesson-list
          li[data-id=dom]
            Text: The DOM
          li[data-id=events]
            Text: Events`,
        caption: "The DOM is a live tree of node objects that JavaScript can traverse and mutate.",
      },
      {
        title: "Rendering work after a mutation",
        ascii: `DOM write
  |
  v
Style recalculation
  |
  v
Layout if geometry changed
  |
  v
Paint if pixels changed
  |
  v
Composite final layers`,
        caption: "Not every change runs every step, but geometry changes are usually more expensive than text-only or transform-only changes.",
      },
    ],
    codeExamples: [
      {
        title: "Select and update safely",
        descriptionMD: "Use `textContent`, `classList`, and `dataset` for common UI updates without parsing HTML.",
        language: "javascript",
        code: `const heading = document.querySelector('#lesson-title');
const status = document.querySelector('[data-status]');

heading.textContent = 'The DOM';
status.dataset.status = 'complete';
status.classList.add('is-complete');
status.setAttribute('aria-live', 'polite');`,
      },
      {
        title: "Create and insert nodes with a fragment",
        descriptionMD: "Build multiple nodes off-tree, then replace the visible list in one operation.",
        language: "javascript",
        code: `const lessons = ['DOM', 'Events', 'Storage'];
const list = document.querySelector('#lessons');
const fragment = document.createDocumentFragment();

for (const lesson of lessons) {
  const item = document.createElement('li');
  item.className = 'lesson-item';
  item.textContent = lesson;
  fragment.append(item);
}

list.replaceChildren(fragment);`,
      },
      {
        title: "Attribute vs property on an input",
        descriptionMD: "The attribute is initial markup; the property reflects current runtime state.",
        language: "javascript",
        code: `const input = document.querySelector('#display-name');

console.log(input.getAttribute('value'));
console.log(input.value);

input.value = 'Grace Hopper';
input.setAttribute('aria-label', 'Display name');`,
      },
    ],
    codingExercises: [
      {
        title: "Plan a minimal list patch",
        difficulty: "Medium",
        promptMD: "Write `planListPatch(currentIds, nextIds)` that returns operations before any DOM mutation. Return `remove:<id>` for ids missing from the next list and `add:<id>` for ids missing from the current list.",
        hints: ["Convert arrays to `Set`s.", "Compute removals from the current list.", "Compute additions from the next list."],
        solutionCode: `function planListPatch(currentIds, nextIds) {
  const current = new Set(currentIds);
  const next = new Set(nextIds);
  const operations = [];

  for (const id of currentIds) {
    if (!next.has(id)) {
      operations.push('remove:' + id);
    }
  }

  for (const id of nextIds) {
    if (!current.has(id)) {
      operations.push('add:' + id);
    }
  }

  return operations;
}

console.log(planListPatch(['a', 'b'], ['b', 'c']));`,
        complexity: { time: "O(n + m)", space: "O(n + m)" },
        explanationMD: "The solution separates calculation from mutation. Real UI code should compute a patch first, then perform DOM writes in a small batch.",
      },
    ],
    interviewQuestions: [
      {
        question: "What is the DOM, and how is it different from HTML?",
        answerMD: "HTML is source text. The DOM is the browser's live object tree created from that text. JavaScript reads and mutates DOM nodes, and the browser updates rendering from that live tree.",
        companies: ["Microsoft", "Google", "Meta"],
        followUps: ["What is a `DocumentFragment`?", "Why is `textContent` safer than `innerHTML`?"],
      },
      {
        question: "Explain attributes vs properties with an input element.",
        answerMD: "The `value` attribute is the initial markup value. The `input.value` property is live runtime state and changes as the user types. Use properties for current state and attributes for metadata or initial configuration.",
        companies: ["Amazon", "Apple"],
      },
    ],
    quiz: [
      {
        question: "Which API is usually safest for inserting untrusted plain text?",
        options: ["innerHTML", "outerHTML", "textContent", "document.write"],
        correctIndex: 2,
        explanationMD: "`textContent` treats the value as text, not markup. `innerHTML` parses markup and can be dangerous with untrusted input.",
      },
      {
        question: "Why use a `DocumentFragment` when rendering many items?",
        options: ["It makes nodes immutable", "It lets you assemble nodes before one insertion", "It sends nodes to the server", "It disables events"],
        correctIndex: 1,
        explanationMD: "A fragment is an off-tree container. Build inside it, then insert once into the live DOM.",
      },
    ],
    summary: [
      "The DOM is the browser's live object tree for a document.",
      "Use scoped selectors, node creation, and `textContent` for safe updates.",
      "Attributes are markup/configuration; properties often represent live state.",
      "Batch DOM reads and writes to reduce unnecessary rendering work.",
    ],
    cheatSheetMD: "**Select:** `querySelector`, `querySelectorAll`.\n\n**Create:** `createElement`, `createTextNode`, `createDocumentFragment`.\n\n**Insert:** `append`, `prepend`, `before`, `after`, `replaceChildren`.\n\n**Remove:** `remove`.\n\n**Safe text:** prefer `textContent` for untrusted strings.\n\n**Performance:** compute first, batch reads, batch writes.",
  },
  {
    slug: "js-events",
    moduleId: "browser-apis",
    order: 93,
    title: "The Event Model",
    difficulty: "Beginner",
    estimatedReadingMin: 10,
    estimatedPracticeMin: 8,
    tags: ["Events", "EventTarget", "Event Object", "Listeners"],
    introMD: "The browser event model is how JavaScript reacts to user and system activity: clicks, key presses, form submissions, pointer movement, media events, and more. You register a listener on an `EventTarget`; later, the browser calls your function with an `Event` object.\n\nInterviewers use events to test practical browser fluency: `addEventListener`, `this` vs `event.currentTarget`, `preventDefault`, propagation control, and listener options like `once`, `passive`, and `capture`.",
    whyItMattersMD: "Events are the boundary between a static page and an application. A clear event model prevents double submissions, broken keyboard behavior, memory leaks from forgotten listeners, and confusing bugs where a parent handler runs after a child handler.",
    theoryMD: "### EventTarget and listeners\n\nMany browser objects implement `EventTarget`: elements, the document, the window, media objects, and more. The core API is `addEventListener(type, listener, options)` and `removeEventListener(type, listener, options)`.\n\n| Option | Meaning | Interview note |\n| --- | --- | --- |\n| `capture` | Run during capture phase | Same idea as old third argument `true` |\n| `once` | Auto-remove after first call | Useful for one-time onboarding or setup |\n| `passive` | Listener promises not to call `preventDefault` | Improves scroll performance |\n| `signal` | Remove when an `AbortController` aborts | Clean lifecycle management |\n\n### The Event object\n\nKey fields and methods:\n\n- `event.type` is the event name.\n- `event.target` is where the event originated.\n- `event.currentTarget` is the object whose listener is currently running.\n- `event.preventDefault()` cancels the browser's default action when the event is cancelable.\n- `event.stopPropagation()` prevents the event from moving to later ancestors.\n- `event.stopImmediatePropagation()` also prevents later listeners on the same target from running.\n\n### Default action vs propagation\n\n`preventDefault` stops browser behavior such as navigation or form submission. It does not stop parent listeners. `stopPropagation` stops event travel through the path. It does not cancel the default action.\n\n### Handler identity matters\n\nTo remove a listener, pass the same function reference and compatible capture setting. Anonymous inline functions are convenient but cannot be removed later unless you keep the reference.",
    diagrams: [
      {
        title: "Listener dispatch overview",
        ascii: `User action
  |
  v
Browser creates Event object
  |
  v
Browser finds event path
  |
  v
Matching listeners run
  |
  v
Default action may run`,
        caption: "The browser owns dispatch; your listener receives an object describing what happened.",
      },
      {
        title: "Propagation methods",
        ascii: `preventDefault
  cancels browser action

stopPropagation
  stops travel to later ancestors

stopImmediatePropagation
  also stops later listeners on same target`,
        caption: "A common interview trap is claiming `preventDefault` stops bubbling. It does not.",
      },
    ],
    codeExamples: [
      {
        title: "Read the Event object",
        descriptionMD: "`target` is the original source. `currentTarget` is the element whose listener is currently executing.",
        language: "javascript",
        code: `const card = document.querySelector('.card');

card.addEventListener('click', function (event) {
  console.log(event.type);
  console.log(event.target);
  console.log(event.currentTarget);
});`,
      },
      {
        title: "Prevent a default form action",
        descriptionMD: "Use `preventDefault` when JavaScript should handle a cancelable browser action.",
        language: "javascript",
        code: `const form = document.querySelector('#signup');

form.addEventListener('submit', function (event) {
  event.preventDefault();

  const data = new FormData(form);
  console.log('submit email', data.get('email'));
});`,
      },
      {
        title: "Use listener options for lifecycle",
        descriptionMD: "`once` removes a listener automatically. `signal` lets a component clean up related listeners.",
        language: "javascript",
        code: `const controller = new AbortController();
const button = document.querySelector('#start');

button.addEventListener('click', function () {
  console.log('runs once');
}, { once: true });

button.addEventListener('pointermove', function (event) {
  console.log(event.clientX, event.clientY);
}, { signal: controller.signal });

controller.abort();`,
      },
    ],
    playground: [
      {
        title: "Simulate default action separately from propagation",
        descriptionMD: "This pure JavaScript model shows that cancelling the default action and stopping propagation are different flags.",
        code: `function createEvent() {
  return {
    defaultPrevented: false,
    propagationStopped: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
    stopPropagation() {
      this.propagationStopped = true;
    }
  };
}

const event = createEvent();
event.preventDefault();
console.log('default prevented:', event.defaultPrevented);
console.log('propagation stopped:', event.propagationStopped);`,
      },
    ],
    outputPredictions: [
      {
        code: `const event = {
  defaultPrevented: false,
  propagationStopped: false,
  preventDefault() {
    this.defaultPrevented = true;
  },
  stopPropagation() {
    this.propagationStopped = true;
  }
};

event.stopPropagation();
console.log(event.defaultPrevented);
console.log(event.propagationStopped);`,
        answer: "false\ntrue",
        explanationMD: "Stopping propagation does not cancel the default-action flag. The two mechanisms are independent.",
      },
    ],
    codingExercises: [
      {
        title: "Build a tiny listener dispatcher",
        difficulty: "Medium",
        promptMD: "Implement `dispatch(listeners)` where each listener receives an event-like object. If a listener calls `stopImmediatePropagation`, no later listeners should run. Return the names of listeners that ran.",
        hints: ["Use one shared event-like object.", "Track a boolean stop flag.", "Break the loop when the flag is set."],
        solutionCode: `function dispatch(listeners) {
  const ran = [];
  const event = {
    stoppedImmediately: false,
    stopImmediatePropagation() {
      this.stoppedImmediately = true;
    }
  };

  for (const listener of listeners) {
    listener(event);
    ran.push(listener.name || 'anonymous');

    if (event.stoppedImmediately) {
      break;
    }
  }

  return ran;
}

function first() {}
function second(event) {
  event.stopImmediatePropagation();
}
function third() {}

console.log(dispatch([first, second, third]));`,
        complexity: { time: "O(n)", space: "O(n)" },
        explanationMD: "The same event object moves through the listener list. Once the immediate-stop flag is set, dispatch stops before later listeners run.",
      },
    ],
    interviewQuestions: [
      {
        question: "What is the difference between `event.target` and `event.currentTarget`?",
        answerMD: "`event.target` is the original object where the event started. `event.currentTarget` is the object whose listener is currently running. During propagation, one target can produce many current targets as the event travels through ancestors.",
        companies: ["Meta", "Microsoft", "Google"],
        followUps: ["How does this matter for event delegation?"],
      },
      {
        question: "Compare `preventDefault`, `stopPropagation`, and `stopImmediatePropagation`.",
        answerMD: "`preventDefault` cancels a cancelable browser default action. `stopPropagation` stops the event from continuing to later ancestors. `stopImmediatePropagation` also prevents later listeners on the same current target from running.",
        companies: ["Amazon", "Netflix"],
      },
    ],
    quiz: [
      {
        question: "Which listener option automatically removes the listener after it runs once?",
        options: ["capture", "passive", "once", "signal"],
        correctIndex: 2,
        explanationMD: "`once: true` tells the browser to invoke the listener at most one time and then remove it.",
      },
      {
        question: "What does `preventDefault()` do?",
        options: ["Stops all parent listeners", "Cancels the browser's default action for a cancelable event", "Deletes the event object", "Runs the listener during capture"],
        correctIndex: 1,
        explanationMD: "`preventDefault` is about default browser behavior, not event propagation.",
      },
    ],
    summary: [
      "Events are dispatched to listeners registered on EventTarget objects.",
      "`target` is the source; `currentTarget` is the object currently handling the event.",
      "`preventDefault` cancels default action; propagation methods control event travel and listener ordering.",
      "Use options like `once`, `passive`, `capture`, and `signal` deliberately.",
    ],
    cheatSheetMD: "**Add:** `target.addEventListener(type, handler, options)`.\n\n**Remove:** same handler reference and matching capture setting.\n\n**Event fields:** `type`, `target`, `currentTarget`, `defaultPrevented`.\n\n**Cancel default:** `preventDefault()`.\n\n**Stop travel:** `stopPropagation()`.\n\n**Stop same-target listeners too:** `stopImmediatePropagation()`.\n\n**Options:** `{ capture, once, passive, signal }`.",
  },
  {
    slug: "js-event-bubbling",
    moduleId: "browser-apis",
    order: 94,
    title: "Event Bubbling",
    difficulty: "Intermediate",
    estimatedReadingMin: 9,
    estimatedPracticeMin: 7,
    tags: ["Events", "Bubbling", "Propagation", "UI"],
    introMD: "**Event bubbling** is the phase where an event starts at the target and then travels upward through ancestors. A click on a button can be observed by the button, its card, its list, and higher containers.\n\nThis is why one user action can trigger multiple handlers. It is also the foundation for event delegation.",
    whyItMattersMD: "Bubbling explains common interview snippets: a child click logs before a parent click, `stopPropagation` changes the order, and a parent can handle clicks for many children. Without this mental model, event bugs look random.",
    theoryMD: "### What bubbles?\n\nMany common events bubble: `click`, `input`, `change`, `keydown`, and most pointer events. Some events do not bubble or have bubbling alternatives. For example, `focus` and `blur` do not bubble, while `focusin` and `focusout` do.\n\n### Bubble order\n\nFor a nested target, the bubble phase runs from the target upward: target, parent, grandparent, and so on. During that journey, `event.target` stays the original source while `event.currentTarget` changes for each listener.\n\n### Stopping bubbling\n\nUse `event.stopPropagation()` sparingly. It can be appropriate for nested controls, modals, and menus, but overusing it makes components hard to compose because outer code can no longer observe legitimate events.\n\n### Bubbling vs default action\n\nBubbling is about listener order. It is not the same as default behavior. Calling `stopPropagation` on a link click does not stop navigation; call `preventDefault` for that.",
    diagrams: [
      {
        title: "Capture to target to bubble",
        ascii: `root
  |
  v  capture phase
section
  |
  v
button  target phase
  |
  ^
section
  |
  ^  bubble phase
root`,
        caption: "Bubbling is the upward half of the event journey, from the target back through ancestors.",
      },
      {
        title: "Bubbling order for a button click",
        ascii: `button listener
  then
card listener
  then
list listener
  then
page listener`,
        caption: "The deepest target handles the bubble phase before its ancestors.",
      },
    ],
    codeExamples: [
      {
        title: "Observe bubbling through nested elements",
        descriptionMD: "All three listeners can see the same click. `currentTarget` changes at each step.",
        language: "javascript",
        code: `const list = document.querySelector('.lesson-list');
const card = document.querySelector('.lesson-card');
const button = document.querySelector('.start-button');

list.addEventListener('click', function (event) {
  console.log('list saw', event.target.className);
});

card.addEventListener('click', function () {
  console.log('card saw click');
});

button.addEventListener('click', function () {
  console.log('button saw click');
});`,
      },
      {
        title: "Stop a nested click from reaching ancestors",
        descriptionMD: "Use this carefully because it prevents outer components from seeing the event.",
        language: "javascript",
        code: `const menu = document.querySelector('.menu');
const closeButton = document.querySelector('.menu-close');

menu.addEventListener('click', function () {
  console.log('menu background clicked');
});

closeButton.addEventListener('click', function (event) {
  event.stopPropagation();
  console.log('close button clicked');
});`,
      },
    ],
    playground: [
      {
        title: "Simulate bubbling order",
        descriptionMD: "A pure array can model the upward path from a target to its ancestors.",
        code: `const pathFromTarget = ['button', 'card', 'list', 'root'];

for (const name of pathFromTarget) {
  console.log('bubble:', name);
}`,
      },
    ],
    outputPredictions: [
      {
        code: `const pathFromTarget = ['button', 'card', 'root'];
let stopped = false;

for (const name of pathFromTarget) {
  if (stopped) {
    continue;
  }

  console.log(name);

  if (name === 'card') {
    stopped = true;
  }
}`,
        answer: "button\ncard",
        explanationMD: "The model walks from target upward. When the card step sets the stop flag, the later root step is skipped.",
      },
    ],
    codingExercises: [
      {
        title: "Return the bubbling path",
        difficulty: "Easy",
        promptMD: "Implement `getBubbleOrder(target, parentMap)` where `parentMap` maps a node name to its parent name. Return an array from target to root.",
        hints: ["Start with the target.", "Repeatedly look up the current node's parent.", "Stop when there is no parent."],
        solutionCode: `function getBubbleOrder(target, parentMap) {
  const order = [];
  let current = target;

  while (current) {
    order.push(current);
    current = parentMap[current];
  }

  return order;
}

const parents = {
  button: 'card',
  card: 'list',
  list: 'root'
};

console.log(getBubbleOrder('button', parents));`,
        complexity: { time: "O(h)", space: "O(h)" },
        explanationMD: "Bubbling walks from the target through each ancestor. The height of the tree determines the work.",
      },
    ],
    interviewQuestions: [
      {
        question: "What is event bubbling?",
        answerMD: "Event bubbling is the propagation phase where an event travels from its target up through ancestor nodes. A click on a button can trigger the button listener first, then parent listeners, unless propagation is stopped.",
        companies: ["Google", "Microsoft", "Amazon"],
        followUps: ["How does bubbling enable event delegation?"],
      },
      {
        question: "Does `stopPropagation` prevent a link from navigating?",
        answerMD: "No. `stopPropagation` stops the event from moving to later ancestors. Link navigation is the default action, so it requires `preventDefault` on a cancelable click event.",
        companies: ["Meta", "Netflix"],
      },
    ],
    quiz: [
      {
        question: "During bubbling, which listener usually runs first for a click inside nested elements?",
        options: ["The outermost ancestor listener", "The target element's listener", "A random listener", "Only capture listeners"],
        correctIndex: 1,
        explanationMD: "In the bubble phase, dispatch starts at the target and moves upward to ancestors.",
      },
      {
        question: "Which method stops the event from reaching later ancestors?",
        options: ["preventDefault", "stopPropagation", "querySelector", "removeEventListener"],
        correctIndex: 1,
        explanationMD: "`stopPropagation` stops propagation through the event path. It does not cancel default browser behavior.",
      },
    ],
    summary: [
      "Bubbling moves from the event target upward through ancestors.",
      "`target` stays the original source; `currentTarget` changes as listeners run.",
      "`stopPropagation` stops later ancestors but does not cancel default action.",
      "Bubbling is the mechanism that makes event delegation practical.",
    ],
    cheatSheetMD: "**Bubble path:** target → parent → grandparent → root.\n\n**Common bubbling events:** `click`, `input`, `change`, `keydown`, pointer events.\n\n**Non-bubbling examples:** `focus`, `blur` (use `focusin`, `focusout` when delegation is needed).\n\n**Stop:** `event.stopPropagation()`.\n\n**Remember:** stopping propagation is not the same as preventing default action.",
  },
  {
    slug: "js-event-capturing",
    moduleId: "browser-apis",
    order: 95,
    title: "Event Capturing",
    difficulty: "Intermediate",
    estimatedReadingMin: 8,
    estimatedPracticeMin: 7,
    tags: ["Events", "Capturing", "Propagation", "addEventListener"],
    introMD: "**Event capturing** is the phase before the target handles the event. The event travels from the top of the tree down toward the target, giving ancestors an early chance to observe or intercept it.\n\nIn modern JavaScript, you opt into this phase with `addEventListener(type, handler, { capture: true })` or the legacy third argument `true`.",
    whyItMattersMD: "Capturing is less common than bubbling, so it is a strong interview differentiator. It matters for global shortcuts, analytics, overlays, and framework internals that need to observe events before local components stop propagation.",
    theoryMD: "### The three phases\n\nThe browser dispatch algorithm has three conceptual phases:\n\n1. **Capturing phase**: ancestors from the root down to the target's parent.\n2. **Target phase**: listeners on the target itself.\n3. **Bubbling phase**: ancestors from the target's parent back upward.\n\nA listener registered with `capture: true` runs during capture. A listener registered without it runs during target or bubble depending on where it is placed.\n\n### The old `useCapture` flag\n\nThe third parameter to `addEventListener` used to be a boolean: `true` for capture and `false` for bubble. Modern code prefers an options object because `{ capture: true, once: true }` is self-documenting and extensible.\n\n### Why use capture?\n\nUse capture when an ancestor must run before children: outside-click boundaries, global keyboard policies, analytics that should run before bubbling is stopped, or a modal layer that needs first chance at pointer events.\n\n### Caveats\n\nCapturing can surprise teammates because most UI code assumes bubbling. Use it intentionally, name handlers clearly, and avoid changing behavior globally unless the feature truly needs precedence.",
    diagrams: [
      {
        title: "Full propagation flow",
        ascii: `root capture listener
  |
  v
panel capture listener
  |
  v
button target listeners
  |
  ^
panel bubble listener
  |
  ^
root bubble listener`,
        caption: "Capture runs top-down before target; bubbling runs bottom-up after target.",
      },
      {
        title: "Boolean flag vs options object",
        ascii: `addEventListener('click', handler, true)
  means capture

addEventListener('click', handler, { capture: true })
  means capture and can add once, passive, or signal later`,
        caption: "The options object is clearer in production code than a mysterious boolean.",
      },
    ],
    codeExamples: [
      {
        title: "Run an ancestor listener during capture",
        descriptionMD: "The page-level capture listener runs before the button's regular click listener.",
        language: "javascript",
        code: `const page = document.querySelector('.page');
const button = document.querySelector('.save-button');

page.addEventListener('click', function () {
  console.log('page capture');
}, { capture: true });

button.addEventListener('click', function () {
  console.log('button target or bubble listener');
});`,
      },
      {
        title: "Capture with lifecycle cleanup",
        descriptionMD: "Use an `AbortController` when capture listeners belong to a component lifecycle.",
        language: "javascript",
        code: `const controller = new AbortController();
const modal = document.querySelector('.modal');

window.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    modal.classList.remove('is-open');
  }
}, { capture: true, signal: controller.signal });

controller.abort();`,
      },
    ],
    playground: [
      {
        title: "Simulate capture, target, and bubble",
        descriptionMD: "This pure JavaScript snippet prints the conceptual order without using browser APIs.",
        code: `const ancestors = ['root', 'panel'];
const target = 'button';

for (const name of ancestors) {
  console.log('capture:', name);
}

console.log('target:', target);

for (const name of ancestors.slice().reverse()) {
  console.log('bubble:', name);
}`,
      },
    ],
    outputPredictions: [
      {
        code: `const path = ['root', 'panel', 'button'];

for (let i = 0; i < path.length - 1; i++) {
  console.log('capture ' + path[i]);
}

console.log('target ' + path[path.length - 1]);

for (let i = path.length - 2; i >= 0; i--) {
  console.log('bubble ' + path[i]);
}`,
        answer: "capture root\ncapture panel\ntarget button\nbubble panel\nbubble root",
        explanationMD: "Capture walks toward the target. After the target step, bubbling walks the same ancestors in reverse.",
      },
    ],
    codingExercises: [
      {
        title: "Compute the full propagation order",
        difficulty: "Medium",
        promptMD: "Implement `getPropagationOrder(path)` where `path` is ordered from root to target. Return labels for capture, target, and bubble phases.",
        hints: ["Capture includes every item before the target.", "The target is the final item in the path.", "Bubble uses ancestors in reverse order."],
        solutionCode: `function getPropagationOrder(path) {
  const order = [];
  const targetIndex = path.length - 1;

  for (let i = 0; i < targetIndex; i++) {
    order.push('capture:' + path[i]);
  }

  order.push('target:' + path[targetIndex]);

  for (let i = targetIndex - 1; i >= 0; i--) {
    order.push('bubble:' + path[i]);
  }

  return order;
}

console.log(getPropagationOrder(['root', 'panel', 'button']));`,
        complexity: { time: "O(h)", space: "O(h)" },
        explanationMD: "The path is traversed once downward for capture and once upward for bubbling. The target sits between the two passes.",
      },
    ],
    interviewQuestions: [
      {
        question: "What is event capturing and how do you register a capture listener?",
        answerMD: "Capturing is the top-down propagation phase before the event reaches its target. Register a listener with `addEventListener('click', handler, { capture: true })` or the older third argument `true`.",
        companies: ["Google", "Apple", "Microsoft"],
        followUps: ["When would capture be useful?", "How is it different from bubbling?"],
      },
      {
        question: "What is the order of event phases?",
        answerMD: "The order is capturing, target, then bubbling. Capture listeners on ancestors run from outermost to innermost, target listeners run on the target, and bubble listeners on ancestors run from innermost to outermost.",
        companies: ["Meta", "Amazon"],
      },
    ],
    quiz: [
      {
        question: "How do you opt into the capture phase with modern `addEventListener` syntax?",
        options: ["Pass `{ capture: true }`", "Call `event.capture()`", "Use `preventDefault()`", "Attach the listener after page load only"],
        correctIndex: 0,
        explanationMD: "The options object can include `capture: true` to run the listener during capture.",
      },
      {
        question: "Which phase runs first for an event dispatched to a nested target?",
        options: ["Bubbling", "Capturing", "Default action", "Garbage collection"],
        correctIndex: 1,
        explanationMD: "The event travels from outer ancestors toward the target during capture before target and bubble phases.",
      },
    ],
    summary: [
      "Capturing is the top-down phase before the event reaches the target.",
      "Use `{ capture: true }` rather than an unexplained boolean when possible.",
      "The full order is capture → target → bubble.",
      "Capture is powerful but should be used intentionally because most UI code expects bubbling.",
    ],
    cheatSheetMD: "**Order:** capture → target → bubble.\n\n**Register:** `addEventListener(type, handler, { capture: true })`.\n\n**Legacy:** third argument `true` means capture.\n\n**Use cases:** global shortcuts, outside-click boundaries, analytics before child stops propagation.\n\n**Caution:** surprising if overused; document why a capture listener exists.",
  },
  {
    slug: "js-event-delegation",
    moduleId: "browser-apis",
    order: 96,
    title: "Event Delegation",
    difficulty: "Intermediate",
    estimatedReadingMin: 10,
    estimatedPracticeMin: 9,
    tags: ["Events", "Delegation", "closest", "Dynamic UI"],
    introMD: "**Event delegation** means attaching one listener to a stable ancestor and using bubbling to handle events from matching descendants. Instead of adding a click listener to every row button, you add one listener to the table or list.\n\nIt scales better, works for dynamically inserted elements, and is one of the most practical browser patterns to know for interviews and production UI work.",
    whyItMattersMD: "Delegation turns propagation into leverage. It reduces listener count, avoids re-binding after rendering new items, and centralizes behavior. Interviewers like it because it requires understanding `event.target`, bubbling, selector matching, and nested targets.",
    theoryMD: "### The core pattern\n\n1. Attach a listener to a stable parent.\n2. Inspect `event.target` inside the handler.\n3. Use `closest(selector)` to find the actionable descendant.\n4. Guard that the match belongs to the parent.\n5. Read data from `dataset` or attributes and perform the action.\n\n### Why `closest` beats direct matching\n\nUsers often click an icon or span inside a button. If the handler checks only `event.target.matches('button')`, it may miss clicks on nested children. `event.target.closest('[data-action]')` climbs from the actual target to the nearest matching ancestor.\n\n### Why delegation works with dynamic elements\n\nThe parent listener already exists. When a new child is inserted later, its events still bubble through that parent, so no new listener is required.\n\n### When not to delegate\n\nDelegation is not always right. Avoid it when the event does not bubble, when behavior depends heavily on isolated component state, when the parent becomes a huge unrelated switch statement, or when capture-phase interception is needed.\n\n### Security and correctness\n\nDo not trust `dataset` values as authorization. They are client-side hints. Also guard with `parent.contains(match)` when the listener is on a broad container and the selector could match outside the intended region.",
    diagrams: [
      {
        title: "One parent handles many child actions",
        ascii: `ul.todo-list  listener here
  li[data-id=1]
    button[data-action=toggle]
    button[data-action=delete]
  li[data-id=2]
    button[data-action=toggle]
    button[data-action=delete]
  li[data-id=3]
    button[data-action=toggle]
    button[data-action=delete]`,
        caption: "The buttons do not need individual listeners because their click events bubble to the list.",
      },
      {
        title: "Nested click target",
        ascii: `button[data-action=delete]
  svg icon
    path  actual click target

closest('[data-action]') climbs from path to button`,
        caption: "Delegated handlers should usually use `closest`, not only direct target matching.",
      },
    ],
    codeExamples: [
      {
        title: "Delegate actions from a list",
        descriptionMD: "One listener handles all current and future buttons inside the list.",
        language: "javascript",
        code: `const list = document.querySelector('.todo-list');

list.addEventListener('click', function (event) {
  const button = event.target.closest('[data-action]');

  if (!button || !list.contains(button)) {
    return;
  }

  const item = button.closest('[data-id]');
  const action = button.dataset.action;
  const id = item.dataset.id;

  if (action === 'delete') {
    item.remove();
  }

  if (action === 'toggle') {
    item.classList.toggle('is-complete');
  }

  console.log(action, id);
});`,
      },
      {
        title: "Dynamic children work automatically",
        descriptionMD: "The newly appended button does not need its own listener; the parent listener sees its bubbled click.",
        language: "javascript",
        code: `const list = document.querySelector('.todo-list');
const item = document.createElement('li');
const button = document.createElement('button');

item.dataset.id = '42';
button.dataset.action = 'delete';
button.textContent = 'Delete generated item';

item.append(button);
list.append(item);`,
      },
    ],
    playground: [
      {
        title: "Simulate closest matching",
        descriptionMD: "This pure JavaScript model represents a nested click and climbs ancestors until an action is found.",
        code: `const nodes = {
  path: { parent: 'icon' },
  icon: { parent: 'button' },
  button: { parent: 'item', action: 'delete' },
  item: { parent: 'list' },
  list: { parent: null }
};

function findAction(start) {
  let current = start;

  while (current) {
    if (nodes[current].action) {
      return nodes[current].action;
    }

    current = nodes[current].parent;
  }

  return null;
}

console.log(findAction('path'));`,
      },
    ],
    outputPredictions: [
      {
        code: `const tree = {
  text: { parent: 'button' },
  button: { parent: 'row', action: 'save' },
  row: { parent: 'list' },
  list: { parent: null }
};

let current = 'text';
let action = null;

while (current) {
  if (tree[current].action) {
    action = tree[current].action;
    break;
  }

  current = tree[current].parent;
}

console.log(action);`,
        answer: "save",
        explanationMD: "The search starts at the deepest clicked node and climbs to the nearest ancestor with an action.",
      },
    ],
    codingExercises: [
      {
        title: "Implement a closest-style lookup",
        difficulty: "Medium",
        promptMD: "Implement `closestWithAction(start, nodes)` where each node has optional `parent` and `action` fields. Return the first action found while climbing ancestors, or `null`.",
        hints: ["Use a loop with a `current` variable.", "Check the current node before moving to its parent.", "Return `null` if the root is reached without a match."],
        solutionCode: `function closestWithAction(start, nodes) {
  let current = start;

  while (current) {
    const node = nodes[current];

    if (node.action) {
      return node.action;
    }

    current = node.parent;
  }

  return null;
}

const nodes = {
  label: { parent: 'button' },
  button: { parent: 'row', action: 'edit' },
  row: { parent: 'list' },
  list: { parent: null }
};

console.log(closestWithAction('label', nodes));`,
        complexity: { time: "O(h)", space: "O(1)" },
        explanationMD: "This mirrors the delegated event pattern: start from the actual target, climb ancestors, and stop at the first actionable element.",
      },
    ],
    interviewQuestions: [
      {
        question: "What is event delegation and why is it useful?",
        answerMD: "Event delegation attaches one listener to a stable ancestor and uses bubbling to handle matching descendants. It reduces listener count, works for dynamically added nodes, and centralizes behavior. The handler usually uses `event.target.closest(selector)`.",
        companies: ["Google", "Meta", "Microsoft"],
        followUps: ["Why is `closest` better than checking only `event.target`?"],
      },
      {
        question: "What are common edge cases in delegated handlers?",
        answerMD: "The actual click target may be a nested icon, so use `closest`. The selector may match outside the intended container, so guard with `container.contains(match)`. Some events do not bubble, and a large delegated handler can become hard to maintain.",
        companies: ["Amazon", "Netflix"],
      },
    ],
    quiz: [
      {
        question: "Why does event delegation work for elements added after the listener was registered?",
        options: ["The browser copies the listener to every new child", "The event bubbles through the stable parent listener", "New elements automatically call `addEventListener`", "Delegation only works after a reload"],
        correctIndex: 1,
        explanationMD: "The parent listener is already in the bubble path, so events from new descendants still reach it.",
      },
      {
        question: "Which method is most useful for finding an actionable ancestor from a nested click target?",
        options: ["closest", "setTimeout", "preventDefault", "JSON.stringify"],
        correctIndex: 0,
        explanationMD: "`closest(selector)` climbs from the target to the nearest ancestor that matches the selector.",
      },
    ],
    summary: [
      "Delegation uses one ancestor listener to handle many descendant events.",
      "Use `event.target.closest(selector)` to handle nested click targets robustly.",
      "Delegation scales and works with dynamically inserted nodes.",
      "Guard boundaries and avoid turning one parent handler into an unrelated switchboard.",
    ],
    cheatSheetMD: "**Pattern:** parent listener → `event.target.closest(selector)` → boundary guard → action.\n\n**Best for:** lists, tables, menus, repeated controls, dynamic content.\n\n**Guard:** `if (!match || !parent.contains(match)) return`.\n\n**Data:** read `dataset` for client-side ids or actions.\n\n**Avoid when:** event does not bubble, behavior is unrelated, or local state is simpler.",
  },
  {
    slug: "js-local-storage",
    moduleId: "browser-apis",
    order: 97,
    title: "localStorage",
    difficulty: "Beginner",
    estimatedReadingMin: 10,
    estimatedPracticeMin: 6,
    tags: ["Storage", "localStorage", "JSON", "Security"],
    introMD: "`localStorage` is a browser key-value store scoped to an origin. It stores strings, persists across reloads and browser restarts, and is useful for non-sensitive client preferences such as theme, dismissed banners, and lightweight drafts.\n\nIt is simple, but interviewers expect you to know its limits: synchronous API, string-only values, quota errors, and serious security implications if XSS is present.",
    whyItMattersMD: "Candidates often say `localStorage` is good for tokens because it persists. Senior engineers ask what happens if an attacker runs JavaScript on the page. Since scripts can read `localStorage`, XSS turns persistence into exposure.",
    theoryMD: "### Core behavior\n\n`localStorage` stores key-value pairs as strings. Data is scoped by origin: scheme, host, and port. A value set by `https://app.example.com` is not shared with `https://admin.example.com` or `http://app.example.com`.\n\nCommon operations are `setItem`, `getItem`, `removeItem`, `clear`, `key`, and `length`. `getItem` returns a string or `null`.\n\n### JSON serialization\n\nObjects and arrays must be serialized with `JSON.stringify` and parsed with `JSON.parse`. Always handle parse errors because users, browser tools, old app versions, or extensions can leave unexpected values.\n\n### Synchronous and quota-limited\n\n`localStorage` is synchronous. Large reads or writes block the main thread, so do not use it for large datasets. Capacity varies by browser but is commonly around a few megabytes per origin. Writes can throw when quota is exceeded or storage is disabled.\n\n### Storage comparison\n\n| Feature | localStorage | sessionStorage | Cookies |\n| --- | --- | --- | --- |\n| Capacity | Usually megabytes | Usually megabytes | Around 4 KB per cookie |\n| Expiry | Until explicitly cleared | Until tab/session ends | Expiry or session based |\n| Scope | Origin | Origin plus tab context | Domain/path rules |\n| Sent to server | No | No | Yes, on matching requests |\n| API style | Synchronous string store | Synchronous string store | Header/document string API |\n\n### Security notes\n\nDo not store highly sensitive secrets in `localStorage`. Any successful XSS can read it. Prefer server-managed `HttpOnly`, `Secure`, `SameSite` cookies for session identifiers when the architecture supports them. Client storage can be edited by the user, so it is never an authority for permissions or pricing.",
    diagrams: [
      {
        title: "localStorage lifecycle",
        ascii: `User sets preference
  |
  v
String saved for origin
  |
  v
Page reload
  |
  v
Preference still available
  |
  v
Explicit remove, clear, or browser data deletion`,
        caption: "Persistence is the main feature: data survives page reloads and typical browser restarts.",
      },
      {
        title: "Origin boundary",
        ascii: `https://app.example.com
  has its own localStorage

https://admin.example.com
  separate storage

http://app.example.com
  separate storage because scheme differs`,
        caption: "Storage is isolated by scheme, host, and port.",
      },
    ],
    codeExamples: [
      {
        title: "Store and read a simple preference",
        descriptionMD: "All values are strings. Use explicit namespacing for keys in larger apps.",
        language: "javascript",
        code: `localStorage.setItem('elevateiq.theme', 'dark');

const theme = localStorage.getItem('elevateiq.theme') || 'system';
document.documentElement.dataset.theme = theme;

localStorage.removeItem('elevateiq.theme');`,
      },
      {
        title: "Store objects with JSON and defensive parsing",
        descriptionMD: "Wrap parsing because stored data may be missing, corrupted, or from an older app version.",
        language: "javascript",
        code: `function readSettings() {
  const fallback = { fontSize: 'medium', compact: false };
  const raw = localStorage.getItem('elevateiq.settings');

  if (!raw) {
    return fallback;
  }

  try {
    return { ...fallback, ...JSON.parse(raw) };
  } catch (error) {
    localStorage.removeItem('elevateiq.settings');
    return fallback;
  }
}

function saveSettings(settings) {
  localStorage.setItem('elevateiq.settings', JSON.stringify(settings));
}`,
      },
      {
        title: "Handle quota or privacy-mode failures",
        descriptionMD: "Writes can throw, so production code should fail gracefully.",
        language: "javascript",
        code: `function safeSetLocalStorage(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn('Could not persist value', error);
    return false;
  }
}

safeSetLocalStorage('elevateiq.sidebar', 'collapsed');`,
      },
    ],
    codingExercises: [
      {
        title: "Create a safe JSON parser for stored settings",
        difficulty: "Easy",
        promptMD: "Implement `parseStoredSettings(raw, fallback)`. If `raw` is missing or invalid JSON, return `fallback`. If it parses to an object, merge it over `fallback`.",
        hints: ["Check for missing raw input first.", "Use `try` and `catch` around `JSON.parse`.", "Only merge non-array objects."],
        solutionCode: `function parseStoredSettings(raw, fallback) {
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return fallback;
    }

    return { ...fallback, ...parsed };
  } catch (error) {
    return fallback;
  }
}

console.log(parseStoredSettings('{"compact":true}', { compact: false, theme: 'system' }));`,
        complexity: { time: "O(n)", space: "O(n)" },
        explanationMD: "The solution treats stored data as untrusted input. It returns safe defaults for missing, malformed, or structurally unexpected data.",
      },
    ],
    interviewQuestions: [
      {
        question: "What can `localStorage` store, and how do you store objects?",
        answerMD: "`localStorage` stores strings only. Store objects by calling `JSON.stringify` before `setItem` and `JSON.parse` after `getItem`. Defensive code handles `null`, parse errors, and schema changes.",
        companies: ["Microsoft", "Amazon", "Google"],
      },
      {
        question: "Should authentication tokens be stored in `localStorage`?",
        answerMD: "Usually avoid it for highly sensitive tokens because any successful XSS can read `localStorage`. Many session architectures prefer server-set `HttpOnly`, `Secure`, `SameSite` cookies so JavaScript cannot read the session identifier.",
        companies: ["Meta", "Netflix"],
        followUps: ["What does `HttpOnly` protect against?", "What does `SameSite` protect against?"],
      },
    ],
    quiz: [
      {
        question: "What does `localStorage.getItem('missing')` return for a missing key?",
        options: ["undefined", "null", "An empty string", "It throws"],
        correctIndex: 1,
        explanationMD: "The Storage API returns `null` when a key does not exist.",
      },
      {
        question: "Which statement about `localStorage` is true?",
        options: ["Values are automatically encrypted", "Values are sent with every HTTP request", "Values are strings and persist until cleared", "Values are scoped to one function call"],
        correctIndex: 2,
        explanationMD: "`localStorage` is a persistent, origin-scoped, string-only key-value store that is not automatically sent to the server.",
      },
    ],
    summary: [
      "`localStorage` is origin-scoped, persistent, synchronous, and string-only.",
      "Use JSON serialization for objects and handle parse/write failures.",
      "Do not trust client storage for authorization or sensitive secrets.",
      "Unlike cookies, `localStorage` is not automatically sent to the server.",
    ],
    cheatSheetMD: "**Write:** `localStorage.setItem(key, stringValue)`.\n\n**Read:** `localStorage.getItem(key)` returns string or `null`.\n\n**Delete:** `removeItem(key)` or `clear()`.\n\n**Objects:** `JSON.stringify` on write, `JSON.parse` on read.\n\n**Scope:** origin.\n\n**Security:** readable by JavaScript; XSS can exfiltrate it.\n\n**Performance:** synchronous; keep values small.",
  },
  {
    slug: "js-session-storage",
    moduleId: "browser-apis",
    order: 98,
    title: "sessionStorage",
    difficulty: "Beginner",
    estimatedReadingMin: 8,
    estimatedPracticeMin: 5,
    tags: ["Storage", "sessionStorage", "Tabs", "Browser"],
    introMD: "`sessionStorage` is a browser key-value store like `localStorage`, but its lifetime is tied to a page session, usually a single tab. It survives reloads in that tab, but it is cleared when the tab or browsing context ends.\n\nIt is useful for temporary UI state: wizard progress, unsent form drafts, one-tab filters, and values that should not persist forever.",
    whyItMattersMD: "Interviewers use `sessionStorage` to see whether you understand browser storage scope, not just API names. The key distinction is that `sessionStorage` is tab-scoped while `localStorage` is longer-lived and shared across same-origin tabs.",
    theoryMD: "### Core behavior\n\n`sessionStorage` uses the same Storage API shape as `localStorage`: `setItem`, `getItem`, `removeItem`, `clear`, `key`, and `length`. Values are strings and objects require JSON serialization.\n\nThe difference is lifetime and scope. `sessionStorage` is scoped to both origin and the top-level browsing context. In practical terms, same-origin pages in the same tab can share it, but another tab gets a separate session store.\n\n### Good use cases\n\n- Multi-step form state that should survive refresh but not tomorrow.\n- Temporary filters or sort order in one tab.\n- Return-to-page UI state for a workflow.\n- Per-tab experiment state.\n\n### What not to use it for\n\nDo not use `sessionStorage` for server authority or sensitive secrets. It is still readable by JavaScript, so XSS can read it. It is also client-controlled and can be edited by the user.\n\n### localStorage vs sessionStorage vs cookies\n\n| Feature | localStorage | sessionStorage | Cookies |\n| --- | --- | --- | --- |\n| Lifetime | Persistent until cleared | Current tab/session | Configured expiry or browser session |\n| Shared across same-origin tabs | Yes | No, generally per tab | Yes when domain/path match |\n| Sent to server | No | No | Yes |\n| Value type | String | String | String |\n| Main use | Preferences and durable client state | Temporary per-tab UI state | Server/session metadata |\n\nSome browsers copy `sessionStorage` when a tab is duplicated, then separate the copies afterward. Do not build security assumptions on duplication behavior.",
    diagrams: [
      {
        title: "Tab-scoped storage",
        ascii: `Tab A on same origin
  sessionStorage: draft step 2

Tab B on same origin
  sessionStorage: separate draft

Reload Tab A
  draft is still there

Close Tab A
  draft is cleared`,
        caption: "The page session, not the whole browser profile, is the key lifetime boundary.",
      },
    ],
    codeExamples: [
      {
        title: "Save a form draft for the current tab",
        descriptionMD: "A reload keeps the draft, but closing the tab clears it.",
        language: "javascript",
        code: `const form = document.querySelector('#profile-draft');
const key = 'elevateiq.profileDraft';
const saved = sessionStorage.getItem(key);

if (saved) {
  const values = JSON.parse(saved);
  form.elements.displayName.value = values.displayName || '';
}

form.addEventListener('input', function () {
  const values = {
    displayName: form.elements.displayName.value
  };

  sessionStorage.setItem(key, JSON.stringify(values));
});`,
      },
      {
        title: "Clear temporary state after completion",
        descriptionMD: "Remove tab-scoped data when the workflow succeeds so stale state does not reappear on reload.",
        language: "javascript",
        code: `const key = 'elevateiq.checkoutStep';

sessionStorage.setItem(key, 'payment');

function completeCheckout() {
  sessionStorage.removeItem(key);
  document.querySelector('#checkout').textContent = 'Done';
}`,
      },
    ],
    codingExercises: [
      {
        title: "Choose the right browser store",
        difficulty: "Easy",
        promptMD: "Implement `chooseStore(requirement)` for three requirement strings: `persistent preference`, `per-tab draft`, and `sent to server`. Return `localStorage`, `sessionStorage`, or `cookie`.",
        hints: ["Persistent client preference maps to `localStorage`.", "Per-tab temporary state maps to `sessionStorage`.", "Only cookies are automatically sent to the server."],
        solutionCode: `function chooseStore(requirement) {
  if (requirement === 'persistent preference') {
    return 'localStorage';
  }

  if (requirement === 'per-tab draft') {
    return 'sessionStorage';
  }

  if (requirement === 'sent to server') {
    return 'cookie';
  }

  return 'depends';
}

console.log(chooseStore('per-tab draft'));`,
        complexity: { time: "O(1)", space: "O(1)" },
        explanationMD: "The exercise encodes the interview comparison: durable client state, tab-scoped client state, and request-attached server state are different tools.",
      },
    ],
    interviewQuestions: [
      {
        question: "How is `sessionStorage` different from `localStorage`?",
        answerMD: "Both are synchronous, origin-scoped, string-only Storage APIs. `localStorage` persists until cleared and is shared across same-origin tabs. `sessionStorage` is tied to a page session, usually one tab, and is cleared when that tab or context ends.",
        companies: ["Microsoft", "Google", "Amazon"],
      },
      {
        question: "Name a good use case for `sessionStorage`.",
        answerMD: "A multi-step form draft or wizard state that should survive refresh but not persist across future browser sessions is a good fit. It is temporary, per-tab UI state, not server authority or a secret store.",
        companies: ["Meta", "Apple"],
      },
    ],
    quiz: [
      {
        question: "Which statement best describes `sessionStorage`?",
        options: ["It is sent with every HTTP request", "It is generally scoped to an origin and a tab/page session", "It stores objects without serialization", "It is encrypted by default"],
        correctIndex: 1,
        explanationMD: "`sessionStorage` is scoped by origin and page session. Like `localStorage`, it stores strings and is not automatically sent to the server.",
      },
      {
        question: "What happens to typical `sessionStorage` data after a reload in the same tab?",
        options: ["It is usually still available", "It is always sent to the server", "It becomes a cookie", "It is converted to JSON automatically"],
        correctIndex: 0,
        explanationMD: "A reload does not usually end the page session, so the data remains. Closing the tab ends it.",
      },
    ],
    summary: [
      "`sessionStorage` has the same string-based API shape as `localStorage`.",
      "Its lifetime is tied to the page session, usually a single tab.",
      "Use it for temporary per-tab UI state such as drafts and wizard progress.",
      "It is still readable by JavaScript and should not hold sensitive secrets.",
    ],
    cheatSheetMD: "**API:** `setItem`, `getItem`, `removeItem`, `clear`.\n\n**Lifetime:** survives reload, cleared when the page session ends.\n\n**Scope:** origin plus tab/page session.\n\n**Values:** strings only; use JSON for objects.\n\n**Best use:** temporary per-tab UI state.\n\n**Not for:** secrets, permissions, or server authority.",
  },
  {
    slug: "js-cookies",
    moduleId: "browser-apis",
    order: 99,
    title: "Cookies",
    difficulty: "Intermediate",
    estimatedReadingMin: 11,
    estimatedPracticeMin: 6,
    tags: ["Cookies", "Security", "HTTP", "SameSite"],
    introMD: "Cookies are small name-value strings stored by the browser and automatically sent with matching HTTP requests. Unlike `localStorage` and `sessionStorage`, cookies are part of the HTTP request/response model, not just client-side state.\n\nFor interviews, cookies matter most for authentication and security flags: `HttpOnly`, `Secure`, and `SameSite`.",
    whyItMattersMD: "Cookie knowledge is where frontend and backend security meet. A candidate who can explain why `HttpOnly` helps against token theft, why `SameSite` helps against CSRF, and why cookies are size-limited is operating above syntax-level JavaScript.",
    theoryMD: "### What a cookie is\n\nA cookie is a small string associated with a domain/path and optional metadata. Servers set cookies with the `Set-Cookie` response header. Browsers send matching cookies back in the `Cookie` request header.\n\nJavaScript can read and write non-`HttpOnly` cookies through `document.cookie`, but the API is awkward: it exposes cookies as a semicolon-separated string and writes one cookie at a time.\n\n### Cookie attributes\n\n| Attribute | Purpose |\n| --- | --- |\n| `Expires` or `Max-Age` | Controls lifetime |\n| `Domain` | Which hosts can receive the cookie |\n| `Path` | Which URL paths receive the cookie |\n| `Secure` | Send only over HTTPS |\n| `HttpOnly` | Hide from JavaScript; server-set only |\n| `SameSite` | Control cross-site sending behavior |\n\n### SameSite in interviews\n\n`SameSite=Strict` sends cookies only for same-site navigations. `Lax` is a practical default that allows some top-level navigations while blocking many cross-site subrequests. `None` allows cross-site usage but must be paired with `Secure`.\n\n### Cookies vs web storage\n\n| Feature | localStorage | sessionStorage | Cookies |\n| --- | --- | --- | --- |\n| Typical capacity | Megabytes | Megabytes | About 4 KB per cookie |\n| Expiry | Manual clear | Tab/session end | Expiry, max-age, or session |\n| Scope | Origin | Origin plus tab | Domain and path |\n| Sent to server | No | No | Yes, automatically |\n| JavaScript access | Yes | Yes | Only if not `HttpOnly` |\n| API style | Synchronous key-value | Synchronous key-value | Headers and `document.cookie` string |\n\n### Security notes\n\nFor session identifiers, prefer server-set cookies with `HttpOnly`, `Secure`, and an appropriate `SameSite` value. `HttpOnly` prevents JavaScript from reading the cookie after XSS, though XSS can still perform actions as the user while it runs. `Secure` requires HTTPS. `SameSite` reduces CSRF risk but does not replace CSRF tokens for every architecture.",
    diagrams: [
      {
        title: "Cookie request flow",
        ascii: `Server response
  Set-Cookie: session=abc; HttpOnly; Secure; SameSite=Lax
  |
  v
Browser stores cookie
  |
  v
Later matching request
  Cookie: session=abc
  |
  v
Server reads session id`,
        caption: "Cookies are automatically attached to matching HTTP requests, which is the key difference from web storage.",
      },
      {
        title: "Security flag intuition",
        ascii: `HttpOnly
  JavaScript cannot read the cookie

Secure
  browser sends only over HTTPS

SameSite
  controls cross-site cookie sending`,
        caption: "The important interview answer is how each flag changes attacker options.",
      },
    ],
    codeExamples: [
      {
        title: "Read a non-HttpOnly cookie by name",
        descriptionMD: "This works only for cookies visible to JavaScript. `HttpOnly` cookies are intentionally hidden.",
        language: "javascript",
        code: `function getCookie(name) {
  const prefix = encodeURIComponent(name) + '=';
  const parts = document.cookie.split('; ');

  for (const part of parts) {
    if (part.startsWith(prefix)) {
      return decodeURIComponent(part.slice(prefix.length));
    }
  }

  return null;
}

console.log(getCookie('theme'));`,
      },
      {
        title: "Write and delete a JavaScript-visible cookie",
        descriptionMD: "Client-side code cannot set `HttpOnly`; that flag must come from the server's `Set-Cookie` header.",
        language: "javascript",
        code: `document.cookie = 'theme=dark; Max-Age=2592000; Path=/; SameSite=Lax; Secure';

document.cookie = 'theme=; Max-Age=0; Path=/; SameSite=Lax; Secure';`,
      },
      {
        title: "Server-set session cookie shape",
        descriptionMD: "This is the kind of header you want for many session identifiers. It is shown as a string because the exact server framework varies.",
        language: "javascript",
        code: `const setCookieHeader = 'session=opaque-id; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600';

console.log(setCookieHeader);`,
      },
    ],
    codingExercises: [
      {
        title: "Build a safe Set-Cookie header string",
        difficulty: "Medium",
        promptMD: "Implement `buildCookie(name, value, maxAgeSeconds)` that returns a cookie header string with encoded name/value and the attributes `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, and `Max-Age=<seconds>`.",
        hints: ["Use `encodeURIComponent` for name and value.", "Concatenate attributes with `; `.", "The result is a string a server could use as a `Set-Cookie` value."],
        solutionCode: `function buildCookie(name, value, maxAgeSeconds) {
  const encodedName = encodeURIComponent(name);
  const encodedValue = encodeURIComponent(value);

  return encodedName + '=' + encodedValue +
    '; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=' +
    String(maxAgeSeconds);
}

console.log(buildCookie('session', 'abc 123', 3600));`,
        complexity: { time: "O(n + m)", space: "O(n + m)" },
        explanationMD: "A session cookie should be server-controlled and include security attributes. Encoding prevents separators and spaces from corrupting the name/value pair.",
      },
    ],
    interviewQuestions: [
      {
        question: "How are cookies different from `localStorage`?",
        answerMD: "Cookies are automatically sent with matching HTTP requests and are controlled by domain/path and security attributes. `localStorage` is an origin-scoped client-side string store and is not sent to the server. Cookies are much smaller but can be `HttpOnly`, which hides them from JavaScript.",
        companies: ["Microsoft", "Google", "Amazon"],
      },
      {
        question: "What do `HttpOnly`, `Secure`, and `SameSite` do?",
        answerMD: "`HttpOnly` prevents JavaScript from reading the cookie. `Secure` sends it only over HTTPS. `SameSite` controls whether the browser sends it on cross-site requests, reducing CSRF risk depending on the selected mode.",
        companies: ["Meta", "Apple", "Netflix"],
        followUps: ["Can JavaScript set `HttpOnly`?", "Why must `SameSite=None` use `Secure`?"],
      },
    ],
    quiz: [
      {
        question: "Which cookie attribute prevents JavaScript from reading a cookie?",
        options: ["Secure", "HttpOnly", "Path", "Max-Age"],
        correctIndex: 1,
        explanationMD: "`HttpOnly` cookies are hidden from `document.cookie` and must be set by the server.",
      },
      {
        question: "Which browser storage mechanism is automatically sent to the server on matching requests?",
        options: ["localStorage", "sessionStorage", "Cookies", "Indexed arrays"],
        correctIndex: 2,
        explanationMD: "Cookies are included in matching HTTP requests. Web storage values are not sent automatically.",
      },
    ],
    summary: [
      "Cookies are small strings that can be sent automatically with HTTP requests.",
      "Servers set cookies with `Set-Cookie`; browsers send them back in `Cookie` headers.",
      "`HttpOnly`, `Secure`, and `SameSite` are central security attributes.",
      "Use cookies for server/session metadata, not large client-only application state.",
    ],
    cheatSheetMD: "**Set by server:** `Set-Cookie` response header.\n\n**Sent by browser:** `Cookie` request header for matching domain/path.\n\n**Client API:** `document.cookie` only for non-`HttpOnly` cookies.\n\n**Security:** `HttpOnly` hides from JS, `Secure` requires HTTPS, `SameSite` limits cross-site sending.\n\n**Size:** small; roughly 4 KB per cookie.\n\n**Use case:** sessions, server-readable preferences, request metadata.",
  },
];
