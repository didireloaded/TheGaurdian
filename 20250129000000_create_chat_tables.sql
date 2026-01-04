-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Ensure profiles has columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'offline',
  ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add unique index on username only if not null and not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'uq_profiles_username' AND n.nspname = 'public') THEN
    BEGIN
      EXECUTE 'CREATE UNIQUE INDEX uq_profiles_username ON public.profiles(username) WHERE username IS NOT NULL';
    EXCEPTION WHEN others THEN
      NULL;
    END;
  END IF;
END$$;

-- 2. Create conversations, participants, messages tables
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

-- 3. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 4. Indexes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_messages_conversation' AND n.nspname = 'public') THEN
    CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_messages_sender' AND n.nspname = 'public') THEN
    CREATE INDEX idx_messages_sender ON public.messages(sender_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_conversation_participants_user' AND n.nspname = 'public') THEN
    CREATE INDEX idx_conversation_participants_user ON public.conversation_participants(user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_conversation_participants_conv' AND n.nspname = 'public') THEN
    CREATE INDEX idx_conversation_participants_conv ON public.conversation_participants(conversation_id);
  END IF;
END$$;

-- 5. Trigger function
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE t.tgname = 'update_conversation_on_message' AND n.nspname = 'public' AND c.relname = 'messages'
  ) THEN
    CREATE TRIGGER update_conversation_on_message
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_conversation_timestamp();
  END IF;
END$$;

-- 6. handle_new_user function and trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    INSERT INTO public.profiles (id, username, avatar_url)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', NEW.email), COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid WHERE c.relname = 'users' AND n.nspname = 'auth') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE t.tgname = 'on_auth_user_created' AND n.nspname = 'auth' AND c.relname = 'users'
    ) THEN
      CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
    END IF;
  END IF;
END$$;

-- 7. Policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol JOIN pg_class c ON pol.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE pol.polname = 'users_can_view_all_profiles' AND n.nspname = 'public' AND c.relname = 'profiles'
  ) THEN
    CREATE POLICY users_can_view_all_profiles ON public.profiles FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol JOIN pg_class c ON pol.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE pol.polname = 'users_can_update_own_profile' AND n.nspname = 'public' AND c.relname = 'profiles'
  ) THEN
    CREATE POLICY users_can_update_own_profile ON public.profiles FOR UPDATE USING ((SELECT auth.uid()) = id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol JOIN pg_class c ON pol.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE pol.polname = 'users_can_insert_own_profile' AND n.nspname = 'public' AND c.relname = 'profiles'
  ) THEN
    CREATE POLICY users_can_insert_own_profile ON public.profiles FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol JOIN pg_class c ON pol.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE pol.polname = 'users_can_view_their_conversations' AND n.nspname='public' AND c.relname='conversations'
  ) THEN
    CREATE POLICY users_can_view_their_conversations ON public.conversations FOR SELECT
    USING (id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = (SELECT auth.uid())));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol JOIN pg_class c ON pol.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE pol.polname = 'users_can_create_conversations' AND n.nspname='public' AND c.relname='conversations'
  ) THEN
    CREATE POLICY users_can_create_conversations ON public.conversations FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol JOIN pg_class c ON pol.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE pol.polname = 'users_can_view_participants_of_their_conversations' AND n.nspname='public' AND c.relname='conversation_participants'
  ) THEN
    CREATE POLICY users_can_view_participants_of_their_conversations ON public.conversation_participants FOR SELECT
    USING (conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = (SELECT auth.uid())));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol JOIN pg_class c ON pol.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE pol.polname = 'users_can_insert_participants' AND n.nspname='public' AND c.relname='conversation_participants'
  ) THEN
    CREATE POLICY users_can_insert_participants ON public.conversation_participants FOR INSERT
    WITH CHECK (user_id = (SELECT auth.uid()) OR conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = (SELECT auth.uid())));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol JOIN pg_class c ON pol.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE pol.polname = 'users_can_view_messages_in_their_conversations' AND n.nspname='public' AND c.relname='messages'
  ) THEN
    CREATE POLICY users_can_view_messages_in_their_conversations ON public.messages FOR SELECT
    USING (conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = (SELECT auth.uid())));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol JOIN pg_class c ON pol.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE pol.polname = 'users_can_insert_messages_in_their_conversations' AND n.nspname='public' AND c.relname='messages'
  ) THEN
    CREATE POLICY users_can_insert_messages_in_their_conversations ON public.messages FOR INSERT
    WITH CHECK (sender_id = (SELECT auth.uid()) AND conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = (SELECT auth.uid())));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol JOIN pg_class c ON pol.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE pol.polname = 'users_can_update_their_own_messages' AND n.nspname='public' AND c.relname='messages'
  ) THEN
    CREATE POLICY users_can_update_their_own_messages ON public.messages FOR UPDATE USING ((SELECT auth.uid()) = sender_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol JOIN pg_class c ON pol.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE pol.polname = 'users_can_update_read_status_on_messages_in_their_conversations' AND n.nspname='public' AND c.relname='messages'
  ) THEN
    CREATE POLICY users_can_update_read_status_on_messages_in_their_conversations ON public.messages FOR UPDATE
    USING (conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = (SELECT auth.uid())));
  END IF;
END$$;

-- 8. Add tables to publication if publication exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.messages';
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles';
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END$$;
