-- Create the storage bucket for incident media
INSERT INTO storage.buckets (id, name, public)
VALUES ('incident-media', 'incident-media', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the bucket

-- Allow public read access to the bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'incident-media');

-- Allow authenticated users to upload media
CREATE POLICY "Authenticated users can upload media" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'incident-media');

-- Allow authenticated users to delete their own media (optional, but good practice)
CREATE POLICY "Users can delete own media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'incident-media' AND (auth.uid())::text = (storage.foldername(name))[1]);
