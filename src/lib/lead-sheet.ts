import { QUESTIONS, buildRecommendation, type Answers } from "@/lib/quiz";

export const AD_KEYS = ["campaign_name", "adset_name", "ad_name", "campaign_id", "adset_id", "ad_id", "placement", "source"] as const;
export type AdAttribution = Partial<Record<(typeof AD_KEYS)[number], string>>;
export const SHEET_HEADERS = ["Data e horário do envio (horário de Brasília)", "Nome", "E-mail", "WhatsApp", "Todas as respostas do Quiz", "Roteiro personalizado recomendado", "Origem do lead", "Nome da campanha", "Nome do conjunto de anúncios", "Nome do anúncio", "ID da campanha", "ID do conjunto", "ID do anúncio", "Posicionamento do anúncio", "ID do lead", "ID do envio", "Estado da sincronização", "Autorização de contato", "UTM source", "UTM medium", "UTM campaign", "UTM content", "UTM term", "Versão da privacidade"];

export function formatBrasiliaDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date(value));
}
export function serializePlan(answers: Required<Answers>) {
  const rec = buildRecommendation(answers);
  return [rec.title, rec.context, ...rec.steps.map((s, i) => `${i + 1}. ${s.title}\n${s.tool}: ${s.text}`)].join("\n\n");
}
export function serializeAnswers(answers: Required<Answers>) {
  return QUESTIONS.map(q => `${q.title} ${q.options.find(o => o.id === answers[q.id])?.label ?? answers[q.id]}`).join("\n");
}
export type SheetLead = Required<Answers> & {
  id: string; submission_id: string; created_at: string; name: string; email: string; whatsapp: string | null;
  ad_attribution: unknown; recommended_plan: string | null; entry_point: string; marketing_consent: boolean; privacy_version: string;
  utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; utm_content: string | null; utm_term: string | null;
};
export function buildSheetRow(lead: SheetLead) {
  const ad = (lead.ad_attribution ?? {}) as AdAttribution;
  return [formatBrasiliaDate(lead.created_at), lead.name, lead.email, lead.whatsapp ?? "", serializeAnswers(lead), lead.recommended_plan ?? serializePlan(lead),
    `${ad.source || lead.utm_source || "Não informada"} / ${lead.entry_point === "lp_primeiro" ? "LP primeiro" : "Quiz direto"}`,
    ad.campaign_name || lead.utm_campaign || "", ad.adset_name || "", ad.ad_name || "", ad.campaign_id || "", ad.adset_id || "", ad.ad_id || "", ad.placement || "",
    lead.id, lead.submission_id, "sincronizado", lead.marketing_consent ? "Sim" : "Não", lead.utm_source ?? "", lead.utm_medium ?? "", lead.utm_campaign ?? "", lead.utm_content ?? "", lead.utm_term ?? "", lead.privacy_version];
}
