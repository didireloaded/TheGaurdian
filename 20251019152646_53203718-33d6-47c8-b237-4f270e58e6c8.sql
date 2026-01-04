-- Fix nullable user_id columns (prevents RLS bypass)
ALTER TABLE public.alerts 
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.incidents 
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.tracking_sessions 
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.messages 
  ALTER COLUMN user_id SET NOT NULL;

-- Fix profiles privacy exposure - restrict PII access
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view basic public profiles"
  ON public.profiles FOR SELECT
  USING (
    is_visible = true 
    AND auth.role() = 'authenticated'
    AND id != auth.uid()
  );

-- Create safe public view (no PII exposed)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  avatar_url,
  is_verified,
  reputation_points,
  created_at
FROM public.profiles
WHERE is_visible = true;

GRANT SELECT ON public.public_profiles TO authenticated;

-- Clean up invalid phone data before adding constraints
UPDATE public.profiles
SET phone = NULL
WHERE phone IS NOT NULL 
  AND phone !~ '^\+264\s?\d{2}\s?\d{3}\s?\d{4}$';

UPDATE public.profiles
SET emergency_contact_1 = NULL
WHERE emergency_contact_1 IS NOT NULL 
  AND emergency_contact_1 !~ '^\+264\s?\d{2}\s?\d{3}\s?\d{4}$';

UPDATE public.profiles
SET emergency_contact_2 = NULL
WHERE emergency_contact_2 IS NOT NULL 
  AND emergency_contact_2 !~ '^\+264\s?\d{2}\s?\d{3}\s?\d{4}$';

UPDATE public.profiles
SET emergency_contact_3 = NULL
WHERE emergency_contact_3 IS NOT NULL 
  AND emergency_contact_3 !~ '^\+264\s?\d{2}\s?\d{3}\s?\d{4}$';

-- Phone number validation function for server-side validation
CREATE OR REPLACE FUNCTION validate_phone_number(phone_num TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Namibian phone number validation (+264 XX XXX XXXX)
  RETURN phone_num IS NULL OR phone_num ~ '^\+264\s?\d{2}\s?\d{3}\s?\d{4}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add phone validation constraints
ALTER TABLE public.profiles
  ADD CONSTRAINT valid_phone_format 
    CHECK (validate_phone_number(phone));

ALTER TABLE public.profiles
  ADD CONSTRAINT valid_emergency_contact_1
    CHECK (validate_phone_number(emergency_contact_1));

ALTER TABLE public.profiles
  ADD CONSTRAINT valid_emergency_contact_2
    CHECK (validate_phone_number(emergency_contact_2));

ALTER TABLE public.profiles
  ADD CONSTRAINT valid_emergency_contact_3
    CHECK (validate_phone_number(emergency_contact_3));