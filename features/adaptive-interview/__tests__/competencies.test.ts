import { describe, it, expect } from "vitest";
import type { TrackKey } from "@prisma/client";
import {
  getFramework,
  getCompetency,
  competencyIds,
  TRACK_COMPETENCIES,
} from "../competencies";
import { SENIORITY_LEVELS, DIFFICULTIES } from "../types";

const TRACKS = Object.keys(TRACK_COMPETENCIES) as TrackKey[];

describe("competency framework integrity", () => {
  it("defines the four interview tracks", () => {
    expect(TRACKS.sort()).toEqual(
      ["BEHAVIORAL", "DSA", "LLD", "SYSTEM_DESIGN"].sort(),
    );
  });

  for (const track of TRACKS) {
    describe(track, () => {
      it("has unique competency ids", () => {
        const ids = competencyIds(track);
        expect(new Set(ids).size).toBe(ids.length);
        expect(ids.length).toBeGreaterThanOrEqual(4);
      });

      it("every competency has concepts and a full difficulty ladder", () => {
        for (const c of TRACK_COMPETENCIES[track]) {
          expect(c.id).toMatch(/^[a-z_]+$/);
          expect(c.name.length).toBeGreaterThan(0);
          expect(c.expectedConcepts.length).toBeGreaterThan(0);
          for (const d of DIFFICULTIES) {
            expect(c.questionBank[d]?.length ?? 0).toBeGreaterThan(0);
          }
        }
      });

      it("getCompetency resolves every id and rejects unknowns", () => {
        for (const id of competencyIds(track)) {
          expect(getCompetency(track, id)?.id).toBe(id);
        }
        expect(getCompetency(track, "does_not_exist")).toBeUndefined();
      });

      for (const seniority of SENIORITY_LEVELS) {
        it(`resolves a normalized framework for ${seniority}`, () => {
          const fw = getFramework(track, seniority);
          expect(fw.competencies.length).toBeGreaterThanOrEqual(4);
          expect(DIFFICULTIES).toContain(fw.baselineDifficulty);
          expect(fw.plannedQuestions).toBeGreaterThanOrEqual(4);

          // Every competency has a weight; weights sum to ~1.
          const sum = fw.competencies.reduce(
            (s, c) => s + (fw.weights[c.id] ?? 0),
            0,
          );
          expect(sum).toBeCloseTo(1, 5);
          for (const c of fw.competencies) {
            expect(fw.weights[c.id]).toBeGreaterThan(0);
          }
        });
      }
    });
  }
});
