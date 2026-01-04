import { supabase } from '@/integrations/supabase/client';

// Performance metrics types
export interface PerformanceMetric {
  componentName: string;
  renderTime: number;
  timestamp: string;
  userId?: string;
}

// Error tracking types
export interface ErrorReport {
  error: Error;
  componentName?: string;
  userId?: string;
  timestamp: string;
  additionalContext?: Record<string, unknown>;
}

// User analytics types
export interface AnalyticsEvent {
  eventName: string;
  userId?: string;
  timestamp: string;
  properties?: Record<string, unknown>;
}

// Health check types
export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy';
  latency: number;
  timestamp: string;
  error?: string;
}

class MonitoringService {
  private static instance: MonitoringService;
  private performanceBuffer: PerformanceMetric[] = [];
  private readonly BUFFER_SIZE = 10;
  private readonly FLUSH_INTERVAL = 30000; // 30 seconds

  private constructor() {
    this.initializeFlushInterval();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  private initializeFlushInterval() {
    setInterval(() => {
      this.flushPerformanceMetrics();
    }, this.FLUSH_INTERVAL);
  }

  // Performance Monitoring
  public async trackPerformance(metric: Omit<PerformanceMetric, 'timestamp'>) {
    try {
      const fullMetric: PerformanceMetric = {
        ...metric,
        timestamp: new Date().toISOString(),
      };

      this.performanceBuffer.push(fullMetric);

      if (this.performanceBuffer.length >= this.BUFFER_SIZE) {
        await this.flushPerformanceMetrics();
      }
    } catch (error) {
      console.warn('Failed to track performance:', error);
    }
  }

  private async flushPerformanceMetrics() {
    if (this.performanceBuffer.length === 0) return;

    try {
      const { error } = await supabase
        .from('performance_metrics')
        .insert(this.performanceBuffer);

      if (error) throw error;
      this.performanceBuffer = [];
    } catch (error) {
      console.error('Failed to flush performance metrics:', error);
    }
  }

  // Error Tracking
  public async trackError(error: Error, context?: Omit<ErrorReport, 'error' | 'timestamp'>) {
    try {
      const errorReport: ErrorReport = {
        error,
        ...context,
        timestamp: new Date().toISOString(),
      };

      const { error: dbError } = await supabase
        .from('error_reports')
        .insert({
          error_message: error.message,
          error_stack: error.stack,
          component_name: context?.componentName,
          user_id: context?.userId,
          timestamp: errorReport.timestamp,
          additional_context: context?.additionalContext,
        });

      if (dbError) throw dbError;
    } catch (err) {
      console.error('Failed to track error:', err);
    }
  }

  // User Analytics
  public async trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>) {
    try {
      const fullEvent: AnalyticsEvent = {
        ...event,
        timestamp: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('analytics_events')
        .insert({
          event_name: fullEvent.eventName,
          user_id: fullEvent.userId,
          timestamp: fullEvent.timestamp,
          properties: fullEvent.properties,
        });

      if (error) throw error;
    } catch (err) {
      console.warn('Failed to track analytics event:', err);
    }
  }

  // Health Checks
  public async checkHealth(service: string): Promise<HealthCheckResult> {
    const startTime = performance.now();
    let status: 'healthy' | 'unhealthy' = 'healthy';
    let error: string | undefined;

    try {
      switch (service) {
        case 'supabase':
          await this.checkSupabaseHealth();
          break;
        // Add more service health checks as needed
        default:
          throw new Error(`Unknown service: ${service}`);
      }
    } catch (err) {
      status = 'unhealthy';
      error = err instanceof Error ? err.message : 'Unknown error';
    }

    const endTime = performance.now();
    const latency = endTime - startTime;

    const result: HealthCheckResult = {
      service,
      status,
      latency,
      timestamp: new Date().toISOString(),
      error,
    };

    // Store health check result
    try {
      await supabase.from('health_checks').insert(result);
    } catch (err) {
      console.error('Failed to store health check result:', err);
    }

    return result;
  }

  private async checkSupabaseHealth(): Promise<void> {
    const { error } = await supabase.from('health_checks').select('count').limit(1);
    if (error) throw error;
  }
}

export const monitoring = MonitoringService.getInstance();