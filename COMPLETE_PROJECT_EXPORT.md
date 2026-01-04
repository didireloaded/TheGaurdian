# Guardian - Complete Project Export

**Date**: November 4, 2025  
**Version**: 1.0.0  
**Total Files**: 176 (excluding node_modules, .git)

---

## 📦 Quick Start for New Project

### 1. Copy These Files/Folders
```
✅ REQUIRED - Copy these to your new project:
├── src/                          # All source code
├── supabase/                     # Database migrations & config
├── public/                       # Static assets
├── package.json                  # Dependencies
├── vite.config.ts               # Build configuration
├── tailwind.config.ts           # Styling configuration
├── tsconfig.json                # TypeScript config
├── tsconfig.app.json            # App TypeScript config
├── tsconfig.node.json           # Node TypeScript config
├── postcss.config.js            # PostCSS config
├── eslint.config.js             # Linting config
├── components.json              # shadcn/ui config
├── index.html                   # Entry HTML
└── .gitignore                   # Git ignore rules

❌ DO NOT COPY:
├── node_modules/                # Reinstall with npm install
├── .git/                        # Create new git repo
├── bun.lockb                    # Will regenerate
├── package-lock.json            # Will regenerate
├── .env                         # Create new with your credentials
└── *.md files                   # Documentation (optional)
```

### 2. Setup Commands
```bash
# Install dependencies
npm install

# Create .env file with your credentials
# (see Environment Variables section below)

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🗂️ Complete Directory Structure

```
guardian/
│
├── 📁 src/                                    # SOURCE CODE
│   ├── main.tsx                              # App entry point
│   ├── App.tsx                               # Root component with routing
│   ├── App.css                               # Global styles
│   ├── index.css                             # Tailwind + CSS variables
│   ├── vite-env.d.ts                         # Vite types
│   │
│   ├── 📁 pages/                             # ROUTE PAGES
│   │   ├── Index.tsx                         # Home (panic + feed)
│   │   ├── Auth.tsx                          # Login/Signup
│   │   ├── Map.tsx                           # Live map view
│   │   ├── Alerts.tsx                        # Alert grid
│   │   ├── Chat.tsx                          # Direct messages
│   │   ├── Profile.tsx                       # User profile
│   │   ├── Settings.tsx                      # App settings
│   │   ├── LookAfterMe.tsx                   # Trip safety overview
│   │   ├── StartSession.tsx                  # Trip planning
│   │   ├── Authorities.tsx                   # Emergency contacts
│   │   └── NotFound.tsx                      # 404 page
│   │
│   ├── 📁 components/                        # COMPONENTS
│   │   ├── PanicButton.tsx                   # Emergency button
│   │   ├── PanicModal.tsx                    # Panic confirmation modal
│   │   ├── HomeFeed.tsx                      # Community feed
│   │   ├── Navigation.tsx                    # Bottom nav bar
│   │   ├── Onboarding.tsx                    # First-time user flow
│   │   ├── EmergencyContactsWidget.tsx       # Quick contacts
│   │   ├── CheckInReminder.tsx               # Look After Me reminders
│   │   ├── SwipeConfirm.tsx                  # Swipe UI pattern
│   │   ├── LoadingSpinner.tsx                # Loading state
│   │   ├── ErrorBoundary.tsx                 # Error handling
│   │   ├── ProtectedRoute.tsx                # Auth-required routes
│   │   ├── PublicRoute.tsx                   # Public-only routes
│   │   │
│   │   ├── 📁 alerts/                        # Alert components
│   │   │   ├── AlertsPresenter.tsx           # Alert display logic
│   │   │   ├── AlertCard.tsx                 # Individual alert card
│   │   │   ├── AlertFilters.tsx              # Filter controls
│   │   │   └── AlertMap.tsx                  # Map integration
│   │   │
│   │   ├── 📁 chat/                          # Chat components
│   │   │   ├── ChatList.tsx                  # Conversation list
│   │   │   ├── ChatWindow.tsx                # Message thread
│   │   │   ├── MessageBubble.tsx             # Individual message
│   │   │   └── ChatInput.tsx                 # Message composer
│   │   │
│   │   ├── 📁 look-after-me/                 # Trip safety components
│   │   │   ├── SessionCard.tsx               # Active trip card
│   │   │   ├── SessionForm.tsx               # Trip creation form
│   │   │   └── CheckInButton.tsx             # Manual check-in
│   │   │
│   │   └── 📁 ui/                            # shadcn/ui COMPONENTS
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── aspect-ratio.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── carousel.tsx
│   │       ├── checkbox.tsx
│   │       ├── collapsible.tsx
│   │       ├── command.tsx
│   │       ├── context-menu.tsx
│   │       ├── dialog.tsx
│   │       ├── drawer.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── hover-card.tsx
│   │       ├── input-otp.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── menubar.tsx
│   │       ├── navigation-menu.tsx
│   │       ├── popover.tsx
│   │       ├── progress.tsx
│   │       ├── radio-group.tsx
│   │       ├── resizable.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── slider.tsx
│   │       ├── switch.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       ├── toggle-group.tsx
│   │       ├── toggle.tsx
│   │       └── tooltip.tsx
│   │
│   ├── 📁 hooks/                             # CUSTOM HOOKS
│   │   ├── use-auth.ts                       # Authentication
│   │   ├── use-alerts.ts                     # Alert operations
│   │   ├── use-chat.ts                       # Chat/messaging
│   │   ├── use-look-after-me.ts              # Trip tracking
│   │   ├── use-monitoring.ts                 # Error tracking
│   │   ├── use-mobile.tsx                    # Mobile detection
│   │   └── use-toast.ts                      # Toast notifications
│   │
│   ├── 📁 contexts/                          # REACT CONTEXTS
│   │   └── AuthContext.tsx                   # Global auth state
│   │
│   ├── 📁 integrations/                      # THIRD-PARTY INTEGRATIONS
│   │   └── 📁 supabase/
│   │       ├── client.ts                     # Supabase client
│   │       ├── types.ts                      # Database types
│   │       └── 📁 queries/
│   │           ├── alerts.ts                 # Alert queries
│   │           ├── chat.ts                   # Chat queries
│   │           ├── profiles.ts               # Profile queries
│   │           └── sessions.ts               # Session queries
│   │
│   └── 📁 lib/                               # UTILITIES
│       ├── utils.ts                          # General utilities
│       ├── component-factory.tsx             # Dynamic components
│       └── 📁 monitoring/
│           ├── index.ts                      # Monitoring setup
│           └── error-tracker.ts              # Error tracking
│
├── 📁 supabase/                              # SUPABASE CONFIG
│   ├── config.toml                           # Project configuration
│   └── 📁 migrations/                        # Database migrations
│       ├── 20250101000000_enable_postgis.sql
│       ├── 20250102000000_create_profiles.sql
│       ├── 20250103000000_create_alerts.sql
│       ├── 20250104000000_create_tracking_sessions.sql
│       ├── 20250105000000_create_emergency_contacts.sql
│       ├── 20250106000000_add_posts_and_updates.sql
│       ├── 20250129000000_create_chat_tables.sql
│       └── [more migrations...]
│
├── 📁 public/                                # STATIC ASSETS
│   ├── favicon.ico                           # App icon
│   ├── placeholder.svg                       # Placeholder images
│   └── robots.txt                            # SEO config
│
├── 📄 index.html                             # Entry HTML file
├── 📄 package.json                           # Dependencies & scripts
├── 📄 vite.config.ts                         # Vite configuration
├── 📄 tailwind.config.ts                     # Tailwind configuration
├── 📄 tsconfig.json                          # TypeScript config (root)
├── 📄 tsconfig.app.json                      # App TypeScript config
├── 📄 tsconfig.node.json                     # Node TypeScript config
├── 📄 postcss.config.js                      # PostCSS configuration
├── 📄 eslint.config.js                       # ESLint configuration
├── 📄 components.json                        # shadcn/ui configuration
├── 📄 .gitignore                             # Git ignore rules
├── 📄 .env                                   # Environment variables (create new)
└── 📄 README.md                              # Project documentation
```

---

## 🔧 Configuration Files

### package.json
- **176 total files** in project
- **React 18.3.1** + **TypeScript 5.8.3**
- **Vite 5.4.19** for bundling
- **Supabase** for backend
- **Radix UI** + **shadcn/ui** for components
- **Tailwind CSS 3.4.17** for styling
- **React Router 6.30.1** for routing
- **TanStack Query 5.83.0** for data fetching
- **Mapbox GL 3.15.0** for maps

### vite.config.ts
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### tailwind.config.ts
- Custom design tokens (HSL colors)
- Emergency-themed gradients
- Custom animations (pulse-glow, slide-up, fade-in)
- 12px border radius
- Dark mode support

### tsconfig.json
- Path aliases: `@/*` → `./src/*`
- Relaxed strictness for rapid development
- ES modules
- Skip lib checks

---

## 🌍 Environment Variables (.env)

Create a new `.env` file with:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Mapbox
VITE_MAPBOX_TOKEN=your_mapbox_access_token

# Optional: Other service credentials
```

---

## 🗄️ Database Schema Overview

### Core Tables
1. **profiles** - User profiles (extends auth.users)
2. **alerts** - Emergency alerts with location
3. **tracking_sessions** - Look After Me trips
4. **emergency_contacts** - Regional emergency numbers
5. **posts** - Community feed posts
6. **post_updates** - Comments on posts
7. **conversations** - Chat conversations
8. **messages** - Chat messages
9. **conversation_participants** - Chat participants

### Key Features
- PostGIS enabled for geospatial data
- Row Level Security (RLS) on all tables
- UUID primary keys
- Foreign keys to auth.users
- Realtime subscriptions enabled

---

## 📱 Key Features to Adapt

### 1. Emergency Alerts System
- **Files**: `src/components/PanicButton.tsx`, `src/components/PanicModal.tsx`
- **Hook**: `src/hooks/use-alerts.ts`
- **Database**: `alerts` table
- **Features**: Audio recording, GPS tracking, real-time updates

### 2. Live Map Integration
- **File**: `src/pages/Map.tsx`
- **Library**: Mapbox GL JS
- **Features**: Live user tracking, incident pins, clustering

### 3. Look After Me (Trip Safety)
- **Files**: `src/pages/LookAfterMe.tsx`, `src/pages/StartSession.tsx`
- **Hook**: `src/hooks/use-look-after-me.ts`
- **Database**: `tracking_sessions` table
- **Features**: Destination tracking, auto-alerts, check-ins

### 4. Community Feed
- **File**: `src/components/HomeFeed.tsx`
- **Database**: `posts`, `post_updates` tables
- **Features**: Instagram-style feed, comments, reactions

### 5. Chat/Messaging
- **File**: `src/pages/Chat.tsx`
- **Hook**: `src/hooks/use-chat.ts`
- **Database**: `conversations`, `messages` tables
- **Features**: Direct messages, real-time updates

### 6. Authentication
- **File**: `src/pages/Auth.tsx`
- **Hook**: `src/hooks/use-auth.ts`
- **Context**: `src/contexts/AuthContext.tsx`
- **Features**: Email/phone auth, OAuth, profile management

---

## 🎨 Design System

### Color Scheme
- Emergency red theme
- Dark mode support
- HSL color variables
- Custom gradients with glow effects

### Components
- 40+ shadcn/ui components
- Custom emergency-themed components
- Responsive mobile-first design
- Smooth animations and transitions

### Typography
- System font stack
- Responsive sizing
- Accessibility-focused

---

## 🚀 Deployment Checklist

### Before Deploying
1. ✅ Set up Supabase project
2. ✅ Run all migrations in order
3. ✅ Configure RLS policies
4. ✅ Set up storage buckets
5. ✅ Add environment variables
6. ✅ Test authentication flow
7. ✅ Test real-time subscriptions
8. ✅ Configure Mapbox token
9. ✅ Test on mobile devices
10. ✅ Run production build

### Build Commands
```bash
npm run build          # Production build
npm run preview        # Test production build locally
```

---

## 📝 Adaptation Guide

### To Adapt This Code for Your New Idea:

#### 1. **Rename & Rebrand**
- Update `package.json` name
- Change app title in `index.html`
- Update favicon and assets in `public/`
- Modify color scheme in `tailwind.config.ts`

#### 2. **Modify Core Features**
- Keep: Auth system, real-time updates, map integration (if needed)
- Adapt: Alert types, feed content, tracking features
- Remove: Emergency-specific features you don't need

#### 3. **Database Schema**
- Review `supabase/migrations/` files
- Modify tables to match your data model
- Keep RLS patterns for security
- Adjust relationships as needed

#### 4. **UI Components**
- Keep: shadcn/ui component library
- Adapt: Custom components to your theme
- Modify: Navigation, layouts, page structure

#### 5. **Business Logic**
- Review hooks in `src/hooks/`
- Adapt queries in `src/integrations/supabase/queries/`
- Modify state management as needed

---

## 📦 What Makes This Codebase Reusable

### ✅ Strong Foundation
- Modern React + TypeScript setup
- Production-ready build configuration
- Comprehensive component library
- Real-time data synchronization
- Mobile-responsive design

### ✅ Clean Architecture
- Feature-based organization
- Separation of concerns
- Reusable hooks and utilities
- Type-safe database queries

### ✅ Best Practices
- Error boundaries
- Loading states
- Protected routes
- Form validation
- Accessibility features

---

## 🎯 Next Steps

1. **Copy the project structure** (see Quick Start section)
2. **Install dependencies**: `npm install`
3. **Set up your Supabase project**
4. **Create `.env` file** with your credentials
5. **Run migrations** in your Supabase project
6. **Start adapting** features to your new idea
7. **Test thoroughly** before deploying

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **Tailwind CSS**: https://tailwindcss.com
- **shadcn/ui**: https://ui.shadcn.com
- **Mapbox GL JS**: https://docs.mapbox.com/mapbox-gl-js

---

**Generated**: November 4, 2025  
**Project**: Guardian v1.0.0  
**Total Files**: 176 (excluding node_modules, .git)
