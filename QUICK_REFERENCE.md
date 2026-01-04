# Guardian App - Quick Reference Card

## 🚀 Setup (One Time)

```bash
# 1. Enable PostGIS in Supabase
Database → Extensions → Enable "postgis"

# 2. Run migration in SQL Editor
Copy: supabase/migrations/20251022000001_add_posts_and_updates.sql
Paste → Run

# 3. Create storage bucket
Storage → New bucket → "incident-media" (public)
```

## 📱 App URL

**Local:** http://localhost:8080  
**Mapbox Token:** ✅ Configured in `.env`

## 🎯 Main Features

| Feature | Location | Action |
|---------|----------|--------|
| **Panic Alert** | Home tab | Click red button |
| **Amber Alert** | Home tab | Click orange button |
| **Report Incident** | Map tab | Long-press map |
| **Start Trip** | Look After tab | Fill form + start |
| **Post Update** | Home tab (scroll down) | Type + post |
| **Call Police** | SOS tab | Tap call button |

## 🚨 Emergency Numbers

| Service | Number |
|---------|--------|
| Police | 10111 |
| Child Helpline | 116 |
| GBV Helpline | 106 |
| LifeLine | +264 61 226 889 |

## 🗺️ Alert Types

- 🔴 Panic - Emergency
- 🟠 Amber - Kidnapping
- 🟠 Robbery - Theft
- 🔴 Assault - Attack
- 🟡 Accident - Car crash
- 🔴 Fire - Fire emergency
- 🔵 Medical - Health emergency
- 🟣 Suspicious - Suspicious activity
- 🔴 Unsafe Area - Danger zone
- 🟠 House Breaking - Break-in

## 📊 Database Tables

| Table | Purpose |
|-------|---------|
| `posts` | Community feed |
| `comments` | Post comments |
| `alerts` | All alerts |
| `tracking_sessions` | Look After Me trips |
| `profiles` | User profiles |
| `messages` | Chat messages |

## 🔐 Permissions Needed

- ✅ Microphone (for audio recording)
- ✅ Location (for GPS tracking)
- ✅ Camera (for outfit photos)

## 🐛 Quick Fixes

| Problem | Solution |
|---------|----------|
| "Posts not ready" | Run migration |
| "Microphone blocked" | Allow in browser settings |
| "Location denied" | Allow in browser settings |
| "Upload failed" | Create storage bucket |
| Map shows token error | Already fixed in `.env` |

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/components/PanicButton.tsx` | Panic/Amber buttons |
| `src/pages/Map.tsx` | Live map |
| `src/pages/Authorities.tsx` | Emergency contacts |
| `src/components/HomeFeed.tsx` | Community feed |
| `src/pages/StartSession.tsx` | Trip planning |

## 🎨 Color Codes

| Color | Meaning |
|-------|---------|
| 🔴 Red | Emergency/Danger |
| 🟠 Orange/Amber | Urgent/Warning |
| 🟢 Green | Safe/Active |
| 🔵 Blue | Info/Medical |
| 🟣 Purple | Suspicious |
| 🟡 Yellow | Caution |

## 📞 Regional Police

| Region | Phone | Mobile |
|--------|-------|--------|
| Khomas | +264 61 209 4217 | +264 81 376 5014 |
| Erongo | +264 64 219 001 | +264 81 81 663 7830 |
| Hardap | +264 63 341 2001 | +264 81 124 3174 |
| HQ | +264 61 209 3111 | - |

## 🧪 Test Checklist

- [ ] Click Panic button → records audio
- [ ] Click Amber button → records audio
- [ ] Long-press map → report dialog
- [ ] Create post → appears in feed
- [ ] Start trip → saves to database
- [ ] Call police → opens dialer

## 📚 Documentation

- `README.md` - Main documentation
- `MIGRATION_GUIDE.md` - Setup guide
- `FINAL_IMPLEMENTATION.md` - Feature list
- `ENABLE_POSTGIS.md` - PostGIS setup

## 🚀 Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## ✅ Status

- ✅ All features implemented
- ✅ Mapbox configured
- ✅ Database schema ready
- ✅ Security policies set
- ✅ Authorities loaded
- ⏳ Migration pending (run once)

---

**Quick Help:** See MIGRATION_GUIDE.md for detailed setup  
**Emergency:** Call 10111 (Police) or 116 (Child Helpline)  
**App Status:** ✅ Ready to use after migration
