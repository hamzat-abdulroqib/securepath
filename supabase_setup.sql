-- User Profiles (Optional, if you want to store display names)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT
);

-- Reports Table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  incident_type TEXT NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  image_url TEXT,
  confirmations_count INT DEFAULT 0,
  flags_count INT DEFAULT 0,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'false_alarm')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments Table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pings Table (Real-time urgent alerts)
CREATE TABLE public.pings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  confirmations_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Confirmations/Votes Table
CREATE TABLE public.confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  ping_id UUID REFERENCES public.pings(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('confirm', 'flag')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure a user can only vote once per report or ping
  UNIQUE NULLS NOT DISTINCT (user_id, report_id, ping_id)
);

-- Function to handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'display_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger to increment counts on Reports
CREATE OR REPLACE FUNCTION public.increment_report_votes()
RETURNS trigger AS $$
BEGIN
  IF NEW.report_id IS NOT NULL THEN
    IF NEW.kind = 'confirm' THEN
      UPDATE public.reports SET confirmations_count = confirmations_count + 1 WHERE id = NEW.report_id;
    ELSIF NEW.kind = 'flag' THEN
      UPDATE public.reports SET flags_count = flags_count + 1 WHERE id = NEW.report_id;
    END IF;
  ELSIF NEW.ping_id IS NOT NULL AND NEW.kind = 'confirm' THEN
    UPDATE public.pings SET confirmations_count = confirmations_count + 1, expires_at = expires_at + INTERVAL '15 minutes' WHERE id = NEW.ping_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_vote_added
  AFTER INSERT ON public.confirmations
  FOR EACH ROW EXECUTE PROCEDURE public.increment_report_votes();

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read
CREATE POLICY "Allow public read-access on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public read-access on reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Allow public read-access on pings" ON public.pings FOR SELECT USING (true);
CREATE POLICY "Allow public read-access on confirmations" ON public.confirmations FOR SELECT USING (true);
CREATE POLICY "Allow public read-access on comments" ON public.comments FOR SELECT USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated insert on reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Allow authenticated insert on pings" ON public.pings FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Allow authenticated insert on confirmations" ON public.confirmations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow authenticated insert on comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
