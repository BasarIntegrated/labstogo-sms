-- Add email_messages table to support email campaign processing
-- Mirrors sms_messages structure but for email delivery

-- Create email_messages table
CREATE TABLE IF NOT EXISTS public.email_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL,
  contact_id uuid NOT NULL,
  email text NOT NULL,
  subject text,
  html text,
  status text NOT NULL DEFAULT 'pending', -- pending | sent | delivered | failed
  provider_message_id text,
  provider_response jsonb,
  sent_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz,
  error_message text,
  retry_count integer NOT NULL DEFAULT 0,
  last_retry_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid
);

-- Optional FKs if campaigns/contacts tables exist (comment out if not desired)
-- ALTER TABLE public.email_messages
--   ADD CONSTRAINT email_messages_campaign_fk FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;
-- ALTER TABLE public.email_messages
--   ADD CONSTRAINT email_messages_contact_fk FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE CASCADE;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_messages_campaign ON public.email_messages (campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_contact ON public.email_messages (contact_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_status ON public.email_messages (status);
CREATE INDEX IF NOT EXISTS idx_email_messages_created_at ON public.email_messages (created_at);

-- Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_email_messages_updated_at ON public.email_messages;
CREATE TRIGGER trg_email_messages_updated_at
BEFORE UPDATE ON public.email_messages
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();


