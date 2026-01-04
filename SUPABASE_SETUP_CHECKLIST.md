# 📋 Supabase Setup Checklist

## ✅ Already Completed

### Database Tables
- ✅ `profiles` - User profiles
- ✅ `alerts` - Panic/Amber alerts
- ✅ `incidents` - Incident reports
- ✅ `messages` - Chat messages
- ✅ `tracking_sessions` - Look After Me sessions
- ✅ `posts` - Community feed posts
- ✅ `comments` - Post comments
- ✅ `post_likes` - Post likes
- ✅ `comment_likes` - Comment likes

### Database Features
- ✅ PostGIS extension enabled
- ✅ Row Level Security (RLS) policies
- ✅ Real-time subscriptions
- ✅ Triggers for auto-counting
- ✅ Views (public_profiles)

---

## ⚠️ Still Needed

### 1. Storage Buckets

You need to create **ONE storage bucket** for all media:

#### Bucket: `incident-media`

**Used for:**
- Panic button audio recordings
- Amber alert audio recordings
- Look After Me outfit photos
- Community feed post photos (future)
- Profile avatars (future)

**How to create:**

1. Go to: https://supabase.com/dashboard/project/wiqbhfwmpyjahaxmwxzg/storage/buckets

2. Click **"New bucket"**

3. Configure:
   ```
   Name: incident-media
   Public: ✅ Yes (make files publicly accessible)
   File size limit: 50 MB
   Allowed MIME types: 
     - image/jpeg
     - image/png
     - image/webp
     - audio/webm
     - audio/mpeg
     - audio/wav
   ```

4. Click **"Create bucket"**

5. **Set bucket policies** (click on bucket → Policies):
   ```sql
   -- Allow authenticated users to upload
   CREATE POLICY "Authenticated users can upload"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'incident-media');

   -- Allow public read access
   CREATE POLICY "Public can view files"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'incident-media');

   -- Allow users to delete their own files
   CREATE POLICY "Users can delete own files"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'incident-media' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

---

### 2. Authentication Settings (Optional Enhancements)

**Current Status:** ✅ Basic auth working

**Optional Improvements:**

#### Email Templates
Customize email templates for better branding:
- Go to: Authentication → Email Templates
- Customize: Confirmation, Password Reset, Magic Link

#### Auth Providers (Future)
Consider adding:
- Google OAuth
- Apple Sign In
- Phone/SMS authentication

---

### 3. Database Indexes (Performance)

**Current Status:** ✅ Basic indexes created

**Optional Additional Indexes:**

```sql
-- For faster location-based queries
CREATE INDEX IF NOT EXISTS idx_alerts_location 
ON public.alerts USING GIST(location);

CREATE INDEX IF NOT EXISTS idx_incidents_location 
ON public.incidents USING GIST(location);

-- For faster user lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone 
ON public.profiles(phone_number);

-- For faster message queries
CREATE INDEX IF NOT EXISTS idx_messages_created_at 
ON public.messages(created_at DESC);
```

---

### 4. Edge Functions (Future Enhancements)

**Not required now, but useful for:**

- Sending push notifications
- Processing audio files
- Generating thumbnails
- Sending SMS alerts
- Email notifications

---

## 🎯 Priority Actions

### HIGH PRIORITY (Do Now)

1. **Create `incident-media` storage bucket** ⚠️
   - Required for: Panic button, Amber alerts, Look After Me
   - Without this: Audio recording and photo uploads will fail

### MEDIUM PRIORITY (Do Soon)

2. **Add storage policies** 
   - Secure file access
   - Prevent unauthorized uploads

3. **Test file uploads**
   - Try panic button recording
   - Try Look After Me photo upload

### LOW PRIORITY (Optional)

4. **Customize email templates**
5. **Add additional indexes**
6. **Set up monitoring/alerts**

---

## 🧪 Testing Checklist

After creating the storage bucket, test:

- [ ] Panic button audio recording
- [ ] Amber alert audio recording
- [ ] Look After Me outfit photo upload
- [ ] Profile avatar upload (when implemented)
- [ ] Community feed photo upload (when implemented)

---

## 📊 Current Database Schema

```
Tables: 9
├── profiles (users)
├── alerts (panic/amber)
├── incidents (reports)
├── messages (chat)
├── tracking_sessions (look after me)
├── posts (community feed)
├── comments (discussions)
├── post_likes (engagement)
└── comment_likes (engagement)

Views: 1
└── public_profiles (public user data)

Storage Buckets: 0 ⚠️
└── incident-media (NEEDS TO BE CREATED)

Extensions: 2
├── postgis (location support)
└── postgis_topology (advanced geo)
```

---

## 🚀 Quick Setup Commands

### Create Storage Bucket (via Dashboard)
1. Go to Storage → Buckets
2. Click "New bucket"
3. Name: `incident-media`
4. Public: Yes
5. Create

### Or via SQL (Alternative)
```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('incident-media', 'incident-media', true);

-- Add policies
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'incident-media');

CREATE POLICY "Public can view files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'incident-media');
```

---

## ✅ Summary

**What's Done:**
- ✅ All database tables
- ✅ All RLS policies
- ✅ Real-time enabled
- ✅ PostGIS enabled
- ✅ TypeScript types

**What's Needed:**
- ⚠️ Storage bucket: `incident-media`
- ⚠️ Storage policies

**Time to Complete:** ~5 minutes

Once you create the storage bucket, your app will be **100% production ready**! 🎉
