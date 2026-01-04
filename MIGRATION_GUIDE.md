# Guardian App - Database Migration Guide

## 🚀 Quick Setup (5 Minutes)

### Important: Run Migrations in Order!

Your database already has the base tables (alerts, tracking_sessions, profiles, etc.) from the initial setup. We just need to add the new features.

---

## Step 1: Enable PostGIS (Optional but Recommended)

**In Supabase Dashboard:**
1. Go to https://supabase.com/dashboard
2. Select your Guardian project
3. Click **Database** → **Extensions**
4. Find "postgis" in the list
5. Toggle it **ON**
6. Wait for "Extension enabled" confirmation

**OR via SQL Editor:**
1. Click **SQL Editor**
2. Paste this:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```
3. Click **Run**

**Note:** If PostGIS won't enable (permission error), that's OK! The migration will use lat/lng columns instead.

---

## Step 2: Run the New Features Migration

1. In Supabase Dashboard, click **SQL Editor**
2. Click **New Query**
3. Copy **ALL** the SQL from: `supabase/migrations/20251022000001_add_posts_and_updates.sql`
4. Paste into the editor
5. Click **Run** (or press Ctrl+Enter)
6. Wait for success messages

**Expected Output:**
```
NOTICE: Posts table created successfully
NOTICE: Tracking sessions table updated with new columns
NOTICE: Alert types updated successfully
NOTICE: ========================================
NOTICE: Guardian App Migration Completed!
NOTICE: ========================================
NOTICE: Tables created: posts, comments
NOTICE: Tracking sessions: Updated with new columns
NOTICE: Alert types: Updated with new values
NOTICE: RLS policies: Configured
NOTICE: Realtime: Enabled for posts and comments
NOTICE: PostGIS: Enabled - using geography types
NOTICE: ========================================
```

---

## Step 3: Create Storage Bucket

1. Click **Storage** in left sidebar
2. Click **New bucket**
3. Name: `incident-media`
4. Toggle **Public bucket** ON
5. Click **Create bucket**

**Add Upload Policy:**
1. Click on the `incident-media` bucket
2. Click **Policies** tab
3. Click **New policy**
4. Choose **For full customization**
5. Policy name: `Allow authenticated uploads`
6. Allowed operation: **INSERT**
7. Target roles: `authenticated`
8. Policy definition: `true`
9. Click **Review** → **Save policy**

**Add View Policy:**
1. Click **New policy** again
2. Policy name: `Allow public viewing`
3. Allowed operation: **SELECT**
4. Target roles: `public`
5. Policy definition: `true`
6. Click **Review** → **Save policy**

---

## Step 4: Verify Everything Works

1. Go back to your app: http://localhost:8080
2. **Hard refresh** the page (Ctrl+Shift+R)
3. Scroll down to **Community Feed**
4. Should no longer say "not ready"
5. Try creating a post
6. Should work!

---

## ✅ What This Migration Adds

### New Tables:
- ✅ `posts` - Community feed posts
- ✅ `comments` - Post comments

### Updates to Existing Tables:
- ✅ `tracking_sessions` - Adds 9 new columns:
  - `outfit_photo_url` - Photo of outfit
  - `outfit_description` - Text description
  - `vehicle_make` - Car make
  - `vehicle_model` - Car model
  - `vehicle_color` - Car color
  - `vehicle_plate` - License plate
  - `companions` - JSON array of companions
  - `might_be_late` - Boolean flag
  - `staying_overnight` - Boolean flag

### New Alert Types:
- ✅ `amber` - Amber alerts (kidnapping)
- ✅ `accident` - Car accidents
- ✅ `kidnapping` - Kidnapping incidents
- ✅ `fire` - Fire emergencies
- ✅ `medical` - Medical emergencies
- ✅ `unsafe_area` - Unsafe area warnings

### Security:
- ✅ Row Level Security (RLS) policies
- ✅ User permissions configured
- ✅ Realtime enabled for new tables

---

## 🐛 Troubleshooting

### "Type geography does not exist"

**Cause:** PostGIS is not enabled.

**Solution:** 
1. Enable PostGIS (see Step 1)
2. OR just run the migration anyway - it will use lat/lng columns

---

### "Permission denied to create extension"

**Cause:** Your database role doesn't have permission to enable extensions.

**Solution:** That's OK! The migration will automatically use latitude/longitude columns instead. Everything still works perfectly.

---

### "Relation tracking_sessions does not exist"

**Cause:** The base migration hasn't been run yet.

**Solution:** 
1. First run: `supabase/migrations/20251019151255_cf9133e2-a2e2-444a-ad1e-8a5e3b58f0ff.sql`
2. Then run: `supabase/migrations/20251022000001_add_posts_and_updates.sql`

---

### "Table posts already exists"

**Cause:** Migration already ran successfully!

**Solution:** You're good to go! Just refresh your app.

---

### "Column already exists"

**Cause:** Some columns were already added.

**Solution:** This is fine - the migration handles it gracefully.

---

### Community Feed still shows "not ready"

**Checklist:**
1. ✅ Did the migration run successfully? (check for success messages)
2. ✅ Check Supabase → Table Editor → Do you see `posts` table?
3. ✅ Hard refresh your app (Ctrl+Shift+R)
4. ✅ Check browser console (F12) for errors
5. ✅ Check Supabase logs (Dashboard → Logs → Postgres Logs)

---

## 📊 Verify Migration Success

### In Supabase Dashboard:

**1. Check New Tables:**
- Go to **Table Editor**
- Should see: `posts`, `comments`
- Click `posts` → should see columns: id, user_id, content, photo_urls, location (or latitude/longitude), likes_count, comments_count, created_at

**2. Check Updated Tables:**
- Click `tracking_sessions` table
- Scroll right to see new columns
- Should see: outfit_photo_url, vehicle_make, vehicle_model, etc.

**3. Check Alert Types:**
- Click `alerts` table
- Click on any row
- Click `alert_type` dropdown
- Should see new types: amber, accident, kidnapping, fire, medical, unsafe_area

**4. Check Storage:**
- Go to **Storage**
- Should see `incident-media` bucket
- Click on it → should see policies configured

---

## 🎯 After Migration

Your app will have:
- ✅ Working community feed (posts, likes, comments)
- ✅ Complete Look After Me form (outfit photo, vehicle details)
- ✅ All alert types (panic, amber, robbery, etc.)
- ✅ Photo uploads working
- ✅ Full functionality

---

## 🆘 Still Having Issues?

### Check These:

1. **Browser Console** (F12)
   - Look for red errors
   - Common: "Failed to fetch" = network issue
   - Common: "Not authenticated" = need to sign in

2. **Supabase Logs**
   - Dashboard → Logs → Postgres Logs
   - Look for errors during migration
   - Check for permission issues

3. **Table Editor**
   - Verify `posts` table exists
   - Verify `tracking_sessions` has new columns
   - Check RLS policies are enabled

4. **Network Tab** (F12 → Network)
   - Check if API calls are failing
   - Look for 401 (auth) or 403 (permission) errors

---

## 📞 Common Solutions

| Problem | Solution |
|---------|----------|
| "Posts not ready" | Run migration, hard refresh |
| "Microphone blocked" | Allow in browser settings |
| "Location denied" | Allow in browser settings |
| "Upload failed" | Create storage bucket |
| "Type geography does not exist" | Enable PostGIS or ignore (uses lat/lng) |
| "Permission denied" | Contact Supabase support or use lat/lng fallback |

---

## ✨ Success Indicators

You'll know it worked when:
- ✅ No errors in migration output
- ✅ `posts` table visible in Table Editor
- ✅ Community Feed shows input box (not "not ready")
- ✅ Can create a post successfully
- ✅ Look After Me form has all fields
- ✅ Can upload outfit photo

---

## 🚀 Next Steps

After successful migration:
1. Test creating a post in Community Feed
2. Test Look After Me with outfit photo
3. Test Panic button with audio recording
4. Test reporting incident on map
5. Test calling authorities from SOS tab

---

**Your Guardian app is ready to protect the community!** 🛡️

---

**Last Updated:** October 22, 2025  
**Status:** Ready to run  
**Estimated Time:** 5 minutes
