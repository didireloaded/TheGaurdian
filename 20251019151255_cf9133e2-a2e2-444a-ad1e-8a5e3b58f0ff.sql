-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create enum types
CREATE TYPE alert_type AS ENUM ('panic', 'robbery', 'assault', 'suspicious', 'house_breaking', 'other');
CREATE TYPE incident_status AS ENUM ('active', 'resolved', 'false_alarm');
CREATE TYPE tracking_status AS ENUM ('active', 'completed', 'emergency');

-- Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  emergency_contact_1 TEXT,
  emergency_contact_2 TEXT,
  emergency_contact_3 TEXT,
  is_visible BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  reputation_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency alerts table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  alert_type alert_type NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  location_name TEXT,
  audio_url TEXT,
  video_url TEXT,
  status incident_status DEFAULT 'active',
  description TEXT,
  is_false_alarm BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community incidents (witness reports)
CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  incident_type alert_type NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  location_name TEXT,
  description TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  status incident_status DEFAULT 'active',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Live location tracking (for "Look After Me")
CREATE TABLE public.tracking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  destination_name TEXT NOT NULL,
  destination_location GEOGRAPHY(POINT, 4326),
  current_location GEOGRAPHY(POINT, 4326),
  status tracking_status DEFAULT 'active',
  watcher_ids UUID[] DEFAULT ARRAY[]::UUID[],
  estimated_arrival TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Community messages/chat
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  location_radius INTEGER DEFAULT 5000,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for alerts
CREATE POLICY "Alerts are viewable by authenticated users"
  ON public.alerts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create own alerts"
  ON public.alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON public.alerts FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for incidents
CREATE POLICY "Public incidents are viewable by everyone"
  ON public.incidents FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create incidents"
  ON public.incidents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own incidents"
  ON public.incidents FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for tracking sessions
CREATE POLICY "Users can view tracking if they are the user or a watcher"
  ON public.tracking_sessions FOR SELECT
  USING (
    auth.uid() = user_id OR 
    auth.uid() = ANY(watcher_ids)
  );

CREATE POLICY "Users can create own tracking sessions"
  ON public.tracking_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tracking sessions"
  ON public.tracking_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Messages are viewable by authenticated users"
  ON public.messages FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_alerts_location ON public.alerts USING GIST (location);
CREATE INDEX idx_alerts_created_at ON public.alerts (created_at DESC);
CREATE INDEX idx_incidents_location ON public.incidents USING GIST (location);
CREATE INDEX idx_incidents_created_at ON public.incidents (created_at DESC);
CREATE INDEX idx_messages_location ON public.messages USING GIST (location);
CREATE INDEX idx_messages_created_at ON public.messages (created_at DESC);
CREATE INDEX idx_tracking_status ON public.tracking_sessions (status) WHERE status = 'active';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracking_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;