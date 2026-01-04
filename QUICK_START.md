# Guardian App - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Run Database Migration (2 minutes)

1. Open https://supabase.com/dashboard
2. Select your Guardian project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Open file: `supabase/migrations/20251022000001_add_posts_and_updates.sql`
6. Copy ALL the SQL code
7. Paste into Supabase SQL Editor
8. Click **Run** button (or Ctrl+Enter)
9. Wait for "Success. No rows returned"

### Step 2: Create Storage Bucket (1 minute)

1. In Supabase Dashboard, click **Storage** (left sidebar)
2. Click **New bucket** button
3. Name: `incident-media`
4. Toggle **Public bucket** ON
5. Click **Create bucket**
6. Click on the new bucket
7. Click **Policies** tab
8. Click **New policy**
9. Choose **For full customization**
10. Policy name: `Allow authenticated uploads`
11. Allowed operation: **INSERT**
12. Target roles: `authenticated`
13. Click **Review** then **Save policy**
14. Repeat for SELECT with `public` role

### Step 3: Start the App (1 minute)

```bash
npm run dev
```

### Step 4: Test (1 minute)

1. Open http://localhost:8080
2. Click **Panic** button
3. Allow microphone permission
4. Should see "Recording..." indicator
5. Check Supabase → Table Editor → `alerts` table
6. Should see new row with your alert

## ✅ Done!

Your app is now fully functional with:
- ✅ Panic & Amber alert buttons
- ✅ Full-screen map with live tracking
- ✅ Alert grid layout
- ✅ Look After Me trip planning
- ✅ Home community feed

## 🐛 Troubleshooting

**"Posts table not ready"**
→ Run the migration (Step 1)

**"Microphone blocked"**
→ Allow microphone in browser settings

**"Location access denied"**
→ Allow location in browser settings

**Map shows "Add Mapbox token"**
→ Add `VITE_MAPBOX_TOKEN` to `.env` file

## 📚 More Info

- Full setup guide: `SETUP_INSTRUCTIONS.md`
- Implementation details: `README_IMPLEMENTATION.md`
- Developer spec: `GUARDIAN_DEV_SPEC.md`

---

**That's it! You're ready to use Guardian.**
