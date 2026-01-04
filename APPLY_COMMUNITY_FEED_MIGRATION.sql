-- ========================================
-- Guardian App - Community Feed Migration
-- ========================================
-- Run this in Supabase Dashboard > SQL Editor
-- This will set up posts, comments, and all required tables

-- Step 1: Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Step 2: Create posts table
DO $ 
DECLARE
  has_postgis BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'postgis'
  ) INTO has_postgis;

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
END $;

-- Step 3: Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create post_likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Step 5: Create comment_likes table
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Step 6: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON public.comment_likes(user_id);

-- Step 7: Add spatial index if PostGIS is available
DO $ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'location'
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_posts_location ON public.posts USING GIST(location);
    END IF;
  END IF;
END $;

-- Step 8: Fix profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS full_name TEXT;

UPDATE public.profiles
SET full_name = display_name
WHERE full_name IS NULL AND display_name IS NOT NULL;

-- Step 9: Create public_profiles view
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  COALESCE(full_name, display_name, 'User') as full_name,
  COALESCE(full_name, display_name, 'User') as display_name,
  avatar_url as profile_photo_url
FROM public.profiles;

-- Step 10: Enable RLS on all tables
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Step 11: Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;

DROP POLICY IF EXISTS "Users can view all comments" ON public.comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;

DROP POLICY IF EXISTS "Users can view all post likes" ON public.post_likes;
DROP POLICY IF EXISTS "Users can create post likes" ON public.post_likes;
DROP POLICY IF EXISTS "Users can delete their own post likes" ON public.post_likes;

DROP POLICY IF EXISTS "Users can view all comment likes" ON public.comment_likes;
DROP POLICY IF EXISTS "Users can create comment likes" ON public.comment_likes;
DROP POLICY IF EXISTS "Users can delete their own comment likes" ON public.comment_likes;

-- Step 12: Create RLS policies for posts
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

-- Step 13: Create RLS policies for comments
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

-- Step 14: Create RLS policies for post_likes
CREATE POLICY "Users can view all post likes"
  ON public.post_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can create post likes"
  ON public.post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own post likes"
  ON public.post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Step 15: Create RLS policies for comment_likes
CREATE POLICY "Users can view all comment likes"
  ON public.comment_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can create comment likes"
  ON public.comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comment likes"
  ON public.comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Step 16: Grant access to public_profiles view
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- Step 17: Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comment_likes;

-- Step 18: Create functions for like counts
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET likes_count = GREATEST(0, likes_count - 1) 
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.comments 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.comments 
    SET likes_count = GREATEST(0, likes_count - 1) 
    WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET comments_count = GREATEST(0, comments_count - 1) 
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$ LANGUAGE plpgsql;

-- Step 19: Create triggers
DROP TRIGGER IF EXISTS trigger_update_post_likes_count ON public.post_likes;
CREATE TRIGGER trigger_update_post_likes_count
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

DROP TRIGGER IF EXISTS trigger_update_comment_likes_count ON public.comment_likes;
CREATE TRIGGER trigger_update_comment_likes_count
  AFTER INSERT OR DELETE ON public.comment_likes
  FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

DROP TRIGGER IF EXISTS trigger_update_post_comments_count ON public.comments;
CREATE TRIGGER trigger_update_post_comments_count
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Success message
DO $ 
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Community Feed Migration Complete!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - posts';
  RAISE NOTICE '  - comments';
  RAISE NOTICE '  - post_likes';
  RAISE NOTICE '  - comment_likes';
  RAISE NOTICE '';
  RAISE NOTICE 'Features enabled:';
  RAISE NOTICE '  - Row Level Security';
  RAISE NOTICE '  - Realtime subscriptions';
  RAISE NOTICE '  - Automatic like/comment counts';
  RAISE NOTICE '  - PostGIS location support';
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Refresh your app!';
  RAISE NOTICE '========================================';
END $;
