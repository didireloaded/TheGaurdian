# Guardian App - Complete Developer Specification

**Project Name:** Guardian  
**Platform:** React Native / Web (Current: React + Vite + Supabase)  
**Purpose:** Real-time community safety network for Namibia  
**Target:** Android, iOS, Web

---

## 🎯 Executive Summary

Guardian is a community-driven emergency safety app designed to combat robberies, kidnappings, assaults, and other crimes in Namibia. The app enables instant alerts, live location tracking, audio recording, community reporting, and direct integration with local authorities (NAMPOL).

---

## 🚨 CRITICAL FIXES NEEDED

### 1. **PANIC BUTTON** (HIGH PRIORITY)
**Current Issue:** Button does not respond when clicked.

**Required Behavior:**
- **First Press:**
  - Start audio recording IMMEDIATELY (no confirmation dialog)
  - Capture current GPS location (latitude, longitude)
  - Begin background recording service (continues even if app is minimized)
  - Show visual indicator: small red blinking dot + "Recording..." text
  - Trigger push notification to:
    - All users within 10-15km radius
    - User's emergency contacts
    - Regional police dispatch (based on GPS → region mapping)
  - Log alert to database with:
    - `user_id`
    - `alert_type: 'panic'`
    - `location` (PostGIS POINT)
    - `location_name` (reverse geocoded address)
    - `audio_url` (uploaded to storage)
    - `timestamp`

- **Second Press (Stop):**
  - Stop audio recording
  - Save recording locally first (in case of poor network)
  - Upload audio file to Supabase Storage (`incident-media` bucket)
  - Update alert record with audio URL
  - Show confirmation: "Alert sent successfully" + vibration feedback
  - Clear recording state

**Technical Requirements:**
- Use `MediaRecorder` API (web) or `react-native-audio-recorder-player` (mobile)
- Implement 30-second rolling buffer (keep last 30s of audio)
- Request microphone permission on first use
- Handle offline mode: queue alert for upload when connection returns
- Background service for Android (foreground notification)
- iOS: enable background audio mode in Info.plist

---

### 2. **AMBER ALERT BUTTON** (HIGH PRIORITY)
**Current Issue:** Button does not work.

**Purpose:** For kidnapping, missing persons, or critical emergencies.

**Required Behavior:**
- Placed **next to Panic Button** on home screen
- **Color:** Amber/Orange (#F59E0B)
- **Icon:** Shield with exclamation mark
- **On Press:**
  - Start audio recording (same as Panic)
  - Capture GPS location
  - Send **broadcast alert** to:
    - ALL users within 50km radius (wider than panic)
    - Local police dispatch
    - Emergency contacts
  - Create **Amber Alert post** visible on:
    - Map (with amber-colored pin)
    - Community Feed (pinned to top)
    - Alert Tab (marked as "CRITICAL")
  - Include in alert:
    - User's name
    - Profile photo
    - Last known location
    - Outfit details (if provided in profile)
    - Vehicle details (if provided)
    - Timestamp
  - Alert stays **pinned on map** until manually cleared by admin or authorities

**Visual Design:**
- Pulsing amber ring animation when active
- Large button (same size as Panic: 160x160px)
- Text: "AMBER ALERT"

---

## 🗺️ MAP TAB (COMPLETE REDESIGN)

### Current Issues:
- Map is small (only 256px height)
- "Recent Alerts" list takes up most of screen
- No live user tracking
- No incident reporting from map

### Required Changes:

#### **Full-Screen Map View**
- Map should occupy **100% of screen height** (minus header and bottom nav)
- Remove "Recent Alerts" list entirely from this tab
- Use Mapbox GL JS for web / Mapbox SDK for mobile
- Default center: Windhoek, Namibia (-22.5609, 17.0834)
- Default zoom: 12 (city level)

#### **Live User Tracking**
- Show real-time location of all active users (who have visibility enabled)
- User markers:
  - **Color:** Green (#22C55E)
  - **Size:** 14px circle
  - **Animation:** Subtle pulse every 2 seconds
  - **Popup on click:** Username, status ("Active", "Look After Me", etc.)
- Update user positions every 5 seconds via WebSocket/Supabase Realtime
- Users can toggle "Ghost Mode" in settings to hide their location

#### **Incident Pins**
Users can report incidents by:
1. **Long-press on map** → Opens incident report modal
2. **Tap "Report" button** (floating action button, bottom-right)

**Incident Types:**
- Robbery
- Assault
- Car Accident
- Suspicious Activity
- Unsafe Area
- Kidnapping
- House Breaking
- Fire
- Medical Emergency

**Pin Colors:**
- Panic/Assault: Red (#EF4444)
- Amber Alert: Amber (#F59E0B)
- Robbery: Orange (#F97316)
- Accident: Yellow (#EAB308)
- Suspicious: Purple (#A855F7)
- Safe Zone: Green (#22C55E)

**Pin Behavior:**
- Clicking pin shows popup with:
  - Incident type
  - Description (max 150 chars)
  - Reporter name (or "Anonymous")
  - Time ago (e.g., "5 mins ago")
  - Distance from user (e.g., "1.2 km away")
  - Photo (if attached)
  - "View Details" button → opens full alert page

#### **Real-Time Notifications**
- When new incident is reported within user's region (10-15km):
  - Push notification: "🚨 [Incident Type] reported 2km away"
  - Map pin appears immediately (via Supabase Realtime)
  - Optional: play alert sound (user can disable in settings)

#### **Map Controls**
- **Top-right:**
  - Zoom in/out buttons
  - "Center on me" button (GPS icon)
  - "Toggle satellite view" button
- **Bottom-left:**
  - Legend (shows what each pin color means)

---

## 🚨 ALERT TAB (REDESIGN)

### Current Issues:
- Alert cards are too large
- Takes up too much vertical space
- No grid layout

### Required Changes:

#### **Compact Grid Layout**
- Display alerts in **2-column grid** (mobile) or **3-column grid** (tablet/desktop)
- Each alert card:
  - **Size:** 160x180px
  - **Border-radius:** 12px
  - **Border-left:** 4px solid (color based on alert type)
  - **Content:**
    - Icon (top, 32x32px)
    - Alert type (bold, 14px)
    - Location (12px, truncated)
    - Time ago (10px, muted)
    - Distance (10px, muted)
  - **On click:** Opens full alert detail page

#### **Alert Detail Page**
When user taps an alert card:
- Full-screen modal/page with:
  - Large map showing incident location
  - Alert type badge
  - Full description
  - Reporter info (name, profile pic)
  - Timestamp
  - Audio player (if audio attached)
  - Photo gallery (if photos attached)
  - Comments section (users can comment)
  - "I'm nearby" button (notifies reporter)
  - "Share" button
  - "Report false alert" button

#### **DM Icon**
- **Position:** Top-left corner of Alert screen header
- **Icon:** Message bubble with unread count badge
- **On click:** Opens Direct Messages list
- **Unread indicator:** Red dot if new messages

---

## 🫶 LOOK AFTER ME TAB (MAJOR UPDATE)

### Current Implementation:
Basic tracking session with start/end buttons.

### Required Features:

#### **Trip Planning Form**
User must fill out before starting "Look After Me" mode:

**Required Fields:**
1. **Destination**
   - Searchable location input (Mapbox Geocoding API)
   - Shows map preview of route
   - Auto-calculates distance and estimated travel time

2. **Departure Time**
   - DateTime picker
   - Default: current time
   - Can schedule for future

3. **Expected Arrival Time**
   - DateTime picker
   - Auto-calculated based on distance
   - User can adjust

4. **Companions** (optional)
   - Add one or more people traveling with you
   - Fields per companion:
     - Name
     - Phone number
     - Relationship (dropdown: Friend, Family, Colleague, Other)

5. **Vehicle Details** (if driving)
   - Make (e.g., "Toyota")
   - Model (e.g., "Corolla")
   - Color (e.g., "Silver")
   - License Plate (e.g., "N 12345 W")

6. **Outfit Photo & Description**
   - **Upload full-length photo** (for identification)
   - **Text description** (e.g., "Blue jeans, red jacket, white sneakers")
   - **Purpose:** Helps authorities/community identify user if emergency occurs

7. **Late/Stay Options**
   - Checkbox: "I might be late"
   - Checkbox: "I'm staying overnight"
   - If checked, system won't auto-alert if user doesn't arrive on time

#### **Active Trip Behavior**
Once user starts trip:
- **Live location tracking** (updates every 10 seconds)
- **Route visualization** on map (blue line from start to destination)
- **ETA countdown** (updates based on current location)
- **Watchers can see:**
  - User's live location (green dot moving on map)
  - Current speed (if moving)
  - Battery level (if low, shows warning)
  - Last update time

#### **Check-In System**
- When user reaches destination (within 100m radius):
  - Auto-prompt: "Have you arrived safely?"
  - User taps "Yes, I'm safe"
  - **Notification sent to:**
    - All watchers
    - Emergency contacts
    - Community feed (if public trip)
  - Message: "[Name] has arrived safely at [Destination]"

- If user doesn't check in within 15 minutes of expected arrival:
  - **Auto-alert triggered:**
    - Push notification to watchers: "⚠️ [Name] hasn't checked in"
    - SMS to emergency contacts
    - Alert appears on map (yellow pin)
    - Authorities notified (if enabled)

#### **Late/Extended Stay**
- User can tap "I'm Running Late" button
  - Opens dialog: "How much longer?" (15min, 30min, 1hr, 2hr+)
  - Updates ETA
  - Notifies watchers: "[Name] will be late by [X] minutes"

- User can tap "I'm Staying Here" button
  - Pauses check-in timer
  - Notifies watchers: "[Name] is staying at [Location]"
  - User must manually end trip later

---

## 🏠 HOME FEED (NEW FEATURE)

### Location:
- **Below "Look After Me" button** on home screen
- Scrollable vertical feed

### Purpose:
Community space for safety updates, similar to Instagram but focused on local safety.

### Features:

#### **Post Types:**
1. **Text Post**
   - Max 500 characters
   - Auto-tagged with user's approximate location (e.g., "Windhoek, Khomas")

2. **Photo Post**
   - Up to 4 photos per post
   - Caption (optional, max 300 chars)
   - Location tag

3. **Video Post** (optional, Phase 2)
   - Max 60 seconds
   - Caption

4. **Incident Report**
   - Quick report with predefined categories
   - Auto-includes location pin on map

#### **Post Layout:**
Each post card shows:
- **Header:**
  - Profile picture (40x40px, circular)
  - Username
  - Time ago (e.g., "2h ago")
  - Distance from user (e.g., "3km away")
  - Three-dot menu (Report, Block, etc.)

- **Content:**
  - Text/Caption
  - Photo(s) - swipeable carousel if multiple
  - Location tag (clickable → opens map)

- **Footer:**
  - Like button (heart icon) + count
  - Comment button (speech bubble) + count
  - Share button (arrow icon)

#### **Engagement:**
- **Like:** Tap heart icon (turns red, animates)
- **Comment:** Opens comment sheet
  - Nested comments (1 level deep)
  - Can like comments
  - Can reply to comments
- **Share:** 
  - Share within app (send to DM)
  - Copy link
  - Share to external apps (WhatsApp, etc.)

#### **Feed Sorting:**
- Default: **Closest + Most Recent**
  - Posts from nearest users appear first
  - Within same distance, sort by newest
- User can toggle to:
  - "Most Recent" (ignore distance)
  - "Most Popular" (most likes/comments in last 24h)

#### **Filters:**
- "All Posts"
- "My Area Only" (within 5km)
- "Urgent Alerts" (only incident reports)
- "Following" (users you follow)

#### **Moderation:**
- Users can report posts (spam, false info, inappropriate)
- Admins can remove posts
- Auto-hide posts with 5+ reports (pending review)

---

## ☎️ AUTHORITY INTEGRATION

### Goal:
Automatically route alerts to nearest police/fire/medical dispatch.

### Implementation:

#### **Region Detection:**
Use GPS coordinates to determine user's region:
- Khomas → Windhoek Police
- Erongo → Swakopmund Police
- etc.

**Region Mapping Table:**
```javascript
const NAMPOL_CONTACTS = {
  'Khomas': {
    name: 'Khomas Police',
    phone: '+264612094217',
    mobile: '+264813765014',
    email: 'wdsteenkamp@nampol.na'
  },
  'Erongo': {
    name: 'Erongo Police',
    phone: '+26464219001',
    mobile: '+26481816637830',
    email: 'nkupembona@nampol.na'
  },
  // ... all 14 regions
  'default': {
    name: 'NAMPOL HQ',
    phone: '+264612093111',
    email: 'communications@nampol.na'
  }
};
```

#### **Alert Routing:**
When panic/amber alert is triggered:
1. Get user's GPS coordinates
2. Reverse geocode to get region name
3. Look up regional police contact
4. Send alert via:
   - **Email** (structured alert with location, audio, photo)
   - **SMS** (concise summary + tracking link)
   - **Webhook** (if police have integrated API)

#### **Email Template:**
```
Subject: 🚨 Guardian Alert: [Alert Type] in [Region]

Incident Type: [Panic / Amber Alert / Robbery]
Date & Time: [19 Oct 2025, 17:45 UTC+2]
Location: [Latitude, Longitude]
Address: [Reverse geocoded address]
Map Link: https://maps.google.com/?q=[lat],[lng]

Reporter: [User Name] (ID: [user_id])
Phone: [User Phone]

Evidence:
- Audio Recording: [Download Link]
- Photo: [Download Link]

This alert was automatically generated by Guardian Safety App.
View full details: https://guardian.na/alert/[alert_id]
```

#### **SMS Template:**
```
GUARDIAN ALERT: [Type] at [Address]. 
Location: [Short Link]
Audio: [Short Link]
Contact: [Phone]
```

#### **Authority Dashboard** (Web Portal)
Separate web app for verified police/fire/medical personnel:

**Features:**
- Login with 2FA
- Real-time alert feed (filtered by region)
- Map view of all active alerts
- Audio playback
- Photo viewer
- "Mark as Responding" button
- "Mark as Resolved" button
- Export incident report (PDF)
- Analytics (alerts per day, response times, etc.)

**Access Control:**
- Regional commanders see only their region
- National HQ sees all regions
- Audit log of all actions

---

## 💬 COMMUNITY CHAT & DM

### Community Chat:
- **Location:** Alert Tab → "Community" section
- **Purpose:** Open group discussion for local safety updates
- **Features:**
  - Real-time messaging (Socket.io or Supabase Realtime)
  - Area-based channels (e.g., "Windhoek Central", "Swakopmund")
  - Users auto-join channel based on GPS location
  - Can post text, photos, location pins
  - Typing indicators
  - Read receipts (optional)
  - Moderation (admins can mute/ban users)

### Direct Messages (DM):
- **Access:** DM icon (top-left of Alert screen)
- **Features:**
  - One-on-one private chat
  - End-to-end encryption (optional, Phase 2)
  - Send text, photos, voice notes
  - Share location (live or static)
  - Delivery status (sent, delivered, read)
  - Block/report users
  - Delete messages (for self or both)

---

## 🔧 TECHNICAL STACK

| Component | Technology |
|-----------|-----------|
| **Frontend** | React + Vite + TypeScript (current) or React Native (mobile) |
| **Backend** | Supabase (PostgreSQL + Realtime + Storage + Auth) |
| **Database** | PostgreSQL with PostGIS extension |
| **Realtime** | Supabase Realtime (WebSocket) |
| **Storage** | Supabase Storage (audio, photos, videos) |
| **Map** | Mapbox GL JS (web) / Mapbox SDK (mobile) |
| **Auth** | Supabase Auth (email/phone + OAuth) |
| **Push Notifications** | Firebase Cloud Messaging (FCM) or Expo Push |
| **SMS** | Twilio or Africa's Talking |
| **Email** | SendGrid or AWS SES |
| **Hosting** | Vercel (web) / Expo (mobile) |

---

## 📊 DATABASE SCHEMA

### Key Tables:

#### `profiles`
```sql
- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- full_name (text)
- phone (text)
- profile_photo_url (text)
- emergency_contact_1 (text)
- emergency_contact_2 (text)
- emergency_contact_3 (text)
- ghost_mode (boolean, default false)
- created_at (timestamp)
```

#### `alerts`
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- alert_type (text: 'panic', 'amber', 'robbery', etc.)
- location (geography(POINT))
- location_name (text)
- description (text)
- audio_url (text)
- photo_urls (text[])
- status (text: 'active', 'resolved', 'false_alarm')
- created_at (timestamp)
```

#### `tracking_sessions`
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- destination (geography(POINT))
- destination_name (text)
- departure_time (timestamp)
- expected_arrival (timestamp)
- actual_arrival (timestamp, nullable)
- current_location (geography(POINT))
- status (text: 'active', 'completed', 'emergency')
- outfit_photo_url (text)
- outfit_description (text)
- vehicle_make (text)
- vehicle_model (text)
- vehicle_color (text)
- vehicle_plate (text)
- companions (jsonb)
- created_at (timestamp)
```

#### `posts`
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- content (text)
- photo_urls (text[])
- location (geography(POINT))
- location_name (text)
- likes_count (int, default 0)
- comments_count (int, default 0)
- created_at (timestamp)
```

#### `comments`
```sql
- id (uuid, PK)
- post_id (uuid, FK)
- user_id (uuid, FK)
- parent_comment_id (uuid, nullable, FK to comments)
- content (text)
- likes_count (int, default 0)
- created_at (timestamp)
```

#### `direct_messages`
```sql
- id (uuid, PK)
- sender_id (uuid, FK)
- recipient_id (uuid, FK)
- content (text)
- photo_url (text, nullable)
- read_at (timestamp, nullable)
- created_at (timestamp)
```

---

## 🎨 UI/UX REQUIREMENTS

### Design System:
- **Primary Color:** Red (#EF4444) - for panic/emergency
- **Secondary Color:** Amber (#F59E0B) - for amber alerts
- **Success Color:** Green (#22C55E) - for safe status
- **Background:** Dark mode support
- **Typography:** Inter or System UI
- **Border Radius:** 12px (cards), 999px (buttons)
- **Shadows:** Subtle, elevation-based

### Accessibility:
- WCAG 2.1 AA compliant
- Screen reader support
- High contrast mode
- Large touch targets (min 44x44px)
- Haptic feedback on critical actions
- Voice control support (future)

### Performance:
- Map loads in <2 seconds
- Alert sends in <1 second
- Real-time updates <500ms latency
- Offline mode (queue actions, sync when online)
- Low-data mode (reduce image quality, disable auto-play)

---

## 🚀 DEVELOPMENT PHASES

### Phase 1: MVP (4-6 weeks)
- ✅ Fix Panic Button (audio recording + GPS + alert sending)
- ✅ Fix Amber Alert Button
- ✅ Full-screen Map with live user tracking
- ✅ Incident reporting from map
- ✅ Alert Tab grid layout
- ✅ Look After Me trip planning form
- ✅ Basic authority email integration
- ✅ DM system

### Phase 2: Community Features (3-4 weeks)
- Home Feed (posts, likes, comments)
- Community Chat
- Follow/Friend system
- Notifications (push + in-app)
- Profile customization

### Phase 3: Authority Integration (2-3 weeks)
- Authority Dashboard (web portal)
- SMS integration (Twilio)
- Webhook API for police systems
- Incident export (PDF)
- Analytics dashboard

### Phase 4: Advanced Features (4-6 weeks)
- AI audio analysis (detect distress)
- AI image moderation
- Predictive safety heatmap
- Wearable integration (smartwatch)
- Offline mode improvements

---

## 📝 TESTING REQUIREMENTS

### Unit Tests:
- Alert creation logic
- GPS coordinate handling
- Audio recording/upload
- Notification sending

### Integration Tests:
- End-to-end alert flow (panic → notification → database)
- Map pin creation and real-time updates
- DM delivery and read receipts

### User Acceptance Tests:
- Panic button responds within 1 second
- Audio recording captures clear audio
- Alerts reach nearby users within 5 seconds
- Map shows live user locations accurately

### Performance Tests:
- 1000+ concurrent users on map
- 100+ alerts per minute
- Audio upload with poor network

---

## 🔒 SECURITY & PRIVACY

### Data Protection:
- End-to-end encryption for DMs (Phase 2)
- Audio files encrypted at rest (AES-256)
- Location data anonymized after 30 days
- User can delete all data (GDPR compliance)

### Access Control:
- Row-level security (RLS) in Supabase
- Users can only see alerts in their region
- Ghost mode hides exact location
- Authority dashboard requires 2FA

### Abuse Prevention:
- Rate limiting (max 3 alerts per 15 minutes)
- False alert reporting
- Auto-ban after 5 false alerts
- Cooldown period after false alert

---

## 📞 SUPPORT & DOCUMENTATION

### User Documentation:
- In-app tutorial (first launch)
- Help center (FAQ)
- Video guides (YouTube)
- Safety tips

### Developer Documentation:
- API reference (Swagger/OpenAPI)
- Database schema diagram
- Architecture overview
- Deployment guide

---

## 🎯 SUCCESS METRICS

### Key Performance Indicators (KPIs):
- **Response Time:** Average time from alert to first responder < 5 minutes
- **False Alert Rate:** < 5%
- **User Retention:** 70% DAU/MAU ratio
- **Alert Success Rate:** 90% of alerts result in help/resolution
- **Authority Response Rate:** 80% of alerts acknowledged by police within 10 minutes

---

## 📧 CONTACT & HANDOVER

**Project Owner:** [Your Name]  
**Email:** [Your Email]  
**Phone:** [Your Phone]

**Development Team:**  
- Lead Developer: [TBD]
- Backend Developer: [TBD]
- Mobile Developer: [TBD]
- UI/UX Designer: [TBD]

**Timeline:** [Start Date] - [Target Launch Date]

---

## ✅ ACCEPTANCE CRITERIA

Before marking this project as complete, verify:

- [ ] Panic button starts recording and sends alert within 2 seconds
- [ ] Amber alert button works and broadcasts to 50km radius
- [ ] Map shows live user locations (updates every 5 seconds)
- [ ] Users can report incidents from map (long-press)
- [ ] Alert tab displays compact grid (2-3 columns)
- [ ] Look After Me form captures all required fields
- [ ] Check-in system auto-alerts if user doesn't arrive
- [ ] Home Feed displays posts with like/comment/share
- [ ] DM system delivers messages in real-time
- [ ] Authority email integration sends alerts to regional police
- [ ] Audio recording captures clear audio (tested in noisy environment)
- [ ] App works offline (queues actions, syncs when online)
- [ ] Ghost mode hides user location on map
- [ ] False alert reporting works
- [ ] All critical actions have haptic feedback

---

**END OF SPECIFICATION**

*Last Updated: [Date]*  
*Version: 1.0*
