-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  incident_type TEXT NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  image_url TEXT,
  confirmations_count INTEGER NOT NULL DEFAULT 0,
  flags_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX reports_created_at_idx ON public.reports (created_at DESC);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reports viewable by everyone" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users delete own reports" ON public.reports FOR DELETE USING (auth.uid() = reporter_id);

-- Pings table
CREATE TABLE public.pings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  confirmations_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '15 minutes')
);
CREATE INDEX pings_expires_at_idx ON public.pings (expires_at);
ALTER TABLE public.pings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pings viewable by everyone" ON public.pings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert pings" ON public.pings FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

-- Rate limit trigger: max 3 pings per user per hour
CREATE OR REPLACE FUNCTION public.check_ping_rate_limit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count FROM public.pings
  WHERE reporter_id = NEW.reporter_id AND created_at > now() - INTERVAL '1 hour';
  IF recent_count >= 3 THEN
    RAISE EXCEPTION 'Ping rate limit exceeded: max 3 pings per hour';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER ping_rate_limit BEFORE INSERT ON public.pings FOR EACH ROW EXECUTE FUNCTION public.check_ping_rate_limit();

-- Confirmations table
CREATE TABLE public.confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  ping_id UUID REFERENCES public.pings(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'confirm',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT one_target CHECK ((report_id IS NOT NULL)::int + (ping_id IS NOT NULL)::int = 1),
  CONSTRAINT valid_kind CHECK (kind IN ('confirm','flag'))
);
CREATE UNIQUE INDEX uniq_user_report ON public.confirmations (user_id, report_id, kind) WHERE report_id IS NOT NULL;
CREATE UNIQUE INDEX uniq_user_ping ON public.confirmations (user_id, ping_id, kind) WHERE ping_id IS NOT NULL;
ALTER TABLE public.confirmations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Confirmations viewable by everyone" ON public.confirmations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can confirm" ON public.confirmations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Update counts on confirmations
CREATE OR REPLACE FUNCTION public.update_counts()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.report_id IS NOT NULL THEN
    IF NEW.kind = 'confirm' THEN
      UPDATE public.reports SET confirmations_count = confirmations_count + 1 WHERE id = NEW.report_id;
    ELSE
      UPDATE public.reports SET flags_count = flags_count + 1 WHERE id = NEW.report_id;
    END IF;
  ELSIF NEW.ping_id IS NOT NULL AND NEW.kind = 'confirm' THEN
    UPDATE public.pings SET confirmations_count = confirmations_count + 1, expires_at = expires_at + INTERVAL '5 minutes' WHERE id = NEW.ping_id;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER confirmation_counts AFTER INSERT ON public.confirmations FOR EACH ROW EXECUTE FUNCTION public.update_counts();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.confirmations;