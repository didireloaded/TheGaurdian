import { useMemo, useState } from 'react';
import { Shield, Clock, CheckCircle, AlertTriangle, MapPin, Flame, Car, Users, Home, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { groupAlertsByCategory, CATEGORY_CONFIGS } from '@/lib/alert-categorization';

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

interface AlertsPresenterProps {
  alerts: Alert[];
  onAlertClick?: (alertId: string) => void;
}

// Configuration object - single source of truth
const ALERT_CONFIG = {
  panic: { Icon: AlertTriangle, iconColor: 'text-red-600', bgColor: 'bg-white dark:bg-card border-red-500 border-l-4' },
  amber: { Icon: AlertTriangle, iconColor: 'text-amber-600', bgColor: 'bg-white dark:bg-card border-amber-500 border-l-4' },
  robbery: { Icon: Shield, iconColor: 'text-orange-600', bgColor: 'bg-white dark:bg-card border-orange-500 border-l-4' },
  assault: { Icon: Shield, iconColor: 'text-red-600', bgColor: 'bg-white dark:bg-card border-red-500 border-l-4' },
  kidnapping: { Icon: Users, iconColor: 'text-amber-600', bgColor: 'bg-white dark:bg-card border-amber-500 border-l-4' },
  fire: { Icon: Flame, iconColor: 'text-red-600', bgColor: 'bg-white dark:bg-card border-red-500 border-l-4' },
  accident: { Icon: Car, iconColor: 'text-yellow-600', bgColor: 'bg-white dark:bg-card border-yellow-500 border-l-4' },
  house_breaking: { Icon: Home, iconColor: 'text-orange-600', bgColor: 'bg-white dark:bg-card border-orange-500 border-l-4' },
  suspicious: { Icon: MapPin, iconColor: 'text-purple-600', bgColor: 'bg-white dark:bg-card border-purple-500 border-l-4' },
  default: { Icon: MapPin, iconColor: 'text-gray-600', bgColor: 'bg-white dark:bg-card border-gray-500 border-l-4' },
} as const;

const getAlertConfig = (type: string) => {
  return ALERT_CONFIG[type as keyof typeof ALERT_CONFIG] || ALERT_CONFIG.default;
};

// Time calculation constants
const MS_PER_MINUTE = 60000;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;

const getTimeAgo = (dateString: string) => {
  const now = new Date();
  const then = new Date(dateString);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / MS_PER_MINUTE);

  if (diffMins < 1) return 'Just now';
  if (diffMins < MINUTES_PER_HOUR) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / MINUTES_PER_HOUR);
  if (diffHours < HOURS_PER_DAY) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / HOURS_PER_DAY);
  return `${diffDays}d ago`;
};

export const AlertsPresenter = ({ alerts, onAlertClick }: AlertsPresenterProps) => {
  const handleAlertClick = (alertId: string) => {
    if (onAlertClick) {
      onAlertClick(alertId);
    } else {
      console.log('Alert clicked:', alertId);
    }
  };

  // Group alerts by category (memoized for performance)
  const groupedAlerts = useMemo(() => groupAlertsByCategory(alerts), [alerts]);

  const categories = useMemo(() =>
    Object.values(CATEGORY_CONFIGS)
      .map(config => ({
        key: config.key,
        label: `${config.emoji} ${config.label}`,
        color: config.color,
        alerts: groupedAlerts[config.key]
      }))
      .filter(cat => cat.alerts.length > 0),
    [groupedAlerts]
  );

  // Collapse state - track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map(c => c.key)) // All expanded by default
  );

  const toggleCategory = (key: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header - matching SOS tab style */}
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-emergency rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">SafeGuard</h1>
              <p className="text-xs text-muted-foreground">Namibia</p>
            </div>
          </div>

          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="text-primary font-bold">{alerts.length}</div>
              <div className="text-xs text-muted-foreground">Active Alerts</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - matching SOS tab style */}
      <main className="max-w-lg mx-auto p-6">
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-2">Community Alerts</h2>
          <p className="text-muted-foreground">
            Stay informed about incidents in your area
          </p>
        </div>

        {/* Quick Stats - matching SOS tab */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card p-4 rounded-lg border border-border text-center">
            <Activity className="h-6 w-6 mx-auto mb-2 text-success" />
            <div className="text-lg font-bold">{alerts.length}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-lg font-bold">24h</div>
            <div className="text-xs text-muted-foreground">Recent</div>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border text-center">
            <Shield className="h-6 w-6 mx-auto mb-2 text-accent" />
            <div className="text-lg font-bold">Live</div>
            <div className="text-xs text-muted-foreground">Updates</div>
          </div>
        </div>

        {alerts.length === 0 ? (
          <Card className="p-12 text-center border-border bg-card mb-6">
            <CheckCircle className="h-20 w-20 mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-semibold mb-2 text-foreground">All Clear!</h3>
            <p className="text-muted-foreground text-base">
              No active alerts in your area right now
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Your community is safe 🛡️
            </p>
          </Card>
        ) : (
          <div className="space-y-8 mb-6">
            {categories.map((category) => {
              const isExpanded = expandedCategories.has(category.key);

              return (
                <div key={category.key}>
                  {/* Category Header - Clickable */}
                  <button
                    onClick={() => toggleCategory(category.key)}
                    className="w-full flex items-center justify-between mb-4 pb-2 border-b-2 border-gray-200 dark:border-gray-700 hover:bg-muted/50 transition-colors rounded-t-lg px-2 py-1"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className={`text-lg font-bold ${category.color}`}>
                        {category.label}
                      </h3>
                      <span className="px-2 py-0.5 text-xs font-semibold bg-muted rounded-full">
                        {category.alerts.length}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>

                  {/* Category Alerts Grid - Collapsible */}
                  {isExpanded && (
                    <div className="grid grid-cols-2 gap-4 animate-fade-in">
                      {category.alerts.map((alert) => (
                        <Card
                          key={alert.id}
                          className={`p-4 hover:shadow-xl transition-all cursor-pointer border-2 ${getAlertConfig(alert.alert_type).bgColor}`}
                          onClick={() => handleAlertClick(alert.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e: React.KeyboardEvent) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleAlertClick(alert.id);
                            }
                          }}
                          aria-label={`${alert.alert_type.replace('_', ' ')} alert at ${alert.location_name || 'unknown location'}`}
                        >
                          <div className="flex flex-col h-full gap-3">
                            {/* Icon */}
                            <div className="flex justify-center">
                              {(() => {
                                const config = getAlertConfig(alert.alert_type);
                                const Icon = config.Icon;
                                return <Icon className={`h-8 w-8 ${config.iconColor}`} />;
                              })()}
                            </div>

                            {/* Alert Type */}
                            <h3 className="font-bold text-lg capitalize text-center text-gray-900 dark:text-white">
                              {alert.alert_type.replace('_', ' ')}
                            </h3>

                            {/* Location */}
                            <div className="flex items-start gap-1 text-xs text-gray-700 dark:text-gray-300">
                              <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                              <p className="line-clamp-2 flex-1">
                                {alert.location_name || 'Unknown location'}
                              </p>
                            </div>

                            {/* Reporter */}
                            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                              By: {alert.profiles?.full_name || 'User'}
                            </p>

                            {/* Time & Distance */}
                            <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200 dark:border-gray-700">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {getTimeAgo(alert.created_at)}
                              </span>
                              <span className="text-gray-600 dark:text-gray-400">
                                ~2km away
                              </span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Safety Tips - matching SOS tab */}
        <div className="bg-muted/50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Alert Safety Tips
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Stay aware of alerts in your area</li>
            <li>• Report suspicious activities immediately</li>
            <li>• Share alerts with your emergency contacts</li>
            <li>• Use the map to see alert locations</li>
          </ul>
        </div>

        {/* Legend */}
        <Card className="p-4 bg-muted/30">
          <h3 className="font-semibold mb-3 text-foreground">Alert Types</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-foreground">Panic/Assault</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded"></div>
              <span className="text-foreground">Amber/Kidnapping</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-foreground">Robbery</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-foreground">Accident</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-foreground">Suspicious</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-foreground">Fire</span>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};
