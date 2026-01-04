-- Enable PostGIS extension (required for geography/geometry types)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Verify PostGIS is installed
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'postgis'
  ) THEN
    RAISE EXCEPTION 'PostGIS extension could not be enabled. Please enable it manually in Supabase Dashboard.';
  END IF;
END $$;
