-- Add severity and status to reports
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical'));
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'false_alarm'));

-- Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-access on comments" ON public.comments;
CREATE POLICY "Allow public read-access on comments" ON public.comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow authenticated insert on comments" ON public.comments;
CREATE POLICY "Allow authenticated insert on comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Add comments to Realtime publication (ignore error if already added)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'comments'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
    END IF;
END
$$;
