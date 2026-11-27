ALTER TABLE public.leads
  ADD COLUMN email_verification_status TEXT NOT NULL DEFAULT 'unverified',
  ADD COLUMN whatsapp_verification_status TEXT,
  ADD COLUMN whatsapp_country TEXT,
  ADD COLUMN email_domain_checked_at TIMESTAMPTZ,
  ADD COLUMN contact_validation_version TEXT;

UPDATE public.leads
SET whatsapp_verification_status = CASE WHEN whatsapp IS NULL THEN 'not_provided' ELSE 'unverified' END;

COMMENT ON COLUMN public.leads.email_verification_status IS 'unverified until confirmation in the official CliniMind registration';
COMMENT ON COLUMN public.leads.whatsapp_verification_status IS 'unverified, not_provided, or verified only after authorized confirmation';

CREATE TABLE public.lead_rate_limits (
  rate_key TEXT PRIMARY KEY,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  attempts INTEGER NOT NULL DEFAULT 1
);

GRANT ALL ON public.lead_rate_limits TO service_role;
ALTER TABLE public.lead_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.consume_lead_rate_limit(
  p_rate_key TEXT,
  p_limit INTEGER,
  p_window_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempts INTEGER;
BEGIN
  IF p_rate_key !~ '^[a-f0-9]{64}$' OR p_limit < 1 OR p_limit > 100 OR p_window_seconds < 60 OR p_window_seconds > 86400 THEN
    RETURN false;
  END IF;

  INSERT INTO public.lead_rate_limits (rate_key, attempts)
  VALUES (p_rate_key, 1)
  ON CONFLICT (rate_key) DO UPDATE
  SET
    attempts = CASE
      WHEN public.lead_rate_limits.window_started_at <= now() - make_interval(secs => p_window_seconds) THEN 1
      ELSE public.lead_rate_limits.attempts + 1
    END,
    window_started_at = CASE
      WHEN public.lead_rate_limits.window_started_at <= now() - make_interval(secs => p_window_seconds) THEN now()
      ELSE public.lead_rate_limits.window_started_at
    END
  RETURNING attempts INTO v_attempts;

  RETURN v_attempts <= p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_lead_rate_limit(TEXT, INTEGER, INTEGER) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_lead_rate_limit(TEXT, INTEGER, INTEGER) TO service_role;