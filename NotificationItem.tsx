/**
 * NotificationItem Component
 * Displays a single notification with styling based on read status
 */

import { Bell, AlertTriangle, MessageSquare, Heart, AtSign, Settings, Trash2 } from 'lucide-react';
import type { Notification, NotificationType } from '@/lib/notifications/notification-types';

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead?: (id: string) => void;
    onDelete?: (id: string) => void;
    onClick?: (notification: Notification) => void;
}

const NOTIFICATION_ICONS: Record<NotificationType, typeof Bell> = {
    alert: AlertTriangle,
    message: MessageSquare,
    system: Settings,
    mention: AtSign,
    comment: MessageSquare,
    like: Heart,
};

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
    alert: 'text-red-500',
    message: 'text-blue-500',
    system: 'text-gray-500',
    mention: 'text-purple-500',
    comment: 'text-green-500',
    like: 'text-pink-500',
};

function getTimeAgo(dateString: string): string {
    const now = new Date();
    const then = new Date(dateString);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return then.toLocaleDateString();
}

export function NotificationItem({
    notification,
    onMarkAsRead,
    onDelete,
    onClick,
}: NotificationItemProps) {
    const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
    const iconColor = NOTIFICATION_COLORS[notification.type] || 'text-gray-500';

    const handleClick = () => {
        if (!notification.is_read && onMarkAsRead) {
            onMarkAsRead(notification.id);
        }
        if (onClick) {
            onClick(notification);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(notification.id);
        }
    };

    return (
        <div
            onClick={handleClick}
            onKeyDown={(e) => e.key === 'Enter' && handleClick()}
            role="button"
            tabIndex={0}
            className={`
        flex items-start gap-3 p-4 cursor-pointer transition-colors
        hover:bg-muted/50
        ${notification.is_read ? 'opacity-70' : 'bg-muted/30'}
      `}
        >
            {/* Icon */}
            <div className={`flex-shrink-0 mt-0.5 ${iconColor}`}>
                <Icon className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-sm font-medium text-foreground ${notification.is_read ? '' : 'font-semibold'}`}>
                        {notification.title}
                    </h4>
                    {!notification.is_read && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary" />
                    )}
                </div>

                {notification.message && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                    </p>
                )}

                <span className="text-xs text-muted-foreground mt-1 block">
                    {getTimeAgo(notification.created_at)}
                </span>
            </div>

            {/* Delete button */}
            {onDelete && (
                <button
                    onClick={handleDelete}
                    className="flex-shrink-0 p-1 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Delete notification"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
