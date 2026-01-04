-- ========================================
-- Storage Bucket Policies for Guardian App
-- ========================================
-- Run this AFTER creating the 'incident-media' bucket in Supabase Dashboard

-- STEP 1: First create the bucket via Dashboard:
-- Go to: Storage → Buckets → New bucket
-- Name: incident-media
-- Public: Yes
-- Then run this SQL to add security policies

-- ========================================
-- Storage Policies
-- ========================================

-- Policy 1: Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload to incident-media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'incident-media');

-- Policy 2: Allow public read access to all files
CREATE POLICY "Public can view incident-media files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'incident-media');

-- Policy 3: Allow users to update their own files
CREATE POLICY "Users can update own files in incident-media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'incident-media' AND auth.uid()::text = owner);

-- Policy 4: Allow users to delete their own files
CREATE POLICY "Users can delete own files in incident-media"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'incident-media' AND auth.uid()::text = owner);

-- ========================================
-- Verify Policies
-- ========================================

-- Check if policies were created successfully
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%incident-media%';

-- ========================================
-- Success Message
-- ========================================

DO $$ 
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Storage Policies Created Successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Bucket: incident-media';
  RAISE NOTICE 'Policies:';
  RAISE NOTICE '  ✅ Upload (authenticated users)';
  RAISE NOTICE '  ✅ Read (public)';
  RAISE NOTICE '  ✅ Update (file owners)';
  RAISE NOTICE '  ✅ Delete (file owners)';
  RAISE NOTICE '';
  RAISE NOTICE 'Your storage is now ready!';
  RAISE NOTICE '========================================';
END $$;
