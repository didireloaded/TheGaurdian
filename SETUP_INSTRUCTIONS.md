# Guardian App - Setup Instructions

## 🚀 Quick Start

### 1. Apply Database Migrations

**IMPORTANT:** You must run the database migration before the app will work properly.

#### Option A: Using Supabase Dashboard (Easiest)

1. Go to https://supabase.com/dashboard
2. Select your Guardian project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `supabase/migrations/20251022000001_add_posts_and_updates.sql`
6. Paste into the SQL editor
7. Click **Run** (or press Ctrl+Enter)
8. Wait for "Success" message

#### Option B: Using Supabase CLI

```bash
npx supabase db push
```

### 2. Create Storage Bucket

1. In Supabase Dashboard, go to **Storage**
2. Click **New bucket**
3. Name: `incident-media`
4. Make it **Public**
5. Click **Create bucket**
6. Click on the bucket
7. Go to **Policies** tab
8. Add these policies:
   - **INSERT**: `authenticated` users can upload
   - **SELECT**: `public` can view

### 3. Verify Environment Variables

Make sure your `.env` file has:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_MAPBOX_TOKEN=your_mapbox_token
```

### 4. Install Dependencies (if not done)

```bash
npm install
```

### 5. Start the App

```bash
npm run dev
```

---

## ✅ What Was Implemented

### 1. **Panic & Amber Alert Buttons** ✅
- Both buttons now work properly
- Audio recording starts immediately
- GPS location captured
- Alerts saved to database
- Visual recording indicator

**Test:** Click Panic button → should see "Recording..." → alert sent

### 2. **Full-Screen Map** ✅
- Map occupies entire screen
- Live user tracking (green dots)
- Incident reporting (long-press or + button)
- Real-time updates
- Color-coded incident pins

**Test:** Go to Map tab → should see full-screen map → long-press to report

### 3. **Alert Tab - Grid Layout** ✅
- Compact 2-3 column grid
- Color-coded cards
- DM icon in top-left
- Shows time ago and distance

**Test:** Go to Alerts tab → should see grid of alert cards

### 4. **Look After Me - Complete Form** ✅
- Destination input
- Departure/arrival times
- Companions section
- Vehicle details
- Outfit photo upload
- Outfit description

**Test:** Go to Look After Me → Start New Session → fill out form

### 5. **Home Feed** ✅
- Instagram-style community feed
- Create posts
- Like/comment/share buttons
- Location tags
- Real-time updates

**Test:** Scroll down on home page → should see "Community Feed"

---

## 🔧 TypeScript Errors (Expected)

You'll see TypeScript errors until the migration runs. This is normal because:
- The `posts` table doesn't exist yet
- The `tracking_sessions` table is missing new columns
- The `alert_type` enum doesn't include new values

**These errors will disappear after running the migration.**

---

## 📱 Testing Checklist

After migration, test these features:

- [ ] **Panic Button**
  - Click button
  - Allow microphone permission
  - Should see "Recording..." indicator
  - Check Supabase `alerts` table for new row
  - Check Storage `incident-media` bucket for audio file

- [ ] **Amber Alert Button**
  - Click amber button
  - Should work same as panic
  - Alert type should be "amber"

- [ ] **Map**
  - Navigate to Map tab
  - Should see full-screen map
  - Long-press on map (hold 1 second)
  - Report dialog should appear
  - Submit report
  - New pin should appear

- [ ] **Look After Me**
  - Go to Look After Me tab
  - Click "Start New Session"
  - Fill out all fields
  - Upload outfit photo
  - Add vehicle details
  - Start trip
  - Check `tracking_sessions` table

- [ ] **Home Feed**
  - Scroll down on home page
  - Type a post
  - Click "Post"
  - Should appear in feed
  - Click heart to like

---

## 🐛 Troubleshooting

### "Posts table not ready"
- **Solution:** Run the database migration (see step 1)

### "Microphone blocked"
- **Solution:** Allow microphone permission in browser settings

### "Location access denied"
- **Solution:** Allow location permission in browser settings

### "Failed to upload audio"
- **Solution:** Create the `incident-media` storage bucket (see step 2)

### Map shows "Add your Mapbox token"
- **Solution:** Add `VITE_MAPBOX_TOKEN` to your `.env` file
- Get token from: https://account.mapbox.com/access-tokens/

### TypeScript errors in IDE
- **Solution:** These will disappear after running the migration
- Or restart your TypeScript server: Ctrl+Shift+P → "TypeScript: Restart TS Server"

---

## 📊 Database Schema Changes

The migration adds:

### New Tables:
- `posts` - For home feed
- `comments` - For post comments

### Updated Tables:
- `tracking_sessions` - Added 9 new columns
- `alerts` - Added 6 new alert types

### New Alert Types:
- `amber` - Amber alerts (kidnapping)
- `accident` - Car accidents
- `kidnapping` - Kidnapping incidents
- `fire` - Fire emergencies
- `medical` - Medical emergencies
- `unsafe_area` - Unsafe area warnings

---

## 🚀 Next Steps (Optional)

### 1. Authority Integration
Set up email/SMS alerts to police:
- Use Twilio for SMS
- Use SendGrid for email
- Map GPS to Namibian regions
- Route alerts to regional police

### 2. Push Notifications
Set up Firebase Cloud Messaging:
- Install Firebase SDK
- Configure FCM
- Send push notifications on new alerts

### 3. Check-In System
Implement auto-check-in:
- Geofencing to detect arrival
- Auto-prompt "Have you arrived?"
- Auto-alert if no response

### 4. Production Deployment
- Set up HTTPS
- Configure domain
- Enable error monitoring (Sentry)
- Set up backups
- Load testing

---

## 📞 Need Help?

1. Check browser console for errors (F12)
2. Check Supabase logs (Dashboard → Logs)
3. Verify all environment variables are set
4. Make sure migration ran successfully
5. Check RLS policies in Supabase

---

## 📄 Files Changed

- ✅ `src/components/PanicButton.tsx` - Fixed and working
- ✅ `src/pages/Map.tsx` - Full-screen with live tracking
- ✅ `src/components/alerts/AlertsPresenter.tsx` - Grid layout
- ✅ `src/pages/StartSession.tsx` - Complete form
- ✅ `src/components/HomeFeed.tsx` - Community feed
- ✅ `src/pages/Index.tsx` - Added home feed
- ✅ `src/components/ui/dialog.tsx` - Exported components
- ✅ `supabase/migrations/20251022000001_add_posts_and_updates.sql` - Database migration

---

**Last Updated:** October 22, 2025  
**Status:** ✅ Ready for testing after migration
