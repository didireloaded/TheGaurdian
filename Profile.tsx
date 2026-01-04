import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Share2, UserPlus, MessageCircle, Shield, Phone, LogOut, Upload, Edit, AlertTriangle } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { PanicButton } from '@/components/PanicButton';
import { supabase } from '@/integrations/supabase/client';
import { useAuthActions } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface Profile {
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  emergency_contact_1: string | null;
  emergency_contact_2: string | null;
  emergency_contact_3: string | null;
}

const Profile = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    phone: null,
    avatar_url: null,
    bio: null,
    emergency_contact_1: null,
    emergency_contact_2: null,
    emergency_contact_3: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchProfile(user.id);
      }
    });
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setProfile({
        full_name: data.full_name || '',
        phone: data.phone_number || null,
        avatar_url: data.avatar_url || null,
        bio: (data as any).bio || null,
        emergency_contact_1: (data as any).emergency_contact_1 || null,
        emergency_contact_2: (data as any).emergency_contact_2 || null,
        emergency_contact_3: (data as any).emergency_contact_3 || null,
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone_number: profile.phone,
          bio: profile.bio,
          emergency_contact_1: profile.emergency_contact_1,
          emergency_contact_2: profile.emergency_contact_2,
          emergency_contact_3: profile.emergency_contact_3,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your information has been saved successfully",
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadingAvatar(true);
    try {
      if (profile.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('incident-media').remove([oldPath]);
        }
      }

      const fileExt = file.name.split('.').pop();
      const filename = `avatar-${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('incident-media')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('incident-media')
        .getPublicUrl(filename);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: urlData.publicUrl });
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been changed',
      });
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const { signOut } = useAuthActions();

  const handleSignOut = async () => {
    await signOut();
  };

  if (isEditing) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-card border-b border-border p-4 sticky top-0 z-10">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <button onClick={() => setIsEditing(false)} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold">Edit Profile</h1>
            <div className="w-6" />
          </div>
        </header>

        <main className="max-w-lg mx-auto p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full min-h-[100px] p-3 rounded-lg border border-input bg-background"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+264 XX XXX XXXX"
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="h-12"
              />
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Emergency Contacts
              </h3>
              {[1, 2, 3].map((num) => (
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
            </div>

            <Button
              onClick={handleUpdateProfile}
              disabled={loading}
              className="w-full h-12 bg-gradient-emergency"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section with Background Image */}
      <div className="relative h-[400px] overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: profile.avatar_url
              ? `url(${profile.avatar_url})`
              : 'url(https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/90" />
        </div>

        {/* Header Icons */}
        <div className="relative z-10 flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-colors"
          >
            {uploadingAvatar ? (
              <Upload className="h-6 w-6 text-white animate-spin" />
            ) : (
              <Share2 className="h-6 w-6 text-white" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>

        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
          <h1 className="text-4xl font-bold mb-1">
            {profile.full_name || 'User'}
          </h1>
          <p className="text-lg text-white/80 mb-4">
            SafeGuard Member · {user?.email?.split('@')[0]}
          </p>
          <p className="text-sm text-white/90 line-clamp-3">
            {profile.bio || 'Keeping Namibia safe, one alert at a time. Part of the SafeGuard community dedicated to emergency response and community safety.'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 flex gap-3 overflow-x-auto">
        <Button
          onClick={() => setIsEditing(true)}
          className="flex-shrink-0 bg-white dark:bg-card text-black dark:text-white hover:bg-gray-100 dark:hover:bg-card/80 rounded-full px-6 h-11 font-semibold"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
        <Button
          onClick={() => navigate('/chat')}
          variant="outline"
          className="flex-shrink-0 bg-transparent border-2 border-white dark:border-border text-foreground hover:bg-muted rounded-full px-6 h-11 font-semibold"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Messages
        </Button>
        <Button
          onClick={() => navigate('/authorities')}
          variant="outline"
          className="flex-shrink-0 bg-transparent border-2 border-white dark:border-border text-foreground hover:bg-muted rounded-full px-6 h-11 font-semibold"
        >
          <Phone className="h-4 w-4 mr-2" />
          Emergency
        </Button>
      </div>

      {/* Stats/Info Section */}
      <div className="px-6 py-4 border-b border-border">
        <div className="grid grid-cols-4 gap-4 text-center">
          <button className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xs text-muted-foreground">Alerts</span>
          </button>
          <button className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity">
            <MessageCircle className="h-6 w-6 text-primary" />
            <span className="text-xs text-muted-foreground">Messages</span>
          </button>
          <button className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity">
            <UserPlus className="h-6 w-6 text-primary" />
            <span className="text-xs text-muted-foreground">Contacts</span>
          </button>
          <button className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity">
            <Phone className="h-6 w-6 text-primary" />
            <span className="text-xs text-muted-foreground">Emergency</span>
          </button>
        </div>
      </div>

      {/* Profile Details */}
      <div className="px-6 py-6 space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-3">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{profile.phone || 'No phone number'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <span>{user?.email}</span>
            </div>
          </div>
        </div>

        {(profile.emergency_contact_1 || profile.emergency_contact_2 || profile.emergency_contact_3) && (
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Emergency Contacts
            </h3>
            <div className="space-y-2">
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
            </div>
          </div>
        )}

        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full border-destructive text-destructive hover:bg-destructive/10 h-12"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <Navigation />
    </div>
  );
};

export default Profile;
