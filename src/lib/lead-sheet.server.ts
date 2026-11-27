import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { buildSheetRow, SHEET_HEADERS, type SheetLead } from "@/lib/lead-sheet";

const BASE = "https://connector-gateway.lovable.dev/google_sheets/v4/spreadsheets/1mlEno6XWY-B_sLc3SOfX7hOxDRO6FvLrcbtDCs7eQ_4";
async function sheets(path: string, method = "GET", body?: object) {
  const apiKey = process.env['LOVABLE_API_KEY'];
  const connectionKey = process.env['GOOGLE_SHEETS_API_KEY'];
  if (!apiKey || !connectionKey) throw new Error("Conexão com Google Sheets indisponível");
  const response = await fetch(`${BASE}${path}`, { method, headers: { Authorization: `Bearer ${apiKey}`, "X-Connection-Api-Key": connectionKey, "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(8000) });
  if (!response.ok) {
    const detail = await response.text();
    console.error(`Google Sheets [${response.status}]: ${detail}`);
    throw new Error(`Google Sheets: ${response.status}`);
  }
  return await response.json() as { values?: string[][]; updatedCells?: number; sheets?: { properties: { sheetId: number; gridProperties: { rowCount: number } } }[] };
}

export async function syncLeadToSheet(id: string) {
  const { data: lead, error } = await supabaseAdmin.from("leads").select("*").eq("id", id).single();
  if (error || !lead) return false;
  if (lead.sheet_sync_status === "sincronizado") return true;
  try {
    const headers = await sheets("/values/'Página1'!A1:X1");
    const existing = headers.values?.[0] ?? [];
    if (existing.some((value, i) => value !== SHEET_HEADERS[i])) throw new Error("Cabeçalhos da planilha alterados; entrega preservada para revisão");
    if (existing.length < SHEET_HEADERS.length) await sheets("/values/'Página1'!A1:X1?valueInputOption=RAW", "PUT", { values: [SHEET_HEADERS] });
    const metadata = await sheets("?fields=sheets.properties");
    const target = metadata.sheets?.find(s => s.properties.sheetId === 0);
    if (!target) throw new Error("Aba Página1 não encontrada");
    if (lead.sheet_row > target.properties.gridProperties.rowCount) await sheets(":batchUpdate", "POST", { requests: [{ appendDimension: { sheetId: 0, dimension: "ROWS", length: lead.sheet_row - target.properties.gridProperties.rowCount + 100 } }] });
    const range = `/values/'Página1'!A${lead.sheet_row}:X${lead.sheet_row}`;
    const current = await sheets(range);
    const currentRow = current.values?.[0];
    if (currentRow?.some(Boolean) && currentRow[14] !== id) throw new Error("Linha ocupada; nenhum dado existente foi sobrescrito");
    const values = buildSheetRow(lead as SheetLead);
    await sheets(`${range}?valueInputOption=RAW`, "PUT", { values: [values] });
    const confirmed = await sheets(range);
    if (confirmed.values?.[0]?.[14] !== id || confirmed.values?.[0]?.[15] !== lead.submission_id) throw new Error("Entrega ainda não confirmada");
    const { error: updateError } = await supabaseAdmin.from("leads").update({ sheet_sync_status: "sincronizado", sheet_synced_at: new Date().toISOString(), sheet_last_error: null }).eq("id", id);
    if (updateError) throw new Error("Confirmação local pendente");
    return true;
  } catch (failure) {
    await supabaseAdmin.from("leads").update({ sheet_last_error: failure instanceof Error ? failure.message : "Falha na entrega" }).eq("id", id);
    return false;
  }
}
export async function retryPendingSheets() {
  const { data, error } = await supabaseAdmin.from("leads").select("id").neq("sheet_sync_status", "sincronizado").order("created_at").limit(8);
  if (error) throw new Error("Não foi possível consultar envios pendentes");
  let synced = 0;
  for (const lead of data ?? []) { if (await syncLeadToSheet(lead.id)) synced++; else break; }
  return { synced };
}
