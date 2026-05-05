-- ============================================================
-- Fix #1: Add missing severity and status columns to reports
-- ============================================================

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS severity TEXT NOT NULL DEFAULT 'medium';

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

-- Add constraints only if they don't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reports_severity_check'
  ) THEN
    ALTER TABLE public.reports
      ADD CONSTRAINT reports_severity_check
      CHECK (severity IN ('low', 'medium', 'high', 'critical'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reports_status_check'
  ) THEN
    ALTER TABLE public.reports
      ADD CONSTRAINT reports_status_check
      CHECK (status IN ('active', 'resolved', 'false_alarm'));
  END IF;
END $$;

-- Allow authenticated users to update their own reports
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reports' AND policyname = 'Users update own reports'
  ) THEN
    CREATE POLICY "Users update own reports"
      ON public.reports FOR UPDATE
      USING (auth.uid() = reporter_id);
  END IF;
END $$;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- Fix #2: Create the incident-media storage bucket
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
  VALUES ('incident-media', 'incident-media', true)
  ON CONFLICT (id) DO NOTHING;

-- Storage policies (skip if already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated users can upload media'
  ) THEN
    CREATE POLICY "Authenticated users can upload media"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'incident-media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Anyone can view incident media'
  ) THEN
    CREATE POLICY "Anyone can view incident media"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'incident-media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can delete own media'
  ) THEN
    CREATE POLICY "Users can delete own media"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'incident-media' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;
