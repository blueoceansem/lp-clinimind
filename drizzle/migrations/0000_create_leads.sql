CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  whatsapp text,
  profile text NOT NULL,
  goal text NOT NULL,
  difficulty text NOT NULL,
  recommendation_id text NOT NULL,
  quiz_attempt_id text NOT NULL,
  entry_point text NOT NULL,
  creative_id text,
  utm_source text, utm_medium text, utm_campaign text, utm_content text, utm_term text,
  marketing_consent boolean NOT NULL DEFAULT false,
  privacy_version text NOT NULL,
  page_version text,
  sheet_sync_status text NOT NULL DEFAULT 'pendente',
  platform_trial_status text NOT NULL DEFAULT 'não integrado'
);
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;