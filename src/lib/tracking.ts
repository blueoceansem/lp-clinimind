// dataLayer + attribution helpers. Never push names, e-mails or phones here.
declare global {
  interface Window { dataLayer?: Record<string, unknown>[] }
}

export const PAGE_VERSION = "lp-v1";
export const PRIVACY_VERSION = "2026-11-v1";
const ATTR_KEY = "cm_attribution";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export type Attribution = {
  utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_content?: string; utm_term?: string;
  creative_id?: string; entry_point?: "quiz_direto" | "lp_primeiro";
};

export function uid(prefix: string) {
  const r = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `${prefix}_${r}`;
}

export function captureAttribution(entry: "quiz_direto" | "lp_primeiro"): Attribution {
  if (typeof window === "undefined") return {};
  const stored = getAttribution();
  const p = new URLSearchParams(window.location.search);
  const next: Attribution = { ...stored };
  for (const k of UTM_KEYS) { const v = p.get(k); if (v) next[k] = v.slice(0, 200); }
  const cr = p.get("creative_id") || p.get("utm_id") || p.get("ad_id");
  if (cr) next.creative_id = cr.slice(0, 200);
  if (!next.entry_point) next.entry_point = entry;
  sessionStorage.setItem(ATTR_KEY, JSON.stringify(next));
  return next;
}

export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(sessionStorage.getItem(ATTR_KEY) || "{}"); } catch { return {}; }
}

/** Query string carrying only non-personal attribution, to preserve origin across links. */
export function attributionSearch(): Record<string, string> {
  const a = getAttribution();
  const out: Record<string, string> = {};
  for (const k of UTM_KEYS) if (a[k]) out[k] = a[k]!;
  if (a.creative_id) out["creative_id"] = a.creative_id;
  return out;
}

export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  const a = getAttribution();
  window.dataLayer.push({
    event,
    event_id: uid("ev"),
    page_version: PAGE_VERSION,
    entry_point: a.entry_point,
    creative_id: a.creative_id,
    utm_source: a.utm_source, utm_medium: a.utm_medium, utm_campaign: a.utm_campaign,
    utm_content: a.utm_content, utm_term: a.utm_term,
    ...params,
  });
}
