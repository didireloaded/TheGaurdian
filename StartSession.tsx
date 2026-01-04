import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Users, ArrowLeft, Car, Clock, Camera, UserPlus, X } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Contact {
  id: string;
  full_name: string;
  is_selected?: boolean;
}

interface Companion {
  name: string;
  phone: string;
  relationship: string;
}

const StartSession = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [outfitDescription, setOutfitDescription] = useState('');
  const [outfitPhoto, setOutfitPhoto] = useState<File | null>(null);
  const [outfitPhotoPreview, setOutfitPhotoPreview] = useState<string>('');
  const [mightBeLate, setMightBeLate] = useState(false);
  const [stayingOvernight, setStayingOvernight] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContacts();
    // Set default times
    const now = new Date();
    setDepartureTime(now.toISOString().slice(0, 16));
    const later = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour
    setArrivalTime(later.toISOString().slice(0, 16));
  }, []);

  const fetchContacts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current user's profile with emergency contacts
      const { data: profile } = await supabase
        .from('profiles')
        .select('emergency_contact_1, emergency_contact_2, emergency_contact_3')
        .eq('id', user.id)
        .single();

      if (profile) {
        // Emergency contacts are phone numbers, not user IDs
        // For now, let's get all users and let them select
        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, display_name')
          .neq('id', user.id)
          .limit(20);

        if (allProfiles && allProfiles.length > 0) {
          setContacts(
            allProfiles.map((contact) => ({
              id: contact.id,
              full_name: contact.full_name || contact.display_name || 'User',
              is_selected: false, // Start with none selected
            }))
          );
        } else {
          // If no other users, show message
          toast({
            title: 'No contacts available',
            description: 'Add emergency contacts in your profile or invite friends to join Guardian',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: 'Error loading contacts',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOutfitPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOutfitPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addCompanion = () => {
    setCompanions([...companions, { name: '', phone: '', relationship: 'Friend' }]);
  };

  const removeCompanion = (index: number) => {
    setCompanions(companions.filter((_, i) => i !== index));
  };

  const updateCompanion = (index: number, field: keyof Companion, value: string) => {
    const updated = [...companions];
    updated[index][field] = value;
    setCompanions(updated);
  };

  const uploadOutfitPhoto = async (): Promise<string | null> => {
    if (!outfitPhoto) return null;
    try {
      const filename = `outfit-${Date.now()}-${outfitPhoto.name}`;
      const { data, error } = await supabase.storage
        .from('incident-media')
        .upload(filename, outfitPhoto);

      if (error) throw error;
      const { data: urlData } = supabase.storage.from('incident-media').getPublicUrl(filename);
      return urlData?.publicUrl || null;
    } catch (error) {
      console.error('Photo upload error:', error);
      return null;
    }
  };

  const handleStartSession = async () => {
    if (!destination.trim()) {
      toast({ title: 'Error', description: 'Please enter your destination', variant: 'destructive' });
      return;
    }

    const selectedContacts = contacts.filter((c) => c.is_selected);
    if (!selectedContacts.length) {
      toast({ title: 'Error', description: 'Please select at least one watcher', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      const photoUrl = await uploadOutfitPhoto();

      const { error } = await supabase.from('tracking_sessions').insert({
        destination_name: destination,
        current_location: `POINT(${longitude} ${latitude})`,
        watcher_ids: selectedContacts.map((c) => c.id),
        status: 'active',
        started_at: departureTime,
        estimated_arrival: arrivalTime,
        outfit_photo_url: photoUrl,
        outfit_description: outfitDescription,
        vehicle_make: vehicleMake || null,
        vehicle_model: vehicleModel || null,
        vehicle_color: vehicleColor || null,
        vehicle_plate: vehiclePlate || null,
        companions: companions.length ? JSON.stringify(companions) : null,
        might_be_late: mightBeLate,
        staying_overnight: stayingOvernight,
      });

      if (error) throw error;

      toast({ title: 'Session Started', description: 'Your watchers will be notified' });
      navigate('/look-after-me');
    } catch (error) {
      console.error('Error starting session:', error);
      toast({ title: 'Error', description: 'Failed to start tracking session', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border p-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/look-after-me')}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <Eye className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Start Trip</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <Card className="border-border">
          <CardContent className="p-6 space-y-6">
            {/* Destination */}
            <div className="space-y-2">
              <Label htmlFor="destination">Destination *</Label>
              <Input
                id="destination"
                placeholder="Where are you going?"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            {/* Times */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departure" className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Departure Time *
                </Label>
                <Input
                  id="departure"
                  type="datetime-local"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arrival" className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Expected Arrival *
                </Label>
                <Input
                  id="arrival"
                  type="datetime-local"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                />
              </div>
            </div>

            {/* Late/Stay Options */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="late"
                  checked={mightBeLate}
                  onCheckedChange={(checked) => setMightBeLate(!!checked)}
                />
                <label htmlFor="late" className="text-sm">I might be late</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="overnight"
                  checked={stayingOvernight}
                  onCheckedChange={(checked) => setStayingOvernight(!!checked)}
                />
                <label htmlFor="overnight" className="text-sm">Staying overnight</label>
              </div>
            </div>

            {/* Watchers */}
            <div className="space-y-3">
              <div>
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Select Watchers *
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose people who will watch over you during your trip
                </p>
              </div>

              {contacts.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto border border-border rounded-lg p-3">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md transition"
                    >
                      <Checkbox
                        id={contact.id}
                        checked={contact.is_selected || false}
                        onCheckedChange={(checked) => {
                          setContacts(contacts.map((c) =>
                            c.id === contact.id ? { ...c, is_selected: !!checked } : c
                          ));
                        }}
                      />
                      <label
                        htmlFor={contact.id}
                        className="text-sm font-medium cursor-pointer flex-1"
                      >
                        {contact.full_name}
                      </label>
                      {contact.is_selected && (
                        <span className="text-xs text-green-600 dark:text-green-400">
                          ✓ Selected
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 border border-dashed border-border rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    No contacts available
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/profile')}
                  >
                    Add Contacts in Profile
                  </Button>
                </div>
              )}

              {contacts.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {contacts.filter(c => c.is_selected).length} of {contacts.length} selected
                </div>
              )}
            </div>

            {/* Companions */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Companions (optional)
              </Label>
              {companions.map((companion, index) => (
                <div key={index} className="flex gap-2 items-start p-3 bg-muted rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Name"
                      value={companion.name}
                      onChange={(e) => updateCompanion(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Phone number"
                      value={companion.phone}
                      onChange={(e) => updateCompanion(index, 'phone', e.target.value)}
                    />
                    <select
                      className="w-full border border-input rounded-md bg-background px-3 py-2 text-sm"
                      value={companion.relationship}
                      onChange={(e) => updateCompanion(index, 'relationship', e.target.value)}
                    >
                      <option value="Friend">Friend</option>
                      <option value="Family">Family</option>
                      <option value="Colleague">Colleague</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeCompanion(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addCompanion} className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Companion
              </Button>
            </div>

            {/* Vehicle Details */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                Vehicle Details (if driving)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Make (e.g., Toyota)" value={vehicleMake} onChange={(e) => setVehicleMake(e.target.value)} />
                <Input placeholder="Model (e.g., Corolla)" value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} />
                <Input placeholder="Color" value={vehicleColor} onChange={(e) => setVehicleColor(e.target.value)} />
                <Input placeholder="License Plate" value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value)} />
              </div>
            </div>

            {/* Outfit Photo & Description */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Outfit Photo & Description
              </Label>
              <p className="text-xs text-muted-foreground">For identification in case of emergency</p>

              {outfitPhotoPreview && (
                <div className="relative w-32 h-32">
                  <img src={outfitPhotoPreview} alt="Outfit" className="w-full h-full object-cover rounded-lg" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={() => {
                      setOutfitPhoto(null);
                      setOutfitPhotoPreview('');
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              <Input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="cursor-pointer"
              />

              <Textarea
                placeholder="Describe your outfit (e.g., blue jeans, red jacket, white sneakers)"
                value={outfitDescription}
                onChange={(e) => setOutfitDescription(e.target.value)}
                rows={2}
              />
            </div>

            <Button className="w-full" onClick={handleStartSession} disabled={loading}>
              {loading ? 'Starting...' : 'Start Trip'}
            </Button>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="border-border bg-muted/30">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-2">💡 Tips for Safe Travel</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Select at least one watcher who can check on you</li>
              <li>• Be realistic with your arrival time</li>
              <li>• Upload a photo of your outfit for identification</li>
              <li>• Include vehicle details if driving</li>
              <li>• Check in when you arrive safely</li>
            </ul>
          </CardContent>
        </Card>
      </main>

      <Navigation />
    </div>
  );
};

export default StartSession;
