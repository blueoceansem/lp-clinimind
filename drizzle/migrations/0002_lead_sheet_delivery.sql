CREATE SEQUENCE public.lead_sheet_row_seq START WITH 2;
REVOKE ALL ON SEQUENCE public.lead_sheet_row_seq FROM PUBLIC, anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.lead_sheet_row_seq TO service_role;
ALTER TABLE public.leads ADD COLUMN ad_attribution jsonb NOT NULL DEFAULT '{}'::jsonb, ADD COLUMN recommended_plan text, ADD COLUMN sheet_row bigint NOT NULL DEFAULT nextval('public.lead_sheet_row_seq'), ADD COLUMN sheet_synced_at timestamptz, ADD COLUMN sheet_last_error text;
CREATE UNIQUE INDEX leads_sheet_row_unique ON public.leads(sheet_row);
CREATE INDEX leads_pending_sheet_idx ON public.leads(created_at) WHERE sheet_sync_status <> 'sincronizado';