-- Guardian App - Add Posts, Comments, and Update Existing Tables
-- This migration adds new features while preserving existing data

-- Check if PostGIS is available
DO $$ 
DECLARE
  has_postgis BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'postgis'
  ) INTO has_postgis;

  -- Add posts table for home feed
  IF has_postgis THEN
    -- Use PostGIS geography type
    CREATE TABLE IF NOT EXISTS public.posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      content TEXT NOT NULL,
      photo_urls TEXT[] DEFAULT '{}',
      location GEOGRAPHY(POINT, 4326),
      location_name TEXT,
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  ELSE
    -- Fallback to lat/lng columns
    CREATE TABLE IF NOT EXISTS public.posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      content TEXT NOT NULL,
      photo_urls TEXT[] DEFAULT '{}',
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      location_name TEXT,
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;

  RAISE NOTICE 'Posts table created successfully';
END $$;

-- Add comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

-- Add spatial index if PostGIS is available
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'location'
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_posts_location ON public.posts USING GIST(location);
      RAISE NOTICE 'Spatial index created on posts.location';
    END IF;
  END IF;
END $$;

-- Update tracking_sessions table with new columns (only if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'tracking_sessions'
  ) THEN
    -- Add new columns if they don't exist
    ALTER TABLE public.tracking_sessions 
      ADD COLUMN IF NOT EXISTS outfit_photo_url TEXT,
      ADD COLUMN IF NOT EXISTS outfit_description TEXT,
      ADD COLUMN IF NOT EXISTS vehicle_make TEXT,
      ADD COLUMN IF NOT EXISTS vehicle_model TEXT,
      ADD COLUMN IF NOT EXISTS vehicle_color TEXT,
      ADD COLUMN IF NOT EXISTS vehicle_plate TEXT,
      ADD COLUMN IF NOT EXISTS companions JSONB,
      ADD COLUMN IF NOT EXISTS might_be_late BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS staying_overnight BOOLEAN DEFAULT FALSE;
    
    RAISE NOTICE 'Tracking sessions table updated with new columns';
  ELSE
    RAISE NOTICE 'Tracking sessions table does not exist - skipping column additions';
  END IF;
END $$;

-- Update alert types - handle if enum already exists
DO $$ 
BEGIN
  -- Check if alert_type enum exists
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_type') THEN
    -- Add new values if they don't exist (PostgreSQL 9.1+)
    BEGIN
      ALTER TYPE alert_type ADD VALUE IF NOT EXISTS 'amber';
    EXCEPTION WHEN duplicate_object THEN 
      RAISE NOTICE 'Alert type "amber" already exists';
    END;
    
    BEGIN
      ALTER TYPE alert_type ADD VALUE IF NOT EXISTS 'accident';
    EXCEPTION WHEN duplicate_object THEN 
      RAISE NOTICE 'Alert type "accident" already exists';
    END;
    
    BEGIN
      ALTER TYPE alert_type ADD VALUE IF NOT EXISTS 'kidnapping';
    EXCEPTION WHEN duplicate_object THEN 
      RAISE NOTICE 'Alert type "kidnapping" already exists';
    END;
    
    BEGIN
      ALTER TYPE alert_type ADD VALUE IF NOT EXISTS 'fire';
    EXCEPTION WHEN duplicate_object THEN 
      RAISE NOTICE 'Alert type "fire" already exists';
    END;
    
    BEGIN
      ALTER TYPE alert_type ADD VALUE IF NOT EXISTS 'medical';
    EXCEPTION WHEN duplicate_object THEN 
      RAISE NOTICE 'Alert type "medical" already exists';
    END;
    
    BEGIN
      ALTER TYPE alert_type ADD VALUE IF NOT EXISTS 'unsafe_area';
    EXCEPTION WHEN duplicate_object THEN 
      RAISE NOTICE 'Alert type "unsafe_area" already exists';
    END;
    
    RAISE NOTICE 'Alert types updated successfully';
  ELSE
    RAISE NOTICE 'Alert type enum does not exist - skipping';
  END IF;
END $$;

-- Enable RLS on posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;

-- Posts policies
CREATE POLICY "Users can view all posts"
  ON public.posts FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all comments" ON public.comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;

-- Comments policies
CREATE POLICY "Users can view all comments"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- Add full_name column if it doesn't exist (for compatibility)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    
    -- Copy display_name to full_name if display_name exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'display_name'
    ) THEN
      UPDATE public.profiles SET full_name = display_name WHERE full_name IS NULL;
      RAISE NOTICE 'Copied display_name to full_name';
    END IF;
  END IF;
END $$;

-- Create or replace public_profiles view (handles both display_name and full_name)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  COALESCE(full_name, display_name, 'User') as full_name,
  avatar_url as profile_photo_url
FROM public.profiles;

-- Grant access to public_profiles view
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- Enable realtime for new tables
DO $$
BEGIN
  -- Add posts to realtime publication
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Posts table already in realtime publication';
  END;
  
  -- Add comments to realtime publication
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Comments table already in realtime publication';
  END;
END $$;

-- Success message
DO $$ 
DECLARE
  has_postgis BOOLEAN;
  tracking_exists BOOLEAN;
BEGIN
  SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') INTO has_postgis;
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'tracking_sessions'
  ) INTO tracking_exists;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Guardian App Migration Completed!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables created: posts, comments';
  
  IF tracking_exists THEN
    RAISE NOTICE 'Tracking sessions: Updated with new columns';
  ELSE
    RAISE NOTICE 'Tracking sessions: Table not found (will be created by base migration)';
  END IF;
  
  RAISE NOTICE 'Alert types: Updated with new values';
  RAISE NOTICE 'RLS policies: Configured';
  RAISE NOTICE 'Realtime: Enabled for posts and comments';
  
  IF has_postgis THEN
    RAISE NOTICE 'PostGIS: Enabled - using geography types';
  ELSE
    RAISE NOTICE 'PostGIS: Not available - using lat/lng columns';
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create storage bucket: incident-media';
  RAISE NOTICE '2. Refresh your app';
  RAISE NOTICE '3. Test community feed';
  RAISE NOTICE '========================================';
END $$;
