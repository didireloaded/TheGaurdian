-- Create the incident-media bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'incident-media', 
  'incident-media', 
  true, 
  52428800, -- 50MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'audio/webm',
    'audio/mpeg',
    'audio/wav'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'incident-media');

-- Policy: Allow public read access
CREATE POLICY "Public can view files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'incident-media');

-- Policy: Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'incident-media' AND auth.uid()::text = (storage.foldername(name))[1]);
