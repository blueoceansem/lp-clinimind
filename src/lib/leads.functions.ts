import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { validateEmail, validateWhatsApp } from "@/lib/contact-validation";

const opt = z.string().trim().max(200).optional();
const schema = z.object({
  submission_id: z.string().min(8).max(120),
  name: z.string().trim().min(2, "Informe seu nome").max(100),
  email: z.string().trim().max(255),
  whatsapp: z.string().trim().max(30).regex(/^[0-9()+\-\s]*$/, "WhatsApp inválido").optional(),
  whatsapp_country: z.enum(["BR", "PT", "US"]),
  profile: z.enum(["vestibular", "estudante", "internato", "pre_residencia"]),
  goal: z.enum(["entender", "revisar", "questoes", "caso"]),
  difficulty: z.enum(["inicio", "tempo", "entender", "lembrar", "aplicar"]),
  recommendation_id: z.string().max(80),
  quiz_attempt_id: z.string().max(120),
  entry_point: z.enum(["quiz_direto", "lp_primeiro"]),
  creative_id: opt, utm_source: opt, utm_medium: opt, utm_campaign: opt, utm_content: opt, utm_term: opt,
  marketing_consent: z.boolean(),
  privacy_version: z.string().max(40),
  page_version: z.string().max(40),
  form_elapsed_ms: z.number().int().min(0).max(3_600_000),
  website: z.string().max(200),
});
export type LeadInput = z.infer<typeof schema>;
type LeadResponse =
  | { ok: true; lead_id: string; sheet_sync_status: string }
  | { ok: false; field: "email" | "whatsapp"; message: string }
  | { ok: false; formError: string };

type DnsAnswer = { Status?: number; Answer?: unknown[] };

async function dnsQuery(domain: string, type: "MX" | "A") {
  const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`, {
    headers: { Accept: "application/dns-json" },
    signal: AbortSignal.timeout(4500),
  });
  if (!response.ok) throw new Error(`DNS provider returned ${response.status}`);
  return await response.json() as DnsAnswer;
}

async function domainReceivesEmail(domain: string) {
  const mx = await dnsQuery(domain, "MX");
  if (mx.Status === 3) return false;
  if (mx.Status === 0 && Array.isArray(mx.Answer) && mx.Answer.length > 0) return true;
  // RFC 5321 permits an implicit MX through the domain's address record.
  const address = await dnsQuery(domain, "A");
  return address.Status === 0 && Array.isArray(address.Answer) && address.Answer.length > 0;
}

async function rateKey(email: string) {
  const bytes = new TextEncoder().encode(`clinimind-lead-v1:${email}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }): Promise<LeadResponse> => {
    if (data.website || data.form_elapsed_ms < 1500) {
      return { ok: false as const, formError: "Não foi possível validar o envio. Aguarde um instante e tente novamente." };
    }

    const emailResult = validateEmail(data.email);
    if (!emailResult.ok) return { ok: false as const, field: "email" as const, message: emailResult.message };
    const phoneResult = data.whatsapp ? validateWhatsApp(data.whatsapp_country, data.whatsapp) : null;
    if (phoneResult && !phoneResult.ok) return { ok: false as const, field: "whatsapp" as const, message: phoneResult.message };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const key = await rateKey(emailResult.email);
    const { data: allowed, error: rateError } = await supabaseAdmin.rpc("consume_lead_rate_limit", {
      p_rate_key: key, p_limit: 8, p_window_seconds: 600,
    });
    if (rateError) {
      console.error("lead rate limit unavailable", rateError.code);
      return { ok: false as const, formError: "Não foi possível validar o envio agora. Tente novamente." };
    }
    if (!allowed) return { ok: false as const, formError: "Muitas tentativas em pouco tempo. Aguarde 10 minutos e tente novamente." };

    try {
      if (!await domainReceivesEmail(emailResult.domain)) {
        return { ok: false as const, field: "email" as const, message: "Este domínio não parece existir ou receber e-mails. Revise o endereço." };
      }
    } catch {
      return { ok: false as const, field: "email" as const, message: "Não foi possível confirmar o domínio agora. Verifique sua conexão e tente novamente." };
    }

    const n = (v: string | undefined) => v || null;
    const row = {
      submission_id: data.submission_id,
      name: data.name,
      email: emailResult.email,
      whatsapp: phoneResult?.ok ? phoneResult.e164 : null,
      whatsapp_country: phoneResult?.ok ? phoneResult.country : null,
      email_verification_status: "unverified",
      whatsapp_verification_status: phoneResult?.ok ? "unverified" : "not_provided",
      email_domain_checked_at: new Date().toISOString(),
      contact_validation_version: "contacts-v2",
      profile: data.profile,
      goal: data.goal,
      difficulty: data.difficulty,
      recommendation_id: data.recommendation_id,
      quiz_attempt_id: data.quiz_attempt_id,
      entry_point: data.entry_point,
      creative_id: n(data.creative_id), utm_source: n(data.utm_source), utm_medium: n(data.utm_medium),
      utm_campaign: n(data.utm_campaign), utm_content: n(data.utm_content), utm_term: n(data.utm_term),
      marketing_consent: data.marketing_consent,
      privacy_version: data.privacy_version,
      page_version: data.page_version,
    };
    // Idempotent on submission_id: repeated sends never create duplicate rows.
    const { data: saved, error } = await supabaseAdmin
      .from("leads")
      .upsert(row, { onConflict: "submission_id", ignoreDuplicates: false })
      .select("id, sheet_sync_status")
      .single();
    if (error || !saved) {
      console.error("lead save failed", error?.code);
      throw new Error("Não foi possível salvar agora. Tente novamente.");
    }
    return { ok: true as const, lead_id: saved.id, sheet_sync_status: saved.sheet_sync_status };
  });
