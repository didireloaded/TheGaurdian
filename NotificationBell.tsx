/**
 * NotificationBell Component
 * Bell icon with unread count badge and dropdown
 */

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { NotificationList } from './NotificationList';
import { useNotifications } from '@/hooks/use-notifications';
import { useNavigate } from 'react-router-dom';

interface NotificationBellProps {
    className?: string;
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    } = useNotifications();

    const handleNotificationClick = (notification: { link?: string | null }) => {
        setOpen(false);
        if (notification.link) {
            navigate(notification.link);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`relative ${className}`}
                    aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                >
                    <Bell className="h-5 w-5" />

                    {/* Unread badge */}
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="w-80 p-0"
                align="end"
                sideOffset={8}
            >
                <div className="border-b border-border px-4 py-3">
                    <h3 className="font-semibold text-foreground">Notifications</h3>
                </div>

                <NotificationList
                    notifications={notifications}
                    loading={loading}
                    error={error}
                    onMarkAsRead={markAsRead}
                    onMarkAllAsRead={markAllAsRead}
                    onDelete={deleteNotification}
                    onClick={handleNotificationClick}
                />
            </PopoverContent>
        </Popover>
    );
}
