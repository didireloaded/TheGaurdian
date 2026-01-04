/**
 * Time and date utility functions
 */

/**
 * Returns a greeting based on the current time of day
 */
export const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
};

/**
 * Returns the current time period
 */
export const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
};

/**
 * Formats a date string into a relative time string (e.g., "2h ago")
 */
export const getTimeAgo = (dateString: string): string => {
    try {
        const now = new Date();
        const then = new Date(dateString);

        if (isNaN(then.getTime())) {
            return 'Unknown';
        }

        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;

        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    } catch (error) {
        console.error('Error calculating time ago:', error);
        return 'Unknown';
    }
};
