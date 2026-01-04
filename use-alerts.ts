import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMonitoring } from './use-monitoring';

interface Alert {
  id: string;
  alert_type: string;
  status: string;
  location_name: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { trackEvent, trackError } = useMonitoring();

  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel('alerts-feed')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts',
        },
        (payload) => {
          trackEvent('alert_realtime_update', {
            event_type: payload.eventType,
            table: 'alerts',
          });
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAlerts = async () => {
    try {
      const startTime = performance.now();
      const { data, error } = await supabase
        .from('alerts')
        .select(`
          id,
          alert_type,
          status,
          location_name,
          created_at,
          profiles (
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) {
        throw error;
      }

      if (data) {
        setAlerts(data as Alert[]);
        trackEvent('alerts_loaded', {
          count: data.length,
          load_time_ms: Math.round(performance.now() - startTime),
        });
      }
    } catch (error) {
      trackError('alerts_fetch_error', error as Error);
      console.error('Error fetching alerts:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'primary';
      case 'resolved':
        return 'success';
      case 'false_alarm':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return {
    alerts,
    getStatusBadge,
  };
}