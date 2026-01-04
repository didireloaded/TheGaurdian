# Guardian - Community Safety App for Namibia 🇳🇦

A real-time community-driven emergency safety app that helps citizens respond quickly to robberies, assaults, and suspicious activities.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the app
npm run dev

# 3. Open browser
http://localhost:8080
```

## 📋 Setup Required

### 1. Enable PostGIS (Optional)
In Supabase Dashboard → Database → Extensions → Enable "postgis"

### 2. Run Database Migration
In Supabase Dashboard → SQL Editor → Run `supabase/migrations/20251022000001_add_posts_and_updates.sql`

### 3. Create Storage Bucket
In Supabase Dashboard → Storage → Create bucket named `incident-media` (public)

**See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for detailed instructions**

## ✨ Features

### 🚨 Emergency Alerts
- **Panic Button** - Instant audio recording + GPS tracking
- **Amber Alert** - Kidnapping/abduction emergencies
- One-tap alert to nearby users and authorities
- Real-time notifications within 5-10km radius

### 🗺️ Live Map
- Full-screen Mapbox integration
- Live user tracking (green pulsing dots)
- Report incidents (long-press on map)
- Color-coded incident pins
- Ghost Mode to hide location

### 🫶 Look After Me
- Trip safety planning
- Destination + time tracking
- Outfit photo + vehicle details
- Companion information
- Auto-alert if overdue

### 📱 Community Feed
- Instagram-style safety updates
- Share incidents and warnings
- Like, comment, share posts
- Location-tagged updates

### 📞 Authorities Directory
- Complete emergency contacts
- Police (all 14 regions)
- Fire Brigade
- LifeLine/ChildLine
- One-tap call/email

## 🎯 Navigation

- **Home** - Panic buttons + Community Feed
- **Map** - Full-screen live map
- **Alerts** - Recent alerts grid
- **Look After** - Trip planning
- **SOS** - Emergency contacts

## 🔐 Security

- ✅ Audio files encrypted
- ✅ Row Level Security (RLS)
- ✅ Ghost Mode for privacy
- ✅ Authenticated uploads only
- ✅ Location consent required

## 🛠️ Tech Stack

- **Frontend:** React + Vite + TypeScript
- **Backend:** Supabase (PostgreSQL + Realtime + Storage)
- **Map:** Mapbox GL JS
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Realtime:** Supabase Realtime (WebSocket)

## 📱 Alert Types

- Panic - Emergency situations
- Amber - Kidnapping/abduction
- Robbery - Theft incidents
- Assault - Physical attacks
- Accident - Car accidents
- Fire - Fire emergencies
- Medical - Medical emergencies
- Suspicious - Suspicious activity
- Unsafe Area - Dangerous zones
- House Breaking - Break-ins

## 🌍 Coverage

All 14 regions of Namibia:
- Khomas, Erongo, Hardap, !Karas
- Kavango East, Kavango West
- Kunene, Ohangwena, Omaheke
- Omusati, Oshana, Oshikoto
- Otjozondjupa, Zambezi

## 📞 Emergency Numbers

- **Police:** 10111
- **Child Helpline:** 116
- **GBV Helpline:** 106
- **LifeLine:** +264 61 226 889
- **Fire (Windhoek):** +264 61 211 111

## 📚 Documentation

- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Database setup
- [ENABLE_POSTGIS.md](ENABLE_POSTGIS.md) - PostGIS setup
- [FINAL_IMPLEMENTATION.md](FINAL_IMPLEMENTATION.md) - Complete feature list
- [GUARDIAN_DEV_SPEC.md](GUARDIAN_DEV_SPEC.md) - Full specification

## 🧪 Testing

```bash
# Run tests
npm test

# Check diagnostics
npm run lint
```

## 🚀 Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🤝 Contributing

This app is designed to protect the Namibian community. Contributions welcome!

## 📄 License

MIT License - See LICENSE file

## 🙏 Acknowledgments

- Namibian Police Force (NAMPOL)
- LifeLine/ChildLine Namibia
- Ministry of Health & Social Services
- All emergency responders

## 📧 Support

For issues or questions, check the documentation files or open an issue.

---

**Built with ❤️ for the safety of Namibia** 🇳🇦🛡️

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** October 22, 2025
