# Enable PostGIS in Supabase

## Quick Fix (2 minutes)

### Option 1: Enable PostGIS in Supabase Dashboard (Easiest)

1. Go to https://supabase.com/dashboard
2. Select your Guardian project
3. Click **Database** in the left sidebar
4. Click **Extensions** tab
5. Search for "postgis"
6. Toggle **postgis** to ON (enable it)
7. Wait for confirmation message

### Option 2: Enable via SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your Guardian project
3. Click **SQL Editor**
4. Copy and paste this:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
```

5. Click **Run**
6. Should see "Success" message

---

## Then Run the Main Migration

After enabling PostGIS:

1. Stay in **SQL Editor**
2. Copy contents of `supabase/migrations/20251022000001_add_posts_and_updates.sql`
3. Paste and click **Run**
4. Should see success messages

---

## What if PostGIS Can't Be Enabled?

If you get permission errors or PostGIS won't enable, **that's OK!**

The migration will automatically use latitude/longitude columns instead of geography types. Everything will still work perfectly.

---

## Verify It Worked

After running the migration, check:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see new tables:
   - `posts`
   - `comments`
3. Click on `posts` table
4. Should see columns: id, user_id, content, photo_urls, location (or latitude/longitude), etc.

---

## Troubleshooting

**"Extension postgis does not exist"**
- Your Supabase plan might not support PostGIS
- That's OK - the migration will use lat/lng columns instead

**"Permission denied to create extension"**
- You need database owner permissions
- Contact Supabase support or use lat/lng fallback

**"Type geography does not exist"**
- PostGIS isn't enabled yet
- Follow Option 1 or Option 2 above

---

## What PostGIS Does

PostGIS adds geographic/spatial features:
- Calculate distances between points
- Find nearby users efficiently
- Spatial queries (within radius, etc.)

**Without PostGIS:**
- App still works perfectly
- Uses simple lat/lng columns
- Distance calculations done in app code

---

## Quick Start (If PostGIS Won't Enable)

Just run the main migration as-is:

```bash
# In Supabase SQL Editor, paste and run:
# supabase/migrations/20251022000001_add_posts_and_updates.sql
```

The migration detects if PostGIS is available and adapts automatically!

---

**Bottom Line:** Enable PostGIS if you can (better performance), but the app works fine without it.
