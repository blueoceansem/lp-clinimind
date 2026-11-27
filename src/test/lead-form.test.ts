import { describe, expect, it } from "vitest";
import { leadInputSchema } from "@/lib/leads.functions";
import { QUESTIONS } from "@/lib/quiz";

const base = {
  submission_id: "sub-test-0001",
  name: "Maria Souza",
  email: "maria@exemplo.com",
  whatsapp: "(11) 99999-1234",
  whatsapp_country: "BR",
  profile: "internato",
  goal: "revisar",
  difficulty: "tempo",
  recommendation_id: "rec-revisar-tempo",
  quiz_attempt_id: "att-test-0001",
  entry_point: "quiz_direto",
  marketing_consent: false,
  privacy_version: "privacy-v1",
  page_version: "page-v1",
  form_elapsed_ms: 4200,
  website: "",
};

describe("lead form requires a WhatsApp number", () => {
  it.each([...QUESTIONS[0].options.map(({ id }) => id), "internato"])("accepts a complete submission for profile %s", (profile) => {
    expect(leadInputSchema.safeParse({ ...base, profile }).success).toBe(true);
  });

  it("rejects a submission without the whatsapp field", () => {
    const { whatsapp: _whatsapp, ...withoutWhatsapp } = base;
    expect(leadInputSchema.safeParse(withoutWhatsapp).success).toBe(false);
  });

  it("rejects an empty or whitespace-only whatsapp", () => {
    expect(leadInputSchema.safeParse({ ...base, whatsapp: "" }).success).toBe(false);
    expect(leadInputSchema.safeParse({ ...base, whatsapp: "   " }).success).toBe(false);
  });

  it("still rejects structurally invalid whatsapp values", () => {
    expect(leadInputSchema.safeParse({ ...base, whatsapp: "(11) 9999-1234" }).success).toBe(true);
    expect(leadInputSchema.safeParse({ ...base, whatsapp: "abc-def-1234" }).success).toBe(false);
  });
});
