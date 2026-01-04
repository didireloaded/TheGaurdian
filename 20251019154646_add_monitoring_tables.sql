-- Create performance_metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  component_name TEXT NOT NULL,
  render_time DOUBLE PRECISION NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create error_reports table
CREATE TABLE IF NOT EXISTS error_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  component_name TEXT,
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMPTZ NOT NULL,
  additional_context JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMPTZ NOT NULL,
  properties JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create health_checks table
CREATE TABLE IF NOT EXISTS health_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service TEXT NOT NULL,
  status TEXT NOT NULL,
  latency DOUBLE PRECISION NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_component ON performance_metrics(component_name);
CREATE INDEX IF NOT EXISTS idx_error_reports_timestamp ON error_reports(timestamp);
CREATE INDEX IF NOT EXISTS idx_error_reports_component ON error_reports(component_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_health_checks_timestamp ON health_checks(timestamp);
CREATE INDEX IF NOT EXISTS idx_health_checks_service ON health_checks(service);

-- Add RLS policies
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;

-- Create policies for performance_metrics
CREATE POLICY "Enable insert for authenticated users" ON performance_metrics
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users" ON performance_metrics
  FOR SELECT TO authenticated USING (true);

-- Create policies for error_reports
CREATE POLICY "Enable insert for authenticated users" ON error_reports
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users" ON error_reports
  FOR SELECT TO authenticated USING (true);

-- Create policies for analytics_events
CREATE POLICY "Enable insert for authenticated users" ON analytics_events
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users" ON analytics_events
  FOR SELECT TO authenticated USING (true);

-- Create policies for health_checks
CREATE POLICY "Enable insert for authenticated users" ON health_checks
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users" ON health_checks
  FOR SELECT TO authenticated USING (true);