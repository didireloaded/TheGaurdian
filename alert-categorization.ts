// Alert categorization utilities
export type AlertCategory = 'critical' | 'crime' | 'emergency' | 'other';

export interface CategoryConfig {
    key: AlertCategory;
    label: string;
    color: string;
    emoji: string;
    alertTypes: Set<string>;
}

export const CATEGORY_CONFIGS: Record<AlertCategory, CategoryConfig> = {
    critical: {
        key: 'critical',
        label: 'Critical Alerts',
        emoji: '🚨',
        color: 'text-red-600',
        alertTypes: new Set(['panic', 'amber', 'assault', 'kidnapping'])
    },
    crime: {
        key: 'crime',
        label: 'Crime & Safety',
        emoji: '🔒',
        color: 'text-orange-600',
        alertTypes: new Set(['robbery', 'house_breaking', 'suspicious'])
    },
    emergency: {
        key: 'emergency',
        label: 'Emergency Services',
        emoji: '🚑',
        color: 'text-yellow-600',
        alertTypes: new Set(['fire', 'accident', 'medical'])
    },
    other: {
        key: 'other',
        label: 'Other Alerts',
        emoji: '📢',
        color: 'text-purple-600',
        alertTypes: new Set()
    }
};

export const categorizeAlert = (alertType: string): AlertCategory => {
    for (const [category, config] of Object.entries(CATEGORY_CONFIGS)) {
        if (config.alertTypes.has(alertType)) {
            return category as AlertCategory;
        }
    }
    return 'other';
};

export const groupAlertsByCategory = <T extends { alert_type: string }>(
    alerts: T[]
): Record<AlertCategory, T[]> => {
    return alerts.reduce((acc, alert) => {
        const category = categorizeAlert(alert.alert_type);
        acc[category].push(alert);
        return acc;
    }, {
        critical: [] as T[],
        crime: [] as T[],
        emergency: [] as T[],
        other: [] as T[]
    });
};
