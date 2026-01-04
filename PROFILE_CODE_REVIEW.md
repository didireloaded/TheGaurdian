# Profile.tsx Code Review & Improvements

## 🔴 CRITICAL: Build-Breaking Errors

### 1. Missing Imports After Recent Edit
**Problem**: The diff removed `AlertTriangle` and `PanicButton` imports, but they're still used in the JSX (lines 335 and 341).

**Current Error**:
```
Cannot find name 'AlertTriangle'
Cannot find name 'PanicButton'
```

**Fix**: Restore the missing imports
```typescript
// Add back to line 2:
import { ArrowLeft, Share2, UserPlus, MessageCircle, Shield, Phone, LogOut, Upload, Edit, AlertTriangle } from 'lucide-react';

// Add back after Navigation import:
import { PanicButton } from '@/components/PanicButton';
```

---

## 🟡 Code Smells & Refactoring Opportunities

### 2. Missing Error Handling in fetchProfile
**Problem**: No error handling for profile fetch, fails silently

**Current Code** (line 48):
```typescript
const fetchProfile = async (userId: string) => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (data) {
    setProfile({ ... });
  }
};
```

**Fix**: Add proper error handling
```typescript
const fetchProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      toast({
        title: 'Failed to load profile',
        description: 'Using default values',
        variant: 'destructive',
      });
      return;
    }

    if (data) {
      setProfile({
        full_name: data.full_name || '',
        phone: data.phone_number || null,
        avatar_url: data.avatar_url || null,
        bio: data.bio || null,
        emergency_contact_1: data.emergency_contact_1 || null,
        emergency_contact_2: data.emergency_contact_2 || null,
        emergency_contact_3: data.emergency_contact_3 || null,
      });
    }
  } catch (err) {
    console.error('Unexpected error fetching profile:', err);
  }
};
```

---

### 3. Type Safety Issues with `any`
**Problem**: Using `any` type casts defeats TypeScript's purpose

**Current Code** (lines 61-63):
```typescript
bio: (data as any).bio || null,
emergency_contact_1: (data as any).emergency_contact_1 || null,
emergency_contact_2: (data as any).emergency_contact_2 || null,
```

**Fix**: Create proper database type
```typescript
// Create: src/types/database.ts
export interface DatabaseProfile {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  bio: string | null;
  emergency_contact_1: string | null;
  emergency_contact_2: string | null;
  emergency_contact_3: string | null;
  created_at: string;
  updated_at: string;
}

// In Profile.tsx
import type { DatabaseProfile } from '@/types/database';

const fetchProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single<DatabaseProfile>(); // Type the response

  if (data) {
    setProfile({
      full_name: data.full_name || '',
      phone: data.phone_number || null,
      avatar_url: data.avatar_url || null,
      bio: data.bio || null, // No more 'as any'
      emergency_contact_1: data.emergency_contact_1 || null,
      emergency_contact_2: data.emergency_contact_2 || null,
      emergency_contact_3: data.emergency_contact_3 || null,
    });
  }
};
```

---

### 4. Duplicated Emergency Contact Rendering
**Problem**: Three nearly identical blocks of code for emergency contacts (lines 408-430)

**Current Code**:
```typescript
{profile.emergency_contact_1 && (
  <div className="flex items-center gap-3 text-sm">
    <Phone className="h-4 w-4 text-muted-foreground" />
    <span>{profile.emergency_contact_1}</span>
  </div>
)}
{profile.emergency_contact_2 && (
  <div className="flex items-center gap-3 text-sm">
    <Phone className="h-4 w-4 text-muted-foreground" />
    <span>{profile.emergency_contact_2}</span>
  </div>
)}
{profile.emergency_contact_3 && (
  <div className="flex items-center gap-3 text-sm">
    <Phone className="h-4 w-4 text-muted-foreground" />
    <span>{profile.emergency_contact_3}</span>
  </div>
)}
```

**Fix**: Use array mapping
```typescript
{[
  profile.emergency_contact_1,
  profile.emergency_contact_2,
  profile.emergency_contact_3
]
  .filter(Boolean)
  .map((contact, index) => (
    <div key={index} className="flex items-center gap-3 text-sm">
      <Phone className="h-4 w-4 text-muted-foreground" />
      <span>{contact}</span>
    </div>
  ))
}
```

---

### 5. Non-Functional Stats Buttons
**Problem**: Stats buttons (lines 363-382) have onClick but no functionality

**Current Code**:
```typescript
<button className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity">
  <Shield className="h-6 w-6 text-primary" />
  <span className="text-xs text-muted-foreground">Alerts</span>
</button>
```

**Fix**: Either add functionality or remove hover effect
```typescript
// Option 1: Add navigation
<button 
  onClick={() => navigate('/alerts')}
  className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity"
>
  <Shield className="h-6 w-6 text-primary" />
  <span className="text-xs text-muted-foreground">Alerts</span>
</button>

// Option 2: Make it non-interactive (remove button)
<div className="flex flex-col items-center gap-1">
  <Shield className="h-6 w-6 text-primary" />
  <span className="text-xs text-muted-foreground">Alerts</span>
</div>
```

---

### 6. Unsafe Avatar URL Parsing
**Problem**: `split('/').pop()` can fail if URL format changes

**Current Code** (line 127):
```typescript
const oldPath = profile.avatar_url.split('/').pop();
```

**Fix**: Add validation
```typescript
if (profile.avatar_url) {
  try {
    const url = new URL(profile.avatar_url);
    const pathParts = url.pathname.split('/');
    const filename = pathParts[pathParts.length - 1];
    
    if (filename && filename.startsWith('avatar-')) {
      await supabase.storage.from('incident-media').remove([filename]);
    }
  } catch (err) {
    console.warn('Could not parse avatar URL for cleanup:', err);
    // Continue with upload anyway
  }
}
```

---

### 7. Large Component - Split Responsibilities
**Problem**: 450+ line component with multiple responsibilities (view, edit, upload)

**Solution**: Extract into smaller components

```typescript
// src/components/profile/ProfileHeader.tsx
export const ProfileHeader = ({ 
  profile, 
  user, 
  onBack, 
  onAvatarUpload,
  uploadingAvatar 
}: ProfileHeaderProps) => (
  <div className="relative h-[400px] overflow-hidden">
    {/* ... header content ... */}
  </div>
);

// src/components/profile/ProfileEditForm.tsx
export const ProfileEditForm = ({ 
  profile, 
  onSave, 
  onCancel,
  loading 
}: ProfileEditFormProps) => (
  <div className="min-h-screen bg-background pb-20">
    {/* ... edit form ... */}
  </div>
);

// src/components/profile/EmergencyContactsList.tsx
export const EmergencyContactsList = ({ 
  contacts 
}: { contacts: (string | null)[] }) => {
  const validContacts = contacts.filter(Boolean);
  
  if (validContacts.length === 0) return null;
  
  return (
    <div>
      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        Emergency Contacts
      </h3>
      <div className="space-y-2">
        {validContacts.map((contact, index) => (
          <div key={index} className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{contact}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simplified Profile.tsx
const Profile = () => {
  // ... state and hooks ...
  
  if (isEditing) {
    return (
      <ProfileEditForm
        profile={profile}
        onSave={handleUpdateProfile}
        onCancel={() => setIsEditing(false)}
        loading={loading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <ProfileHeader
        profile={profile}
        user={user}
        onBack={() => navigate(-1)}
        onAvatarUpload={handleAvatarUpload}
        uploadingAvatar={uploadingAvatar}
      />
      {/* ... rest of profile view ... */}
      <EmergencyContactsList 
        contacts={[
          profile.emergency_contact_1,
          profile.emergency_contact_2,
          profile.emergency_contact_3
        ]} 
      />
    </div>
  );
};
```

---

### 8. Missing Accessibility Attributes
**Problem**: Buttons lack proper ARIA labels and keyboard support

**Fix**: Add accessibility
```typescript
// Avatar upload button
<button
  onClick={() => fileInputRef.current?.click()}
  className="p-2 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-colors"
  aria-label={uploadingAvatar ? "Uploading avatar" : "Change profile picture"}
  disabled={uploadingAvatar}
>
  {uploadingAvatar ? (
    <Upload className="h-6 w-6 text-white animate-spin" aria-hidden="true" />
  ) : (
    <Share2 className="h-6 w-6 text-white" aria-hidden="true" />
  )}
</button>

// Back button
<button
  onClick={() => navigate(-1)}
  className="p-2 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-colors"
  aria-label="Go back"
>
  <ArrowLeft className="h-6 w-6 text-white" aria-hidden="true" />
</button>
```

---

### 9. Inconsistent Share2 Icon Usage
**Problem**: Share2 icon used for avatar upload is confusing (line 313)

**Fix**: Use Upload icon consistently
```typescript
<button
  onClick={() => fileInputRef.current?.click()}
  className="p-2 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-colors"
  aria-label="Change profile picture"
>
  <Upload className={`h-6 w-6 text-white ${uploadingAvatar ? 'animate-spin' : ''}`} />
</button>
```

---

### 10. Missing Loading State for Initial Profile Fetch
**Problem**: No loading indicator while fetching profile data

**Fix**: Add loading state
```typescript
const [initialLoading, setInitialLoading] = useState(true);

useEffect(() => {
  supabase.auth.getUser().then(({ data: { user } }) => {
    setUser(user);
    if (user) {
      fetchProfile(user.id).finally(() => setInitialLoading(false));
    } else {
      setInitialLoading(false);
    }
  });
}, []);

// In render
if (initialLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Upload className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    </div>
  );
}
```

---

### 11. Potential Memory Leak with useEffect
**Problem**: useEffect doesn't handle component unmount during async operation

**Fix**: Add cleanup
```typescript
useEffect(() => {
  let isMounted = true;
  
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (!isMounted) return;
    
    setUser(user);
    if (user) {
      fetchProfile(user.id);
    }
  });
  
  return () => {
    isMounted = false;
  };
}, []);
```

---

### 12. Hardcoded Emergency Contact Count
**Problem**: Emergency contacts hardcoded to 3, difficult to change

**Fix**: Use constant
```typescript
const EMERGENCY_CONTACT_COUNT = 3;

// In edit form
{Array.from({ length: EMERGENCY_CONTACT_COUNT }, (_, i) => i + 1).map((num) => (
  <div key={num} className="space-y-2 mb-4">
    <Label htmlFor={`contact${num}`}>Emergency Contact {num}</Label>
    <Input
      id={`contact${num}`}
      type="tel"
      placeholder="+264 XX XXX XXXX"
      value={profile[`emergency_contact_${num}` as keyof Profile] || ''}
      onChange={(e) =>
        setProfile({
          ...profile,
          [`emergency_contact_${num}`]: e.target.value,
        })
      }
      className="h-12"
    />
  </div>
))}
```

---

## 🟢 Performance Optimizations

### 13. Optimize Profile State Updates
**Problem**: Spreading entire profile object on every input change

**Fix**: Use callback form of setState
```typescript
// Instead of:
onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}

// Use:
onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
```

---

### 14. Memoize Emergency Contacts Check
**Problem**: Conditional rendering checks same values multiple times

**Fix**: Use useMemo
```typescript
import { useMemo } from 'react';

const hasEmergencyContacts = useMemo(() => {
  return !!(profile.emergency_contact_1 || profile.emergency_contact_2 || profile.emergency_contact_3);
}, [profile.emergency_contact_1, profile.emergency_contact_2, profile.emergency_contact_3]);

// In JSX
{hasEmergencyContacts && (
  <div>
    <h3>Emergency Contacts</h3>
    {/* ... */}
  </div>
)}
```

---

## 📊 Priority Action Items

### Immediate (Fix Now - Build Breaking)
- [x] **CRITICAL**: Add back `AlertTriangle` import
- [x] **CRITICAL**: Add back `PanicButton` import

### High Priority (Fix This Week)
- [ ] Add error handling to `fetchProfile`
- [ ] Remove `any` type casts, create proper types
- [ ] Add loading state for initial profile fetch
- [ ] Fix memory leak in useEffect

### Medium Priority (Next Sprint)
- [ ] Extract components (ProfileHeader, ProfileEditForm, EmergencyContactsList)
- [ ] Deduplicate emergency contact rendering
- [ ] Add accessibility attributes
- [ ] Add functionality to stats buttons or remove hover effects
- [ ] Improve avatar URL parsing safety

### Low Priority (Future)
- [ ] Optimize state updates with callback form
- [ ] Memoize expensive computations
- [ ] Add unit tests for profile operations

---

## 🔧 Quick Fix (Copy-Paste Ready)

```typescript
// Line 2 - Fix imports
import { ArrowLeft, Share2, UserPlus, MessageCircle, Shield, Phone, LogOut, Upload, Edit, AlertTriangle } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { PanicButton } from '@/components/PanicButton';
import { supabase } from '@/integrations/supabase/client';
```

This will immediately fix the build errors!
