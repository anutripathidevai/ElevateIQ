/**
 * Assembles the authored LLD content into the two lookup maps the content-api
 * consumes. Adding a published problem/concept = author a content file and add
 * one line here; the registry entry flips to `status: "published"` and the
 * dynamic route picks it up automatically.
 *
 * Prose fields are Markdown; `code` / `implementation[].content` / mermaid
 * strings hold Java or diagram source and are exempt from the content test's
 * template-literal-safe prose checks.
 */
import type { LLDConceptContent, LLDProblemContent } from "../types";

// ── Problems ────────────────────────────────────────────────────────────────
import { parkingLot } from "./parking-lot";
import { vendingMachine } from "./vending-machine";
import { coffeeMachine } from "./coffee-machine";
import { atm } from "./atm";
import { ticTacToe } from "./tic-tac-toe";
import { snakeAndLadder } from "./snake-and-ladder";
import { elevatorSystem } from "./elevator-system";
import { lruCache } from "./lru-cache";

// ── Concepts ────────────────────────────────────────────────────────────────
import { oopFundamentals } from "./oop-fundamentals";
import { solidPrinciples } from "./solid-principles";
import { designPrinciples } from "./design-principles";

/** Full design-problem content, keyed by catalog slug. */
export const LLD_PROBLEM_CONTENT: Record<string, LLDProblemContent> = {
  [parkingLot.slug]: parkingLot,
  [vendingMachine.slug]: vendingMachine,
  [coffeeMachine.slug]: coffeeMachine,
  [atm.slug]: atm,
  [ticTacToe.slug]: ticTacToe,
  [snakeAndLadder.slug]: snakeAndLadder,
  [elevatorSystem.slug]: elevatorSystem,
  [lruCache.slug]: lruCache,
};

/** Theory-concept content, keyed by catalog slug. */
export const LLD_CONCEPT_CONTENT: Record<string, LLDConceptContent> = {
  [oopFundamentals.slug]: oopFundamentals,
  [solidPrinciples.slug]: solidPrinciples,
  [designPrinciples.slug]: designPrinciples,
};
