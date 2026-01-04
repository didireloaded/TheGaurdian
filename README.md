# Guardian - Community Safety App

Exported for Lovable.dev on 2026-01-05 00:36:14

## Quick Start on Lovable.dev

1. **Import this folder** into Lovable.dev
2. **Set environment variables** in Lovable settings:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_MAPBOX_TOKEN

3. **Setup Supabase**:
   - Create new Supabase project
   - Run migrations from supabase/migrations/ folder
   - Enable Row Level Security (RLS)
   - Create storage bucket: incident-media

4. **Start developing** - Lovable will auto-install dependencies

## Tech Stack

- React 18.3.1 + TypeScript 5.8.3
- Vite 5.4.19
- Tailwind CSS 3.4.17
- Supabase (Backend)
- Mapbox GL JS 3.15.0
- shadcn/ui components

## Project Structure

- src/pages/ - Route pages
- src/components/ - React components
- src/hooks/ - Custom hooks
- src/lib/ - Utilities
- supabase/migrations/ - Database schema

## Features

- Emergency alerts with GPS
- Live map with incident tracking
- Real-time chat/messaging
- Trip safety tracking
- Community feed
- Profile management
- Emergency contacts directory

---

Built for Namibia's community safety 🇳🇦
