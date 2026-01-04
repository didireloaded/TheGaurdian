import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMonitoring } from '@/hooks/use-monitoring';

export interface TrackingSession {
  id: string;
  user_id: string;
  destination_name: string;
  destination_location: any;
  current_location: any;
  status: 'active' | 'completed' | 'cancelled' | 'emergency';
  watcher_ids: string[];
  estimated_arrival: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface Watcher {
  id: string;
  full_name: string;
}

export function useLookAfterMe() {
  const { toast } = useToast();
  const { trackEvent, trackError } = useMonitoring('LookAfterMe');
  const [activeSession, setActiveSession] = useState<TrackingSession | null>(null);
  const [watchers, setWatchers] = useState<Watcher[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);

  useEffect(() => {
    fetchActiveSession();
    const channel = supabase
      .channel('tracking_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tracking_sessions',
        },
        () => {
          fetchActiveSession();
        }
      )
      .subscribe();

    // Start location tracking if there's an active session
    let watchId: number;
    if (activeSession?.status === 'active') {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation(position);
          updateSessionLocation(position);
          trackEvent('location_update', {
            sessionId: activeSession.id,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.error('Error watching location:', error);
          trackError(error as Error, { context: 'location_tracking' });
        },
        { enableHighAccuracy: true }
      );
    }

    return () => {
      supabase.removeChannel(channel);
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [activeSession?.status]);

  const fetchActiveSession = async () => {
    try {
      const { data: session } = await supabase
        .from('tracking_sessions')
        .select('*')
        .eq('status', 'active')
        .single();

      if (session) {
        setActiveSession(session as TrackingSession);
        fetchWatchers(session.watcher_ids);
        trackEvent('session_loaded', {
          sessionId: session.id,
          destinationName: session.destination_name,
        });
      } else {
        setActiveSession(null);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      trackError(error as Error, { context: 'fetch_session' });
      toast({
        title: 'Error',
        description: 'Failed to fetch active session',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWatchers = async (watcherIds: string[]) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', watcherIds);

      if (data) {
        setWatchers(data as Watcher[]);
        trackEvent('watchers_loaded', {
          count: data.length,
        });
      }
    } catch (error) {
      console.error('Error fetching watchers:', error);
      trackError(error as Error, { context: 'fetch_watchers' });
    }
  };

  const updateSessionLocation = async (position: GeolocationPosition) => {
    if (!activeSession) return;

    const { latitude, longitude } = position.coords;
    try {
      await supabase
        .from('tracking_sessions')
        .update({
          current_location: `POINT(${longitude} ${latitude})`,
        })
        .eq('id', activeSession.id);
    } catch (error) {
      console.error('Error updating location:', error);
      trackError(error as Error, { context: 'update_location' });
    }
  };

  const handleCheckIn = async () => {
    if (!activeSession) return;

    try {
      const { error } = await supabase
        .from('tracking_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', activeSession.id);

      if (error) throw error;

      toast({
        title: 'Checked In',
        description: 'You have safely checked in!',
      });

      trackEvent('session_check_in', {
        sessionId: activeSession.id,
        duration: new Date().getTime() - new Date(activeSession.started_at).getTime(),
      });

      setActiveSession(null);
    } catch (error) {
      console.error('Error checking in:', error);
      trackError(error as Error, { context: 'check_in' });
      toast({
        title: 'Error',
        description: 'Failed to check in',
        variant: 'destructive',
      });
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;

    try {
      const { error } = await supabase
        .from('tracking_sessions')
        .update({
          status: 'cancelled',
          completed_at: new Date().toISOString(),
        })
        .eq('id', activeSession.id);

      if (error) throw error;

      toast({
        title: 'Session Ended',
        description: 'Your tracking session has been ended',
      });

      trackEvent('session_ended', {
        sessionId: activeSession.id,
        duration: new Date().getTime() - new Date(activeSession.started_at).getTime(),
      });

      setActiveSession(null);
    } catch (error) {
      console.error('Error ending session:', error);
      trackError(error as Error, { context: 'end_session' });
      toast({
        title: 'Error',
        description: 'Failed to end session',
        variant: 'destructive',
      });
    }
  };

  const handleEmergency = async () => {
    if (!activeSession) return;

    try {
      const { error } = await supabase
        .from('tracking_sessions')
        .update({
          status: 'emergency',
        })
        .eq('id', activeSession.id);

      if (error) throw error;

      toast({
        title: 'Emergency Alert Sent',
        description: 'Your watchers have been notified of your emergency.',
        variant: 'destructive',
      });

      trackEvent('emergency_triggered', {
        sessionId: activeSession.id,
        location: activeSession.current_location,
      });

      // Create an emergency alert
      const { error: alertError } = await supabase.from('alerts').insert({
        alert_type: 'panic',
        location: activeSession.current_location,
        description: `Emergency during tracking session to ${activeSession.destination_name}`,
        user_id: activeSession.user_id,
        is_false_alarm: false,
        status: 'active'
      });

      if (alertError) throw alertError;
    } catch (error) {
      console.error('Error triggering emergency:', error);
      trackError(error as Error, { context: 'trigger_emergency' });
      toast({
        title: 'Error',
        description: 'Failed to send emergency alert',
        variant: 'destructive',
      });
    }
  };

  return {
    activeSession,
    watchers,
    loading,
    currentLocation,
    handleCheckIn,
    handleEndSession,
    handleEmergency,
  };
}