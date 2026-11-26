import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const opt = z.string().trim().max(200).optional();
const schema = z.object({
  submission_id: z.string().min(8).max(120),
  name: z.string().trim().min(2, "Informe seu nome").max(100),
  email: z.string().trim().email("E-mail inválido").max(255),
  whatsapp: z.string().trim().max(30).regex(/^[0-9()+\-\s]*$/, "WhatsApp inválido").optional(),
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
});
export type LeadInput = z.infer<typeof schema>;

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const n = (v: string | undefined) => v || null;
    const row = {
      ...data,
      whatsapp: n(data.whatsapp), creative_id: n(data.creative_id), utm_source: n(data.utm_source), utm_medium: n(data.utm_medium),
      utm_campaign: n(data.utm_campaign), utm_content: n(data.utm_content), utm_term: n(data.utm_term),
    };
    // Idempotent on submission_id: repeated sends never create duplicate rows.
    const { data: saved, error } = await supabaseAdmin
      .from("leads")
      .upsert(row, { onConflict: "submission_id", ignoreDuplicates: false })
      .select("id, sheet_sync_status")
      .single();
    if (error || !saved) {
      console.error("lead save failed", error);
      throw new Error("Não foi possível salvar agora. Tente novamente.");
    }
    return { lead_id: saved.id, sheet_sync_status: saved.sheet_sync_status };
  });
