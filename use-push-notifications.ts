/**
 * usePushNotifications Hook
 * Manages browser push notification permissions and state
 */

import { useState, useEffect, useCallback } from 'react';
import {
    isPushSupported,
    getPermissionStatus,
    requestPermission,
} from '@/lib/notifications/push-notifications';
import type { NotificationPermission } from '@/lib/notifications/notification-types';
import { useToast } from './use-toast';

interface UsePushNotificationsReturn {
    isSupported: boolean;
    permission: NotificationPermission;
    isEnabled: boolean;
    requestPushPermission: () => Promise<boolean>;
    togglePushNotifications: () => Promise<void>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isEnabled, setIsEnabled] = useState(false);
    const { toast } = useToast();
    const isSupported = isPushSupported();

    // Initialize permission state
    useEffect(() => {
        if (isSupported) {
            const currentPermission = getPermissionStatus();
            setPermission(currentPermission);

            // Check localStorage for user preference
            const userEnabled = localStorage.getItem('pushNotifications') === 'true';
            setIsEnabled(currentPermission === 'granted' && userEnabled);
        }
    }, [isSupported]);

    const requestPushPermission = useCallback(async (): Promise<boolean> => {
        if (!isSupported) {
            toast({
                title: '❌ Not Supported',
                description: 'Push notifications are not supported in this browser',
                variant: 'destructive',
            });
            return false;
        }

        if (permission === 'denied') {
            toast({
                title: '🔒 Permission Denied',
                description: 'Please enable notifications in your browser settings',
                variant: 'destructive',
            });
            return false;
        }

        if (permission === 'granted') {
            return true;
        }

        const result = await requestPermission();
        setPermission(result);

        if (result === 'granted') {
            localStorage.setItem('pushNotifications', 'true');
            setIsEnabled(true);
            toast({
                title: '🔔 Notifications Enabled',
                description: 'You will receive push notifications for alerts',
            });
            return true;
        } else {
            toast({
                title: '🔕 Permission Denied',
                description: 'You won\'t receive push notifications',
            });
            return false;
        }
    }, [isSupported, permission, toast]);

    const togglePushNotifications = useCallback(async () => {
        if (isEnabled) {
            // Disable notifications (we can't revoke permission, just stop using it)
            localStorage.setItem('pushNotifications', 'false');
            setIsEnabled(false);
            toast({
                title: '🔕 Notifications Disabled',
                description: 'You won\'t receive push notifications',
            });
        } else {
            // Enable notifications
            if (permission === 'granted') {
                localStorage.setItem('pushNotifications', 'true');
                setIsEnabled(true);
                toast({
                    title: '🔔 Notifications Enabled',
                    description: 'You will receive push notifications for alerts',
                });
            } else {
                await requestPushPermission();
            }
        }
    }, [isEnabled, permission, requestPushPermission, toast]);

    return {
        isSupported,
        permission,
        isEnabled,
        requestPushPermission,
        togglePushNotifications,
    };
}
