# Quick SQL Fixes for Guardian App

## Run These Commands in Order

Copy and paste these into Supabase SQL Editor and run them one by one.

---

## 1. Fix Profiles Table

```sql
-- Add full_name column if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Copy display_name to full_name
UPDATE public.profiles
SET full_name = display_name
WHERE full_name IS NULL AND display_name IS NOT NULL;
```

---

## 2. Create/Update Public Profiles View

```sql
-- Create view that works with both display_name and full_name
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
```

---

## 3. Then Run the Main Migration

After running the above fixes, run the main migration:

**File:** `supabase/migrations/20251022000001_add_posts_and_updates.sql`

Copy the entire file contents and run in SQL Editor.

---

## Quick Copy-Paste (All in One)

If you want to run everything at once, copy this:

```sql
-- Fix profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
UPDATE public.profiles SET full_name = display_name WHERE full_name IS NULL AND display_name IS NOT NULL;

-- Create view
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  COALESCE(full_name, display_name, 'User') as full_name,
  avatar_url as profile_photo_url
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;
```

Then run the main migration file.

---

## Verify It Worked

After running, check:

1. Go to **Table Editor** → `profiles`
2. Should see both `display_name` and `full_name` columns
3. Both should have the same values

---

## Then Continue

After these fixes, your main migration will run without errors!

See **MIGRATION_GUIDE.md** for the rest of the setup.
