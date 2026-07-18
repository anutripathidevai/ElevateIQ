import type { Topic } from "../../types";
import { TOPICS as M1 } from "./module-01-fundamentals";
import { TOPICS as M2 } from "./module-02-variables-data-types";
import { TOPICS as M3 } from "./module-03-scope-closures";

/**
 * All authored JavaScript topics, concatenated in module order. Unauthored
 * (coming-soon) modules contribute nothing here, so this list only ever holds
 * real, renderable pages.
 */
export const JS_TOPICS: Topic[] = [...M1, ...M2, ...M3];
