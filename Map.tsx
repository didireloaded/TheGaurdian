import { useEffect, useState, useRef } from 'react';
import { MapPin, Plus, X } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import * as Dialog from '@radix-ui/react-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Alert {
  id: string;
  alert_type: string;
  location_name: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
  location?: string | { coordinates: number[] } | number[];
}

interface TrackingSession {
  id: string;
  user_id: string;
  current_location: string | { coordinates: number[] } | number[];
  full_name?: string | null;
}

const INCIDENT_TYPES = [
  { value: 'robbery', label: 'Robbery', color: '#F97316' },
  { value: 'assault', label: 'Assault', color: '#EF4444' },
  { value: 'accident', label: 'Car Accident', color: '#EAB308' },
  { value: 'suspicious', label: 'Suspicious Activity', color: '#A855F7' },
  { value: 'unsafe_area', label: 'Unsafe Area', color: '#DC2626' },
  { value: 'kidnapping', label: 'Kidnapping', color: '#F59E0B' },
  { value: 'housebreaking', label: 'House Breaking', color: '#EF4444' },
  { value: 'fire', label: 'Fire', color: '#DC2626' },
  { value: 'medical', label: 'Medical Emergency', color: '#3B82F6' },
];

const Map = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeUsers, setActiveUsers] = useState<TrackingSession[]>([]);
  const [tokenMissing, setTokenMissing] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportLocation, setReportLocation] = useState<[number, number] | null>(null);
  const [incidentType, setIncidentType] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const alertMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const { toast } = useToast();

  const toLngLat = (loc: string | { coordinates: number[] } | number[] | null | undefined): [number, number] | null => {
    if (!loc) return null;
    if (typeof loc === 'string') {
      const wkt = loc.match(/POINT\(([-\d\.]+)\s+([-\d\.]+)\)/);
      if (wkt) return [parseFloat(wkt[1]), parseFloat(wkt[2])];
      const sridWkt = loc.match(/SRID=\d+;POINT\(([-\d\.]+)\s+([-\d\.]+)\)/);
      if (sridWkt) return [parseFloat(sridWkt[1]), parseFloat(sridWkt[2])];
      try {
        const parsed = JSON.parse(loc);
        if (parsed?.coordinates && Array.isArray(parsed.coordinates)) {
          return [parsed.coordinates[0], parsed.coordinates[1]];
        }
      } catch (_) { }
      return null;
    }
    if (Array.isArray(loc)) {
      return [Number(loc[0]), Number(loc[1])];
    }
    if (typeof loc === 'object' && loc?.coordinates && Array.isArray(loc.coordinates)) {
      return [Number(loc.coordinates[0]), Number(loc.coordinates[1])];
    }
    return null;
  };

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';
    if (!mapboxgl.accessToken) {
      setTokenMissing(true);
      return;
    }
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [17.083, -22.56],
        zoom: 12,
      });
      mapRef.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
      mapRef.current.addControl(new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true
      }), 'top-right');

      // Long press to report incident
      let longPressTimer: NodeJS.Timeout;
      mapRef.current.on('mousedown', (e) => {
        longPressTimer = setTimeout(() => {
          setReportLocation([e.lngLat.lng, e.lngLat.lat]);
          setShowReportDialog(true);
        }, 800);
      });
      mapRef.current.on('mouseup', () => clearTimeout(longPressTimer));
      mapRef.current.on('mousemove', () => clearTimeout(longPressTimer));

      // Touch events for mobile
      mapRef.current.on('touchstart', (e: mapboxgl.MapTouchEvent) => {
        if (e.originalEvent.touches.length === 1) {
          const touch = e.originalEvent.touches[0];
          const point = mapRef.current!.project([touch.clientX, touch.clientY]);
          const lngLat = mapRef.current!.unproject(point);
          longPressTimer = setTimeout(() => {
            setReportLocation([lngLat.lng, lngLat.lat]);
            setShowReportDialog(true);
          }, 800);
        }
      });
      mapRef.current.on('touchend', () => clearTimeout(longPressTimer));
      mapRef.current.on('touchmove', () => clearTimeout(longPressTimer));
    }

    return () => {
      alertMarkersRef.current.forEach(m => m.remove());
      userMarkersRef.current.forEach(m => m.remove());
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    fetchAlerts();
    fetchActiveUsers();

    const alertsChannel = supabase
      .channel('map-alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, () => {
        fetchAlerts();
      })
      .subscribe();

    const trackingChannel = supabase
      .channel('map-tracking')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tracking_sessions' }, () => {
        fetchActiveUsers();
      })
      .subscribe();

    // Update user locations every 5 seconds
    const interval = setInterval(fetchActiveUsers, 5000);

    // Get user's current location and center map
    if (mapRef.current && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapRef.current?.flyTo({
            center: [longitude, latitude],
            zoom: 13,
            duration: 2000
          });

          // Add user location marker
          const el = document.createElement('div');
          el.style.width = '20px';
          el.style.height = '20px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = '#3B82F6';
          el.style.border = '3px solid white';
          el.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.5)';

          new mapboxgl.Marker({ element: el })
            .setLngLat([longitude, latitude])
            .setPopup(new mapboxgl.Popup({ offset: 10 }).setHTML('<strong>You are here</strong>'))
            .addTo(mapRef.current);
        },
        (error) => console.warn('Location error:', error)
      );
    }

    return () => {
      supabase.removeChannel(alertsChannel);
      supabase.removeChannel(trackingChannel);
      clearInterval(interval);
    };
  }, []);

  const fetchAlerts = async () => {
    const { data } = await supabase
      .from('alerts')
      .select(`id, alert_type, location, location_name, created_at, profiles (full_name)`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      const typed = data as Alert[];
      setAlerts(typed);
      drawAlertMarkers(typed);
    }
  };

  const fetchActiveUsers = async () => {
    const { data: sessions } = await supabase
      .from('tracking_sessions')
      .select('id, user_id, current_location, status')
      .eq('status', 'active');

    let enriched: TrackingSession[] = [];
    if (sessions?.length) {
      const ids = sessions.map(s => s.user_id);
      const { data: names } = await supabase
        .from('public_profiles')
        .select('id, full_name')
        .in('id', ids);

      const nameMap = new Map<string, string | null>();
      names?.forEach(n => nameMap.set(n.id as string, n.full_name ?? null));

      enriched = sessions.map(s => ({
        id: s.id,
        user_id: s.user_id,
        current_location: s.current_location,
        full_name: nameMap.get(s.user_id) ?? null,
      }));
    }

    setActiveUsers(enriched);
    drawUserMarkers(enriched);
  };

  const drawAlertMarkers = (items: Alert[]) => {
    alertMarkersRef.current.forEach(m => m.remove());
    alertMarkersRef.current = [];
    if (!mapRef.current) return;

    items.forEach((a) => {
      const ll = toLngLat(a.location);
      if (!ll) return;

      const incidentConfig = INCIDENT_TYPES.find(t => t.value === a.alert_type);
      const color = incidentConfig?.color || '#EF4444';

      const el = document.createElement('div');
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.boxShadow = '0 0 0 2px #fff, 0 2px 4px rgba(0,0,0,0.3)';
      el.style.backgroundColor = color;
      el.style.cursor = 'pointer';

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(ll)
        .setPopup(new mapboxgl.Popup({ offset: 12 }).setHTML(
          `<div style="padding: 8px;">
            <strong style="text-transform: capitalize;">${a.alert_type.replace('_', ' ')}</strong><br/>
            <span style="font-size: 12px;">${a.location_name ?? 'Unknown location'}</span><br/>
            <span style="font-size: 11px; color: #666;">${a.profiles?.full_name ?? 'User'}</span><br/>
            <span style="font-size: 10px; color: #999;">${new Date(a.created_at).toLocaleString()}</span>
          </div>`
        ))
        .addTo(mapRef.current);
      alertMarkersRef.current.push(marker);
    });
  };

  const drawUserMarkers = (items: TrackingSession[]) => {
    userMarkersRef.current.forEach(m => m.remove());
    userMarkersRef.current = [];
    if (!mapRef.current) return;

    items.forEach((u) => {
      const ll = toLngLat(u.current_location);
      if (!ll) return;

      const el = document.createElement('div');
      el.style.width = '16px';
      el.style.height = '16px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#22C55E';
      el.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.3), 0 0 0 2px #fff';
      el.style.animation = 'pulse 2s infinite';
      el.style.cursor = 'pointer';

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(ll)
        .setPopup(new mapboxgl.Popup({ offset: 10 }).setHTML(
          `<div style="padding: 6px;">
            <strong>${u.full_name ?? 'Active user'}</strong><br/>
            <span style="font-size: 11px; color: #22C55E;">● Online</span>
          </div>`
        ))
        .addTo(mapRef.current);
      userMarkersRef.current.push(marker);
    });
  };

  const handleReportIncident = async () => {
    if (!reportLocation || !incidentType) {
      toast({ title: 'Missing information', description: 'Please select incident type', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const [lng, lat] = reportLocation;
      const { error } = await supabase.from('alerts').insert({
        user_id: user.id,
        alert_type: incidentType,
        location: `POINT(${lng} ${lat})`,
        location_name: 'Reported location',
        description: incidentDescription || 'User reported incident',
      });

      if (error) throw error;

      toast({ title: '✓ Incident reported', description: 'Nearby users have been notified' });
      setShowReportDialog(false);
      setIncidentType('');
      setIncidentDescription('');
      setReportLocation(null);
      fetchAlerts();
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to report', description: 'Please try again', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative h-screen w-full">
      {/* Full-screen map */}
      <div ref={mapContainerRef} className="absolute inset-0" />

      {tokenMissing && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/90 z-10">
          <div className="text-center p-6 bg-card rounded-lg shadow-lg">
            <MapPin className="h-12 w-12 mx-auto mb-2 text-primary/50" />
            <p className="text-sm text-muted-foreground">
              Add your Mapbox token to <code className="bg-muted px-1 rounded">.env</code> as <code className="bg-muted px-1 rounded">VITE_MAPBOX_TOKEN</code>
            </p>
          </div>
        </div>
      )}

      {/* Floating Report Button */}
      <Button
        onClick={() => {
          navigator.geolocation.getCurrentPosition((pos) => {
            setReportLocation([pos.coords.longitude, pos.coords.latitude]);
            setShowReportDialog(true);
          });
        }}
        className="absolute bottom-24 right-4 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-20"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Report Incident Dialog */}
      <Dialog.Root open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-md bg-card border border-border">
          <DialogHeader>
            <DialogTitle>Report Incident</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="incident-type">Incident Type *</Label>
              <Select value={incidentType} onValueChange={setIncidentType}>
                <SelectTrigger id="incident-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {INCIDENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <span style={{ color: type.color }}>●</span> {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Add details..."
                value={incidentDescription}
                onChange={(e) => setIncidentDescription(e.target.value)}
                maxLength={150}
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">{incidentDescription.length}/150</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowReportDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleReportIncident} disabled={submitting || !incidentType} className="flex-1">
                {submitting ? 'Reporting...' : 'Report'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog.Root>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <Navigation />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.3), 0 0 0 2px #fff; }
          50% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.1), 0 0 0 2px #fff; }
        }
      `}</style>
    </div>
  );
};

export default Map;
