/**
 * Notification Types
 * Type definitions for the notification system
 */

export type NotificationType = 'alert' | 'message' | 'system' | 'mention' | 'comment' | 'like';

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string | null;
    data: Record<string, unknown>;
    is_read: boolean;
    link: string | null;
    created_at: string;
}

export interface NotificationInsert {
    user_id: string;
    type: NotificationType;
    title: string;
    message?: string | null;
    data?: Record<string, unknown>;
    is_read?: boolean;
    link?: string | null;
}

export interface NotificationWithSender extends Notification {
    sender?: {
        full_name: string | null;
        avatar_url: string | null;
    };
}

export type NotificationPermission = 'default' | 'granted' | 'denied';

export interface PushNotificationOptions {
    title: string;
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, unknown>;
    requireInteraction?: boolean;
}
