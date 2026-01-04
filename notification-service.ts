/**
 * Notification Service
 * Core functions for managing notifications
 */

import { supabase } from '@/integrations/supabase/client';
import type { Notification, NotificationInsert } from './notification-types';

/**
 * Create a new notification
 */
export async function createNotification(notification: NotificationInsert): Promise<Notification | null> {
    const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();

    if (error) {
        console.error('Error creating notification:', error);
        return null;
    }

    return data as Notification;
}

/**
 * Create multiple notifications (e.g., for broadcasting to multiple users)
 */
export async function createNotifications(notifications: NotificationInsert[]): Promise<Notification[]> {
    const { data, error } = await supabase
        .from('notifications')
        .insert(notifications)
        .select();

    if (error) {
        console.error('Error creating notifications:', error);
        return [];
    }

    return (data || []) as Notification[];
}

/**
 * Get notifications for the current user
 */
export async function getNotifications(
    limit: number = 20,
    offset: number = 0
): Promise<Notification[]> {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }

    return (data || []) as Notification[];
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

    if (error) {
        console.error('Error getting unread count:', error);
        return 0;
    }

    return count || 0;
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<boolean> {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

    if (error) {
        console.error('Error marking notification as read:', error);
        return false;
    }

    return true;
}

/**
 * Mark all notifications as read for the current user
 */
export async function markAllAsRead(): Promise<boolean> {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);

    if (error) {
        console.error('Error marking all as read:', error);
        return false;
    }

    return true;
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

    if (error) {
        console.error('Error deleting notification:', error);
        return false;
    }

    return true;
}

/**
 * Delete all read notifications (cleanup)
 */
export async function deleteReadNotifications(): Promise<boolean> {
    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('is_read', true);

    if (error) {
        console.error('Error deleting read notifications:', error);
        return false;
    }

    return true;
}

/**
 * Create an alert notification for a user
 */
export async function createAlertNotification(
    userId: string,
    alertType: string,
    alertId: string,
    locationName?: string
): Promise<Notification | null> {
    const alertLabels: Record<string, string> = {
        panic: 'Panic Alert',
        amber: 'Amber Alert',
        robbery: 'Robbery Alert',
        assault: 'Assault Alert',
        kidnapping: 'Kidnapping Alert',
        fire: 'Fire Alert',
        accident: 'Accident Alert',
        house_breaking: 'House Breaking Alert',
        suspicious: 'Suspicious Activity',
        medical: 'Medical Emergency',
        unsafe_area: 'Unsafe Area Alert',
    };

    return createNotification({
        user_id: userId,
        type: 'alert',
        title: alertLabels[alertType] || 'New Alert',
        message: locationName ? `Near ${locationName}` : 'A new alert has been reported nearby',
        data: { alertId, alertType },
        link: `/alerts/${alertId}`,
    });
}
