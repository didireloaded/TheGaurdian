-- Fix profiles table to support both display_name and full_name
-- Run this if you get errors about missing columns

-- Add full_name column if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Copy display_name to full_name for existing records
UPDATE public.profiles
SET full_name = display_name
WHERE full_name IS NULL AND display_name IS NOT NULL;

-- Create or replace public_profiles view to handle both column names
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  COALESCE(full_name, display_name, 'User') as full_name,
  COALESCE(full_name, display_name, 'User') as display_name,
  avatar_url as profile_photo_url
FROM public.profiles;

-- Grant access
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Profiles table fixed!';
  RAISE NOTICE 'Both full_name and display_name are now supported';
  RAISE NOTICE '========================================';
END $$;
