/**
 * NotificationList Component
 * Displays a scrollable list of notifications
 */

import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationItem } from './NotificationItem';
import type { Notification } from '@/lib/notifications/notification-types';

interface NotificationListProps {
    notifications: Notification[];
    loading?: boolean;
    error?: string | null;
    onMarkAsRead?: (id: string) => void;
    onMarkAllAsRead?: () => void;
    onDelete?: (id: string) => void;
    onClick?: (notification: Notification) => void;
}

export function NotificationList({
    notifications,
    loading = false,
    error = null,
    onMarkAsRead,
    onMarkAllAsRead,
    onDelete,
    onClick,
}: NotificationListProps) {
    const hasUnread = notifications.some(n => !n.is_read);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 px-4">
                <p className="text-sm text-destructive">{error}</p>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="text-center py-12 px-4">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-sm font-medium text-foreground mb-1">No notifications</h3>
                <p className="text-xs text-muted-foreground">
                    You're all caught up! Check back later.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            {/* Header with Mark All as Read */}
            {hasUnread && onMarkAllAsRead && (
                <div className="flex items-center justify-end px-4 py-2 border-b border-border">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onMarkAllAsRead}
                        className="text-xs text-muted-foreground hover:text-foreground"
                    >
                        <CheckCheck className="h-4 w-4 mr-1" />
                        Mark all as read
                    </Button>
                </div>
            )}

            {/* Notifications */}
            <ScrollArea className="max-h-[400px]">
                <div className="divide-y divide-border">
                    {notifications.map(notification => (
                        <div key={notification.id} className="group">
                            <NotificationItem
                                notification={notification}
                                onMarkAsRead={onMarkAsRead}
                                onDelete={onDelete}
                                onClick={onClick}
                            />
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
