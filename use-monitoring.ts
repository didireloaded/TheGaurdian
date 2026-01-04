import { useEffect, useRef } from 'react';
import { monitoring } from '@/lib/monitoring/monitoring-service';
import type { AnalyticsEvent } from '@/lib/monitoring/monitoring-service';
import { useAuth } from '@/hooks/use-auth';

export function useMonitoring(componentName: string) {
  const startTime = useRef(performance.now());
  const { user } = useAuth();

  useEffect(() => {
    return () => {
      const renderTime = performance.now() - startTime.current;
      monitoring.trackPerformance({
        componentName,
        renderTime,
        userId: user?.id,
      });
    };
  }, [componentName, user?.id]);

  const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
    const event: Omit<AnalyticsEvent, 'timestamp'> = {
      eventName,
      userId: user?.id,
      properties,
    };
    monitoring.trackEvent(event);
  };

  const trackError = (error: Error, additionalContext?: Record<string, unknown>) => {
    monitoring.trackError(error, {
      componentName,
      userId: user?.id,
      additionalContext,
    });
  };

  return {
    trackEvent,
    trackError,
  };
}