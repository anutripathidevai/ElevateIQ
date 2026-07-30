import { describe, expect, it } from "vitest";
import {
  averageScore,
  countInterviewerTurns,
  formatTranscript,
  heuristicScorecard,
  nextPersona,
  personaForTurn,
  personaQuestionCount,
  verdictFromScore,
} from "../utils";
import { PANEL_PERSONA_ORDER } from "../personas";
import { COMPETENCIES, type PanelTurn } from "../types";

describe("persona rotation", () => {
  it("assigns personas round-robin by interviewer-turn index", () => {
    expect(personaForTurn(0)).toBe("hiring_manager");
    expect(personaForTurn(1)).toBe("senior_engineer");
    expect(personaForTurn(2)).toBe("principal_engineer");
    expect(personaForTurn(3)).toBe("hiring_manager");
  });

  it("handles negative indices safely", () => {
    expect(personaForTurn(-1)).toBe(PANEL_PERSONA_ORDER[2]);
  });

  it("counts only interviewer turns", () => {
    const transcript: PanelTurn[] = [
      { speaker: "hiring_manager", content: "Q1" },
      { speaker: "candidate", content: "A1" },
      { speaker: "senior_engineer", content: "Q2" },
    ];
    expect(countInterviewerTurns(transcript)).toBe(2);
  });

  it("nextPersona picks the interviewer after the candidate answers", () => {
    // Opening (hiring_manager) asked, candidate answered → senior is next.
    const transcript: PanelTurn[] = [
      { speaker: "hiring_manager", content: "Q1" },
      { speaker: "candidate", content: "A1" },
    ];
    expect(nextPersona(transcript)).toBe("senior_engineer");
  });

  it("opening question comes from the hiring manager", () => {
    expect(nextPersona([])).toBe("hiring_manager");
  });

  it("counts how many questions a persona has asked", () => {
    const transcript: PanelTurn[] = [
      { speaker: "hiring_manager", content: "Q1" },
      { speaker: "candidate", content: "A1" },
      { speaker: "senior_engineer", content: "Q2" },
      { speaker: "candidate", content: "A2" },
      { speaker: "hiring_manager", content: "Q3" },
    ];
    expect(personaQuestionCount(transcript, "hiring_manager")).toBe(2);
    expect(personaQuestionCount(transcript, "senior_engineer")).toBe(1);
    expect(personaQuestionCount(transcript, "principal_engineer")).toBe(0);
  });
});

describe("verdictFromScore", () => {
  it("maps averages to verdict bands", () => {
    expect(verdictFromScore(4.5)).toBe("strong_hire");
    expect(verdictFromScore(3.8)).toBe("hire");
    expect(verdictFromScore(3.0)).toBe("lean_hire");
    expect(verdictFromScore(2.0)).toBe("no_hire");
  });

  it("respects the band boundaries", () => {
    expect(verdictFromScore(4.3)).toBe("strong_hire");
    expect(verdictFromScore(3.5)).toBe("hire");
    expect(verdictFromScore(2.75)).toBe("lean_hire");
    expect(verdictFromScore(2.74)).toBe("no_hire");
  });
});

describe("averageScore", () => {
  it("returns 0 for an empty list", () => {
    expect(averageScore([])).toBe(0);
  });

  it("averages the provided scores", () => {
    expect(averageScore([2, 4])).toBe(3);
    expect(averageScore([5, 5, 5])).toBe(5);
  });
});

describe("formatTranscript", () => {
  it("labels candidate and persona turns", () => {
    const transcript: PanelTurn[] = [
      { speaker: "hiring_manager", content: "Why this team?" },
      { speaker: "candidate", content: "Because of the mission." },
    ];
    const text = formatTranscript(transcript);
    expect(text).toContain("Hiring Manager");
    expect(text).toContain("Why this team?");
    expect(text).toContain("Candidate: Because of the mission.");
  });
});

describe("heuristicScorecard", () => {
  it("returns a baseline for an empty transcript flagged as non-AI", () => {
    const result = heuristicScorecard({ transcript: [] });
    expect(result.aiGenerated).toBe(false);
    expect(result.competencyScores).toHaveLength(COMPETENCIES.length);
    expect(result.interviewerFeedback).toHaveLength(PANEL_PERSONA_ORDER.length);
    expect(result.improvementPlan.length).toBeGreaterThan(0);
  });

  it("rewards deeper, broader engagement with a higher score", () => {
    const longAnswer = "word ".repeat(80).trim();
    const engaged: PanelTurn[] = [
      { speaker: "hiring_manager", content: "Q1" },
      { speaker: "candidate", content: longAnswer },
      { speaker: "senior_engineer", content: "Q2" },
      { speaker: "candidate", content: longAnswer },
      { speaker: "principal_engineer", content: "Q3" },
      { speaker: "candidate", content: longAnswer },
      { speaker: "hiring_manager", content: "Q4" },
      { speaker: "candidate", content: longAnswer },
    ];
    const sparse: PanelTurn[] = [
      { speaker: "hiring_manager", content: "Q1" },
      { speaker: "candidate", content: "ok" },
    ];
    const engagedScore = heuristicScorecard({ transcript: engaged })
      .competencyScores[0].score;
    const sparseScore = heuristicScorecard({ transcript: sparse })
      .competencyScores[0].score;
    expect(engagedScore).toBeGreaterThan(sparseScore);
  });

  it("keeps scores within the 1-5 range", () => {
    const longAnswer = "word ".repeat(200).trim();
    const transcript: PanelTurn[] = Array.from({ length: 6 }).flatMap(
      (_, i) => [
        { speaker: PANEL_PERSONA_ORDER[i % 3], content: `Q${i}` },
        { speaker: "candidate" as const, content: longAnswer },
      ],
    );
    for (const c of heuristicScorecard({ transcript }).competencyScores) {
      expect(c.score).toBeGreaterThanOrEqual(1);
      expect(c.score).toBeLessThanOrEqual(5);
    }
  });
});
