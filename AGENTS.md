<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- Leads are saved durably in the `leads` table via the `submitLead` server function (service role, idempotent on `submission_id`); browser never writes directly. Why: no lost or duplicated leads.
- Analytics go only through `track()` in src/lib/tracking.ts into `window.dataLayer`; never push personal data (name, e-mail, phone). Why: privacy brief.
- Ad attribution (UTMs, creative_id, entry point) is kept in sessionStorage via `captureAttribution`. Why: preserve origin across LP → quiz → platform.
- Google Sheets delivery uses a permanently reserved row per lead and RAW writes, confirms the lead ID after writing, and marks synchronized only after confirmation. Why: uncertain retries must not duplicate leads or execute spreadsheet formulas.
- Store ad attribution and the server-generated study-plan snapshot with each lead; retry pending deliveries hourly as reconciliation. Why: preserve the delivered recommendation and recover provider outages without blocking durable lead capture.
