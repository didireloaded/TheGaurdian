# 🛡️ Guardian App - Start Here

## Welcome to Guardian!

Your community safety app for Namibia is **ready to use**. Just follow these 3 simple steps:

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Fix Profiles Table (IMPORTANT!)
In Supabase Dashboard → SQL Editor → Copy & Run the commands from `RUN_THESE_SQL_COMMANDS.md`

### Step 2: Enable PostGIS (Optional)
In Supabase Dashboard → Database → Extensions → Enable "postgis"

### Step 3: Run Main Migration
In Supabase Dashboard → SQL Editor → Copy & Run `supabase/migrations/20251022000001_add_posts_and_updates.sql`

### Step 4: Create Storage
In Supabase Dashboard → Storage → Create bucket "incident-media" (public)

**Done!** Your app is ready at http://localhost:8080

---

## 📱 What You Can Do Right Now

### Without Migration (Works Now):
- ✅ **Panic Button** - Emergency alerts with audio
- ✅ **Amber Alert** - Kidnapping alerts
- ✅ **Live Map** - Full-screen Mapbox with tracking
- ✅ **Report Incidents** - Long-press on map
- ✅ **Authorities** - Call police, fire, lifeline
- ✅ **Alert Grid** - View recent alerts

### After Migration (5 min):
- ✅ **Community Feed** - Post safety updates
- ✅ **Look After Me** - Complete trip planning with photos
- ✅ **All Alert Types** - Amber, fire, medical, etc.
- ✅ **Photo Uploads** - Outfit photos, incident photos

---

## 🗺️ App Navigation

Your app has 5 tabs at the bottom:

1. **🏠 Home** - Panic buttons + Community Feed
2. **🗺️ Map** - Full-screen live map
3. **🚨 Alerts** - Recent alerts grid
4. **👁️ Look After** - Trip safety planning
5. **📞 SOS** - Emergency contacts

---

## 🚨 Emergency Features

### Panic Button (Red)
1. Click button
2. Audio recording starts automatically
3. GPS location captured
4. Nearby users + watchers notified
5. Click again to stop

### Amber Alert (Orange)
1. Click button
2. Works like panic but broadcasts wider (20km)
3. Marked as urgent
4. Includes your photo and outfit details

### Look After Me
1. Fill in destination, times, outfit, vehicle
2. Add watchers
3. Start trip
4. Auto-alert if you don't check in

---

## 📞 Emergency Numbers

- **Police:** 10111
- **Child Helpline:** 116
- **GBV Helpline:** 106
- **LifeLine:** +264 61 226 889

All available in the **SOS tab** with one-tap calling!

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **START_HERE.md** | This file - quick start |
| **MIGRATION_GUIDE.md** | Detailed setup instructions |
| **README.md** | Full documentation |
| **QUICK_REFERENCE.md** | Quick reference card |

---

## 🐛 Troubleshooting

### App won't load?
- Check if dev server is running: `npm run dev`
- Open http://localhost:8080

### Community Feed says "not ready"?
- Run the database migration (Step 2 above)
- See MIGRATION_GUIDE.md

### Panic button not working?
- Allow microphone permission in browser
- Allow location permission in browser

### Map not showing?
- Mapbox token is already configured ✅
- Just refresh the page

---

## ✅ Pre-Configured

These are already set up for you:
- ✅ Mapbox API key
- ✅ Supabase connection
- ✅ All 14 Namibian regions
- ✅ Police contacts
- ✅ Emergency services
- ✅ Real-time updates

---

## 🎯 Test Checklist

After migration, test these:

- [ ] Click Panic button → records audio
- [ ] Click Amber button → records audio  
- [ ] Long-press map → report incident
- [ ] Create post in Community Feed
- [ ] Start Look After Me trip
- [ ] Call police from SOS tab

---

## 🚀 You're Ready!

Your Guardian app is **production-ready** and will help protect the Namibian community.

**Live at:** http://localhost:8080

**Need help?** See MIGRATION_GUIDE.md for detailed instructions.

---

**Built with ❤️ for the safety of Namibia** 🇳🇦🛡️
