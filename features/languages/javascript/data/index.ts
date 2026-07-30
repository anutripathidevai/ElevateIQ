import type { Topic } from "../../types";
import { TOPICS as M1 } from "./module-01-fundamentals";
import { TOPICS as M2 } from "./module-02-variables-data-types";
import { TOPICS as M3 } from "./module-03-scope-closures";
import { TOPICS as M4 } from "./module-04-execution-context-hoisting";
import { TOPICS as M5 } from "./module-05-functions";
import { TOPICS as M6 } from "./module-06-objects-prototypes";
import { TOPICS as M7 } from "./module-07-this-keyword";
import { TOPICS as M8 } from "./module-08-async-javascript";
import { TOPICS as M9 } from "./module-09-promises";
import { TOPICS as M10 } from "./module-10-es6-features";
import { TOPICS as M11 } from "./module-11-advanced";
import { TOPICS as M12 } from "./module-12-browser-apis";
import { TOPICS as M13 } from "./module-13-design-patterns";
import { TOPICS as M14 } from "./module-14-machine-coding";

/**
 * All authored JavaScript topics, concatenated in module order. Every module in
 * the 14-module curriculum is now authored, so this list holds the complete set
 * of renderable topic pages.
 */
export const JS_TOPICS: Topic[] = [
  ...M1,
  ...M2,
  ...M3,
  ...M4,
  ...M5,
  ...M6,
  ...M7,
  ...M8,
  ...M9,
  ...M10,
  ...M11,
  ...M12,
  ...M13,
  ...M14,
];
