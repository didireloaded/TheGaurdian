# Apply Database Migrations

## Option 1: Using Supabase CLI (Recommended)

If you have Supabase CLI installed:

```bash
npx supabase db push
```

## Option 2: Manual SQL Execution

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Copy and paste the contents of `supabase/migrations/20251022000001_add_posts_and_updates.sql`
5. Click **Run**

## Option 3: Using psql

If you have direct database access:

```bash
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/20251022000001_add_posts_and_updates.sql
```

## What This Migration Does:

1. ✅ Creates `posts` table for home feed
2. ✅ Creates `comments` table for post comments
3. ✅ Adds new columns to `tracking_sessions`:
   - outfit_photo_url
   - outfit_description
   - vehicle_make, vehicle_model, vehicle_color, vehicle_plate
   - companions (JSONB)
   - might_be_late, staying_overnight (booleans)
4. ✅ Adds new alert types:
   - amber
   - accident
   - kidnapping
   - fire
   - medical
   - unsafe_area
5. ✅ Sets up Row Level Security (RLS) policies
6. ✅ Creates indexes for performance
7. ✅ Creates `public_profiles` view

## Verify Migration Success:

After running the migration, check in Supabase Dashboard:

1. Go to **Table Editor**
2. You should see new tables: `posts`, `comments`
3. Check `tracking_sessions` table - should have new columns
4. Check `alerts` table - alert_type should include new values

## Create Storage Bucket:

You also need to create a storage bucket for incident media:

1. Go to **Storage** in Supabase Dashboard
2. Click **New bucket**
3. Name: `incident-media`
4. Set to **Public**
5. Add policy:
   - **INSERT**: Allow authenticated users
   - **SELECT**: Allow public access

## Test the App:

After migration:

1. Refresh your app
2. Home Feed should now work
3. Try creating a post
4. Try uploading outfit photo in Look After Me
5. Try reporting incidents on map

## Troubleshooting:

If you get errors:

- **"relation posts does not exist"**: Migration didn't run. Try again.
- **"permission denied"**: Check RLS policies in Supabase Dashboard
- **"column does not exist"**: Some columns might already exist. That's OK, the migration handles it.
- **"type already exists"**: Alert types might already be added. That's OK.

## Need Help?

Check the Supabase logs:
1. Go to **Logs** in Supabase Dashboard
2. Select **Postgres Logs**
3. Look for any errors related to the migration
