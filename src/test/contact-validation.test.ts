import { describe, expect, it } from "vitest";
import { formatWhatsApp, validateEmail, validateWhatsApp } from "@/lib/contact-validation";

describe("contact validation", () => {
  it("normalizes a personal email without rejecting it", () => {
    expect(validateEmail("  Estudante@Gmail.com ")).toEqual({ ok: true, email: "estudante@gmail.com", domain: "gmail.com" });
  });

  it("accepts academic email domains", () => {
    expect(validateEmail("aluno@medicina.universidade.edu.br")).toEqual({ ok: true, email: "aluno@medicina.universidade.edu.br", domain: "medicina.universidade.edu.br" });
  });

  it("identifies the requested gmal.com typo", () => {
    const result = validateEmail("aluno@gmal.com");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toContain("gmail.com");
  });

  it("blocks disposable email domains", () => {
    expect(validateEmail("aluno@mailinator.com").ok).toBe(false);
  });

  it("formats and stores a Brazilian WhatsApp number as E.164", () => {
    expect(formatWhatsApp("BR", "11987651234")).toBe("(11) 98765-1234");
    expect(validateWhatsApp("BR", "(11) 98765-1234")).toEqual({ ok: true, e164: "+5511987651234", country: "BR" });
  });

  it("rejects repeated WhatsApp digits", () => {
    expect(validateWhatsApp("BR", "(11) 99999-9999").ok).toBe(false);
  });

  it("validates Portuguese and US lengths separately", () => {
    expect(validateWhatsApp("PT", "912 345 678")).toEqual({ ok: true, e164: "+351912345678", country: "PT" });
    expect(validateWhatsApp("US", "(212) 555-0142")).toEqual({ ok: true, e164: "+12125550142", country: "US" });
    expect(validateWhatsApp("US", "912345678").ok).toBe(false);
  });
});
