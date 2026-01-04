# Guardian App - Final Setup Guide

## 🎯 Complete Setup in 10 Minutes

Follow these steps **in order** to get your Guardian app fully working.

---

## Step 1: Fix Profiles Table (2 minutes)

Your database uses `display_name` but the app expects `full_name`. Let's fix that:

### In Supabase Dashboard:
1. Go to https://supabase.com/dashboard
2. Select your Guardian project
3. Click **SQL Editor**
4. Click **New Query**
5. Copy and paste this:

```sql
-- Add full_name column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Copy display_name to full_name
UPDATE public.profiles 
SET full_name = display_name 
WHERE full_name IS NULL AND display_name IS NOT NULL;

-- Create view that works with both
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  COALESCE(full_name, display_name, 'User') as full_name,
  avatar_url as profile_photo_url
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;
```

6. Click **Run**
7. Should see "Success" ✅

---

## Step 2: Enable PostGIS (1 minute - Optional)

PostGIS adds better location features, but the app works without it.

### Option A: Via Extensions Tab
1. Click **Database** → **Extensions**
2. Find "postgis"
3. Toggle it **ON**

### Option B: Via SQL
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

**If it fails:** That's OK! The app will use latitude/longitude instead.

---

## Step 3: Run Main Migration (2 minutes)

This adds all the new features (posts, comments, alert types, etc.)

1. Stay in **SQL Editor**
2. Click **New Query**
3. Open file: `supabase/migrations/20251022000001_add_posts_and_updates.sql`
4. Copy **ALL** the contents
5. Paste into SQL Editor
6. Click **Run**

**Expected Output:**
```
✅ Posts table created successfully
✅ Tracking sessions table updated with new columns
✅ Alert types updated successfully
✅ Guardian App Migration Completed!
```

---

## Step 4: Create Storage Bucket (3 minutes)

This allows users to upload audio recordings and photos.

1. Click **Storage** in left sidebar
2. Click **New bucket**
3. Name: `incident-media`
4. Toggle **Public bucket** ON
5. Click **Create bucket**

### Add Upload Policy:
1. Click on `incident-media` bucket
2. Click **Policies** tab
3. Click **New policy**
4. Choose **For full customization**
5. Fill in:
   - Policy name: `Allow authenticated uploads`
   - Allowed operation: **INSERT**
   - Target roles: `authenticated`
   - Policy definition: `true`
6. Click **Review** → **Save policy**

### Add View Policy:
1. Click **New policy** again
2. Fill in:
   - Policy name: `Allow public viewing`
   - Allowed operation: **SELECT**
   - Target roles: `public`
   - Policy definition: `true`
3. Click **Review** → **Save policy**

---

## Step 5: Verify Everything (2 minutes)

### Check Tables:
1. Go to **Table Editor**
2. Should see these tables:
   - ✅ `profiles` (with both `display_name` and `full_name`)
   - ✅ `posts` (new!)
   - ✅ `comments` (new!)
   - ✅ `alerts`
   - ✅ `tracking_sessions`

### Check Tracking Sessions:
1. Click `tracking_sessions` table
2. Scroll right
3. Should see new columns:
   - ✅ `outfit_photo_url`
   - ✅ `vehicle_make`
   - ✅ `vehicle_model`
   - ✅ `companions`

### Check Storage:
1. Go to **Storage**
2. Should see `incident-media` bucket
3. Click on it
4. Should see 2 policies

---

## Step 6: Test Your App

1. Go to http://localhost:8080
2. **Hard refresh** (Ctrl+Shift+R)
3. Test these features:

### Test Panic Button:
- Click red **PANIC** button
- Allow microphone permission
- Should see "Recording..." indicator
- Click again to stop

### Test Community Feed:
- Scroll down on home page
- Should see "Community Feed" (not "not ready")
- Type a post
- Click **Post**
- Should appear in feed

### Test Look After Me:
- Go to **Look After** tab
- Click "Start New Session"
- Fill out form
- Upload outfit photo
- Should work!

### Test Map:
- Go to **Map** tab
- Should see full-screen Mapbox map
- Long-press anywhere (hold 1 second)
- Report dialog should appear

### Test Authorities:
- Go to **SOS** tab
- Should see all emergency contacts
- Tap **Call** button
- Should open phone dialer

---

## ✅ Success Checklist

- [ ] Profiles table has `full_name` column
- [ ] PostGIS enabled (or using lat/lng fallback)
- [ ] Migration ran successfully
- [ ] `posts` and `comments` tables exist
- [ ] `tracking_sessions` has new columns
- [ ] Storage bucket `incident-media` created
- [ ] Storage policies configured
- [ ] App loads without errors
- [ ] Community Feed works
- [ ] Panic button records audio
- [ ] Can upload photos

---

## 🐛 Troubleshooting

### "Column full_name does not exist"
→ Run Step 1 again (profiles fix)

### "Type geography does not exist"
→ Enable PostGIS (Step 2) or ignore (app uses lat/lng)

### "Relation posts does not exist"
→ Run Step 3 again (main migration)

### "Failed to upload audio"
→ Complete Step 4 (storage bucket)

### Community Feed says "not ready"
→ Hard refresh (Ctrl+Shift+R) and check if `posts` table exists

### Panic button doesn't record
→ Allow microphone permission in browser settings

### Map doesn't show
→ Mapbox token is already configured, just refresh

---

## 📊 What You Get

After completing all steps:

### Working Features:
- ✅ Panic & Amber alert buttons with audio recording
- ✅ Full-screen live map with Mapbox
- ✅ Incident reporting (long-press on map)
- ✅ Community feed (posts, likes, comments)
- ✅ Look After Me with outfit photos and vehicle details
- ✅ Authorities directory with one-tap calling
- ✅ Alert grid with all incident types
- ✅ Real-time updates
- ✅ Ghost mode for privacy

### Alert Types Available:
- Panic, Amber, Robbery, Assault
- Accident, Kidnapping, Fire, Medical
- Suspicious Activity, Unsafe Area, House Breaking

### Emergency Contacts:
- All 14 Namibian regions
- Police, Fire Brigade, LifeLine
- Medical & Social Services
- One-tap call/email

---

## 🎉 You're Done!

Your Guardian app is now **fully functional** and ready to protect the Namibian community!

**App URL:** http://localhost:8080

**Need Help?** Check these files:
- `RUN_THESE_SQL_COMMANDS.md` - Quick SQL fixes
- `MIGRATION_GUIDE.md` - Detailed migration guide
- `QUICK_REFERENCE.md` - Quick reference card
- `README.md` - Full documentation

---

**Built with ❤️ for the safety of Namibia** 🇳🇦🛡️

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** October 22, 2025
