/**
 * useNotifications Hook
 * Manages notifications state with real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMonitoring } from './use-monitoring';
import type { Notification } from '@/lib/notifications/notification-types';
import {
    getNotifications,
    getUnreadCount,
    markAsRead as markNotificationAsRead,
    markAllAsRead as markAllNotificationsAsRead,
    deleteNotification as deleteNotificationById,
} from '@/lib/notifications/notification-service';
import {
    showAlertNotification,
    playNotificationSound,
    getPermissionStatus,
} from '@/lib/notifications/push-notifications';

interface UseNotificationsReturn {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    refetch: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { trackEvent, trackError } = useMonitoring('useNotifications');

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [notifs, count] = await Promise.all([
                getNotifications(50),
                getUnreadCount(),
            ]);

            setNotifications(notifs);
            setUnreadCount(count);

            trackEvent('notifications_loaded', { count: notifs.length, unread: count });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load notifications';
            setError(message);
            trackError(err instanceof Error ? err : new Error(message));
        } finally {
            setLoading(false);
        }
    }, [trackEvent, trackError]);

    const markAsRead = useCallback(async (id: string) => {
        const success = await markNotificationAsRead(id);
        if (success) {
            setNotifications(prev =>
                prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
            trackEvent('notification_marked_read', { id });
        }
    }, [trackEvent]);

    const markAllAsRead = useCallback(async () => {
        const success = await markAllNotificationsAsRead();
        if (success) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
            trackEvent('all_notifications_marked_read');
        }
    }, [trackEvent]);

    const deleteNotification = useCallback(async (id: string) => {
        const notification = notifications.find(n => n.id === id);
        const success = await deleteNotificationById(id);
        if (success) {
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (notification && !notification.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            trackEvent('notification_deleted', { id });
        }
    }, [notifications, trackEvent]);

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Real-time subscription for new notifications
    useEffect(() => {
        const channel = supabase
            .channel('notifications-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                },
                (payload) => {
                    const newNotification = payload.new as Notification;

                    // Add to state
                    setNotifications(prev => [newNotification, ...prev]);
                    setUnreadCount(prev => prev + 1);

                    // Check if notifications are enabled
                    const notificationsEnabled = localStorage.getItem('notifications') !== 'false';

                    if (notificationsEnabled) {
                        // Play sound
                        playNotificationSound();

                        // Show browser notification if permission granted
                        if (getPermissionStatus() === 'granted' && newNotification.type === 'alert') {
                            const alertData = newNotification.data as { alertType?: string };
                            showAlertNotification(
                                alertData.alertType || 'alert',
                                newNotification.message || undefined,
                                () => {
                                    if (newNotification.link) {
                                        window.location.href = newNotification.link;
                                    }
                                }
                            );
                        }
                    }

                    trackEvent('notification_received', {
                        type: newNotification.type,
                        id: newNotification.id,
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [trackEvent]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refetch: fetchNotifications,
    };
}
