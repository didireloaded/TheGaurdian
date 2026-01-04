import { Shield, Clock, CheckCircle, AlertTriangle, MapPin, Flame, Car, Users, Home } from 'lucide-react';
import { Card } from '@/components/ui/card';

// Types
export type AlertType = 'panic' | 'amber' | 'robbery' | 'assault' | 'kidnapping' | 'fire' | 'accident' | 'house_breaking' | 'suspicious';

export interface Alert {
    id: string;
    alert_type: AlertType;
    status: string;
    location_name: string | null;
    created_at: string;
    profiles: {
        full_name: string;
    } | null;
    distance_km?: number; // Optional distance calculation
}

interface AlertsPresenterProps {
    alerts: Alert[];
    onAlertClick?: (alertId: string) => void;
}

// Constants
const MS_PER_MINUTE = 60000;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;

// Alert Configuration (Single Source of Truth)
const ALERT_CONFIG = {
    panic: {
        Icon: AlertTriangle,
        iconColor: 'text-red-600',
        bgColor: 'bg-red-100 dark:bg-red-950/30 border-red-500',
        legendColor: 'bg-red-500',
        label: 'Panic/Assault'
    },
    amber: {
        Icon: AlertTriangle,
        iconColor: 'text-amber-600',
        bgColor: 'bg-amber-100 dark:bg-amber-950/30 border-amber-500',
        legendColor: 'bg-amber-500',
        label: 'Amber/Kidnapping'
    },
    robbery: {
        Icon: Shield,
        iconColor: 'text-orange-600',
        bgColor: 'bg-orange-100 dark:bg-orange-950/30 border-orange-500',
        legendColor: 'bg-orange-500',
        label: 'Robbery'
    },
    assault: {
        Icon: Shield,
        iconColor: 'text-red-600',
        bgColor: 'bg-red-100 dark:bg-red-950/30 border-red-500',
        legendColor: 'bg-red-500',
        label: 'Assault'
    },
    kidnapping: {
        Icon: Users,
        iconColor: 'text-amber-600',
        bgColor: 'bg-amber-100 dark:bg-amber-950/30 border-amber-500',
        legendColor: 'bg-amber-500',
        label: 'Kidnapping'
    },
    fire: {
        Icon: Flame,
        iconColor: 'text-red-600',
        bgColor: 'bg-red-100 dark:bg-red-950/30 border-red-500',
        legendColor: 'bg-red-500',
        label: 'Fire'
    },
    accident: {
        Icon: Car,
        iconColor: 'text-yellow-600',
        bgColor: 'bg-yellow-100 dark:bg-yellow-950/30 border-yellow-500',
        legendColor: 'bg-yellow-500',
        label: 'Accident'
    },
    house_breaking: {
        Icon: Home,
        iconColor: 'text-orange-600',
        bgColor: 'bg-orange-100 dark:bg-orange-950/30 border-orange-500',
        legendColor: 'bg-orange-500',
        label: 'House Breaking'
    },
    suspicious: {
        Icon: MapPin,
        iconColor: 'text-purple-600',
        bgColor: 'bg-purple-100 dark:bg-purple-950/30 border-purple-500',
        legendColor: 'bg-purple-500',
        label: 'Suspicious'
    },
    default: {
        Icon: MapPin,
        iconColor: 'text-gray-600',
        bgColor: 'bg-gray-100 dark:bg-gray-950/30 border-gray-500',
        legendColor: 'bg-gray-500',
        label: 'Other'
    }
} as const;

// Utility Functions (moved outside component)
const getAlertConfig = (type: string) => {
    return ALERT_CONFIG[type as AlertType] || ALERT_CONFIG.default;
};

const getTimeAgo = (dateString: string): string => {
    try {
        const now = new Date();
        const then = new Date(dateString);

        if (isNaN(then.getTime())) {
            return 'Unknown';
        }

        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / MS_PER_MINUTE);

        if (diffMins < 1) return 'Just now';
        if (diffMins < MINUTES_PER_HOUR) return `${diffMins}m ago`;

        const diffHours = Math.floor(diffMins / MINUTES_PER_HOUR);
        if (diffHours < HOURS_PER_DAY) return `${diffHours}h ago`;

        const diffDays = Math.floor(diffHours / HOURS_PER_DAY);
        return `${diffDays}d ago`;
    } catch (error) {
        console.error('Error calculating time ago:', error);
        return 'Unknown';
    }
};

const formatAlertType = (type: string): string => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Sub-components
const AlertCard = ({ alert, onClick }: { alert: Alert; onClick: (id: string) => void }) => {
    const config = getAlertConfig(alert.alert_type);
    const Icon = config.Icon;

    const handleClick = () => onClick(alert.id);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(alert.id);
        }
    };

    return (
        <Card
            className={`p-4 hover:shadow-xl transition-all cursor-pointer border-2 ${config.bgColor}`}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`${formatAlertType(alert.alert_type)} alert at ${alert.location_name || 'unknown location'}`}
        >
            <div className="flex flex-col h-full gap-3">
                {/* Icon */}
                <div className="flex justify-center" aria-hidden="true">
                    <Icon className={`h-8 w-8 ${config.iconColor}`} />
                </div>

                {/* Alert Type */}
                <h3 className="font-bold text-base text-center text-foreground">
                    {formatAlertType(alert.alert_type)}
                </h3>

                {/* Location */}
                <div className="flex items-start gap-1 text-xs text-foreground">
                    <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="line-clamp-2 flex-1">
                        {alert.location_name || 'Unknown location'}
                    </p>
                </div>

                {/* Reporter */}
                <p className="text-xs text-muted-foreground text-center">
                    By: {alert.profiles?.full_name || 'Anonymous'}
                </p>

                {/* Time & Distance */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                    <span className="font-semibold text-foreground">
                        {getTimeAgo(alert.created_at)}
                    </span>
                    {alert.distance_km !== undefined && (
                        <span className="text-muted-foreground">
                            ~{alert.distance_km}km away
                        </span>
                    )}
                </div>
            </div>
        </Card>
    );
};

const AlertsLegend = () => {
    const legendItems = [
        { key: 'panic', label: 'Panic/Assault', color: 'bg-red-500' },
        { key: 'amber', label: 'Amber/Kidnapping', color: 'bg-amber-500' },
        { key: 'robbery', label: 'Robbery', color: 'bg-orange-500' },
        { key: 'accident', label: 'Accident', color: 'bg-yellow-500' },
        { key: 'suspicious', label: 'Suspicious', color: 'bg-purple-500' },
        { key: 'fire', label: 'Fire', color: 'bg-red-500' }
    ];

    return (
        <Card className="mt-6 p-4 bg-muted/30">
            <h3 className="font-semibold mb-3 text-foreground">Alert Types</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {legendItems.map(item => (
                    <div key={item.key} className="flex items-center gap-2">
                        <div className={`w-3 h-3 ${item.color} rounded`} aria-hidden="true"></div>
                        <span className="text-foreground">{item.label}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const EmptyState = () => (
    <Card className="p-12 text-center border-border bg-card">
        <CheckCircle className="h-20 w-20 mx-auto mb-4 text-green-500" aria-hidden="true" />
        <h3 className="text-xl font-semibold mb-2 text-foreground">All Clear!</h3>
        <p className="text-muted-foreground text-base">
            No active alerts in your area right now
        </p>
        <p className="text-sm text-muted-foreground mt-2">
            Your community is safe 🛡️
        </p>
    </Card>
);

// Main Component
export const AlertsPresenter = ({ alerts, onAlertClick }: AlertsPresenterProps) => {
    const handleAlertClick = (alertId: string) => {
        if (onAlertClick) {
            onAlertClick(alertId);
        } else {
            // Default behavior: navigate to alert detail or map
            console.log('Alert clicked:', alertId);
            // navigate(`/alerts/${alertId}`); // Uncomment when route exists
        }
    };

    const hasAlerts = alerts.length > 0;

    return (
        <div className="min-h-screen bg-background pb-20">
            <header className="bg-card border-b border-border p-4 sticky top-0 z-10 shadow-sm">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-primary" aria-hidden="true" />
                        <h1 className="text-xl font-bold text-foreground">Alerts</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-4">
                <div className="mb-4 flex items-center gap-2 text-sm text-foreground bg-muted/50 p-3 rounded-lg">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    <span>Recent alerts in your area</span>
                </div>

                {!hasAlerts ? (
                    <EmptyState />
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {alerts.map((alert) => (
                                <AlertCard
                                    key={alert.id}
                                    alert={alert}
                                    onClick={handleAlertClick}
                                />
                            ))}
                        </div>
                        <AlertsLegend />
                    </>
                )}
            </main>
        </div>
    );
};
