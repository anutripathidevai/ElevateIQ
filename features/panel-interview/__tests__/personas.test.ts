import { describe, expect, it } from "vitest";
import {
  PANEL_PERSONAS,
  PANEL_PERSONA_ORDER,
  getPersona,
  listPersonas,
} from "../personas";
import { fallbackPersonaQuestion } from "../ai/interviewer";
import { PERSONA_IDS } from "../types";

describe("panel personas", () => {
  it("defines exactly the three expected personas", () => {
    expect(PANEL_PERSONA_ORDER).toEqual([
      "hiring_manager",
      "senior_engineer",
      "principal_engineer",
    ]);
  });

  it("every persona is fully specified", () => {
    for (const id of PERSONA_IDS) {
      const p = PANEL_PERSONAS[id];
      expect(p.id).toBe(id);
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.goals.length).toBeGreaterThan(0);
      expect(p.evaluationCriteria.length).toBeGreaterThan(0);
      expect(p.seedQuestions.length).toBeGreaterThan(0);
    }
  });

  it("listPersonas returns personas in panel order", () => {
    expect(listPersonas().map((p) => p.id)).toEqual(PANEL_PERSONA_ORDER);
  });

  it("getPersona resolves by id", () => {
    expect(getPersona("principal_engineer").title).toBe("Principal Engineer");
  });
});

describe("fallbackPersonaQuestion", () => {
  it("cycles through the persona's seed bank", () => {
    const persona = PANEL_PERSONAS.senior_engineer;
    const bank = persona.seedQuestions;
    expect(fallbackPersonaQuestion(persona, 0)).toBe(bank[0]);
    expect(fallbackPersonaQuestion(persona, 1)).toBe(bank[1]);
    // Wraps around when the count exceeds the bank size.
    expect(fallbackPersonaQuestion(persona, bank.length)).toBe(bank[0]);
  });
});
