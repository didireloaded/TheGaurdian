/**
 * Push Notifications
 * Browser Push API integration for native notifications
 */

import type { PushNotificationOptions, NotificationPermission } from './notification-types';

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
    return 'Notification' in window;
}

/**
 * Get current notification permission status
 */
export function getPermissionStatus(): NotificationPermission {
    if (!isPushSupported()) return 'denied';
    return Notification.permission as NotificationPermission;
}

/**
 * Request notification permission from user
 */
export async function requestPermission(): Promise<NotificationPermission> {
    if (!isPushSupported()) {
        console.warn('Push notifications not supported');
        return 'denied';
    }

    try {
        const permission = await Notification.requestPermission();
        return permission as NotificationPermission;
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return 'denied';
    }
}

/**
 * Show a browser notification
 */
export function showBrowserNotification(options: PushNotificationOptions): globalThis.Notification | null {
    if (!isPushSupported()) {
        console.warn('Push notifications not supported');
        return null;
    }

    if (Notification.permission !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
    }

    try {
        const notification = new Notification(options.title, {
            body: options.body,
            icon: options.icon || '/icon-192x192.png',
            badge: options.badge || '/icon-192x192.png',
            tag: options.tag,
            data: options.data,
            requireInteraction: options.requireInteraction ?? false,
        });

        // Auto-close after 5 seconds unless requireInteraction is true
        if (!options.requireInteraction) {
            setTimeout(() => notification.close(), 5000);
        }

        return notification;
    } catch (error) {
        console.error('Error showing notification:', error);
        return null;
    }
}

/**
 * Show an alert notification in the browser
 */
export function showAlertNotification(
    alertType: string,
    locationName?: string,
    onClick?: () => void
): globalThis.Notification | null {
    const alertLabels: Record<string, string> = {
        panic: '🚨 Panic Alert',
        amber: '⚠️ Amber Alert',
        robbery: '🔓 Robbery Alert',
        assault: '⚠️ Assault Alert',
        kidnapping: '🚨 Kidnapping Alert',
        fire: '🔥 Fire Alert',
        accident: '🚗 Accident Alert',
        house_breaking: '🏠 House Breaking Alert',
        suspicious: '👁️ Suspicious Activity',
        medical: '🏥 Medical Emergency',
        unsafe_area: '⚡ Unsafe Area',
    };

    const notification = showBrowserNotification({
        title: alertLabels[alertType] || 'New Alert',
        body: locationName ? `Near ${locationName}` : 'A new alert has been reported nearby',
        tag: `alert-${Date.now()}`,
        requireInteraction: true,
    });

    if (notification && onClick) {
        notification.onclick = () => {
            onClick();
            notification.close();
            window.focus();
        };
    }

    return notification;
}

/**
 * Play a notification sound
 */
export function playNotificationSound(): void {
    const soundEnabled = localStorage.getItem('soundEffects') !== 'false';
    if (!soundEnabled) return;

    try {
        // Create a simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;

        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
        console.error('Error playing notification sound:', error);
    }
}
