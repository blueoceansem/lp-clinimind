import { describe, expect, it } from "vitest";
import { buildRecommendation, QUESTIONS, type DifficultyId, type GoalId, type ProfileId } from "@/lib/quiz";

const profiles: ProfileId[] = ["vestibular", "estudante", "internato", "pre_residencia"];
const goals: GoalId[] = ["entender", "revisar", "questoes", "caso"];
const difficulties: DifficultyId[] = ["inicio", "tempo", "entender", "lembrar", "aplicar"];

describe("personalized study plan", () => {
  it("keeps the existing three quiz questions", () => {
    expect(QUESTIONS.map((question) => question.id)).toEqual(["profile", "goal", "difficulty"]);
  });

  it("returns exactly three tool-linked steps for every answer combination", () => {
    for (const profile of profiles) for (const goal of goals) for (const difficulty of difficulties) {
      const result = buildRecommendation({ profile, goal, difficulty });
      expect(result.steps).toHaveLength(3);
      for (const step of result.steps) {
        expect(step.tool_id).toBeTruthy();
        expect(step.text.length).toBeGreaterThan(60);
      }
    }
  });

  it("uses questions first for a time-constrained revision plan", () => {
    const result = buildRecommendation({ profile: "pre_residencia", goal: "revisar", difficulty: "tempo" });
    expect(result.steps[0]?.tool_id).toBe("questoes");
    expect(result.steps[2]?.tool_id).toBe("referencias");
  });

  it("uses clinical cases when that is the selected goal", () => {
    const result = buildRecommendation({ profile: "internato", goal: "caso", difficulty: "aplicar" });
    expect(result.steps[0]?.tool_id).toBe("casos");
    expect(result.feature).toBe("casos");
  });

  it("includes anatomy in a plan for difficulty understanding content", () => {
    const result = buildRecommendation({ profile: "estudante", goal: "entender", difficulty: "entender" });
    expect(result.steps.some((step) => step.tool_id === "anatomia")).toBe(true);
  });
});
