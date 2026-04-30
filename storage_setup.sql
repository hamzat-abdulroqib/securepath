-- Create the storage bucket for incident media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('incident-media', 'incident-media', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the storage.objects table (Already enabled by default in Supabase)


-- Allow public read access to the incident-media bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'incident-media');

-- Allow authenticated users to upload to the incident-media bucket
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
CREATE POLICY "Authenticated users can upload media" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'incident-media');

-- Allow users to delete their own uploads (optional, but good practice)
DROP POLICY IF EXISTS "Users can delete their own media" ON storage.objects;
CREATE POLICY "Users can delete their own media" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'incident-media' AND auth.uid() = owner);
