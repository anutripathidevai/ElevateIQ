import type { Topic } from "../../types";

export const TOPICS: Topic[] = [
  {
    slug: "js-mc-debounced-search",
    moduleId: "machine-coding",
    order: 105,
    title: "Build: Debounced Search",
    difficulty: "Intermediate",
    estimatedReadingMin: 12,
    estimatedPracticeMin: 35,
    tags: ["Machine Coding", "Debounce", "Async", "UI"],
    introMD: "A debounced search box waits until the user pauses typing before it calls the expensive search operation. A production-quality version also guards against stale responses, cancels work when possible, renders loading and empty states, and exposes cleanup for tests and unmounting.\n\nThis is one of the most common frontend machine-coding rounds because it combines timers, closures, async ordering, UI state, and edge-case thinking.",
    whyItMattersMD: "Interviewers use debounced search to separate candidates who only know the `debounce` utility from candidates who can ship resilient UI. The real bug is often not too many requests; it is an older slow response overwriting a newer fast response. Naming that race condition and guarding it is a Staff-level signal.",
    theoryMD: "### Design goals\n\n1. Keep typing responsive by delaying the search call until the user pauses.\n2. Avoid invalid requests for very short queries.\n3. Make async responses race-safe with a monotonically increasing request id.\n4. Abort the previous request when the provided search function supports `AbortSignal`.\n5. Render explicit loading, empty, error, and result states.\n6. Return a `destroy` method so event listeners and timers do not leak.\n\n### Architecture\n\nThe small `debounce` utility owns timer state and exposes `cancel` and `flush`. The feature wrapper owns UI state: current request id, current abort controller, rendering, and event listener cleanup. Every time a search starts, it increments `latestRequestId`; when the promise resolves, it renders only if the id still matches. That single check prevents stale response bugs even when aborting is unavailable.\n\n### Interview trade-offs\n\nUse debounce when the user is still changing the query and the latest value is the only value that matters. Use throttle when you want periodic updates while a stream continues, such as scroll position. For search, trailing debounce is usually the default; adding a leading call can make the UI feel faster but complicates duplicate-request handling.",
    diagrams: [
      {
        title: "Debounce plus stale-response guard",
        ascii: `type r
type re
type rea
   |
   v
reset one timer until typing pauses
   |
   v
request id 7 starts
   |
   +--> older id 6 resolves late -> ignored
   |
   +--> id 7 resolves -> render results`,
        caption: "The timer reduces request volume; the request id protects correctness."
      }
    ],
    codeExamples: [
      {
        title: "Complete debounced search widget",
        descriptionMD: "The implementation is DOM-based for the actual build, but the logic is separated enough to test the debounce and stale-response guard independently.",
        language: "javascript",
        code: `function debounce(fn, delay) {
  var timerId = null;
  var lastArgs = null;
  var lastThis = null;

  function invoke() {
    timerId = null;
    fn.apply(lastThis, lastArgs);
    lastArgs = null;
    lastThis = null;
  }

  function debounced() {
    lastArgs = arguments;
    lastThis = this;

    if (timerId !== null) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(invoke, delay);
  }

  debounced.cancel = function () {
    if (timerId !== null) {
      clearTimeout(timerId);
    }

    timerId = null;
    lastArgs = null;
    lastThis = null;
  };

  debounced.flush = function () {
    if (timerId === null) {
      return;
    }

    clearTimeout(timerId);
    invoke();
  };

  return debounced;
}

function createDebouncedSearch(options) {
  var input = options.input;
  var results = options.results;
  var search = options.search;
  var minLength = options.minLength || 2;
  var delay = options.delay || 300;
  var latestRequestId = 0;
  var activeController = null;

  function setMessage(message) {
    results.textContent = message;
  }

  function renderItems(items) {
    results.innerHTML = '';

    if (!items || items.length === 0) {
      setMessage('No results found.');
      return;
    }

    var list = document.createElement('ul');

    items.forEach(function (item) {
      var li = document.createElement('li');
      li.textContent = item.label || String(item);
      list.appendChild(li);
    });

    results.appendChild(list);
  }

  function runSearch(rawQuery, requestId) {
    var query = rawQuery.trim();

    if (requestId === undefined) {
      latestRequestId += 1;
      requestId = latestRequestId;
    }

    if (activeController) {
      activeController.abort();
      activeController = null;
    }

    if (query.length < minLength) {
      setMessage('Type at least ' + minLength + ' characters.');
      return;
    }

    activeController = typeof AbortController === 'function'
      ? new AbortController()
      : null;

    setMessage('Searching...');

    Promise.resolve(search(query, activeController ? activeController.signal : undefined))
      .then(function (items) {
        if (requestId !== latestRequestId) {
          return;
        }

        renderItems(items);
      })
      .catch(function (error) {
        if (requestId !== latestRequestId) {
          return;
        }

        if (error && error.name === 'AbortError') {
          return;
        }

        setMessage('Search failed. Try again.');
      });
  }

  var debouncedSearch = debounce(runSearch, delay);

  function handleInput(event) {
    var value = event.target.value;
    latestRequestId += 1;

    if (activeController) {
      activeController.abort();
      activeController = null;
    }

    if (value.trim().length < minLength) {
      debouncedSearch.cancel();
      setMessage('Type at least ' + minLength + ' characters.');
      return;
    }

    debouncedSearch(value, latestRequestId);
  }

  input.addEventListener('input', handleInput);
  setMessage('Start typing to search.');

  return {
    destroy: function () {
      input.removeEventListener('input', handleInput);
      debouncedSearch.cancel();

      if (activeController) {
        activeController.abort();
      }
    },
    flush: debouncedSearch.flush
  };
}`
      }
    ],
    playground: [
      {
        title: "Debounce only the latest value",
        descriptionMD: "This worker-safe snippet demonstrates the core timer behavior without touching the DOM.",
        code: `function debounce(fn, delay) {
  var timerId = null;
  var lastArgs = null;

  function debounced() {
    lastArgs = arguments;

    if (timerId !== null) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(function () {
      timerId = null;
      fn.apply(null, lastArgs);
    }, delay);
  }

  debounced.flush = function () {
    if (timerId === null) {
      return;
    }

    clearTimeout(timerId);
    timerId = null;
    fn.apply(null, lastArgs);
  };

  return debounced;
}

var calls = [];
var search = debounce(function (query) {
  calls.push(query);
  console.log('search:' + query);
}, 20);

search('r');
search('re');
search('react');

setTimeout(function () {
  search('react j');
  search.flush();
  console.log('calls=' + calls.join(','));
}, 30);`
      }
    ],
    outputPredictions: [
      {
        code: `function debounce(fn, delay) {
  var timerId = null;
  var lastArgs = null;

  function debounced() {
    lastArgs = arguments;
    clearTimeout(timerId);
    timerId = setTimeout(function () {
      fn.apply(null, lastArgs);
    }, delay);
  }

  debounced.flush = function () {
    clearTimeout(timerId);
    fn.apply(null, lastArgs);
  };

  return debounced;
}

var calls = [];
var search = debounce(function (query) {
  calls.push(query);
  console.log('search:' + query);
}, 20);

search('r');
search('re');
search('react');

setTimeout(function () {
  search('react j');
  search.flush();
  console.log('calls=' + calls.join(','));
}, 30);`,
        answer: "search:react\nsearch:react j\ncalls=react,react j",
        explanationMD: "The first three calls share one timer, so only `react` runs after 20ms. The later call schedules `react j`, and `flush` executes it immediately."
      }
    ],
    codingExercises: [
      {
        title: "Implement a race-safe debounced search widget",
        difficulty: "Medium",
        promptMD: "Build `createDebouncedSearch(options)` for a search input.\n\nRequirements:\n- Accept `{ input, results, search, minLength, delay }`.\n- Debounce input events before calling `search(query, signal)`.\n- Ignore stale responses that resolve after a newer request.\n- Abort the previous request when `AbortController` exists.\n- Render loading, empty, error, and success states.\n- Return `{ destroy, flush }` for cleanup and tests.\n\nConstraints:\n- Do not use libraries.\n- Do not rely on global mutable state.\n- The implementation must be safe if promises resolve out of order.",
        hints: [
          "A debounced function needs to remember the last arguments and the timer id.",
          "Increment a request id every time a new search starts.",
          "On resolve or reject, render only when the request id still matches the latest id.",
          "Cleanup should remove the input listener, cancel the timer, and abort active work."
        ],
        solutionCode: `function debounce(fn, delay) {
  var timerId = null;
  var lastArgs = null;
  var lastThis = null;

  function invoke() {
    timerId = null;
    fn.apply(lastThis, lastArgs);
    lastArgs = null;
    lastThis = null;
  }

  function debounced() {
    lastArgs = arguments;
    lastThis = this;

    if (timerId !== null) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(invoke, delay);
  }

  debounced.cancel = function () {
    if (timerId !== null) {
      clearTimeout(timerId);
    }

    timerId = null;
    lastArgs = null;
    lastThis = null;
  };

  debounced.flush = function () {
    if (timerId === null) {
      return;
    }

    clearTimeout(timerId);
    invoke();
  };

  return debounced;
}

function createDebouncedSearch(options) {
  var input = options.input;
  var results = options.results;
  var search = options.search;
  var minLength = options.minLength || 2;
  var delay = options.delay || 300;
  var latestRequestId = 0;
  var activeController = null;

  function setMessage(message) {
    results.textContent = message;
  }

  function renderItems(items) {
    results.innerHTML = '';

    if (!items || items.length === 0) {
      setMessage('No results found.');
      return;
    }

    var list = document.createElement('ul');

    items.forEach(function (item) {
      var li = document.createElement('li');
      li.textContent = item.label || String(item);
      list.appendChild(li);
    });

    results.appendChild(list);
  }

  function runSearch(rawQuery, requestId) {
    var query = rawQuery.trim();

    if (requestId === undefined) {
      latestRequestId += 1;
      requestId = latestRequestId;
    }

    if (activeController) {
      activeController.abort();
      activeController = null;
    }

    if (query.length < minLength) {
      setMessage('Type at least ' + minLength + ' characters.');
      return;
    }

    activeController = typeof AbortController === 'function'
      ? new AbortController()
      : null;

    setMessage('Searching...');

    Promise.resolve(search(query, activeController ? activeController.signal : undefined))
      .then(function (items) {
        if (requestId !== latestRequestId) {
          return;
        }

        renderItems(items);
      })
      .catch(function (error) {
        if (requestId !== latestRequestId) {
          return;
        }

        if (error && error.name === 'AbortError') {
          return;
        }

        setMessage('Search failed. Try again.');
      });
  }

  var debouncedSearch = debounce(runSearch, delay);

  function handleInput(event) {
    var value = event.target.value;
    latestRequestId += 1;

    if (activeController) {
      activeController.abort();
      activeController = null;
    }

    if (value.trim().length < minLength) {
      debouncedSearch.cancel();
      setMessage('Type at least ' + minLength + ' characters.');
      return;
    }

    debouncedSearch(value, latestRequestId);
  }

  input.addEventListener('input', handleInput);
  setMessage('Start typing to search.');

  return {
    destroy: function () {
      input.removeEventListener('input', handleInput);
      debouncedSearch.cancel();

      if (activeController) {
        activeController.abort();
      }
    },
    flush: debouncedSearch.flush
  };
}`,
        complexity: { time: "O(r) per render where r is the number of displayed results", space: "O(r) for rendered result nodes plus O(1) timer/request state" },
        explanationMD: "The debounce layer collapses rapid input events into one search call. The feature layer increments `latestRequestId` for each actual search and checks it before rendering, which prevents stale results from winning. Aborting reduces wasted network work, but the id check is still required because not every async source supports cancellation."
      }
    ],
    interviewQuestions: [
      {
        question: "How do you prevent stale search results from rendering?",
        answerMD: "Assign each request a monotonically increasing id. Store the newest id. When a promise resolves or rejects, compare its id with the latest id and render only if they match. `AbortController` is useful but not sufficient because some async functions cannot be cancelled or may still settle after aborting.",
        companies: ["Google", "Microsoft", "Uber"],
        followUps: ["How would you test the stale response case?", "When would you use throttle instead of debounce?"]
      },
      {
        question: "Should search debounce on the leading edge or trailing edge?",
        answerMD: "Trailing edge is the common default because the latest query is what matters. Leading edge can make the first response feel instant, but it often needs extra logic to avoid duplicate calls and stale UI. Many teams combine immediate cached suggestions with trailing remote search."
      }
    ],
    quiz: [
      {
        question: "What bug does the request id guard fix?",
        options: [
          "The input losing focus after every keystroke",
          "An older slower response overwriting a newer faster response",
          "The debounce timer running too early",
          "The browser not supporting event listeners"
        ],
        correctIndex: 1,
        explanationMD: "Debounce reduces how often requests start, but it does not guarantee response order. The id guard ensures only the latest request can render."
      }
    ],
    summary: [
      "Debounce controls request volume; it does not solve async ordering by itself.",
      "Use request ids to ignore stale responses and `AbortController` to cancel work when possible.",
      "Expose cleanup so timers, listeners, and requests do not leak.",
      "Render loading, empty, error, and success states explicitly."
    ],
    cheatSheetMD: "**Debounced search checklist**\n\n- `debounce(fn, delay)` stores timer, last args, `cancel`, and `flush`.\n- Validate short queries before searching.\n- Increment `latestRequestId` per request.\n- Render only when `requestId === latestRequestId`.\n- Abort previous request when possible.\n- Return cleanup for unmounting and tests."
  },
  {
    slug: "js-mc-autocomplete",
    moduleId: "machine-coding",
    order: 106,
    title: "Build: Autocomplete",
    difficulty: "Advanced",
    estimatedReadingMin: 14,
    estimatedPracticeMin: 45,
    tags: ["Machine Coding", "Autocomplete", "Accessibility", "Keyboard"],
    introMD: "Autocomplete looks like a simple filtered list, but a complete machine-coding answer must handle input delay, ranking, keyboard navigation, selection, empty state, accessibility attributes, and cleanup.\n\nThe best interview solutions separate the suggestion source from the widget. That lets you use a local list, a trie, or a remote API without rewriting the keyboard and rendering logic.",
    whyItMattersMD: "Autocomplete appears in search bars, command palettes, address forms, IDEs, and admin dashboards. Interviewers expect you to discuss both algorithmic lookup and product-quality behavior: arrow keys, Enter, Escape, active option highlighting, and avoiding stale async results.",
    theoryMD: "### Data structure choice\n\nFor small local lists, filtering with `startsWith` and `includes` is simpler and often fast enough. For large static dictionaries, a trie gives efficient prefix lookup. For remote suggestions, debounce the query and use the same stale-response guard as debounced search.\n\n### Widget state\n\nThe widget needs four pieces of state: current query, current suggestions, active index, and open/closed status. Keyboard events mutate active index without changing the query. Selecting an item writes the label to the input, closes the panel, and calls `onSelect`.\n\n### Accessibility\n\nUse `role=\"combobox\"` on the input, `role=\"listbox\"` on the panel, and `role=\"option\"` on each item. Keep `aria-expanded` and `aria-activedescendant` in sync with the open state and highlighted option. These details are often not required to pass a basic round, but they turn a good solution into a production one.",
    diagrams: [
      {
        title: "Autocomplete interaction loop",
        ascii: `input change
   |
   v
debounce query
   |
   v
get suggestions
   |
   v
render listbox
   |
   +--> Arrow keys change active index
   +--> Enter or click selects option
   +--> Escape closes list`,
        caption: "Typing and navigation are separate flows that share one rendered list."
      }
    ],
    codeExamples: [
      {
        title: "Complete autocomplete widget",
        descriptionMD: "This implementation uses an injected `getSuggestions` function, so the same component can work with a local array, trie, or remote service.",
        language: "javascript",
        code: `function debounce(fn, delay) {
  var timerId = null;

  function debounced() {
    var args = arguments;
    var context = this;

    clearTimeout(timerId);
    timerId = setTimeout(function () {
      timerId = null;
      fn.apply(context, args);
    }, delay);
  }

  debounced.cancel = function () {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  return debounced;
}

function createAutocomplete(options) {
  var input = options.input;
  var panel = options.panel;
  var getSuggestions = options.getSuggestions;
  var onSelect = options.onSelect || function () {};
  var delay = options.delay || 150;
  var limit = options.limit || 8;
  var suggestions = [];
  var activeIndex = -1;
  var requestId = 0;

  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  panel.setAttribute('role', 'listbox');

  function closePanel() {
    suggestions = [];
    activeIndex = -1;
    panel.innerHTML = '';
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  }

  function selectItem(index) {
    if (index < 0 || index >= suggestions.length) {
      return;
    }

    var item = suggestions[index];
    input.value = item.label || String(item);
    closePanel();
    onSelect(item);
  }

  function render() {
    panel.innerHTML = '';

    if (suggestions.length === 0) {
      closePanel();
      return;
    }

    input.setAttribute('aria-expanded', 'true');

    suggestions.forEach(function (item, index) {
      var option = document.createElement('div');
      var id = input.id + '-option-' + index;

      option.id = id;
      option.setAttribute('role', 'option');
      option.textContent = item.label || String(item);

      if (index === activeIndex) {
        option.setAttribute('aria-selected', 'true');
        option.className = 'is-active';
        input.setAttribute('aria-activedescendant', id);
      }

      option.addEventListener('mousedown', function (event) {
        event.preventDefault();
        selectItem(index);
      });

      panel.appendChild(option);
    });
  }

  var loadSuggestions = debounce(function (query, currentRequestId) {
    Promise.resolve(getSuggestions(query, limit)).then(function (items) {
      if (currentRequestId !== requestId) {
        return;
      }

      suggestions = (items || []).slice(0, limit);
      activeIndex = suggestions.length > 0 ? 0 : -1;
      render();
    });
  }, delay);

  function handleInput() {
    var query = input.value.trim();
    requestId += 1;
    var currentRequestId = requestId;

    if (query.length === 0) {
      loadSuggestions.cancel();
      closePanel();
      return;
    }

    loadSuggestions(query, currentRequestId);
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (suggestions.length === 0) {
        return;
      }
      activeIndex = (activeIndex + 1) % suggestions.length;
      render();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (suggestions.length === 0) {
        return;
      }
      activeIndex = (activeIndex - 1 + suggestions.length) % suggestions.length;
      render();
      return;
    }

    if (event.key === 'Enter') {
      if (activeIndex !== -1) {
        event.preventDefault();
        selectItem(activeIndex);
      }
      return;
    }

    if (event.key === 'Escape') {
      closePanel();
    }
  }

  input.addEventListener('input', handleInput);
  input.addEventListener('keydown', handleKeyDown);
  input.addEventListener('blur', closePanel);

  return {
    destroy: function () {
      input.removeEventListener('input', handleInput);
      input.removeEventListener('keydown', handleKeyDown);
      input.removeEventListener('blur', closePanel);
      loadSuggestions.cancel();
      closePanel();
    }
  };
}`
      }
    ],
    playground: [
      {
        title: "Rank local suggestions",
        descriptionMD: "A worker-safe ranking helper: prefix matches first, then substring matches, capped by limit.",
        code: `function rankSuggestions(items, query, limit) {
  var normalizedQuery = query.toLowerCase();
  var prefix = [];
  var contains = [];

  items.forEach(function (item) {
    var label = item.toLowerCase();

    if (label.indexOf(normalizedQuery) === 0) {
      prefix.push(item);
    } else if (label.indexOf(normalizedQuery) !== -1) {
      contains.push(item);
    }
  });

  return prefix.concat(contains).slice(0, limit);
}

console.log(rankSuggestions(['React', 'Redux', 'Preact', 'Reason', 'Vue'], 'rea', 3).join(','));`
      }
    ],
    outputPredictions: [
      {
        code: `function rankSuggestions(items, query, limit) {
  var normalizedQuery = query.toLowerCase();
  var prefix = [];
  var contains = [];

  items.forEach(function (item) {
    var label = item.toLowerCase();

    if (label.indexOf(normalizedQuery) === 0) {
      prefix.push(item);
    } else if (label.indexOf(normalizedQuery) !== -1) {
      contains.push(item);
    }
  });

  return prefix.concat(contains).slice(0, limit);
}

console.log(rankSuggestions(['React', 'Redux', 'Preact', 'Reason', 'Vue'], 'rea', 3).join(','));`,
        answer: "React,Reason,Preact",
        explanationMD: "`React` and `Reason` are prefix matches, so they appear before `Preact`, which only contains the query."
      }
    ],
    codingExercises: [
      {
        title: "Implement accessible autocomplete",
        difficulty: "Hard",
        promptMD: "Build `createAutocomplete(options)`.\n\nRequirements:\n- Accept `{ input, panel, getSuggestions, onSelect, delay, limit }`.\n- Debounce suggestion loading.\n- Ignore stale suggestion responses.\n- Render a selectable list with mouse support.\n- Support ArrowDown, ArrowUp, Enter, and Escape.\n- Maintain basic ARIA combobox/listbox/option attributes.\n- Return `destroy()`.\n\nConstraints:\n- Do not use a framework.\n- Keep lookup pluggable; do not bake fetch or a hard-coded array into the widget.",
        hints: [
          "Keep `suggestions` and `activeIndex` as widget state.",
          "Use modulo arithmetic for ArrowUp and ArrowDown wrapping.",
          "Use `mousedown` rather than `click` so selection happens before blur closes the panel.",
          "The same request id stale guard used in debounced search applies here."
        ],
        solutionCode: `function debounce(fn, delay) {
  var timerId = null;

  function debounced() {
    var args = arguments;
    var context = this;

    clearTimeout(timerId);
    timerId = setTimeout(function () {
      timerId = null;
      fn.apply(context, args);
    }, delay);
  }

  debounced.cancel = function () {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  return debounced;
}

function createAutocomplete(options) {
  var input = options.input;
  var panel = options.panel;
  var getSuggestions = options.getSuggestions;
  var onSelect = options.onSelect || function () {};
  var delay = options.delay || 150;
  var limit = options.limit || 8;
  var suggestions = [];
  var activeIndex = -1;
  var requestId = 0;

  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  panel.setAttribute('role', 'listbox');

  function closePanel() {
    suggestions = [];
    activeIndex = -1;
    panel.innerHTML = '';
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  }

  function selectItem(index) {
    if (index < 0 || index >= suggestions.length) {
      return;
    }

    var item = suggestions[index];
    input.value = item.label || String(item);
    closePanel();
    onSelect(item);
  }

  function render() {
    panel.innerHTML = '';

    if (suggestions.length === 0) {
      closePanel();
      return;
    }

    input.setAttribute('aria-expanded', 'true');

    suggestions.forEach(function (item, index) {
      var option = document.createElement('div');
      var id = input.id + '-option-' + index;

      option.id = id;
      option.setAttribute('role', 'option');
      option.textContent = item.label || String(item);

      if (index === activeIndex) {
        option.setAttribute('aria-selected', 'true');
        option.className = 'is-active';
        input.setAttribute('aria-activedescendant', id);
      }

      option.addEventListener('mousedown', function (event) {
        event.preventDefault();
        selectItem(index);
      });

      panel.appendChild(option);
    });
  }

  var loadSuggestions = debounce(function (query, currentRequestId) {
    Promise.resolve(getSuggestions(query, limit)).then(function (items) {
      if (currentRequestId !== requestId) {
        return;
      }

      suggestions = (items || []).slice(0, limit);
      activeIndex = suggestions.length > 0 ? 0 : -1;
      render();
    });
  }, delay);

  function handleInput() {
    var query = input.value.trim();
    requestId += 1;
    var currentRequestId = requestId;

    if (query.length === 0) {
      loadSuggestions.cancel();
      closePanel();
      return;
    }

    loadSuggestions(query, currentRequestId);
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (suggestions.length === 0) {
        return;
      }
      activeIndex = (activeIndex + 1) % suggestions.length;
      render();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (suggestions.length === 0) {
        return;
      }
      activeIndex = (activeIndex - 1 + suggestions.length) % suggestions.length;
      render();
      return;
    }

    if (event.key === 'Enter') {
      if (activeIndex !== -1) {
        event.preventDefault();
        selectItem(activeIndex);
      }
      return;
    }

    if (event.key === 'Escape') {
      closePanel();
    }
  }

  input.addEventListener('input', handleInput);
  input.addEventListener('keydown', handleKeyDown);
  input.addEventListener('blur', closePanel);

  return {
    destroy: function () {
      input.removeEventListener('input', handleInput);
      input.removeEventListener('keydown', handleKeyDown);
      input.removeEventListener('blur', closePanel);
      loadSuggestions.cancel();
      closePanel();
    }
  };
}`,
        complexity: { time: "O(k) to render k suggestions; lookup cost depends on getSuggestions", space: "O(k) for suggestion state and rendered option nodes" },
        explanationMD: "The widget treats suggestion lookup as a dependency and focuses on interaction correctness. Debouncing prevents excessive work, the request id prevents stale lists, and keyboard handling is independent from loading. `mousedown` selection avoids the common blur-before-click bug."
      }
    ],
    interviewQuestions: [
      {
        question: "When would you choose a trie for autocomplete?",
        answerMD: "Use a trie when the data set is large, mostly static, and prefix lookup is the dominant operation. A trie can find a prefix node in O(m), where m is the query length, then collect results below it. For small lists or remote APIs, simple filtering or server-side search is usually better.",
        companies: ["Meta", "Amazon"],
        followUps: ["How would you cap memory usage in a trie?", "How would you rank by popularity and recency?"]
      },
      {
        question: "Why use `mousedown` for selecting an option?",
        answerMD: "Click fires after the input can lose focus. If blur closes the panel first, the clicked option may disappear before selection. Handling `mousedown` and calling `preventDefault` lets selection happen before the blur behavior."
      }
    ],
    quiz: [
      {
        question: "Which state is required for keyboard navigation?",
        options: [
          "Only the raw input value",
          "The active option index",
          "The browser scroll position",
          "The current time zone"
        ],
        correctIndex: 1,
        explanationMD: "Arrow keys move a highlighted option without necessarily changing the input value, so the widget needs an active option index."
      }
    ],
    summary: [
      "Keep lookup pluggable so the UI works with local lists, tries, or remote APIs.",
      "Autocomplete state includes query, suggestions, active index, and open/closed status.",
      "Keyboard and mouse selection must be handled separately from input changes.",
      "ARIA roles and active-descendant attributes make the widget closer to production-ready."
    ],
    cheatSheetMD: "**Autocomplete checklist**\n\n- Debounce suggestion loading.\n- Ignore stale async responses.\n- State: suggestions, activeIndex, open.\n- Keys: ArrowDown, ArrowUp, Enter, Escape.\n- Mouse: prefer `mousedown` for option selection.\n- ARIA: combobox, listbox, option, expanded, active descendant.\n- Data: filter for small lists, trie for large static prefixes, server for global search."
  },
  {
    slug: "js-mc-infinite-scroll",
    moduleId: "machine-coding",
    order: 107,
    title: "Build: Infinite Scroll",
    difficulty: "Intermediate",
    estimatedReadingMin: 12,
    estimatedPracticeMin: 35,
    tags: ["Machine Coding", "IntersectionObserver", "Pagination", "Performance"],
    introMD: "Infinite scroll loads the next page when the user approaches the end of the current list. The modern browser primitive for this is `IntersectionObserver`, not a raw scroll listener.\n\nA strong implementation prevents duplicate loads, stops when there are no more pages, renders errors without losing existing content, and exposes a cleanup method.",
    whyItMattersMD: "This challenge tests browser API judgment and async state discipline. Many candidates attach a scroll handler and accidentally issue overlapping page requests. A production answer uses a sentinel element, observes intersection, and guards loading state.",
    theoryMD: "### Sentinel approach\n\nPlace a lightweight sentinel element after the list. When it intersects the viewport, call `loadNext`. The browser decides when to notify you, which is more efficient than running code on every scroll event.\n\n### State machine\n\nThe feature has three important booleans: `loading`, `done`, and sometimes `error`. `loading` prevents duplicate page requests while the sentinel remains visible. `done` disconnects the observer once the API says there is no next page. Existing items stay rendered if a later page fails.\n\n### API contract\n\nA clean `loadPage(page)` returns `{ items, hasMore }`. The scroller owns page numbering and rendering. The caller owns data fetching and item rendering. This separation makes the component testable and reusable.",
    diagrams: [
      {
        title: "Infinite scroll state machine",
        ascii: `sentinel visible
   |
   v
loading? yes -> ignore
   |
   no
   v
load page N
   |
   +--> success with hasMore -> append, N = N + 1
   +--> success without more -> append, disconnect
   +--> failure -> show retryable error`,
        caption: "The loading guard is what prevents duplicate page requests."
      }
    ],
    codeExamples: [
      {
        title: "Complete IntersectionObserver infinite scroller",
        descriptionMD: "The DOM implementation uses a sentinel element and keeps data loading separate from item rendering.",
        language: "javascript",
        code: `function createInfiniteScroller(options) {
  var list = options.list;
  var sentinel = options.sentinel;
  var status = options.status;
  var loadPage = options.loadPage;
  var renderItem = options.renderItem;
  var rootMargin = options.rootMargin || '200px';
  var page = options.startPage || 1;
  var loading = false;
  var done = false;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function appendItems(items) {
    items.forEach(function (item) {
      list.appendChild(renderItem(item));
    });
  }

  function loadNextPage() {
    if (loading || done) {
      return Promise.resolve();
    }

    loading = true;
    setStatus('Loading...');

    return Promise.resolve(loadPage(page))
      .then(function (result) {
        var items = result.items || [];
        appendItems(items);

        page += 1;
        done = !result.hasMore;
        setStatus(done ? 'You are all caught up.' : '');

        if (done) {
          observer.disconnect();
        }
      })
      .catch(function () {
        setStatus('Could not load more items. Scroll again to retry.');
      })
      .finally(function () {
        loading = false;
      });
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        loadNextPage();
      }
    });
  }, {
    root: options.root || null,
    rootMargin: rootMargin,
    threshold: 0
  });

  observer.observe(sentinel);

  if (options.loadImmediately) {
    loadNextPage();
  }

  return {
    loadNextPage: loadNextPage,
    destroy: function () {
      observer.disconnect();
    }
  };
}`
      }
    ],
    playground: [
      {
        title: "Pure pagination helper",
        descriptionMD: "This snippet models page boundaries without DOM or network calls.",
        code: `function createPaginator(items, pageSize) {
  var page = 0;

  return {
    next: function () {
      var start = page * pageSize;
      var slice = items.slice(start, start + pageSize);
      page += 1;

      return {
        items: slice,
        hasMore: page * pageSize < items.length
      };
    }
  };
}

var paginator = createPaginator(['a', 'b', 'c', 'd', 'e'], 2);
console.log(paginator.next().items.join(','));
console.log(paginator.next().items.join(','));
var last = paginator.next();
console.log(last.items.join(',') + ':' + last.hasMore);`
      }
    ],
    outputPredictions: [
      {
        code: `function createPaginator(items, pageSize) {
  var page = 0;

  return {
    next: function () {
      var start = page * pageSize;
      var slice = items.slice(start, start + pageSize);
      page += 1;

      return {
        items: slice,
        hasMore: page * pageSize < items.length
      };
    }
  };
}

var paginator = createPaginator(['a', 'b', 'c', 'd', 'e'], 2);
console.log(paginator.next().items.join(','));
console.log(paginator.next().items.join(','));
var last = paginator.next();
console.log(last.items.join(',') + ':' + last.hasMore);`,
        answer: "a,b\nc,d\ne:false",
        explanationMD: "With page size 2, the first two pages contain two items each. The third page contains the final item and reports `hasMore: false`."
      }
    ],
    codingExercises: [
      {
        title: "Implement an IntersectionObserver infinite scroller",
        difficulty: "Medium",
        promptMD: "Build `createInfiniteScroller(options)`.\n\nRequirements:\n- Accept `{ list, sentinel, status, loadPage, renderItem, root, rootMargin, startPage, loadImmediately }`.\n- Use `IntersectionObserver` on the sentinel.\n- Prevent overlapping page requests.\n- Append new items without rerendering the full list.\n- Stop observing when `hasMore` is false.\n- Keep existing content if a later page fails.\n- Return `{ loadNextPage, destroy }`.\n\nConstraints:\n- Do not use scroll event polling.\n- Do not assume the API always succeeds.",
        hints: [
          "A single `loading` flag prevents duplicate calls while the sentinel remains visible.",
          "A `done` flag lets you disconnect the observer after the final page.",
          "Let `loadPage` return `{ items, hasMore }` so the component is not tied to one API.",
          "Append nodes rather than replacing the whole list."
        ],
        solutionCode: `function createInfiniteScroller(options) {
  var list = options.list;
  var sentinel = options.sentinel;
  var status = options.status;
  var loadPage = options.loadPage;
  var renderItem = options.renderItem;
  var rootMargin = options.rootMargin || '200px';
  var page = options.startPage || 1;
  var loading = false;
  var done = false;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function appendItems(items) {
    items.forEach(function (item) {
      list.appendChild(renderItem(item));
    });
  }

  function loadNextPage() {
    if (loading || done) {
      return Promise.resolve();
    }

    loading = true;
    setStatus('Loading...');

    return Promise.resolve(loadPage(page))
      .then(function (result) {
        var items = result.items || [];
        appendItems(items);

        page += 1;
        done = !result.hasMore;
        setStatus(done ? 'You are all caught up.' : '');

        if (done) {
          observer.disconnect();
        }
      })
      .catch(function () {
        setStatus('Could not load more items. Scroll again to retry.');
      })
      .finally(function () {
        loading = false;
      });
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        loadNextPage();
      }
    });
  }, {
    root: options.root || null,
    rootMargin: rootMargin,
    threshold: 0
  });

  observer.observe(sentinel);

  if (options.loadImmediately) {
    loadNextPage();
  }

  return {
    loadNextPage: loadNextPage,
    destroy: function () {
      observer.disconnect();
    }
  };
}`,
        complexity: { time: "O(p) per loaded page where p is page size", space: "O(n) for n rendered items plus O(1) control state" },
        explanationMD: "The observer tells us when the sentinel is near the viewport. `loading` prevents duplicate loads, `done` stops future work, and the page counter advances only after a successful response. Errors update status but preserve the list so retrying does not lose content."
      }
    ],
    interviewQuestions: [
      {
        question: "Why is `IntersectionObserver` preferred over a scroll event listener?",
        answerMD: "`IntersectionObserver` is browser-optimized and evented. It avoids running JavaScript on every scroll frame and makes it easy to observe a sentinel near the bottom of the list. Scroll listeners require throttling, manual geometry calculations, and careful cleanup.",
        companies: ["Netflix", "Amazon"],
        followUps: ["How would you support older browsers?", "How would you preserve scroll position when prepending items?"]
      },
      {
        question: "How do you prevent duplicate page requests?",
        answerMD: "Keep a `loading` flag. If the sentinel fires again while a page request is in flight, return early. Clear the flag in `finally` so both success and failure unblock future attempts."
      }
    ],
    quiz: [
      {
        question: "What should happen when the API returns `hasMore: false`?",
        options: [
          "Keep observing the sentinel forever",
          "Disconnect the observer and stop loading pages",
          "Clear the whole list",
          "Reset page number to 1"
        ],
        correctIndex: 1,
        explanationMD: "Once there are no more pages, observing the sentinel wastes work and can repeatedly call the loader."
      }
    ],
    summary: [
      "Use a sentinel plus `IntersectionObserver` for modern infinite scroll.",
      "`loading` prevents overlapping requests; `done` stops observation after the final page.",
      "Append new page nodes instead of rerendering the whole list.",
      "Keep loading concerns separate from item rendering."
    ],
    cheatSheetMD: "**Infinite scroll checklist**\n\n- Sentinel after the list.\n- `IntersectionObserver` with helpful `rootMargin`.\n- `loading` guard for duplicate intersections.\n- `done` guard for final page.\n- API contract: `{ items, hasMore }`.\n- Append only new nodes.\n- Show status and preserve existing items on error.\n- Return `destroy()`."
  },
  {
    slug: "js-mc-todo-app",
    moduleId: "machine-coding",
    order: 108,
    title: "Build: Todo App",
    difficulty: "Intermediate",
    estimatedReadingMin: 13,
    estimatedPracticeMin: 40,
    tags: ["Machine Coding", "State", "Rendering", "Events"],
    introMD: "A Todo app is the smallest UI challenge that still tests real product architecture: state shape, immutable updates, rendering, event delegation, filters, and persistence boundaries.\n\nA strong answer does not scatter DOM mutations across handlers. It centralizes state transitions in a reducer-like function and uses one render path so every action produces a predictable UI.",
    whyItMattersMD: "Todo apps are deceptively useful in interviews because they reveal how you structure frontend code under time pressure. Interviewers watch for stable ids, event delegation, empty states, XSS-safe rendering, and whether state is the source of truth.",
    theoryMD: "### State model\n\nEach todo should have a stable `id`, a `text`, and a `completed` flag. The app state also tracks the active filter and the next id. Avoid using array indexes as ids because removing or reordering items breaks event targeting.\n\n### Render strategy\n\nFor a framework-free implementation, generate HTML from state in one `render` function and attach one delegated click listener to the root. Event delegation is simpler than registering a listener on every item after every render.\n\n### Reducer mindset\n\nActions such as add, toggle, remove, clear completed, and set filter are state transitions. Keeping them in `dispatch(action)` makes the app easy to test without the DOM. Rendering becomes a side effect after state changes.",
    diagrams: [
      {
        title: "Todo app architecture",
        ascii: `user event
   |
   v
dispatch action
   |
   v
update state
   |
   v
render from state
   |
   v
DOM reflects current state`,
        caption: "State is the source of truth; the DOM is a projection of state."
      }
    ],
    codeExamples: [
      {
        title: "Complete Todo app with delegated events",
        descriptionMD: "The render function deliberately builds strings with concatenation. In production, a framework or DOM node construction can replace this rendering layer while preserving the state model.",
        language: "javascript",
        code: `function createTodoApp(root) {
  var state = {
    items: [],
    filter: 'all',
    nextId: 1
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      var entities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };

      return entities[char];
    });
  }

  function getVisibleItems() {
    return state.items.filter(function (item) {
      if (state.filter === 'active') {
        return !item.completed;
      }

      if (state.filter === 'completed') {
        return item.completed;
      }

      return true;
    });
  }

  function dispatch(action) {
    if (action.type === 'add') {
      var text = action.text.trim();

      if (text.length > 0) {
        state.items = state.items.concat({
          id: state.nextId,
          text: text,
          completed: false
        });
        state.nextId += 1;
      }
    }

    if (action.type === 'toggle') {
      state.items = state.items.map(function (item) {
        if (item.id !== action.id) {
          return item;
        }

        return {
          id: item.id,
          text: item.text,
          completed: !item.completed
        };
      });
    }

    if (action.type === 'remove') {
      state.items = state.items.filter(function (item) {
        return item.id !== action.id;
      });
    }

    if (action.type === 'clearCompleted') {
      state.items = state.items.filter(function (item) {
        return !item.completed;
      });
    }

    if (action.type === 'setFilter') {
      state.filter = action.filter;
    }

    render();
  }

  function render() {
    var visibleItems = getVisibleItems();
    var remaining = state.items.filter(function (item) {
      return !item.completed;
    }).length;
    var html = '';

    html += '<form data-role="form">';
    html += '<input name="todo" placeholder="What needs to be done?" autocomplete="off">';
    html += '<button type="submit">Add</button>';
    html += '</form>';
    html += '<p>' + remaining + ' item(s) left</p>';
    html += '<div>';
    html += '<button data-filter="all">All</button>';
    html += '<button data-filter="active">Active</button>';
    html += '<button data-filter="completed">Completed</button>';
    html += '<button data-action="clearCompleted">Clear completed</button>';
    html += '</div>';

    if (visibleItems.length === 0) {
      html += '<p>No todos to show.</p>';
    } else {
      html += '<ul>';

      visibleItems.forEach(function (item) {
        html += '<li data-id="' + item.id + '">';
        html += '<label>';
        html += '<input type="checkbox" data-action="toggle"';

        if (item.completed) {
          html += ' checked';
        }

        html += '>';
        html += '<span>' + escapeHtml(item.text) + '</span>';
        html += '</label>';
        html += '<button data-action="remove">Remove</button>';
        html += '</li>';
      });

      html += '</ul>';
    }

    root.innerHTML = html;
  }

  root.addEventListener('submit', function (event) {
    if (event.target.getAttribute('data-role') !== 'form') {
      return;
    }

    event.preventDefault();
    dispatch({ type: 'add', text: event.target.todo.value });
    event.target.reset();
  });

  root.addEventListener('click', function (event) {
    var filter = event.target.getAttribute('data-filter');
    var action = event.target.getAttribute('data-action');
    var row = event.target.closest('li[data-id]');

    if (filter) {
      dispatch({ type: 'setFilter', filter: filter });
      return;
    }

    if (action === 'clearCompleted') {
      dispatch({ type: 'clearCompleted' });
      return;
    }

    if (!row) {
      return;
    }

    var id = Number(row.getAttribute('data-id'));

    if (action === 'toggle') {
      dispatch({ type: 'toggle', id: id });
    }

    if (action === 'remove') {
      dispatch({ type: 'remove', id: id });
    }
  });

  render();

  return {
    dispatch: dispatch,
    getState: function () {
      return {
        items: state.items.slice(),
        filter: state.filter,
        nextId: state.nextId
      };
    }
  };
}`
      }
    ],
    playground: [
      {
        title: "Reducer-style todo state",
        descriptionMD: "The state transition layer can be tested without a DOM.",
        code: `function reduceTodos(state, action) {
  if (action.type === 'add') {
    return {
      nextId: state.nextId + 1,
      items: state.items.concat({ id: state.nextId, text: action.text, completed: false })
    };
  }

  if (action.type === 'toggle') {
    return {
      nextId: state.nextId,
      items: state.items.map(function (item) {
        if (item.id !== action.id) {
          return item;
        }

        return { id: item.id, text: item.text, completed: !item.completed };
      })
    };
  }

  return state;
}

var state = { nextId: 1, items: [] };
state = reduceTodos(state, { type: 'add', text: 'Ship content' });
state = reduceTodos(state, { type: 'toggle', id: 1 });
console.log(state.items[0].text + ':' + state.items[0].completed);`
      }
    ],
    outputPredictions: [
      {
        code: `function reduceTodos(state, action) {
  if (action.type === 'add') {
    return {
      nextId: state.nextId + 1,
      items: state.items.concat({ id: state.nextId, text: action.text, completed: false })
    };
  }

  if (action.type === 'toggle') {
    return {
      nextId: state.nextId,
      items: state.items.map(function (item) {
        if (item.id !== action.id) {
          return item;
        }

        return { id: item.id, text: item.text, completed: !item.completed };
      })
    };
  }

  return state;
}

var state = { nextId: 1, items: [] };
state = reduceTodos(state, { type: 'add', text: 'Ship content' });
state = reduceTodos(state, { type: 'toggle', id: 1 });
console.log(state.items[0].text + ':' + state.items[0].completed);`,
        answer: "Ship content:true",
        explanationMD: "The add action creates id 1 with `completed: false`; the toggle action flips it to `true`."
      }
    ],
    codingExercises: [
      {
        title: "Implement a framework-free Todo app",
        difficulty: "Medium",
        promptMD: "Build `createTodoApp(root)`.\n\nRequirements:\n- Add todos from a form.\n- Toggle completion by stable id.\n- Remove todos.\n- Filter all, active, and completed.\n- Clear completed todos.\n- Render empty and remaining-count states.\n- Escape user text before inserting HTML.\n- Use event delegation and return `{ dispatch, getState }`.\n\nConstraints:\n- Do not use a framework.\n- Do not use array indexes as ids.\n- Keep state as the source of truth.",
        hints: [
          "Use a single `dispatch(action)` function for state transitions.",
          "Attach listeners to the root and inspect `data-action` attributes.",
          "Generate HTML from state in one render path.",
          "Escape todo text before writing to `innerHTML`."
        ],
        solutionCode: `function createTodoApp(root) {
  var state = {
    items: [],
    filter: 'all',
    nextId: 1
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      var entities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };

      return entities[char];
    });
  }

  function getVisibleItems() {
    return state.items.filter(function (item) {
      if (state.filter === 'active') {
        return !item.completed;
      }

      if (state.filter === 'completed') {
        return item.completed;
      }

      return true;
    });
  }

  function dispatch(action) {
    if (action.type === 'add') {
      var text = action.text.trim();

      if (text.length > 0) {
        state.items = state.items.concat({
          id: state.nextId,
          text: text,
          completed: false
        });
        state.nextId += 1;
      }
    }

    if (action.type === 'toggle') {
      state.items = state.items.map(function (item) {
        if (item.id !== action.id) {
          return item;
        }

        return {
          id: item.id,
          text: item.text,
          completed: !item.completed
        };
      });
    }

    if (action.type === 'remove') {
      state.items = state.items.filter(function (item) {
        return item.id !== action.id;
      });
    }

    if (action.type === 'clearCompleted') {
      state.items = state.items.filter(function (item) {
        return !item.completed;
      });
    }

    if (action.type === 'setFilter') {
      state.filter = action.filter;
    }

    render();
  }

  function render() {
    var visibleItems = getVisibleItems();
    var remaining = state.items.filter(function (item) {
      return !item.completed;
    }).length;
    var html = '';

    html += '<form data-role="form">';
    html += '<input name="todo" placeholder="What needs to be done?" autocomplete="off">';
    html += '<button type="submit">Add</button>';
    html += '</form>';
    html += '<p>' + remaining + ' item(s) left</p>';
    html += '<div>';
    html += '<button data-filter="all">All</button>';
    html += '<button data-filter="active">Active</button>';
    html += '<button data-filter="completed">Completed</button>';
    html += '<button data-action="clearCompleted">Clear completed</button>';
    html += '</div>';

    if (visibleItems.length === 0) {
      html += '<p>No todos to show.</p>';
    } else {
      html += '<ul>';

      visibleItems.forEach(function (item) {
        html += '<li data-id="' + item.id + '">';
        html += '<label>';
        html += '<input type="checkbox" data-action="toggle"';

        if (item.completed) {
          html += ' checked';
        }

        html += '>';
        html += '<span>' + escapeHtml(item.text) + '</span>';
        html += '</label>';
        html += '<button data-action="remove">Remove</button>';
        html += '</li>';
      });

      html += '</ul>';
    }

    root.innerHTML = html;
  }

  root.addEventListener('submit', function (event) {
    if (event.target.getAttribute('data-role') !== 'form') {
      return;
    }

    event.preventDefault();
    dispatch({ type: 'add', text: event.target.todo.value });
    event.target.reset();
  });

  root.addEventListener('click', function (event) {
    var filter = event.target.getAttribute('data-filter');
    var action = event.target.getAttribute('data-action');
    var row = event.target.closest('li[data-id]');

    if (filter) {
      dispatch({ type: 'setFilter', filter: filter });
      return;
    }

    if (action === 'clearCompleted') {
      dispatch({ type: 'clearCompleted' });
      return;
    }

    if (!row) {
      return;
    }

    var id = Number(row.getAttribute('data-id'));

    if (action === 'toggle') {
      dispatch({ type: 'toggle', id: id });
    }

    if (action === 'remove') {
      dispatch({ type: 'remove', id: id });
    }
  });

  render();

  return {
    dispatch: dispatch,
    getState: function () {
      return {
        items: state.items.slice(),
        filter: state.filter,
        nextId: state.nextId
      };
    }
  };
}`,
        complexity: { time: "O(n) per render or state transition over n todos", space: "O(n) for todo state and rendered markup" },
        explanationMD: "All mutations flow through `dispatch`, which keeps the app predictable. Rendering from state prevents handler-specific DOM drift. Stable ids make remove and toggle safe after filtering, and escaping user text prevents HTML injection when using `innerHTML`."
      }
    ],
    interviewQuestions: [
      {
        question: "Why should you avoid array indexes as todo ids?",
        answerMD: "Indexes change when items are removed, filtered, or reordered. If the UI stores an index in the DOM, a later click may target the wrong item. Stable ids keep event handling correct across list changes.",
        companies: ["Microsoft", "Atlassian"],
        followUps: ["How would you persist todos?", "How would you avoid rerendering the whole list?"]
      },
      {
        question: "Why use event delegation?",
        answerMD: "One root listener can handle events for current and future child elements. This avoids reattaching per-item listeners after every render and makes cleanup simpler."
      }
    ],
    quiz: [
      {
        question: "What is the main reason to escape todo text before writing `innerHTML`?",
        options: [
          "To make sorting faster",
          "To prevent user-provided HTML or script injection",
          "To preserve array indexes",
          "To improve timer accuracy"
        ],
        correctIndex: 1,
        explanationMD: "If user text is inserted as raw HTML, a malicious value can become executable markup. Escaping turns it into safe text."
      }
    ],
    summary: [
      "Keep Todo state as the source of truth.",
      "Use stable ids, not array indexes.",
      "Centralize transitions in a dispatch function and render from state.",
      "Escape user text before string-based rendering."
    ],
    cheatSheetMD: "**Todo app checklist**\n\n- State: `{ items, filter, nextId }`.\n- Item: `{ id, text, completed }`.\n- Actions: add, toggle, remove, clear completed, set filter.\n- Event delegation on root.\n- Stable ids in `data-id`.\n- Escape text if using `innerHTML`.\n- Render empty state and remaining count."
  },
  {
    slug: "js-mc-event-emitter",
    moduleId: "machine-coding",
    order: 109,
    title: "Build: Event Emitter",
    difficulty: "Intermediate",
    estimatedReadingMin: 11,
    estimatedPracticeMin: 30,
    tags: ["Machine Coding", "PubSub", "Events", "Design Patterns"],
    introMD: "An Event Emitter implements publish-subscribe in a few methods: `on`, `off`, `once`, and `emit`. It is small enough to code in an interview but rich enough to expose API design choices.\n\nA robust emitter handles listener removal, one-time listeners, duplicate listeners, listener mutation during emit, and ergonomic unsubscribe functions.",
    whyItMattersMD: "Emitters appear in Node.js, UI frameworks, analytics SDKs, sockets, and plugin systems. Interviewers like this problem because the happy path is easy, while edge cases reveal whether you understand arrays, references, closures, and mutation safety.",
    theoryMD: "### Data model\n\nUse a `Map` from event name to an array of listener functions. Arrays preserve registration order, which most event systems guarantee. `on` pushes a listener and returns an unsubscribe function. `off` removes a listener by reference.\n\n### Mutation safety\n\nIf a listener removes another listener during `emit`, iterating the original array can skip or duplicate callbacks. The safe approach is to copy the listener array before calling functions. That makes each emit operate on the listener snapshot that existed at the start.\n\n### `once` design\n\n`once` wraps the original listener in a function that unsubscribes itself before invoking the user callback. Store a `_original` reference on the wrapper so `off(event, original)` can remove a once-listener before it fires.",
    diagrams: [
      {
        title: "Emitter listener table",
        ascii: `events Map
  login  -> [listenerA, onceWrapper]
  logout -> [listenerB]

emit login
  copy listeners
  call listenerA
  call onceWrapper -> removes itself`,
        caption: "Copying listeners before emit makes mutation during callbacks predictable."
      }
    ],
    codeExamples: [
      {
        title: "Complete EventEmitter",
        descriptionMD: "This implementation preserves listener order, supports `once`, and returns unsubscribe functions.",
        language: "javascript",
        code: `function EventEmitter() {
  this.events = new Map();
}

EventEmitter.prototype.on = function (eventName, listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('listener must be a function');
  }

  if (!this.events.has(eventName)) {
    this.events.set(eventName, []);
  }

  var listeners = this.events.get(eventName);
  listeners.push(listener);

  var emitter = this;

  return function unsubscribe() {
    emitter.off(eventName, listener);
  };
};

EventEmitter.prototype.off = function (eventName, listener) {
  var listeners = this.events.get(eventName);

  if (!listeners) {
    return this;
  }

  var nextListeners = listeners.filter(function (candidate) {
    return candidate !== listener && candidate._original !== listener;
  });

  if (nextListeners.length === 0) {
    this.events.delete(eventName);
  } else {
    this.events.set(eventName, nextListeners);
  }

  return this;
};

EventEmitter.prototype.once = function (eventName, listener) {
  var emitter = this;

  function onceListener() {
    emitter.off(eventName, onceListener);
    listener.apply(this, arguments);
  }

  onceListener._original = listener;
  return this.on(eventName, onceListener);
};

EventEmitter.prototype.emit = function (eventName) {
  var listeners = this.events.get(eventName);

  if (!listeners || listeners.length === 0) {
    return false;
  }

  var args = Array.prototype.slice.call(arguments, 1);
  var snapshot = listeners.slice();

  snapshot.forEach(function (listener) {
    listener.apply(null, args);
  });

  return true;
};

EventEmitter.prototype.listenerCount = function (eventName) {
  var listeners = this.events.get(eventName);
  return listeners ? listeners.length : 0;
};`
      }
    ],
    playground: [
      {
        title: "Use on, once, off, and emit",
        descriptionMD: "This pure JavaScript snippet is safe to run in the playground.",
        code: `function EventEmitter() {
  this.events = new Map();
}

EventEmitter.prototype.on = function (eventName, listener) {
  if (!this.events.has(eventName)) {
    this.events.set(eventName, []);
  }

  this.events.get(eventName).push(listener);
  var emitter = this;

  return function unsubscribe() {
    emitter.off(eventName, listener);
  };
};

EventEmitter.prototype.off = function (eventName, listener) {
  var listeners = this.events.get(eventName);

  if (!listeners) {
    return this;
  }

  var next = listeners.filter(function (candidate) {
    return candidate !== listener && candidate._original !== listener;
  });

  if (next.length === 0) {
    this.events.delete(eventName);
  } else {
    this.events.set(eventName, next);
  }

  return this;
};

EventEmitter.prototype.once = function (eventName, listener) {
  var emitter = this;

  function wrapper() {
    emitter.off(eventName, wrapper);
    listener.apply(null, arguments);
  }

  wrapper._original = listener;
  return this.on(eventName, wrapper);
};

EventEmitter.prototype.emit = function (eventName) {
  var listeners = this.events.get(eventName);

  if (!listeners) {
    return false;
  }

  var args = Array.prototype.slice.call(arguments, 1);
  listeners.slice().forEach(function (listener) {
    listener.apply(null, args);
  });

  return true;
};

EventEmitter.prototype.listenerCount = function (eventName) {
  var listeners = this.events.get(eventName);
  return listeners ? listeners.length : 0;
};

var bus = new EventEmitter();

function logUser(name) {
  console.log('user:' + name);
}

bus.on('login', logUser);
bus.once('login', function (name) {
  console.log('once:' + name);
});

bus.emit('login', 'Ada');
bus.emit('login', 'Grace');
bus.off('login', logUser);
console.log(bus.listenerCount('login'));`
      }
    ],
    outputPredictions: [
      {
        code: `function EventEmitter() {
  this.events = new Map();
}

EventEmitter.prototype.on = function (eventName, listener) {
  if (!this.events.has(eventName)) {
    this.events.set(eventName, []);
  }

  this.events.get(eventName).push(listener);
};

EventEmitter.prototype.off = function (eventName, listener) {
  var listeners = this.events.get(eventName) || [];
  this.events.set(eventName, listeners.filter(function (candidate) {
    return candidate !== listener && candidate._original !== listener;
  }));
};

EventEmitter.prototype.once = function (eventName, listener) {
  var emitter = this;

  function wrapper() {
    emitter.off(eventName, wrapper);
    listener.apply(null, arguments);
  }

  wrapper._original = listener;
  this.on(eventName, wrapper);
};

EventEmitter.prototype.emit = function (eventName) {
  var listeners = this.events.get(eventName) || [];
  var args = Array.prototype.slice.call(arguments, 1);
  listeners.slice().forEach(function (listener) {
    listener.apply(null, args);
  });
};

var bus = new EventEmitter();
function logUser(name) {
  console.log('user:' + name);
}
bus.on('login', logUser);
bus.once('login', function (name) {
  console.log('once:' + name);
});
bus.emit('login', 'Ada');
bus.emit('login', 'Grace');`,
        answer: "user:Ada\nonce:Ada\nuser:Grace",
        explanationMD: "The regular listener runs on both emits. The once listener removes itself before running, so it only logs for `Ada`."
      }
    ],
    codingExercises: [
      {
        title: "Implement EventEmitter",
        difficulty: "Medium",
        promptMD: "Implement an `EventEmitter` with these methods:\n\n- `on(eventName, listener)` registers a listener and returns an unsubscribe function.\n- `off(eventName, listener)` removes that listener. It should also remove a `once` wrapper when given the original function.\n- `once(eventName, listener)` registers a listener that runs at most once.\n- `emit(eventName, ...args)` calls listeners in registration order and returns whether any listener ran.\n- `listenerCount(eventName)` returns the number of active listeners.\n\nConstraints:\n- Do not use Node's `events` module.\n- Mutating listeners during `emit` should not corrupt the current emission.",
        hints: [
          "Use a `Map` from event name to listener arrays.",
          "Return an unsubscribe closure from `on`.",
          "Copy the listener array before emitting.",
          "Store a reference from a once-wrapper back to the original listener."
        ],
        solutionCode: `function EventEmitter() {
  this.events = new Map();
}

EventEmitter.prototype.on = function (eventName, listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('listener must be a function');
  }

  if (!this.events.has(eventName)) {
    this.events.set(eventName, []);
  }

  var listeners = this.events.get(eventName);
  listeners.push(listener);

  var emitter = this;

  return function unsubscribe() {
    emitter.off(eventName, listener);
  };
};

EventEmitter.prototype.off = function (eventName, listener) {
  var listeners = this.events.get(eventName);

  if (!listeners) {
    return this;
  }

  var nextListeners = listeners.filter(function (candidate) {
    return candidate !== listener && candidate._original !== listener;
  });

  if (nextListeners.length === 0) {
    this.events.delete(eventName);
  } else {
    this.events.set(eventName, nextListeners);
  }

  return this;
};

EventEmitter.prototype.once = function (eventName, listener) {
  var emitter = this;

  function onceListener() {
    emitter.off(eventName, onceListener);
    listener.apply(this, arguments);
  }

  onceListener._original = listener;
  return this.on(eventName, onceListener);
};

EventEmitter.prototype.emit = function (eventName) {
  var listeners = this.events.get(eventName);

  if (!listeners || listeners.length === 0) {
    return false;
  }

  var args = Array.prototype.slice.call(arguments, 1);
  var snapshot = listeners.slice();

  snapshot.forEach(function (listener) {
    listener.apply(null, args);
  });

  return true;
};

EventEmitter.prototype.listenerCount = function (eventName) {
  var listeners = this.events.get(eventName);
  return listeners ? listeners.length : 0;
};`,
        complexity: { time: "on O(1), emit O(k), off O(k) where k is listeners for the event", space: "O(e + l) for event names and listeners" },
        explanationMD: "`on` appends listeners and returns cleanup. `emit` copies the listener array before invoking callbacks, so removing listeners during emission does not affect the current snapshot. `once` is implemented as a wrapper that unregisters itself and keeps a `_original` pointer so `off` can remove it by the original callback reference."
      }
    ],
    interviewQuestions: [
      {
        question: "Why copy the listeners array before emitting?",
        answerMD: "Listeners can call `off` or `once` wrappers can remove themselves during emission. Iterating a copied snapshot keeps the current emission deterministic and prevents index-shifting bugs.",
        companies: ["Stripe", "Microsoft"]
      },
      {
        question: "What should `on` return?",
        answerMD: "Returning an unsubscribe function is ergonomic and avoids forcing callers to keep event names and listener references near cleanup code. It is especially useful in UI lifecycles."
      }
    ],
    quiz: [
      {
        question: "How can `off(event, originalListener)` remove a listener registered with `once`?",
        options: [
          "By clearing all events",
          "By storing the original listener reference on the wrapper",
          "By sorting listeners alphabetically",
          "By calling emit twice"
        ],
        correctIndex: 1,
        explanationMD: "The once wrapper can carry `_original = listener`, allowing `off` to match either the wrapper or the original callback."
      }
    ],
    summary: [
      "An EventEmitter maps event names to listener arrays.",
      "`on` should return an unsubscribe function.",
      "`once` is a self-removing wrapper.",
      "`emit` should iterate a snapshot to avoid mutation bugs."
    ],
    cheatSheetMD: "**EventEmitter checklist**\n\n- Data: `Map<eventName, listeners[]>`.\n- `on`: validate function, push, return unsubscribe.\n- `off`: filter by listener or wrapper original.\n- `once`: wrapper removes itself, then calls original.\n- `emit`: copy listeners, call in order, return boolean.\n- Edge case: listener mutation during emit."
  },
  {
    slug: "js-mc-promise-polyfills",
    moduleId: "machine-coding",
    order: 110,
    title: "Build: Promise Polyfills",
    difficulty: "Advanced",
    estimatedReadingMin: 18,
    estimatedPracticeMin: 60,
    tags: ["Machine Coding", "Promise", "Polyfill", "Async"],
    introMD: "Promise polyfills are a classic advanced JavaScript machine-coding challenge. The interviewer is not looking for the entire ECMAScript spec; they want the state machine, asynchronous handler scheduling, thenable assimilation, chaining, rejection propagation, and `Promise.all` behavior.\n\nThis topic builds a compact `MyPromise` with `then`, `catch`, `resolve`, `reject`, and `all`.",
    whyItMattersMD: "Promises are the foundation of modern async JavaScript. Reimplementing them forces you to explain why callbacks run asynchronously, how returned values become chained promises, and how `Promise.all` preserves order while resolving concurrently.",
    theoryMD: "### Promise state machine\n\nA promise starts as `pending`. It can transition exactly once to `fulfilled` with a value or `rejected` with a reason. After settlement, the state and value never change.\n\n### Handler queue\n\n`then` returns a new promise. If the current promise is pending, store the handler. If it is settled, schedule the handler asynchronously. The returned promise resolves with the callback result; if the callback throws, it rejects.\n\n### Thenable assimilation\n\nIf `resolve` receives another promise-like object with a `then` method, adopt that object's eventual state. This is what makes `return fetch(...)` or `return anotherPromise` inside `then` flatten instead of creating nested promises.\n\n### Promise.all\n\n`all` starts all inputs, stores each result by original index, decrements a remaining counter, resolves when all complete, and rejects immediately on the first rejection.",
    diagrams: [
      {
        title: "Promise state transitions",
        ascii: `pending
  |
  +-- resolve(value) --> fulfilled(value)
  |
  +-- reject(reason) --> rejected(reason)

settled states are final
then callbacks create a new chained promise`,
        caption: "The one-way state transition is the core invariant."
      }
    ],
    codeExamples: [
      {
        title: "Complete MyPromise and MyPromise.all",
        descriptionMD: "This is intentionally compact, but it includes the interview-critical pieces: async scheduling, chaining, thenable adoption, and order-preserving `all`.",
        language: "javascript",
        code: `function asyncRun(fn) {
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(fn);
  } else {
    setTimeout(fn, 0);
  }
}

function MyPromise(executor) {
  if (!(this instanceof MyPromise)) {
    throw new TypeError('MyPromise must be called with new');
  }

  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function');
  }

  this._state = 'pending';
  this._value = undefined;
  this._handlers = [];

  var promise = this;

  function resolve(value) {
    resolvePromise(promise, value);
  }

  function reject(reason) {
    settle(promise, 'rejected', reason);
  }

  try {
    executor(resolve, reject);
  } catch (error) {
    reject(error);
  }
}

function resolvePromise(promise, value) {
  if (promise._state !== 'pending') {
    return;
  }

  if (value === promise) {
    settle(promise, 'rejected', new TypeError('Cannot resolve promise with itself'));
    return;
  }

  if (value !== null && (typeof value === 'object' || typeof value === 'function')) {
    var then;

    try {
      then = value.then;
    } catch (error) {
      settle(promise, 'rejected', error);
      return;
    }

    if (typeof then === 'function') {
      var called = false;

      try {
        then.call(
          value,
          function (nextValue) {
            if (called) {
              return;
            }
            called = true;
            resolvePromise(promise, nextValue);
          },
          function (reason) {
            if (called) {
              return;
            }
            called = true;
            settle(promise, 'rejected', reason);
          }
        );
      } catch (error) {
        if (!called) {
          settle(promise, 'rejected', error);
        }
      }

      return;
    }
  }

  settle(promise, 'fulfilled', value);
}

function settle(promise, state, value) {
  if (promise._state !== 'pending') {
    return;
  }

  promise._state = state;
  promise._value = value;

  asyncRun(function () {
    flushHandlers(promise);
  });
}

function flushHandlers(promise) {
  var handlers = promise._handlers;
  promise._handlers = [];

  handlers.forEach(function (handler) {
    handle(promise, handler);
  });
}

function handle(promise, handler) {
  if (promise._state === 'pending') {
    promise._handlers.push(handler);
    return;
  }

  asyncRun(function () {
    var callback = promise._state === 'fulfilled'
      ? handler.onFulfilled
      : handler.onRejected;

    if (typeof callback !== 'function') {
      if (promise._state === 'fulfilled') {
        handler.resolve(promise._value);
      } else {
        handler.reject(promise._value);
      }
      return;
    }

    try {
      handler.resolve(callback(promise._value));
    } catch (error) {
      handler.reject(error);
    }
  });
}

MyPromise.prototype.then = function (onFulfilled, onRejected) {
  var current = this;

  return new MyPromise(function (resolve, reject) {
    handle(current, {
      onFulfilled: onFulfilled,
      onRejected: onRejected,
      resolve: resolve,
      reject: reject
    });
  });
};

MyPromise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected);
};

MyPromise.resolve = function (value) {
  return new MyPromise(function (resolve) {
    resolve(value);
  });
};

MyPromise.reject = function (reason) {
  return new MyPromise(function (resolve, reject) {
    reject(reason);
  });
};

MyPromise.all = function (values) {
  return new MyPromise(function (resolve, reject) {
    if (!values || typeof values.length !== 'number') {
      reject(new TypeError('MyPromise.all expects an array-like value'));
      return;
    }

    var results = new Array(values.length);
    var remaining = values.length;

    if (remaining === 0) {
      resolve([]);
      return;
    }

    for (var i = 0; i < values.length; i += 1) {
      (function (index) {
        MyPromise.resolve(values[index]).then(function (value) {
          results[index] = value;
          remaining -= 1;

          if (remaining === 0) {
            resolve(results);
          }
        }, reject);
      })(i);
    }
  });
};`
      }
    ],
    playground: [
      {
        title: "Chain MyPromise and run all",
        descriptionMD: "This snippet runs in a worker and demonstrates chaining plus order-preserving `all`.",
        code: `function asyncRun(fn) {
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(fn);
  } else {
    setTimeout(fn, 0);
  }
}

function MyPromise(executor) {
  this._state = 'pending';
  this._value = undefined;
  this._handlers = [];
  var promise = this;

  function resolve(value) {
    resolvePromise(promise, value);
  }

  function reject(reason) {
    settle(promise, 'rejected', reason);
  }

  try {
    executor(resolve, reject);
  } catch (error) {
    reject(error);
  }
}

function resolvePromise(promise, value) {
  if (promise._state !== 'pending') {
    return;
  }

  if (value && (typeof value === 'object' || typeof value === 'function')) {
    var then = value.then;

    if (typeof then === 'function') {
      then.call(value, function (nextValue) {
        resolvePromise(promise, nextValue);
      }, function (reason) {
        settle(promise, 'rejected', reason);
      });
      return;
    }
  }

  settle(promise, 'fulfilled', value);
}

function settle(promise, state, value) {
  if (promise._state !== 'pending') {
    return;
  }

  promise._state = state;
  promise._value = value;
  asyncRun(function () {
    var handlers = promise._handlers;
    promise._handlers = [];
    handlers.forEach(function (handler) {
      handle(promise, handler);
    });
  });
}

function handle(promise, handler) {
  if (promise._state === 'pending') {
    promise._handlers.push(handler);
    return;
  }

  asyncRun(function () {
    var callback = promise._state === 'fulfilled' ? handler.onFulfilled : handler.onRejected;

    if (typeof callback !== 'function') {
      if (promise._state === 'fulfilled') {
        handler.resolve(promise._value);
      } else {
        handler.reject(promise._value);
      }
      return;
    }

    try {
      handler.resolve(callback(promise._value));
    } catch (error) {
      handler.reject(error);
    }
  });
}

MyPromise.prototype.then = function (onFulfilled, onRejected) {
  var current = this;
  return new MyPromise(function (resolve, reject) {
    handle(current, { onFulfilled: onFulfilled, onRejected: onRejected, resolve: resolve, reject: reject });
  });
};

MyPromise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected);
};

MyPromise.resolve = function (value) {
  return new MyPromise(function (resolve) {
    resolve(value);
  });
};

MyPromise.all = function (values) {
  return new MyPromise(function (resolve, reject) {
    var results = new Array(values.length);
    var remaining = values.length;

    if (remaining === 0) {
      resolve([]);
      return;
    }

    values.forEach(function (value, index) {
      MyPromise.resolve(value).then(function (resolvedValue) {
        results[index] = resolvedValue;
        remaining -= 1;

        if (remaining === 0) {
          resolve(results);
        }
      }, reject);
    });
  });
};

MyPromise.resolve(2)
  .then(function (value) {
    return value + 3;
  })
  .then(function (value) {
    console.log('chain:' + value);
  });

MyPromise.all([
  MyPromise.resolve('A'),
  7,
  new MyPromise(function (resolve) {
    setTimeout(function () {
      resolve('C');
    }, 0);
  })
]).then(function (values) {
  console.log(values.join('-'));
});`
      }
    ],
    outputPredictions: [
      {
        code: `function asyncRun(fn) {
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(fn);
  } else {
    setTimeout(fn, 0);
  }
}

function MyPromise(executor) {
  this._state = 'pending';
  this._value = undefined;
  this._handlers = [];
  var promise = this;
  executor(function (value) {
    settle(promise, 'fulfilled', value);
  }, function (reason) {
    settle(promise, 'rejected', reason);
  });
}

function settle(promise, state, value) {
  if (promise._state !== 'pending') {
    return;
  }

  promise._state = state;
  promise._value = value;
  asyncRun(function () {
    promise._handlers.forEach(function (handler) {
      handler(value);
    });
  });
}

MyPromise.prototype.then = function (onFulfilled) {
  var current = this;
  return new MyPromise(function (resolve) {
    function run(value) {
      resolve(onFulfilled(value));
    }

    if (current._state === 'pending') {
      current._handlers.push(run);
    } else {
      asyncRun(function () {
        run(current._value);
      });
    }
  });
};

MyPromise.resolve = function (value) {
  return new MyPromise(function (resolve) {
    resolve(value);
  });
};

MyPromise.resolve(2)
  .then(function (value) {
    return value + 3;
  })
  .then(function (value) {
    console.log(value);
  });

console.log('sync');`,
        answer: "sync\n5",
        explanationMD: "Even when a promise is already resolved, `then` callbacks run asynchronously. The synchronous log happens first, then the chained callback logs `5`."
      }
    ],
    codingExercises: [
      {
        title: "Implement MyPromise with then, catch, and all",
        difficulty: "Hard",
        promptMD: "Implement a compact `MyPromise`.\n\nRequirements:\n- Constructor accepts an executor `(resolve, reject)`.\n- State can move from pending to fulfilled or rejected exactly once.\n- `then(onFulfilled, onRejected)` returns a new chained promise.\n- `catch(onRejected)` works as `then(null, onRejected)`.\n- Handlers run asynchronously.\n- Resolving with a thenable adopts that thenable.\n- `MyPromise.resolve`, `MyPromise.reject`, and `MyPromise.all` work.\n- `MyPromise.all` preserves input order and rejects on first rejection.\n\nConstraints:\n- Do not call native `Promise` for the state machine.\n- `queueMicrotask` or `setTimeout` may be used only for scheduling.",
        hints: [
          "A promise needs `_state`, `_value`, and a queue of handlers.",
          "The callback passed to `then` controls the value of the returned promise.",
          "If a callback throws, reject the returned promise.",
          "For `all`, store results by index and resolve when the remaining count reaches zero."
        ],
        solutionCode: `function asyncRun(fn) {
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(fn);
  } else {
    setTimeout(fn, 0);
  }
}

function MyPromise(executor) {
  if (!(this instanceof MyPromise)) {
    throw new TypeError('MyPromise must be called with new');
  }

  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function');
  }

  this._state = 'pending';
  this._value = undefined;
  this._handlers = [];

  var promise = this;

  function resolve(value) {
    resolvePromise(promise, value);
  }

  function reject(reason) {
    settle(promise, 'rejected', reason);
  }

  try {
    executor(resolve, reject);
  } catch (error) {
    reject(error);
  }
}

function resolvePromise(promise, value) {
  if (promise._state !== 'pending') {
    return;
  }

  if (value === promise) {
    settle(promise, 'rejected', new TypeError('Cannot resolve promise with itself'));
    return;
  }

  if (value !== null && (typeof value === 'object' || typeof value === 'function')) {
    var then;

    try {
      then = value.then;
    } catch (error) {
      settle(promise, 'rejected', error);
      return;
    }

    if (typeof then === 'function') {
      var called = false;

      try {
        then.call(
          value,
          function (nextValue) {
            if (called) {
              return;
            }
            called = true;
            resolvePromise(promise, nextValue);
          },
          function (reason) {
            if (called) {
              return;
            }
            called = true;
            settle(promise, 'rejected', reason);
          }
        );
      } catch (error) {
        if (!called) {
          settle(promise, 'rejected', error);
        }
      }

      return;
    }
  }

  settle(promise, 'fulfilled', value);
}

function settle(promise, state, value) {
  if (promise._state !== 'pending') {
    return;
  }

  promise._state = state;
  promise._value = value;

  asyncRun(function () {
    flushHandlers(promise);
  });
}

function flushHandlers(promise) {
  var handlers = promise._handlers;
  promise._handlers = [];

  handlers.forEach(function (handler) {
    handle(promise, handler);
  });
}

function handle(promise, handler) {
  if (promise._state === 'pending') {
    promise._handlers.push(handler);
    return;
  }

  asyncRun(function () {
    var callback = promise._state === 'fulfilled'
      ? handler.onFulfilled
      : handler.onRejected;

    if (typeof callback !== 'function') {
      if (promise._state === 'fulfilled') {
        handler.resolve(promise._value);
      } else {
        handler.reject(promise._value);
      }
      return;
    }

    try {
      handler.resolve(callback(promise._value));
    } catch (error) {
      handler.reject(error);
    }
  });
}

MyPromise.prototype.then = function (onFulfilled, onRejected) {
  var current = this;

  return new MyPromise(function (resolve, reject) {
    handle(current, {
      onFulfilled: onFulfilled,
      onRejected: onRejected,
      resolve: resolve,
      reject: reject
    });
  });
};

MyPromise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected);
};

MyPromise.resolve = function (value) {
  return new MyPromise(function (resolve) {
    resolve(value);
  });
};

MyPromise.reject = function (reason) {
  return new MyPromise(function (resolve, reject) {
    reject(reason);
  });
};

MyPromise.all = function (values) {
  return new MyPromise(function (resolve, reject) {
    if (!values || typeof values.length !== 'number') {
      reject(new TypeError('MyPromise.all expects an array-like value'));
      return;
    }

    var results = new Array(values.length);
    var remaining = values.length;

    if (remaining === 0) {
      resolve([]);
      return;
    }

    for (var i = 0; i < values.length; i += 1) {
      (function (index) {
        MyPromise.resolve(values[index]).then(function (value) {
          results[index] = value;
          remaining -= 1;

          if (remaining === 0) {
            resolve(results);
          }
        }, reject);
      })(i);
    }
  });
};`,
        complexity: { time: "then O(1) to register, settlement O(h), all O(n)", space: "O(h) queued handlers per promise and O(n) results for all" },
        explanationMD: "The implementation is a one-way state machine. `then` always returns a new promise and stores callbacks while pending. Settlement schedules a flush so callbacks never run synchronously. The resolution procedure adopts thenables and protects against multiple calls. `MyPromise.all` starts all inputs, stores values by index, and resolves only when every input has fulfilled."
      }
    ],
    interviewQuestions: [
      {
        question: "Why must promise callbacks run asynchronously?",
        answerMD: "Asynchronous scheduling makes behavior consistent whether a promise settles before or after `then` is attached. It also prevents surprising reentrancy where callbacks run in the middle of the current call stack.",
        companies: ["Google", "Meta", "Microsoft"],
        followUps: ["What is the difference between microtasks and macrotasks?", "Where do promise callbacks sit in the event loop?"]
      },
      {
        question: "How does `Promise.all` preserve order?",
        answerMD: "It stores each fulfilled value at the original input index. Promises may resolve in any order, but the final array is ordered by input position, not completion time."
      }
    ],
    quiz: [
      {
        question: "What should happen if a `then` callback throws?",
        options: [
          "The returned chained promise should reject with that error",
          "The original promise should become pending again",
          "The error should be ignored",
          "All promises in memory should reject"
        ],
        correctIndex: 0,
        explanationMD: "The promise returned by `then` represents the callback result. If the callback throws, that returned promise rejects."
      }
    ],
    summary: [
      "A promise is a one-way pending to fulfilled/rejected state machine.",
      "`then` returns a new promise and schedules callbacks asynchronously.",
      "Resolving with a thenable adopts that thenable's eventual state.",
      "`Promise.all` preserves input order and rejects on first rejection."
    ],
    cheatSheetMD: "**Promise polyfill checklist**\n\n- State: pending, fulfilled, rejected.\n- Store value/reason after settlement.\n- Queue handlers while pending.\n- Schedule handlers asynchronously.\n- `then` returns a new promise.\n- Callback return value resolves the chained promise.\n- Thrown callback error rejects the chained promise.\n- Assimilate thenables.\n- `all`: index results, remaining counter, first rejection wins."
  },
  {
    slug: "js-mc-array-polyfills",
    moduleId: "machine-coding",
    order: 111,
    title: "Build: Array Polyfills (map/filter/reduce)",
    difficulty: "Intermediate",
    estimatedReadingMin: 13,
    estimatedPracticeMin: 40,
    tags: ["Machine Coding", "Array", "Polyfill", "Prototype"],
    introMD: "Array polyfills are a direct test of JavaScript fundamentals: `this` binding, callback signatures, sparse arrays, optional `thisArg`, accumulator initialization, and prototype extension safety.\n\nThe implementation below mirrors the important behavior of `map`, `filter`, and `reduce` without relying on native equivalents.",
    whyItMattersMD: "These methods are everywhere in production code, and polyfill questions reveal whether you understand the specification-level details behind familiar APIs. The edge cases are what interviewers care about: holes, missing initial values, and callback context.",
    theoryMD: "### Shared mechanics\n\nAll three methods convert `this` to an object, read a length snapshot, validate the callback, and skip holes with `if (index in array)`. `map` preserves length and holes. `filter` returns a dense array of values that pass the predicate. `reduce` collapses values into one accumulator.\n\n### Callback signatures\n\n`map` and `filter` call `callback(value, index, array)` and optionally bind `thisArg`. `reduce` calls `callback(accumulator, value, index, array)` and does not use `thisArg`.\n\n### Reduce initialization\n\nIf an initial value is provided, reduction starts there. If not, the first present array element becomes the accumulator. Calling reduce on an empty array with no initial value must throw a `TypeError`.",
    diagrams: [
      {
        title: "Polyfill responsibilities",
        ascii: `Array method call
   |
   v
validate callback
   |
   v
snapshot length
   |
   v
iterate present indexes only
   |
   +--> map: write same index
   +--> filter: push passing values
   +--> reduce: update accumulator`,
        caption: "Sparse-array handling is the detail that many quick implementations miss."
      }
    ],
    codeExamples: [
      {
        title: "Complete myMap, myFilter, and myReduce",
        descriptionMD: "The properties are defined as non-enumerable to avoid surprising `for...in` loops.",
        language: "javascript",
        code: `Object.defineProperty(Array.prototype, 'myMap', {
  value: function (callback, thisArg) {
    if (this == null) {
      throw new TypeError('Array.prototype.myMap called on null or undefined');
    }

    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function');
    }

    var array = Object(this);
    var length = array.length >>> 0;
    var result = new Array(length);

    for (var index = 0; index < length; index += 1) {
      if (index in array) {
        result[index] = callback.call(thisArg, array[index], index, array);
      }
    }

    return result;
  },
  writable: true,
  configurable: true
});

Object.defineProperty(Array.prototype, 'myFilter', {
  value: function (callback, thisArg) {
    if (this == null) {
      throw new TypeError('Array.prototype.myFilter called on null or undefined');
    }

    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function');
    }

    var array = Object(this);
    var length = array.length >>> 0;
    var result = [];

    for (var index = 0; index < length; index += 1) {
      if (index in array) {
        var value = array[index];

        if (callback.call(thisArg, value, index, array)) {
          result.push(value);
        }
      }
    }

    return result;
  },
  writable: true,
  configurable: true
});

Object.defineProperty(Array.prototype, 'myReduce', {
  value: function (callback, initialValue) {
    if (this == null) {
      throw new TypeError('Array.prototype.myReduce called on null or undefined');
    }

    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function');
    }

    var array = Object(this);
    var length = array.length >>> 0;
    var index = 0;
    var accumulator;

    if (arguments.length > 1) {
      accumulator = initialValue;
    } else {
      while (index < length && !(index in array)) {
        index += 1;
      }

      if (index >= length) {
        throw new TypeError('Reduce of empty array with no initial value');
      }

      accumulator = array[index];
      index += 1;
    }

    for (; index < length; index += 1) {
      if (index in array) {
        accumulator = callback(accumulator, array[index], index, array);
      }
    }

    return accumulator;
  },
  writable: true,
  configurable: true
});`
      }
    ],
    playground: [
      {
        title: "Run the array polyfills",
        descriptionMD: "The snippet demonstrates sparse-array behavior, filtering, and reducing.",
        code: `Object.defineProperty(Array.prototype, 'myMap', {
  value: function (callback, thisArg) {
    var array = Object(this);
    var length = array.length >>> 0;
    var result = new Array(length);

    for (var index = 0; index < length; index += 1) {
      if (index in array) {
        result[index] = callback.call(thisArg, array[index], index, array);
      }
    }

    return result;
  },
  writable: true,
  configurable: true
});

Object.defineProperty(Array.prototype, 'myFilter', {
  value: function (callback, thisArg) {
    var array = Object(this);
    var length = array.length >>> 0;
    var result = [];

    for (var index = 0; index < length; index += 1) {
      if (index in array && callback.call(thisArg, array[index], index, array)) {
        result.push(array[index]);
      }
    }

    return result;
  },
  writable: true,
  configurable: true
});

Object.defineProperty(Array.prototype, 'myReduce', {
  value: function (callback, initialValue) {
    var array = Object(this);
    var length = array.length >>> 0;
    var index = 0;
    var accumulator = initialValue;

    if (arguments.length === 1) {
      while (index < length && !(index in array)) {
        index += 1;
      }
      accumulator = array[index];
      index += 1;
    }

    for (; index < length; index += 1) {
      if (index in array) {
        accumulator = callback(accumulator, array[index], index, array);
      }
    }

    return accumulator;
  },
  writable: true,
  configurable: true
});

var sparse = [1, , 3];
console.log(sparse.myMap(function (value, index) {
  return value + ':' + index;
}).hasOwnProperty(1));
console.log([1, 2, 3, 4].myFilter(function (value) {
  return value % 2 === 0;
}).join(','));
console.log([1, 2, 3].myReduce(function (sum, value) {
  return sum + value;
}, 0));`
      }
    ],
    outputPredictions: [
      {
        code: `Object.defineProperty(Array.prototype, 'myMap', {
  value: function (callback) {
    var array = Object(this);
    var result = new Array(array.length >>> 0);

    for (var index = 0; index < result.length; index += 1) {
      if (index in array) {
        result[index] = callback(array[index], index, array);
      }
    }

    return result;
  },
  writable: true,
  configurable: true
});

var sparse = [1, , 3];
var mapped = sparse.myMap(function (value, index) {
  return value + ':' + index;
});
console.log(mapped.length);
console.log(mapped.hasOwnProperty(1));
console.log(mapped[2]);`,
        answer: "3\nfalse\n3:2",
        explanationMD: "`map` preserves the original length and skips holes. Index 1 remains a hole, so `hasOwnProperty(1)` is false."
      }
    ],
    codingExercises: [
      {
        title: "Implement map, filter, and reduce polyfills",
        difficulty: "Medium",
        promptMD: "Add `myMap`, `myFilter`, and `myReduce` to `Array.prototype`.\n\nRequirements:\n- Throw `TypeError` if called on `null` or `undefined`.\n- Throw `TypeError` if callback is not a function.\n- Use the correct callback signatures.\n- Support `thisArg` for map and filter.\n- Skip holes in sparse arrays.\n- `myMap` preserves length and holes.\n- `myFilter` returns a dense array.\n- `myReduce` supports optional initial value and throws on empty arrays without one.\n- Define properties as writable and configurable.\n\nConstraints:\n- Do not call native `map`, `filter`, or `reduce` inside the implementations.",
        hints: [
          "Use `Object(this)` and `length >>> 0` to mimic array-like behavior.",
          "`index in array` distinguishes holes from explicit `undefined` values.",
          "For reduce without an initial value, search for the first present element.",
          "Use `Object.defineProperty` so the methods are not enumerable."
        ],
        solutionCode: `Object.defineProperty(Array.prototype, 'myMap', {
  value: function (callback, thisArg) {
    if (this == null) {
      throw new TypeError('Array.prototype.myMap called on null or undefined');
    }

    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function');
    }

    var array = Object(this);
    var length = array.length >>> 0;
    var result = new Array(length);

    for (var index = 0; index < length; index += 1) {
      if (index in array) {
        result[index] = callback.call(thisArg, array[index], index, array);
      }
    }

    return result;
  },
  writable: true,
  configurable: true
});

Object.defineProperty(Array.prototype, 'myFilter', {
  value: function (callback, thisArg) {
    if (this == null) {
      throw new TypeError('Array.prototype.myFilter called on null or undefined');
    }

    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function');
    }

    var array = Object(this);
    var length = array.length >>> 0;
    var result = [];

    for (var index = 0; index < length; index += 1) {
      if (index in array) {
        var value = array[index];

        if (callback.call(thisArg, value, index, array)) {
          result.push(value);
        }
      }
    }

    return result;
  },
  writable: true,
  configurable: true
});

Object.defineProperty(Array.prototype, 'myReduce', {
  value: function (callback, initialValue) {
    if (this == null) {
      throw new TypeError('Array.prototype.myReduce called on null or undefined');
    }

    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function');
    }

    var array = Object(this);
    var length = array.length >>> 0;
    var index = 0;
    var accumulator;

    if (arguments.length > 1) {
      accumulator = initialValue;
    } else {
      while (index < length && !(index in array)) {
        index += 1;
      }

      if (index >= length) {
        throw new TypeError('Reduce of empty array with no initial value');
      }

      accumulator = array[index];
      index += 1;
    }

    for (; index < length; index += 1) {
      if (index in array) {
        accumulator = callback(accumulator, array[index], index, array);
      }
    }

    return accumulator;
  },
  writable: true,
  configurable: true
});`,
        complexity: { time: "O(n) for each method over length n", space: "map O(n), filter O(k), reduce O(1) excluding callback-created values" },
        explanationMD: "The implementation follows the native method contracts closely enough for interviews. It snapshots length, skips sparse holes, invokes callbacks with the right arguments, and handles the tricky reduce case where no initial value is supplied."
      }
    ],
    interviewQuestions: [
      {
        question: "Why check `index in array` instead of `array[index] !== undefined`?",
        answerMD: "A sparse hole and an explicit `undefined` value are different. Native array methods skip holes but visit explicit `undefined`. `index in array` correctly detects whether the property exists.",
        companies: ["Amazon", "Google"]
      },
      {
        question: "What happens when `reduce` is called on an empty array without an initial value?",
        answerMD: "It throws a `TypeError` because there is no first present element to use as the accumulator."
      }
    ],
    quiz: [
      {
        question: "Which method should preserve holes in the returned array?",
        options: ["myMap", "myFilter", "myReduce", "None of them"],
        correctIndex: 0,
        explanationMD: "`map` returns an array with the same length and skips holes, leaving corresponding holes in the result."
      }
    ],
    summary: [
      "Array polyfills must validate `this` and callback inputs.",
      "`map` and `filter` use `(value, index, array)` and optional `thisArg`.",
      "`reduce` uses `(accumulator, value, index, array)` and has special initial-value rules.",
      "Use `index in array` to handle sparse arrays correctly."
    ],
    cheatSheetMD: "**Array polyfill checklist**\n\n- `if (this == null) throw TypeError`.\n- `if (typeof callback !== \"function\") throw TypeError`.\n- `array = Object(this)`, `length = array.length >>> 0`.\n- Skip holes with `index in array`.\n- `map`: same length, callback with thisArg.\n- `filter`: push passing values, dense result.\n- `reduce`: initialize accumulator carefully, throw on empty without initial value.\n- Use `Object.defineProperty`."
  },
  {
    slug: "js-mc-deep-clone",
    moduleId: "machine-coding",
    order: 112,
    title: "Build: Deep Clone",
    difficulty: "Advanced",
    estimatedReadingMin: 14,
    estimatedPracticeMin: 45,
    tags: ["Machine Coding", "Objects", "Recursion", "WeakMap"],
    introMD: "Deep clone means creating a new object graph with the same values but no shared nested object references. A production-quality answer handles arrays, objects, dates, regexes, maps, sets, symbols, property descriptors, and cycles.\n\nThe key idea is to recursively clone objects while remembering already-cloned references in a `WeakMap`.",
    whyItMattersMD: "Deep clone tests whether you understand references, prototypes, descriptors, cyclic graphs, and built-in types. It is also a gateway to discussing when not to clone: structural sharing, immutable updates, and `structuredClone` are often better in production.",
    theoryMD: "### Shallow vs deep\n\nA shallow copy duplicates the outer object but keeps nested references. A deep clone recursively duplicates nested objects so changes to the clone do not mutate the original.\n\n### Cycle handling\n\nObject graphs can contain cycles: `node.self = node`. Naive recursion loops forever. Store every source object in a `WeakMap` before cloning children. If you see the same source again, return the existing clone.\n\n### Built-in types\n\nDates and regexes need custom constructors. Maps clone both keys and values. Sets clone values. Plain objects should preserve their prototype and property descriptors where possible. Functions are usually returned by reference because cloning executable code and closures is not meaningful.\n\n### Production note\n\nModern environments provide `structuredClone` for many cloneable values, including cycles, Map, Set, Date, ArrayBuffer, and more. It does not clone functions or DOM nodes.",
    diagrams: [
      {
        title: "Cycle-safe cloning",
        ascii: `clone(object A)
   |
   v
WeakMap: A -> cloneA
   |
   v
clone children
   |
   +--> child points back to A
          |
          v
       return cloneA instead of recursing forever`,
        caption: "Register the clone before descending into children."
      }
    ],
    codeExamples: [
      {
        title: "Complete cycle-safe deep clone",
        descriptionMD: "This implementation handles common built-ins and preserves descriptors for objects.",
        language: "javascript",
        code: `function deepClone(value, seen) {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (typeof value === 'function') {
    return value;
  }

  var cache = seen || new WeakMap();

  if (cache.has(value)) {
    return cache.get(value);
  }

  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  if (value instanceof RegExp) {
    var clonedRegExp = new RegExp(value.source, value.flags);
    clonedRegExp.lastIndex = value.lastIndex;
    return clonedRegExp;
  }

  if (value instanceof Map) {
    var clonedMap = new Map();
    cache.set(value, clonedMap);

    value.forEach(function (mapValue, mapKey) {
      clonedMap.set(deepClone(mapKey, cache), deepClone(mapValue, cache));
    });

    return clonedMap;
  }

  if (value instanceof Set) {
    var clonedSet = new Set();
    cache.set(value, clonedSet);

    value.forEach(function (setValue) {
      clonedSet.add(deepClone(setValue, cache));
    });

    return clonedSet;
  }

  var clonedObject = Array.isArray(value)
    ? []
    : Object.create(Object.getPrototypeOf(value));

  cache.set(value, clonedObject);

  Reflect.ownKeys(value).forEach(function (key) {
    var descriptor = Object.getOwnPropertyDescriptor(value, key);

    if ('value' in descriptor) {
      descriptor.value = deepClone(descriptor.value, cache);
    }

    Object.defineProperty(clonedObject, key, descriptor);
  });

  return clonedObject;
}`
      }
    ],
    playground: [
      {
        title: "Clone nested data with a cycle",
        descriptionMD: "This runnable example verifies nested independence, cycle preservation, and Date cloning.",
        code: `function deepClone(value, seen) {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  var cache = seen || new WeakMap();

  if (cache.has(value)) {
    return cache.get(value);
  }

  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  var result = Array.isArray(value) ? [] : {};
  cache.set(value, result);

  Object.keys(value).forEach(function (key) {
    result[key] = deepClone(value[key], cache);
  });

  return result;
}

var original = {
  name: 'Ada',
  meta: { score: 10 },
  when: new Date('2020-01-01T00:00:00.000Z')
};
original.self = original;

var copy = deepClone(original);
copy.meta.score = 99;

console.log(original.meta.score);
console.log(copy.self === copy);
console.log(copy.when instanceof Date);`
      }
    ],
    outputPredictions: [
      {
        code: `function deepClone(value, seen) {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  var cache = seen || new WeakMap();

  if (cache.has(value)) {
    return cache.get(value);
  }

  var result = Array.isArray(value) ? [] : {};
  cache.set(value, result);

  Object.keys(value).forEach(function (key) {
    result[key] = deepClone(value[key], cache);
  });

  return result;
}

var original = { nested: { count: 1 } };
original.self = original;
var copy = deepClone(original);
copy.nested.count = 7;
console.log(original.nested.count);
console.log(copy.self === copy);`,
        answer: "1\ntrue",
        explanationMD: "The nested object is cloned, so changing the copy does not affect the original. The WeakMap preserves the self-cycle by pointing it at the cloned object."
      }
    ],
    codingExercises: [
      {
        title: "Implement a cycle-safe deep clone",
        difficulty: "Hard",
        promptMD: "Implement `deepClone(value)`.\n\nRequirements:\n- Return primitives as-is.\n- Clone arrays and objects recursively.\n- Preserve object prototypes where practical.\n- Preserve property descriptors for normal objects.\n- Handle cycles using `WeakMap`.\n- Clone `Date`, `RegExp`, `Map`, and `Set`.\n- Preserve symbol keys.\n- Functions may be returned by reference.\n\nConstraints:\n- Do not use JSON serialization.\n- Do not use native `structuredClone` for the exercise solution.",
        hints: [
          "Check primitives before touching WeakMap.",
          "Put the source object into WeakMap before cloning children.",
          "Use `Reflect.ownKeys` to include symbols and non-enumerable keys.",
          "Map needs both keys and values cloned."
        ],
        solutionCode: `function deepClone(value, seen) {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (typeof value === 'function') {
    return value;
  }

  var cache = seen || new WeakMap();

  if (cache.has(value)) {
    return cache.get(value);
  }

  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  if (value instanceof RegExp) {
    var clonedRegExp = new RegExp(value.source, value.flags);
    clonedRegExp.lastIndex = value.lastIndex;
    return clonedRegExp;
  }

  if (value instanceof Map) {
    var clonedMap = new Map();
    cache.set(value, clonedMap);

    value.forEach(function (mapValue, mapKey) {
      clonedMap.set(deepClone(mapKey, cache), deepClone(mapValue, cache));
    });

    return clonedMap;
  }

  if (value instanceof Set) {
    var clonedSet = new Set();
    cache.set(value, clonedSet);

    value.forEach(function (setValue) {
      clonedSet.add(deepClone(setValue, cache));
    });

    return clonedSet;
  }

  var clonedObject = Array.isArray(value)
    ? []
    : Object.create(Object.getPrototypeOf(value));

  cache.set(value, clonedObject);

  Reflect.ownKeys(value).forEach(function (key) {
    var descriptor = Object.getOwnPropertyDescriptor(value, key);

    if ('value' in descriptor) {
      descriptor.value = deepClone(descriptor.value, cache);
    }

    Object.defineProperty(clonedObject, key, descriptor);
  });

  return clonedObject;
}`,
        complexity: { time: "O(n) over reachable properties and collection entries", space: "O(n) for cloned graph and WeakMap cache" },
        explanationMD: "The `WeakMap` is the core safety mechanism. Each object is registered before its children are cloned, so cycles and shared references are preserved. Specialized branches handle built-ins whose data is not represented by enumerable own properties."
      }
    ],
    interviewQuestions: [
      {
        question: "Why is `JSON.parse(JSON.stringify(obj))` not a good deep clone?",
        answerMD: "It drops functions, `undefined`, symbols, `Date` identity, `Map`, `Set`, prototypes, descriptors, and fails on cycles. It also changes values such as `NaN` and `Infinity` in ways that can be surprising.",
        companies: ["Google", "Amazon"],
        followUps: ["When is `structuredClone` appropriate?", "How would you preserve shared references?"]
      },
      {
        question: "Why use `WeakMap` instead of `Map` for cycle tracking?",
        answerMD: "A `WeakMap` lets source objects be garbage-collected when cloning is done and avoids accidentally extending object lifetimes. It also accepts only objects as keys, which is exactly what the clone cache needs."
      }
    ],
    quiz: [
      {
        question: "When should the source object be stored in the clone cache?",
        options: [
          "After all children are cloned",
          "Before cloning children",
          "Only for arrays",
          "Never"
        ],
        correctIndex: 1,
        explanationMD: "Registering before recursion is what breaks cycles. If a child points back to the parent, the clone already exists in the cache."
      }
    ],
    summary: [
      "Deep clone copies an object graph, not just the outer object.",
      "Use `WeakMap` to handle cycles and preserve shared references.",
      "Built-ins such as Date, RegExp, Map, and Set need custom handling.",
      "`structuredClone` is often the production choice, but knowing the implementation is interview-critical."
    ],
    cheatSheetMD: "**Deep clone checklist**\n\n- Primitives return as-is.\n- Functions usually return by reference.\n- Use `WeakMap` cache before descending.\n- Date: `new Date(time)`.\n- RegExp: source, flags, lastIndex.\n- Map: clone keys and values.\n- Set: clone values.\n- Object: preserve prototype and descriptors.\n- Use `Reflect.ownKeys` for symbols and non-enumerables.\n- Avoid JSON for serious cloning."
  },
  {
    slug: "js-mc-lru-cache",
    moduleId: "machine-coding",
    order: 113,
    title: "Build: LRU Cache",
    difficulty: "Intermediate",
    estimatedReadingMin: 12,
    estimatedPracticeMin: 35,
    tags: ["Machine Coding", "Cache", "Map", "Data Structures"],
    introMD: "An LRU cache evicts the least recently used entry when capacity is exceeded. In JavaScript, `Map` preserves insertion order, which lets us implement `get` and `put` in O(1) average time by deleting and reinserting keys to refresh recency.\n\nThis is a popular machine-coding problem because it combines API design, edge cases, and data-structure reasoning.",
    whyItMattersMD: "Caching is used in API clients, image loaders, memoization utilities, data grids, and backend services. Interviewers ask LRU because the naive array solution is easy but not optimal; a Map-based or doubly-linked-list solution demonstrates awareness of O(1) recency updates.",
    theoryMD: "### Map-based recency\n\nA JavaScript `Map` iterates keys in insertion order. Treat the first key as least recently used and the last key as most recently used. On `get(key)`, delete and reinsert the entry so it becomes most recent. On `put(key, value)`, do the same, then evict the first key if size exceeds capacity.\n\n### API decisions\n\nCommon interview APIs are `get(key)` returning value or `-1`, and `put(key, value)` returning nothing. Production APIs may prefer `undefined`, `has`, or explicit result objects to avoid ambiguity when cached values can be `-1`.\n\n### Alternative design\n\nIn languages without ordered maps, use a hash map from key to linked-list node plus a doubly linked list ordered by recency. JavaScript's `Map` gives us that order directly for interview-scale implementations.",
    diagrams: [
      {
        title: "LRU order in a Map",
        ascii: `least recent                         most recent
    |                                      |
    v                                      v
  key A  ->  key B  ->  key C

get(A): delete A, insert A

least recent                         most recent
    |                                      |
    v                                      v
  key B  ->  key C  ->  key A`,
        caption: "Refreshing recency is delete plus set."
      }
    ],
    codeExamples: [
      {
        title: "Complete Map-based LRU cache",
        descriptionMD: "This implementation keeps all operations O(1) on average using Map insertion order.",
        language: "javascript",
        code: `function LRUCache(capacity) {
  if (!Number.isInteger(capacity) || capacity <= 0) {
    throw new TypeError('capacity must be a positive integer');
  }

  this.capacity = capacity;
  this.cache = new Map();
}

LRUCache.prototype.get = function (key) {
  if (!this.cache.has(key)) {
    return -1;
  }

  var value = this.cache.get(key);
  this.cache.delete(key);
  this.cache.set(key, value);
  return value;
};

LRUCache.prototype.put = function (key, value) {
  if (this.cache.has(key)) {
    this.cache.delete(key);
  }

  this.cache.set(key, value);

  if (this.cache.size > this.capacity) {
    var leastRecentKey = this.cache.keys().next().value;
    this.cache.delete(leastRecentKey);
  }
};

LRUCache.prototype.has = function (key) {
  return this.cache.has(key);
};

LRUCache.prototype.size = function () {
  return this.cache.size;
};

LRUCache.prototype.keysLeastToMostRecent = function () {
  return Array.from(this.cache.keys());
};`
      }
    ],
    playground: [
      {
        title: "Observe recency updates",
        descriptionMD: "This runnable snippet shows that reading `a` protects it from eviction.",
        code: `function LRUCache(capacity) {
  this.capacity = capacity;
  this.cache = new Map();
}

LRUCache.prototype.get = function (key) {
  if (!this.cache.has(key)) {
    return -1;
  }

  var value = this.cache.get(key);
  this.cache.delete(key);
  this.cache.set(key, value);
  return value;
};

LRUCache.prototype.put = function (key, value) {
  if (this.cache.has(key)) {
    this.cache.delete(key);
  }

  this.cache.set(key, value);

  if (this.cache.size > this.capacity) {
    this.cache.delete(this.cache.keys().next().value);
  }
};

LRUCache.prototype.keysLeastToMostRecent = function () {
  return Array.from(this.cache.keys());
};

var cache = new LRUCache(2);
cache.put('a', 1);
cache.put('b', 2);
console.log(cache.get('a'));
cache.put('c', 3);
console.log(cache.get('b'));
console.log(cache.keysLeastToMostRecent().join(','));`
      }
    ],
    outputPredictions: [
      {
        code: `function LRUCache(capacity) {
  this.capacity = capacity;
  this.cache = new Map();
}

LRUCache.prototype.get = function (key) {
  if (!this.cache.has(key)) {
    return -1;
  }

  var value = this.cache.get(key);
  this.cache.delete(key);
  this.cache.set(key, value);
  return value;
};

LRUCache.prototype.put = function (key, value) {
  if (this.cache.has(key)) {
    this.cache.delete(key);
  }

  this.cache.set(key, value);

  if (this.cache.size > this.capacity) {
    this.cache.delete(this.cache.keys().next().value);
  }
};

var cache = new LRUCache(2);
cache.put('a', 1);
cache.put('b', 2);
console.log(cache.get('a'));
cache.put('c', 3);
console.log(cache.get('b'));`,
        answer: "1\n-1",
        explanationMD: "`get('a')` refreshes `a`, making `b` least recent. Adding `c` evicts `b`, so the later `get('b')` returns `-1`."
      }
    ],
    codingExercises: [
      {
        title: "Implement an O(1) LRU cache",
        difficulty: "Medium",
        promptMD: "Implement `LRUCache(capacity)`.\n\nRequirements:\n- `capacity` must be a positive integer.\n- `get(key)` returns the value if present, otherwise `-1`.\n- `get` marks the key as most recently used.\n- `put(key, value)` inserts or updates a value.\n- `put` marks the key as most recently used.\n- If capacity is exceeded, evict the least recently used key.\n- Add optional helpers `has`, `size`, and `keysLeastToMostRecent`.\n\nConstraints:\n- Use JavaScript `Map` insertion order.\n- `get` and `put` should be O(1) average time.",
        hints: [
          "In a Map, the first key is the least recently inserted key.",
          "Refreshing recency means deleting and setting the key again.",
          "On overflow, use `map.keys().next().value` to find the least recent key.",
          "Updating an existing key should not count as a separate entry."
        ],
        solutionCode: `function LRUCache(capacity) {
  if (!Number.isInteger(capacity) || capacity <= 0) {
    throw new TypeError('capacity must be a positive integer');
  }

  this.capacity = capacity;
  this.cache = new Map();
}

LRUCache.prototype.get = function (key) {
  if (!this.cache.has(key)) {
    return -1;
  }

  var value = this.cache.get(key);
  this.cache.delete(key);
  this.cache.set(key, value);
  return value;
};

LRUCache.prototype.put = function (key, value) {
  if (this.cache.has(key)) {
    this.cache.delete(key);
  }

  this.cache.set(key, value);

  if (this.cache.size > this.capacity) {
    var leastRecentKey = this.cache.keys().next().value;
    this.cache.delete(leastRecentKey);
  }
};

LRUCache.prototype.has = function (key) {
  return this.cache.has(key);
};

LRUCache.prototype.size = function () {
  return this.cache.size;
};

LRUCache.prototype.keysLeastToMostRecent = function () {
  return Array.from(this.cache.keys());
};`,
        complexity: { time: "O(1) average for get and put", space: "O(capacity)" },
        explanationMD: "The `Map` stores entries from least to most recent. Both `get` and `put` refresh a key by deleting and reinserting it. If insertion exceeds capacity, the first key yielded by `keys()` is the eviction victim."
      }
    ],
    interviewQuestions: [
      {
        question: "How would you implement LRU in a language without ordered maps?",
        answerMD: "Use a hash map from key to doubly-linked-list node. The list stores recency order. `get` and `put` move nodes to the tail in O(1), and eviction removes the head in O(1).",
        companies: ["Amazon", "Google", "Microsoft"],
        followUps: ["How would you make it thread-safe?", "How would you add TTL expiration?"]
      },
      {
        question: "Why does updating an existing key delete first?",
        answerMD: "Setting an existing key in a Map updates its value but does not move it to the end. Deleting then setting refreshes insertion order so the key becomes most recent."
      }
    ],
    quiz: [
      {
        question: "After `get(key)` succeeds in an LRU cache, what should happen to that key?",
        options: [
          "It should be removed",
          "It should become the most recently used key",
          "It should become the least recently used key",
          "Nothing should ever change on reads"
        ],
        correctIndex: 1,
        explanationMD: "A successful read counts as use, so the key must be refreshed to most recent."
      }
    ],
    summary: [
      "An LRU cache evicts the least recently used entry on overflow.",
      "JavaScript `Map` preserves insertion order, enabling a compact O(1) average implementation.",
      "Refresh recency with delete plus set.",
      "The first Map key is the eviction candidate."
    ],
    cheatSheetMD: "**LRU checklist**\n\n- Validate positive capacity.\n- Data: `Map` from key to value.\n- Most recent = last inserted.\n- `get`: missing -> `-1`; hit -> delete, set, return value.\n- `put`: delete existing, set new value.\n- Overflow: delete `map.keys().next().value`.\n- Complexity: O(1) average time, O(capacity) space."
  },
  {
    slug: "js-mc-mini-vdom",
    moduleId: "machine-coding",
    order: 114,
    title: "Build: Mini Virtual DOM",
    difficulty: "Advanced",
    estimatedReadingMin: 16,
    estimatedPracticeMin: 55,
    tags: ["Machine Coding", "Virtual DOM", "Diffing", "Rendering"],
    introMD: "A mini virtual DOM challenge asks you to model UI as plain JavaScript objects, render that tree, and compute differences between two trees. The interview goal is not to rebuild React; it is to demonstrate tree representation, recursion, escaping, props comparison, and patch generation.\n\nThis version stays worker-safe by rendering to strings and producing plain-object patches instead of touching the real DOM.",
    whyItMattersMD: "Virtual DOM questions test whether you understand the ideas behind modern UI libraries: declarative trees, pure render output, reconciliation, keys, and patching. A compact implementation gives you vocabulary for discussing React without hand-waving.",
    theoryMD: "### Virtual node shape\n\nA virtual node can be represented as `{ type, props, children }`. Text nodes are just strings or numbers. The helper `h(type, props, ...children)` flattens children and removes empty values.\n\n### Rendering\n\nRendering to a string is a pure version of DOM rendering. Escape text and attribute values to prevent HTML injection. Boolean attributes can be rendered by name when true and omitted when false.\n\n### Diffing\n\nA basic diff compares node pairs at the same path. If one side is missing, create or remove. If primitive text differs, emit a text patch. If element type differs, replace. If type matches, diff props and recurse into children.\n\n### Follow-up: keys\n\nThis simple diff compares children by index. Real libraries use keys to detect moves and preserve component state across reorderings. Mentioning keyed diffing is an important follow-up in interviews.",
    diagrams: [
      {
        title: "Virtual DOM pipeline",
        ascii: `h calls
  |
  v
virtual tree
  |
  +--> renderToString -> HTML string
  |
  +--> diff old tree vs new tree -> patch list`,
        caption: "The tree is plain data, so rendering and diffing can be pure functions."
      }
    ],
    codeExamples: [
      {
        title: "Complete mini virtual DOM",
        descriptionMD: "The implementation is intentionally pure: no `document`, no real DOM, and no framework dependencies.",
        language: "javascript",
        code: `function h(type, props) {
  var children = [];

  function addChild(child) {
    if (Array.isArray(child)) {
      child.forEach(addChild);
      return;
    }

    if (child === null || child === undefined || child === false) {
      return;
    }

    children.push(child);
  }

  for (var index = 2; index < arguments.length; index += 1) {
    addChild(arguments[index]);
  }

  return {
    type: type,
    props: props || {},
    children: children
  };
}

function escapeHtml(value) {
  var entities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return String(value).replace(/[&<>"']/g, function (char) {
    return entities[char];
  });
}

function renderProps(props) {
  var output = '';

  Object.keys(props || {}).forEach(function (key) {
    var value = props[key];

    if (key === 'children' || value === false || value === null || value === undefined) {
      return;
    }

    if (value === true) {
      output += ' ' + key;
      return;
    }

    output += ' ' + key + '="' + escapeHtml(value) + '"';
  });

  return output;
}

function renderToString(node) {
  if (node === null || node === undefined || node === false) {
    return '';
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return escapeHtml(node);
  }

  var html = '<' + node.type + renderProps(node.props) + '>';

  node.children.forEach(function (child) {
    html += renderToString(child);
  });

  html += '</' + node.type + '>';
  return html;
}

function diffProps(oldProps, newProps) {
  var changes = {};
  var keys = {};

  Object.keys(oldProps || {}).forEach(function (key) {
    keys[key] = true;
  });

  Object.keys(newProps || {}).forEach(function (key) {
    keys[key] = true;
  });

  Object.keys(keys).forEach(function (key) {
    var oldValue = oldProps ? oldProps[key] : undefined;
    var newValue = newProps ? newProps[key] : undefined;

    if (!Object.is(oldValue, newValue)) {
      changes[key] = newValue;
    }
  });

  return changes;
}

function diff(oldNode, newNode, path) {
  var currentPath = path || 'root';
  var patches = [];

  if (oldNode === undefined || oldNode === null) {
    patches.push({ type: 'CREATE', path: currentPath, node: newNode });
    return patches;
  }

  if (newNode === undefined || newNode === null) {
    patches.push({ type: 'REMOVE', path: currentPath });
    return patches;
  }

  var oldIsText = typeof oldNode === 'string' || typeof oldNode === 'number';
  var newIsText = typeof newNode === 'string' || typeof newNode === 'number';

  if (oldIsText || newIsText) {
    if (oldNode !== newNode) {
      patches.push({ type: 'TEXT', path: currentPath, value: newNode });
    }
    return patches;
  }

  if (oldNode.type !== newNode.type) {
    patches.push({ type: 'REPLACE', path: currentPath, node: newNode });
    return patches;
  }

  var propChanges = diffProps(oldNode.props, newNode.props);

  if (Object.keys(propChanges).length > 0) {
    patches.push({ type: 'PROPS', path: currentPath, props: propChanges });
  }

  var maxChildren = Math.max(oldNode.children.length, newNode.children.length);

  for (var index = 0; index < maxChildren; index += 1) {
    patches = patches.concat(diff(
      oldNode.children[index],
      newNode.children[index],
      currentPath + '.' + index
    ));
  }

  return patches;
}`
      }
    ],
    playground: [
      {
        title: "Render and diff virtual nodes",
        descriptionMD: "This is pure JavaScript and safe for the Web Worker playground.",
        code: `function h(type, props) {
  var children = [];

  function add(child) {
    if (Array.isArray(child)) {
      child.forEach(add);
    } else if (child !== null && child !== undefined && child !== false) {
      children.push(child);
    }
  }

  for (var index = 2; index < arguments.length; index += 1) {
    add(arguments[index]);
  }

  return { type: type, props: props || {}, children: children };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (char) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char];
  });
}

function renderProps(props) {
  var output = '';
  Object.keys(props || {}).forEach(function (key) {
    var value = props[key];
    if (value === false || value === null || value === undefined) {
      return;
    }
    output += ' ' + key + '="' + escapeHtml(value) + '"';
  });
  return output;
}

function renderToString(node) {
  if (typeof node === 'string' || typeof node === 'number') {
    return escapeHtml(node);
  }

  var html = '<' + node.type + renderProps(node.props) + '>';
  node.children.forEach(function (child) {
    html += renderToString(child);
  });
  return html + '</' + node.type + '>';
}

function diffProps(oldProps, newProps) {
  var changes = {};
  var keys = {};
  Object.keys(oldProps || {}).forEach(function (key) { keys[key] = true; });
  Object.keys(newProps || {}).forEach(function (key) { keys[key] = true; });
  Object.keys(keys).forEach(function (key) {
    if (!Object.is(oldProps[key], newProps[key])) {
      changes[key] = newProps[key];
    }
  });
  return changes;
}

function diff(oldNode, newNode, path) {
  var currentPath = path || 'root';
  var patches = [];

  if (!oldNode) {
    return [{ type: 'CREATE', path: currentPath, node: newNode }];
  }

  if (!newNode) {
    return [{ type: 'REMOVE', path: currentPath }];
  }

  if (typeof oldNode === 'string' || typeof newNode === 'string') {
    return oldNode === newNode ? [] : [{ type: 'TEXT', path: currentPath, value: newNode }];
  }

  if (oldNode.type !== newNode.type) {
    return [{ type: 'REPLACE', path: currentPath, node: newNode }];
  }

  var propChanges = diffProps(oldNode.props, newNode.props);
  if (Object.keys(propChanges).length > 0) {
    patches.push({ type: 'PROPS', path: currentPath, props: propChanges });
  }

  var max = Math.max(oldNode.children.length, newNode.children.length);
  for (var index = 0; index < max; index += 1) {
    patches = patches.concat(diff(oldNode.children[index], newNode.children[index], currentPath + '.' + index));
  }
  return patches;
}

var oldTree = h('ul', { id: 'list' }, h('li', { class: 'item' }, 'A'));
var newTree = h('ul', { id: 'list' }, h('li', { class: 'item active' }, 'A'), h('li', null, 'B'));
console.log(renderToString(newTree));
console.log(diff(oldTree, newTree).map(function (patch) {
  return patch.type + ':' + patch.path;
}).join('|'));`
      }
    ],
    outputPredictions: [
      {
        code: `function h(type, props) {
  var children = [];
  for (var index = 2; index < arguments.length; index += 1) {
    children.push(arguments[index]);
  }
  return { type: type, props: props || {}, children: children };
}

function diff(oldNode, newNode, path) {
  var currentPath = path || 'root';

  if (!oldNode) {
    return [{ type: 'CREATE', path: currentPath }];
  }

  if (!newNode) {
    return [{ type: 'REMOVE', path: currentPath }];
  }

  var oldIsText = typeof oldNode === 'string' || typeof oldNode === 'number';
  var newIsText = typeof newNode === 'string' || typeof newNode === 'number';

  if (oldIsText || newIsText) {
    return oldNode === newNode ? [] : [{ type: 'TEXT', path: currentPath }];
  }

  if (oldNode.type !== newNode.type) {
    return [{ type: 'REPLACE', path: currentPath }];
  }

  var patches = [];
  var oldClass = oldNode.props.class;
  var newClass = newNode.props.class;

  if (oldClass !== newClass) {
    patches.push({ type: 'PROPS', path: currentPath });
  }

  var max = Math.max(oldNode.children.length, newNode.children.length);
  for (var index = 0; index < max; index += 1) {
    patches = patches.concat(diff(oldNode.children[index], newNode.children[index], currentPath + '.' + index));
  }

  return patches;
}

var oldTree = h('ul', {}, h('li', { class: 'item' }, 'A'));
var newTree = h('ul', {}, h('li', { class: 'active' }, 'A'), h('li', {}, 'B'));
console.log(diff(oldTree, newTree).map(function (patch) {
  return patch.type + ':' + patch.path;
}).join('|'));`,
        answer: "PROPS:root.0|CREATE:root.1",
        explanationMD: "The first `li` keeps the same type but changes props, and the second `li` exists only in the new tree, so it is a create patch."
      }
    ],
    codingExercises: [
      {
        title: "Implement a mini virtual DOM",
        difficulty: "Hard",
        promptMD: "Build a pure mini virtual DOM.\n\nRequirements:\n- `h(type, props, ...children)` returns a virtual node and flattens nested child arrays.\n- Ignore `null`, `undefined`, and `false` children.\n- `renderToString(node)` returns escaped HTML.\n- Boolean true props render as attributes without values.\n- False, null, and undefined props are omitted.\n- `diff(oldNode, newNode)` returns patches with paths.\n- Patches should cover create, remove, replace, text, and props changes.\n\nConstraints:\n- Do not use the real DOM.\n- Do not use a framework.\n- Keep the implementation pure and runnable in a worker.",
        hints: [
          "Represent text nodes as strings or numbers.",
          "Escape both text content and attribute values.",
          "Diff node pairs recursively at a path like `root.0.1`.",
          "Index-based child diffing is acceptable; discuss keys as a follow-up."
        ],
        solutionCode: `function h(type, props) {
  var children = [];

  function addChild(child) {
    if (Array.isArray(child)) {
      child.forEach(addChild);
      return;
    }

    if (child === null || child === undefined || child === false) {
      return;
    }

    children.push(child);
  }

  for (var index = 2; index < arguments.length; index += 1) {
    addChild(arguments[index]);
  }

  return {
    type: type,
    props: props || {},
    children: children
  };
}

function escapeHtml(value) {
  var entities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return String(value).replace(/[&<>"']/g, function (char) {
    return entities[char];
  });
}

function renderProps(props) {
  var output = '';

  Object.keys(props || {}).forEach(function (key) {
    var value = props[key];

    if (key === 'children' || value === false || value === null || value === undefined) {
      return;
    }

    if (value === true) {
      output += ' ' + key;
      return;
    }

    output += ' ' + key + '="' + escapeHtml(value) + '"';
  });

  return output;
}

function renderToString(node) {
  if (node === null || node === undefined || node === false) {
    return '';
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return escapeHtml(node);
  }

  var html = '<' + node.type + renderProps(node.props) + '>';

  node.children.forEach(function (child) {
    html += renderToString(child);
  });

  html += '</' + node.type + '>';
  return html;
}

function diffProps(oldProps, newProps) {
  var changes = {};
  var keys = {};

  Object.keys(oldProps || {}).forEach(function (key) {
    keys[key] = true;
  });

  Object.keys(newProps || {}).forEach(function (key) {
    keys[key] = true;
  });

  Object.keys(keys).forEach(function (key) {
    var oldValue = oldProps ? oldProps[key] : undefined;
    var newValue = newProps ? newProps[key] : undefined;

    if (!Object.is(oldValue, newValue)) {
      changes[key] = newValue;
    }
  });

  return changes;
}

function diff(oldNode, newNode, path) {
  var currentPath = path || 'root';
  var patches = [];

  if (oldNode === undefined || oldNode === null) {
    patches.push({ type: 'CREATE', path: currentPath, node: newNode });
    return patches;
  }

  if (newNode === undefined || newNode === null) {
    patches.push({ type: 'REMOVE', path: currentPath });
    return patches;
  }

  var oldIsText = typeof oldNode === 'string' || typeof oldNode === 'number';
  var newIsText = typeof newNode === 'string' || typeof newNode === 'number';

  if (oldIsText || newIsText) {
    if (oldNode !== newNode) {
      patches.push({ type: 'TEXT', path: currentPath, value: newNode });
    }
    return patches;
  }

  if (oldNode.type !== newNode.type) {
    patches.push({ type: 'REPLACE', path: currentPath, node: newNode });
    return patches;
  }

  var propChanges = diffProps(oldNode.props, newNode.props);

  if (Object.keys(propChanges).length > 0) {
    patches.push({ type: 'PROPS', path: currentPath, props: propChanges });
  }

  var maxChildren = Math.max(oldNode.children.length, newNode.children.length);

  for (var index = 0; index < maxChildren; index += 1) {
    patches = patches.concat(diff(
      oldNode.children[index],
      newNode.children[index],
      currentPath + '.' + index
    ));
  }

  return patches;
}`,
        complexity: { time: "render O(n), diff O(n + p) where n is nodes and p is prop count", space: "O(n) for rendered output or patch list" },
        explanationMD: "`h` creates a plain tree. `renderToString` escapes text and props, so rendering is deterministic and safe. `diff` walks old and new trees at matching paths and emits patches for structural, text, type, and prop changes. The simple child diff is index-based; keyed reconciliation is the natural production follow-up."
      }
    ],
    interviewQuestions: [
      {
        question: "Why do real virtual DOM libraries use keys?",
        answerMD: "Keys let the diff algorithm match logical children across reorders, insertions, and deletions. Without keys, index-based diffing may replace or mutate the wrong child and can lose component state.",
        companies: ["Meta", "Google"],
        followUps: ["How would you implement keyed child diffing?", "How does React Fiber change scheduling?"]
      },
      {
        question: "Why escape text and attribute values in `renderToString`?",
        answerMD: "Rendering user-controlled strings without escaping can create HTML injection or XSS vulnerabilities. Escaping turns special characters into safe entities."
      }
    ],
    quiz: [
      {
        question: "What patch should be emitted when two virtual nodes have different `type` values at the same path?",
        options: ["TEXT", "PROPS", "REPLACE", "No patch"],
        correctIndex: 2,
        explanationMD: "If element types differ, the simplest correct patch is to replace the old subtree with the new one."
      }
    ],
    summary: [
      "A virtual DOM tree is plain data: type, props, and children.",
      "`renderToString` should escape text and attribute values.",
      "A basic diff handles create, remove, replace, text, and prop patches.",
      "Index-based child diffing is simple; keyed diffing is the production follow-up."
    ],
    cheatSheetMD: "**Mini VDOM checklist**\n\n- `h(type, props, ...children)` builds plain nodes.\n- Flatten child arrays; ignore null, undefined, false.\n- Text nodes can be strings or numbers.\n- Escape HTML in text and attributes.\n- Render boolean true attributes by name.\n- Diff paths like `root.0.1`.\n- Cases: create, remove, text, replace, props.\n- Mention keys for reorder-aware reconciliation."
  }
];
