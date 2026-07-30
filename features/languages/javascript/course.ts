import type { CourseMeta } from "../types";

/** Landing-page metadata for the JavaScript interview course. */
export const JS_COURSE: CourseMeta = {
  language: "javascript",
  title: "JavaScript Interview Mastery",
  subtitle:
    "Learn JavaScript the way it's actually interviewed — intuition first, then theory, then hands-on machine coding — built for Senior and Staff engineer interviews.",
  descriptionMD:
    "A premium, interview-focused JavaScript course — not a generic tutorial. You will learn JavaScript from the ground up while relentlessly focusing on the concepts, output-prediction puzzles, and machine-coding rounds that companies like Microsoft, Google, Amazon, Meta, Netflix, and Uber actually test. Every topic teaches the *why* first, then the mechanics, then hands-on practice in an in-browser playground.",
  objectives: [
    "Explain how the JavaScript engine, runtime, and event loop actually execute your code",
    "Reason confidently about scope, closures, hoisting, and the temporal dead zone",
    "Master asynchronous JavaScript — promises, microtasks, and async/await",
    "Predict the output of tricky snippets the way interviewers expect",
    "Implement classic machine-coding problems: debounce, throttle, currying, deep clone, polyfills",
    "Apply prototypes, `this` binding, and ES6+ features fluently under interview pressure",
  ],
  skills: [
    "Event Loop",
    "Closures",
    "Prototypes",
    "Async/Await",
    "Promises",
    "ES6+",
    "this binding",
    "Currying",
    "Debounce/Throttle",
    "Polyfills",
    "Design Patterns",
    "Machine Coding",
  ],
  estimatedHours: 40,
};
